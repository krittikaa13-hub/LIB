import React from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  MapPin,
  Trophy,
  ShieldCheck,
  Bookmark,
  Bell,
  Compass,
} from 'lucide-react';
import { Book, StudentProfile, StudentLoan } from '../../types/library';

interface StudentDashboardProps {
  student: StudentProfile;
  books: Book[];
  onRenewLoan: (loanId: string) => Promise<void>;
  onReturnBook: (barcode: string) => Promise<void>;
  onNavigateToCatalog: () => void;
  onNavigateToFloorMap: (book?: Book) => void;
  onNavigateToQuest: () => void;
  onNavigateToReservations: () => void;
  loadingAction: string | null;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  books,
  onRenewLoan,
  onReturnBook,
  onNavigateToCatalog,
  onNavigateToFloorMap,
  onNavigateToQuest,
  onNavigateToReservations,
  loadingAction,
}) => {
  // Find recommended books aligned with student's department & semester
  const recommendedBooks = books
    .filter((b) => b.department.includes('Computer Science') || b.courseCode.startsWith('CS'))
    .slice(0, 3);

  // Check if any reservation is ready for pickup
  const readyReservations = student.activeReservations.filter((r) => r.status === 'READY_FOR_PICKUP');

  return (
    <div className="space-y-6">
      {/* Ready For Pickup Urgent Alert (SmartRestock Triggered) */}
      {readyReservations.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs text-white shrink-0 mt-0.5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3 h-3" />
                SmartRestock Priority Hold Active
              </div>
              <h3 className="text-base sm:text-lg font-bold">
                Your Reserved Copy of "{readyReservations[0].bookTitle}" is Ready!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                Held at <strong>{readyReservations[0].pickupLocation}</strong>. Pickup deadline: <strong>{readyReservations[0].pickupDeadline}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToReservations}
            className="px-4 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow transition shrink-0 cursor-pointer"
          >
            View Reservation Slip
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full text-xs text-blue-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Alliance University Central Library · Spring 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {student.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            You are enrolled in <strong>{student.degree} (Semester {student.semester})</strong>. Track your active loans, syllabus requirements, and reserve physical copies with automated return notifications.
          </p>
        </div>

        {/* Quick Student Stats */}
        <div className="flex items-center gap-3 sm:gap-4 self-start md:self-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center min-w-[90px]">
            <span className="text-[11px] font-medium text-slate-500 block">Active Loans</span>
            <strong className="text-lg font-extrabold text-slate-900">{student.activeLoans.length}/4</strong>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center min-w-[90px]">
            <span className="text-[11px] font-medium text-slate-500 block">Reservations</span>
            <strong className="text-lg font-extrabold text-blue-600">{student.activeReservations.length}</strong>
          </div>
          <div
            onClick={onNavigateToQuest}
            className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-center min-w-[90px] cursor-pointer hover:bg-amber-100/70 transition"
          >
            <span className="text-[11px] font-medium text-amber-700 block flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3 text-amber-600" />
              Quest Rank
            </span>
            <strong className="text-lg font-extrabold text-amber-900">Lvl {student.quest.level}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Loans & Deadlines vs. Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Loans & Returns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Loans Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <BookOpen className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">Current Borrowed Books ({student.activeLoans.length})</h2>
              </div>
              <button
                onClick={onNavigateToCatalog}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {student.activeLoans.length > 0 ? (
              <div className="space-y-4">
                {student.activeLoans.map((loan) => (
                  <div
                    key={loan.loanId}
                    className="border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {loan.callNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Barcode: {loan.barcode}</span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {loan.bookTitle}
                      </h3>
                      <p className="text-xs text-slate-500">{loan.author}</p>

                      <div className="flex items-center gap-4 text-xs pt-1">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Borrowed: {loan.borrowedDate}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Due: {loan.dueDate} ({loan.daysRemaining} days left)
                        </span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                      <button
                        onClick={() => onRenewLoan(loan.loanId)}
                        disabled={loadingAction === loan.loanId || loan.renewalsRemaining <= 0}
                        className="py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === loan.loanId ? 'animate-spin' : ''}`} />
                        <span>Renew (+14d)</span>
                        <span className="text-[10px] text-slate-400">({loan.renewalsRemaining} left)</span>
                      </button>

                      <button
                        onClick={() => {
                          const targetBook = books.find((b) => b.id === loan.bookId);
                          onNavigateToFloorMap(targetBook);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Locate Shelf</span>
                      </button>

                      <button
                        onClick={() => onReturnBook(loan.barcode)}
                        disabled={loadingAction === loan.barcode}
                        className="text-[11px] text-slate-500 hover:text-rose-600 underline cursor-pointer"
                      >
                        {loadingAction === loan.barcode ? 'Processing...' : 'Return Copy Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No active loans</h4>
                <p className="text-xs text-slate-400 mt-0.5">You currently have no borrowed books.</p>
                <button
                  onClick={onNavigateToCatalog}
                  className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  Explore Syllabus Titles
                </button>
              </div>
            )}
          </div>

          {/* Syllabus-Aware Recommended Reading */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">Syllabus-Aligned Recommendations</h2>
              </div>
              <span className="text-xs text-slate-400">Based on Sem IV Coursework</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendedBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition"
                >
                  <div>
                    <span className="font-mono text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {book.courseCode}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{book.author}</p>
                    <p className="text-[10px] text-blue-900 bg-blue-50/70 p-2 rounded-lg mt-2 border border-blue-100 leading-snug">
                      {book.syllabusContext}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className={`text-[11px] font-bold ${book.availableCopies > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Waiting List'}
                    </span>
                    <button
                      onClick={() => onNavigateToFloorMap(book)}
                      className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      Map
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Notifications & Library Quest Snapshot */}
        <div className="lg:col-span-4 space-y-6">
          {/* Library Quest Progress Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-500" />
                Library Quest
              </h3>
              <button
                onClick={onNavigateToQuest}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                All Missions →
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800">{student.quest.title}</span>
                <span className="font-mono font-bold text-amber-700">Level {student.quest.level}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(student.quest.xp / student.quest.xpNextLevel) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>{student.quest.xp} XP</span>
                <span>Next Rank: {student.quest.xpNextLevel} XP</span>
              </div>
            </div>

            {/* Next Active Mission */}
            {student.quest.missions.find((m) => !m.completed) && (
              <div className="text-xs p-3 rounded-xl bg-blue-50 border border-blue-200/80">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Active Mission
                </span>
                <strong className="text-slate-900 block mt-0.5">
                  {student.quest.missions.find((m) => !m.completed)?.title}
                </strong>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {student.quest.missions.find((m) => !m.completed)?.description}
                </p>
                <div className="mt-2 text-[10px] text-blue-700 font-bold">
                  Reward: +{student.quest.missions.find((m) => !m.completed)?.xpReward} XP
                </div>
              </div>
            )}
          </div>

          {/* Real-time Notifications Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Bell className="w-4 h-4 text-blue-600" />
                Live Notification Stream
              </h3>
              <span className="text-[11px] text-slate-400">
                {student.notifications.length} alerts
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto pr-1">
              {student.notifications.map((notif) => (
                <div key={notif.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {notif.type === 'AVAILABILITY' || notif.type === 'RESTOCK' ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ) : notif.type === 'DEADLINE' ? (
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
