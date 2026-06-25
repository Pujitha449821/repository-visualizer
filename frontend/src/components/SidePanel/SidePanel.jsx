import { useEffect, useState } from "react";
import { fetchSummary } from "../../services/api";

/**
 * Shows details + AI summary for the currently selected file node.
 * Props:
 *   node    - the selected React Flow node (or null)
 *   repoPath - absolute path of the scanned repo (needed for the summary call)
 *   onClose - handler to close the panel
 */
export default function SidePanel({ node, repoPath, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Re-fetch the summary whenever the selected node changes.
  useEffect(() => {
    // No node selected -> nothing to do.
    if (!node) return;

    // Reset state for the new file.
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
        width: 320,
        height: "100vh",
        background: "#1e1e1e",
        color: "#eee",
        borderLeft: "1px solid #333",
        padding: 20,
        boxSizing: "border-box",
        overflowY: "auto",
        zIndex: 10,
      }}
    >
      <button
        onClick={onClose}
        style={{
          float: "right",
          background: "transparent",
          color: "#aaa",
          border: "none",
          fontSize: 20,
          cursor: "pointer",
        }}
      >
        ×
      </button>

      <h2 style={{ marginTop: 0, wordBreak: "break-word" }}>{d.label}</h2>

      <p style={{ opacity: 0.7, fontSize: 12, wordBreak: "break-all" }}>
        {node.id}
      </p>

      <div style={{ marginTop: 16, lineHeight: 1.8 }}>
        <div>Code lines: {d.codeLines}</div>
      </div>

      {/* AI summary section */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>AI Summary</h3>

        {loading && <p style={{ opacity: 0.7 }}>Generating summary…</p>}

        {error && (
          <p style={{ color: "#ff8080" }}>Could not load summary: {error}</p>
        )}

        {summary && !loading && (
          <p style={{ lineHeight: 1.6 }}>{summary}</p>
        )}
      </div>
    </div>
  );
}