import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../api/axios';

// Interface User disesuaikan dengan skema database PJKR baru
export interface User {
  id: number;
  nim: string;      // Menggantikan email sebagai pengenal utama
  name: string;
  email: string;
  semester: string; // Tambahan data akademik
  phone: string;    // Tambahan data kontak
  bio?: string;     // Slogan/Bio singkat
  role: 'admin' | 'dosen' | 'student';
  points: number; 
  level: number;  
  current_streak: number;
  last_activity_date: string | null;
  avatar?: string;
  classroom_id?: number; // Hubungan kelas skenario 2
  classroom?: {
    id: number;
    name: string;
    code: string;
    semester: number;
  };
  assignments?: any[];
  achievements?: any[];
  completedVideos?: string[];
  completedTasks?: string[];
  completedLevels?: string[];
  badges?: any[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (nim: string, password: string) => Promise<boolean>; // Menggunakan nim
  register: (nim: string, name: string, classroomCode: string, phone: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => 
    sessionStorage.getItem('gamifylearn_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    if (token) {
      try {
        const response = await api.get('/user/profile');
        setUser(response.data.data);
      } catch (error: any) {
        console.error('Sesi berakhir atau token tidak valid:', error);
        // Hanya logout jika token benar-benar tidak valid (401)
        if (error.response?.status === 401) {
          handleLocalLogout();
        }
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Hanya jalankan checkAuth jika ada token tapi data user kosong (misal saat refresh halaman)
    if (token && !user) {
      checkAuth();
    } else if (!token) {
      setIsLoading(false);
    }
  }, [token, user]);

  const handleLocalLogout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('gamifylearn_token');
  };

  // Login sekarang menggunakan NIM
  const login = async (nim: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/login', { nim, password });
      const { token: apiToken, user: apiUser } = response.data;

      sessionStorage.setItem('gamifylearn_token', apiToken);
      setToken(apiToken);
      setUser(apiUser);
      
      return true;
    } catch (error) {
      console.error('Login gagal:', error);
      return false;
    }
  };

  // Register mendukung kolom NIM, Kode Kelas, dan No HP
  const register = async (nim: string, name: string, classroomCode: string, phone: string, email: string, password: string): Promise<boolean> => {
    try {
      await api.post('/register', { 
        nim, 
        name, 
        classroom_code: classroomCode, 
        phone, 
        email, 
        password,
        password_confirmation: password 
      });
      return true;
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      let message = '';
      if (errors) {
        // Gabungkan seluruh pesan error spesifik jika ada
        message = Object.values(errors).flat().join(' ');
      } else {
        message = error.response?.data?.message || 'Registrasi gagal';
      }
      // Bersihkan teks " (and X more error/s)" bawaan Laravel
      message = message.replace(/\s*\(and \d+ more error(s)?\)/g, '');
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('API Logout error:', error);
    } finally {
      handleLocalLogout();
    }
  };

  // --- FITUR AUTO LOGOUT (INACTIVITY TIMER) ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // Set timer ke 10 menit (10 * 60 * 1000 ms)
      timeoutId = setTimeout(() => {
        if (user) {
          console.warn('Sesi berakhir karena tidak ada aktivitas selama 10 menit.');
          logout();
        }
      }, 600000); 
    };

    // Daftar event yang dianggap sebagai aktivitas
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    if (user) {
      resetTimer(); // Mulai timer saat user login
      events.forEach(event => {
        window.addEventListener(event, resetTimer);
      });
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);
  // --------------------------------------------

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        isLoading, 
        login, 
        register, 
        logout, 
        updateUser,
        checkAuth
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}