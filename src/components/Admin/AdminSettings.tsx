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

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 uppercase flex items-center gap-3">
          Pengaturan Platform <SettingsIcon size={24} className="text-blue-600" />
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <section.icon size={18} />
                <span>{section.name}</span>
              </div>
              {activeSection === section.id && <ChevronRight size={16} />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 uppercase">General Settings</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Platform Name</label>
                    <input type="text" defaultValue="GamifyLearn" disabled className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-400 font-bold italic cursor-not-allowed" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'content' && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 uppercase">Dashboard Content</h3>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Teks Banner Utama (Hero Banner)</label>
                  <textarea
                    rows={4}
                    value={settings.dashboard_banner_text}
                    onChange={(e) => setSettings({ ...settings, dashboard_banner_text: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
