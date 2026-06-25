import { Handle, Position } from "reactflow";

/**
 * A custom React Flow node representing one file.
 * The size color forms a glowing border/frame BEHIND the dark card.
 * data = { label, color }
 */
export default function FileNode({ data, selected }) {
  return (
    <div
      style={{
        position: "relative",
        width: 170,
        height: 100,
        cursor: "pointer",
        transition: "transform 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      {/* Colored backing layer — sits BEHIND, peeks out as a frame + glow */}
      <div
        style={{
          position: "absolute",
          inset: -3, // extends 3px beyond the card on all sides
          background: data.color,
          borderRadius: 14,
          boxShadow: `0 0 12px ${data.color}`,
          opacity: 0.9,
        }}
      />

      {/* The dark card on top */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--bg-surface)",
          borderRadius: 12,
          border: selected ? "2px solid var(--accent)" : "1px solid transparent",
          boxShadow: selected
            ? "0 0 0 4px var(--accent-glow)"
            : "0 2px 8px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px 10px",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: "var(--accent)", border: "none", width: 7, height: 7 }}
        />

        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: "var(--text-primary)",
            wordBreak: "break-word",
            lineHeight: 1.25,
          }}
        >
          {data.label}
        </span>

        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: "var(--accent)", border: "none", width: 7, height: 7 }}
        />
      </div>
    </div>
  );
}