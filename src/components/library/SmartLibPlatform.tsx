import React, { useState, useEffect } from 'react';
import { StudentSession } from '../../types';
import {
  Book,
  StudentProfile,
  LibrarianAnalytics,
} from '../../types/library';
import { LibraryNavbar, LibraryViewTab } from './LibraryNavbar';
import { StudentDashboard } from './StudentDashboard';
import { SyllabusCatalog } from './SyllabusCatalog';
import { FloorMapNavigator } from './FloorMapNavigator';
import { LibraryQuestView } from './LibraryQuestView';
import { ReservationsHistoryView } from './ReservationsHistoryView';
import { LibrarianAnalyticsView } from './LibrarianAnalyticsView';
import { CheckCircle2, AlertCircle, Sparkles, X, Send } from 'lucide-react';

interface SmartLibPlatformProps {
  session: StudentSession;
  onSignOut: () => void;
}

export const SmartLibPlatform: React.FC<SmartLibPlatformProps> = ({
  session,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<LibraryViewTab>('dashboard');
  const [books, setBooks] = useState<Book[]>([]);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [analytics, setAnalytics] = useState<LibrarianAnalytics | null>(null);
  const [selectedBookForNav, setSelectedBookForNav] = useState<Book | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'restock';
    title: string;
    description: string;
  } | null>(null);

  // Fetch Books Catalog
  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/library/books');
      const data = await res.json();
      if (data.success && data.books) {
        setBooks(data.books);
      }
    } catch (e) {
      console.error('Failed to load books catalog:', e);
    }
  };

  // Fetch Student Profile
  const fetchStudentProfile = async () => {
    try {
      const res = await fetch(`/api/library/student/${session.registrationNumber}`);
      const data = await res.json();
      if (data.success && data.student) {
        setStudent(data.student);
      }
    } catch (e) {
      console.error('Failed to load student profile:', e);
    }
  };

  // Fetch Librarian Analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/library/analytics');
      const data = await res.json();
      if (data.success && data.analytics) {
        setAnalytics(data.analytics);
      }
    } catch (e) {
      console.error('Failed to load librarian analytics:', e);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchStudentProfile();
    fetchAnalytics();
  }, [session.registrationNumber]);

  // Borrow a book
  const handleBorrow = async (bookId: string) => {
    setLoadingAction(bookId);
    try {
      const res = await fetch('/api/library/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: session.registrationNumber,
          bookId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Checkout failed.');
      }

      setToastMessage({
        type: 'success',
        title: 'Book Borrowed Successfully',
        description: data.message,
      });

      await fetchBooks();
      await fetchStudentProfile();
      await fetchAnalytics();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        title: 'Borrowing Error',
        description: err.message || 'Could not borrow book.',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // Return a book
  const handleReturn = async (barcode: string) => {
    setLoadingAction(barcode);
    try {
      const res = await fetch('/api/library/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Return failed.');
      }

      if (data.restockEvent) {
        setToastMessage({
          type: 'restock',
          title: 'SmartRestock Triggered!',
          description: `Copy returned and placed on priority hold for student ${data.restockEvent.notifiedStudent.studentName}. Email notification sent!`,
        });
      } else {
        setToastMessage({
          type: 'success',
          title: 'Book Returned',
          description: data.message,
        });
      }

      await fetchBooks();
      await fetchStudentProfile();
      await fetchAnalytics();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        title: 'Return Error',
        description: err.message || 'Could not return book.',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // Reserve / Join waiting list
  const handleReserve = async (bookId: string) => {
    if (!student) return;
    setLoadingAction(bookId);
    try {
      const res = await fetch('/api/library/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: session.registrationNumber,
          bookId,
          studentName: student.name,
          gmail: student.gmail,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Reservation failed.');
      }

      setToastMessage({
        type: 'success',
        title: 'Waiting List Confirmed',
        description: data.message,
      });

      await fetchBooks();
      await fetchStudentProfile();
      await fetchAnalytics();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        title: 'Reservation Error',
        description: err.message || 'Could not join waiting list.',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // Cancel reservation
  const handleCancelReservation = async (bookId: string) => {
    setLoadingAction(bookId);
    try {
      const res = await fetch('/api/library/cancel-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: session.registrationNumber,
          bookId,
        }),
      });
      const data = await res.json();

      setToastMessage({
        type: 'success',
        title: 'Reservation Removed',
        description: data.message || 'Hold canceled successfully.',
      });

      await fetchBooks();
      await fetchStudentProfile();
      await fetchAnalytics();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        title: 'Error',
        description: 'Failed to cancel reservation.',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // Renew loan
  const handleRenewLoan = async (loanId: string) => {
    setLoadingAction(loanId);
    try {
      const res = await fetch('/api/library/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: session.registrationNumber,
          loanId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Renewal failed.');
      }

      setToastMessage({
        type: 'success',
        title: 'Loan Extended',
        description: data.message,
      });

      await fetchStudentProfile();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        title: 'Renewal Blocked',
        description: err.message,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // Restock book (Librarian Action)
  const handleRestock = async (bookId: string, count: number) => {
    setLoadingAction(`restock-${bookId}`);
    try {
      const res = await fetch('/api/library/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, additionalCopies: count }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Restock failed.');

      setToastMessage({
        type: 'restock',
        title: 'Copies Added & SmartRestock Dispatched',
        description: data.message,
      });

      await fetchBooks();
      await fetchStudentProfile();
      await fetchAnalytics();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        title: 'Restock Error',
        description: err.message,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // Simulate return
  const handleSimulateReturn = async (bookId?: string) => {
    setLoadingAction('simulate-return');
    try {
      const res = await fetch('/api/library/simulate-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Simulation failed.');

      const event = data.result?.restockEvent;
      setToastMessage({
        type: 'restock',
        title: 'SmartRestock Event Dispatched!',
        description: event
          ? `Returned copy held for waiting student ${event.notifiedStudent.studentName}. Email notification sent!`
          : data.message,
      });

      await fetchBooks();
      await fetchStudentProfile();
      await fetchAnalytics();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        title: 'Simulation Error',
        description: err.message,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // Mark notification read
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch('/api/library/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: session.registrationNumber,
          notificationId: id,
        }),
      });
      if (student) {
        setStudent({
          ...student,
          notifications: student.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Locate on shelf trigger
  const handleLocateOnShelf = (book: Book) => {
    setSelectedBookForNav(book);
    setActiveTab('floormap');
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold">Connecting to Alliance Central Library System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-900">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-4 duration-200">
          <div
            className={`rounded-2xl p-4 shadow-xl border flex items-start gap-3 ${
              toastMessage.type === 'restock'
                ? 'bg-gradient-to-r from-blue-950 to-indigo-950 border-blue-400 text-white'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 border-rose-500 text-white'
                : 'bg-emerald-950 border-emerald-500 text-white'
            }`}
          >
            <div className="p-1 rounded-lg bg-white/20 shrink-0 mt-0.5">
              {toastMessage.type === 'restock' ? (
                <Sparkles className="w-4 h-4 text-amber-300" />
              ) : toastMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-300" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              )}
            </div>
            <div className="flex-1 text-xs">
              <strong className="block font-bold text-sm">{toastMessage.title}</strong>
              <p className="mt-0.5 opacity-90 leading-relaxed">{toastMessage.description}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/60 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navy Navigation Bar */}
      <LibraryNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        student={student}
        onSignOut={onSignOut}
        onMarkNotificationRead={handleMarkNotificationRead}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'dashboard' && (
          <StudentDashboard
            student={student}
            books={books}
            onRenewLoan={handleRenewLoan}
            onReturnBook={handleReturn}
            onNavigateToCatalog={() => setActiveTab('catalog')}
            onNavigateToFloorMap={(book) => {
              if (book) setSelectedBookForNav(book);
              setActiveTab('floormap');
            }}
            onNavigateToQuest={() => setActiveTab('quest')}
            onNavigateToReservations={() => setActiveTab('reservations')}
            loadingAction={loadingAction}
          />
        )}

        {activeTab === 'catalog' && (
          <SyllabusCatalog
            books={books}
            student={student}
            onBorrow={handleBorrow}
            onReserve={handleReserve}
            onLocateOnShelf={handleLocateOnShelf}
            loadingAction={loadingAction}
          />
        )}

        {activeTab === 'floormap' && (
          <FloorMapNavigator
            selectedBook={selectedBookForNav}
            onClearSelection={() => setSelectedBookForNav(null)}
            onVerifyShelf={async (book) => {
              setToastMessage({
                type: 'success',
                title: 'RFID Verified on Physical Shelf',
                description: `Confirmed location for "${book.title}" at ${book.shelfLocation.rack}.`,
              });
              await fetchStudentProfile();
            }}
          />
        )}

        {activeTab === 'quest' && (
          <LibraryQuestView
            student={student}
            onExploreCatalog={() => setActiveTab('catalog')}
            onExploreFloorMap={() => setActiveTab('floormap')}
          />
        )}

        {activeTab === 'reservations' && (
          <ReservationsHistoryView
            student={student}
            onCancelReservation={handleCancelReservation}
            onExploreCatalog={() => setActiveTab('catalog')}
            loadingAction={loadingAction}
          />
        )}
      </main>

      {/* Minimal Academic Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Alliance University Central Library</span>
            <span>·</span>
            <span>SmartRestock™ Engine Enabled</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Anekal, Bengaluru, Karnataka · Fully Automated RFID & Barcode Facility
          </div>
        </div>
      </footer>
    </div>
  );
};
