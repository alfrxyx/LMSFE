import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../../api/axios";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Play,
  FileText,
  Eye,
  X,
  ListOrdered,
  HelpCircle,
  CheckCircle2,
  Circle,
  Loader2,
  Award,
  Activity,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";
import { toast } from "sonner";
import { ConfirmModal } from "../Shared/ConfirmModal";

export function ContentManagement() {
  const { user } = useAuth();
  const { courses, fetchCourses, isLoading: appLoading } = useApp();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"courses" | "videos" | "quizzes">(
    "courses",
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCourses();
      setLoading(false);
    };
    init();
  }, [fetchCourses]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    type: 'question' | 'level' | 'course';
    id: number | null;
  }>({
    isOpen: false,
    type: 'question',
    id: null,
  });

  // Selection & Mode
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditLevelMode, setIsEditLevelMode] = useState(false);

  // Form States Kursus
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    semester: "1",
    thumbnail:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80&fm=webp",
    total_points: 0,
    order: 1,
  });

  // Form States Pertemuan
  const [levelForm, setLevelForm] = useState({
    title: "",
    description: "",
    xp_reward: 100,
    activity_type: "checklist",
    youtube_id: "",
    order: 1,
    deadline: "",
    sendAnnouncement: true, // Default true untuk materi baru
  });

  // --- MATERIAL STATS MODAL STATES ---
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [materialStats, setMaterialStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [nudgingId, setNudgingId] = useState<number | null>(null);

  const fetchMaterialStats = async (levelId: number) => {
    try {
      setStatsLoading(true);
      setIsStatsModalOpen(true);
      const res = await api.get(`/dosen/levels/${levelId}/stats`);
      setMaterialStats(res.data);
    } catch (e) {
      toast.error("Gagal memuat statistik materi");
      setIsStatsModalOpen(false);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleNudge = async (userId: number, levelId: number) => {
    try {
      setNudgingId(userId);
      await api.post('/dosen/remind-student', { user_id: userId, level_id: levelId });
      toast.success("Email pengingat berhasil dikirim!");
    } catch (e) {
      toast.error("Gagal mengirim pengingat");
    } finally {
      setNudgingId(null);
    }
  };
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // --- QUIZ BUILDER STATES ---
  const [selectedQuizLevel, setSelectedQuizLevel] = useState<any | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null,
  );
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    points: 10,
    options: [
      { text: "", is_correct: true },
      { text: "", is_correct: false },
    ],
  });

  useEffect(() => {
    if (activeTab === "quizzes" && selectedQuizLevel) {
      fetchQuizQuestions(selectedQuizLevel.id);
    }
  }, [selectedQuizLevel, activeTab]);

  const fetchQuizQuestions = async (levelId: number) => {
    try {
      const res = await api.get(`/levels/${levelId}/questions`);
      setQuizQuestions(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizLevel) return;
    if (!newQuestion.options.some((o) => o.is_correct)) {
      toast.warning("Pilih satu jawaban yang benar!");
      return;
    }

    try {
      if (editingQuestionId) {
        await api.put(`/questions/${editingQuestionId}`, newQuestion);
      } else {
        await api.post(
          `/levels/${selectedQuizLevel.id}/questions`,
          newQuestion,
        );
      }
      setIsAddingQuestion(false);
      setEditingQuestionId(null);
      fetchQuizQuestions(selectedQuizLevel.id);
      setNewQuestion({
        text: "",
        points: 10,
        options: [
          { text: "", is_correct: true },
          { text: "", is_correct: false },
        ],
      });
      toast.success("Kuis berhasil disimpan!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan kuis");
    }
  };

  const handleAddOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, { text: "", is_correct: false }],
    });
  };

  const handleRemoveOption = (index: number) => {
    if (newQuestion.options.length <= 2) return;
    const next = newQuestion.options.filter((_, i) => i !== index);
    if (newQuestion.options[index].is_correct) next[0].is_correct = true;
    setNewQuestion({ ...newQuestion, options: next });
  };

  const handleDeleteQuestion = async (id: number) => {
    try {
      await api.delete(`/questions/${id}`);
      if (selectedQuizLevel) fetchQuizQuestions(selectedQuizLevel.id);
      toast.success("Pertanyaan berhasil dihapus");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus pertanyaan");
    }
  };

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Helper untuk URL Gambar
  const getImageUrl = (path: string) => {
    if (!path)
      return "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800";
    if (path.startsWith("http")) return path;
    const baseUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://127.0.0.1:8000";
    return `${baseUrl}/storage/${path}`;
  };

  const [thumbnailMethod, setThumbnailMethod] = useState<"file" | "url">("file");

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", courseForm.title);
    formData.append("description", courseForm.description);
    formData.append("semester", courseForm.semester);
    formData.append("total_points", courseForm.total_points.toString());
    formData.append("order", (courseForm.order || 1).toString());

    if (thumbnailMethod === "file" && thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    } else if (thumbnailMethod === "url") {
      formData.append("thumbnail_url", courseForm.thumbnail);
    }

    try {
      if (isEditMode && selectedCourse) {
        formData.append("_method", "PUT");
        await api.post(`/admin/courses/${selectedCourse.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/admin/courses`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setIsModalOpen(false);
      setThumbnailFile(null);
      fetchCourses();
      toast.success("Materi berhasil disimpan!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan materi");
    }
  };

  const [semesterFilter, setSemesterFilter] = useState<string | null>(null);

  // Reset quiz selection when semester filter or tab changes
  useEffect(() => {
    setSelectedQuizLevel(null);
    setQuizQuestions([]);
    setIsAddingQuestion(false);
  }, [semesterFilter, activeTab]);

  const filteredCoursesBySemester = courses?.filter(
    (c: any) =>
      semesterFilter === null || c.semester.toString() === semesterFilter,
  );

  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(levelForm).forEach(([key, value]) => {
      if (value !== null && value !== undefined)
        formData.append(key, value.toString());
    });
    if (pdfFile) formData.append("pdf", pdfFile);
    try {
      const url =
        isEditLevelMode && selectedLevelId
          ? `/levels/${selectedLevelId}?_method=PUT`
          : `/courses/${selectedCourse.id}/levels`;
      const response = await api.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const savedLevel = response.data.data;

      // --- OTOMATIS KE QUIZ BUILDER JIKA TIPE KUIS ---
      if (levelForm.activity_type === 'quiz') {
        setActiveTab('quizzes');
        setSelectedQuizLevel(savedLevel);
        setIsAddingQuestion(true);
      }
      // ---------------------------------------------

      // --- OTOMATIS KIRIM PENGUMUMAN (ANNOUNCEMENT) ---
      // Hanya kirim jika checkbox dicentang
      if (levelForm.sendAnnouncement) {
        try {
          const isAssignment = levelForm.activity_type === 'assignment';
          await api.post('/announcements', {
            title: isAssignment ? 'TUGAS PRAKTIK BARU!' : 'MATERI KULIAH BARU!',
            message: `Halo Mahasiswa Semester ${selectedCourse.semester}! Telah ditambahkan ${isAssignment ? 'tugas baru' : 'materi baru'}: "${levelForm.title}" pada mata kuliah ${selectedCourse.title}. Silakan cek dan pelajari.`,
            type: isAssignment ? 'warning' : 'info'
          });
        } catch (annErr) {
          console.error("Gagal mengirim pengumuman otomatis:", annErr);
        }
      }
      // ---------------------------------------------

      setIsLevelModalOpen(false);
      setIsDetailModalOpen(false);
      fetchCourses();
      toast.success(
        levelForm.sendAnnouncement 
          ? "Pertemuan berhasil disimpan & Pengumuman terkirim!" 
          : "Pertemuan berhasil disimpan!"
      );
    } catch (error: any) {
      toast.error("Gagal: " + (error.response?.data?.message || error.message));
    }
  };

  const openAddLevelModal = (course: any) => {
    setSelectedCourse(course);
    const sortedLevels = [...(course.levels || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    const nextOrder = sortedLevels.length > 0 ? (sortedLevels[sortedLevels.length - 1].order + 1) : 1;
    
    setLevelForm({
      title: "",
      description: "",
      xp_reward: 100,
      activity_type: "checklist",
      youtube_id: "",
      order: nextOrder,
      deadline: "",
      sendAnnouncement: true,
    });
    setIsEditLevelMode(false);
    setIsLevelModalOpen(true);
  };

  if (user?.role !== "admin" && user?.role !== "dosen") {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 uppercase tracking-widest font-black text-red-600 dark:text-red-400 transition-colors duration-300">
        Akses Ditolak
      </div>
    );
  }

  if (loading || appLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px]">
          Menyiapkan Manajemen Konten PJKR...
        </p>
      </div>
    );
  }

  const tabs = [
    { id: "courses", name: "Courses", icon: FileText },
    { id: "videos", name: "Videos", icon: Play },
    { id: "quizzes", name: "Quiz Builder", icon: HelpCircle },
  ];

  return (
    <div className="w-full flex flex-col gap-10 p-6 md:p-10 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-screen transition-colors duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-gray-50/50 dark:bg-gray-800/50 p-8 rounded-[2.5rem] border border-gray-100/50 dark:border-gray-700/50 shrink-0">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Content Management <FileText className="h-10 w-10 text-blue-600" />
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium italic">
            Kelola materi, video, dan kuis interaktif PJKR UM.
          </p>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl self-start lg:self-center shadow-sm border border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {semesterFilter && (
        <div className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 dark:shadow-none">
                 <ListOrdered size={20} />
              </div>
              <div>
                 <h3 className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase">Manajemen Semester {semesterFilter}</h3>
                 <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-widest">PJKR Universitas Negeri Malang</p>
              </div>
           </div>
           <button 
             onClick={() => setSemesterFilter(null)}
             className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
           >
             <ChevronRight className="h-4 w-4 rotate-180" /> Kembali Pilih Semester
           </button>
        </div>
      )}

      <div>
        {activeTab === "courses" && (
          <div className="space-y-8">
            {!semesterFilter ? (
              /* SEMESTER SELECTION GRID FOR ADMIN */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {["1", "2", "3", "4", "5", "6", "7", "8"].map((sem) => {
                  const courseCount = courses?.filter((c: any) => c.semester.toString() === sem).length || 0;
                  return (
                    <button
                      key={sem}
                      onClick={() => setSemesterFilter(sem)}
                      className="group relative overflow-hidden p-8 rounded-[2.5rem] border-2 border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 dark:hover:shadow-none transition-all text-left flex flex-col justify-between h-56 active:scale-95"
                    >
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">MANAJEMEN KONTEN</p>
                        <h3 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">Semester {sem}</h3>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          {courseCount} Materi
                        </div>
                        <div className="p-3 rounded-2xl bg-gray-900 dark:bg-gray-700 text-white group-hover:bg-blue-600 transition-all">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors"></div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* COURSE LIST FOR SELECTED SEMESTER */
              <>
                <div className="flex flex-col md:flex-row justify-end items-center gap-6">
                  <button
                    onClick={() => {
                      setCourseForm({
                        title: "",
                        description: "",
                        semester: semesterFilter, // Auto-set to current selected semester
                        thumbnail:
                          "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
                        total_points: 0,
                        order: (filteredCoursesBySemester?.length || 0) + 1,
                      });
                      setIsEditMode(false);
                      setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2 w-full md:w-auto justify-center dark:shadow-none"
                  >
                    <Plus size={18} /> BUAT MATERI BARU SEM {semesterFilter}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
                  {filteredCoursesBySemester?.map((course: any) => (
                    <div
                      key={course.id}
                      className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all flex flex-col shadow-sm"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={getImageUrl(course.thumbnail)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-1.5 rounded-xl shadow-lg border border-white/50 dark:border-gray-800">
                          <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                            Semester {course.semester}
                          </p>
                        </div>
                        <div className="absolute bottom-4 left-6 right-6">
                          <h4 className="font-black text-white text-xl leading-tight drop-shadow-md">
                            {course.title}
                          </h4>
                        </div>
                      </div>
                      <div className="p-8 space-y-6 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                              <ListOrdered size={14} />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                              {course.levels?.length || 0} Pertemuan
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                              <Award size={14} />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                              {course.total_points} XP Total
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setIsDetailModalOpen(true);
                            }}
                            className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-blue-100 dark:hover:border-blue-900 border border-transparent transition-all"
                          >
                            <Eye size={14} /> Lihat
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setCourseForm({
                                title: course.title,
                                description: course.description,
                                semester: course.semester?.toString() || "1",
                                thumbnail: course.thumbnail,
                                total_points: course.total_points,
                                order: course.order || 1,
                              });
                              setIsEditMode(true);
                              setIsModalOpen(true);
                            }}
                            className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 text-green-600 dark:text-green-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-green-100 dark:hover:border-green-900 border border-transparent transition-all"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            onClick={() => openAddLevelModal(course)}
                            className="col-span-2 flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg dark:shadow-none transition-all"
                          >
                            <Plus size={16} /> Tambah Pertemuan
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredCoursesBySemester?.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50/50 dark:bg-gray-800/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-gray-400 dark:text-gray-500 font-black uppercase text-xs tracking-widest">Belum ada materi di semester ini.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "quizzes" && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
            {!semesterFilter ? (
              /* SEMESTER SELECTION GRID FOR QUIZ BUILDER */
              <div className="p-12 space-y-8">
                 <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Quiz Builder</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Pilih semester terlebih dahulu untuk mengelola kuis interaktif.</p>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {["1", "2", "3", "4", "5", "6", "7", "8"].map((sem) => {
                      const quizCount = courses?.filter((c: any) => c.semester.toString() === sem)
                                              .reduce((acc: number, c: any) => acc + (c.levels?.filter((l: any) => l.activity_type === 'quiz').length || 0), 0);
                      return (
                        <button
                          key={sem}
                          onClick={() => setSemesterFilter(sem)}
                          className="group relative overflow-hidden p-8 rounded-[2.5rem] border-2 border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 dark:hover:shadow-none transition-all text-left flex flex-col justify-between h-56 active:scale-95"
                        >
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">MANAJEMEN KUIS</p>
                            <h3 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">Semester {sem}</h3>
                          </div>
                          <div className="flex items-center justify-between mt-auto">
                            <div className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              {quizCount} Kuis
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-900 dark:bg-gray-700 text-white group-hover:bg-blue-600 transition-all">
                              <HelpCircle size={18} />
                            </div>
                          </div>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors"></div>
                        </button>
                      );
                    })}
                 </div>
              </div>
            ) : (
              /* QUIZ BUILDER UI FOR SELECTED SEMESTER */
              <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[70vh]">
                <div className="lg:col-span-1 border-r border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 p-8 space-y-6">
                  <h3 className="font-black text-gray-900 dark:text-white uppercase text-[10px] tracking-[0.2em] mb-4">
                    Pilih Pertemuan (SEM {semesterFilter})
                  </h3>
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {filteredCoursesBySemester
                      ?.filter((c: any) =>
                        c.levels?.some((l: any) => l.activity_type === "quiz"),
                      )
                      .map((course) => (
                        <div key={course.id} className="space-y-2">
                          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                            {course.title}
                          </p>
                          <div className="space-y-1">
                            {course.levels
                              ?.filter((l: any) => l.activity_type === "quiz")
                              .map((lvl: any) => (
                                <button
                                  key={lvl.id}
                                  onClick={() => setSelectedQuizLevel(lvl)}
                                  className={`w-full text-left p-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-between ${selectedQuizLevel?.id === lvl.id ? "bg-blue-600 text-white shadow-lg" : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                                >
                                  <span className="truncate pr-2">
                                    {lvl.title}
                                  </span>
                                  <ChevronRight size={14} />
                                </button>
                              ))}
                          </div>
                        </div>
                      ))}
                    {filteredCoursesBySemester?.filter((c: any) => c.levels?.some((l: any) => l.activity_type === "quiz")).length === 0 && (
                      <div className="text-center py-10">
                        <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Tidak ada kuis di semester ini.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-3 p-8 md:p-8">
                  {!selectedQuizLevel ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 font-black uppercase text-[10px] tracking-widest text-center px-10">
                      Pilih pertemuan kuis di sidebar untuk mulai membangun soal.
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-8">
                        <div>
                          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {selectedQuizLevel.title}
                          </h2>
                          <p className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase mt-1">
                            {quizQuestions.length} Soal
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setIsAddingQuestion(true);
                            setEditingQuestionId(null);
                          }}
                          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl dark:shadow-none hover:bg-blue-700 transition-all uppercase tracking-widest"
                        >
                          <Plus size={18} /> TAMBAH PERTANYAAN
                        </button>
                      </div>
                      {isAddingQuestion && (
                        <form
                          onSubmit={handleSaveQuestion}
                          className="bg-blue-50/50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-900 space-y-8 shadow-inner"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-black text-blue-900 dark:text-blue-100 uppercase text-xs tracking-widest">
                              {editingQuestionId ? "Update" : "Baru"}
                            </h4>
                            <button
                              type="button"
                              className="text-gray-400 dark:text-gray-500"
                              onClick={() => {
                                setIsAddingQuestion(false);
                                setEditingQuestionId(null);
                              }}
                            >
                              <X size={20} />
                            </button>
                          </div>
                          <input
                            required
                            className="w-full p-6 bg-white dark:bg-gray-800 rounded-3xl font-bold text-lg shadow-sm outline-none text-gray-900 dark:text-white border border-transparent focus:border-blue-500"
                            placeholder="Teks Pertanyaan..."
                            value={newQuestion.text}
                            onChange={(e) =>
                              setNewQuestion({
                                ...newQuestion,
                                text: e.target.value,
                              })
                            }
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="number"
                              className="w-full p-5 bg-white dark:bg-gray-800 rounded-2xl font-black text-blue-600 dark:text-blue-400 outline-none border border-transparent focus:border-blue-500"
                              value={
                                newQuestion.points === 0 ? "" : newQuestion.points
                              }
                              onChange={(e) =>
                                setNewQuestion({
                                  ...newQuestion,
                                  points: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                            <button
                              type="button"
                              onClick={handleAddOption}
                              className="w-full p-5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-xs border-2 border-dashed border-blue-200 dark:border-blue-900"
                            >
                              TAMBAH OPSI
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {newQuestion.options.map((opt, idx) => (
                              <div
                                key={idx}
                                className={`p-5 rounded-[2rem] flex items-center gap-4 bg-white dark:bg-gray-800 ${opt.is_correct ? "border-2 border-green-500" : "border-2 border-transparent dark:border-gray-700 shadow-sm"}`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...newQuestion.options];
                                    next.forEach((o) => (o.is_correct = false));
                                    next[idx].is_correct = true;
                                    setNewQuestion({
                                      ...newQuestion,
                                      options: next,
                                    });
                                  }}
                                  className={`h-8 w-8 rounded-xl flex items-center justify-center ${opt.is_correct ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600"}`}
                                >
                                  {opt.is_correct ? (
                                    <CheckCircle2 size={18} />
                                  ) : (
                                    <Circle size={14} />
                                  )}
                                </button>
                                <input
                                  required
                                  className="flex-1 bg-transparent font-bold outline-none text-sm text-gray-900 dark:text-white"
                                  value={opt.text}
                                  onChange={(e) => {
                                    const next = [...newQuestion.options];
                                    next[idx].text = e.target.value;
                                    setNewQuestion({
                                      ...newQuestion,
                                      options: next,
                                    });
                                  }}
                                />
                                {newQuestion.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(idx)}
                                    className="text-gray-300 dark:text-gray-600 hover:text-red-500"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end gap-4 pt-6 border-t border-blue-100 dark:border-blue-900">
                            <button
                              type="submit"
                              className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl dark:shadow-none"
                            >
                              Simpan Pertanyaan
                            </button>
                          </div>
                        </form>
                      )}
                      <div className="space-y-6">
                        {quizQuestions.map((q, idx) => (
                          <div
                            key={q.id}
                            className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-none transition-all group/q"
                          >
                            <div className="flex justify-between items-start mb-8">
                              <div className="flex gap-6">
                                <span className="h-12 w-12 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl flex items-center justify-center font-black text-lg">
                                  {idx + 1}
                                </span>
                                <div>
                                  <p className="font-black text-gray-900 dark:text-white text-xl leading-tight mb-2">
                                    {q.text}
                                  </p>
                                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                                    {q.points} XP Reward
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover/q:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setNewQuestion({
                                      text: q.text,
                                      points: q.points,
                                      options: q.options.map((o: any) => ({
                                        text: o.text,
                                        is_correct: !!o.is_correct,
                                      })),
                                    });
                                    setEditingQuestionId(q.id);
                                    setIsAddingQuestion(true);
                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                  }}
                                  className="p-3 bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    setConfirmDelete({
                                      isOpen: true,
                                      type: 'question',
                                      id: q.id,
                                    });
                                  }}
                                  className="p-3 bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-20">
                              {q.options.map((opt: any) => (
                                <div
                                  key={opt.id}
                                  className={`p-5 rounded-2xl text-xs font-bold border flex items-center gap-3 transition-all ${opt.is_correct ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" : "bg-gray-50/50 dark:bg-gray-900/50 border-transparent dark:border-gray-700 text-gray-400 dark:text-gray-500"}`}
                                >
                                  {opt.is_correct ? (
                                    <CheckCircle2 size={16} />
                                  ) : (
                                    <Circle size={14} />
                                  )}
                                  <span className="flex-1">{opt.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "videos" && (
          <div className="text-center py-40 bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 font-black uppercase text-xs tracking-widest">
            Fitur Manajemen Video Segera Hadir
          </div>
        )}
      </div>
      
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title={confirmDelete.type === 'question' ? 'Hapus Pertanyaan?' : confirmDelete.type === 'level' ? 'Hapus Pertemuan?' : 'Hapus Materi?'}
        message="Tindakan ini tidak dapat dibatalkan. Data akan dihapus permanen dari sistem."
        onConfirm={async () => {
          if (confirmDelete.id) {
            if (confirmDelete.type === 'question') {
              await handleDeleteQuestion(confirmDelete.id);
            } else if (confirmDelete.type === 'level') {
              try {
                await api.delete(`/levels/${confirmDelete.id}`);
                fetchCourses();
                toast.success("Pertemuan berhasil dihapus");
              } catch (e) {
                toast.error("Gagal menghapus pertemuan");
              }
            } else if (confirmDelete.type === 'course') {
              try {
                await api.delete(`/admin/courses/${confirmDelete.id}`);
                fetchCourses();
                setIsModalOpen(false);
                toast.success("Materi berhasil dihapus");
              } catch (e) {
                toast.error("Gagal menghapus materi");
              }
            }
          }
          setConfirmDelete({ ...confirmDelete, isOpen: false, id: null });
        }}
        onCancel={() => setConfirmDelete({ ...confirmDelete, isOpen: false, id: null })}
      />

      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-8 bg-gray-900/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative border border-white/20 dark:border-gray-700 pointer-events-auto transition-colors duration-300">
              <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-start shrink-0">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">
                    {isEditMode ? "Edit Data Materi" : "Buat Materi Baru"}
                  </h3>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">
                    LMS PJKR Universitas Malang
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form
                onSubmit={handleSaveCourse}
                className="p-8 space-y-6 overflow-y-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                        Judul Materi Pembelajaran
                      </label>
                      <input
                        required
                        placeholder="Contoh: Teknik Dasar Atletik"
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold outline-none text-gray-900 dark:text-white"
                        value={courseForm.title}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                        Deskripsi Singkat
                      </label>
                      <textarea
                        required
                        placeholder="Jelaskan..."
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-medium h-40 outline-none resize-none text-gray-900 dark:text-white"
                        value={courseForm.description}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                          Target Semester
                        </label>
                        <select
                          required
                          className="w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold outline-none text-sm text-gray-900 dark:text-white"
                          value={courseForm.semester}
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              semester: e.target.value,
                            })
                          }
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s.toString()} className="bg-white dark:bg-gray-800">
                              Semester {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                          Total XP Hadiah
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="0"
                          className="w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-black text-blue-600 dark:text-blue-400 outline-none text-lg shadow-sm"
                          value={
                            courseForm.total_points === 0
                              ? ""
                              : courseForm.total_points
                          }
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              total_points: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                          Urutan Katalog
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="1"
                          className="w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-black text-gray-700 dark:text-gray-300 outline-none text-lg shadow-sm"
                          value={courseForm.order === 0 ? "" : courseForm.order}
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              order: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 block">
                        Thumbnail Materi
                      </label>
                      
                      <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-4 border border-gray-200 dark:border-gray-700">
                         <button 
                           type="button"
                           onClick={() => setThumbnailMethod("file")}
                           className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${thumbnailMethod === 'file' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-400 dark:text-gray-600'}`}
                         >
                           Upload Foto
                         </button>
                         <button 
                           type="button"
                           onClick={() => setThumbnailMethod("url")}
                           className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${thumbnailMethod === 'url' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-400 dark:text-gray-600'}`}
                         >
                           Link URL
                         </button>
                      </div>

                      {thumbnailMethod === "file" ? (
                        <div className="relative group cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setThumbnailFile(e.target.files[0]);
                              }
                            }}
                          />
                          <div className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 group-hover:border-blue-400 dark:group-hover:border-blue-500 flex items-center justify-center gap-3 transition-all">
                            <Upload size={18} className="text-gray-400 group-hover:text-blue-600" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600">
                              {thumbnailFile ? thumbnailFile.name : "Pilih Foto Baru"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                           <input
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 font-bold outline-none text-xs text-gray-900 dark:text-white"
                            placeholder="Tempelkan Link Foto (https://...)"
                            value={courseForm.thumbnail}
                            onChange={(e) =>
                              setCourseForm({
                                ...courseForm,
                                thumbnail: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                      
                      <div className="mt-4 h-32 w-full rounded-2xl border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
                        {thumbnailMethod === "file" && thumbnailFile ? (
                          <img
                            src={URL.createObjectURL(thumbnailFile)}
                            className="h-full w-full object-cover opacity-80"
                            alt="Preview Local"
                          />
                        ) : courseForm.thumbnail ? (
                          <img
                            src={getImageUrl(courseForm.thumbnail)}
                            className="h-full w-full object-cover opacity-80"
                            alt="Preview URL"
                          />
                        ) : (
                          <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase">
                            Preview
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100">
                           <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Preview Thumbnail</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  {isEditMode && selectedCourse && (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete({ isOpen: true, type: 'course', id: selectedCourse.id })}
                      className="w-1/3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-5 rounded-[24px] font-black hover:bg-red-100 dark:hover:bg-red-900/20 transition-all uppercase tracking-widest text-xs border border-red-100 dark:border-red-900/30"
                    >
                      Hapus Materi
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`${isEditMode && selectedCourse ? 'w-2/3' : 'w-full'} bg-blue-600 text-white py-5 rounded-[24px] font-black shadow-xl dark:shadow-none hover:bg-blue-700 transition-all uppercase tracking-widest text-xs`}
                  >
                    Simpan Materi
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {isLevelModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 md:p-8 bg-gray-900/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative border border-white/20 dark:border-gray-700 pointer-events-auto transition-colors duration-300">
              <div className="p-8 bg-blue-600 text-white flex justify-between items-start shrink-0">
                <div>
                  <h3 className="text-2xl font-black">
                    {isEditLevelMode
                      ? "Edit Pertemuan"
                      : "Tambah Pertemuan Baru"}
                  </h3>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">
                    Materi: {selectedCourse?.title}
                  </p>
                </div>
                <button
                  onClick={() => setIsLevelModalOpen(false)}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form
                onSubmit={handleSaveLevel}
                className="p-8 space-y-6 overflow-y-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                        Judul Pertemuan
                      </label>
                      <input
                        required
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold outline-none text-gray-900 dark:text-white"
                        value={levelForm.title}
                        onChange={(e) =>
                          setLevelForm({ ...levelForm, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                        Instruksi
                      </label>
                      <textarea
                        required
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-medium h-32 outline-none resize-none text-gray-900 dark:text-white"
                        value={levelForm.description}
                        onChange={(e) =>
                          setLevelForm({
                            ...levelForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                          XP
                        </label>
                        <input
                          type="number"
                          className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-black text-blue-600 dark:text-blue-400 outline-none"
                          value={
                            levelForm.xp_reward === 0 ? "" : levelForm.xp_reward
                          }
                          onChange={(e) =>
                            setLevelForm({
                              ...levelForm,
                              xp_reward: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-2xl border-2 border-blue-100/50 dark:border-blue-900/30">
                        <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                          <ListOrdered size={12} /> Urutan Materi
                        </label>
                        <input
                          type="number"
                          placeholder="Contoh: 1"
                          className="w-full p-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-blue-100 dark:border-blue-800 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/30 transition-all font-black text-blue-600 dark:text-blue-400 outline-none shadow-sm"
                          value={levelForm.order === 0 ? "" : levelForm.order}
                          onChange={(e) =>
                            setLevelForm({
                              ...levelForm,
                              order: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    {/* INPUT DEADLINE */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                        Batas Waktu (Deadline)
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold outline-none text-gray-900 dark:text-white"
                        value={levelForm.deadline}
                        onChange={(e) =>
                          setLevelForm({
                            ...levelForm,
                            deadline: e.target.value,
                          })
                        }
                      />
                      <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-2 italic ml-1">Sistem akan mengirim email pengingat otomatis pada H-1 deadline.</p>
                    </div>

                    {/* INPUT PDF MODUL (OPSIONAL) */}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                        Modul Materi PDF (Opsional)
                      </label>
                      <div className="relative group cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf"
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setPdfFile(e.target.files[0]);
                            }
                          }}
                        />
                        <div className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 group-hover:border-blue-400 dark:group-hover:border-blue-500 flex items-center justify-center gap-3 transition-all">
                          <Upload size={18} className="text-gray-400 group-hover:text-blue-600" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600">
                            {pdfFile ? pdfFile.name : "Pilih File PDF"}
                          </span>
                        </div>
                      </div>
                      {pdfFile && (
                        <button 
                          type="button"
                          onClick={() => setPdfFile(null)}
                          className="mt-2 text-[8px] font-black text-red-500 uppercase tracking-widest hover:underline ml-1"
                        >
                          Hapus File
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                        Tipe Aktivitas
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: "video", label: "Video", icon: Play },
                          { id: "checklist", label: "Checklist", icon: Circle },
                          {
                            id: "assignment",
                            label: "Tugas YouTube",
                            icon: Upload,
                          },
                          { id: "quiz", label: "Kuis", icon: HelpCircle },
                        ].map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() =>
                              setLevelForm({
                                ...levelForm,
                                activity_type: type.id,
                              })
                            }
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-xs font-bold ${levelForm.activity_type === type.id ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                          >
                            <type.icon size={16} />
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {levelForm.activity_type === "video" && (
                      <div className="-2">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                          YouTube ID
                        </label>
                        <input
                          className="w-full p-4 bg-blue-50 dark:bg-gray-900 rounded-2xl border-2 border-blue-100 dark:border-gray-700 focus:border-blue-600 dark:focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                          value={levelForm.youtube_id}
                          onChange={(e) =>
                            setLevelForm({
                              ...levelForm,
                              youtube_id: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    {/* Checkbox Kirim Pengumuman */}
                    <div className="pt-4">
                      <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent hover:border-blue-100 dark:hover:border-blue-900 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded-lg border-gray-300 dark:border-gray-700 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:bg-gray-800"
                          checked={levelForm.sendAnnouncement}
                          onChange={(e) => setLevelForm({ ...levelForm, sendAnnouncement: e.target.checked })}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">Kirim Pengumuman Otomatis</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Beritahu mahasiswa semester {selectedCourse?.semester} via Dashboard.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black shadow-xl dark:shadow-none hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
                  >
                    Simpan Pertemuan
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {isDetailModalOpen &&
        selectedCourse &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-8 bg-gray-900/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative border border-white/20 dark:border-gray-700 pointer-events-auto transition-colors duration-300">
              <div className="p-6 bg-gray-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-900/50 dark:shadow-none rotate-3">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tight">
                      {selectedCourse.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-blue-400 dark:text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">
                        Struktur Kurikulum
                      </p>
                      <span className="text-gray-700 dark:text-gray-500">•</span>
                      <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        {selectedCourse.levels?.length || 0} PERTEMUAN TOTAL
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all hover:rotate-90"
                >
                  <X size={28} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 no-scrollbar flex-1">
                {selectedCourse.levels?.length > 0 ? (
                  [...selectedCourse.levels]
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((lvl: any) => (
                      <div
                        key={lvl.id}
                        className="group flex items-center justify-between p-8 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border border-transparent hover:border-blue-200 dark:hover:border-blue-900 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl dark:hover:shadow-none transition-all"
                      >
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center font-black text-xl text-blue-600 dark:text-blue-400 border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                            {lvl.order}
                          </div>
                          <div>
                            <h5 className="font-black text-gray-900 dark:text-white text-lg leading-tight mb-2">
                              {lvl.title}
                            </h5>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-[9px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-lg uppercase tracking-widest">
                                {lvl.activity_type}
                              </span>
                              <span className="text-[9px] font-black bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 px-3 py-1 rounded-lg uppercase tracking-widest">
                                +{lvl.xp_reward} XP
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => fetchMaterialStats(lvl.id)}
                            className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-blue-100 dark:border-gray-700"
                          >
                            <Activity size={14} /> STATS
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLevelId(lvl.id);
                              setLevelForm({
                                title: lvl.title,
                                description: lvl.description,
                                xp_reward: lvl.xp_reward,
                                activity_type: lvl.activity_type,
                                youtube_id: lvl.youtube_id || "",
                                order: lvl.order,
                                deadline: lvl.deadline ? lvl.deadline.substring(0, 16) : "",
                                sendAnnouncement: false, // Default false saat edit agar tidak spam
                              });
                              setIsEditLevelMode(true);
                              setIsLevelModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm border border-gray-100 dark:border-gray-700 font-black text-[10px] uppercase tracking-widest"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDelete({
                                isOpen: true,
                                type: 'level',
                                id: lvl.id,
                              });
                            }}
                            className="p-3 bg-white dark:bg-gray-800 text-red-400 dark:text-red-500 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all border border-gray-100 dark:border-gray-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <p className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest text-xs">
                      Belum ada pertemuan.
                    </p>
                  </div>
                )}
              </div>
              <div className="p-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-center shrink-0">
                <button
                  onClick={() => openAddLevelModal(selectedCourse)}
                  className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl dark:shadow-none hover:bg-blue-700 transition-all"
                >
                  TAMBAH PERTEMUAN BARU
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {isStatsModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 md:p-8 bg-gray-900/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative border border-white/20 dark:border-gray-700 pointer-events-auto transition-colors duration-300">
              <div className="p-8 bg-gray-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Statistik Penyelesaian</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Materi: {materialStats?.level?.title}</p>
                  </div>
                </div>
                <button onClick={() => setIsStatsModalOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                  <X size={20} />
                </button>
              </div>

              {statsLoading ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                   <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Memuat Statistik Materi...</p>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                    <div className="p-6 text-center">
                       <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total</p>
                       <p className="text-2xl font-black text-gray-900 dark:text-white">{materialStats?.stats?.total}</p>
                    </div>
                    <div className="p-6 text-center">
                       <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Selesai</p>
                       <p className="text-2xl font-black text-green-600 dark:text-green-400">{materialStats?.stats?.completed_count}</p>
                    </div>
                    <div className="p-6 text-center">
                       <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Tertunda</p>
                       <p className="text-2xl font-black text-red-600 dark:text-red-400">{materialStats?.stats?.pending_count}</p>
                    </div>
                  </div>

                  {/* List Students */}
                  <div className="p-8 space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Daftar Mahasiswa Belum Selesai ({materialStats?.stats?.pending_count})</h4>
                    <div className="space-y-3">
                      {materialStats?.pending_users?.map((st: any) => (
                        <div key={st.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 group hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg dark:hover:shadow-none transition-all">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden text-blue-600 dark:text-blue-400 font-bold">
                                {st.avatar ? <img src={st.avatar} className="h-full w-full object-cover" /> : st.name[0]}
                              </div>
                              <div>
                                <p className="text-xs font-black text-gray-900 dark:text-white uppercase">{st.name}</p>
                                <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">NIM: {st.nim}</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => handleNudge(st.id, materialStats.level.id)}
                             disabled={nudgingId === st.id}
                             className="p-2.5 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:shadow-md dark:hover:shadow-none transition-all border border-gray-100 dark:border-gray-700 disabled:opacity-50"
                             title="Kirim Email Pengingat"
                           >
                              {nudgingId === st.id ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                           </button>
                        </div>
                      ))}
                      {materialStats?.pending_users?.length === 0 && (
                        <div className="py-10 text-center">
                           <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                           <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Semua mahasiswa sudah selesai!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-center shrink-0">
                 <p className="text-[9px] text-gray-400 dark:text-gray-500 font-medium italic">Klik ikon lonceng untuk mengirim pengingat personal ke email mahasiswa.</p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
