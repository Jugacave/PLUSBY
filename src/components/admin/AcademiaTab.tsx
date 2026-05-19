"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, ChevronDown, ChevronRight, Pencil, Trash2, Eye, EyeOff,
  Loader2, Upload, Link as LinkIcon, Play, Check, X, BookOpen,
  Video, Image as ImageIcon, Clock, Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────

interface SupaCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  instructor: string | null;
  category: string | null;
  level: string;
  published: boolean;
  created_at: string;
}

interface SupaModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
}

interface SupaLesson {
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

// ─── Helpers ─────────────────────────────────────────────────

function videoIcon(url: string | null) {
  if (!url) return null;
  if (url.includes("youtube") || url.includes("youtu.be")) return "YT";
  if (url.includes("vimeo")) return "VM";
  return "▶";
}

const LEVELS = ["Básico", "Intermedio", "Avanzado"];

// ─── Lesson Modal ─────────────────────────────────────────────

function LessonModal({
  moduleId, lesson, onSave, onClose,
}: {
  moduleId: string;
  lesson: SupaLesson | null;
  onSave: (l: SupaLesson) => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"thumb" | "video" | null>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: lesson?.title ?? "",
    description: lesson?.description ?? "",
    thumbnail_url: lesson?.thumbnail_url ?? "",
    video_url: lesson?.video_url ?? "",
    duration: lesson?.duration ?? "",
    is_free: lesson?.is_free ?? false,
  });

  function set(k: string, v: string | boolean) {
    setForm(p => ({ ...p, [k]: v }));
  }

