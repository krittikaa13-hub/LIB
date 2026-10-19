import React, { useState } from 'react';
import {
  BookOpen,
  LayoutDashboard,
  Compass,
  Trophy,
  Bookmark,
  BarChart3,
  Bell,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { StudentProfile, NotificationItem } from '../../types/library';

export type LibraryViewTab =
  | 'dashboard'
  | 'catalog'
  | 'floormap'
  | 'quest'
  | 'reservations';

interface LibraryNavbarProps {
  activeTab: LibraryViewTab;
  onTabChange: (tab: LibraryViewTab) => void;
  student: StudentProfile;
  onSignOut: () => void;
  onMarkNotificationRead: (id: string) => void;
}

export const LibraryNavbar: React.FC<LibraryNavbarProps> = ({
  activeTab,
  onTabChange,
  student,
  onSignOut,
  onMarkNotificationRead,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = student.notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0B1528] border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition">
              AU
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-tight">SmartLib</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded">
                  Portal
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                Alliance University Central Library
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Syllabus Catalog</span>
          </button>

          <button
            onClick={() => onTabChange('floormap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'floormap'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Floor & Shelf Map</span>
          </button>

          <button
            onClick={() => onTabChange('quest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'quest'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Library Quest</span>
          </button>

          <button
            onClick={() => onTabChange('reservations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'reservations'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Reservations</span>
            {student.activeReservations.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {student.activeReservations.length}
              </span>
            )}
          </button>

        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Notifications Dropdown Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Flyout Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      SmartRestock & Library Alerts
                    </span>
                  </div>
                  <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                    {student.notifications.length} Total
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto text-xs">
                  {student.notifications.length > 0 ? (
                    student.notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-3.5 transition cursor-pointer hover:bg-slate-50 ${
                          !n.read ? 'bg-blue-50/50' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            {n.type === 'AVAILABILITY' || n.type === 'RESTOCK' ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            ) : n.type === 'DEADLINE' ? (
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                            )}
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400">
                      No notifications yet
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Close Panel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Student Profile Identity */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono font-bold text-amber-400">
              {student.registrationNumber}
            </span>
          </div>

          {/* Sign Out */}
          <button
            onClick={onSignOut}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Tabs Strip */}
      <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/90 px-3 py-1.5 flex items-center justify-around overflow-x-auto text-[11px]">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`px-2 py-1 rounded font-semibold ${
            activeTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onTabChange('catalog')}
          className={`px-2 py-1 rounded font-semibold ${
            activeTab === 'catalog' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          Catalog
        </button>
        <button
          onClick={() => onTabChange('floormap')}
          className={`px-2 py-1 rounded font-semibold ${
            activeTab === 'floormap' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => onTabChange('quest')}
          className={`px-2 py-1 rounded font-semibold ${
            activeTab === 'quest' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          Quest
        </button>
        <button
          onClick={() => onTabChange('reservations')}
          className={`px-2 py-1 rounded font-semibold ${
            activeTab === 'reservations' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          Holds ({student.activeReservations.length})
        </button>
      </div>
    </header>
  );
};
