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
      prompt = `Generate a highly detailed travel itinerary for a trip to ${preferences.destination} for ${preferences.duration} days.`;

      // Add specific preference details to the prompt
      if (preferences.travelStyle) {
        prompt += ` The user prefers a ${preferences.travelStyle} style trip.`;
      } else {
        prompt += ` Please infer a suitable travel style based on the destination and common travel preferences (e.g., "Romantic", "Cultural", "Adventurous", "Moderate").`;
      }
      if (preferences.interests && preferences.interests.length > 0) {
        prompt += ` User interests include: ${preferences.interests.join(', ')}.`;
      }
      if (preferences.budget) {
        prompt += ` Budget: ${preferences.budget}.`;
      } else {
        prompt += ` Please provide a general estimated budget range for the entire trip (e.g., "$1000 - $2000 USD", "Low", "Medium", "High").`;
      }
      if (preferences.groupSize) {
        prompt += ` Group size: ${preferences.groupSize} people.`;
      }
      if (preferences.accommodation) {
        prompt += ` Preferred accommodation: ${preferences.accommodation}.`;
      }
      if (preferences.startDate) {
        prompt += ` Starting on: ${preferences.startDate}. Ensure all daily dates are correctly calculated from this start date.`;
      } else {
         // Provide a default start date if none is given, for consistency
         const today = new Date();
         const defaultStartDate = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
         prompt += ` The trip starts on a date around ${defaultStartDate}. Ensure all daily dates are correctly calculated from this.`;
      }
      if (preferences.specificRequests) {
        prompt += ` Specific requests: ${preferences.specificRequests}.`;
      }

    } else if (requestBody.naturalLanguageQuery) {
      prompt = `Create a highly detailed travel itinerary based on this natural language request: ${requestBody.naturalLanguageQuery}`;

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
    // Provide concrete examples for every field type and ensure ratings, photos, etc. are included.
    prompt += `
    Respond in a strict JSON format. It is absolutely crucial that you ensure ALL fields are populated with realistic, detailed, and relevant information. Do NOT leave any field as "N/A", null, or empty. If a specific detail is not provided by the user, you MUST infer a reasonable and realistic value based on the destination and trip duration.

    The top-level JSON object must have these keys:
    - "destination": (string, e.g., "Paris, France")
    - "duration": (number, total number of days)
    - "estimatedBudget": (string, a realistic total budget estimate for the trip, e.g., "$1,090.00", "$1500-2500 EUR for 5 days", or "Moderate budget". MUST be populated.)
    - "travelStyle": (string, infer a style like "Romantic", "Cultural", "Adventurous", "Moderate". MUST be populated.)
    - "weatherOverview": (string, a general summary of weather for the entire trip duration for the inferred dates and destination, e.g., "July in Paris is typically warm and sunny, with average highs in the 70s (°F) and lows in the 60s (°F). Expect some occasional showers, so pack layers and an umbrella." MUST be populated.)
    - "essentialTravelTips": (array of strings, 3-5 general, practical tips for the destination, e.g., ["Purchase a Navigo Découverte pass for easy and affordable public transport.", "Learn a few basic French phrases – it will enhance your experience."]. MUST be populated with useful tips.)
    - "emergencyInformation": (object with keys:
        - "Emergency Contacts": (array of strings, e.g., ["112 (emergency number)", "17 (police)", "15 (ambulance)"])
        - "Hospitals": (array of strings, e.g., ["Hôpital Pitié-Salpêtrière, 47 Boulevard de l'Hôpital, 75013 Paris"])
        - "Embassies": (array of strings, e.g., ["Check your country's embassy website for their Paris address."])
        MUST be populated with relevant and real information for the destination.)
    
    The "days" key must be an array of objects. Each day object MUST have the following keys:
    - "dayNumber": (number, starting from 1)
    - "date": (string, in a clear, readable format like "Thursday, December 26th, 2024". MUST be accurately inferred based on the trip's start date and duration.)
    - "dailyWeather": (object with keys:
        - "tempRange": (string, e.g., "60° - 75°C" or "15° - 25°C")
        - "condition": (string, e.g., "Sunny", "Partly Cloudy", "Rainy")
        - "weatherTip": (string, a specific tip for the day's weather, e.g., "Wear comfortable shoes and light clothing." or "Carry an umbrella and wear layers.")
        MUST be populated with realistic weather and tip for the inferred date and destination.)
    - "activities": (array of objects, provide 3-4 distinct activities for each day, ensuring variety and logical flow. Each activity object MUST have:
        - "name": (string, e.g., "Eiffel Tower Visit")
        - "category": (string, concise category like "sightseeing | relaxation", "culture", "dining", "shopping". Use multiple if applicable, separated by "|")
        - "type": (string, "outdoor", "indoor", or "flexible")
        - "description": (string, a brief sentence or two, e.g., "Ascend the iconic tower for panoramic city views.")
        - "duration": (string, e.g., "2 hours", "1.5 hours", "Full day")
        - "location": (string, specific address or general area, e.g., "Champ de Mars, 5 Avenue Anatole France, 75007 Paris", or "Various bistros near the Eiffel Tower". Provide real locations.)
        - "cost": (string, a realistic estimated cost like "$50.00", "$20.00", "Free", "Moderate", "High". MUST be populated.)
        - "rating": (string, a subjective rating out of 5, e.g., "4/5", "5/5". MUST be populated.)
        - "photos": (string, a placeholder description for an image, e.g., "A couple enjoying the sunset views from a Seine River cruise." or "The iconic glass pyramid of the Louvre Museum.". MUST be populated.)
    ).
    - "daySummary": (string, a brief, engaging sentence summarizing the day's theme or main activities, e.g., "Explore iconic landmarks and indulge in Parisian charm." or "Welcome to Paris! Settle into your hotel and begin your romantic adventure.". MUST be populated.)
    `;


    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables.");
      return new Response('Server configuration error: API Key not set.', { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Setting model to gemini-1.5-flash as requested.
    // Be aware that achieving highly complex, consistently structured output may be challenging with this model.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

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
    // Update this cleaning function to match the new, more detailed JSON structure
    const cleanItineraryForFrontend = (itinerary) => {
        if (!itinerary) return null;

        // Ensure top-level fields are populated
        itinerary.destination = itinerary.destination || 'N/A';
        itinerary.duration = itinerary.duration || 0; // Duration should be a number
        itinerary.estimatedBudget = itinerary.estimatedBudget || 'N/A';
        itinerary.travelStyle = itinerary.travelStyle || 'N/A';
        itinerary.weatherOverview = itinerary.weatherOverview || 'N/A';
        itinerary.essentialTravelTips = Array.isArray(itinerary.essentialTravelTips) ? itinerary.essentialTravelTips : [];

        // Ensure emergencyInformation object and its sub-arrays
        itinerary.emergencyInformation = itinerary.emergencyInformation || {};
        itinerary.emergencyInformation["Emergency Contacts"] = Array.isArray(itinerary.emergencyInformation["Emergency Contacts"]) ? itinerary.emergencyInformation["Emergency Contacts"] : [];
        itinerary.emergencyInformation["Hospitals"] = Array.isArray(itinerary.emergencyInformation["Hospitals"]) ? itinerary.emergencyInformation["Hospitals"] : [];
        itinerary.emergencyInformation["Embassies"] = Array.isArray(itinerary.emergencyInformation["Embassies"]) ? itinerary.emergencyInformation["Embassies"] : [];


        if (itinerary.days && Array.isArray(itinerary.days)) {
            itinerary.days = itinerary.days.map(day => {
                // Ensure daily-level fields
                day.dayNumber = day.dayNumber || 0; // Should be a number
                day.date = day.date || 'Date N/A';
                
                // Ensure dailyWeather object and its sub-fields
                day.dailyWeather = day.dailyWeather || {};
                day.dailyWeather.tempRange = day.dailyWeather.tempRange || 'N/A';
                day.dailyWeather.condition = day.dailyWeather.condition || 'N/A';
                day.dailyWeather.weatherTip = day.dailyWeather.weatherTip || 'N/A';

                day.dailyTips = Array.isArray(day.dailyTips) ? day.dailyTips : []; // This was `dailyTips`, now `essentialTravelTips`
                day.daySummary = day.daySummary || 'N/A';

                if (day.activities && Array.isArray(day.activities)) {
                    day.activities = day.activities.map(activity => {
                        activity.name = activity.name || 'N/A';
                        activity.category = activity.category || 'N/A';
                        activity.type = activity.type || 'N/A';
                        activity.description = activity.description || 'N/A';
                        activity.duration = activity.duration || 'N/A';
                        activity.location = activity.location || 'N/A';
                        activity.cost = activity.cost || 'N/A';
                        activity.rating = activity.rating || 'N/A';
                        activity.photos = activity.photos || 'N/A';
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
