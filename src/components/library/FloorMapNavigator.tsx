import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Layers,
  Compass,
  CheckCircle2,
  ScanBarcode,
  Sparkles,
  Info,
  Footprints,
  Maximize2,
} from 'lucide-react';
import { Book, ShelfLocation } from '../../types/library';

interface FloorMapNavigatorProps {
  selectedBook?: Book | null;
  onClearSelection?: () => void;
  onVerifyShelf?: (book: Book) => void;
}

export const FloorMapNavigator: React.FC<FloorMapNavigatorProps> = ({
  selectedBook,
  onClearSelection,
  onVerifyShelf,
}) => {
  const [activeFloor, setActiveFloor] = useState<'ground' | 'first' | 'second'>(
    selectedBook?.shelfLocation.floorId || 'ground'
  );
  const [rfidScanned, setRfidScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  // If a book is selected with a different floor, update active floor
  React.useEffect(() => {
    if (selectedBook?.shelfLocation?.floorId) {
      setActiveFloor(selectedBook.shelfLocation.floorId);
      setRfidScanned(false);
    }
  }, [selectedBook]);

  const handleSimulateScan = () => {
    if (!selectedBook) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setRfidScanned(true);
      if (onVerifyShelf) onVerifyShelf(selectedBook);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Floor Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Interactive Library Floorplan & Shelf Navigator
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centred on Alliance University Central Library’s 55,000 sq.ft rotunda atrium. Locate exact aisle, rack, bay, and shelf coordinates.
          </p>
        </div>

        {/* Floor Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-center border border-slate-200">
          <button
            onClick={() => setActiveFloor('ground')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFloor === 'ground'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ground Floor (Rotunda)
          </button>
          <button
            onClick={() => setActiveFloor('first')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFloor === 'first'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1st Floor (Computing & AI)
          </button>
          <button
            onClick={() => setActiveFloor('second')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFloor === 'second'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2nd Floor (Management & Law)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Floor Map Canvas */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>
                {activeFloor === 'ground'
                  ? 'Ground Floor — Central Rotunda & General Reference'
                  : activeFloor === 'first'
                  ? 'First Floor — North & South Engineering Wings'
                  : 'Second Floor — Mezzanine, Business & Law Archives'}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              RFID Sensor Network Online
            </div>
          </div>

          {/* SVG Map Container */}
          <div className="w-full aspect-[16/10] bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden flex items-center justify-center">
            <svg
              viewBox="0 0 800 500"
              className="w-full h-full select-none"
              style={{ maxHeight: '520px' }}
            >
              {/* Background Architectural Grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                </pattern>
                <radialGradient id="atriumGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#eff6ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="800" height="500" fill="url(#grid)" />

              {/* Building Boundary Wall */}
              <rect
                x="40"
                y="30"
                width="720"
                height="440"
                rx="24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />

              {/* Ground Floor Features */}
              {activeFloor === 'ground' && (
                <>
                  {/* Central Rotunda Glass Dome Projection (Circle) */}
                  <circle cx="400" cy="250" r="140" fill="url(#atriumGlow)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
                  <circle cx="400" cy="250" r="90" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                  <circle cx="400" cy="250" r="40" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />

                  {/* Compass Star Marker */}
                  <path
                    d="M 400 220 L 406 244 L 430 250 L 406 256 L 400 280 L 394 256 L 370 250 L 394 244 Z"
                    fill="#3b82f6"
                    opacity="0.8"
                  />
                  <text x="400" y="212" textAnchor="middle" className="text-[10px] font-bold fill-blue-700">
                    CENTRAL DOME ATRIUM
                  </text>

                  {/* Symmetrical Curved Staircases */}
                  <path d="M 310 180 Q 300 240 330 300" fill="none" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 490 180 Q 500 240 470 300" fill="none" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
                  <text x="270" y="245" className="text-[9px] font-bold fill-slate-500">WEST STAIRCASE</text>
                  <text x="510" y="245" className="text-[9px] font-bold fill-slate-500">EAST STAIRCASE</text>

                  {/* Main Entrance Gates */}
                  <rect x="360" y="445" width="80" height="20" rx="4" fill="#0f172a" />
                  <text x="400" y="459" textAnchor="middle" className="text-[10px] font-bold fill-white">
                    MAIN ENTRANCE
                  </text>

                  {/* Central Circulation Desk (Right of Atrium) */}
                  <rect x="520" y="210" width="110" height="40" rx="8" fill="#1e293b" />
                  <text x="575" y="234" textAnchor="middle" className="text-[10px] font-bold fill-white">
                    CIRCULATION DESK
                  </text>

                  {/* Cane Reading Lounge (Left of Atrium) */}
                  <rect x="170" y="210" width="100" height="40" rx="8" fill="#f1f5f9" stroke="#cbd5e1" />
                  <text x="220" y="234" textAnchor="middle" className="text-[10px] font-bold fill-slate-600">
                    LOUNGE SEATING
                  </text>

                  {/* Stacks: Aisle B (Computer Systems) */}
                  <g className="cursor-pointer">
                    <rect x="140" y="70" width="160" height="35" rx="6" fill="#e2e8f0" stroke="#94a3b8" />
                    <text x="220" y="92" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">
                      RACK B-01 / B-02 (C & Systems)
                    </text>
                  </g>

                  {/* Stacks: Aisle C (Algorithms) */}
                  <g className="cursor-pointer">
                    <rect x="140" y="120" width="160" height="35" rx="6" fill="#e2e8f0" stroke="#94a3b8" />
                    <text x="220" y="142" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">
                      RACK C-03 / C-04 (Algorithms CLRS)
                    </text>
                  </g>

                  {/* Stacks: Aisle E (Databases & OS) */}
                  <g className="cursor-pointer">
                    <rect x="500" y="70" width="160" height="35" rx="6" fill="#e2e8f0" stroke="#94a3b8" />
                    <text x="580" y="92" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">
                      RACK E-01 (Operating Systems)
                    </text>
                  </g>

                  <g className="cursor-pointer">
                    <rect x="500" y="120" width="160" height="35" rx="6" fill="#e2e8f0" stroke="#94a3b8" />
                    <text x="580" y="142" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">
                      RACK E-03 (Database Systems)
                    </text>
                  </g>

                  {/* Digital Catalogue Terminals */}
                  <rect x="340" y="380" width="120" height="24" rx="4" fill="#dbeafe" stroke="#3b82f6" />
                  <text x="400" y="396" textAnchor="middle" className="text-[9px] font-bold fill-blue-800">
                    OPAC SEARCH KIOSKS
                  </text>
                </>
              )}

              {/* First Floor Features */}
              {activeFloor === 'first' && (
                <>
                  <circle cx="400" cy="250" r="100" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
                  <text x="400" y="254" textAnchor="middle" className="text-[11px] font-bold fill-slate-400">
                    OPEN OVERLOOK TO ROTUNDA
                  </text>

                  {/* North Wing (AI & Deep Learning) */}
                  <rect x="120" y="60" width="560" height="80" rx="12" fill="#eff6ff" stroke="#bfdbfe" />
                  <text x="400" y="85" textAnchor="middle" className="text-[11px] font-bold fill-blue-900">
                    NORTH WING: ADVANCED COMPUTING & ARTIFICIAL INTELLIGENCE
                  </text>

                  <rect x="180" y="100" width="180" height="30" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
                  <text x="270" y="119" textAnchor="middle" className="text-[9px] font-bold fill-slate-700">
                    RACK N2-08 (Deep Learning)
                  </text>

                  <rect x="440" y="100" width="180" height="30" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
                  <text x="530" y="119" textAnchor="middle" className="text-[9px] font-bold fill-slate-700">
                    RACK N3-04 (Computer Vision)
                  </text>

                  {/* South Wing (Software Engineering) */}
                  <rect x="120" y="360" width="560" height="80" rx="12" fill="#f8fafc" stroke="#e2e8f0" />
                  <text x="400" y="385" textAnchor="middle" className="text-[11px] font-bold fill-slate-800">
                    SOUTH WING: SOFTWARE ARCHITECTURE & SYSTEMS DESIGN
                  </text>

                  <rect x="240" y="400" width="320" height="30" rx="4" fill="#e2e8f0" stroke="#94a3b8" />
                  <text x="400" y="419" textAnchor="middle" className="text-[9px] font-bold fill-slate-700">
                    RACK S1-05 (Clean Code & Software Craftsmanship)
                  </text>
                </>
              )}

              {/* Second Floor Features */}
              {activeFloor === 'second' && (
                <>
                  <circle cx="400" cy="250" r="80" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
                  <text x="400" y="254" textAnchor="middle" className="text-[11px] font-bold fill-slate-400">
                    ROTUNDA SKYLIGHT APERTURE
                  </text>

                  {/* Management Stacks */}
                  <rect x="100" y="100" width="260" height="280" rx="12" fill="#f0fdf4" stroke="#bbf7d0" />
                  <text x="230" y="130" textAnchor="middle" className="text-[11px] font-bold fill-emerald-900">
                    ALLIANCE SCHOOL OF BUSINESS WING
                  </text>

                  <rect x="130" y="180" width="200" height="35" rx="6" fill="#e2e8f0" stroke="#94a3b8" />
                  <text x="230" y="202" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">
                    RACK M4-02 (Corporate Finance)
                  </text>

                  {/* Law Stacks */}
                  <rect x="440" y="100" width="260" height="280" rx="12" fill="#fff1f2" stroke="#fecdd3" />
                  <text x="570" y="130" textAnchor="middle" className="text-[11px] font-bold fill-rose-900">
                    ALLIANCE SCHOOL OF LAW ARCHIVES
                  </text>

                  <rect x="470" y="180" width="200" height="35" rx="6" fill="#e2e8f0" stroke="#94a3b8" />
                  <text x="570" y="202" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">
                    RACK L1-01 (Constitutional Law Treatises)
                  </text>
                </>
              )}

              {/* Dynamic Target Marker when a book is selected */}
              {selectedBook && selectedBook.shelfLocation.floorId === activeFloor && (
                <g>
                  {/* Ping Animation Circles */}
                  <circle
                    cx={selectedBook.shelfLocation.coordinates.x * 8}
                    cy={selectedBook.shelfLocation.coordinates.y * 5}
                    r="24"
                    fill="#3b82f6"
                    opacity="0.25"
                  >
                    <animate attributeName="r" values="14;34;14" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle
                    cx={selectedBook.shelfLocation.coordinates.x * 8}
                    cy={selectedBook.shelfLocation.coordinates.y * 5}
                    r="12"
                    fill="#2563eb"
                  />
                  <circle
                    cx={selectedBook.shelfLocation.coordinates.x * 8}
                    cy={selectedBook.shelfLocation.coordinates.y * 5}
                    r="5"
                    fill="#ffffff"
                  />
                  {/* Target Callout Box */}
                  <g transform={`translate(${selectedBook.shelfLocation.coordinates.x * 8 - 75}, ${selectedBook.shelfLocation.coordinates.y * 5 - 45})`}>
                    <rect width="150" height="32" rx="6" fill="#0f172a" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
                    <text x="75" y="15" textAnchor="middle" className="text-[9px] font-bold fill-amber-400">
                      {selectedBook.shelfLocation.rack}
                    </text>
                    <text x="75" y="26" textAnchor="middle" className="text-[8px] font-medium fill-slate-200">
                      Bay {selectedBook.shelfLocation.bay} · Shelf {selectedBook.shelfLocation.shelf}
                    </text>
                  </g>
                </g>
              )}
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600" />
                Target Book Shelf
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-800" />
                Circulation Desk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-300" />
                Physical Stacks
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Floor Coordinates: Verified via Alliance RFID Mesh
            </span>
          </div>
        </div>

        {/* Navigation Step-by-Step & Verified Shelf Checker */}
        <div className="lg:col-span-4 space-y-4">
          {selectedBook ? (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Navigating To
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                    {selectedBook.title}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedBook.author}</p>
                </div>
                {onClearSelection && (
                  <button
                    onClick={onClearSelection}
                    className="text-xs text-slate-400 hover:text-slate-600 p-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Exact Location Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 mb-4 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Floor:</span>
                  <span className="font-bold text-slate-800">{selectedBook.shelfLocation.floorName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Wing / Aisle:</span>
                  <span className="font-bold text-slate-800">
                    {selectedBook.shelfLocation.wing} · {selectedBook.shelfLocation.aisle}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Exact Shelf:</span>
                  <span className="font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedBook.shelfLocation.rack} (Bay {selectedBook.shelfLocation.bay}, Shelf {selectedBook.shelfLocation.shelf})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Call Number:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedBook.shelfLocation.callNumber}</span>
                </div>
              </div>

              {/* Walking Steps */}
              <div className="space-y-3 mb-5">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Footprints className="w-4 h-4 text-blue-600" />
                  Turn-by-Turn Wayfinding
                </h4>
                <ol className="relative border-l border-blue-200 ml-2 space-y-3 text-xs">
                  <li className="ml-4">
                    <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-600 border border-white" />
                    <span className="font-semibold text-slate-800">Start at Rotunda Ground Entrance</span>
                    <p className="text-[11px] text-slate-500">Proceed through RFID security gate toward glass dome.</p>
                  </li>
                  <li className="ml-4">
                    <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-400 border border-white" />
                    <span className="font-semibold text-slate-800">
                      {selectedBook.shelfLocation.floorId === 'ground'
                        ? 'Follow Central Rotunda Perimeter'
                        : `Take ${selectedBook.shelfLocation.wing.includes('North') ? 'West' : 'East'} Staircase to ${selectedBook.shelfLocation.floorName}`}
                    </span>
                    <p className="text-[11px] text-slate-500">Estimated transit: ~45 seconds.</p>
                  </li>
                  <li className="ml-4">
                    <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                    <span className="font-semibold text-slate-800">
                      Arrive at {selectedBook.shelfLocation.rack}
                    </span>
                    <p className="text-[11px] text-slate-500">Look for Bay {selectedBook.shelfLocation.bay}, Level {selectedBook.shelfLocation.shelf}.</p>
                  </li>
                </ol>
              </div>

              {/* RFID Verified Shelf Scan Simulation */}
              <div className="border-t border-slate-100 pt-4">
                {rfidScanned ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center text-xs text-emerald-800">
                    <div className="flex items-center justify-center gap-1.5 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Shelf Position Verified via RFID!
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      RFID Tag {selectedBook.shelfLocation.rfidTag} confirmed in place. +50 Quest XP awarded!
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleSimulateScan}
                    disabled={scanning}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <ScanBarcode className="w-4 h-4" />
                    {scanning ? 'Verifying Physical Shelf Tag...' : 'Simulate Shelf RFID Verification'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Select Any Book to Navigate</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Click <strong>"Locate on Shelf"</strong> from your Active Loans, Syllabus Catalog, or Reservations to calculate the route and pinpoint its shelf.
              </p>
            </div>
          )}

          {/* Library Floor Statistics */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              Central Library Overview
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Total Floor Area</span>
                <strong className="text-slate-900 text-sm font-bold">55,000 sq.ft</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Seating Capacity</span>
                <strong className="text-slate-900 text-sm font-bold">1,000+ Readers</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Automation</span>
                <strong className="text-slate-900 text-sm font-bold">100% RFID & Barcode</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Architecture</span>
                <strong className="text-slate-900 text-sm font-bold">Rotunda Glass Dome</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
