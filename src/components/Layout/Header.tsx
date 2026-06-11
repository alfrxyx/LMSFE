import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
 Bell, X, CheckCircle, Info, AlertCircle,
 Trash2, Search, BookOpen, Play, Calendar, User, Menu, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import api from '../../api/axios';
import { toast } from 'sonner';
import { ThemeToggle } from '../Shared/ThemeToggle';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
 const { user } = useAuth();
 const { courses } = useApp();
 const navigate = useNavigate();
 const [notifications, setNotifications] = useState<any[]>([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const [showDropdown, setShowDropdown] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [searchResults, setSearchResults] = useState<any[]>([]);
 const [showSearchResults, setShowSearchResults] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const searchRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 if (user) {
 fetchNotifications();
 }
 }, [user]);

 useEffect(() => {
 function handleClickOutside(event: MouseEvent) {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setShowDropdown(false);
 }
 if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
 setShowSearchResults(false);
 }
 }
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 useEffect(() => {
 if (searchQuery.trim().length > 1) {
 const filtered = courses.filter((c: any) => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
 ).map((c: any) => ({
    id: c.id,
    title: c.title,
    url: `/courses/${c.id}`
 }));
 setSearchResults(filtered.slice(0, 5));
 setShowSearchResults(true);
 } else {
 setSearchResults([]);
 setShowSearchResults(false);
 }
 }, [searchQuery, courses]);

 const fetchNotifications = async () => {
 try {
 const response = await api.get('/notifications');
 setNotifications(response.data.data);
 setUnreadCount(response.data.unread_count);
 } catch (error) {}
 };

 const markAsRead = async (id: number) => {
   try {
     await api.post(`/notifications/${id}/read`);
     setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
     setUnreadCount(prev => Math.max(0, prev - 1));
   } catch (error) {}
 };

 const markAllAsRead = async () => {
   try {
     await api.post('/notifications/read-all');
     setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
     setUnreadCount(0);
     toast.success("Semua notifikasi ditandai dibaca");
   } catch (error) {}
 };

 const getNotificationIcon = (type: string) => {
   switch (type) {
     case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
     case 'warning': return <AlertCircle className="h-4 w-4 text-orange-500" />;
     case 'info': return <Info className="h-4 w-4 text-blue-500" />;
     default: return <Bell className="h-4 w-4 text-blue-400" />;
   }
 };

 // Helper untuk grouping notifikasi berdasarkan waktu
 const groupedNotifications = notifications.reduce((groups: any, n) => {
   const date = new Date(n.created_at);
   const today = new Date();
   const yesterday = new Date();
   yesterday.setDate(yesterday.getDate() - 1);

   let groupKey = 'Terdahulu';
   if (date.toDateString() === today.toDateString()) {
     groupKey = 'Hari Ini';
   } else if (date.toDateString() === yesterday.toDateString()) {
     groupKey = 'Kemarin';
   }

   if (!groups[groupKey]) groups[groupKey] = [];
   groups[groupKey].push(n);
   return groups;
 }, {});

 // Urutan group yang diinginkan
 const groupOrder = ['Hari Ini', 'Kemarin', 'Terdahulu'];

 if (!user) return null;

 return (
 <div className="sticky top-0 z-40 w-full p-4 md:p-6 transition-all font-['Roboto']">
 <header className="mx-auto bg-white/70 backdrop-blur-md border border-white/40 shadow-xl shadow-blue-900/5 rounded-[1.5rem] h-16 md:h-20 flex items-center px-6 md:px-10 transition-all">
   <div className="flex justify-between items-center w-full gap-4 md:gap-8">

     {/* Hamburger Menu (Mobile Only) */}
     <button 
       onClick={onMenuClick}
       className="lg:hidden p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all shrink-0"
     >
       <Menu size={20} />
     </button>

     {/* Search Bar - Matching Header.png Style */}
     <div className="flex-1 max-w-xl relative" ref={searchRef}>
       <div className="relative group">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
         <input 
           type="text" 
           placeholder="Cari materi atau tugas..." 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full bg-gray-50/80 dark:bg-gray-800/80 dark:text-white border border-transparent focus:bg-white focus:border-blue-100 dark:focus:border-gray-700 rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold outline-none transition-all shadow-inner"
         />

         {showSearchResults && searchResults.length > 0 && (
           <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
             {searchResults.map((res) => (
               <button 
                 key={res.id} 
                 onClick={() => { navigate(res.url); setShowSearchResults(false); setSearchQuery(''); }} 
                 className="w-full p-4 text-left hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors"
               >
                  <p className="text-xs font-black text-gray-900">{res.title}</p>
               </button>
             ))}
           </div>
         )}
       </div>
     </div>

     {/* Right Actions */}
     <div className="flex items-center gap-2 md:gap-4">
       <ThemeToggle />
       <div className="relative" ref={dropdownRef}>
         <button 
           onClick={() => setShowDropdown(!showDropdown)} 
           className={`p-2.5 rounded-xl transition-all relative ${showDropdown ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
         >
           <Bell size={20} />
           {unreadCount > 0 && (
             <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-black shadow-sm">
               {unreadCount}
             </span>
           )}
         </button>

         {showDropdown && (
           <div className="absolute right-0 mt-4 w-72 md:w-[360px] bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-300 origin-top-right">
             {/* COMPACT HEADER */}
             <div className="px-6 py-5 bg-white border-b border-gray-50 flex items-center justify-between">
               <div>
                 <p className="text-lg font-black text-gray-900 tracking-tight leading-none">Notifikasi</p>
               </div>

               <button 
                 onClick={markAllAsRead}
                 disabled={unreadCount === 0}
                 className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                   unreadCount > 0 
                   ? "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm" 
                   : "bg-gray-50 text-gray-300 cursor-not-allowed"
                 }`}
               >
                 Baca Semua
               </button>
             </div>

             {/* COMPACT SCROLLABLE CONTENT */}
             <div className="max-h-[380px] overflow-y-auto custom-scrollbar bg-white">
               {notifications.length > 0 ? (
                 <div className="pb-2">
                   {groupOrder.map(groupKey => {
                     const groupItems = groupedNotifications[groupKey];
                     if (!groupItems || groupItems.length === 0) return null;

                     return (
                       <React.Fragment key={groupKey}>
                         {/* CLEAN GROUP HEADER */}
                         <div className="px-6 pt-5 pb-2 bg-white">
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">{groupKey}</span>
                         </div>

                         {groupItems.map((n: any) => (
                           <div 
                            key={n.id} 
                            onClick={() => markAsRead(n.id)}
                            className={`px-6 py-4 transition-all cursor-pointer relative group hover:bg-gray-50/50 flex gap-4 ${!n.is_read ? 'bg-blue-50/10' : ''}`}
                           >
                             {/* ULTRA-MINIMAL UNREAD INDICATOR */}
                             {!n.is_read && (
                               <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                             )}

                             {/* ICON AREA - SMALLER SOFT CIRCLES */}
                             <div className="shrink-0 pt-0.5">
                               <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                                 !n.is_read 
                                 ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                                 : 'bg-gray-50 text-gray-400 border border-gray-100'
                               }`}>
                                 {/* Memperkecil ikon sedikit agar proporsional dengan lingkaran 32px */}
                                 {React.cloneElement(getNotificationIcon(n.type) as React.ReactElement, { size: 14 })}
                               </div>
                             </div>

                             {/* CONTENT AREA */}
                             <div className="min-w-0 flex-1">
                               <div className="flex items-center justify-between gap-2 mb-0.5">
                                 <h4 className={`text-xs font-black uppercase tracking-tight truncate ${!n.is_read ? 'text-gray-900' : 'text-gray-400'}`}>
                                   {n.title}
                                 </h4>
                                 <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">
                                   {new Date(n.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                               </div>

                               <p className={`text-[11px] leading-snug ${!n.is_read ? 'text-gray-600 font-medium' : 'text-gray-400 font-normal'} line-clamp-2`}>
                                 {n.message}
                               </p>

                               {!n.is_read && (
                                 <div className="mt-2 flex items-center gap-1 text-blue-600 group-hover:translate-x-1 transition-transform">
                                    <span className="text-[8px] font-black uppercase tracking-[0.1em]">Cek Detail</span>
                                    <ChevronRight size={10} strokeWidth={3} />
                                 </div>
                               )}
                             </div>
                           </div>
                         ))}
                       </React.Fragment>
                     );
                   })}
                 </div>
               ) : (
                 <div className="py-16 text-center">
                   <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-50/50 shadow-inner">
                      <Bell className="h-6 w-6 text-gray-200" />
                   </div>
                   <h4 className="text-sm font-black text-gray-300 uppercase tracking-[0.2em]">Kosong</h4>
                 </div>
               )}
             </div>

             {/* COMPACT FOOTER */}
             {notifications.length > 0 && (
               <div className="p-5 bg-white text-center border-t border-gray-50">
                  <button 
                    onClick={() => navigate('/notifications')}
                    className="px-6 py-2 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 active:scale-95"
                  >
                    Lihat Semua
                  </button>
               </div>
             )}
           </div>
         )}
         </div>

         <div className="h-8 w-px bg-gray-100 mx-1 hidden md:block"></div>

         <button 
           onClick={() => navigate('/profile')} 
           className="flex items-center gap-2 md:gap-3 bg-gray-900 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 group shrink-0"
         >
           <div className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 group-hover:border-white/40 transition-colors shrink-0">
             {user.avatar ? (
               <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
             ) : (
               <span className="text-[10px] font-black">{user.name[0]}</span>
             )}
           </div>
           <span className="text-[11px] font-black uppercase tracking-[0.1em] hidden sm:block">Profile</span>
         </button>
       </div>
     </div>
   </header>
 </div>
 );
}
