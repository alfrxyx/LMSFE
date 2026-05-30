import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Users, Search, Loader2, 
  Calendar, Award, Flame, Badge as BadgeIcon,
  ChevronRight
} from 'lucide-react';

export function StudentMonitoring() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teacher/monitoring');
      setStudents(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data monitoring:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.nim.includes(searchTerm);
    const matchesSemester = semesterFilter === 'all' || student.semester === semesterFilter;
    return matchesSearch && matchesSemester;
  });

  if (loading) return <div className="py-12 text-center text-gray-400 font-bold uppercase text-xs">Menganalisis data mahasiswa...</div>;

  return (
    <div className="space-y-6">
      {/* Filters Area */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari NIM atau Nama..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-wider outline-none cursor-pointer"
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
        >
          <option value="all">Semua Semester</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
        </select>
      </div>

      {/* Student Cards - Exact Horizontal Layout from "DaftarMahasiswa" */}
      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Section 1: Info Mahasiswa */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xl overflow-hidden shadow-sm">
                        {student.avatar ? (
                            <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                            student.name[0]
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 truncate uppercase text-sm tracking-tight">{student.name}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{student.nim} • Sem {student.semester}</p>
                    </div>
                </div>

                {/* Section 2: Statistik & Progress */}
                <div className="flex items-center gap-10 lg:px-8 lg:border-x lg:border-gray-50">
                    <div className="flex gap-6">
                        <div className="text-center min-w-[40px]">
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Points</p>
                            <div className="flex items-center justify-center gap-1">
                                <Award size={14} className="text-yellow-500" />
                                <span className="text-sm font-bold text-gray-900">{student.points}</span>
                            </div>
                        </div>
                        <div className="text-center min-w-[40px]">
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Streak</p>
                            <div className="flex items-center justify-center gap-1">
                                <Flame size={14} className={student.current_streak > 0 ? "text-orange-500 fill-orange-500" : "text-gray-300"} />
                                <span className={`text-sm font-bold ${student.current_streak > 0 ? "text-orange-600" : "text-gray-400"}`}>{student.current_streak || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-40 hidden sm:block">
                        <div className="flex justify-between items-end mb-1.5">
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Penyelesaian</p>
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">{student.progress_percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                                style={{ width: `${student.progress_percentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Aktivitas & Navigasi */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden xl:block">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Terakhir Aktif</p>
                        <p className="text-[10px] font-bold text-gray-600 uppercase">{student.last_activity}</p>
                    </div>
                    <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-blue-600 transition-colors">
                       <ChevronRight size={18} />
                    </div>
                </div>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Mahasiswa tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
