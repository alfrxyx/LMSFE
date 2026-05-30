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

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Menyiapkan Dashboard Dosen...</p>
    </div>
  );

  const semesterXPStats = [1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
    const studentsInSem = monitoringData.filter((s) => s.semester?.toString() === sem.toString());
    const avgXP = studentsInSem.length > 0 ? Math.round(studentsInSem.reduce((sum, s) => sum + (s.points || 0), 0) / studentsInSem.length) : 0;
    return { name: `S${sem}`, avgXP };
  });

  // TABS CONFIGURATION (SAMA SEPERTI KELOLA MATERI)
  const teacherTabs = [
    { id: "overview", name: "Analytics", icon: Activity },
    { id: "submissions", name: "Penilaian", icon: FileText },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8 bg-white rounded-xl border border-gray-100">
      {/* HEADER SECTION (LAYOUT KELOLA MATERI) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            Teacher Panel <LayoutDashboard className="h-10 w-10 text-blue-600" />
          </h1>
          <p className="mt-2 text-gray-500 font-medium italic">
            Monitor performa dan evaluasi tugas praktik mahasiswa.
          </p>
        </div>

        {/* TAB NAVIGATION (DESIGN KELOLA MATERI) */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl self-start lg:self-center shadow-sm">
          {teacherTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Mahasiswa" value={stats?.total_students} icon={Users} color="blue" />
            <StatCard label="Progres Kelas" value={`${stats?.pedagogical_stats?.avg_class_progress}%`} icon={TrendingUp} color="green" />
            <StatCard label="Mahasiswa Pasif" value={stats?.pedagogical_stats?.at_risk_count} icon={AlertCircle} color="red" />
            <StatCard label="Pending Tugas" value={submissionsCount} icon={Clock} color="orange" onClick={() => setActiveTab("submissions")} />
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                 <BarChart3 size={18} className="text-blue-600" /> Penyelesaian Materi
              </h3>
              <div className="h-64 w-full">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.pedagogical_stats?.difficult_materials || []}>
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
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                 <Activity size={18} className="text-blue-600" /> Tren Performa XP
              </h3>
              <div className="h-64 w-full">
                {isMounted && (
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
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Student Progress Monitoring</h3>
            </div>
            <div className="p-8">
              <StudentMonitoring />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[50vh] animate-in fade-in duration-500">
          <SubmissionsPanel onGradeComplete={fetchDashboardData} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, onClick }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600"
  };
  return (
    <div onClick={onClick} className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-blue-200 transition-all ${onClick ? 'cursor-pointer active:scale-95' : ''}`}>
      <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value || 0}</p>
      </div>
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
