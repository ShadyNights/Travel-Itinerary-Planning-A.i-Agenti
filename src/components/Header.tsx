import React from 'react';
import { Plane, Home, Bookmark } from 'lucide-react';

interface HeaderProps {
  onBackToHome: () => void;
  currentView: 'home' | 'planning' | 'results';
  savedItinerariesCount: number;
}

const Header: React.FC<HeaderProps> = ({ onBackToHome, currentView, savedItinerariesCount }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Title */}
          {/* Changed div to a button for better semantic meaning and accessibility when it triggers an action (onBackToHome) */}
          <button
            className="flex items-center space-x-2 group transition-all duration-200 hover:scale-105"
            onClick={onBackToHome}
            // Added aria-label for screen reader users
            aria-label="Back to home page"
          >
            <div className="p-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-200">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">TravelAI</h1>
              <p className="text-xs text-slate-500">Intelligent Trip Planning</p>
            </div>
          </button>

          {/* Navigation */}
          {/* Using <nav> and <ul> for semantic navigation links */}
          <nav aria-label="Main Navigation" className="flex items-center space-x-4">
            <ul className="flex items-center space-x-4">
              {currentView !== 'home' && (
                <li> {/* Wrap nav items in list items for semantic correctness */}
                  <button
                    onClick={onBackToHome}
                    className="flex items-center space-x-1 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
                    aria-label="Go to Home" // Specific aria-label for this button
                  >
                    <Home className="h-4 w-4" />
                    <span className="text-sm font-medium">Home</span>
                  </button>
                </li>
              )}
              
              <li>
                {/* For saved itineraries, consider if this should be a button that opens a modal/page,
                    or just a display. If it's just a display, a div is fine.
                    If it's interactive, a button or anchor tag would be more appropriate.
                    Assuming it's a display for now. */}
                <div 
                  className="flex items-center space-x-1 px-3 py-2 text-slate-600 bg-slate-100 rounded-lg"
                  // Added an aria-live region if this count updates dynamically to inform screen readers
                  aria-live="polite" 
                >
                  <Bookmark className="h-4 w-4" />
                  <span className="text-sm font-medium">{savedItinerariesCount} Saved</span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
