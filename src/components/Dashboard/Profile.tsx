import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
 User, Mail, Calendar, Award, 
 Trophy, Star, Settings, Camera,
 Hash, GraduationCap, Phone, MapPin, Flame, Sparkles, ChevronRight
} from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';

export function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLocalLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (authLoading || localLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Memuat Profil PJKR...</p>
    </div>
  );

  if (!user) return null;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-10 pb-12 p-6 md:p-10 bg-white rounded-xl border border-gray-100 shadow-sm min-h-screen">
      {/* PREMIUM MODERN HEADER */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden transition-all duration-500">
        {/* Banner with Mesh Gradient and Organic Shapes */}
        <div className="h-44 md:h-60 bg-[#0F172A] relative overflow-hidden">
          {/* Mesh Gradient Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-500/20"></div>
          <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]"></div>
          
          {/* Subtle Grid - very faint */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>
        
        <div className="px-6 md:px-12 pb-10">
          <div className="relative flex flex-col md:flex-row md:items-end -mt-20 md:-mt-24 gap-8">
            {/* Avatar Section */}
            <div className="relative shrink-0 group">
              <div className="h-36 w-36 md:h-48 md:w-48 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                <div className="h-full w-full rounded-[2rem] bg-gray-50 flex items-center justify-center border-2 border-gray-100 overflow-hidden relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 text-5xl font-black">
                      {user.name?.[0]}
                    </div>
                  )}
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-2 right-2 p-3.5 bg-gray-900 text-white rounded-2xl shadow-xl hover:bg-blue-600 transition-all duration-300 border-4 border-white active:scale-90"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight truncate drop-shadow-sm">
                  {user.name}
                </h1>
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.15em] border border-blue-100 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  {user.role === 'admin' ? 'Administrator Platform' : user.role === 'teacher' || user.role === 'dosen' ? 'Dosen Pengampu' : 'Mahasiswa Aktif'}
                </div>
              </div>

              {user.bio ? (
                <p className="text-gray-500 font-medium text-base md:text-lg max-w-2xl leading-relaxed italic">
                  "{user.bio}"
                </p>
              ) : (
                <p className="text-gray-400 font-medium text-sm italic">Belum menambahkan biografi...</p>
              )}

              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 mt-6">
                <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-50 rounded-2xl text-gray-500 font-bold text-xs border border-gray-100 transition-colors hover:bg-white hover:border-blue-100">
                  <MapPin className="h-4 w-4 text-blue-600" /> Universitas Negeri Malang
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-50 rounded-2xl text-gray-500 font-bold text-xs border border-gray-100 transition-colors hover:bg-white hover:border-blue-100">
                  <Hash className="h-4 w-4 text-blue-600" /> {user.nim || 'NIM Tidak Terdaftar'}
                </div>
                <div className="bg-gray-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gray-200">
                  {user.role}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="md:mb-2 flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-[1.5rem] border border-gray-200 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 hover:border-gray-900 transition-all duration-300 shadow-sm active:scale-95"
            >
              <Settings className="h-4 w-4" /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* STATS SECTION - High Contrast Modern Cards */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 space-y-8">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-3">
              <span className="w-8 h-[2px] bg-gray-100"></span>
              Performance Index
            </h3>
            
            <div className="grid grid-cols-1 gap-5">
              <div className="relative group overflow-hidden p-6 bg-white rounded-3xl border border-gray-100 hover:border-blue-200 transition-all duration-300">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Capaian Level</p>
                    <p className="text-3xl font-black text-gray-900">Rank {user.level}</p>
                  </div>
                </div>
              </div>

              <div className="relative group overflow-hidden p-6 bg-white rounded-3xl border border-gray-100 hover:border-orange-200 transition-all duration-300">
                <div className="absolute top-0 left-0 w-2 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-100 group-hover:scale-110 transition-transform duration-500">
                    <Flame size={24} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Login Streak</p>
                    <p className="text-3xl font-black text-gray-900">{user.current_streak} Hari</p>
                  </div>
                </div>
              </div>

              <div className="relative group overflow-hidden p-6 bg-white rounded-3xl border border-gray-100 hover:border-indigo-200 transition-all duration-300">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Experience</p>
                    <p className="text-3xl font-black text-gray-900">{user.points?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
            <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em] mb-8 relative z-10">Academic Contact</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-5 group cursor-default">
                <div className="p-3 bg-white/5 rounded-2xl text-blue-400 border border-white/5 group-hover:border-blue-500/30 transition-colors">
                  <Mail size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Email Student</p>
                  <p className="text-sm font-bold text-gray-100 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 group cursor-default">
                <div className="p-3 bg-white/5 rounded-2xl text-blue-400 border border-white/5 group-hover:border-blue-500/30 transition-colors">
                  <Phone size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">WhatsApp</p>
                  <p className="text-sm font-bold text-gray-100">{user.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACHIEVEMENTS - Professional Display */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gray-900 text-white rounded-[1.25rem] shadow-lg">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Koleksi Lencana</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pencapaian Praktik Mahasiswa</p>
                </div>
              </div>
              <div className="self-start sm:self-center px-6 py-2 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
                <span className="text-xs font-black uppercase tracking-widest">{user.achievements?.length || 0} Badges Earned</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 flex-1">
              {user.achievements?.map((ach: any) => (
                <div key={ach.id} className="relative p-8 bg-gray-50/30 rounded-[2rem] border border-gray-100 text-center hover:bg-white hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors"></div>
                  
                  <div className="relative">
                    <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md border border-gray-50 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                      <div className="relative">
                        <Star className="text-yellow-500 fill-yellow-400 drop-shadow-sm" size={40} />
                        <Sparkles className="absolute -top-2 -right-2 text-blue-400 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity" size={16} />
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest leading-tight mb-2">{ach.name}</h4>
                    <div className="h-1 w-8 bg-blue-600 mx-auto rounded-full opacity-20 group-hover:w-16 group-hover:opacity-100 transition-all duration-500"></div>
                  </div>
                </div>
              ))}
              
              {(!user.achievements || user.achievements.length === 0) && (
                <div className="col-span-full py-24 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30">
                   <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-inner border border-gray-50">
                     <Trophy size={48} className="text-gray-200" />
                   </div>
                   <h4 className="text-base font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Belum Ada Pencapaian</h4>
                   <p className="text-xs text-gray-400 font-bold max-w-xs uppercase tracking-tight">Selesaikan level praktikum untuk mendapatkan lencana eksklusif ini.</p>
                </div>
              )}
            </div>

            <div className="mt-12 p-8 bg-blue-600 rounded-[2rem] text-white relative overflow-hidden group shadow-xl shadow-blue-200">
               <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
               <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
               
               <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                 <div className="text-center sm:text-left">
                   <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em] mb-2">Next Milestone</p>
                   <p className="text-sm font-black text-white leading-relaxed max-w-sm uppercase tracking-tight">Kumpulkan 5,000 XP untuk membuka akses materi Metodologi Penelitian II</p>
                 </div>
                 <button className="flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl active:scale-95 transition-all">
                   Cek Progres <ChevronRight className="h-4 w-4" />
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  );
}
