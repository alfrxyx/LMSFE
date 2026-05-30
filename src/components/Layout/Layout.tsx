import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { AchievementOverlay } from '../Gamification/AchievementOverlay';
import { XPAnimator } from '../Gamification/XPAnimator';

interface LayoutProps {
 children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
 const { user } = useAuth();

 return (
 <div className="min-h-screen bg-[#F8F9FB] flex">
 {/* Achievement & XP Popups Global */}
 <AchievementOverlay />
 <XPAnimator />

 {/* Sidebar - Hanya muncul jika user login */}
 {user && <Sidebar />}
 
 <div className={`flex-1 flex flex-col min-w-0 ${user ? 'lg:pl-64' : ''}`}>
 {/* Header tetap di atas */}
 <Header />
 
 <main className="flex-1 p-6 md:p-8">
 {children}
 </main>
 </div>
 </div>
 );
}
