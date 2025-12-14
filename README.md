# Job App Tracker

A React web application created to track all your job applications in one convenient location.

## About

Job App Tracker helps you organize your job search with a suite of tools designed to keep you on top of your applications:

- **Kanban Dashboard**: Visualize your progress with a drag-and-drop board moving applications through stages like Pre-interview, Interview, and Offer.
- **Application Tracking**: Record key details for every job including role, employer, location, work mode (Remote/Hybrid/In-person), and custom notes.
- **Analytics**: View charts and statistics on your application history, response rates, and interview frequency.
- **Resume Management**: Create, edit, and manage multiple versions of your resume directly within the app.
- **Secure Authentication**: User accounts are handled securely via Clerk.

## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v20 LTS recommended)
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

### Configuration

This project uses [Clerk](https://clerk.com) for authentication. You will need to create your own Clerk account and application to run this locally.

1.  Sign up at [Clerk.com](https://clerk.com).
2.  Create a new application.
3.  Navigate to **API Keys** in your Clerk dashboard.
4.  Create a file named `.env` in the root directory of this project.
5.  Add your Publishable Key to the `.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Running the App

Start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Backend / Netlify Functions

By default, this application is configured to run in "Local Storage Mode" (`USE_SERVER = false` in `app/lib/jobStore.tsx` and other files). This means data is saved to your browser's local storage and no database connection is required.

The Netlify functions and MongoDB configuration in this repository are for full-stack deployment. You can disregard them unless you intend to deploy to Netlify with a MongoDB backend.