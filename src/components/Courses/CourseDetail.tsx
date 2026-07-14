import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
 ArrowLeft, Lock, CheckCircle, Youtube, FileText, Send, Trophy, Loader2, AlertCircle,
 MessageSquare, X, Play, BookOpen, GraduationCap, ChevronRight, Sparkles, BarChart3, Star, Activity, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

// URL for storage if needed
const API_STORAGE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';

// Helper untuk mengekstrak ID dari berbagai format link YouTube
const getYouTubeID = (url: string) => {
 if (!url) return "";
 const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
 const match = url.match(regExp);
 return (match && match[2].length === 11) ? match[2] : url;
};

// =======================================================
// COMPONENT: EvaluationDetail
// =======================================================
function EvaluationDetail({ level, onClose }: { level: any, onClose: () => void }) {
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (level.activity_type === 'quiz') {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const response = await api.get(`/levels/${level.id}/quiz-history`);
          setQuizHistory(response.data.data);
        } catch (err) {
          console.error("Gagal memuat riwayat kuis:", err);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [level.id, level.activity_type]);

  // Parse rubric data from the new formatted feedback string
  let rubric = null;
  let cleanFeedback = level.feedback || '';

  if (level.feedback && level.feedback.includes('RUBRIC_DATA:')) {
    try {
      const parts = level.feedback.split('|FEEDBACK:');
      const jsonStr = parts[0].replace('RUBRIC_DATA:', '');
      rubric = JSON.parse(jsonStr);
      cleanFeedback = parts[1] || '';
    } catch (e) {
      console.error("Error parsing rubric:", e);
    }
  } else {
    // Fallback for old format
    const rubricMatch = level.feedback?.match(/\[RUBRIK\] Prep: (\d)\/5, Exec: (\d)\/5, Follow: (\d)\/5/);
    if (rubricMatch) {
      rubric = {
        prep: parseInt(rubricMatch[1]),
        exec: parseInt(rubricMatch[2]),
        follow: parseInt(rubricMatch[3])
      };
      cleanFeedback = level.feedback?.replace(/\[RUBRIK\].*?\./, '').trim();
    }
  }

  // Get criteria to render for student view
  const getStudentCriteriaList = () => {
    const customCriteria = level.rubric;
    if (customCriteria && Array.isArray(customCriteria) && customCriteria.length > 0) {
      return customCriteria.map((crit: any, idx: number) => {
        const val = rubric ? rubric[crit.key] : 0;
        // Cycle colors and backgrounds for visual variety
        const colorSchemes = [
          { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' }
        ];
        const scheme = colorSchemes[idx % colorSchemes.length];
        return {
          label: crit.label.toUpperCase(),
          val: val !== undefined ? val : 0,
          max: crit.max_score || 5,
          color: scheme.color,
          bg: scheme.bg
        };
      });
    }

    // Fallback standard PJKR
    return [
      { label: 'AWALAN', val: rubric ? rubric.prep : 0, max: 5, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      { label: 'PELAKSANAAN', val: rubric ? rubric.exec : 0, max: 5, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
      { label: 'AKHIRAN', val: rubric ? rubric.follow : 0, max: 5, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' }
    ];
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 dark:border-gray-800 animate-in zoom-in-95 duration-500 max-h-[90vh] transition-colors duration-300">
        <div className="p-8 bg-gray-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Detail Evaluasi</h3>
              <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">{level.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-2xl hover:bg-red-500 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
          {/* RUBRIC VISUALIZATION (For Assignments) */}
          {rubric ? (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getStudentCriteriaList().map((item) => (
                    <div key={item.label} className={`${item.bg} p-6 rounded-[2rem] text-center border border-white dark:border-gray-800 shadow-sm flex flex-col justify-between`}>
                       <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{item.label}</p>
                       
                       {item.max <= 10 ? (
                         <div className="flex items-center justify-center gap-1 mb-2 flex-wrap">
                            {Array.from({ length: item.max }, (_, i) => i + 1).map(s => (
                              <Star key={s} size={12} className={s <= item.val ? `${item.color} fill-current text-yellow-400` : 'text-gray-200 dark:text-gray-700'} />
                            ))}
                         </div>
                       ) : (
                         <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mb-2">
                           <div className="bg-blue-600 h-full" style={{ width: `${(item.val / item.max) * 100}%` }}></div>
                         </div>
                       )}

                       <p className={`text-3xl font-black ${item.color}`}>{item.val}<span className="text-sm opacity-50 font-normal">/{item.max}</span></p>
                    </div>
                  ))}
               </div>

               <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                      <MessageSquare size={16} />
                    </div>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Catatan Perbaikan Dosen</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-bold italic leading-relaxed text-lg">
                    "{cleanFeedback || 'Gerakan secara keseluruhan sudah baik, pertahankan konsistensi latihan.'}"
                  </p>
               </div>
            </div>
          ) : level.activity_type === 'quiz' ? (
            <div className="space-y-8">
               <div className="text-center space-y-4">
                  <div className="h-32 w-32 mx-auto bg-green-50 dark:bg-green-900/20 rounded-[3rem] border-4 border-white dark:border-gray-800 shadow-xl flex flex-col items-center justify-center">
                      <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">SKOR</p>
                      <p className="text-4xl font-black text-green-700 dark:text-green-300 tracking-tighter">
                        {(() => {
                          const match = level.assignment_link?.match(/Quiz Score: (\d+)%/);
                          return match ? match[1] : '100';
                        })()}
                      </p>
                  </div>
                  <div className="space-y-1">
                      <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase">Analisis Jawaban</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tinjau kembali pemahaman Anda pada setiap butir soal.</p>
                  </div>
               </div>

               {loadingHistory ? (
                 <div className="flex flex-col items-center py-10">
                   <Loader2 className="animate-spin text-blue-600 mb-4" />
                   <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Memuat Riwayat...</p>
                 </div>
               ) : (
                 <div className="space-y-8">
                   {quizHistory.map((history, idx) => (
                     <div key={history.id} className="space-y-4 border-b border-gray-50 dark:border-gray-800 pb-8 last:border-0">
                        <div className="flex items-start gap-4">
                           <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-black ${history.is_correct ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                              {idx + 1}
                           </div>
                           <p className="font-bold text-gray-900 dark:text-white leading-snug pt-1">{history.question.text}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 pl-12">
                           {history.question.options.map((opt: any) => {
                             const isSelected = history.option_id === opt.id;
                             const isCorrect = opt.is_correct;
                             
                             let statusStyles = "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700";
                             if (isSelected && isCorrect) statusStyles = "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900";
                             else if (isSelected && !isCorrect) statusStyles = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-900";
                             else if (isCorrect) statusStyles = "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800 border-dashed border-2";

                             return (
                               <div key={opt.id} className={`p-4 rounded-2xl text-xs font-black border transition-all flex items-center justify-between ${statusStyles}`}>
                                  <span>{opt.text}</span>
                                  {isSelected && (
                                    <span className="text-[8px] uppercase tracking-tighter px-2 py-1 rounded bg-white/50 dark:bg-black/50">Jawaban Anda</span>
                                  )}
                                  {!isSelected && isCorrect && (
                                    <span className="text-[8px] uppercase tracking-tighter px-2 py-1 rounded bg-green-200 dark:bg-green-900">Kunci Jawaban</span>
                                  )}
                               </div>
                             );
                           })}
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          ) : (
            <div className="text-center py-10 space-y-6">
               <div className="h-24 w-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                  <CheckCircle size={48} />
               </div>
               <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase">Materi Selesai Dilajari</h4>
               <p className="text-gray-500 dark:text-gray-400 font-medium">Terus tingkatkan semangat belajar Anda untuk membuka materi selanjutnya.</p>
            </div>
          )}

          <div className="bg-gray-900 dark:bg-gray-800 p-8 rounded-[2.5rem] flex items-center justify-between text-white border border-gray-700">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl">
                   <Trophy size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Poin Didapat</p>
                   <p className="text-2xl font-black">+{level.earned_points || level.xp_reward} XP</p>
                </div>
             </div>
             <button 
               onClick={onClose}
               className="bg-white text-gray-900 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
             >
                TUTUP DETAIL
             </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function CourseDetail() {
 const { id } = useParams<{ id: string }>();
 const { user, isLoading: authLoading, checkAuth } = useAuth(); 
 
 const [course, setCourse] = useState<any | null>(null);
 const [activeLevel, setActiveLevel] = useState<any | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [accessError, setAccessError] = useState<string | null>(null);

 // Form Task (Hanya Link YouTube)
 const [youtubeLink, setYoutubeLink] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [pdfOpened, setPdfOpened] = useState(false);

 // Modal Evaluation Detail
 const [showEvalDetail, setShowEvalDetail] = useState(false);

 // --- LEVEL UP STATE ---
 const [showLevelUp, setShowLevelUp] = useState(false);
 const [newLevel, setNewLevel] = useState(1);

 // --- QUIZ STATES ---
 const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
 const [quizSubmitted, setQuizSubmitted] = useState(false);
 const [quizScore, setQuizScore] = useState(0);

 const fetchCourseDetail = async (isInitialLoad: boolean = false) => {
 try {
 const response = await api.get(`/courses/${id}`);
 const courseData = response.data.data;
 if (!courseData) return;

 // Urutkan levels berdasarkan order untuk memastikan konsistensi frontend
 if (courseData.levels) {
    courseData.levels.sort((a: any, b: any) => {
        if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
        return (a.id || 0) - (b.id || 0);
    });
 }

 setCourse(courseData);
 
 if (activeLevel) {
 const latest = courseData.levels?.find((l: any) => Number(l.id) === Number(activeLevel.id));
 if (latest) {
 const mergedLevel = {
 ...latest,
 is_completed: latest.is_completed ?? activeLevel.is_completed
 };
 setActiveLevel(mergedLevel);
 }
 } else if (isInitialLoad && courseData.levels?.length > 0) {
 const firstPending = courseData.levels.find((l: any) => !l.is_completed) || courseData.levels[0];
 handleSelectLevel(firstPending);
 }
 } catch (err) {
 console.error("Gagal memuat detail:", err);
 toast.error("Gagal memuat data kursus");
 } finally {
 if (isInitialLoad) setIsLoading(false);
 }
 };

 useEffect(() => {
 if (id) {
 setIsLoading(true);
 fetchCourseDetail(true);
 }
 }, [id]);

 const handleSelectLevel = async (level: any) => {
   // Gunakan property can_access dari backend jika ada, 
   // atau lakukan validasi manual sebagai cadangan
   const levels = [...(course?.levels || [])].sort((a: any, b: any) => {
     if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
     return (a.id || 0) - (b.id || 0);
   });
   const index = levels.findIndex((l: any) => Number(l.id) === Number(level.id));
   
   const isFirstLevel = index === 0;
   // level.can_access dikirim oleh CourseController.php
   const hasAccess = level.can_access !== undefined ? level.can_access : (isFirstLevel || levels[index-1]?.is_completed);

   if (!hasAccess && !level.is_completed) {
     const prevTitle = index > 0 ? levels[index - 1]?.title : 'materi sebelumnya';
     setAccessError(`Selesaikan ${prevTitle} terlebih dahulu.`);
   } else {
     setAccessError(null);
   }

   setActiveLevel(level);
   setPdfOpened(false); // Reset status PDF setiap ganti level
   setQuizAnswers({});
   setQuizSubmitted(false);
   setQuizScore(0);
 };

 const isPreviousLevelCompleted = () => {
   if (!activeLevel || !course?.levels) return true;
   
   // Urutkan levels secara konsisten
   const levels = [...course.levels].sort((a: any, b: any) => {
     if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
     return (a.id || 0) - (b.id || 0);
   });

   const currentIndex = levels.findIndex((l: any) => Number(l.id) === Number(activeLevel.id));
   
   // Jika level pertama (index 0), selalu boleh
   if (currentIndex === 0) return true;
   
   // Cek level sebelumnya di array yang sudah terurut
   const prevLevel = levels[currentIndex - 1];
   return prevLevel ? prevLevel.is_completed : true;
 };

 const handleQuizSubmit = async () => {
  if (!activeLevel.questions || activeLevel.questions.length === 0) return;
  if (!isPreviousLevelCompleted()) {
    toast.error(`Selesaikan ${course.levels.find((l: any) => l.order === activeLevel.order - 1)?.title} terlebih dahulu!`);
    return;
  }
   setSubmitting(true);
   try {
     const response = await api.post(`/levels/${activeLevel.id}/complete`, {
       answers: quizAnswers
     });

     if (response.data.success === false) {
       setQuizScore(response.data.score);
       setQuizSubmitted(true);
       toast.error(response.data.message || "Anda tidak lulus kuis. Silakan coba lagi.");
       return;
     }

     const { score, xp_gained, new_level } = response.data;
     setQuizScore(score);
     setQuizSubmitted(true);

     toast.success(`LULUS KUIS! +${xp_gained} XP didapatkan.`);
     setActiveLevel(prev => ({ ...prev, is_completed: true }));

     if (new_level > user?.level) {
       setNewLevel(new_level);
       setShowLevelUp(true);
     }

     checkAuth(); 
     fetchCourseDetail();
   } catch (error: any) {
     const errMsg = error.response?.data?.message || "Gagal mengirim jawaban kuis";
     if (error.response?.status === 422) {
       setQuizScore(error.response.data.score);
       setQuizSubmitted(true);
       toast.error(errMsg);
     } else {
       toast.error(errMsg);
     }
   } finally {
     setSubmitting(false);
   }
 };

 const handleSubmitTask = async (e?: React.FormEvent, bypassLink: boolean = false) => {
 if (e) e.preventDefault();
 if (activeLevel?.is_completed) return;
 if (!youtubeLink && !bypassLink) return;

 // Logika Roadmap: Cek urutan sebelum kirim
 if (!isPreviousLevelCompleted()) {
    toast.error(`Selesaikan ${course.levels.find((l: any) => l.order === activeLevel.order - 1)?.title} terlebih dahulu!`);
    return;
 }

 setSubmitting(true);
 try {
 const payload: any = {};
 if (activeLevel.activity_type === 'assignment') {
 payload.assignment_link = youtubeLink;
 }

 const response = await api.post(`/levels/${activeLevel.id}/complete`, payload);

 toast.success(`Selamat! +${response.data.xp_gained} XP didapatkan.`);
 setYoutubeLink('');
 setActiveLevel(prev => ({ ...prev, is_completed: true }));

 if (response.data.new_level > user?.level) {
 setNewLevel(response.data.new_level);
 setShowLevelUp(true);
 }

 checkAuth(); 
 fetchCourseDetail();
 } catch (err: any) {
 toast.error(err.response?.data?.message || "Gagal mengirim tugas.");
 } finally {
 setSubmitting(false);
 }
 };

 if (isLoading || authLoading) {
 return (
 <div className="flex flex-col items-center justify-center py-32 space-y-4">
 <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
 <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px]">Menyiapkan Materi PJKR...</p>
 </div>
 );
 }

 return (
 <div className="w-full flex flex-col gap-8 p-6 md:p-10 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-screen transition-colors duration-300">
 
 {/* LEVEL UP MODAL CELEBRATION */}
 {showLevelUp && createPortal(
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-xl animate-in fade-in duration-300">
 <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden text-center p-8 relative animate-in zoom-in-95 duration-500 border border-white/20 dark:border-gray-800 transition-colors duration-300">
 <div className="absolute top-6 right-6">
 <button onClick={() => setShowLevelUp(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X size={24}/></button>
 </div>
 <div className="h-28 w-28 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce">
 <Trophy size={56} className="text-yellow-600 dark:text-yellow-400" />
 </div>
 <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">LEVEL UP!</h3>
 <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium">Selamat! Anda sekarang mencapai</p>
 <div className="text-6xl font-black text-blue-600 dark:text-blue-400 mt-4 mb-10 tracking-tighter">Lvl {newLevel}</div>
 <button 
 onClick={() => setShowLevelUp(false)}
 className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95"
 >
 KERJA BAGUS!
 </button>
 </div>
 </div>,
 document.body
 )}

 {/* HEADER SECTION */}
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-gray-50 dark:border-gray-800 pb-10">
 <div className="flex items-center gap-6">
 <Link to="/courses" className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm group">
 <ArrowLeft className="h-6 w-6" />
 </Link>
 <div>
 <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
 {course?.title} <BookOpen className="h-8 w-8 text-blue-600 hidden md:block" />
 </h1>
 <div className="flex items-center gap-3 mt-2">
 <p className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest">
 <GraduationCap size={14} className="inline mr-2 mb-1" />
 Semester {course?.semester} • PJKR UM
 </p>
 </div>
 </div>
 </div>
 <div className="bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/20 flex items-center gap-4 self-start lg:self-center">
 <div className="p-2 bg-white/20 rounded-lg">
 <Trophy size={20} className="text-white" />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 leading-none mb-1">Total Poin</p>
 <span className="font-black text-xl tracking-tighter">{user?.points?.toLocaleString()} XP</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
 
 {/* LEFT SIDEBAR: Pertemuan List */}
 <div className="lg:col-span-4 space-y-6">
 <div className="flex items-center justify-between px-1">
 <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Struktur Pertemuan</h3>
 <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">{course?.levels?.length || 0} PERTEMUAN</span>
 </div>
 
 <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
 {course?.levels?.map((level: any, index: number) => {
 const isActive = activeLevel?.id === level.id;
 // Gunakan can_access dari backend untuk konsistensi total
 const hasAccess = level.can_access !== undefined ? level.can_access : (index === 0 || course.levels[index-1]?.is_completed);
 const isCompleted = level.is_completed;

 return (
 <button 
 key={level.id}
 onClick={() => handleSelectLevel(level)}
 className={`w-full p-6 rounded-[2rem] border transition-all text-left flex items-center justify-between group ${
 isActive 
 ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-lg shadow-blue-50 dark:shadow-none' 
 : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md'
 }`}
 >
 <div className="flex items-center gap-5">
 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${
 isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
 }`}>
 {index + 1}
 </div>
 <div>
 <h3 className={`font-black text-sm tracking-tight leading-tight ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>{level.title}</h3>
 <div className="flex items-center gap-2 mt-1.5">
 <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${isActive ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
 +{level.xp_reward} XP
 </span>
 {!hasAccess && !isCompleted && (
 <span className="text-[8px] font-black bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
 <Activity size={8} /> Menunggu
 </span>
 )}
 </div>
 </div>
 </div>
 
 {isCompleted ? (
 <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-xl">
 <CheckCircle size={18} />
 </div>
 ) : !hasAccess ? (
 <div className="bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 p-2 rounded-xl">
    <Lock size={16} />
 </div>
 ) : (
 <ChevronRight className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600 group-hover:text-blue-400'} transition-all`} />
 )}
 </button>
 );
 })}
 </div>
 </div>

 {/* RIGHT CONTENT: Detail & Activities */}
 <div className="lg:col-span-8 space-y-8">
 {accessError ? (
 <div className="bg-red-50/50 dark:bg-red-900/10 border-2 border-dashed border-red-100 dark:border-red-900/30 p-16 rounded-[3rem] text-center space-y-6">
 <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-[2rem] flex items-center justify-center mx-auto text-red-600 dark:text-red-400 shadow-inner">
 <Lock size={40} />
 </div>
 <div>
 <h3 className="text-xl font-black text-red-900 dark:text-red-400 uppercase">Akses Terkunci</h3>
 <p className="text-red-600 dark:text-red-500 font-bold text-sm mt-2">{accessError}</p>
 </div>
 <button 
 onClick={() => {
 const first = course?.levels?.[0];
 if (first) handleSelectLevel(first);
 }}
 className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-100 dark:shadow-none hover:bg-red-700 transition-all"
 >
 KEMBALI KE AWAL
 </button>
 </div>
 ) : activeLevel && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 
 {/* 1. VIDEO PLAYER */}
 {activeLevel.youtube_id && (activeLevel.activity_type === 'video' || activeLevel.activity_type === 'assignment') && (
 <div className="bg-gray-900 dark:bg-black rounded-[3rem] p-4 shadow-2xl overflow-hidden group">
 <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-inner border border-white/5">
 <iframe
 width="100%"
 height="100%"
 src={`https://www.youtube.com/embed/${getYouTubeID(activeLevel.youtube_id)}?modestbranding=1&rel=0`}
 title="Materi Pertemuan"
 frameBorder="0"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowFullScreen
 className="w-full h-full"
 ></iframe>
 </div>
 </div>
 )}

 {/* 2. DESCRIPTION CARD */}
 <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm space-y-8 transition-colors duration-300">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 dark:border-gray-800 pb-8">
 <div className="flex items-center gap-4">
 <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 dark:shadow-blue-900/20">
   <Play size={20} fill="currentColor" />
 </div>
 <div>
   <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{activeLevel.title}</h2>
   <div className="flex items-center gap-3 mt-1">
     <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Modul Pembelajaran PJKR</p>
     {activeLevel.deadline && (
       <>
         <span className="text-gray-200 dark:text-gray-700">|</span>
         <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
           <Clock size={12} className="mb-0.5" />
           <p className="text-[10px] font-black uppercase tracking-widest">
             Batas: {new Date(activeLevel.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
           </p>
         </div>
       </>
     )}
   </div>
 </div>
 </div>
 
 {activeLevel.pdf_path && (
 <a 
 href={`${API_STORAGE_URL}/storage/${activeLevel.pdf_path}`}
 target="_blank"
 rel="noopener noreferrer"
 onClick={() => setPdfOpened(true)}
 className={`flex items-center gap-3 text-[10px] font-black px-6 py-3 rounded-2xl transition-all shadow-sm border ${pdfOpened ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800 hover:bg-blue-600 hover:text-white'}`}
 >
 <FileText className="h-4 w-4" /> {pdfOpened ? 'MODUL PDF SUDAH DIBUKA' : 'BUKA MODUL PDF'}
 </a>
 )}
 </div>
 
 <div className="prose prose-blue dark:prose-invert max-w-none">
 <p className="text-gray-600 dark:text-gray-300 text-lg font-medium leading-relaxed italic">
 "{activeLevel.description}"
 </p>
 </div>

 {/* FEEDBACK AREA */}
 {activeLevel.is_completed && activeLevel.feedback && (
   <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] p-8 border border-blue-100 dark:border-blue-900/30 flex flex-col gap-6">
     <div className="flex items-center justify-between">
       <div className="flex items-center gap-4">
         <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-100">
           <MessageSquare size={24} />
         </div>
         <div>
           <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Evaluasi Dosen</p>
           <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase">Tugas Telah Diverifikasi</h4>
         </div>
       </div>
       <button 
         onClick={() => setShowEvalDetail(true)}
         className="px-6 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
       >
         Lihat Detail Rubrik
       </button>
     </div>
     
     <p className="text-gray-900 dark:text-gray-100 font-bold text-lg leading-relaxed italic border-l-4 border-blue-200 dark:border-blue-800 pl-6 py-1">
       "{(() => {
          if (activeLevel.feedback.includes('|FEEDBACK:')) {
            return activeLevel.feedback.split('|FEEDBACK:')[1];
          }
          return activeLevel.feedback.replace(/\[RUBRIK\].*?\./, '').trim();
       })()}"
     </p>
   </div>
 )}
 </div>

 {/* 3. ACTIVITY SECTION */}
 <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-2 border border-gray-50 dark:border-gray-800 shadow-sm transition-colors duration-300">
 {activeLevel.activity_type === 'quiz' ? (
 <div className="p-8 md:p-12 space-y-10">
 <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-8">
 <div>
 <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Kuis Pemahaman</h3>
 <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mt-1">Uji kompetensi materi ini</p>
 </div>
 <div className="bg-gray-100 dark:bg-gray-800 px-5 py-2 rounded-2xl text-[11px] font-black uppercase text-gray-500 dark:text-gray-400">
 {activeLevel.questions?.length || 0} Pertanyaan
 </div>
 </div>

 {activeLevel.is_completed ? (
 <div className="bg-green-50/50 dark:bg-green-900/10 p-12 rounded-[3rem] border border-green-100 dark:border-green-900/30 text-center space-y-8">
 <div className="h-24 w-24 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-green-100/50 dark:shadow-none border border-green-100 dark:border-green-800">
 <CheckCircle size={48} />
 </div>
 <div>
 <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Materi Selesai!</h4>
 <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mt-2">Anda telah berhasil menguasai kuis ini.</p>
 </div>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <button 
      onClick={() => setShowEvalDetail(true)}
      className="inline-flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 px-10 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all active:scale-95"
    >
      <BarChart3 size={18} /> LIHAT EVALUASI
    </button>
    {course?.levels?.find((l: any) => l.order === activeLevel.order + 1) && (
      <button 
        onClick={() => {
          const nextLvl = course.levels.find((l: any) => l.order === activeLevel.order + 1);
          if (nextLvl) handleSelectLevel(nextLvl);
        }}
        className="inline-flex items-center justify-center gap-4 bg-gray-900 dark:bg-gray-800 text-white px-12 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
      >
        Pertemuan Selanjutnya <ArrowLeft size={18} className="rotate-180" />
      </button>
    )}
 </div>
 </div>
 ) : !quizSubmitted ? (
 <div className="space-y-12">
 {activeLevel.questions?.map((q: any, idx: number) => (
 <div key={q.id} className="space-y-6">
 <p className="text-xl font-black text-gray-900 dark:text-white leading-snug">
 <span className="text-blue-600 dark:text-blue-400 mr-3 italic">0{idx + 1}.</span> {q.text}
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {q.options?.map((opt: any) => (
 <button
 key={opt.id}
 onClick={() => setQuizAnswers({...quizAnswers, [q.id]: opt.id})}
 className={`group p-6 rounded-[2rem] text-left text-sm font-black transition-all border-2 ${
 quizAnswers[q.id] === opt.id 
 ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 shadow-lg shadow-blue-50 dark:shadow-none' 
 : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 hover:border-blue-100 dark:hover:border-blue-900 hover:bg-white dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
 }`}
 >
 {opt.text}
 </button>
 ))}
 </div>
 </div>
 ))}
 <button 
 onClick={handleQuizSubmit}
 disabled={Object.keys(quizAnswers).length < (activeLevel.questions?.length || 0) || !isPreviousLevelCompleted() || (activeLevel.pdf_path && !pdfOpened)}
 className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-100 dark:shadow-blue-900/20 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-3"
 >
 <Send size={18} /> {!(activeLevel.pdf_path && !pdfOpened) ? (!isPreviousLevelCompleted() ? "BELUM BISA KIRIM KUIS" : "Kirim Jawaban Kuis") : "BACA MODUL PDF DAHULU"}
 </button>
 </div>
 ) : (
 <div className="text-center py-16 space-y-10">
 <div className={`h-40 w-40 mx-auto rounded-[3rem] flex items-center justify-center text-5xl font-black shadow-2xl border-8 border-white dark:border-gray-800 ${quizScore >= 70 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-green-100 dark:shadow-none' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-red-100 dark:shadow-none'}`}>
 {quizScore}
 </div>
 <div className="space-y-2">
 <h4 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{quizScore >= 70 ? 'SKOR FANTASTIS!' : 'COBA LAGI, SEMANGAT!'}</h4>
 <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">
 {quizScore >= 70 
 ? 'Selamat! Anda telah menguasai materi ini dengan baik.' 
 : 'Skor kelulusan minimal adalah 70. Silakan pelajari kembali materinya.'}
 </p>
 </div>
 {quizScore < 70 && (
 <button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }} className="bg-gray-900 dark:bg-gray-800 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-all">ULANGI KUIS</button>
 )}
 </div>
 )}
 </div>
 ) : activeLevel.activity_type === 'assignment' ? (
 <div className="bg-gray-900 dark:bg-black rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden transition-colors duration-300">
 {/* Background Decoration */}
 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
 <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
 
 <div className="relative z-10 space-y-10">
 <div className="flex items-center gap-4">
 <div className="p-3 bg-red-600 rounded-2xl shadow-xl shadow-red-900/50">
 <Youtube className="h-6 w-6" />
 </div>
 <div>
 <h3 className="text-2xl font-black uppercase tracking-tight">Tugas Praktik Video</h3>
 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Unggah rekaman gerakan Anda</p>
 </div>
 </div>
 
 {activeLevel.is_completed ? (
 <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
               <div className="bg-white/5 border border-white/10 dark:border-white/5 p-10 rounded-[2.5rem] flex flex-col items-center text-center gap-6">
                  <div className="h-20 w-20 bg-green-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-green-900/20"><CheckCircle size={32}/></div>
                  <div>
                    <h4 className="text-xl font-black uppercase">Tugas Terkirim</h4>
                    <p className="text-gray-400 font-medium mt-2">Tautan YouTube tugas Anda sudah tersimpan di sistem.</p>
                  </div>
                  <button 
                    onClick={() => setShowEvalDetail(true)}
                    className="inline-flex items-center justify-center gap-3 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
                  >
                    <BarChart3 size={16} /> LIHAT DETAIL EVALUASI
                  </button>
               </div>
 
 {course?.levels?.find((l: any) => l.order === activeLevel.order + 1) && (
 <button 
 onClick={() => {
 const nextLvl = course.levels.find((l: any) => l.order === activeLevel.order + 1);
 if (nextLvl) handleSelectLevel(nextLvl);
 }}
 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-4"
 >
 PERTEMUAN SELANJUTNYA <ArrowLeft size={20} className="rotate-180" />
 </button>
 )}
 </div>
 ) : (
 <form onSubmit={handleSubmitTask} className="space-y-6">
 <div className="space-y-3">
 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tautan YouTube Video Tugas</label>
 <div className="relative group">
 <Youtube className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-600 group-focus-within:text-red-500 transition-colors" />
 <input 
 type="text"
 placeholder="https://www.youtube.com/watch?v=..."
 value={youtubeLink}
 onChange={(e) => setYoutubeLink(e.target.value)}
 className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-lg font-bold focus:bg-white/10 focus:border-red-500 outline-none transition-all placeholder:text-gray-700 text-white"
 />
 </div>
 </div>
 <button 
 disabled={submitting || !youtubeLink || !isPreviousLevelCompleted() || (activeLevel.pdf_path && !pdfOpened)}
 className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-900/50"
 >
 {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
 {submitting ? "MENGIRIM TUGAS..." : (activeLevel.pdf_path && !pdfOpened ? "BACA MODUL PDF DAHULU" : (!isPreviousLevelCompleted() ? "BELUM BISA DIKIRIM" : "KIRIM & KLAIM XP"))}
 </button>
 </form>
 )}
 </div>
 </div>
 ) : (
 <div className="p-12 text-center space-y-10">
 <div className="relative inline-block">
 <div className={`h-32 w-32 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl transition-all duration-700 rotate-6 ${activeLevel.is_completed ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600' : 'bg-blue-600 text-white shadow-blue-100 dark:shadow-none'}`}>
 <CheckCircle size={64} />
 </div>
 {!activeLevel.is_completed && <div className="absolute -top-4 -right-4 h-12 w-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg animate-pulse"><Trophy size={24} className="text-yellow-900" /></div>}
 </div>
 
 <div className="space-y-3">
 <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
 {activeLevel.is_completed ? 'MISI SELESAI' : 'KONFIRMASI BELAJAR'}
 </h3>
 <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-md mx-auto">
 {activeLevel.is_completed 
 ? 'Selamat! Anda telah berhasil menuntaskan modul pembelajaran ini.' 
 : 'Apakah Anda sudah memahami seluruh materi dalam pertemuan ini?'}
 </p>
 </div>
 
 <div className="max-w-sm mx-auto space-y-4">
 <button 
 onClick={() => handleSubmitTask(undefined, true)}
 disabled={submitting || activeLevel.is_completed || !isPreviousLevelCompleted() || (activeLevel.pdf_path && !pdfOpened)}
 className={`w-full py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-4 ${
 activeLevel.is_completed 
 ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border-2 border-gray-100 dark:border-gray-700' 
 : (!isPreviousLevelCompleted() || (activeLevel.pdf_path && !pdfOpened))
 ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
 : 'bg-green-600 hover:bg-green-700 text-white shadow-2xl shadow-green-100 dark:shadow-none active:scale-95'
 }`}
 >
 {activeLevel.is_completed ? (
 <><CheckCircle size={20} /> MATERI TERVERIFIKASI</>
 ) : (activeLevel.pdf_path && !pdfOpened) ? (
 <>BACA MODUL PDF DAHULU</>
 ) : !isPreviousLevelCompleted() ? (
 <>BELUM BISA DISELESAIKAN</>
 ) : (
 <>
 {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles className="h-5 w-5 fill-current" />}
 Selesaikan & Ambil XP
 </>
 )}
 </button>

 {activeLevel.is_completed && (
    <button 
      onClick={() => setShowEvalDetail(true)}
      className="w-full bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-100 dark:border-blue-900 py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900 transition-all active:scale-95 flex items-center justify-center gap-3"
    >
      <BarChart3 size={16} /> LIHAT RINGKASAN EVALUASI
    </button>
 )}

 {activeLevel.is_completed && course?.levels?.find((l: any) => l.order === activeLevel.order + 1) && (
 <button 
 onClick={() => {
 const nextLvl = course.levels.find((l: any) => l.order === activeLevel.order + 1);
 if (nextLvl) handleSelectLevel(nextLvl);
 }}
 className="w-full bg-gray-900 dark:bg-gray-800 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-4 mt-4"
 >
 Pertemuan Selanjutnya <ArrowLeft size={20} className="rotate-180" />
 </button>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 {showEvalDetail && activeLevel && (
   <EvaluationDetail 
     level={activeLevel} 
     onClose={() => setShowEvalDetail(false)} 
   />
 )}
 </div>
 </div>
 </div>
 );
}
