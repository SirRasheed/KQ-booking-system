'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageCircle, Send, Bot, User, Phone, Mail, HelpCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const faqs = [
  {
    question: 'How do I book a flight?',
    answer: 'To book a flight: 1) Login to your account, 2) Go to Search Flights, 3) Enter your origin, destination, and travel date, 4) Select a flight and travel class, 5) Fill in passenger details, 6) Confirm your booking. You will receive a booking reference (e.g., KQ-2025-001).',
  },
  {
    question: 'What travel classes are available?',
    answer: 'Kenya Airways offers three travel classes: Executive Class (Class A) - Premium luxury with 20 spacious seats; Middle Class (Class B) - Enhanced comfort with 50 seats; Economy Class (Class C) - Affordable fares with 100 seats.',
  },
  {
    question: 'How do I cancel a booking?',
    answer: 'To cancel a booking: 1) Go to My Bookings, 2) Find your booking, 3) Click the Cancel button. Your seat will be released and the booking status will change to CANCELLED. Please note that cancellation policies may apply.',
  },
  {
    question: 'Can I modify my booking?',
    answer: 'Currently, you can cancel and rebook a flight. To modify passenger details, please contact our customer service at +254 700 000 001 or email info@kenya-airways.com.',
  },
  {
    question: 'What happens if a flight is fully booked?',
    answer: 'If your preferred flight and class are fully booked, the system will show "0 seats available" for that class. You can: 1) Choose a different travel class on the same flight, 2) Search for alternative dates, 3) Look for other flights to your destination.',
  },
  {
    question: 'What is the baggage allowance?',
    answer: 'Baggage allowance varies by class: Executive Class - 2 checked bags (32kg each) + 1 carry-on; Middle Class - 2 checked bags (23kg each) + 1 carry-on; Economy Class - 1 checked bag (23kg) + 1 carry-on. Additional baggage can be purchased.',
  },
  {
    question: 'What documents do I need to travel?',
    answer: 'You need: A valid passport (at least 6 months before expiry), any required visas for your destination, your booking reference/ticket, and a valid photo ID. International travelers may need vaccination certificates.',
  },
  {
    question: 'How early should I arrive at the airport?',
    answer: 'We recommend: Domestic flights - arrive 2 hours before departure; International flights - arrive 3 hours before departure. Check-in counters close 45 minutes before domestic flights and 60 minutes before international flights.',
  },
];

export function HelpPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Kenya Airways virtual assistant. How can I help you today? You can ask me about flights, bookings, travel classes, baggage policies, and more.',
    },
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'I\'m sorry, I couldn\'t process your request. Please try again or contact our support team.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I\'m having trouble connecting. Please try again later.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-500 mt-1">Find answers to common questions or chat with our AI assistant</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-red-600" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left text-sm hover:text-red-700">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-sm">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-red-600" />
                <span>+254 700 000 001</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-red-600" />
                <span>info@kenya-airways.com</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Section */}
        <div>
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-red-600" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 max-h-[440px]">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500">
                      Typing...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything about Kenya Airways..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={chatLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={chatLoading || !input.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
