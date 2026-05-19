"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Play, Check, Lock, ChevronDown, ChevronRight,
  Star, MessageCircle, Send, Loader2, Layers, Clock, User,
  ChevronLeft, BookOpen, Reply, Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  instructor: string | null;
  category: string | null;
  level: string;
}

interface Module {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  duration: string | null;
  position: number;
  is_free: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: { full_name: string | null; email: string } | null;
  replies?: Comment[];
}

// ─── Video player ─────────────────────────────────────────────

function getEmbed(url: string): { type: "iframe" | "video"; src: string } | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) return { type: "iframe", src: `https://www.youtube.com/embed/${yt[1]}?rel=0` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { type: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };
  return { type: "video", src: url };
}

function VideoPlayer({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="w-full aspect-video bg-[#0A0A0F] rounded-2xl flex flex-col items-center justify-center border border-[#2A2A3A]">
        <Play size={40} className="text-[#2A2A3A] mb-3" />
        <p className="text-[#555568] text-sm">Video no disponible todavía</p>
      </div>
    );
  }
  const embed = getEmbed(url);
  if (!embed) return null;
  if (embed.type === "iframe") {
    return (
      <div className="w-full aspect-video rounded-2xl overflow-hidden border border-[#2A2A3A] bg-black">
        <iframe src={embed.src} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    );
  }
  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-[#2A2A3A] bg-black">
      <video src={embed.src} controls className="w-full h-full" />
    </div>
  );
}

// ─── Star rating ──────────────────────────────────────────────

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(i)}>
          <Star size={20} className={`transition-colors ${i <= (hovered || value) ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#2A2A3A]"}`} />
        </button>
      ))}
      {value > 0 && <span className="text-[#F59E0B] text-sm font-semibold ml-1">{value}/5</span>}
    </div>
  );
}

function StarDisplay({ avg, count }: { avg: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={14} className={i <= Math.round(avg) ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#2A2A3A]"} />
        ))}
      </div>
      {count > 0 && (
        <span className="text-[#F59E0B] font-bold text-sm">{avg.toFixed(1)}</span>
      )}
      <span className="text-[#555568] text-xs">({count} calificaciones)</span>
    </div>
  );
}

// ─── Comments ─────────────────────────────────────────────────

