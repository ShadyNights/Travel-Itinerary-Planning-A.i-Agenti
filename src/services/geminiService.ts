
import { TravelPreferences, TravelPlan } from '../types/travel';


export async function generateItineraryFromPreferences(preferences: TravelPreferences): Promise<TravelPlan> {
    try {
        const response = await fetch('/.netlify/functions/generate-itinerary', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferences }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data: TravelPlan = await response.json();
        return data;

    } catch (error) {
        console.error('Failed to generate itinerary:', error);
        throw error;
    }
}

/
