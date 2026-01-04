'use server';

import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_INSTRUCTION = `You are a medical information assistant. Your goal is to provide clear, structured, and easy-to-understand information about medications for a user in Ethiopia.

You MUST respond with a valid JSON object only. Do not add any extra text, commentary, or markdown formatting like \`\`\`json.

The JSON object should have the following structure:
{
  "isMedicine": boolean, // true if the search term is a recognizable medicine, otherwise false.
  "medicineName": "string", // The corrected or standardized name of the medicine.
  "whatItIs": "string", // A simple, one-sentence explanation of what the medicine is.
  "usage": "string", // A simple explanation of what it's used to treat.
  "foodInstructions": "string", // Clear instructions on whether to take with or without food.
  "timeTaken": "string", // Typical frequency of when the medicine is taken (e.g., "every 8 hours").
  "sideEffects": ["string"], // An array of 3-5 common side effects.
  "localSummaryAmharic": "string", // A one-sentence summary in Amharic.
  "localSummaryOromo": "string" // A one-sentence summary in Afaan Oromo.
}

If the user's input is not a medicine, return a JSON object with "isMedicine": false and empty strings for all other fields.
Example for "Amoxicillin":
{
  "isMedicine": true,
  "medicineName": "Amoxicillin",
  "whatItIs": "An antibiotic used to treat bacterial infections.",
  "usage": "Used for infections like pneumonia, bronchitis, and infections of the ear, nose, throat, skin, or urinary tract.",
  "foodInstructions": "Can be taken with or without food, but taking it with food may reduce stomach upset.",
  "timeTaken": "Usually taken every 8 or 12 hours.",
  "sideEffects": ["Nausea", "Vomiting", "Diarrhea", "Rash", "Headache"],
  "localSummaryAmharic": "አሞክሲሲሊን ለሳንባ ምች፣ ለብሮንካይተስ እና ለጆሮ፣ ለአፍንጫ፣ ለጉሮሮ፣ ለቆዳ ወይም ለሽንት ቧንቧ ኢንፌክሽኖች የሚያገለግል አንቲባዮቲክ ነው።",
  "localSummaryOromo": "Amooksiliiniin qoricha farra baakteeriyaa kan infekshinii sombaa, bronkaayitii, fi gurraa, funyaanii, qoonqoo, gogaa, yookiin ujummoo fincaanii yaaluuf ooludha."
}
`;

function extractJson(text: string) {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (match && match[1]) {
    return match[1];
  }
  return text;
}


export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
  }

  try {
    const { searchTerm } = await req.json();

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [{
          parts: [{ text: `User searched for: "${searchTerm}"` }],
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    });
    
    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Gemini API Error:", errorBody);
        const errorMessage = errorBody?.error?.message || `Gemini API responded with status: ${response.status}`;
        throw new Error(errorMessage);
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      console.error("No content in Gemini response:", data);
      throw new Error('Failed to get a valid response from the AI.');
    }
    
    // The model should return JSON directly, but we parse it just in case
    const jsonData = JSON.parse(aiText);

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("Error in medicine-search API:", error);
    const message = (error as Error).message || 'An unknown error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
    