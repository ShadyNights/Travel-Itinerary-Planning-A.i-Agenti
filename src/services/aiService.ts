import { TravelPreferences, TravelPlan, DayPlan, Activity, NaturalLanguageQuery } from '../types/travel';

// --- Mock Data: Expand with more destinations and activity types ---
const allActivities: Activity[] = [
  // Tokyo Activities
  {
    id: 'tokyo-1',
    name: 'Visit Senso-ji Temple',
    description: 'Explore Tokyo\'s oldest temple in the historic Asakusa district.',
    duration: '2 hours',
    category: 'culture',
    tags: ['history', 'temple', 'sightseeing', 'walking'],
    estimatedCost: 0, // Free entry
    location: 'Asakusa',
    timeSlot: 'morning'
  },
  {
    id: 'tokyo-2',
    name: 'Tsukiji Outer Market Food Tour',
    description: 'Experience the bustling outer market and enjoy fresh seafood and local delicacies.',
    duration: '3 hours',
    category: 'dining',
    tags: ['food', 'market', 'local experiences'],
    estimatedCost: 45,
    location: 'Tsukiji',
    timeSlot: 'morning'
  },
  {
    id: 'tokyo-3',
    name: 'Tokyo Skytree Observatory',
    description: 'Enjoy panoramic views of Tokyo from one of the world\'s tallest structures.',
    duration: '2 hours',
    category: 'sightseeing',
    tags: ['views', 'modern', 'landmark'],
    estimatedCost: 25,
    location: 'Sumida',
    timeSlot: 'afternoon'
  },
  {
    id: 'tokyo-4',
    name: 'Shibuya Crossing & Hachiko Statue',
    description: 'Witness the iconic Shibuya scramble crossing and visit the famous Hachiko statue.',
    duration: '1.5 hours',
    category: 'sightseeing',
    tags: ['city life', 'iconic', 'walking'],
    estimatedCost: 0,
    location: 'Shibuya',
    timeSlot: 'evening'
  },
  {
    id: 'tokyo-5',
    name: 'Ghibli Museum (Advance Booking Essential)',
    description: 'Step into the magical world of Studio Ghibli, featuring exhibits and a short film.',
    duration: '3 hours',
    category: 'art',
    tags: ['museum', 'anime', 'family', 'unique'],
    estimatedCost: 10,
    location: 'Mitaka',
    timeSlot: 'morning'
  },
  {
    id: 'tokyo-6',
    name: 'Akihabara Electric Town Exploration',
    description: 'Dive into the heart of Tokyo\'s anime, manga, and electronics culture.',
    duration: '3 hours',
    category: 'shopping',
    tags: ['anime', 'electronics', 'otaku', 'nightlife'],
    estimatedCost: 10, // Cost for small purchases/arcade
    location: 'Akihabara',
    timeSlot: 'afternoon'
  },
  {
    id: 'tokyo-7',
    name: 'Ueno Park & Museums',
    description: 'Spend a relaxing day exploring major museums (Tokyo National Museum, National Museum of Nature and Science) and the park.',
    duration: '4-5 hours',
    category: 'culture',
    tags: ['park', 'museums', 'art', 'nature'],
    estimatedCost: 12, // Avg museum entry
    location: 'Ueno',
    timeSlot: 'morning'
  },
  {
    id: 'tokyo-8',
    name: 'Harajuku Fashion & Takeshita Street',
    description: 'Experience Tokyo\'s vibrant youth fashion and quirky shops.',
    duration: '2 hours',
    category: 'shopping',
    tags: ['fashion', 'youth culture', 'street art'],
    estimatedCost: 0,
    location: 'Harajuku',
    timeSlot: 'afternoon'
  },
  {
    id: 'tokyo-9',
    name: 'Sumo Practice Viewing (seasonal)',
    description: 'Witness sumo wrestlers training early in the morning.',
    duration: '2 hours',
    category: 'culture',
    tags: ['sport', 'local experiences'],
    estimatedCost: 0, // Sometimes requires small fee/guide
    location: 'Ryogoku',
    timeSlot: 'morning'
  },
  {
    id: 'tokyo-10',
    name: 'Robot Restaurant Show (booking required)',
    description: 'An over-the-top, dazzling show with robots, dancers, and neon lights. More of an experience than a meal.',
    duration: '1.5 hours',
    category: 'nightlife',
    tags: ['entertainment', 'unique', 'quirky'],
    estimatedCost: 75,
    location: 'Shinjuku',
    timeSlot: 'evening'
  },
  // Paris Activities
  {
    id: 'paris-1',
    name: 'Eiffel Tower Ascent',
    description: 'Ascend the iconic Eiffel Tower for breathtaking views of Paris.',
    duration: '2 hours',
    category: 'sightseeing',
    tags: ['landmark', 'views', 'romantic'],
    estimatedCost: 35,
    location: 'Champ de Mars',
    timeSlot: 'afternoon'
  },
  {
    id: 'paris-2',
    name: 'Louvre Museum Tour',
    description: 'Explore the world\'s largest art museum, home to the Mona Lisa and countless masterpieces.',
    duration: '4 hours',
    category: 'art',
    tags: ['museum', 'history', 'culture'],
    estimatedCost: 20,
    location: 'Louvre',
    timeSlot: 'morning'
  },
  {
    id: 'paris-3',
    name: 'Seine River Cruise',
    description: 'Enjoy a romantic boat cruise along the Seine, passing by illuminated landmarks.',
    duration: '1.5 hours',
    category: 'relaxation',
    tags: ['romantic', 'sightseeing', 'evening'],
    estimatedCost: 25,
    location: 'Seine River',
    timeSlot: 'evening'
  },
  {
    id: 'paris-4',
    name: 'French Cooking Class',
    description: 'Learn to prepare classic French dishes in a hands-on culinary experience.',
    duration: '3 hours',
    category: 'dining',
    tags: ['food', 'local experiences', 'interactive'],
    estimatedCost: 85,
    location: 'Le Marais',
    timeSlot: 'afternoon'
  },
  {
    id: 'paris-5',
    name: 'Montmartre Walking Tour & Sacré-Cœur',
    description: 'Discover the artistic bohemian quarter, its charming streets, and the stunning Sacré-Cœur Basilica.',
    duration: '3 hours',
    category: 'culture',
    tags: ['walking', 'art', 'views', 'history'],
    estimatedCost: 15, // Optional guide/cable car
    location: 'Montmartre',
    timeSlot: 'morning'
  },
  {
    id: 'paris-6',
    name: 'Versailles Palace & Gardens Day Trip',
    description: 'Step back in time with a visit to the opulent palace and magnificent gardens of Versailles.',
    duration: '6-7 hours',
    category: 'culture',
    tags: ['history', 'palace', 'gardens', 'day trip'],
    estimatedCost: 45, // Entry + transport
    location: 'Versailles',
    timeSlot: 'morning'
  },
  {
    id: 'paris-7',
    name: 'Musée d\'Orsay',
    description: 'Explore a stunning collection of Impressionist and Post-Impressionist masterpieces housed in a former railway station.',
    duration: '3 hours',
    category: 'art',
    tags: ['museum', 'impressionism', 'art'],
    estimatedCost: 16,
    location: 'Left Bank',
    timeSlot: 'afternoon'
  },
  {
    id: 'paris-8',
    name: 'Notre Dame Cathedral & Île de la Cité',
    description: 'Visit the exterior of the iconic cathedral and explore the historic island.',
    duration: '2 hours',
    category: 'culture',
    tags: ['landmark', 'history', 'architecture'],
    estimatedCost: 0,
    location: 'Île de la Cité',
    timeSlot: 'morning'
  },
  {
    id: 'paris-9',
    name: 'Le Marais District Exploration',
    description: 'Wander through this fashionable district known for its historic architecture, boutiques, and trendy cafes.',
    duration: '3 hours',
    category: 'shopping',
    tags: ['fashion', 'cafes', 'history', 'walking'],
    estimatedCost: 0,
    location: 'Le Marais',
    timeSlot: 'afternoon'
  },
  {
    id: 'paris-10',
    name: 'Cabaret Show at Moulin Rouge (booking essential)',
    description: 'Experience a dazzling Parisian cabaret show at the legendary Moulin Rouge.',
    duration: '3 hours',
    category: 'nightlife',
    tags: ['entertainment', 'show', 'luxury'],
    estimatedCost: 120,
    location: 'Montmartre',
    timeSlot: 'evening'
  },
  // Goa Activities
  {
    id: 'goa-1',
    name: 'Relax at Palolem Beach',
    description: 'Enjoy the serene beauty of Palolem Beach, perfect for swimming and sunbathing.',
    duration: '4 hours',
    category: 'beach',
    tags: ['relaxation', 'swimming', 'sunbath', 'family-friendly'],
    estimatedCost: 0,
    location: 'South Goa',
    timeSlot: 'morning'
  },
  {
    id: 'goa-2',
    name: 'Dudhsagar Waterfalls Trip',
    description: 'Visit one of India\'s tallest waterfalls, often requiring a jeep safari through the Bhagwan Mahaveer Sanctuary.',
    duration: '6 hours',
    category: 'nature',
    tags: ['adventure', 'nature', 'waterfall', 'sightseeing'],
    estimatedCost: 50, // Includes jeep safari
    location: 'Mollem',
    timeSlot: 'morning'
  },
  {
    id: 'goa-3',
    name: 'Old Goa Churches & Convents',
    description: 'Explore the UNESCO World Heritage site with its magnificent Portuguese churches and convents.',
    duration: '3 hours',
    category: 'culture',
    tags: ['history', 'architecture', 'religious sites'],
    estimatedCost: 0,
    location: 'Old Goa',
    timeSlot: 'afternoon'
  },
  {
    id: 'goa-4',
    name: 'Spice Plantation Tour',
    description: 'Discover various spices, enjoy a traditional Goan lunch, and learn about organic farming.',
    duration: '3 hours',
    category: 'food',
    tags: ['local experiences', 'nature', 'dining'],
    estimatedCost: 25,
    location: 'Ponda',
    timeSlot: 'afternoon'
  },
  {
    id: 'goa-5',
    name: 'Anjuna Flea Market (Wednesday only)',
    description: 'Bargain for souvenirs, handicrafts, and clothes at this famous bohemian market.',
    duration: '3 hours',
    category: 'shopping',
    tags: ['market', 'local experiences', 'unique'],
    estimatedCost: 0,
    location: 'Anjuna',
    timeSlot: 'afternoon'
  },
  {
    id: 'goa-6',
    name: 'Water Sports at Baga Beach',
    description: 'Enjoy jet-skiing, parasailing, and banana boat rides at one of Goa\'s most popular beaches.',
    duration: '3 hours',
    category: 'adventure',
    tags: ['beach', 'water sports', 'thrill'],
    estimatedCost: 40, // Per activity
    location: 'Baga',
    timeSlot: 'morning'
  },
  // Manali Activities
  {
    id: 'manali-1',
    name: 'Hadimba Devi Temple Visit',
    description: 'Visit the unique wooden temple nestled amidst cedar forests, dedicated to Goddess Hadimba.',
    duration: '1.5 hours',
    category: 'culture',
    tags: ['temple', 'history', 'architecture', 'religious sites'],
    estimatedCost: 0,
    location: 'Manali',
    timeSlot: 'morning'
  },
  {
    id: 'manali-2',
    name: 'Solang Valley Adventure',
    description: 'Engage in paragliding, zorbing (seasonal), and ropeway rides with stunning mountain views.',
    duration: '4 hours',
    category: 'adventure',
    tags: ['sports', 'thrill', 'views', 'nature'],
    estimatedCost: 50, // Per activity
    location: 'Solang Valley',
    timeSlot: 'afternoon'
  },
  {
    id: 'manali-3',
    name: 'Old Manali Exploration & Cafe Hopping',
    description: 'Wander through the charming village, enjoy the hippie vibe, and try local and international cuisine at cafes.',
    duration: '3 hours',
    category: 'local experiences',
    tags: ['food', 'culture', 'walking', 'relaxation'],
    estimatedCost: 15, // For food
    location: 'Old Manali',
    timeSlot: 'afternoon'
  },
  {
    id: 'manali-4',
    name: 'Rohtang Pass Day Trip (seasonal, permits required)',
    description: 'Experience snow-capped peaks and breathtaking landscapes (check accessibility and permits).',
    duration: '6-8 hours',
    category: 'nature',
    tags: ['adventure', 'views', 'snow', 'day trip'],
    estimatedCost: 70, // Includes transport & permit
    location: 'Rohtang Pass',
    timeSlot: 'morning'
  },
  {
    id: 'manali-5',
    name: 'Beas River Rafting',
    description: 'Thrill-seeking white water rafting on the Beas River.',
    duration: '2 hours',
    category: 'adventure',
    tags: ['sports', 'water sports', 'thrill'],
    estimatedCost: 30,
    location: 'Beas River',
    timeSlot: 'morning'
  },
  {
    id: 'manali-6',
    name: 'Vashisht Village & Hot Springs',
    description: 'Visit the tranquil village known for its natural hot sulfur springs and ancient temples.',
    duration: '2 hours',
    category: 'wellness',
    tags: ['relaxation', 'culture', 'temple'],
    estimatedCost: 0,
    location: 'Vashisht',
    timeSlot: 'afternoon'
  },
];

