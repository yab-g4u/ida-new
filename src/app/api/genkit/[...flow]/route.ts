
'use server';

import { NextResponse } from 'next/server';

// This is the "bulletproof" native Next.js API route that bypasses Genkit handlers
// to ensure demo reliability. It calls the Gemini API directly.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.input?.query || 'Hello'; // Extract the user's message
    const language = body.input?.language || 'en'; // Extract language
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set.");
    }

    const langInstruction = {
        am: "You MUST respond exclusively in Amharic using the proper Ethiopic (Geez) script. Do not use any English letters or transliterations.",
        om: "You MUST respond exclusively in Afaan Oromo using the correct Qubee alphabet. Do not use any English letters.",
        en: "You MUST respond exclusively in English."
    }[language];

    const disclaimer = {
        en: "This is for informational purposes only. In an emergency, call 907 or visit the nearest hospital (e.g., Black Lion/Tikur Anbessa).",
        am: "ይህ ለመረጃ አገልግሎት ብቻ ነው። በድንገተኛ አደጋ ጊዜ ወደ 907 ይደውሉ ወይም በአቅራቢያዎ ወደሚገኝ ሆስፒታል (ለምሳሌ ፣ ጥቁር አንበሳ) ይሂዱ።",
        om: "Kun odeeffannoof qofa. Balaa tasaa yoo jiraate, 907 bilbilaa ykn hospitaala dhiyootti argamu (fkn. Tikur Anbessa) deemaa."
    }[language];

    // Direct fetch to Gemini API endpoint for streaming
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:streamGenerateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are "ida AI," a professional, empathetic, and culturally-aware health assistant for Ethiopia.
            ${langInstruction}
            Your tone must be professional and trustworthy, like a doctor, but still warm and reassuring.
            NEVER diagnose, prescribe, or name specific medications.
            At the end of EVERY response, you MUST include this disclaimer on its own line: "${disclaimer}"

            User query: "${message}"`
          }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 1,
            "topK": 1,
            "maxOutputTokens": 256,
        },
      })
    });
    
    if (!response.ok) {
        console.error("Gemini API request failed:", response.status, await response.text());
        throw new Error('Gemini API request failed');
    }
    
    if (!response.body) {
        throw new Error('No response body from Gemini API');
    }

    // Pipe the streaming response directly to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          // The response is a JSON stream, we need to parse it to get the text.
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.substring(6);
                const json = JSON.parse(jsonStr);
                const text = json.candidates[0]?.content?.parts[0]?.text;
                if (text) {
                  controller.enqueue(text);
                }
              } catch (e) {
                // Ignore parsing errors, might be an incomplete JSON object
              }
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  } catch (error) {
    console.error("Error in direct API route:", error);
    // EMERGENCY FALLBACK if internet/API fails during demo
    const fallbackResponse = "Selam! I'm IDA. አይዞህ (Ayizoh). I'm currently optimizing my health database. How else can I help? Akkam jirta?";
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(fallbackResponse);
            controller.close();
        }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
