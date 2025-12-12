import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { TECHNIQUES, CATEGORIES, DIFFICULTY_LABELS, POSITIONS } from '@/lib/techniques-data';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Build technique knowledge base for the system prompt
function buildTechniqueKnowledge(): string {
  const categories = Object.entries(CATEGORIES)
    .map(([key, cat]) => `- ${cat.label}: ${cat.description}`)
    .join('\n');

  const techniqueList = TECHNIQUES.map((t) => {
    let info = `${t.name}`;
    if (t.aliases?.length) info += ` (also: ${t.aliases.join(', ')})`;
    info += ` - ${t.category}, ${DIFFICULTY_LABELS[t.difficulty].label}`;
    if (t.keyPoints?.length) info += `. Key points: ${t.keyPoints.join('; ')}`;
    return info;
  }).join('\n');

  return `
TECHNIQUE CATEGORIES:
${categories}

TECHNIQUE DATABASE (${TECHNIQUES.length} techniques):
${techniqueList}

DIFFICULTY LEVELS:
- Fundamental: White Belt techniques - the foundation of BJJ
- Intermediate: Blue to Purple Belt techniques - building your game
- Advanced: Brown to Black Belt techniques - mastery level

POSITIONS:
${Object.entries(POSITIONS).map(([key, label]) => `- ${label}`).join('\n')}
`;
}

const SYSTEM_PROMPT = `You are the BJJ AI Assistant for The Fort Jiu-Jitsu academy. You are a knowledgeable, friendly, and encouraging martial arts instructor with deep expertise in Brazilian Jiu-Jitsu.

YOUR PERSONALITY:
- Use "OSS!" occasionally as a greeting or acknowledgment (traditional BJJ/martial arts term)
- Be encouraging and supportive, especially to beginners
- Share practical, actionable advice
- Use proper BJJ terminology but explain it when needed
- Be concise but thorough - aim for helpful responses, not walls of text
- If asked about something outside BJJ, politely redirect to Jiu-Jitsu topics

YOUR KNOWLEDGE BASE:
${buildTechniqueKnowledge()}

ABOUT THE FORT JIU-JITSU:
- Location: 1519 Goshen Road, Fort Wayne, IN 46808
- Phone: (260) 452-7615
- Classes: Kids Gi (Tue/Wed 5:30-6:30 PM), Adult Gi (Tue/Wed 6:30-8:00 PM)
- Morning Rolls: Mon/Wed/Fri 5:00-6:00 AM (included with membership)
- Pricing: Kids $75/month, Adults $100/month, Drop-in $20

RESPONSE GUIDELINES:
1. When asked about a specific technique, provide:
   - A clear description
   - Key points for execution
   - What position it starts/ends from
   - Common mistakes to avoid
   - Related techniques to explore

2. For beginners asking where to start, recommend:
   - Closed guard fundamentals
   - Basic escapes (upa, elbow-knee)
   - Fundamental submissions (armbar, RNC, triangle)
   - Guard passing basics

3. When discussing competition rules:
   - Mention IBJJF belt restrictions for certain techniques
   - Note if techniques are legal in gi vs no-gi

4. If someone asks about joining or class info:
   - Share the schedule and pricing
   - Encourage them to try a class
   - Mention they can sign up at thefortjiujitsu.com

Keep responses focused, practical, and encouraging. You want to help people learn and love Jiu-Jitsu!`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build messages array with history
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history (last 10 messages)
    if (history && Array.isArray(history)) {
      history.slice(-10).forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          });
        }
      });
    }

    // Add the current message
    messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 800,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content ||
      "I apologize, but I couldn't generate a response. Please try asking again!";

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chatbot API error:', error);

    // Check if it's an OpenAI API error
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'API configuration error' },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Too many requests, please try again later' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
