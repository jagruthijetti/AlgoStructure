import React, { useState, useEffect } from 'react';

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
// TRUE B+ TREE DATA STRUCTURAL ENGINE (EMULATION MODEL)
// ==========================================================================
class BPlusNode {
  constructor(isLeaf = false) {
    this.isLeaf = isLeaf;
    this.keys = [];
    this.children = []; // If internal: array of BPlusNodes. If leaf: empty.
    this.next = null;   // Sequential leaf node horizontal pointer link
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

class BPlusTreeModel {
  constructor(order = 3) {
    this.order = order; // Maximum child pointer links (M)
    this.root = new BPlusNode(true);
  }

  insert(key) {
    const root = this.root;
    // Max keys bounded by M - 1
    if (root.keys.length === this.order - 1) {
      const newRoot = new BPlusNode(false);
      newRoot.children.push(this.root);
      this.splitChild(newRoot, 0, this.root);
      this.root = newRoot;
    }
    this.insertNonFull(this.root, key);
  }

  insertNonFull(node, key) {
    if (node.keys.includes(key)) return; // Prevent duplicate rendering entries
    
    let i = node.keys.length - 1;
    if (node.isLeaf) {
      while (i >= 0 && node.keys[i] > key) i--;
      node.keys.splice(i + 1, 0, key);
    } else {
      while (i >= 0 && node.keys[i] > key) i--;
      i++;
      if (node.children[i].keys.length === this.order - 1) {
        this.splitChild(node, i, node.children[i]);
        if (key > node.keys[i]) i++;
      }
      this.insertNonFull(node.children[i], key);
    }
  }

  splitChild(parent, index, child) {
    const mid = Math.floor((this.order - 1) / 2);
    const z = new BPlusNode(child.isLeaf);
    
    // In a B+ Tree, keys split but copy up or move up based on layer tier
    if (child.isLeaf) {
      z.keys = child.keys.slice(mid);
      child.keys = child.keys.slice(0, mid);
      
      z.next = child.next;
      child.next = z;
      
      parent.keys.splice(index, 0, z.keys[0]);
    } else {
      z.keys = child.keys.slice(mid + 1);
      const promotedKey = child.keys[mid];
      child.keys = child.keys.slice(0, mid);
      
      z.children = child.children.slice(mid + 1);
      child.children = child.children.slice(0, mid + 1);
      
      parent.keys.splice(index, 0, promotedKey);
    }
    parent.children.splice(index + 1, 0, z);
  }
}

export default function BPlusTreeVisualizer() {
  const [activeTab, setActiveTab] = useState('visualization');
  const [treeOrder, setTreeOrder] = useState(4); // Default to M=4
  const [inputVal, setInputVal] = useState('');
  const [treeInstance, setTreeInstance] = useState(new BPlusTreeModel(4));
  const [allKeysSnapshot, setAllKeysSnapshot] = useState([10, 20, 30, 45, 55, 70, 85]);
  const [log, setLog] = useState('Initialization Ready. Insert values or mutate tree order limits.');

  // Automatically seed an initial functional structure upon load or order mutation resets
  useEffect(() => {
    rebuildTreeFromKeys(allKeysSnapshot, treeOrder);
  }, [treeOrder]);

  const rebuildTreeFromKeys = (keysList, currentOrder) => {
    const model = new BPlusTreeModel(currentOrder);
    // Sort to keep continuous entry tracks clean
    const uniqueSorted = [...new Set(keysList)].sort((a, b) => a - b);
    uniqueSorted.forEach(k => model.insert(k));
    setTreeInstance(model);
    setAllKeysSnapshot(uniqueSorted);
  };

  const handleInsert = () => {
    const val = parseInt(inputVal, 10);
    if (isNaN(val)) return;
    
    if (allKeysSnapshot.includes(val)) {
      setLog(`Key [${val}] already present inside node buffers.`);
      return;
    }

    const nextList = [...allKeysSnapshot, val].sort((a, b) => a - b);
    rebuildTreeFromKeys(nextList, treeOrder);
    setLog(`Inserted value ${val}. Structural balancing splits triggered if key capacity exceeds ${treeOrder - 1}.`);
    setInputVal('');
  };

  const generateRandomTree = () => {
    const poolSize = Math.floor(Math.random() * 5) + 10; // 10 to 14 elements
    const randomItems = [];
    while (randomItems.length < poolSize) {
      const num = Math.floor(Math.random() * 94) + 5; // Clean double-digit spans
      if (!randomItems.includes(num)) randomItems.push(num);
    }
    rebuildTreeFromKeys(randomItems, treeOrder);
    setLog(`Generated ${poolSize} random distinct elements under Order M=${treeOrder} specifications.`);
  };

  const handleReset = () => {
    const defaults = [15, 30, 45];
    rebuildTreeFromKeys(defaults, treeOrder);
    setLog(`Flushed workspace. Reverted to elementary 3-node balance array layout.`);
  };

  // ==========================================================================
  // COORDINATE GENERATION & RENDERING LOGIC
  // ==========================================================================
  const renderElementsList = [];
  const linkPointersList = [];
  const leafNodesSequenceList = [];

  // Traverse the memory tree structure layout systematically to determine node sizes and line links
  const computeVisualLayout = () => {
    let layersMap = {};
    
    function traverse(node, depth = 0) {
      if (!layersMap[depth]) layersMap[depth] = [];
      layersMap[depth].push(node);
      if (!node.isLeaf) {
        node.children.forEach(c => traverse(c, depth + 1));
      } else {
        leafNodesSequenceList.push(node);
      }
    }
    
    traverse(treeInstance.root, 0);

    const canvasWidth = 840;
    const verticalGap = 85;

    Object.keys(layersMap).forEach(depthStr => {
      const depth = parseInt(depthStr, 10);
      const nodesInLayer = layersMap[depth];
      const segmentWidth = canvasWidth / nodesInLayer.length;

      nodesInLayer.forEach((node, idx) => {
        const xCenter = (idx * segmentWidth) + (segmentWidth / 2);
        const yTop = 40 + (depth * verticalGap);
        
        // Node container configuration metrics
        const keyBoxWidth = 28;
        const totalBoxWidth = Math.max(65, node.keys.length * keyBoxWidth + 16);
        const boxHeight = 32;

        node.visualX = xCenter;
        node.visualY = yTop;
        node.visualWidth = totalBoxWidth;
        node.visualHeight = boxHeight;

        renderElementsList.push({
          node,
          x: xCenter - totalBoxWidth / 2,
          y: yTop,
          width: totalBoxWidth,
          height: boxHeight
        });
      });
    });

    // Generate linking reference lines down from parent to child nodes
    Object.keys(layersMap).forEach(depthStr => {
      const nodesInLayer = layersMap[depthStr];
      nodesInLayer.forEach(node => {
        if (!node.isLeaf && node.children) {
          node.children.forEach(child => {
            if (child.visualX !== undefined) {
              linkPointersList.push({
                x1: node.visualX,
                y1: node.visualY + node.visualHeight,
                x2: child.visualX,
                y2: child.visualY,
                type: 'hierarchical'
              });
            }
          });
        }
      });
    });

    // Connect leaf nodes horizontally across the bottom layer
    for (let i = 0; i < leafNodesSequenceList.length - 1; i++) {
      const currLeaf = leafNodesSequenceList[i];
      const nextLeaf = leafNodesSequenceList[i + 1];
      linkPointersList.push({
        x1: currLeaf.visualX + currLeaf.visualWidth / 2,
        y1: currLeaf.visualY + currLeaf.visualHeight / 2,
        x2: nextLeaf.visualX - nextLeaf.visualWidth / 2,
        y2: nextLeaf.visualY + nextLeaf.visualHeight / 2,
        type: 'sequential'
      });
    }
  };

  computeVisualLayout();

  return (
    <div className="algo-container" style={{ paddingBottom: '2rem' }}>
      <PanelTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* PARAMETERS INPUT ACTION BAR */}
      <div className="control-row" style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', background: '#111726', border: '1px solid #1e293b', borderRadius: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Dynamic Tree Order (M) Factor Configurator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Tree Order (M):</span>
          <select 
            value={treeOrder} 
            onChange={(e) => setTreeOrder(parseInt(e.target.value, 10))}
            style={{ background: '#0b0f19', color: '#fff', border: '1px solid #334155', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            <option value="3">3 (Max 2 Keys/Node)</option>
            <option value="4">4 (Max 3 Keys/Node)</option>
            <option value="5">5 (Max 4 Keys/Node)</option>
          </select>
        </div>

        <div style={{ width: '1px', height: '20px', background: '#273549' }} />

        {/* Operational Insert Sub-forms */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="number" 
            placeholder="Value" 
            className="input-field" 
            style={{ width: '70px', background: '#0b0f19', color: '#fff', border: '1px solid #334155', padding: '0.3rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}
            value={inputVal} 
            onChange={(e) => setInputVal(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
          />
          <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.9rem' }} onClick={handleInsert}>Insert Key</button>
        </div>

        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.9rem' }} onClick={generateRandomTree}>Generate Random Tree</button>
        <button className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.4rem 0.9rem', marginLeft: 'auto' }} onClick={handleReset}>Clear Workspace</button>
      </div>

      {/* ==========================================
         PANEL 1: VISUALIZATION WORKING CANVAS
         ========================================== */}
      {activeTab === 'visualization' && (
        <div className="panel-content">
          <div className="canvas-wrapper" style={{ position: 'relative', background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '0.5rem', overflowX: 'auto', padding: '0.5rem' }}>
            
            <svg width="840" height="350" style={{ background: 'transparent', display: 'block', margin: '0 auto' }}>
              
              {/* Definition tags for drawing clean directional arrowheads */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                </marker>
              </defs>

              {/* Render Structural Interconnection Edge Vectors */}
              {linkPointersList.map((link, idx) => {
                if (link.type === 'hierarchical') {
                  return (
                    <line 
                      key={`h-link-${idx}`} 
                      x1={link.x1} y1={link.y1} 
                      x2={link.x2} y2={link.y2} 
                      stroke="#334155" 
                      strokeWidth="1.5" 
                    />
                  );
                } else {
                  // Linked horizontal arrow connecting leaf buffers
                  return (
                    <path 
                      key={`s-link-${idx}`} 
                      d={`M ${link.x1} ${link.y1} L ${link.x2} ${link.y2}`} 
                      stroke="#ef4444" 
                      strokeWidth="2" 
                      fill="none" 
                      markerEnd="url(#arrow)"
                      strokeDasharray="4,2"
                    />
                  );
                }
              })}

              {/* Render Structured Multi-Key Block Nodes */}
              {renderElementsList.map((item, idx) => {
                const { node, x, y, width, height } = item;
                const isRoot = node === treeInstance.root;
                
                // Color configuration matrices distinguishing internal indices from base elements
                const nodeBg = node.isLeaf ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.05)';
                const strokeOutline = node.isLeaf ? '#10b981' : '#3b82f6';

                return (
                  <g key={`node-block-${node.id}`}>
                    {/* Main Node Body Outer Container Rect */}
                    <rect 
                      x={x} y={y} 
                      width={width} height={height} 
                      rx="4" fill={nodeBg} 
                      stroke={strokeOutline} strokeWidth={isRoot ? "2.5" : "1.5"} 
                    />

                    {/* Node Internal Cell Grid Boundaries */}
                    {node.keys.map((key, kIdx) => {
                      const cellX = x + 8 + (kIdx * 28);
                      return (
                        <g key={kIdx}>
                          <rect 
                            x={cellX} y={y + 5} 
                            width="24" height="22" 
                            rx="2" fill="#1e293b" 
                            stroke="#475569" strokeWidth="1" 
                          />
                          <text 
                            x={cellX + 12} y={y + 19} 
                            textAnchor="middle" fill="#fff" 
                            fontSize="10" fontWeight="bold"
                          >
                            {key}
                          </text>
                        </g>
                      );
                    })}

                    {/* Structural Category Labels */}
                    <text 
                      x={x + width / 2} y={y - 5} 
                      fontSize="8" fontWeight="bold" textAnchor="middle" 
                      fill={node.isLeaf ? '#34d399' : '#60a5fa'} style={{ letterSpacing: '0.05em' }}
                    >
                      {isRoot && node.isLeaf ? 'ROOT LEAF' : isRoot ? 'ROOT INDEX' : node.isLeaf ? 'DATA LEAF' : 'INTERNAL INDEX'}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Interactive Live Log Overlay */}
            <div className="log-overlay" style={{ background: 'rgba(15, 23, 42, 0.96)', color: '#fff', borderLeft: '4px solid #3b82f6' }}>
              {log}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', background: '#111726', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Legend Map:</span>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '12px', height: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '2px' }}/> <span style={{ color: '#fff' }}>Index Router Level</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '12px', height: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '2px' }}/> <span style={{ color: '#fff' }}>Data Records Leaf Level</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ display: 'inline-block', width: '20px', borderTop: '2px dashed #ef4444' }}/> <span style={{ color: '#fff' }}>Sequential Records Pointer Link</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         PANEL 2: STRUCTURAL ANALYSIS DATA MATRIX
         ========================================== */}
      {activeTab === 'analysis' && (
        <div className="panel-content" style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#3b82f6', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Current System Capacity Metrics
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Key Entries Count</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff', marginTop: '0.25rem' }}>{allKeysSnapshot.length}</div>
            </div>
            <div style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Node Branch Order ($M$)</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.25rem' }}>{treeOrder}</div>
            </div>
            <div style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Max Keys Capacity Per Block</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '0.25rem' }}>{treeOrder - 1}</div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h5 style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold', marginBottom: '0.5rem' }}>Sorted Continuous Disk Range Stream Sequence</h5>
            <div style={{ background: '#0b0f19', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #1e293b', fontFamily: 'monospace', color: '#10b981', fontSize: '0.9rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
              {allKeysSnapshot.map((k, i) => (
                <span key={i}>
                  {k}{i < allKeysSnapshot.length - 1 ? ' ➔ ' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         PANEL 3: PERFORMANCE STATISTICS
         ========================================== */}
      {activeTab === 'performance' && (
        <div className="panel-content" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          
          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Database Storage Profile</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', margin: '0.25rem 0' }}>
              High Fan-out Factor
            </div>
            <div style={{ color: '#475569', fontSize: '0.7rem', lineHeight: '1.3' }}>
              By containing multiple index routing keys per block, B+ Trees minimize file access block seek times on physical drives.
            </div>
          </div>

          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#a855f7', marginBottom: '0.5rem' }}>B+ Tree Operational Asymptotics</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: '1.4' }}>
              Because all actual structural records map cleanly onto identical flat-height leaf layers at the very bottom, random search lookups, mutations, and structural splits run reliably in logarithmic cycles.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#1e293b', padding: '0.6rem 1rem', borderRadius: '0.375rem', border: '1px solid #334155' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Point Search</span>
                <span style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#60a5fa' }}>O(log_M N)</span>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#334155' }} />
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Range Scan Query</span>
                <span style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#34d399' }}>O(log_M N + K)</span>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#334155' }} />
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Memory Overhead</span>
                <span style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff' }}>O(N)</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}