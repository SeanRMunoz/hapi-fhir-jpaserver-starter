"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PatientQueryPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new results are appended
    const el = resultsRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [results]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please enter a prompt.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/patient-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      let outputText = "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        let output: any = (data as any)?.output;
        if (output === undefined || output === null) {
          if (typeof data === "string") {
            outputText = data;
          } else if (typeof (data as any)?.text === "string") {
            outputText = (data as any).text;
          } else {
            outputText = "(no output)";
          }
        } else {
          outputText = typeof output === "string" ? output : JSON.stringify(output, null, 2);
        }
      } else {
        outputText = await res.text();
      }

      setResults((prev) => [...prev, outputText]);
    } catch (err: any) {
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function onClearResults() {
    setResults([]);
  }

  return (
    <main>
      <header className="nav">
        <Link className="link" href="/">HAPI FHIR Frontend</Link>
      </header>
      <section className="card">
        <h1>Patient Query</h1>
        <p>Enter a prompt to query patient healthcare information via the agent.</p>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem" }}>
          <label htmlFor="prompt">Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            style={{ width: "100%" }}
            placeholder="e.g., Show the latest vital signs for patient John Doe"
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Querying..." : "Submit"}
            </button>
            <button type="button" className="btn" onClick={onClearResults} disabled={results.length === 0}>
              Clear Results
            </button>
            <Link className="btn" href="/dashboard">Back to Dashboard</Link>
          </div>
        </form>
        {error && (
          <div style={{ marginTop: "1rem", color: "#b00020" }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{ marginTop: "1rem" }}>
          <h2>Results</h2>
          <div
            ref={resultsRef}
            style={{
              whiteSpace: "pre-wrap",
              border: "1px solid #0f0",
              borderRadius: 6,
              padding: "0.75rem",
              maxHeight: 400,
              overflowY: "auto",
              background: "#000",
              color: "#0f0",
              lineHeight: 1.2,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            }}
          >
            {results.length === 0 ? (
              <div style={{ color: "rgba(0,255,0,0.6)" }}>(no results yet)</div>
            ) : (
              results.map((r, idx) => (
                <div key={idx} style={{ marginBottom: idx < results.length - 1 ? "0.6rem" : 0 }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => (
                        <p style={{ margin: '0.2rem 0' }} {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul style={{ margin: '0.2rem 0', paddingLeft: '1.1rem' }} {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol style={{ margin: '0.2rem 0', paddingLeft: '1.1rem' }} {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li style={{ margin: '0.1rem 0' }} {...props} />
                      ),
                      h1: ({ node, ...props }) => (
                        <h1 style={{ margin: '0.3rem 0 0.2rem', fontSize: '1.25rem', color: '#0f0' }} {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 style={{ margin: '0.3rem 0 0.2rem', fontSize: '1.15rem', color: '#0f0' }} {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 style={{ margin: '0.25rem 0 0.15rem', fontSize: '1.1rem', color: '#0f0' }} {...props} />
                      ),
                      h4: ({ node, ...props }) => (
                        <h4 style={{ margin: '0.25rem 0 0.15rem', fontSize: '1.05rem', color: '#0f0' }} {...props} />
                      ),
                      h5: ({ node, ...props }) => (
                        <h5 style={{ margin: '0.25rem 0 0.15rem', fontSize: '1rem', color: '#0f0' }} {...props} />
                      ),
                      h6: ({ node, ...props }) => (
                        <h6 style={{ margin: '0.25rem 0 0.15rem', fontSize: '0.95rem', color: '#0f0' }} {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote style={{ margin: '0.2rem 0', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(0,255,0,0.4)' }} {...props} />
                      ),
                      code: ({ inline, className, children, ...props }) => (
                        inline ? (
                          <code style={{ background: 'transparent', padding: 0 }} {...props}>
                            {children}
                          </code>
                        ) : (
                          <code style={{ display: 'block', background: 'transparent', padding: 0, whiteSpace: 'pre-wrap' }} {...props}>
                            {children}
                          </code>
                        )
                      ),
                      pre: ({ node, ...props }) => (
                        <pre style={{ margin: '0.2rem 0' }} {...props} />
                      ),
                      table: ({ node, ...props }) => (
                        <table style={{ margin: '0.2rem 0', borderCollapse: 'collapse' }} {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th style={{ border: '1px solid rgba(0,255,0,0.4)', padding: '0.15rem 0.3rem' }} {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td style={{ border: '1px solid rgba(0,255,0,0.3)', padding: '0.15rem 0.3rem' }} {...props} />
                      ),
                    }}
                  >
                    {r}
                  </ReactMarkdown>
                  {idx < results.length - 1 && (
                    <hr style={{ border: 0, borderTop: "1px dashed rgba(0,255,0,0.4)", marginTop: "0.75rem" }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
