import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Play, Trophy, Award, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RecentActivity() {
 const { user } = useAuth();

 /**
 * MENGUBAH DATA DUMMY MENJADI DINAMIS
 * Kita mengambil data asli dari 'progress' dan 'achievements' yang dikirim oleh AuthController.
 */
 const activities = user?.progress?.map((item: any) => {
 return {
 id: `progress-${item.id}`,
 title: `Menyelesaikan Materi Praktik`,
 time: new Date(item.updated_at).toLocaleDateString('id-ID', {
 day: 'numeric',
 month: 'short',
 year: 'numeric'
 }),
 points: 0, 
 icon: CheckCircle,
 color: 'text-green-600',
 bg: 'bg-green-50',
 isPending: !item.is_completed
 };
 }) || [];

 // Tambahkan Pencapaian Lencana jika ada
 const achievementActivities = user?.achievements?.map((ach: any) => ({
 id: `ach-${ach.id}`,
 title: `Mendapatkan Lencana: ${ach.name}`,
 time: ach.pivot?.earned_at ? new Date(ach.pivot.earned_at).toLocaleDateString('id-ID', {
 day: 'numeric',
 month: 'short',
 year: 'numeric'
 }) : 'Baru saja',
 points: 0,
 icon: Award,
 color: 'text-purple-600',
 bg: 'bg-purple-50',
 isPending: false
 })) || [];

 // Gabungkan dan urutkan aktivitas terbaru berdasarkan urutan array (karena backend belum sort descending untuk progress dalam relasi, kita gunakan array reverse)
 const combinedActivities = [...activities.reverse(), ...achievementActivities.reverse()].slice(0, 5);

 return (
 <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 transition-colors">
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Recent Activity</h3>
 <Link 
 to="/profile" 
 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:text-blue-700 dark:hover:text-blue-300"
 >
 Lihat Semua
 </Link>
 </div>
 
 <div className="space-y-4">
 {combinedActivities.length > 0 ? (
 combinedActivities.map((activity: any) => (
 <div 
 key={activity.id} 
 className="flex items-center space-x-5 p-4 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:scale-[1.02] rounded-2xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
 >
 <div className={`${activity.bg} dark:bg-opacity-20 p-3 rounded-xl shadow-sm`}>
 <activity.icon className={`h-5 w-5 ${activity.color}`} />
 </div>
 <div className="flex-1">
 <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{activity.title}</p>
 <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mt-1">{activity.time}</p>
 </div>
 <div className="text-right">
 {activity.isPending ? (
 <span className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg uppercase tracking-wider">
 Pending
 </span>
 ) : activity.points > 0 ? (
 <span className="text-sm font-black text-green-600 dark:text-green-400">
 +{activity.points} XP
 </span>
 ) : null}
 </div>
 </div>
 ))
 ) : (
 <div className="py-12 text-center bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
 <Trophy className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
 <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Belum Ada Riwayat Aktivitas</p>
 <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">Selesaikan tugas praktik untuk mendapatkan poin!</p>
 </div>
 )}
 </div>
 
 <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800">
 <Link 
 to="/profile" 
 className="flex items-center justify-center space-x-2 w-full py-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
 >
 <span>View all activity</span>
 <ArrowRight className="h-3 w-3" />
 </Link>
 </div>
 </div>
 );
}