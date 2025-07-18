import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'; // Keep if you intend to use the HTML export method
import { TravelPlan } from '../types/travel';

export class PDFExportService {
  /**
   * Exports a structured TravelPlan object directly to a PDF document.
   * This method provides fine-grained control over layout, fonts, and text rendering.
   * @param itinerary The TravelPlan object to export.
   */
  async exportItineraryToPDF(itinerary: TravelPlan): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' for paper size
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20; // Starting Y position from top of the page
    const marginX = 20; // Left/Right margin
    const contentWidth = pageWidth - (2 * marginX); // Usable width for content

    // --- Helper function for adding new pages ---
    const addNewPage = () => {
      pdf.addPage();
      yPosition = 20; // Reset Y position for new page
    };

    // --- Helper for text and managing page breaks ---
    const addTextWithPageBreak = (text: string | string[], fontSize: number, fontStyle: 'normal' | 'bold' | 'italic', x: number, yOffset: number, maxWidth = contentWidth): number => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      
      const lines = Array.isArray(text) ? text : pdf.splitTextToSize(text, maxWidth);
      
      let currentY = yPosition;
      for (const line of lines) {
        if (currentY + yOffset > pageHeight - 20) { // Check for space, leave some bottom margin
          addNewPage();
          currentY = yPosition; // Reset currentY for the new page
        }
        pdf.text(line, x, currentY);
        currentY += yOffset; // Increment Y position for the next line
      }
      return currentY; // Return the new Y position
    };

    // --- Header / Title ---
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Travel Itinerary: ${itinerary.destination}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // --- Trip Overview ---
    yPosition = addTextWithPageBreak('Trip Overview', 16, 'bold', marginX, 10); // Update yPosition
    yPosition = addTextWithPageBreak(`Duration: ${itinerary.duration} days`, 12, 'normal', marginX, 6);
    yPosition = addTextWithPageBreak(`Total Budget: $${itinerary.totalBudget.toLocaleString()}`, 12, 'normal', marginX, 6); // Format currency
    yPosition = addTextWithPageBreak(`Travel Style: ${itinerary.preferences.travelStyle}`, 12, 'normal', marginX, 6);
    yPosition = addTextWithPageBreak(`Group Size: ${itinerary.preferences.groupSize} people`, 12, 'normal', marginX, 6);
    
    // Add interests
    if (itinerary.preferences.interests && itinerary.preferences.interests.length > 0) {
      yPosition = addTextWithPageBreak(`Interests: ${itinerary.preferences.interests.join(', ')}`, 12, 'normal', marginX, 6);
    }
    yPosition += 10; // Add some space

    // --- Weather Summary ---
    if (itinerary.weatherSummary) {
      yPosition = addTextWithPageBreak('Weather Overview', 14, 'bold', marginX, 8);
      yPosition = addTextWithPageBreak(itinerary.weatherSummary, 10, 'normal', marginX, 4, contentWidth); // Auto-wrap
      yPosition += 10;
    }

    // --- Travel Tips ---
    if (itinerary.travelTips && itinerary.travelTips.length > 0) {
      yPosition = addTextWithPageBreak('General Travel Tips', 14, 'bold', marginX, 8);
      itinerary.travelTips.forEach((tip, index) => {
        yPosition = addTextWithPageBreak(`${index + 1}. ${tip}`, 10, 'normal', marginX, 4, contentWidth);
      });
      yPosition += 10;
    }

    // --- Daily Itinerary ---
    itinerary.days.forEach((day, dayIndex) => {
      // Ensure enough space for day header + first activity, or add new page
      if (yPosition > pageHeight - 50) { // Increased threshold for day header
        addNewPage();
      }

      // Day Header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Day ${day.day} - ${day.date}`, marginX, yPosition);
      yPosition += 8;

      // Daily Weather Info
      if (day.weather && day.weather.condition) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        const tempUnit = day.weather.temperature?.unit || '°C'; // Default to °C if not specified
        pdf.text(`Weather: ${day.weather.condition} (${day.weather.temperature?.min || 'N/A'}${tempUnit}-${day.weather.temperature?.max || 'N/A'}${tempUnit})`, marginX, yPosition);
        yPosition += 5;
        if (day.weather.recommendation) {
            yPosition = addTextWithPageBreak(`Recommendation: ${day.weather.recommendation}`, 9, 'italic', marginX, 4, contentWidth);
        }
        yPosition += 5;
      }
      
      // Daily Notes
      if (day.notes) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        yPosition = addTextWithPageBreak(`Notes for the day: ${day.notes}`, 10, 'italic', marginX, 4, contentWidth);
        yPosition += 5;
      }

      // Activities
      day.activities.forEach((activity) => {
        // Check for space before adding activity details
        if (yPosition > pageHeight - 40) { // Space needed for activity block
          addNewPage();
        }

        // Activity Time Slot & Name
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${activity.timeSlot ? activity.timeSlot.toUpperCase() + ': ' : ''}${activity.name}`, marginX + 5, yPosition);
        yPosition += 6;

        // Activity details
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        yPosition = addTextWithPageBreak(activity.description, 10, 'normal', marginX + 5, 4, contentWidth - 10);
        
        pdf.text(`Location: ${activity.location}`, marginX + 5, yPosition);
        yPosition += 4;
        pdf.text(`Duration: ${activity.duration} | Cost: $${activity.estimatedCost.toLocaleString()}`, marginX + 5, yPosition);
        
        // Add rating if available
        if (activity.rating) {
            pdf.text(` | Rating: ${activity.rating}/5`, marginX + 5 + pdf.getStringUnitWidth(`Duration: ${activity.duration} | Cost: $${activity.estimatedCost.toLocaleString()}`) * 10, yPosition); // Append to previous line
        }
        yPosition += 8; // Space after activity block
      });

      // Daily Total Cost (per person)
      if (day.dailyCost > 0) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Daily Cost (per person): $${day.dailyCost.toLocaleString()}`, marginX, yPosition);
        yPosition += 8;
      }

      // Daily Travel Tips
      if (day.dailyTravelTips && day.dailyTravelTips.length > 0) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        yPosition = addTextWithPageBreak('Daily Tips:', 10, 'italic', marginX, 5); // Added a small header
        day.dailyTravelTips.forEach(tip => {
            yPosition = addTextWithPageBreak(`• ${tip}`, 10, 'normal', marginX + 5, 4, contentWidth - 5);
        });
        yPosition += 5;
      }

      yPosition += 10; // Space between days
    });

    // --- Emergency Information ---
    if (itinerary.emergencyInfo && (itinerary.emergencyInfo.contacts?.length > 0 || itinerary.emergencyInfo.hospitals?.length > 0 || itinerary.emergencyInfo.embassies?.length > 0)) {
      if (yPosition > pageHeight - 80) { // Check space
        addNewPage();
      }

      yPosition = addTextWithPageBreak('Emergency Information', 16, 'bold', marginX, 10);

      if (itinerary.emergencyInfo.contacts && itinerary.emergencyInfo.contacts.length > 0) {
        yPosition = addTextWithPageBreak('Emergency Contacts:', 12, 'bold', marginX, 6);
        itinerary.emergencyInfo.contacts.forEach(contact => {
          yPosition = addTextWithPageBreak(`• ${contact}`, 10, 'normal', marginX + 5, 4, contentWidth - 5);
        });
        yPosition += 5;
      }

      if (itinerary.emergencyInfo.hospitals && itinerary.emergencyInfo.hospitals.length > 0) {
        yPosition = addTextWithPageBreak('Hospitals:', 12, 'bold', marginX, 6);
        itinerary.emergencyInfo.hospitals.forEach(hospital => {
          yPosition = addTextWithPageBreak(`• ${hospital}`, 10, 'normal', marginX + 5, 4, contentWidth - 5);
        });
        yPosition += 5;
      }

      if (itinerary.emergencyInfo.embassies && itinerary.emergencyInfo.embassies.length > 0) {
        yPosition = addTextWithPageBreak('Embassies:', 12, 'bold', marginX, 6);
        itinerary.emergencyInfo.embassies.forEach(embassy => {
          yPosition = addTextWithPageBreak(`• ${embassy}`, 10, 'normal', marginX + 5, 4, contentWidth - 5);
        });
        yPosition += 5;
      }
    }

    // --- Footer for all pages ---
    const pageCount = pdf.internal.pages.length - 1; // Correct page count
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated by TravelAI - Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Save the PDF
    const fileName = `${itinerary.destination.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary_${new Date().toLocaleDateString('en-CA').replace(/-/g, '')}.pdf`;
    pdf.save(fileName);
    console.log(`PDF saved as: ${fileName}`);
  }

  /**
   * Exports an HTML element as an image to a PDF document.
   * This method is useful for capturing the exact visual rendering of a complex HTML structure,
   * but may result in larger file sizes and less crisp text than direct drawing.
   * @param elementId The ID of the HTML element to convert.
   * @param filename The desired filename for the PDF.
   */
  async exportItineraryFromHTML(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID "${elementId}" not found for PDF export.`);
      throw new Error('Element not found for PDF export');
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff', // Ensure a white background
        scrollY: -window.scrollY, // Correct scrolling issue
        windowWidth: document.documentElement.offsetWidth, // Ensure full width captured
        windowHeight: document.documentElement.offsetHeight, // Ensure full height captured
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm (corrected from 295)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0; // Top position for the image on the PDF page

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages for remaining content if the image is taller than one page
      while (heightLeft > -1) { // Changed to > -1 to capture last bit of content
        position = heightLeft - imgHeight; // Calculate position for the next page segment
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
      console.log(`PDF from HTML saved as: ${filename}`);
    } catch (error) {
      console.error('Error generating PDF from HTML:', error);
      throw new Error(`Failed to generate PDF from HTML: ${(error as Error).message}`);
    }
  }
}

export const pdfService = new PDFExportService();
