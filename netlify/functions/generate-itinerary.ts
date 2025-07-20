// netlify/functions/generate-itinerary.ts

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import type { Config, Context } from '@netlify/functions'; // For Netlify Function types

// This is the handler function that Netlify will execute
export default async (req: Request, context: Context) => {
  // 1. Basic Request Validation (POST method expected)
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 2. Parse the request body sent from your frontend
    // Your frontend will send the 'preferences' object here
    const { preferences } = await req.json();

    // 3. Access your API Key SECURELY from environment variables
    const apiKey = process.env.GEMINI_API_KEY; // This name must match what you set in Netlify UI
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables.");
      return new Response('Server configuration error: API Key not set.', { status: 500 });
    }

    // 4. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Add your safety settings here, similar to your client-side code
    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
    ];

    // 5. Construct the prompt and make the API call
    // Reconstruct your prompt based on the 'preferences' received
    // This is a placeholder; use your actual prompt logic
    const prompt = `Generate a detailed travel itinerary for a trip to ${preferences.destination} for ${preferences.duration} days. Include activities, estimated costs, and travel tips for each day. Also include weather information and emergency contacts for the destination. The user prefers ${preferences.travelStyle} style trips. Respond in a strict JSON format with keys: destination, duration, days (array of objects with dayNumber, date, activities (array of objects with name, description, time, cost), weather, travelTips, emergencyInfo).`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        safetySettings,
        generationConfig: { responseMimeType: "application/json" } // Ensure JSON output if supported
    });

    // 6. Process Gemini's response
    // You'll likely need your `cleanJsonString` logic here as well
    let geminiResponseText = result.response.text();

    // Implement your JSON cleaning logic if Gemini might return extra text
    const cleanJsonString = (jsonString: string): string => {
        const jsonMatch = jsonString.match(/```json\n([\s\S]*?)\n```/);
        return jsonMatch ? jsonMatch[1] : jsonString;
    };
    geminiResponseText = cleanJsonString(geminiResponseText);

    const parsedItinerary = JSON.parse(geminiResponseText);

    // 7. Send the structured data back to your frontend
    return new Response(JSON.stringify(parsedItinerary), {
      headers: { 'Content-Type': 'application/json' },
      status: 200 // Success
    });

  } catch (error) {
    console.error('Netlify Function execution error:', error);
    return new Response(JSON.stringify({
        error: 'Failed to generate itinerary. Please try again.',
        details: error.message || 'Unknown error'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500 // Server error
    });
  }
};

// Optional: Netlify Function configuration (for path, methods etc.)
// This makes the function accessible at /.netlify/functions/generate-itinerary
export const config: Config = {
    path: "/generate-itinerary",
    method: ["POST"], // Only allow POST requests
};
