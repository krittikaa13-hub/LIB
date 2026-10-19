import React from 'react';
import {
  Trophy,
  Award,
  Star,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
  Compass,
  KeyRound,
  BookMarked,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { StudentProfile } from '../../types/library';

interface LibraryQuestViewProps {
  student: StudentProfile;
  onExploreCatalog: () => void;
  onExploreFloorMap: () => void;
}

export const LibraryQuestView: React.FC<LibraryQuestViewProps> = ({
  student,
  onExploreCatalog,
  onExploreFloorMap,
}) => {
  const { quest } = student;
  const progressPercent = Math.min(100, Math.round((quest.xp / quest.xpNextLevel) * 100));

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'KeyRound':
        return <KeyRound className="w-5 h-5 text-amber-500" />;
      case 'BookMarked':
        return <BookMarked className="w-5 h-5 text-blue-500" />;
      case 'Award':
        return <Award className="w-5 h-5 text-emerald-500" />;
      default:
        return <Trophy className="w-5 h-5 text-amber-500" />;
    }
  };

  const renderMissionIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-emerald-600" />;
      case 'Clock':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Scholar Level Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full text-xs text-amber-800 font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            Library Quest · Academic Engagement Rewards
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Scholar Journey: Level {quest.level} ({quest.title})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Complete curriculum challenges, on-time borrowing habits, and physical shelf wayfinding missions to earn research badges and university library privileges.
          </p>
        </div>

        {/* Level XP Meter */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 min-w-[260px] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Rank Progress</span>
            <span className="font-mono font-extrabold text-blue-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>{quest.xp} Total XP</span>
            <span>Target: {quest.xpNextLevel} XP</span>
          </div>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active & Completed Missions */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Active Reading & Wayfinding Missions ({quest.missions.length})
            </h3>
            <span className="text-xs text-slate-400">Semester IV Curricula</span>
          </div>

          <div className="space-y-4">
            {quest.missions.map((m) => {
              const missionProgress = Math.min(100, Math.round((m.progress / m.maxProgress) * 100));

              return (
                <div
                  key={m.id}
                  className={`border rounded-xl p-4 sm:p-5 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    m.completed
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        m.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {m.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : renderMissionIcon(m.badgeIcon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                        {m.completed && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{m.description}</p>

                      {/* Progress Bar */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              m.completed ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${missionProgress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-medium text-slate-600">
                          {m.progress} / {m.maxProgress}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="text-right">
                      <span className="font-bold text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg inline-block">
                        +{m.xpReward} XP
                      </span>
                    </div>
                    {!m.completed && m.category === 'EXPLORATION' && (
                      <button
                        onClick={onExploreFloorMap}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition cursor-pointer"
                      >
                        Navigate Shelf
                      </button>
                    )}
                    {!m.completed && m.category === 'SYLLABUS' && (
                      <button
                        onClick={onExploreCatalog}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition cursor-pointer"
                      >
                        Browse Books
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Badges Showcase */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              Achievements Unlocked ({quest.badges.length})
            </h3>
          </div>

          <div className="space-y-3">
            {quest.badges.map((b) => (
              <div
                key={b.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 hover:bg-slate-100/60 transition"
              >
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shrink-0 mt-0.5 shadow-xs">
                  {renderBadgeIcon(b.icon)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{b.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{b.description}</p>
                  {b.unlockedAt && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Unlocked on {b.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Academic Honor Code Note */}
          <div className="mt-4 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
            <span className="font-bold flex items-center gap-1 text-[11px] text-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Scholar Privileges
            </span>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Achieving Level 4 (Senior Scholar) unlocks extended loan periods (21 days) and reservation priority for departmental reference collections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
