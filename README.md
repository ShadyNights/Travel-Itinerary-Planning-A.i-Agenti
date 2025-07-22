# AI-Powered Travel Itinerary Planning Agent

A sophisticated travel planning application powered by Google's Gemini AI that creates personalized travel itineraries through natural language processing and intelligent recommendations.

## 🌟 Features

### Core Functionality
- **Natural Language Processing**: Describe your trip in plain English (e.g., "Plan a 5-day romantic trip to Paris in December")
- **AI-Powered Itinerary Generation**: Uses Gemini AI to create detailed, personalized travel plans
- **Weather-Smart Planning**: Integrates weather forecasts to suggest appropriate activities
- **Multiple Planning Methods**: Choose between conversational AI chat or detailed form-based planning

### Advanced Features
- **PDF Export**: Download complete itineraries as professional PDF documents
- **Interactive Chat Interface**: Conversational planning experience with AI assistant
- **Weather Integration**: Real-time weather considerations for activity recommendations
- **Emergency Information**: Includes local emergency contacts, hospitals, and embassy information
- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)
- **Share Functionality**: Easy sharing of itineraries via links

### Output Formats
- **Web Interface**: Beautiful, interactive itinerary display
- **PDF Download**: Professional, printable travel documents
- **Chat Format**: Real-time conversational planning

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for development and building

### AI & Services
- **Google Gemini AI** for natural language processing and itinerary generation
- **jsPDF** for PDF generation
- **html2canvas** for HTML to PDF conversion

### Key Libraries
- `@google/generative-ai` - Gemini AI integration
- `jspdf` - PDF generation
- `html2canvas` - HTML to canvas conversion
- `date-fns` - Date manipulation
- `axios` - HTTP client

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Google Gemini AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travel-ai-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini AI API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Get your Gemini AI API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎯 Usage

### Natural Language Planning
1. Click "Chat with AI Planner" on the home page
2. Describe your trip in natural language:
   - "Plan a 5-day trip to Tokyo in December for 2 people"
   - "I want to explore Paris for a week, love food and culture"
   - "Family trip to Goa for 4 days, beach activities and relaxation"
3. The AI will parse your request and generate a personalized itinerary

### Form-Based Planning
1. Click "Detailed Form Planning"
2. Fill out your preferences:
   - Destination
   - Duration and dates
   - Budget range
   - Interests and activities
   - Travel style
   - Group size
3. Submit to generate your itinerary

### Export and Share
- **PDF Export**: Click the "PDF" button to download your itinerary
- **Share**: Use the "Share" button to share via native sharing or copy link
- **Save**: Save itineraries to your local collection

## 🏗️ Architecture

### Components Structure
```
src/
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── Hero.tsx                # Landing page hero section
│   ├── PlanningForm.tsx        # Form-based planning interface
│   ├── NaturalLanguageInput.tsx # Chat-based planning interface
│   └── ItineraryResults.tsx    # Results display and export
├── services/
│   ├── geminiService.ts        # Gemini AI integration
│   └── pdfService.ts          # PDF generation service
├── types/
│   └── travel.ts              # TypeScript type definitions
└── App.tsx                    # Main application component
```

### Key Services

#### GeminiService
- Natural language query parsing
- Itinerary generation with structured prompts
- Weather forecast integration
- Place details and recommendations

#### PDFService
- Professional PDF generation
- HTML to PDF conversion
- Custom formatting and styling

## 🌍 API Integration

### Gemini AI Endpoints
The application uses Gemini AI for:
- `/generate-itinerary` - Create detailed travel plans
- `/parse-query` - Extract structured data from natural language
- `/get-weather` - Weather forecasts and recommendations
- `/get-places` - Place details and information

### Data Flow
1. User input (natural language or form)
2. Query parsing and validation
3. Gemini AI prompt construction
4. AI response processing
5. Itinerary generation and display
6. Export functionality (PDF/Share)

## 🎨 Design Features

### Modern UI/UX
- **Apple-level design aesthetics** with attention to detail
- **Gradient backgrounds** and modern color schemes
- **Micro-interactions** and smooth animations
- **Responsive breakpoints** for all device sizes
- **Accessible design** with proper contrast ratios

### Color Palette
- Primary: Sky Blue (#0EA5E9) to Blue (#2563EB)
- Secondary: Emerald (#10B981) to Green (#059669)
- Accent: Orange (#F97316), Purple (#8B5CF6)
- Neutral: Slate grays for text and backgrounds

## 🔧 Configuration

### Environment Variables
```env
VITE_GEMINI_API_KEY=your_api_key_here
VITE_APP_URL=your_app_url_here
```

### Build Configuration
The app uses Vite for optimal performance:
- Hot module replacement in development
- Optimized production builds
- Tree shaking and code splitting
- Modern ES modules

## 📱 Mobile Responsiveness

- **Mobile-first design** approach
- **Touch-friendly interfaces** with proper spacing
- **Optimized layouts** for small screens
- **Fast loading** with optimized assets

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful natural language processing
- React and Vite communities for excellent development tools
- Tailwind CSS for beautiful, utility-first styling
- Lucide React for comprehensive icon library