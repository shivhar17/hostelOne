import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const suggestIssueCategory = async (description: string): Promise<string> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini");
    return "Others";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helper for a hostel maintenance app. 
      Analyze the following issue description and categorize it into exactly one of these categories: 
      'Electricity', 'Water', 'Cleaning', 'Room Repairs', 'Mess Complaint', 'Others'.
      
      Description: "${description}"
      
      Return ONLY the category name.`,
    });
    
    const text = response.text?.trim();
    return text || "Others";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Others";
  }
};

export const getNutritionalInfo = async (mealItems: string[]): Promise<string> => {
  if (!apiKey) return "Nutritional info unavailable (API Key missing).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a very brief (1-2 sentences) nutritional summary for a meal consisting of: ${mealItems.join(', ')}. Focus on protein and energy.`,
    });
    return response.text?.trim() || "No info available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not fetch nutritional info.";
  }
};
