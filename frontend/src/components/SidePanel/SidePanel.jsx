import { useEffect, useState } from "react";
import { fetchSummary } from "../../services/api";

/**
 * Shows details + AI summary for the currently selected file node.
 * Props: node, repoPath, onClose
 */
export default function SidePanel({ node, repoPath, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!node) return;
    setSummary(null);
    setError(null);
    setLoading(true);

    fetchSummary(repoPath, node.id)
      .then((result) => setSummary(result.summary))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [node, repoPath]);

  if (!node) return null;

  const d = node.data;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 360,
        height: "100%",
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        borderLeft: "1px solid var(--border)",
        padding: 0,
        boxSizing: "border-box",
        overflowY: "auto",
        zIndex: 10,
        boxShadow: "-8px 0 24px rgba(0,0,0,0.4)",
        animation: "slideInRight 0.25s ease",
      }}
    >
      {/* Header row with file color dot + close button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px",
          borderBottom: "1px solid var(--border)",
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
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              wordBreak: "break-word",
            }}
          >
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
            transition: "color 0.2s ease, background 0.2s ease",
            flexShrink: 0,
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

      {/* Body */}
      <div style={{ padding: 20 }}>
        {/* File path */}
        <div
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            wordBreak: "break-all",
            background: "var(--bg-base)",
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            fontFamily: "monospace",
          }}
        >
          {node.id}
        </div>

        {/* Metric: code lines */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "baseline",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>
            {d.codeLines}
          </span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            lines of code
          </span>
        </div>

        {/* AI summary section */}
        <div style={{ marginTop: 28 }}>
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: "var(--accent)" }}>✦</span> AI Summary
          </h3>

          <div
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 16,
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--text-primary)",
              minHeight: 60,
            }}
          >
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
  );
}