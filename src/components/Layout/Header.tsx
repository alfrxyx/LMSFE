import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
 Bell, X, CheckCircle, Info, AlertCircle,
 Trash2, Search, BookOpen, Play, Calendar, User, Menu
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import api from '../../api/axios';
import { toast } from 'sonner';

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
             className="w-full bg-gray-50/80 border border-transparent focus:bg-white focus:border-blue-100 rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold outline-none transition-all shadow-inner"
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
             <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
               <div className="p-4 border-b border-gray-50 bg-gray-50 font-black text-xs uppercase tracking-widest text-gray-900">Notifikasi</div>
               <div className="max-h-80 overflow-y-auto no-scrollbar">
                 {notifications.length > 0 ? notifications.map(n => (
                   <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-blue-50/20' : ''}`}>
                     <p className="text-xs font-black text-gray-900">{n.title}</p>
                     <p className="mt-1 text-[10px] font-medium text-gray-500 line-clamp-2">{n.message}</p>
                   </div>
                 )) : <div className="p-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Tidak ada pesan</div>}
               </div>
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
