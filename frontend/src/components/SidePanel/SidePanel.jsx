import { useEffect, useState } from "react";
import { fetchSummary } from "../../services/api";

/**
 * Side panel: file details + AI summary for the selected node.
 * Props: node, repoPath, maxLines, onClose
 */
export default function SidePanel({ node, repoPath, maxLines, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!node) return;
    setSummary(null);
    setError(null);
    setCopied(false);
    setLoading(true);

    fetchSummary(repoPath, node.id)
      .then((result) => setSummary(result.summary))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [node, repoPath]);

  if (!node) return null;

  const d = node.data;
  // How big is this file relative to the largest in the repo (0-100%).
  const sizeRatio = maxLines > 0 ? Math.min(d.codeLines / maxLines, 1) : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(node.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 380,
        height: "100%",
        padding: 12,
        boxSizing: "border-box",
        zIndex: 10,
        animation: "slideInRight 0.25s ease",
      }}
    >
      {/* Glowing frame wrapper */}
      <div style={{ position: "relative", height: "100%" }}>
        {/* Blue glow backing */}
        <div
          style={{
            position: "absolute",
            inset: -2,
            background: "var(--accent)",
            borderRadius: 18,
            boxShadow: "0 0 16px var(--accent-glow)",
            opacity: 0.9,
          }}
        />

        {/* Panel body */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            background: "var(--bg-surface)",
            borderRadius: 16,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          
          {/* Scrollable content */}
          <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
            {/* Header: filename + close */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: d.color,
                    boxShadow: `0 0 8px ${d.color}`,
                    flexShrink: 0,
                  }}
                />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, wordBreak: "break-word" }}>
                  {d.label}
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "none",
                  fontSize: 22,
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 6,
                  flexShrink: 0,
                  transition: "color 0.2s ease, background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "var(--bg-elevated)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ×
              </button>
            </div>

            {/* Sub-card: file path with copy button */}
            <div
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-muted)",
                  marginBottom: 6,
                }}
              >
                Path
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 14,
                    color: "var(--text-primary)",
                    wordBreak: "break-all",
                    flex: 1,
                  }}
                >
                  {node.id}
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    background: "var(--bg-elevated)",
                    color: copied ? "var(--accent)" : "var(--text-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 11,
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "color 0.2s ease",
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Sub-card: size metric with bar (tinted with the file's size color) */}
            <div
              style={{
                background: "var(--bg-base)",
                border: `1px solid ${d.color}`,
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
                boxShadow: `0 0 10px ${d.color}40`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-muted)",
                  marginBottom: 8,
                }}
              >
                Lines of code
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>
                  {d.codeLines}
                </span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>lines</span>
              </div>
              {/* Size bar: how big this file is vs the repo's biggest */}
              <div
                style={{
                  height: 8,
                  background: "var(--bg-elevated)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${sizeRatio * 100}%`,
                    height: "100%",
                    background: d.color,
                    borderRadius: 4,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Sub-card: AI summary */}
            <div
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-secondary)",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ color: "var(--accent)" }}>✦</span> AI Summary
              </div>

              <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)", minHeight: 40 }}>
                {loading && (
                  <span style={{ color: "var(--text-muted)", animation: "pulse 1.4s ease infinite" }}>
                    Generating summary…
                  </span>
                )}
                {error && (
                  <span style={{ color: "var(--danger)" }}>
                    Could not load summary: {error}
                  </span>
                )}
                {summary && !loading && <span>{summary}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}