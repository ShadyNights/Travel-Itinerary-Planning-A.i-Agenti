import React, { useState } from 'react';
import { MapPin, Calendar, DollarSign, Users, ArrowLeft, Sparkles, MessageSquare, Home } from 'lucide-react'; // Added Home icon
import { TravelPreferences, TravelPlan } from '../types/travel';
import { geminiAgent } from '../services/geminiService';

interface PlanningFormProps {
  onItineraryGenerated: (itinerary: TravelPlan) => void;
  onBackToHome: () => void;
  onSwitchToNaturalLanguage: () => void;
}

const PlanningForm: React.FC<PlanningFormProps> = ({ 
  onItineraryGenerated, 
  onBackToHome, 
  onSwitchToNaturalLanguage 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferences, setPreferences] = useState<TravelPreferences>({
    destination: '',
    duration: 3,
    budget: 'mid-range',
    interests: [],
    travelStyle: 'moderate',
    groupSize: 2,
    accommodation: 'hotel',
    // startDate will be undefined initially, which is fine as it's optional
  });

  const interestOptions = [
    'Culture & History', 'Adventure & Sports', 'Food & Dining', 'Nature & Wildlife',
    'Art & Museums', 'Nightlife', 'Shopping', 'Photography', 'Beach & Water Sports',
    'Local Experiences', 'Wellness & Spa', 'Architecture', 'Religious Sites', 'Markets & Bazaars'
  ];

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences.destination.trim()) {
      alert('Please tell me your destination before generating an itinerary!');
      return;
    }

    setIsGenerating(true);
    try {
      const itinerary = await geminiAgent.generateItinerary(preferences);
      onItineraryGenerated(itinerary);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      // Provide more specific feedback than a generic alert
      alert('Oops! There was an issue generating your itinerary. Please check your internet connection or try adjusting your preferences and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-slate-50"> {/* Added subtle background for visual separation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          {/* Back to Home Button */}
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 mb-6"
            aria-label="Back to home page" // Added for accessibility
          >
            <Home className="h-4 w-4" /> {/* Changed ArrowLeft to Home for consistency */}
            <span>Back to Home</span>
          </button>
          
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Plan Your Perfect Trip</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Fill out your travel preferences below, or switch to our AI-powered natural language planner for a more conversational experience.
            </p>
            
            {/* Switch to Natural Language Button */}
            <button
              onClick={onSwitchToNaturalLanguage}
              className="mt-4 inline-flex items-center space-x-2 text-sky-600 hover:text-sky-700 font-medium transition-colors duration-200"
              aria-label="Switch to natural language planning" // Added for accessibility
            >
              <MessageSquare className="h-4 w-4" />
              <span>Try Natural Language Planning Instead</span>
            </button>
          </div>
        </div>

        {/* Planning Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Destination */}
          <div>
            <label htmlFor="destination-input" className="flex items-center space-x-2 text-lg font-semibold text-slate-800 mb-4">
              <MapPin className="h-5 w-5 text-sky-500" />
              <span>Where would you like to go? <span className="text-red-500">*</span></span> {/* Added required indicator */}
            </label>
            <input
              id="destination-input" // Added id for label association
              type="text"
              value={preferences.destination}
              onChange={(e) => setPreferences(prev => ({ ...prev, destination: e.target.value }))}
              placeholder="e.g., Tokyo, Japan or Paris, France"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 outline-none" // Added outline-none
              required
              aria-required="true" // Added for accessibility
            />
          </div>

          {/* Start Date and Trip Duration */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start-date-input" className="flex items-center space-x-2 text-lg font-semibold text-slate-800 mb-4">
                <Calendar className="h-5 w-5 text-emerald-500" />
                <span>Start Date (Optional)</span>
              </label>
              <input
                id="start-date-input" // Added id for label association
                type="date"
                value={preferences.startDate || ''}
                onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
            
            <div>
              <label htmlFor="duration-select" className="flex items-center space-x-2 text-lg font-semibold text-slate-800 mb-4">
                <Calendar className="h-5 w-5 text-emerald-500" />
                <span>Trip Duration</span>
              </label>
              <select
                id="duration-select" // Added id for label association
                value={preferences.duration}
                onChange={(e) => setPreferences(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 outline-none"
              >
                {[...Array(14)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i + 1 === 1 ? 'day' : 'days'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Group Size */}
          <div>
            <label htmlFor="group-size-select" className="flex items-center space-x-2 text-lg font-semibold text-slate-800 mb-4">
              <Users className="h-5 w-5 text-purple-500" />
              <span>Group Size</span>
            </label>
            <select
              id="group-size-select" // Added id for label association
              value={preferences.groupSize}
              onChange={(e) => setPreferences(prev => ({ ...prev, groupSize: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? 'person' : 'people'}
                </option>
              ))}
            </select>
          </div>

          {/* Special Requests */}
          <div>
            <label htmlFor="special-requests-textarea" className="text-lg font-semibold text-slate-800 mb-4 block">
              Special Requests or Preferences (Optional)
            </label>
            <textarea
              id="special-requests-textarea" // Added id for label association
              value={preferences.specificRequests || ''}
              onChange={(e) => setPreferences(prev => ({ ...prev, specificRequests: e.target.value }))}
              placeholder="e.g., vegetarian food options, accessible venues, romantic spots, family-friendly activities..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 resize-none outline-none"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="flex items-center space-x-2 text-lg font-semibold text-slate-800 mb-4">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span>Budget Range</span>
            </label>
            <div role="radiogroup" aria-labelledby="budget-label" className="grid grid-cols-3 gap-4"> {/* Added ARIA role */}
              {/* Invisible label for ARIA */}
              <span id="budget-label" className="sr-only">Select your budget range</span>
              {[
                { value: 'budget', label: 'Budget', desc: 'Economical options' },
                { value: 'mid-range', label: 'Mid-Range', desc: 'Balanced comfort & cost' },
                { value: 'luxury', label: 'Luxury', desc: 'Premium experiences' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreferences(prev => ({ ...prev, budget: option.value as any }))} // Type assertion for budget
                  className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
                    preferences.budget === option.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                  role="radio" // Added ARIA role
                  aria-checked={preferences.budget === option.value} // Added ARIA checked state
                  aria-label={`${option.label} budget: ${option.desc}`} // Enhanced ARIA label
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="text-lg font-semibold text-slate-800 mb-4 block">Travel Style</label>
            <div role="radiogroup" aria-labelledby="travel-style-label" className="grid grid-cols-3 gap-4"> {/* Added ARIA role */}
              {/* Invisible label for ARIA */}
              <span id="travel-style-label" className="sr-only">Select your preferred travel style</span>
              {[
                { value: 'relaxed', label: 'Relaxed', desc: 'Slow pace, plenty of rest' },
                { value: 'moderate', label: 'Moderate', desc: 'Balanced activities & downtime' },
                { value: 'packed', label: 'Packed', desc: 'Action-packed, see everything' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreferences(prev => ({ ...prev, travelStyle: option.value as any }))} // Type assertion for travelStyle
                  className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
                    preferences.travelStyle === option.value
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                  role="radio" // Added ARIA role
                  aria-checked={preferences.travelStyle === option.value} // Added ARIA checked state
                  aria-label={`${option.label} travel style: ${option.desc}`} // Enhanced ARIA label
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="text-lg font-semibold text-slate-800 mb-4 block">
              What interests you? (Select all that apply)
            </label>
            <div role="group" aria-labelledby="interests-label" className="grid grid-cols-2 md:grid-cols-3 gap-3"> {/* Added ARIA role */}
              {/* Invisible label for ARIA */}
              <span id="interests-label" className="sr-only">Select your interests</span>
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    preferences.interests.includes(interest)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                  role="checkbox" // Added ARIA role
                  aria-checked={preferences.interests.includes(interest)} // Added ARIA checked state
                  aria-label={`Toggle interest: ${interest}`} // Added ARIA label
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Accommodation */}
          <div>
            <label className="text-lg font-semibold text-slate-800 mb-4 block">Preferred Accommodation</label>
            <div role="radiogroup" aria-labelledby="accommodation-label" className="grid grid-cols-2 md:grid-cols-4 gap-4"> {/* Added ARIA role */}
              {/* Invisible label for ARIA */}
              <span id="accommodation-label" className="sr-only">Select your preferred accommodation type</span>
              {[
                { value: 'hostel', label: 'Hostel' },
                { value: 'hotel', label: 'Hotel' },
                { value: 'resort', label: 'Resort' },
                { value: 'airbnb', label: 'Airbnb' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreferences(prev => ({ ...prev, accommodation: option.value as any }))} // Type assertion for accommodation
                  className={`p-3 border-2 rounded-lg text-center font-medium transition-all duration-200 ${
                    preferences.accommodation === option.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                  role="radio" // Added ARIA role
                  aria-checked={preferences.accommodation === option.value} // Added ARIA checked state
                  aria-label={`${option.label} accommodation`} // Added ARIA label
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isGenerating || !preferences.destination.trim()}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-3"
              aria-label={isGenerating ? "Generating itinerary" : "Generate my itinerary"} // Dynamic aria-label
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" role="status"></div> {/* Added ARIA role */}
                  <span>Generating Your Perfect Itinerary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Generate My Itinerary</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanningForm;
