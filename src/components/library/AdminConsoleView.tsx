import React, { useState, useEffect } from 'react';
import {
  AdminSession,
  Book,
  LibrarianAnalytics,
  AvailabilityEvent,
  QuizQuestion,
  QuizAttempt,
  BookCopy,
} from '../../types/library';
import {
  LayoutDashboard,
  BookOpen,
  PackagePlus,
  RefreshCw,
  TrendingUp,
  Clock,
  Users,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Zap,
  Mail,
  Send,
  Search,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  ChevronRight,
  Barcode,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface AdminConsoleViewProps {
  adminSession: AdminSession;
  onSignOut: () => void;
}

type AdminTab =
  | 'overview'
  | 'books'
  | 'circulation'
  | 'smartrestock'
  | 'reservations'
  | 'quizzes'
  | 'reports'
  | 'gateway';

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  adminSession,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [books, setBooks] = useState<Book[]>([]);
  const [analytics, setAnalytics] = useState<LibrarianAnalytics | null>(null);
  const [events, setEvents] = useState<AvailabilityEvent[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search & Filter in Books Management
  const [bookSearch, setBookSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Book Add/Edit Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    department: 'Computer Science & Engineering',
    courseCode: 'CS301',
    courseName: 'Core Curriculum',
    edition: '3rd Edition',
    publisher: 'Alliance Academic Press',
    year: 2024,
    category: 'Computer Science',
    description: '',
    initialCopies: 3,
    floorId: 'first' as 'ground' | 'first' | 'second',
    rack: 'Rack CS-01',
    callNumber: 'QA76.73 .J38 2024',
  });

  // Issue / Return Form States
  const [issueBookId, setIssueBookId] = useState('');
  const [issueRegNo, setIssueRegNo] = useState('');
  const [returnBarcode, setReturnBarcode] = useState('');

  // Restock count per book
  const [restockCounts, setRestockCounts] = useState<Record<string, number>>({});

  // Add Quiz Form
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    category: 'ORIENTATION' as 'ORIENTATION' | 'SYLLABUS' | 'RESEARCH',
  });

  // SMTP Settings
  const [smtpForm, setSmtpForm] = useState({
    host: 'smtp.gmail.com',
    port: '587',
    user: '',
    pass: '',
  });

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminSession.token}`,
  });

  // Fetch all administrative data
  const loadData = async () => {
    setLoading(true);
    try {
      const [booksRes, analyticsRes, eventsRes, quizzesRes, attemptsRes] = await Promise.all([
        fetch('/api/library/books'),
        fetch('/api/library/analytics'),
        fetch('/api/admin/events', { headers: getAuthHeaders() }),
        fetch('/api/admin/quizzes', { headers: getAuthHeaders() }),
        fetch('/api/admin/quiz-attempts', { headers: getAuthHeaders() }),
      ]);

      if (booksRes.ok) {
        const d = await booksRes.json();
        if (d.books) setBooks(d.books);
      }
      if (analyticsRes.ok) {
        const d = await analyticsRes.json();
        if (d.analytics) setAnalytics(d.analytics);
      }
      if (eventsRes.ok) {
        const d = await eventsRes.json();
        if (d.events) setEvents(d.events);
      }
      if (quizzesRes.ok) {
        const d = await quizzesRes.json();
        if (d.quizzes) setQuizzes(d.quizzes);
      }
      if (attemptsRes.ok) {
        const d = await attemptsRes.json();
        if (d.attempts) setQuizAttempts(d.attempts);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Add or Update Book
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBook ? `/api/admin/books/${editingBook.id}` : '/api/admin/books';
      const method = editingBook ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...bookForm,
          shelfLocation: {
            floorId: bookForm.floorId,
            floorName: bookForm.floorId === 'ground' ? 'Ground Floor' : bookForm.floorId === 'first' ? '1st Floor' : '2nd Floor',
            wing: 'East Wing',
            aisle: 'Aisle 3',
            rack: bookForm.rack,
            bay: 2,
            shelf: 4,
            callNumber: bookForm.callNumber,
            rfidTag: `RFID-${Date.now().toString().slice(-6)}`,
            coordinates: { x: 340, y: 190 },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save book record.');

      showToast('success', editingBook ? 'Book details updated successfully.' : 'New book added to catalogue.');
      setShowBookModal(false);
      setEditingBook(null);
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Delete Book
  const handleDeleteBook = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the catalogue?`)) return;
    try {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete record.');
      showToast('success', `Removed "${title}" from catalogue.`);
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Issue a physical copy
  const handleIssueCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueBookId || !issueRegNo) {
      showToast('error', 'Select a book and provide Student Registration Number.');
      return;
    }

    try {
      const res = await fetch('/api/library/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: issueRegNo.trim().toUpperCase(),
          bookId: issueBookId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Checkout failed.');

      showToast('success', `Issued copy successfully to ${issueRegNo.toUpperCase()}.`);
      setIssueBookId('');
      setIssueRegNo('');
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Record a return
  const handleReturnCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnBarcode) {
      showToast('error', 'Please enter or select a copy barcode.');
      return;
    }

    try {
      const res = await fetch('/api/library/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: returnBarcode.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Return failed.');

      showToast('success', `Returned copy ${returnBarcode}. SmartRestock notification triggered!`);
      setReturnBarcode('');
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Restock copies
  const handleRestock = async (bookId: string, count: number) => {
    try {
      const res = await fetch(`/api/library/books/${bookId}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Restock failed.');

      showToast('success', `Added ${count} new physical copies. Availability updated!`);
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Simulate Return
  const handleSimulateReturn = async () => {
    try {
      const res = await fetch('/api/library/simulate-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Simulation failed.');

      showToast('success', data.message || 'Simulated book return & SmartRestock dispatched!');
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Toggle quiz question
  const handleToggleQuiz = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/quizzes/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      if (res.ok) {
        showToast('success', `Question ${!currentEnabled ? 'enabled' : 'disabled'}.`);
        loadData();
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Add Quiz
  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(quizForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add question.');

      showToast('success', 'New Quiz challenge question published.');
      setShowQuizModal(false);
      setQuizForm({
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        category: 'ORIENTATION',
      });
      loadData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Configure SMTP
  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/configure-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update SMTP settings.');
      showToast('success', 'Email gateway settings saved successfully.');
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Download CSV report
  const downloadReport = (type: 'inventory' | 'restock') => {
    window.location.href = `/api/admin/reports/csv?type=${type}`;
  };

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.isbn.includes(bookSearch) ||
      b.courseCode.toLowerCase().includes(bookSearch.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || b.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const departments = ['ALL', ...Array.from(new Set(books.map((b) => b.department)))];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Demo Admin Banner */}
      <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            <strong>DEMO ADMIN CONSOLE:</strong> Logged in as{' '}
            <span className="underline">{adminSession.username}</span> ({adminSession.name}). Local Evaluation Mode.
          </span>
        </div>
      </div>

      {/* Main Admin Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow">
              AU
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">SmartLib</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Admin Console
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                Alliance University Central Library · Staff Portal
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'overview' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'books' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Books & Copies</span>
            </button>
            <button
              onClick={() => setActiveTab('circulation')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'circulation' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Issue & Returns</span>
            </button>
            <button
              onClick={() => setActiveTab('smartrestock')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'smartrestock' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>SmartRestock</span>
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'quizzes' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Quest Quizzes</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'reports' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Reports</span>
            </button>
            <button
              onClick={() => setActiveTab('gateway')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'gateway' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Gateway</span>
            </button>
          </nav>

          {/* Refresh & Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh Data"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onSignOut}
              className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Feedback */}
      {feedback && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-4 animate-in fade-in">
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/80 border-red-500/40 text-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* MODULE A: ADMIN DASHBOARD */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Catalogue Titles</span>
                <div className="text-2xl font-black text-white mt-1">{analytics.overview.totalTitles}</div>
                <span className="text-[10px] text-slate-500">Across 6 Departments</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Physical Copies</span>
                <div className="text-2xl font-black text-amber-400 mt-1">{analytics.overview.totalCopies}</div>
                <span className="text-[10px] text-slate-500">RFID Barcoded</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Available on Shelf</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{analytics.overview.availableCopies}</div>
                <span className="text-[10px] text-slate-500">Ready for Issue</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Currently Borrowed</span>
                <div className="text-2xl font-black text-blue-400 mt-1">{analytics.overview.totalBorrowed}</div>
                <span className="text-[10px] text-slate-500">Active Student Loans</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Waiting Students</span>
                <div className="text-2xl font-black text-rose-400 mt-1">{analytics.overview.totalWaitingStudents}</div>
                <span className="text-[10px] text-slate-500">SmartRestock Queue</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Circulation Rate</span>
                <div className="text-2xl font-black text-purple-400 mt-1">{analytics.overview.circulationRate}%</div>
                <span className="text-[10px] text-slate-500">High Utilization</span>
              </div>
            </div>

            {/* Quick Actions & Audit Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Quick Simulator Tool */}
              <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">SmartRestock Action Trigger</h3>
                    <p className="text-xs text-slate-400">Simulate a real-time book return event</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Demonstrates the automated restocking notification loop: returning a physical copy automatically matches the highest priority waiting student, generates an allocation slip, and sends an availability alert.
                </p>
                <button
                  onClick={handleSimulateReturn}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>Fire Return & SmartRestock Dispatch Event</span>
                </button>
              </div>

              {/* Real-time Audit Events Log */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Real-time Restock & Allocation Log</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {events.length} System Events
                  </span>
                </div>
                <div className="divide-y divide-slate-800/80 max-h-64 overflow-y-auto pr-1 text-xs">
                  {events.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-xs">No restock events recorded yet.</div>
                  ) : (
                    events.map((ev) => (
                      <div key={ev.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20 shrink-0">
                          {ev.actionType}
                        </span>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-200">{ev.bookTitle}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Allocated to:{' '}
                            <strong className="text-white">
                              {ev.allocatedToName || ev.allocatedToRegNo || 'Student'}
                            </strong>{' '}
                            ({ev.allocatedToGmail}) · Deadline: {ev.pickupDeadline}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE B: BOOK MANAGEMENT */}
        {activeTab === 'books' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Catalogue & Copy Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add, edit, or archive library books, assign shelf coordinates, and monitor physical RFID copies.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingBook(null);
                  setBookForm({
                    title: '',
                    author: '',
                    isbn: `978-0-${Math.floor(100000 + Math.random() * 900000)}`,
                    department: 'Computer Science & Engineering',
                    courseCode: 'CS301',
                    courseName: 'Core Curriculum',
                    edition: '1st Edition',
                    publisher: 'Alliance Academic Press',
                    year: 2024,
                    category: 'Computer Science',
                    description: '',
                    initialCopies: 3,
                    floorId: 'first',
                    rack: 'Rack CS-01',
                    callNumber: 'QA76.73 .A88 2024',
                  });
                  setShowBookModal(true);
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Book Title</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, author, ISBN, or course code..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
                />
              </div>
              <div className="sm:col-span-4">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d === 'ALL' ? 'All Academic Departments' : d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Books Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Title & Author</th>
                    <th className="py-3 px-3">Curriculum / Dept</th>
                    <th className="py-3 px-3">Call Number & Shelf</th>
                    <th className="py-3 px-3 text-center">Copies</th>
                    <th className="py-3 px-3 text-center">Waiting</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredBooks.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs">{b.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {b.author} · <span className="font-mono text-slate-500">{b.isbn}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-blue-400">{b.courseCode}</span>
                        <div className="text-[10px] text-slate-400">{b.department}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-300 font-semibold">{b.shelfLocation.callNumber}</div>
                        <div className="text-[10px] text-slate-400">
                          {b.shelfLocation.floorName} · {b.shelfLocation.rack}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        <span className={b.availableCopies === 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          {b.availableCopies}
                        </span>{' '}
                        / {b.totalCopies}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${
                            b.waitingList.length > 0 ? 'bg-amber-400/20 text-amber-300' : 'text-slate-500'
                          }`}
                        >
                          {b.waitingList.length}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              setEditingBook(b);
                              setBookForm({
                                title: b.title,
                                author: b.author,
                                isbn: b.isbn,
                                department: b.department,
                                courseCode: b.courseCode,
                                courseName: b.courseName,
                                edition: b.edition,
                                publisher: b.publisher,
                                year: b.year,
                                category: b.category,
                                description: b.description,
                                initialCopies: b.totalCopies,
                                floorId: b.shelfLocation.floorId,
                                rack: b.shelfLocation.rack,
                                callNumber: b.shelfLocation.callNumber,
                              });
                              setShowBookModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Edit Book"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(b.id, b.title)}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 transition cursor-pointer"
                            title="Delete Book"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE C: CIRCULATION, ISSUE & RETURNS */}
        {activeTab === 'circulation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Issue Copy Form */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Issue Physical Copy</h3>
                  <p className="text-xs text-slate-400">Checkout a verified copy to a student registration number</p>
                </div>
              </div>

              <form onSubmit={handleIssueCopy} className="space-y-4 pt-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-300 block mb-1">
                    Select Available Book:
                  </label>
                  <select
                    value={issueBookId}
                    onChange={(e) => setIssueBookId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Choose Catalogue Title --</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id} disabled={b.availableCopies === 0}>
                        {b.title} ({b.availableCopies} available on shelf)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-300 block mb-1">
                    Student Registration Number:
                  </label>
                  <input
                    type="text"
                    value={issueRegNo}
                    onChange={(e) => setIssueRegNo(e.target.value.toUpperCase())}
                    placeholder="e.g. AU2024ENG001"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 uppercase focus:outline-none focus:border-amber-400"
                  >
                  </input>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Issue Copy & Update Inventory</span>
                </button>
              </form>
            </div>

            {/* Record Return Form */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Barcode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Record Physical Return</h3>
                  <p className="text-xs text-slate-400">Scan or select copy barcode to update availability</p>
                </div>
              </div>

              <form onSubmit={handleReturnCopy} className="space-y-4 pt-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-300 block mb-1">
                    Copy Barcode:
                  </label>
                  <input
                    type="text"
                    value={returnBarcode}
                    onChange={(e) => setReturnBarcode(e.target.value)}
                    placeholder="e.g. BC-101-01"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter the barcode from the book copy label.
                  </p>
                </div>

                {/* Quick Barcode Selector for Borrowed Copies */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-300 block mb-1">
                    Or select from currently borrowed copies:
                  </label>
                  <select
                    onChange={(e) => setReturnBarcode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="">-- Currently Checked Out Copies --</option>
                    {books.flatMap((b) =>
                      b.copies
                        .filter((c) => c.status === 'BORROWED')
                        .map((c) => (
                          <option key={c.barcode} value={c.barcode}>
                            {c.barcode} — {b.title} (Loaned to: {c.borrowedByRegNo})
                          </option>
                        ))
                    )}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Process Return & Trigger SmartRestock</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODULE D: SMARTRESTOCK ENGINE */}
        {activeTab === 'smartrestock' && analytics && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  SmartRestock Priority Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated restocking priority matrix based on waiting student queues, borrowing velocity, and zero-inventory bottlenecks.
                </p>
              </div>
              <button
                onClick={handleSimulateReturn}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 stroke-[2.5]" />
                <span>Simulate Restock Dispatch</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Title & Course</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3 text-center">Available / Total</th>
                    <th className="py-3 px-3 text-center">Waiting Queue</th>
                    <th className="py-3 px-3 text-center">Historical Borrows</th>
                    <th className="py-3 px-4 text-right">Quick Restock Copies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {analytics.priorityRestockList.map((item) => {
                    const count = restockCounts[item.id] || 2;
                    return (
                      <tr key={item.id} className="hover:bg-slate-900/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-xs">{item.title}</div>
                          <div className="text-[11px] text-slate-400">
                            {item.author} · <span className="font-mono text-blue-400">{item.courseCode}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {item.priority === 'CRITICAL' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Critical Restock
                            </span>
                          ) : item.priority === 'HIGH' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              High Demand
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Adequate
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          <span className={item.availableCopies === 0 ? 'text-rose-400' : 'text-slate-200'}>
                            {item.availableCopies}
                          </span>{' '}
                          / {item.totalCopies}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              item.waitingCount > 0 ? 'bg-amber-400/20 text-amber-300' : 'text-slate-500'
                            }`}
                          >
                            {item.waitingCount} {item.waitingCount === 1 ? 'student' : 'students'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{item.timesBorrowed}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={count}
                              onChange={(e) =>
                                setRestockCounts({
                                  ...restockCounts,
                                  [item.id]: parseInt(e.target.value, 10) || 1,
                                })
                              }
                              className="w-12 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-center text-xs text-white"
                            />
                            <button
                              onClick={() => handleRestock(item.id, count)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
                            >
                              <PackagePlus className="w-3.5 h-3.5" />
                              <span>Restock</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE F: QUEST QUIZZES */}
        {activeTab === 'quizzes' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  Library Quest Question Bank & Student Attempts
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Curate interactive orientation and syllabus challenges for students to earn XP and reading badges.
                </p>
              </div>
              <button
                onClick={() => setShowQuizModal(true)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Quiz Question</span>
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Active Question Bank ({quizzes.length} Questions)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quizzes.map((q) => (
                  <div key={q.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {q.category}
                      </span>
                      <button
                        onClick={() => handleToggleQuiz(q.id, q.enabled)}
                        className={`text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                          q.enabled ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {q.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        <span>{q.enabled ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-white leading-relaxed">{q.question}</p>
                    <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`px-2 py-1 rounded text-[11px] ${
                            idx === q.correctIndex
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold'
                              : 'text-slate-400'
                          }`}
                        >
                          {idx === q.correctIndex ? '✓ ' : '• '} {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Student Quiz Attempts */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Recent Student Attempts & Score Log ({quizAttempts.length} Attempts)
              </h4>
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 px-3 text-center">Percentage</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {quizAttempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-4">
                          <span className="font-bold text-white">{att.studentName}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">#{att.studentRegNo}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-200">
                          {att.score} / {att.totalQuestions}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-400">
                          {att.percentage}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              att.passed
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {att.passed ? 'PASSED (+50 XP)' : 'NEEDS PRACTICE'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                          {new Date(att.completedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODULE G: REPORTS & EXPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                Administrative Reports & CSV Data Export
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Download verified circulation records, shelf inventory lists, and procurement restock priorities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-sm font-bold text-white">Full Inventory & Shelf Location CSV</h4>
                <p className="text-xs text-slate-400">
                  Export complete catalogue records with ISBN, title, department, course code, total copies, available count, call number, and shelf location.
                </p>
                <button
                  onClick={() => downloadReport('inventory')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Inventory CSV</span>
                </button>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-sm font-bold text-white">SmartRestock Priority Analysis CSV</h4>
                <p className="text-xs text-slate-400">
                  Export evaluated restock priorities, waiting queue lengths, demand ratios, and circulation numbers for institutional procurement.
                </p>
                <button
                  onClick={() => downloadReport('restock')}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Restock Priority CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODULE H: EMAIL GATEWAY SETTINGS */}
        {activeTab === 'gateway' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5 max-w-2xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                Email Service Gateway & Credentials
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure SMTP or Gmail App Password credentials for student OTP verification delivery.
              </p>
            </div>

            <form onSubmit={handleSaveSmtp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpForm.host}
                    onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">Port</label>
                  <input
                    type="text"
                    value={smtpForm.port}
                    onChange={(e) => setSmtpForm({ ...smtpForm, port: e.target.value })}
                    placeholder="587"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                  Gmail / Username Address
                </label>
                <input
                  type="email"
                  value={smtpForm.user}
                  onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                  placeholder="smartlib.alliance.portal@gmail.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                  Google 16-character App Password / SMTP Password
                </label>
                <input
                  type="password"
                  value={smtpForm.pass}
                  onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Never shares passwords in frontend code. Securely configured in server memory.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
              >
                Save Gateway Configuration
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Add / Edit Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-xl w-full text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingBook ? 'Edit Catalogue Book Record' : 'Add New Book Title to Catalogue'}
              </h3>
              <button
                onClick={() => setShowBookModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-slate-900"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="e.g. Software Engineering: A Practitioner's Approach"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Author</label>
                  <input
                    type="text"
                    required
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="e.g. Roger S. Pressman"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">ISBN</label>
                  <input
                    type="text"
                    required
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    placeholder="e.g. 978-0-07-802212-8"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={bookForm.courseCode}
                    onChange={(e) => setBookForm({ ...bookForm, courseCode: e.target.value })}
                    placeholder="e.g. CS302"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Department</label>
                  <select
                    value={bookForm.department}
                    onChange={(e) => setBookForm({ ...bookForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication Engineering">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Alliance School of Business">Alliance School of Business</option>
                    <option value="Alliance School of Law">Alliance School of Law</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Floor</label>
                  <select
                    value={bookForm.floorId}
                    onChange={(e) => setBookForm({ ...bookForm, floorId: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="ground">Ground Floor</option>
                    <option value="first">1st Floor</option>
                    <option value="second">2nd Floor</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Rack / Bay</label>
                  <input
                    type="text"
                    required
                    value={bookForm.rack}
                    onChange={(e) => setBookForm({ ...bookForm, rack: e.target.value })}
                    placeholder="Rack CS-02"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Call Number</label>
                  <input
                    type="text"
                    required
                    value={bookForm.callNumber}
                    onChange={(e) => setBookForm({ ...bookForm, callNumber: e.target.value })}
                    placeholder="QA76.758 .P74"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              {!editingBook && (
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Initial Physical Copies Count</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={bookForm.initialCopies}
                    onChange={(e) => setBookForm({ ...bookForm, initialCopies: parseInt(e.target.value, 10) || 1 })}
                    className="w-24 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                  />
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow cursor-pointer"
                >
                  {editingBook ? 'Update Record' : 'Save New Book Title'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-lg w-full text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Library Quest Challenge Question</h3>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-slate-900"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddQuiz} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Question Text</label>
                <input
                  type="text"
                  required
                  value={quizForm.question}
                  onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
                  placeholder="e.g. Which section of the Central Library houses IEEE journals?"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Answer Options</label>
                <div className="space-y-2">
                  {quizForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctIdx"
                        checked={quizForm.correctIndex === idx}
                        onChange={() => setQuizForm({ ...quizForm, correctIndex: idx })}
                        className="accent-amber-400"
                      />
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...quizForm.options];
                          newOpts[idx] = e.target.value;
                          setQuizForm({ ...quizForm, options: newOpts });
                        }}
                        placeholder={`Option ${idx + 1} ${quizForm.correctIndex === idx ? '(Correct Answer)' : ''}`}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Explanation</label>
                <input
                  type="text"
                  value={quizForm.explanation}
                  onChange={(e) => setQuizForm({ ...quizForm, explanation: e.target.value })}
                  placeholder="Explanation shown after student submits answer"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow cursor-pointer"
                >
                  Publish Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
