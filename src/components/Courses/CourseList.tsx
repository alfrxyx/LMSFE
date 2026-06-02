import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { CourseCard } from "./CourseCard";
import {
  BookOpen,
  LayoutGrid,
  Loader2,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function CourseList() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const { token, user } = useAuth();

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/courses");
      const data = response.data.data || response.data;
      setCourses(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Gagal memuat kursus:", err);
      setError("Gagal memuat katalog. Pastikan server Laravel berjalan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCourses();
  }, [token]);

  const filteredCourses = courses.filter(
    (c) => semesterFilter === "all" || c.semester === semesterFilter,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">
          Menyusun Katalog PJKR...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 p-6 md:p-10 bg-white rounded-xl border border-gray-100 shadow-sm min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100/50 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Katalog Aktivitas <LayoutGrid className="h-8 w-8 text-blue-600" />
          </h1>
          <p className="text-gray-500 text-sm font-medium italic">
            Pilih materi praktik untuk meningkatkan skor XP Anda.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Filter Semester */}
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto max-w-[300px] md:max-w-none no-scrollbar">
            {["all", "1", "2", "3", "4", "5", "6", "7", "8"]
              .filter((sem) => {
                if (user?.role === "admin" || user?.role === "dosen") return true;
                if (sem === "all") return true;
                return parseInt(sem) <= parseInt(user?.semester || "1");
              })
              .map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSemesterFilter(sem)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${semesterFilter === sem ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                >
                  {sem === "all" ? "SEMUA" : `SEM ${sem}`}
                </button>
              ))}
          </div>

          <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Tersedia</p>
              <p className="text-xs font-black text-gray-900 uppercase mt-1">{filteredCourses.length} Materi</p>
            </div>
          </div>
        </div>
      </div>

      {/* GRID: Fluid Auto Layout */}
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard key={`course-${course.id}`} course={course} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-gray-50/30 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
              <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-50 mb-6">
                <BookOpen className="h-12 w-12 text-gray-200" />
              </div>
              <h3 className="text-base font-black text-gray-400 uppercase tracking-[0.2em]">Belum Ada Kursus Tersedia</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Silakan hubungi administrator atau dosen pengampu.</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER: Premium Auto Layout */}
      <div className="bg-[#0F172A] rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-blue-900/20 mt-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
               <div className="w-8 h-[2px] bg-blue-500"></div>
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Tips Skripsi UM 🎓</h3>
            </div>
            <p className="text-gray-300 text-sm font-medium leading-relaxed max-w-lg">
              Selesaikan materi "Teknik Dasar" terlebih dahulu untuk membuka akses lanjut ke level penelitian berikutnya.
            </p>
          </div>
          <button className="flex items-center gap-4 bg-white text-gray-900 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95">
            Pelajari Detail <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
