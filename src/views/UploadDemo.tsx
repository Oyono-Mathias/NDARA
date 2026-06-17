import React, { useState } from "react";
import { auth } from "../firebase";

export default function UploadDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setResultUrl(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to upload files.");
      }
      
      const token = await user.getIdToken();

      const formData = new FormData();
      formData.append("file", file);

      // Sending directly to our secure Express backend
      // Adjust the endpoint for diff folder types: /api/storage/kyc, /api/storage/forum, etc.
      const res = await fetch("/api/storage/avatar", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResultUrl(data.url);
      console.log("Uploaded successfully:", data);

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Test Cloudflare R2 Upload</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Select Avatar (Max 5MB)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-200"
          />
        </div>
        <button 
          type="submit" 
          disabled={!file || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 transition-colors"
        >
          {uploading ? "Uploading..." : "Upload Securely"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
          {error}
        </div>
      )}

      {resultUrl && (
        <div className="mt-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-md">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Upload Complete!</p>
          <img src={resultUrl} alt="Uploaded Avatar" className="w-24 h-24 object-cover rounded-full mx-auto" />
          <a href={resultUrl} target="_blank" rel="noreferrer" className="block text-center text-xs text-blue-600 mt-2 break-all hover:underline">
            {resultUrl}
          </a>
        </div>
      )}
    </div>
  );
}
