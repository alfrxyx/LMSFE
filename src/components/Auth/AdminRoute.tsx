import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function AdminRoute() {
    const { user, isLoading } = useAuth();
    
    // 1. Tampilkan loading state saat context sedang memuat user
    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading administrator access...</div>; 
    }

    // 2. Jika user ada DAN role-nya adalah 'admin', izinkan masuk
    if (user && user.role === 'admin') {
        // Outlet merender komponen anak (child routes)
        return <Outlet />;
    }

    // 3. Jika bukan admin (atau token tidak valid), arahkan user ke dashboard
    // Jika user benar-benar logout (null), arahkan ke /login
    return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}