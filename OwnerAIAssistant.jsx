import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Send, Plus, Trash2, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot size={13} className="text-purple-400" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-purple-600/30 border border-purple-500/30 text-white'
          : 'bg-white/[0.04] border border-white/[0.08] text-white/85'
      }`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
              strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
              code: ({ children }) => <code className="px-1 py-0.5 rounded bg-white/10 text-purple-300 text-xs">{children}</code>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        {message.tool_calls?.filter(t => t.status === 'running' || t.status === 'in_progress').length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 text-purple-400 text-xs">
            <Loader2 size={11} className="animate-spin" /> Working...
          </div>
        )}
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  'Give me a summary of all active members',
  'Who is currently on duty?',
  'Show me recent incident reports',
  'What departments does this server have?',
  'Suggest improvements to our department structure',
];

export default function OwnerAIAssistant({ serverId, server, members, user }) {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    const convs = await base44.agents.listConversations({ agent_name: 'owner_assistant' });
    const serverConvs = (convs || []).filter(c => c.metadata?.server_id === serverId);
    setConversations(serverConvs);
    setLoading(false);
  };

  const openConversation = async (conv) => {
    if (unsubRef.current) unsubRef.current();
    const full = await base44.agents.getConversation(conv.id);
    setActiveConvId(conv.id);
    setMessages(full.messages || []);
    unsubRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
    });
  };

  const newConversation = async () => {
    if (unsubRef.current) unsubRef.current();
    const conv = await base44.agents.createConversation({
      agent_name: 'owner_assistant',
      metadata: {
        server_id: serverId,
        server_name: server?.name || 'Unknown Server',
        name: `Session ${new Date().toLocaleDateString()}`,
      },
    });
    setActiveConvId(conv.id);
    setMessages([]);
    setConversations(prev => [conv, ...prev]);
    unsubRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
    });

    // Send a silent system context message so the agent knows the server_id from the start
    const deptList = (server?.departments || []).map(d => `${d.name} (${d.type})`).join(', ') || 'None configured';
    const systemContext = `[SYSTEM CONTEXT — do not display this to the user]\nServer ID: ${serverId}\nServer Name: ${server?.name}\nOwner: ${server?.owner_email}\nMembers: ${members?.length || 0}\nDepartments: ${deptList}\nTier: ${server?.server_tier || 'free'}\n\nFor ALL entity reads/writes, filter by server_id = "${serverId}". This is your active server for this session.`;
    await base44.agents.addMessage({ id: conv.id }, { role: 'user', content: systemContext });
  };

  const deleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (activeConvId === convId) {
      if (unsubRef.current) unsubRef.current();
      setActiveConvId(null);
      setMessages([]);
    }
    setConversations(prev => prev.filter(c => c.id !== convId));
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || !activeConvId || sending) return;
    setInput('');
    setSending(true);
    const conv = { id: activeConvId };

    await base44.agents.addMessage(conv, { role: 'user', content: msg });
    setSending(false);
  };

  useEffect(() => {
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  return (
    <div className="flex h-[calc(100vh-10rem)] rounded-2xl overflow-hidden border border-purple-500/20 bg-black/20">
      {/* Sidebar */}
      <div className="w-52 border-r border-white/[0.06] flex flex-col bg-black/30">
        <div className="p-3 border-b border-white/[0.06]">
          <button
            onClick={newConversation}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all text-xs font-medium"
          >
            <Plus size={13} /> New Session
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading && <div className="text-center py-8 text-white/20 text-xs">Loading...</div>}
          {!loading && conversations.length === 0 && (
            <div className="text-center py-8 text-white/20 text-xs">No sessions yet</div>
          )}
          {conversations.map(c => (
            <div
              key={c.id}
              onClick={() => openConversation(c)}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all text-xs group flex items-center justify-between gap-1 cursor-pointer ${
                activeConvId === c.id ? 'bg-purple-500/20 text-purple-200' : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'
              }`}
            >
              <span className="truncate flex items-center gap-1.5">
                <MessageSquare size={10} />
                {c.metadata?.name || 'Session'}
              </span>
              <span
                onClick={e => deleteConversation(e, c.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-all cursor-pointer"
              >
                <Trash2 size={10} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!activeConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-purple-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Owner AI Assistant</h3>
            <p className="text-white/40 text-sm mb-6 max-w-sm">
              Your personal CAD assistant. Full access to your server — members, units, civilians, departments, and more.
            </p>
            <button
              onClick={newConversation}
              className="px-5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all text-sm font-medium"
            >
              Start a Session
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-3 mt-4">
                  <p className="text-white/30 text-xs text-center mb-4">Try asking something:</p>
                  {QUICK_ACTIONS.map(a => (
                    <button
                      key={a}
                      onClick={() => sendMessage(a)}
                      className="w-full text-left px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/10 transition-all text-sm"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {sending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Loader2 size={13} className="text-purple-400 animate-spin" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-2.5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-white/[0.06]">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask anything about your server..."
                  className="bg-white/[0.04] border-purple-500/20 text-white placeholder:text-white/30 rounded-xl text-sm focus:border-purple-500/50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 disabled:opacity-40 transition-all"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}