import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Map as MapIcon, 
  Wallet as WalletIcon, 
  Lock, 
  ChevronDown,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../types';

interface Artist {
  id: string;
  name: string;
  team: string;
}

interface Tour {
  id: string;
  name: string;
  status: string;
}

const SidebarLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => cn(
      "flex items-center gap-3 px-6 py-3.5 transition-all duration-200 border-l-[3px]",
      isActive 
        ? "bg-[#1C212B] text-white border-[#2E66FF]" 
        : "text-[#94A3B8] hover:text-white hover:bg-[#1C212B]/50 border-transparent"
    )}
  >
    <Icon size={18} strokeWidth={1.5} />
    <span className="text-xs font-medium tracking-tight">{label}</span>
  </NavLink>
);

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    selectedArtistId, 
    setSelectedArtistId, 
    selectedTourId, 
    setSelectedTourId,
    proMode,
    setProMode,
    globalLoading
  } = useAppContext();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isArtistDropdownOpen, setIsArtistDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/artists')
      .then(res => res.json())
      .then(data => {
        setArtists(data);
        if (!selectedArtistId && data.length > 0) {
          setSelectedArtistId(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedArtistId) {
      fetch(`/api/artist/${selectedArtistId}/tours`)
        .then(res => res.json())
        .then(data => {
          setTours(data);
          if (!selectedTourId && data.length > 0) {
            setSelectedTourId(data[0].id);
          } else if (selectedTourId && !data.find((t: Tour) => t.id === selectedTourId)) {
            // If current tour doesn't belong to new artist, switch to first tour
            setSelectedTourId(data[0]?.id || null);
          }
        });
    }
  }, [selectedArtistId]);

  const getBreadcrumbs = () => {
    const artist = artists.find(a => a.id === selectedArtistId)?.name || 'Artist';
    const tour = tours.find(t => t.id === selectedTourId)?.name || 'Tour';
    const path = location.pathname.split('/').pop() || '';
    const view = path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
    
    return (
      <div className="flex items-center gap-2 text-[11px] font-medium text-[#94A3B8]">
        <span>{artist}</span>
        <span className="text-[#475569]">/</span>
        <span>{tour}</span>
        <span className="text-[#475569]">/</span>
        <span className="text-white">{view}</span>
      </div>
    );
  };

  const currentArtistName = artists.find(a => a.id === selectedArtistId)?.name || 'Select Artist';
  const currentTourName = tours.find(t => t.id === selectedTourId)?.name || 'Select Tour';

  return (
    <div className="flex min-h-screen bg-[#0A0C10] font-sans selection:bg-[#2E66FF]/20">
      {/* Global Progress Bar */}
      <AnimatePresence>
        {globalLoading && (
          <motion.div 
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 h-[2px] bg-[#2E66FF] z-[9999] origin-left"
          >
            <motion.div 
              className="h-full w-full bg-white/30"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-[260px] hidden md:flex fixed h-full bg-[#12151C] border-r border-[#242A35] flex-col z-50">
        {/* Logo Section */}
        <div className="p-6 border-b border-[#242A35]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-black tracking-tighter text-[#2E66FF]">GTI</span>
          </div>
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-[0.15em]">
            Global Touring Intelligence
          </p>
        </div>

        {/* Artist/Tour Selector */}
        <div className="p-4 border-b border-[#242A35] space-y-2">
          <div className="relative">
            <button 
              onClick={() => setIsArtistDropdownOpen(!isArtistDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-[#1C212B] border border-[#242A35] rounded-[4px] text-left group hover:border-[#3B4455] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-[#475569] uppercase tracking-widest mb-0.5">Artist</p>
                <p className="text-xs font-bold text-white truncate">{currentArtistName}</p>
              </div>
              <ChevronDown size={14} className={cn("text-[#475569] transition-transform", isArtistDropdownOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isArtistDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-[#1C212B] border border-[#242A35] rounded-[4px] shadow-2xl z-[60] overflow-hidden"
                >
                  {artists.map(artist => (
                    <button
                      key={artist.id}
                      onClick={() => {
                        setSelectedArtistId(artist.id);
                        setIsArtistDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-xs transition-colors hover:bg-[#242A35]",
                        selectedArtistId === artist.id ? "text-[#2E66FF] font-bold" : "text-[#94A3B8]"
                      )}
                    >
                      {artist.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <select 
              value={selectedTourId || ''}
              onChange={(e) => setSelectedTourId(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 bg-[#1C212B] border border-[#242A35] rounded-[4px] text-xs font-bold text-white outline-none focus:border-[#2E66FF] transition-colors cursor-pointer"
            >
              {tours.map(tour => (
                <option key={tour.id} value={tour.id}>{tour.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#475569]">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <SidebarLink to="/app/health" icon={Activity} label="Tour Health" />
          <SidebarLink to="/app/roadmap" icon={MapIcon} label="Roadmap" />
          <SidebarLink to="/app/wallet" icon={WalletIcon} label="Wallet" />
          <div className="mt-4 pt-4 border-t border-[#242A35]">
            <SidebarLink to="/app/admin" icon={Lock} label="Admin Portal" />
          </div>
        </nav>

        {/* Footer Info */}
        <div className="p-6 border-t border-[#242A35]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest font-mono">GTI V1.0</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen w-full">
        {/* Top Bar */}
        <header className="h-16 border-b border-[#242A35] bg-[#0A0C10]/80 backdrop-blur-md flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-white" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            {getBreadcrumbs()}
          </div>

          <div className="flex items-center gap-8">
            {/* Simple/Pro Toggle */}
            <div className="flex items-center gap-3 bg-[#12151C] p-1 rounded-md border border-[#242A35]">
              <button 
                onClick={() => setProMode(false)}
                className={cn(
                  "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                  !proMode ? "bg-[#2E66FF] text-white" : "text-[#475569] hover:text-[#94A3B8]"
                )}
              >
                Simple
              </button>
              <button 
                onClick={() => setProMode(true)}
                className={cn(
                  "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                  proMode ? "bg-[#2E66FF] text-white" : "text-[#475569] hover:text-[#94A3B8]"
                )}
              >
                Pro
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <p className="text-[10px] font-mono text-[#475569] uppercase tracking-widest">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </p>
              <div className="w-8 h-8 rounded-full bg-[#1C212B] border border-[#242A35] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors cursor-pointer">
                <Plus size={16} />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 md:p-10 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0A0C10]/95 flex flex-col md:hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-[#242A35]">
              <span className="text-2xl font-black tracking-tighter text-[#2E66FF]">GTI</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <SidebarLink to="/app/health" icon={Activity} label="Tour Health" />
              <SidebarLink to="/app/roadmap" icon={MapIcon} label="Roadmap" />
              <SidebarLink to="/app/wallet" icon={WalletIcon} label="Wallet" />
              <SidebarLink to="/app/admin" icon={Lock} label="Admin Portal" />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
