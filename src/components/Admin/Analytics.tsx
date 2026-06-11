import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { TrendingUp, Users, BookOpen, Trophy, Calendar, Download, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Struktur data yang diharapkan dari backend
interface AnalyticsData {
 topStats: {
 totalUsers: number;
 activeUsers: number;
 courseCompletions: number;
 videoViews: number;
 };
 userGrowth: { date: string; count: number; }[];
 courseCompletionsChart: { date: string; completed: number; }[];
 detailedMetrics: Record<string, number | string>;
}

// Komponen Skeleton Loading
function AnalyticsSkeleton() {
 return (
 <div className="p-6 space-y-8">
 <div className="grid grid-cols-4 gap-6">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="bg-white p-6 rounded-xl shadow-lg animate-pulse h-32">
 <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
 <div className="h-8 bg-gray-300 rounded w-2/3"></div>
 </div>
 ))}
 </div>
 <div className="grid grid-cols-2 gap-6">
 <div className="h-96 bg-white rounded-xl shadow-lg animate-pulse"></div>
 <div className="h-96 bg-white rounded-xl shadow-lg animate-pulse"></div>
 </div>
 </div>
 );
}

export function Analytics() {
 const { user, isLoading: authLoading, token } = useAuth();
 const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
 
 // State untuk data live
 const [liveAnalyticsData, setLiveAnalyticsData] = useState<AnalyticsData | null>(null);
 const [dataLoading, setDataLoading] = useState(true);
 const [fetchError, setFetchError] = useState<string | null>(null);

 // --- LOGIC FETCHING DATA ---
 useEffect(() => {
 if (!token) { setDataLoading(false); return; }

 const fetchAnalytics = async () => {
 setDataLoading(true);
 try {
 const response = await api.get('/admin/analytics');

 setLiveAnalyticsData(response.data.data);
 setFetchError(null);
 } catch (err: any) {
 if (err.response && err.response.status === 403) {
 setFetchError("Akses Ditolak. Anda bukan Administrator.");
 } else {
 setFetchError("Gagal memuat data analitik.");
 }
 } finally {
 setDataLoading(false);
 }
 };

 if (!authLoading && user?.role === 'admin') {
 fetchAnalytics();
 } else if (!authLoading && user?.role !== 'admin') {
 // Jika user bukan admin, kita biarkan saja, AdminRoute akan me-redirect
 setDataLoading(false); 
 }

 }, [token, authLoading, user?.role]);


 // --- RENDER GUARDS ---
 if (authLoading || dataLoading) {
 return <AnalyticsSkeleton />;
 }
 
 if (user?.role !== 'admin') {
 return (
 <div className="text-center py-12 text-red-600">
 <h2 className="text-2xl font-bold text-gray-900">Akses Ditolak</h2>
 <p className="text-gray-600 mt-2">Anda tidak memiliki izin Admin untuk melihat halaman ini.</p>
 </div>
 );
 }

 if (fetchError || !liveAnalyticsData) {
 return <div className="p-8 text-center text-red-600 border border-red-200 bg-red-50 rounded-lg m-8">Error: {fetchError || 'Data tidak ditemukan.'}</div>;
 }
 
 // --- AMBIL DATA LIVE ---
 const stats = liveAnalyticsData.topStats;
 const chartData = liveAnalyticsData.userGrowth; // Menggunakan data live
 const completionsChart = liveAnalyticsData.courseCompletionsChart; // Menggunakan data live
 const metrics = liveAnalyticsData.detailedMetrics; // Menggunakan data live

 return (
   <div className="w-full flex flex-col gap-10 p-6 md:p-10 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-screen transition-colors duration-300">
 {/* Header dan Filter */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gray-50/50 dark:bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-100/50 dark:border-gray-800 shrink-0">
 <div>
 <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
 <p className="mt-2 text-gray-600 dark:text-gray-400">
 Track platform performance and user engagement metrics
 </p>
 </div>
 <div className="mt-4 sm:mt-0 flex items-center space-x-3">
 <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
 {['7d', '30d', '90d', '1y'].map((range) => (
 <button
 key={range}
 onClick={() => setTimeRange(range as typeof timeRange)}
 className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
 timeRange === range
 ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
 : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
 }`}
 >
 {range}
 </button>
 ))}
 </div>
 <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
 <Download className="h-4 w-4" />
 <span>Export</span>
 </button>
 </div>
 </div>

 {/* Key Metrics - MENGGUNAKAN LIVE DATA */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 
 {/* 1. Total Users */}
 <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
 <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalUsers.toLocaleString()}</p>
 </div>
 <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full"><Users className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
 </div>
 <div className="mt-4">
 <div className="flex items-center text-sm text-green-600 dark:text-green-400">
 <TrendingUp className="h-4 w-4 mr-1" />
 <span>+{stats.totalUsers - (stats.totalUsers * 0.875)} this week (Mock growth)</span>
 </div>
 </div>
 </div>

 {/* 2. Active Users */}
 <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
 <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeUsers.toLocaleString()}</p>
 </div>
 <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-full"><TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" /></div>
 </div>
 <div className="mt-4">
 <div className="flex items-center text-sm text-green-600 dark:text-green-400">
 <span>{Math.round((stats.activeUsers / stats.totalUsers) * 100)}% engagement rate (Live calc)</span>
 </div>
 </div>
 </div>

 {/* 3. Course Completions */}
 <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Course Completions</p>
 <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.courseCompletions.toLocaleString()}</p>
 </div>
 <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-full"><BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" /></div>
 </div>
 <div className="mt-4">
 <div className="flex items-center text-sm text-purple-600 dark:text-purple-400">
 <Trophy className="h-4 w-4 mr-1" />
 <span>{stats.courseCompletions * 0.9}% retention rate (Mock)</span>
 </div>
 </div>
 </div>

 {/* 4. Video Views */}
 <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Video Views</p>
 <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.videoViews.toLocaleString()}</p>
 </div>
 <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-full"><Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" /></div>
 </div>
 <div className="mt-4">
 <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
 <span>Avg. 24 min per session</span>
 </div>
 </div>
 </div>
 </div>

 {/* Charts */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* User Growth Chart */}
 <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth</h3>
 <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
 <Filter className="h-4 w-4" />
 </button>
 </div>
 
 <div className="h-64 flex items-end justify-between space-x-2">
 {chartData.map((data, index) => (
 <div key={index} className="flex flex-col items-center space-y-2 flex-1">
 <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-t-lg relative" style={{ height: '200px' }}>
 <div 
 className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg absolute bottom-0 w-full transition-all"
 style={{ height: `${(data.count / 150) * 200}px` }}
 ></div>
 </div>
 <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{data.count}</span>
 <span className="text-xs text-gray-400 dark:text-gray-500">
 {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Course Completions Chart */}
 <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Course Completions</h3>
 <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
 <Filter className="h-4 w-4" />
 </button>
 </div>
 
 <div className="h-64 flex items-end justify-between space-x-2">
 {completionsChart.map((data, index) => (
 <div key={index} className="flex flex-col items-center space-y-2 flex-1">
 <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-t-lg relative" style={{ height: '200px' }}>
 <div 
 className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg absolute bottom-0 w-full transition-all"
 style={{ height: `${(data.completed / 50) * 200}px` }}
 ></div>
 </div>
 <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{data.completed}</span>
 <span className="text-xs text-gray-400 dark:text-gray-500">
 {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Detailed Performance Metrics */}
 <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Detailed Performance Metrics</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="space-y-4">
 <h4 className="font-medium text-gray-900 dark:text-white">User Engagement</h4>
 <div className="space-y-3">
 <div className="flex justify-between items-center">
 <span className="text-sm text-gray-600 dark:text-gray-400">Daily Active Users</span>
 <span className="font-medium dark:text-white">{metrics?.dailyActiveUsers ?? 'N/A'}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Active Users</span>
 <span className="font-medium dark:text-white">89 (Mock)</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Active Users</span>
 <span className="font-medium dark:text-white">134 (Mock)</span>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <h4 className="font-medium text-gray-900 dark:text-white">Learning Progress</h4>
 <div className="space-y-3">
 <div className="flex justify-between items-center">
 <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Completion Rate</span>
 <span className="font-medium dark:text-white">72% (Mock)</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Quiz Score</span>
 <span className="font-medium dark:text-white">{metrics?.avgQuizScore ?? 'N/A'}%</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-sm text-gray-600 dark:text-gray-400">Time to Complete</span>
 <span className="font-medium dark:text-white">5.2 days (Mock)</span>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <h4 className="font-medium text-gray-900 dark:text-white">Platform Health</h4>
 <div className="space-y-3">
 <div className="flex justify-between items-center">
 <span className="text-sm text-gray-600 dark:text-gray-400">System Uptime</span>
 <span className="font-medium text-green-600 dark:text-green-400">{metrics?.systemUptime ?? 'N/A'}%</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Load Time</span>
 <span className="font-medium dark:text-white">{metrics?.avgLoadTime ?? 'N/A'}s</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
 <span className="font-medium text-green-600 dark:text-green-400">{metrics?.errorRate ?? 'N/A'}%</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}