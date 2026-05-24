# 🚧 RivanCyber Training Center - Session Hijacking Lab [WIP]

<div align="center">
  <img src="public/logo.png" alt="RivanCyber Logo" width="180px" />
  <p><strong>Interactive Web Security Lab: Session Hijacking & Defensive Controls</strong></p>
  
  [![Project Status: WIP](https://img.shields.io/badge/project--status-work--in--progress-yellow.svg)](https://github.com/RaniloJohn/Hijack)
  [![Vite](https://img.shields.io/badge/Vite-6.x-blue.svg)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
</div>

---

> [!WARNING]
> **Educational Use Only:** This repository contains a simulation laboratory designed for cybersecurity training and educational demonstrations. The techniques simulated here should only be run in local, controlled sandboxes.

---

## 📖 About the Project

**RivanCyber Training Center** is an interactive, gamified learning application designed to teach the fundamentals of **Session Hijacking** and web application security controls. The project simulates a university LMS (Learning Management System) where users can take on the roles of a student (**Bob**) and an instructor (**Alice**). 

By manipulating simulated browser state, cookies, and localStorage, students learn how attackers hijack active sessions and how developers configure defenses to mitigate these risks.

### Current Status: 🚧 Work In Progress (WIP)
This project is currently under active development. Upcoming features include:
* Enhanced cross-site scripting (XSS) simulation modules.
* More comprehensive SQL injection challenges.
* Advanced Multi-Factor Authentication (MFA) bypass scenarios.

---

## 🛠️ Security Labs Covered

### Phase 1: The Hijacking Attack
Students learn how to hijack an instructor's session:
1. Log in as **Bob Jenkins** (Student role).
2. Inspect the simulated database (`localStorage`) to extract the preseeded session token for **Professor Alice Smith**.
3. Use the browser console to inject the session cookie using `document.cookie`.
4. Refresh/observe how the application dynamically shifts to the **Teacher** role, exposing the protected exam answers.

### Phase 2: Mitigating the Attack
Students toggle simulated web server security configurations to observe real-time defense behavior:
* **HttpOnly Cookies**: Prevents client-side scripts from reading the session cookie.
* **Session Binding (User-Agent Validation)**: Rejects sessions if the browser's User-Agent string deviates from the session's recorded device fingerprint.
* **Session Token Rotation**: Automatically rotates session identifiers on every API call to invalidate intercepted old tokens.

---

## 🚀 Running Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm (comes with Node)

### Installation & Launch

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RaniloJohn/Hijack.git
   cd Hijack
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🗃️ Simulated Database Architecture
Since this application runs entirely client-side for ease of deployment, it features a custom server-side and SQL simulator in [src/utils/db.ts](src/utils/db.ts):
* **State Management**: Persisted in browser `localStorage` with `rivancyber_` prefix keys.
* **`document.cookie` Shim**: Features a custom shim to simulate standard cookie behavior and `HttpOnly` security constraints, even when running locally or on custom browser configurations.
* **Database Reset**: Includes a dedicated "Reset Lab Database" utility at the bottom of the Sign In page to drop all simulated tables and reseed default states instantly.

---

## 💻 Built With
* **Vite** - Build Tool & Dev Server
* **React 19** - UI Framework
* **TypeScript** - Static Typing
* **Tailwind CSS** - Styling
* **Lucide React** - Vector Icons
