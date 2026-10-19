import React, { useState, useEffect, useRef } from 'react';
import { SmartLibLogo } from './SmartLibLogo';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCw,
  ExternalLink,
  KeyRound,
  Loader2,
} from 'lucide-react';
import { SendOtpResponse, VerifyOtpResponse, StudentSession } from '../types';

interface OtpVerificationStepProps {
  registrationNumber: string;
  gmail: string;
  initialResponse: SendOtpResponse;
  onVerificationSuccess: (student: StudentSession) => void;
  onBackToRegistration: () => void;
}

export const OtpVerificationStep: React.FC<OtpVerificationStepProps> = ({
  registrationNumber,
  gmail,
  initialResponse,
  onVerificationSuccess,
  onBackToRegistration,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    initialResponse.message || 'Verification code dispatched to your Gmail.'
  );
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialResponse.previewUrl
  );
  const [directCode, setDirectCode] = useState<string | undefined>(
    initialResponse.directCode
  );

  // Expiry countdown (5 minutes from generation)
  const [expiresAt, setExpiresAt] = useState<number>(
    initialResponse.expiresAt || Date.now() + 5 * 60 * 1000
  );
  const [timeLeft, setTimeLeft] = useState<number>(300);

  // Resend cooldown countdown (60 seconds)
  const [cooldown, setCooldown] = useState<number>(
    initialResponse.cooldownSeconds || 60
  );

  // Attempt tracker
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(5);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer loop for expiry and resend cooldown
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(diff);

      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Focus the first input box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mask Gmail for privacy display
  const maskedGmail = React.useMemo(() => {
    const parts = gmail.split('@');
    if (parts.length !== 2) return gmail;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 3) return `${name.charAt(0)}***@${domain}`;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
  }, [gmail]);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric inputs
    const numericChar = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = numericChar;
    setDigits(newDigits);
    setErrorMessage(null);

    // If character entered, auto-advance focus
    if (numericChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    if (numericChar && index === 5 && newDigits.every((d) => d !== '')) {
      verifyCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    const numericData = pasteData.replace(/\D/g, '').slice(0, 6);

    if (numericData.length > 0) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = numericData[i] || '';
      }
      setDigits(newDigits);
      const nextFocus = Math.min(numericData.length, 5);
      inputRefs.current[nextFocus]?.focus();

      if (numericData.length === 6) {
        verifyCode(numericData);
      }
    }
  };

  // Verification request
  const verifyCode = async (otpToVerify?: string) => {
    const code = otpToVerify || digits.join('');
    setErrorMessage(null);

    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the OTP.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMessage('This OTP has expired. Please click "Resend OTP" to request a new code.');
      return;
    }

    if (attemptsRemaining <= 0) {
      setErrorMessage('Maximum attempts exceeded. Please request a new OTP.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber,
          gmail,
          otp: code,
        }),
      });

      const data: VerifyOtpResponse = await response.json();

      if (!response.ok || !data.success) {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        throw new Error(data.error || 'Verification failed.');
      }

      setSuccessMessage('OTP Verified successfully! Redirecting...');
      if (data.student) {
        setTimeout(() => {
          onVerificationSuccess(data.student!);
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP request
  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber,
          gmail,
        }),
      });

      const data: SendOtpResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to resend OTP.');
      }

      setSuccessMessage(`New verification code sent to ${gmail}.`);
      setExpiresAt(data.expiresAt || Date.now() + 5 * 60 * 1000);
      setCooldown(data.cooldownSeconds || 60);
      setAttemptsRemaining(5);
      setDigits(['', '', '', '', '', '']);
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto animate-fadeIn">
      {/* Dark Glass Card */}
      <div className="glass-card rounded-[28px] p-7 sm:p-9 shadow-2xl relative overflow-hidden transition-all duration-300">
        {/* Subtle top amber highlight glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

        {/* Back Link */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBackToRegistration}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Details</span>
          </button>

          <span className="text-[11px] font-semibold text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
            Step 2 of 2
          </span>
        </div>

        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2.5">
            <SmartLibLogo size="md" />
          </div>
          <h1 className="text-2xl sm:text-[25px] font-bold text-white tracking-tight">
            Enter Verification Code
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            We sent a 6-digit OTP to your registered address:
          </p>

          {/* Student ID & Email Badge */}
          <div className="mt-2.5 inline-flex flex-wrap items-center justify-center gap-1.5 bg-slate-900/90 border border-slate-700/70 rounded-full px-3.5 py-1 text-xs">
            <span className="font-mono font-bold text-amber-400">
              #{registrationNumber}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-200 font-medium">{maskedGmail}</span>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && !errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Test Email Inspector Badge (When using Ethereal Test Mailer) */}
        {previewUrl && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📨</span>
              <span className="text-[11px] font-medium">Test Mailbox Link:</span>
            </div>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-md text-[11px] hover:bg-amber-300 transition shrink-0"
            >
              <span>View Email</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Direct Code Banner (when external mailer is firewalled or simulated) */}
        {directCode && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
                Direct Verification Code:
              </div>
              <div className="font-mono text-base font-extrabold text-amber-300 tracking-wider">
                {directCode}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const chars = directCode.split('');
                setDigits(chars);
                verifyCode(directCode);
              }}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow transition cursor-pointer"
            >
              Fill & Verify
            </button>
          </div>
        )}

        {/* 6 Digit Input Grid */}
        <div className="my-5" onPaste={handlePaste}>
          <div className="flex items-center justify-between gap-2 sm:gap-2.5">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                disabled={loading || timeLeft <= 0}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 sm:w-13 h-14 sm:h-15 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border transition-all duration-150 focus:outline-none ${
                  digit
                    ? 'border-amber-400 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'border-slate-700/80 bg-slate-900/90 text-white focus:border-amber-400 focus:bg-slate-900 focus:shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            ))}
          </div>

          {/* Security & Timer Counters */}
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400 px-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400/90" />
              <span className={timeLeft < 60 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'OTP Expired'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {attemptsRemaining} / 5 attempts
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {/* Verify Button */}
          <button
            type="button"
            disabled={loading || digits.some((d) => !d) || timeLeft <= 0}
            onClick={() => verifyCode()}
            className="w-full py-3.5 px-5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Verifying Security Code...</span>
              </>
            ) : (
              <>
                <span>Verify OTP & Enter SmartLib</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

          {/* Resend OTP Button */}
          <button
            type="button"
            disabled={cooldown > 0 || resending}
            onClick={handleResendOtp}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              cooldown > 0 || resending
                ? 'text-slate-500 bg-slate-900/40 border border-slate-800/50 cursor-not-allowed'
                : 'text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30'
            }`}
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`}
            />
            {resending ? (
              <span>Sending New Code...</span>
            ) : cooldown > 0 ? (
              <span>Resend OTP in {cooldown}s</span>
            ) : (
              <span>Resend Verification Code</span>
            )}
          </button>
        </div>

        {/* Card Footer */}
        <div className="mt-7 pt-4 border-t border-slate-800/80 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400/90" />
            <span>Interactive Student Portal · SSL Encrypted</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            SmartLib Prototype | Alliance University
          </div>
        </div>
      </div>
    </div>
  );
};
