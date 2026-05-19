"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi there! 👋 I'm your Tradizions AI Assistant. How can I help you discover our premium organic millets, dry fruits, or gifts today?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");

    // Simulate AI typing and response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        text: "Thanks for your message! Our AI is currently in beta. For immediate assistance, please contact our support team or explore our shop." 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--olive)] text-white flex items-center justify-center shadow-2xl hover:shadow-[0_10px_40px_rgba(85,107,47,0.4)] transition-all hover:-translate-y-1 z-[9999] cursor-pointer ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
      </button>

      {/* Chatbot Window */}
      <div className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-white rounded-xl shadow-[0_30px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden z-[10000] transition-all origin-bottom-right duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="px-6 py-4 bg-[var(--olive)] text-white flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide flex items-center gap-1">Tradizions AI <Sparkles className="w-3 h-3 text-amber-300" /></h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[10px] text-emerald-100 font-medium uppercase tracking-widest">Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors relative z-10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#faf9f6]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[var(--olive)] text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 bg-[#faf9f6] border border-gray-100 rounded-xl outline-none focus:border-[var(--olive)]/30 focus:bg-white transition-all text-[13px] font-medium text-gray-800 placeholder:text-gray-400"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="w-11 h-11 rounded-xl bg-[var(--olive)] text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--olive-dark)] transition-colors shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </>
  );
}
