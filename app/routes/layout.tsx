"use client";

import { Outlet, useLocation, Navigate } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useUser } from "@clerk/clerk-react";
import { JobProvider } from "../lib/jobStore";

export default function Layout() {
  const location = useLocation();
  const { isSignedIn } = useUser() ?? { isSignedIn: false };
  const isHome = location.pathname === "/";
  const isAuthPage = location.pathname.startsWith("/sign-in") || location.pathname.startsWith("/sign-up");
  const isProfilePage = location.pathname.startsWith("/profile");

  return (
    <JobProvider>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Guard: redirect unauthenticated users away from profile */}
          {isProfilePage && !isSignedIn ? (
            <Navigate to="/sign-in" replace />
          ) : isHome ? (
            // HOME: full-bleed, component controls own layout
            <Outlet />
          ) : isAuthPage ? (
            // AUTH PAGES: full-bleed gradient background without white container
            <Outlet />
          ) : (
            // OTHER PAGES: wrapped in white container
            <div className="bg-white">
              <div className="container mx-auto p-4 pt-6 min-h-0">
                <Outlet />
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </JobProvider>
  );
}
