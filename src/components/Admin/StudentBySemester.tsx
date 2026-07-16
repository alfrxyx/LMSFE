import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Users, Search, Filter, ArrowUpDown, 
  GraduationCap, Calendar, Mail, Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { StudentDetailModal } from './StudentDetailModal';

export function StudentBySemester() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState('all');

  // State for Detail Modal
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const fetchClassrooms = async () => {
    try {
      const res = await api.get('/admin/classrooms');
      setClassrooms(res.data.data || []);
    } catch (e) {
      console.error("Gagal memuat kelas:", e);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClassrooms();
  }, []);

  const filteredClassrooms = classrooms.filter(cls => 
    semesterFilter === 'all' || cls.semester.toString() === semesterFilter
  );

  useEffect(() => {
    if (selectedClassroom !== 'all') {
      const isClassroomVisible = filteredClassrooms.some(cls => cls.id.toString() === selectedClassroom);
      if (!isClassroomVisible) {
        setSelectedClassroom('all');
      }
    }
  }, [semesterFilter, classrooms]);

  const filteredStudents = students
    .filter(s => 
      (semesterFilter === 'all' || s.semester.toString() === semesterFilter) &&
      (selectedClassroom === 'all' || (s.classrooms && s.classrooms.some((cls: any) => cls.id.toString() === selectedClassroom))) &&
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
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Memuat Daftar Mahasiswa...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 p-6 md:p-10 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-screen transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50/50 dark:bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-100/50 dark:border-gray-800 shrink-0">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            Daftar Mahasiswa <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium italic mt-1">Data seluruh mahasiswa terdaftar berdasarkan angkatan semester.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari Nama atau NIM..."
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold dark:text-white focus:border-blue-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold dark:text-white focus:border-blue-500 outline-none shadow-sm cursor-pointer"
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
          >
            <option value="all">SEMUA KELAS</option>
            {filteredClassrooms.map((cls: any) => (
              <option key={cls.id} value={cls.id.toString()}>
                {cls.name} ({cls.course?.title || 'Mata Kuliah'})
              </option>
            ))}
          </select>

          <select 
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold dark:text-white focus:border-blue-500 outline-none shadow-sm cursor-pointer"
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
                <div className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none">
                  SEMESTER {semester}
                </div>
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {groupedBySemester[semester].length} MAHASISWA
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedBySemester[semester].map((student: any) => (
                  <div 
                    key={student.id} 
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsDetailModalOpen(true);
                    }}
                    className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-lg border border-gray-100 dark:border-gray-700 group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-gray-900 dark:text-white text-sm truncate uppercase tracking-tight">{student.name}</h3>
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                            <Hash size={12} className="text-gray-400" />
                            {student.nim || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                            <Mail size={12} className="text-gray-400" />
                            <span className="truncate">{student.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status: Aktif</span>
                      </div>
                      <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md uppercase tracking-tight">
                        {student.points} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
            <Users className="h-12 w-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-gray-500 font-bold uppercase text-[10px] tracking-widest">Tidak ada mahasiswa ditemukan</p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal 
        isOpen={isDetailModalOpen}
        student={selectedStudent}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStudent(null);
        }}
      />
    </div>
  );
}
