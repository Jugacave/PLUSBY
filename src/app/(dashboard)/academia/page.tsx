"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, GraduationCap, Play, Lock, CheckCircle,
  Clock, Users, Star, ChevronRight, BookOpen, Zap,
  TrendingUp, Target, Search, Filter,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  instructorColor: string;
  category: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  duration: string;
  students: number;
  rating: number;
  color: string;
  gradient: string;
  progress: number;
  lessons: Lesson[];
  featured?: boolean;
  new?: boolean;
}

const COURSES: Course[] = [
  {
    id: "c1",
    title: "Dropshipping con Dropi desde Cero",
    description: "Aprende a crear tu negocio de dropshipping en Colombia usando Dropi: registro, catálogo, pedidos, confirmación y tu primera venta.",
    instructor: "Karen Ortiz",
    instructorAvatar: "KO",
    instructorColor: "#8B5CF6",
    category: "Dropi",
    level: "Básico",
    duration: "4h 30m",
    students: 1247,
    rating: 4.9,
    color: "#8B5CF6",
    gradient: "from-[rgba(139,92,246,0.3)] to-[rgba(139,92,246,0.05)]",
    progress: 65,
    featured: true,
    lessons: [
      { id: "l1", title: "¿Qué es el dropshipping y cómo funciona?", duration: "12m", completed: true, locked: false },
      { id: "l2", title: "Registro y configuración en Dropi", duration: "18m", completed: true, locked: false },
      { id: "l3", title: "Eligiendo tus primeros productos", duration: "22m", completed: true, locked: false },
      { id: "l4", title: "Cómo confirmar pedidos correctamente", duration: "15m", completed: false, locked: false },
      { id: "l5", title: "Tu primera venta: paso a paso", duration: "28m", completed: false, locked: false },
      { id: "l6", title: "Gestión de devoluciones y quejas", duration: "20m", completed: false, locked: true },
      { id: "l7", title: "Escalando tu negocio en Dropi", duration: "35m", completed: false, locked: true },
    ],
  },
  {
    id: "c2",
    title: "Meta Ads para Dropshippers",
    description: "Domina la publicidad en Facebook e Instagram para vender más. Segmentación, creativos, CBO vs ABO, presupuestos y escalado.",
    instructor: "Diana Ríos",
    instructorAvatar: "DR",
    instructorColor: "#EC4899",
    category: "Meta Ads",
    level: "Intermedio",
    duration: "6h 15m",
    students: 893,
    rating: 4.8,
    color: "#FF6B35",
    gradient: "from-[rgba(255,107,53,0.3)] to-[rgba(255,107,53,0.05)]",
    progress: 20,
    new: true,
    lessons: [
      { id: "m1", title: "Estructura del Administrador de Meta Ads", duration: "25m", completed: true, locked: false },
      { id: "m2", title: "Píxel de Meta: instalación y eventos", duration: "30m", completed: false, locked: false },
      { id: "m3", title: "Audiencias: frío, tibio y caliente", duration: "40m", completed: false, locked: false },
      { id: "m4", title: "Creativos que convierten en Colombia", duration: "35m", completed: false, locked: true },
      { id: "m5", title: "CBO vs ABO: cuándo usar cada uno", duration: "20m", completed: false, locked: true },
      { id: "m6", title: "Lectura de métricas: CPM, CTR, ROAS", duration: "30m", completed: false, locked: true },
      { id: "m7", title: "Escala horizontal y vertical", duration: "45m", completed: false, locked: true },
    ],
  },
  {
    id: "c3",
    title: "Copywriting para Ventas",
    description: "Escribe textos que venden: headlines, descripciones de producto, scripts para videos y ads de texto que generan clics y conversiones.",
    instructor: "Julián García",
    instructorAvatar: "JG",
    instructorColor: "#FF6B35",
    category: "Copywriting",
    level: "Básico",
    duration: "3h 00m",
    students: 654,
    rating: 4.7,
    color: "#10B981",
    gradient: "from-[rgba(16,185,129,0.3)] to-[rgba(16,185,129,0.05)]",
    progress: 0,
    lessons: [
      { id: "cp1", title: "Los 4 principios del copy que vende", duration: "18m", completed: false, locked: false },
      { id: "cp2", title: "Fórmula PAS y AIDA en dropshipping", duration: "22m", completed: false, locked: false },
      { id: "cp3", title: "Headlines irresistibles para tus anuncios", duration: "25m", completed: false, locked: true },
      { id: "cp4", title: "Descripciones de producto que convierten", duration: "20m", completed: false, locked: true },
      { id: "cp5", title: "Scripts para video UGC", duration: "35m", completed: false, locked: true },
    ],
  },
  {
    id: "c4",
    title: "Finanzas del Dropshipping",
    description: "Aprende a calcular tus márgenes reales, interpretar el informe financiero de Dropi, gestionar cartera y reinvertir inteligentemente.",
    instructor: "Karen Ortiz",
    instructorAvatar: "KO",
    instructorColor: "#8B5CF6",
    category: "Finanzas",
    level: "Intermedio",
    duration: "2h 45m",
    students: 421,
    rating: 4.9,
    color: "#F59E0B",
    gradient: "from-[rgba(245,158,11,0.3)] to-[rgba(245,158,11,0.05)]",
    progress: 0,
    lessons: [
      { id: "f1", title: "Métricas clave: ROI, ROAS, margen neto", duration: "20m", completed: false, locked: false },
      { id: "f2", title: "Leyendo el informe Dropi correctamente", duration: "25m", completed: false, locked: false },
      { id: "f3", title: "Cartera vencida: cómo recuperarla", duration: "18m", completed: false, locked: true },
      { id: "f4", title: "Cuándo y cómo reinvertir tus ganancias", duration: "22m", completed: false, locked: true },
    ],
  },
];

