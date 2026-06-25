import { Handle, Position } from "reactflow";

/**
 * A custom React Flow node representing one file.
 * Receives its data via props.data (we set this in GraphCanvas).
 * data = { label, codeLines, color, size }
 */
export default function FileNode({ data }) {
  return (
    <div
      style={{
        width: data.size,
        height: data.size,
        background: data.color,
        borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontSize: 11,
        color: "#111",
        padding: 4,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Handles are the little connection points edges attach to. */}
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 600, wordBreak: "break-word" }}>
        {data.label}
      </div>
      <div style={{ opacity: 0.7 }}>{data.codeLines} lines</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}