import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { CheckCircle, Play, Loader2, AlertCircle, Clock } from "lucide-react";

export function ProgressOverview({ userData }: { userData: any }) {
  const { courses, isLoading: appLoading } = useApp();

  // Guard 1: Loading State
  if (appLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
      </div>
    );
  }

  // Guard 2: Jika data belum siap
  if (!userData || !courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <AlertCircle className="h-8 w-8 text-gray-300 mb-2" />
        <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">
          Belum ada aktivitas kursus.
        </p>
      </div>
    );
  }

  // Ambil ID dari user data profil (Backend Baru)
  const completedFromProfile = Array.isArray(userData?.completed_level_ids)
    ? userData.completed_level_ids.map((id: any) => Number(id))
    : [];

  return (
    <div className="max-h-[550px] overflow-y-auto pr-2 custom-scrollbar space-y-10">
      {courses.map((course: any) => {
        const levels = Array.isArray(course.levels) ? course.levels : [];
        
        // Gabungkan status penyelesaian dari profil dan data course
        const courseCompletedCount = levels.filter((l: any) => 
          completedFromProfile.includes(Number(l.id)) || l.is_completed === true || l.is_completed === 1
        ).length;

        const progressPercent = levels.length > 0 ? Math.round((courseCompletedCount / levels.length) * 100) : 0;

        return (
          <div key={course.id} className="animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">
                  {course.title}
                </h3>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Mata Kuliah Semester {course.semester}
                </p>
              </div>
              <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg shadow-blue-100 dark:shadow-none uppercase">
                {courseCompletedCount} / {levels.length} SELESAI
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {levels.length > 0 ? (
                levels
                  .sort((a: any, b: any) => {
                    const aDone = completedFromProfile.includes(Number(a.id)) || a.is_completed === true || a.is_completed === 1;
                    const bDone = completedFromProfile.includes(Number(b.id)) || b.is_completed === true || b.is_completed === 1;
                    if (aDone === bDone) return 0;
                    return aDone ? 1 : -1; // Tugas belum selesai naik ke atas
                  })
                  .map((level: any, index: number) => {
                    const isDone = completedFromProfile.includes(Number(level.id)) || level.is_completed === true || level.is_completed === 1;

                    return (
                      <Link
                        key={level.id || index}
                        to={`/courses/${course.id}`}
                        className={`group flex items-center justify-between p-4 rounded-2xl transition-all border ${
                          isDone
                            ? "bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 opacity-70 cursor-default"
                            : "bg-white dark:bg-gray-800 border-blue-50 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 hover:-translate-y-0.5 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                              isDone
                                ? "bg-green-100 dark:bg-green-900/30 shadow-inner"
                                : "bg-blue-600 shadow-lg shadow-blue-100 dark:shadow-none"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Play className="h-4 w-4 text-white fill-current ml-0.5" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-black tracking-tight ${isDone ? "text-gray-500 line-through" : "text-gray-900 dark:text-white"}`}
                            >
                              {level.title || level.name || `Pertemuan ${index + 1}`}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                PERTEMUAN {index + 1}
                              </span>
                              {!isDone && level.deadline && (
                                <div className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">
                                  <Clock size={10} />
                                  {new Date(level.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:border-blue-100 dark:group-hover:border-blue-800 transition-colors">
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                              +{level.xp_reward || level.points || 0} XP
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em]">
                    Materi Kosong
                  </p>
                </div>
              )}
            </div>

            {/* Progress Bar Visual for this Course */}
            <div className="mt-6 p-5 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Capaian Materi
                  </p>
                  <p className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {progressPercent}%
                  </p>
                </div>
                <p className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded uppercase tracking-widest">
                  {courseCompletedCount === levels.length ? "Tuntas" : "On Track"}
                </p>
              </div>
              <div className="h-2.5 w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-sm"
                  style={{
                    width: `${progressPercent}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
