export interface ShelfLocation {
  floorId: 'ground' | 'first' | 'second';
  floorName: string;
  wing: string;
  aisle: string;
  rack: string;
  bay: number;
  shelf: number;
  callNumber: string;
  rfidTag: string;
  coordinates: { x: number; y: number };
}

export interface BookCopy {
  barcode: string;
  copyNumber: number;
  status: 'AVAILABLE' | 'BORROWED' | 'RESERVED_FOR_PICKUP' | 'MAINTENANCE';
  borrowedByRegNo?: string;
  borrowedDate?: string;
  dueDate?: string;
  reservedForRegNo?: string;
  reservedForGmail?: string;
  holdExpiresAt?: number;
}

export interface WaitingStudent {
  registrationNumber: string;
  studentName: string;
  gmail: string;
  requestedAt: number;
  priority: number;
  notified: boolean;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  department: string;
  courseCode: string;
  courseName: string;
  syllabusContext: string;
  edition: string;
  publisher: string;
  year: number;
  category: string;
  description: string;
  coverAccent: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: ShelfLocation;
  copies: BookCopy[];
  waitingList: WaitingStudent[];
  timesBorrowed: number;
}

export interface StudentLoan {
  loanId: string;
  bookId: string;
  bookTitle: string;
  author: string;
  barcode: string;
  borrowedDate: string;
  dueDate: string;
  renewalsRemaining: number;
  callNumber: string;
  shelfLocation: ShelfLocation;
  isOverdue: boolean;
  daysRemaining: number;
}

export interface BorrowingHistoryItem {
  historyId: string;
  bookId: string;
  bookTitle: string;
  author: string;
  borrowedDate: string;
  returnedDate: string;
  rating?: number;
}

export interface StudentReservation {
  reservationId: string;
  bookId: string;
  bookTitle: string;
  author: string;
  reservedAt: string;
  queuePosition: number;
  status: 'WAITING' | 'READY_FOR_PICKUP';
  pickupDeadline?: string;
  pickupLocation: string;
  callNumber: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'AVAILABILITY' | 'RESTOCK' | 'DEADLINE' | 'QUEST' | 'SYSTEM';
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  bookId?: string;
  priority: 'HIGH' | 'NORMAL' | 'URGENT';
}

export interface QuestMission {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  xpReward: number;
  completed: boolean;
  badgeIcon: string;
  category: 'SYLLABUS' | 'EXPLORATION' | 'RESEARCH' | 'HABIT';
}

export interface QuestBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'ORIENTATION' | 'SYLLABUS' | 'RESEARCH';
  courseCode?: string;
  enabled: boolean;
}

export interface QuizAttempt {
  id: string;
  studentRegNo: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  xpAwarded: number;
}

export interface StudentProfile {
  registrationNumber: string;
  name: string;
  gmail: string;
  department: string;
  semester: number;
  degree: string;
  activeLoans: StudentLoan[];
  borrowingHistory: BorrowingHistoryItem[];
  activeReservations: StudentReservation[];
  notifications: NotificationItem[];
  quizAttempts: QuizAttempt[];
  quest: {
    level: number;
    xp: number;
    xpNextLevel: number;
    title: string;
    missions: QuestMission[];
    badges: QuestBadge[];
  };
}

export interface AdminSession {
  token: string;
  username: string;
  name: string;
  role: 'ADMIN';
  loginAt: string;
  isDemo: boolean;
}

export interface AvailabilityEvent {
  id: string;
  bookId: string;
  bookTitle: string;
  barcode: string;
  timestamp: number;
  allocatedToRegNo?: string;
  allocatedToName?: string;
  allocatedToGmail?: string;
  emailStatus: 'SENT' | 'FAILED' | 'PENDING' | 'SKIPPED';
  pickupDeadline?: string;
  processed: boolean;
  actionType: 'RETURN' | 'RESTOCK' | 'NEW_COPY';
}

export interface LibrarianAnalytics {
  overview: {
    totalTitles: number;
    totalCopies: number;
    availableCopies: number;
    totalBorrowed: number;
    totalWaitingStudents: number;
    circulationRate: number;
  };
  priorityRestockList: Array<{
    id: string;
    title: string;
    author: string;
    courseCode: string;
    department: string;
    totalCopies: number;
    availableCopies: number;
    waitingCount: number;
    timesBorrowed: number;
    demandRatio: number;
    priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'SUFFICIENT';
  }>;
  recentActivity: Array<{
    id: string;
    bookId: string;
    bookTitle: string;
    action: string;
    timestamp: number;
    details: string;
  }>;
}

export interface OfficialResource {
  title: string;
  description: string;
  url: string;
  category: 'PORTAL' | 'CATALOGUE' | 'WAYFINDING' | 'DIGITAL_COLLECTIONS' | 'SUPPORT';
  badge: string;
}
