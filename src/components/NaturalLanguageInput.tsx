import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, Loader, Home } from 'lucide-react';
// 1. CHANGE THIS IMPORT LINE:
// import { geminiAgent } from '../services/geminiService';
// TO THIS:
// Assuming generateItineraryFromPreferences now also handles parsing and generation via Netlify Function
import { generateItineraryFromPreferences } from '../services/geminiService'; // Ensure this function handles parsing if needed

import { NaturalLanguageQuery, TravelPlan } from '../types/travel';

interface NaturalLanguageInputProps {
  onItineraryGenerated: (itinerary: TravelPlan) => void;
  onBackToHome: () => void;
}

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
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    setQuery('');

    setChatHistory(prev => [...prev, {
      type: 'user',
      message: currentQuery,
      timestamp: new Date()
    }]);

    const processingMessage: ChatMessage = {
      type: 'ai',
      message: 'Processing your request and generating the itinerary...',
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, processingMessage]);

    try {
      // 2. CHANGE THESE LINES:
      // You no longer call parseNaturalLanguageQuery separately on the client.
      // The Netlify Function (generateItineraryFromPreferences) should now handle
      // both parsing the natural language and generating the itinerary on the server.
      // So, you just pass the raw query string to your main itinerary generation function.
      const itinerary = await generateItineraryFromPreferences({ naturalLanguageQuery: currentQuery });

      // The intermediate message about 'Understood your preferences'
      // might be handled by the server response or removed,
      // as the client no longer directly parses.
      // For now, let's simplify and assume one AI response after processing.

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
            updatedHistory.push({
                type: 'ai',
                message: `Perfect! Your ${itinerary.duration}-day itinerary for ${itinerary.destination} is ready!`,
                timestamp: new Date()
            });
        }
        return updatedHistory;
      });

      onItineraryGenerated(itinerary);

    } catch (error) {
      console.error('Error processing query:', error);
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
    <div className="min-h-screen py-8 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 flex flex-col h-[60vh] max-h-[700px]">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-4 flex items-center space-x-2 flex-shrink-0">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">AI Travel Assistant</span>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            aria-live="polite"
            aria-atomic="false"
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
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words ${
                      message.type === 'user'
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-sky-100' : 'text-slate-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4 flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isProcessing ? "Generating..." : "e.g., Plan a 5-day trip to Tokyo in December for 2 people..."}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                disabled={isProcessing}
                aria-label="Enter your travel plan query"
              />
              <button
                type="submit"
                disabled={!query.trim() || isProcessing}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                aria-label={isProcessing ? "Processing your request" : "Send your query"}
              >
                {isProcessing ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{isProcessing ? "Processing" : "Send"}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Try these examples:</h3>
          <div className="grid gap-3">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-left p-3 border border-slate-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-all duration-200 text-sm text-slate-700"
                disabled={isProcessing}
                aria-label={`Try example: "${example}"`}
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-800 transition-colors duration-200"
            aria-label="Go back to home page"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NaturalLanguageInput;
