import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./ResumeEditor.css";

interface ResumeEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function ResumeEditor({ value, onChange, placeholder }: ResumeEditorProps) {
  const [isClient, setIsClient] = useState(false);

  // Ensure Quill only loads on the client to avoid SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="h-[500px] w-full border border-gray-300 rounded bg-gray-50 animate-pulse" />;
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      [{ font: [] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header", "font",
    "bold", "italic", "underline", "strike",
    "color", "background",
    "list", "bullet", "indent",
    "align",
    "link",
  ];

  return (
    <div className="resume-editor-container">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white text-black"
      />
    </div>
  );
}
