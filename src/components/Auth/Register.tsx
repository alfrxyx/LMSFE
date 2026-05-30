import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { BookOpen, Mail, Lock, User, UserPlus, Hash, Phone, GraduationCap, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    nim: '',
    name: '',
    semester: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        formData.semester,
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

            {/* Row 2: Semester & No HP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">Semester</label>
                <div className="relative group">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <select
                    name="semester"
                    required
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm text-gray-900 font-semibold appearance-none"
                  >
                    <option value="">Pilih Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
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