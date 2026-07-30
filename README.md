# V-Screen Recorder

A secure, premium, high-definition screen and webcam recording application built natively for the browser. 

**V-Screen Recorder** is a zero-installation utility that captures high-quality screen shares, application windows, or camera feeds, mixing them with system and microphone audio inputs. It features a dark, glassmorphic UI, offline browser-sandboxed local storage (IndexedDB), cryptographically secure session authorization (HTTP-Only cookies), and one-click local-to-cloud recording synchronization.

---

## 🚀 Key Features

* **🎥 HD Media Capture**: Record full desktops, browser tabs, active application windows, or webcams up to 1080p and 60 FPS.
* **🎙️ Live Audio Mixing & Level Visualizer**: Merge microphone voice feeds and computer system audio output into a unified audio stream. Track input levels via an active Canvas audio frequency visualizer.
* **🔒 Secure Cookie Sessions**: Authenticated accounts are managed via secure HTTPS, HTTP-Only, SameSite=Strict cookies rather than local storage (`localStorage`). This guarantees session tokens are completely invisible to cross-site scripting (XSS) attacks.
* **⚡ Zero-Config Fallback Mode**: Run the serverless backend immediately with zero database setups. The application automatically falls back to a container-writable JSON database `/tmp/v_screen_recorder_db.json` when no postgres instance is active.
* **☁️ Cloud Sync & Database Layer**: Sign up to automatically store recordings in a cloud database. View, search, rename, download, and delete cloud records securely. Includes a one-click local-to-cloud synchronization tool for offline records.
* **🔗 Hidden Proxy Share Links**: Generate secure, short-lived video sharing links. Uploads are routed via a Vercel serverless function proxy that masks third-party cloud storage credentials.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite, JSX), Vanilla CSS (glassmorphic styling, animations, interactive decks)
* **Client Database**: IndexedDB (promisified modular wrapper)
* **Backend Runtime**: Vercel Serverless Functions (Node.js runtime)
* **Database Driver**: `pg` (Node-PostgreSQL pool client)
* **Cryptography**: Native Node.js `crypto` API (PBKDF2-SHA512 password hashing & HMAC-SHA256 session signatures)

---

## 📦 Directory Structure

```
├── api/                   # Vercel Serverless API Handlers
│   ├── auth/              # Cookie Session Handlers
│   │   ├── login.js       # Verifies PBKDF2 hash, issues secure cookie
│   │   ├── logout.js      # Instructs browser to discard session cookie
│   │   ├── me.js          # Verifies active signed session
│   │   └── signup.js      # Hashes password, registers user profiles
│   ├── utils/
│   │   ├── crypto.js      # Cryptographic PBKDF2 and HMAC JWT utilities
│   │   └── db.js          # Postgres connection pool & JSON DB fallback
│   ├── recordings.js      # CRUD operations for authenticated users
│   └── share.js           # Serverless upload proxy to secure storage
├── public/                # Static public assets (Favicon, logos)
├── src/                   # React Frontend Codebase
│   ├── App.css            # Dark glassmorphic design system
│   ├── App.jsx            # Main app router, recorder engine, & layout
│   ├── db.js              # Local IndexedDB database manager
│   ├── main.jsx           # App entry point mount
│   └── upload.js          # Client XHR upload engine with progress hooks
├── vercel.json            # Vercel routing configurations & security headers
└── package.json           # Project manifest
```

---

## 💾 PostgreSQL Database Schema

When deploying to a production server, hook the application to a PostgreSQL database (e.g. Vercel Postgres, Supabase, Neon). The database layer automatically sets up the following schema on the first request:

```sql
CREATE TABLE v_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE v_recordings (
  id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER REFERENCES v_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  mode VARCHAR(50) NOT NULL,
  duration INTEGER NOT NULL,
  video_url VARCHAR(2048) NOT NULL,
  timestamp BIGINT NOT NULL
);
```

---

## 🔧 Local Development Setup

To run the application locally with full serverless functionality:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/v-screen-recorder.git
   cd v-screen-recorder
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Install Vercel CLI** (to proxy serverless routes locally):
   ```bash
   npm install -g vercel
   ```
4. **Run Dev Environment**:
   ```bash
   vercel dev
   ```
   *This starts the proxy server on [http://localhost:3000](http://localhost:3000) linking frontend triggers and `/api/*` serverless backend endpoints.*

---

## ☁️ Production Deployment on Vercel

1. **Deploy to Vercel**: Run the deploy trigger in your repository directory:
   ```bash
   vercel
   ```
2. **Set Environment Variables**:
   Configure the following environment variables inside your Vercel Project Dashboard:
   * `DATABASE_URL`: Your PostgreSQL connection string. (Optional: Falls back to `/tmp` JSON DB if not provided).
   * `JWT_SECRET`: A secure cryptographically random key string used to sign session cookies.
3. **Publish live production build**:
   ```bash
   vercel --prod
   ```
