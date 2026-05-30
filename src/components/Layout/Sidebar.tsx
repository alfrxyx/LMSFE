import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  User, 
  Settings, 
  Users,
  Award,
  Shield,
  ClipboardCheck,
  LogOut,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  BarChart3,
  Bell,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StreakVisual } from '../Gamification/StreakVisual';

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Definisikan menu berdasarkan role secara eksplisit untuk menjaga URUTAN
  const getMenuItems = () => {
    if (!user) return [];

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
        { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
        { name: 'Profile Saya', href: '/profile', icon: User },
      ];
    }

    if (user.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Shield },
        { name: 'Mahasiswa', href: '/admin/students', icon: Users },
        { name: 'Analistik', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Kelola Materi', href: '/admin/content', icon: BookOpen },
        { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
        { name: 'Profile Saya', href: '/profile', icon: User },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm font-['Roboto']">
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-3">
        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
          G
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none uppercase">Gamify</h2>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">LMS PJKR UM</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.name + item.href}
            to={item.href}
            className={({ isActive }) => 
              `flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                  : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
              }`
            }
          >
            <div className="flex items-center gap-4">
              <item.icon size={18} className={`${location.pathname === item.href ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
              <span className="text-xs font-bold tracking-tight">{item.name}</span>
            </div>
            <ChevronRight size={14} className={`opacity-0 group-hover:opacity-40 transition-opacity ${location.pathname === item.href ? 'hidden' : ''}`} />
          </NavLink>
        ))}
      </nav>

      {/* User Card Section */}
      <div className="p-6 border-t border-gray-50 bg-gray-50/50">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 overflow-hidden shadow-inner">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tight">{user?.name}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>

          {user?.role === 'student' && (
            <div className="px-1">
              <StreakVisual />
            </div>
          )}
          
          <div className="flex items-center justify-between px-1 pt-2 border-t border-gray-50">
            <div className="flex items-center gap-1.5">
              <Trophy size={14} className="text-orange-500" />
              <span className="text-xs font-black text-gray-700">{user?.points} XP</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
