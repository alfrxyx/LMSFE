import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { BookOpen, Mail, Lock, User, UserPlus, Hash, Phone, GraduationCap, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    nim: '',
    name: '',
    classroomCode: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [classInfo, setClassInfo] = useState<any | null>(null);
  const [classLoading, setClassLoading] = useState(false);
  const [classError, setClassError] = useState('');

  useEffect(() => {
    const code = formData.classroomCode.trim();
    if (!code) {
      setClassInfo(null);
      setClassError('');
      return;
    }

    // Debounce verifikasi kode kelas selama 500ms
    const timer = setTimeout(async () => {
      setClassLoading(true);
      setClassError('');
      setClassInfo(null);
      try {
        const response = await api.get(`/classrooms/verify/${code}`);
        if (response.data.status === 'success') {
          setClassInfo(response.data.classroom);
        }
      } catch (err: any) {
        setClassError(err.response?.data?.message || 'Kode kelas tidak valid.');
      } finally {
        setClassLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.classroomCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) { 
      setError('Password minimal harus 8 karakter');
      setIsLoading(false);
      return;
    }

    try {
      await register(
        formData.nim,
        formData.name,
        formData.classroomCode,
        formData.phone,
        formData.email,
        formData.password
      );
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat pendaftaran.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dekorasi Background Halus */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-3xl -ml-20 -mb-20 opacity-50"></div>

      <div className="max-w-2xl w-full z-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tighter">GamifyLearn</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Buat Akun <span className="text-blue-600">Baru.</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Lengkapi data diri akademik Anda untuk bergabung dalam platform belajar PJKR.
          </p>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Row 1: NIM & Nama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">NIM Mahasiswa</label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="nim"
                    type="text"
                    required
                    value={formData.nim}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm text-gray-900 font-semibold"
                    placeholder="210611..."
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm text-gray-900 font-semibold"
                    placeholder="Nama Lengkap"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Kode Kelas & No HP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">Kode Kelas (Opsional)</label>
                <div className="relative group">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="classroomCode"
                    type="text"
                    value={formData.classroomCode}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm text-gray-900 font-semibold uppercase"
                    placeholder="PJKR-XXXX"
                  />
                </div>

                {/* Real-time Preview Card / Loading / Error */}
                {classLoading && (
                  <div className="flex items-center gap-2 mt-2 ml-1 text-xs text-gray-400 font-bold">
                    <div className="h-3.5 w-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Memverifikasi kode kelas...
                  </div>
                )}
                {classError && (
                  <div className="flex items-center gap-1.5 mt-2 ml-1 text-xs text-red-500 font-bold animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{classError}</span>
                  </div>
                )}
                {classInfo && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-sm animate-in slide-in-from-top-2 duration-300">
                    <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                      ✓ Kelas Terdeteksi
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-tight">{classInfo.course_title}</p>
                      <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-500 dark:text-gray-400">
                        <span>Kelas {classInfo.name}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>Semester {classInfo.semester}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">Nomor WhatsApp</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="phone"
                    type="text"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm text-gray-900 font-semibold"
                    placeholder="08..."
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Email Aktif</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm text-gray-900 font-semibold"
                  placeholder="alfa@mahasiswa.um.ac.id"
                />
              </div>
            </div>

            {/* Row 4: Password & Konfirmasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-11 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm text-gray-900 font-semibold"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">Konfirmasi</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-11 pr-11 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm text-gray-900 font-semibold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-100 disabled:opacity-50 mt-4 active:scale-95"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Buat Akun Sekarang</span>
                  <UserPlus className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500 font-medium">
              Sudah memiliki akun?{' '}
              <Link to="/login" className="text-blue-600 font-extrabold hover:text-blue-700 transition-colors">
                Masuk ke Akun
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Brand Watermark */}
      <div className="absolute bottom-8 right-8 hidden md:block opacity-20">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
          <span className="font-black text-lg tracking-tighter text-gray-900">GL.</span>
        </div>
      </div>
    </div>
  );
}