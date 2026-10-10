import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bot, Send, Plus, MessageSquare, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isThinking = message.role === 'assistant' && !message.content && message.tool_calls?.length === 0;

  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-crimson/20 border border-crimson/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot size={13} className="text-crimson" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {message.content && (
          <div className={`rounded-2xl px-4 py-2.5 text-sm ${
            isUser
              ? 'bg-crimson/20 border border-crimson/30 text-white'
              : 'bg-white/[0.05] border border-white/[0.08] text-white/80'
          }`}>
            {isUser ? (
              <p className="leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed">
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {isThinking && (
          <div className="rounded-2xl px-4 py-2.5 bg-white/[0.04] border border-white/[0.06]">
            <div className="flex gap-1 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIAssistant({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const startConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: 'cad_assistant',
      metadata: { name: 'CAD Chat' },
    });
    setConversation(conv);
    return conv;
  };

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    let conv = conversation;
    if (!conv) conv = await startConversation();
    await base44.agents.addMessage(conv, { role: 'user', content: text });
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const visibleMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-3 flex-shrink-0 bg-black/20">
        <div className="w-8 h-8 rounded-lg bg-crimson/20 border border-crimson/30 flex items-center justify-center">
          <Bot size={16} className="text-crimson" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">VanguardOS Assistant</div>
          <div className="text-white/30 text-xs">AI-powered CAD help</div>
        </div>
        {conversation && (
          <button
            onClick={() => { setConversation(null); setMessages([]); }}
            className="ml-auto p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
            title="New conversation"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {visibleMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-crimson/10 border border-crimson/20 flex items-center justify-center mb-4">
              <Bot size={28} className="text-crimson" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">VanguardOS Assistant</h3>
            <p className="text-white/40 text-sm max-w-xs leading-relaxed mb-6">
              I can help with dispatch procedures, radio codes, CAD features, training advice, and more.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {[
                'How do I create a dispatch call?',
                'What does 10-97 mean?',
                'How do I go on duty?',
                'Explain Signal 100',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-left px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] text-xs transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {visibleMessages.map((m, i) => <MessageBubble key={i} message={m} />)}
        {sending && visibleMessages[visibleMessages.length - 1]?.role === 'user' && (
          <MessageBubble message={{ role: 'assistant', content: '', tool_calls: [] }} />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0 bg-black/20">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about CAD procedures, radio codes..."
            className="bg-white/[0.05] border-white/10 text-white placeholder:text-white/30 rounded-xl flex-1"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="px-4 py-2 rounded-xl bg-crimson hover:bg-crimson-light text-white font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}