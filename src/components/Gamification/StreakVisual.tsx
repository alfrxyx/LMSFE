import React from 'react';
import { Flame } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function StreakVisual() {
  const { user } = useAuth();

  if (!user || user.current_streak === undefined) return null;

  const streak = user.current_streak || 0;
  const isActive = streak > 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-500 ${
      isActive 
        ? 'bg-orange-50 border-orange-100 text-orange-600 shadow-sm shadow-orange-50' 
        : 'bg-gray-50 border-gray-100 text-gray-400 opacity-50'
    }`}>
      <div className={`relative ${isActive ? 'animate-bounce' : ''}`}>
        <Flame size={16} className={isActive ? 'fill-current' : ''} />
        {isActive && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        )}
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[11px] font-black tracking-tight">{streak} HARI</span>
        <span className="text-[8px] font-bold uppercase tracking-widest">STREAK</span>
      </div>
    </div>
  );
}
