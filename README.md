# SecureNotes - Secure MERN Stack Notes Application

SecureNotes is a modern, responsive, and secure notes-taking application (inspired by Google Keep but with premium aesthetics and end-to-end client-side encryption).

All note contents are encrypted on the client side using **AES-256 (CryptoJS)** BEFORE being transmitted to the backend server. The backend receives and stores only ciphertext, ensuring absolute user privacy—even if the database is compromised, your note contents remain fully confidential.

---

## 🚀 Key Features

### 🛡️ Security & Privacy
*   **Client-Side AES-256 Encryption**: Note contents are encrypted in the browser and decrypted locally. The server has no knowledge of plaintext note bodies.
*   **JWT Access & Refresh Token Rotation**: Dual token security setup with automatic access token refreshing (short lifetime: 15m, refresh lifetime: 7d).
*   **Automatic Session Invalidation**: Changing the user's password immediately invalidates all active JWT tokens and sessions, forcing a global logout.
*   **Configurable Token Expirations**: Token lifetime durations can be configured using environment variables (`JWT_ACCESS_EXPIRY` and `JWT_REFRESH_EXPIRY`).
*   **Data Sanitization**: Protected against XSS and NoSQL Query Injection using security headers (`helmet`), body size limits, and `express-mongo-sanitize`.
*   **Validation**: Strict input validation using `express-validator` on all registration, login, and note endpoints.
*   **Bcrypt Password Hashing**: Passwords hashed on the database using a salt factor of 10.

### 💻 User Experience (UX)
*   **Google Keep UI**: Collapsible note creator that expands on focus.
*   **Premium Theme**: Dark/light mode theme toggling with persistent user preference stored in `localStorage`.
*   **Debounced Title Search**: Search dynamically triggers page 1 resets and filters backend matches on note titles.
*   **Pagination & Skeleton Loaders**: Grid structure equipped with paging indicators and visual pulse skeletons during loading.
*   **Toast Notifications**: Custom micro-animation slide-in notifications for events (success, delete info, session timeout warnings) with optimized dark mode contrast.
*   **Interactive View Modal**: Lengthy note contents are truncated with ellipses (`...`) in cards and can be opened in an enhanced interactive modal.
*   **Reusable Dialogs**: Global reusable components for confirmations (delete note, log out).
*   **Micro-Animations**: Success events (login/registration) fire `canvas-confetti` bursts.

---

## 📂 Project Structure

```text
secure-notes-app/
├── README.md                               # Setup, API, and architectural docs
├── secure-notes.postman_collection.json    # JSON to import all endpoints in Postman
│
├── server/                                 # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                           # Mongoose Connection setup
│   ├── controllers/
│   │   ├── auth.controller.js              # Register, Login, Refresh, Logout Controllers
│   │   └── notes.controller.js             # Notes CRUD, Paginated listing + Title filters
│   ├── middleware/
│   │   ├── auth.middleware.js              # JWT Validation and Expiry identification
│   │   ├── error.middleware.js             # Global Error handler and Mongoose status maps
│   │   └── validators.js                   # Request validation schemas (express-validator)
│   ├── models/
│   │   ├── user.model.js                   # User Schema with pre-save hashing & validation
│   │   └── note.model.js                   # Note Schema referencing User
│   ├── routes/
│   │   ├── auth.routes.js                  # Authentication router Mounts
│   │   └── notes.routes.js                 # Notes CRUD router Mounts
│   ├── .env.example                        # Template for backend env variables
│   ├── package.json
│   └── server.js                           # Entry point configuring Helmet, CORS, and Sanitizers
│
└── client/                                 # Vite + React Frontend
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── api.js                      # Axios instance with interceptors for JWT & Refresh
    │   ├── app/
    │   │   └── store.js                    # Redux configureStore combining slices
    │   ├── components/
    │   │   ├── ConfirmationModal.jsx       # Reusable confirmation dialog for delete and logout events
    │   │   ├── Modal.jsx                   # Reusable interactive view modal for lengthy note contents
    │   │   ├── Pagination.jsx              # Reusable pagination controls with page indicators
    │   │   ├── PrivateRoute.jsx            # Guard protecting Dashboard access
    │   │   └── Toast.jsx                   # Custom Alert Toast component with dark mode style
    │   ├── features/
    │   │   ├── auth/
    │   │   │   └── authSlice.js            # Auth states, login/logout thunks, localStorage sync
    │   │   └── notes/
    │   │       └── notesSlice.js           # Notes state, client-side encryption/decryption, CRUD thunks
    │   ├── hooks/
    │   │   └── useSearch.js                # Custom hook for debounced search and page resets
    │   ├── pages/
    │   │   ├── AuthPage.jsx                # Responsive Login/Register Tabs
    │   │   └── Dashboard.jsx               # Notes listing grid, Keep composer, search, pagination
    │   ├── utils/
    │   │   ├── crypto.js                   # Encrypt / Decrypt wrapper using CryptoJS AES
    │   │   └── helpers.js                  # Logic helper utilities for AND, OR, and Ternary operations
    │   ├── App.jsx                         # Main Routing definition & Redux Providers
    │   ├── index.css                       # Google fonts imports, Tailwind base, scrollbars
    │   └── main.jsx
    ├── .env.example                        # Template for client variables (Secret AES keys)
    ├── tailwind.config.js                  # Tailwind styles and dark mode class triggers
    ├── postcss.config.js
    └── package.json
```

