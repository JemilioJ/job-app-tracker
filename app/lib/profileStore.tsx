import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export type Profile = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolioUrl?: string;
  targetRole?: string;
  preferredLocation?: string;
  salaryRange?: string;
  jobType?: "Full-Time" | "Part-Time" | "Contract" | "Internship" | "Remote" | "Hybrid" | "Onsite" | string;
  resume: string;
  lastSavedAt?: number;
};

type ProfileContextValue = {
  profile: Profile;
  updateProfile: (partial: Partial<Profile>) => void;
  resetProfile: () => void;
  isEditingResume: boolean;
  setEditingResume: (v: boolean) => void;
};

const DEFAULT_PROFILE: Profile = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  resume: "# Summary\n- Add your professional summary here.\n\n# Experience\n- Company — Role (Dates)\n- Key achievement 1\n- Key achievement 2\n\n# Skills\n- Skill A\n- Skill B\n- Skill C\n",
};

const STORAGE_KEY = "profile.v1";

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_PROFILE, ...parsed } as Profile;
      }
    } catch {}
    return DEFAULT_PROFILE;
  });

  const [isEditingResume, setEditingResume] = useState(false);
  const saveDebounce = useRef<number | null>(null);

  // Persist to localStorage with debounce
  useEffect(() => {
    if (saveDebounce.current) {
      window.clearTimeout(saveDebounce.current);
    }
    saveDebounce.current = window.setTimeout(() => {
      try {
        const withTimestamp: Profile = { ...profile, lastSavedAt: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
        setProfile(withTimestamp);
      } catch {}
    }, 600);
    return () => {
      if (saveDebounce.current) {
        window.clearTimeout(saveDebounce.current);
        saveDebounce.current = null;
      }
    };
  }, [profile]);

  const updateProfile = (partial: Partial<Profile>) => {
    setProfile((p) => ({ ...p, ...partial }));
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
  };

  const value = useMemo<ProfileContextValue>(() => ({
    profile,
    updateProfile,
    resetProfile,
    isEditingResume,
    setEditingResume,
  }), [profile, isEditingResume]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}

// Simple helpers to render structured resume text to HTML-ish JSX
export function normalizeResume(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n");
}

export function renderResume(text: string): React.ReactElement {
  const lines = normalizeResume(text).split("\n");
  const blocks: React.ReactElement[] = [];
  let buffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (buffer.length) {
      blocks.push(<p key={`p-${blocks.length}`}>{buffer.join(" ")}</p>);
      buffer = [];
    }
  };
  const flushList = () => {
    if (listBuffer.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {listBuffer.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      flushParagraph();
      return;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      flushParagraph();
      blocks.push(<h3 key={`h3-${blocks.length}`}>{trimmed.slice(3)}</h3>);
      return;
    }
    if (trimmed.startsWith("# ")) {
      flushList();
      flushParagraph();
      blocks.push(<h2 key={`h2-${blocks.length}`}>{trimmed.slice(2)}</h2>);
      return;
    }
    if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.slice(2));
      return;
    }
    buffer.push(trimmed);
  });

  flushList();
  flushParagraph();

  return <div>{blocks}</div>;
}