  async function uploadFile(file: File, type: "thumb" | "video"): Promise<string | null> {
    setUploading(type);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${type === "thumb" ? "thumbnails" : "videos"}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("academy").upload(path, file, { upsert: true });
    setUploading(null);
    if (error) { alert("Error subiendo archivo. Asegúrate de crear el bucket 'academy' en Supabase Storage."); return null; }
    const { data } = supabase.storage.from("academy").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleThumbFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "thumb");
    if (url) set("thumbnail_url", url);
  }

  async function handleVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "video");
    if (url) set("video_url", url);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    if (lesson) {
      const { data, error } = await supabase.from("lessons").update({
        title: form.title, description: form.description || null,
        thumbnail_url: form.thumbnail_url || null, video_url: form.video_url || null,
        duration: form.duration || null, is_free: form.is_free,
      }).eq("id", lesson.id).select().single();
      if (error) { setSaveError(error.message); setSaving(false); return; }
      if (data) { onSave(data as SupaLesson); onClose(); }
    } else {
      const { data: maxPos } = await supabase.from("lessons").select("position").eq("module_id", moduleId).order("position", { ascending: false }).limit(1).single();
      const position = (maxPos?.position ?? 0) + 1;
      const { data, error } = await supabase.from("lessons").insert({
        module_id: moduleId, title: form.title, description: form.description || null,
        thumbnail_url: form.thumbnail_url || null, video_url: form.video_url || null,
        duration: form.duration || null, is_free: form.is_free, position,
      }).select().single();
      if (error) { setSaveError(error.message); setSaving(false); return; }
      if (data) { onSave(data as SupaLesson); onClose(); }
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#2A2A3A]">
          <p className="text-[#F0F0F5] font-bold">{lesson ? "Editar lección" : "Nueva lección"}</p>
          <button onClick={onClose} className="text-[#555568] hover:text-[#F0F0F5]"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5">Título *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="V01 — Título de la lección"
              className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5">Descripción</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
              placeholder="En este video vas a aprender..."
              className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] text-sm resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5">Duración</label>
            <input value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="12-15 min"
              className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] text-sm" />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={11} /> Miniatura del video
            </label>
            <div className="flex gap-2">
              <input value={form.thumbnail_url} onChange={e => set("thumbnail_url", e.target.value)} placeholder="URL de imagen o sube un archivo"
                className="flex-1 px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] text-sm" />
              <button onClick={() => thumbRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] hover:border-[#3A3A4A] transition-colors text-xs whitespace-nowrap">
                {uploading === "thumb" ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                Subir
              </button>
              <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbFile} />
            </div>
            {form.thumbnail_url && (
              <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border border-[#2A2A3A]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.thumbnail_url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>

          {/* Video */}
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5 flex items-center gap-1.5">
              <Video size={11} /> Video (URL o archivo)
            </label>
            <div className="flex gap-2">
              <input value={form.video_url} onChange={e => set("video_url", e.target.value)}
                placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                className="flex-1 px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] text-sm" />
              <button onClick={() => videoRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] hover:border-[#3A3A4A] transition-colors text-xs whitespace-nowrap">
                {uploading === "video" ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                Subir
              </button>
              <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoFile} />
            </div>
            {form.video_url && (
              <p className="mt-1.5 text-[10px] text-[#10B981] flex items-center gap-1">
                <Check size={10} /> Video configurado
              </p>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set("is_free", !form.is_free)}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.is_free ? "bg-[#FF6B35]" : "bg-[#2A2A3A]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.is_free ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-[#8888A0] text-sm">Lección gratuita (visible sin plan)</span>
          </label>
        </div>
        {saveError && (
          <div className="mx-5 mb-3 px-3 py-2 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)]">
            <p className="text-[#EF4444] text-xs font-medium">Error: {saveError}</p>
            {saveError.includes("relation") && (
              <p className="text-[#EF4444] text-[10px] mt-0.5">Ejecuta la migración <code>002_academy.sql</code> en Supabase SQL Editor primero.</p>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2 p-5 border-t border-[#2A2A3A]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] text-sm transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {saving && <Loader2 size={13} className="animate-spin" />}
            {lesson ? "Guardar cambios" : "Crear lección"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Course Modal ─────────────────────────────────────────────

function CourseModal({
  course, onSave, onClose,
}: {
  course: SupaCourse | null;
  onSave: (c: SupaCourse) => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const thumbRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: course?.title ?? "",
    description: course?.description ?? "",
    thumbnail_url: course?.thumbnail_url ?? "",
    instructor: course?.instructor ?? "",
    category: course?.category ?? "",
    level: course?.level ?? "Básico",
    published: course?.published ?? false,
  });

  function set(k: string, v: string | boolean) { setForm(p => ({ ...p, [k]: v })); }

  async function handleThumbFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `thumbnails/course_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("academy").upload(path, file, { upsert: true });
    setUploading(false);
    if (error) { alert("Error subiendo imagen. Crea el bucket 'academy' en Supabase Storage."); return; }
    const { data } = supabase.storage.from("academy").getPublicUrl(path);
    set("thumbnail_url", data.publicUrl);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    if (course) {
      const { data, error } = await supabase.from("courses").update(form).eq("id", course.id).select().single();
      if (error) { setSaveError(error.message); setSaving(false); return; }
      if (data) { onSave(data as SupaCourse); onClose(); }
    } else {
      const { data, error } = await supabase.from("courses").insert(form).select().single();
      if (error) { setSaveError(error.message); setSaving(false); return; }
      if (data) { onSave(data as SupaCourse); onClose(); }
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#2A2A3A]">
          <p className="text-[#F0F0F5] font-bold">{course ? "Editar curso" : "Nuevo curso"}</p>
          <button onClick={onClose} className="text-[#555568] hover:text-[#F0F0F5]"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5">Título *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Nombre del curso"
              className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5">Descripción</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8888A0] mb-1.5">Instructor</label>
              <input value={form.instructor} onChange={e => set("instructor", e.target.value)} placeholder="Nombre del instructor"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8888A0] mb-1.5">Categoría</label>
              <input value={form.category} onChange={e => set("category", e.target.value)} placeholder="Dropshipping, Meta Ads..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5">Nivel</label>
            <select value={form.level} onChange={e => set("level", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] focus:outline-none focus:border-[#FF6B35] text-sm">
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={11} /> Miniatura del curso
            </label>
            <div className="flex gap-2">
              <input value={form.thumbnail_url} onChange={e => set("thumbnail_url", e.target.value)} placeholder="URL de imagen"
                className="flex-1 px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] text-sm" />
              <button onClick={() => thumbRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] transition-colors text-xs whitespace-nowrap">
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                Subir
              </button>
              <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbFile} />
            </div>
            {form.thumbnail_url && (
              <div className="mt-2 w-full h-28 rounded-lg overflow-hidden border border-[#2A2A3A]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.thumbnail_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set("published", !form.published)}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.published ? "bg-[#10B981]" : "bg-[#2A2A3A]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.published ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-[#8888A0] text-sm">Curso publicado (visible para usuarios)</span>
          </label>
        </div>
        {saveError && (
          <div className="mx-5 mb-3 px-3 py-2 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)]">
            <p className="text-[#EF4444] text-xs font-medium">Error: {saveError}</p>
            {saveError.includes("relation") && (
              <p className="text-[#EF4444] text-[10px] mt-0.5">Ejecuta la migración <code>002_academy.sql</code> en Supabase SQL Editor primero.</p>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2 p-5 border-t border-[#2A2A3A]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] text-sm transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {saving && <Loader2 size={13} className="animate-spin" />}
            {course ? "Guardar cambios" : "Crear curso"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main AcademiaTab ─────────────────────────────────────────

export function AcademiaTab() {
  const [courses, setCourses] = useState<SupaCourse[]>([]);
  const [modules, setModules] = useState<Record<string, SupaModule[]>>({});
  const [lessons, setLessons] = useState<Record<string, SupaLesson[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [courseModal, setCourseModal] = useState<SupaCourse | null | true>(null);
  const [lessonModal, setLessonModal] = useState<{ moduleId: string; lesson: SupaLesson | null } | null>(null);
  const [newModuleForm, setNewModuleForm] = useState<{ courseId: string; title: string } | null>(null);
  const [savingModule, setSavingModule] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses(data ?? []);
    setLoading(false);
  }

  async function loadModules(courseId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("course_modules").select("*").eq("course_id", courseId).order("position");
    setModules(p => ({ ...p, [courseId]: data ?? [] }));
  }

  async function loadLessons(moduleId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("lessons").select("*").eq("module_id", moduleId).order("position");
    setLessons(p => ({ ...p, [moduleId]: data ?? [] }));
  }

  async function toggleExpanseCourse(courseId: string) {
    if (expandedCourse === courseId) { setExpandedCourse(null); return; }
    setExpandedCourse(courseId);
    if (!modules[courseId]) await loadModules(courseId);
  }

  async function toggleExpanseModule(moduleId: string) {
    if (expandedModule === moduleId) { setExpandedModule(null); return; }
    setExpandedModule(moduleId);
    if (!lessons[moduleId]) await loadLessons(moduleId);
  }

  async function togglePublish(course: SupaCourse) {
    const supabase = createClient();
    await supabase.from("courses").update({ published: !course.published }).eq("id", course.id);
    setCourses(p => p.map(c => c.id === course.id ? { ...c, published: !c.published } : c));
  }

  async function deleteCourse(id: string) {
    if (!confirm("¿Eliminar el curso y todo su contenido?")) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("courses").delete().eq("id", id);
    setCourses(p => p.filter(c => c.id !== id));
    setDeleting(null);
  }

  async function deleteModule(courseId: string, moduleId: string) {
    if (!confirm("¿Eliminar este módulo y todas sus lecciones?")) return;
    const supabase = createClient();
    await supabase.from("course_modules").delete().eq("id", moduleId);
    setModules(p => ({ ...p, [courseId]: (p[courseId] ?? []).filter(m => m.id !== moduleId) }));
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm("¿Eliminar esta lección?")) return;
    const supabase = createClient();
    await supabase.from("lessons").delete().eq("id", lessonId);
    setLessons(p => ({ ...p, [moduleId]: (p[moduleId] ?? []).filter(l => l.id !== lessonId) }));
  }

  async function saveModule() {
    if (!newModuleForm?.title.trim()) return;
    setSavingModule(true);
    const supabase = createClient();
    const courseModules = modules[newModuleForm.courseId] ?? [];
    const position = (courseModules[courseModules.length - 1]?.position ?? 0) + 1;
    const { data } = await supabase.from("course_modules").insert({
      course_id: newModuleForm.courseId, title: newModuleForm.title, position,
    }).select().single();
    if (data) {
      setModules(p => ({ ...p, [newModuleForm.courseId]: [...(p[newModuleForm.courseId] ?? []), data as SupaModule] }));
    }
    setNewModuleForm(null);
    setSavingModule(false);
  }

  const totalLessons = Object.values(lessons).flat().length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-[#555568]">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Cargando academia...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courseModal && (
        <CourseModal
          course={courseModal === true ? null : courseModal}
          onSave={saved => {
            setCourses(p => courseModal === true ? [saved, ...p] : p.map(c => c.id === saved.id ? saved : c));
          }}
          onClose={() => setCourseModal(null)}
        />
      )}
      {lessonModal && (
        <LessonModal
          moduleId={lessonModal.moduleId}
          lesson={lessonModal.lesson}
          onSave={saved => {
            setLessons(p => ({
              ...p,
              [lessonModal.moduleId]: lessonModal.lesson
                ? (p[lessonModal.moduleId] ?? []).map(l => l.id === saved.id ? saved : l)
                : [...(p[lessonModal.moduleId] ?? []), saved],
            }));
          }}
          onClose={() => setLessonModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-[#8888A0] text-xs">{courses.length} cursos · {Object.values(modules).flat().length} módulos · {totalLessons} lecciones</p>
        </div>
        <button onClick={() => setCourseModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-sm font-semibold transition-colors">
          <Plus size={14} /> Nuevo Curso
        </button>
      </div>

      {courses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-[#2A2A3A] rounded-2xl">
          <BookOpen size={28} className="text-[#2A2A3A]" />
          <p className="text-[#8888A0] text-sm">No hay cursos. Crea el primero.</p>
        </div>
      )}

      {/* Course list */}
      {courses.map(course => {
        const isExpanded = expandedCourse === course.id;
        const courseMods = modules[course.id] ?? [];

        return (
          <div key={course.id} className="rounded-2xl border border-[#2A2A3A] bg-[#13131A] overflow-hidden">
            {/* Course header */}
            <div className="flex items-center gap-3 p-4">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[#2A2A3A] bg-[#1C1C26] flex items-center justify-center">
                {course.thumbnail_url
                  ? <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  : <BookOpen size={20} className="text-[#555568]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[#F0F0F5] font-semibold text-sm">{course.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${course.published ? "bg-[rgba(16,185,129,0.1)] text-[#10B981]" : "bg-[rgba(85,85,104,0.2)] text-[#555568]"}`}>
                    {course.published ? "Publicado" : "Borrador"}
                  </span>
                </div>
                <p className="text-[#555568] text-xs mt-0.5">
                  {course.instructor ?? "Sin instructor"} · {course.category ?? "Sin categoría"} · {course.level}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => togglePublish(course)} title={course.published ? "Despublicar" : "Publicar"}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#F0F0F5] hover:bg-[#2A2A3A] transition-colors">
                  {course.published ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button onClick={() => setCourseModal(course)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#F0F0F5] hover:bg-[#2A2A3A] transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => deleteCourse(course.id)} disabled={deleting === course.id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] transition-colors">
                  {deleting === course.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
                <button onClick={() => toggleExpanseCourse(course.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#F0F0F5] hover:bg-[#2A2A3A] transition-colors">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>

            {/* Modules */}
            {isExpanded && (
              <div className="border-t border-[#2A2A3A]">
                <div className="p-3 space-y-2">
                  {courseMods.length === 0 && !newModuleForm && (
                    <p className="text-[#555568] text-xs text-center py-4">Sin módulos. Agrega el primero.</p>
                  )}
                  {courseMods.map(mod => {
                    const isModExpanded = expandedModule === mod.id;
                    const modLessons = lessons[mod.id] ?? [];
                    return (
                      <div key={mod.id} className="rounded-xl border border-[#2A2A3A] bg-[#0D0D14] overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <Layers size={13} className="text-[#8B5CF6] shrink-0" />
                          <p className="text-[#F0F0F5] text-sm font-medium flex-1">{mod.title}</p>
                          <span className="text-[10px] text-[#555568]">{modLessons.length} lecciones</span>
                          <button onClick={() => setLessonModal({ moduleId: mod.id, lesson: null })}
                            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-[rgba(255,107,53,0.1)] text-[#FF6B35] hover:bg-[rgba(255,107,53,0.2)] transition-colors">
                            <Plus size={9} /> Lección
                          </button>
                          <button onClick={() => deleteModule(course.id, mod.id)}
                            className="w-6 h-6 flex items-center justify-center rounded text-[#555568] hover:text-[#EF4444] transition-colors">
                            <Trash2 size={11} />
                          </button>
                          <button onClick={() => toggleExpanseModule(mod.id)}
                            className="w-6 h-6 flex items-center justify-center rounded text-[#555568] hover:text-[#F0F0F5] transition-colors">
                            {isModExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </button>
                        </div>

                        {isModExpanded && (
                          <div className="border-t border-[#2A2A3A] p-2 space-y-1">
                            {modLessons.length === 0 && (
                              <p className="text-[#555568] text-xs text-center py-3">Sin lecciones.</p>
                            )}
                            {modLessons.map((lesson, idx) => (
                              <div key={lesson.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1C1C26] transition-colors group">
                                <span className="text-[#555568] text-[10px] w-5 text-center shrink-0">{idx + 1}</span>
                                {lesson.thumbnail_url && (
                                  <div className="w-8 h-6 rounded overflow-hidden flex-shrink-0">
                                    <img src={lesson.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                {!lesson.thumbnail_url && (
                                  <div className="w-8 h-6 rounded bg-[#2A2A3A] flex items-center justify-center flex-shrink-0">
                                    <Video size={9} className="text-[#555568]" />
                                  </div>
                                )}
                                <p className="text-[#F0F0F5] text-xs flex-1 truncate">{lesson.title}</p>
                                {lesson.video_url && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[rgba(16,185,129,0.1)] text-[#10B981] shrink-0">
                                    {videoIcon(lesson.video_url)}
                                  </span>
                                )}
                                {lesson.is_free && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[rgba(255,107,53,0.1)] text-[#FF6B35] shrink-0">Gratis</span>
                                )}
                                {lesson.duration && (
                                  <span className="text-[#555568] text-[9px] flex items-center gap-0.5 shrink-0">
                                    <Clock size={8} />{lesson.duration}
                                  </span>
                                )}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button onClick={() => setLessonModal({ moduleId: mod.id, lesson })}
                                    className="w-5 h-5 flex items-center justify-center rounded text-[#555568] hover:text-[#F0F0F5]">
                                    <Pencil size={9} />
                                  </button>
                                  <button onClick={() => deleteLesson(mod.id, lesson.id)}
                                    className="w-5 h-5 flex items-center justify-center rounded text-[#555568] hover:text-[#EF4444]">
                                    <Trash2 size={9} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* New module form */}
                  {newModuleForm?.courseId === course.id ? (
                    <div className="flex items-center gap-2 p-2 rounded-xl border border-[rgba(255,107,53,0.3)] bg-[rgba(255,107,53,0.05)]">
                      <input autoFocus value={newModuleForm.title} onChange={e => setNewModuleForm(p => p ? { ...p, title: e.target.value } : null)}
                        onKeyDown={e => { if (e.key === "Enter") saveModule(); if (e.key === "Escape") setNewModuleForm(null); }}
                        placeholder="Nombre del módulo"
                        className="flex-1 px-3 py-2 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none text-sm" />
                      <button onClick={saveModule} disabled={savingModule}
                        className="px-3 py-2 rounded-lg bg-[#FF6B35] text-white text-xs font-semibold">
                        {savingModule ? <Loader2 size={12} className="animate-spin" /> : "Crear"}
                      </button>
                      <button onClick={() => setNewModuleForm(null)} className="text-[#555568] hover:text-[#F0F0F5]"><X size={14} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setNewModuleForm({ courseId: course.id, title: "" })}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#2A2A3A] text-[#555568] hover:text-[#8888A0] hover:border-[#3A3A4A] transition-colors text-xs">
                      <Plus size={11} /> Nuevo módulo
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
