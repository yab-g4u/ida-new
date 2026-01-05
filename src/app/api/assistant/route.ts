
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

  return `You are a localized medical information assistant for Ethiopia.
Respond ONLY in ${langName}.
Your answers must be culturally appropriate and locally contextualized for Ethiopia, not literal translations.
You provide general health information only. Do NOT diagnose, prescribe medication, or give treatment plans.
For any serious symptoms, emergencies, or uncertainty, you MUST strongly advise the user to visit a nearby health center, clinic, or hospital, or to consult a licensed healthcare professional.`;
};

const getFallbackResponse = (language: string) => {
    const fallbacks: Record<string, string> = {
        am: "ሰላም! እኔ IDA ነኝ። የጤና መረጃ ቋታችንን እያሻሻልኩ ስለሆነ ለጊዜው ጥያቄዎን መመለስ አልችልም። እባክዎ ቆይተው እንደገና ይሞክሩ። በአገልግሎቴ ላይ ለሚፈጠረው መስተጓጎል ይቅርታ እጠይቃለሁ።",
        om: "Akkam! Ani IDA dha. Odeeffannoo fayyaa keenya yeroo ammaa haaromsaa waan jirruuf, gaaffii keessaniif deebii kennuu hin danda'u. Maaloo yeroo gabaabaa booda irra deebi'aa yaalaa. Rakkina mudateef dhiifama.",
        en: "Hello! I'm IDA. I'm currently updating my health database and can't answer your query right now. Please try again shortly. I apologize for the interruption."
    };
    return fallbacks[language] || fallbacks.en;
}


export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API key not configured.");
    // Return a structured error that the frontend expects
    return NextResponse.json({ error: 'The Gemini API key is not configured on the server. Please check the environment variables.' }, { status: 500 });
  }

  try {
    const { message, language = 'en' } = await req.json();

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
          parts: [{ text: message }],
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
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
    
    // Defensive check for candidate and content parts
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      console.error("No content in Gemini response:", data);
      throw new Error('Failed to get a valid response from the AI.');
    }
    
    return NextResponse.json({ text: aiText });
  } catch (error) {
    const { language = 'en' } = await req.json().catch(() => ({ language: 'en' }));
    console.error("Error in assistant API, returning fallback:", error);
    const fallbackText = getFallbackResponse(language);
    // Return the fallback in the same structure as a successful response
    return NextResponse.json({ text: fallbackText });
  }
}
