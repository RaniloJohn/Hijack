# Lab Walkthrough: Session Hijacking & Defensive Controls

Welcome to the Session Hijacking & Defensive Controls training lab. This walkthrough guides you through executing a simulated session hijacking attack and testing browser-level security configurations.

---

## 🛠️ Phase 1: Executing the Session Hijacking Attack

The goal of this phase is to impersonate the instructor, **Professor Alice Smith**, to access the restricted exam answers without knowing her password.

### Step 1: Log in as Bob (The Attacker)
1. Open the application in your browser: `http://localhost:3001`
2. Scroll to the **Quick Login** area at the bottom of the login page and click **Bob Jenkins** (or log in manually using username `bob` and password `bob123`).
3. You are now logged in as Bob. Notice that you have the **Student** role and cannot see the **Instructor Panel**.

### Step 2: Extract Alice's Active Session Token
Alice has an active session preseeded on the mock server. Since **HttpOnly** cookies are disabled by default (Security: Disabled), the session cookies are readable from the client-side environment.
1. Open your browser's Developer Tools by pressing **F12** (or `Ctrl+Shift+I` / `Cmd+Opt+I`).
2. Go to the **Application** tab (or **Storage** tab in Firefox).
3. Under **Local Storage** in the left sidebar, click `http://localhost:3001` (this represents our simulated database).
4. Locate the key `rivancyber_sessions` and double-click its **Value** column to inspect it.
5. Search for the entry containing `"username": "alice"`.
6. Copy Alice's session token key (a long string like `sess_xxxxxxxxxxxxxxxx`).
   > [!IMPORTANT]
   > Make sure you copy Alice's session token key, and not Bob's (which is mapped to `"username": "bob"`).

### Step 3: Inject the Hijacked Session Cookie
1. In your Developer Tools, switch to the **Console** tab.
2. Inject the stolen cookie by executing the following command (replace `PASTE_ALICE_TOKEN_HERE` with the token you copied):
   ```javascript
   document.cookie = "rivancyber_session_id=PASTE_ALICE_TOKEN_HERE; path=/";
   ```
3. Press **Enter**.
4. The dashboard page will dynamically detect the cookie change and update. You are now authenticated as **Professor Alice Smith**!
5. The **Instructor Panel** banner will appear at the top of the dashboard. Click **View Answers** to see the exam answers PDF.

### Step 4: Return to Bob safely
> [!WARNING]
> Do not click the red UI **Log Out** button on the top right while logged in as Alice. Clicking the UI button tells the server to delete Alice's session from the database. 

To revert to Bob or clear your session, delete the cookie from your console:
```javascript
document.cookie = "rivancyber_session_id=; path=/; max-age=0";
```
*(If you accidentally deleted Alice's session from the database, return to `/login` and click **Reset Lab Database** at the bottom of the page to restore it).*

---

## 🛡️ Phase 2: Testing the Security Protections

Use the **Security Protections Config** panel at the top of the dashboard to enable defenses and observe how they prevent the session hijacking attack.

### Defense 1: HttpOnly Cookies (Cookie Theft Prevention)
* **How it works:** Hides the session cookie from client-side JavaScript APIs.
* **Testing:**
  1. Toggle **HttpOnly Cookies** to **Active** in the dashboard.
  2. In your F12 **Console**, run:
     ```javascript
     document.cookie
     ```
     * **Result:** The `rivancyber_session_id` cookie is now empty/hidden. JavaScript cannot read it, preventing automated XSS cookie-stealing scripts.
  3. Try to inject a session cookie:
     ```javascript
     document.cookie = "rivancyber_session_id=ANY_TOKEN; path=/";
     ```
     * **Result:** You remain logged in as Bob. The simulated server prioritizes the HttpOnly storage jar, rendering client-side injections useless.

### Defense 2: Session Binding (User-Agent Validation)
* **How it works:** Pairs the session token with the client browser's User-Agent header.
* **Testing:**
  1. Turn **HttpOnly Cookies** to **Inactive** and turn **Session Binding (User-Agent)** to **Active**.
  2. Copy Alice's session token from `localStorage` (`rivancyber_sessions`).
  3. Inject the token in the console:
     ```javascript
     document.cookie = "rivancyber_session_id=PASTE_ALICE_TOKEN_HERE; path=/";
     ```
     * **Result:** You are immediately logged out and redirected to `/login`. Check the server transaction log: a `403 Forbidden` error is logged because your browser's current User-Agent does not match Alice's preseeded User-Agent (`Chrome/124.0.0.0...`).

### Defense 3: Session Token Rotation (Replay Attack Prevention)
* **How it works:** Regenerates and sets a new session token on every valid HTTP request.
* **Testing:**
  1. Turn **Session Token Rotation** to **Active**.
  2. Switch tabs or click around the page.
  3. Inspect your Cookies or Local Storage.
     * **Result:** You will see the session token changing on every single request. If an attacker intercepts a token, it becomes invalid as soon as the victim performs their next action.
