import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Trash2, CheckCircle2, AlertCircle, 
  Clock, ArrowLeft, Megaphone, Star, Award, Loader2 
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'sonner';

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
      toast.error("Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Gagal menandai dibaca:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return;
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success("Semua notifikasi ditandai telah dibaca");
    } catch (error) {
      console.error("Gagal menandai semua dibaca:", error);
      toast.error("Gagal memperbarui notifikasi");
    }
  };

  const handleDeleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah pemicu mark as read saat klik tong sampah
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notifikasi dihapus");
    } catch (error) {
      console.error("Gagal menghapus notifikasi:", error);
      toast.error("Gagal menghapus notifikasi");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
      case 'grade':
        return <Award size={20} className="text-green-500" />;
      case 'warning':
      case 'reminder':
        return <AlertCircle size={20} className="text-orange-500" />;
      case 'announcement':
        return <Megaphone size={20} className="text-blue-500" />;
      default:
        return <Bell size={20} className="text-blue-500" />;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return timeStr;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="w-full min-h-screen flex flex-col gap-6 md:gap-8 pb-10 p-6 md:p-10 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
              Pusat Notifikasi 
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                  {unreadCount} Baru
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1">Pantau informasi pengumuman, pengingat, dan penilaian terbaru Anda</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="self-start sm:self-center px-5 py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* NOTIFICATIONS LIST */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-3 text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Memuat riwayat notifikasi...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center bg-gray-50/50 dark:bg-gray-900/10 rounded-[2.5rem] border border-dashed border-gray-100 dark:border-gray-800/80">
          <div className="p-6 bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-850 mb-4 text-blue-500">
            <Bell size={32} />
          </div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Belum ada notifikasi</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 max-w-xs leading-relaxed">
            Semua aktivitas kelas, penilaian tugas, dan pengumuman dari dosen akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkAsRead(n.id)}
              className={`p-5 rounded-[2rem] border transition-all flex items-start justify-between gap-5 relative group cursor-pointer ${
                n.is_read 
                  ? 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800/60 opacity-75' 
                  : 'bg-blue-50/20 dark:bg-blue-950/10 border-blue-100/40 dark:border-blue-900/20 shadow-sm'
              }`}
            >
              {/* Unread indicator dot */}
              {!n.is_read && (
                <span className="absolute top-1/2 left-3 -translate-y-1/2 h-2.5 w-2.5 bg-blue-600 rounded-full shadow-[0_0_10px_#2563eb]"></span>
              )}

              <div className={`flex items-start gap-4 min-w-0 ${!n.is_read ? 'pl-3' : ''}`}>
                <div className="p-3 bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0">
                  <h4 className={`text-xs font-black uppercase tracking-tight leading-tight ${n.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                    {n.title}
                  </h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                    <Clock size={10} />
                    <span>{formatTime(n.created_at)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => handleDeleteNotification(n.id, e)}
                className="p-3 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all opacity-0 group-hover:opacity-100 shrink-0"
                title="Hapus Notifikasi"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
