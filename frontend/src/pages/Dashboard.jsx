import { useEffect, useState } from "react";
import { fetchGraph } from "../services/api";
import GraphCanvas from "../components/GraphCanvas/GraphCanvas";
import SidePanel from "../components/SidePanel/SidePanel";
import SearchBar from "../components/SearchBar/SearchBar";

// Starting path — the user can change it in the header.
const DEFAULT_PATH = "C:/Users/91733/repository-visualizer";

export default function Dashboard() {
  const [repoPath, setRepoPath] = useState(DEFAULT_PATH);
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // Fetch the graph whenever repoPath changes.
  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelectedNode(null); // close panel when switching repos

    fetchGraph(repoPath)
      .then(setGraph)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [repoPath]);

  const handleNodeClick = (event, node) => setSelectedNode(node);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <SearchBar
        initialPath={repoPath}
        onSubmit={setRepoPath}
        loading={loading}
      />

      {/* The canvas area fills the rest of the screen below the header. */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {error && (
          <div style={{ padding: 20, color: "var(--danger)" }}>
            Error: {error}
          </div>
        )}

        {!error && graph && (
          <GraphCanvas
            nodes={graph.nodes}
            edges={graph.edges}
            onNodeClick={handleNodeClick}
          />
        )}

        <SidePanel
          node={selectedNode}
          repoPath={repoPath}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}