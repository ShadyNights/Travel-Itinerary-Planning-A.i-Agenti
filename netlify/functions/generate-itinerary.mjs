// netlify/functions/generate-itinerary.mjs

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

/**
 * @param {Request} req
 * @param {import('@netlify/functions').Context} context
 */
export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const requestBody = await req.json();

    let prompt;

    // Build the base prompt from preferences or natural language query
    if (requestBody.preferences) {
      const preferences = requestBody.preferences;
      prompt = `Generate a detailed travel itinerary for a trip to ${preferences.destination} for ${preferences.duration} days.`;

      // Add specific preference details to the prompt
      if (preferences.travelStyle) {
        prompt += ` The user prefers a ${preferences.travelStyle} style trip.`;
      }
      if (preferences.interests && preferences.interests.length > 0) {
        prompt += ` User interests include: ${preferences.interests.join(', ')}.`;
      }
      if (preferences.budget) {
        prompt += ` Budget: ${preferences.budget}.`;
      }
      if (preferences.groupSize) {
        prompt += ` Group size: ${preferences.groupSize} people.`;
      }
      if (preferences.accommodation) {
        prompt += ` Preferred accommodation: ${preferences.accommodation}.`;
      }
      if (preferences.startDate) {
        prompt += ` Starting on: ${preferences.startDate}.`;
      }
      if (preferences.specificRequests) {
        prompt += ` Specific requests: ${preferences.specificRequests}.`;
      }

    } else if (requestBody.naturalLanguageQuery) {
      prompt = `Create a travel itinerary based on this natural language request: ${requestBody.naturalLanguageQuery}`;

    } else {
      console.error("Invalid request body structure:", requestBody);
      return new Response(JSON.stringify({
          error: 'Invalid input format. Please provide valid preferences or a natural language query.'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // IMPORTANT: Make the JSON format request much more explicit and detailed for the AI
    prompt += ` Respond in a strict JSON format. Ensure all fields are populated and follow the specified types.
    The top-level keys should be: "destination" (string), "duration" (number of days), "estimatedBudget" (string, e.g., "500-1000 USD" or "Low/Medium/High"), "travelStyle" (string, if provided in preferences, otherwise infer), "emergencyInfo" (array of strings, e.g., "Emergency Services: 112", "Embassy: [Contact]").
    There should be a "days" key which is an array of objects. Each day object must have the following keys:
    - "dayNumber" (number, starting from 1)
    - "date" (string, in YYYY-MM-DD format, or a readable format like "Monday, July 22nd, 2024")
    - "weather" (string, e.g., "Sunny, 25°C", based on location/time of year)
    - "dailyTips" (array of strings, specific to the day's activities)
    - "activities" (array of objects, each activity object must have:
        - "name" (string)
        - "description" (string)
        - "time" (string, e.g., "9:00 AM - 11:00 AM" or "Morning")
        - "cost" (string, e.g., "25 EUR" or "Free" or "Moderate")
    ).`;


    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables.");
      return new Response('Server configuration error: API Key not set.', { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // You can revert to "gemini-1.5-flash" if you prefer that model and the 503s were truly transient.
    // For now, let's stick with "gemini-1.5-pro" as it's generally more robust for complex instructions.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        safetySettings,
        generationConfig: { responseMimeType: "application/json" }
    });

    let geminiResponseText = result.response.text();

    // Clean up markdown code block if present
    const cleanJsonString = (jsonString) => {
        const jsonMatch = jsonString.match(/```json\n([\s\S]*?)\n```/);
        return jsonMatch ? jsonMatch[1] : jsonString;
    };
    geminiResponseText = cleanJsonString(geminiResponseText);

    // Parse the response
    const parsedItinerary = JSON.parse(geminiResponseText);

    // --- IMPORTANT Frontend Data Cleaning (Add this to the FE or BE if you prefer) ---
    // This part is crucial for making the data robust for your frontend.
    // I recommend putting this *in your frontend* right after you receive the JSON,
    // but I'm including it here in the function for completeness if you want to
    // process it before sending to the frontend.
    // If you add this to the frontend, remove it from here.
    const cleanItineraryForFrontend = (itinerary) => {
        if (!itinerary) return null;

        // Ensure top-level fields are strings or arrays as expected
        itinerary.estimatedBudget = itinerary.estimatedBudget || 'N/A';
        itinerary.travelStyle = itinerary.travelStyle || 'N/A';
        itinerary.emergencyInfo = Array.isArray(itinerary.emergencyInfo) ? itinerary.emergencyInfo : [];

        if (itinerary.days && Array.isArray(itinerary.days)) {
            itinerary.days = itinerary.days.map(day => {
                // Ensure daily-level fields
                day.date = day.date || 'Date N/A';
                day.weather = day.weather || 'N/A';
                day.dailyTips = Array.isArray(day.dailyTips) ? day.dailyTips : []; // Ensure it's an array

                if (day.activities && Array.isArray(day.activities)) {
                    day.activities = day.activities.map(activity => {
                        activity.name = activity.name || 'N/A';
                        activity.description = activity.description || 'N/A';
                        activity.time = activity.time || 'N/A';
                        activity.cost = activity.cost || 'N/A';
                        return activity;
                    });
                } else {
                    day.activities = []; // Ensure activities is an array
                }
                return day;
            });
        } else {
            itinerary.days = []; // Ensure days is an array
        }
        return itinerary;
    };

    const finalItinerary = cleanItineraryForFrontend(parsedItinerary);
    // --- End of Frontend Data Cleaning Block ---


    return new Response(JSON.stringify(finalItinerary), { // Send the cleaned itinerary
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Netlify Function execution error:', error);
    if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    }

    // Respond with a 500 error, providing some detail to the frontend
    return new Response(JSON.stringify({
        error: 'Failed to generate itinerary. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error occurred in function.'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
};

// IMPORTANT: Netlify Function configuration
export const config = {
    path: "/.netlify/functions/generate-itinerary",
    method: ["POST"],
};
