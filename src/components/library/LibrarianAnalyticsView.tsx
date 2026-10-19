import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PackagePlus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  BookOpen,
  Send,
  Zap,
} from 'lucide-react';
import { LibrarianAnalytics, Book } from '../../types/library';

interface LibrarianAnalyticsViewProps {
  analytics: LibrarianAnalytics | null;
  books: Book[];
  onRestockBook: (bookId: string, count: number) => Promise<void>;
  onSimulateReturn: (bookId?: string) => Promise<void>;
  loadingAction: string | null;
}

export const LibrarianAnalyticsView: React.FC<LibrarianAnalyticsViewProps> = ({
  analytics,
  books,
  onRestockBook,
  onSimulateReturn,
  loadingAction,
}) => {
  const [restockCopies, setRestockCopies] = useState<Record<string, number>>({});
  const [selectedBookToReturn, setSelectedBookToReturn] = useState<string>('');

  if (!analytics) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-600 font-medium">Loading librarian analytics & inventory matrix...</p>
      </div>
    );
  }

  const { overview, priorityRestockList, recentActivity } = analytics;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Librarian Administration & SmartRestock Console
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time circulation metrics, automated reservation dispatch monitoring, and procurement priority matrix.
          </p>
        </div>

        {/* Quick Simulator Button */}
        <button
          onClick={() => onSimulateReturn()}
          disabled={loadingAction === 'simulate-return'}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start md:self-center"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>{loadingAction === 'simulate-return' ? 'Triggering Event...' : 'Simulate Book Return & Restock Alert'}</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Catalog Titles</span>
          <strong className="text-xl font-extrabold text-slate-900">{overview.totalTitles}</strong>
          <span className="text-[10px] text-slate-400 block mt-1">Active Curricula</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Total Physical Copies</span>
          <strong className="text-xl font-extrabold text-slate-900">{overview.totalCopies}</strong>
          <span className="text-[10px] text-slate-400 block mt-1">Tagged with RFID</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Available on Shelf</span>
          <strong className="text-xl font-extrabold text-emerald-600">{overview.availableCopies}</strong>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Ready for Checkout</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Currently Borrowed</span>
          <strong className="text-xl font-extrabold text-blue-600">{overview.totalBorrowed}</strong>
          <span className="text-[10px] text-blue-700 font-semibold block mt-1">With Students/Faculty</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Waiting Queue</span>
          <strong className="text-xl font-extrabold text-amber-600">{overview.totalWaitingStudents}</strong>
          <span className="text-[10px] text-amber-700 font-semibold block mt-1">Awaiting Returns</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Circulation Rate</span>
          <strong className="text-xl font-extrabold text-indigo-600">{overview.circulationRate}%</strong>
          <span className="text-[10px] text-slate-400 block mt-1">Catalog Utilization</span>
        </div>
      </div>

      {/* Restock Priority Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Procurement & Restocking Priority Queue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculated automatically based on active student waiting lists, historical checkout frequency, and zero-inventory bottlenecks.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-center">
            {priorityRestockList.length} Titles Evaluated
          </span>
        </div>

        {/* Priority Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                <th className="py-3 px-4 font-bold">Book Title & Curriculum</th>
                <th className="py-3 px-3 font-bold">Priority Status</th>
                <th className="py-3 px-3 font-bold text-center">Available / Total</th>
                <th className="py-3 px-3 font-bold text-center">Waiting Queue</th>
                <th className="py-3 px-3 font-bold text-center">Total Borrows</th>
                <th className="py-3 px-4 font-bold text-right">Librarian Restock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priorityRestockList.map((item) => {
                const count = restockCopies[item.id] || 2;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.author} · <span className="font-mono font-semibold text-blue-600">{item.courseCode}</span> ({item.department})
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {item.priority === 'CRITICAL' ? (
                        <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Critical Restock
                        </span>
                      ) : item.priority === 'HIGH' ? (
                        <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                          High Demand
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Adequate
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-bold">
                      <span className={item.availableCopies === 0 ? 'text-rose-600' : 'text-slate-800'}>
                        {item.availableCopies}
                      </span>{' '}
                      / {item.totalCopies}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                        item.waitingCount > 0 ? 'bg-amber-100 text-amber-900 font-extrabold' : 'text-slate-400'
                      }`}>
                        {item.waitingCount} {item.waitingCount === 1 ? 'student' : 'students'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                      {item.timesBorrowed}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={count}
                          onChange={(e) =>
                            setRestockCopies({
                              ...restockCopies,
                              [item.id]: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          className="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-800"
                        />
                        <button
                          onClick={() => onRestockBook(item.id, count)}
                          disabled={loadingAction === `restock-${item.id}`}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                          <span>{loadingAction === `restock-${item.id}` ? 'Adding...' : 'Restock'}</span>
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

      {/* Bottom Row: SmartRestock Event Stream & Simulation Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live Circulation Activity Stream */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              SmartRestock Audit Log & Activity Stream
            </h3>
            <span className="text-[11px] text-slate-400">Automated Audit Trail</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto text-xs pr-1">
            {recentActivity.map((act) => (
              <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 mt-0.5 ${
                  act.action === 'RESTOCK'
                    ? 'bg-blue-100 text-blue-800'
                    : act.action === 'RETURN'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {act.action}
                </span>
                <div className="flex-1">
                  <p className="text-slate-800 font-medium leading-relaxed">{act.details}</p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Simulator Tool */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-50 text-amber-600">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              SmartRestock Interactive Demonstrator
            </h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Test the automated notification engine: select any title with active waiting students. Returning a copy automatically triggers reservation allocation, creates a pickup slip, and dispatches a notification email.
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Select Book to Simulate Return:
              </label>
              <select
                value={selectedBookToReturn}
                onChange={(e) => setSelectedBookToReturn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Any Borrowed Book (Default: Highest Queue)</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.waitingList.length} waiting)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onSimulateReturn(selectedBookToReturn || undefined)}
              disabled={loadingAction === 'simulate-return'}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>{loadingAction === 'simulate-return' ? 'Processing SmartRestock...' : 'Fire Return & SmartRestock Event'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
