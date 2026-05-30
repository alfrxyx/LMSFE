import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Trophy,
  Activity,
  ChevronRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface CourseCardProps {
  course: any;
}

export function CourseCard({ course }: CourseCardProps) {
  const canAccess = course.can_access !== false;

  // Helper untuk menangani URL Gambar (Lokal vs Eksternal)
  const getImageUrl = (path: string) => {
    if (!path) return "https://images.unsplash.com/photo-1546519156-d81a3ae9729b?w=400&q=80&fm=webp";
    if (path.startsWith('http')) return path;
    
    // Asumsi: Path dari Laravel Storage (misal: thumbnails/abc.jpg)
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';
    return `${baseUrl}/storage/${path}`;
  };

  // Parsing data levels untuk keamanan iterasi
  let levels = [];
  try {
    levels =
      typeof course?.levels === "string"
        ? JSON.parse(course.levels)
        : course?.levels || [];
  } catch (e) {
    console.error("Gagal parse levels di CourseCard:", e);
    levels = [];
  }

  const levelsCount = levels.length;
  const totalXP = levels.reduce((acc: number, level: any) => {
    return acc + (Number(level?.points) || Number(level?.required_points) || 0);
  }, 0);

  // Hitung Progres
  const completedCount = levels.filter((l: any) => l.is_completed).length;
  const progressPercentage =
    levelsCount > 0 ? Math.round((completedCount / levelsCount) * 100) : 0;

  const handleLockedClick = (e: React.MouseEvent) => {
    if (!canAccess) {
      e.preventDefault();
      toast.error("Materi Terkunci! Selesaikan materi sebelumnya terlebih dahulu.");
    }
  };

  return (
    /* PERBAIKAN: rounded-2xl (sebelumnya 3xl) agar sudut lebih tegas */
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all group ${!canAccess ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-md'}`}>
      {/* Thumbnail Kursus */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImageUrl(course.thumbnail)}
          alt={course.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform ${canAccess ? 'group-hover:scale-105' : ''}`}
        />
        
        {/* Lock Overlay */}
        {!canAccess && (
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-white/90 p-4 rounded-2xl shadow-xl border border-white/50 ">
              <Lock className="h-8 w-8 text-gray-900" />
            </div>
          </div>
        )}

        {/* Semester Badge */}
        {course.semester && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-xl shadow-md border border-gray-50">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
              Sem {course.semester}
            </p>
          </div>
        )}
        {/* Badge XP: rounded-xl agar tidak terlalu membulat */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-xl shadow-md border border-blue-50">
          <div className="flex items-center space-x-1.5">
            <Trophy className="h-3.5 w-3.5 text-blue-600 fill-current" />
            <span className="text-[10px] font-black text-blue-900 uppercase tracking-tighter">
              {course.total_points || totalXP} XP
            </span>
          </div>
        </div>

        {/* Mini Progress Overlay */}
        {progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100/30">
            <div
              className="h-full bg-blue-500 transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Konten Kartu */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-1">
          <h3 className={`text-lg font-black line-clamp-1 tracking-tight ${!canAccess ? 'text-gray-500' : 'text-gray-900'}`}>
            {course.title}
          </h3>
          {progressPercentage === 100 && (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          )}
        </div>

        {/* Progress Text */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden mr-3">
            <div
              className={`h-full transition-all duration-1000 ${progressPercentage === 100 ? "bg-green-500" : "bg-blue-600"}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className="text-[9px] font-black text-gray-400 uppercase">
            {progressPercentage}%
          </span>
        </div>

        <p className="text-[11px] font-medium text-gray-500 mb-5 line-clamp-2 leading-relaxed h-8">
          {course.description}
        </p>

        <div className="flex items-center space-x-5 mb-6">
          <div className="flex items-center space-x-2 text-gray-400">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              {levelsCount} Materi
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Activity className="h-3.5 w-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              Aktivitas Fisik
            </span>
          </div>
        </div>

        {/* PERBAIKAN TOMBOL: py-2.5 (sebelumnya py-4) dan rounded-lg agar lebih ramping */}
        {canAccess ? (
          <Link
            to={`/courses/${course.id}`}
            aria-label={`Mulai materi ${course.title}`}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-black text-[11px] tracking-[0.1em] transition-all flex items-center justify-center group/btn shadow-md shadow-blue-50 active:scale-95"
          >
            MULAI LATIHAN
            <ChevronRight className="ml-1.5 h-3.5 w-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <button
            onClick={handleLockedClick}
            className="w-full bg-gray-100 text-gray-400 py-2.5 rounded-lg font-black text-[11px] tracking-[0.1em] transition-all flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Lock size={14} /> MATERI TERKUNCI
          </button>
        )}
      </div>
    </div>
  );
}
