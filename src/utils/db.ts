// Custom Database and Server-Side Simulator for Session Hijacking Lab
import { cookieManager } from './cookies';

export interface User {
  username: string;
  name: string;
  role: 'student' | 'teacher';
  email: string;
  avatar: string;
}

export interface Session {
  id: string;
  username: string;
  createdAt: string;
  userAgent: string;
  ipAddress: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  term: string;
  color: string;
  teacher: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  points: number;
  dueDate: string;
  description: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  username: string;
  content: string;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
}

export interface Message {
  id: string;
  sender: string;
  receiver: string;
  subject: string;
  body: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  username: string;
}

// Transaction logs for visual SQL console
export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'sql' | 'http' | 'cookie';
  message: string;
}

// LocalStorage Keys
const USERS_KEY = 'rivancyber_users';
const SESSIONS_KEY = 'rivancyber_sessions';
const COURSES_KEY = 'rivancyber_courses';
const ASSIGNMENTS_KEY = 'rivancyber_assignments';
const SUBMISSIONS_KEY = 'rivancyber_submissions';
const MESSAGES_KEY = 'rivancyber_messages';
const CALENDAR_KEY = 'rivancyber_calendar';
const LOGS_KEY = 'rivancyber_db_logs';
const PROTECTIONS_KEY = 'rivancyber_security_protections';

