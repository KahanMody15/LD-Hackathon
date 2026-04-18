import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'user'|'sys', text: string}[]>([
    { sender: 'sys', text: 'Hello. I am the EcoSentinel Assistant. How can I help you analyze the current environmental data?' }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if(!input.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    const currentInput = input;
    setInput("");
    
    // Mock response strategy
    setTimeout(() => {
      let reply = "I'm analyzing the telemetry...";
      if(currentInput.toLowerCase().includes("pollution")) reply = "The PM2.5 levels are elevated near the Ankleshwar corridor. Consider opening a Form-A complaint.";
      if(currentInput.toLowerCase().includes("safe")) reply = "Current air quality indices in the residential zones remain within safe limits.";
      setMessages(prev => [...prev, { sender: 'sys', text: reply }]);
    }, 800);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.4)] flex items-center justify-center hover:bg-primary-500 transition-colors z-40"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 bg-dark-base border border-white/10 shadow-2xl rounded-2xl z-50 overflow-hidden flex flex-col"
            style={{ maxHeight: '500px', height: '60vh' }}
          >
            <div className="bg-slate-900 px-4 py-3 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-white text-sm">AI Analytics</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    m.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-200 border border-white/5'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-900 border-t border-white/5 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about pollution levels..."
                className="flex-1 bg-slate-800 border-none rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white hover:bg-primary-500"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
