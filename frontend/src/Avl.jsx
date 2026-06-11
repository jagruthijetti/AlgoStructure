import React, { useState } from 'react';

// Shared locally inside files as an internal routing schema
function PanelTabs({ activeTab, setActiveTab }) {
  return (
    <div className="tab-container">
      <div className={`tab ${activeTab === 'visualization' ? 'active' : ''}`} onClick={() => setActiveTab('visualization')}>Visualization</div>
      <div className={`tab ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => setActiveTab('analysis')}>Structural Analysis</div>
      <div className={`tab ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>Performance Statistics</div>
    </div>
  );
}

class AVLNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

export default function AvlVisualizer() {
  const [activeTab, setActiveTab] = useState('visualization');
  const [root, setRoot] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [log, setLog] = useState('Ready for self-balancing AVL evaluation entries.');

  const getHeight = (n) => n ? n.height : 0;
  const getBalance = (n) => n ? getHeight(n.left) - getHeight(n.right) : 0;

  const rightRotate = (y) => {
    let x = y.left;
    let T2 = x.right;
    x.right = y;
    y.left = T2;
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    return x;
  };

  const leftRotate = (x) => {
    let y = x.right;
    let T2 = y.left;
    y.left = x;
    x.right = T2;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    return y;
  };

  const insert = (node, val, rotationTracker) => {
    if (!node) return new AVLNode(val);
    if (val < node.val) node.left = insert(node.left, val, rotationTracker);
    else if (val > node.val) node.right = insert(node.right, val, rotationTracker);
    else return node;

    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    let balance = getBalance(node);

    // LL Case
    if (balance > 1 && val < node.left.val) {
      rotationTracker.msg = `LL Rotation executed at Node key ${node.val}`;
      return rightRotate(node);
    }
    // RR Case
    if (balance < -1 && val > node.right.val) {
      rotationTracker.msg = `RR Rotation executed at Node key ${node.val}`;
      return leftRotate(node);
    }
    // LR Case
    if (balance > 1 && val > node.left.val) {
      rotationTracker.msg = `LR Rotation executed at Node key ${node.val}`;
      node.left = leftRotate(node.left);
      return rightRotate(node);
    }
    // RL Case
    if (balance < -1 && val < node.right.val) {
      rotationTracker.msg = `RL Rotation executed at Node key ${node.val}`;
      node.right = rightRotate(node.right);
      return leftRotate(node);
    }
    return node;
  };

  const handleInsert = (val) => {
    if (isNaN(val) || val === '') return;
    let tracker = { msg: 'Node structural node linked smoothly.' };
    const newRoot = insert(root, Number(val), tracker);
    setRoot(newRoot);
    setLog(tracker.msg);
    setInputValue('');
  };

  const renderTreeSVG = () => {
    if (!root) return <text x="400" y="200" fill="var(--text-secondary)" textAnchor="middle">Tree Empty</text>;
    const nodes = [];
    const links = [];

    const draw = (node, x, y, level, parentX = null, parentY = null) => {
      if (!node) return;
      const xOffset = 180 / (level + 1);
      if (parentX !== null) {
        links.push(<line key={`l-${node.val}`} x1={parentX} y1={parentY} x2={x} y2={y} stroke="var(--border-color)" strokeWidth="2" />);
      }
      draw(node.left, x - xOffset, y + 60, level + 1, x, y);
      draw(node.right, x + xOffset, y + 60, level + 1, x, y);

      nodes.push(
        <g key={`n-${node.val}`}>
          <circle cx={x} cy={y} r="18" fill="var(--node-default)" stroke="var(--accent-primary)" strokeWidth="2" />
          <text x={x} y={y + 5} fill="var(--text-primary)" fontSize="11" fontWeight="700" textAnchor="middle">{node.val}</text>
          <text x={x + 18} y={y - 10} fill="var(--warning)" fontSize="10" fontWeight="600">b:{getBalance(node)}</text>
        </g>
      );
    };
    draw(root, 400, 40, 1);
    return <>{links}{nodes}</>;
  };

  const getMinMax = (n, type) => {
    if (!n) return 'N/A';
    let curr = n;
    while (type === 'min' ? curr.left : curr.right) curr = type === 'min' ? curr.left : curr.right;
    return curr.val;
  };

  const countNodes = (n) => n ? 1 + countNodes(n.left) + countNodes(n.right) : 0;

  return (
    <div className="algo-container">
      <PanelTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'visualization' && (
        <div className="panel-content">
          <div className="control-row">
            <input type="number" className="input-field" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Value" />
            <button className="btn btn-primary" onClick={() => handleInsert(inputValue)}>Insert Node</button>
            <button className="btn btn-secondary" onClick={() => handleInsert(Math.floor(Math.random() * 90) + 10)}>Random Insertion</button>
            <button className="btn btn-danger" onClick={() => { setRoot(null); setLog('Cleared'); }}>Reset</button>
          </div>
          <div className="canvas-wrapper">
            <svg width="800" height="400">{renderTreeSVG()}</svg>
            <div className="log-overlay">{log}</div>
          </div>
        </div>
      )}
      {activeTab === 'analysis' && (
        <div className="panel-content">
          <div className="analysis-grid">
            <div className="meta-box"><div className="meta-title">Height</div><div className="meta-value">{getHeight(root)}</div></div>
            <div className="meta-box"><div className="meta-title">Total Elements</div><div className="meta-value">{countNodes(root)}</div></div>
            <div className="meta-box"><div className="meta-title">Minimum Leaf Node</div><div className="meta-value">{getMinMax(root, 'min')}</div></div>
            <div className="meta-box"><div className="meta-title">Maximum Leaf Node</div><div className="meta-value">{getMinMax(root, 'max')}</div></div>
          </div>
        </div>
      )}
      {activeTab === 'performance' && (
        <div className="panel-content">
          <h3>AVL Complexity Bounds</h3>
          <p style={{ marginTop: '0.5rem' }}>Guarantees strict <span className="code-inline">O(log n)</span> search, insertion, and deletion paths via invariant configuration properties.</p>
        </div>
      )}
    </div>
  );
}