"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap, Clock, Users, Star, BookOpen, Zap,
  TrendingUp, Search, ChevronRight, Play,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  instructor: string | null;
  category: string | null;
  level: string | null;
  thumbnail_url: string | null;
  published: boolean;
  _lesson_count?: number;
  _avg_rating?: number;
}

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  "Básico": { color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  "Intermedio": { color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  "Avanzado": { color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Dropi": "#8B5CF6",
  "Meta Ads": "#FF6B35",
  "Copywriting": "#10B981",
  "Finanzas": "#F59E0B",
  "Estrategia": "#EC4899",
  "Marketing": "#3B82F6",
};

function getCourseColor(category: string | null): string {
  return CATEGORY_COLORS[category ?? ""] ?? "#8888A0";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={10} className={i <= Math.round(rating) ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#2A2A3A]"} />
      ))}
      <span className="text-[#F59E0B] text-[10px] font-bold ml-1">{rating > 0 ? rating.toFixed(1) : "—"}</span>
    </div>
  );
}

function CourseCard({ course }: { course: CourseRow }) {
  const router = useRouter();
  const color = getCourseColor(course.category);
  const lvl = LEVEL_COLORS[course.level ?? ""] ?? { color: "#8888A0", bg: "rgba(136,136,160,0.1)" };

  return (
    <div
      onClick={() => router.push(`/academia/${course.id}`)}
      className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden hover:border-[#3A3A4A] transition-all cursor-pointer group hover:shadow-lg hover:shadow-black/30"
    >
      {/* Thumbnail */}
      <div className="h-36 relative flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}30, ${color}08)` }}>
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: color + "20", border: `1px solid ${color}30` }}>
            <GraduationCap size={28} style={{ color }} />
          </div>
        )}
        {course.level && (
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: lvl.bg, color: lvl.color }}>
            {course.level}
          </span>
        )}
        {course.category && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: color + "20", color }}>
            {course.category}
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-[#F0F0F5] font-bold text-sm leading-tight mb-1 group-hover:text-white transition-colors">{course.title}</p>
        {course.description && (
          <p className="text-[#555568] text-xs leading-relaxed line-clamp-2 mb-3">{course.description}</p>
        )}

        {course.instructor && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-black shrink-0" style={{ background: color }}>
              {course.instructor.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[#8888A0] text-xs">{course.instructor}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-[#555568]">
          <span className="flex items-center gap-1"><BookOpen size={9} /> {course._lesson_count ?? 0} lecciones</span>
          <StarRating rating={course._avg_rating ?? 0} />
        </div>
      </div>
    </div>
  );
}

export default function AcademiaPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [categories, setCategories] = useState<string[]>(["Todos"]);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data } = await supabase
        .from("courses")
        .select(`
          id, title, description, instructor, category, level, thumbnail_url, published,
          course_modules(lessons(id)),
          lesson_ratings:course_modules(lessons(lesson_ratings(rating)))
        `)
        .eq("published", true)
        .order("created_at", { ascending: true });

      if (!data) { setLoading(false); return; }

      const enriched: CourseRow[] = data.map((c: any) => {
        const allLessons = (c.course_modules ?? []).flatMap((m: any) => m.lessons ?? []);
        const allRatings = (c.course_modules ?? [])
          .flatMap((m: any) => (m.lessons ?? []))
          .flatMap((l: any) => (l.lesson_ratings ?? []))
          .map((r: any) => r.rating as number);
        const avg = allRatings.length > 0
          ? allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length
          : 0;
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          instructor: c.instructor,
          category: c.category,
          level: c.level,
          thumbnail_url: c.thumbnail_url,
          published: c.published,
          _lesson_count: allLessons.length,
          _avg_rating: Math.round(avg * 10) / 10,
        };
      });

      setCourses(enriched);
      const cats = Array.from(new Set(enriched.map(c => c.category).filter(Boolean))) as string[];
      setCategories(["Todos", ...cats]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = courses.filter(c => {
    const matchCat = category === "Todos" || c.category === category;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.category ?? "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalLessons = courses.reduce((a, c) => a + (c._lesson_count ?? 0), 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#D97706] flex items-center justify-center shrink-0">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F0F0F5]">Academia</h1>
          <p className="text-[#8888A0] text-xs md:text-sm">Aprende dropshipping con los mejores expertos</p>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Cursos disponibles", value: courses.length, icon: BookOpen, color: "#FF6B35" },
            { label: "Lecciones totales", value: totalLessons, icon: Play, color: "#8B5CF6" },
            { label: "Instructores", value: Array.from(new Set(courses.map(c => c.instructor).filter(Boolean))).length, icon: Users, color: "#10B981" },
            { label: "Categorías", value: categories.length - 1, icon: TrendingUp, color: "#F59E0B" },
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
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555568]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar curso..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#13131A] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
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

      {/* Loading */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden animate-pulse">
              <div className="h-36 bg-[#1C1C26]" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#1C1C26] rounded w-3/4" />
                <div className="h-3 bg-[#1C1C26] rounded w-full" />
                <div className="h-3 bg-[#1C1C26] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course grid */}
      {!loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1C1C26] flex items-center justify-center">
            <GraduationCap size={24} className="text-[#2A2A3A]" />
          </div>
          <p className="text-[#F0F0F5] font-semibold text-sm">
            {courses.length === 0 ? "Próximamente" : "Sin resultados"}
          </p>
          <p className="text-[#555568] text-xs">
            {courses.length === 0 ? "Los cursos estarán disponibles muy pronto." : "Prueba con otra categoría o término."}
          </p>
        </div>
      )}
    </div>
  );
}
