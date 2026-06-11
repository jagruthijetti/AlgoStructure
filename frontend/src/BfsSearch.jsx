import React, { useState, useEffect, useRef } from 'react';

// Shared locally inside files as an internal routing schema
function PanelTabs({ activeTab, setActiveTab }) {
  return (
    <div className="tab-container" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
      <button className={`btn ${activeTab === 'visualization' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={() => setActiveTab('visualization')}>Visualization</button>
      <button className={`btn ${activeTab === 'analysis' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={() => setActiveTab('analysis')}>Structural Analysis</button>
      <button className={`btn ${activeTab === 'performance' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={() => setActiveTab('performance')}>Performance Statistics</button>
    </div>
  );
}

// ==========================================================================
// GEOMETRIC COORDINATES & BASE PREDEFINED MAP BLUEPRINTS
// ==========================================================================
const PREDEFINED_NODES = [
  { id: 'A', label: 'A', x: 300, y: 60 },
  { id: 'B', label: 'B', x: 180, y: 160 },
  { id: 'C', label: 'C', x: 420, y: 160 },
  { id: 'D', label: 'D', x: 100, y: 280 },
  { id: 'E', label: 'E', x: 260, y: 280 },
  { id: 'F', label: 'F', x: 500, y: 280 }
];

const PREDEFINED_EDGES = [
  { u: 'A', v: 'B' },
  { u: 'A', v: 'C' },
  { u: 'B', v: 'D' },
  { u: 'B', v: 'E' },
  { u: 'C', v: 'F' }
];

// Structural sector slots for random graphs to prevent geometric node overlaps
const FIXED_LAYOUT_SECTORS = [
  { x: 300, y: 60 },  // Tier 1 (Root level)
  { x: 160, y: 150 }, // Tier 2 Left
  { x: 440, y: 150 }, // Tier 2 Right
  { x: 100, y: 270 }, // Tier 3 far-left
  { x: 240, y: 270 }, // Tier 3 mid-left
  { x: 500, y: 270 }  // Tier 3 far-right
];

function generateRandomBFSGraph() {
  const numNodes = Math.floor(Math.random() * 2) + 5; // Generates a clean 5 or 6 node network map
  const nodes = Array.from({ length: numNodes }, (_, i) => {
    const label = String.fromCharCode(65 + i);
    return { id: label, label, x: FIXED_LAYOUT_SECTORS[i].x, y: FIXED_LAYOUT_SECTORS[i].y };
  });

  const edges = [];
  const edgeTracker = new Set();

  // Establish a baseline incremental tree spine to prevent dead isolated components
  for (let i = 1; i < numNodes; i++) {
    const parentIdx = Math.floor(Math.random() * i);
    const u = nodes[parentIdx].id;
    const v = nodes[i].id;
    edges.push({ u, v });
    edgeTracker.add(`${u}-${v}`);
  }

  // Inject secondary shortcut mesh paths to create a true graph landscape for BFS layers
  let extraCount = 0;
  while (extraCount < 2) {
    const idxA = Math.floor(Math.random() * numNodes);
    const idxB = Math.floor(Math.random() * numNodes);
    if (idxA === idxB) continue;

    const u = nodes[Math.min(idxA, idxB)].id;
    const v = nodes[Math.max(idxA, idxB)].id;
    const key = `${u}-${v}`;

    if (!edgeTracker.has(key)) {
      edges.push({ u, v });
      edgeTracker.add(key);
      extraCount++;
    }
  }

  return { nodes, edges };
}

// ==========================================================================
// CORE PLATFORM WORKSPACE COMPONENT
// ==========================================================================
export default function BfsSearchVisualizer() {
  const [activeTab, setActiveTab] = useState('visualization');
  const [graphMode, setGraphMode] = useState('predefined');
  const [graph, setGraph] = useState({ nodes: PREDEFINED_NODES, edges: PREDEFINED_EDGES });

  // Source, Goal Routing Configurations
  const [sourceNode, setSourceNode] = useState('A');
  const [goalNode, setGoalNode] = useState('E');

  // Animation Engine States
  const [visited, setVisited] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [log, setLog] = useState('Declare search properties.');
  const [hasFinished, setHasFinished] = useState(false);

  const searchIntervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(searchIntervalRef.current);
  }, []);

  const handleModeChange = (mode) => {
    setGraphMode(mode);
    clearInterval(searchIntervalRef.current);
    setIsSearching(false);
    setVisited([]);
    setCurrentNode(null);
    setQueue([]);
    setHasFinished(false);

    if (mode === 'predefined') {
      setGraph({ nodes: PREDEFINED_NODES, edges: PREDEFINED_EDGES });
      setSourceNode('A');
      setGoalNode('E');
      setLog('Restored standard predefined hierarchical tree graph.');
    } else {
      const randomG = generateRandomBFSGraph();
      setGraph(randomG);
      const firstLabel = randomG.nodes[0].id;
      const lastLabel = randomG.nodes[randomG.nodes.length - 1].id;
      setSourceNode(firstLabel);
      setGoalNode(lastLabel);
      setLog(`Generated connected random mesh. Source [${firstLabel}] to Goal [${lastLabel}] ready.`);
    }
  };

  const handleRandomize = () => {
    const randomG = generateRandomBFSGraph();
    clearInterval(searchIntervalRef.current);
    setIsSearching(false);
    setVisited([]);
    setCurrentNode(null);
    setQueue([]);
    setHasFinished(false);
    setGraph(randomG);
    
    const firstLabel = randomG.nodes[0].id;
    const lastLabel = randomG.nodes[randomG.nodes.length - 1].id;
    setSourceNode(firstLabel);
    setGoalNode(lastLabel);
    setLog('Regenerated alternative random topology parameters.');
  };

  const runBFSSearch = () => {
    const validIds = graph.nodes.map(n => n.id);
    if (!validIds.includes(sourceNode)) {
      setLog(`ERROR: Source vertex [${sourceNode}] is missing from this graph layout.`);
      return;
    }
    if (!validIds.includes(goalNode)) {
      setLog(`ERROR: Goal vertex [${goalNode}] is missing from this graph layout.`);
      return;
    }

    clearInterval(searchIntervalRef.current);
    setVisited([]);
    setCurrentNode(null);
    setHasFinished(false);
    setIsSearching(true);
    setLog(`Initializing Breadth-First Search queue sequences from source [${sourceNode}]...`);

    // Build standard bi-directional adjacency collection tracking list
    const adjList = {};
    graph.nodes.forEach(n => { adjList[n.id] = []; });
    graph.edges.forEach(e => {
      adjList[e.u].push(e.v);
      adjList[e.v].push(e.u);
    });

    let localQueue = [sourceNode];
    let localVisited = [sourceNode]; // BFS marks items visited at discovery/enqueue phase

    setQueue([...localQueue]);
    setVisited([...localVisited]);

    searchIntervalRef.current = setInterval(() => {
      if (localQueue.length === 0) {
        setLog(`BFS termination loop. Queue empty. Goal node [${goalNode}] is unreachable from [${sourceNode}].`);
        setIsSearching(false);
        setCurrentNode(null);
        setHasFinished(true);
        clearInterval(searchIntervalRef.current);
        return;
      }

      // Pop from front of linear container (First-In, First-Out)
      let curr = localQueue.shift();
      setCurrentNode(curr);

      if (curr === goalNode) {
        setLog(`🎯 TARGET FOUND! Breadth-First exploration successfully locked onto Node [${curr}].`);
        setIsSearching(false);
        setHasFinished(true);
        setQueue([...localQueue]);
        clearInterval(searchIntervalRef.current);
        return;
      }

      setLog(`Evaluating Node [${curr}]. Scanning for immediate level neighbors.`);

      const neighbors = adjList[curr] || [];
      neighbors.forEach(n => {
        if (!localVisited.includes(n)) {
          localVisited.push(n);
          localQueue.push(n);
        }
      });

      setVisited([...localVisited]);
      setQueue([...localQueue]);
    }, 1200);
  };

  const pauseSearch = () => {
    clearInterval(searchIntervalRef.current);
    setIsSearching(false);
    setLog('Algorithm runtime execution paused.');
  };

  const resetSimulation = () => {
    clearInterval(searchIntervalRef.current);
    setIsSearching(false);
    setVisited([]);
    setCurrentNode(null);
    setQueue([]);
    setHasFinished(false);
    setLog('System buffers flushed. Visualization coordinates reset.');
  };

  return (
    <div className="algo-container" style={{ paddingBottom: '2rem' }}>
      <PanelTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* GRAPH MODE NAVIGATION SELECT BAR */}
      <div className="control-row" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', background: '#111726', border: '1px solid #1e293b', borderRadius: '0.5rem', marginBottom: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: '#1e293b', padding: '0.2rem', borderRadius: '0.375rem', border: '1px solid #334155' }}>
          <button 
            className="btn" 
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: graphMode === 'predefined' ? '#6366f1' : 'transparent', color: '#fff' }}
            onClick={() => handleModeChange('predefined')}
          >
            Predefined Graph
          </button>
          <button 
            className="btn" 
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: graphMode === 'random' ? '#6366f1' : 'transparent', color: '#fff' }}
            onClick={() => handleModeChange('random')}
          >
            Random Graph Mode
          </button>
        </div>

        {graphMode === 'random' && (
          <button className="btn btn-secondary" onClick={handleRandomize} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Generate Next Graph
          </button>
        )}
      </div>

      {/* ==========================================
         PANEL 1: ACTIVE CANVAS GRAPH VIEW
         ========================================== */}
      {activeTab === 'visualization' && (
        <div className="panel-content">
          
          {/* CONTROL PARAMETERS ROW FOR SOURCE & GOAL INDICES */}
          <div className="control-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center', padding: '0.75rem', background: '#1e293b', borderRadius: '0.375rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Source Node:</span>
              <input 
                type="text" 
                maxLength="1" 
                style={{ width: '40px', textAlign: 'center', background: '#0b0f19', color: '#fff', border: '1px solid #475569', borderRadius: '0.25rem', padding: '0.2rem', fontWeight: 'bold' }} 
                value={sourceNode} 
                onChange={(e) => setSourceNode(e.target.value.toUpperCase())} 
                disabled={isSearching}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Goal Target:</span>
              <input 
                type="text" 
                maxLength="1" 
                style={{ width: '40px', textAlign: 'center', background: '#0b0f19', color: '#fff', border: '1px solid #475569', borderRadius: '0.25rem', padding: '0.2rem', fontWeight: 'bold' }} 
                value={goalNode} 
                onChange={(e) => setGoalNode(e.target.value.toUpperCase())} 
                disabled={isSearching}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
              {!isSearching ? (
                <button className="btn btn-primary" onClick={runBFSSearch} disabled={hasFinished}>Run BFS Search</button>
              ) : (
                <button className="btn" style={{ background: '#f59e0b', color: '#fff' }} onClick={pauseSearch}>Pause</button>
              )}
              <button className="btn btn-danger" onClick={resetSimulation}>Reset</button>
            </div>
          </div>

          {/* REAL-TIME HORIZONTAL DISCOVERY QUEUE METRIC LINEAR DISPLAY BAR */}
          <div className="tracking-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#111726', padding: '0.6rem 1rem', border: '1px solid #1e293b', borderRadius: '0.375rem', marginBottom: '0.75rem' }}>
            <span className="tracking-bar-title" style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Active Queue (FIFO Core Array Window):</span>
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
              {queue.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>Queue completely empty</span>
              ) : (
                queue.map((item, idx) => (
                  <span key={idx} className="tracking-item" style={{ padding: '0.15rem 0.5rem', background: idx === 0 ? '#6366f1' : '#f59e0b', color: '#fff', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {idx === 0 && 'FRONT: '} {item}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* TWO COLUMN WORKSPACE GRAPH AND PROGRESS OVERLAYS */}
          <div className="canvas-wrapper" style={{ position: 'relative', background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '0.5rem' }}>
            <svg width="100%" height="360" style={{ background: 'transparent' }}>
              {/* Render Connecting Pathway Vectors */}
              {graph.edges.map((e, idx) => {
                const fromNode = graph.nodes.find(n => n.id === e.u);
                const toNode = graph.nodes.find(n => n.id === e.v);
                if (!fromNode || !toNode) return null;

                const pathDiscovered = visited.includes(e.u) && visited.includes(e.v);

                return (
                  <line 
                    key={idx} 
                    x1={fromNode.x} y1={fromNode.y} 
                    x2={toNode.x} y2={toNode.y} 
                    stroke={pathDiscovered ? '#10b981' : '#334155'} 
                    strokeWidth={pathDiscovered ? 3.5 : 1.75}
                    style={{ transition: 'all 0.25s ease' }}
                  />
                );
              })}

              {/* Render Circle Node Elements */}
              {graph.nodes.map((node) => {
                const isCurrent = currentNode === node.id;
                const isDiscovered = visited.includes(node.id);
                const isGoal = goalNode === node.id;

                let fillBg = '#1e293b';
                let strokeColor = '#6366f1';

                if (isDiscovered) { strokeColor = '#10b981'; }
                if (isCurrent) { fillBg = '#6366f1'; strokeColor = '#fff'; }
                if (isGoal && !isCurrent) { strokeColor = '#f59e0b'; }

                return (
                  <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                    <circle 
                      r="19" 
                      fill={fillBg} 
                      stroke={strokeColor} 
                      strokeWidth={isCurrent ? "4" : isGoal ? "3.5" : "2.5"} 
                      style={{ transition: 'all 0.2s ease' }}
                    />
                    <text fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" dy="4">
                      {node.label}
                    </text>
                    {isGoal && (
                      <text fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle" dy="-25" style={{ letterSpacing: '0.05em' }}>GOAL TARGET</text>
                    )}
                  </g>
                );
              })}
            </svg>
            <div className="log-overlay" style={{ background: 'rgba(15, 23, 42, 0.95)', color: '#fff', borderLeft: currentNode ? '4px solid #6366f1' : '1px solid #1e293b' }}>{log}</div>
          </div>

        </div>
      )}

      {/* ==========================================
         PANEL 2: STRUCTURAL COMPONENT ANALYSIS
         ========================================== */}
      {activeTab === 'analysis' && (
        <div className="panel-content" style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.5rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#6366f1', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Discovery Boundary Resolution Mapping
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Discovered/Enqueued Node Set Tracking Trace:</p>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>
                {visited.length} <span style={{ fontSize: '1rem', color: '#475569', fontWeight: 'normal' }}>/ {graph.nodes.length} Vertices Explored</span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {visited.length === 0 ? (
                  <span style={{ fontStyle: 'italic', color: '#475569', fontSize: '0.8rem' }}>No discovery vectors activated yet.</span>
                ) : (
                  visited.map((v, i) => (
                    <span key={i} style={{ padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.75rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                      Node {v}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Shortest-Path Traversal Characteristics:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#fff' }}>
                <div style={{ padding: '0.5rem', background: '#1e293b', borderRadius: '0.25rem' }}>
                  <strong>Layer-By-Layer Exploration:</strong> BFS inspects all nodes at distance $d$ before moving to nodes at distance $d+1$.
                </div>
                <div style={{ padding: '0.5rem', background: '#1e293b', borderRadius: '0.25rem' }}>
                  <strong>Optimality Guarantee:</strong> For unweighted networks, the first time a target vertex is enqueued, the discovery route is mathematically guaranteed to be the shortest path.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         PANEL 3: PERFORMANCE STATISTICS
         ========================================== */}
      {activeTab === 'performance' && (
        <div className="panel-content" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '0.5rem' }}>
          
          {/* Topology Footprint Metric Box */}
          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Graph Network Density</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', margin: '0.25rem 0' }}>
              V: {graph.nodes.length} | E: {graph.edges.length}
            </div>
            <div style={{ color: '#475569', fontSize: '0.7rem' }}>Asymptotic ratios compute directly against active workspace boundaries.</div>
          </div>

          {/* Complexity Box */}
          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#a855f7', marginBottom: '0.5rem' }}>BFS Complexity Bounds</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: '1.4' }}>
              Breadth-First Search systematically flattens levels using an internal FIFO queue architecture. In the absolute worst case, every single vertex and connecting edge is traversed.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#1e293b', padding: '0.6rem 1rem', borderRadius: '0.375rem', border: '1px solid #334155' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Time Complexity</span>
                <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff' }}>O(V + E)</span>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#334155' }} />
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Space Complexity</span>
                <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff' }}>O(V)</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}