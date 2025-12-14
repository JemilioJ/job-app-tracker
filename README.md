# Job App Tracker

A React web application created to track all your job applications in one convenient location.

## Deployment notes (Netlify + MongoDB)
- Set these environment variables in Netlify:
  - VITE_CLERK_PUBLISHABLE_KEY=pk_...                  (required for frontend)
  - MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/jobtracker?...  (required)
  - MONGODB_DB_NAME=jobtracker                         (optional if DB name is in URI)
  - CLERK_SECRET_KEY=sk_...                            (optional; recommended for verified server auth)
- If CLERK_SECRET_KEY is not set, functions will use an unverified JWT fallback from the client token (development only).
- Ensure your MongoDB user has readWrite on the target database.

### About the "local" database and oplog.rs
- In MongoDB Atlas, the "local" database and its collection "oplog.rs" are internal replica set data.
- It can have millions of documents and is expected.
- Do not delete "local" or "oplog.rs"; it is not created by this app.

## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v20 LTS recommended to match Dockerfile)
- npm (usually comes with Node.js)
- Git

### Forking & Cloning

To set up the project in your own personal repository:

1. Click the **Fork** button in the top-right corner of the repository page.
2. Clone your forked repository to your local machine:

```bash
git clone https://github.com/<your-username>/job-app-tracker.git
cd job-app-tracker
```

### Installation

Install the dependencies:

```bash
npm install
```

> **Note:** If you encounter peer dependency errors, try running `npm install --legacy-peer-deps`.

> **Note:** If you encounter dependency errors or version conflicts after forking/cloning, try a clean install:
> ```bash
> rm -rf node_modules package-lock.json
> npm install
> ```
> (On Windows PowerShell: `Remove-Item -Recurse -Force node_modules; Remove-Item package-lock.json`)

### Configuration (Environment Variables)

The project relies on Clerk for authentication and MongoDB for data (if server mode is on). Even in "local storage" mode, the app initializes Clerk hooks.

1. Create a file named `.env` in the root directory.
2. Add the following variables:

```env
# Required for the frontend to load
VITE_CLERK_PUBLISHABLE_KEY=pk_test_... 

# Required only if you want to use the backend (Netlify Functions)
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=jobtracker
```

