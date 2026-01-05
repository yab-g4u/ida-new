
'use server';

import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const getSystemInstruction = (language: string) => {
  const langMap: Record<string, string> = {
    am: 'Amharic',
    om: 'Afaan Oromo',
    en: 'English',
  };
  const langName = langMap[language] || 'the user\'s specified language';
  
  return `You are a medical information assistant. Your goal is to provide clear, structured, and easy-to-understand information about medications for a user in Ethiopia.

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
  "localSummary": "string" // A one-sentence summary in the requested language (${langName}).
}

If the user's input is not a medicine, return a JSON object with "isMedicine": false and empty strings for all other fields.

ALL string values in the JSON response, including medicineName, whatItIs, usage, etc., MUST be in ${langName}. The ONLY exception is the 'isMedicine' boolean field.

Example for "Amoxicillin" when language is "Amharic":
{
  "isMedicine": true,
  "medicineName": "አሞክሲሲሊን",
  "whatItIs": "የባክቴሪያ ኢንፌክሽኖችን ለማከም የሚያገለግል አንቲባዮቲክ ነው።",
  "usage": "እንደ የሳንባ ምች፣ ብሮንካይተስ፣ እና የጆሮ፣ አፍንጫ፣ ጉሮሮ፣ ቆዳ ወይም የሽንት ቧንቧ ኢንፌክሽኖች ያሉ ኢንፌክሽኖችን ለማከም ያገለግላል።",
  "foodInstructions": "ከምግብ ጋር ወይም ያለ ምግብ ሊወሰድ ይችላል፣ ነገር ግን ከምግብ ጋር መውሰድ የሆድ መረበሽን ሊቀንስ ይችላል።",
  "timeTaken": "ብዙውን ጊዜ በየ 8 ወይም 12 ሰዓቱ ይወሰዳል።",
  "sideEffects": ["ማቅለሽለሽ", "ማስታወክ", "ተቅማጥ", "ሽፍታ", "ራስ ምታት"],
  "localSummary": "አሞክሲሲሊን ለተለያዩ የባክቴሪያ ኢንፌክሽኖች ህክምና የሚውል አንቲባዮቲክ ነው።"
}
`;
}

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
  }

  try {
    const { searchTerm, language = 'en' } = await req.json();
    const systemInstruction = getSystemInstruction(language);

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
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
    
    const jsonData = JSON.parse(aiText);

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("Error in medicine-search API:", error);
    const message = (error as Error).message || 'An unknown error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
    