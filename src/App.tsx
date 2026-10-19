import { useState, useEffect } from 'react';
import libraryBg from './assets/images/library_bg.jpg';
import { RegistrationStep } from './components/RegistrationStep';
import { OtpVerificationStep } from './components/OtpVerificationStep';
import { AdminLoginCard } from './components/AdminLoginCard';
import { SmartLibPlatform } from './components/library/SmartLibPlatform';
import { AdminConsoleView } from './components/library/AdminConsoleView';
import { EmailConfigModal } from './components/EmailConfigModal';
import { StudentSession, SendOtpResponse, SmtpConfigStatus } from './types';
import { AdminSession } from './types/library';
import { Mail, Settings, ShieldAlert, GraduationCap } from 'lucide-react';

type AppStep =
  | 'student-login'
  | 'student-otp'
  | 'student-platform'
  | 'admin-login'
  | 'admin-platform';

export default function App() {
  const [step, setStep] = useState<AppStep>('student-login');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [gmail, setGmail] = useState('');
  const [otpResponse, setOtpResponse] = useState<SendOtpResponse | null>(null);
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<SmtpConfigStatus | null>(null);

  // Restore existing session on mount
  useEffect(() => {
    try {
      const savedAdmin = sessionStorage.getItem('smartlib_admin_session');
      if (savedAdmin) {
        const parsedAdmin: AdminSession = JSON.parse(savedAdmin);
        if (parsedAdmin.token && parsedAdmin.role === 'ADMIN') {
          setAdminSession(parsedAdmin);
          setStep('admin-platform');
          return;
        }
      }

      const savedStudent = sessionStorage.getItem('smartlib_student_session');
      if (savedStudent) {
        const parsed: StudentSession = JSON.parse(savedStudent);
        if (parsed.sessionToken && parsed.registrationNumber) {
          setStudentSession(parsed);
          setStep('student-platform');
        }
      }
    } catch {
      // ignore
    }

    // Check server SMTP status
    fetch('/api/auth/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSmtpStatus(data);
      })
      .catch(() => {});
  }, []);

  const handleOtpSent = (data: {
    registrationNumber: string;
    gmail: string;
    response: SendOtpResponse;
  }) => {
    setRegistrationNumber(data.registrationNumber);
    setGmail(data.gmail);
    setOtpResponse(data.response);
    setStep('student-otp');
  };

  const handleStudentVerificationSuccess = (student: StudentSession) => {
    setStudentSession(student);
    try {
      sessionStorage.setItem('smartlib_student_session', JSON.stringify(student));
    } catch {
      // ignore
    }
    setStep('student-platform');
  };

  const handleAdminLoginSuccess = (session: AdminSession) => {
    setAdminSession(session);
    try {
      sessionStorage.setItem('smartlib_admin_session', JSON.stringify(session));
    } catch {
      // ignore
    }
    setStep('admin-platform');
  };

  const handleStudentSignOut = () => {
    sessionStorage.removeItem('smartlib_student_session');
    setStudentSession(null);
    setOtpResponse(null);
    setStep('student-login');
  };

  const handleAdminSignOut = () => {
    sessionStorage.removeItem('smartlib_admin_session');
    setAdminSession(null);
    setStep('admin-login');
  };

  // Render Student Platform
  if (step === 'student-platform' && studentSession) {
    return (
      <SmartLibPlatform
        session={studentSession}
        onSignOut={handleStudentSignOut}
      />
    );
  }

  // Render Admin Platform
  if (step === 'admin-platform' && adminSession) {
    return (
      <AdminConsoleView
        adminSession={adminSession}
        onSignOut={handleAdminSignOut}
      />
    );
  }

  // Authentication Flows (Student Login, OTP, Admin Login)
  return (
    <div className="min-h-screen relative w-full overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Exact full-viewport background with original colors and natural daylight */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${libraryBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col justify-between p-4 sm:p-6 md:p-8">
        {/* Top Utility Bar with Gateway and Mode Switching */}
        <div className="w-full flex items-center justify-between max-w-6xl mx-auto">
          {/* Left Pill: Mode Indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950/70 border border-slate-700/60 text-slate-300 backdrop-blur-md shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {step === 'admin-login' ? 'Librarian Console Access' : 'Student Access Portal'}
            </span>
          </div>

          {/* Right Tools */}
          <div className="flex items-center gap-2">
            {step === 'admin-login' ? (
              <button
                onClick={() => setStep('student-login')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-950/70 hover:bg-slate-900 border border-amber-500/40 text-amber-300 hover:text-amber-200 backdrop-blur-md transition cursor-pointer shadow-md"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Portal</span>
              </button>
            ) : (
              <button
                onClick={() => setStep('admin-login')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-950/70 hover:bg-slate-900 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 backdrop-blur-md transition cursor-pointer shadow-md"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Demo Admin Login</span>
              </button>
            )}

            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-slate-950/70 hover:bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-white backdrop-blur-md transition cursor-pointer shadow-md"
              title="Click to view or customize Email Delivery Gateway"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                Gateway:{' '}
                <strong className="text-amber-300 font-semibold">
                  {smtpStatus?.smtpConfigured ? 'Live SMTP' : 'Real Ethereal Mailer'}
                </strong>
              </span>
              <Settings className="w-3 h-3 text-slate-500 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Centered Authentication Card */}
        <div className="flex-1 flex items-center justify-center py-6 sm:py-10">
          {step === 'student-login' && (
            <RegistrationStep
              initialRegNo={registrationNumber}
              initialGmail={gmail}
              onOtpSent={handleOtpSent}
              onSwitchToAdminLogin={() => setStep('admin-login')}
            />
          )}

          {step === 'student-otp' && otpResponse && (
            <OtpVerificationStep
              registrationNumber={registrationNumber}
              gmail={gmail}
              initialResponse={otpResponse}
              onVerificationSuccess={handleStudentVerificationSuccess}
              onBackToRegistration={() => setStep('student-login')}
            />
          )}

          {step === 'admin-login' && (
            <AdminLoginCard
              onAdminLoginSuccess={handleAdminLoginSuccess}
              onBackToStudentLogin={() => setStep('student-login')}
            />
          )}
        </div>

        {/* Bottom Pill matching reference layout */}
        <div className="w-full flex justify-center pb-2">
          <div className="bg-slate-950/70 border border-slate-800/80 backdrop-blur-md px-4 sm:px-5 py-1.5 rounded-full text-[11px] sm:text-xs text-slate-400 shadow-xl text-center">
            Alliance University Central Library · Bengaluru, Karnataka ·{' '}
            <span className="text-amber-400 font-semibold">
              Authorized Campus Access Only
            </span>
          </div>
        </div>
      </div>

      {/* Email Configuration Modal */}
      <EmailConfigModal
        isOpen={showConfigModal}
        onClose={() => {
          setShowConfigModal(false);
          fetch('/api/auth/status')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data) setSmtpStatus(data);
            })
            .catch(() => {});
        }}
      />
    </div>
  );
}
