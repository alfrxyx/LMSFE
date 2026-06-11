import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { CourseCard } from "./CourseCard";
import {
  BookOpen,
  LayoutGrid,
  Loader2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function CourseList() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
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
    (c) => selectedSemester === null || c.semester.toString() === selectedSemester,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px]">
          Menyusun Katalog PJKR...
        </p>
      </div>
    );
  }

  // List of available semesters based on user role/semester
  const availableSemesters = ["1", "2", "3", "4", "5", "6", "7", "8"].filter((sem) => {
    if (user?.role === "admin" || user?.role === "dosen") return true;
    return parseInt(sem) <= parseInt(user?.semester || "1");
  });

  return (
    <div className="w-full flex flex-col gap-8 p-6 md:p-10 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-screen transition-colors duration-300">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-gray-50/50 dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100/50 dark:border-gray-800/50 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            {selectedSemester ? `Materi Semester ${selectedSemester}` : 'Katalog Aktivitas'} 
            <LayoutGrid className="h-8 w-8 text-blue-600" />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium italic">
            {selectedSemester 
              ? `Daftar materi yang tersedia untuk Semester ${selectedSemester} PJKR UM.` 
              : 'Pilih semester terlebih dahulu untuk melihat daftar materi praktik.'}
          </p>
        </div>

        {selectedSemester && (
          <button 
            onClick={() => setSelectedSemester(null)}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 border border-blue-100 dark:border-blue-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <ChevronRight className="h-4 w-4 rotate-180" /> Kembali Pilih Semester
          </button>
        )}
      </div>

      {/* GRID SECTION */}
      <div className="flex-1">
        {!selectedSemester ? (
          /* SEMESTER SELECTION GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {["1", "2", "3", "4", "5", "6", "7", "8"].map((sem) => {
              const isLocked = !availableSemesters.includes(sem);
              const courseCount = courses.filter(c => c.semester.toString() === sem).length;

              return (
                <button
                  key={sem}
                  disabled={isLocked}
                  onClick={() => setSelectedSemester(sem)}
                  className={`relative overflow-hidden p-8 rounded-[2.5rem] border-2 transition-all text-left group flex flex-col justify-between h-56 ${
                    isLocked 
                      ? 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800 opacity-60 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-900 border-gray-50 dark:border-gray-800 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 active:scale-95'
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-blue-500'}`}>
                      {isLocked ? 'BELUM TERBUKA' : 'PJKR UM'}
                    </p>
                    <h3 className={`text-3xl font-black tracking-tighter ${isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      Semester {sem}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${isLocked ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                      {courseCount} Materi
                    </div>
                    <div className={`p-3 rounded-2xl transition-all ${isLocked ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600' : 'bg-gray-900 dark:bg-gray-800 text-white group-hover:bg-blue-600'}`}>
                      <ChevronRight size={18} />
                    </div>
                  </div>

                  {/* Glass Decor */}
                  {!isLocked && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors"></div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* COURSE LIST GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard key={`course-${course.id}`} course={course} />
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-gray-50/30 dark:bg-gray-800/30 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-800 mb-6">
                  <BookOpen className="h-12 w-12 text-gray-200 dark:text-gray-700" />
                </div>
                <h3 className="text-base font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Belum Ada Kursus</h3>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-2 tracking-widest">Materi untuk Semester {selectedSemester} belum tersedia.</p>
              </div>
            )}
          </div>
        )}
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
          <button className="flex items-center gap-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95">
            Pelajari Detail <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
