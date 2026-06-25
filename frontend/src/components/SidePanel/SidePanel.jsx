/**
 * Shows details for the currently selected file node.
 * Receives the selected node (or null) and a close handler from Dashboard.
 */
export default function SidePanel({ node, onClose }) {
  // Nothing selected -> render nothing.
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

      {/* The AI summary will go here in a later step. */}
    </div>
  );
}