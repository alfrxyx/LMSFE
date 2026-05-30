import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { StatsCards } from './StatsCards';
import { ProgressOverview } from './ProgressOverview';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';
import { 
  BookOpen, Star, Trophy, ChevronRight, 
  Crown, Loader2, Megaphone, AlertCircle, 
  Info, CheckCircle2, Flame, ChevronDown, ChevronUp
} from 'lucide-react';

export function Dashboard() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const { fetchCourses } = useApp();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    dashboard_banner_text: "Jangan lupa untuk mengerjakan \n Courses yang ada di hari ini"
  });
  const [loading, setLoading] = useState(true);
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchCourses(),
        fetchAnnouncements(),
        fetchSettings()
      ]);
      setLoading(false);
    };
    init();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data);
    } catch (e) {
      console.error("Gagal mengambil pengumuman");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.status === 'success') {
        setSettings(res.data.data);
      }
    } catch (e) {
      console.error("Gagal mengambil pengaturan");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Menyiapkan Dashboard Mahasiswa PJKR...</p>
      </div>
    );
  }

  const displayUser = authUser;

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-4 md:p-8 space-y-6 bg-white rounded-xl border border-1">
      
      {/* HEADER SECTION - Status Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden">
            {displayUser?.avatar ? (
              <img src={displayUser.avatar} alt={displayUser.name} className="h-full w-full object-cover" />
            ) : (
              displayUser?.name?.[0]
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{displayUser?.name}</h2>
            <p className="text-xs text-gray-500 font-medium">{displayUser?.role} • Semester {displayUser?.semester || '6'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                <Trophy size={18} className="text-yellow-500" />
             </div>
             <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Poin</p>
                <p className="text-sm font-black text-gray-900 leading-none">{displayUser?.points?.toLocaleString()} XP</p>
             </div>
          </div>

          <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                <Star size={18} className="text-blue-500" />
             </div>
             <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Level Saat Ini</p>
                <p className="text-sm font-black text-blue-600 leading-none uppercase">Level {displayUser?.level}</p>
             </div>
          </div>

          {/* STREAK DISPLAY */}
          {(displayUser as any)?.current_streak > 0 && (
            <>
              <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 rounded-xl shadow-sm border border-orange-100 animate-pulse">
                  <Flame size={18} className="text-orange-600 fill-orange-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">Streak Aktif</p>
                  <p className="text-sm font-black text-orange-700 leading-none">{(displayUser as any).current_streak} Hari</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ANNOUNCEMENTS SECTION - Collapsible Dropdown */}
      {announcements.length > 0 && (
          <div className="space-y-4">
              <button 
                  onClick={() => setShowAnnouncements(!showAnnouncements)}
                  className="w-full flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all group"
              >
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform">
                          <Megaphone size={18} className="text-blue-600" />
                      </div>
                      <div className="text-left">
                          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">Pengumuman Dosen</h3>
                          <p className="text-xs font-bold text-gray-700">Ada {announcements.length} informasi terbaru untuk Anda</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      {announcements.some(a => a.type === 'warning') && (
                          <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping"></span>
                      )}
                      {showAnnouncements ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
              </button>

              {showAnnouncements && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {announcements.map((ann) => (
                          <div key={ann.id} className={`p-5 rounded-2xl border flex gap-4 transition-all hover:shadow-md ${
                              ann.type === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-800' :
                              ann.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' :
                              'bg-blue-50 border-blue-100 text-blue-800'
                          }`}>
                              <div className="mt-1">
                                  {ann.type === 'warning' ? <AlertCircle size={20} /> :
                                   ann.type === 'success' ? <CheckCircle2 size={20} /> :
                                   <Info size={20} />}
                              </div>
                              <div>
                                  <h4 className="font-black text-sm mb-1">{ann.title}</h4>
                                  <p className="text-xs font-medium opacity-80 leading-relaxed">{ann.message}</p>
                                  <p className="text-[9px] font-black uppercase mt-3 tracking-widest opacity-60">Oleh: {ann.user?.name} • {new Date(ann.created_at).toLocaleDateString()}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BANNER UTAMA: Balanced Hero Design */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 md:p-10 text-white shadow-xl group border border-white/10 min-h-[320px] flex flex-col justify-center">
          
          {/* Efek Visual Background */}
          <div className="absolute inset-2 bg-white/5 rounded-[2.5rem] backdrop-blur-[2px] pointer-events-none"></div>
          
          {/* Ikon Background Artistik - Mengisi kekosongan secara visual */}
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-1000 pointer-events-none">
            <BookOpen size={320} className="text-white" />
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-16 group-hover:scale-125 transition-transform duration-1000"></div>

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/10">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-100">Portal Mahasiswa UM</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.1] whitespace-pre-line drop-shadow-sm">
              {settings.dashboard_banner_text}
            </h2>
            
            <div className="pt-4">
              <Link 
                to="/courses" 
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-2xl shadow-blue-900/20 active:scale-95 group/btn"
              >
                Mulai Berlatih Sekarang
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
        <div className="uiverse-parent lg:col-span-1">
          <div className="uiverse-card bg-white rounded-2xl p-8 h-full shadow-xl border border-gray-50 flex flex-col justify-between overflow-hidden relative group">
            <div className="logo pointer-events-none">
              <span className="uiverse-logo-circle w-32 h-32 -top-4 -right-4 bg-blue-600/5 opacity-20 group-hover:scale-110 transition-transform duration-700"></span>
              <span className="uiverse-logo-circle w-24 h-24 top-2 right-2 bg-blue-600/10 opacity-30"></span>
            </div>
            <div className="uiverse-glass !rounded-2xl"></div>
            <div className="uiverse-content relative z-10">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Peringkat Anda</h3>
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shadow-inner group-hover:rotate-6 transition-transform">
                  <Crown className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-5xl font-black text-gray-900 tracking-tighter">#{displayUser?.rank || '1'}</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                    Peringkat Global Anda
                  </p>
                </div>
              </div>
            </div>
            <Link to="/leaderboard" className="uiverse-content relative z-10 mt-8 flex items-center justify-between group/btn p-4 bg-gray-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300">
              <span className="text-[10px] font-black uppercase tracking-widest">Buka Leaderboard</span>
              <div className="p-2 bg-white rounded-lg text-gray-900 shadow-sm group-hover/btn:scale-110 transition-transform">
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 text-[9px]">Statistik Performa</h3>
          <StatsCards />
        </section>
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 text-[9px]">Quick Actions</h3>
          <QuickActions />
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-600" /> Active Lessons
            </h3>
          </div>
          <ProgressOverview userData={displayUser} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-8">Recent Activities</h3>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}