import { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
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
  const Y_GAP = 200;

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
      size: sizeForLines(node.code_lines, maxLines),
    },
    selected: node.id === selectedId,
  }));

const flowEdges = edges.map((edge, i) => ({
    id: `e${i}-${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    animated: true, // flowing dashes show import direction
    style: { stroke: "#14b8a6", strokeWidth: 1.5 },
  }));

  return { flowNodes, flowEdges };
}

export default function GraphCanvas({ nodes, edges, onNodeClick, selectedId }) {
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
        fitView
      >
        <Background color="#21262d" gap={20} size={1} />
        <Controls
          style={{
            button: { background: "#161b22" },
          }}
        />
        <MiniMap
          style={{ background: "#0d1117" }}
          maskColor="rgba(13, 17, 23, 0.7)"
          nodeColor={(n) => n.data?.color || "#14b8a6"}
        />
      </ReactFlow>
    </div>
  );
}