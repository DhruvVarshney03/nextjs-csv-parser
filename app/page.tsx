"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setUploadStatus(null);
      setProgress(0);
      setIsSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("❌ Please select a file first.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading...");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        setUploadStatus("✅ File uploaded successfully!");
        setIsSuccess(true);
      } else {
        setUploadStatus("❌ Upload failed. Try again.");
        setIsSuccess(false);
        setProgress(0); // Reset progress on failure
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadStatus("❌ Upload error. Check server logs.");
      setIsSuccess(false);
      setProgress(0);
    };

    xhr.send(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          CSV File Upload
        </h1>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:bg-gray-50 hover:file:bg-gray-100 mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={`w-full px-4 py-2 rounded-md text-white transition ${
            isUploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload File"}
        </button>

        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div
              className={`h-3 rounded-full transition-all ${
                isSuccess === false
                  ? "bg-red-500"
                  : isSuccess === true
                  ? "bg-green-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {uploadStatus && (
          <p
            className={`mt-4 text-center font-medium ${
              isSuccess === true
                ? "text-green-600"
                : isSuccess === false
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {uploadStatus}
          </p>
        )}
      </div>
    </div>
  );
}
