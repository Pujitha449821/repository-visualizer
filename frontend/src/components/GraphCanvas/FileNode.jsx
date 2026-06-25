import { Handle, Position } from "reactflow";

/**
 * A custom React Flow node representing one file.
 * data = { label, codeLines, color, size, selected }
 */
export default function FileNode({ data, selected }) {
  return (
    <div
      style={{
        width: data.size,
        height: data.size,
        background: "var(--bg-surface)",
        borderRadius: 12,
        // A colored top accent bar shows the file-size color without
        // flooding the whole card, so text stays readable.
        border: selected
          ? "2px solid var(--accent)"
          : "1px solid var(--border)",
        boxShadow: selected
          ? "0 0 0 4px var(--accent-glow), 0 4px 12px rgba(0,0,0,0.4)"
          : "0 2px 8px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 8,
        boxSizing: "border-box",
        overflow: "hidden",
        cursor: "pointer",
        transition:
          "transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      // Hover lift effect
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      {/* color dot indicating file size */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: data.color,
          marginBottom: 6,
          boxShadow: `0 0 8px ${data.color}`,
        }}
      />

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "var(--accent)", border: "none", width: 7, height: 7 }}
      />

      <div
        style={{
          fontWeight: 600,
          fontSize: 11,
          color: "var(--text-primary)",
          wordBreak: "break-word",
          lineHeight: 1.2,
        }}
      >
        {data.label}
      </div>

      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
        {data.codeLines} lines
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "var(--accent)", border: "none", width: 7, height: 7 }}
      />
    </div>
  );
}