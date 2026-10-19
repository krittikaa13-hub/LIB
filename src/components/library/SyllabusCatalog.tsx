import React, { useState } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
  ChevronRight,
  BookmarkPlus,
  Compass,
} from 'lucide-react';
import { Book, StudentProfile } from '../../types/library';

interface SyllabusCatalogProps {
  books: Book[];
  student: StudentProfile;
  onBorrow: (bookId: string) => Promise<void>;
  onReserve: (bookId: string) => Promise<void>;
  onLocateOnShelf: (book: Book) => void;
  loadingAction: string | null;
}

export const SyllabusCatalog: React.FC<SyllabusCatalogProps> = ({
  books,
  student,
  onBorrow,
  onReserve,
  onLocateOnShelf,
  loadingAction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'WAITING'>('ALL');
  const [selectedBookForModal, setSelectedBookForModal] = useState<Book | null>(null);

  const departments = [
    'All Departments',
    'Computer Science & Engineering',
    'Artificial Intelligence & Data Science',
    'Alliance School of Business',
    'Alliance School of Law',
  ];

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery) ||
      book.shelfLocation.callNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'All Departments' || book.department === selectedDept;

    const matchesAvailability =
      availabilityFilter === 'ALL' ||
      (availabilityFilter === 'AVAILABLE' && book.availableCopies > 0) ||
      (availabilityFilter === 'WAITING' && book.availableCopies === 0);

    return matchesSearch && matchesDept && matchesAvailability;
  });

  const isAlreadyBorrowed = (bookId: string) => {
    return student.activeLoans.some((l) => l.bookId === bookId);
  };

  const isAlreadyReserved = (bookId: string) => {
    return student.activeReservations.some((r) => r.bookId === bookId);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <BookOpen className="w-5 h-5" />
              </span>
              Syllabus-Aware Book Discovery
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Course syllabus mapped to Alliance University academic curricula with explainable recommendation tags.
            </p>
          </div>

          {/* Quick Syllabus Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-600 self-start md:self-center">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Target Curriculum:</span>
            <strong className="text-slate-900 font-semibold">{student.degree} (Sem IV)</strong>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, course code (e.g. CS301), ISBN, or call no..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Department Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter Tabs */}
          <div className="sm:col-span-3 flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setAvailabilityFilter('ALL')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                availabilityFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({books.length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('AVAILABLE')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                availabilityFilter === 'AVAILABLE'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setAvailabilityFilter('WAITING')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                availabilityFilter === 'WAITING'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Waiting List
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBooks.map((book) => {
          const borrowed = isAlreadyBorrowed(book.id);
          const reserved = isAlreadyReserved(book.id);
          const isAvailable = book.availableCopies > 0;

          return (
            <div
              key={book.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {book.courseCode} · {book.shelfLocation.callNumber}
                  </span>

                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {book.availableCopies} of {book.totalCopies} Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      <Clock className="w-3 h-3 text-amber-600" />
                      0 Available · {book.waitingList.length} Waiting
                    </span>
                  )}
                </div>

                {/* Title & Author */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                  {book.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {book.author} · <span className="text-slate-400">{book.edition} ({book.year})</span>
                </p>

                {/* Explainable Syllabus Recommendation Card */}
                <div className="mt-3 bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-900">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-700 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Syllabus Alignment: {book.courseName}
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    {book.syllabusContext}
                  </p>
                </div>

                {/* Physical Location Pin */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-slate-600 font-medium truncate">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    {book.shelfLocation.floorName} · {book.shelfLocation.rack} (Shelf {book.shelfLocation.shelf})
                  </span>
                  <button
                    onClick={() => onLocateOnShelf(book)}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-xs inline-flex items-center gap-0.5 shrink-0 ml-2 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Locate on Map
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedBookForModal(book)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                >
                  View Copies ({book.totalCopies})
                </button>

                {borrowed ? (
                  <span className="flex-1 py-2 px-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold text-center">
                    Currently in Your Loans
                  </span>
                ) : reserved ? (
                  <span className="flex-1 py-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold text-center">
                    Reserved in Waiting List
                  </span>
                ) : isAvailable ? (
                  <button
                    onClick={() => onBorrow(book.id)}
                    disabled={loadingAction === book.id}
                    className="flex-1 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {loadingAction === book.id ? 'Processing Checkout...' : 'Borrow Physical Copy'}
                  </button>
                ) : (
                  <button
                    onClick={() => onReserve(book.id)}
                    disabled={loadingAction === book.id}
                    className="flex-1 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    {loadingAction === book.id ? 'Joining Queue...' : 'Join Waiting List (SmartRestock)'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBooks.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No matching titles found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or selecting 'All Departments' to browse the complete library holdings.
          </p>
        </div>
      )}

      {/* Book Copies Breakdown Modal */}
      {selectedBookForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedBookForModal.shelfLocation.callNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedBookForModal.title}
                </h3>
                <p className="text-xs text-slate-500">{selectedBookForModal.author} · {selectedBookForModal.publisher}</p>
              </div>
              <button
                onClick={() => setSelectedBookForModal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Shelf Info */}
            <div className="my-4 bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Location</span>
                <strong className="text-slate-800">{selectedBookForModal.shelfLocation.floorName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Aisle / Rack</span>
                <strong className="text-slate-800">{selectedBookForModal.shelfLocation.rack} (Shelf {selectedBookForModal.shelfLocation.shelf})</strong>
              </div>
            </div>

            {/* Physical Copies List */}
            <div className="space-y-2 mb-5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Physical Inventory ({selectedBookForModal.copies.length} Copies)
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {selectedBookForModal.copies.map((copy) => (
                  <div key={copy.barcode} className="p-3 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700">Copy #{copy.copyNumber}</span>
                      <span className="font-mono text-slate-400 text-[11px]">({copy.barcode})</span>
                    </div>
                    {copy.status === 'AVAILABLE' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                        Available on Shelf
                      </span>
                    ) : copy.status === 'RESERVED_FOR_PICKUP' ? (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                        Held at Counter for Student
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[11px]">
                        Checked Out (Due: {copy.dueDate})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Waiting List Queue */}
            {selectedBookForModal.waitingList.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  Active Waiting List Queue ({selectedBookForModal.waitingList.length} Students)
                </h4>
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 divide-y divide-amber-200/50 text-xs">
                  {selectedBookForModal.waitingList.map((wait) => (
                    <div key={wait.registrationNumber} className="py-1.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <span className="font-medium text-amber-950">
                        #{wait.priority} · {wait.studentName} ({wait.registrationNumber})
                      </span>
                      <span className="text-[10px] text-amber-700 font-mono">
                        Priority Hold Eligible
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 gap-2">
              <button
                onClick={() => {
                  onLocateOnShelf(selectedBookForModal);
                  setSelectedBookForModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition cursor-pointer"
              >
                Locate Shelf on Map
              </button>
              <button
                onClick={() => setSelectedBookForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
