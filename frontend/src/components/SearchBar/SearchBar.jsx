import { useState } from "react";

/**
 * Repo path input + Visualize button.
 * variant="hero"   -> large, for the welcome screen
 * variant="header" -> slim, for the top bar in graph view
 */
export default function SearchBar({ initialPath, onSubmit, loading, variant = "header" }) {
  const [value, setValue] = useState(initialPath || "");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const isHero = variant === "hero";

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a repository folder path…"
        style={{
          flex: 1,
          height: isHero ? 56 : 40,
          padding: isHero ? "0 18px" : "0 14px",
          background: "var(--bg-base)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          color: "var(--text-primary)",
          fontSize: isHero ? 16 : 14,
          outline: "none",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--accent)";
          e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "none";
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          height: isHero ? 56 : 40,
          padding: isHero ? "0 28px" : "0 20px",
          background: loading ? "var(--bg-elevated)" : "var(--accent)",
          color: loading ? "var(--text-muted)" : "#ffffff",
          border: "none",
          borderRadius: 10,
          fontSize: isHero ? 16 : 14,
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
          whiteSpace: "nowrap",
          transition: "background 0.2s ease, transform 0.1s ease",
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.background = "var(--accent-hover)";
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.background = "var(--accent)";
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {loading ? "Scanning…" : "Visualize"}
      </button>
    </div>
  );
}