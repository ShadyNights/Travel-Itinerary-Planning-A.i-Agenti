// src/services/geminiService.ts
import { TravelPreferences, TravelPlan } from '../types/travel'; // Assuming these types are correctly defined

// This function will now communicate with your Netlify Function
export async function generateItineraryFromPreferences(input: TravelPreferences | { naturalLanguageQuery: string }): Promise<TravelPlan> {
    try {
        const response = await fetch('/.netlify/functions/generate-itinerary', { // Or '/api/generate-itinerary' if you have a redirect set up
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input), // Send the entire input object to the Netlify Function
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data: TravelPlan = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching itinerary from Netlify Function:', error);
        throw error;
    }
}

// IMPORTANT: Make sure you've removed any direct Google Generative AI imports or instances from this file.
// E.g., const genAI = new GoogleGenerativeAI(API_KEY); or similar code should NOT be here.
