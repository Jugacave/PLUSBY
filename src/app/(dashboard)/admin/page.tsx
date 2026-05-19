"use client";

import { useState, useEffect } from "react";
import { AcademiaTab } from "@/components/admin/AcademiaTab";
import {
  ShieldCheck,
  Users,
  Package,
  GraduationCap,
  CreditCard,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Video,
  Upload,
  Check,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Crown,
  Star,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Lock,
  Unlock,
  DollarSign,
  UserCheck,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PendingProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

type AdminTab = "overview" | "academia" | "proveedores" | "suscripciones" | "usuarios";

type Plan = "free" | "basico" | "premium" | "superadmin";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  role: string;
  joinedAt: string;
  active: boolean;
  avatar: string;
}

interface AdminSupplier {
  id: string;
  name: string;
  category: string;
  badge: "Verificado" | "Premium" | "Nuevo";
  catalogo: number;
  contacto: string;
  sitio: string;
  color: string;
  featured: boolean;
  active: boolean;
}

interface AdminLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  free: boolean;
}

interface AdminCourse {
  id: string;
  title: string;
  category: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  instructor: string;
  thumbnail: string;
  published: boolean;
  lessons: AdminLesson[];
}

// ─── Seed data ───────────────────────────────────────────────────────────────

const INIT_USERS: AdminUser[] = [
  { id: "u1", name: "Karen Ortiz", email: "karen@plusby.co", plan: "premium", role: "mentor", joinedAt: "2025-01-10", active: true, avatar: "KO" },
  { id: "u2", name: "Diego Reyes", email: "diego@gmail.com", plan: "basico", role: "user", joinedAt: "2025-03-15", active: true, avatar: "DR" },
  { id: "u3", name: "Valentina Cruz", email: "vale@hotmail.com", plan: "free", role: "user", joinedAt: "2025-04-02", active: true, avatar: "VC" },
  { id: "u4", name: "Julián García", email: "julian@plusby.co", plan: "premium", role: "mentor", joinedAt: "2025-01-05", active: true, avatar: "JG" },
  { id: "u5", name: "Mariana López", email: "mariana@gmail.com", plan: "basico", role: "user", joinedAt: "2025-05-01", active: false, avatar: "ML" },
  { id: "u6", name: "Juan Carranza", email: "jcarranza715@gmail.com", plan: "superadmin", role: "superadmin", joinedAt: "2024-12-01", active: true, avatar: "JC" },
];

const INIT_SUPPLIERS: AdminSupplier[] = [
  { id: "s1", name: "Kompras Plus", category: "General", badge: "Verificado", catalogo: 340, contacto: "+57 300 123 4567", sitio: "komprasplus.com", color: "#FF6B35", featured: true, active: true },
  { id: "s2", name: "Dropi Colombia", category: "Tecnología", badge: "Premium", catalogo: 520, contacto: "+57 310 987 6543", sitio: "dropi.co", color: "#8B5CF6", featured: true, active: true },
  { id: "s3", name: "Mariothy Store", category: "Moda", badge: "Verificado", catalogo: 280, contacto: "+57 315 456 7890", sitio: "mariothy.com", color: "#EC4899", featured: false, active: true },
  { id: "s4", name: "TechDrop MX", category: "Tecnología", badge: "Nuevo", catalogo: 95, contacto: "+52 55 1234 5678", sitio: "techdrop.mx", color: "#10B981", featured: false, active: false },
];

const INIT_COURSES: AdminCourse[] = [
  {
    id: "c1", title: "Dropi desde Cero", category: "Plataformas", level: "Básico",
    instructor: "Karen Ortiz", thumbnail: "#FF6B35", published: true,
    lessons: [
      { id: "l1", title: "¿Qué es Dropi?", duration: "8:30", videoUrl: "https://youtu.be/ejemplo1", free: true },
      { id: "l2", title: "Registro y configuración", duration: "12:15", videoUrl: "https://youtu.be/ejemplo2", free: true },
      { id: "l3", title: "Tu primer pedido", duration: "18:40", videoUrl: "https://youtu.be/ejemplo3", free: false },
    ],
  },
  {
    id: "c2", title: "Meta Ads Avanzado", category: "Marketing", level: "Avanzado",
    instructor: "Julián García", thumbnail: "#8B5CF6", published: true,
    lessons: [
      { id: "l4", title: "Estructura de campañas", duration: "22:10", videoUrl: "https://youtu.be/ejemplo4", free: false },
      { id: "l5", title: "Públicos personalizados", duration: "19:55", videoUrl: "https://youtu.be/ejemplo5", free: false },
    ],
  },
];

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  basico: "Básico",
  premium: "Premium",
  superadmin: "Super Admin",
};

