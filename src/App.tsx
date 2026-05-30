import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout/Layout';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

// Lazy Load Components
const Login = lazy(() => import('./components/Auth/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./components/Auth/Register').then(module => ({ default: module.Register })));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const CourseList = lazy(() => import('./components/Courses/CourseList').then(module => ({ default: module.CourseList })));
const CourseDetail = lazy(() => import('./components/Courses/CourseDetail').then(module => ({ default: module.CourseDetail })));
const Leaderboard = lazy(() => import('./components/Leaderboard/Leaderboard').then(module => ({ default: module.Leaderboard })));
const Achievements = lazy(() => import('./components/Dashboard/Achievements').then(module => ({ default: module.Achievements })));
const Profile = lazy(() => import('./components/Dashboard/Profile').then(module => ({ default: module.Profile })));

// Admin Lazy Load
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const StudentManagement = lazy(() => import('./components/Admin/StudentManagement').then(module => ({ default: module.StudentManagement })));
const ContentManagement = lazy(() => import('./components/Admin/ContentManagement').then(module => ({ default: module.ContentManagement })));
const Analytics = lazy(() => import('./components/Admin/Analytics').then(module => ({ default: module.Analytics })));
const AdminSettings = lazy(() => import('./components/Admin/AdminSettings').then(module => ({ default: module.AdminSettings })));
const StudentBySemester = lazy(() => import('./components/Admin/StudentBySemester').then(module => ({ default: module.StudentBySemester })));

// Teacher Lazy Load
const TeacherDashboard = lazy(() => import('./components/Teacher/TeacherDashboard').then(module => ({ default: module.TeacherDashboard })));

// =======================================================
// HELPER: Custom Route Components
// =======================================================

function LoadingScreen() {
 return (
 <div className="flex flex-col items-center justify-center h-screen bg-white space-y-4">
 <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
 <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Menyiapkan Sistem PJKR...</p>
 </div>
 );
}

// Suspense Wrapper
function SuspenseLayout({ children }: { children: React.ReactNode }) {
 return (
 <Suspense fallback={<LoadingScreen />}>
 {children}
 </Suspense>
 );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
 const { user, isLoading } = useAuth();
 if (isLoading) return <LoadingScreen />;
 return user ? <SuspenseLayout>{children}</SuspenseLayout> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
 const { user, isLoading } = useAuth();
 if (isLoading) return <LoadingScreen />;
 if (!user || user.role !== 'admin') {
 return <Navigate to="/dashboard" replace />;
 }
 return <SuspenseLayout>{children}</SuspenseLayout>;
}

function TeacherRoute({ children }: { children: React.ReactNode }) {
 const { user, isLoading } = useAuth();
 if (isLoading) return <LoadingScreen />;
 if (!user || (user.role !== 'dosen' && user.role !== 'admin')) {
 return <Navigate to="/dashboard" replace />;
 }
 return <SuspenseLayout>{children}</SuspenseLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
 const { user, isLoading } = useAuth();
 if (isLoading) return <LoadingScreen />;
 if (!user) return <SuspenseLayout>{children}</SuspenseLayout>;
 
 if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
 if (user.role === 'dosen') return <Navigate to="/teacher/dashboard" />;
 return <Navigate to="/dashboard" />;
}

function IndexRedirect() {
 const { user, isLoading } = useAuth();
 if (isLoading) return <LoadingScreen />;
 if (!user) return <Navigate to="/login" />;
 
 if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
 if (user.role === 'dosen') return <Navigate to="/teacher/dashboard" />;
 return <Navigate to="/dashboard" />;
}

// =======================================================
// MAIN ROUTER DEFINITION
// =======================================================

const router = createBrowserRouter([
 {
 path: "/login",
 element: <PublicRoute><Login /></PublicRoute>,
 },
 {
 path: "/register",
 element: <PublicRoute><Register /></PublicRoute>,
 },
 {
 path: "/",
 element: <IndexRedirect />,
 },
 {
 path: "/dashboard",
 element: <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>,
 },
 {
 path: "/courses",
 element: <ProtectedRoute><Layout><CourseList /></Layout></ProtectedRoute>,
 },
 {
 path: "/courses/:id",
 element: <ProtectedRoute><Layout><CourseDetail /></Layout></ProtectedRoute>,
 },
 {
 path: "/leaderboard",
 element: <ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>,
 },
 {
 path: "/achievements",
 element: <ProtectedRoute><Layout><Achievements /></Layout></ProtectedRoute>,
 },
 {
 path: "/profile",
 element: <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>,
 },
 {
 path: "/teacher/dashboard",
 element: <TeacherRoute><Layout><TeacherDashboard tab="overview" /></Layout></TeacherRoute>,
 },
 {
 path: "/teacher/grading",
 element: <TeacherRoute><Layout><TeacherDashboard tab="submissions" /></Layout></TeacherRoute>,
 },
 {
 path: "/teacher/discipline",
 element: <TeacherRoute><Layout><TeacherDashboard tab="discipline" /></Layout></TeacherRoute>,
 },
 {
 path: "/admin/content",
 element: <TeacherRoute><Layout><ContentManagement /></Layout></TeacherRoute>,
 },
 {
 path: "/admin",
 element: <Navigate to="/admin/dashboard" />,
 },
 {
 path: "/admin/dashboard",
 element: <AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>,
 },
 {
 path: "/admin/analytics",
 element: <AdminRoute><Layout><Analytics /></Layout></AdminRoute>,
 },
 {
 path: "/admin/students",
 element: <AdminRoute><Layout><StudentManagement /></Layout></AdminRoute>,
 },
 {
 path: "/admin/students-by-semester",
 element: <TeacherRoute><Layout><StudentBySemester /></Layout></TeacherRoute>,
 },
 {
 path: "/admin/settings",
 element: <TeacherRoute><Layout><AdminSettings /></Layout></TeacherRoute>,
 },
 {
 path: "*",
 element: <Layout><div className="text-center py-20 text-red-500 font-black uppercase tracking-widest text-sm">404: Halaman Tidak Ditemukan</div></Layout>,
 }
], {
 future: {
 v7_fetcherPersist: true,
 v7_normalizeFormMethod: true,
 v7_partialHydration: true,
 v7_relativeSplatPath: true,
 v7_skipActionErrorRevalidation: true,
 v7_startTransition: true,
 },
});

// =======================================================
// APP ROOT
// =======================================================

function App() {
 return (
 <AuthProvider>
 <AppProvider>
 <Toaster position="top-center" richColors />
 <RouterProvider 
 router={router} 
 future={{
 v7_startTransition: true,
 }}
 />
 </AppProvider>
 </AuthProvider>
 );
}

export default App;