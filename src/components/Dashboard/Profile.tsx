import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
 User, Mail, Calendar, Award, 
 Trophy, Star, Settings, Camera,
 Hash, GraduationCap, Phone, MapPin, Flame, Sparkles
} from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';

export function Profile() {
 const { user } = useAuth();
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);

 if (!user) return null;

 return (
 <div className="space-y-8 animate-in fade-in duration-500">
   {/* HEADER PROFIL DENGAN BANNER (DESAIN ASLI) */}
   <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
     <div className="h-48 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 relative">
       <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
     </div>
     <div className="px-8 pb-10">
       <div className="relative flex flex-col md:flex-row md:items-end -mt-20 gap-8">
         <div className="relative group self-start">
           <div className="h-40 w-40 rounded-[2.5rem] bg-white p-1.5 shadow-2xl">
             <div className="h-full w-full rounded-[2rem] bg-blue-50 flex items-center justify-center border-4 border-white overflow-hidden">
               {user.avatar ? (
                 <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
               ) : (
                 <User className="h-20 w-20 text-blue-600" />
               )}
             </div>
           </div>
           <button 
             onClick={() => setIsEditModalOpen(true)}
             className="absolute bottom-3 right-3 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all border-4 border-white"
           >
             <Camera className="h-5 w-5" />
           </button>
         </div>
         
         <div className="flex-1 mb-2">
           <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">{user.name}</h1>
             <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
               Online
             </span>
           </div>

           {user.bio && (
             <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-2xl border border-blue-100 shadow-sm">
               <Sparkles size={14} className="text-blue-500 fill-current animate-pulse" />
               <span className="text-[11px] font-black uppercase tracking-widest leading-none">{user.bio}</span>
             </div>
           )}

           <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-gray-500 font-bold text-sm">
             <span className="flex items-center gap-1.5">
               <MapPin className="h-4 w-4 text-blue-500" /> Universitas Malang
             </span>
             <span className="text-gray-300">•</span>
             <span className="bg-blue-600 text-white px-3 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">
               {user.role}
             </span>
           </div>
         </div>

         <button 
           onClick={() => setIsEditModalOpen(true)}
           className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 mb-2 active:scale-95"
         >
           <Settings className="h-4 w-4" /> Edit Profile
         </button>
       </div>
     </div>
   </div>

   <EditProfileModal 
     isOpen={isEditModalOpen} 
     onClose={() => setIsEditModalOpen(false)} 
   />

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
     {/* KOLOM KIRI: INFO AKUN */}
     <div className="lg:col-span-1 space-y-6">
       <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
         <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Statistik Mahasiswa</h3>
         <div className="space-y-4">
           <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <span className="text-xs font-bold text-gray-500">Level</span>
             <span className="font-black text-blue-600 uppercase">Lvl {user.level}</span>
           </div>
           <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <span className="text-xs font-bold text-gray-500">Points</span>
             <span className="font-black text-gray-900 uppercase">{user.points} XP</span>
           </div>
           <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <span className="text-xs font-bold text-gray-500">Streak</span>
             <span className="font-black text-orange-600 uppercase">{user.current_streak} Hari</span>
           </div>
         </div>
       </div>

       <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
         <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Kontak Akademik</h3>
         <div className="space-y-4">
           <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <Mail size={18} className="text-blue-500" />
             <span className="text-xs font-black text-gray-700 truncate">{user.email}</span>
           </div>
           <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <Phone size={18} className="text-blue-500" />
             <span className="text-xs font-black text-gray-700">{user.phone || '-'}</span>
           </div>
         </div>
       </div>
     </div>

     {/* KOLOM KANAN: ACHIEVEMENTS */}
     <div className="lg:col-span-2">
       <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm h-full">
         <div className="flex items-center gap-3 mb-8">
            <Award className="text-blue-600" />
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Achievements Collection</h3>
         </div>
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
           {user.achievements?.map((ach: any) => (
             <div key={ach.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 text-center hover:bg-white hover:shadow-xl transition-all group">
               <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                 <Star className="text-yellow-500 fill-yellow-500" size={24} />
               </div>
               <p className="text-[10px] font-black text-gray-900 uppercase leading-tight tracking-tight">{ach.name}</p>
             </div>
           ))}
           {(!user.achievements || user.achievements.length === 0) && (
             <div className="col-span-full py-20 text-center">
                <Trophy size={48} className="text-gray-100 mx-auto mb-4" />
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Koleksi Masih Kosong</p>
             </div>
           )}
         </div>
       </div>
     </div>
   </div>
 </div>
 );
}
