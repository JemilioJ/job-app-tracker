import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import "./header.css";
import { useUser } from "@clerk/clerk-react";

export function Header({ title }: { title?: string }) {
  const fallback = title || "JobApp";
  const [clientTitle, setClientTitle] = useState<string | undefined>(undefined);
  const { user } = useUser() ?? { user: null };

  // derive display name from localStorage or Clerk
  const [displayName, setDisplayName] = useState<string>("");

  const updateName = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("user-profile") || "{}");
        const name: string =
          (stored?.name || "").trim() ||
          (user?.firstName || user?.fullName || "").trim();
        setDisplayName(name);
      } catch {
        setDisplayName((user?.firstName || user?.fullName || "").trim());
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientTitle(document.title || fallback);
      updateName();

      // Listen for updates from Profile page
      window.addEventListener("user-profile-updated", updateName);
      return () => window.removeEventListener("user-profile-updated", updateName);
    }
  }, [fallback, user?.firstName, user?.fullName]);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  return (
    <header className="w-full app-header">
      <div className="w-full bg-blue-900 text-white" style={{ height: '100px' }}>
        <div className="container mx-auto flex items-center h-full">
          <a href="/" className="flex items-center">
            <img
              src="/logo2.png"
              alt="Job App Tracker Logo"
              className="h-64 w-auto block"
            />
          </a>
          {/* Greeting on the right side */}
          <div className="header-greeting">
            <span>
              {getGreeting()}{displayName ? `, ${displayName}` : ""}
            </span>
          </div>
        </div>
      </div>

      <Navbar />
    </header>
  );
}