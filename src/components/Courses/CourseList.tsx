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
    <div className="space-y-6 p-4 md:p-8 bg-white rounded-xl border border-1">
      {/* HEADER: Radius dikurangi menjadi rounded-xl */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Katalog Aktivitas <LayoutGrid className="h-8 w-8 text-blue-600" />
          </h1>
          <p className="mt-1 text-gray-500 text-sm font-medium italic">
            Pilih materi praktik untuk meningkatkan skor XP Anda.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Filter Semester - Mahasiswa bisa melihat semester saat ini dan sebelumnya (History) */}
          <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-[300px] md:max-w-none no-scrollbar">
            {["all", "1", "2", "3", "4", "5", "6", "7", "8"]
              .filter((sem) => {
                // Admin/Dosen bisa melihat semua
                if (user?.role === "admin" || user?.role === "dosen")
                  return true;
                // Mahasiswa hanya bisa melihat semester <= semester mereka saat ini
                if (sem === "all") return true;
                return parseInt(sem) <= parseInt(user?.semester || "1");
              })
              .map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSemesterFilter(sem)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${semesterFilter === sem ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {sem === "all" ? "SEMUA" : `SEM ${sem}`}
                </button>
              ))}
          </div>

          <div className="bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                Tersedia
              </p>
              <p className="text-xs font-black text-gray-900 uppercase mt-1">
                {filteredCourses.length} Materi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GRID: Gap 8 lebih pas untuk kartu yang tidak terlalu bulat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard key={`course-${course.id}`} course={course} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-xl mb-4">
              <BookOpen className="h-10 w-10 text-gray-200" />
            </div>
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Belum Ada Kursus Tersedia
            </h3>
          </div>
        )}
      </div>

      {/* FOOTER: Rounded-2xl agar tegas */}
      <div className="bg-gray-900 rounded-2xl p-8 text-white relative overflow-hidden group shadow-lg max-w-5xl mx-auto">
        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
          <Sparkles className="h-24 w-24 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-md font-black uppercase tracking-tight text-blue-400">
              Tips Skripsi UM 🎓
            </h3>
            <p className="text-gray-400 text-[11px] font-medium mt-1 leading-relaxed">
              Selesaikan materi "Teknik Dasar" terlebih dahulu untuk membuka
              akses lanjut.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
            Pelajari <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
