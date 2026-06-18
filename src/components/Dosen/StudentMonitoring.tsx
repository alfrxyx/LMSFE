import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Users, Search, Loader2, 
  Calendar, Award, Flame, Badge as BadgeIcon,
  ChevronRight, CheckCircle2, Clock, BookOpen, ChevronDown
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function StudentMonitoring() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { courses } = useApp();

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const response = await
      api.get('/dosen/monitoring');
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
    const matchesSemester = semesterFilter === 'all' || student.semester.toString() === semesterFilter;
    return matchesSearch && matchesSemester;
  });

  if (loading) return (
    <div className="py-20 text-center flex flex-col items-center gap-4">
      <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Menganalisis Progres Mahasiswa...</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6 md:p-10 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Filters Area */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-[2rem] border border-gray-100 shadow-inner">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari NIM atau Nama..."
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-transparent rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-bold shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
          {['all', '1', '2', '3', '4', '5', '6', '7', '8'].map(s => (
            <button
              key={s}
              onClick={() => setSemesterFilter(s)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${semesterFilter === s ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {s === 'all' ? 'SEMUA' : `S${s}`}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards */}
      <div className="space-y-4">
        {filteredStudents.map((student) => (
          <div key={student.id} className={`bg-white rounded-[2rem] border transition-all overflow-hidden ${expandedId === student.id ? 'border-blue-200 shadow-xl ring-4 ring-blue-50' : 'border-gray-100 shadow-sm hover:border-blue-100'}`}>
            <div 
              onClick={() => setExpandedId(expandedId === student.id ? null : student.id)}
              className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer"
            >
                {/* Section 1: Info Mahasiswa */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-14 w-14 flex-shrink-0 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl overflow-hidden shadow-lg shadow-blue-100">
                        {student.avatar ? (
                            <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                            student.name[0]
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-black text-gray-900 truncate uppercase text-sm tracking-tight">{student.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-widest">NIM {student.nim}</span>
                           <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg uppercase tracking-widest">SEM {student.semester}</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Statistik & Progress */}
                <div className="flex items-center gap-8 lg:px-8 lg:border-x lg:border-gray-50">
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Points</p>
                            <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg">
                                <Award size={12} className="text-yellow-500" />
                                <span className="text-xs font-black text-gray-900">{student.points}</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Streak</p>
                            <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg">
                                <Flame size={12} className={student.current_streak > 0 ? "text-orange-500 fill-orange-500" : "text-gray-300"} />
                                <span className={`text-xs font-black ${student.current_streak > 0 ? "text-orange-600" : "text-gray-400"}`}>{student.current_streak || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-40 hidden sm:block">
                        <div className="flex justify-between items-end mb-2">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Mastery</p>
                            <span className="text-[10px] font-black text-blue-600">{student.progress_percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000" 
                                style={{ width: `${student.progress_percentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Navigasi */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden xl:block">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Last Active</p>
                        <p className="text-[10px] font-black text-gray-600 uppercase">{student.last_activity}</p>
                    </div>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${expandedId === student.id ? 'bg-blue-600 text-white rotate-180 shadow-lg shadow-blue-200' : 'bg-gray-50 text-gray-400'}`}>
                       <ChevronDown size={20} />
                    </div>
                </div>
            </div>

            {/* EXPANDED CONTENT: Peta Materi */}
            {expandedId === student.id && (
              <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-300">
                <div className="border-t border-gray-50 pt-6 space-y-8">
                  <div className="flex items-center justify-between">
                     <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <BookOpen size={14} className="text-blue-600" /> Curriculum Progress Details
                     </h5>
                     <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                           <div className="h-2 w-2 rounded-full bg-green-500"></div>
                           <span className="text-[8px] font-bold text-gray-400 uppercase">Selesai</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <div className="h-2 w-2 rounded-full bg-gray-200"></div>
                           <span className="text-[8px] font-bold text-gray-400 uppercase">Belum</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.filter((c: any) => c.semester === student.semester).map((course: any) => (
                      <div key={course.id} className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-4">{course.title}</p>
                        <div className="flex flex-wrap gap-2">
                           {course.levels?.map((lvl: any) => {
                             const isDone = student.completed_level_ids?.includes(lvl.id);
                             return (
                               <div 
                                 key={lvl.id} 
                                 title={lvl.title}
                                 className={`h-8 px-3 rounded-lg flex items-center gap-2 text-[8px] font-black uppercase transition-all ${isDone ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm' : 'bg-white text-gray-400 border border-gray-200'}`}
                               >
                                 {isDone ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                 Pertemuan {lvl.order}
                               </div>
                             );
                           })}
                        </div>
                      </div>
                    ))}
                    {courses.filter((c: any) => c.semester === student.semester).length === 0 && (
                      <div className="col-span-full py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Belum ada materi untuk semester ini</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Mahasiswa tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
