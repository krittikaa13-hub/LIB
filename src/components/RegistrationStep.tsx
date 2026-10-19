import React, { useState } from 'react';
import { SmartLibLogo } from './SmartLibLogo';
import { Hash, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { SendOtpResponse } from '../types';

interface RegistrationStepProps {
  initialRegNo?: string;
  initialGmail?: string;
  onOtpSent: (data: {
    registrationNumber: string;
    gmail: string;
    response: SendOtpResponse;
  }) => void;
  onSwitchToAdminLogin?: () => void;
}

export const RegistrationStep: React.FC<RegistrationStepProps> = ({
  initialRegNo = '',
  initialGmail = '',
  onOtpSent,
  onSwitchToAdminLogin,
}) => {
  const [registrationNumber, setRegistrationNumber] = useState(initialRegNo);
  const [gmail, setGmail] = useState(initialGmail);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanReg = registrationNumber.trim().toUpperCase();
    const cleanMail = gmail.trim().toLowerCase();

    // Client-side validation
    if (!cleanReg) {
      setErrorMessage('Please enter your Student Registration Number.');
      return;
    }
    if (cleanReg.length < 4 || cleanReg.length > 25) {
      setErrorMessage('Student Registration Number should be between 4 and 25 characters.');
      return;
    }

    if (!cleanMail) {
      setErrorMessage('Please enter your Gmail address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanMail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!cleanMail.endsWith('@gmail.com') && !cleanMail.endsWith('.edu') && !cleanMail.endsWith('.edu.in') && !cleanMail.includes('alliance.edu')) {
      setErrorMessage('Please use your personal @gmail.com or authorized Alliance University email.');
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          registrationNumber: cleanReg,
          gmail: cleanMail,
        }),
      });
      clearTimeout(timeoutId);

      const data: SendOtpResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      // Transition to OTP verification step
      onOtpSent({
        registrationNumber: cleanReg,
        gmail: cleanMail,
        response: data,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setErrorMessage('Server connection timed out. Please try again or check Email Gateway config.');
      } else {
        setErrorMessage(err?.message || 'Network error occurred. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto">
      {/* Dark Glass Card */}
      <div className="glass-card rounded-[28px] p-7 sm:p-9 shadow-2xl relative overflow-hidden transition-all duration-300">
        {/* Subtle top amber highlight glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

        {/* Card Header */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-3">
            <SmartLibLogo size="md" />
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight">
            Welcome to SmartLib
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
            Your University Library, Reimagined
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Registration & Gmail Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: Registration Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <label
                htmlFor="regNumber"
                className="text-[11px] font-bold tracking-wider text-slate-300 uppercase"
              >
                STUDENT REGISTRATION NUMBER
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Required
              </span>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-amber-400/90 font-bold select-none flex items-center pointer-events-none">
                <Hash className="w-4 h-4 text-amber-400" />
              </div>
              <input
                id="regNumber"
                type="text"
                autoComplete="off"
                disabled={loading}
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                placeholder="Enter your registration number"
                className="w-full glass-input rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 font-medium focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wide"
              />
            </div>
          </div>

          {/* Field 2: Gmail ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <label
                htmlFor="gmailInput"
                className="text-[11px] font-bold tracking-wider text-slate-300 uppercase"
              >
                STUDENT GMAIL ID
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Required
              </span>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-amber-400/90 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-amber-400" />
              </div>
              <input
                id="gmailInput"
                type="email"
                autoComplete="email"
                disabled={loading}
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                placeholder="Enter your Gmail address"
                className="w-full glass-input rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 font-medium focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 px-0.5">
              A 6-digit OTP will be delivered to this address for real-time authentication.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Continue to Verification</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Card Footer */}
        <div className="mt-7 pt-4 border-t border-slate-800/80 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400/90" />
            <span>Interactive Student Portal · SSL Encrypted</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            SmartLib Prototype | Alliance University
          </div>

          {onSwitchToAdminLogin && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onSwitchToAdminLogin}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400/90 hover:text-amber-300 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-900/60"
              >
                <span>Demo Admin / Librarian Console</span>
                <ArrowRight className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