- **Clerk Keys:** Sign up at [Clerk.com](https://clerk.com), create an application, and copy keys from "API Keys".
- **MongoDB URI:** Sign up for [MongoDB Atlas](https://www.mongodb.com/atlas), create a cluster, and get the connection string.

### Choose Your Mode: Local vs. Server

This project uses a feature flag called `USE_SERVER` hardcoded in `jobStore.tsx`, `job-dashboard.tsx`, and `job-form.tsx`.

**Option A: Local Storage Mode (Easiest)**
- Runs using browser's LocalStorage. No database connection required.
- Set `USE_SERVER = false` in:
  - `app/lib/jobStore.tsx`
  - `app/routes/job-dashboard.tsx`
  - `app/routes/job-form.tsx`
  - `app/routes/job-view.tsx` (already false)
- Start dev:
  ```bash
  npm run dev
  ```
- Do not run Netlify CLI in this mode.

**Option B: Full Stack Mode**
- Saves data to MongoDB.
- Set `USE_SERVER = true` in the files listed above.
- Ensure `.env` has `MONGODB_URI`.
- Run using Netlify CLI to emulate serverless functions:
  ```bash
  npm install -g netlify-cli
  netlify dev
  ```

### Development

Start the development server (Standard/Local Mode):

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Troubleshooting Common Errors

- **"Clerk: Missing Publishable Key"**: You didn't create the `.env` file or the key is incorrect.
- **"upstream dependency conflict"**: Run `npm install --legacy-peer-deps`.
- **"500 Internal Server Error" on save**: You are in `USE_SERVER = true` mode but haven't set up MongoDB or aren't running the backend functions properly. Switch `USE_SERVER` to `false`.
- **Typescript Errors**: If `npm run dev` fails, try fixing the specific type mismatch.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

Access the app at https://sunny-griffin-4dacbb.netlify.app/

## New

Job detail editing page: /job-view/:id for viewing and resubmitting changes.

## ONLYOFFICE Document Server (DOCX in-page editing)

To enable native in-page DOC/DOCX editing, deploy ONLYOFFICE Document Server and set an environment variable used by the frontend.

What you need to download/install externally:
- ONLYOFFICE Document Server (open-source AGPL):
  - Docker (recommended):
    ```bash
    docker run -i -t -d -p 8080:80 --name onlyoffice-document-server onlyoffice/documentserver
    ```
    After starting, the API will be served at:
    - http://localhost:8080/web-apps/apps/api/documents/api.js
  - Alternatively, see packages or cloud offerings:
    https://api.onlyoffice.com/editors/deployment/docker

Frontend configuration:
- Create or update your `.env`:
  ```env
  VITE_ONLYOFFICE_URL=http://localhost:8080
  ```
- Restart the dev server so Vite picks up the env change.

Important notes:
- ONLYOFFICE loads the file directly from a URL. Blob/object URLs (from local file inputs) are not reachable by the document server.
- For DOCX editing to work, host the uploaded DOCX at a public URL accessible by the ONLYOFFICE server (e.g., upload to your storage/CDN and use the file’s https URL). The profile page will automatically initialize the editor when:
  - The file extension is .doc or .docx.
  - `VITE_ONLYOFFICE_URL` is set.
  - The resume file URL begins with http(s) (not a blob URL).

Security/production:
- In production, generate a JWT token for ONLYOFFICE config and implement save callbacks (see https://api.onlyoffice.com/editors/basic).
- You can proxy files through your backend so ONLYOFFICE can fetch them securely.

Troubleshooting:
- If the editor does not appear, check the browser console for errors loading `/web-apps/apps/api/documents/api.js`.
- Ensure the file URL is publicly accessible from the ONLYOFFICE container/network.
- For local dev, exposing a local file via a simple static server or ngrok can help.

## Fix: "docker is not recognized" on Windows (PowerShell)

If you see:
> docker : The term 'docker' is not recognized as the name of a cmdlet...

Do this:

1) Install Docker Desktop for Windows
- Download: https://www.docker.com/products/docker-desktop/
- Run the installer. When prompted, enable “Use WSL 2 based engine”.

2) Reload VS Code’s environment
- Fully quit VS Code (File → Exit).
- Re-open VS Code. Open a new terminal (Ctrl+`), then run:
  ```powershell
  docker --version
  ```
- Optional: Sign out and sign back into Windows to refresh system PATH.

3) Switch the terminal shell profile in VS Code
- Open Command Palette → “Terminal: Select Default Profile”.
- Pick “Windows PowerShell” or “Command Prompt”.
- Open a new terminal and test:
  ```powershell
  docker --version
  ```

4) Run VS Code from a shell that has docker on PATH
- Close VS Code.
- Open a regular PowerShell window (where `docker` works), then start VS Code from there:
  ```powershell
  code .
  ```
- The integrated terminal should inherit the working PATH.

5) Enable VS Code Shell Integration for PowerShell (helps with ENV sync)
- Settings → search “terminal.integrated.shellIntegration.enabled” → ensure it’s ON.
- Also ensure “terminal.integrated.inheritEnv” is ON.

6) Verify PATH inside VS Code terminal
- In the VS Code terminal:
  ```powershell
  $env:PATH
  ```
- Confirm it contains something similar to:
  ```
  C:\Program Files\Docker\Docker\resources\bin
  ```
- If missing, repair Docker Desktop installation or add the path to your user/system PATH, then restart VS Code.

7) Use WSL integration (if you prefer Linux shell)
- In Docker Desktop → Settings → Resources → WSL Integration → enable your distro (e.g., Ubuntu).
- In VS Code, open a WSL terminal:
  - Command Palette → “Remote-WSL: New Window”.
  - Terminal in WSL: `docker --version`.
- Note: For container → host access to Vite dev server, use:
  ```
  http://host.docker.internal:5173/resume.docx
  ```

Quick checks:
- Docker engine running: open Docker Desktop and confirm “Running”.
- CLI available: `docker info`.
- ONLYOFFICE API reachable: `http://localhost:8080/web-apps/apps/api/documents/api.js`.

If all else fails:
- Repair Docker Desktop (Apps & Features → Docker Desktop → Repair).
- Reboot Windows, then re-open VS Code.

## Fix: Docker inside WSL (WSL Integration)

If Docker works in PowerShell but not inside your WSL distro (e.g., Ubuntu), enable WSL integration:

1) Enable WSL 2 integration in Docker Desktop
- Open Docker Desktop → Settings → Resources → WSL Integration.
- Turn ON integration for the distro you use in VS Code/Terminal (e.g., Ubuntu).
- Click Apply & Restart.

2) Verify WSL and Docker from your WSL shell
- In your WSL terminal (Ubuntu):
  ```bash
  wsl --status  # (run from Windows PowerShell if not available here)
  docker --version
  docker info
  ```
  If `docker info` prints engine details, integration is active.

3) Run ONLYOFFICE Document Server from WSL
- From your WSL shell:
  ```bash
  docker pull onlyoffice/documentserver
  docker run -d --name onlyoffice-document-server -p 8080:80 onlyoffice/documentserver
  ```
- Verify the API is reachable from Windows/WSL browser:
  - http://localhost:8080/web-apps/apps/api/documents/api.js

4) Make your DOCX reachable (not blob:)
- Serve a test DOCX via Vite public folder:
  - Place `resume.docx` under `public/` so it’s at `http://localhost:5173/resume.docx`.
- Note for Windows + Docker:
  - If ONLYOFFICE inside Docker needs to fetch your dev server file, use `http://host.docker.internal:5173/resume.docx`.
  - Update your profile storage to:
    ```js
    localStorage.setItem("user-profile", JSON.stringify({
      resumeFileUrl: "http://host.docker.internal:5173/resume.docx",
      resumeFileName: "resume.docx"
    }));
    ```

5) Frontend configuration
- In `.env`:
  ```env
  VITE_ONLYOFFICE_URL=http://localhost:8080
  ```
- Restart dev: `npm run dev`

Troubleshooting:
- If `docker` is still not found in WSL, re-open your WSL terminal after enabling integration.
- If ONLYOFFICE editor doesn’t appear, check console for loading errors of `/web-apps/apps/api/documents/api.js`.
- Ensure the DOCX URL is http(s), not `blob:`; the ONLYOFFICE server must fetch it directly.