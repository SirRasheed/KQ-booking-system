import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const systemPrompt = `You are a helpful customer service assistant for Kenya Airways, the flag carrier airline of Kenya known as "The Pride of Africa." 

Your role is to help customers with:
- Flight information and bookings
- Booking management (cancellations, modifications)
- Travel classes (Executive Class A, Middle Class B, Economy Class C)
- Seat availability and selection
- Check-in information
- Baggage policies
- Travel documentation requirements

Key information about Kenya Airways:
- Hub: Jomo Kenyatta International Airport (NBO), Nairobi
- Operates flights to 50+ destinations worldwide
- Travel classes: Executive (20 seats), Middle (50 seats), Economy (100 seats)
- Popular routes: Nairobi-Mombasa, Nairobi-London, Nairobi-Dubai, Nairobi-Johannesburg, Nairobi-New York
- Booking reference format: KQ-YYYY-NNN

Always be polite, professional, and helpful. Keep your responses concise and helpful. If you don't know something, suggest contacting Kenya Airways at +254 700 000 001.`;

    const messages = [
      { role: 'assistant' as const, content: systemPrompt },
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
