import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Globe, Loader2 } from 'lucide-react';
import { getCurrentSession } from '@/lib/store';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'gu'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const session = getCurrentSession();
  const role = session ? session.role : 'Public';

  useEffect(() => {
    // Initial greeting if opened for the first time
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          sender: 'ai',
          text: `Hello ${session?.name || ''}, I am your AI Safety Assistant. How can I help you today?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, messages.length, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (queryText: string = input) => {
    if (!queryText.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Fake delay for natural feel
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));

      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          language: language,
          role: role
        })
      });

      if (!res.ok) throw new Error("API error");
      
      const data = await res.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Sorry, the AI backend is currently unreachable. Make sure the FastAPI server is running.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    "Hello",
    "Is it safe?",
    "What should I do?",
    "Report issue",
    "Dashboard status",
    "Emergency procedures",
    "Health advice",
    "Contact Help",
    "Check Weather",
    "Air quality rules"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#eceae4] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-[#1c1c1c] p-4 flex items-center justify-between text-[#f7f4ed]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Safety Assistant</h3>
                <p className="text-[10px] text-white/60">Real-time Environmental Support</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white/10 rounded-md px-2 py-1">
                <Globe className="w-3 h-3 mr-1" />
                <select 
                  className="bg-transparent text-xs outline-none cursor-pointer"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en'|'hi'|'gu')}
                >
                  <option value="en" className="text-black">EN</option>
                  <option value="hi" className="text-black">HI</option>
                  <option value="gu" className="text-black">GU</option>
                </select>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#F8FAFC] px-4 py-2 border-b border-[#eceae4] flex gap-2 overflow-x-auto custom-scrollbar flex-none">
            {quickActions.map(action => (
              <button
                key={action}
                onClick={() => handleSend(action)}
                className="whitespace-nowrap text-[11px] font-medium px-3 py-1.5 rounded-full bg-white border border-[#eceae4] text-[#5f5f5d] hover:bg-[#1c1c1c] hover:text-[#f7f4ed] transition-colors"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC] space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#1c1c1c] text-white rounded-tr-sm' 
                    : 'bg-white border border-[#eceae4] text-[#1c1c1c] shadow-sm rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#eceae4] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#5f5f5d] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#5f5f5d] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#5f5f5d] rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-[#eceae4]">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-[#F8FAFC] border border-[#eceae4] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#1c1c1c] transition-colors"
              />
              
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2 bg-[#1c1c1c] text-white rounded-full hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-[#5f5f5d] rotate-90' : 'bg-[#1c1c1c]'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
