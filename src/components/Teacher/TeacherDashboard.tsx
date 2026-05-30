import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Users,
  Award,
  Loader2,
  Clock,
  BookOpen,
  Activity,
  AlertCircle,
  TrendingUp,
  BarChart3,
  FileText,
  LayoutDashboard
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import { StudentMonitoring } from "./StudentMonitoring";
import { toast } from "sonner";

export function TeacherDashboard({
  tab = "overview",
}: {
  tab?: "overview" | "submissions";
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "submissions">(tab);
  const [stats, setStats] = useState<any>(null);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [monitoringData, setMonitoringData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // TABS CONFIGURATION (SAMA SEPERTI KELOLA MATERI)
  const teacherTabs = [
    { id: "overview", name: "Analytics", icon: Activity },
    { id: "submissions", name: "Penilaian", icon: FileText },
  ];

  const semesterXPStats = [1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
    const studentsInSem = (monitoringData || []).filter((s) => s.semester?.toString() === sem.toString());
    const avgXP = studentsInSem.length > 0 ? Math.round(studentsInSem.reduce((sum, s) => sum + (s.points || 0), 0) / studentsInSem.length) : 0;
    return { name: `S${sem}`, avgXP };
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, subRes, monitorRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/teacher/assignments/youtube"),
        api.get("/teacher/monitoring")
      ]);
      
      setStats(statsRes.data);
      setSubmissionsCount(subRes.data.data.length);
      setMonitoringData(monitorRes.data.data);
    } catch (error) {
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="w-full space-y-8 pb-10 p-6 md:p-10 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
      {/* COMPACT HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 bg-gray-50/50 p-6 md:p-8 rounded-[2rem] border border-gray-100/50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">
              Dashboard analysis
            </h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">Analysis Control Center</p>
          </div>
        </div>

        {/* TAB NAVIGATION (MATCHING COMPACT STYLE) */}
        <div className="flex bg-white/50 p-1.5 rounded-2xl shadow-sm border border-gray-100">
          {teacherTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                  : "text-gray-400 hover:text-gray-600 hover:bg-white"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">Menyiapkan Dashboard Dosen...</p>
        </div>
      ) : (
        <div className="flex-1 w-full">
          {activeTab === "overview" ? (
            <div className="space-y-8 w-full">
              {/* STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 uiverse-parent w-full">
                <StatCard label="Total Mahasiswa" value={stats?.total_students} icon={Users} sublabel="DATABASE" />
                <StatCard label="Progres Kelas" value={`${stats?.pedagogical_stats?.avg_class_progress || 0}%`} icon={TrendingUp} sublabel="RATA-RATA" />
                <StatCard label="Mahasiswa Aktif" value={(stats?.total_students || 0) - (stats?.pedagogical_stats?.at_risk_count || 0)} icon={Activity} sublabel="PRODUKTIF" />
                <StatCard label="Pending Tugas" value={submissionsCount} icon={Clock} sublabel="PERLU NILAI" onClick={() => setActiveTab("submissions")} />
              </div>

              {/* CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[400px]">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                     <BarChart3 size={18} className="text-blue-600" /> Penyelesaian Materi
                  </h3>
                  <div className="h-64 w-full">
                    {isMounted && stats?.pedagogical_stats?.difficult_materials && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.pedagogical_stats.difficult_materials}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                          <Tooltip cursor={{fill: '#f8fafc', radius: 10}} />
                          <Bar dataKey="completions" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[400px]">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                     <Activity size={18} className="text-blue-600" /> Tren Performa XP
                  </h3>
                  <div className="h-64 w-full">
                    {isMounted && semesterXPStats.length > 0 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={semesterXPStats}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="avgXP" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.05} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* MONITORING CONTAINER */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden w-full">
                <div className="p-8 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Student Progress Monitoring</h3>
                </div>
                <div className="p-8 w-full">
                  <StudentMonitoring />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[60vh] animate-in fade-in duration-500 w-full">
              <SubmissionsPanel onGradeComplete={fetchDashboardData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, onClick, sublabel }: any) {
  return (
    <div 
      onClick={onClick}
      className={`uiverse-card bg-white min-h-[240px] h-auto rounded-[40px] shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center p-8 group overflow-hidden transition-all ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      {/* Glass Layer - Subtle light effect for white card */}
      <div className="uiverse-glass !opacity-10 !bg-gray-50"></div>

      {/* Ikon Stat - Blue accent for white card */}
      <div className="uiverse-content p-3 bg-blue-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      
      <div className="uiverse-content space-y-1">
        <span className="text-4xl font-black text-gray-900 tracking-tighter">
          {value || 0}
        </span>
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
          {sublabel}
        </p>
      </div>

      <p className="uiverse-content mt-4 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
        {label}
      </p>
    </div>
  );
}

function SubmissionsPanel({ onGradeComplete }: any) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/assignments/youtube');
      setSubmissions(res.data.data);
    } catch (e) { toast.error("Gagal memuat tugas"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  if (loading) return <div className="py-20 text-center text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] animate-pulse">Memuat Antrean Penilaian...</div>;

  return (
    <div className="p-8 space-y-8">
      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Antrean Penilaian ({submissions.length})</h3>
      <div className="divide-y divide-gray-100 border border-gray-100 rounded-[2.5rem] overflow-hidden">
        {submissions.map(sub => (
          <div key={sub.id} className="p-6 flex items-center justify-between gap-6 bg-white hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-[1.5rem] bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 font-bold text-gray-400">
                {sub.user.avatar ? <img src={sub.user.avatar} className="h-full w-full object-cover" /> : sub.user.name[0]}
              </div>
              <div>
                <p className="font-black text-gray-900 uppercase text-sm tracking-tight">{sub.user.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{sub.level?.title}</p>
              </div>
            </div>
            <button className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest">NILAI SEKARANG</button>
          </div>
        ))}
        {submissions.length === 0 && <div className="py-20 text-center text-gray-400 text-sm font-bold uppercase tracking-widest">Antrean Kosong</div>}
      </div>
    </div>
  );
}