function CommentItem({
  comment, currentUserId, isAdmin, onReply, onDelete,
}: {
  comment: Comment;
  currentUserId: string;
  isAdmin: boolean;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const name = comment.profiles?.full_name || comment.profiles?.email?.split("@")[0] || "Usuario";
  const initials = name.slice(0, 2).toUpperCase();
  const canDelete = isAdmin || comment.user_id === currentUserId;

  async function handleReply() {
    if (!replyText.trim()) return;
    setSending(true);
    await onReply(comment.id, replyText.trim());
    setReplyText("");
    setShowReply(false);
    setSending(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <div className="bg-[#1C1C26] rounded-xl px-3 py-2.5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[#F0F0F5] text-xs font-semibold">{name}</p>
              <p className="text-[#555568] text-[10px]">
                {new Date(comment.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
              </p>
            </div>
            <p className="text-[#8888A0] text-sm leading-relaxed">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 px-1">
            <button onClick={() => setShowReply(p => !p)} className="flex items-center gap-1 text-[#555568] hover:text-[#FF6B35] text-xs transition-colors">
              <Reply size={11} /> Responder
            </button>
            {canDelete && (
              <button onClick={() => onDelete(comment.id)} className="flex items-center gap-1 text-[#555568] hover:text-[#EF4444] text-xs transition-colors">
                <Trash2 size={11} /> Eliminar
              </button>
            )}
          </div>
          {showReply && (
            <div className="flex gap-2 mt-2">
              <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Escribe tu respuesta..."
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                className="flex-1 px-3 py-2 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] text-xs" />
              <button onClick={handleReply} disabled={sending || !replyText.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-xs font-semibold transition-colors disabled:opacity-50">
                {sending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {(comment.replies ?? []).length > 0 && (
        <div className="ml-11 space-y-2 border-l-2 border-[#2A2A3A] pl-4">
          {(comment.replies ?? []).map(reply => (
            <CommentItem key={reply.id} comment={reply} currentUserId={currentUserId} isAdmin={isAdmin} onReply={onReply} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────

export default function CoursePlayerPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const [userRating, setUserRating] = useState(0);
  const [savingRating, setSavingRating] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  const [currentUserId, setCurrentUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"descripcion" | "comentarios" | "calificacion">("descripcion");

  // Load course + modules + lessons
  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        setIsAdmin(["admin", "superadmin"].includes(user.user_metadata?.role ?? ""));
      }

      const { data: courseData } = await supabase.from("courses").select("*").eq("id", courseId).single();
      if (courseData) setCourse(courseData);

      const { data: modsData } = await supabase.from("course_modules").select("*").eq("course_id", courseId).order("position");
      if (modsData) {
        const modulesWithLessons: Module[] = await Promise.all(
          modsData.map(async (mod) => {
            const { data: lessonsData } = await supabase.from("lessons").select("*").eq("module_id", mod.id).order("position");
            return { ...mod, lessons: lessonsData ?? [] };
          })
        );
        setModules(modulesWithLessons);
        // Auto-expand first module and select first lesson
        if (modulesWithLessons.length > 0) {
          setExpandedModules(new Set([modulesWithLessons[0].id]));
          const firstLesson = modulesWithLessons[0].lessons[0];
          if (firstLesson) setActiveLesson(firstLesson);
        }
      }
      setLoading(false);
    }
    load();
  }, [courseId]);

  // Load comments and ratings when lesson changes
  useEffect(() => {
    if (!activeLesson) return;
    loadComments();
    loadRating();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLesson?.id]);

  async function loadComments() {
    if (!activeLesson) return;
    setCommentsLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("lesson_comments")
      .select("*, profiles(full_name, email)")
      .eq("lesson_id", activeLesson.id)
      .is("parent_id", null)
      .order("created_at", { ascending: false });

    if (data) {
      // Load replies for each comment
      const withReplies = await Promise.all(
        (data as Comment[]).map(async (comment) => {
          const { data: replies } = await supabase
            .from("lesson_comments")
            .select("*, profiles(full_name, email)")
            .eq("parent_id", comment.id)
            .order("created_at");
          return { ...comment, replies: (replies ?? []) as Comment[] };
        })
      );
      setComments(withReplies);
    }
    setCommentsLoading(false);
  }

  async function loadRating() {
    if (!activeLesson) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Load user's own rating
    if (user) {
      const { data: own } = await supabase.from("lesson_ratings").select("rating").eq("lesson_id", activeLesson.id).eq("user_id", user.id).single();
      setUserRating(own?.rating ?? 0);
    }

    // Load average
    const { data: all } = await supabase.from("lesson_ratings").select("rating").eq("lesson_id", activeLesson.id);
    if (all && all.length > 0) {
      const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
      setAvgRating(avg);
      setRatingCount(all.length);
    } else {
      setAvgRating(0);
      setRatingCount(0);
    }
  }

  async function handleComment() {
    if (!commentText.trim() || !activeLesson) return;
    setSendingComment(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("lesson_comments")
      .insert({ lesson_id: activeLesson.id, user_id: user.id, content: commentText.trim() })
      .select("*, profiles(full_name, email)").single();
    if (data) setComments(p => [{ ...data as Comment, replies: [] }, ...p]);
    setCommentText("");
    setSendingComment(false);
  }

  async function handleReply(parentId: string, content: string) {
    if (!activeLesson) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("lesson_comments")
      .insert({ lesson_id: activeLesson.id, user_id: user.id, parent_id: parentId, content })
      .select("*, profiles(full_name, email)").single();
    if (data) {
      setComments(p => p.map(c => c.id === parentId ? { ...c, replies: [...(c.replies ?? []), data as Comment] } : c));
    }
  }

  async function handleDelete(commentId: string) {
    const supabase = createClient();
    await supabase.from("lesson_comments").delete().eq("id", commentId);
    setComments(p => p.filter(c => c.id !== commentId).map(c => ({ ...c, replies: (c.replies ?? []).filter(r => r.id !== commentId) })));
  }

  async function handleRating(rating: number) {
    if (!activeLesson) return;
    setSavingRating(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("lesson_ratings").upsert({ lesson_id: activeLesson.id, user_id: user.id, rating }, { onConflict: "lesson_id,user_id" });
    setUserRating(rating);
    await loadRating();
    setSavingRating(false);
  }

  function toggleModule(modId: string) {
    setExpandedModules(p => {
      const n = new Set(p);
      if (n.has(modId)) n.delete(modId); else n.add(modId);
      return n;
    });
  }

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const lessonIndex = modules.flatMap(m => m.lessons).findIndex(l => l.id === activeLesson?.id);
  const allLessons = modules.flatMap(m => m.lessons);
  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
          <p className="text-[#555568] text-sm">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0A0A0F] gap-4">
        <BookOpen size={40} className="text-[#2A2A3A]" />
        <p className="text-[#F0F0F5] font-bold">Curso no encontrado</p>
        <Link href="/academia" className="text-[#FF6B35] text-sm hover:underline">Volver a Academia</Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0A0F] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? "w-72" : "w-0"} flex-shrink-0 transition-all duration-300 overflow-hidden border-r border-[#2A2A3A] bg-[#13131A] flex flex-col`}>
        <div className="p-4 border-b border-[#2A2A3A] flex-shrink-0">
          <Link href="/academia" className="flex items-center gap-2 text-[#8888A0] hover:text-[#F0F0F5] transition-colors text-sm mb-3">
            <ArrowLeft size={14} /> Academia
          </Link>
          <p className="text-[#F0F0F5] font-bold text-sm leading-tight">{course.title}</p>
          <p className="text-[#555568] text-xs mt-1">{course.instructor} · {totalLessons} lecciones</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {modules.map(mod => {
            const isOpen = expandedModules.has(mod.id);
            return (
              <div key={mod.id}>
                <button onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-[#1C1C26] transition-colors text-left">
                  <Layers size={12} className="text-[#8B5CF6] shrink-0" />
                  <p className="text-[#F0F0F5] text-xs font-semibold flex-1 leading-tight">{mod.title}</p>
                  {isOpen ? <ChevronDown size={11} className="text-[#555568]" /> : <ChevronRight size={11} className="text-[#555568]" />}
                </button>
                {isOpen && (
                  <div className="pb-1">
                    {mod.lessons.map((lesson, idx) => {
                      const isActive = activeLesson?.id === lesson.id;
                      return (
                        <button key={lesson.id} onClick={() => setActiveLesson(lesson)}
                          className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors ${
                            isActive ? "bg-[rgba(255,107,53,0.1)] border-l-2 border-[#FF6B35]" : "hover:bg-[#1C1C26]"
                          }`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${isActive ? "bg-[#FF6B35] text-white" : "bg-[#2A2A3A] text-[#555568]"}`}>
                            {isActive ? <Play size={8} /> : idx + 1}
                          </div>
                          <p className={`text-xs flex-1 leading-tight ${isActive ? "text-[#FF6B35] font-semibold" : "text-[#8888A0]"}`}>
                            {lesson.title}
                          </p>
                          {lesson.duration && (
                            <span className="text-[9px] text-[#555568] shrink-0">{lesson.duration}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-[#13131A]/95 backdrop-blur border-b border-[#2A2A3A]">
          <button onClick={() => setSidebarOpen(p => !p)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#F0F0F5] hover:bg-[#1C1C26] transition-colors">
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[#F0F0F5] font-semibold text-sm truncate">{activeLesson?.title ?? course.title}</p>
          </div>
          {ratingCount > 0 && (
            <StarDisplay avg={avgRating} count={ratingCount} />
          )}
        </div>

        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
          {/* Video */}
          <VideoPlayer url={activeLesson?.video_url ?? null} />

          {/* Nav prev/next */}
          <div className="flex items-center justify-between">
            <button onClick={() => prevLesson && setActiveLesson(prevLesson)} disabled={!prevLesson}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] hover:border-[#3A3A4A] transition-colors text-sm disabled:opacity-30">
              <ChevronLeft size={14} /> Anterior
            </button>
            <span className="text-[#555568] text-xs">{lessonIndex + 1} / {totalLessons}</span>
            <button onClick={() => nextLesson && setActiveLesson(nextLesson)} disabled={!nextLesson}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] hover:border-[#3A3A4A] transition-colors text-sm disabled:opacity-30">
              Siguiente <ChevronRight size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#13131A] border border-[#2A2A3A] rounded-xl p-1">
            {(["descripcion", "comentarios", "calificacion"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  activeTab === tab ? "bg-[#FF6B35] text-white" : "text-[#8888A0] hover:text-[#F0F0F5]"
                }`}>
                {tab === "descripcion" ? "Descripción" : tab === "comentarios" ? `Comentarios (${comments.length})` : "Calificación"}
              </button>
            ))}
          </div>

          {/* Tab: Descripción */}
          {activeTab === "descripcion" && (
            <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5">
              <h2 className="text-[#F0F0F5] font-bold text-lg mb-2">{activeLesson?.title}</h2>
              <div className="flex items-center gap-3 mb-4">
                {activeLesson?.duration && (
                  <span className="flex items-center gap-1.5 text-[#555568] text-xs">
                    <Clock size={12} /> {activeLesson.duration}
                  </span>
                )}
                {activeLesson?.is_free && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.1)] text-[#10B981] font-semibold">Gratis</span>
                )}
              </div>
              {activeLesson?.description ? (
                <p className="text-[#8888A0] text-sm leading-relaxed">{activeLesson.description}</p>
              ) : (
                <p className="text-[#555568] text-sm">Sin descripción disponible.</p>
              )}
            </div>
          )}

          {/* Tab: Comentarios */}
          {activeTab === "comentarios" && (
            <div className="space-y-4">
              {/* New comment */}
              <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-4">
                <p className="text-[#F0F0F5] font-semibold text-sm mb-3 flex items-center gap-2">
                  <MessageCircle size={14} className="text-[#FF6B35]" /> Deja tu comentario
                </p>
                <div className="flex gap-2">
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                    placeholder="¿Tienes alguna pregunta o comentario sobre esta lección?"
                    rows={3}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] text-sm resize-none" />
                </div>
                <div className="flex justify-end mt-2">
                  <button onClick={handleComment} disabled={sendingComment || !commentText.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-sm font-semibold transition-colors disabled:opacity-50">
                    {sendingComment ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    Enviar
                  </button>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-4">
                {commentsLoading ? (
                  <div className="flex items-center gap-2 py-6 justify-center text-[#555568]">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Cargando comentarios...</span>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <MessageCircle size={28} className="text-[#2A2A3A]" />
                    <p className="text-[#555568] text-sm">Sé el primero en comentar esta lección.</p>
                  </div>
                ) : (
                  comments.map(c => (
                    <CommentItem key={c.id} comment={c} currentUserId={currentUserId} isAdmin={isAdmin} onReply={handleReply} onDelete={handleDelete} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab: Calificación */}
          {activeTab === "calificacion" && (
            <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5 space-y-5">
              <div>
                <p className="text-[#F0F0F5] font-bold text-sm mb-1">Calificación general</p>
                <StarDisplay avg={avgRating} count={ratingCount} />
              </div>
              <div className="h-px bg-[#2A2A3A]" />
              <div>
                <p className="text-[#F0F0F5] font-semibold text-sm mb-3">Tu calificación</p>
                <StarRatingInput value={userRating} onChange={handleRating} />
                {savingRating && (
                  <p className="flex items-center gap-1.5 text-[#555568] text-xs mt-2">
                    <Loader2 size={11} className="animate-spin" /> Guardando...
                  </p>
                )}
                {userRating > 0 && !savingRating && (
                  <p className="flex items-center gap-1.5 text-[#10B981] text-xs mt-2">
                    <Check size={11} /> Gracias por tu calificación
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
