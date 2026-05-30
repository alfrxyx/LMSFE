import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Award, Lock, Loader2, Trophy, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Achievements() {
 const { token, user } = useAuth();
 const [allAchievements, setAllAchievements] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchAchievements = async () => {
 try {
 setLoading(true);
 // Pastikan URL ini sesuai dengan backend kamu
 const response = await api.get('/achievements');
 setAllAchievements(response.data.data); // Mengambil data lencana
 } catch (error) {
 console.error("Gagal memuat achievements:", error);
 } finally {
 setLoading(false);
 }
 };

 if (token) fetchAchievements();
 }, [token]);

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
 <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
 <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Memuat Lencana PJKR...</p>
 </div>
 );
 }

 return (
 <div className="space-y-8 p-4 md:p-8 bg-white rounded-xl border border-1">
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
 <div>
 <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
 Lencana Saya <Trophy className="h-10 w-10 text-purple-600" />
 </h1>
 <p className="mt-2 text-gray-500 font-medium italic">Selesaikan tantangan praktik PJKR untuk membuka lencana eksklusif.</p>
 </div>
 <div className="bg-purple-50 px-6 py-3 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-3">
 <Award className="h-6 w-6 text-purple-600" />
 <span className="text-xs font-black text-purple-700 uppercase tracking-widest">{user?.achievements?.length || 0} TERKUMPUL</span>
 </div>
 </div>

 {/* Grid Lencana yang harusnya muncul */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {allAchievements.length > 0 ? (
 allAchievements.map((achievement) => {
 const isEarned = user?.achievements?.some((a: any) => a.id === achievement.id);
 return (
 <div key={achievement.id} className={`p-6 rounded-3xl border-2 text-center ${isEarned ? 'bg-white border-purple-100' : 'bg-gray-50 opacity-60 grayscale'}`}>
 <div className="h-20 w-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
 {isEarned ? <Award className="h-10 w-10 text-purple-600" /> : <Lock className="h-10 w-10 text-gray-400" />}
 </div>
 <h3 className="font-bold">{achievement.name}</h3>
 <p className="text-xs text-gray-500 mt-2">{achievement.description}</p>
 </div>
 );
 })
 ) : (
 <div className="col-span-full text-center py-10 text-gray-400">
 Belum ada data lencana di database. Pastikan sudah menjalankan seeder.
 </div>
 )}
 </div>
 </div>
 );
}