const CATEGORIES = ["Todos", "Dropi", "Meta Ads", "Copywriting", "Finanzas"];
const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  "Básico": { color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  "Intermedio": { color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  "Avanzado": { color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={10} className={i <= Math.round(rating) ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#2A2A3A]"} />
      ))}
      <span className="text-[#F59E0B] text-[10px] font-bold ml-1">{rating}</span>
    </div>
  );
}

function CourseCard({ course, onClick }: { course: Course; onClick: () => void }) {
  const lvl = LEVEL_COLORS[course.level];
  return (
    <div
      onClick={onClick}
      className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden hover:border-[#3A3A4A] transition-all cursor-pointer group hover:shadow-lg hover:shadow-black/30"
    >
      {/* Thumbnail */}
      <div className={`h-36 bg-gradient-to-br ${course.gradient} relative flex items-center justify-center`}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: course.color + "20", border: `1px solid ${course.color}30` }}>
          <GraduationCap size={28} style={{ color: course.color }} />
        </div>
        {course.featured && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(255,107,53,0.9)] text-white">
            Destacado
          </span>
        )}
        {course.new && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.9)] text-white">
            Nuevo
          </span>
        )}
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: lvl.bg, color: lvl.color }}>
          {course.level}
        </span>
        {course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
            <div className="h-full transition-all" style={{ width: `${course.progress}%`, background: course.color }} />
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-[#F0F0F5] font-bold text-sm leading-tight mb-1 group-hover:text-white transition-colors">{course.title}</p>
        <p className="text-[#555568] text-xs leading-relaxed line-clamp-2 mb-3">{course.description}</p>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-black shrink-0" style={{ background: course.instructorColor }}>
            {course.instructorAvatar}
          </div>
          <span className="text-[#8888A0] text-xs">{course.instructor}</span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#555568]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Clock size={9} /> {course.duration}</span>
            <span className="flex items-center gap-1"><BookOpen size={9} /> {course.lessons.length} lecciones</span>
            <span className="flex items-center gap-1"><Users size={9} /> {course.students.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <StarRating rating={course.rating} />
          {course.progress > 0 ? (
            <span className="text-[10px] font-bold" style={{ color: course.color }}>{course.progress}% completado</span>
          ) : (
            <span className="text-[10px] text-[#555568]">No iniciado</span>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseDetail({ course, onClose }: { course: Course; onClose: () => void }) {
  const lvl = LEVEL_COLORS[course.level];
  const completedCount = course.lessons.filter(l => l.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className={`bg-gradient-to-br ${course.gradient} p-6 relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            ✕
          </button>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: lvl.bg, color: lvl.color }}>{course.level}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: course.color + "20", color: course.color }}>{course.category}</span>
          </div>
          <h2 className="text-[#F0F0F5] font-black text-lg leading-tight mb-2">{course.title}</h2>
          <p className="text-[#8888A0] text-sm">{course.description}</p>
          {course.progress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#8888A0]">Progreso</span>
                <span className="font-bold" style={{ color: course.color }}>{course.progress}%</span>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${course.progress}%`, background: course.color }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Duración", value: course.duration, icon: Clock },
              { label: "Lecciones", value: course.lessons.length, icon: BookOpen },
              { label: "Alumnos", value: course.students.toLocaleString(), icon: Users },
              { label: "Rating", value: course.rating, icon: Star },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-[#1C1C26] border border-[#2A2A3A] rounded-xl p-2">
                  <Icon size={13} className="text-[#555568] mx-auto mb-1" />
                  <p className="text-[#F0F0F5] font-bold text-sm">{s.value}</p>
                  <p className="text-[#555568] text-[9px]">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Lessons */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#F0F0F5] font-bold text-sm">Lecciones</p>
              <span className="text-[#555568] text-xs">{completedCount}/{course.lessons.length} completadas</span>
            </div>
            <div className="space-y-1.5">
              {course.lessons.map((lesson, i) => (
                <div key={lesson.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  lesson.locked
                    ? "border-[#1C1C26] bg-[#0D0D14] opacity-50 cursor-not-allowed"
                    : lesson.completed
                    ? "border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.05)] cursor-pointer hover:bg-[rgba(16,185,129,0.08)]"
                    : "border-[#2A2A3A] bg-[#1C1C26] cursor-pointer hover:border-[#3A3A4A]"
                }`}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{
                    background: lesson.completed ? "rgba(16,185,129,0.15)" : lesson.locked ? "#1C1C26" : course.color + "15",
                  }}>
                    {lesson.locked
                      ? <Lock size={10} className="text-[#555568]" />
                      : lesson.completed
                      ? <CheckCircle size={12} className="text-green-400" />
                      : <Play size={10} style={{ color: course.color }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${lesson.locked ? "text-[#555568]" : lesson.completed ? "text-[#8888A0] line-through" : "text-[#F0F0F5]"}`}>
                      {i + 1}. {lesson.title}
                    </p>
                  </div>
                  <span className="text-[#555568] text-[10px] shrink-0">{lesson.duration}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-3 rounded-xl font-bold text-white text-sm transition-colors" style={{ background: course.color }}>
            {course.progress > 0 ? "Continuar curso" : "Comenzar curso"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AcademiaPage() {
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Course | null>(null);

  const inProgress = COURSES.filter(c => c.progress > 0 && c.progress < 100);

  const filtered = COURSES.filter(c => {
    const matchCat = category === "Todos" || c.category === category;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {selected && <CourseDetail course={selected} onClose={() => setSelected(null)} />}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#D97706] flex items-center justify-center shrink-0">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F0F0F5]">Academia</h1>
          <p className="text-[#8888A0] text-xs md:text-sm">Aprende dropshipping con los mejores expertos</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Cursos disponibles", value: COURSES.length, icon: BookOpen, color: "#FF6B35" },
          { label: "En progreso", value: inProgress.length, icon: TrendingUp, color: "#8B5CF6" },
          { label: "Instructores", value: 3, icon: Users, color: "#10B981" },
          { label: "Horas de contenido", value: "16h+", icon: Clock, color: "#F59E0B" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} style={{ color: s.color }} />
                <span className="text-[#555568] text-[10px] font-medium">{s.label}</span>
              </div>
              <p className="text-[#F0F0F5] text-2xl font-black">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Continue watching */}
      {inProgress.length > 0 && (
        <div className="mb-8">
          <p className="text-[#F0F0F5] font-bold text-sm mb-3 flex items-center gap-2">
            <Zap size={14} className="text-[#FF6B35]" /> Continúa donde lo dejaste
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {inProgress.map(c => (
              <div key={c.id} onClick={() => setSelected(c)}
                className="flex items-center gap-3 p-4 bg-[#13131A] border border-[#2A2A3A] rounded-2xl hover:border-[#3A3A4A] cursor-pointer transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.color + "15" }}>
                  <GraduationCap size={20} style={{ color: c.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F0F0F5] font-semibold text-sm truncate">{c.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-[#2A2A3A] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.progress}%`, background: c.color }} />
                    </div>
                    <span className="text-[10px] font-bold shrink-0" style={{ color: c.color }}>{c.progress}%</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#555568] group-hover:text-[#F0F0F5] transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555568]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar curso..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#13131A] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                category === c
                  ? "bg-[rgba(255,107,53,0.1)] border-[rgba(255,107,53,0.3)] text-[#FF6B35]"
                  : "border-[#2A2A3A] bg-[#13131A] text-[#8888A0] hover:text-[#F0F0F5]"
              }`}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <CourseCard key={c.id} course={c} onClick={() => setSelected(c)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1C1C26] flex items-center justify-center">
            <GraduationCap size={24} className="text-[#2A2A3A]" />
          </div>
          <p className="text-[#F0F0F5] font-semibold text-sm">Sin resultados</p>
          <p className="text-[#555568] text-xs">Prueba con otra categoría o término.</p>
        </div>
      )}
    </div>
  );
}
