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

class BSTNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

export default function BstVisualizer() {
  const [activeTab, setActiveTab] = useState('visualization');
  const [root, setRoot] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [animationState, setAnimationState] = useState({ activeId: null, visitedIds: [], targetId: null, phase: 'idle' });
  const [log, setLog] = useState('BST Framework Initialized. Add keys to build out tree branches.');

  // ==========================================================================
  // CORE BST ALGORITHMIC MANIPULATIONS
  // ==========================================================================

  const insertNode = (val) => {
    if (isNaN(val) || val === '') return;
    const k = Number(val);
    const newNode = new BSTNode(k);

    // Track path for layout animation profiling
    const path = [];
    if (!root) {
      setRoot(newNode);
      setLog(`Root created with key ${k}`);
      return;
    }

    let current = root;
    while (true) {
      path.push(current.val);
      if (k === current.val) {
        setLog(`Duplicate Key [${k}] rejected. BST entries must remain distinct.`);
        return;
      }
      if (k < current.val) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }

    animatePath(path, () => {
      setRoot({ ...root });
      setLog(`Successfully appended value [${k}] into the node hierarchy.`);
    });
    setInputValue('');
  };

  const searchNode = (val) => {
    if (isNaN(val) || val === '' || !root) return;
    const k = Number(val);
    const path = [];
    let current = root;
    let found = false;

    while (current) {
      path.push(current.val);
      if (k === current.val) {
        found = true;
        break;
      }
      current = k < current.val ? current.left : current.right;
    }

    animatePath(path, () => {
      setLog(found 
        ? `✔ Value [${k}] located inside the tree structure configuration.` 
        : `✘ Target value [${k}] could not be found anywhere inside the tree parameters.`
      );
    }, found ? 'success' : 'fail');
    setInputValue('');
  };

  const deleteNodeEntry = (val) => {
    if (isNaN(val) || val === '' || !root) return;
    const k = Number(val);
    const path = [];
    let targetFound = false;

    // Helper method to find deletion path nodes beforehand
    let checkCurr = root;
    while (checkCurr) {
      path.push(checkCurr.val);
      if (k === checkCurr.val) { targetFound = true; break; }
      checkCurr = k < checkCurr.val ? checkCurr.left : checkCurr.right;
    }

    if (!targetFound) {
      setLog(`Cannot delete [${k}]: Key is missing from the tree layout.`);
      return;
    }

    const removeRecursive = (node, key) => {
      if (!node) return null;
      if (key < node.val) {
        node.left = removeRecursive(node.left, key);
        return node;
      } else if (key > node.val) {
        node.right = removeRecursive(node.right, key);
        return node;
      } else {
        // Case 1 & 2: Leaf Node or Node with Only One Child
        if (!node.left) return node.right;
        if (!node.right) return node.left;

        // Case 3: Node with Two Children (Fetch In-Order Successor)
        let successor = node.right;
        while (successor.left) {
          successor = successor.left;
        }
        node.val = successor.val;
        node.right = removeRecursive(node.right, successor.val);
        return node;
      }
    };

    animatePath(path, () => {
      const newRoot = removeRecursive(root, k);
      setRoot(newRoot ? { ...newRoot } : null);
      setLog(`Deleted value [${k}] and restructured tree dependencies smoothly.`);
    });
    setInputValue('');
  };

  const generateRandom = () => {
    insertNode(Math.floor(Math.random() * 85) + 10);
  };

  // ==========================================================================
  // ANIMATION TIMELINE TIMERS
  // ==========================================================================
  const animatePath = (path, onComplete, finalStatus = 'idle') => {
    let index = 0;
    const timer = setInterval(() => {
      if (index >= path.length) {
        clearInterval(timer);
        setAnimationState({ activeId: null, visitedIds: path, targetId: path[path.length - 1], phase: finalStatus });
        if (onComplete) onComplete();
        return;
      }
      setAnimationState({
        activeId: path[index],
        visitedIds: path.slice(0, index),
        targetId: null,
        phase: 'searching'
      });
      index++;
    }, 450);
  };

  const runTraversal = (type) => {
    if (!root) return;
    let sequence = [];
    const traverse = (node) => {
      if (!node) return;
      if (type === 'pre') sequence.push(node.val);
      traverse(node.left);
      if (type === 'in') sequence.push(node.val);
      traverse(node.right);
      if (type === 'post') sequence.push(node.val);
    };
    traverse(root);
    animatePath(sequence, () => {
      setLog(`${type.toUpperCase()}-Order Traversal routine completed successfully.`);
    });
  };

  const runOperation = (op) => {
    if (op === 'sum') {
      let sum = 0;
      const traverse = (n) => { if (n) { sum += n.val; traverse(n.left); traverse(n.right); } };
      traverse(root);
      setLog(`Summation value of all nodes aggregated into database metrics: ${sum}`);
    } else if (op === 'clear') {
      setRoot(null);
      setAnimationState({ activeId: null, visitedIds: [], targetId: null, phase: 'idle' });
      setLog('BST layout structures cleared from application context memory storage logs.');
    }
  };

  // ==========================================================================
  // METRICS & ANALYSIS COMPILATIONS
  // ==========================================================================
  const getTreeHeight = (n) => n ? Math.max(getTreeHeight(n.left), getTreeHeight(n.right)) + 1 : 0;
  const getTotalNodes = (n) => n ? getTotalNodes(n.left) + getTotalNodes(n.right) + 1 : 0;
  const getMinMax = (n, type) => {
    if (!n) return 'N/A';
    let curr = n;
    while (type === 'min' ? curr.left : curr.right) {
      curr = type === 'min' ? curr.left : curr.right;
    }
    return curr.val;
  };

  // ==========================================================================
  // COORD RENDERING & CONNECTIONS ENGINE
  // ==========================================================================
  const renderTreeSVG = () => {
    if (!root) return <text x="410" y="180" fill="#475569" fontSize="13" fontWeight="bold" textAnchor="middle">Tree Workspace is Empty. Insert variables or randomize tree configurations.</text>;
    const nodes = [];
    const links = [];

    const traverseCoords = (node, x, y, level, parentX = null, parentY = null) => {
      if (!node) return;
      // Geometric dynamic splitting to eliminate overlapping path layers
      const xOffset = 210 / Math.pow(1.6, level);
      
      if (parentX !== null) {
        links.push(
          <line 
            key={`link-${node.val}`} 
            x1={parentX} y1={parentY} x2={x} y2={y} 
            stroke="#1e293b" strokeWidth="2" 
          />
        );
      }
      
      traverseCoords(node.left, x - xOffset, y + 65, level + 1, x, y);
      traverseCoords(node.right, x + xOffset, y + 65, level + 1, x, y);

      let circleBg = '#111726';
      let textCol = '#fff';
      let strokeColor = '#3b82f6';
      let strokeSize = "2";

      // Highlight nodes based on operation phases
      if (animationState.activeId === node.val) {
        circleBg = '#f59e0b';
        textCol = '#000';
        strokeColor = '#fff';
        strokeSize = "3";
      } else if (animationState.targetId === node.val) {
        if (animationState.phase === 'success') { circleBg = '#10b981'; strokeColor = '#fff'; }
        else if (animationState.phase === 'fail') { circleBg = '#ef4444'; strokeColor = '#fff'; }
      } else if (animationState.visitedIds.includes(node.val)) {
        circleBg = 'rgba(59, 130, 246, 0.15)';
        strokeColor = '#6366f1';
      }

      nodes.push(
        <g key={`node-group-${node.val}`} style={{ transition: 'all 0.25s ease' }}>
          <circle cx={x} cy={y} r="17" fill={circleBg} stroke={strokeColor} strokeWidth={strokeSize} />
          <text x={x} y={y + 4} fill={textCol} fontSize="11" fontWeight="bold" textAnchor="middle">{node.val}</text>
        </g>
      );
    };

    traverseCoords(root, 410, 45, 1);
    return <>{links}{nodes}</>;
  };

  return (
    <div className="algo-container" style={{ paddingBottom: '2.5rem' }}>
      
      {/* 1. COMPONENT DISPATCH CONTROL INPUT ACTIONS SYSTEM */}
      <div className="control-row" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', background: '#111726', border: '1px solid #1e293b', borderRadius: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input 
          type="number" 
          className="input-field" 
          style={{ width: '70px', background: '#0b0f19', color: '#fff', border: '1px solid #334155', padding: '0.35rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}
          placeholder="Value" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
        />
        
        <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.45rem 0.9rem' }} onClick={() => insertNode(inputValue)}>Insert Node</button>
        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.45rem 0.9rem', background: '#1e293b', border: '1px solid #334155', color: '#fff' }} onClick={() => searchNode(inputValue)}>Search Key</button>
        <button className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.45rem 0.9rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444' }} onClick={() => deleteNodeEntry(inputValue)}>Delete Key</button>

        <div style={{ width: '1px', height: '22px', background: '#273549' }} />

        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.45rem 0.8rem' }} onClick={generateRandom}>+ Random Node</button>
        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.45rem 0.8rem' }} onClick={() => runTraversal('pre')}>Pre-Order</button>
        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.45rem 0.8rem' }} onClick={() => runTraversal('in')}>In-Order</button>
        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.45rem 0.8rem' }} onClick={() => runTraversal('post')}>Post-Order</button>
        
        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.45rem 0.8rem', marginLeft: 'auto' }} onClick={() => runOperation('sum')}>Sum Tree</button>
        <button className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.45rem 0.8rem' }} onClick={() => runOperation('clear')}>Clear All</button>
      </div>

      <PanelTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ==========================================
         PANEL 1: BST INTERACTIVE VECTOR GRAPHICS CANVAS
         ========================================== */}
      {activeTab === 'visualization' && (
        <div className="panel-content">
          <div className="canvas-wrapper" style={{ position: 'relative', background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '0.5rem', overflowHidden: 'hidden' }}>
            <svg width="100%" height="370" style={{ background: 'transparent', display: 'block' }}>
              {renderTreeSVG()}
            </svg>
            <div className="log-overlay" style={{ background: 'rgba(15, 23, 42, 0.96)', color: '#fff', borderLeft: '4px solid #3b82f6', fontSize: '0.8rem', padding: '0.6rem 0.8rem' }}>
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
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#3b82f6', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Tree Invariants Metrics Check
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.375rem' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Tree Height</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>{getTreeHeight(root)}</span>
            </div>
            <div style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.375rem' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Nodes</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>{getTotalNodes(root)}</span>
            </div>
            <div style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.375rem' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Minimum Key Value</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b' }}>{getMinMax(root, 'min')}</span>
            </div>
            <div style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.375rem' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Maximum Key Value</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#a855f7' }}>{getMinMax(root, 'max')}</span>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         PANEL 3: PERFORMANCE METRICS COMPLEXITY PROFILE
         ========================================== */}
      {activeTab === 'performance' && (
        <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#3b82f6', marginBottom: '0.75rem' }}>Asymptotic Run Bounds Evaluation</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e293b', color: '#fff' }}>
                  <th style={{ padding: '0.4rem' }}>Operation Case</th>
                  <th style={{ padding: '0.4rem' }}>Time Complexity</th>
                  <th style={{ padding: '0.4rem' }}>Auxiliary Space Bound</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '0.4rem', color: '#fff' }}>Best Case Lookup</td>
                  <td style={{ padding: '0.4rem', fontFamily: 'monospace', color: '#10b981' }}>O(log n)</td>
                  <td style={{ padding: '0.4rem', fontFamily: 'monospace' }}>O(h) Stack Bounds</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '0.4rem', color: '#fff' }}>Average Case Lookup</td>
                  <td style={{ padding: '0.4rem', fontFamily: 'monospace', color: '#3b82f6' }}>O(log n)</td>
                  <td style={{ padding: '0.4rem', fontFamily: 'monospace' }}>O(h) Stack Bounds</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '0.4rem', color: '#fff' }}>Worst Case (Skewed)</td>
                  <td style={{ padding: '0.4rem', fontFamily: 'monospace', color: '#ef4444' }}>O(n)</td>
                  <td style={{ padding: '0.4rem', fontFamily: 'monospace' }}>O(n) Linear Scale</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.5rem' }}>
              <h5 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981', margin: '0 0 0.25rem 0' }}>Architecture Edge Benefits</h5>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', margin: 0 }}>Dynamically scales without requiring static contiguous vector resizing routines in memory arrays.</p>
            </div>
            <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1rem', borderRadius: '0.5rem' }}>
              <h5 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ef4444', margin: '0 0 0.25rem 0' }}>Structural Risks</h5>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', margin: 0 }}>Degenerates into a classic singly linked list structure if inputs arrive pre-sorted during state creation entries.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}