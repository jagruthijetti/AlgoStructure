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

export default function SegmentTreeVisualizer() {
  const [activeTab, setActiveTab] = useState('visualization');
  const [mode, setMode] = useState('sum');
  const [arrayStr, setArrayStr] = useState('4,2,1,3');
  const [tree, setTree] = useState([]);
  const [queryL, setQueryL] = useState('0');
  const [queryR, setQueryR] = useState('2');
  const [queryResult, setQueryResult] = useState(null);
  const [evaluationStates, setEvaluationStates] = useState({});

  const buildTree = () => {
    const arr = arrayStr.split(',').map(Number).filter(n => !isNaN(n));
    if (arr.length === 0) return;
    let n = arr.length;
    let t = new Array(4 * n).fill(null);

    const construct = (node, start, end) => {
      t[node] = { start, end, val: 0 };
      if (start === end) {
        t[node].val = arr[start];
        return;
      }
      let mid = Math.floor((start + end) / 2);
      construct(2 * node, start, mid);
      construct(2 * node + 1, mid + 1, end);
      t[node].val = mode === 'sum' 
        ? t[2 * node].val + t[2 * node + 1].val 
        : Math.min(t[2 * node].val, t[2 * node + 1].val);
    };

    construct(1, 0, n - 1);
    setTree(t);
    setQueryResult(null);
    setEvaluationStates({});
  };

  const runQuery = () => {
    if (!tree[1]) return;
    const L = Number(queryL);
    const R = Number(queryR);
    let states = {};

    const query = (node, start, end) => {
      if (!tree[node]) return mode === 'sum' ? 0 : Infinity;
      // Complete Match
      if (L <= start && end <= R) {
        states[node] = 'inside';
        return tree[node].val;
      }
      // Out of bounds
      if (end < L || start > R) {
        states[node] = 'outside';
        return mode === 'sum' ? 0 : Infinity;
      }
      states[node] = 'partial';
      let mid = Math.floor((start + end) / 2);
      let leftVal = query(2 * node, start, mid);
      let rightVal = query(2 * node + 1, mid + 1, end);
      return mode === 'sum' ? leftVal + rightVal : Math.min(leftVal, rightVal);
    };

    const total = arrayStr.split(',').length;
    const res = query(1, 0, total - 1);
    setQueryResult(res);
    setEvaluationStates(states);
  };

  const renderTree = () => {
    if (!tree[1]) return <text x="400" y="200" fill="var(--text-secondary)" textAnchor="middle">Click 'Build Tree' to render</text>;
    const elements = [];
    const paths = [];

    const traverseDraw = (node, x, y, stepX) => {
      if (!tree[node]) return;
      const tNode = tree[node];

      let fill = 'var(--node-default)';
      if (evaluationStates[node] === 'inside') fill = 'var(--success)';
      else if (evaluationStates[node] === 'outside') fill = 'var(--danger)';
      else if (evaluationStates[node] === 'partial') fill = 'var(--warning)';

      elements.push(
        <g key={node}>
          <rect x={x - 40} y={y} width={80} height={35} rx="4" fill={fill} stroke="var(--accent-primary)" strokeWidth="2" />
          <text x={x} y={y + 15} textAnchor="middle" fontSize="10" fill="var(--text-primary)" fontWeight="bold">[{tNode.start},{tNode.end}]</text>
          <text x={x} y={y + 28} textAnchor="middle" fontSize="11" fill="var(--text-primary)" fontWeight="900">Val: {tNode.val}</text>
        </g>
      );

      if (tNode.start !== tNode.end) {
        if (tree[2 * node]) {
          paths.push(<line key={`p1-${node}`} x1={x} y1={y+35} x2={x - stepX} y2={y + 70} stroke="var(--border-color)" />);
          traverseDraw(2 * node, x - stepX, y + 70, stepX / 2);
        }
        if (tree[2 * node + 1]) {
          paths.push(<line key={`p2-${node}`} x1={x} y1={y+35} x2={x + stepX} y2={y + 70} stroke="var(--border-color)" />);
          traverseDraw(2 * node + 1, x + stepX, y + 70, stepX / 2);
        }
      }
    };

    traverseDraw(1, 400, 30, 160);
    return <>{paths}{elements}</>;
  };

  return (
    <div className="algo-container">
      <PanelTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'visualization' && (
        <div className="panel-content">
          <div className="control-row">
            <select className="input-field" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="sum">Range Sum</option>
              <option value="min">Range Minimum (RMQ)</option>
            </select>
            <input type="text" className="input-field input-field-wide" value={arrayStr} onChange={(e) => setArrayStr(e.target.value)} placeholder="e.g. 4,2,1,3" />
            <button className="btn btn-primary" onClick={buildTree}>Build Tree</button>
            <input type="number" className="input-field" placeholder="L" value={queryL} onChange={(e) => setQueryL(e.target.value)} />
            <input type="number" className="input-field" placeholder="R" value={queryR} onChange={(e) => setQueryR(e.target.value)} />
            <button className="btn btn-secondary" onClick={runQuery}>Evaluate Range</button>
          </div>
          <div className="canvas-wrapper">
            <svg width="800" height="400">{renderTree()}</svg>
            <div className="log-overlay">
              {queryResult !== null ? `Query range output outcome: ${queryResult}` : 'Input arrays to evaluate operations.'}
            </div>
          </div>
        </div>
      )}
      {activeTab === 'analysis' && (
        <div className="panel-content">
          <div className="meta-box"><div className="meta-title">Input Element Matrix Size</div><div className="meta-value">{arrayStr.split(',').length}</div></div>
        </div>
      )}
      {activeTab === 'performance' && (
        <div className="panel-content">
          <h3>Segment Complexity Matrices</h3>
          <p>Construction: <span className="code-inline">O(n)</span> | Query Overlays: <span className="code-inline">O(log n)</span></p>
        </div>
      )}
    </div>
  );
}