// Helper to generate a realistic random session token
function generateRandomSessionId(): string {
  const chars = 'abcdef0123456789';
  let token = 'sess_';
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// Logging Utility
export function logTransaction(type: 'sql' | 'http' | 'cookie', message: string) {
  const logs = getLogs();
  const entry: LogEntry = {
    id: 'log_' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    type,
    message
  };
  
  logs.unshift(entry); // Add to beginning
  if (logs.length > 50) logs.pop();
  
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  window.dispatchEvent(new CustomEvent('db_log_added', { detail: entry }));
}

export function getLogs(): LogEntry[] {
  try {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearLogs() {
  localStorage.setItem(LOGS_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event('db_logs_cleared'));
}

// Security Protections State
export interface SecurityProtections {
  httpOnly: boolean;
  sessionBinding: boolean;
  tokenRotation: boolean;
}

const DEFAULT_PROTECTIONS: SecurityProtections = {
  httpOnly: false,
  sessionBinding: false,
  tokenRotation: false
};

export function getSecurityProtections(): SecurityProtections {
  try {
    const data = localStorage.getItem(PROTECTIONS_KEY);
    return data ? JSON.parse(data) : DEFAULT_PROTECTIONS;
  } catch {
    return DEFAULT_PROTECTIONS;
  }
}

export function setSecurityProtections(protections: SecurityProtections) {
  localStorage.setItem(PROTECTIONS_KEY, JSON.stringify(protections));
  logTransaction('cookie', `Security policy updated: HttpOnly=${protections.httpOnly}, SessionBinding=${protections.sessionBinding}, TokenRotation=${protections.tokenRotation}`);
  window.dispatchEvent(new CustomEvent('security_changed', { detail: protections }));
  syncWithServer();
}

// Default Seed Data
const defaultUsers: Record<string, User & { passwordHash: string }> = {
  alice: {
    username: 'alice',
    passwordHash: 'alice123',
    name: 'Professor Alice Smith',
    role: 'teacher',
    email: 'alice.smith@rivancyber.edu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  bob: {
    username: 'bob',
    passwordHash: 'bob123',
    name: 'Bob Jenkins',
    role: 'student',
    email: 'bob.jenkins@rivancyber.edu',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  }
};

const defaultCourses: Course[] = [
  { id: 'CS-101', code: 'CS-101', name: 'Introduction to Computer Science', term: 'Spring 2026', color: 'from-blue-600 to-indigo-700', teacher: 'alice' },
  { id: 'SEC-202', code: 'SEC-202', name: 'Web Application Security', term: 'Spring 2026', color: 'from-rose-600 to-red-700', teacher: 'alice' },
  { id: 'MATH-301', code: 'MATH-301', name: 'Discrete Mathematics', term: 'Spring 2026', color: 'from-emerald-600 to-teal-700', teacher: 'Dr. Dave Miller' }
];

const defaultAssignments: Assignment[] = [
  { id: 'asm-1', courseId: 'CS-101', title: 'Homework 1: SQL Basics', points: 100, dueDate: '2026-05-28', description: 'Write SQL queries to select, insert, and update rows in a mock university database.' },
  { id: 'asm-2', courseId: 'SEC-202', title: 'Lab 1: Session Hijacking Analysis', points: 100, dueDate: '2026-05-24', description: 'Demonstrate session hijacking using browser cookies. Write a report detailing the impact of missing HttpOnly flags.' },
  { id: 'asm-3', courseId: 'SEC-202', title: 'Homework 2: Secure Cookie Design', points: 50, dueDate: '2026-06-02', description: 'Explain Secure, SameSite, and HttpOnly cookie attributes and how they prevent CSRF and Session Hijacking.' }
];

const defaultSubmissions: Submission[] = [
  { id: 'sub-1', assignmentId: 'asm-1', username: 'bob', content: 'SELECT * FROM students WHERE grade > 90;', submittedAt: '2026-05-19T10:30:00Z', grade: 90, feedback: 'Excellent queries, Bob. A few minor syntax issues but well structured.' }
];

const defaultMessages: Message[] = [
  { id: 'msg-1', sender: 'bob', receiver: 'alice', subject: 'Question about Web Sec Lab', body: 'Hello Professor Alice, I am working on the Cookie Lab but I am stuck on how to retrieve the session cookie via JS. Could you give me a hint?', createdAt: '2026-05-20T14:15:00Z' },
  { id: 'msg-2', sender: 'alice', receiver: 'bob', subject: 'Re: Question about Web Sec Lab', body: 'Hi Bob, check document.cookie in your browser developer console. If the cookie does not have the HttpOnly flag, you can access it directly via JavaScript!', createdAt: '2026-05-20T15:00:00Z' }
];

const defaultEvents: CalendarEvent[] = [
  { id: 'evt-1', title: 'Web Security Class Lecture', date: '2026-05-22', username: 'bob' },
  { id: 'evt-2', title: 'Final Exam Study Group', date: '2026-05-26', username: 'bob' }
];

// Initialize Database tables in localStorage
export function initializeDB() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    logTransaction('sql', "CREATE TABLE users (username VARCHAR(50) PRIMARY KEY, password_hash VARCHAR(100), name VARCHAR(100), role VARCHAR(20), email VARCHAR(100), avatar TEXT);");
    logTransaction('sql', "INSERT INTO users VALUES ('alice', 'alice123', 'Professor Alice Smith', 'teacher', ...);");
    logTransaction('sql', "INSERT INTO users VALUES ('bob', 'bob123', 'Bob Jenkins', 'student', ...);");
  }

  if (!localStorage.getItem(SESSIONS_KEY)) {
    // Pre-seed an active session for Alice so the student can copy and hijack it!
    const aliceSessionId = generateRandomSessionId();
    const seeds: Record<string, Session> = {
      [aliceSessionId]: {
        id: aliceSessionId,
        username: 'alice',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36',
        ipAddress: '192.168.1.45'
      }
    };
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(seeds));
    logTransaction('sql', "CREATE TABLE sessions (session_id VARCHAR(50) PRIMARY KEY, username VARCHAR(50), created_at TIMESTAMP, user_agent TEXT, ip_address VARCHAR(45));");
    logTransaction('sql', `INSERT INTO sessions VALUES ('${aliceSessionId}', 'alice', datetime('now', '-1 hour'), 'Chrome/124.0...', '192.168.1.45');`);
  }

  if (!localStorage.getItem(COURSES_KEY)) {
    localStorage.setItem(COURSES_KEY, JSON.stringify(defaultCourses));
    logTransaction('sql', "CREATE TABLE courses (id VARCHAR(20) PRIMARY KEY, code VARCHAR(20), name VARCHAR(100), term VARCHAR(20), color TEXT, teacher VARCHAR(50));");
    logTransaction('sql', "INSERT INTO courses VALUES ('CS-101', 'CS-101', 'Introduction to Computer Science', ...);");
  }

  if (!localStorage.getItem(ASSIGNMENTS_KEY)) {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(defaultAssignments));
    logTransaction('sql', "CREATE TABLE assignments (id VARCHAR(20) PRIMARY KEY, course_id VARCHAR(20), title VARCHAR(100), points INT, due_date DATE, description TEXT);");
  }

  if (!localStorage.getItem(SUBMISSIONS_KEY)) {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(defaultSubmissions));
    logTransaction('sql', "CREATE TABLE submissions (id VARCHAR(20) PRIMARY KEY, assignment_id VARCHAR(20), username VARCHAR(50), content TEXT, submitted_at TIMESTAMP, grade INT, feedback TEXT);");
  }

  if (!localStorage.getItem(MESSAGES_KEY)) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(defaultMessages));
    logTransaction('sql', "CREATE TABLE messages (id VARCHAR(20) PRIMARY KEY, sender VARCHAR(50), receiver VARCHAR(50), subject TEXT, body TEXT, created_at TIMESTAMP);");
  }

  if (!localStorage.getItem(CALENDAR_KEY)) {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(defaultEvents));
    logTransaction('sql', "CREATE TABLE calendar_events (id VARCHAR(20) PRIMARY KEY, title TEXT, date DATE, username VARCHAR(50));");
  }
  syncWithServer();
}

