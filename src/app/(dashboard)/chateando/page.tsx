"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, MessageCircle, Send, Smile,
  Pin, Users, Search,
  TrendingUp, Crown, Shield, Star,
  PhoneMissed,
} from "lucide-react";

interface Message {
  id: string;
  authorId: string;
  author: string;
  avatar: string;
  avatarColor: string;
  role?: "admin" | "mentor" | "premium";
  text: string;
  time: string;
  reactions: { emoji: string; count: number; reacted: boolean }[];
  pinned?: boolean;
  replyTo?: string;
}

interface Channel {
  id: string;
  name: string;
  icon: string;
  description: string;
  unread: number;
}

const CHANNELS: Channel[] = [
  { id: "general", name: "general", icon: "#", description: "Conversaciones generales", unread: 0 },
  { id: "ventas", name: "ventas", icon: "#", description: "Tips y estrategias de ventas", unread: 3 },
  { id: "productos", name: "productos", icon: "#", description: "Recomienda productos ganadores", unread: 1 },
  { id: "meta-ads", name: "meta-ads", icon: "#", description: "Anuncios y creativos Meta", unread: 0 },
  { id: "victorias", name: "victorias", icon: "🏆", description: "Comparte tus victorias", unread: 5 },
  { id: "dropi-tips", name: "dropi-tips", icon: "📦", description: "Tips específicos de Dropi", unread: 0 },
];

const MESSAGES_BY_CHANNEL: Record<string, Message[]> = {
  general: [
    {
      id: "m1", authorId: "u1", author: "Julián García", avatar: "JG", avatarColor: "#FF6B35", role: "admin",
      text: "Bienvenidos a Plusby 🎉 Este es el espacio para crecer juntos. Compartan sus dudas, victorias y aprendizajes.",
      time: "9:00 AM",
      reactions: [{ emoji: "🔥", count: 12, reacted: false }, { emoji: "❤️", count: 8, reacted: false }],
      pinned: true,
    },
    {
      id: "m2", authorId: "u2", author: "Karen Ortiz", avatar: "KO", avatarColor: "#8B5CF6", role: "mentor",
      text: "Para los que están empezando: lo más importante es confirmar bien sus pedidos. Una tasa de confirmación alta = más ingresos reales. Úsenle el módulo de Confirma 💪",
      time: "9:15 AM",
      reactions: [{ emoji: "👍", count: 20, reacted: false }, { emoji: "✅", count: 6, reacted: false }],
    },
    {
      id: "m3", authorId: "u3", author: "Andrés Mejía", avatar: "AM", avatarColor: "#0EA5E9",
      text: "Alguien ha probado el producto de Kompras Plus del colágeno? Quiero saber si convierte bien en frío",
      time: "10:02 AM",
      reactions: [{ emoji: "🤔", count: 3, reacted: false }],
    },
    {
      id: "m4", authorId: "u4", author: "Diana Ríos", avatar: "DR", avatarColor: "#EC4899", role: "premium",
      text: "Andrés sí! Yo lo probé con tráfico de intereses de salud y belleza. ROAS de 2.8x en los primeros 7 días. El video UGC funciona mucho mejor que las imágenes estáticas.",
      time: "10:18 AM",
      reactions: [{ emoji: "🔥", count: 15, reacted: true }, { emoji: "💯", count: 9, reacted: false }],
      replyTo: "m3",
    },
    {
      id: "m5", authorId: "u3", author: "Andrés Mejía", avatar: "AM", avatarColor: "#0EA5E9",
      text: "Diana gracias! Con qué presupuesto arrancaste? Estoy pensando en 50k COP diarios para la prueba",
      time: "10:25 AM", reactions: [],
    },
    {
      id: "m6", authorId: "u4", author: "Diana Ríos", avatar: "DR", avatarColor: "#EC4899", role: "premium",
      text: "Yo arranqué con 30k/día en CBO con 3 conjuntos. Déjalo correr mínimo 3 días antes de tocar algo. Paciencia es clave con Meta 🎯",
      time: "10:40 AM",
      reactions: [{ emoji: "👍", count: 7, reacted: false }],
    },
    {
      id: "m7", authorId: "u5", author: "Felipe Castro", avatar: "FC", avatarColor: "#10B981",
      text: "Acabo de pasar 1M COP en ventas en el mes! Sin haber visto publicidad antes. Plusby me cambió la vida 🙌",
      time: "11:00 AM",
      reactions: [{ emoji: "🎉", count: 24, reacted: false }, { emoji: "🔥", count: 18, reacted: false }, { emoji: "💪", count: 12, reacted: false }],
    },
    {
      id: "m8", authorId: "u2", author: "Karen Ortiz", avatar: "KO", avatarColor: "#8B5CF6", role: "mentor",
      text: "¡Felicitaciones Felipe! Así se hace 🏆 Cuéntanos qué producto vendiste y qué estrategia usaste, eso motiva al resto de la comunidad.",
      time: "11:05 AM",
      reactions: [{ emoji: "❤️", count: 10, reacted: false }],
    },
  ],
  victorias: [
    {
      id: "v1", authorId: "u5", author: "Felipe Castro", avatar: "FC", avatarColor: "#10B981",
      text: "Primera semana: $340k en ventas con el Kit Cuidado Facial. 18 pedidos confirmados de 22 intentados. Tasa de confirmación del 82%! 🎉",
      time: "Lunes",
      reactions: [{ emoji: "🏆", count: 31, reacted: false }, { emoji: "🔥", count: 27, reacted: false }],
    },
    {
      id: "v2", authorId: "u4", author: "Diana Ríos", avatar: "DR", avatarColor: "#EC4899", role: "premium",
      text: "Mes 3 en Plusby: Ya reemplacé mi sueldo de empleada. Trabajando desde casa, en mi tiempo. Gracias comunidad 💜",
      time: "Martes",
      reactions: [{ emoji: "💜", count: 45, reacted: true }, { emoji: "🎉", count: 38, reacted: false }],
    },
  ],
  ventas: [
    {
      id: "s1", authorId: "u2", author: "Karen Ortiz", avatar: "KO", avatarColor: "#8B5CF6", role: "mentor",
      text: "Tip del día: No intentes vender a todos. Define tu avatar de cliente ideal y habla SÓLO con él en tus anuncios. La especificidad convierte mejor que lo genérico.",
      time: "8:30 AM",
      reactions: [{ emoji: "📌", count: 22, reacted: false }],
      pinned: true,
    },
  ],
  productos: [],
  "meta-ads": [],
  "dropi-tips": [],
};

