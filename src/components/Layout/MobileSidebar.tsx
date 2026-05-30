import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  X, Home, BookOpen, Trophy, 
  User, Shield, GraduationCap, 
  BookOpen as ContentIcon, ClipboardCheck,
  LogOut, Star, Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createPortal } from 'react-dom';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getMenuItems = () => {
    if (user.role === 'student') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Materi', href: '/courses', icon: BookOpen },
        { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
        { name: 'Pencapaian', href: '/achievements', icon: Award },
        { name: 'Profile Saya', href: '/profile', icon: User },
      ];
    }

    if (user.role === 'dosen') {
      return [
        { name: 'Dashboard', href: '/teacher/dashboard', icon: Home },
        { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
        { name: 'Penilaian', href: '/teacher/grading', icon: ClipboardCheck },
        { name: 'Daftar Mahasiswa', href: '/admin/students-by-semester', icon: GraduationCap },
        { name: 'Kelola Materi', href: '/admin/content', icon: BookOpen },
        { name: 'Profile Saya', href: '/profile', icon: User },
      ];
    }

    if (user.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Shield },
        { name: 'Mahasiswa', href: '/admin/students', icon: GraduationCap },
        { name: 'Kelola Materi', href: '/admin/content', icon: BookOpen },
        { name: 'Profile Saya', href: '/profile', icon: User },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return createPortal(
    <div className={`fixed inset-0 z-[10000] lg:hidden transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Content */}
      <div className={`absolute inset-y-0 left-0 w-80 bg-white shadow-2xl flex flex-col transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
              G
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none uppercase">Gamify</h2>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">LMS PJKR UM</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) => 
                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                    : 'text-gray-500 hover:bg-blue-50'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-sm font-bold">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-8 border-t border-gray-50">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm overflow-hidden">
                  {user.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : user.name[0]}
                </div>
                <div>
                   <p className="text-xs font-black text-gray-900 uppercase truncate max-w-[100px]">{user.name}</p>
                   <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{user.points} XP</p>
                </div>
             </div>
             <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500">
                <LogOut size={18} />
             </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
