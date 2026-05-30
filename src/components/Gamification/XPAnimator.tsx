import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface XPPop {
  id: number;
  amount: number;
  x: number;
  y: number;
}

export function XPAnimator() {
  const { user } = useAuth();
  const [pops, setPops] = useState<XPPop[]>([]);
  const prevXP = useRef<number | null>(null);

  useEffect(() => {
    if (user && prevXP.current !== null && user.points > prevXP.current) {
      const diff = user.points - prevXP.current;
      
      // Trigger new animation
      const newPop: XPPop = {
        id: Date.now(),
        amount: diff,
        // Acak posisi sedikit agar tidak bertumpuk jika cepat
        x: Math.random() * 40 - 20, 
        y: Math.random() * 40 - 20
      };

      setPops(prev => [...prev, newPop]);

      // Hapus pop setelah animasi selesai (2 detik)
      setTimeout(() => {
        setPops(prev => prev.filter(p => p.id !== newPop.id));
      }, 2000);
    }
    
    if (user) {
      prevXP.current = user.points;
    }
  }, [user?.points]);

  if (pops.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pops.map(pop => (
        <div
          key={pop.id}
          className="absolute left-1/2 top-1/2 flex flex-col items-center animate-xp-float"
          style={{
            transform: `translate(calc(-50% + ${pop.x}px), calc(-50% + ${pop.y}px))`
          }}
        >
          <div className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl border-2 border-blue-400">
            <Sparkles className="h-5 w-5 fill-current text-yellow-300" />
            <span className="text-2xl font-black italic">+{pop.amount} XP</span>
          </div>
          <div className="mt-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Great Work!
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
}
