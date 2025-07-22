export interface TravelPreferences {
  destination: string;
  duration: number;
  budget: 'budget' | 'mid-range' | 'luxury';
  interests: string[];
  travelStyle: 'relaxed' | 'moderate' | 'packed';
  groupSize: number;
  accommodation: 'hostel' | 'hotel' | 'resort' | 'airbnb';
  startDate?: string;
  specificRequests?: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  category: 'culture' | 'adventure' | 'dining' | 'relaxation' | 'sightseeing' | 'shopping' | 'nature';
  estimatedCost: number;
  location: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  coordinates?: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  photos?: string[];
  rating?: number;
  weatherConsideration?: 'indoor' | 'outdoor' | 'flexible';
}

export interface WeatherInfo {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  description: string;
  humidity: number;
  precipitation: number;
  recommendation: string;
}

export interface DayPlan {
  day: number;
  date: string;
  weather?: WeatherInfo;
  activities: Activity[];
  notes?: string;
  totalCost: number;
  travelTips?: string[];
}

export interface TravelPlan {
  id?: string;
  destination: string;
  duration: number;
  totalBudget: number;
  days: DayPlan[];
  preferences: TravelPreferences;
  createdAt: string;
  weatherSummary?: string;
  travelTips?: string[];
  emergencyInfo?: {
    contacts: string[];
    hospitals: string[];
    embassies: string[];
  };
}

export interface NaturalLanguageQuery {
  query: string;
  extractedInfo?: {
    destination?: string;
    duration?: number;
    startDate?: string;
    budget?: string;
    interests?: string[];
    groupSize?: number;
    specificRequests?: string[];
  };
}

export interface GeminiResponse {
  itinerary: TravelPlan;
  confidence: number;
  suggestions?: string[];
}