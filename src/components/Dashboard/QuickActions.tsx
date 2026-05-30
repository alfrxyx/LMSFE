import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Trophy, BookOpen, Award, Bookmark, ChevronRight } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { name: 'Continue Learning', category: 'Current Course', icon: Play, href: '/courses', color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'View Leaderboard', category: 'Competition', icon: Trophy, href: '/leaderboard', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { name: 'Browse Courses', category: 'Catalog', icon: BookOpen, href: '/courses', color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'View Achievements', category: 'Rewards', icon: Award, href: '/achievements', color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 uiverse-parent">
      {actions.map((action) => (
        <Link
          key={action.name}
          to={action.href}
          className="uiverse-card group bg-white rounded-[40px] p-8 h-[240px] shadow-xl border border-gray-50 flex flex-col justify-between overflow-hidden"
        >
          {/* Layer Glassmorphism */}
          <div className="uiverse-glass"></div>

          {/* Header */}
          <div className="uiverse-content flex justify-between items-start">
            <div className={`${action.bg} ${action.color} p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-sm`}>
              <action.icon className="h-5 w-5" />
            </div>
            <Bookmark className="h-4 w-4 text-gray-200 group-hover:text-blue-500 transition-colors" />
          </div>

          {/* Body */}
          <div className="uiverse-content space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
              {action.category}
            </p>
            <h4 className="text-lg font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {action.name}
            </h4>
          </div>

          {/* Footer Tombol */}
          <div className="uiverse-content flex items-center justify-between pt-4 border-t border-gray-50/50">
            <span className="text-[9px] font-bold text-gray-400 uppercase">Quick Access</span>
            <div className="bg-gray-900 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-gray-200">
              Launch <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}