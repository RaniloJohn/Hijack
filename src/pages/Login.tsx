import React, { useState, useEffect } from 'react';
import { loginUser, registerUser, getSecurityProtections, initializeDB } from '../utils/db';
import { GraduationCap, UserCheck, ShieldAlert, ArrowRight, UserPlus, LogIn, Mail, Lock, User } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  
  // UI states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [protections, setProtections] = useState({ httpOnly: false, sessionBinding: false, tokenRotation: false });
  useEffect(() => {
    initializeDB();
    setProtections(getSecurityProtections());
    
    // Listen for security setting changes from other components (like the HUD)
    const handleSecurityChange = (e: any) => {
      setProtections(e.detail);
    };
    window.addEventListener('security_changed', handleSecurityChange);
    return () => window.removeEventListener('security_changed', handleSecurityChange);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const res = loginUser(username, password);
    if (res.success) {
      setSuccess('Login successful! Redirecting...');
      // Trigger native browser credential storage if supported
      if (window.PasswordCredential) {
        try {
          const cred = new PasswordCredential({
            id: username,
            password: password
          });
          navigator.credentials.store(cred)
            .catch((err) => console.warn('Native credentials store failed:', err));
        } catch (err) {
          console.warn('Native credentials error:', err);
        }
      }
    } else {
      setError(res.error || 'Login failed');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username || !password || !name || !email) {
      setError('Please fill in all fields.');
      return;
    }

    const res = registerUser(username, password, name, role, email);
    if (res.success) {
      setSuccess('Account created successfully! You can now log in.');
      setIsRegister(false);
      // Reset registration inputs
      setName('');
      setEmail('');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  const quickLogin = (user: 'alice' | 'bob') => {
    setError(null);
    setSuccess(null);
    setIsRegister(false);
    const pass = user === 'alice' ? 'alice123' : 'bob123';
    
    // Fill the inputs first for UI feedback and browser password manager heuristics
    setUsername(user);
    setPassword(pass);

    // Wait a short time for state to propagate to DOM before authentication and credentials storage
    setTimeout(() => {
      const res = loginUser(user, pass);
      if (res.success) {
        setSuccess('Login successful! Redirecting...');
        if (window.PasswordCredential) {
          try {
            const cred = new PasswordCredential({
              id: user,
              password: pass
            });
            navigator.credentials.store(cred)
              .catch((err) => console.warn('Native credentials store failed:', err));
          } catch (err) {
            console.warn('Native credentials error:', err);
          }
        }
      } else {
        setError(res.error || 'Login failed');
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background Glow effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-md w-full space-y-8 z-10">
        
        {/* Logo and Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo.png" alt="RivanCyber Logo" className="h-20 w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            RivanCyber Training Center
          </h2>
        </div>

        {/* Card Body */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 space-y-6">
          
          {/* Toggle Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              disabled={!!success}
              onClick={() => { setIsRegister(false); setError(null); setSuccess(null); }}
              className={`flex-1 pb-4 text-center text-sm font-semibold transition-all border-b-2 ${
                !isRegister 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              } ${success ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </span>
            </button>
            <button
              disabled={!!success}
              onClick={() => { setIsRegister(true); setError(null); setSuccess(null); }}
              className={`flex-1 pb-4 text-center text-sm font-semibold transition-all border-b-2 ${
                isRegister 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              } ${success ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                Register
              </span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-sm flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm flex items-start gap-2.5">
              <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={isRegister ? handleRegister : handleLogin}>
            
            {isRegister && (
              <>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      disabled={!!success}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Charlie Brown"
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="email"
                      disabled={!!success}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="charlie@rivancyber.edu"
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Institution Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={!!success}
                      onClick={() => setRole('student')}
                      className={`py-2 px-4 rounded-xl border text-sm font-semibold transition-all ${
                        role === 'student'
                          ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                          : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:text-slate-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      disabled={!!success}
                      onClick={() => setRole('teacher')}
                      className={`py-2 px-4 rounded-xl border text-sm font-semibold transition-all ${
                        role === 'teacher'
                          ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                          : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:text-slate-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Teacher
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  disabled={!!success}
                  autoComplete={isRegister ? "new-username" : "username"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  disabled={!!success}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!!success}
              className={`w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer ${
                success ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>{success ? 'Signing In...' : isRegister ? 'Register Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts */}
          {!isRegister && (
            <div className="space-y-3.5 pt-4 border-t border-slate-700/50">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                Quick-Login Lab Accounts
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!!success}
                  onClick={() => quickLogin('bob')}
                  className={`bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 py-2 px-3 rounded-xl text-xs font-medium transition-all text-left flex flex-col cursor-pointer ${
                    success ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="text-slate-400 font-semibold">Bob (Student)</span>
                  <span className="text-[10px] text-slate-500">Pass: bob123</span>
                </button>
                <button
                  type="button"
                  disabled={!!success}
                  onClick={() => quickLogin('alice')}
                  className={`bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 py-2 px-3 rounded-xl text-xs font-medium transition-all text-left flex flex-col cursor-pointer ${
                    success ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="text-blue-400 font-semibold">Alice (Professor)</span>
                  <span className="text-[10px] text-slate-500">Pass: alice123</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
