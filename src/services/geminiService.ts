import { GoogleGenerativeAI } from '@google/generative-ai';
import { TravelPreferences, TravelPlan, NaturalLanguageQuery, GeminiResponse, Activity, DayPlan } from '../types/travel'; // Ensure DayPlan and Activity are imported

// Initialize Gemini AI (you'll need to add your API key to environment variables)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'demo-key');

export class GeminiTravelAgent {
  // *** THIS LINE HAS BEEN UPDATED ***
  // Using 'gemini-1.5-flash' as it's generally available and a good balance of speed/cost.
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  // If you prefer, you can also try 'gemini-2.0-flash' for the latest flash model.

  private safetySettings = [ // Added basic safety settings
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_NONE',
    },
  ];

  async parseNaturalLanguageQuery(query: string): Promise<NaturalLanguageQuery> {
    const prompt = `
    Analyze the following travel request and extract the key preferences into a structured JSON object.
    Be precise with data types (e.g., numbers for duration and groupSize, array of strings for interests and specificRequests).
    If a value cannot be inferred, use 'null' for strings/numbers or an empty array for lists.

    Query: "${query}"
    
    Expected JSON format:
    {
      "destination": "string | null", // e.g., "Paris, France"
      "duration": "number | null", // number of days, e.g., 5
      "startDate": "YYYY-MM-DD | null", // formatted date, e.g., "2024-08-15"
      "budget": "budget | mid-range | luxury | null", // one of these specific strings
      "interests": "string[]", // e.g., ["Culture & History", "Food & Dining"]
      "groupSize": "number | null", // e.g., 2
      "specificRequests": "string[]" // e.g., ["vegetarian options", "wheelchair accessible"]
    }
    
    Example:
    Query: "Plan a 7-day trip to Rome for a couple, starting next month, mid-range budget, interested in history and local food."
    Response:
    {
      "destination": "Rome, Italy",
      "duration": 7,
      "startDate": "2025-08-01", // Assuming 'next month' from current date (July 2025)
      "budget": "mid-range",
      "interests": ["Culture & History", "Food & Dining"],
      "groupSize": 2,
      "specificRequests": []
    }

    Query: "${query}"
    Response:
    `;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        safetySettings: this.safetySettings,
      });
      const responseText = result.response.text();
      
      // Attempt to clean and parse JSON
      const cleanedText = this.cleanJsonString(responseText);
      const extractedInfo = JSON.parse(cleanedText);

      return {
        query,
        extractedInfo: extractedInfo // Assuming extractedInfo matches TravelPreferences structure partially
      } as NaturalLanguageQuery; // Cast to NaturalLanguageQuery type
    } catch (error) {
      console.error('Error parsing natural language query:', error);
      // Return a default structure or re-throw
      return { 
        query, 
        extractedInfo: {
          destination: null,
          duration: null,
          startDate: null,
          budget: null,
          interests: [],
          groupSize: null,
          travelStyle: null, // Add travelStyle to extractedInfo
          accommodation: null, // Add accommodation to extractedInfo
          specificRequests: []
        }
      };
    }
  }

  async generateItinerary(preferences: TravelPreferences): Promise<TravelPlan> {
    // 1. Get Weather Forecast (before building the main prompt)
    let weatherData = null;
    if (preferences.startDate && preferences.destination) {
      try {
        weatherData = await this.getWeatherForecast(preferences.destination, preferences.startDate, preferences.duration);
        console.log('Fetched weather data:', weatherData);
      } catch (weatherError) {
        console.warn('Could not fetch weather forecast:', weatherError);
        // Continue without weather if API fails
      }
    }

    const prompt = this.buildItineraryPrompt(preferences, weatherData);
    
    try {
      console.log('Sending itinerary generation prompt to Gemini...');
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        safetySettings: this.safetySettings,
      });
      const responseText = result.response.text();
      console.log('Gemini raw response:', responseText);
      
      const cleanedText = this.cleanJsonString(responseText);
      const geminiResponse: GeminiResponse = JSON.parse(cleanedText);
      
      return this.processGeminiResponse(geminiResponse, preferences);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse itinerary. The AI response was not valid JSON. Please try again or refine your preferences.');
      }
      throw new Error('Failed to generate itinerary. An unexpected error occurred. Please try again.');
    }
  }

  private buildItineraryPrompt(preferences: TravelPreferences, weatherData: any | null): string {
    const interestsString = preferences.interests.length > 0 ? preferences.interests.join(', ') : 'general sightseeing and relaxation';
    const specificRequestsString = preferences.specificRequests ? `Special Requests: ${preferences.specificRequests}.` : '';
    const accommodationString = preferences.accommodation ? `Accommodation preference: ${preferences.accommodation}.` : '';

    let weatherContext = '';
    if (weatherData && weatherData.forecast && weatherData.forecast.length > 0) {
        weatherContext = `
        Here's a weather forecast for your trip. Please incorporate weather-appropriate activities and recommendations into the daily plan:
        ${JSON.stringify(weatherData.forecast.map((day: any) => ({
            date: day.date,
            condition: day.condition,
            temperature: day.temperature,
            recommendation: day.recommendation
        })), null, 2)}
        `;
    }

    // Use current date if startDate is not provided, but explicitly for the prompt.
    const effectiveStartDate = preferences.startDate || new Date().toISOString().split('T')[0];

    return `
    As an expert travel planner, generate a highly detailed and practical travel itinerary.
    
    Based on the following preferences:
    - **Destination:** ${preferences.destination}
    - **Duration:** ${preferences.duration} days
    - **Start Date:** ${effectiveStartDate} (actual dates should be calculated from this)
    - **Budget:** ${preferences.budget}
    - **Group Size:** ${preferences.groupSize} people
    - **Travel Style:** ${preferences.travelStyle} (e.g., relaxed, moderate, packed)
    - **Main Interests:** ${interestsString}
    - ${accommodationString}
    - ${specificRequestsString}

    ${weatherContext}

    Please provide a comprehensive itinerary in the following strict JSON format.
    Ensure all fields are present, even if empty.
    
    **CRITICAL:** The entire output must be a valid JSON object, with no preamble, postamble, or conversational text.
    Every activity MUST have a unique 'id'.
    All costs should be in USD.

    JSON Format:
    \`\`\`json
    {
      "id": "generated_plan_id",
      "destination": "${preferences.destination}",
      "duration": ${preferences.duration},
      "totalBudget": 0, // This will be calculated on the client-side based on activities
      "weatherSummary": "General weather overview for the entire trip based on provided forecast data.",
      "travelTips": ["General tip 1", "General tip 2", "Travel tip related to destination/preferences"],
      "emergencyInfo": {
        "contacts": ["Local emergency number", "Police", "Ambulance"],
        "hospitals": ["Recommended hospital 1 address", "Recommended hospital 2 address"],
        "embassies": ["Your country's embassy address in ${preferences.destination} (if applicable)"]
      },
      "days": [
        {
          "day": 1,
          "date": "YYYY-MM-DD", // Actual calculated date for this day
          "notes": "Daily overview or welcome note.",
          "weather": {
            "temperature": {"min": 0, "max": 0}, // celsius or fahrenheit, specify unit
            "condition": "string", // e.g., "Sunny", "Partly Cloudy", "Rain"
            "description": "string",
            "humidity": 0, // percentage
            "precipitation": 0, // percentage
            "recommendation": "string" // e.g., "Wear light clothes", "Carry an umbrella"
          },
          "activities": [
            {
              "id": "unique_activity_id_1",
              "name": "Activity Name",
              "description": "Detailed description of the activity, why it's recommended based on preferences.",
              "duration": "e.g., 2 hours",
              "category": "culture | adventure | dining | relaxation | sightseeing | shopping | nature | nightlife | wellness",
              "estimatedCost": 0, // Cost per person in USD
              "location": "Exact address or major landmark",
              "timeSlot": "morning | afternoon | evening | full-day",
              "weatherConsideration": "indoor | outdoor | flexible",
              "rating": 0, // Estimated rating out of 5
              "photos": ["short_description_for_an_image"] // Describe a representative image
            },
            // ... more activities for Day 1
          ],
          "dailyCost": 0, // Calculated from activities for this day
          "dailyTravelTips": ["Tip specific to this day/area."]
        }
        // ... more days up to preferences.duration
      ]
    }
    \`\`\`
    
    Make sure the generated itinerary is realistic, considers logical flow between activities, and truly reflects the specified preferences and budget. Prioritize activities that align with interests. Ensure "totalBudget" is sum of all activity costs (per person) * group size.
    `;
  }

  private processGeminiResponse(geminiResponse: GeminiResponse, preferences: TravelPreferences): TravelPlan {
    const processedPlan: TravelPlan = {
      id: geminiResponse.id || Date.now().toString(),
      destination: geminiResponse.destination || preferences.destination,
      duration: geminiResponse.duration || preferences.duration,
      totalBudget: 0, // Will be calculated after processing activities
      days: [],
      preferences, // Store original preferences for reference
      createdAt: new Date().toISOString(),
      weatherSummary: geminiResponse.weatherSummary || 'Weather information not available or generated.',
      travelTips: geminiResponse.travelTips || [],
      emergencyInfo: geminiResponse.emergencyInfo || { contacts: [], hospitals: [], embassies: [] }
    };

    let calculatedTotalBudget = 0;

    // Ensure each day has proper structure and calculate costs
    if (geminiResponse.days && Array.isArray(geminiResponse.days)) {
      processedPlan.days = geminiResponse.days.map((day: any, index: number): DayPlan => {
        let dailyCost = 0;
        const activities: Activity[] = (day.activities || []).map((activity: any): Activity => {
          const estimatedCost = typeof activity.estimatedCost === 'number' ? activity.estimatedCost : 0;
          dailyCost += estimatedCost; // Accumulate daily cost

          return {
            id: activity.id || `${processedPlan.id}-day${day.day || index + 1}-act${activity.name.replace(/\s/g, '') || Date.now()}`,
            name: activity.name || 'Unnamed Activity',
            description: activity.description || 'No description provided.',
            duration: activity.duration || 'N/A',
            category: activity.category || 'sightseeing', // Default category
            estimatedCost: estimatedCost,
            location: activity.location || 'Unknown Location',
            timeSlot: activity.timeSlot || 'full-day',
            weatherConsideration: activity.weatherConsideration || 'flexible',
            rating: typeof activity.rating === 'number' ? activity.rating : null,
            photos: activity.photos || []
          };
        });

        // Add group size multiplier for daily cost before adding to total budget
        calculatedTotalBudget += dailyCost * (preferences.groupSize || 1); 

        // Calculate actual date based on startDate
        const baseDate = preferences.startDate ? new Date(preferences.startDate) : new Date();
        const currentDate = new Date(baseDate);
        currentDate.setDate(baseDate.getDate() + index);

        return {
          day: day.day || index + 1,
          date: day.date || this.formatDate(currentDate), // Use generated date or fall back
          weather: day.weather || null,
          activities: activities,
          notes: day.notes || null,
          dailyCost: dailyCost, // Cost per person for the day
          dailyTravelTips: day.dailyTravelTips || []
        };
      });
    }

    processedPlan.totalBudget = calculatedTotalBudget; // Set the aggregated total budget

    return processedPlan;
  }

  // Helper to clean potential markdown or extra text from Gemini's JSON response
  private cleanJsonString(jsonString: string): string {
    // Remove markdown code block fences if present
    let cleaned = jsonString.replace(/```json\n/g, '').replace(/\n```/g, '');
    // Trim whitespace
    cleaned = cleaned.trim();
    // In case Gemini adds any conversational text outside the JSON
    // Try to find the first '{' and last '}'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return cleaned;
  }


  // The existing getWeatherForecast and getPlaceDetails methods are fine as they are,
  // but remember they are separate calls. For a single-call comprehensive itinerary,
  // you instruct Gemini to *include* this data in the main itinerary response.
  // These separate methods would be for other features (e.g., a dedicated weather tab, or "details" on click).

  async getWeatherForecast(destination: string, startDate: string, duration: number): Promise<any> {
    const prompt = `
    Provide a ${duration}-day weather forecast for ${destination} starting from ${startDate}.
    Assume typical weather patterns for the location and season if real-time data is not available.
    
    Return JSON format only:
    {
      "location": "${destination}",
      "forecast": [
        {
          "date": "YYYY-MM-DD",
          "temperature": {"min": temp_min, "max": temp_max, "unit": "Celsius"},
          "condition": "sunny|cloudy|rainy|snowy|partly cloudy",
          "description": "detailed_description_of_weather",
          "humidity": 0, // percentage
          "precipitation": 0, // percentage chance
          "recommendation": "weather_based_clothing_or_activity_recommendation"
        }
        // ... more days
      ]
    }
    `;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        safetySettings: this.safetySettings,
      });
      const responseText = result.response.text();
      const cleanedText = this.cleanJsonString(responseText);
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error getting weather forecast:', error);
      return null;
    }
  }

  async getPlaceDetails(placeName: string, destination: string): Promise<any> {
    const prompt = `
    Provide detailed and factual information about "${placeName}" in ${destination}.
    
    Return JSON format only:
    {
      "name": "${placeName}",
      "description": "detailed_description_of_the_place",
      "location": "specific_address_or_well_known_area",
      "coordinates": {"lat": 0, "lng": 0}, // approximate if exact is hard
      "rating": 0, // estimated rating out of 5, e.g., 4.5
      "photos": ["short_description_of_a_representative_photo_1", "short_description_of_a_representative_photo_2"],
      "openingHours": "e.g., 9 AM - 6 PM daily or check website for details",
      "entryFee": 0, // cost in USD, 0 for free
      "bestTimeToVisit": "e.g., early morning, late afternoon, during weekdays",
      "tips": ["tip for visitors 1", "tip for visitors 2"],
      "nearbyAttractions": ["Name of nearby attraction 1", "Name of nearby attraction 2"]
    }
    `;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        safetySettings: this.safetySettings,
      });
      const responseText = result.response.text();
      const cleanedText = this.cleanJsonString(responseText);
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

export const geminiAgent = new GeminiTravelAgent();
