import { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

/**
 * Convert backend nodes/edges into the shape React Flow expects.
 * Backend node:  { id, name, total_lines, ... }
 * React Flow node: { id, position: {x, y}, data: { label } }
 */
function toFlowData(nodes, edges) {
  // Simple grid layout: place nodes in rows of 6 so nothing overlaps.
  const COLS = 6;
  const X_GAP = 220;
  const Y_GAP = 120;

  const flowNodes = nodes.map((node, i) => ({
    id: node.id,
    position: {
      x: (i % COLS) * X_GAP,
      y: Math.floor(i / COLS) * Y_GAP,
    },
    data: { label: node.name },
  }));

  // React Flow needs a unique id on every edge.
  const flowEdges = edges.map((edge, i) => ({
    id: `e${i}-${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
  }));

  return { flowNodes, flowEdges };
}

export default function GraphCanvas({ nodes, edges }) {
  // useMemo so we only re-translate when the data actually changes.
  const { flowNodes, flowEdges } = useMemo(
    () => toFlowData(nodes, edges),
    [nodes, edges]
  );

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow nodes={flowNodes} edges={flowEdges} fitView>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}