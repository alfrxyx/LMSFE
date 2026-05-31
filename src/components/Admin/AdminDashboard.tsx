import  { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, BookOpen, Trophy, TrendingUp, Eye, UserCheck,  Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext'; // Untuk data courses/leaderboard mock

// Definisikan tipe untuk data yang datang dari /admin/stats
interface AdminStats {
  total_students: number;
  active_courses: number;
  completions: number;
  quiz_attempts: number;
}

// Komponen Skeleton (untuk tampilan loading yang rapi)
function StatsCardSkeleton() {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-300 rounded w-2/3"></div>
            <div className="h-3 bg-gray-100 rounded w-1/4 mt-2"></div>
        </div>
    );
}

export function AdminDashboard() {
    const { user, isLoading: authLoading, token } = useAuth();
    const { courses, leaderboard } = useApp(); // Data mock dari AppContext
    
    const [liveStats, setLiveStats] = useState<AdminStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- LOGIC FETCHING LIVE STATS ---
    useEffect(() => {
        if (!token || !user || user.role !== 'admin') {
            setStatsLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');

                setLiveStats(response.data); 
                setError(null);

            } catch (err: any) { 
                if (err.response && err.response.status === 403) {
                    setError("Akses Ditolak. Anda bukan Administrator.");
                } else {
                    setError("Gagal memuat data statistik.");
                }
            } finally {
                setStatsLoading(false);
            }
        };

        if (!authLoading && token) {
            fetchStats();
        }
    }, [token, authLoading, user?.role]);


    // --- GUARD UTAMA & LOADING STATE ---
    if (authLoading || statsLoading) {
        return (
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array(4).fill(0).map((_, i) => <StatsCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }
    
    if (error) {
         return <div className="p-8 text-center text-red-600 border border-red-200 bg-red-50 rounded-lg">Error: {error}</div>;
    }

    // Menggunakan data liveStats atau default (0)
    const stats = liveStats || {
        total_students: 0,
        active_courses: courses.length, // Menggunakan mock data untuk courses
        completions: 0,
        quiz_attempts: 0
    };
    
    // Data dummy yang digunakan di JSX asli Anda (hanya untuk tampilan visual yang tidak terkait API stats)
    const mockData = {
        newStudentsThisWeek: 12,
        totalVideoViews: 1247,
        avgProgress: 67,
        avgQuizScore: 78
    };

    return (
        <div className="space-y-8 p-6 md:p-10 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-2 text-gray-600">
                        Overview of platform performance and student progress
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                            Admin Panel
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid - MENGGUNAKAN JSX ASLI ANDA + DATA LIVE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Total Students (Live Data) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Students</p>
                            {/* LIVE DATA: total_students */}
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_students.toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center text-sm text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {/* MOCK DATA: newStudentsThisWeek */}
                            <span>+{mockData.newStudentsThisWeek} this week</span> 
                        </div>
                    </div>
                </div>

                {/* 2. Active Courses (Live Data) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Courses</p>
                            {/* LIVE DATA: active_courses */}
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active_courses}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-full">
                            <BookOpen className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center text-sm text-blue-600">
                            <Eye className="h-4 w-4 mr-1" />
                            {/* MOCK DATA: totalVideoViews */}
                            <span>{mockData.totalVideoViews} total views</span>
                        </div>
                    </div>
                </div>

                {/* 3. Completions (Live Data) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completions</p>
                            {/* LIVE DATA: completions */}
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completions}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-full">
                            <Trophy className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center text-sm text-purple-600">
                            <UserCheck className="h-4 w-4 mr-1" />
                            {/* MOCK DATA: avgProgress */}
                            <span>{mockData.avgProgress}% avg progress</span>
                        </div>
                    </div>
                </div>

                {/* 4. Quiz Attempts (Live Data) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Quiz Attempts</p>
                            {/* LIVE DATA: quiz_attempts */}
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.quiz_attempts}</p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-full">
                            <Award className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center text-sm text-amber-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {/* MOCK DATA: avgQuizScore */}
                            <span>{mockData.avgQuizScore}% avg score</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity dan Top Performers (Menggunakan Data Mock dari AppContext) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Student Activity</h3>
                    {/* Placeholder content - Anda perlu mengganti ini dengan API baru */}
                    <div className="space-y-4">
                         {/* Menggunakan data mock AppContext */}
                        {courses.length > 0 && <p className='text-gray-500'>Courses loaded: {courses.length} (Mock Data)</p>}
                        {leaderboard.slice(0, 4).map(student => (
                             <div key={student.id} className="text-sm border-b pb-2">
                                <strong>{student.name}</strong> started a course.
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performers</h3>
                    {/* Menggunakan data mock leaderboard */}
                    <div className="space-y-3">
                        {leaderboard.slice(0, 5).map((student, index) => (
                            <div key={student.id} className="flex justify-between text-sm">
                                <span>{index + 1}. {student.name}</span>
                                <span>{student.points.toLocaleString()} pts</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Course Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Performance (Mock)</h3>
                {courses.length === 0 ? <p>No courses available (Mock).</p> : <p>{courses.length} courses loaded.</p>}
            </div>
        </div>
    );
}