// --- Helper Functions ---

/**
 * Parses a natural language query into structured preferences.
 * This is a simplified mock. In a real application, this would involve
 * a more sophisticated NLP model (like Gemini's text-to-JSON capabilities).
 */
export const parseNaturalLanguageQuery = async (query: string): Promise<NaturalLanguageQuery> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  const lowerQuery = query.toLowerCase();
  const parsed: NaturalLanguageQuery = {
    originalQuery: query,
    extractedInfo: {}
  };

  // Destination
  const destinations = ['tokyo', 'paris', 'goa', 'manali'];
  for (const dest of destinations) {
    if (lowerQuery.includes(dest)) {
      parsed.extractedInfo.destination = dest.charAt(0).toUpperCase() + dest.slice(1);
      break;
    }
  }

  // Duration
  const durationMatch = lowerQuery.match(/(\d+)\s*days?/);
  if (durationMatch) {
    parsed.extractedInfo.duration = parseInt(durationMatch[1], 10);
  }

  // Budget
  if (lowerQuery.includes('budget-friendly') || lowerQuery.includes('cheap')) {
    parsed.extractedInfo.budget = 'budget-friendly';
  } else if (lowerQuery.includes('mid-range') || lowerQuery.includes('moderate budget')) {
    parsed.extractedInfo.budget = 'mid-range';
  } else if (lowerQuery.includes('luxury') || lowerQuery.includes('high-end')) {
    parsed.extractedInfo.budget = 'luxury';
  }

  // Interests (simplified keyword matching)
  const allInterestKeywords = {
    'culture': ['culture', 'history', 'museums', 'historical sites', 'art'],
    'adventure': ['adventure', 'sports', 'trekking', 'hiking', 'rafting', 'water sports', 'thrill'],
    'food': ['food', 'dining', 'cuisine', 'eat'],
    'nature': ['nature', 'wildlife', 'parks', 'mountains', 'beaches', 'waterfall'],
    'shopping': ['shopping', 'markets', 'boutiques'],
    'nightlife': ['nightlife', 'bars', 'clubs'],
    'relaxation': ['relax', 'spa', 'wellness', 'beach'],
    'local experiences': ['local experiences', 'authentic', 'bazaars']
  };

  parsed.extractedInfo.interests = [];
  for (const interest in allInterestKeywords) {
    if (allInterestKeywords[interest as keyof typeof allInterestKeywords].some(keyword => lowerQuery.includes(keyword))) {
      if (!parsed.extractedInfo.interests.includes(interest)) {
        parsed.extractedInfo.interests.push(interest);
      }
    }
  }
  // Add specific requests
  const specificRequestMatch = lowerQuery.match(/(?:interested in|focus on|with|including)\s*(.+)$/);
  if (specificRequestMatch) {
      const parts = specificRequestMatch[1].split(/and|,/);
      parsed.extractedInfo.specificRequests = parts.map(p => p.trim()).filter(p => p.length > 0);
  }
  // Group size
  const groupSizeMatch = lowerQuery.match(/(\d+)\s*(?:people|person|adults?|kids?)/);
  if (groupSizeMatch) {
      parsed.extractedInfo.groupSize = parseInt(groupSizeMatch[1], 10);
  }

  // Start Date (very basic parsing for month/year)
  const monthYearMatch = lowerQuery.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4})?/);
  if (monthYearMatch) {
      const month = monthYearMatch[1];
      const year = monthYearMatch[2] || new Date().getFullYear(); // Default to current year
      parsed.extractedInfo.startDate = new Date(`${month} 1, ${year}`).toISOString().split('T')[0];
  }


  return parsed;
};

