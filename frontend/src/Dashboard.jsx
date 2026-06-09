import { useState } from "react";

const ALGORITHMS = [
  {
    id: "bst",
    name: "Binary Search Tree",
    short: "BST",
    category: "Tree",
    description:
      "A node-based structure where each node has at most two children, with left subtree values less than the root.",
  },
  {
    id: "avl",
    name: "AVL Tree",
    short: "AVL",
    category: "Tree",
    description:
      "A self-balancing BST that maintains O(log n) height by rotating nodes after each insertion or deletion.",
  },
  {
    id: "btree",
    name: "B Tree",
    short: "B",
    category: "Tree",
    description:
      "A self-balancing multi-way search tree designed for disk-based storage with variable numbers of children per node.",
  },
  {
    id: "bplus",
    name: "B+ Tree",
    short: "B+",
    category: "Tree",
    description:
      "A multi-level indexed tree where all values reside in leaf nodes linked for efficient range queries.",
  },
  {
    id: "segment",
    name: "Segment Tree",
    short: "SEG",
    category: "Tree",
    description:
      "A tree built over an array that answers range queries and point updates in O(log n) time.",
  },
  {
    id: "fenwick",
    name: "Fenwick Tree",
    short: "BIT",
    category: "Tree",
    description:
      "A compact binary-indexed structure supporting prefix sum queries and updates in O(log n) space.",
  },
  {
    id: "bfs-traversal",
    name: "BFS: Traversal",
    short: "BFS",
    category: "Graph",
    description:
      "Explores a graph level by level using a queue, visiting all neighbors before going deeper.",
  },
  {
    id: "bfs-goal",
    name: "BFS: Goal Search",
    short: "BFS",
    category: "Graph",
    description:
      "Uses breadth-first expansion to find the shortest unweighted path between a source and target node.",
  },
  {
    id: "dfs-traversal",
    name: "DFS: Traversal",
    short: "DFS",
    category: "Graph",
    description:
      "Explores as deep as possible along each branch using a stack before backtracking.",
  },
  {
    id: "dfs-goal",
    name: "DFS: Goal Search",
    short: "DFS",
    category: "Graph",
    description:
      "Applies depth-first exploration to locate a target node, useful for maze and puzzle solving.",
  },
  {
    id: "prims",
    name: "Prim's Algorithm",
    short: "MST",
    category: "Graph",
    description:
      "Greedily builds a minimum spanning tree by always adding the lowest-weight edge connecting the visited set.",
  },
  {
    id: "kruskal",
    name: "Kruskal's Algorithm",
    short: "MST",
    category: "Graph",
    description:
      "Builds a minimum spanning tree by sorting all edges by weight and adding them greedily using a union-find structure.",
  },
];

const CATEGORY_COLORS = {
  Tree: "tag-tree",
  Graph: "tag-graph",
};

// SVG Icons
function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function NodeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <line x1="12" y1="7.5" x2="5" y2="16.5" />
      <line x1="12" y1="7.5" x2="19" y2="16.5" />
    </svg>
  );
}

function AlgoCard({ algo, onClick }) {
  return (
    <div
      className={`algo-card ${CATEGORY_COLORS[algo.category]}`}
      onClick={() => onClick(algo)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(algo)}
      aria-label={`Open ${algo.name} visualizer`}
    >
      <div className="card-header">
        <span className="card-badge">{algo.short}</span>
        <span className={`card-tag ${CATEGORY_COLORS[algo.category]}`}>{algo.category}</span>
      </div>
      <h3 className="card-title">{algo.name}</h3>
      <p className="card-desc">{algo.description}</p>
      <div className="card-footer">
        <span className="card-cta">Visualize →</span>
      </div>
    </div>
  );
}

function Workspace({ algo, onBack }) {
  return (
    <div className="workspace">
      <div className="workspace-topbar">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft />
          Back to Dashboard
        </button>
        <div className="workspace-meta">
          <span className={`card-tag ${CATEGORY_COLORS[algo.category]}`}>{algo.category}</span>
        </div>
      </div>

      <div className="workspace-header">
        <div className="workspace-icon">
          <NodeIcon />
        </div>
        <div>
          <h1 className="workspace-title">{algo.name}</h1>
          <p className="workspace-subtitle">{algo.description}</p>
        </div>
      </div>

      <div className="viz-container">
        <div className="viz-placeholder">
          <div className="viz-placeholder-inner">
            <div className="viz-grid-bg" aria-hidden="true" />
            <div className="viz-placeholder-content">
              <div className="viz-icon-wrap">
                <NodeIcon />
              </div>
              <p className="viz-label">Visualization canvas</p>
              <p className="viz-sublabel">
                Drop your <code>{algo.name}</code> logic here
              </p>
            </div>
          </div>
        </div>

        <div className="viz-controls-placeholder">
          <div className="control-block">
            <div className="control-label">Controls</div>
            <div className="control-row">
              <div className="control-pill" />
              <div className="control-pill short" />
              <div className="control-pill" />
            </div>
          </div>
          <div className="control-block">
            <div className="control-label">Input</div>
            <div className="control-input-mock" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ darkMode, setDarkMode }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <div className="app-shell">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} minimal />
        <main className="main-content">
          <Workspace algo={selected} onBack={() => setSelected(null)} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="main-content">
        <section className="dashboard-hero">
          <h1 className="hero-title">
            Explore & Visualize <br />
            <span className="hero-accent">Data Structures</span>
          </h1>
          <p className="hero-subtitle">
            Select an algorithm below to open its interactive visualizer workspace.
          </p>
        </section>

        <div className="filter-row">
          {/*span className="filter-count">Algorithm Library</span>*/}
          <div className="hero-eyebrow">
            <GridIcon />
            <span>Algorithm Library</span>
          </div>
          <div className="filter-tags">
            <span className="filter-chip active">All</span>
            <span className="filter-chip tag-tree">Trees</span>
            <span className="filter-chip tag-graph">Graphs</span>
          </div>
        </div>

        <div className="algo-grid">
          {ALGORITHMS.map((algo) => (
            <AlgoCard key={algo.id} algo={algo} onClick={setSelected} />
          ))}
        </div>
      </main>
      <footer className="app-footer">
        <span>AlgoStructure</span>
        <span className="footer-sep">·</span>
        <span>Interactive DSA Visualizer</span>
      </footer>
    </div>
  );
}

function Header({ darkMode, setDarkMode, minimal }) {
  return (
    <header className={`app-header${minimal ? " header-minimal" : ""}`}>
      <div className="header-spacer" />
      <span className="logo-name logo-center">AlgoStructure</span>
      <button
        className="theme-toggle"
        onClick={() => setDarkMode((d) => !d)}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="toggle-icon">{darkMode ? <SunIcon /> : <MoonIcon />}</span>
        <span className="toggle-label">{darkMode ? "Light" : "Dark"}</span>
      </button>
    </header>
  );
}
