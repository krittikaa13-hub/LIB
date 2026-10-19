import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  Book,
  BookCopy,
  ShelfLocation,
  StudentLoan,
  BorrowingHistoryItem,
  StudentReservation,
  NotificationItem,
  QuestMission,
  QuestBadge,
  StudentProfile,
  LibrarianAnalytics,
  WaitingStudent,
  QuizQuestion,
  QuizAttempt,
  AdminSession,
  AvailabilityEvent,
} from '../types/library';

// File path for persistent JSON database
const DB_FILE_PATH = path.resolve(process.cwd(), 'smartlib_database.json');

// Initial seed books for Alliance University Central Library
export const INITIAL_BOOKS: Book[] = [
  {
    id: 'bk-101',
    isbn: '978-0131103627',
    title: 'The C Programming Language',
    author: 'Brian W. Kernighan, Dennis M. Ritchie',
    department: 'Computer Science & Engineering',
    courseCode: 'CS102',
    courseName: 'Structured Programming Fundamentals',
    syllabusContext: 'Required core textbook for CS102: Module 2 (Memory Management, Pointers & System Structures).',
    edition: '2nd Edition',
    publisher: 'Prentice Hall',
    year: 2022,
    category: 'Computer Science',
    description: 'The definitive classic reference by the creators of C, essential for systems programming and embedded computing curricula.',
    coverAccent: 'from-blue-700 to-indigo-900',
    totalCopies: 6,
    availableCopies: 1,
    shelfLocation: {
      floorId: 'ground',
      floorName: 'Ground Floor Rotunda',
      wing: 'North Wing',
      aisle: 'Aisle B',
      rack: 'Rack B-02',
      bay: 3,
      shelf: 2,
      callNumber: 'QA76.73 .C15 K47 2022',
      rfidTag: 'RFID-AU-CS-101',
      coordinates: { x: 38, y: 35 },
    },
    timesBorrowed: 84,
    copies: [
      { barcode: 'AU-BC-101-1', copyNumber: 1, status: 'AVAILABLE' },
      { barcode: 'AU-BC-101-2', copyNumber: 2, status: 'BORROWED', borrowedByRegNo: 'AU2023CSE0042', dueDate: '2026-10-24' },
      { barcode: 'AU-BC-101-3', copyNumber: 3, status: 'BORROWED', borrowedByRegNo: 'AU2024ENG0899', dueDate: '2026-10-22' },
      { barcode: 'AU-BC-101-4', copyNumber: 4, status: 'BORROWED', borrowedByRegNo: 'AU2023CSE0112', dueDate: '2026-10-26' },
      { barcode: 'AU-BC-101-5', copyNumber: 5, status: 'BORROWED', borrowedByRegNo: 'AU2024ENG0511', dueDate: '2026-10-25' },
      { barcode: 'AU-BC-101-6', copyNumber: 6, status: 'BORROWED', borrowedByRegNo: 'AU2024ENG0334', dueDate: '2026-10-28' },
    ],
    waitingList: [],
  },
  {
    id: 'bk-102',
    isbn: '978-0262033848',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    department: 'Computer Science & Engineering',
    courseCode: 'CS301',
    courseName: 'Data Structures and Algorithms',
    syllabusContext: 'Primary reference for CS301 Midterm & End-term exams (Modules 3-5: Dynamic Programming & Graph Algorithms).',
    edition: '4th Edition',
    publisher: 'MIT Press',
    year: 2022,
    category: 'Computer Science',
    description: 'Comprehensive and rigorous introduction to modern algorithms, extensively referenced across undergraduate and postgraduate CS courses.',
    coverAccent: 'from-navy-800 to-slate-900',
    totalCopies: 5,
    availableCopies: 0,
    shelfLocation: {
      floorId: 'ground',
      floorName: 'Ground Floor Rotunda',
      wing: 'North Wing',
      aisle: 'Aisle C',
      rack: 'Rack C-04',
      bay: 1,
      shelf: 4,
      callNumber: 'QA76.6 .C662 2022',
      rfidTag: 'RFID-AU-CS-102',
      coordinates: { x: 42, y: 40 },
    },
    timesBorrowed: 126,
    copies: [
      { barcode: 'AU-BC-102-1', copyNumber: 1, status: 'BORROWED', borrowedByRegNo: 'AU2023CSE0018', dueDate: '2026-10-21' },
      { barcode: 'AU-BC-102-2', copyNumber: 2, status: 'BORROWED', borrowedByRegNo: 'AU2023CSE0099', dueDate: '2026-10-23' },
      { barcode: 'AU-BC-102-3', copyNumber: 3, status: 'BORROWED', borrowedByRegNo: 'AU2024ENG0201', dueDate: '2026-10-25' },
      { barcode: 'AU-BC-102-4', copyNumber: 4, status: 'BORROWED', borrowedByRegNo: 'AU2024ENG0412', dueDate: '2026-10-27' },
      { barcode: 'AU-BC-102-5', copyNumber: 5, status: 'BORROWED', borrowedByRegNo: 'AU2024ENG0788', dueDate: '2026-10-29' },
    ],
    waitingList: [
      {
        registrationNumber: 'AU2024ENG0123',
        studentName: 'Krittika Sharma',
        gmail: 'krittikaa13@gmail.com',
        requestedAt: Date.now() - 3600000 * 8,
        priority: 1,
        notified: false,
      },
      {
        registrationNumber: 'AU2024ENG0899',
        studentName: 'Arjun Verma',
        gmail: 'arjun.verma@alliance.edu.in',
        requestedAt: Date.now() - 3600000 * 2,
        priority: 2,
        notified: false,
      },
    ],
  },
  {
    id: 'bk-103',
    isbn: '978-0134093413',
    title: 'Operating System Concepts (Silberschatz Dinosaur Book)',
    author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
    department: 'Computer Science & Engineering',
    courseCode: 'CS304',
    courseName: 'Operating Systems & Concurrency',
    syllabusContext: 'Essential textbook for CS304 Units 2 & 4 (Process Synchronization, Deadlocks, Virtual Memory Management).',
    edition: '10th Edition',
    publisher: 'John Wiley & Sons',
    year: 2023,
    category: 'Computer Science',
    description: 'Illustrated guide covering processes, threads, CPU scheduling, file systems, distributed storage, and operating system virtualization.',
    coverAccent: 'from-amber-700 to-amber-950',
    totalCopies: 4,
    availableCopies: 2,
    shelfLocation: {
      floorId: 'ground',
      floorName: 'Ground Floor Rotunda',
      wing: 'East Stacks',
      aisle: 'Aisle E',
      rack: 'Rack E-01',
      bay: 2,
      shelf: 3,
      callNumber: 'QA76.76.O63 S558 2023',
      rfidTag: 'RFID-AU-CS-103',
      coordinates: { x: 75, y: 50 },
    },
    timesBorrowed: 92,
    copies: [
      { barcode: 'AU-BC-103-1', copyNumber: 1, status: 'AVAILABLE' },
      { barcode: 'AU-BC-103-2', copyNumber: 2, status: 'AVAILABLE' },
      { barcode: 'AU-BC-103-3', copyNumber: 3, status: 'BORROWED', borrowedByRegNo: 'AU2023CSE0155', dueDate: '2026-10-23' },
      { barcode: 'AU-BC-103-4', copyNumber: 4, status: 'BORROWED', borrowedByRegNo: 'AU2024ENG0012', dueDate: '2026-10-27' },
    ],
    waitingList: [],
  },
  {
    id: 'bk-104',
    isbn: '978-0262035613',
    title: 'Deep Learning',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    department: 'Artificial Intelligence & Data Science',
    courseCode: 'AI405',
    courseName: 'Neural Networks & Deep Learning',
    syllabusContext: 'Textbook for AI405 (Convolutional Architectures, Optimization for Deep Models, Sequence Modeling).',
    edition: '1st Edition',
    publisher: 'MIT Press',
    year: 2021,
    category: 'Artificial Intelligence',
    description: 'An authoritative mathematical introduction to deep neural networks, unsupervised representations, and deep generative models.',
    coverAccent: 'from-emerald-800 to-slate-900',
    totalCopies: 4,
    availableCopies: 1,
    shelfLocation: {
      floorId: 'first',
      floorName: 'First Floor - North Wing',
      wing: 'North Wing',
      aisle: 'Aisle N-2',
      rack: 'Rack N2-08',
      bay: 4,
      shelf: 1,
      callNumber: 'Q325.5 .G66 2021',
      rfidTag: 'RFID-AU-AI-104',
      coordinates: { x: 45, y: 25 },
    },
    timesBorrowed: 79,
    copies: [
      { barcode: 'AU-BC-104-1', copyNumber: 1, status: 'AVAILABLE' },
      { barcode: 'AU-BC-104-2', copyNumber: 2, status: 'BORROWED', borrowedByRegNo: 'AU2023CSE0088', dueDate: '2026-10-22' },
      { barcode: 'AU-BC-104-3', copyNumber: 3, status: 'BORROWED', borrowedByRegNo: 'AU2024ENG0441', dueDate: '2026-10-25' },
      { barcode: 'AU-BC-104-4', copyNumber: 4, status: 'BORROWED', borrowedByRegNo: 'AU2023CSE0204', dueDate: '2026-10-28' },
    ],
    waitingList: [],
  },
  {
    id: 'bk-105',
    isbn: '978-0078022159',
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    department: 'Computer Science & Engineering',
    courseCode: 'CS302',
    courseName: 'Database Management Systems',
    syllabusContext: 'Mandatory syllabus text for CS302 (Relational Model, Normalization Forms BCNF/3NF, ACID Transactions).',
    edition: '7th Edition',
    publisher: 'McGraw-Hill',
    year: 2023,
    category: 'Computer Science',
    description: 'Fundamental concepts of database design, languages, and system implementation, with SQL:2016 and modern NoSQL paradigms.',
    coverAccent: 'from-sky-800 to-indigo-950',
    totalCopies: 5,
    availableCopies: 0,
    shelfLocation: {
      floorId: 'ground',
      floorName: 'Ground Floor Rotunda',
      wing: 'East Stacks',
      aisle: 'Aisle E',
      rack: 'Rack E-03',
      bay: 1,
      shelf: 2,
      callNumber: 'QA76.9.D3 S56 2023',
      rfidTag: 'RFID-AU-CS-105',
      coordinates: { x: 78, y: 55 },
    },
    timesBorrowed: 110,
    copies: [
      { barcode: 'AU-BC-105-1', copyNumber: 1, status: 'BORROWED', borrowedByRegNo: 'AU2024ENG0123', dueDate: '2026-10-23' },
      { barcode: 'AU-BC-105-2', copyNumber: 2, status: 'BORROWED', borrowedByRegNo: 'AU2023CSE0011', dueDate: '2026-10-22' },
      { barcode: 'AU-BC-105-3', copyNumber: 3, status: 'BORROWED', borrowedByRegNo: 'AU2024ENG0912', dueDate: '2026-10-24' },
      { barcode: 'AU-BC-105-4', copyNumber: 4, status: 'BORROWED', borrowedByRegNo: 'AU2023CSE0415', dueDate: '2026-10-25' },
      { barcode: 'AU-BC-105-5', copyNumber: 5, status: 'BORROWED', borrowedByRegNo: 'AU2024ENG0289', dueDate: '2026-10-29' },
    ],
    waitingList: [
      {
        registrationNumber: 'AU2023CSE0112',
        studentName: 'Pooja Iyer',
        gmail: 'pooja.iyer@alliance.edu.in',
        requestedAt: Date.now() - 3600000 * 24,
        priority: 1,
        notified: false,
      },
    ],
  },
  {
    id: 'bk-106',
    isbn: '978-0132350884',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    department: 'Computer Science & Engineering',
    courseCode: 'CS305',
    courseName: 'Software Engineering & Practices',
    syllabusContext: 'Recommended practical reading for CS305 Software Engineering Laboratory Capstone Project.',
    edition: '1st Edition',
    publisher: 'Prentice Hall',
    year: 2020,
    category: 'Software Engineering',
    description: 'Principles, patterns, and practices of writing clean, maintainable, self-documenting code with real-world case studies.',
    coverAccent: 'from-cyan-900 to-slate-900',
    totalCopies: 4,
    availableCopies: 2,
    shelfLocation: {
      floorId: 'first',
      floorName: 'First Floor - South Wing',
      wing: 'South Wing',
      aisle: 'Aisle S-1',
      rack: 'Rack S1-05',
      bay: 3,
      shelf: 2,
      callNumber: 'QA76.76.D47 M37 2020',
      rfidTag: 'RFID-AU-SE-106',
      coordinates: { x: 50, y: 75 },
    },
    timesBorrowed: 68,
    copies: [
      { barcode: 'AU-BC-106-1', copyNumber: 1, status: 'AVAILABLE' },
      { barcode: 'AU-BC-106-2', copyNumber: 2, status: 'AVAILABLE' },
      { barcode: 'AU-BC-106-3', copyNumber: 3, status: 'BORROWED', borrowedByRegNo: 'AU2024ENG0101', dueDate: '2026-10-24' },
      { barcode: 'AU-BC-106-4', copyNumber: 4, status: 'BORROWED', borrowedByRegNo: 'AU2023CSE0318', dueDate: '2026-10-26' },
    ],
    waitingList: [],
  },
  {
    id: 'bk-107',
    isbn: '978-1119577577',
    title: 'Principles of Corporate Finance',
    author: 'Richard A. Brealey, Stewart C. Myers, Franklin Allen',
    department: 'Alliance School of Business',
    courseCode: 'MGT201',
    courseName: 'Corporate Finance & Valuation',
    syllabusContext: 'Prescribed syllabus core textbook for MBA / BBA Finance Major (Modules 1-4).',
    edition: '13th Edition',
    publisher: 'McGraw-Hill Education',
    year: 2022,
    category: 'Management',
    description: 'The world standard for corporate financial theory, capital budgeting, risk hedging, and financial decision analysis.',
    coverAccent: 'from-emerald-900 to-teal-950',
    totalCopies: 4,
    availableCopies: 2,
    shelfLocation: {
      floorId: 'second',
      floorName: 'Second Floor Mezzanine',
      wing: 'West Reading Hall',
      aisle: 'Aisle M-4',
      rack: 'Rack M4-02',
      bay: 2,
      shelf: 3,
      callNumber: 'HG4026 .B67 2022',
      rfidTag: 'RFID-AU-MGT-107',
      coordinates: { x: 30, y: 65 },
    },
    timesBorrowed: 52,
    copies: [
      { barcode: 'AU-BC-107-1', copyNumber: 1, status: 'AVAILABLE' },
      { barcode: 'AU-BC-107-2', copyNumber: 2, status: 'AVAILABLE' },
      { barcode: 'AU-BC-107-3', copyNumber: 3, status: 'BORROWED', borrowedByRegNo: 'AU2023BBA0019', dueDate: '2026-10-25' },
      { barcode: 'AU-BC-107-4', copyNumber: 4, status: 'BORROWED', borrowedByRegNo: 'AU2024MBA0120', dueDate: '2026-10-28' },
    ],
    waitingList: [],
  },
  {
    id: 'bk-108',
    isbn: '978-0199540700',
    title: 'Constitutional Law of India',
    author: 'Dr. H. M. Seervai, F. S. Nariman',
    department: 'Alliance School of Law',
    courseCode: 'LAW105',
    courseName: 'Indian Constitutional Jurisprudence',
    syllabusContext: 'Required legal treatise for Constitutional Law Semester III Moot Court Competitions.',
    edition: '4th Edition',
    publisher: 'Universal Law Publishing',
    year: 2021,
    category: 'Law',
    description: 'Monumental critical commentary analyzing judicial precedents, constitutional amendments, and landmark Supreme Court rulings.',
    coverAccent: 'from-rose-900 to-slate-950',
    totalCopies: 3,
    availableCopies: 1,
    shelfLocation: {
      floorId: 'second',
      floorName: 'Second Floor Mezzanine',
      wing: 'East Stacks',
      aisle: 'Aisle L-1',
      rack: 'Rack L1-01',
      bay: 1,
      shelf: 1,
      callNumber: 'KNS1744.5 1950 .S44 2021',
      rfidTag: 'RFID-AU-LAW-108',
      coordinates: { x: 70, y: 30 },
    },
    timesBorrowed: 41,
    copies: [
      { barcode: 'AU-BC-108-1', copyNumber: 1, status: 'AVAILABLE' },
      { barcode: 'AU-BC-108-2', copyNumber: 2, status: 'BORROWED', borrowedByRegNo: 'AU2023LLB0045', dueDate: '2026-10-23' },
      { barcode: 'AU-BC-108-3', copyNumber: 3, status: 'BORROWED', borrowedByRegNo: 'AU2024BA0088', dueDate: '2026-10-27' },
    ],
    waitingList: [],
  },
];

