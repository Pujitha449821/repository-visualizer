// Base URL of the FastAPI backend.
const API_BASE = "http://127.0.0.1:8000";

/**
 * Fetch the dependency graph for a repository.
 * @param {string} path - Absolute path to the local repo to scan.
 * @returns {Promise<{root: string, nodes: Array, edges: Array}>}
 */
export async function fetchGraph(path) {
  // encodeURIComponent makes the path safe to drop into a URL
  // (handles spaces, backslashes, colons from Windows paths, etc.)
  const url = `${API_BASE}/graph?path=${encodeURIComponent(path)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status} ${response.statusText}`);
  }

  return response.json();
}