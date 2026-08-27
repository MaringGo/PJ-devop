import { useState, useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LogOut, Home, Wallet, PieChart, Settings, Menu, X,
  BarChart2, ChevronRight, User as UserIcon
} from 'lucide-react';
import MusicPlayer from './MusicPlayer';

const NAV_ITEMS = [
  { to: '/',                  icon: Home,      label: 'Dashboard',        group: 'main' },
  { to: '/transactions',      icon: Wallet,    label: 'รายการค่าใช้จ่าย', group: 'main' },
  { to: '/reports',           icon: BarChart2, label: 'รายงาน',           group: 'main' },
  { to: '/profile',           icon: UserIcon,  label: 'โปรไฟล์ของฉัน',    group: 'main' },
  { to: '/expense-types',     icon: Settings,  label: 'ประเภทค่าใช้จ่าย', group: 'master' },
  { to: '/budget-categories', icon: PieChart,  label: 'หมวดงบประมาณ',     group: 'master' },
];

const PAGE_TITLES = {
  '/':                  'Dashboard',
  '/transactions':      'รายการค่าใช้จ่าย',
  '/reports':           'รายงานย้อนหลัง / เปรียบเทียบ',
  '/profile':           'โปรไฟล์ผู้ใช้งาน',
  '/expense-types':     'ประเภทค่าใช้จ่าย',
  '/budget-categories': 'หมวดงบประมาณ',
};

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sideOpen, setSideOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const pageTitle = PAGE_TITLES[location.pathname] || 'e-Utilities';

  const avatarColor = user?.avatar_color || '#4f46e5';
  const getInitials = (name, username) => {
    if (name && name.trim().length > 0) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    return (username || 'U').substring(0, 2).toUpperCase();
  };

  const displayName = user?.full_name || user?.username || 'ผู้ใช้งาน';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-indigo-600">
        <h1 className="text-xl font-bold tracking-wide">e-Utilities</h1>
        <p className="text-indigo-300 text-xs mt-0.5">ระบบควบคุมและติดตามค่าสาธารณูปโภค</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <p className="px-3 mb-1 text-[10px] font-semibold text-indigo-300 uppercase tracking-widest">เมนูหลัก</p>
        {NAV_ITEMS.filter(n => n.group === 'main').map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to} to={to}
              onClick={() => setSideOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${active ? 'bg-white/20 text-white shadow-sm' : 'text-indigo-100 hover:bg-indigo-600/60'}`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-70" />}
            </Link>
          );
        })}

        <p className="px-3 mt-5 mb-1 text-[10px] font-semibold text-indigo-300 uppercase tracking-widest">ข้อมูลหลัก</p>
        {NAV_ITEMS.filter(n => n.group === 'master').map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to} to={to}
              onClick={() => setSideOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${active ? 'bg-white/20 text-white shadow-sm' : 'text-indigo-100 hover:bg-indigo-600/60'}`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-indigo-600">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-indigo-600/50 transition-colors">
          <Link
            to="/profile"
            onClick={() => setSideOpen(false)}
            className="flex items-center gap-2.5 flex-1 min-w-0"
            title="ดูโปรไฟล์"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0 text-white shadow-sm border border-white/20"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitials(user?.full_name, user?.username)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-snug">{displayName}</p>
              <p className="text-[11px] text-indigo-200 truncate">{user?.role || 'ผู้ใช้งาน'}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="ออกจากระบบ"
            className="p-1.5 bg-indigo-800/80 hover:bg-red-600 rounded-lg text-white transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* ── Desktop Sidebar (Fixed, does not scroll with page content) */}
      <aside className="hidden md:flex w-60 bg-indigo-700 text-white flex-col flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay Sidebar */}
      {sideOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={() => setSideOpen(false)} />
          {/* drawer */}
          <aside className="relative z-50 w-64 bg-indigo-700 text-white flex flex-col h-full shadow-xl">
            <button
              onClick={() => setSideOpen(false)}
              className="absolute top-3 right-3 p-1.5 text-indigo-200 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content (Scrolls independently) */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setSideOpen(true)}
          >
            <Menu size={22} />
          </button>

          <h2 className="text-base md:text-lg font-semibold text-gray-800 flex-1 truncate">{pageTitle}</h2>

          {/* Header User Pill / Shortcut to Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 border border-gray-200/80 transition-colors"
            title="ไปที่โปรไฟล์"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitials(user?.full_name, user?.username)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-none truncate max-w-[120px]">{displayName}</p>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{user?.department || 'สำนักงาน'}</p>
            </div>
          </Link>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>

        {/* Background Music Player Widget */}
        <MusicPlayer />
      </main>
    </div>
  );
};

export default Layout;
