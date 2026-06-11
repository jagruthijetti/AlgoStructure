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
// CONSTANTS & HELPER MAPS FOR CORE PREDEFINED LAYOUT
// ==========================================================================
const PREDEFINED_NODES = [
  { id: 'A', label: 'A', x: 100, y: 150 },
  { id: 'B', label: 'B', x: 250, y: 80 },
  { id: 'C', label: 'C', x: 250, y: 220 },
  { id: 'D', label: 'D', x: 450, y: 150 }
];

const PREDEFINED_EDGES = [
  { u: 'A', v: 'B' },
  { u: 'A', v: 'C' },
  { u: 'B', v: 'D' }
];

// Pre-calculated geometric vectors for the random generator coordinates
const FIXED_LAYOUT_SECTORS = [
  { x: 100, y: 150 }, // Node A
  { x: 240, y: 70 },  // Node B
  { x: 240, y: 230 }, // Node C
  { x: 380, y: 70 },  // Node D
  { x: 380, y: 230 }, // Node E
  { x: 500, y: 150 }  // Node F
];

function generateRandomDFSGraph() {
  const numNodes = Math.floor(Math.random() * 2) + 5; // Generates 5 or 6 node network maps
  const nodes = Array.from({ length: numNodes }, (_, i) => {
    const label = String.fromCharCode(65 + i);
    return { id: label, label, x: FIXED_LAYOUT_SECTORS[i].x, y: FIXED_LAYOUT_SECTORS[i].y };
  });

  const edges = [];
  const edgeTracker = new Set();

  // Create a continuous spanning baseline path structure to guarantee traversability
  for (let i = 1; i < numNodes; i++) {
    const prevNode = nodes[i - 1];
    const currNode = nodes[i];
    edges.push({ u: prevNode.id, v: currNode.id });
    edgeTracker.add(`${prevNode.id}-${currNode.id}`);
  }

  // Inject 2 or 3 secondary bypass branches to allow backtracks and alternative branching paths
  let extraCount = 0;
  while (extraCount < 3) {
    const idxA = Math.floor(Math.random() * numNodes);
    const idxB = Math.floor(Math.random() * numNodes);
    
    if (idxA === idxB) continue;
    
    // Enforce lower-to-higher index progression to create neat directional/acyclic graphs
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
// CORE ENGINE PLATFORM COMPONENT
// ==========================================================================
export default function DfsSearchVisualizer() {
  const [activeTab, setActiveTab] = useState('visualization');
  const [graphMode, setGraphMode] = useState('predefined');
  const [graph, setGraph] = useState({ nodes: PREDEFINED_NODES, edges: PREDEFINED_EDGES });

  // Inputs for runtime search configs
  const [sourceNode, setSourceNode] = useState('A');
  const [goalNode, setGoalNode] = useState('D');

  // Animation Traversal Control States
  const [visited, setVisited] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [searchStack, setSearchStack] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [log, setLog] = useState('Ready for target goal state lookups.');
  const [hasFinished, setHasFinished] = useState(false);

  const searchIntervalRef = useRef(null);

  // Clean interval hooks on sudden structural shifts
  useEffect(() => {
    return () => clearInterval(searchIntervalRef.current);
  }, []);

  const handleModeChange = (mode) => {
    setGraphMode(mode);
    clearInterval(searchIntervalRef.current);
    setIsSearching(false);
    setVisited([]);
    setCurrentNode(null);
    setSearchStack([]);
    setHasFinished(false);

    if (mode === 'predefined') {
      setGraph({ nodes: PREDEFINED_NODES, edges: PREDEFINED_EDGES });
      setSourceNode('A');
      setGoalNode('D');
      setLog('Restored original predefined 4-node structural model.');
    } else {
      const randomG = generateRandomDFSGraph();
      setGraph(randomG);
      const firstLabel = randomG.nodes[0].id;
      const lastLabel = randomG.nodes[randomG.nodes.length - 1].id;
      setSourceNode(firstLabel);
      setGoalNode(lastLabel);
      setLog(`Generated random ${randomG.nodes.length}-node network chart. Source [${firstLabel}] to Goal [${lastLabel}] ready.`);
    }
  };

  const handleRandomize = () => {
    const randomG = generateRandomDFSGraph();
    setGraph(randomG);
    clearInterval(searchIntervalRef.current);
    setIsSearching(false);
    setVisited([]);
    setCurrentNode(null);
    setSearchStack([]);
    setHasFinished(false);

    const firstLabel = randomG.nodes[0].id;
    const lastLabel = randomG.nodes[randomG.nodes.length - 1].id;
    setSourceNode(firstLabel);
    setGoalNode(lastLabel);
    setLog(`Regenerated random graph sequence matrix setup.`);
  };

  // Pre-flight checks to ensure input source and goal items are valid graph labels
  const validateInputs = () => {
    const validIds = graph.nodes.map(n => n.id);
    if (!validIds.includes(sourceNode)) {
      setLog(`ERROR: Source node [${sourceNode}] is missing from this graph.`);
      return false;
    }
    if (!validIds.includes(goalNode)) {
      setLog(`ERROR: Goal node [${goalNode}] is missing from this graph.`);
      return false;
    }
    return true;
  };

  const startDFS = () => {
    if (!validateInputs()) return;

    clearInterval(searchIntervalRef.current);
    setVisited([]);
    setCurrentNode(null);
    setHasFinished(false);
    setIsSearching(true);
    setLog(`Initializing Depth-First Search runtime. Stack seeded with source node [${sourceNode}].`);

    // Build adjacency list for efficient neighbors evaluation mapping lookup
    const adjList = {};
    graph.nodes.forEach(n => { adjList[n.id] = []; });
    graph.edges.forEach(e => {
      adjList[e.u].push(e.v);
      adjList[e.v].push(e.u); // Treat it as an undirected matrix graph
    });

    let localStack = [sourceNode];
    let localVisited = [];

    setSearchStack([...localStack]);

    searchIntervalRef.current = setInterval(() => {
      if (localStack.length === 0) {
        setLog(`DFS execution complete. Stack exhausted. Target Goal [${goalNode}] was not reachable.`);
        setIsSearching(false);
        setCurrentNode(null);
        setHasFinished(true);
        clearInterval(searchIntervalRef.current);
        return;
      }

      // Pop node from top of the stack
      let curr = localStack.pop();
      setCurrentNode(curr);

      if (!localVisited.includes(curr)) {
        localVisited.push(curr);
        setVisited([...localVisited]);

        if (curr === goalNode) {
          setLog(`🎯 MATCH FOUND! Target node [${curr}] successfully hit and discovered.`);
          setIsSearching(false);
          setHasFinished(true);
          setSearchStack([...localStack]);
          clearInterval(searchIntervalRef.current);
          return;
        }

        setLog(`Inspecting Node [${curr}]. Extracting unvisited neighbors into trace stack logs.`);

        // Gather and filter adjacent neighbors
        const neighbors = adjList[curr] || [];
        neighbors.forEach(neighbor => {
          if (!localVisited.includes(neighbor) && !localStack.includes(neighbor)) {
            localStack.push(neighbor);
          }
        });
      } else {
        setLog(`Node [${curr}] already accounted for in visited arrays. Skipping...`);
      }

      setSearchStack([...localStack]);
    }, 1200);
  };

  const stopSearch = () => {
    clearInterval(searchIntervalRef.current);
    setIsSearching(false);
    setLog(`Simulation execution paused manually by user.`);
  };

  const resetAll = () => {
    clearInterval(searchIntervalRef.current);
    setIsSearching(false);
    setVisited([]);
    setCurrentNode(null);
    setSearchStack([]);
    setHasFinished(false);
    setLog(`Visualization parameters flushed. System cleared.`);
  };

  return (
    <div className="algo-container" style={{ paddingBottom: '2rem' }}>
      <PanelTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* TOP TOGGLE SELECTION COMPONENT WORKSPACE */}
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
         PANEL 1: MAIN TRAVERSAL SCREEN WORKSPACE
         ========================================== */}
      {activeTab === 'visualization' && (
        <div className="panel-content">
          
          {/* RUNTIME SOURCE, GOAL CONFIG INPUT ROW */}
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
                <button className="btn btn-primary" onClick={startDFS} disabled={hasFinished}>Deep Search</button>
              ) : (
                <button className="btn" style={{ background: '#f59e0b', color: '#fff' }} onClick={stopSearch}>Pause</button>
              )}
              <button className="btn btn-danger" onClick={resetAll}>Reset</button>
            </div>
          </div>

          {/* TWO COLUMN CANVAS & INTERACTIVE REGISTRY MATRIX LAYOUT */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
            
            {/* Visual Vector Canvas Frame */}
            <div className="canvas-wrapper" style={{ position: 'relative', background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '0.5rem', minHeight: '360px' }}>
              <svg width="100%" height="360" style={{ background: 'transparent' }}>
                {/* Render Connective Path Vectors */}
                {graph.edges.map((e, idx) => {
                  const fromNode = graph.nodes.find(n => n.id === e.u);
                  const toNode = graph.nodes.find(n => n.id === e.v);
                  if (!fromNode || !toNode) return null;

                  // Edge is highlighted if both endpoints have been explored
                  const pathTraversed = visited.includes(e.u) && visited.includes(e.v);

                  return (
                    <line 
                      key={idx} 
                      x1={fromNode.x} y1={fromNode.y} 
                      x2={toNode.x} y2={toNode.y} 
                      stroke={pathTraversed ? '#10b981' : '#334155'} 
                      strokeWidth={pathTraversed ? 3.5 : 1.75} 
                      style={{ transition: 'all 0.25s ease' }}
                    />
                  );
                })}

                {/* Render Processing Node Vertices */}
                {graph.nodes.map((node) => {
                  const isCurrent = currentNode === node.id;
                  const isVisited = visited.includes(node.id);
                  const isGoal = goalNode === node.id;

                  let nodeColor = '#1e293b'; 
                  let borderColor = '#6366f1'; 

                  if (isVisited) { borderColor = '#10b981'; }
                  if (isCurrent) { nodeColor = '#6366f1'; borderColor = '#fff'; }
                  if (isGoal && !isCurrent) { borderColor = '#f59e0b'; }

                  return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                      <circle 
                        r="18" 
                        fill={nodeColor} 
                        stroke={borderColor} 
                        strokeWidth={isCurrent ? "4" : isGoal ? "3" : "2.5"} 
                        style={{ transition: 'all 0.2s ease' }}
                      />
                      <text fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" dy="4">
                        {node.label}
                      </text>
                      {isGoal && (
                        <text fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle" dy="-24">GOAL</text>
                      )}
                    </g>
                  );
                })}
              </svg>

              <div className="log-overlay" style={{ background: 'rgba(15, 23, 42, 0.95)', color: '#fff', borderLeft: currentNode ? '4px solid #6366f1' : '1px solid #1e293b' }}>
                {log}
              </div>
            </div>

            {/* Right Side Stack Frame Execution Display */}
            <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                LIFO Trace Stack
              </h4>
              <p style={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: '1.3', marginBottom: '1rem' }}>
                Tracks the Deep Search execution path. The top element is popped next (Last-In, First-Out).
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '0.35rem', overflowY: 'auto', flexGrow: 1, maxHeight: '220px' }}>
                {searchStack.length === 0 ? (
                  <div style={{ fontSize: '0.7rem', color: '#475569', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>Stack Empty</div>
                ) : (
                  searchStack.map((item, idx) => (
                    <div key={idx} style={{ padding: '0.4rem', textAnchor: 'middle', background: idx === searchStack.length - 1 ? 'rgba(99, 102, 241, 0.2)' : '#1e293b', border: idx === searchStack.length - 1 ? '1px solid #6366f1' : '1px solid #334155', borderRadius: '0.25rem', textCenter: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
                      Node {item} {idx === searchStack.length - 1 && '← TOP'}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
         PANEL 2: STRUCTURAL ANALYSIS PANEL
         ========================================== */}
      {activeTab === 'analysis' && (
        <div className="panel-content" style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.5rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#6366f1', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Exploration Resolution Metrics
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Visited Vector Array Trace Registry:</p>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>
                {visited.length} <span style={{ fontSize: '1rem', color: '#475569', fontWeight: 'normal' }}>/ {graph.nodes.length} Closed Set Nodes</span>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {visited.length === 0 ? (
                  <span style={{ fontStyle: 'italic', color: '#475569', fontSize: '0.8rem' }}>No trace operations run yet.</span>
                ) : (
                  visited.map((v, idx) => (
                    <span key={idx} style={{ padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.75rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                      {idx + 1}. Node {v}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Topology Mapping Properties:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ padding: '0.5rem', background: '#1e293b', borderRadius: '0.25rem', color: '#fff' }}>
                  <strong>Source-Target Distance Path Bounds:</strong> Unweighted graph analysis. DFS identifies paths, but does not guarantee the absolute shortest route like BFS.
                </div>
                <div style={{ padding: '0.5rem', background: '#1e293b', borderRadius: '0.25rem', color: '#fff' }}>
                  <strong>Connectivity Architecture:</strong> Directed acyclic sequential pipeline properties.
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
          
          {/* Node Graph Structural Count Meta Card */}
          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Graph Network Density</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', margin: '0.25rem 0' }}>
              V: {graph.nodes.length} | E: {graph.edges.length}
            </div>
            <div style={{ color: '#475569', fontSize: '0.7rem' }}>Total active node arrays alongside connecting route parameters inside workspace.</div>
          </div>

          {/* Theoretical Big-O Card */}
          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#a855f7', marginBottom: '0.5rem' }}>DFS Complexity Analysis</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: '1.4' }}>
              Depth-First Search utilizes an explicit or implicit function call stack to probe as deep as possible down each structural branch sequence before backtracking.
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