const PLAN_COLORS: Record<Plan, string> = {
  free: "#555568",
  basico: "#3B82F6",
  premium: "#F59E0B",
  superadmin: "#FF6B35",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string | number; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#2A2A3A] bg-[#13131A] p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[#8888A0] text-sm">{label}</p>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="text-[#F0F0F5] text-2xl font-bold">{value}</p>
      {sub && <p className="text-[#555568] text-xs mt-1">{sub}</p>}
    </div>
  );
}

function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ color: PLAN_COLORS[plan], background: `${PLAN_COLORS[plan]}18` }}>
      {PLAN_LABELS[plan]}
    </span>
  );
}

// ─── Tab: Overview ───────────────────────────────────────────────────────────

function OverviewTab({ users, suppliers, courses }: { users: AdminUser[]; suppliers: AdminSupplier[]; courses: AdminCourse[] }) {
  const activeUsers = users.filter(u => u.active).length;
  const premiumUsers = users.filter(u => u.plan === "premium").length;
  const publishedCourses = courses.filter(c => c.published).length;
  const activeSuppliers = suppliers.filter(s => s.active).length;

  const recentUsers = [...users].sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Usuarios Activos" value={activeUsers} icon={Users} color="#FF6B35" sub={`de ${users.length} totales`} />
        <StatCard label="Plan Premium" value={premiumUsers} icon={Crown} color="#F59E0B" sub="suscriptores activos" />
        <StatCard label="Cursos Publicados" value={publishedCourses} icon={GraduationCap} color="#8B5CF6" sub={`de ${courses.length} creados`} />
        <StatCard label="Proveedores Activos" value={activeSuppliers} icon={Package} color="#10B981" sub={`de ${suppliers.length} registrados`} />
      </div>

      <div className="rounded-xl border border-[#2A2A3A] bg-[#13131A] p-5">
        <h3 className="text-[#F0F0F5] font-semibold mb-4 flex items-center gap-2">
          <Activity size={16} className="text-[#FF6B35]" />
          Usuarios recientes
        </h3>
        <div className="space-y-3">
          {recentUsers.map(u => (
            <div key={u.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {u.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F0F0F5] text-sm font-medium truncate">{u.name}</p>
                <p className="text-[#555568] text-xs truncate">{u.email}</p>
              </div>
              <PlanBadge plan={u.plan} />
              <span className="text-[#555568] text-xs">{u.joinedAt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Academia ───────────────────────────────────────────────────────────

// AcademiaTab is now in src/components/admin/AcademiaTab.tsx
// keeping this stub to avoid import errors during migration
function _AcademiaTabOld({ courses, setCourses }: { courses: AdminCourse[]; setCourses: React.Dispatch<React.SetStateAction<AdminCourse[]>> }) {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ courseId: string; lesson: AdminLesson } | null>(null);
  const [newLesson, setNewLesson] = useState<{ courseId: string } | null>(null);
  const [newLessonData, setNewLessonData] = useState({ title: "", duration: "", videoUrl: "", free: false });
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", category: "", level: "Básico" as AdminCourse["level"], instructor: "" });

  function togglePublish(courseId: string) {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, published: !c.published } : c));
  }

  function deleteCourse(courseId: string) {
    setCourses(prev => prev.filter(c => c.id !== courseId));
  }

  function addLesson(courseId: string) {
    if (!newLessonData.title || !newLessonData.videoUrl) return;
    const lesson: AdminLesson = { id: `l${Date.now()}`, ...newLessonData };
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, lessons: [...c.lessons, lesson] } : c));
    setNewLesson(null);
    setNewLessonData({ title: "", duration: "", videoUrl: "", free: false });
  }

  function saveLesson() {
    if (!editingLesson) return;
    setCourses(prev => prev.map(c =>
      c.id === editingLesson.courseId
        ? { ...c, lessons: c.lessons.map(l => l.id === editingLesson.lesson.id ? editingLesson.lesson : l) }
        : c
    ));
    setEditingLesson(null);
  }

  function deleteLesson(courseId: string, lessonId: string) {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) } : c));
  }

  function addCourse() {
    if (!newCourse.title || !newCourse.instructor) return;
    const colors = ["#FF6B35", "#8B5CF6", "#10B981", "#3B82F6", "#EC4899"];
    const course: AdminCourse = {
      id: `c${Date.now()}`,
      ...newCourse,
      thumbnail: colors[Math.floor(Math.random() * colors.length)],
      published: false,
      lessons: [],
    };
    setCourses(prev => [...prev, course]);
    setShowNewCourse(false);
    setNewCourse({ title: "", category: "", level: "Básico", instructor: "" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[#8888A0] text-sm">{courses.length} cursos · {courses.reduce((a, c) => a + c.lessons.length, 0)} lecciones</p>
        <button onClick={() => setShowNewCourse(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#FF8C5A] transition-colors">
          <Plus size={15} /> Nuevo Curso
        </button>
      </div>

      {showNewCourse && (
        <div className="rounded-xl border border-[#FF6B35]/40 bg-[#13131A] p-5 space-y-3">
          <h3 className="text-[#F0F0F5] font-semibold">Nuevo Curso</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={newCourse.title} onChange={e => setNewCourse(p => ({ ...p, title: e.target.value }))} placeholder="Título del curso" className="col-span-2 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg px-3 py-2 text-[#F0F0F5] text-sm placeholder-[#555568] focus:outline-none focus:border-[#FF6B35]" />
            <input value={newCourse.instructor} onChange={e => setNewCourse(p => ({ ...p, instructor: e.target.value }))} placeholder="Instructor" className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg px-3 py-2 text-[#F0F0F5] text-sm placeholder-[#555568] focus:outline-none focus:border-[#FF6B35]" />
            <input value={newCourse.category} onChange={e => setNewCourse(p => ({ ...p, category: e.target.value }))} placeholder="Categoría" className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg px-3 py-2 text-[#F0F0F5] text-sm placeholder-[#555568] focus:outline-none focus:border-[#FF6B35]" />
            <select value={newCourse.level} onChange={e => setNewCourse(p => ({ ...p, level: e.target.value as AdminCourse["level"] }))} className="col-span-2 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg px-3 py-2 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35]">
              <option>Básico</option><option>Intermedio</option><option>Avanzado</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNewCourse(false)} className="px-4 py-2 rounded-lg border border-[#2A2A3A] text-[#8888A0] text-sm hover:bg-[#1C1C26] transition-colors">Cancelar</button>
            <button onClick={addCourse} className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#FF8C5A] transition-colors">Crear</button>
          </div>
        </div>
      )}

      {courses.map(course => (
        <div key={course.id} className="rounded-xl border border-[#2A2A3A] bg-[#13131A] overflow-hidden">
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${course.thumbnail}20` }}>
              <BookOpen size={18} style={{ color: course.thumbnail }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[#F0F0F5] font-semibold truncate">{course.title}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#2A2A3A] text-[#8888A0]">{course.level}</span>
                {course.published
                  ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.12)] text-[#10B981]">Publicado</span>
                  : <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(85,85,104,0.2)] text-[#555568]">Borrador</span>
                }
              </div>
              <p className="text-[#555568] text-xs mt-0.5">{course.instructor} · {course.lessons.length} lecciones</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => togglePublish(course.id)} className="p-2 rounded-lg hover:bg-[#1C1C26] transition-colors" title={course.published ? "Despublicar" : "Publicar"}>
                {course.published ? <ToggleRight size={18} className="text-[#10B981]" /> : <ToggleLeft size={18} className="text-[#555568]" />}
              </button>
              <button onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)} className="p-2 rounded-lg hover:bg-[#1C1C26] transition-colors text-[#8888A0]">
                {expandedCourse === course.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <button onClick={() => deleteCourse(course.id)} className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-colors text-[#555568] hover:text-[#EF4444]">
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {expandedCourse === course.id && (
            <div className="border-t border-[#2A2A3A] p-4 space-y-2">
              {course.lessons.map(lesson => (
                <div key={lesson.id}>
                  {editingLesson?.courseId === course.id && editingLesson.lesson.id === lesson.id ? (
                    <div className="rounded-lg border border-[#FF6B35]/40 bg-[#0A0A0F] p-3 space-y-2">
                      <input value={editingLesson.lesson.title} onChange={e => setEditingLesson(p => p && { ...p, lesson: { ...p.lesson, title: e.target.value } })} className="w-full bg-[#13131A] border border-[#2A2A3A] rounded-lg px-3 py-1.5 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="Título" />
                      <div className="flex gap-2">
                        <input value={editingLesson.lesson.duration} onChange={e => setEditingLesson(p => p && { ...p, lesson: { ...p.lesson, duration: e.target.value } })} className="w-24 bg-[#13131A] border border-[#2A2A3A] rounded-lg px-3 py-1.5 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="0:00" />
                        <input value={editingLesson.lesson.videoUrl} onChange={e => setEditingLesson(p => p && { ...p, lesson: { ...p.lesson, videoUrl: e.target.value } })} className="flex-1 bg-[#13131A] border border-[#2A2A3A] rounded-lg px-3 py-1.5 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35]" placeholder="URL del video" />
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={editingLesson.lesson.free} onChange={e => setEditingLesson(p => p && { ...p, lesson: { ...p.lesson, free: e.target.checked } })} className="w-3.5 h-3.5 accent-[#FF6B35]" />
                          <span className="text-[#8888A0] text-xs">Gratis</span>
                        </label>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingLesson(null)} className="px-3 py-1 rounded text-[#8888A0] text-xs hover:text-[#F0F0F5]">Cancelar</button>
                        <button onClick={saveLesson} className="px-3 py-1 rounded bg-[#FF6B35] text-white text-xs font-semibold">Guardar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1C1C26] group">
                      <Video size={13} className="text-[#555568] shrink-0" />
                      <span className="flex-1 text-[#8888A0] text-sm truncate">{lesson.title}</span>
                      <span className="text-[#555568] text-xs">{lesson.duration}</span>
                      {lesson.free ? <Unlock size={12} className="text-[#10B981]" /> : <Lock size={12} className="text-[#555568]" />}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingLesson({ courseId: course.id, lesson })} className="p-1 rounded hover:bg-[#2A2A3A] text-[#8888A0]"><Pencil size={12} /></button>
                        <button onClick={() => deleteLesson(course.id, lesson.id)} className="p-1 rounded hover:bg-[rgba(239,68,68,0.1)] text-[#555568] hover:text-[#EF4444]"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {newLesson?.courseId === course.id ? (
                <div className="rounded-lg border border-[#8B5CF6]/40 bg-[#0A0A0F] p-3 space-y-2">
                  <p className="text-[#8B5CF6] text-xs font-semibold flex items-center gap-1"><Upload size={12} /> Nueva lección</p>
                  <input value={newLessonData.title} onChange={e => setNewLessonData(p => ({ ...p, title: e.target.value }))} className="w-full bg-[#13131A] border border-[#2A2A3A] rounded-lg px-3 py-1.5 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#8B5CF6]" placeholder="Título de la lección" />
                  <div className="flex gap-2">
                    <input value={newLessonData.duration} onChange={e => setNewLessonData(p => ({ ...p, duration: e.target.value }))} className="w-24 bg-[#13131A] border border-[#2A2A3A] rounded-lg px-3 py-1.5 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#8B5CF6]" placeholder="12:30" />
                    <input value={newLessonData.videoUrl} onChange={e => setNewLessonData(p => ({ ...p, videoUrl: e.target.value }))} className="flex-1 bg-[#13131A] border border-[#2A2A3A] rounded-lg px-3 py-1.5 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#8B5CF6]" placeholder="https://youtu.be/..." />
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={newLessonData.free} onChange={e => setNewLessonData(p => ({ ...p, free: e.target.checked }))} className="w-3.5 h-3.5 accent-[#8B5CF6]" />
                      <span className="text-[#8888A0] text-xs">Gratis</span>
                    </label>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setNewLesson(null)} className="px-3 py-1 rounded text-[#8888A0] text-xs hover:text-[#F0F0F5]">Cancelar</button>
                    <button onClick={() => addLesson(course.id)} className="px-3 py-1 rounded bg-[#8B5CF6] text-white text-xs font-semibold">Agregar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setNewLesson({ courseId: course.id }); setExpandedCourse(course.id); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#8B5CF6] text-sm hover:bg-[rgba(139,92,246,0.08)] transition-colors w-full">
                  <Plus size={14} /> Agregar lección
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Proveedores ─────────────────────────────────────────────────────────

function ProveedoresTab({ suppliers, setSuppliers }: { suppliers: AdminSupplier[]; setSuppliers: React.Dispatch<React.SetStateAction<AdminSupplier[]>> }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminSupplier | null>(null);
  const [form, setForm] = useState<Omit<AdminSupplier, "id">>({ name: "", category: "", badge: "Nuevo", catalogo: 0, contacto: "", sitio: "", color: "#FF6B35", featured: false, active: true });

  function openNew() { setEditing(null); setForm({ name: "", category: "", badge: "Nuevo", catalogo: 0, contacto: "", sitio: "", color: "#FF6B35", featured: false, active: true }); setShowForm(true); }
  function openEdit(s: AdminSupplier) { setEditing(s); setForm({ name: s.name, category: s.category, badge: s.badge, catalogo: s.catalogo, contacto: s.contacto, sitio: s.sitio, color: s.color, featured: s.featured, active: s.active }); setShowForm(true); }

  function save() {
    if (!form.name) return;
    if (editing) {
      setSuppliers(prev => prev.map(s => s.id === editing.id ? { ...editing, ...form } : s));
    } else {
      setSuppliers(prev => [...prev, { id: `s${Date.now()}`, ...form }]);
    }
    setShowForm(false);
  }

  function toggle(id: string) { setSuppliers(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s)); }
  function del(id: string) { setSuppliers(prev => prev.filter(s => s.id !== id)); }

  const BADGE_COLORS = { Verificado: "#10B981", Premium: "#F59E0B", Nuevo: "#8B5CF6" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[#8888A0] text-sm">{suppliers.filter(s => s.active).length} activos · {suppliers.length} total</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#FF8C5A] transition-colors">
          <Plus size={15} /> Nuevo Proveedor
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-[#FF6B35]/40 bg-[#13131A] p-5 space-y-3">
          <h3 className="text-[#F0F0F5] font-semibold">{editing ? "Editar Proveedor" : "Nuevo Proveedor"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nombre" className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg px-3 py-2 text-[#F0F0F5] text-sm placeholder-[#555568] focus:outline-none focus:border-[#FF6B35]" />
            <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Categoría" className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg px-3 py-2 text-[#F0F0F5] text-sm placeholder-[#555568] focus:outline-none focus:border-[#FF6B35]" />
            <input value={form.contacto} onChange={e => setForm(p => ({ ...p, contacto: e.target.value }))} placeholder="Contacto / WhatsApp" className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg px-3 py-2 text-[#F0F0F5] text-sm placeholder-[#555568] focus:outline-none focus:border-[#FF6B35]" />
            <input value={form.sitio} onChange={e => setForm(p => ({ ...p, sitio: e.target.value }))} placeholder="Sitio web" className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg px-3 py-2 text-[#F0F0F5] text-sm placeholder-[#555568] focus:outline-none focus:border-[#FF6B35]" />
            <input type="number" value={form.catalogo} onChange={e => setForm(p => ({ ...p, catalogo: parseInt(e.target.value) || 0 }))} placeholder="Productos en catálogo" className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg px-3 py-2 text-[#F0F0F5] text-sm placeholder-[#555568] focus:outline-none focus:border-[#FF6B35]" />
            <select value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value as AdminSupplier["badge"] }))} className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg px-3 py-2 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35]">
              <option>Verificado</option><option>Premium</option><option>Nuevo</option>
            </select>
            <div className="flex items-center gap-3">
              <label className="text-[#8888A0] text-sm">Color:</label>
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="w-10 h-8 rounded cursor-pointer bg-transparent border-0" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-[#F59E0B]" />
                <span className="text-[#8888A0] text-sm">Destacado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4 accent-[#10B981]" />
                <span className="text-[#8888A0] text-sm">Activo</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-[#2A2A3A] text-[#8888A0] text-sm hover:bg-[#1C1C26] transition-colors">Cancelar</button>
            <button onClick={save} className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#FF8C5A] transition-colors">Guardar</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {suppliers.map(s => (
          <div key={s.id} className={`flex items-center gap-4 p-4 rounded-xl border bg-[#13131A] transition-opacity ${s.active ? "border-[#2A2A3A] opacity-100" : "border-[#2A2A3A] opacity-50"}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: `${s.color}25`, color: s.color }}>
              {s.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[#F0F0F5] font-semibold truncate">{s.name}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ color: BADGE_COLORS[s.badge], background: `${BADGE_COLORS[s.badge]}18` }}>{s.badge}</span>
                {s.featured && <Star size={12} className="text-[#F59E0B]" fill="#F59E0B" />}
              </div>
              <p className="text-[#555568] text-xs mt-0.5">{s.category} · {s.catalogo} productos · {s.contacto}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggle(s.id)} className="p-2 rounded-lg hover:bg-[#1C1C26] transition-colors" title={s.active ? "Desactivar" : "Activar"}>
                {s.active ? <ToggleRight size={18} className="text-[#10B981]" /> : <ToggleLeft size={18} className="text-[#555568]" />}
              </button>
              <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-[#1C1C26] transition-colors text-[#8888A0] hover:text-[#F0F0F5]"><Pencil size={15} /></button>
              <button onClick={() => del(s.id)} className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-colors text-[#555568] hover:text-[#EF4444]"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Suscripciones ───────────────────────────────────────────────────────

function SuscripcionesTab({ users, setUsers }: { users: AdminUser[]; setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>> }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Plan | "todos">("todos");

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "todos" || u.plan === filter;
    return matchSearch && matchFilter;
  });

  function changePlan(userId: string, plan: Plan) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u));
  }

  const planCounts = { free: users.filter(u => u.plan === "free").length, basico: users.filter(u => u.plan === "basico").length, premium: users.filter(u => u.plan === "premium").length };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {(["free", "basico", "premium"] as Plan[]).map(plan => (
          <div key={plan} className="rounded-xl border border-[#2A2A3A] bg-[#13131A] p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: PLAN_COLORS[plan] }}>{planCounts[plan as keyof typeof planCounts]}</p>
            <p className="text-[#8888A0] text-sm mt-1">{PLAN_LABELS[plan]}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555568]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuario..." className="w-full bg-[#13131A] border border-[#2A2A3A] rounded-lg pl-9 pr-3 py-2 text-[#F0F0F5] text-sm placeholder-[#555568] focus:outline-none focus:border-[#FF6B35]" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value as Plan | "todos")} className="bg-[#13131A] border border-[#2A2A3A] rounded-lg px-3 py-2 text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35]">
          <option value="todos">Todos los planes</option>
          <option value="free">Free</option>
          <option value="basico">Básico</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <div className="rounded-xl border border-[#2A2A3A] bg-[#13131A] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2A2A3A]">
              <th className="text-left px-4 py-3 text-[#555568] text-xs font-semibold uppercase tracking-wide">Usuario</th>
              <th className="text-left px-4 py-3 text-[#555568] text-xs font-semibold uppercase tracking-wide">Plan Actual</th>
              <th className="text-left px-4 py-3 text-[#555568] text-xs font-semibold uppercase tracking-wide">Registro</th>
              <th className="text-left px-4 py-3 text-[#555568] text-xs font-semibold uppercase tracking-wide">Cambiar Plan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} className={`border-b border-[#2A2A3A] last:border-0 ${!u.active ? "opacity-50" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-xs font-bold shrink-0">{u.avatar}</div>
                    <div>
                      <p className="text-[#F0F0F5] text-sm font-medium">{u.name}</p>
                      <p className="text-[#555568] text-xs">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
                <td className="px-4 py-3"><span className="text-[#555568] text-xs">{u.joinedAt}</span></td>
                <td className="px-4 py-3">
                  {u.plan !== "superadmin" && (
                    <select value={u.plan} onChange={e => changePlan(u.id, e.target.value as Plan)} className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg px-2 py-1 text-[#F0F0F5] text-xs focus:outline-none focus:border-[#FF6B35]">
                      <option value="free">Free</option>
                      <option value="basico">Básico</option>
                      <option value="premium">Premium</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-[#555568] text-sm">No hay usuarios con ese filtro</div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Usuarios ────────────────────────────────────────────────────────────

function UsuariosTab({ users, setUsers }: { users: AdminUser[]; setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>> }) {
  const ROLES = ["user", "mentor", "superadmin"];
  const ROLE_COLORS: Record<string, string> = { user: "#555568", mentor: "#8B5CF6", superadmin: "#FF6B35" };

  const [pending, setPending] = useState<PendingProfile[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPending(data ?? []);
        setLoadingPending(false);
      });
  }, []);

  async function approve(profileId: string) {
    setActioning(profileId);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", profileId);
    setPending(prev => prev.filter(p => p.id !== profileId));
    setActioning(null);
  }

  async function reject(profileId: string) {
    setActioning(profileId);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ status: "rejected", rejected_at: new Date().toISOString() })
      .eq("id", profileId);
    setPending(prev => prev.filter(p => p.id !== profileId));
    setActioning(null);
  }

  function changeRole(userId: string, role: string) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  }
  function toggleActive(userId: string) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !u.active } : u));
  }

  function initials(name: string | null, email: string) {
    if (name) return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    return email.slice(0, 2).toUpperCase();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="space-y-6">
      {/* ── Pending approvals ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={15} className="text-[#F59E0B]" />
          <h3 className="text-[#F0F0F5] font-semibold text-sm">Solicitudes pendientes de aprobación</h3>
          {!loadingPending && pending.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-[#F59E0B]">
              {pending.length}
            </span>
          )}
        </div>

        {loadingPending ? (
          <div className="flex items-center justify-center py-8 text-[#555568]">
            <Loader2 size={18} className="animate-spin mr-2" />
            <span className="text-sm">Cargando...</span>
          </div>
        ) : pending.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-[#2A2A3A] bg-[#13131A]">
            <CheckCircle2 size={16} className="text-[#10B981] shrink-0" />
            <p className="text-[#8888A0] text-sm">No hay solicitudes pendientes.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[rgba(245,158,11,0.3)] bg-[#13131A] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A2A3A]">
                  <th className="text-left px-4 py-3 text-[#555568] text-xs font-semibold uppercase tracking-wide">Usuario</th>
                  <th className="text-left px-4 py-3 text-[#555568] text-xs font-semibold uppercase tracking-wide">Fecha registro</th>
                  <th className="px-4 py-3 text-[#555568] text-xs font-semibold uppercase tracking-wide text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(p => (
                  <tr key={p.id} className="border-b border-[#2A2A3A] last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[rgba(245,158,11,0.2)] flex items-center justify-center text-[#F59E0B] text-xs font-bold flex-shrink-0">
                          {initials(p.full_name, p.email)}
                        </div>
                        <div>
                          <p className="text-[#F0F0F5] text-sm font-medium">{p.full_name || "—"}</p>
                          <p className="text-[#555568] text-xs">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#8888A0] text-xs">{formatDate(p.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => approve(p.id)}
                          disabled={actioning === p.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-[#10B981] text-xs font-medium hover:bg-[rgba(16,185,129,0.2)] transition-colors disabled:opacity-50"
                        >
                          {actioning === p.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                          Aprobar
                        </button>
                        <button
                          onClick={() => reject(p.id)}
                          disabled={actioning === p.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-xs font-medium hover:bg-[rgba(239,68,68,0.2)] transition-colors disabled:opacity-50"
                        >
                          {actioning === p.id ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SQL hint ── */}
      <div className="flex items-center gap-2 p-3 rounded-xl border border-[#F59E0B]/30 bg-[rgba(245,158,11,0.05)]">
        <AlertCircle size={15} className="text-[#F59E0B] shrink-0" />
        <p className="text-[#F59E0B] text-xs">Para asignar rol <strong>superadmin</strong>: <code className="bg-[#1C1C26] px-1 rounded">UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || &#123;&apos;&quot;role&quot;: &quot;superadmin&quot;&apos;&#125; WHERE email = &apos;tu@email.com&apos;;</code></p>
      </div>

      {/* ── Active users table (mock) ── */}
      <div>
        <h3 className="text-[#F0F0F5] font-semibold text-sm mb-3 flex items-center gap-2">
          <Users size={15} className="text-[#8888A0]" />
          Usuarios activos
        </h3>
        <div className="rounded-xl border border-[#2A2A3A] bg-[#13131A] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A3A]">
                <th className="text-left px-4 py-3 text-[#555568] text-xs font-semibold uppercase tracking-wide">Usuario</th>
                <th className="text-left px-4 py-3 text-[#555568] text-xs font-semibold uppercase tracking-wide">Rol</th>
                <th className="text-left px-4 py-3 text-[#555568] text-xs font-semibold uppercase tracking-wide">Plan</th>
                <th className="text-left px-4 py-3 text-[#555568] text-xs font-semibold uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-[#555568] text-xs font-semibold uppercase tracking-wide">Cambiar Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-[#2A2A3A] last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-xs font-bold">{u.avatar}</div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#13131A] ${u.active ? "bg-[#10B981]" : "bg-[#555568]"}`} />
                      </div>
                      <div>
                        <p className="text-[#F0F0F5] text-sm font-medium">{u.name}</p>
                        <p className="text-[#555568] text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: ROLE_COLORS[u.role] ?? "#555568", background: `${ROLE_COLORS[u.role] ?? "#555568"}18` }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(u.id)} className="flex items-center gap-1.5 text-xs">
                      {u.active ? <><UserCheck size={13} className="text-[#10B981]" /><span className="text-[#10B981]">Activo</span></> : <><X size={13} className="text-[#555568]" /><span className="text-[#555568]">Inactivo</span></>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== "superadmin" && (
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg px-2 py-1 text-[#F0F0F5] text-xs focus:outline-none focus:border-[#FF6B35]">
                        {ROLES.filter(r => r !== "superadmin").map(r => <option key={r}>{r}</option>)}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: AdminTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "overview", label: "Resumen", icon: Activity },
  { id: "academia", label: "Academia", icon: GraduationCap },
  { id: "proveedores", label: "Proveedores", icon: Package },
  { id: "suscripciones", label: "Suscripciones", icon: CreditCard },
  { id: "usuarios", label: "Usuarios", icon: Users },
];

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [users, setUsers] = useState<AdminUser[]>(INIT_USERS);
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>(INIT_SUPPLIERS);
  const [courses, setCourses] = useState<AdminCourse[]>(INIT_COURSES);

  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[rgba(255,107,53,0.15)] flex items-center justify-center">
            <ShieldCheck size={20} className="text-[#FF6B35]" />
          </div>
          <div>
            <h1 className="text-[#F0F0F5] text-2xl font-bold">Panel Super Admin</h1>
            <p className="text-[#555568] text-sm">Control total de la plataforma Plusby</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#13131A] border border-[#2A2A3A] rounded-xl p-1 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id
                  ? "bg-[#FF6B35] text-white"
                  : "text-[#8888A0] hover:text-[#F0F0F5] hover:bg-[#1C1C26]"
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "overview" && <OverviewTab users={users} suppliers={suppliers} courses={courses} />}
      {tab === "academia" && <AcademiaTab />}
      {tab === "proveedores" && <ProveedoresTab suppliers={suppliers} setSuppliers={setSuppliers} />}
      {tab === "suscripciones" && <SuscripcionesTab users={users} setUsers={setUsers} />}
      {tab === "usuarios" && <UsuariosTab users={users} setUsers={setUsers} />}
    </div>
  );
}
