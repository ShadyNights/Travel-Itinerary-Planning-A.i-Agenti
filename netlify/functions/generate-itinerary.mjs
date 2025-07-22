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
      } else {
        prompt += ` Please infer a suitable travel style based on the destination and common travel preferences.`;
      }
      if (preferences.interests && preferences.interests.length > 0) {
        prompt += ` User interests include: ${preferences.interests.join(', ')}.`;
      }
      if (preferences.budget) {
        prompt += ` Budget: ${preferences.budget}.`;
      } else {
        prompt += ` Please provide a general estimated budget range for the trip (e.g., "Low", "Medium", "High", or "1500-2500 EUR").`;
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
      prompt = `Create a detailed travel itinerary based on this natural language request: ${requestBody.naturalLanguageQuery}`;

    } else {
      console.error("Invalid request body structure:", requestBody);
      return new Response(JSON.stringify({
          error: 'Invalid input format. Please provide valid preferences or a natural language query.'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // --- CRITICAL: Make the JSON format request much more explicit and demanding for the AI ---
    // Emphasize populating ALL fields with realistic, inferred data if not explicitly provided.
    prompt += ` Respond in a strict JSON format. It is crucial that you ensure ALL fields are populated, even if you need to infer reasonable values based on the destination and trip duration. Do NOT leave any field as "N/A" or empty unless truly impossible to infer.
    The top-level JSON object must have these keys:
    - "destination" (string)
    - "duration" (number of days)
    - "estimatedBudget" (string, e.g., "1500-2500 EUR for 5 days" or "Moderate budget". Infer if not provided.)
    - "travelStyle" (string, e.g., "Romantic", "Cultural", "Adventurous". Infer if not provided.)
    - "emergencyInfo" (array of strings, e.g., ["Emergency Services: 112", "Local Police: 17", "Country Code: +33", "US Embassy Paris: +33 1 43 12 22 22"]. Provide relevant info for the destination.)
    
    The "days" key must be an array of objects. Each day object must have the following keys:
    - "dayNumber" (number, starting from 1)
    - "date" (string, in a clear, readable format like "Thursday, December 26th, 2024". Infer dates based on trip duration and start date.)
    - "weather" (string, e.g., "Partly cloudy, 10°C", "Rainy, 7°C". Provide a realistic weather summary for the inferred date and destination.)
    - "dailyTips" (array of strings, provide 2-3 specific tips relevant to the day's activities, e.g., "Wear comfortable shoes", "Book tickets in advance").
    - "activities" (array of objects, provide 3-4 distinct activities for each day, ensuring variety and logical flow. Each activity object must have:
        - "name" (string, e.g., "Eiffel Tower Visit")
        - "description" (string, a brief sentence or two, e.g., "Ascend the iconic tower for panoramic city views.")
        - "time" (string, a specific time range like "9:00 AM - 11:00 AM" or a time of day like "Morning").
        - "cost" (string, an estimated cost like "25 EUR", "Free", "Moderate", "High").
    ).`;


    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables.");
      return new Response('Server configuration error: API Key not set.', { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Sticking with "gemini-1.5-pro" as it's better at following complex instructions.
    // Be mindful of your free-tier quota for this model.
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

    // --- Frontend Data Cleaning (This is a safety net; the prompt is now the primary focus) ---
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