/**
 * Generates a travel itinerary based on given preferences.
 * This is a simulated function that would typically call a real AI model
 * to generate a highly customized and detailed itinerary.
 */
export const generateItinerary = async (preferences: TravelPreferences): Promise<TravelPlan> => {
  console.log("Generating itinerary with preferences:", preferences);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000)); // Longer delay for generation

  const destinationKey = preferences.destination.toLowerCase().split(',')[0].trim();

  // Filter activities by destination
  let filteredActivities = allActivities.filter(
    activity => activity.id.toLowerCase().startsWith(destinationKey)
  );

  // If no specific destination activities, use generic ones (or a more complex fallback)
  if (filteredActivities.length === 0) {
    filteredActivities = allActivities.filter(activity => !activity.id.includes('-')); // Generic activities if they don't have a destination prefix
    console.warn(`No specific activities found for ${preferences.destination}. Using generic activities.`);
  }

  // Further filter activities by interests and budget
  let eligibleActivities: Activity[] = [];

  const interestTags = preferences.interests || [];
  const minCost = preferences.budget === 'budget-friendly' ? 0 : preferences.budget === 'mid-range' ? 10 : 50;
  const maxCost = preferences.budget === 'budget-friendly' ? 40 : preferences.budget === 'mid-range' ? 80 : 200;


  for (const activity of filteredActivities) {
    const matchesInterest = interestTags.length === 0 || interestTags.some(interest => 
      activity.tags?.some(tag => tag.toLowerCase().includes(interest.toLowerCase())) ||
      activity.category.toLowerCase().includes(interest.toLowerCase())
    );

    const matchesBudget = activity.estimatedCost >= minCost && activity.estimatedCost <= maxCost;

    // Add logic for specificRequests if they are very detailed
    const matchesSpecificRequests = preferences.specificRequests ? 
      preferences.specificRequests.toLowerCase().split(',').some(req => 
        activity.name.toLowerCase().includes(req.trim()) || 
        activity.description.toLowerCase().includes(req.trim()) ||
        activity.tags?.some(tag => tag.toLowerCase().includes(req.trim()))
      ) : true; // If no specific requests, consider it a match

    if (matchesInterest && matchesBudget && matchesSpecificRequests) {
      eligibleActivities.push(activity);
    }
  }

  // Ensure unique activities are picked and prioritize high-interest activities
  // Simple prioritization: activities matching more interests
  eligibleActivities.sort((a, b) => {
    const aMatches = interestTags.filter(interest => a.tags?.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))).length;
    const bMatches = interestTags.filter(interest => b.tags?.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))).length;
    return bMatches - aMatches; // Sort by more matches first
  });

  // Shuffle to add variety if many activities have same "interest match score"
  eligibleActivities = eligibleActivities.sort(() => 0.5 - Math.random());


  const days: DayPlan[] = [];
  const baseDate = preferences.startDate ? new Date(preferences.startDate) : new Date();

  // Keep track of used activities to avoid repetition within the same itinerary
  const usedActivityIds = new Set<string>();

  for (let i = 0; i < preferences.duration; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    
    let activitiesPerDay = 3; // Default moderate
    if (preferences.travelStyle === 'relaxed') {
      activitiesPerDay = 2;
    } else if (preferences.travelStyle === 'packed') {
      activitiesPerDay = 4;
    }

    const dayActivities: Activity[] = [];
    const availableTimeSlots = { morning: false, afternoon: false, evening: false };
    
    // Attempt to fill activities for the day, respecting time slots and avoiding repetition
    for (const timeSlot of ['morning', 'afternoon', 'evening'] as const) {
      if (dayActivities.length >= activitiesPerDay) break; // Stop if enough activities planned
      
      const potentialActivities = eligibleActivities.filter(act => 
        act.timeSlot === timeSlot && !usedActivityIds.has(act.id)
      );

      if (potentialActivities.length > 0) {
        // Pick the top matching activity for this slot
        const activityToAdd = potentialActivities[0]; 
        dayActivities.push(activityToAdd);
        usedActivityIds.add(activityToAdd.id);
        availableTimeSlots[timeSlot] = true;
      }
    }

    // Fallback for remaining slots or if initial filtering was too strict
    while (dayActivities.length < activitiesPerDay && eligibleActivities.length > dayActivities.length) {
        const remainingActivities = eligibleActivities.filter(act => !usedActivityIds.has(act.id));
        if (remainingActivities.length > 0) {
            const activityToAdd = remainingActivities[0];
            dayActivities.push(activityToAdd);
            usedActivityIds.add(activityToAdd.id);
        } else {
            break; // No more unique activities
        }
    }

    days.push({
      day: i + 1,
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      activities: dayActivities,
      notes: i === 0 
        ? `Welcome to ${preferences.destination}! Take time to settle in and explore your accommodation area. Get ready for an amazing trip tailored to your ${preferences.travelStyle} style.` 
        : (i === preferences.duration - 1 
            ? `It's your last day in ${preferences.destination}! Enjoy your final activities and safe travels!` 
            : undefined)
    });
  }

  // Calculate total budget (consider group size)
  const totalBudget = days.reduce((total, day) => 
    total + day.activities.reduce((dayTotal, activity) => 
      dayTotal + activity.estimatedCost, 0
    ), 0
  ) * preferences.groupSize;

  return {
    destination: preferences.destination,
    duration: preferences.duration,
    totalBudget,
    days,
    preferences,
    createdAt: new Date().toISOString()
  };
};

// --- Export the geminiAgent object ---
export const geminiAgent = {
  parseNaturalLanguageQuery,
  generateItinerary,
};
