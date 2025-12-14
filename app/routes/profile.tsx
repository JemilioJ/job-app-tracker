"use client";

import { useUser } from "@clerk/clerk-react";
import { useState, useEffect, useMemo } from "react";
import ResumeEditor from "../components/ResumeEditor";
import "./profile.css";
import { 
  mdiPencilOutline, 
  mdiContentSaveOutline, 
  mdiClose, 
  mdiCheck, 
  mdiPlus, 
  mdiTrashCanOutline,
  mdiFileDocumentOutline,
  mdiRenameBox,
  mdiContentCopy,
  mdiFolderMoveOutline,
  mdiChevronDown,
  mdiChevronRight,
  mdiFolderOutline,
  mdiDownload
} from "@mdi/js";

interface Resume {
  id: string;
  name: string;
  content: string;
  updatedAt: number;
  category?: string;
}

export default function Profile() {
  const { user, isLoaded } = useUser();
  
  // Resume State
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [resumeContent, setResumeContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  // Profile Name State
  const [displayName, setDisplayName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Load data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load Profile Name
      const savedProfile = localStorage.getItem("user-profile");
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed.name) setDisplayName(parsed.name);
        } catch {}
      }

      // Load Resumes
      const savedResumesStr = localStorage.getItem("user-resumes");
      let loadedResumes: Resume[] = [];
      if (savedResumesStr) {
        try {
          loadedResumes = JSON.parse(savedResumesStr);
        } catch {}
      }

      // Migration: Check for old single resume
      const oldResume = localStorage.getItem("user-resume");
      if (oldResume && loadedResumes.length === 0) {
        const newResume: Resume = {
          id: Date.now().toString(),
          name: "My Resume",
          content: oldResume,
          updatedAt: Date.now(),
        };
        loadedResumes.push(newResume);
        localStorage.setItem("user-resumes", JSON.stringify(loadedResumes));
      }

      setResumes(loadedResumes);
      if (loadedResumes.length > 0) {
        setActiveResumeId(loadedResumes[0].id);
        setResumeContent(loadedResumes[0].content);
      }
    }
  }, []);

  // Fallback to Clerk name
  useEffect(() => {
    if (isLoaded && user && !displayName) {
      setDisplayName(user.fullName || "");
    }
  }, [isLoaded, user, displayName]);

  // Sync content when active resume changes
  useEffect(() => {
    const active = resumes.find(r => r.id === activeResumeId);
    if (active) {
      setResumeContent(active.content);
    } else {
      setResumeContent("");
    }
    setIsEditing(false); // Exit edit mode when switching
  }, [activeResumeId]);

  const handleSaveResume = () => {
    if (!activeResumeId) return;
    
    const updatedResumes = resumes.map(r => 
      r.id === activeResumeId 
        ? { ...r, content: resumeContent, updatedAt: Date.now() }
        : r
    );
    
    setResumes(updatedResumes);
    if (typeof window !== "undefined") {
      localStorage.setItem("user-resumes", JSON.stringify(updatedResumes));
    }
    setIsEditing(false);
  };

  const handleCancelResume = () => {
    const active = resumes.find(r => r.id === activeResumeId);
    if (active) {
      setResumeContent(active.content);
    }
    setIsEditing(false);
  };

  const handleCreateResume = () => {
    const name = prompt("Enter a name for the new resume:", "New Resume");
    if (!name) return;

    const newResume: Resume = {
      id: Date.now().toString(),
      name,
      content: "",
      updatedAt: Date.now(),
    };

    const updated = [...resumes, newResume];
    setResumes(updated);
    setActiveResumeId(newResume.id);
    setResumeContent("");
    setIsEditing(true); // Auto-enter edit mode
    
    if (typeof window !== "undefined") {
      localStorage.setItem("user-resumes", JSON.stringify(updated));
    }
  };

  const handleDuplicateResume = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const original = resumes.find(r => r.id === id);
    if (!original) return;

    const newResume: Resume = {
      ...original,
      id: Date.now().toString(),
      name: `Copy of ${original.name}`,
      updatedAt: Date.now(),
    };
    
    const updated = [...resumes, newResume];
    setResumes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("user-resumes", JSON.stringify(updated));
    }
  };

  const handleChangeCategory = (id: string, currentCategory: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    const newCategory = prompt("Enter category name (leave empty for Uncategorized):", currentCategory || "");
    if (newCategory === null) return;

    const updated = resumes.map(r => r.id === id ? { ...r, category: newCategory.trim() || undefined } : r);
    setResumes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("user-resumes", JSON.stringify(updated));
    }
  };

  const handleDeleteResume = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;

    const updated = resumes.filter(r => r.id !== id);
    setResumes(updated);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("user-resumes", JSON.stringify(updated));
    }

    if (id === activeResumeId) {
      if (updated.length > 0) {
        setActiveResumeId(updated[0].id);
      } else {
        setActiveResumeId(null);
        setResumeContent("");
      }
    }
  };

  const handleRenameResume = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt("Rename resume:", currentName);
    if (!newName || newName === currentName) return;

    const updated = resumes.map(r => r.id === id ? { ...r, name: newName } : r);
    setResumes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("user-resumes", JSON.stringify(updated));
    }
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleDownloadDoc = () => {
    if (!activeResumeId || !resumeContent) return;
    const active = resumes.find(r => r.id === activeResumeId);
    const fileName = active ? `${active.name}.doc` : "resume.doc";

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + resumeContent + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = fileName;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  // Profile Name Handlers
  const startEditingName = () => {
    setTempName(displayName);
    setIsEditingName(true);
  };

  const saveName = () => {
    setDisplayName(tempName);
    if (typeof window !== "undefined") {
      localStorage.setItem("user-profile", JSON.stringify({ name: tempName }));
      window.dispatchEvent(new Event("user-profile-updated"));
    }
    setIsEditingName(false);
  };

  const cancelName = () => {
    setIsEditingName(false);
  };

  // Grouping Logic
  const groupedResumes = useMemo(() => {
    const groups: Record<string, Resume[]> = {};
    resumes.forEach(r => {
      const cat = r.category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(r);
    });
    return groups;
  }, [resumes]);

  const sortedCategories = useMemo(() => {
    return Object.keys(groupedResumes).sort((a, b) => {
      if (a === "Uncategorized") return 1;
      if (b === "Uncategorized") return -1;
      return a.localeCompare(b);
    });
  }, [groupedResumes]);

  if (!isLoaded) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  const activeResume = resumes.find(r => r.id === activeResumeId);

  return (
    <div className="profile-page">
      <div className="max-w-[96rem] mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <img
            src={user?.imageUrl}
            alt={user?.fullName || "User"}
            className="w-24 h-24 rounded-full border-4 border-white shadow-md"
          />
          <div>
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-3xl font-bold text-slate-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                    autoFocus
                  />
                  <button onClick={saveName} className="text-green-600 hover:bg-green-50 p-1 rounded cursor-pointer">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d={mdiCheck} /></svg>
                  </button>
                  <button onClick={cancelName} className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d={mdiClose} /></svg>
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {displayName}
                  </h1>
                  <button 
                    onClick={startEditingName}
                    className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    title="Edit display name"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d={mdiPencilOutline} /></svg>
                  </button>
                </>
              )}
            </div>
            <p className="text-slate-600">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>

        {/* Changed grid-cols-4 to grid-cols-6 to allow finer control over width */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Main Content: Resume Editor - Takes 4/6 columns (approx 66%) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <span className="text-2xl">📄</span> 
                  {activeResume ? activeResume.name : "No Resume Selected"}
                </h2>
                
                {activeResume && (
                  !isEditing ? (
                    <div className="flex items-center gap-2">
                       <button
                        onClick={handleDownloadDoc}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Download as Word Doc"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d={mdiDownload} /></svg>
                        Download
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d={mdiPencilOutline} /></svg>
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancelResume}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d={mdiClose} /></svg>
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveResume}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d={mdiContentSaveOutline} /></svg>
                        Save
                      </button>
                    </div>
                  )
                )}
              </div>

              <div className="flex-1 bg-slate-100 overflow-hidden flex flex-col">
                {activeResume ? (
                  isEditing ? (
                    <div className="p-6 h-full overflow-hidden flex flex-col">
                      <ResumeEditor
                        value={resumeContent}
                        onChange={setResumeContent}
                        placeholder="Start typing your resume here..."
                      />
                    </div>
                  ) : (
                    <div className="flex-1 overflow-auto custom-scrollbar py-8 px-4 flex justify-center max-h-[900px]">
                      {resumeContent ? (
                        <div 
                          dangerouslySetInnerHTML={{ __html: resumeContent }} 
                          className="bg-white border border-gray-200 shadow-sm min-h-[11in] w-[9.5in] p-[0.5in] text-slate-900 mx-auto h-fit"
                          style={{ lineHeight: 1.6 }}
                        />
                      ) : (
                        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg w-full max-w-2xl mx-auto mt-8 bg-white/50">
                          <p>This resume is empty.</p>
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="mt-2 text-blue-600 hover:underline cursor-pointer"
                          >
                            Click to add content
                          </button>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    <p>Select a resume from the sidebar or create a new one.</p>
                    <button 
                      onClick={handleCreateResume}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Create New Resume
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Resume List - Takes 2/6 columns (approx 33%), making it wider */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Saved Documents</h3>
                <button 
                  onClick={handleCreateResume}
                  className="text-blue-600 hover:bg-blue-50 p-1 rounded-full cursor-pointer"
                  title="Create new resume"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d={mdiPlus} /></svg>
                </button>
              </div>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {resumes.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No resumes saved.</p>
                )}
                
                {sortedCategories.map(cat => {
                  const isUncategorized = cat === "Uncategorized";
                  const showHeader = sortedCategories.length > 1 || !isUncategorized;
                  
                  return (
                    <div key={cat} className="mb-1">
                      {showHeader && (
                        <div 
                          className="flex items-center gap-1 p-2 cursor-pointer hover:bg-gray-50 rounded text-slate-700 font-semibold text-sm select-none"
                          onClick={() => toggleCategory(cat)}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d={collapsedCategories.has(cat) ? mdiChevronRight : mdiChevronDown} />
                          </svg>
                          <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d={mdiFolderOutline} />
                          </svg>
                          <span>{cat}</span>
                          <span className="text-xs text-gray-400 font-normal ml-auto">({groupedResumes[cat].length})</span>
                        </div>
                      )}

                      {(!showHeader || !collapsedCategories.has(cat)) && (
                        <div className={showHeader ? "ml-2 pl-2 border-l border-gray-100" : ""}>
                          {groupedResumes[cat].map(resume => (
                            <div 
                              key={resume.id}
                              onClick={() => setActiveResumeId(resume.id)}
                              className={`
                                group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all mb-2
                                ${activeResumeId === resume.id 
                                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" 
                                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}
                              `}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <svg className={`w-5 h-5 flex-shrink-0 ${activeResumeId === resume.id ? "text-blue-600" : "text-gray-400"}`} viewBox="0 0 24 24" fill="currentColor">
                                  <path d={mdiFileDocumentOutline} />
                                </svg>
                                <div className="min-w-0">
                                  <p className={`text-sm font-medium truncate ${activeResumeId === resume.id ? "text-blue-900" : "text-gray-700"}`}>
                                    {resume.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(resume.updatedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => handleDuplicateResume(resume.id, e)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded cursor-pointer"
                                  title="Duplicate"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d={mdiContentCopy} /></svg>
                                </button>
                                <button
                                  onClick={(e) => handleChangeCategory(resume.id, resume.category, e)}
                                  className="p-1 text-gray-400 hover:text-orange-600 hover:bg-white rounded cursor-pointer"
                                  title="Move to Category"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d={mdiFolderMoveOutline} /></svg>
                                </button>
                                <button
                                  onClick={(e) => handleRenameResume(resume.id, resume.name, e)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded cursor-pointer"
                                  title="Rename"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d={mdiRenameBox} /></svg>
                                </button>
                                <button
                                  onClick={(e) => handleDeleteResume(resume.id, e)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded cursor-pointer"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d={mdiTrashCanOutline} /></svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
