import React from 'react';
import {
  Bookmark,
  History,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  XCircle,
  Sparkles,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { StudentProfile } from '../../types/library';

interface ReservationsHistoryViewProps {
  student: StudentProfile;
  onCancelReservation: (bookId: string) => Promise<void>;
  onExploreCatalog: () => void;
  loadingAction: string | null;
}

export const ReservationsHistoryView: React.FC<ReservationsHistoryViewProps> = ({
  student,
  onCancelReservation,
  onExploreCatalog,
  loadingAction,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Bookmark className="w-5 h-5" />
            </span>
            Reservations, Waiting Lists & Borrowing History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated queue priority and circulation records linked to your verified Alliance University student profile.
          </p>
        </div>

        <button
          onClick={onExploreCatalog}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer self-start md:self-center"
        >
          Reserve More Titles
        </button>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Reservations & Waiting List */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Active Waiting List Holds ({student.activeReservations.length})
            </h3>
            <span className="text-xs text-slate-400">FIFO Queue Priority</span>
          </div>

          {student.activeReservations.length > 0 ? (
            <div className="space-y-4">
              {student.activeReservations.map((res) => {
                const isReady = res.status === 'READY_FOR_PICKUP';

                return (
                  <div
                    key={res.reservationId}
                    className={`border rounded-xl p-4 sm:p-5 transition relative overflow-hidden ${
                      isReady
                        ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    {isReady && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white font-bold text-[10px] px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        Held at Counter
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {res.callNumber}
                        </span>
                        <span className="text-[11px] font-bold font-mono text-amber-700">
                          {isReady ? '🎉 READY FOR PICKUP' : `Queue Position: #${res.queuePosition}`}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {res.bookTitle}
                      </h4>
                      <p className="text-xs text-slate-500">{res.author}</p>

                      {isReady ? (
                        <div className="mt-3 bg-white border border-emerald-200 rounded-lg p-3 text-xs space-y-1">
                          <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            SmartRestock Notification Sent to {student.gmail}
                          </div>
                          <p className="text-slate-600 text-[11px]">
                            Location: <strong>{res.pickupLocation}</strong>
                          </p>
                          <p className="text-emerald-700 font-bold text-[11px]">
                            Pickup Deadline: {res.pickupDeadline}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 bg-white border border-slate-200 rounded-lg p-2.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Reserved on: {new Date(res.reservedAt).toLocaleDateString()}
                          </span>
                          <span className="text-[11px] text-amber-700 font-semibold">
                            Auto-Email Alert Enabled
                          </span>
                        </div>
                      )}

                      <div className="pt-3 flex justify-end">
                        <button
                          onClick={() => onCancelReservation(res.bookId)}
                          disabled={loadingAction === res.bookId}
                          className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Hold</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <h4 className="text-xs font-bold text-slate-700">No active reservations</h4>
              <p className="text-[11px] text-slate-400">
                When physical copies are on loan, you can join the SmartRestock queue for automated alerts.
              </p>
            </div>
          )}
        </div>

        {/* Borrowing History */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Past Borrowing History ({student.borrowingHistory.length})
            </h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              100% On-Time Returns
            </span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
            {student.borrowingHistory.map((item) => (
              <div key={item.historyId} className="p-4 bg-white hover:bg-slate-50 transition space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.bookTitle}</h4>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Returned
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{item.author}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>Borrowed: {item.borrowedDate}</span>
                  <span>Returned: {item.returnedDate}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Verification Guarantee */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Official Academic Records
            </span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              All checkout timestamps, renewals, and returns are immutably logged to Alliance University Central Library records with RFID gate verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
