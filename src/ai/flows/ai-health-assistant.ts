'use server';
/**
 * @fileOverview The main AI health assistant flow for IDA.
 *
 * - aiHealthAssistant - A streaming function that provides conversational health advice.
 * - AiHealthAssistantInput - The input type for the function.
 */
import { ai } from '@/ai/genkit';
import {z} from 'zod';

const AiHealthAssistantInputSchema = z.object({
  query: z.string().describe('The user question about a health topic.'),
  language: z.enum(['en', 'am', 'om']).describe('The detected language of the user query.'),
});
export type AiHealthAssistantInput = z.infer<typeof AiHealthAssistantInputSchema>;


const demoResponses = {
    am: {
        'selam': 'ሰላም! እንዴት ነዎት? ዛሬ እንዴት ልረዳዎት እችላለሁ?',
        'hi': 'ሰላም! እንዴት ነዎት? ዛሬ እንዴት ልረዳዎት እችላለሁ?',
        'amogn nbr': 'እንደዛ መስማቴ አዝናለሁ። እረፍት እንዲያደርጉ እና ብዙ ፈሳሽ እንዲወስዱ እመክራለሁ። አሁንም ህመም ከተሰማዎት በአቅራቢያዎ የሚገኝን ፋርማሲ እንዲያማክሩ ሀሳብ አቀርባለሁ።',
        'hodēn eyamemegn nw': 'ይቅርታ፣ የሆድ ህመም ሲሰማዎት መስማቴ አዝናለሁ። ምናልባት ከምግብ ወይም ከጭንቀት ሊሆን ይችላል። እንደ ተፈጥሯዊ ዝንጅብል ሻይ ያሉ ቀላል ነገሮችን መሞከር ይችላሉ። ህመሙ ከቀጠለ፣ እባክዎ በአቅራቢያዎ ያለውን ፋርማሲ ወይም የጤና ማእከል ያማክሩ።',
    },
    om: {
        'akkam': 'Akkam! Nagaa qabduu? Har\'a akkamittan isin gargaaruu danda\'a?',
        'hi': 'Akkam! Nagaa qabduu? Har\'a akkamittan isin gargaaruu danda\'a?',
        'na dhukkuba': 'Dhukkubsachuu keessan dhaga\'uun na gaddisiiseera. Boqonnaa akka fudhattanii fi dhangala\'aa baay\'ee akka dhugdan isiniin gorsa. Ammas yoo isinitti dhaga\'ame, faarmaasii dhiyootti argamu akka mariisistan yaada dhiyeessa.',
        'garaa na dhukkuba': 'Dhiifama, garaa keessan isin dhukkubuu dhaga\'uun na gaddisiiseera. Tarii nyaata ykn dhiphina irraa kan ka\'e ta\'uu danda\'a. Wantoota salphaa kan akka shaayii jinjiibilaa uumamaa yaaluu dandeessu. Dhukkubbiin yoo itti fufe, maaloo faarmaasii ykn giddugala fayyaa dhiyootti argamu mariisisaa.',
    },
    en: {
        'hi': 'Hello! How are you? How can I help you today?',
        'selam': 'Hello! How are you? How can I help you today?',
        'i was sick': 'I am sorry to hear that. I recommend you get some rest and drink plenty of fluids. If you still feel unwell, I suggest consulting a nearby pharmacy.',
        'my stomach hurts': 'I am sorry to hear you have a stomach ache. It could be due to food or stress. You can try simple things like natural ginger tea. If the pain persists, please consult a nearby pharmacy or health center.',
    }
}

export const aiHealthAssistant = ai.defineFlow({
    name: 'aiHealthAssistant',
    inputSchema: AiHealthAssistantInputSchema,
    outputSchema: z.string(),
}, async (input) => {
  const systemPrompt = `You are "ida AI," a professional, empathetic, and culturally-aware health assistant designed for Ethiopia. You communicate fluently in Amharic, Afaan Oromo, and English.

# IDENTITY & CULTURAL GROUNDING
- You are an expert in Ethiopian health contexts.
- When discussing diet, you must refer to local foods (e.g., Injera/Teff, Shiro, Kocho, Marqa).
- If a user mentions local traditional remedies (e.g., Damakese, Tenadam), acknowledge them respectfully but always prioritize and gently guide towards evidence-based medical advice.
- If asked about time or dates, use Ethiopian conventions if the context is appropriate.

# LANGUAGE PROTOCOL
- The user is writing in language code: "${input.language}". You MUST respond exclusively in this language.
- Amharic responses must use the proper Ethiopic script (Geez).
- Afaan Oromo responses must use the correct Qubee alphabet.
- Your tone should be professional and trustworthy, like a doctor, but remain accessible, warm, and reassuring. Use polite forms (e.g., 'Isin' in Oromo, 'እርስዎ' in Amharic).

# SAFETY & MEDICAL DISCLAIMER (CRITICAL RULE)
- YOU ARE AN AI ASSISTANT, NOT A MEDICAL DOCTOR. You cannot diagnose, prescribe, or give treatment.
- At the end of EVERY response, you MUST include a clear, concise disclaimer in the user's language, separated by a horizontal line.
- English: "This is for informational purposes only. In an emergency, call 907 or visit the nearest hospital (e.g., Black Lion/Tikur Anbessa)."
- Amharic: "ይህ ለመረጃ አገልግሎት ብቻ ነው። በድንገተኛ አደጋ ጊዜ ወደ 907 ይደውሉ ወይም በአቅራቢያዎ ወደሚገኝ ሆስፒታል (ለምሳሌ ፣ ጥቁር አንበሳ) ይሂዱ።"
- Oromo: "Kun odeeffannoof qofa. Balaa tasaa yoo jiraate, 907 bilbilaa ykn hospitaala dhiyootti argamu (fkn. Tikur Anbessa) deemaa."
- Never, under any circumstances, provide specific drug names or dosages. Instead, advise the user to consult a pharmacist or doctor.

# RESPONSE STYLE
- Use bullet points (*) for lists or steps to make information easy to read.
- Keep responses concise and optimized for a small mobile screen. Avoid long paragraphs.
`;

    // Demo mode logic
    const normalizedQuery = input.query.toLowerCase().trim();
    const langResponses = demoResponses[input.language];
    if (normalizedQuery in langResponses) {
        const demoResponse = langResponses[normalizedQuery as keyof typeof langResponses];
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(demoResponse);
                controller.close();
            }
        });
        return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

  try {
    const { stream, response } = await ai.generateStream({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: input.query,
        system: systemPrompt,
    });

    const readableStream = new ReadableStream({
        async start(controller) {
        for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
                controller.enqueue(text);
            }
        }
        controller.close();
        },
    });

    return new Response(readableStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
     console.error("AI Assistant Error:", error);
     const fallbackResponse = demoResponses[input.language]['hi']; // Default to a greeting
     const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(fallbackResponse);
            controller.close();
        }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
});
