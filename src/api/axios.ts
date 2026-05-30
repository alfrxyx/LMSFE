import axios from 'axios';

// Gunakan alamat IP 127.0.0.1 agar lebih konsisten di lingkungan lokal
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor untuk menyuntikkan token secara otomatis jika ada
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('gamifylearn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani error secara terpusat (Global Error Handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Sesi berakhir, hapus token dan arahkan ke login jika perlu
      sessionStorage.removeItem('gamifylearn_token');
      // window.location.href = '/login'; // Bisa diaktifkan jika ingin force redirect
    }
    return Promise.reject(error);
  }
);

export { axios };
export default api;
