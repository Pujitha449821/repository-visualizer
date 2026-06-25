import { useEffect, useState } from "react";
import { fetchGraph } from "../services/api";
import GraphCanvas from "../components/GraphCanvas/GraphCanvas";
import SidePanel from "../components/SidePanel/SidePanel";

const REPO_PATH = "C:/Users/91733/repository-visualizer";

export default function Dashboard() {
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetchGraph(REPO_PATH)
      .then(setGraph)
      .catch((err) => setError(err.message));
  }, []);

  // React Flow calls this with (event, node). We only need the node.
  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  if (error) return <div style={{ padding: 20 }}>Error: {error}</div>;
  if (!graph) return <div style={{ padding: 20 }}>Loading graph…</div>;

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <GraphCanvas
        nodes={graph.nodes}
        edges={graph.edges}
        onNodeClick={handleNodeClick}
      />
      <SidePanel
  node={selectedNode}
  repoPath={REPO_PATH}
  onClose={() => setSelectedNode(null)}
/>
    </div>
  );
}