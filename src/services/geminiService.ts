// src/services/geminiService.ts
// This file now acts as the client-side interface to your serverless function

interface TravelPreferences {
    destination: string;
    duration: number;
    travelStyle: string;
    // ... any other fields you collect from the user
    query: string; // The raw user input
}

interface Itinerary {
    // ... your full itinerary structure
    destination: string;
    days: Array<any>; // Define this more strictly based on your JSON output
    // etc.
}

// This function is called from your UI component
export async function generateItineraryFromPreferences(preferences: TravelPreferences): Promise<Itinerary> {
    try {
        // Call your Netlify Function endpoint
        // Use the full Netlify Function path or the redirected path if you set one up
        const response = await fetch('/.netlify/functions/generate-itinerary', {
        // OR if you set up the redirect:
        // const response = await fetch('/api/generate-itinerary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ preferences }), // Send the user's preferences object
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error from Netlify Function:', errorData);
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data: Itinerary = await response.json();
        return data;

    } catch (error) {
        console.error('Failed to generate itinerary:', error);
        throw error;
    }
}