---

## 🔒 Encryption Architecture

When a user creates a note:
1.  **Plaintext Entry**: The note body is written in the browser's rich UI.
2.  **Frontend Encryption**: Before making the API request, `notesSlice.js` intercepts the payload. It calls `encryptNoteContent(content)` using CryptoJS AES and a secret key loaded from `client/.env`.
3.  **Encrypted Payload**: The resulting ciphertext is sent via Axios to POST `/api/notes`.
4.  **Database Storage**: MongoDB stores only the note's Title (plaintext) and the Content (ciphertext).
5.  **Local Decryption**: When notes are requested, the server sends the ciphertext back to the client. The `notesSlice` interceptor runs `decryptNoteContent(content)` using the client-side secret, and the decrypted plaintext is populated inside the Redux store for UI rendering.

---

## ⚙️ Running Locally

### Prerequisites
*   Node.js (v18+)
*   npm
*   MongoDB running locally or a MongoDB Atlas URI

### 1. Set Up the Backend
1.  Navigate to `server` folder:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create `.env` file from the template:
    ```bash
    cp .env.example .env
    ```
4.  Start the Express API server:
    ```bash
    npm run dev
    ```
    *Server runs on port **5001** (or PORT defined in `.env`).*

### 2. Set Up the Frontend
1.  Open a new terminal and navigate to `client` folder:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install --legacy-peer-deps
    ```
3.  Create `.env` file:
    ```bash
    cp .env.example .env
    ```
4.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
    *Client runs on [http://localhost:5173](http://localhost:5173).*

---

## 📬 REST API Documentation

### Auth Endpoints
*   `POST /api/auth/register` - Registers a user. Body: `{ name, email, password }`
*   `POST /api/auth/login` - Authenticates user. Returns access + refresh token. Body: `{ email, password }`
*   `POST /api/auth/refresh` - Generates a new access token using rotation. Body: `{ refreshToken }`
*   `POST /api/auth/logout` - Protected. Revokes user refresh token.
*   `POST /api/auth/forgot-password` - Generates a secure random password reset token. Body: `{ email }`
*   `POST /api/auth/reset-password/:token` - Resets user password. Body: `{ password }`

### Notes Endpoints (Protected by Authorization: `Bearer <accessToken>`)
*   `GET /api/notes` - Returns paginated, sorted notes for current user. Query Params: `page` (default 1), `limit` (default 6), `search` (matches note titles).
*   `POST /api/notes` - Saves a new note. Body: `{ title, content }` (where `content` is AES encrypted).
*   `DELETE /api/notes/:id` - Deletes a note by ID.

---

## ☁️ Deployment Instructions

### 1. Database (MongoDB Atlas)
1.  Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Build a database cluster and create a database user (note username and password).
3.  In Security / Network Access, add IP address `0.0.0.0/0` (or your servers' static IPs).
4.  Get your Connection String (`mongodb+srv://...`) and supply it as `MONGO_URI` in production.

### 2. Backend Server (Render / Railway)
1.  Connect your GitHub repository to [Render](https://render.com) or [Railway](https://railway.app).
2.  Create a new **Web Service** pointing to the `server/` directory.
3.  Configure Build Command: `npm install` and Start Command: `npm start`.
4.  Under Environment Variables, add:
    *   `PORT=5000` (or Render will bind it automatically)
    *   `MONGO_URI` (your MongoDB Atlas connection string)
    *   `JWT_SECRET` (generate a secure random key)
    *   `JWT_REFRESH_SECRET` (generate another random key)
    *   `CLIENT_URL` (URL of your deployed frontend, e.g. `https://your-app.vercel.app`)
    *   `NODE_ENV=production`

### 3. Frontend Client (Vercel)
1.  Connect your GitHub repository to [Vercel](https://vercel.com).
2.  Choose **Vite** as the framework template and specify the **Root Directory** as `client`.
3.  Under Environment Variables, add:
    *   `VITE_API_URL` (URL of your deployed backend, e.g. `https://your-backend.onrender.com/api`)
    *   `VITE_AES_SECRET` (identical secret key used by clients to encrypt/decrypt note payloads)
4.  Deploy! Vercel handles static routing automatically.