// Reset Database function
export function resetDB() {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(COURSES_KEY);
  localStorage.removeItem(ASSIGNMENTS_KEY);
  localStorage.removeItem(SUBMISSIONS_KEY);
  localStorage.removeItem(MESSAGES_KEY);
  localStorage.removeItem(CALENDAR_KEY);
  localStorage.removeItem(LOGS_KEY);
  localStorage.removeItem(PROTECTIONS_KEY);
  
  initializeDB();
  logTransaction('sql', "-- DATABASE COLD BOOT: All tables dropped and re-seeded.");
  window.location.reload();
}

// User CRUD operations
export function getUsers(): Record<string, User & { passwordHash: string }> {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function registerUser(username: string, passwordHash: string, name: string, role: 'student' | 'teacher', email: string): { success: boolean; error?: string } {
  initializeDB();
  const users = getUsers();
  const lowerUsername = username.trim().toLowerCase();

  if (!lowerUsername || !passwordHash || !name || !email) {
    return { success: false, error: 'All fields are required' };
  }

  if (users[lowerUsername]) {
    logTransaction('sql', `SELECT * FROM users WHERE username = '${lowerUsername}'; -- USER EXISTS ERROR`);
    return { success: false, error: 'Username already exists' };
  }

  const avatarIndex = Math.floor(Math.random() * 10) + 1;
  const avatar = `https://images.unsplash.com/photo-${1500000000000 + avatarIndex * 10000}?w=150&auto=format&fit=crop&q=80`;

  users[lowerUsername] = {
    username: lowerUsername,
    passwordHash,
    name,
    role,
    email,
    avatar
  };

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  logTransaction('sql', `INSERT INTO users (username, password_hash, name, role, email, avatar) VALUES ('${lowerUsername}', '${passwordHash}', '${name}', '${role}', '${email}', '${avatar}');`);
  syncWithServer();
  return { success: true };
}

// Login
export function loginUser(username: string, passwordHash: string): { success: boolean; session?: Session; error?: string } {
  initializeDB();
  const users = getUsers();
  const lowerUsername = username.trim().toLowerCase();
  
  logTransaction('sql', `SELECT * FROM users WHERE username = '${lowerUsername}' AND password_hash = '${passwordHash}';`);

  const user = users[lowerUsername];
  if (!user || user.passwordHash !== passwordHash) {
    logTransaction('http', `POST /api/login - 401 Unauthorized - Auth failed for user '${lowerUsername}'`);
    return { success: false, error: 'Invalid username or password' };
  }

  const sessionId = generateRandomSessionId();
  const sessions = getSessions();
  const userAgent = window.navigator.userAgent;
  const ipAddress = '192.168.1.' + (Math.floor(Math.random() * 250) + 2);

  const newSession: Session = {
    id: sessionId,
    username: lowerUsername,
    createdAt: new Date().toISOString(),
    userAgent,
    ipAddress
  };

  sessions[sessionId] = newSession;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

  logTransaction('sql', `INSERT INTO sessions (session_id, username, created_at, user_agent, ip_address) VALUES ('${sessionId}', '${lowerUsername}', datetime('now'), '${userAgent.substring(0, 30)}...', '${ipAddress}');`);
  logTransaction('http', `POST /api/login - 200 OK - Set-Cookie: rivancyber_session_id=${sessionId}`);

  const protections = getSecurityProtections();
  cookieManager.set('rivancyber_session_id', sessionId, {
    maxAge: 86400,
    httpOnly: protections.httpOnly,
    path: '/'
  });

  syncWithServer();
  return { success: true, session: newSession };
}

export function logoutUser(sessionId: string) {
  const sessions = getSessions();
  const session = sessions[sessionId];
  
  if (session) {
    delete sessions[sessionId];
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    logTransaction('sql', `DELETE FROM sessions WHERE session_id = '${sessionId}';`);
    logTransaction('http', `POST /api/logout - 200 OK - Session ${sessionId} destroyed`);
  }
  
  cookieManager.delete('rivancyber_session_id');
  syncWithServer();
}

export function getSessions(): Record<string, Session> {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function authenticateServerRequest(): { user: User | null; session: Session | null; logs: string[] } {
  initializeDB();
  const sessionId = cookieManager.getServerCookie('rivancyber_session_id');
  const protections = getSecurityProtections();
  const currentUA = window.navigator.userAgent;

  if (!sessionId) {
    logTransaction('http', `GET /api/user - 401 Unauthorized - No session cookie found`);
    return { user: null, session: null, logs: [] };
  }

  const sessions = getSessions();
  const session = sessions[sessionId];

  logTransaction('sql', `SELECT * FROM sessions WHERE session_id = '${sessionId}';`);

  if (!session) {
    logTransaction('http', `GET /api/user - 401 Unauthorized - Invalid session ID '${sessionId}'`);
    cookieManager.delete('rivancyber_session_id');
    return { user: null, session: null, logs: [] };
  }

  if (protections.sessionBinding) {
    if (session.userAgent !== currentUA) {
      logTransaction('http', `GET /api/user - 403 Forbidden - Session Hijack Blocked! Fingerprint mismatch.`);
      logTransaction('http', `-- Expected User-Agent: ${session.userAgent.substring(0, 30)}...`);
      logTransaction('http', `-- Received User-Agent: ${currentUA.substring(0, 30)}...`);
      return { user: null, session: null, logs: [`Session Hijacking Blocked! User-Agent mismatch.`] };
    }
  }

  const users = getUsers();
  const user = users[session.username];

  logTransaction('sql', `SELECT * FROM users WHERE username = '${session.username}';`);

  if (!user) {
    logTransaction('http', `GET /api/user - 404 Not Found - User '${session.username}' not found for active session`);
    return { user: null, session: null, logs: [] };
  }

  if (protections.tokenRotation) {
    const newSessionId = generateRandomSessionId();
    const newSession: Session = {
      ...session,
      id: newSessionId
    };
    
    delete sessions[sessionId];
    sessions[newSessionId] = newSession;
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

    logTransaction('sql', `UPDATE sessions SET session_id = '${newSessionId}' WHERE session_id = '${sessionId}'; -- TOKEN ROTATION`);
    logTransaction('http', `GET /api/user - 200 OK (Rotated) - Set-Cookie: rivancyber_session_id=${newSessionId}`);

    cookieManager.set('rivancyber_session_id', newSessionId, {
      maxAge: 86400,
      httpOnly: protections.httpOnly,
      path: '/'
    });

    syncWithServer();
    return { user, session: newSession, logs: [`Session rotated from ${sessionId.substring(0, 10)}... to ${newSessionId.substring(0, 10)}...`] };
  }

  logTransaction('http', `GET /api/user - 200 OK - Authenticated as ${user.role}: ${user.name}`);
  return { user, session, logs: [] };
}

// Course Queries
export function getCourses(): Course[] {
  initializeDB();
  logTransaction('sql', "SELECT * FROM courses;");
  try {
    const data = localStorage.getItem(COURSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function createCourse(code: string, name: string, color: string, teacherUsername: string): Course {
  initializeDB();
  const courses = getCourses();
  const newCourse: Course = {
    id: code.toUpperCase().replace(/\s+/g, '-'),
    code,
    name,
    term: 'Spring 2026',
    color,
    teacher: teacherUsername
  };
  courses.push(newCourse);
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  logTransaction('sql', `INSERT INTO courses (id, code, name, term, color, teacher) VALUES ('${newCourse.id}', '${code}', '${name}', 'Spring 2026', '${color}', '${teacherUsername}');`);
  return newCourse;
}

// Assignment Queries
export function getAssignments(courseId: string): Assignment[] {
  initializeDB();
  logTransaction('sql', `SELECT * FROM assignments WHERE course_id = '${courseId}';`);
  try {
    const data = localStorage.getItem(ASSIGNMENTS_KEY);
    const all: Assignment[] = data ? JSON.parse(data) : [];
    return all.filter(a => a.courseId === courseId);
  } catch {
    return [];
  }
}

// Submissions Queries
export function getSubmissions(assignmentId: string): Submission[] {
  initializeDB();
  logTransaction('sql', `SELECT * FROM submissions WHERE assignment_id = '${assignmentId}';`);
  try {
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    const all: Submission[] = data ? JSON.parse(data) : [];
    return all.filter(s => s.assignmentId === assignmentId);
  } catch {
    return [];
  }
}

export function getStudentSubmissions(username: string): Submission[] {
  initializeDB();
  logTransaction('sql', `SELECT * FROM submissions WHERE username = '${username}';`);
  try {
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    const all: Submission[] = data ? JSON.parse(data) : [];
    return all.filter(s => s.username === username);
  } catch {
    return [];
  }
}

export function submitAssignment(assignmentId: string, username: string, content: string): Submission {
  initializeDB();
  const data = localStorage.getItem(SUBMISSIONS_KEY);
  const all: Submission[] = data ? JSON.parse(data) : [];
  
  // Remove duplicate submission if exists
  const filtered = all.filter(s => !(s.assignmentId === assignmentId && s.username === username));
  
  const newSub: Submission = {
    id: 'sub-' + Math.random().toString(36).substr(2, 9),
    assignmentId,
    username,
    content,
    submittedAt: new Date().toISOString(),
    grade: null,
    feedback: null
  };
  
  filtered.push(newSub);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(filtered));
  logTransaction('sql', `INSERT INTO submissions (id, assignment_id, username, content, submitted_at) VALUES ('${newSub.id}', '${assignmentId}', '${username}', '${content}', datetime('now'));`);
  return newSub;
}

export function gradeSubmission(submissionId: string, grade: number, feedback: string): boolean {
  initializeDB();
  const data = localStorage.getItem(SUBMISSIONS_KEY);
  const all: Submission[] = data ? JSON.parse(data) : [];
  
  const subIndex = all.findIndex(s => s.id === submissionId);
  if (subIndex > -1) {
    all[subIndex].grade = grade;
    all[subIndex].feedback = feedback;
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
    logTransaction('sql', `UPDATE submissions SET grade = ${grade}, feedback = '${feedback}' WHERE id = '${submissionId}';`);
    return true;
  }
  return false;
}

// Message/Inbox Queries
export function getMessages(username: string): Message[] {
  initializeDB();
  logTransaction('sql', `SELECT * FROM messages WHERE sender = '${username}' OR receiver = '${username}';`);
  try {
    const data = localStorage.getItem(MESSAGES_KEY);
    const all: Message[] = data ? JSON.parse(data) : [];
    return all.filter(m => m.sender === username || m.receiver === username)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function sendMessage(sender: string, receiver: string, subject: string, body: string): Message {
  initializeDB();
  const data = localStorage.getItem(MESSAGES_KEY);
  const all: Message[] = data ? JSON.parse(data) : [];
  
  const newMsg: Message = {
    id: 'msg-' + Math.random().toString(36).substr(2, 9),
    sender,
    receiver,
    subject,
    body,
    createdAt: new Date().toISOString()
  };
  
  all.push(newMsg);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
  logTransaction('sql', `INSERT INTO messages (id, sender, receiver, subject, body, created_at) VALUES ('${newMsg.id}', '${sender}', '${receiver}', '${subject}', '${body}', datetime('now'));`);
  return newMsg;
}

// Calendar Events
export function getCalendarEvents(username: string): CalendarEvent[] {
  initializeDB();
  logTransaction('sql', `SELECT * FROM calendar_events WHERE username = '${username}';`);
  try {
    const data = localStorage.getItem(CALENDAR_KEY);
    const all: CalendarEvent[] = data ? JSON.parse(data) : [];
    return all.filter(e => e.username === username);
  } catch {
    return [];
  }
}

export function addCalendarEvent(title: string, date: string, username: string): CalendarEvent {
  initializeDB();
  const data = localStorage.getItem(CALENDAR_KEY);
  const all: CalendarEvent[] = data ? JSON.parse(data) : [];
  
  const newEvent: CalendarEvent = {
    id: 'evt-' + Math.random().toString(36).substr(2, 9),
    title,
    date,
    username
  };
  
  all.push(newEvent);
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(all));
  logTransaction('sql', `INSERT INTO calendar_events (id, title, date, username) VALUES ('${newEvent.id}', '${title}', '${date}', '${username}');`);
  return newEvent;
}

export function syncWithServer() {
  if (typeof window === 'undefined') return;
  const sessions = localStorage.getItem(SESSIONS_KEY);
  const users = localStorage.getItem(USERS_KEY);
  const protections = localStorage.getItem(PROTECTIONS_KEY);
  
  fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessions: sessions ? JSON.parse(sessions) : {},
      users: users ? JSON.parse(users) : {},
      protections: protections ? JSON.parse(protections) : {}
    }),
    keepalive: true
  }).catch(e => console.warn('Failed to sync database with server:', e));
}
