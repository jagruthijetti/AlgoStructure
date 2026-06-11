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
// TOPOLOGY STRUCTURAL METADATA & GRID CONSTANTS
// ==========================================================================
const PREDEFINED_NODES = {
  A: { id: 'A', label: 'A', x: 300, y: 60 },
  B: { id: 'B', label: 'B', x: 160, y: 150 },
  C: { id: 'C', label: 'C', x: 440, y: 150 },
  D: { id: 'D', label: 'D', x: 100, y: 280 },
  E: { id: 'E', label: 'E', x: 300, y: 280 },
  F: { id: 'F', label: 'F', x: 500, y: 280 }
};

const PREDEFINED_ADJ = {
  A: ['B', 'C'], B: ['A', 'D', 'E'], C: ['A', 'F'], D: ['B'], E: ['B', 'F'], F: ['C', 'E']
};

const SECTOR_LAYOUTS = [
  { x: 300, y: 60 },  // Level 0
  { x: 160, y: 150 }, // Level 1 (Left)
  { x: 440, y: 150 }, // Level 1 (Right)
  { x: 100, y: 280 }, // Level 2 (Far Left)
  { x: 300, y: 280 }, // Level 2 (Center)
  { x: 500, y: 280 }  // Level 2 (Far Right)
];

function generateRandomGraph() {
  const numNodes = Math.floor(Math.random() * 2) + 5; // Generates 5 or 6 connected vertices
  const nodes = {};
  const adj = {};

  for (let i = 0; i < numNodes; i++) {
    const label = String.fromCharCode(65 + i);
    nodes[label] = { id: label, label, x: SECTOR_LAYOUTS[i].x, y: SECTOR_LAYOUTS[i].y };
    adj[label] = [];
  }

  // Create an incremental connected backbone to avoid isolated islands
  const keys = Object.keys(nodes);
  for (let i = 1; i < keys.length; i++) {
    const parentIdx = Math.floor(Math.random() * i);
    const p = keys[parentIdx];
    const c = keys[i];
    adj[p].push(c);
    adj[c].push(p);
  }

  // Add random cross-edges for typical mesh loops
  let extraEdges = 0;
  while (extraEdges < 2) {
    const u = keys[Math.floor(Math.random() * numNodes)];
    const v = keys[Math.floor(Math.random() * numNodes)];
    if (u !== v && !adj[u].includes(v)) {
      adj[u].push(v);
      adj[v].push(u);
      extraEdges++;
    }
  }

  return { nodes, adj };
}

