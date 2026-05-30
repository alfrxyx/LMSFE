import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, UserCircle, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nim: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(formData.nim.trim(), formData.password);
      if (success) {
        // Redirection logic based on role (Sync with App.tsx)
        // We get the latest user from the context if possible, but here we can check local storage if needed
        // or rely on the fact that AuthContext already updated the state.
        // The most reliable way is to check the user object that was just set.
        window.location.href = '/'; // Simple way to trigger IndexRedirect in App.tsx
      } else {
        setError('NIM atau Password salah. Silakan coba lagi.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dekorasi Background Halus */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-3xl -ml-20 -mb-20 opacity-50"></div>

      <div className="max-w-md w-full z-10">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tighter">GamifyLearn</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Selamat Datang <span className="text-blue-600">Kembali.</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Silakan masuk dengan NIM Mahasiswa untuk melanjutkan progres belajar Anda.
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
            {/* Input NIM */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">NIM Mahasiswa</label>
              <div className="relative group">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  name="nim"
                  type="text"
                  required
                  value={formData.nim}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm text-gray-900 font-semibold"
                  placeholder="Masukkan NIM Anda"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-700">Kata Sandi</label>
                <Link to="#" className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wider">Lupa Password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm text-gray-900 font-semibold"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button - Ukuran Diperkecil & Rounded XL */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-100 disabled:opacity-50 mt-2 active:scale-95"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500 font-medium">
              Belum memiliki akun?{' '}
              <Link to="/register" className="text-blue-600 font-extrabold hover:text-blue-700 transition-colors">
                Daftar Gratis
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