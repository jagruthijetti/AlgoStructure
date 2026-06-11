import React, { useState } from 'react';

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
// STATIC CONSTANTS FOR PREDEFINED CORE LAYOUT
// ==========================================================================
const PREDEFINED_NODES = [
  { id: 'A', label: 'A', x: 150, y: 90 },
  { id: 'B', label: 'B', x: 450, y: 90 },
  { id: 'C', label: 'C', x: 150, y: 260 },
  { id: 'D', label: 'D', x: 450, y: 260 }
];

const PREDEFINED_EDGES = [
  { u: 'A', v: 'B', w: 2 },
  { u: 'A', v: 'C', w: 4 },
  { u: 'B', v: 'C', w: 1 },
  { u: 'B', v: 'D', w: 7 },
  { u: 'C', v: 'D', w: 3 }
];

// Pre-calculated geometric vectors for up to 6 nodes to keep canvas clean
const FIXED_LAYOUT_SECTORS = [
  { x: 130, y: 80 },  // Node A
  { x: 300, y: 70 },  // Node B
  { x: 470, y: 100 }, // Node C
  { x: 150, y: 250 }, // Node D
  { x: 320, y: 270 }, // Node E
  { x: 490, y: 240 }  // Node F
];

function generateRandomPrimGraph() {
  const numNodes = Math.floor(Math.random() * 2) + 5; // Generates 5 or 6 node architectures dynamically
  const nodes = Array.from({ length: numNodes }, (_, i) => {
    const label = String.fromCharCode(65 + i);
    return {
      id: label,
      label: label,
      x: FIXED_LAYOUT_SECTORS[i].x,
      y: FIXED_LAYOUT_SECTORS[i].y
    };
  });

  const edges = [];
  const edgeTracker = new Set();

  // Baseline cohesive alignment array path connection sequence to prevent dead islands
  for (let i = 1; i < numNodes; i++) {
    const prevNode = nodes[Math.floor(Math.random() * i)];
    const currNode = nodes[i];
    const weight = Math.floor(Math.random() * 9) + 1; // Weights 1-9
    
    edges.push({ u: prevNode.id, v: currNode.id, w: weight });
    edgeTracker.add(`${prevNode.id}-${currNode.id}`);
  }

  // Inject 2 or 3 additional secondary edges to enrich routing pathways
  let extraCount = 0;
  while (extraCount < 3) {
    const nodeA = nodes[Math.floor(Math.random() * numNodes)].id;
    const nodeB = nodes[Math.floor(Math.random() * numNodes)].id;
    
    if (nodeA === nodeB) continue;
    const minStr = nodeA < nodeB ? `${nodeA}-${nodeB}` : `${nodeB}-${nodeA}`;
    
    if (!edgeTracker.has(minStr)) {
      const weight = Math.floor(Math.random() * 9) + 1;
      edges.push({ u: nodeA, v: nodeB, w: weight });
      edgeTracker.add(minStr);
      extraCount++;
    }
  }

  return { nodes, edges };
}

