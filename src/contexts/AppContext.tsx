import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import api, { axios } from '../api/axios';
import { Course, LeaderboardEntry, AppContextType } from '../types';
import { useAuth } from './AuthContext';

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/courses');
      const data = response.data.data;
      setCourses(data);
      
      // Gunakan functional update agar tidak perlu depedensi [currentCourse]
      setCurrentCourse(prev => {
        if (data.length > 0 && !prev) return data[0];
        return prev;
      });
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await api.get('/leaderboard');
      setLeaderboard(response.data.data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchLeaderboard();
  }, [fetchCourses, fetchLeaderboard]);

  useEffect(() => {
    if (courses.length > 0 && !currentCourse) {
      setCurrentCourse(courses[0]);
    }
  }, [courses, currentCourse]);

  return (
    <AppContext.Provider value={{
      courses,
      currentCourse,
      leaderboard,
      isLoading,
      userProgress,
      fetchCourses,
      fetchLeaderboard,
      // Legacy functions mapped to empty or basic implementations to satisfy types if needed elsewhere
      addPoints: useCallback(() => {}, []),
      completeVideo: useCallback(() => {}, []),
      completeTask: useCallback(() => {}, []),
      unlockLevel: useCallback(() => {}, []),
      awardBadge: useCallback(() => {}, [])
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}