import { useState } from "react";

/**
 * Top header bar: lets the user enter a repo folder path and visualize it.
 * Props:
 *   initialPath - starting value for the input
 *   onSubmit    - called with the entered path when the user clicks Visualize
 *   loading     - whether a graph fetch is currently in progress
 */
export default function SearchBar({ initialPath, onSubmit, loading }) {
  const [value, setValue] = useState(initialPath || "");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  };

  // Let the user press Enter instead of clicking the button.
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        height: 64,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 16,
          color: "var(--text-primary)",
          whiteSpace: "nowrap",
          marginRight: 8,
        }}
      >
        <span style={{ color: "var(--accent)" }}>◆</span> Repo Visualizer
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a repository folder path…"
        style={{
          flex: 1,
          height: 40,
          padding: "0 14px",
          background: "var(--bg-base)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          height: 40,
          padding: "0 20px",
          background: loading ? "var(--bg-elevated)" : "var(--accent)",
          color: loading ? "var(--text-muted)" : "#06251f",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
          whiteSpace: "nowrap",
          transition: "background 0.2s ease, transform 0.1s ease",
        }}
        onMouseDown={(e) => (e.target.style.transform = "scale(0.97)")}
        onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
      >
        {loading ? "Loading…" : "Visualize"}
      </button>
    </header>
  );
}