import React, { useState, useEffect } from 'react';
import { X, Server, CheckCircle2, AlertCircle, Save, Info, Key, Mail } from 'lucide-react';
import { SmtpConfigStatus } from '../types';

interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailConfigModal: React.FC<EmailConfigModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<SmtpConfigStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [host, setHost] = useState('smtp.gmail.com');
  const [port, setPort] = useState('587');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data: SmtpConfigStatus = await res.json();
        setStatus(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setMessage(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/auth/configure-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host,
          port,
          user,
          pass,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update credentials.');

      setMessage('SMTP credentials updated! Verification emails will now be sent directly through this mailer.');
      fetchStatus();
    } catch (err: any) {
      setError(err?.message || 'Error configuring SMTP.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card max-w-md w-full rounded-2xl p-6 border border-slate-700/80 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Email Service Configuration</h3>
            <p className="text-xs text-slate-400">Manage real email OTP delivery gateway</p>
          </div>
        </div>

        {/* Current Gateway Status */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 mb-4 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Current Gateway:</span>
            <span className="font-semibold text-white">
              {status?.service || 'Checking...'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Real SMTP Active:</span>
            <span className={`inline-flex items-center gap-1 font-bold ${status?.smtpConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
              {status?.smtpConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Live SMTP Active
                </>
              ) : (
                <>
                  <Info className="w-3.5 h-3.5" />
                  Ethereal Test SMTP (Simulated Inbox)
                </>
              )}
            </span>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Gmail / Sender Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="email"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="e.g. yourlibrary@gmail.com"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Google App Password (16 chars)
            </label>
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Generated in Google Account → Security → 2-Step Verification → App passwords.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                SMTP Host
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Port
              </label>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !user || !pass}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Apply Live SMTP'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
