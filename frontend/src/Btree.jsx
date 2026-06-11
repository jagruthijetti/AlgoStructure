import React, { useState } from 'react';

// Shared locally inside files as an internal routing schema
function PanelTabs({ activeTab, setActiveTab }) {
  return (
    <div className="tab-container" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
      <button className={`btn ${activeTab === 'visualization' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={() => setActiveTab('visualization')}>Visualization Workspace</button>
      <button className={`btn ${activeTab === 'analysis' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={() => setActiveTab('analysis')}>Structural Analysis</button>
      <button className={`btn ${activeTab === 'performance' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={() => setActiveTab('performance')}>Performance Statistics</button>
    </div>
  );
}

class BTreeNode {
  constructor(isLeaf = true) {
    this.isLeaf = isLeaf;
    this.keys = [];
    this.children = [];
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

export default function BTreeVisualizer() {
  const [activeTab, setActiveTab] = useState('visualization');
  const [order, setOrder] = useState(3);
  const [root, setRoot] = useState(new BTreeNode(true));
  const [val, setVal] = useState('');
  const [log, setLog] = useState('B-Tree system operational. Nodes split dynamically when reaching max capacity limits.');

  // ==========================================================================
  // CORE B-TREE BALANCING ENGINE CORRECTIONS
  // ==========================================================================
  const splitChild = (parent, i, child) => {
    // Math.floor((order - 1) / 2) determines midpoints accurately for both odd/even orders
    const medianIndex = Math.floor((order - 1) / 2);
    const promotedKey = child.keys[medianIndex];
    
    const z = new BTreeNode(child.isLeaf);
    
    // Distribute keys to new sibling node
    z.keys = child.keys.slice(medianIndex + 1);
    
    // Distribute child pointers if it's an internal node
    if (!child.isLeaf) {
      z.children = child.children.slice(medianIndex + 1);
      child.children = child.children.slice(0, medianIndex + 1);
    }
    
    // Shrink original full node down
    child.keys = child.keys.slice(0, medianIndex);

    // Splice elements up into parent layer
    parent.children.splice(i + 1, 0, z);
    parent.keys.splice(i, 0, promotedKey);
  };

  const insertNonFull = (node, k) => {
    let i = node.keys.length - 1;
    
    if (node.isLeaf) {
      // Find insertion point while shifting elements right
      while (i >= 0 && node.keys[i] > k) i--;
      node.keys.splice(i + 1, 0, k);
    } else {
      // Find routing route downwards
      while (i >= 0 && node.keys[i] > k) i--;
      i++;
      
      // Preventative Proactive Node Splitting strategy
      if (node.children[i].keys.length === order - 1) {
        splitChild(node, i, node.children[i]);
        if (node.keys[i] < k) i++;
      }
      insertNonFull(node.children[i], k);
    }
  };

  const executeInsertion = (currentRoot, currentOrder, targetVal) => {
    if (currentRoot.keys.includes(targetVal)) {
      setLog(`Key [${targetVal}] already exists in this balanced layout.`);
      return currentRoot;
    }

    let activeRoot = currentRoot;
    // Handle root overflow split up
    if (activeRoot.keys.length === currentOrder - 1) {
      const s = new BTreeNode(false);
      s.children.push(activeRoot);
      splitChild(s, 0, activeRoot);
      insertNonFull(s, targetVal);
      activeRoot = s;
      setLog(`Root split completed. Promoted median value upwards to establish a new hierarchy depth.`);
    } else {
      insertNonFull(activeRoot, targetVal);
      setLog(`Inserted value [${targetVal}] smoothly into corresponding memory node space.`);
    }
    return activeRoot;
  };

  const handleInsert = (v) => {
    if (v === '' || isNaN(v)) return;
    const k = Number(v);
    const nextRoot = executeInsertion(root, order, k);
    setRoot({ ...nextRoot });
    setVal('');
  };

  // ==========================================================================
  // BULK GENERATORS & UTILITY HANDLERS
  // ==========================================================================
  const handleBulkRandomGenerator = () => {
    const size = Math.floor(Math.random() * 5) + 12; // Insert 12 to 16 elements at once
    let tempRoot = new BTreeNode(true);
    const addedList = [];
    
    while (addedList.length < size) {
      const randValue = Math.floor(Math.random() * 95) + 4;
      if (!addedList.includes(randValue)) {
        addedList.push(randValue);
        tempRoot = executeInsertion(tempRoot, order, randValue);
      }
    }
    setRoot(tempRoot);
    setLog(`Bulk Generated tree populated with ${size} randomized variables under dynamic configuration limits.`);
  };

  const handleOrderMutation = (newOrder) => {
    const parsedOrder = Math.max(3, Number(newOrder));
    setOrder(parsedOrder);
    // Flush workspace clean when core order configurations mutate
    setRoot(new BTreeNode(true));
    setLog(`Tree branching factor constraint adjusted to M=${parsedOrder}. Refreshed clean canvas.`);
  };

  const countStructure = (node, stats = { keys: 0, nodes: 0, depth: 0 }, currentDepth = 1) => {
    if (!node || node.keys.length === 0) return stats;
    stats.nodes++;
    stats.keys += node.keys.length;
    if (currentDepth > stats.depth) stats.depth = currentDepth;
    
    if (!node.isLeaf) {
      node.children.forEach(child => countStructure(child, stats, currentDepth + 1));
    }
    return stats;
  };

  const currentStats = countStructure(root);

  // ==========================================================================
  // ADVANCED TREE RECURSIVE POSITIONING STRATEGY
  // ==========================================================================
  const renderBTree = () => {
    const blocks = [];
    const lines = [];

    // Tracks running layer distributions safely to eliminate edge intersections
    const traverseSubtree = (node, x, y, horizontalSpan) => {
      if (!node || node.keys.length === 0) return;
      
      const nodeWidth = node.keys.length * 28 + 14;
      const nodeHeight = 28;

      blocks.push(
        <g key={`block-group-${node.id}`} style={{ transition: 'all 0.3s' }}>
          {/* Main cell body layout */}
          <rect 
            x={x - nodeWidth / 2} y={y} 
            width={nodeWidth} height={nodeHeight} 
            fill="#1e293b" stroke="#3b82f6" strokeWidth="2" rx="4" 
          />
          
          {/* Inner values printing */}
          {node.keys.map((key, keyIdx) => {
            const stepX = (nodeWidth - 14) / node.keys.length;
            const textX = (x - nodeWidth / 2) + 7 + (keyIdx * stepX) + (stepX / 2);
            return (
              <g key={keyIdx}>
                {keyIdx > 0 && (
                  <line 
                    x1={(x - nodeWidth / 2) + 7 + (keyIdx * stepX)} y1={y} 
                    x2={(x - nodeWidth / 2) + 7 + (keyIdx * keyIdx)} y2={y + nodeHeight} 
                    stroke="#334155" strokeWidth="1" 
                  />
                )}
                <text 
                  x={textX} y={y + 18} 
                  textAnchor="middle" fontSize="11" fontWeight="bold" fill="#f8fafc"
                >
                  {key}
                </text>
              </g>
            );
          })}
          
          <text 
            x={x} y={y - 6} 
            fontSize="8" fontWeight="bold" textAnchor="middle" fill="#64748b" style={{ letterSpacing: '0.05em' }}
          >
            {node === root ? 'ROOT' : node.isLeaf ? 'LEAF' : 'INTERNAL'}
          </text>
        </g>
      );

      if (!node.isLeaf && node.children) {
        const childCount = node.children.length;
        const nextVerticalTier = y + 80;
        
        node.children.forEach((child, idx) => {
          if (!child || child.keys.length === 0) return;
          
          // Calculate balanced spread vectors for child subtrees
          const childHorizontalSpread = horizontalSpan / childCount;
          const childX = (x - horizontalSpan / 2) + (idx * childHorizontalSpread) + (childHorizontalSpread / 2);
          
          // Draw linking vector tracks
          lines.push(
            <line 
              key={`vector-line-${node.id}-${idx}`} 
              x1={(x - nodeWidth / 2) + (idx * (nodeWidth / childCount))} y1={y + nodeHeight} 
              x2={childX} y2={nextVerticalTier} 
              stroke="#475569" strokeWidth="1.5" 
            />
          );
          
          traverseSubtree(child, childX, nextVerticalTier, childHorizontalSpread);
        });
      }
    };

    traverseSubtree(root, 410, 45, 780);
    return <>{lines}{blocks}</>;
  };

  return (
    <div className="algo-container" style={{ paddingBottom: '2.5rem' }}>
      
      {/* 1. COMPONENT DISPATCH TOP CONTROL ACTION ROW */}
      <div className="control-row" style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', background: '#111726', border: '1px solid #1e293b', borderRadius: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Tree Order (M):</span>
          <input 
            type="number" 
            className="input-field" 
            min="3" max="8"
            style={{ width: '55px', background: '#0b0f19', color: '#fff', border: '1px solid #334155', padding: '0.25rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold' }} 
            value={order} 
            onChange={(e) => handleOrderMutation(e.target.value)} 
          />
        </div>

        <div style={{ width: '1px', height: '20px', background: '#273549' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="number" 
            placeholder="Key" 
            className="input-field" 
            style={{ width: '65px', background: '#0b0f19', color: '#fff', border: '1px solid #334155', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}
            value={val} 
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsert(val)}
          />
          <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.9rem' }} onClick={() => handleInsert(val)}>Insert Key</button>
        </div>

        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.9rem' }} onClick={handleBulkRandomGenerator}>
          Generate Random Tree
        </button>
        
        <button className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.4rem 0.9rem', marginLeft: 'auto' }} onClick={() => { setRoot(new BTreeNode(true)); setLog('Reset complete. Tree cleared.'); }}>
          Clear Tree
        </button>
      </div>

      <PanelTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ==========================================
         PANEL 1: TREE STRUCTURE GRAPHICAL CANVAS
         ========================================== */}
      {activeTab === 'visualization' && (
        <div className="panel-content">
          <div className="canvas-wrapper" style={{ position: 'relative', background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '0.5rem', padding: '0.5rem', overflowX: 'auto' }}>
            <svg width="820" height="360" style={{ background: 'transparent', display: 'block', margin: '0 auto' }}>
              {root.keys.length === 0 ? (
                <text x="410" y="180" textAnchor="middle" fill="#475569" fontSize="14" fontWeight="bold">
                  B-Tree Workspace is Empty. Insert a Key or Trigger Random Generation to Populate Nodes.
                </text>
              ) : renderBTree()}
            </svg>
            <div className="log-overlay" style={{ background: 'rgba(15, 23, 42, 0.96)', color: '#fff', borderLeft: '4px solid #3b82f6' }}>
              {log}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         PANEL 2: STRUCTURAL ANALYSIS PANEL MATRIX
         ========================================== */}
      {activeTab === 'analysis' && (
        <div className="panel-content" style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#3b82f6', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Real-Time Node Architecture Statistics
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.375rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Balanced Keys</span>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginTop: '0.25rem' }}>{currentStats.keys}</span>
            </div>
            <div style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.375rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Allocated Block Containers</span>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981', marginTop: '0.25rem' }}>{currentStats.nodes}</span>
            </div>
            <div style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.375rem' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Current Tree Height (Depth)</span>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f59e0b', marginTop: '0.25rem' }}>{currentStats.depth}</span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '0.375rem' }}>
            <h5 style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold', marginBottom: '0.5rem' }}>Active Constraints Validation Log</h5>
            <ul style={{ fontSize: '0.75rem', color: '#94a3b8', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              <li>Maximum structural payload capacity per node box is M - 1 = {order - 1} keys.</li>
              <li>All leaf blocks reside at the identical bottom tier to keep search actions balanced.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ==========================================
         PANEL 3: PERFORMANCE METRICS PROFILE
         ========================================== */}
      {activeTab === 'performance' && (
        <div className="panel-content" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Memory Access Strategy</span>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', margin: '0.25rem 0' }}>Secondary Disk-I/O Tuning</h4>
            <p style={{ color: '#475569', fontSize: '0.75rem', lineHeight: '1.4', margin: 0 }}>
              B-Trees pack hundreds of keys into single nodes. This satisfies high fan-out profiles and lowers physical disk read head movements.
            </p>
          </div>

          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#a855f7', marginBottom: '0.5rem' }}>Asymptotic Complexity Matrices</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: '1.4' }}>
              Because nodes stay filled to at least $50\%$ capacity via balancing operations, height never exceeds logarithmic bounds.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#1e293b', padding: '0.6rem 1rem', borderRadius: '0.375rem', border: '1px solid #334155' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Search Lookups</span>
                <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#60a5fa' }}>O(log n)</span>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#334155' }} />
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Insertion / Splits</span>
                <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#34d399' }}>O(log n)</span>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#334155' }} />
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Space Complexity</span>
                <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff' }}>O(n)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}