import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Youtube, Star, Send, Loader2, MessageSquare, 
  Award, CheckCircle2, User, BookOpen 
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'sonner';

interface GradingModalProps {
  submission: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GradingModal({ submission, isOpen, onClose, onSuccess }: GradingModalProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [earnedPoints, setEarnedPoints] = useState(submission?.level?.xp_reward || 100);
  
  // Dynamic Rubric State
  const [rubric, setRubric] = useState<Record<string, number>>({});

  useEffect(() => {
    if (submission) {
      setFeedback("");
      setEarnedPoints(submission.level?.xp_reward || 100);
      
      // Initialize dynamic rubric scores
      const criteria = submission.level?.rubric;
      if (criteria && Array.isArray(criteria) && criteria.length > 0) {
        const initialRubric: Record<string, number> = {};
        criteria.forEach((crit: any) => {
          initialRubric[crit.key] = crit.max_score || 5;
        });
        setRubric(initialRubric);
      } else {
        // Fallback standard PJKR
        setRubric({
          prep: 5,
          exec: 5,
          follow: 5
        });
      }
    }
  }, [submission]);

  if (!isOpen || !submission) return null;

  // Helper untuk mengekstrak ID dari berbagai format link YouTube
  const getYouTubeID = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const getCriteriaList = () => {
    const customCriteria = submission?.level?.rubric;
    if (customCriteria && Array.isArray(customCriteria) && customCriteria.length > 0) {
      return customCriteria.map((crit: any) => ({
        key: crit.key,
        label: crit.label,
        desc: `Nilai maksimal: ${crit.max_score}`,
        max: crit.max_score || 5
      }));
    }
    // Fallback standard PJKR
    return [
      { key: 'prep', label: 'Tahap Awalan', desc: 'Posisi awal & kesiapan', max: 5 },
      { key: 'exec', label: 'Tahap Pelaksanaan', desc: 'Kebenaran teknik gerakan', max: 5 },
      { key: 'follow', label: 'Tahap Akhiran', desc: 'Keseimbangan & posisi akhir', max: 5 }
    ];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Kita gabungkan nilai rubrik ke dalam feedback sebagai format JSON tersembunyi
      // agar backend tidak perlu migrasi kolom baru, namun data tersimpan.
      const formattedFeedback = `RUBRIC_DATA:${JSON.stringify(rubric)}|FEEDBACK:${feedback}`;
      
      await
      api.post(`/dosen/assignments/${submission.id}/grade`, {
        earned_points: earnedPoints,
        feedback: formattedFeedback
      });

      toast.success("Penilaian berhasil disimpan!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Gagal menyimpan penilaian");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 bg-gray-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="px-8 py-6 bg-gray-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Youtube size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Panel Penilaian Video</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">PJKR UM Monitoring System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 flex flex-col lg:flex-row">
          {/* LEFT: VIDEO PLAYER */}
          <div className="lg:w-3/5 p-8 space-y-6">
            <div className="bg-black aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYouTubeID(submission.assignment_link)}?modestbranding=1&rel=0`}
                title="Tugas Mahasiswa"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100">
                    {submission.user?.avatar ? <img src={submission.user.avatar} className="h-full w-full object-cover" /> : <User className="text-blue-600" />}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 uppercase text-lg">{submission.user?.name}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">NIM: {submission.user?.nim}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                    Semester {submission.user?.semester}
                  </span>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-50">
                 <div className="flex items-center gap-2 text-blue-600 mb-2">
                   <BookOpen size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Materi Pertemuan</span>
                 </div>
                 <p className="text-lg font-black text-gray-900">{submission.level?.title}</p>
                 <p className="text-xs text-gray-500 font-medium italic mt-2">"{submission.level?.description}"</p>
              </div>
            </div>
          </div>

          {/* RIGHT: GRADING FORM */}
          <div className="lg:w-2/5 p-8 lg:border-l border-gray-100 bg-white">
            <form onSubmit={handleSubmit} className="h-full flex flex-col space-y-6">
              {/* RUBRIC SECTION */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" /> Penilaian Rubrik
                </h4>
                
                {getCriteriaList().map((item) => {
                  const currentScore = rubric[item.key] !== undefined ? rubric[item.key] : item.max;
                  const scoresRange = Array.from({ length: item.max }, (_, i) => i + 1);

                  return (
                    <div key={item.key} className="space-y-2.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black text-gray-900 uppercase">{item.label}</p>
                          <p className="text-[8px] text-gray-400 font-medium">{item.desc}</p>
                        </div>
                        <span className="text-lg font-black text-blue-600">
                          {currentScore}
                          <span className="text-xs text-gray-400 font-medium">/{item.max}</span>
                        </span>
                      </div>
                      
                      {item.max <= 10 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {scoresRange.map(score => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => setRubric({...rubric, [item.key]: score})}
                              className={`p-2 rounded-lg transition-all border flex items-center justify-center ${
                                currentScore === score 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                : 'bg-white text-gray-400 border-gray-100 hover:border-blue-200'
                              }`}
                              style={{ minWidth: '2.5rem' }}
                            >
                              <Star size={12} className={score <= currentScore ? 'fill-current text-yellow-400' : ''} />
                              {item.max > 5 && <span className="text-[9px] ml-1 font-bold">{score}</span>}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="1"
                            max={item.max}
                            value={currentScore}
                            onChange={(e) => setRubric({...rubric, [item.key]: parseInt(e.target.value)})}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <input
                            type="number"
                            min="1"
                            max={item.max}
                            value={currentScore}
                            onChange={(e) => {
                              const val = Math.min(item.max, Math.max(1, parseInt(e.target.value) || 1));
                              setRubric({...rubric, [item.key]: val});
                            }}
                            className="w-16 p-1 text-center font-black border rounded-lg bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* XP & FEEDBACK */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Beri Poin XP</label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                    <input 
                      type="number"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-orange-50 rounded-xl border-2 border-transparent focus:border-orange-500 outline-none font-black text-orange-700 text-lg"
                      value={earnedPoints}
                      onChange={(e) => setEarnedPoints(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Catatan Evaluasi</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-3 text-gray-300" size={18} />
                    <textarea 
                      placeholder="Umpan balik gerakan..."
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs text-gray-700 h-24 resize-none shadow-inner"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                  SIMPAN & KIRIM XP
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
