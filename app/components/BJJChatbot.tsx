'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Best submission for beginners?",
  "How do I escape mount?",
  "What's your favorite choke?",
  "Tips for my first competition?",
];

// Sanitize HTML to prevent XSS - only allow safe tags and attributes
function sanitizeHtml(html: string): string {
  // First, escape everything
  let safe = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Then selectively allow safe anchor tags with only href to our domain or relative paths
  // Match patterns like: &lt;a href="..."&gt;...&lt;/a&gt;
  safe = safe.replace(
    /&lt;a\s+href=&quot;((?:https?:\/\/(?:www\.)?thefortjiujitsu\.com)?\/[^&]*)&quot;&gt;([^&]*?)&lt;\/a&gt;/gi,
    '<a href="$1" class="text-[#b9955a] hover:text-[#d4af6a] underline" target="_blank" rel="noopener noreferrer">$2</a>'
  );

  return safe;
}

// Format message to clean up markdown, convert URLs to links, and make it conversational
function formatMessage(content: string): string {
  let formatted = content
    // Remove markdown headers
    .replace(/#{1,6}\s*/g, '')
    // Remove bold markdown
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic markdown
    .replace(/\*(.*?)\*/g, '$1')
    // Remove bullet points and replace with line breaks
    .replace(/^[-•]\s*/gm, '• ')
    // Remove numbered lists formatting
    .replace(/^\d+\.\s*/gm, '')
    // Clean up excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Convert plain URLs to clickable links (only for thefortjiujitsu.com)
  // Match thefortjiujitsu.com URLs with or without paths
  formatted = formatted.replace(
    /(?:https?:\/\/)?(?:www\.)?thefortjiujitsu\.com(\/[^\s<,.)]*)?/gi,
    (match, path) => {
      const fullPath = path || '';
      return `<a href="https://thefortjiujitsu.com${fullPath}" class="text-[#b9955a] hover:text-[#d4af6a] underline" target="_blank" rel="noopener noreferrer">thefortjiujitsu.com${fullPath}</a>`;
    }
  );

  return formatted;
}

export default function BJJChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "OSS! Welcome to The Fort! I'm Sensei Bot, your personal BJJ training partner. Whether you're a white belt wondering what an armbar is or a purple belt looking to sharpen your leg lock game - I've got you. What's on your mind?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-10),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: formatMessage(data.response),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Whoa, got caught in a scramble there! Give me a sec and try again - even black belts have off days.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (question: string) => {
    sendMessage(question);
  };

  return (
    <>
      {/* Floating Chat Button - BIGGER! */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-24 h-24 md:w-28 md:h-28 rounded-full shadow-2xl overflow-hidden border-3 border-[#b9955a] hover:border-[#d4af6a] transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px rgba(185, 149, 90, 0.5), 0 0 60px rgba(185, 149, 90, 0.2)',
            }}
          >
            <Image
              src="/bjj_chatbot_icon_v6.png"
              alt="BJJ AI Assistant"
              fill
              className="object-cover"
            />
            {/* Pulse ring effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#b9955a]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window - Bigger and cleaner */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : undefined
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-32px)] h-[500px] md:h-[650px] bg-[#0a0a0a] rounded-3xl shadow-2xl border border-[#b9955a]/30 overflow-hidden flex flex-col"
            style={{
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(185, 149, 90, 0.2)',
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a1a1a] via-[#222] to-[#1a1a1a] p-4 flex items-center gap-4 border-b border-[#b9955a]/20">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#b9955a] shadow-lg">
                <Image
                  src="/bjj_chatbot_icon_v6.png"
                  alt="BJJ AI Assistant"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-white text-base">Sensei Bot</h3>
                <p className="text-xs text-[#b9955a]">Your BJJ Training Partner</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 text-[#777] hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-[#777] hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-[#b9955a] to-[#d4a85a] text-[#0a0a0a] font-medium'
                            : 'bg-[#1b1b1b] text-[#e8e8e8] border border-[#333]'
                        }`}
                      >
                        <div
                          className="text-sm leading-relaxed whitespace-pre-wrap [&_a]:text-[#b9955a] [&_a]:hover:text-[#d4af6a] [&_a]:underline"
                          dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-[#1b1b1b] border border-[#333] rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <motion.div
                              className="w-2 h-2 bg-[#b9955a] rounded-full"
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-[#b9955a] rounded-full"
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-[#b9955a] rounded-full"
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                          <span className="text-sm text-[#888]">Working the position...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-[#666] mb-2 uppercase tracking-wide">Quick questions</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_QUESTIONS.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(question)}
                          className="px-3 py-1.5 bg-[#1b1b1b] border border-[#333] rounded-full text-xs text-[#aaa] hover:border-[#b9955a] hover:text-white hover:bg-[#222] transition-all duration-200"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-[#333] bg-[#111]">
                  <div className="flex gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about BJJ..."
                      className="flex-1 bg-[#1b1b1b] border border-[#333] rounded-xl px-4 py-3 text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#b9955a] focus:ring-1 focus:ring-[#b9955a]/50 transition-all"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="px-5 py-3 bg-gradient-to-r from-[#b9955a] to-[#d4a85a] text-[#0a0a0a] rounded-xl font-semibold hover:from-[#c9a56a] hover:to-[#e4b86a] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
