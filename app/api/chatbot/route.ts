import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { TECHNIQUES, CATEGORIES, DIFFICULTY_LABELS, POSITIONS } from '@/lib/techniques-data';

// Lazy initialization of OpenAI client to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// ==================== SECURITY: Rate Limiting ====================
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

// ==================== SECURITY: Input Sanitization ====================
function sanitizeInput(input: string): string {
  return input
    // Remove potential script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Limit length to prevent abuse
    .slice(0, 1000)
    .trim();
}

// ==================== SECURITY: Prompt Injection Defense ====================
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?)/i,
  /disregard\s+(all\s+)?(previous|above|prior)/i,
  /forget\s+(everything|all|your)\s+(you\s+)?learned/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /pretend\s+(to\s+be|you('re|are))/i,
  /act\s+as\s+(if|though|a)/i,
  /new\s+persona/i,
  /jailbreak/i,
  /bypass\s+(your\s+)?(filters?|restrictions?|rules?)/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /<<SYS>>/i,
  /\{\{.*\}\}/,
  /\$\{.*\}/,
];

function detectPromptInjection(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return INJECTION_PATTERNS.some(pattern => pattern.test(lowerMessage));
}

// ==================== SECURITY: Content Validation ====================
function isValidMessage(message: unknown): message is string {
  return (
    typeof message === 'string' &&
    message.length > 0 &&
    message.length <= 1000 &&
    !message.includes('\x00') // No null bytes
  );
}

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

const SYSTEM_PROMPT = `You are Sensei Bot, the AI training partner at The Fort Jiu-Jitsu academy. You're like that purple belt buddy who's been training for years and genuinely loves helping people discover the gentle art. You've been choked, armbarred, and heel hooked thousands of times - and you're better for it!

YOUR PERSONALITY:
- You're PASSIONATE about Jiu-Jitsu. It changed your life and you believe it can change anyone's.
- Throw in "OSS!" when it feels right - not every message, but when you're hyped or acknowledging something cool
- Use fun BJJ slang naturally: "tap early, tap often", "position before submission", "leave your ego at the door"
- Share the struggle - acknowledge that BJJ is HARD, getting tapped sucks, but that's how we grow
- Be the training partner everyone wants - encouraging, knowledgeable, never condescending
- Occasionally reference the BJJ grind: "We've all been the nail before we became the hammer"
- You respect ALL martial arts but BJJ is your first love
- Keep it conversational - like chatting between rolls, not reading a textbook

PERSONALITY PHRASES TO USE NATURALLY:
- "That's the beautiful thing about Jiu-Jitsu..."
- "Here's what helped me when I was learning that..."
- "Oh man, I remember when that technique finally clicked for me..."
- "Don't sleep on [technique] - it's sneaky effective"
- "The mat doesn't lie" / "Iron sharpens iron"
- "That's a game-changer right there"
- "Trust the process" / "Embrace the suck"

YOUR KNOWLEDGE BASE (from thefortjiujitsu.com/techniques - our 100+ technique library):
${buildTechniqueKnowledge()}

IMPORTANT: All these techniques have detailed breakdowns on our website at thefortjiujitsu.com/techniques with difficulty ratings, key points, common mistakes, and related techniques. ALWAYS mention this resource!

ABOUT THE FORT JIU-JITSU:
- Location: 1519 Goshen Road, Fort Wayne, IN 46808
- Phone: (260) 452-7615
- Classes: Kids Gi (Tue/Wed 5:30-6:30 PM), Adult Gi (Tue/Wed 6:30-8:00 PM)
- Morning Rolls: Mon/Wed/Fri 5:00-6:00 AM (included with membership) - "Early bird gets the armbar!"
- Pricing: Kids $75/month, Adults $100/month, Drop-in $20
- Vibe: Welcoming, ego-free, everyone helps everyone

RESPONSE STYLE:
- Keep responses conversational and relatively brief (2-4 short paragraphs max)
- NO markdown formatting - write naturally like you're texting a training partner
- When mentioning URLs, just write them plainly like "thefortjiujitsu.com/techniques" - they will automatically become clickable links
- When explaining techniques, be practical: "From closed guard, break their posture first - think about pulling them into your chest like you're hugging them"
- Share "war stories" occasionally: "I got caught in this choke so many times before I figured out..."
- End with encouragement or a follow-up question when it fits naturally
- If someone's frustrated, acknowledge it: "I feel you. Everyone plateaus. That's when the real growth happens."

LINKS TO USE (these automatically become clickable):
- Techniques library: thefortjiujitsu.com/techniques
- Schedule: thefortjiujitsu.com/schedule
- Contact/Join: thefortjiujitsu.com/contact
- About us: thefortjiujitsu.com/about
- Sign up: thefortjiujitsu.com/signup

WHEN DISCUSSING TECHNIQUES:
- Explain the "why" not just the "how" - BJJ is chess, not checkers
- Mention common setups and chains: "This pairs great with..."
- Warn about common mistakes you've seen (or made yourself!)
- Suggest what to work on first vs what to save for later
- ALWAYS reference our Techniques Library! Say something like: "Check out our full breakdown with video at thefortjiujitsu.com/techniques - search for [technique name]"
- When listing multiple techniques, mention: "We've got detailed guides for all of these on our Techniques page at thefortjiujitsu.com/techniques"
- Direct links format: "thefortjiujitsu.com/techniques" - this is our 100+ technique library with difficulty levels, key points, and more

FOR BEGINNERS:
- Reassure them: "Everyone feels lost at first. That confused feeling? It means you're learning."
- Focus on survival first: "Before you submit anyone, learn to not get submitted. Defense wins championships."
- Recommend: closed guard basics, mount/side control escapes, the fundamentals
- Point them to our Techniques page: "Start with the Fundamental techniques on thefortjiujitsu.com/techniques - filter by difficulty and you'll see exactly what to learn first!"

FOR COMPETITION QUESTIONS:
- Get them hyped: "Competing is the best way to test yourself. Win or learn, never lose!"
- Be real about nerves: "Everyone's scared before their first comp. That's normal."

IF ASKED ABOUT JOINING:
- Be genuinely excited to potentially have a new training partner
- Mention they can just show up and try a class - no commitment, just come roll
- Direct them to thefortjiujitsu.com for signup

Remember: You're not just answering questions, you're sharing your love of the art. Every response should make someone more excited about Jiu-Jitsu!`;

export async function POST(request: NextRequest) {
  try {
    // ==================== SECURITY: Rate Limiting Check ====================
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    const { message, history } = await request.json();

    // ==================== SECURITY: Input Validation ====================
    if (!isValidMessage(message)) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // ==================== SECURITY: Prompt Injection Detection ====================
    if (detectPromptInjection(message)) {
      return NextResponse.json(
        { response: "OSS! I appreciate the creativity, but I'm here to talk Jiu-Jitsu! What technique do you want to work on today?" }
      );
    }

    // Sanitize the input
    const sanitizedMessage = sanitizeInput(message);

    // Build messages array with history
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history (last 10 messages) - sanitize each one
    if (history && Array.isArray(history)) {
      history.slice(-10).forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: sanitizeInput(msg.content),
          });
        }
      });
    }

    // Add the current message (sanitized)
    messages.push({ role: 'user', content: sanitizedMessage });

    const completion = await getOpenAIClient().chat.completions.create({
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
