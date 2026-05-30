import React, { useState, useEffect } from 'react';
import { 
  authenticateServerRequest, 
  getCourses, 
  createCourse,
  getAssignments, 
  getSubmissions,
  getStudentSubmissions, 
  submitAssignment, 
  gradeSubmission, 
  getMessages, 
  sendMessage, 
  getCalendarEvents, 
  addCalendarEvent,
  resetDB,
  logoutUser,
  logTransaction,
  syncWithServer,
  User as DBUser,
  Session as DBSession,
  Course as DBCourse,
  Assignment as DBAssignment,
  Submission as DBSubmission,
  Message as DBMessage,
  CalendarEvent as DBCalendarEvent
} from '../utils/db';
import { subscribeToCookies, cookieManager } from '../utils/cookies';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Inbox as InboxIcon, 
  LogOut, 
  ChevronRight, 
  FileText, 
  Send, 
  Plus, 
  X, 
  FileLock2, 
  MessageSquare,
  Lock,
  Shield,
  ShieldCheck,
  ShieldOff
} from 'lucide-react';
import { getSecurityProtections, setSecurityProtections } from '../utils/db';


export default function Home() {
  const [currentUser, setCurrentUser] = useState<DBUser | null>(null);
  const [currentSession, setCurrentSession] = useState<DBSession | null>(null);
  
  // App navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'calendar' | 'inbox' | 'admin'>('dashboard');
  
  // Selected course details
  const [selectedCourse, setSelectedCourse] = useState<DBCourse | null>(null);
  const [courseTab, setCourseTab] = useState<'syllabus' | 'assignments' | 'files' | 'grades' | 'people'>('syllabus');
  const [selectedAssignment, setSelectedAssignment] = useState<DBAssignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [activeSubmissions, setActiveSubmissions] = useState<DBSubmission[]>([]);
  const [gradingScores, setGradingScores] = useState<Record<string, { grade: number; feedback: string }>>({});

  // DB and Cookies collections
  const [courses, setCourses] = useState<DBCourse[]>([]);
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<DBCalendarEvent[]>([]);

  // Modals / Inbox state
  const [isNewMsgOpen, setIsNewMsgOpen] = useState(false);
  const [msgReceiver, setMsgReceiver] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [selectedInboxMsg, setSelectedInboxMsg] = useState<DBMessage | null>(null);

  // New Course creation state (Teacher only)
  const [isNewCourseOpen, setIsNewCourseOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseColor, setNewCourseColor] = useState('from-indigo-600 to-blue-700');

  // Calendar event creation
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  
  // File locker visual modal
  const [fileErrorMsg, setFileErrorMsg] = useState<string | null>(null);
  const [showExamAnswers, setShowExamAnswers] = useState(false);

  // Security Panel State
  const [protections, setProtectionsState] = useState(getSecurityProtections());
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);

  const toggleProtection = (key: keyof typeof protections) => {
    const next = { ...protections, [key]: !protections[key] };
    setProtectionsState(next);
    setSecurityProtections(next);

    // Dynamic simulation: instantly rewrite the active session cookie to update its HttpOnly visibility
    if (key === 'httpOnly') {
      const sessionId = cookieManager.getServerCookie('rivancyber_session_id');
      if (sessionId) {
        cookieManager.set('rivancyber_session_id', sessionId, {
          maxAge: 86400,
          httpOnly: next.httpOnly,
          path: '/'
        });
      }
    }
  };

  // Authenticate user on load
  const runAuth = () => {
    const auth = authenticateServerRequest();
    if (auth.user) {
      setCurrentUser(auth.user);
      setCurrentSession(auth.session);
    } else {
      // Redirect to login if unauthenticated
      window.history.pushState(null, '', '/login');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  useEffect(() => {
    runAuth();
    setCourses(getCourses());
    syncWithServer();

    const handleCookiesChanged = () => {
      runAuth();
    };

    window.addEventListener('cookies_changed', handleCookiesChanged);
    const unsubscribeCookies = subscribeToCookies(handleCookiesChanged);

    return () => {
      window.removeEventListener('cookies_changed', handleCookiesChanged);
      unsubscribeCookies();
    };
  }, []);

  // Sync data based on logged-in user
  useEffect(() => {
    if (currentUser) {
      setMessages(getMessages(currentUser.username));
      setCalendarEvents(getCalendarEvents(currentUser.username));
    }
  }, [currentUser]);

  const handleLogout = () => {
    if (currentSession) {
      logoutUser(currentSession.id);
    }
    window.history.pushState(null, '', '/login');
    window.dispatchEvent(new Event('popstate'));
  };

  // Submit Assignment Handler
  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !currentUser || !submissionText) return;
    
    submitAssignment(selectedAssignment.id, currentUser.username, submissionText);
    setSubmissionText('');
    setSelectedAssignment(null);
    alert('Assignment submitted successfully!');
    runAuth(); // Re-authenticate/log transaction
  };

  // Grade Submission Handler
  const handleGradeSubmission = (submissionId: string) => {
    const data = gradingScores[submissionId];
    if (!data || data.grade === undefined) return;
    
    gradeSubmission(submissionId, data.grade, data.feedback || '');
    alert('Grade saved successfully!');
    
    // Refresh submissions
    if (selectedAssignment) {
      setActiveSubmissions(getSubmissions(selectedAssignment.id));
    }
  };

  // Message Handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !msgReceiver || !msgSubject || !msgBody) return;
    
    sendMessage(currentUser.username, msgReceiver.trim().toLowerCase(), msgSubject, msgBody);
    setMsgReceiver('');
    setMsgSubject('');
    setMsgBody('');
    setIsNewMsgOpen(false);
    setMessages(getMessages(currentUser.username));
    alert('Message sent successfully!');
  };

  // Create Course Handler
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newCourseName || !newCourseCode) return;
    
    createCourse(newCourseCode, newCourseName, newCourseColor, currentUser.username);
    setNewCourseName('');
    setNewCourseCode('');
    setIsNewCourseOpen(false);
    setCourses(getCourses());
    alert('Course created successfully!');
  };

  // Create Event Handler
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newEventTitle || !newEventDate) return;
    
    addCalendarEvent(newEventTitle, newEventDate, currentUser.username);
    setNewEventTitle('');
    setNewEventDate('');
    setIsNewEventOpen(false);
    setCalendarEvents(getCalendarEvents(currentUser.username));
    alert('Event added to calendar!');
  };

  // File download simulation
  const handleFileClick = async (fileName: string) => {
    if (fileName === 'Final_Exam_Answers.pdf') {
      try {
        const response = await fetch('/api/files/Final_Exam_Answers.pdf');
        if (response.status === 200) {
          logTransaction('http', `GET /api/files/Final_Exam_Answers.pdf - 200 OK - Teacher '${currentUser?.username}' downloaded file`);
          setShowExamAnswers(true);
        } else if (response.status === 403) {
          logTransaction('http', `GET /api/files/Final_Exam_Answers.pdf - 403 Forbidden - User '${currentUser?.username}' is role student`);
          setFileErrorMsg(`Access Denied! You are currently authenticated as "${currentUser?.name}" (Role: Student). The folder "/courses/SEC-202/files/restricted" requires Role: Teacher.`);
        } else {
          logTransaction('http', `GET /api/files/Final_Exam_Answers.pdf - ${response.status} ${response.statusText}`);
          setFileErrorMsg(`Access Denied! Server returned status ${response.status}.`);
        }
      } catch (err) {
        console.error(err);
        setFileErrorMsg('Network error trying to fetch restricted file.');
      }
    }
  };
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden font-sans">
      
      {/* 1. Main Navigation Sidebar */}
      <aside className="w-20 sm:w-24 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6 shrink-0 z-20">
        
        {/* Logo Icon */}
        <div className="p-1 mb-2">
          <img src="/logo.png" alt="RivanCyber Logo" className="w-12 h-12 object-contain" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
            { id: 'inbox', label: 'Inbox', icon: InboxIcon, badge: messages.length }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'courses' && selectedCourse !== null && activeTab === 'courses');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (item.id !== 'courses') setSelectedCourse(null);
                }}
                className={`w-full py-3 px-1 rounded-xl flex flex-col items-center gap-1.5 transition-all group relative cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
                <span className="text-[10px] font-semibold tracking-wide hidden sm:block">{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute top-2 right-4 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* User Profile avatar */}
        {currentUser && (
          <div className="flex flex-col items-center gap-4 mt-auto w-full px-2 border-t border-slate-800/60 pt-6">
            <div className="relative group cursor-pointer" title={`Profile: ${currentUser.name}`}>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-10 h-10 rounded-xl border border-slate-700 object-cover ring-2 ring-blue-500/10 group-hover:ring-blue-500/30 transition-all"
              />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                currentUser.role === 'teacher' ? 'bg-amber-400' : 'bg-blue-500'
              }`}></span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </aside>

      {/* 2. Main Page Content Area */}
      <main className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto">
        
        {/* Top Header */}
        <header className="flex justify-between items-center pb-6 border-b border-slate-800/60 mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              {selectedCourse && activeTab === 'courses' ? (
                <>
                  <span className="text-slate-400 font-normal cursor-pointer hover:underline" onClick={() => setSelectedCourse(null)}>
                    Courses
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                  <span>{selectedCourse.code}</span>
                </>
              ) : (
                activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
              )}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Welcome back, <span className="font-semibold text-slate-200">{currentUser?.name}</span> ({currentUser?.role})
            </p>
          </div>

          {/* Security Panel Button */}
          <button
            onClick={() => setShowSecurityPanel(!showSecurityPanel)}
            className={`flex items-center gap-2 border px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none ${
              (protections.httpOnly || protections.sessionBinding || protections.tokenRotation)
                ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20'
                : 'bg-red-600/10 border-red-500/30 text-red-400 hover:bg-red-600/20'
            }`}
          >
            {(protections.httpOnly || protections.sessionBinding || protections.tokenRotation) ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>🟢 Security: Enabled</span>
              </>
            ) : (
              <>
                <ShieldOff className="w-4 h-4 animate-pulse" />
                <span>🔴 Security: Disabled</span>
              </>
            )}
          </button>
        </header>


        {/* CONTENT CONTAINER SWITCH */}
        <div className="flex-1 min-h-0">
          
          {/* --- DASHBOARD TAB --- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Security Panel */}
              {showSecurityPanel && (
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4 animate-slide-down">
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>Security Protections Config</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Toggle defenses to test how they block session hijacking vulnerabilities.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* HttpOnly Cookies */}
                    <div className={`p-4 border rounded-xl bg-slate-950/20 transition-all flex flex-col justify-between ${
                      protections.httpOnly ? 'border-blue-500/30' : 'border-slate-800/60'
                    }`}>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-200">HttpOnly Cookies</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            protections.httpOnly ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                          }`}>{protections.httpOnly ? 'Active' : 'Inactive'}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Hides the session cookie from client-side JavaScript. Prevents token retrieval via <code className="text-amber-500 font-mono">document.cookie</code>.
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => toggleProtection('httpOnly')}
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                            protections.httpOnly ? 'bg-blue-600' : 'bg-slate-800'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                            protections.httpOnly ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Session Binding */}
                    <div className={`p-4 border rounded-xl bg-slate-950/20 transition-all flex flex-col justify-between ${
                      protections.sessionBinding ? 'border-blue-500/30' : 'border-slate-800/60'
                    }`}>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-200">Session Binding (User-Agent)</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            protections.sessionBinding ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                          }`}>{protections.sessionBinding ? 'Active' : 'Inactive'}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Validates User-Agent fingerprint. A stolen session token imported into a different browser will be rejected as unauthorized.
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => toggleProtection('sessionBinding')}
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                            protections.sessionBinding ? 'bg-blue-600' : 'bg-slate-800'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                            protections.sessionBinding ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Token Rotation */}
                    <div className={`p-4 border rounded-xl bg-slate-950/20 transition-all flex flex-col justify-between ${
                      protections.tokenRotation ? 'border-blue-500/30' : 'border-slate-800/60'
                    }`}>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-200">Session Token Rotation</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            protections.tokenRotation ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                          }`}>{protections.tokenRotation ? 'Active' : 'Inactive'}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Generates and sets a new session token on every valid HTTP request. Stolen tokens are immediately rendered obsolete and invalid.
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => toggleProtection('tokenRotation')}
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                            protections.tokenRotation ? 'bg-blue-600' : 'bg-slate-800'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                            protections.tokenRotation ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructor-Only Panel */}
              {currentUser?.role === 'teacher' && (
                <div className="bg-slate-900 border border-red-950/40 rounded-2xl overflow-hidden shadow-lg border-l-4 border-l-red-600">
                  <div className="bg-slate-950/60 px-5 py-4 border-b border-slate-800/80 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                      <h4 className="font-bold text-slate-200 text-sm tracking-wide uppercase">🔐 INSTRUCTOR PANEL — Confidential</h4>
                    </div>
                  </div>
                  <div className="p-5 text-sm space-y-4">
                    <p className="text-slate-400 text-xs">
                      ⚠️ This banner is only visible to authorized instructors. If you are a student reading this, you have successfully compromised a session token or escalated your privileges.
                    </p>
                    <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-500/10 rounded-lg text-red-400 border border-red-500/20">
                          <FileLock2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Final_Exam_Answers.pdf</span>
                          <span className="text-[11px] text-slate-500 font-mono">Location: /courses/SEC-202/files/restricted</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowExamAnswers(true)}
                        className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-red-950/30 cursor-pointer"
                      >
                        View Answers
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-300">Enrolled Courses</h3>
                {currentUser?.role === 'teacher' && (
                  <button
                    onClick={() => setIsNewCourseOpen(true)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Course</span>
                  </button>
                )}
              </div>

              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourse(course);
                      setActiveTab('courses');
                      setCourseTab('syllabus');
                    }}
                    className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:border-slate-700/80 transition-all duration-200 cursor-pointer group flex flex-col"
                  >
                    {/* Gradient Header */}
                    <div className={`h-28 bg-gradient-to-r ${course.color} p-4 flex flex-col justify-end relative`}>
                      <span className="text-xs bg-slate-950/30 text-white px-2 py-0.5 rounded-full backdrop-blur-md absolute top-4 right-4 border border-white/5">
                        {course.term}
                      </span>
                      <h4 className="text-white font-extrabold text-lg leading-tight tracking-wide group-hover:underline">
                        {course.code}
                      </h4>
                    </div>
                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between bg-slate-900">
                      <div>
                        <h5 className="font-bold text-slate-200 text-sm mb-1">{course.name}</h5>
                        <p className="text-xs text-slate-500">Instructor: {course.teacher === 'alice' ? 'Prof. Alice Smith' : course.teacher}</p>
                      </div>
                      <div className="flex gap-4 border-t border-slate-800/60 pt-4 mt-4 text-slate-400 group-hover:text-slate-300">
                        <span className="flex items-center gap-1 text-xs">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Materials</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Discussions</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>


            </div>
          )}

          {/* --- COURSES TAB (DETAIL VIEW) --- */}
          {activeTab === 'courses' && selectedCourse && (
            <div className="flex flex-col md:flex-row gap-6 items-start h-full">
              
              {/* Course navigation list */}
              <nav className="w-full md:w-48 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4 overflow-x-auto shrink-0 scrollbar-hide">
                {[
                  { id: 'syllabus', label: 'Syllabus' },
                  { id: 'assignments', label: 'Assignments' },
                  { id: 'files', label: 'Files' },
                  { id: 'grades', label: 'Grades' },
                  { id: 'people', label: 'People' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCourseTab(tab.id as any);
                      setSelectedAssignment(null);
                    }}
                    className={`py-2 px-4 rounded-lg text-left text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                      courseTab === tab.id
                        ? 'bg-slate-800 text-blue-400 border border-slate-700/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Course subpage content */}
              <div className="flex-1 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl min-h-[400px]">
                
                {/* 1. SYLLABUS TAB */}
                {courseTab === 'syllabus' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-200">{selectedCourse.code}: {selectedCourse.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Welcome to this term's course! This portal contains all coursework, syllabus documents, and assignments. Ensure to review the files section for course lectures.
                    </p>
                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Class Meeting Times</h4>
                      <p className="text-sm text-slate-300 font-medium">Tuesdays & Thursdays, 10:00 AM - 11:30 AM</p>
                    </div>
                  </div>
                )}

                {/* 2. ASSIGNMENTS TAB */}
                {courseTab === 'assignments' && (
                  <div className="space-y-4">
                    {!selectedAssignment ? (
                      <>
                        <h3 className="text-lg font-bold text-slate-200">Course Assignments</h3>
                        <div className="space-y-3">
                          {getAssignments(selectedCourse.id).map(asm => (
                            <div
                              key={asm.id}
                              onClick={() => {
                                setSelectedAssignment(asm);
                                if (currentUser?.role === 'teacher') {
                                  setActiveSubmissions(getSubmissions(asm.id));
                                }
                              }}
                              className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer flex justify-between items-center group"
                            >
                              <div>
                                <h4 className="font-bold text-slate-200 group-hover:underline text-sm sm:text-base">{asm.title}</h4>
                                <p className="text-xs text-slate-500 mt-1">Due: {asm.dueDate} | Points: {asm.points}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      // ASSIGNMENT SPECIFIC WORKFLOW
                      <div className="space-y-6">
                        <button
                          onClick={() => setSelectedAssignment(null)}
                          className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          &larr; Back to list
                        </button>
                        
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedAssignment.title}</h3>
                          <div className="flex gap-4 text-xs text-slate-500 mt-1.5">
                            <span>Points: {selectedAssignment.points}</span>
                            <span>Due Date: {selectedAssignment.dueDate}</span>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-sm text-slate-300 mt-4 leading-relaxed whitespace-pre-line">
                            {selectedAssignment.description}
                          </div>
                        </div>

                        {/* STUDENT FLOW: Submit Assignment */}
                        {currentUser?.role === 'student' && (
                          <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
                            <h4 className="font-bold text-slate-200 text-sm">Submit Work</h4>
                            <form onSubmit={handleSubmitAssignment} className="space-y-4">
                              <textarea
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                                placeholder="Type your submission content here..."
                                rows={5}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                              />
                              <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-5 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Submit Assignment</span>
                              </button>
                            </form>
                          </div>
                        )}
                        {/* TEACHER FLOW: View and Grade Submissions */}
                        {currentUser?.role === 'teacher' && (
                          <div className="space-y-4">
                            <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-2 text-sm sm:text-base">
                              Student Submissions
                            </h4>
                            
                            {activeSubmissions.length === 0 ? (
                              <p className="text-sm text-slate-500 italic">No submissions submitted yet.</p>
                            ) : (
                              <div className="space-y-4">
                                {activeSubmissions.map(sub => (
                                  <div key={sub.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h5 className="font-bold text-slate-200 text-sm">Student ID: {sub.username.toUpperCase()}</h5>
                                        <p className="text-xs text-slate-500 mt-0.5">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                      </div>
                                      <div className="text-right">
                                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                                          sub.grade !== null ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        }`}>
                                          {sub.grade !== null ? `Graded: ${sub.grade}/${selectedAssignment.points}` : 'Needs Grading'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-400 select-all border border-slate-800">
                                      {sub.content}
                                    </div>
                                    
                                    {/* Grading Form */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-4">
                                      <div className="space-y-1">
                                        <label className="text-[11px] text-slate-400 font-bold uppercase">Grade Score</label>
                                        <input
                                          type="number"
                                          max={selectedAssignment.points}
                                          placeholder="Grade"
                                          value={gradingScores[sub.id]?.grade ?? (sub.grade || '')}
                                          onChange={(e) => setGradingScores({
                                            ...gradingScores,
                                            [sub.id]: {
                                              grade: parseInt(e.target.value),
                                              feedback: gradingScores[sub.id]?.feedback ?? (sub.feedback || '')
                                            }
                                          })}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200"
                                        />
                                      </div>
                                      <div className="space-y-1 sm:col-span-2">
                                        <label className="text-[11px] text-slate-400 font-bold uppercase">Feedback</label>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            placeholder="Provide constructive feedback..."
                                            value={gradingScores[sub.id]?.feedback ?? (sub.feedback || '')}
                                            onChange={(e) => setGradingScores({
                                              ...gradingScores,
                                              [sub.id]: {
                                                grade: gradingScores[sub.id]?.grade ?? (sub.grade || 0),
                                                feedback: e.target.value
                                              }
                                            })}
                                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-650"
                                          />
                                          <button
                                            onClick={() => handleGradeSubmission(sub.id)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 text-xs font-semibold transition-colors cursor-pointer"
                                          >
                                            Save
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )}

                {/* 3. FILES TAB */}
                {courseTab === 'files' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-200">Course Materials & Files</h3>
                    <p className="text-xs text-slate-500">Click files to download/view.</p>
                    
                    <div className="space-y-2">
                      {[
                        { name: 'SEC202_Syllabus.pdf', size: '2.1 MB', icon: FileText, date: '2026-05-18' },
                        { name: 'lecture_slides_week1.pdf', size: '15.4 MB', icon: FileText, date: '2026-05-19' },
                        { name: 'Final_Exam_Answers.pdf', size: '124 KB', icon: FileLock2, date: '2026-05-20', isSecret: true }
                      ].map((file, idx) => {
                        const Icon = file.icon;
                        return (
                          <div
                            key={idx}
                            onClick={() => handleFileClick(file.name)}
                            className={`p-3 bg-slate-900 border rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                              file.isSecret 
                                ? 'border-amber-500/20 hover:bg-amber-500/5 hover:border-amber-500/40' 
                                : 'border-slate-800 hover:bg-slate-805 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${file.isSecret ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <span className={`text-sm font-semibold block ${file.isSecret ? 'text-amber-400' : 'text-slate-200'}`}>
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-slate-500">{file.size} | Updated: {file.date}</span>
                              </div>
                            </div>
                            
                            {file.isSecret && (
                              <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Restricted
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. GRADES TAB */}
                {courseTab === 'grades' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-200">Gradebook</h3>
                    
                    {currentUser?.role === 'student' ? (
                      // Student Grades
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 font-semibold text-xs">
                                <th className="py-2.5">Name</th>
                                <th className="py-2.5">Due Date</th>
                                <th className="py-2.5">Score</th>
                                <th className="py-2.5">Out of</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getAssignments(selectedCourse.id).map(asm => {
                                const sub = getStudentSubmissions(currentUser.username).find(s => s.assignmentId === asm.id);
                                return (
                                  <tr key={asm.id} className="border-b border-slate-800 hover:bg-slate-900/30 text-slate-200">
                                    <td className="py-3 font-semibold">{asm.title}</td>
                                    <td className="py-3 text-slate-400">{asm.dueDate}</td>
                                    <td className="py-3 font-mono font-bold text-blue-400">
                                      {sub?.grade !== null && sub?.grade !== undefined ? sub.grade : '-'}
                                    </td>
                                    <td className="py-3 text-slate-400">{asm.points}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      // Teacher Grades Overview
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500">Full course roster grades summary.</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 font-semibold text-xs">
                                <th className="py-2.5">Student</th>
                                <th className="py-2.5">Assignment</th>
                                <th className="py-2.5">Submission Status</th>
                                <th className="py-2.5">Grade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getAssignments(selectedCourse.id).flatMap(asm => {
                                return getSubmissions(asm.id).map(sub => (
                                  <tr key={sub.id} className="border-b border-slate-800 text-slate-200">
                                    <td className="py-3 font-semibold">{sub.username.toUpperCase()}</td>
                                    <td className="py-3 text-slate-400">{asm.title}</td>
                                    <td className="py-3">
                                      <span className="text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                                        Submitted
                                      </span>
                                    </td>
                                    <td className="py-3 font-mono font-bold text-amber-400">
                                      {sub.grade !== null ? `${sub.grade} / ${asm.points}` : 'Needs Grading'}
                                    </td>
                                  </tr>
                                ));
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. PEOPLE TAB */}
                {courseTab === 'people' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-200">Course Roster</h3>
                    
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
                            alt="Alice Smith"
                            className="w-9 h-9 rounded-lg border border-slate-700 object-cover"
                          />
                          <div>
                            <span className="text-sm font-semibold text-slate-200 block">Professor Alice Smith</span>
                            <span className="text-xs text-slate-500">alice.smith@rivancyber.edu</span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded tracking-wide">
                          Teacher
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"
                            alt="Bob Jenkins"
                            className="w-9 h-9 rounded-lg border border-slate-700 object-cover"
                          />
                          <div>
                            <span className="text-sm font-semibold text-slate-200 block">Bob Jenkins</span>
                            <span className="text-xs text-slate-500">bob.jenkins@rivancyber.edu</span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded tracking-wide">
                          Student
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}
          {/* --- CALENDAR TAB --- */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-300">Class Schedule & Calendar</h3>
                  <p className="text-xs text-slate-500">Add events and track assignments.</p>
                </div>
                <button
                  onClick={() => setIsNewEventOpen(true)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Event</span>
                </button>
              </div>

              {/* Interactive Calendar layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Main Grid Calendar */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
                    <span className="font-bold text-slate-200">May 2026</span>
                    <div className="flex gap-2">
                      <button className="py-1 px-2.5 bg-slate-850 hover:bg-slate-800 rounded text-xs">Prev</button>
                      <button className="py-1 px-2.5 bg-slate-850 hover:bg-slate-800 rounded text-xs">Next</button>
                    </div>
                  </div>
                  
                  {/* Calendar Grid Header */}
                  <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                  </div>
                  
                  {/* Grid Cells */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Days padding (May starts on Friday) */}
                    <div className="aspect-square bg-slate-900/35 border border-slate-900/50 rounded-lg"></div>
                    <div className="aspect-square bg-slate-900/35 border border-slate-900/50 rounded-lg"></div>
                    <div className="aspect-square bg-slate-900/35 border border-slate-900/50 rounded-lg"></div>
                    <div className="aspect-square bg-slate-900/35 border border-slate-900/50 rounded-lg"></div>
                    <div className="aspect-square bg-slate-900/35 border border-slate-900/50 rounded-lg"></div>
                    
                    {/* Calendar Cells 1-31 */}
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const dateStr = `2026-05-${day.toString().padStart(2, '0')}`;
                      
                      // Find items on this date
                      const assignmentsOnDate = courses.flatMap(c => getAssignments(c.id)).filter(a => a.dueDate === dateStr);
                      const eventsOnDate = calendarEvents.filter(e => e.date === dateStr);

                      return (
                        <div
                          key={day}
                          className="aspect-square bg-slate-950/60 border border-slate-850 rounded-lg p-1.5 flex flex-col justify-between hover:border-slate-700 transition-colors group relative cursor-pointer"
                        >
                          <span className="text-xs text-slate-500 font-bold group-hover:text-slate-300">{day}</span>
                          
                          <div className="space-y-0.5 overflow-hidden">
                            {assignmentsOnDate.map(asm => (
                              <div key={asm.id} className="text-[7px] leading-tight px-1 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 truncate font-semibold" title={asm.title}>
                                Due: {asm.title}
                              </div>
                            ))}
                            {eventsOnDate.map(evt => (
                              <div key={evt.id} className="text-[7px] leading-tight px-1 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 truncate font-semibold" title={evt.title}>
                                {evt.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Side Agenda View */}
                <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h4 className="font-bold text-slate-200 text-sm">Agenda Events</h4>
                  <div className="space-y-3.5">
                    {/* Render Agenda */}
                    {courses.flatMap(c => getAssignments(c.id)).map(asm => (
                      <div key={asm.id} className="flex gap-3 text-xs leading-relaxed">
                        <span className="w-16 font-mono text-blue-400 shrink-0">{asm.dueDate}</span>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-200 block">Due: {asm.title}</span>
                          <span className="text-[10px] text-slate-500">Course Assignment | {asm.points} pts</span>
                        </div>
                      </div>
                    ))}
                    {calendarEvents.map(evt => (
                      <div key={evt.id} className="flex gap-3 text-xs leading-relaxed">
                        <span className="w-16 font-mono text-purple-400 shrink-0">{evt.date}</span>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-200 block">{evt.title}</span>
                          <span className="text-[10px] text-slate-500">Personal Calendar Event</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* --- INBOX TAB --- */}
          {activeTab === 'inbox' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[500px] flex">
              
              {/* Message List Sidebar */}
              <div className="w-1/3 border-r border-slate-800 flex flex-col min-w-[200px]">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
                  <h4 className="font-bold text-slate-200 text-sm">Conversations</h4>
                  <button
                    onClick={() => setIsNewMsgOpen(true)}
                    className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors cursor-pointer"
                    title="Compose Message"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
                  {messages.length === 0 ? (
                    <p className="p-4 text-xs text-slate-500 italic text-center">No messages yet.</p>
                  ) : (
                    messages.map(msg => {
                      const isSender = msg.sender === currentUser?.username;
                      const contactName = isSender ? msg.receiver : msg.sender;
                      const isSelected = selectedInboxMsg?.id === msg.id;
                      
                      return (
                        <div
                          key={msg.id}
                          onClick={() => setSelectedInboxMsg(msg)}
                          className={`p-3.5 text-left cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' 
                              : 'hover:bg-slate-850/40 text-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-xs uppercase text-slate-300">{contactName}</span>
                            <span className="text-[9px] text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h5 className="font-semibold text-xs truncate text-slate-100">{msg.subject}</h5>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{msg.body}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Message Details Pane */}
              <div className="flex-1 flex flex-col bg-slate-950/40">
                {selectedInboxMsg ? (
                  <div className="p-6 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
                        <div>
                          <h3 className="text-base font-bold text-white">{selectedInboxMsg.subject}</h3>
                          <p className="text-xs text-slate-400 mt-1">
                            From: <span className="font-semibold text-slate-200 uppercase">{selectedInboxMsg.sender}</span> &rarr; To: <span className="font-semibold text-slate-200 uppercase">{selectedInboxMsg.receiver}</span>
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-500">{new Date(selectedInboxMsg.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                        {selectedInboxMsg.body}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setMsgReceiver(selectedInboxMsg.sender);
                        setMsgSubject(`Re: ${selectedInboxMsg.subject}`);
                        setIsNewMsgOpen(true);
                      }}
                      className="self-end bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer mt-4"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-slate-500 italic p-6">
                    <InboxIcon className="w-12 h-12 text-slate-700 mb-2" />
                    <p className="text-sm">Select a conversation to read message content.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>


      {/* 4. MODALS & DIALOGS */}
      
      {/* A. Compose Message Modal */}
      {isNewMsgOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setIsNewMsgOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Compose Conversation</h3>
            
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">To (Username)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. alice"
                  value={msgReceiver}
                  onChange={(e) => setMsgReceiver(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Subject of message"
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Message Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write message details..."
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Send Conversation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* B. Create Course Modal */}
      {isNewCourseOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setIsNewCourseOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Create New Course</h3>
            
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SEC-303"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Network Security & Intrusion"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Card Color Palette</label>
                <select
                  value={newCourseColor}
                  onChange={(e) => setNewCourseColor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                >
                  <option value="from-blue-600 to-indigo-700">Indigo Blue</option>
                  <option value="from-rose-600 to-red-700">Crimson Red</option>
                  <option value="from-emerald-600 to-teal-700">Teal Green</option>
                  <option value="from-violet-600 to-purple-700">Royal Purple</option>
                  <option value="from-amber-500 to-orange-650">Amber Gold</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Publish Course
              </button>
            </form>
          </div>
        </div>
      )}

      {/* C. Add Calendar Event Modal */}
      {isNewEventOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setIsNewEventOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Add Calendar Event</h3>
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Study Group Session"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Event Date</label>
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Save Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* D. Access Denied (Restricted File Warning) Modal */}
      {fileErrorMsg && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-red-500/10 rounded-full blur-xl"></div>
            
            <div className="flex flex-col items-center text-center space-y-4 mt-2">
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">RIVANCYBER ACCESS VIOLATION</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {fileErrorMsg}
              </p>
              
              <div className="w-full bg-slate-950/60 border border-slate-850 p-3 rounded-lg text-left text-[11px] text-slate-500 leading-relaxed font-sans">
                <span className="font-bold text-slate-350 block mb-1">Lab Hint (Manual Session Hijacking):</span>
                To read this file, you must authenticate as a <strong>Teacher</strong>. The server uses cookies to verify identity. Since you are performing this hijacking manually:
                <ol className="list-decimal pl-4 mt-1.5 space-y-1 text-slate-400">
                  <li>Open Developer Tools (F12) and go to the <strong>Application</strong> (or <strong>Storage</strong>) tab &rarr; <strong>Local Storage</strong>.</li>
                  <li>Click on the local storage item for this site and look at the key <code>rivancyber_sessions</code>. Copy the session ID (the key starting with <code>sess_</code>) belonging to the user <code>alice</code> (the teacher).</li>
                  <li>Now, go to <strong>Cookies</strong> under the Application/Storage tab.</li>
                  <li>Replace the value of the <code>rivancyber_session_id</code> cookie with the copied session ID.</li>
                  <li>Reload the page to gain unauthorized access as Professor Alice!</li>
                </ol>
              </div>

              <button
                onClick={() => setFileErrorMsg(null)}
                className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E. Exam Answers File Viewer Modal */}
      {showExamAnswers && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute top-[-40px] right-[-40px] w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
            <button
              onClick={() => setShowExamAnswers(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <FileLock2 className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Final_Exam_Answers.pdf (Decrypted Document)</h3>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 font-mono text-xs space-y-4 text-slate-300 leading-relaxed overflow-y-auto max-h-[350px] shadow-inner select-text">
              <div className="border-b border-slate-800 pb-3 mb-3 text-center text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">
                *** SUCCESS! SESSION HIJACKING TUTORIAL FULFILLED ***
              </div>
              <h4 className="font-extrabold text-white text-sm text-center">SEC-202: Web Application Security - Spring 2026</h4>
              <p className="text-center text-slate-500 text-[10px] italic">Strictly Confidential - Restricted to Course Instructors Only</p>
              
              <div className="space-y-4 pt-2">
                <div>
                  <span className="text-amber-400 font-bold block mb-1">Q1: Explain the mechanics of session hijacking.</span>
                  <p className="pl-3 border-l border-slate-800">
                    Session hijacking occurs when an attacker obtains a victim's session identifier (cookie/token) and includes it in their own HTTP requests. The server recognizes the token, maps it to the victim's account, and authenticates the attacker as the victim without requiring credentials.
                  </p>
                </div>

                <div>
                  <span className="text-amber-400 font-bold block mb-1">Q2: How does setting the HttpOnly attribute on a cookie protect against session hijacking?</span>
                  <p className="pl-3 border-l border-slate-800">
                    The <code>HttpOnly</code> attribute instructs the browser that the cookie should not be accessible through client-side scripts (e.g., <code>document.cookie</code> in Javascript). This mitigates the risk of session hijacking via Cross-Site Scripting (XSS), as malicious scripts cannot extract the session identifier even if they run on the victim's browser.
                  </p>
                </div>

                <div>
                  <span className="text-amber-400 font-bold block mb-1">Q3: How does User-Agent and IP session binding protect sessions?</span>
                  <p className="pl-3 border-l border-slate-800">
                    Session binding validates that incoming requests using a session ID match the fingerprint (User-Agent, IP address) recorded when the session was initialized. If a hijacked session ID is presented from a different device, the fingerprints mismatch, and the server invalidates/blocks the request.
                  </p>
                </div>

                <div>
                  <span className="text-amber-400 font-bold block mb-1">Q4: Why is Session Token Rotation important?</span>
                  <p className="pl-3 border-l border-slate-800">
                    Token Rotation updates the session token on every interaction, invalidating the old one. If an attacker steals a token, it will only be valid until the next user request (which happens in milliseconds). Once the user or attacker sends a request, the old token becomes invalid, alerting the system and rendering the hijacked token useless.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowExamAnswers(false)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-5 rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-amber-600/15"
              >
                Finish Demonstration
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