// ==========================================================================
// CORE COMPONENT platform WORKSPACE
// ==========================================================================
export default function PrimsVisualizer() {
  const [activeTab, setActiveTab] = useState('visualization');
  const [graphMode, setGraphMode] = useState('predefined'); // predefined or random
  
  // Data State Holders
  const [graph, setGraph] = useState({ nodes: PREDEFINED_NODES, edges: PREDEFINED_EDGES });
  const [mstEdges, setMstEdges] = useState([]);
  const [visited, setVisited] = useState(['A']);
  const [log, setLog] = useState("Prim's initialization phase. Seed vertex node [A] selected as base root anchor.");

  const handleModeChange = (mode) => {
    setGraphMode(mode);
    setMstEdges([]);
    if (mode === 'predefined') {
      setGraph({ nodes: PREDEFINED_NODES, edges: PREDEFINED_EDGES });
      setVisited(['A']);
      setLog("Restored standard predefined 4-node structural chart graph.");
    } else {
      const randomG = generateRandomPrimGraph();
      setGraph(randomG);
      setVisited([randomG.nodes[0].id]); // Anchor to first random array node
      setLog("Generated fully connected random mesh graph workspace. Node [" + randomG.nodes[0].id + "] active.");
    }
  };

  const handleRandomize = () => {
    const randomG = generateRandomPrimGraph();
    setGraph(randomG);
    setMstEdges([]);
    setVisited([randomG.nodes[0].id]);
    setLog("Regenerated new alternative random mesh parameters. Rooted node [" + randomG.nodes[0].id + "] activated.");
  };

  const stepPrim = () => {
    if (visited.length === graph.nodes.length) {
      setLog('Minimum Spanning Tree paths locked. Optimization engine finished. Every node connected.');
      return;
    }

    let minEdge = null;
    let minW = Infinity;

    // Local border vector checking algorithms loop
    for (let e of graph.edges) {
      let uVis = visited.includes(e.u);
      let vVis = visited.includes(e.v);
      
      // If exactly one of the endpoints is visited, it crosses the current cut cut boundaries
      if ((uVis && !vVis) || (!uVis && vVis)) {
        if (e.w < minW) {
          minW = e.w;
          minEdge = e;
        }
      }
    }

    if (minEdge) {
      let nextNode = visited.includes(minEdge.u) ? minEdge.v : minEdge.u;
      setVisited([...visited, nextNode]);
      setMstEdges([...mstEdges, minEdge]);
      setLog(`Greedily picked minimum crossing edge path: ${minEdge.u} - ${minEdge.v} (Weight: ${minEdge.w}). Node [${nextNode}] appended.`);
    } else {
      setLog('Computation terminated. No remaining connecting edges available.');
    }
  };

  const reset = () => {
    setMstEdges([]);
    setVisited([graph.nodes[0].id]);
    setLog(`Visualization engine reset. Base root anchor set to [${graph.nodes[0].id}].`);
  };

  // Compute metrics accumulation on demand
  const accumulatedMstWeight = mstEdges.reduce((sum, e) => sum + e.w, 0);

  return (
    <div className="algo-container" style={{ paddingBottom: '2rem' }}>
      <PanelTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* GLOBAL MODE SELECT TOOLBAR ROW */}
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
         PANEL 1: ACTIVE CANVAS WORKSPACE
         ========================================== */}
      {activeTab === 'visualization' && (
        <div className="panel-content">
          <div className="control-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button className="btn btn-primary" onClick={stepPrim} disabled={visited.length === graph.nodes.length}>Next Step</button>
            <button className="btn btn-danger" onClick={reset}>Reset</button>
          </div>
          
          <div className="canvas-wrapper" style={{ position: 'relative', background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '0.5rem' }}>
            <svg width="100%" height="380" style={{ background: 'transparent' }}>
              {/* Render Connection Track Lines */}
              {graph.edges.map((e, idx) => {
                const isMst = mstEdges.some(me => (me.u === e.u && me.v === e.v) || (me.u === e.v && me.v === e.u));
                const fromNode = graph.nodes.find(n => n.id === e.u);
                const toNode = graph.nodes.find(n => n.id === e.v);
                
                if (!fromNode || !toNode) return null;

                return (
                  <g key={idx}>
                    <line 
                      x1={fromNode.x} y1={fromNode.y} 
                      x2={toNode.x} y2={toNode.y} 
                      stroke={isMst ? '#10b981' : '#334155'} 
                      strokeWidth={isMst ? 5 : 2} 
                      style={{ transition: 'all 0.25s ease' }}
                    />
                    {/* Weight Center Badge Background Box */}
                    <rect 
                      x={(fromNode.x + toNode.x) / 2 - 10} 
                      y={(fromNode.y + toNode.y) / 2 - 10} 
                      width="20" height="20" fill="#111726" rx="4"
                    />
                    <text 
                      x={(fromNode.x + toNode.x) / 2} 
                      y={(fromNode.y + toNode.y) / 2 + 4} 
                      fill={isMst ? '#10b981' : '#94a3b8'} 
                      fontSize="11" fontWeight="bold" textAnchor="middle"
                    >
                      {e.w}
                    </text>
                  </g>
                );
              })}

              {/* Render Nodes Geometry Layouts */}
              {graph.nodes.map((node) => {
                const isVisited = visited.includes(node.id);
                return (
                  <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                    <circle 
                      r="18" 
                      fill="#1e293b" 
                      stroke={isVisited ? '#10b981' : '#6366f1'} 
                      strokeWidth={isVisited ? "3.5" : "2.5"} 
                      style={{ transition: 'all 0.2s ease' }}
                    />
                    <text fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" dy="4">
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            
            <div className="log-overlay" style={{ background: 'rgba(15, 23, 42, 0.95)', color: '#fff', borderLeft: '4px solid #6366f1' }}>{log}</div>
          </div>
        </div>
      )}

      {/* ==========================================
         PANEL 2: STRUCTURAL COMPONENT ANALYSIS
         ========================================== */}
      {activeTab === 'analysis' && (
        <div className="panel-content" style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.5rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#6366f1', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            MST Configuration Edges
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Active Node Cluster Visited counts:</p>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', margin: '0.25rem 0' }}>
                {visited.length} <span style={{ fontSize: '1rem', color: '#475569', fontWeight: 'normal' }}>/ {graph.nodes.length} Vertices</span>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {graph.nodes.map(n => (
                  <span key={n.id} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '0.25rem', background: visited.includes(n.id) ? 'rgba(16, 185, 129, 0.15)' : '#1e293b', color: visited.includes(n.id) ? '#10b981' : '#64748b' }}>
                    {n.label} {visited.includes(n.id) ? '✔' : '○'}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Committed Path Edge Segments:</p>
              {mstEdges.length === 0 ? (
                <div style={{ color: '#475569', fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.5rem' }}>No edges confirmed yet. Step into the algorithm framework.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {mstEdges.map((e, idx) => (
                    <div key={idx} style={{ background: '#1e293b', padding: '0.4rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', borderLeft: '3px solid #10b981' }}>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>Edge: {e.u} — {e.v}</span>
                      <span style={{ color: '#10b981', fontFamily: 'monospace' }}>Weight: {e.w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         PANEL 3: METRICS & COMPLEXITY BENCHMARKS
         ========================================== */}
      {activeTab === 'performance' && (
        <div className="panel-content" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '0.5rem' }}>
          
          {/* Quick Stats Column Box */}
          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Accumulated Tree Weight</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981', margin: '0.25rem 0' }}>
              {accumulatedMstWeight}
            </div>
            <div style={{ color: '#475569', fontSize: '0.7rem' }}>Summation of all edge indices currently locked into the tracking layout structure.</div>
          </div>

          {/* Theoretical Big-O Complexity Box Layout */}
          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#a855f7', marginBottom: '0.5rem' }}>Prim Asymptotic Complexity</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: '1.4' }}>
              Using standard binary min-priority heaps, vertices extracted compute boundaries efficiently by evaluating local cross-cut vector boundaries.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#1e293b', padding: '0.6rem 1rem', borderRadius: '0.375rem', border: '1px solid #334155' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Time Bounds</span>
                <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff' }}>O(E log V)</span>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#334155' }} />
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Space Bounds</span>
                <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff' }}>O(V + E)</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}