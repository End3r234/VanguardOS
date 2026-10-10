import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, X, Send, Loader2, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DispatchAI({ serverId, calls, units, user }) {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open || conversationId) return;
    base44.agents.createConversation({
      agent_name: 'dispatch_ai',
      metadata: { name: `Dispatch - ${serverId}` },
    }).then(conv => setConversationId(conv.id));
  }, [open]);

  useEffect(() => {
    if (!conversationId) return;
    const unsub = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeCalls = calls.filter(c => c.status !== 'closed');
  const onlineUnits = units.filter(u => u.status !== '10-42');

  const buildContext = (text) => `
[LIVE DATA]
Active Calls (${activeCalls.length}):
${activeCalls.map(c => `- ${c.call_number} | ${c.type} | ${c.location} | ${c.priority} | Assigned: ${(c.assigned_units || []).join(', ') || 'none'}`).join('\n') || 'None'}

Online Units (${onlineUnits.length}):
${onlineUnits.map(u => `- ${u.callsign} | ${u.department_type} | ${u.status} | ${u.location || 'no location'}`).join('\n') || 'None'}

[DISPATCHER QUERY]
${text}`;

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || !conversationId || sending) return;
    setSending(true);
    setInput('');
    const conv = await base44.agents.getConversation(conversationId);
    await base44.agents.addMessage(conv, { role: 'user', content: buildContext(msg) });
    setSending(false);
  };

  const QUICK = [
    'Who are the available units right now?',
    'What P1 or P2 calls need attention?',
    'Which units should I dispatch to the most urgent call?',
    'Give me a full situation report.',
  ];

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-20 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/40 transition-all"
      >
        <Bot size={16} />
        Dispatch AI
        {open && <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="fixed bottom-16 right-20 z-50 w-[420px] max-h-[72vh] flex flex-col rounded-2xl border border-white/10 bg-[#0a150a] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-emerald-900/40 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={15} className="text-emerald-400" />
              <span className="text-white text-sm font-semibold">Dispatch AI Assistant</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">LIVE</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Live stats bar */}
          <div className="px-4 py-2 bg-black/30 border-b border-white/[0.04] flex items-center gap-3 text-[10px] flex-shrink-0">
            <span className="text-white/30">Active Calls:</span>
            <span className={`font-bold ${activeCalls.length > 0 ? 'text-orange-400' : 'text-white/30'}`}>{activeCalls.length}</span>
            <span className="text-white/10">|</span>
            <span className="text-white/30">Units Online:</span>
            <span className={`font-bold ${onlineUnits.length > 0 ? 'text-emerald-400' : 'text-white/30'}`}>{onlineUnits.length}</span>
            {activeCalls.filter(c => c.priority === 'P1').length > 0 && (
              <>
                <span className="text-white/10">|</span>
                <span className="text-red-400 font-bold animate-pulse">⚠ {activeCalls.filter(c => c.priority === 'P1').length} P1</span>
              </>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[180px]">
            {messages.length === 0 && !sending && (
              <div className="space-y-2">
                <p className="text-white/30 text-xs text-center mb-3">Ask anything about current calls and units.</p>
                {QUICK.map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="w-full text-left text-xs px-3 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              const content = isUser ? msg.content.split('[DISPATCHER QUERY]').pop()?.trim() : msg.content;
              if (!content) return null;
              return (
                <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-xl px-3 py-2 text-xs ${isUser ? 'bg-emerald-700/60 text-white' : 'bg-white/[0.06] text-white/80'}`}>
                    {isUser ? content : (
                      <ReactMarkdown className="prose prose-xs prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-xs">
                        {content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              );
            })}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white/[0.06] rounded-xl px-3 py-2 flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin text-emerald-400" />
                  <span className="text-white/40 text-[10px]">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div className="p-3 border-t border-white/[0.06] flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about calls, units, priorities..."
              className="flex-1 bg-white/[0.05] border border-white/10 text-white placeholder:text-white/30 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all flex-shrink-0"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}