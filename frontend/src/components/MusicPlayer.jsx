import { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Music, SkipForward, 
  GripVertical, Plus, Trash2, X, ListMusic, Check
} from 'lucide-react';

const DEFAULT_PLAYLIST = [
  {
    id: '1',
    title: 'Cozy Lo-Fi Study',
    genre: 'Lo-Fi Chill',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
  },
  {
    id: '2',
    title: 'Acoustic Breeze',
    genre: 'Chill Acoustic',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=acoustic-guitars-ambient-uplifting-10903.mp3'
  },
  {
    id: '3',
    title: 'Coffee Shop Vibes',
    genre: 'Lo-Fi Jazz',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=lofi-chill-medium-version-124479.mp3'
  },
  {
    id: '4',
    title: 'Corporate Inspiration',
    genre: 'Ambient Soft',
    url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_907d727b16.mp3?filename=corporate-ambient-11881.mp3'
  }
];

const MusicPlayer = () => {
  // Load playlist from localStorage or fallback to defaults
  const [playlist, setPlaylist] = useState(() => {
    try {
      const saved = localStorage.getItem('e_utilities_playlist');
      return saved ? JSON.parse(saved) : DEFAULT_PLAYLIST;
    } catch {
      return DEFAULT_PLAYLIST;
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.35);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New track form state
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Position state (Locked to the right side, slide along Y axis)
  const [topPos, setTopPos] = useState(() => window.innerHeight - 80);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseY: 0, posTop: 0 });

  const audioRef = useRef(null);
  const currentTrack = playlist[currentTrackIndex] || playlist[0] || { title: 'ไม่มีเพลง', genre: '-', url: '' };

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('e_utilities_playlist', JSON.stringify(playlist));
    } catch (e) {
      console.error(e);
    }
  }, [playlist]);

  // Adjust on window resize
  useEffect(() => {
    const handleResize = () => {
      setTopPos(prev => Math.max(70, Math.min(window.innerHeight - 80, prev)));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && currentTrack.url) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log('Autoplay blocked:', err));
      }
    }
  }, [currentTrackIndex, currentTrack.url]);

  // Vertical dragging logic (Locked strictly to right edge)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = {
      mouseY: e.clientY,
      posTop: topPos
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      const newTop = Math.max(70, Math.min(window.innerHeight - 80, dragStartRef.current.posTop + deltaY));
      setTopPos(newTop);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack.url) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.log('Play error:', err));
    }
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Add custom track
  const handleAddTrack = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newSong = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      genre: newGenre.trim() || 'กำหนดเอง',
      url: newUrl.trim()
    };

    const updated = [...playlist, newSong];
    setPlaylist(updated);
    setNewTitle('');
    setNewGenre('');
    setNewUrl('');
    setShowAddModal(false);

    // Auto switch to newly added song
    setCurrentTrackIndex(updated.length - 1);
    setIsPlaying(true);
  };

  // Delete track
  const handleDeleteTrack = (indexToDelete, e) => {
    e.stopPropagation();
    if (playlist.length <= 1) {
      alert('ต้องมีเพลงในเพลย์ลิสต์อย่างน้อย 1 เพลงครับ');
      return;
    }

    const updated = playlist.filter((_, idx) => idx !== indexToDelete);
    setPlaylist(updated);

    if (indexToDelete === currentTrackIndex) {
      setCurrentTrackIndex(0);
      setIsPlaying(false);
    } else if (indexToDelete < currentTrackIndex) {
      setCurrentTrackIndex(prev => prev - 1);
    }
  };

  return (
    <div 
      style={{ top: `${topPos}px` }}
      className={`fixed right-5 z-50 flex items-end flex-col select-none transition-[top] duration-75 ${
        isDragging ? 'cursor-grabbing opacity-90 scale-105 transition-none' : ''
      }`}
    >
      <audio
        ref={audioRef}
        src={currentTrack.url}
        loop={false}
        onEnded={nextTrack}
      />

      {/* Main draggable player pill */}
      <div 
        className={`flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-indigo-100 transition-all ${
          isExpanded ? 'ring-2 ring-indigo-500/20' : ''
        }`}
      >
        {/* Drag handle */}
        <div 
          onMouseDown={handleMouseDown}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-indigo-600 p-0.5"
          title="คลิกค้างแล้วลากเพื่อย้ายตำแหน่ง"
        >
          <GripVertical size={16} />
        </div>

        {/* Music Equalizer / Icon */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none"
          title="คลิกเพื่อจัดการเพลย์ลิสต์/ปรับเสียง"
        >
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-4 w-4">
              <span className="w-1 bg-indigo-600 rounded-full animate-[bounce_1s_infinite_100ms] h-full" />
              <span className="w-1 bg-indigo-500 rounded-full animate-[bounce_1s_infinite_300ms] h-2/3" />
              <span className="w-1 bg-indigo-600 rounded-full animate-[bounce_1s_infinite_200ms] h-4/5" />
            </div>
          ) : (
            <Music size={16} className="text-gray-400" />
          )}
        </button>

        {/* Track Title Info */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer max-w-[110px] md:max-w-[150px]"
        >
          <p className="text-xs font-semibold text-gray-800 truncate leading-tight">
            {currentTrack.title}
          </p>
          <p className="text-[10px] text-indigo-500 font-medium truncate leading-tight">
            {currentTrack.genre}
          </p>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-transform active:scale-95 shadow-sm"
          title={isPlaying ? 'หยุดเพลง' : 'เล่นเพลง'}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
        </button>

        {/* Next Track Button */}
        <button
          onClick={nextTrack}
          className="text-gray-400 hover:text-indigo-600 p-1 transition-colors"
          title="เพลงถัดไป"
        >
          <SkipForward size={15} />
        </button>
      </div>

      {/* Expanded Controls Popover */}
      {isExpanded && (
        <div className="mt-2 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-100 w-72 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          {/* Volume control */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">ระดับเสียง</span>
            <button 
              onClick={toggleMute}
              className="text-gray-500 hover:text-indigo-600 p-1"
            >
              {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />

          {/* Playlist section */}
          <div className="border-t border-gray-100 pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <ListMusic size={13} /> รายการเพลง ({playlist.length})
              </span>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-[11px] flex items-center gap-0.5 text-indigo-600 hover:text-indigo-700 font-medium px-2 py-0.5 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <Plus size={12} /> เพิ่มเพลง
              </button>
            </div>

            {/* Songs list */}
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {playlist.map((t, idx) => (
                <div
                  key={t.id || idx}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`group w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentTrackIndex === idx
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="truncate flex-1 mr-2">
                    <p className="truncate text-xs">{t.title}</p>
                    <p className="text-[9px] text-gray-400">{t.genre}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {currentTrackIndex === idx && isPlaying && (
                      <span className="text-[10px] text-indigo-600 font-bold mr-1">เล่นอยู่</span>
                    )}
                    <button
                      onClick={(e) => handleDeleteTrack(idx, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 transition-opacity"
                      title="ลบเพลงนี้"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add New Song Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 shadow-2xl border border-gray-100 w-full max-w-sm space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
                <Plus size={16} className="text-indigo-600" /> เพิ่มเพลงใหม่เข้าระบบ
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTrack} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อเพลง *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เพลงโปรดของฉัน"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">แนวเพลง / ศิลปิน</label>
                <input
                  type="text"
                  placeholder="เช่น Lo-Fi, Acoustic, Jazz"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">ลิงก์ไฟล์เสียง (Direct URL .mp3 / audio) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/song.mp3"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <p className="text-[10px] text-gray-400 mt-1">รองรับลิงก์ไฟล์เสียง .mp3 หรือสตรีมมิ่งออนไลน์</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Check size={14} /> บันทึกเพลง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
