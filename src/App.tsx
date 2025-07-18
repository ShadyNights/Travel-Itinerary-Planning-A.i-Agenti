import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PlanningForm from './components/PlanningForm';
import NaturalLanguageInput from './components/NaturalLanguageInput';
import ItineraryResults from './components/ItineraryResults';
import SavedItineraries from './components/SavedItineraries'; // New component for displaying saved itineraries
import { TravelPlan } from './types/travel';

// Firebase imports
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  deleteDoc, 
  doc,
  Firestore 
} from 'firebase/firestore';

function App() {
  // State for managing application views
  const [currentView, setCurrentView] = useState<'home' | 'planning' | 'natural-language' | 'results' | 'saved-itineraries'>('home');
  // State for the currently generated itinerary
  const [currentItinerary, setCurrentItinerary] = useState<TravelPlan | null>(null);
  // State for all saved itineraries, fetched from Firestore
  const [savedItineraries, setSavedItineraries] = useState<TravelPlan[]>([]);

  // Firebase states
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // To track Firebase auth readiness
  const [isLoading, setIsLoading] = useState(true); // Overall loading for Firebase init

  // Access global variables provided by the Canvas environment
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  // --- Firebase Initialization and Authentication ---
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const authInstance = getAuth(app);

        setFirebaseApp(app);
        setDb(firestore);
        setAuth(authInstance);

        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
          if (user) {
            setUserId(user.uid);
          } else {
            // Sign in anonymously if no user is logged in
            try {
              if (initialAuthToken) {
                await signInWithCustomToken(authInstance, initialAuthToken);
              } else {
                await signInAnonymously(authInstance);
              }
            } catch (authError) {
              console.error("Firebase Auth Error:", authError);
              // Handle auth error gracefully, e.g., show a message to the user
            }
          }
          setIsAuthReady(true); // Auth state is now known
          setIsLoading(false); // Finished loading Firebase
        });

        return () => unsubscribe(); // Cleanup auth listener on unmount
      } catch (error) {
        console.error("Failed to initialize Firebase:", error);
        setIsLoading(false); // Stop loading even if init fails
        // Potentially show an error message to the user
      }
    };

    initFirebase();
  }, [appId, firebaseConfig, initialAuthToken]); // Re-run if these global vars change

  // --- Firestore Listener for Saved Itineraries ---
  useEffect(() => {
    if (!db || !userId || !isAuthReady) {
      // Only set up listener if Firebase is ready and userId is available
      return;
    }

    // Define the collection path for user-specific saved itineraries
    const itinerariesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/savedItineraries`);
    const q = query(itinerariesCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itineraries: TravelPlan[] = [];
      snapshot.forEach((doc) => {
        // Ensure data matches TravelPlan structure and add Firestore doc ID
        itineraries.push({ id: doc.id, ...doc.data() } as TravelPlan);
      });
      setSavedItineraries(itineraries);
      console.log("Saved itineraries updated from Firestore:", itineraries);
    }, (error) => {
      console.error("Error fetching saved itineraries:", error);
      // Handle real-time listener errors
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [db, userId, isAuthReady, appId]); // Re-run when db, userId, or auth status changes

  // --- View Navigation Handlers ---
  const handleStartPlanning = () => {
    setCurrentView('planning');
  };

  const handleStartNaturalLanguagePlanning = () => {
    setCurrentView('natural-language');
  };

  const handleItineraryGenerated = (itinerary: TravelPlan) => {
    setCurrentItinerary(itinerary);
    setCurrentView('results');
  };

  const handleSaveItinerary = async (itinerary: TravelPlan) => {
    if (!db || !userId) {
      console.error("Firestore not initialized or user not authenticated.");
      alert("Cannot save itinerary. Please ensure you are logged in or try again later.");
      return;
    }
    try {
      // Remove the local 'id' as Firestore will generate its own document ID
      const { id, ...itineraryToSave } = itinerary; 
      const docRef = await addDoc(collection(db, `artifacts/${appId}/users/${userId}/savedItineraries`), itineraryToSave);
      console.log("Itinerary saved with ID:", docRef.id);
      alert("Itinerary saved successfully!");
    } catch (error) {
      console.error("Error saving itinerary to Firestore:", error);
      alert("Failed to save itinerary. Please try again.");
    }
  };

  const handleDeleteItinerary = async (itineraryId: string) => {
    if (!db || !userId) {
      console.error("Firestore not initialized or user not authenticated.");
      alert("Cannot delete itinerary. Please try again later.");
      return;
    }
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/savedItineraries`, itineraryId));
      console.log("Itinerary deleted:", itineraryId);
      alert("Itinerary deleted successfully!");
    } catch (error) {
      console.error("Error deleting itinerary from Firestore:", error);
      alert("Failed to delete itinerary. Please try again.");
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentItinerary(null); // Clear current itinerary when going home
  };

  const handleBackToPlanning = () => {
    setCurrentView('planning');
  };

  const handleSwitchToNaturalLanguage = () => {
    setCurrentView('natural-language');
  };

  const handleViewSavedItineraries = () => {
    setCurrentView('saved-itineraries');
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500"></div>
          <p className="text-lg text-slate-700">Loading TravelAI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
        onBackToHome={handleBackToHome}
        currentView={currentView}
        savedItinerariesCount={savedItineraries.length}
        onViewSavedItineraries={handleViewSavedItineraries} // Pass handler to Header
      />
      
      {currentView === 'home' && (
        <Hero 
          onStartPlanning={handleStartPlanning}
          onStartNaturalLanguagePlanning={handleStartNaturalLanguagePlanning}
        />
      )}
      
      {currentView === 'planning' && (
        <PlanningForm 
          onItineraryGenerated={handleItineraryGenerated}
          onBackToHome={handleBackToHome}
          onSwitchToNaturalLanguage={handleSwitchToNaturalLanguage}
        />
      )}
      
      {currentView === 'natural-language' && (
        <NaturalLanguageInput 
          onItineraryGenerated={handleItineraryGenerated}
          onBackToHome={handleBackToHome}
        />
      )}
      
      {currentView === 'results' && currentItinerary && (
        <ItineraryResults 
          itinerary={currentItinerary}
          onSaveItinerary={handleSaveItinerary}
          onBackToPlanning={handleBackToPlanning}
          onBackToHome={handleBackToHome}
        />
      )}

      {currentView === 'saved-itineraries' && (
        <SavedItineraries
          savedItineraries={savedItineraries}
          onBackToHome={handleBackToHome}
          onViewItinerary={setCurrentItinerary} // Allow viewing a saved itinerary
          onDeleteItinerary={handleDeleteItinerary} // Allow deleting a saved itinerary
          onSwitchToResultsView={() => setCurrentView('results')} // Helper to switch to results view
        />
      )}
    </div>
  );
}

export default App;
