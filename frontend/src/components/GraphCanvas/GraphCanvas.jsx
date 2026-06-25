import { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap, Panel } from "reactflow";
import "reactflow/dist/style.css";
import FileNode from "./FileNode";

// Tell React Flow that nodes of type "file" should render with our component.
const nodeTypes = { file: FileNode };

/**
 * Map a line count to a color on a green -> red scale, using a LOG scale.
 * Log scale stops one huge file (like package-lock.json) from making
 * every smaller file look identical.
 */
function colorForLines(lines, maxLines) {
  // log1p(x) = log(1 + x), which safely handles 0-line files.
  const ratio = maxLines > 0 ? Math.log1p(lines) / Math.log1p(maxLines) : 0;
  const hue = 120 - ratio * 120; // 120 = green, 0 = red
  return `hsl(${hue}, 70%, 65%)`;
}

/**
 * Map a line count to a pixel size, also on a log scale and clamped.
 */
function sizeForLines(lines, maxLines) {
  const MIN = 90;
  const MAX = 170;
  const ratio = maxLines > 0 ? Math.log1p(lines) / Math.log1p(maxLines) : 0;
  return MIN + ratio * (MAX - MIN);
}

function toFlowData(nodes, edges, selectedId) {
  const COLS = 6;
  const X_GAP = 220;
  const Y_GAP = 160;

  // Find the biggest file so color/size are relative to THIS repo.
  const maxLines = Math.max(...nodes.map((n) => n.code_lines), 1);

  const flowNodes = nodes.map((node, i) => ({
    id: node.id,
    type: "file", // use our custom FileNode
    position: {
      x: (i % COLS) * X_GAP,
      y: Math.floor(i / COLS) * Y_GAP,
    },
    data: {
      label: node.name,
      codeLines: node.code_lines,
      color: colorForLines(node.code_lines, maxLines),
    },
    selected: node.id === selectedId,

  }));

const flowEdges = edges.map((edge, i) => {
    // Is this edge connected to the currently selected node?
    const isConnected =
      selectedId &&
      (edge.source === selectedId || edge.target === selectedId);

    // Is *some* node selected (so we should dim the unconnected edges)?
    const somethingSelected = Boolean(selectedId);

    return {
      id: `e${i}-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      animated: isConnected || !somethingSelected, // animate connected/all
      style: {
        // Connected edges: bright & bold. Others: dim (when something's selected).
        stroke: isConnected ? "#60a5fa" : "#3b82f6",
        strokeWidth: isConnected ? 2.5 : 1.5,
        opacity: somethingSelected && !isConnected ? 0.15 : 1,
      },
    };
  });

  return { flowNodes, flowEdges };
}

export default function GraphCanvas({ nodes, edges, onNodeClick, selectedId, fileCount, depCount }) {
  const { flowNodes, flowEdges } = useMemo(
    () => toFlowData(nodes, edges, selectedId),
    [nodes, edges, selectedId]
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Background color="#21262d" gap={20} size={1} />

        <Panel position="top-left">
          <div style={{ position: "relative" }}>
            {/* Blue glowing backing layer */}
            <div
              style={{
                position: "absolute",
                inset: -2,
                background: "#3b82f6",
                borderRadius: 12,
                boxShadow: "0 0 12px rgba(59,130,246,0.6)",
                opacity: 0.9,
              }}
            />
            {/* Dark box on top */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                background: "#161b22",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#9da7b3",
                  marginBottom: 8,
                }}
              >
                File size (lines of code)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#9da7b3" }}>Fewer</span>
                {/* The gradient bar mirrors the green->red node colors */}
                <div
                  style={{
                    width: 140,
                    height: 12,
                    borderRadius: 5,
                    background:
                      "linear-gradient(to right, hsl(120,70%,65%), hsl(60,70%,65%), hsl(0,70%,65%))",
                  }}
                />
                <span style={{ fontSize: 15, color: "#9da7b3" }}>More</span>
              </div>
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "1px solid #30363d",
                  fontSize: 15,
                  color: "#9da7b3",
                }}
              >
                {fileCount} files · {depCount} dependencies
              </div>
            </div>
          </div>
        </Panel>

        <Controls
          showInteractive={false}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        />
        <MiniMap
          pannable
          zoomable
          style={{
            background: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: 10,
            overflow: "hidden",
          }}
          maskColor="rgba(13, 17, 23, 0.7)"
          nodeColor={(n) => n.data?.color || "#3b82f6"}
        />
      </ReactFlow>
    </div>
  );
}