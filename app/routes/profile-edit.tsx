import { useEffect } from "react";
import { ProfileProvider, useProfile, normalizeResume } from "../lib/profileStore";
import "./profile-edit.css";

function ProfileEditInner() {
  const { profile, updateProfile, resetProfile, setEditingResume } = useProfile();

  useEffect(() => {
    setEditingResume(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = () => {
    updateProfile({ resume: normalizeResume(profile.resume) });
  };

  return (
    <div className="profile-edit-page">
      <div className="card">
        <h2>Personal Info</h2>
        <div className="form-grid">
          <div>
            <label>Full Name</label>
            <input value={profile.fullName} onChange={(e) => updateProfile({ fullName: e.target.value })} />
          </div>
          <div>
            <label>Email</label>
            <input value={profile.email} onChange={(e) => updateProfile({ email: e.target.value })} />
          </div>
          <div>
            <label>Phone</label>
            <input value={profile.phone} onChange={(e) => updateProfile({ phone: e.target.value })} />
          </div>
          <div>
            <label>Location</label>
            <input value={profile.location} onChange={(e) => updateProfile({ location: e.target.value })} />
          </div>
          <div>
            <label>LinkedIn</label>
            <input value={profile.linkedin ?? ""} onChange={(e) => updateProfile({ linkedin: e.target.value })} />
          </div>
          <div>
            <label>GitHub</label>
            <input value={profile.github ?? ""} onChange={(e) => updateProfile({ github: e.target.value })} />
          </div>
          <div>
            <label>Portfolio URL</label>
            <input value={profile.portfolioUrl ?? ""} onChange={(e) => updateProfile({ portfolioUrl: e.target.value })} />
          </div>
          <div>
            <label>Target Role</label>
            <input value={profile.targetRole ?? ""} onChange={(e) => updateProfile({ targetRole: e.target.value })} />
          </div>
          <div>
            <label>Preferred Location</label>
            <input value={profile.preferredLocation ?? ""} onChange={(e) => updateProfile({ preferredLocation: e.target.value })} />
          </div>
          <div>
            <label>Salary Range</label>
            <input value={profile.salaryRange ?? ""} onChange={(e) => updateProfile({ salaryRange: e.target.value })} />
          </div>
        </div>
        <div className="actions" style={{ marginTop: 12 }}>
          <button onClick={onSave}>Save</button>
          <button onClick={resetProfile}>Reset</button>
        </div>
      </div>

      <div className="card">
        <h2>Edit Resume</h2>
        <textarea
          className="resume-textarea"
          value={profile.resume}
          onChange={(e) => updateProfile({ resume: e.target.value })}
        />
        <div className="actions">
          <button onClick={onSave}>Save Resume</button>
          <button onClick={() => {
            const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "profile.json";
            a.click();
            URL.revokeObjectURL(url);
          }}>Download JSON</button>
        </div>
      </div>
    </div>
  );
}

export default function ProfileEditPage() {
  return (
    <ProfileProvider>
      <ProfileEditInner />
    </ProfileProvider>
  );
}
