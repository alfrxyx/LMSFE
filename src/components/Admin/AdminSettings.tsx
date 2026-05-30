import React, { useState, useEffect } from 'react';
import { 
  Save, Globe, Layout, Loader2,
  Settings as SettingsIcon, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { toast } from 'sonner';

export function AdminSettings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    dashboard_banner_text: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/settings');
      if (res.data.status === 'success') {
        setSettings(res.data.data);
      }
    } catch (error) {
      toast.error('Gagal memuat pengaturan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await api.post('/admin/settings', { settings });
      if (res.data.status === 'success') {
        toast.success('Pengaturan berhasil disimpan!');
      }
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'dosen') {
    return <div className="p-8 text-center text-red-600 font-bold uppercase">Akses Ditolak</div>;
  }

  const sections = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'content', name: 'Dashboard Content', icon: Layout },
  ];

  return (
    <div className="w-full min-h-[80vh] space-y-8 p-4 md:p-8 bg-white rounded-xl border border-gray-100 flex flex-col">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
          Platform Settings <SettingsIcon className="h-10 w-10 text-blue-600" />
        </h1>
        <p className="mt-2 text-gray-500 font-medium italic">
          Konfigurasi preferensi platform dan konten dashboard PJKR UM.
        </p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Memuat Pengaturan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full flex-1">
          {/* SIDEBAR NAVIGATION WITHIN PAGE */}
          <div className="lg:col-span-1 space-y-3 w-full">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Menu Pengaturan</p>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  activeSection === section.id
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <section.icon className="h-4 w-4" />
                  <span>{section.name}</span>
                </div>
                {activeSection === section.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500 flex flex-col">
            <div className="p-8 md:p-12 w-full flex-1">
              {activeSection === 'general' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">General Settings</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Informasi dasar aplikasi</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Platform Name</label>
                      <input 
                        type="text" 
                        defaultValue="GamifyLearn" 
                        disabled 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-400 font-black italic cursor-not-allowed outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">System Version</label>
                      <input 
                        type="text" 
                        defaultValue="v1.0.4-PJKR" 
                        disabled 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-400 font-black italic cursor-not-allowed outline-none" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'content' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                      <Layout size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Dashboard Content</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Kustomisasi tampilan utama mahasiswa</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Teks Banner Utama (Hero Banner)</label>
                    <textarea
                      rows={5}
                      placeholder="Contoh: Semangat belajarnya hari ini! \n Selesaikan kursusmu sekarang."
                      value={settings.dashboard_banner_text}
                      onChange={(e) => setSettings({ ...settings, dashboard_banner_text: e.target.value })}
                      className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none shadow-inner"
                    />
                    <p className="text-[10px] text-gray-400 italic font-medium ml-1">Gunakan '\n' untuk membuat baris baru pada teks banner.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-3 px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
