import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
 Users, Search, Filter, Mail, Award, Trash2, 
 Edit2, Loader2, UserPlus, Hash, GraduationCap, Phone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StudentDetailModal } from './StudentDetailModal';

export function StudentManagement() {
 const { token } = useAuth();
 const [students, setStudents] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [semesterFilter, setSemesterFilter] = useState<string>('all');
 
 // State for Detail Modal
 const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

 // Fetch data mahasiswa dari AdminController@indexUsers
 useEffect(() => {
 const fetchStudents = async () => {
 try {
 setLoading(true);
 const response = await api.get(`/admin/users?semester=${semesterFilter}`);
 setStudents(response.data);
 } catch (error) {
 console.error("Gagal mengambil data mahasiswa:", error);
 } finally {
 setLoading(false);
 }
 };

 if (token) fetchStudents();
 }, [token, semesterFilter]);

 // FIX: Filter pencarian mendukung pencarian berdasarkan NIM
 const filteredStudents = students.filter(student =>
 student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 student.nim?.includes(searchTerm) || // Mendukung cari lewat NIM
 student.email.toLowerCase().includes(searchTerm.toLowerCase())
 );

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
 <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
 <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Menyinkronkan Data Mahasiswa PJKR...</p>
 </div>
 );
 }

 return (
 <div className="space-y-8 p-6 md:p-10 bg-white rounded-xl border border-gray-100 shadow-sm">
 {/* Header & Button Tambah */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="flex items-center gap-4">
 <div className="p-4 bg-blue-600 rounded-[2rem] shadow-xl shadow-blue-100">
 <Users className="h-8 w-8 text-white" />
 </div>
 <div>
 <h1 className="text-4xl font-black text-gray-900 tracking-tight">Student Management</h1>
 <p className="text-gray-500 font-medium mt-1">Total {students.length} Mahasiswa terdaftar dalam sistem.</p>
 </div>
 </div>
 <button className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
 <UserPlus className="h-5 w-5" /> TAMBAH MAHASISWA
 </button>
 </div>

 {/* Filter & Search Section */}
 <div className="flex flex-col gap-6">
 {/* Semester Filter Bar */}
 <div className="flex bg-gray-100 p-1.5 rounded-2xl self-start shadow-sm overflow-x-auto max-w-full no-scrollbar">
 {['all', '1', '2', '3', '4', '5', '6', '7', '8'].map(sem => (
 <button 
 key={`sem-filter-${sem}`} 
 onClick={() => setSemesterFilter(sem)}
 className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${semesterFilter === sem ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
 >
 {sem === 'all' ? 'SEMUA ANGKATAN' : `SEMESTER ${sem}`}
 </button>
 ))}
 </div>

 <div className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-2 items-center">
 <div className="relative flex-1 w-full">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
 <input
 type="text"
 placeholder="Cari berdasarkan NIM, Nama, atau Email..."
 className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 </div>
 </div>

 {/* Tabel Mahasiswa dengan Kolom Akademik Lengkap */}
 <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead className="bg-gray-50/50 border-b border-gray-100">
 <tr>
 <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identitas Mahasiswa</th>
 <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kontak & Akademik</th>
 <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Gamifikasi</th>
 <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {filteredStudents.map((student) => (
 <tr 
   key={student.id} 
   onClick={() => {
     setSelectedStudent(student);
     setIsDetailModalOpen(true);
   }}
   className="hover:bg-blue-50/30 transition-colors cursor-pointer"
 >
 <td className="px-6 py-5">
 <div className="flex items-center gap-4">
 <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100 overflow-hidden">
 {student.avatar ? (
   <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
 ) : (
   student.name[0]
 )}
 </div>
 <div>
 <span className="block font-black text-gray-900 leading-tight">{student.name}</span>
 <div className="flex items-center gap-1.5 mt-1">
 <Hash className="h-3 w-3 text-blue-500" />
 <span className="text-xs font-bold text-blue-600">{student.nim}</span>
 </div>
 </div>
 </div>
 </td>
 <td className="px-6 py-5">
 <div className="space-y-1.5">
 <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
 <Mail className="h-3.5 w-3.5 text-gray-400" /> {student.email}
 </div>
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
 <GraduationCap className="h-3 w-3" /> SEMESTER {student.semester}
 </div>
 <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">
 <Phone className="h-3 w-3" /> {student.phone || '-'}
 </div>
 </div>
 </div>
 </td>
 <td className="px-6 py-5">
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-2 text-blue-600 font-black">
 <Award className="h-4 w-4" /> {student.points} XP
 </div>
 <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
 <div className="h-full bg-blue-500" style={{ width: `${(student.level / 10) * 100}%` }}></div>
 </div>
 <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">LEVEL {student.level}</span>
 </div>
 </td>
 <td className="px-6 py-5">
 <div className="flex items-center justify-center gap-2">
 <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-blue-100">
 <Edit2 className="h-5 w-5" />
 </button>
 <button className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-red-100">
 <Trash2 className="h-5 w-5" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 
 {filteredStudents.length === 0 && (
 <div className="text-center py-20 bg-gray-50/50">
 <Search className="h-16 w-16 text-gray-200 mx-auto mb-4" />
 <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Data Mahasiswa Tidak Ditemukan</p>
 </div>
 )}
 </div>
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