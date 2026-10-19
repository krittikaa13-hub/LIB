import React from 'react';
import { SmartLibLogo } from './SmartLibLogo';
import { StudentSession } from '../types';
import {
  LogOut,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Calendar,
  Building2,
  Clock,
} from 'lucide-react';

interface MainPagePlaceholderProps {
  student: StudentSession;
  onSignOut: () => void;
}

export const MainPagePlaceholder: React.FC<MainPagePlaceholderProps> = ({
  student,
  onSignOut,
}) => {
  const formattedAuthTime = new Date(student.authenticatedAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 relative z-10">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SmartLibLogo size="sm" />
            <div className="hidden sm:block h-4 w-[1px] bg-slate-700" />
            <span className="hidden sm:inline text-xs text-slate-400 font-medium">
              Central Library Portal
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-full text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono font-bold text-amber-400">
                {student.registrationNumber}
              </span>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-slate-300 hidden sm:inline">
                {student.gmail}
              </span>
            </div>

            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center">
        {/* Placeholder Main Card */}
        <div className="w-full glass-card rounded-[28px] p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center max-w-2xl border border-slate-700/70">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Success Check Badge */}
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <CheckCircle2 className="w-9 h-9 text-amber-400" />
          </div>

          <span className="inline-flex items-center gap-1.5 bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Authentication Successful
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to SmartLib
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Your identity has been verified via OTP. You have secured student access to the Alliance University Central Library system.
          </p>

          {/* Student Identity Card */}
          <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-left grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 mt-0.5">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Registration Number
                </div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {student.registrationNumber}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Institution
                </div>
                <div className="text-sm font-semibold text-white mt-0.5">
                  {student.institution}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Authenticated Gmail
                </div>
                <div className="text-sm font-medium text-slate-200 mt-0.5 truncate">
                  {student.gmail}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Session Logged At
                </div>
                <div className="text-sm font-medium text-slate-200 mt-0.5">
                  {formattedAuthTime}
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder Notice */}
          <div className="mt-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-amber-400/90">Main Page Placeholder:</span>{' '}
            Authentication flow is fully operational. Library catalog, digital book borrowing, study space reservation, and reading history features will be integrated here in upcoming phases as per requirements.
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onSignOut}
              className="py-2.5 px-6 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 transition shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Sign Out & Return to Login
            </button>
          </div>
        </div>
      </main>

      {/* Footer Pill */}
      <footer className="py-6 flex justify-center">
        <div className="bg-slate-950/70 border border-slate-800/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] sm:text-xs text-slate-400 shadow-lg text-center">
          Alliance University Central Library · Bengaluru, Karnataka ·{' '}
          <span className="text-amber-400 font-semibold">
            Authorized Student Access Only
          </span>
        </div>
      </footer>
    </div>
  );
};
