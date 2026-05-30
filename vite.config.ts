import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const serverDb = {
    sessions: {} as Record<string, any>,
    users: {} as Record<string, any>,
    protections: {} as Record<string, any>
  };

  const getCookie = (cookieHeader: string | undefined, name: string): string | null => {
    if (!cookieHeader) return null;
    const nameEQ = name + "=";
    const ca = cookieHeader.split(';');
    for (let i = 0; i < ca.length; i++) {
      const c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  };

  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-simulator',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/sync' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  serverDb.sessions = data.sessions || {};
                  serverDb.users = data.users || {};
                  serverDb.protections = data.protections || {};
                  
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true }));
                } catch (e) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
              });
              return;
            }

            if (req.url === '/api/files/Final_Exam_Answers.pdf') {
              const cookieHeader = req.headers.cookie;
              const sessionId = getCookie(cookieHeader, 'rivancyber_session_id');

              if (!sessionId) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Access Denied! No session cookie found.' }));
                return;
              }

              const session = serverDb.sessions[sessionId];
              if (!session) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Access Denied! Invalid session ID.' }));
                return;
              }

              const user = serverDb.users[session.username];
              if (!user) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Access Denied! User not found.' }));
                return;
              }

              if (user.role !== 'teacher') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Access Denied! You are currently authenticated as "${user.name}" (Role: Student). The folder "/courses/SEC-202/files/restricted" requires Role: Teacher.` }));
                return;
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
              return;
            }

            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
