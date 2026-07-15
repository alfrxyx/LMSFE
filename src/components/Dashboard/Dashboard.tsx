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
  Info, CheckCircle2, Flame, ChevronDown, ChevronUp, Users, GraduationCap
} from 'lucide-react';

function ClassroomJoinInput({ onJoinSuccess }: { onJoinSuccess: (user: any) => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/classrooms/join', { code: code.trim() });
      if (res.data.status === 'success') {
        setSuccess(res.data.message);
        setTimeout(() => {
          onJoinSuccess(res.data.user);
        }, 1000);
      } else {
        setError(res.data.message || 'Gagal bergabung ke kelas.');
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      if (err.response?.status === 401) {
        setError('Sesi Anda telah berakhir. Silakan logout dan login kembali.');
      } else if (err.response?.status === 403) {
        setError(serverMessage || 'Anda tidak memiliki akses ke kelas ini.');
      } else {
        setError(serverMessage || 'Gagal terhubung ke server atau kode tidak valid.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-4 max-w-sm mx-auto">
      <input
        type="text"
        required
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="PJKR-XXXX"
        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 text-center font-black uppercase text-base text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 focus:border-blue-500 outline-none rounded-2xl transition-all tracking-wider"
      />
      
      {error && <p className="text-xs text-red-500 font-bold uppercase tracking-wider">{error}</p>}
      {success && <p className="text-xs text-green-500 font-bold uppercase tracking-wider">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Memproses...</span>
          </>
        ) : (
          <span>Gabung Kelas Sekarang</span>
        )}
      </button>
    </form>
  );
}

export function Dashboard() {
  const { user: authUser, isLoading: authLoading, updateUser } = useAuth();
  const { fetchCourses } = useApp();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    dashboard_banner_text: "Jangan lupa untuk mengerjakan \n Courses yang ada di hari ini"
  });
  const [loading, setLoading] = useState(true);
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  const [adminStats, setAdminStats] = useState<any | null>(null);

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setAdminStats(res.data);
    } catch (e) {
      console.error("Gagal mengambil statistik admin:", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const promises: Promise<any>[] = [
        fetchAnnouncements(),
        fetchSettings()
      ];
      if (authUser?.role === 'student') {
        promises.push(fetchCourses());
      } else {
        promises.push(fetchAdminStats());
      }
      await Promise.all(promises);
      setLoading(false);
    };
    init();
  }, [authUser]);

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
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Memuat Dashboard PJKR...</p>
      </div>
    );
  }

  const displayUser = authUser;

  // Jika mahasiswa belum masuk kelas, kunci dashboard dan suruh masukkan kode kelas
  if (displayUser && displayUser.role === 'student' && !displayUser.classroom_id) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 md:p-10 min-h-[80vh]">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl p-10 md:p-14 text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="h-24 w-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner border border-white dark:border-gray-800 text-blue-600 dark:text-blue-400">
            <BookOpen size={48} className="animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Selamat Datang!</h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-md mx-auto">
              GamifyLearn LMS Universitas Negeri Malang
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium leading-relaxed max-w-md mx-auto mt-2">
              Anda belum bergabung dengan kelas praktikum manapun. Silakan masukkan Kode Kelas dari Dosen Anda di bawah ini untuk membuka akses materi kuliah dan memulai pembelajaran.
            </p>
          </div>

          <ClassroomJoinInput onJoinSuccess={(updatedUser) => updateUser(updatedUser)} />
        </div>
      </div>
    );
  }

  // Jika dosen atau admin, tampilkan Dashboard khusus Dosen
  if (displayUser && (displayUser.role === 'dosen' || displayUser.role === 'admin')) {
    return (
      <div className="w-full flex flex-col gap-6 md:gap-8 pb-10 p-6 md:p-10 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-screen transition-colors duration-300">
        {/* HEADER SECTION - Lecturer Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50 dark:bg-gray-900/40 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-gray-100/50 dark:border-gray-800/50 shrink-0">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="h-12 w-12 md:h-14 md:h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-md overflow-hidden shrink-0">
              {displayUser.avatar ? (
                <img src={displayUser.avatar} alt={displayUser.name} className="h-full w-full object-cover" />
              ) : (
                displayUser.name?.[0]
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">{displayUser.name}</h2>
              <p className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider">{displayUser.role === 'admin' ? 'Administrator' : 'Dosen Pengampu'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-10">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <BookOpen size={16} className="text-blue-500 md:w-[18px] md:h-[18px]" />
              </div>
              <div>
                <p className="text-[8px] md:text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Mata Kuliah</p>
                <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white leading-none">{adminStats?.total_courses || 0}</p>
              </div>
            </div>

            <div className="h-8 md:h-10 w-px bg-gray-100 dark:bg-gray-800 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="p-2 md:p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <Users size={16} className="text-blue-500 md:w-[18px] md:h-[18px]" />
              </div>
              <div>
                <p className="text-[8px] md:text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Mahasiswa</p>
                <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white leading-none">{adminStats?.total_students || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* LECTURER BANNER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 md:p-10 text-white shadow-xl group border border-white/10 min-h-[220px] flex flex-col justify-center">
          <div className="absolute inset-2 bg-white/5 rounded-[2.5rem] backdrop-blur-[2px] pointer-events-none"></div>
          <div className="absolute -right-8 -bottom-8 md:-right-10 md:-bottom-10 opacity-[0.04] group-hover:opacity-[0.12] scale-75 group-hover:scale-110 -rotate-12 transition-all duration-700 ease-out pointer-events-none">
            <GraduationCap size={180} className="text-white md:w-[280px] md:h-[280px]" />
          </div>
          
          <div className="relative z-10 space-y-4 max-w-[85%]">
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight">Panel Pemantauan Dosen</h2>
            <p className="text-xs md:text-sm text-blue-100 max-w-xl">
              Selamat datang di dashboard pengelolaan GamifyLearn. Di sini Anda dapat mengawasi kemajuan belajar mahasiswa, menilai tugas praktek, dan mengelola kelas praktikum Anda.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link 
                to="/student-management" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-md active:scale-95"
              >
                Kelola Mahasiswa
              </Link>
              <Link 
                to="/content-management" 
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all border border-blue-400/30 active:scale-95"
              >
                Kelola Kelas & Materi
              </Link>
            </div>
          </div>
        </div>

        {/* LECTURER STATS CARDS */}
        <section className="space-y-4">
          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Metrik Pembelajaran & Monitoring</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 uiverse-parent">
            {[
              {
                name: 'Total Mahasiswa',
                value: adminStats?.total_students || 0,
                label: 'MAHASISWA AKTIF',
                icon: Users,
                color: 'text-blue-500'
              },
              {
                name: 'Progres Kelas Rata-rata',
                value: `${adminStats?.pedagogical_stats?.avg_class_progress || 0}%`,
                label: 'KETUNTASAN BELAJAR',
                icon: Trophy,
                color: 'text-yellow-500'
              },
              {
                name: 'Tugas Belum Dinilai',
                value: adminStats?.pending_assignments || 0,
                label: 'MEMBUTUHKAN PENILAIAN',
                icon: Star,
                color: 'text-orange-500'
              },
              {
                name: 'Mahasiswa Rentan (At-Risk)',
                value: adminStats?.pedagogical_stats?.at_risk_count || 0,
                label: 'BELUM ADA PROGRES',
                icon: AlertCircle,
                color: 'text-red-500'
              }
            ].map((stat) => (
              <div 
                key={stat.name} 
                className="uiverse-card bg-gradient-to-br from-blue-600 to-blue-700 min-h-[220px] rounded-[40px] shadow-xl border border-white/20 flex flex-col items-center justify-center text-center p-6 group overflow-hidden"
              >
                <div className="uiverse-glass !opacity-20"></div>
                <div className="uiverse-content p-3 bg-white/20 backdrop-blur-md rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="uiverse-content space-y-1">
                  <span className="text-3xl font-black text-white tracking-tighter">
                    {stat.value}
                  </span>
                  <p className="text-[9px] font-black text-blue-100 uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
                <p className="uiverse-content mt-3 text-[9px] font-bold text-blue-200/60 uppercase tracking-[0.2em]">
                  {stat.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* DETAILED MONITORING SUMMARY PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
          {/* Pedagogis Card: Hard Materials */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm">
            <h3 className="text-[10px] md:text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" /> 3 Materi Paling Sulit Bagi Mahasiswa
            </h3>
            <div className="space-y-4">
              {adminStats?.pedagogical_stats?.difficult_materials?.map((mat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate uppercase">{mat.title}</p>
                    <p className="text-[9px] text-gray-400 font-extrabold uppercase mt-1">TINGKAT KESULITAN TINGGI</p>
                  </div>
                  <span className="text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                    {mat.completions} Selesai
                  </span>
                </div>
              ))}
              {(!adminStats?.pedagogical_stats?.difficult_materials || adminStats.pedagogical_stats.difficult_materials.length === 0) && (
                <p className="text-center py-10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Belum ada data materi sulit yang terkumpul.
                </p>
              )}
            </div>
          </div>

          {/* Quick Tasks & Monitoring Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm">
            <h3 className="text-[10px] md:text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">
              Tindakan Cepat Pemantauan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/student-monitoring" 
                className="p-5 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <Users className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Student Progress</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-white mt-1 leading-tight">Pantau Capaian Level Mahasiswa</p>
                </div>
                <span className="text-[9px] font-black text-blue-700 bg-white border border-blue-100 px-3 py-1.5 rounded-lg uppercase tracking-wider mt-4 self-start">
                  Buka Monitoring
                </span>
              </Link>

              <Link 
                to="/content-management?tab=assignments" 
                className="p-5 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <Star className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Grading Queue</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-white mt-1 leading-tight">Nilai Pengumpulan Tugas Video</p>
                </div>
                <span className="text-[9px] font-black text-orange-700 bg-white border border-orange-100 px-3 py-1.5 rounded-lg uppercase tracking-wider mt-4 self-start">
                  {adminStats?.pending_assignments || 0} Antrean
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pb-10 p-6 md:p-10 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-screen transition-colors duration-300">
      {/* HEADER SECTION - Status Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50 dark:bg-gray-900/40 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-gray-100/50 dark:border-gray-800/50 shrink-0">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="h-12 w-12 md:h-14 md:h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-md overflow-hidden shrink-0">
            {displayUser?.avatar ? (
              <img src={displayUser.avatar} alt={displayUser.name} className="h-full w-full object-cover" />
            ) : (
              displayUser?.name?.[0]
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">{displayUser?.name}</h2>
            <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">{displayUser?.role} • Semester {displayUser?.semester || '6'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:gap-10">
          <div className="flex items-center gap-3">
             <div className="p-2 md:p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <Trophy size={16} className="text-yellow-500 md:w-[18px] md:h-[18px]" />
             </div>
             <div>
                <p className="text-[8px] md:text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Total XP</p>
                <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white leading-none">{displayUser?.points?.toLocaleString()}</p>
             </div>
          </div>

          <div className="h-8 md:h-10 w-px bg-gray-100 dark:bg-gray-800 hidden sm:block"></div>

          <div className="flex items-center gap-3">
             <div className="p-2 md:p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <Star size={16} className="text-blue-500 md:w-[18px] md:h-[18px]" />
             </div>
             <div>
                <p className="text-[8px] md:text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Status</p>
                <p className="text-xs md:text-sm font-black text-blue-600 dark:text-blue-400 leading-none uppercase">Lvl {displayUser?.level}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
        {/* BANNER UTAMA: Balanced Hero Design */}
        <div className="lg:col-span-8 relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 md:p-10 text-white shadow-xl group border border-white/10 min-h-[260px] md:min-h-[320px] flex flex-col justify-center">
          
          {/* Efek Visual Background */}
          <div className="absolute inset-2 bg-white/5 rounded-[2.5rem] backdrop-blur-[2px] pointer-events-none"></div>
          
          {/* Ikon Background Artistik - Always visible (small), expands on hover */}
          <div className="absolute -right-8 -bottom-8 md:-right-10 md:-bottom-10 opacity-[0.04] group-hover:opacity-[0.12] scale-75 group-hover:scale-110 -rotate-12 transition-all duration-700 ease-out pointer-events-none">
            <BookOpen size={180} strokeWidth={1} className="text-white md:w-[280px] md:h-[280px]" />
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-16 group-hover:scale-125 transition-transform duration-1000"></div>

          <div className="relative z-10 max-w-[85%] md:max-w-2xl space-y-4 md:space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 md:p-2 rounded-xl backdrop-blur-md border border-white/10">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.25em] text-blue-100">Portal Mahasiswa UM</span>
            </div>
            
            <h2 className="text-2xl md:text-5xl font-black tracking-tighter leading-[1.1] whitespace-pre-line drop-shadow-sm">
              {settings.dashboard_banner_text}
            </h2>
            
            <div className="pt-2 md:pt-4">
              <Link 
                to="/courses" 
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-6 py-3 md:px-10 md:py-4 rounded-2xl text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-2xl shadow-blue-900/20 active:scale-95 group/btn"
              >
                Mulai Berlatih
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* RANK CARD */}
        <div className="uiverse-parent lg:col-span-4 h-full">
          <div className="uiverse-card bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 h-full shadow-xl border border-gray-50 dark:border-gray-800 flex flex-col justify-between overflow-hidden relative group">
            <div className="logo pointer-events-none">
              <span className="uiverse-logo-circle w-32 h-32 -top-4 -right-4 bg-blue-600/5 opacity-20 group-hover:scale-110 transition-transform duration-700"></span>
              <span className="uiverse-logo-circle w-24 h-24 top-2 right-2 bg-blue-600/10 opacity-30"></span>
            </div>
            <div className="uiverse-glass !rounded-2xl dark:bg-gray-800/40"></div>
            <div className="uiverse-content relative z-10">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 md:mb-6">Peringkat Anda</h3>
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 md:h-16 md:w-16 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800 shadow-inner group-hover:rotate-6 transition-transform">
                  <Crown className="h-7 w-7 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">#{displayUser?.rank || '1'}</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">
                    Peringkat Global
                  </p>
                </div>
              </div>
            </div>
            <Link to="/leaderboard" className="uiverse-content relative z-10 mt-6 md:mt-8 flex items-center justify-between group/btn p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Buka Leaderboard</span>
              <div className="p-1.5 md:p-2 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white shadow-sm group-hover/btn:scale-110 transition-transform">
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Statistik Performa</h3>
          <StatsCards />
        </section>
        <section className="space-y-4">
          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Quick Actions</h3>
          <QuickActions />
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="text-[10px] md:text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Star className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" /> Active Lessons
            </h3>
          </div>
          <ProgressOverview userData={displayUser} />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm transition-colors">
          <h3 className="text-[10px] md:text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6 md:mb-8">Recent Activities</h3>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}