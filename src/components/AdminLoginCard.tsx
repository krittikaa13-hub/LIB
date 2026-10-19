import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
} from 'lucide-react';
import { AdminSession } from '../types/library';

interface AdminLoginCardProps {
  onAdminLoginSuccess: (session: AdminSession) => void;
  onBackToStudentLogin: () => void;
}

export const AdminLoginCard: React.FC<AdminLoginCardProps> = ({
  onAdminLoginSuccess,
  onBackToStudentLogin,
}) => {
  const [username, setUsername] = useState('admin@alliance.edu.in');
  const [password, setPassword] = useState('SmartLibAdmin2026!');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check administrator credentials.');
      }

      const adminSession: AdminSession = {
        token: data.token,
        username: data.admin.username,
        name: data.admin.name,
        role: 'ADMIN',
        loginAt: new Date().toISOString(),
        isDemo: true,
      };

      sessionStorage.setItem('smartlib_admin_session', JSON.stringify(adminSession));
      onAdminLoginSuccess(adminSession);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to administrator authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('admin@alliance.edu.in');
    setPassword('SmartLibAdmin2026!');
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-[440px] mx-auto animate-in fade-in duration-300">
      <div className="glass-card rounded-[28px] p-7 sm:p-9 shadow-2xl relative overflow-hidden transition-all duration-300 border border-slate-700/80">
        {/* Top gold/indigo highlight glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-80" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            Librarian Console Access · Demo Mode
          </div>
          <h2 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight">
            Administrator Sign In
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
            Authorized library staff console for catalogue, inventory, waiting list management, and SmartRestock controls.
          </p>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="mb-5 p-3 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Evaluation Demo Credentials
            </span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
            >
              Fill Demo Login
            </button>
          </div>
          <div className="font-mono text-[11px] text-slate-300 divide-y divide-slate-800">
            <div className="py-0.5">User: <strong className="text-white">admin@alliance.edu.in</strong></div>
            <div className="py-0.5">Pass: <strong className="text-white">SmartLibAdmin2026!</strong></div>
          </div>
          <p className="text-[10px] text-slate-400 pt-0.5">
            Configured in backend server-side environment variables (`ADMIN_USERNAME` & `ADMIN_PASSWORD`).
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Admin Username / Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@alliance.edu.in"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-95 transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
          >
            {loading ? (
              <span>Verifying Admin Credentials...</span>
            ) : (
              <>
                <span>Enter Librarian Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to Student Portal */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onBackToStudentLogin}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Student Gmail OTP Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