// ==========================================================================
// CORE TRAVERSAL PLATFORM COMPONENT
// ==========================================================================
export default function DfsTraversalVisualizer() {
  const [activeTab, setActiveTab] = useState('visualization');
  const [graphMode, setGraphMode] = useState('predefined');
  const [graph, setGraph] = useState({ nodes: PREDEFINED_NODES, adj: PREDEFINED_ADJ });
  
  // Custom Execution State Properties
  const [sourceNode, setSourceNode] = useState('A');
  const [stack, setStack] = useState([]);
  const [visited, setVisited] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [log, setLog] = useState('Click "Start DFS Traversal" to evaluate structural discovery layers.');
  
  // Interactive Timeline Playback State Registries
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef(null);

  // Clear running background processing intervals upon unexpected unmount loops
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // Handle stepping intervals automatically when 'Play' state is enabled
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            setLog('DFS traversal trace sequence fully complete.');
            return prev;
          }
          const nextIndex = prev + 1;
          applyTimelineStep(steps[nextIndex]);
          return nextIndex;
        });
      }, 1100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps]);

  const applyTimelineStep = (step) => {
    if (!step) return;
    setStack(step.st);
    setVisited(step.vis);
    setCurrentNode(step.curr);
    setLog(step.msg);
  };

  const handleModeChange = (mode) => {
    setGraphMode(mode);
    resetSimulationContext();
    if (mode === 'predefined') {
      setGraph({ nodes: PREDEFINED_NODES, adj: PREDEFINED_ADJ });
      setSourceNode('A');
      setLog('Restored standard predefined cyclic grid graph layout.');
    } else {
      const generated = generateRandomGraph();
      setGraph(generated);
      const keys = Object.keys(generated.nodes);
      setSourceNode(keys[0]);
      setLog(`Generated fully connected random mesh map. Root [${keys[0]}] established.`);
    }
  };

  const regenerateRandomGraphMode = () => {
    const generated = generateRandomGraph();
    resetSimulationContext();
    setGraph(generated);
    const keys = Object.keys(generated.nodes);
    setSourceNode(keys[0]);
    setLog(`Regenerated alternative random mesh layout topology. Root [${keys[0]}] established.`);
  };

  const compileDFSTimeline = () => {
    const nodeKeys = Object.keys(graph.nodes);
    if (!nodeKeys.includes(sourceNode)) {
      setLog(`Error: Specified source node [${sourceNode}] doesn't exist on this graph layout canvas.`);
      return;
    }

    resetSimulationContext();
    
    let timeline = [];
    let localStack = [sourceNode];
    let localVisited = [];

    timeline.push({
      st: [...localStack],
      vis: [...localVisited],
      curr: null,
      msg: `Pushed entry root node [${sourceNode}] directly onto processing stack framework.`
    });

    while (localStack.length > 0) {
      // Pop top item from the LIFO stack
      let curr = localStack.pop();
      
      if (!localVisited.includes(curr)) {
        localVisited.push(curr);
        
        timeline.push({
          st: [...localStack],
          vis: [...localVisited],
          curr: curr,
          msg: `Popped Node [${curr}] from stack top. Marked as VISITED and exploring branches.`
        });

        const neighbors = graph.adj[curr] || [];
        // Process neighbors in reverse order to preserve traditional left-to-right visual discovery
        const structuralNeighbors = [...neighbors].reverse();

        for (let n of structuralNeighbors) {
          if (!localVisited.includes(n)) {
            localStack.push(n);
            
            timeline.push({
              st: [...localStack],
              vis: [...localVisited],
              curr: curr,
              msg: `Discovered adjacent neighbor Node [${n}]. Pushing item into LIFO Stack.`
            });
          }
        }
      } else {
        timeline.push({
          st: [...localStack],
          vis: [...localVisited],
          curr: curr,
          msg: `Node [${curr}] was already visited. Popping and discarding edge overlap.`
        });
      }
    }

    setSteps(timeline);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    applyTimelineStep(timeline[0]);
  };

  const togglePlayback = () => {
    if (steps.length === 0) {
      compileDFSTimeline();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const stepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      applyTimelineStep(steps[nextIndex]);
    }
  };

  const stepBackward = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      applyTimelineStep(steps[prevIndex]);
    }
  };

  const resetSimulationContext = () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(-1);
    setStack([]);
    setVisited([]);
    setCurrentNode(null);
    setLog('Pipeline states flushed. Controls ready for sequence generation.');
  };

  const extractUniqueEdges = () => {
    const list = [];
    const tracking = new Set();
    Object.keys(graph.adj).forEach(u => {
      graph.adj[u].forEach(v => {
        const hash = [u, v].sort().join('-');
        if (!tracking.has(hash)) {
          tracking.add(hash);
          list.push({ u, v });
        }
      });
    });
    return list;
  };

  return (
    <div className="algo-container" style={{ paddingBottom: '2.5rem' }}>
      <PanelTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* GRAPH TOPOLOGY MODE SELECT PANEL */}
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
            Random Network mode
          </button>
        </div>

        {graphMode === 'random' && (
          <button className="btn btn-secondary" onClick={regenerateRandomGraphMode} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Generate Next Graph
          </button>
        )}
      </div>

      {/* ==========================================
         PANEL 1: INTERACTIVE RENDERING CANVAS
         ========================================== */}
      {activeTab === 'visualization' && (
        <div className="panel-content">
          
          {/* CONTROL MATRIX STEPS ACTION BAR */}
          <div className="control-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center', padding: '0.75rem', background: '#1e293b', borderRadius: '0.375rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Source Node:</span>
              <input 
                type="text" 
                maxLength="1" 
                style={{ width: '40px', textAlign: 'center', background: '#0b0f19', color: '#fff', border: '1px solid #475569', borderRadius: '0.25rem', padding: '0.2rem', fontWeight: 'bold' }} 
                value={sourceNode} 
                onChange={(e) => setSourceNode(e.target.value.toUpperCase())} 
                disabled={steps.length > 0}
              />
            </div>

            {/* Micro Player Step Controls */}
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', marginLeft: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem' }} onClick={stepBackward} disabled={currentStepIndex <= 0}>
                ⏴ Back
              </button>
              <button className="btn btn-primary" style={{ minWidth: '85px' }} onClick={togglePlayback}>
                {isPlaying ? '⏸ Pause' : steps.length > 0 ? '▶ Resume' : 'Start DFS'}
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem' }} onClick={stepForward} disabled={currentStepIndex === -1 || currentStepIndex >= steps.length - 1}>
                Next ⏵
              </button>
            </div>

            <button className="btn btn-danger" style={{ marginLeft: 'auto' }} onClick={resetSimulationContext}>Reset</button>
          </div>

          {/* DYNAMIC LINEAR REAL-TIME REGISTER STATUS BAR */}
          <div className="tracking-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#111726', padding: '0.6rem 1rem', border: '1px solid #1e293b', borderRadius: '0.375rem', marginBottom: '0.75rem' }}>
            <span className="tracking-bar-title" style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Stack Track State (LIFO Array Buffer):
            </span>
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
              {stack.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>Stack container currently empty</span>
              ) : (
                stack.map((node, idx) => (
                  <span key={idx} className="tracking-item" style={{ padding: '0.15rem 0.5rem', background: idx === stack.length - 1 ? '#ef4444' : '#a855f7', color: '#fff', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {idx === stack.length - 1 ? `TOP: ${node}` : node}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* CANVAS BOX & WORKSPACE OVERLAYS */}
          <div className="canvas-wrapper" style={{ position: 'relative', background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '0.5rem' }}>
            <svg width="100%" height="360" style={{ background: 'transparent' }}>
              {/* Draw Vector Line Networks */}
              {extractUniqueEdges().map((edge, idx) => {
                const uNode = graph.nodes[edge.u];
                const vNode = graph.nodes[edge.v];
                if (!uNode || !vNode) return null;

                const isTraversed = visited.includes(edge.u) && visited.includes(edge.v);

                return (
                  <line 
                    key={idx} 
                    x1={uNode.x} y1={uNode.y} 
                    x2={vNode.x} y2={vNode.y} 
                    stroke={isTraversed ? '#10b981' : '#334155'} 
                    strokeWidth={isTraversed ? 3.5 : 1.75}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                );
              })}

              {/* Draw Structural Node Geometric Coordinates */}
              {Object.keys(graph.nodes).map((key) => {
                const node = graph.nodes[key];
                const isCurrent = currentNode === node.id;
                const isVisited = visited.includes(node.id);
                const isStacked = stack.includes(node.id);
                const isRoot = sourceNode === node.id;

                let fillBg = '#1e293b';
                let strokeColor = '#475569';

                if (isStacked) { fillBg = '#a855f7'; strokeColor = '#fff'; }
                if (isVisited) { fillBg = '#10b981'; strokeColor = '#10b981'; }
                if (isCurrent) { fillBg = '#ef4444'; strokeColor = '#fff'; }

                return (
                  <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                    <circle 
                      r="20" 
                      fill={fillBg} 
                      stroke={strokeColor} 
                      strokeWidth={isCurrent ? "4" : "2"} 
                      style={{ transition: 'all 0.2s ease' }}
                    />
                    <text fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" dy="4">
                      {node.label}
                    </text>
                    {isRoot && (
                      <text fill="#6366f1" fontSize="8" fontWeight="bold" textAnchor="middle" dy="-26" style={{ letterSpacing: '0.05em' }}>ROOT START</text>
                    )}
                  </g>
                );
              })}
            </svg>
            <div className="log-overlay" style={{ background: 'rgba(15, 23, 42, 0.95)', color: '#fff', borderLeft: currentNode ? '4px solid #ef4444' : '1px solid #1e293b' }}>{log}</div>
          </div>

        </div>
      )}

      {/* ==========================================
         PANEL 2: STRUCTURAL ANALYSIS TELEMETRY
         ========================================== */}
      {activeTab === 'analysis' && (
        <div className="panel-content" style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.5rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#6366f1', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            DFS Depth Exploration Discovery Trace Log
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Discovered Traversal Route Order Sequence:</p>
              {visited.length === 0 ? (
                <div style={{ color: '#475569', fontStyle: 'italic', fontSize: '0.85rem' }}>No algorithm traces compiled. Run visualization step blocks.</div>
              ) : (
                <div style={{ background: '#0b0f19', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {visited.map((v, i) => (
                    <React.Fragment key={i}>
                      <span style={{ fontWeight: 'bold', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>{v}</span>
                      {i < visited.length - 1 && <span style={{ color: '#475569' }}>➔</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Stack Mechanism Characterization:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#fff' }}>
                <div style={{ padding: '0.5rem', background: '#1e293b', borderRadius: '0.25rem' }}>
                  <strong>LIFO Structural Branching:</strong> Deep paths are navigated fully down to terminal leaf boundaries prior to initiating branch back-tracks.
                </div>
                <div style={{ padding: '0.5rem', background: '#1e293b', borderRadius: '0.25rem' }}>
                  <strong>Backtracking Memory allocation:</strong> The stack records ancestral split frames, enabling the engine to return and explore unvisited branches.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         PANEL 3: METRIC PERFORMANCE STATISTICS
         ========================================== */}
      {activeTab === 'performance' && (
        <div className="panel-content" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '0.5rem' }}>
          
          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Active Network Footprint</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', margin: '0.25rem 0' }}>
              V: {Object.keys(graph.nodes).length} | E: {extractUniqueEdges().length}
            </div>
            <div style={{ color: '#475569', fontSize: '0.7rem' }}>Metrics are evaluated dynamically against your active canvas size.</div>
          </div>

          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#a855f7', marginBottom: '0.5rem' }}>Asymptotic Bounds Refinement</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: '1.4' }}>
              DFS visits every node exactly once and processes every edge connection twice in undirected structures, yielding efficient scaling metrics.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#1e293b', padding: '0.6rem 1rem', borderRadius: '0.375rem', border: '1px solid #334155' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Time Complexity</span>
                <span style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff' }}>O(V + E)</span>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#334155' }} />
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Space Complexity</span>
                <span style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff' }}>O(V)</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}