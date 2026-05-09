"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Send, Loader2, Plus, MessageSquare, Sparkles, AlertCircle, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

const SUGGESTED_PROMPTS = [
  { icon: "💡", text: "Dame ideas de productos ganadores para vender en Colombia" },
  { icon: "📝", text: "Ayúdame con copys para una faja reductora" },
  { icon: "🎯", text: "¿Cómo estructuro mi primera campaña en Meta Ads?" },
  { icon: "📊", text: "Explícame qué métricas mirar en una campaña de prueba" },
];

export default function PlusbyAIPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length]);

  function newConversation() {
    const id = `conv_${Date.now()}`;
    const conv: Conversation = {
      id,
      title: "Nueva conversación",
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);
    setShowSidebar(false);
    setError(null);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    setError(null);

    let convId = activeId;
    let baseConvs = conversations;

    if (!convId) {
      const id = `conv_${Date.now()}`;
      const conv: Conversation = {
        id,
        title: text.slice(0, 40),
        messages: [],
        createdAt: Date.now(),
      };
      baseConvs = [conv, ...conversations];
      setConversations(baseConvs);
      setActiveId(id);
      convId = id;
    }

    const userMsg: Message = { role: "user", content: text };
    const assistantMsg: Message = { role: "assistant", content: "" };

    const withUser = baseConvs.map((c) =>
      c.id === convId
        ? {
            ...c,
            title: c.messages.length === 0 ? text.slice(0, 40) : c.title,
            messages: [...c.messages, userMsg, assistantMsg],
          }
        : c
    );
    setConversations(withUser);
    setInput("");
    setStreaming(true);

    try {
      const messagesForAPI = withUser
        .find((c) => c.id === convId)!
        .messages.filter((_, i, arr) => i < arr.length - 1)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesForAPI }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      if (!res.body) throw new Error("Sin respuesta del servidor");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data) continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "text") {
              assistantText += parsed.text;
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === convId
                    ? {
                        ...c,
                        messages: c.messages.map((m, i) =>
                          i === c.messages.length - 1 ? { ...m, content: assistantText } : m
                        ),
                      }
                    : c
                )
              );
            } else if (parsed.type === "error") {
              throw new Error(parsed.error);
            }
          } catch (e) {
            if (e instanceof Error && e.message !== "Unexpected end of JSON input") throw e;
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: c.messages.slice(0, -1) } : c))
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen bg-[#0A0A0F]">
      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setShowSidebar(false)} />
      )}

      {/* Conversations sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-full w-72 bg-[#13131A] border-r border-[#2A2A3A] flex flex-col transition-transform ${
          showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-[#2A2A3A]">
          <Link href="/dashboard" className="flex items-center gap-2 text-[#8888A0] hover:text-[#F0F0F5] text-sm mb-3 transition-colors">
            <ArrowLeft size={14} />
            Dashboard
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[#F0F0F5] font-bold text-sm">Plusby AI</p>
              <p className="text-[#555568] text-xs">Tu asistente de dropshipping</p>
            </div>
          </div>
          <button
            onClick={newConversation}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:opacity-90 text-white text-sm font-semibold transition-opacity"
          >
            <Plus size={14} /> Nueva conversación
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="text-center text-[#555568] text-xs px-4 py-6">Aún no hay conversaciones</p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setActiveId(c.id);
                      setShowSidebar(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2 transition-colors ${
                      c.id === activeId ? "bg-[rgba(124,58,237,0.15)] text-[#F0F0F5]" : "text-[#8888A0] hover:bg-[#1C1C26] hover:text-[#F0F0F5]"
                    }`}
                  >
                    <MessageSquare size={14} className="mt-0.5 shrink-0" />
                    <span className="flex-1 text-sm truncate">{c.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-3 border-b border-[#2A2A3A] bg-[#13131A]">
          <button onClick={() => setShowSidebar(true)} className="text-[#8888A0]">
            <MessageSquare size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-[#8B5CF6]" />
            <span className="text-[#F0F0F5] font-semibold text-sm">Plusby AI</span>
          </div>
          <button onClick={newConversation} className="text-[#8888A0]">
            <Plus size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!active || active.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4 py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#F0F0F5] mb-1">¿En qué te ayudo hoy?</h2>
              <p className="text-[#8888A0] text-sm mb-8 max-w-md">
                Pregúntame sobre productos ganadores, copys, campañas de Meta Ads, landings, escalamiento y más.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.text)}
                    className="text-left p-4 rounded-xl bg-[#13131A] border border-[#2A2A3A] hover:border-[#8B5CF6] transition-colors group"
                  >
                    <span className="text-xl mr-2">{p.icon}</span>
                    <span className="text-[#F0F0F5] text-sm group-hover:text-[#A78BFA] transition-colors">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {active.messages.map((m, i) => (
                <MessageBubble key={i} message={m} streaming={streaming && i === active.messages.length - 1 && m.role === "assistant"} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mb-2 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] flex items-start gap-2 max-w-3xl mx-auto">
            <AlertCircle size={14} className="text-[#EF4444] mt-0.5 shrink-0" />
            <p className="text-[#EF4444] text-xs">{error}</p>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[#2A2A3A] p-3 md:p-4 bg-[#13131A]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="max-w-3xl mx-auto flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Pregúntale lo que sea sobre dropshipping..."
              rows={1}
              disabled={streaming}
              className="flex-1 px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm resize-none max-h-32 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] hover:opacity-90 text-white flex items-center justify-center transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Enviar"
            >
              {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
          <p className="text-center text-[#555568] text-[10px] mt-2">
            Plusby AI puede equivocarse. Verifica datos críticos.
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, streaming }: { message: Message; streaming: boolean }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser ? "bg-[#FF6B35]" : "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]"
        }`}
      >
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
      </div>
      <div className={`max-w-[85%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser ? "bg-[#FF6B35] text-white rounded-tr-sm" : "bg-[#13131A] border border-[#2A2A3A] text-[#F0F0F5] rounded-tl-sm"
          }`}
        >
          {message.content || (streaming ? <span className="inline-block w-2 h-4 bg-[#8B5CF6] animate-pulse rounded-sm" /> : "")}
          {streaming && message.content && <span className="inline-block w-1.5 h-4 bg-[#8B5CF6] animate-pulse rounded-sm ml-1 align-middle" />}
        </div>
      </div>
    </div>
  );
}
