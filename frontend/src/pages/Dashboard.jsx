import { useEffect, useState } from "react";
import { fetchGraph } from "../services/api";
import GraphCanvas from "../components/GraphCanvas/GraphCanvas";

// For now, hardcode the repo path. Later we'll add an input box.
const REPO_PATH = "C:/Users/91733/repository-visualizer";

export default function Dashboard() {
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGraph(REPO_PATH)
      .then(setGraph)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div style={{ padding: 20 }}>Error: {error}</div>;
  if (!graph) return <div style={{ padding: 20 }}>Loading graph…</div>;

  return <GraphCanvas nodes={graph.nodes} edges={graph.edges} />;
}