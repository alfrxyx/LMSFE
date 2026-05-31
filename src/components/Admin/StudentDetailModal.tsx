import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Mail, Phone, Hash, GraduationCap, 
  Award, Flame, Trophy, Star, BookOpen, 
  Youtube, CheckCircle2, Clock, AlertCircle,
  ExternalLink, MessageCircle, Settings, Trash2, Bell
} from 'lucide-react';

interface StudentDetailModalProps {
  student: any;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentDetailModal({ student, isOpen, onClose }: StudentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'gamification'>('overview');

  if (!isOpen || !student) return null;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Hash },
    { id: 'academic', name: 'Akademik', icon: BookOpen },
    { id: 'gamification', name: 'Gamifikasi', icon: Trophy },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 bg-gray-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl h-full max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        
        {/* HEADER SECTION */}
        <div className="relative shrink-0 p-8 bg-gray-900 text-white overflow-hidden">
          {/* Background Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="h-28 w-28 rounded-[2rem] bg-white p-1.5 shadow-2xl shrink-0">
              <div className="h-full w-full rounded-[1.75rem] bg-blue-50 flex items-center justify-center overflow-hidden">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-blue-600">{student.name[0]}</span>
                )}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
                <h2 className="text-3xl font-black tracking-tight uppercase truncate max-w-md">{student.name}</h2>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-green-500/20">
                  {student.is_online ? 'Online' : 'Mahasiswa Aktif'}
                </span>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-y-2 gap-x-6 text-gray-400 font-bold text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-400" /> NIM {student.nim}
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-400" /> Semester {student.semester}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" /> Aktif: {student.last_activity || 'Baru saja'}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/5 shadow-inner">
                <Settings size={20} />
              </button>
              <button 
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-red-500 rounded-2xl transition-all border border-white/5 shadow-inner"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="px-8 pt-4 bg-gray-50 border-b border-gray-100 shrink-0">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-4 rounded-t-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                  ? "bg-white text-blue-600 border-x border-t border-gray-100 shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                }`}
              >
                <tab.icon size={14} />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* MODAL CONTENT - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kontak Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Informasi Kontak</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-100 group transition-all">
                      <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                        <Mail size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Alamat Email</p>
                        <p className="text-sm font-black text-gray-700 truncate">{student.email}</p>
                      </div>
                    </div>
                    
                    <a 
                      href={`https://wa.me/${student.phone?.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-5 bg-green-50 rounded-2xl border border-green-100 group hover:bg-green-100 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-green-600">
                          <MessageCircle size={20} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">Nomor WhatsApp</p>
                          <p className="text-sm font-black text-gray-700">{student.phone || 'Belum diatur'}</p>
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-green-400" />
                    </a>
                  </div>
                </div>

                {/* Bio & Status Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Biografi Mahasiswa</h3>
                  <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 min-h-[140px] flex items-center justify-center">
                    {student.bio ? (
                      <p className="text-gray-600 font-medium italic text-center leading-relaxed italic">"{student.bio}"</p>
                    ) : (
                      <div className="text-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-blue-200 mx-auto" />
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Belum Mengisi Biografi</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Progres Kursus</p>
                  <p className="text-3xl font-black text-blue-600">{student.progress_percentage || 0}%</p>
                  <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${student.progress_percentage || 0}%` }}></div>
                  </div>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Pertemuan Selesai</p>
                  <p className="text-3xl font-black text-green-600">{student.completed_levels_count || 0}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-2">DARI TOTAL MATERI</p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Tugas YouTube</p>
                  <p className="text-3xl font-black text-orange-600">{student.youtube_submissions_count || 0}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-2">SUDAH DIKUMPULKAN</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-8">Status Penilaian Terbaru</h3>
                <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                   <Clock className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Detail histori nilai segera hadir</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gamification' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Level Card */}
                <div className="relative group overflow-hidden p-8 bg-blue-600 rounded-[2rem] shadow-xl shadow-blue-200 text-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <Star size={24} fill="currentColor" className="mb-6 opacity-50" />
                  <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Rank Sekarang</p>
                  <p className="text-4xl font-black italic">Level {student.level}</p>
                </div>

                {/* Streak Card */}
                <div className="relative group overflow-hidden p-8 bg-orange-500 rounded-[2rem] shadow-xl shadow-orange-100 text-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <Flame size={24} fill="currentColor" className="mb-6 opacity-50" />
                  <p className="text-[10px] font-black text-orange-100 uppercase tracking-widest mb-1">Active Streak</p>
                  <p className="text-4xl font-black italic">{student.current_streak} Hari</p>
                </div>

                {/* Points Card */}
                <div className="relative group overflow-hidden p-8 bg-purple-600 rounded-[2rem] shadow-xl shadow-purple-100 text-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <Award size={24} fill="currentColor" className="mb-6 opacity-50" />
                  <p className="text-[10px] font-black text-purple-100 uppercase tracking-widest mb-1">Total Experience</p>
                  <p className="text-4xl font-black italic">{student.points?.toLocaleString()} XP</p>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Etalase Lencana Mahasiswa</h3>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                    {student.achievements?.length || 0} Badges
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {student.achievements?.map((ach: any) => (
                    <div key={ach.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center group hover:bg-white hover:shadow-xl transition-all">
                      <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                        <Star className="text-yellow-500 fill-yellow-400" size={24} />
                      </div>
                      <p className="text-[9px] font-black text-gray-900 uppercase leading-tight tracking-tight">{ach.name}</p>
                    </div>
                  ))}
                  
                  {(!student.achievements || student.achievements.length === 0) && (
                    <div className="col-span-full py-10 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">
                       Belum ada lencana yang diperoleh
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 shrink-0">
          <button className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
            <Bell size={18} /> Kirim Notifikasi Akademik
          </button>
          <button className="flex items-center justify-center gap-3 px-8 py-5 bg-white text-red-600 border border-red-100 rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all active:scale-95">
            <Trash2 size={18} /> Blokir Mahasiswa
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