// Initial playable quiz questions for orientation & syllabus
export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    question: 'Under Alliance University Central Library borrowing regulations, what is the standard loan period for undergraduate students?',
    options: ['7 days', '14 days (with up to 2 online renewals)', '30 days', 'Until end of semester'],
    correctIndex: 1,
    explanation: 'Students receive a 14-day loan period for general circulation titles, eligible for up to 2 online renewals unless requested on another student waiting list.',
    category: 'ORIENTATION',
    enabled: true,
  },
  {
    id: 'q-2',
    question: 'In the Library of Congress classification system used by Alliance Central Library, what subject do Call Numbers starting with "QA" represent?',
    options: ['Philosophy & Psychology', 'Mathematics, Algorithms & Computer Science', 'Law & Jurisprudence', 'Fine Arts & Architecture'],
    correctIndex: 1,
    explanation: 'QA is the Library of Congress subclass for Mathematics and Computer Science (e.g. QA76 covers computing, programming, and algorithms).',
    category: 'RESEARCH',
    enabled: true,
  },
  {
    id: 'q-3',
    question: 'What automated circulation and security technology is embedded across all 55,000 sq.ft of the Alliance Central Library?',
    options: ['Manual register checkout', '100% RFID Smart Tags and Barcode Automation', 'Optical magnetic strips only', 'NFC phone tags only'],
    correctIndex: 1,
    explanation: 'Alliance University Central Library is fully automated with high-frequency RFID tags and barcode scanners for contact-free checkouts, returns, and shelf inventory verification.',
    category: 'ORIENTATION',
    enabled: true,
  },
  {
    id: 'q-4',
    question: 'Which core reference textbook is prescribed for CS301 (Data Structures and Algorithms) Units 3 & 4 covering Dynamic Programming & Graphs?',
    options: ['Introduction to Algorithms (CLRS)', 'Head First Java', 'Clean Code by Robert C. Martin', 'Automating the Boring Stuff with Python'],
    correctIndex: 0,
    explanation: 'Introduction to Algorithms by Cormen, Leiserson, Rivest, and Stein (CLRS) is the syllabus primary reference for advanced algorithms and data structures.',
    category: 'SYLLABUS',
    courseCode: 'CS301',
    enabled: true,
  },
  {
    id: 'q-5',
    question: 'When a reserved book is checked in and SmartRestock assigns it to you, how long is the physical copy held at the Circulation Desk before moving to the next person?',
    options: ['12 hours', '24 hours', '48 hours', '7 calendar days'],
    correctIndex: 2,
    explanation: 'SmartRestock holds the physical copy at the Central Circulation Desk for exactly 48 hours from the timestamp of availability before reallocating to the next student in queue.',
    category: 'ORIENTATION',
    enabled: true,
  },
];

