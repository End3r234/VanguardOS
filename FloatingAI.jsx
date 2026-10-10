import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bot, X, Minimize2, Send, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
        isUser ? 'bg-crimson text-white' : 'bg-white/[0.07] border border-white/10 text-white/90'
      }`}>
        {isUser ? <p>{message.content}</p> : (
          <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function FloatingAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Allow any button in the app to open the assistant
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-ai-assistant', handler);
    return () => window.removeEventListener('open-ai-assistant', handler);
  }, []);

  const initConversation = async () => {
    const conv = await base44.agents.createConversation({ agent_name: 'cad_assistant' });
    setConversationId(conv.id);
    return conv;
  };

  useEffect(() => {
    if (!conversationId) return;
    const unsub = base44.agents.subscribeToConversation(conversationId, (data) => {
      const msgs = data.messages || [];
      setMessages(msgs);
      const last = msgs.slice(-1)[0];
      if (last?.role === 'assistant' && last?.content) {
        setLoading(false);
        // Check if the conversation involved a bug report
        const userMsgs = msgs.filter(m => m.role === 'user').map(m => m.content?.toLowerCase() || '');
        const isBugReport = userMsgs.some(t => t.includes('bug') || t.includes('report') || t.includes('broken') || t.includes('issue') || t.includes('error'));
        if (isBugReport && !msgs.some(m => m.content?.includes('discord.gg/RqVzDvNHxA'))) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Also, consider joining our [Discord server](${DISCORD_URL}) for faster support and to stay updated on fixes! 🎮`,
          }]);
        }
      }
    });
    return unsub;
  }, [conversationId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setLoading(true);
    let convId = conversationId;
    if (!convId) {
      const conv = await initConversation();
      convId = conv.id;
    }
    const conv = await base44.agents.getConversation(convId);
    await base44.agents.addMessage(conv, { role: 'user', content: text });
  };

  const reset = async () => {
    setMessages([]);
    setConversationId(null);
    setLoading(false);
  };

  const QUICK = ['What is Signal 100?', 'Explain 10-codes', 'How do I handle a P1 call?', 'Report a bug 🐛'];
  const DISCORD_URL = 'https://discord.gg/RqVzDvNHxA';

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 w-13 h-13 rounded-2xl shadow-2xl flex items-center justify-center transition-all ${
          open ? 'bg-crimson-dark' : 'bg-crimson hover:bg-crimson-light'
        } shadow-crimson/30`}
        style={{ width: 52, height: 52 }}
      >
        {open ? <X size={20} className="text-white" /> : <Bot size={22} className="text-white" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col" style={{ height: 520, background: '#0f0f0f' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#1a0000]/60 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-crimson" />
              <span className="text-white font-semibold text-sm">VOS Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-1">
              <button onClick={reset} className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="New conversation">
                <RotateCcw size={13} />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Minimize2 size={13} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && !loading && (
              <div className="text-center pt-8">
                <Bot size={28} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/40 text-sm mb-1">Ask me about CAD procedures, platform features, or report a bug.</p>
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#7289DA] text-xs hover:underline mb-3">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                  Join our Discord for faster support
                </a>
                <div className="space-y-2">
                  {QUICK.map(q => (
                    <button key={q} onClick={() => { setInput(q); }} className="block w-full text-left px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.08] text-xs transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.filter(m => m.role !== 'system').map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="bg-white/[0.07] border border-white/10 rounded-2xl px-3 py-2">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/[0.06] flex gap-2 flex-shrink-0">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask a question..."
              className="bg-white/[0.05] border-white/10 text-white text-sm rounded-xl placeholder:text-white/30 h-9"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-crimson hover:bg-crimson-light disabled:opacity-30 flex items-center justify-center transition-all"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}