import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Trophy, Medal, Award, Crown, Loader2, AlertCircle, Hash } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LeaderboardEntry {
  id: number;
  name: string;
  nim?: string; // Menampilkan NIM agar valid untuk skripsi UM
  points: number;
  level: number;
  avatar?: string;
  bio?: string;
}

export function Leaderboard() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/leaderboard?filter=${filter}&semester=${semesterFilter}`);
        // Pastikan mengambil data dari response.data.data jika menggunakan API Resource Laravel
        const data = response.data.data || response.data;
        setRankings(data);
        setError(null);
      } catch (err) {
        console.error("Gagal mengambil data peringkat", err);
        setError("Gagal memuat peringkat. Pastikan server backend berjalan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, [filter, semesterFilter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-10 w-10 text-yellow-500 drop-shadow-md" />;
      case 2: return <Medal className="h-8 w-8 text-gray-400" />;
      case 3: return <Award className="h-8 w-8 text-amber-600" />;
      default: return <span className="font-black text-gray-300">#{rank}</span>;
    }
  };

  const getPodiumStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-b from-yellow-50 to-white border-yellow-200 shadow-yellow-100 scale-110 z-10';
      case 2: return 'bg-gradient-to-b from-gray-50 to-white border-gray-200';
      case 3: return 'bg-gradient-to-b from-amber-50 to-white border-amber-200';
      default: return 'bg-white border-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Menyusun Papan Peringkat PJKR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-[2.5rem] border border-red-100 flex flex-col items-center max-w-lg mx-auto mt-10">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="font-black uppercase tracking-tight text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-8 bg-white rounded-xl border border-1">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Leaderboard <Trophy className="h-10 w-10 text-yellow-500" />
          </h1>
          <p className="mt-2 text-gray-500 font-medium italic">Siapa mahasiswa PJKR dengan poin XP tertinggi hari ini?</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Semester Filter - Hanya muncul untuk Admin/Dosen */}
          {(user?.role === 'admin' || user?.role === 'dosen') && (
            <div className="flex bg-gray-100/80 p-1.5 rounded-2xl overflow-x-auto max-w-full md:max-w-none no-scrollbar border border-gray-100 shadow-inner">
              {['all', '1', '2', '3', '4', '5', '6', '7', '8'].map(sem => (
                <button
                  key={`sem-${sem}`}
                  onClick={() => setSemesterFilter(sem)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all whitespace-nowrap ${semesterFilter === sem ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {sem === 'all' ? 'SEMUA' : `S${sem}`}
                </button>
              ))}
            </div>
          )}

          {/* Time Filter */}
          <div className="flex bg-gray-100/80 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
            {['all', 'weekly', 'monthly'].map((opt) => (
              <button
                key={`filter-${opt}`}
                onClick={() => setFilter(opt as any)}
                className={`px-5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${filter === opt ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {opt === 'all' ? 'SEMUA' : opt === 'weekly' ? 'MINGGU' : 'BULAN'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PODIUM TOP 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-12 max-w-5xl mx-auto">
        {rankings.slice(0, 3).map((entry, index) => {
          const rank = index + 1;
          const isMe = user?.id === entry.id;
          return (
            <div
              key={`podium-card-${entry.id}`}
              className={`relative p-6 rounded-[2.5rem] border-2 text-center shadow-xl transition-all hover:-translate-y-2 ${getPodiumStyle(rank)} ${rank === 1 ? 'md:order-2' : rank === 2 ? 'md:order-1' : rank === 3 ? 'md:order-3' : ''
                }`}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">{getRankIcon(rank)}</div>

              <div className="h-24 w-24 mx-auto bg-white rounded-3xl flex items-center justify-center border-4 border-white shadow-xl overflow-hidden mb-6 group">
                <div className="h-full w-full bg-blue-50 flex items-center justify-center font-black text-3xl text-blue-600 group-hover:scale-110 transition-transform">
                  {entry.avatar ? (
                    <img src={entry.avatar} alt={entry.name} className="h-full w-full object-cover" />
                  ) : (
                    entry.name.substring(0, 2).toUpperCase()
                  )}
                </div>
              </div>

              <h3 className="font-black text-xl text-gray-900 truncate mb-1">{entry.name}</h3>
              
              {entry.bio && (
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-3 line-clamp-1 italic px-2">
                  "{entry.bio}"
                </p>
              )}

              <div className="flex items-center justify-center gap-1.5 mb-4">
                <Hash className="h-3 w-3 text-gray-300" />
                <span className="text-[10px] font-black text-gray-400 tracking-widest">{entry.nim || 'NIM MAHASISWA'}</span>
              </div>

              <p className="text-blue-600 font-black text-4xl mt-2 tracking-tighter">
                {entry.points.toLocaleString()}
                <span className="text-xs text-blue-400 ml-1">XP</span>
              </p>

              {isMe && <span className="mt-4 inline-block bg-blue-600 text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest">Peringkat Anda</span>}
            </div>
          );
        })}
      </div>

      {/* FULL RANKINGS LIST */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden max-w-5xl mx-auto">
        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Peringkat Seluruh Mahasiswa</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {rankings.length > 0 ? (
            rankings.map((entry, index) => {
              const rank = index + 1;
              const isMe = user?.id === entry.id;
              return (
                <div
                  key={`list-item-${entry.id}`}
                  className={`flex items-center p-6 gap-6 transition-all ${isMe ? 'bg-blue-50/50 border-l-8 border-blue-600' : 'hover:bg-gray-50/80'
                    }`}
                >
                  <div className="w-12 text-center flex justify-center">
                    {rank <= 3 ? getRankIcon(rank) : <span className="font-black text-gray-300 text-lg">#{rank}</span>}
                  </div>

                  <div className="h-14 w-14 rounded-2xl bg-gray-100 flex-shrink-0 flex items-center justify-center font-black text-gray-400 uppercase text-xl border-2 border-white shadow-sm overflow-hidden">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt={entry.name} className="h-full w-full object-cover" />
                    ) : (
                      entry.name[0]
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-gray-900 text-lg leading-tight flex items-center gap-3">
                      {entry.name}
                      {isMe && <span className="bg-blue-600 text-white text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest">Me</span>}
                    </h4>
                    
                    {entry.bio && (
                      <p className="text-[10px] font-bold text-blue-600/70 italic line-clamp-1 mt-0.5">
                        "{entry.bio}"
                      </p>
                    )}

                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Level {entry.level} • NIM {entry.nim || '-'}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-blue-600 text-xl tracking-tighter">
                      {entry.points.toLocaleString()}
                      <span className="text-[10px] text-gray-400 ml-1 uppercase">XP</span>
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center">
              <Trophy className="h-16 w-16 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Belum ada data kompetisi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
