import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Users, Search, Filter, ArrowUpDown, 
  GraduationCap, Calendar, Mail, Hash
} from 'lucide-react';
import { toast } from 'sonner';

export function StudentBySemester() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setStudents(response.data);
    } catch (error) {
      toast.error("Gagal memuat data mahasiswa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students
    .filter(s => 
      (semesterFilter === 'all' || s.semester.toString() === semesterFilter) &&
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       s.nim.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => a.semester - b.semester || a.name.localeCompare(b.name));

  const groupedBySemester = filteredStudents.reduce((acc: any, student) => {
    const sem = student.semester || 'Unset';
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(student);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Memuat Daftar Mahasiswa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-white rounded-xl border border-1 p-9">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Daftar Mahasiswa</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Data seluruh mahasiswa terdaftar berdasarkan semester.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari Nama atau NIM..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:border-blue-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:border-blue-500 outline-none shadow-sm"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
          >
            <option value="all">SEMUA SEMESTER</option>
            {[1,2,3,4,5,6,7,8].map(sem => (
              <option key={sem} value={sem}>SEMESTER {sem}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-10">
        {Object.keys(groupedBySemester).length > 0 ? (
          Object.keys(groupedBySemester).sort().map(semester => (
            <div key={semester} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                  SEMESTER {semester}
                </div>
                <div className="h-px flex-1 bg-gray-100"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {groupedBySemester[semester].length} MAHASISWA
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedBySemester[semester].map((student: any) => (
                  <div key={student.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-blue-600 font-black text-lg border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-gray-900 text-sm truncate uppercase tracking-tight">{student.name}</h3>
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                            <Hash size={12} className="text-gray-400" />
                            {student.nim || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                            <Mail size={12} className="text-gray-400" />
                            <span className="truncate">{student.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status: Aktif</span>
                      </div>
                      <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tight">
                        {student.points} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Tidak ada mahasiswa ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
