// =======================================================
// MODEL DATA UTAMA (Sinkron dengan Laravel Migration)
// =======================================================

export interface User {
  id: number;
  nim: string;
  name: string;
  email: string;
  semester: string;
  phone: string;
  role: 'admin' | 'student' | 'dosen'; 
  points: number;
  level: number;
  current_streak: number;
  last_activity_date: string | null;
  avatar?: string;
  
  // Relasi Gamifikasi
  achievements?: Badge[];
  completed_level_ids?: number[];
  progress?: any[];
  assignments?: any[];
  
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  semester: string;
  total_points: number; // Nama field snake_case sesuai DB Laravel
  is_active: boolean;   // Nama field snake_case sesuai DB Laravel
  levels: CourseLevel[]; // Relasi ke levels
}

export interface CourseLevel {
  id: string | number;
  title: string;
  description?: string;
  pdf_path?: string;
  youtube_id?: string;
  activity_type: 'checklist' | 'quiz' | 'assignment';
  xp_reward: number;
  order: number;
  is_completed?: boolean;
  can_access?: boolean;
  questions?: any[];
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  badge_icon: string; // Nama file icon (rookie-badge.png)
  required_points: number;
  pivot?: {
    earned_at: string;
  };
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  nim?: string;
  semester?: string;
  points: number;
  level: number;
  avatar?: string;
}

// =======================================================
// CONTEXT TYPES (LOGIC & STATE)
// =======================================================

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (nim: string, password: string) => Promise<boolean>;
  register: (nim: string, name: string, semester: string, phone: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

export interface AppContextType {
  courses: Course[];
  currentCourse: Course | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  userProgress?: Record<string, any>;
  
  // Data Fetching
  fetchCourses: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
}