const ROLE_BADGES: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  admin: { label: "Admin", color: "#FF6B35", Icon: Shield },
  mentor: { label: "Mentor", color: "#8B5CF6", Icon: Crown },
  premium: { label: "Premium", color: "#F59E0B", Icon: Star },
};

const ONLINE_MEMBERS = [
  { name: "Karen Ortiz", avatar: "KO", color: "#8B5CF6", role: "mentor" },
  { name: "Diana Ríos", avatar: "DR", color: "#EC4899", role: "premium" },
  { name: "Andrés Mejía", avatar: "AM", color: "#0EA5E9", role: undefined as string | undefined },
  { name: "Felipe Castro", avatar: "FC", color: "#10B981", role: undefined as string | undefined },
  { name: "Valentina Cruz", avatar: "VC", color: "#F59E0B", role: "premium" },
];

function AvatarEl({ initials, color, size = 8, role }: { initials: string; color: string; size?: number; role?: string }) {
  const sizeClass = size === 8 ? "w-8 h-8" : size === 7 ? "w-7 h-7" : "w-6 h-6";
  const textSize = size <= 6 ? "text-[9px]" : "text-xs";
  return (
    <div className="relative shrink-0">
      <div className={`${sizeClass} rounded-full flex items-center justify-center text-white font-black ${textSize}`} style={{ background: color }}>
        {initials}
      </div>
      {role && ROLE_BADGES[role] && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
          style={{ background: ROLE_BADGES[role].color }}>
          {(() => { const { Icon } = ROLE_BADGES[role]; return <Icon size={7} className="text-white" />; })()}
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState("general");
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(MESSAGES_BY_CHANNEL);
  const [input, setInput] = useState("");
  const [showMembers, setShowMembers] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const channelMessages = allMessages[activeChannel] ?? [];
  const currentChannel = CHANNELS.find(c => c.id === activeChannel);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChannel, channelMessages.length]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const msg: Message = {
      id: Date.now().toString(),
      authorId: "me",
      author: "Tú",
      avatar: "TÚ",
      avatarColor: "#FF6B35",
      text,
      time: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
      reactions: [],
    };
    setAllMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] ?? []), msg] }));
    setInput("");
  }

  function react(msgId: string, emoji: string) {
    setAllMessages(prev => ({
      ...prev,
      [activeChannel]: (prev[activeChannel] ?? []).map(m => {
        if (m.id !== msgId) return m;
        const existing = m.reactions.find(r => r.emoji === emoji);
        if (existing) {
          return {
            ...m,
            reactions: m.reactions.map(r =>
              r.emoji === emoji ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted } : r
            ),
          };
        }
        return { ...m, reactions: [...m.reactions, { emoji, count: 1, reacted: true }] };
      }),
    }));
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left sidebar — channels */}
      <div className="w-52 bg-[#0D0D14] border-r border-[#2A2A3A] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#2A2A3A]">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center">
              <MessageCircle size={13} className="text-white" />
            </div>
            <p className="text-[#F0F0F5] font-bold text-sm">Chateando</p>
          </div>
          <p className="text-[#555568] text-[10px]">Comunidad Plusby</p>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          <p className="text-[#555568] text-[9px] font-bold uppercase tracking-wider px-2 mb-2">Canales</p>
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left ${
                activeChannel === ch.id
                  ? "bg-[rgba(139,92,246,0.15)] text-[#F0F0F5]"
                  : "text-[#555568] hover:text-[#8888A0] hover:bg-[#1C1C26]"
              }`}
            >
              <span className="text-xs shrink-0">{ch.icon}</span>
              <span className="flex-1 text-xs font-medium truncate">{ch.name}</span>
              {ch.unread > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#8B5CF6] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                  {ch.unread}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-[#2A2A3A]">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-[#555568] hover:text-[#8888A0] text-xs transition-colors">
            <ArrowLeft size={12} /> Volver al inicio
          </Link>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0F]">
        {/* Top bar */}
        <div className="h-12 border-b border-[#2A2A3A] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[#8888A0] text-sm">{currentChannel?.icon ?? "#"}</span>
            <span className="text-[#F0F0F5] font-bold text-sm">{currentChannel?.name}</span>
            <span className="text-[#555568] text-xs hidden md:block">— {currentChannel?.description}</span>
          </div>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
              showMembers ? "bg-[rgba(139,92,246,0.1)] text-[#A78BFA]" : "text-[#555568] hover:text-[#F0F0F5] hover:bg-[#1C1C26]"
            }`}
          >
            <Users size={13} /> {ONLINE_MEMBERS.length}
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages column */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {channelMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                  <MessageCircle size={40} className="text-[#2A2A3A]" />
                  <p className="text-[#555568] text-sm">Sé el primero en escribir en #{currentChannel?.name}</p>
                </div>
              )}

              {channelMessages.map((msg, i) => {
                const prev = channelMessages[i - 1];
                const grouped = prev && prev.authorId === msg.authorId;
                const replyMsg = msg.replyTo ? channelMessages.find(m => m.id === msg.replyTo) : null;

                return (
                  <div
                    key={msg.id}
                    className={`group flex gap-3 rounded-xl px-2 py-1 hover:bg-[#13131A] transition-colors ${
                      msg.pinned ? "bg-[rgba(255,107,53,0.04)] border border-[rgba(255,107,53,0.08)]" : ""
                    }`}
                  >
                    <div className="w-8 shrink-0 pt-0.5 flex items-start justify-center">
                      {!grouped
                        ? <AvatarEl initials={msg.avatar} color={msg.avatarColor} size={8} role={msg.role} />
                        : <span className="text-[#2A2A3A] text-[9px] mt-1 opacity-0 group-hover:opacity-100">{msg.time}</span>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      {!grouped && (
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-[#F0F0F5] text-sm font-bold">{msg.author}</span>
                          {msg.role && ROLE_BADGES[msg.role] && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{
                              background: ROLE_BADGES[msg.role].color + "15",
                              color: ROLE_BADGES[msg.role].color,
                            }}>
                              {ROLE_BADGES[msg.role].label}
                            </span>
                          )}
                          <span className="text-[#555568] text-[10px]">{msg.time}</span>
                          {msg.pinned && (
                            <span className="flex items-center gap-0.5 text-[9px] text-[#FF6B35]">
                              <Pin size={8} /> fijado
                            </span>
                          )}
                        </div>
                      )}

                      {replyMsg && (
                        <div className="mb-1 pl-2 border-l-2 border-[#2A2A3A]">
                          <span className="text-[#555568] text-[10px]">{replyMsg.author}: {replyMsg.text.slice(0, 60)}…</span>
                        </div>
                      )}

                      <p className="text-[#D0D0E0] text-sm leading-relaxed">{msg.text}</p>

                      {msg.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {msg.reactions.filter(r => r.count > 0).map(r => (
                            <button
                              key={r.emoji}
                              onClick={() => react(msg.id, r.emoji)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                                r.reacted
                                  ? "bg-[rgba(139,92,246,0.15)] border-[rgba(139,92,246,0.3)] text-[#A78BFA]"
                                  : "bg-[#1C1C26] border-[#2A2A3A] text-[#8888A0] hover:border-[#3A3A4A]"
                              }`}
                            >
                              {r.emoji} <span className="font-bold">{r.count}</span>
                            </button>
                          ))}
                          <button
                            onClick={() => react(msg.id, "👍")}
                            className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 rounded-full bg-[#1C1C26] border border-[#2A2A3A] hover:bg-[#2A2A3A] transition-all"
                          >
                            <Smile size={10} className="text-[#555568]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#2A2A3A] shrink-0">
              <div className="flex items-end gap-2 bg-[#13131A] border border-[#2A2A3A] rounded-2xl px-4 py-3 focus-within:border-[#8B5CF6] transition-colors">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={`Mensaje en #${currentChannel?.name ?? "general"}…`}
                  rows={1}
                  className="flex-1 bg-transparent text-[#F0F0F5] placeholder-[#555568] text-sm resize-none focus:outline-none leading-relaxed max-h-28 overflow-y-auto"
                  style={{ scrollbarWidth: "none" }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={14} className="text-white" />
                </button>
              </div>
              <p className="text-[#2A2A3A] text-[10px] mt-1 px-1">Enter para enviar · Shift+Enter nueva línea</p>
            </div>
          </div>

          {/* Members sidebar */}
          {showMembers && (
            <div className="w-44 border-l border-[#2A2A3A] bg-[#0D0D14] p-3 overflow-y-auto shrink-0">
              <p className="text-[#555568] text-[9px] font-bold uppercase tracking-wider mb-2">
                En línea — {ONLINE_MEMBERS.length}
              </p>
              <div className="space-y-2.5">
                {ONLINE_MEMBERS.map(m => (
                  <div key={m.name} className="flex items-center gap-2">
                    <div className="relative">
                      <AvatarEl initials={m.avatar} color={m.color} size={7} role={m.role ?? undefined} />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#0D0D14]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#8888A0] text-[10px] truncate">{m.name}</p>
                      {m.role && (
                        <p className="text-[9px]" style={{ color: ROLE_BADGES[m.role]?.color }}>
                          {ROLE_BADGES[m.role]?.label}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-[#2A2A3A] space-y-2">
                {[
                  { label: "Miembros", value: "1,247", color: "#8B5CF6", Icon: Users },
                  { label: "Mensajes hoy", value: "342", color: "#10B981", Icon: MessageCircle },
                  { label: "Victorias", value: "89", color: "#F59E0B", Icon: TrendingUp },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <s.Icon size={10} style={{ color: s.color }} />
                    <span className="text-[#555568] text-[9px] flex-1">{s.label}</span>
                    <span className="text-[#F0F0F5] text-[9px] font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
