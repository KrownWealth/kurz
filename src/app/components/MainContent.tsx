"use client"
import React, { useState } from "react";

const MainContent: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file.name);
  };

  return (
    <div className="main-content">
      <div>
        <button>Upload PDF</button>
        <button>Video URL</button>
      </div>
      <div>
        {uploadedFile && <p>Uploaded File: {uploadedFile}</p>}
      </div>
      <div>
        <button>Summary</button>
        <button>Raise Hand</button>
        <button>Test Knowledge</button>
        <button>Generate</button>
        <button>Invite</button>
      </div>
    </div>
  );
};
export default MainContent;