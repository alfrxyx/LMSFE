import React from "react";
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

  const activeCourse = courses[0];
  const levels = Array.isArray(activeCourse.levels) ? activeCourse.levels : [];

  // Ambil ID dari user data profil (Backend Baru)
  const completedFromProfile = Array.isArray(userData?.completed_level_ids)
    ? userData.completed_level_ids.map((id: any) => Number(id))
    : [];

  // Ambil ID dari data courses (Backend Index) - Sebagai cadangan
  const completedFromCourses = levels
    .filter((l: any) => l.is_completed === true || l.is_completed === 1)
    .map((l: any) => Number(l.id));

  // Gabungkan keduanya agar tidak ada yang terlewat (Master Set)
  const masterCompletedIds = Array.from(
    new Set([...completedFromProfile, ...completedFromCourses]),
  );

  const completedCount = levels.filter((l: any) =>
    masterCompletedIds.includes(Number(l.id)),
  ).length;

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
        <div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">
            {activeCourse.title}
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Struktur Kurikulum PJKR
          </p>
        </div>
        <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg shadow-blue-100 uppercase">
          {completedCount} / {levels.length} SELESAI
        </div>
      </div>

      <div className="space-y-4">
        {levels.length > 0 ? (
          levels.map((level: any, index: number) => {
            const isDone = masterCompletedIds.includes(Number(level.id));

            return (
              <div
                key={level.id || index}
                className={`group flex items-center justify-between p-4 rounded-2xl transition-all border ${
                  isDone
                    ? "bg-gray-50/50 border-gray-100 opacity-70"
                    : "bg-white border-blue-50 shadow-sm hover:shadow-md hover:border-blue-200"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isDone
                        ? "bg-green-100 shadow-inner"
                        : "bg-blue-600 shadow-lg shadow-blue-100"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Play className="h-4 w-4 text-white fill-current ml-0.5" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-black tracking-tight ${isDone ? "text-gray-500 line-through" : "text-gray-900"}`}
                    >
                      {level.title || level.name || `Pertemuan ${index + 1}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        PERTEMUAN {index + 1}
                      </span>
                      {!isDone && level.deadline && (
                        <div className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md">
                          <Clock size={10} />
                          {new Date(level.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                      +{level.xp_reward || level.points || 0} XP
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
              Materi Kosong
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar Visual */}
      <div className="mt-10 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Total Capaian
            </p>
            <p className="text-xl font-black text-gray-900 tracking-tighter">
              {levels.length > 0
                ? Math.round((completedCount / levels.length) * 100)
                : 0}
              %
            </p>
          </div>
          <p className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">
            {completedCount === levels.length ? "Completed" : "On Track"}
          </p>
        </div>
        <div className="h-3 w-full bg-gray-200/50 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-sm"
            style={{
              width: `${levels.length > 0 ? (completedCount / levels.length) * 100 : 0}%`,
            }}
          ></div>
        </div>
      </div>

      {/* DEBUG INFO (Hanya muncul jika progres masih 0 padahal seharusnya tidak) */}
      {completedCount === 0 && masterCompletedIds.length > 0 && (
        <p className="mt-4 text-[9px] text-red-400 font-bold uppercase text-center italic">
          Data mismatch detected. Re-syncing with server...
        </p>
      )}
    </div>
  );
}
