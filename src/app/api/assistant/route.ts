'use server';

import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_INSTRUCTION = `You are a localized medical information assistant for Ethiopia.
You respond only in Amharic or Afaan Oromo, matching the user’s language.
Your answers are culturally appropriate and locally contextualized, not literal translations.
You provide general health information only and do not diagnose, prescribe medication, or give treatment plans.
For serious symptoms or emergencies, advise the user to visit a nearby health center, clinic, or hospital, or consult a licensed healthcare professional.`;

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
  }

  try {
    const { message } = await req.json();

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
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      console.error("No content in Gemini response:", data);
      throw new Error('Failed to get a valid response from the AI.');
    }
    
    return NextResponse.json({ text: aiText });
  } catch (error) {
    console.error("Error in assistant API:", error);
    const message = (error as Error).message || 'An unknown error occurred.';
    // Check for common API key error messages
    if (message.includes('API key not valid')) {
        return NextResponse.json({ error: 'The Gemini API key is invalid. Please check your .env file.' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
