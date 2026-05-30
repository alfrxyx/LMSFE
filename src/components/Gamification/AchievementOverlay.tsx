import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award, X, Sparkles, PartyPopper } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AchievementOverlay() {
  const { user } = useAuth();
  const [newAchievement, setNewAchievement] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user || !user.achievements) return;

    // Ambil list ID yang sudah pernah ditampilkan dari localStorage
    const seenIds = JSON.parse(localStorage.getItem('seen_achievement_ids') || '[]');
    
    // Cari achievement yang belum ada di seenIds
    const unread = user.achievements.find(a => !seenIds.includes(a.id));

    if (unread) {
      setNewAchievement(unread);
      setShow(true);
      
      // Update seenIds di localStorage
      const updatedIds = [...seenIds, unread.id];
      localStorage.setItem('seen_achievement_ids', JSON.stringify(updatedIds));
    }
  }, [user]);

  if (!show || !newAchievement) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-gray-900/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Background Sparkles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 animate-bounce"><Sparkles className="text-yellow-400" size={20} /></div>
          <div className="absolute bottom-20 right-10 animate-pulse"><Sparkles className="text-blue-400" size={24} /></div>
          <div className="absolute top-1/2 left-4 animate-ping"><Sparkles className="text-purple-400" size={16} /></div>
        </div>

        {/* Header/Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-center relative">
          <div className="absolute top-4 right-6">
             <button onClick={() => setShow(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={24} />
             </button>
          </div>
          
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-[2rem] bg-white shadow-xl rotate-6 mb-6">
            <Award className="h-12 w-12 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Achievement Unlocked!</h2>
          <p className="text-blue-100 text-[10px] font-black tracking-[0.2em] mt-2 uppercase">LMS PJKR UM</p>
        </div>

        {/* Content */}
        <div className="p-10 text-center space-y-6">
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-2">{newAchievement.name}</h3>
            <p className="text-gray-500 font-medium text-sm px-4 leading-relaxed">
              {newAchievement.description || "Selamat! Kamu telah berhasil membuka pencapaian baru dalam perjalanan belajarmu."}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-center gap-3">
             <PartyPopper className="text-blue-600" size={20} />
             <span className="text-xs font-black text-blue-600 uppercase tracking-widest">+{newAchievement.required_points || 0} XP BONUS</span>
          </div>

          <button 
            onClick={() => setShow(false)}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-gray-200 transition-all active:scale-95"
          >
            MANTAP! LANJUTKAN
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
