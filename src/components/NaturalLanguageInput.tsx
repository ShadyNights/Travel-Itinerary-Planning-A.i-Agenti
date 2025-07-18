import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, Loader, Home } from 'lucide-react'; // Added Home icon for clarity
import { geminiAgent } from '../services/geminiService';
import { NaturalLanguageQuery, TravelPlan } from '../types/travel';

interface NaturalLanguageInputProps {
  onItineraryGenerated: (itinerary: TravelPlan) => void;
  onBackToHome: () => void;
}

// Define a type for chat messages for better clarity
type ChatMessage = {
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
};

const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({
  onItineraryGenerated,
  onBackToHome
}) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling chat

  // Scroll to the bottom of the chat history whenever it updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const exampleQueries = [
    "Plan a 5-day romantic trip to Paris in December for 2 people with a mid-range budget",
    "I want to explore Tokyo for 7 days, love food and culture, budget-friendly options",
    "Plan a 3-day adventure trip to Manali in March, interested in trekking and local cuisine",
    "Family trip to Goa for 4 days, 2 adults and 2 kids, beach activities and relaxation"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentQuery = query.trim();
    if (!currentQuery || isProcessing) return;

    setIsProcessing(true);
    setQuery(''); // Clear input immediately after submission

    // Add user message to chat history
    setChatHistory(prev => [...prev, {
      type: 'user',
      message: currentQuery,
      timestamp: new Date()
    }]);

    // Add a placeholder AI message indicating processing
    const processingMessage: ChatMessage = {
      type: 'ai',
      message: 'Processing your request and generating the itinerary...',
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, processingMessage]);

    try {
      // Step 1: Parse natural language query
      const parsedQuery: NaturalLanguageQuery = await geminiAgent.parseNaturalLanguageQuery(currentQuery);
      
      // Update the processing message or add a new one after parsing
      setChatHistory(prev => {
        const updatedHistory = [...prev];
        // Find and update the processing message if it exists, or add a new one
        const lastAiMessageIndex = updatedHistory.findLastIndex(msg => msg.type === 'ai');
        if (lastAiMessageIndex !== -1 && updatedHistory[lastAiMessageIndex].message === processingMessage.message) {
            updatedHistory[lastAiMessageIndex] = { ...updatedHistory[lastAiMessageIndex], message: 'Understood your travel preferences. Generating your personalized itinerary now!' };
        } else {
            updatedHistory.push({ type: 'ai', message: 'Understood your travel preferences. Generating your personalized itinerary now!', timestamp: new Date() });
        }
        return updatedHistory;
      });

      // Prepare preferences for itinerary generation, ensuring defaults for potentially missing data
      const preferences = {
        destination: parsedQuery.extractedInfo?.destination || '',
        duration: parsedQuery.extractedInfo?.duration || 3,
        // Ensure budget is correctly typed. Assuming 'mid-range' as default string.
        budget: parsedQuery.extractedInfo?.budget as 'budget-friendly' | 'mid-range' | 'luxury' || 'mid-range', 
        interests: parsedQuery.extractedInfo?.interests || [],
        travelStyle: parsedQuery.extractedInfo?.travelStyle || 'moderate', // Use extracted travel style or default
        groupSize: parsedQuery.extractedInfo?.groupSize || 2,
        accommodation: parsedQuery.extractedInfo?.accommodation || 'hotel', // Use extracted accommodation or default
        startDate: parsedQuery.extractedInfo?.startDate,
        specificRequests: parsedQuery.extractedInfo?.specificRequests?.join(', ') || ''
      };

      // Step 2: Generate itinerary
      const itinerary = await geminiAgent.generateItinerary(preferences);
      
      // Replace the last AI message with the success message
      setChatHistory(prev => {
        const updatedHistory = [...prev];
        const lastAiMessageIndex = updatedHistory.findLastIndex(msg => msg.type === 'ai');
        if (lastAiMessageIndex !== -1) {
          updatedHistory[lastAiMessageIndex] = {
            type: 'ai',
            message: `Perfect! I've created a ${itinerary.duration}-day itinerary for ${itinerary.destination}. Your personalized travel plan is ready!`,
            timestamp: new Date()
          };
        } else {
            // Fallback: If for some reason the processing message wasn't added, add this success message
            updatedHistory.push({
                type: 'ai',
                message: `Perfect! Your ${itinerary.duration}-day itinerary for ${itinerary.destination} is ready!`,
                timestamp: new Date()
            });
        }
        return updatedHistory;
      });

      // Pass the generated itinerary to the parent component
      onItineraryGenerated(itinerary);
      
    } catch (error) {
      console.error('Error processing query:', error);
      // Update the last AI message with an error, or add a new one
      setChatHistory(prev => {
        const updatedHistory = [...prev];
        const lastAiMessageIndex = updatedHistory.findLastIndex(msg => msg.type === 'ai');
        if (lastAiMessageIndex !== -1) {
          updatedHistory[lastAiMessageIndex] = {
            type: 'ai',
            message: 'I apologize, but I encountered an error while creating your itinerary. Please try again with a different query, or try the Detailed Form Planning.',
            timestamp: new Date()
          };
        } else {
            // Fallback if no AI message was added previously
            updatedHistory.push({
                type: 'ai',
                message: 'I apologize, but I encountered an error. Please try again or switch to form planning.',
                timestamp: new Date()
            });
        }
        return updatedHistory;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    // Optionally trigger submit immediately after clicking an example
    // handleSubmit(new Event('submit') as React.FormEvent);
  };

  return (
    <div className="min-h-screen py-8 bg-slate-50"> {/* Added subtle background for visual separation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-100 to-blue-100 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-sky-600" />
            <span className="text-sky-800 text-sm font-medium">AI-Powered Natural Language Planning</span>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Tell Me About Your Dream Trip
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Just describe your travel plans in plain English, and I'll create a personalized itinerary for you.
          </p>
        </div>

        {/* Chat Interface Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 flex flex-col h-[60vh] max-h-[700px]"> {/* Fixed height for chat */}
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-4 flex items-center space-x-2 flex-shrink-0">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">AI Travel Assistant</span>
          </div>

          {/* Chat Messages Display Area */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            aria-live="polite" // Announce changes to screen readers
            aria-atomic="false" // Announce only the changed region, not the entire content
          >
            {chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-sky-600" />
                </div>
                <p className="text-slate-600">Start a conversation by describing your travel plans!</p>
                <p className="text-slate-500 text-sm mt-2">Example: "Plan a 10-day family trip to Thailand with a moderate budget, focusing on beaches and cultural sites."</p>
              </div>
            ) : (
              chatHistory.map((message, index) => (
                <div
                  key={index} // Using index is okay here as messages are only added, not reordered
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words ${ // Added break-words for long messages
                      message.type === 'user'
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-sky-100' : 'text-slate-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {/* Nicer time format */}
                    </p>
                  </div>
                </div>
              ))
            )}
            {/* Scroll target for new messages */}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4 flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isProcessing ? "Generating..." : "e.g., Plan a 5-day trip to Tokyo in December for 2 people..."}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" // Added outline-none for better focus ring
                disabled={isProcessing}
                aria-label="Enter your travel plan query" // Added for accessibility
              />
              <button
                type="submit"
                disabled={!query.trim() || isProcessing}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                aria-label={isProcessing ? "Processing your request" : "Send your query"} // Dynamic aria-label
              >
                {isProcessing ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {/* Optional: Add text for better mobile UX */}
                <span className="hidden sm:inline">{isProcessing ? "Processing" : "Send"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Example Queries */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Try these examples:</h3>
          <div className="grid gap-3">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-left p-3 border border-slate-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-all duration-200 text-sm text-slate-700"
                disabled={isProcessing}
                aria-label={`Try example: "${example}"`} // Added for accessibility
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-800 transition-colors duration-200"
            aria-label="Go back to home page" // Added for accessibility
          >
            <Home className="h-4 w-4" /> {/* Changed arrow to Home icon for consistency with Header */}
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NaturalLanguageInput;
