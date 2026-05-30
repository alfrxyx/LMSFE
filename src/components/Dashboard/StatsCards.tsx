import React from 'react';
import { Trophy, Target, Award, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

export function StatsCards() {
  const { user, isLoading: authLoading } = useAuth();
  const { courses, isLoading: appLoading } = useApp();

  if (authLoading || appLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[240px] bg-white rounded-[40px] animate-pulse border border-gray-100 shadow-sm"></div>
        ))}
      </div>
    );
  }

  if (!user) return null;

  // LOGIKA HITUNG DATA NYATA
  const badgesCount = Array.isArray(user.achievements) ? user.achievements.length : 0;

  let totalProgress = 0;
  let completedCount = 0;
  let remainingCount = 0;
  
  if (courses && courses.length > 0) {
    const allLevels = courses.flatMap(c => c.levels || []);
    completedCount = allLevels.filter((l: any) => l.is_completed).length;
    remainingCount = allLevels.length - completedCount;
    totalProgress = allLevels.length > 0 ? Math.round((completedCount / allLevels.length) * 100) : 0;
  }

  const stats = [
    { name: 'Misi Selesai', value: completedCount, label: 'TOTAL TERVERIFIKASI', icon: Trophy },
    { name: 'Misi Tersisa', value: remainingCount, label: 'BELUM DIKUASAI', icon: Target },
    { name: 'Lencana Koleksi', value: badgesCount, label: 'ACHIEVEMENTS', icon: Award },
    { name: 'Total Progres', value: `${totalProgress}%`, label: 'STADIUM STATUS', icon: TrendingUp }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 uiverse-parent">
      {stats.map((stat) => (
        <div 
          key={stat.name} 
          className="uiverse-card bg-gradient-to-br from-blue-600 to-blue-700 h-[240px] rounded-[40px] shadow-xl border border-white/20 flex flex-col items-center justify-center text-center p-8 group overflow-hidden"
        >
          {/* Glass Layer */}
          <div className="uiverse-glass !opacity-20"></div>

          {/* Ikon Stat - Unified White Style */}
          <div className="uiverse-content p-3 bg-white/20 backdrop-blur-md rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <stat.icon className="h-6 w-6 text-white" />
          </div>
          
          <div className="uiverse-content space-y-1">
            <span className="text-4xl font-black text-white tracking-tighter">
              {stat.value}
            </span>
            <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">
              {stat.label}
            </p>
          </div>

          <p className="uiverse-content mt-4 text-[9px] font-bold text-blue-200/60 uppercase tracking-[0.2em]">
            {stat.name}
          </p>
        </div>
      ))}
    </div>
  );
}