class LibraryStore {
  private books: Map<string, Book> = new Map();
  private students: Map<string, StudentProfile> = new Map();
  private quizzes: QuizQuestion[] = [];
  private quizAttempts: QuizAttempt[] = [];
  private adminSessions: Map<string, AdminSession> = new Map();
  private availabilityEvents: AvailabilityEvent[] = [];
  private processedEventIds: Set<string> = new Set();
  private restockActivityLog: Array<{
    id: string;
    bookId: string;
    bookTitle: string;
    action: string;
    timestamp: number;
    details: string;
  }> = [];

  constructor() {
    this.loadFromDisk();
  }

  // Load state from file or seed
  private loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);

        if (parsed.books && Array.isArray(parsed.books)) {
          parsed.books.forEach((b: Book) => this.books.set(b.id, b));
        }
        if (parsed.students && Array.isArray(parsed.students)) {
          parsed.students.forEach((s: StudentProfile) => this.students.set(s.registrationNumber, s));
        }
        if (parsed.quizzes && Array.isArray(parsed.quizzes)) {
          this.quizzes = parsed.quizzes;
        } else {
          this.quizzes = JSON.parse(JSON.stringify(INITIAL_QUIZ_QUESTIONS));
        }
        if (parsed.quizAttempts && Array.isArray(parsed.quizAttempts)) {
          this.quizAttempts = parsed.quizAttempts;
        }
        if (parsed.availabilityEvents && Array.isArray(parsed.availabilityEvents)) {
          this.availabilityEvents = parsed.availabilityEvents;
          this.availabilityEvents.forEach((e) => this.processedEventIds.add(e.id));
        }
        if (parsed.restockActivityLog && Array.isArray(parsed.restockActivityLog)) {
          this.restockActivityLog = parsed.restockActivityLog;
        }
        console.log(`[SmartLib Database] Loaded ${this.books.size} books, ${this.students.size} students from disk.`);
        return;
      }
    } catch (err) {
      console.warn('[SmartLib Database] Failed to load database file, re-seeding:', err);
    }

    // Default Seed
    INITIAL_BOOKS.forEach((b) => this.books.set(b.id, JSON.parse(JSON.stringify(b))));
    this.quizzes = JSON.parse(JSON.stringify(INITIAL_QUIZ_QUESTIONS));

    // Default student profile
    const defaultStudent: StudentProfile = {
      registrationNumber: 'AU2024ENG0123',
      name: 'Krittika Sharma',
      gmail: 'krittikaa13@gmail.com',
      department: 'Computer Science & Engineering',
      semester: 4,
      degree: 'B.Tech Computer Science',
      activeLoans: [
        {
          loanId: 'LN-2026-8812',
          bookId: 'bk-105',
          bookTitle: 'Database System Concepts (7th Ed)',
          author: 'Silberschatz, Korth, Sudarshan',
          barcode: 'AU-BC-105-1',
          borrowedDate: '2026-10-09',
          dueDate: '2026-10-23',
          renewalsRemaining: 2,
          callNumber: 'QA76.9.D3 S56 2023',
          shelfLocation: INITIAL_BOOKS.find((b) => b.id === 'bk-105')!.shelfLocation,
          isOverdue: false,
          daysRemaining: 4,
        },
      ],
      borrowingHistory: [
        {
          historyId: 'HIST-101',
          bookId: 'bk-101',
          bookTitle: 'The C Programming Language',
          author: 'Brian W. Kernighan, Dennis M. Ritchie',
          borrowedDate: '2026-09-01',
          returnedDate: '2026-09-14',
          rating: 5,
        },
        {
          historyId: 'HIST-102',
          bookId: 'bk-106',
          bookTitle: 'Clean Code: A Handbook of Agile Craftsmanship',
          author: 'Robert C. Martin',
          borrowedDate: '2026-09-18',
          returnedDate: '2026-10-02',
          rating: 5,
        },
      ],
      activeReservations: [
        {
          reservationId: 'RES-901',
          bookId: 'bk-102',
          bookTitle: 'Introduction to Algorithms (CLRS)',
          author: 'Cormen, Leiserson, Rivest, Stein',
          reservedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          queuePosition: 1,
          status: 'WAITING',
          pickupLocation: 'Ground Floor Central Circulation Desk',
          callNumber: 'QA76.6 .C662 2022',
        },
      ],
      notifications: [
        {
          id: 'notif-1',
          title: 'Welcome to SmartLib Portal',
          message: 'Your student account is authenticated. Access syllabus book recommendations, verified shelf navigation, and automated return alerts.',
          type: 'SYSTEM',
          timestamp: Date.now() - 3600000 * 2,
          read: false,
          priority: 'NORMAL',
        },
        {
          id: 'notif-2',
          title: 'Loan Reminder: Due in 4 Days',
          message: '"Database System Concepts" is due on 23 Oct 2026. You can renew online once before the due date.',
          type: 'DEADLINE',
          timestamp: Date.now() - 3600000 * 5,
          read: false,
          priority: 'NORMAL',
          bookId: 'bk-105',
        },
      ],
      quizAttempts: [],
      quest: {
        level: 3,
        xp: 450,
        xpNextLevel: 600,
        title: 'Junior Scholar',
        missions: [
          {
            id: 'm-1',
            title: 'Syllabus Explorer',
            description: 'Read or borrow 2 core reference books aligned with your Semester IV syllabus.',
            progress: 2,
            maxProgress: 2,
            xpReward: 150,
            completed: true,
            badgeIcon: 'GraduationCap',
            category: 'SYLLABUS',
          },
          {
            id: 'm-2',
            title: 'Smart Shelf Pioneer',
            description: 'Locate a physical book using the interactive floorplan and verify shelf location.',
            progress: 1,
            maxProgress: 2,
            xpReward: 100,
            completed: false,
            badgeIcon: 'Compass',
            category: 'EXPLORATION',
          },
          {
            id: 'm-3',
            title: 'Flawless Return Streak',
            description: 'Return or renew 3 borrowed titles on or before deadline without incurring overdue fees.',
            progress: 2,
            maxProgress: 3,
            xpReward: 120,
            completed: false,
            badgeIcon: 'Clock',
            category: 'HABIT',
          },
          {
            id: 'm-4',
            title: 'Orientation Scholar',
            description: 'Pass the Library Orientation Quiz with at least 80% score.',
            progress: 0,
            maxProgress: 1,
            xpReward: 100,
            completed: false,
            badgeIcon: 'Award',
            category: 'RESEARCH',
          },
        ],
        badges: [
          {
            id: 'b-1',
            title: 'Library First Step',
            description: 'Authenticated via AU Central Library OTP Portal.',
            icon: 'KeyRound',
            unlockedAt: '2026-09-01',
          },
          {
            id: 'b-2',
            title: 'Syllabus Pioneer',
            description: 'Borrowed first official semester curriculum textbook.',
            icon: 'BookMarked',
            unlockedAt: '2026-09-02',
          },
          {
            id: 'b-3',
            title: 'Punctual Reader',
            description: '100% on-time return rate maintained across loans.',
            icon: 'Award',
            unlockedAt: '2026-10-02',
          },
        ],
      },
    };

    this.students.set(defaultStudent.registrationNumber, defaultStudent);
    this.saveToDisk();
  }

  // Save current state to disk
  public saveToDisk() {
    try {
      const data = {
        books: Array.from(this.books.values()),
        students: Array.from(this.students.values()),
        quizzes: this.quizzes,
        quizAttempts: this.quizAttempts,
        availabilityEvents: this.availabilityEvents,
        restockActivityLog: this.restockActivityLog.slice(0, 50),
        lastSaved: new Date().toISOString(),
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[SmartLib Database] Failed to write database file to disk:', e);
    }
  }

  // ===================== Admin Authentication & Session Management =====================

  public loginAdmin(usernameInput: string, passwordInput: string): { success: boolean; token?: string; error?: string } {
    const configuredUser = (process.env.ADMIN_USERNAME || 'admin@alliance.edu.in').trim().toLowerCase();
    const configuredPass = (process.env.ADMIN_PASSWORD || 'SmartLibAdmin2026!').trim();

    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    if ((u === configuredUser || u === 'admin') && p === configuredPass) {
      const token = 'AU_ADMIN_' + crypto.randomBytes(32).toString('hex');
      const session: AdminSession = {
        token,
        username: u,
        name: 'Alliance Central Library Chief Administrator',
        role: 'ADMIN',
        loginAt: new Date().toISOString(),
        isDemo: true,
      };
      this.adminSessions.set(token, session);

      this.restockActivityLog.unshift({
        id: crypto.randomUUID(),
        bookId: 'SYSTEM',
        bookTitle: 'Admin Session',
        action: 'ADMIN_LOGIN',
        timestamp: Date.now(),
        details: `Administrator ${u} authenticated into Demo Librarian Console.`,
      });
      this.saveToDisk();

      return { success: true, token };
    }

    return { success: false, error: 'Invalid administrator credentials. For local evaluation, use the demo credentials provided.' };
  }

  public verifyAdminToken(token?: string): boolean {
    if (!token) return false;
    const clean = token.replace('Bearer ', '').trim();
    return this.adminSessions.has(clean);
  }

  public logoutAdmin(token?: string) {
    if (!token) return;
    const clean = token.replace('Bearer ', '').trim();
    this.adminSessions.delete(clean);
  }

  // ===================== Catalog & Book Operations =====================

  public getBooks(query?: string, department?: string, availability?: string): Book[] {
    let result = Array.from(this.books.values());

    if (query) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.courseCode.toLowerCase().includes(q) ||
          b.courseName.toLowerCase().includes(q) ||
          b.department.toLowerCase().includes(q) ||
          b.shelfLocation.callNumber.toLowerCase().includes(q)
      );
    }

    if (department && department !== 'All Departments') {
      result = result.filter((b) => b.department === department);
    }

    if (availability === 'AVAILABLE') {
      result = result.filter((b) => b.availableCopies > 0);
    } else if (availability === 'WAITING_LIST') {
      result = result.filter((b) => b.availableCopies === 0);
    }

    return result;
  }

  public getBookById(id: string): Book | undefined {
    return this.books.get(id);
  }

  public addBook(bookData: Partial<Book>): { success: boolean; message: string; book?: Book } {
    if (!bookData.title || !bookData.author || !bookData.isbn) {
      return { success: false, message: 'Title, Author, and ISBN are required.' };
    }

    // Check duplicate ISBN
    const duplicate = Array.from(this.books.values()).find((b) => b.isbn === bookData.isbn?.trim());
    if (duplicate) {
      return { success: false, message: `A book with ISBN ${bookData.isbn} already exists ("${duplicate.title}").` };
    }

    const id = 'bk-' + (this.books.size + 101);
    const initialCopiesCount = Math.max(1, bookData.totalCopies || 3);
    const copies: BookCopy[] = [];

    for (let i = 1; i <= initialCopiesCount; i++) {
      copies.push({
        barcode: `AU-BC-${id.replace('bk-', '')}-${i}`,
        copyNumber: i,
        status: 'AVAILABLE',
      });
    }

    const defaultShelf: ShelfLocation = {
      floorId: (bookData.shelfLocation?.floorId as any) || 'ground',
      floorName: bookData.shelfLocation?.floorName || 'Ground Floor Rotunda',
      wing: bookData.shelfLocation?.wing || 'Central Rotunda',
      aisle: bookData.shelfLocation?.aisle || 'Aisle A',
      rack: bookData.shelfLocation?.rack || 'Rack A-01',
      bay: bookData.shelfLocation?.bay || 1,
      shelf: bookData.shelfLocation?.shelf || 1,
      callNumber: bookData.shelfLocation?.callNumber || `AU.${bookData.courseCode || 'GEN'}.${Date.now().toString().slice(-4)}`,
      rfidTag: `RFID-AU-${id.toUpperCase()}`,
      coordinates: bookData.shelfLocation?.coordinates || { x: 50, y: 50 },
    };

    const newBook: Book = {
      id,
      isbn: bookData.isbn.trim(),
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      department: bookData.department?.trim() || 'Computer Science & Engineering',
      courseCode: bookData.courseCode?.trim().toUpperCase() || 'GEN101',
      courseName: bookData.courseName?.trim() || 'General Academic Studies',
      syllabusContext: bookData.syllabusContext?.trim() || 'Standard Reference Collection.',
      edition: bookData.edition?.trim() || '1st Edition',
      publisher: bookData.publisher?.trim() || 'Alliance University Press',
      year: bookData.year || 2024,
      category: bookData.category?.trim() || 'Academic Reference',
      description: bookData.description?.trim() || 'Academic monograph accessioned into Central Library holdings.',
      coverAccent: bookData.coverAccent || 'from-blue-700 to-indigo-900',
      totalCopies: initialCopiesCount,
      availableCopies: initialCopiesCount,
      shelfLocation: defaultShelf,
      copies,
      waitingList: [],
      timesBorrowed: 0,
    };

    this.books.set(id, newBook);

    this.restockActivityLog.unshift({
      id: crypto.randomUUID(),
      bookId: newBook.id,
      bookTitle: newBook.title,
      action: 'ADD_BOOK',
      timestamp: Date.now(),
      details: `Added new catalogue title "${newBook.title}" with ${initialCopiesCount} physical copies.`,
    });

    this.saveToDisk();
    return { success: true, message: `Successfully accessioned "${newBook.title}" into library holdings.`, book: newBook };
  }

  public updateBook(id: string, updates: Partial<Book>): { success: boolean; message: string; book?: Book } {
    const book = this.books.get(id);
    if (!book) return { success: false, message: 'Book record not found.' };

    if (updates.title) book.title = updates.title.trim();
    if (updates.author) book.author = updates.author.trim();
    if (updates.isbn) book.isbn = updates.isbn.trim();
    if (updates.department) book.department = updates.department.trim();
    if (updates.courseCode) book.courseCode = updates.courseCode.trim().toUpperCase();
    if (updates.courseName) book.courseName = updates.courseName.trim();
    if (updates.syllabusContext) book.syllabusContext = updates.syllabusContext.trim();
    if (updates.edition) book.edition = updates.edition.trim();
    if (updates.publisher) book.publisher = updates.publisher.trim();
    if (updates.year) book.year = updates.year;
    if (updates.shelfLocation) book.shelfLocation = { ...book.shelfLocation, ...updates.shelfLocation };

    this.restockActivityLog.unshift({
      id: crypto.randomUUID(),
      bookId: book.id,
      bookTitle: book.title,
      action: 'UPDATE_BOOK',
      timestamp: Date.now(),
      details: `Updated metadata for "${book.title}".`,
    });

    this.saveToDisk();
    return { success: true, message: `Updated catalogue record for "${book.title}".`, book };
  }

  public deleteBook(id: string): { success: boolean; message: string } {
    const book = this.books.get(id);
    if (!book) return { success: false, message: 'Book record not found.' };

    // Check if copies are currently borrowed
    const hasBorrowedCopies = book.copies.some((c) => c.status === 'BORROWED');
    if (hasBorrowedCopies) {
      return { success: false, message: 'Cannot delete book: One or more physical copies are currently checked out to students.' };
    }

    this.books.delete(id);
    this.restockActivityLog.unshift({
      id: crypto.randomUUID(),
      bookId: id,
      bookTitle: book.title,
      action: 'DELETE_BOOK',
      timestamp: Date.now(),
      details: `Archived/deleted book record "${book.title}" from catalog.`,
    });

    this.saveToDisk();
    return { success: true, message: `Book record "${book.title}" successfully archived.` };
  }

  // ===================== Student Profile & Circulation =====================

  public getOrCreateStudent(registrationNumber: string, gmail?: string): StudentProfile {
    const cleanReg = registrationNumber.trim().toUpperCase();
    let student = this.students.get(cleanReg);
    if (!student) {
      student = {
        registrationNumber: cleanReg,
        name: `Student (${cleanReg})`,
        gmail: gmail || `${cleanReg.toLowerCase()}@alliance.edu.in`,
        department: 'Computer Science & Engineering',
        semester: 4,
        degree: 'B.Tech Computer Science',
        activeLoans: [],
        borrowingHistory: [],
        activeReservations: [],
        notifications: [
          {
            id: crypto.randomUUID(),
            title: 'SmartLib Account Active',
            message: 'Welcome to the Alliance University Central Library platform.',
            type: 'SYSTEM',
            timestamp: Date.now(),
            read: false,
            priority: 'NORMAL',
          },
        ],
        quizAttempts: [],
        quest: {
          level: 1,
          xp: 100,
          xpNextLevel: 250,
          title: 'Library Novice',
          missions: JSON.parse(JSON.stringify(INITIAL_BOOKS[0] ? [] : [])),
          badges: [],
        },
      };
      this.students.set(cleanReg, student);
      this.saveToDisk();
    }
    return student;
  }

  public borrowBook(registrationNumber: string, bookId: string): { success: boolean; message: string; loan?: StudentLoan } {
    const book = this.books.get(bookId);
    if (!book) return { success: false, message: 'Book not found in library catalog.' };

    const student = this.getOrCreateStudent(registrationNumber);

    if (student.activeLoans.length >= 4) {
      return { success: false, message: 'Maximum loan quota reached (4/4 active checkouts). Please return a book first.' };
    }

    if (student.activeLoans.some((l) => l.bookId === bookId)) {
      return { success: false, message: 'You already hold an active borrowed copy of this title.' };
    }

    // Find available copy (or held for this student)
    let copy = book.copies.find(
      (c) => c.status === 'RESERVED_FOR_PICKUP' && c.reservedForRegNo === student.registrationNumber
    );

    if (!copy) {
      copy = book.copies.find((c) => c.status === 'AVAILABLE');
    }

    if (!copy) {
      return { success: false, message: 'No physical copies available right now. You can join the waiting list.' };
    }

    // Mark copy borrowed
    const now = new Date();
    const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    copy.status = 'BORROWED';
    copy.borrowedByRegNo = student.registrationNumber;
    copy.borrowedDate = now.toISOString().split('T')[0];
    copy.dueDate = dueDate.toISOString().split('T')[0];
    copy.reservedForRegNo = undefined;
    copy.reservedForGmail = undefined;
    copy.holdExpiresAt = undefined;

    book.availableCopies = Math.max(0, book.copies.filter((c) => c.status === 'AVAILABLE').length);
    book.timesBorrowed += 1;

    const loan: StudentLoan = {
      loanId: `LN-${Date.now().toString().slice(-6)}`,
      bookId: book.id,
      bookTitle: book.title,
      author: book.author,
      barcode: copy.barcode,
      borrowedDate: copy.borrowedDate,
      dueDate: copy.dueDate,
      renewalsRemaining: 2,
      callNumber: book.shelfLocation.callNumber,
      shelfLocation: book.shelfLocation,
      isOverdue: false,
      daysRemaining: 14,
    };

    student.activeLoans.unshift(loan);
    student.activeReservations = student.activeReservations.filter((r) => r.bookId !== bookId);
    book.waitingList = book.waitingList.filter((w) => w.registrationNumber !== student.registrationNumber);

    student.quest.xp += 50;
    if (student.quest.xp >= student.quest.xpNextLevel) {
      student.quest.level += 1;
      student.quest.xpNextLevel += 250;
      student.quest.title = student.quest.level >= 4 ? 'Senior Scholar' : 'Junior Scholar';
    }

    this.restockActivityLog.unshift({
      id: crypto.randomUUID(),
      bookId: book.id,
      bookTitle: book.title,
      action: 'BORROW',
      timestamp: Date.now(),
      details: `Copy ${copy.barcode} issued to ${student.registrationNumber} (Due: ${loan.dueDate})`,
    });

    this.saveToDisk();
    return { success: true, message: `Checked out "${book.title}". Please collect at circulation desk.`, loan };
  }

  // Return a book (Triggers SmartRestock Event Engine)
  public returnBook(barcode: string): {
    success: boolean;
    message: string;
    returnedBook?: Book;
    restockEvent?: AvailabilityEvent;
  } {
    let targetBook: Book | undefined;
    let targetCopy: BookCopy | undefined;

    for (const b of this.books.values()) {
      const c = b.copies.find((copy) => copy.barcode === barcode);
      if (c) {
        targetBook = b;
        targetCopy = c;
        break;
      }
    }

    if (!targetBook || !targetCopy) {
      return { success: false, message: `No copy found with barcode ${barcode}.` };
    }

    const previousBorrower = targetCopy.borrowedByRegNo;
    const previousBorrowDate = targetCopy.borrowedDate || new Date().toISOString().split('T')[0];

    // Remove from student active loans
    if (previousBorrower) {
      const borrower = this.students.get(previousBorrower);
      if (borrower) {
        borrower.activeLoans = borrower.activeLoans.filter((l) => l.barcode !== barcode);
        borrower.borrowingHistory.unshift({
          historyId: `HIST-${Date.now().toString().slice(-6)}`,
          bookId: targetBook.id,
          bookTitle: targetBook.title,
          author: targetBook.author,
          borrowedDate: previousBorrowDate,
          returnedDate: new Date().toISOString().split('T')[0],
          rating: 5,
        });
      }
    }

    targetCopy.borrowedByRegNo = undefined;
    targetCopy.borrowedDate = undefined;
    targetCopy.dueDate = undefined;

    // SmartRestock Engine: Idempotent Availability Event
    let event: AvailabilityEvent | undefined;

    if (targetBook.waitingList.length > 0) {
      const nextStudent = targetBook.waitingList.shift()!;
      targetCopy.status = 'RESERVED_FOR_PICKUP';
      targetCopy.reservedForRegNo = nextStudent.registrationNumber;
      targetCopy.reservedForGmail = nextStudent.gmail;

      const deadline = Date.now() + 48 * 60 * 60 * 1000;
      targetCopy.holdExpiresAt = deadline;
      const pickupDeadlineStr = new Date(deadline).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const eventId = `EVT-AVAIL-${crypto.randomUUID().slice(0, 8)}`;
      event = {
        id: eventId,
        bookId: targetBook.id,
        bookTitle: targetBook.title,
        barcode: targetCopy.barcode,
        timestamp: Date.now(),
        allocatedToRegNo: nextStudent.registrationNumber,
        allocatedToName: nextStudent.studentName,
        allocatedToGmail: nextStudent.gmail,
        emailStatus: 'PENDING',
        pickupDeadline: pickupDeadlineStr,
        processed: true,
        actionType: 'RETURN',
      };

      this.availabilityEvents.unshift(event);
      this.processedEventIds.add(eventId);

      // Student notification
      const student = this.students.get(nextStudent.registrationNumber);
      if (student) {
        student.notifications.unshift({
          id: crypto.randomUUID(),
          title: `Book Ready for Pickup: ${targetBook.title}`,
          message: `A physical copy of "${targetBook.title}" was just returned and held for you at the Central Circulation Desk. Pickup deadline: ${pickupDeadlineStr}.`,
          type: 'AVAILABILITY',
          timestamp: Date.now(),
          read: false,
          bookId: targetBook.id,
          priority: 'URGENT',
        });

        const res = student.activeReservations.find((r) => r.bookId === targetBook!.id);
        if (res) {
          res.status = 'READY_FOR_PICKUP';
          res.pickupDeadline = pickupDeadlineStr;
          res.queuePosition = 0;
        }
      }
    } else {
      targetCopy.status = 'AVAILABLE';
      targetBook.availableCopies = targetBook.copies.filter((c) => c.status === 'AVAILABLE').length;
    }

    this.restockActivityLog.unshift({
      id: crypto.randomUUID(),
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      action: 'RETURN',
      timestamp: Date.now(),
      details: event
        ? `Copy ${barcode} returned. SmartRestock allocated copy to waiting student ${event.allocatedToRegNo} (Deadline: ${event.pickupDeadline}).`
        : `Copy ${barcode} returned and added to general shelf inventory.`,
    });

    this.saveToDisk();

    return {
      success: true,
      message: event
        ? `Copy returned. SmartRestock allocated copy to waiting student (${event.allocatedToRegNo}).`
        : `Copy returned and returned to general shelf inventory.`,
      returnedBook: targetBook,
      restockEvent: event,
    };
  }

  // Join waiting list
  public reserveBook(registrationNumber: string, bookId: string, studentName: string, gmail: string): {
    success: boolean;
    message: string;
    reservation?: StudentReservation;
  } {
    const book = this.books.get(bookId);
    if (!book) return { success: false, message: 'Book not found.' };

    const student = this.getOrCreateStudent(registrationNumber, gmail);

    if (student.activeLoans.some((l) => l.bookId === bookId)) {
      return { success: false, message: 'You already hold an active loan for this title.' };
    }
    if (student.activeReservations.some((r) => r.bookId === bookId)) {
      return { success: false, message: 'You already have an active hold request for this title.' };
    }

    const position = book.waitingList.length + 1;
    const waitingEntry: WaitingStudent = {
      registrationNumber: student.registrationNumber,
      studentName: studentName || student.name,
      gmail: gmail || student.gmail,
      requestedAt: Date.now(),
      priority: position,
      notified: false,
    };

    book.waitingList.push(waitingEntry);

    const reservation: StudentReservation = {
      reservationId: `RES-${Date.now().toString().slice(-6)}`,
      bookId: book.id,
      bookTitle: book.title,
      author: book.author,
      reservedAt: new Date().toISOString(),
      queuePosition: position,
      status: 'WAITING',
      pickupLocation: 'Ground Floor Central Circulation Desk',
      callNumber: book.shelfLocation.callNumber,
    };

    student.activeReservations.push(reservation);

    student.notifications.unshift({
      id: crypto.randomUUID(),
      title: `Reserved: ${book.title}`,
      message: `You are placed at position #${position} in the reservation queue. You will receive an immediate alert when a copy is returned or restocked.`,
      type: 'AVAILABILITY',
      timestamp: Date.now(),
      read: false,
      bookId: book.id,
      priority: 'NORMAL',
    });

    this.saveToDisk();
    return {
      success: true,
      message: `You are #${position} in line for "${book.title}". SmartRestock will alert you as soon as a copy is returned.`,
      reservation,
    };
  }

  public cancelReservation(registrationNumber: string, bookId: string): { success: boolean; message: string } {
    const book = this.books.get(bookId);
    const student = this.students.get(registrationNumber.trim().toUpperCase());

    if (book) {
      book.waitingList = book.waitingList.filter((w) => w.registrationNumber !== registrationNumber);
      book.waitingList.forEach((w, idx) => (w.priority = idx + 1));
    }

    if (student) {
      student.activeReservations = student.activeReservations.filter((r) => r.bookId !== bookId);
    }

    this.saveToDisk();
    return { success: true, message: 'Hold reservation successfully canceled.' };
  }

  public renewLoan(registrationNumber: string, loanId: string): { success: boolean; message: string; newDueDate?: string } {
    const student = this.students.get(registrationNumber.trim().toUpperCase());
    if (!student) return { success: false, message: 'Student record not found.' };

    const loan = student.activeLoans.find((l) => l.loanId === loanId);
    if (!loan) return { success: false, message: 'Active loan record not found.' };

    if (loan.renewalsRemaining <= 0) {
      return { success: false, message: 'Renewal limit reached for this checkout (max 2 renewals per loan).' };
    }

    const book = this.books.get(loan.bookId);
    if (book && book.waitingList.length > 0) {
      return {
        success: false,
        message: 'Cannot renew: Other students are currently waiting on the reservation queue for this title.',
      };
    }

    const currentDue = new Date(loan.dueDate);
    const newDueDate = new Date(currentDue.getTime() + 14 * 24 * 60 * 60 * 1000);
    loan.dueDate = newDueDate.toISOString().split('T')[0];
    loan.renewalsRemaining -= 1;
    loan.daysRemaining = Math.max(0, Math.ceil((newDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    if (book) {
      const copy = book.copies.find((c) => c.barcode === loan.barcode);
      if (copy) copy.dueDate = loan.dueDate;
    }

    student.notifications.unshift({
      id: crypto.randomUUID(),
      title: `Loan Renewed: ${loan.bookTitle}`,
      message: `Due date successfully extended to ${loan.dueDate} (14 days added). Renewals remaining: ${loan.renewalsRemaining}.`,
      type: 'DEADLINE',
      timestamp: Date.now(),
      read: false,
      priority: 'NORMAL',
      bookId: loan.bookId,
    });

    this.saveToDisk();
    return { success: true, message: `Loan extended. New due date is ${loan.dueDate}.`, newDueDate: loan.dueDate };
  }

  // ===================== SmartRestock & Procurement =====================

  public restockBook(bookId: string, additionalCopies: number): {
    success: boolean;
    message: string;
    events: AvailabilityEvent[];
  } {
    const book = this.books.get(bookId);
    if (!book) return { success: false, message: 'Book not found.', events: [] };

    const startNum = book.totalCopies + 1;
    const events: AvailabilityEvent[] = [];

    for (let i = 0; i < additionalCopies; i++) {
      const copyNum = startNum + i;
      const barcode = `AU-BC-${book.id.replace('bk-', '')}-${copyNum}`;
      const newCopy: BookCopy = {
        barcode,
        copyNumber: copyNum,
        status: 'AVAILABLE',
      };

      if (book.waitingList.length > 0) {
        const nextStudent = book.waitingList.shift()!;
        newCopy.status = 'RESERVED_FOR_PICKUP';
        newCopy.reservedForRegNo = nextStudent.registrationNumber;
        newCopy.reservedForGmail = nextStudent.gmail;

        const deadline = Date.now() + 48 * 60 * 60 * 1000;
        newCopy.holdExpiresAt = deadline;
        const pickupDeadlineStr = new Date(deadline).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });

        const eventId = `EVT-RESTOCK-${crypto.randomUUID().slice(0, 8)}`;
        const event: AvailabilityEvent = {
          id: eventId,
          bookId: book.id,
          bookTitle: book.title,
          barcode,
          timestamp: Date.now(),
          allocatedToRegNo: nextStudent.registrationNumber,
          allocatedToName: nextStudent.studentName,
          allocatedToGmail: nextStudent.gmail,
          emailStatus: 'PENDING',
          pickupDeadline: pickupDeadlineStr,
          processed: true,
          actionType: 'RESTOCK',
        };

        this.availabilityEvents.unshift(event);
        this.processedEventIds.add(eventId);
        events.push(event);

        const student = this.students.get(nextStudent.registrationNumber);
        if (student) {
          student.notifications.unshift({
            id: crypto.randomUUID(),
            title: `New Restock: "${book.title}" Available!`,
            message: `A brand new restocked physical copy was allocated to you at Central Circulation. Pickup deadline: ${pickupDeadlineStr}.`,
            type: 'RESTOCK',
            timestamp: Date.now(),
            read: false,
            bookId: book.id,
            priority: 'URGENT',
          });

          const res = student.activeReservations.find((r) => r.bookId === book.id);
          if (res) {
            res.status = 'READY_FOR_PICKUP';
            res.pickupDeadline = pickupDeadlineStr;
            res.queuePosition = 0;
          }
        }
      } else {
        book.availableCopies += 1;
      }

      book.copies.push(newCopy);
      book.totalCopies += 1;
    }

    this.restockActivityLog.unshift({
      id: crypto.randomUUID(),
      bookId: book.id,
      bookTitle: book.title,
      action: 'RESTOCK',
      timestamp: Date.now(),
      details: `Added ${additionalCopies} copies. ${events.length} copies allocated to waiting list.`,
    });

    this.saveToDisk();
    return {
      success: true,
      message: `Restocked ${additionalCopies} copies of "${book.title}". SmartRestock notified ${events.length} waiting students.`,
      events,
    };
  }

  // ===================== Playable Quiz Engine =====================

  public getQuizzes(): QuizQuestion[] {
    return this.quizzes.filter((q) => q.enabled);
  }

  public getAllAdminQuizzes(): QuizQuestion[] {
    return this.quizzes;
  }

  public addQuizQuestion(q: Omit<QuizQuestion, 'id'>): { success: boolean; question: QuizQuestion } {
    const id = 'q-' + (this.quizzes.length + 1);
    const newQ: QuizQuestion = {
      id,
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      correctIndex: q.correctIndex,
      explanation: q.explanation.trim(),
      category: q.category || 'ORIENTATION',
      courseCode: q.courseCode?.trim().toUpperCase(),
      enabled: q.enabled !== undefined ? q.enabled : true,
    };
    this.quizzes.push(newQ);
    this.saveToDisk();
    return { success: true, question: newQ };
  }

  public toggleQuizQuestion(id: string, enabled: boolean): { success: boolean } {
    const q = this.quizzes.find((item) => item.id === id);
    if (q) {
      q.enabled = enabled;
      this.saveToDisk();
      return { success: true };
    }
    return { success: false };
  }

  public submitQuiz(
    registrationNumber: string,
    answers: number[]
  ): {
    success: boolean;
    attempt: QuizAttempt;
    totalQuestions: number;
    correctCount: number;
    results: Array<{ questionId: string; correct: boolean; explanation: string; correctIndex: number }>;
  } {
    const student = this.getOrCreateStudent(registrationNumber);
    const activeQuestions = this.getQuizzes();

    let correctCount = 0;
    const results = activeQuestions.map((q, idx) => {
      const selected = answers[idx];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount += 1;
      return {
        questionId: q.id,
        correct: isCorrect,
        explanation: q.explanation,
        correctIndex: q.correctIndex,
      };
    });

    const totalQuestions = activeQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = percentage >= 70;
    const xpAwarded = passed ? 100 : 25;

    const attempt: QuizAttempt = {
      id: 'ATT-' + Date.now().toString().slice(-6),
      studentRegNo: student.registrationNumber,
      studentName: student.name,
      score: correctCount,
      totalQuestions,
      percentage,
      passed,
      completedAt: new Date().toISOString(),
      xpAwarded,
    };

    this.quizAttempts.unshift(attempt);
    student.quizAttempts.unshift(attempt);

    // Award XP
    student.quest.xp += xpAwarded;
    if (student.quest.xp >= student.quest.xpNextLevel) {
      student.quest.level += 1;
      student.quest.xpNextLevel += 250;
      student.quest.title = student.quest.level >= 4 ? 'Senior Scholar' : 'Junior Scholar';
    }

    // Check quest mission for quiz
    const orientationMission = student.quest.missions.find((m) => m.id === 'm-4');
    if (orientationMission && passed) {
      orientationMission.completed = true;
      orientationMission.progress = 1;
    }

    this.saveToDisk();

    return {
      success: true,
      attempt,
      totalQuestions,
      correctCount,
      results,
    };
  }

  public getQuizAttempts(): QuizAttempt[] {
    return this.quizAttempts;
  }

  // ===================== CSV Import Engine =====================

  public importCatalogueCsv(csvText: string): {
    success: boolean;
    message: string;
    importedCount: number;
    errors: string[];
  } {
    const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return { success: false, message: 'CSV must contain a header row and at least one data row.', importedCount: 0, errors: [] };
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const errors: string[] = [];
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length < 3) {
        errors.push(`Row ${i + 1}: Insufficient columns.`);
        continue;
      }

      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = parts[idx] || '';
      });

      const title = row['title'] || row['booktitle'] || parts[1];
      const author = row['author'] || parts[2];
      const isbn = row['isbn'] || parts[0];
      const dept = row['department'] || 'General Academic';
      const course = row['coursecode'] || row['course'] || 'GEN101';
      const copies = parseInt(row['copies'] || '2', 10) || 2;

      if (!title || !author || !isbn) {
        errors.push(`Row ${i + 1}: Missing Title, Author, or ISBN.`);
        continue;
      }

      const res = this.addBook({
        title,
        author,
        isbn,
        department: dept,
        courseCode: course,
        totalCopies: copies,
      });

      if (res.success) {
        imported += 1;
      } else {
        errors.push(`Row ${i + 1}: ${res.message}`);
      }
    }

    this.saveToDisk();
    return {
      success: imported > 0,
      message: `Imported ${imported} catalogue titles successfully.`,
      importedCount: imported,
      errors,
    };
  }

  // ===================== Librarian Analytics & Audit =====================

  public getLibrarianAnalytics(): LibrarianAnalytics {
    const books = Array.from(this.books.values());
    const totalTitles = books.length;
    const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
    const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);
    const totalBorrowed = totalCopies - availableCopies;
    const totalWaitingStudents = books.reduce((acc, b) => acc + b.waitingList.length, 0);

    const priorityRestockList = books
      .map((b) => {
        const demandRatio = b.waitingList.length > 0 ? (b.waitingList.length / Math.max(1, b.totalCopies)) * 100 : 0;
        let priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'SUFFICIENT' = 'SUFFICIENT';
        if (b.availableCopies === 0 && b.waitingList.length >= 2) priority = 'CRITICAL';
        else if (b.availableCopies === 0 && b.waitingList.length > 0) priority = 'HIGH';
        else if (b.availableCopies <= 1 && b.timesBorrowed > 50) priority = 'MODERATE';

        return {
          id: b.id,
          title: b.title,
          author: b.author,
          courseCode: b.courseCode,
          department: b.department,
          totalCopies: b.totalCopies,
          availableCopies: b.availableCopies,
          waitingCount: b.waitingList.length,
          timesBorrowed: b.timesBorrowed,
          demandRatio: Math.round(demandRatio),
          priority,
        };
      })
      .sort((a, b) => b.waitingCount - a.waitingCount || a.availableCopies - b.availableCopies);

    return {
      overview: {
        totalTitles,
        totalCopies,
        availableCopies,
        totalBorrowed,
        totalWaitingStudents,
        circulationRate: totalCopies > 0 ? Math.round((totalBorrowed / totalCopies) * 100) : 0,
      },
      priorityRestockList,
      recentActivity: this.restockActivityLog.slice(0, 25),
    };
  }

  public getAvailabilityEvents(): AvailabilityEvent[] {
    return this.availabilityEvents;
  }
}

export const libraryStore = new LibraryStore();
