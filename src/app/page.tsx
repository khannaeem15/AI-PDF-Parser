"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [useHybrid, setUseHybrid] = useState(false);
  const [result, setResult] = useState<{ markdown?: string; json?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const parsePDF = async () => {
    if (!file) return;

    setIsParsing(true);
    setError(null);

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("useHybrid", useHybrid ? "true" : "false");

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Parsing failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">AI PDF Parser Hub</h1>
        <p className="subtitle">High-fidelity PDF structural parsing powered by AI layout analysis. Extract tables, markdown, and bounding boxes easily.</p>
      </header>

      <main>
        <div className="upload-card">
          <div className="upload-icon">📄</div>
          <h2>{file ? file.name : "Select a PDF Document"}</h2>
          <p style={{ color: "#94a3b8", marginTop: "0.5rem", marginBottom: "1rem" }}>
            {file ? "Ready for deep analysis" : "Supports digital and scanned PDFs"}
          </p>
          
          <input 
            type="file" 
            accept="application/pdf" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          
          <div style={{ margin: "1rem 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <input 
              type="checkbox" 
              id="hybridToggle" 
              checked={useHybrid} 
              onChange={(e) => setUseHybrid(e.target.checked)} 
              style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
            />
            <label htmlFor="hybridToggle" style={{ fontSize: "0.95rem" }}>Enable Hybrid AI Mode (OCR & Complex Tables)</label>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button 
              className="upload-btn" 
              onClick={() => fileInputRef.current?.click()}
              style={{ background: "#334155" }}
            >
              Browse
            </button>
            <button 
              className="upload-btn" 
              onClick={parsePDF} 
              disabled={!file || isParsing}
            >
              {isParsing ? "Extracting Data..." : "Parse Document"}
              {isParsing && <span className="loader"></span>}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: "1.5rem", color: "#ef4444", background: "#fef2f211", padding: "1rem", borderRadius: "10px" }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {result && (
          <div className="result-section">
            <div className="result-card">
              <div className="result-header">
                <span>Markdown (LLM Ready)</span>
                <span style={{ fontSize: "0.8rem", background: "var(--primary)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>.md</span>
              </div>
              <div className="result-content">
                {result.markdown || "No markdown output generated."}
              </div>
            </div>

            <div className="result-card">
              <div className="result-header">
                <span>Structured JSON (Metadata)</span>
                <span style={{ fontSize: "0.8rem", background: "var(--secondary)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>.json</span>
              </div>
              <div className="result-content">
                {result.json || "No JSON output generated."}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
