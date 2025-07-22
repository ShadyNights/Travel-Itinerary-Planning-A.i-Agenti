import React from 'react';
import { TravelPlan } from '../types/travel'; // Adjust path if types/travel.ts is elsewhere
// import { Button } from './ui/button'; // REMOVED: This import is no longer needed

interface SavedItinerariesProps {
  savedItineraries: TravelPlan[];
  onBackToHome: () => void;
  onViewItinerary: (itinerary: TravelPlan | null) => void;
  onDeleteItinerary: (id: string) => void;
  onSwitchToResultsView: () => void;
}

const SavedItineraries: React.FC<SavedItinerariesProps> = ({
  savedItineraries,
  onBackToHome,
  onViewItinerary,
  onDeleteItinerary,
  onSwitchToResultsView,
}) => {
  const handleView = (itinerary: TravelPlan) => {
    onViewItinerary(itinerary);
    onSwitchToResultsView(); // Switch view to results to display this itinerary
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl min-h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800">Your Saved Itineraries</h2>
        {/* Replaced <Button> with native <button> */}
        <button
          onClick={onBackToHome}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md"
        >
          Back to Home
        </button>
      </div>

      {savedItineraries.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-lg shadow-sm">
          <p className="text-lg text-gray-600">You haven't saved any itineraries yet.</p>
          <p className="text-md text-gray-500 mt-2">Start planning a new adventure!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {savedItineraries.map((itinerary) => (
            <div key={itinerary.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center transition transform hover:scale-[1.01] hover:shadow-lg">
              <div>
                <h3 className="text-xl font-semibold text-blue-700">{itinerary.destination}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {itinerary.duration} days | Budget: ${itinerary.totalBudget.toLocaleString()} | Group Size: {itinerary.preferences.groupSize}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Saved on: {itinerary.id ? new Date(parseInt(itinerary.id)).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="flex space-x-3">
                {/* Replaced <Button> with native <button> */}
                <button
                  onClick={() => handleView(itinerary)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  View
                </button>
                {/* Replaced <Button> with native <button> */}
                <button
                  onClick={() => onDeleteItinerary(itinerary.id!)} // Assuming ID will always be present for saved items
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItineraries;
