import { useState } from "react";
import { fetchGraph } from "../services/api";
import GraphCanvas from "../components/GraphCanvas/GraphCanvas";
import SidePanel from "../components/SidePanel/SidePanel";
import SearchBar from "../components/SearchBar/SearchBar";

export default function Dashboard() {
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentPath, setCurrentPath] = useState("");
  // Has the user submitted a path at least once? Controls welcome vs graph view.
  const [hasSearched, setHasSearched] = useState(false);

  // Central function: fetch the graph for a given path.
  const loadGraph = (path) => {
    setHasSearched(true);
    setCurrentPath(path);
    setLoading(true);
    setError(null);
    setSelectedNode(null);

    fetchGraph(path)
      .then((data) => {
        setGraph(data);
      })
      .catch((err) => {
        setError(err.message);
        setGraph(null);
      })
      .finally(() => setLoading(false));
  };

  const handleNodeClick = (event, node) => setSelectedNode(node);

  // ---- VIEW 1: Welcome screen (before any search) ----
// ---- VIEW 1: Welcome screen (before any search) ----
  if (!hasSearched) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        {/* Single outer card holding everything */}
        <div
          style={{
            maxWidth: 640,
            width: "100%",
            background: "var(--bg-surface)",
            border: "2px solid var(--accent)",
            borderRadius: 20,
            padding: "48px 44px",
            textAlign: "center",
            boxShadow: "0 0 16px var(--accent-glow), 0 16px 48px rgba(0,0,0,0.4)",
          }}
        >
          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              margin: "0 0 16px",
              letterSpacing: "-0.02em",
            }}
          >
            Repository{" "}
            <span style={{ color: "var(--accent)" }}>Visualizer</span>
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              margin: "0 auto 36px",
              maxWidth: 520,
            }}
          >
            Map any codebase visually — see folder structure, file dependencies,
            and size metrics, with AI-powered summaries on every file.
          </p>

          {/* Inner sub-box holding the input + button */}
          <div
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 24,
            }}
          >
            <label
              style={{
                display: "block",
                textAlign: "left",
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 12,
              }}
            >
              Repository folder path
            </label>
            <SearchBar onSubmit={loadGraph} loading={loading} variant="hero" />
          </div>

          <p style={{ fontSize: 16, color: "var(--text-muted)", marginTop: 20 }}>
            Paste the full path to a local repository folder to begin.
          </p>
        </div>
      </div>
    );
  }

  // ---- VIEW 2+: After a search — header on top, content below ----
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top header with logo + path input to switch repos */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "10px 20px",
          margin: "10px 12px 0",
          background: "var(--bg-surface)",
          border: "2px solid var(--accent)",
          borderRadius: 14,
          boxShadow: "0 0 12px var(--accent-glow)",
          height: 64,
          boxSizing: "border-box",
        }}
      >
        <div style={{ whiteSpace: "nowrap", fontWeight: 700, fontSize: 16 }}>
          Repo Visualizer
        </div>
        <div style={{ flex: 1 }}>
          <SearchBar
            initialPath={currentPath}
            onSubmit={loadGraph}
            loading={loading}
            variant="header"
          />
        </div>
      </header>

      {/* Content area below the header */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Loading state */}
        {loading && (
          <div style={centerBoxStyle}>
            <div className="spinner" />
            <p style={{ color: "var(--text-secondary)", marginTop: 16 }}>
              Scanning repository…
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={centerBoxStyle}>
            <div
              style={{
                background: "var(--bg-surface)",
                border: "2px solid #f0883e",
                borderRadius: 14,
                padding: "28px 32px",
                maxWidth: 440,
                textAlign: "center",
                boxShadow: "0 0 16px rgba(240, 136, 62, 0.4), 0 16px 48px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ fontSize: 38, marginBottom: 10 }}>⚠️</div>
              <h3 style={{ margin: "0 0 12px", fontSize: 24 }}>
                Couldn't scan that folder
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 17,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Check that the path is correct and points to a folder on this
                machine, then try again.
              </p>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 12,
                  marginTop: 14,
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Graph (only when we have data and aren't loading/erroring) */}
        {!loading && !error && graph && (
          <GraphCanvas
            nodes={graph.nodes}
            edges={graph.edges}
            onNodeClick={handleNodeClick}
            selectedId={selectedNode?.id}
            fileCount={graph.nodes.length}
            depCount={graph.edges.length}
          />
        )}

        <SidePanel
          node={selectedNode}
          repoPath={currentPath}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}

// Shared style for centering loading/error in the content area.
const centerBoxStyle = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};