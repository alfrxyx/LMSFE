import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { AchievementOverlay } from '../Gamification/AchievementOverlay';
import { XPAnimator } from '../Gamification/XPAnimator';

interface LayoutProps {
 children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
 const { user } = useAuth();
 const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

 return (
 <div className="min-h-screen bg-[#F8F9FB] flex">
 {/* Achievement & XP Popups Global */}
 <AchievementOverlay />
 <XPAnimator />

 {/* Desktop Sidebar */}
 {user && <Sidebar />}

 {/* Mobile Sidebar (Drawer) */}
 {user && (
   <MobileSidebar 
     isOpen={isMobileSidebarOpen} 
     onClose={() => setIsMobileSidebarOpen(false)} 
   />
 )}
 
 <div className={`flex-1 flex flex-col min-w-0 ${user ? 'lg:pl-64' : ''}`}>
 {/* Header tetap di atas - Ditambah prop onMenuClick */}
 <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
 
 <main className="flex-1 p-4 md:p-8">
 {children}
 </main>
 </div>
 </div>
 );
}
