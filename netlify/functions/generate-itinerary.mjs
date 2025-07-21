// netlify/functions/generate-itinerary.mjs

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
// REMOVE THIS LINE: import { Config, Context } from '@netlify/functions';

// You can add JSDoc for IDE type hints if you want, but it's not strictly necessary for runtime
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

    if (requestBody.preferences) {
      const preferences = requestBody.preferences;
      prompt = `Generate a detailed travel itinerary for a trip to ${preferences.destination} for ${preferences.duration} days. Include activities, estimated costs, and travel tips for each day. Also include weather information and emergency contacts for the destination. The user prefers ${preferences.travelStyle} style trips.`;

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
      prompt = requestBody.naturalLanguageQuery;
      prompt = `Create a travel itinerary based on this natural language request: ${prompt}`;

    } else {
      console.error("Invalid request body structure:", requestBody);
      return new Response(JSON.stringify({
          error: 'Invalid input format. Please provide valid preferences or a natural language query.'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }

    prompt += ` Respond in a strict JSON format with keys: destination, duration, days (array of objects with dayNumber, date, activities (array of objects with name, description, time, cost), weather, travelTips, emergencyInfo).`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables.");
      return new Response('Server configuration error: API Key not set.', { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
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

    const cleanJsonString = (jsonString) => {
        const jsonMatch = jsonString.match(/```json\n([\s\S]*?)\n```/);
        return jsonMatch ? jsonMatch[1] : jsonString;
    };
    geminiResponseText = cleanJsonString(geminiResponseText);

    const parsedItinerary = JSON.parse(geminiResponseText);

    return new Response(JSON.stringify(parsedItinerary), {
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
// No need for Config type annotation here for bundling in .mjs
export const config = {
    path: "/.netlify/functions/generate-itinerary",
    method: ["POST"],
};
