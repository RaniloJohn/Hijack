// Custom Database and Server-Side Simulator for Session Hijacking Lab

(function() {
  const USERS_KEY = 'canvas_users';
  const SESSIONS_KEY = 'canvas_sessions';
  const COURSES_KEY = 'canvas_courses';
  const ASSIGNMENTS_KEY = 'canvas_assignments';
  const SUBMISSIONS_KEY = 'canvas_submissions';
  const MESSAGES_KEY = 'canvas_messages';
  const CALENDAR_KEY = 'canvas_calendar';
  const LOGS_KEY = 'canvas_db_logs';
  const PROTECTIONS_KEY = 'canvas_security_protections';

  function generateRandomSessionId() {
    const chars = 'abcdef0123456789';
    let token = 'sess_';
    for (let i = 0; i < 32; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  }

  // Logging Utility
  window.logTransaction = function(type, message) {
    const logs = window.getLogs();
    const entry = {
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    
    logs.unshift(entry);
    if (logs.length > 50) logs.pop();
    
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('db_log_added', { detail: entry }));
  };

  window.getLogs = function() {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  window.clearLogs = function() {
    localStorage.setItem(LOGS_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event('db_logs_cleared'));
  };

  const DEFAULT_PROTECTIONS = {
    httpOnly: false,
    sessionBinding: false,
    tokenRotation: false
  };

  window.getSecurityProtections = function() {
    try {
      const data = localStorage.getItem(PROTECTIONS_KEY);
      return data ? JSON.parse(data) : DEFAULT_PROTECTIONS;
    } catch {
      return DEFAULT_PROTECTIONS;
    }
  };

  window.setSecurityProtections = function(protections) {
    localStorage.setItem(PROTECTIONS_KEY, JSON.stringify(protections));
    window.logTransaction('cookie', `Security policy updated: HttpOnly=${protections.httpOnly}, SessionBinding=${protections.sessionBinding}, TokenRotation=${protections.tokenRotation}`);
    window.dispatchEvent(new CustomEvent('security_changed', { detail: protections }));
  };

  const defaultUsers = {
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
    },
    ranilojohn: {
      username: 'ranilojohn',
      passwordHash: 'ranilojohn123',
      name: 'Ranilo John',
      role: 'student',
      email: 'ranilojohn@rivancyber.edu',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    }
  };

  const defaultCourses = [
    { id: 'CS-101', code: 'CS-101', name: 'Introduction to Computer Science', term: 'Spring 2026', color: 'from-blue-600 to-indigo-700', teacher: 'alice' },
    { id: 'SEC-202', code: 'SEC-202', name: 'Web Application Security', term: 'Spring 2026', color: 'from-rose-600 to-red-700', teacher: 'alice' },
    { id: 'MATH-301', code: 'MATH-301', name: 'Discrete Mathematics', term: 'Spring 2026', color: 'from-emerald-600 to-teal-700', teacher: 'Dr. Dave Miller' }
  ];

  const defaultAssignments = [
    { id: 'asm-1', courseId: 'CS-101', title: 'Homework 1: SQL Basics', points: 100, dueDate: '2026-05-28', description: 'Write SQL queries to select, insert, and update rows in a mock university database.' },
    { id: 'asm-2', courseId: 'SEC-202', title: 'Lab 1: Session Hijacking Analysis', points: 100, dueDate: '2026-05-24', description: 'Demonstrate session hijacking using browser cookies. Write a report detailing the impact of missing HttpOnly flags.' },
    { id: 'asm-3', courseId: 'SEC-202', title: 'Homework 2: Secure Cookie Design', points: 50, dueDate: '2026-06-02', description: 'Explain Secure, SameSite, and HttpOnly cookie attributes and how they prevent CSRF and Session Hijacking.' }
  ];

  const defaultSubmissions = [
    { id: 'sub-1', assignmentId: 'asm-1', username: 'bob', content: 'SELECT * FROM students WHERE grade > 90;', submittedAt: '2026-05-19T10:30:00Z', grade: 90, feedback: 'Excellent queries, Bob. A few minor syntax issues but well structured.' }
  ];

  const defaultMessages = [
    { id: 'msg-1', sender: 'bob', receiver: 'alice', subject: 'Question about Web Sec Lab', body: 'Hello Professor Alice, I am working on the Cookie Lab but I am stuck on how to retrieve the session cookie via JS. Could you give me a hint?', createdAt: '2026-05-20T14:15:00Z' },
    { id: 'msg-2', sender: 'alice', receiver: 'bob', subject: 'Re: Question about Web Sec Lab', body: 'Hi Bob, check document.cookie in your browser developer console. If the cookie does not have the HttpOnly flag, you can access it directly via JavaScript!', createdAt: '2026-05-20T15:00:00Z' }
  ];

  const defaultEvents = [
    { id: 'evt-1', title: 'Web Security Class Lecture', date: '2026-05-22', username: 'bob' },
    { id: 'evt-2', title: 'Final Exam Study Group', date: '2026-05-26', username: 'bob' }
  ];

  window.initializeDB = function() {
    let usersCreated = false;
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      window.logTransaction('sql', "CREATE TABLE users (username VARCHAR(50) PRIMARY KEY, password_hash VARCHAR(100), name VARCHAR(100), role VARCHAR(20), email VARCHAR(100), avatar TEXT);");
      window.logTransaction('sql', "INSERT INTO users VALUES ('alice', 'alice123', 'Professor Alice Smith', 'teacher', ...);");
      window.logTransaction('sql', "INSERT INTO users VALUES ('bob', 'bob123', 'Bob Jenkins', 'student', ...);");
      window.logTransaction('sql', "INSERT INTO users VALUES ('ranilojohn', 'ranilojohn123', 'Ranilo John', 'student', ...);");
      usersCreated = true;
    }

    if (!usersCreated) {
      try {
        const storedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
        if (!storedUsers.ranilojohn) {
          storedUsers.ranilojohn = defaultUsers.ranilojohn;
          localStorage.setItem(USERS_KEY, JSON.stringify(storedUsers));
          window.logTransaction('sql', "INSERT INTO users VALUES ('ranilojohn', 'ranilojohn123', 'Ranilo John', 'student', ...);");
        }
      } catch (e) {}
    }

    if (!localStorage.getItem(SESSIONS_KEY)) {
      const aliceSessionId = generateRandomSessionId();
      const seeds = {
        [aliceSessionId]: {
          id: aliceSessionId,
          username: 'alice',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          userAgent: window.navigator.userAgent,
          ipAddress: '192.168.1.45'
        }
      };
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(seeds));
      window.logTransaction('sql', "CREATE TABLE sessions (session_id VARCHAR(50) PRIMARY KEY, username VARCHAR(50), created_at TIMESTAMP, user_agent TEXT, ip_address VARCHAR(45));");
      window.logTransaction('sql', `INSERT INTO sessions VALUES ('${aliceSessionId}', 'alice', datetime('now', '-1 hour'), '${window.navigator.userAgent.substring(0, 30)}...', '192.168.1.45');`);
    }

    if (!localStorage.getItem(COURSES_KEY)) {
      localStorage.setItem(COURSES_KEY, JSON.stringify(defaultCourses));
      window.logTransaction('sql', "CREATE TABLE courses (id VARCHAR(20) PRIMARY KEY, code VARCHAR(20), name VARCHAR(100), term VARCHAR(20), color TEXT, teacher VARCHAR(50));");
    }

    if (!localStorage.getItem(ASSIGNMENTS_KEY)) {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(defaultAssignments));
      window.logTransaction('sql', "CREATE TABLE assignments (id VARCHAR(20) PRIMARY KEY, course_id VARCHAR(20), title VARCHAR(100), points INT, due_date DATE, description TEXT);");
    }

    if (!localStorage.getItem(SUBMISSIONS_KEY)) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(defaultSubmissions));
      window.logTransaction('sql', "CREATE TABLE submissions (id VARCHAR(20) PRIMARY KEY, assignment_id VARCHAR(20), username VARCHAR(50), content TEXT, submitted_at TIMESTAMP, grade INT, feedback TEXT);");
    }

    if (!localStorage.getItem(MESSAGES_KEY)) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(defaultMessages));
      window.logTransaction('sql', "CREATE TABLE messages (id VARCHAR(20) PRIMARY KEY, sender VARCHAR(50), receiver VARCHAR(50), subject TEXT, body TEXT, created_at TIMESTAMP);");
    }

    if (!localStorage.getItem(CALENDAR_KEY)) {
      localStorage.setItem(CALENDAR_KEY, JSON.stringify(defaultEvents));
      window.logTransaction('sql', "CREATE TABLE calendar_events (id VARCHAR(20) PRIMARY KEY, title TEXT, date DATE, username VARCHAR(50));");
    }
  };

  window.resetDB = function() {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(COURSES_KEY);
    localStorage.removeItem(ASSIGNMENTS_KEY);
    localStorage.removeItem(SUBMISSIONS_KEY);
    localStorage.removeItem(MESSAGES_KEY);
    localStorage.removeItem(CALENDAR_KEY);
    localStorage.removeItem(LOGS_KEY);
    localStorage.removeItem(PROTECTIONS_KEY);
    
    window.initializeDB();
    window.logTransaction('sql', "-- DATABASE COLD BOOT: All tables dropped and re-seeded.");
    window.location.reload();
  };

  window.getUsers = function() {
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  window.registerUser = function(username, passwordHash, name, role, email) {
    window.initializeDB();
    const users = window.getUsers();
    const lowerUsername = username.trim().toLowerCase();

    if (!lowerUsername || !passwordHash || !name || !email) {
      return { success: false, error: 'All fields are required' };
    }

    if (users[lowerUsername]) {
      window.logTransaction('sql', `SELECT * FROM users WHERE username = '${lowerUsername}'; -- USER EXISTS ERROR`);
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
    window.logTransaction('sql', `INSERT INTO users (username, password_hash, name, role, email, avatar) VALUES ('${lowerUsername}', '${passwordHash}', '${name}', '${role}', '${email}', '${avatar}');`);
    window.dispatchEvent(new Event('db_changed'));
    return { success: true };
  };

  window.loginUser = function(username, passwordHash) {
    window.initializeDB();
    const users = window.getUsers();
    const lowerUsername = username.trim().toLowerCase();
    
    window.logTransaction('sql', `SELECT * FROM users WHERE username = '${lowerUsername}' AND password_hash = '${passwordHash}';`);

    const user = users[lowerUsername];
    if (!user || user.passwordHash !== passwordHash) {
      window.logTransaction('http', `POST /api/login - 401 Unauthorized - Auth failed for user '${lowerUsername}'`);
      return { success: false, error: 'Invalid username or password' };
    }

    const sessionId = generateRandomSessionId();
    const sessions = window.getSessions();
    const userAgent = window.navigator.userAgent;
    const ipAddress = '192.168.1.' + (Math.floor(Math.random() * 250) + 2);

    const newSession = {
      id: sessionId,
      username: lowerUsername,
      createdAt: new Date().toISOString(),
      userAgent,
      ipAddress
    };

    sessions[sessionId] = newSession;
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

    window.logTransaction('sql', `INSERT INTO sessions (session_id, username, created_at, user_agent, ip_address) VALUES ('${sessionId}', '${lowerUsername}', datetime('now'), '${userAgent.substring(0, 30)}...', '${ipAddress}');`);
    window.logTransaction('http', `POST /api/login - 200 OK - Set-Cookie: canvas_session_id=${sessionId}`);

    const protections = window.getSecurityProtections();
    window.cookieManager.set('canvas_session_id', sessionId, {
      maxAge: 86400,
      httpOnly: protections.httpOnly,
      path: '/'
    });

    window.dispatchEvent(new Event('db_changed'));
    return { success: true, session: newSession };
  };

  window.logoutUser = function(sessionId) {
    const sessions = window.getSessions();
    const session = sessions[sessionId];
    
    if (session) {
      delete sessions[sessionId];
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      window.logTransaction('sql', `DELETE FROM sessions WHERE session_id = '${sessionId}';`);
      window.logTransaction('http', `POST /api/logout - 200 OK - Session ${sessionId} destroyed`);
    }
    
    window.cookieManager.delete('canvas_session_id');
    window.dispatchEvent(new Event('db_changed'));
  };

  window.getSessions = function() {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  window.authenticateServerRequest = function() {
    window.initializeDB();
    const sessionId = window.cookieManager.getServerCookie('canvas_session_id');
    const protections = window.getSecurityProtections();
    const currentUA = window.navigator.userAgent;

    if (!sessionId) {
      window.logTransaction('http', `GET /api/user - 401 Unauthorized - No session cookie found`);
      return { user: null, session: null, logs: [] };
    }

    const sessions = window.getSessions();
    const session = sessions[sessionId];

    window.logTransaction('sql', `SELECT * FROM sessions WHERE session_id = '${sessionId}';`);

    if (!session) {
      window.logTransaction('http', `GET /api/user - 401 Unauthorized - Invalid session ID '${sessionId}'`);
      window.cookieManager.delete('canvas_session_id');
      return { user: null, session: null, logs: [] };
    }

    if (protections.sessionBinding) {
      if (session.userAgent !== currentUA) {
        window.logTransaction('http', `GET /api/user - 403 Forbidden - Session Hijack Blocked! Fingerprint mismatch.`);
        window.logTransaction('http', `-- Expected User-Agent: ${session.userAgent.substring(0, 30)}...`);
        window.logTransaction('http', `-- Received User-Agent: ${currentUA.substring(0, 30)}...`);
        return { user: null, session: null, logs: [`Session Hijacking Blocked! User-Agent mismatch.`] };
      }
    }

    const users = window.getUsers();
    const user = users[session.username];

    window.logTransaction('sql', `SELECT * FROM users WHERE username = '${session.username}';`);

    if (!user) {
      window.logTransaction('http', `GET /api/user - 404 Not Found - User '${session.username}' not found for active session`);
      return { user: null, session: null, logs: [] };
    }

    if (protections.tokenRotation) {
      const newSessionId = generateRandomSessionId();
      const newSession = {
        ...session,
        id: newSessionId
      };
      
      delete sessions[sessionId];
      sessions[newSessionId] = newSession;
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

      window.logTransaction('sql', `UPDATE sessions SET session_id = '${newSessionId}' WHERE session_id = '${sessionId}'; -- TOKEN ROTATION`);
      window.logTransaction('http', `GET /api/user - 200 OK (Rotated) - Set-Cookie: canvas_session_id=${newSessionId}`);

      window.cookieManager.set('canvas_session_id', newSessionId, {
        maxAge: 86400,
        httpOnly: protections.httpOnly,
        path: '/'
      });

      window.dispatchEvent(new Event('db_changed'));
      return { user, session: newSession, logs: [`Session rotated from ${sessionId.substring(0, 10)}... to ${newSessionId.substring(0, 10)}...`] };
    }

    window.logTransaction('http', `GET /api/user - 200 OK - Authenticated as ${user.role}: ${user.name}`);
    return { user, session, logs: [] };
  };

  window.getCourses = function() {
    window.initializeDB();
    window.logTransaction('sql', "SELECT * FROM courses;");
    try {
      const data = localStorage.getItem(COURSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  window.createCourse = function(code, name, color, teacher) {
    const courses = window.getCourses();
    const newCourse = {
      id: code,
      code,
      name,
      term: 'Spring 2026',
      color,
      teacher
    };
    courses.push(newCourse);
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    window.logTransaction('sql', `INSERT INTO courses (id, code, name, term, color, teacher) VALUES ('${code}', '${code}', '${name}', 'Spring 2026', '${color}', '${teacher}');`);
    return newCourse;
  };

  window.getAssignments = function(courseId) {
    window.initializeDB();
    window.logTransaction('sql', `SELECT * FROM assignments WHERE course_id = '${courseId}';`);
    try {
      const data = localStorage.getItem(ASSIGNMENTS_KEY);
      const assignments = data ? JSON.parse(data) : [];
      return assignments.filter(a => a.courseId === courseId);
    } catch {
      return [];
    }
  };

  window.getSubmissions = function(assignmentId) {
    window.initializeDB();
    window.logTransaction('sql', `SELECT * FROM submissions WHERE assignment_id = '${assignmentId}';`);
    try {
      const data = localStorage.getItem(SUBMISSIONS_KEY);
      const submissions = data ? JSON.parse(data) : [];
      return submissions.filter(s => s.assignmentId === assignmentId);
    } catch {
      return [];
    }
  };

  window.getStudentSubmissions = function(username) {
    window.initializeDB();
    window.logTransaction('sql', `SELECT * FROM submissions WHERE username = '${username}';`);
    try {
      const data = localStorage.getItem(SUBMISSIONS_KEY);
      const submissions = data ? JSON.parse(data) : [];
      return submissions.filter(s => s.username === username);
    } catch {
      return [];
    }
  };

  window.submitAssignment = function(assignmentId, username, content) {
    window.initializeDB();
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    const submissions = data ? JSON.parse(data) : [];
    
    const newSubmission = {
      id: 'sub-' + Math.random().toString(36).substr(2, 9),
      assignmentId,
      username,
      content,
      submittedAt: new Date().toISOString(),
      grade: null,
      feedback: null
    };

    submissions.push(newSubmission);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));

    window.logTransaction('sql', `INSERT INTO submissions (id, assignment_id, username, content, submitted_at) VALUES ('${newSubmission.id}', '${assignmentId}', '${username}', ..., datetime('now'));`);
    return newSubmission;
  };

  window.gradeSubmission = function(submissionId, grade, feedback) {
    window.initializeDB();
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    const submissions = data ? JSON.parse(data) : [];
    
    const index = submissions.findIndex(s => s.id === submissionId);
    if (index !== -1) {
      submissions[index].grade = parseInt(grade, 10);
      submissions[index].feedback = feedback;
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
      window.logTransaction('sql', `UPDATE submissions SET grade = ${grade}, feedback = '${feedback}' WHERE id = '${submissionId}';`);
      return true;
    }
    return false;
  };

  window.getMessages = function(username) {
    window.initializeDB();
    window.logTransaction('sql', `SELECT * FROM messages WHERE sender = '${username}' OR receiver = '${username}';`);
    try {
      const data = localStorage.getItem(MESSAGES_KEY);
      const messages = data ? JSON.parse(data) : [];
      return messages.filter(m => m.sender === username || m.receiver === username);
    } catch {
      return [];
    }
  };

  window.sendMessage = function(sender, receiver, subject, body) {
    window.initializeDB();
    const data = localStorage.getItem(MESSAGES_KEY);
    const messages = data ? JSON.parse(data) : [];
    
    const newMsg = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      sender,
      receiver,
      subject,
      body,
      createdAt: new Date().toISOString()
    };

    messages.push(newMsg);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

    window.logTransaction('sql', `INSERT INTO messages (id, sender, receiver, subject, body, created_at) VALUES ('${newMsg.id}', '${sender}', '${receiver}', '${subject}', ..., datetime('now'));`);
    return newMsg;
  };

  window.getCalendarEvents = function(username) {
    window.initializeDB();
    window.logTransaction('sql', `SELECT * FROM calendar_events WHERE username = '${username}';`);
    try {
      const data = localStorage.getItem(CALENDAR_KEY);
      const events = data ? JSON.parse(data) : [];
      return events.filter(e => e.username === username);
    } catch {
      return [];
    }
  };

  window.addCalendarEvent = function(title, date, username) {
    window.initializeDB();
    const data = localStorage.getItem(CALENDAR_KEY);
    const events = data ? JSON.parse(data) : [];
    
    const newEvt = {
      id: 'evt-' + Math.random().toString(36).substr(2, 9),
      title,
      date,
      username
    };

    events.push(newEvt);
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(events));

    window.logTransaction('sql', `INSERT INTO calendar_events (id, title, date, username) VALUES ('${newEvt.id}', '${title}', '${date}', '${username}');`);
    return newEvt;
  };

  // Run immediately on boot to guarantee basic database initialization
  window.initializeDB();
})();
