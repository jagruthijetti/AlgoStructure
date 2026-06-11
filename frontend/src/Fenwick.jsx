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
// GEOMETRIC MATHEMATICAL NODE TREE PLACEMENT UTILITIES
// ==========================================================================
/**
 * Calculates a clean tree structure coordinates on a Canvas frame.
 * Fenwick trees use the exponent power of the trailing 2s component to track their tier level!
 */
function getFenwickNodeCoords(i, totalElements, containerWidth = 650) {
  const segmentWidth = containerWidth / (totalElements + 1);
  const x = i * segmentWidth;
  
  // Node level is derived from the position of its lowest set bit (trailing zeros count)
  const lsb = i & -i;
  const level = Math.log2(lsb); // 1->0, 2->1, 4->2, 8->3, etc.
  
  // Calculate vertical height layers from top downwards
  const y = 290 - level * 65;
  return { x, y, level };
}

export default function FenwickTreeVisualizer() {
  const [activeTab, setActiveTab] = useState('visualization');
  const [inputStr, setInputStr] = useState('5,1,15,11,3,9,14,6');
  const [bit, setBit] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [searchIndex, setSearchIndex] = useState('7');
  
  // Animation Tracing Sequence Registries
  const [activeTrace, setActiveTrace] = useState([]);
  const [currentTraceIdx, setCurrentTraceIdx] = useState(-1);
  const [traceType, setTraceType] = useState(null); // 'query' | 'update'
  const [log, setLog] = useState('Parse custom sequence vectors or click generate options.');
  const [isAnimating, setIsAnimating] = useState(false);

  const animationTimerRef = useRef(null);

  useEffect(() => {
    // Synchronize initial input array load
    processBuildBIT(inputStr);
    return () => clearInterval(animationTimerRef.current);
  }, []);

  const processBuildBIT = (targetStr) => {
    const raw = targetStr.split(',').map(Number).filter(n => !isNaN(n));
    if (raw.length === 0) return;
    
    // Safety crop window to preserve visual layout density bounds
    const cleanRaw = raw.slice(0, 12);
    setRawData(cleanRaw);
    
    let n = cleanRaw.length;
    let tree = new Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) {
      let val = cleanRaw[i - 1];
      let idx = i;
      while (idx <= n) {
        tree[idx] += val;
        idx += (idx & -idx);
      }
    }
    setBit(tree);
    clearTraceEngine();
    setLog(`Built new 1-Indexed Fenwick range network (Size: ${n}).`);
  };

  const handleRandomize = () => {
    const size = Math.floor(Math.random() * 5) + 6; // Balanced random sample sizing (6 to 10 elements)
    const randomArr = Array.from({ length: size }, () => Math.floor(Math.random() * 18) + 2);
    const updatedStr = randomArr.join(',');
    setInputStr(updatedStr);
    processBuildBIT(updatedStr);
  };

  const triggerQueryTrace = () => {
    let idx = Number(searchIndex);
    if (isNaN(idx) || idx <= 0 || idx >= bit.length) {
      setLog(`Error: Please supply a search boundary parameter between 1 and ${bit.length - 1}.`);
      return;
    }

    clearTraceEngine();
    setIsAnimating(true);
    setTraceType('query');
    
    let traceSequence = [];
    let tempIdx = idx;
    while (tempIdx > 0) {
      traceSequence.push(tempIdx);
      tempIdx -= (tempIdx & -tempIdx);
    }

    runSequencePlayback(traceSequence, 'query');
  };

  const triggerPointUpdateTrace = () => {
    let idx = Number(searchIndex);
    if (isNaN(idx) || idx <= 0 || idx >= bit.length) {
      setLog(`Error: Select an update target point index from 1 to ${bit.length - 1}.`);
      return;
    }

    clearTraceEngine();
    setIsAnimating(true);
    setTraceType('update');

    let traceSequence = [];
    let tempIdx = idx;
    while (tempIdx < bit.length) {
      traceSequence.push(tempIdx);
      tempIdx += (tempIdx & -tempIdx);
    }

    runSequencePlayback(traceSequence, 'update');
  };

  const runSequencePlayback = (sequence, type) => {
    let currentStep = 0;
    setActiveTrace([sequence[0]]);
    setCurrentTraceIdx(0);
    
    if (type === 'query') {
      setLog(`Step 1: Commencing Prefix Sum trace calculation loop at index [${sequence[0]}].`);
    } else {
      setLog(`Step 1: Initializing point value push modification updates starting at index [${sequence[0]}].`);
    }

    animationTimerRef.current = setInterval(() => {
      currentStep++;
      if (currentStep >= sequence.length) {
        clearInterval(animationTimerRef.current);
        setIsAnimating(false);
        if (type === 'query') {
          const totalSum = sequence.reduce((acc, curr) => acc + bit[curr], 0);
          setLog(`Calculation Complete! Evaluated prefix intervals [${sequence.join(' + ')}] yields total accumulation sum = ${totalSum}.`);
        } else {
          setLog(`Cascading update chain completed across indexes [${sequence.join(' ➔ ')}].`);
        }
        return;
      }

      setCurrentTraceIdx(currentStep);
      setActiveTrace(sequence.slice(0, currentStep + 1));
      
      const currentNode = sequence[currentStep];
      if (type === 'query') {
        setLog(`Step ${currentStep + 1}: Subtracting LSB component value. Jumping to parent accumulator index [${currentNode}].`);
      } else {
        setLog(`Step ${currentStep + 1}: Adding LSB component value. Bubbling mutations up to dependent interval index [${currentNode}].`);
      }
    }, 1300);
  };

  const clearTraceEngine = () => {
    clearInterval(animationTimerRef.current);
    setIsAnimating(false);
    setActiveTrace([]);
    setCurrentTraceIdx(-1);
    setTraceType(null);
  };

  const totalTreeElements = bit.length - 1;

  return (
    <div className="algo-container" style={{ paddingBottom: '2.5rem' }}>
      <PanelTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* PARAMETERS CONFIGURATION DASHBOARD */}
      <div className="control-row" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', background: '#111726', border: '1px solid #1e293b', borderRadius: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Input Stream:</span>
          <input type="text" className="input-field" style={{ width: '180px', background: '#0b0f19', border: '1px solid #334155', color: '#fff', padding: '0.3rem', borderRadius: '0.25rem', fontSize: '0.8rem' }} value={inputStr} onChange={(e) => setInputStr(e.target.value)} disabled={isAnimating} />
        </div>

        <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={() => processBuildBIT(inputStr)} disabled={isAnimating}>Build Tree Structure</button>
        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={handleRandomize} disabled={isAnimating}>Random Elements</button>
        
        <div style={{ width: '1px', height: '24px', background: '#334155', margin: '0 0.25rem' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Target Index (i):</span>
          <input type="number" min="1" max={Math.max(1, totalTreeElements)} className="input-field" style={{ width: '50px', textAlign: 'center', background: '#0b0f19', border: '1px solid #334155', color: '#fff', padding: '0.3rem', borderRadius: '0.25rem', fontSize: '0.8rem' }} value={searchIndex} onChange={(e) => setSearchIndex(e.target.value)} disabled={isAnimating} />
        </div>

        <button className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', background: '#059669', color: '#fff' }} onClick={triggerQueryTrace} disabled={isAnimating || totalTreeElements <= 0}>Prefix Sum Trace</button>
        <button className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', background: '#7c3aed', color: '#fff' }} onClick={triggerPointUpdateTrace} disabled={isAnimating || totalTreeElements <= 0}>Cascading Update Trace</button>
      </div>

      {/* ==========================================
         PANEL 1: ACTIVE CANVAS TREE VIEW
         ========================================== */}
      {activeTab === 'visualization' && (
        <div className="panel-content">
          <div className="canvas-wrapper" style={{ position: 'relative', background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '0.5rem', padding: '1rem', overflow: 'hidden' }}>
            
            {totalTreeElements <= 0 ? (
              <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontStyle: 'italic', fontSize: '0.85rem' }}>
                No active structure configured. Input values above and click build to generate tree visualization coordinates.
              </div>
            ) : (
              <svg width="100%" height="340" style={{ background: 'transparent' }}>
                {/* Structural Inter-Node Tree Interconnection Vector Lines */}
                {bit.map((_, i) => {
                  if (i === 0) return null;
                  const currentCoords = getFenwickNodeCoords(i, totalTreeElements);
                  
                  // Compute immediate structural upper boundary parent index pointer
                  const nextParentIdx = i + (i & -i);
                  if (nextParentIdx > totalTreeElements) return null;
                  
                  const parentCoords = getFenwickNodeCoords(nextParentIdx, totalTreeElements);
                  
                  // Check if this structural path is active during runtime cascades
                  let isLineHighlighted = false;
                  if (traceType === 'update') {
                    const trackingA = activeTrace.indexOf(i);
                    const trackingB = activeTrace.indexOf(nextParentIdx);
                    isLineHighlighted = trackingA !== -1 && trackingB !== -1 && trackingB === trackingA + 1;
                  } else if (traceType === 'query') {
                    const trackingA = activeTrace.indexOf(i);
                    const nextQueryTarget = i - (i & -i);
                    // Query jumps from current downward toward next index
                    isLineHighlighted = trackingA !== -1 && activeTrace.includes(nextQueryTarget);
                  }

                  return (
                    <line
                      key={`line-${i}`}
                      x1={currentCoords.x} y1={currentCoords.y}
                      x2={parentCoords.x} y2={parentCoords.y}
                      stroke={isLineHighlighted ? (traceType === 'query' ? '#34d399' : '#a78bfa') : '#1e293b'}
                      strokeWidth={isLineHighlighted ? 3 : 1.5}
                      strokeDasharray={isLineHighlighted ? "none" : "3,3"}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  );
                })}

                {/* Render Interactive Circles Representing Fenwick Intervals */}
                {bit.map((v, i) => {
                  if (i === 0) return null;
                  const { x, y } = getFenwickNodeCoords(i, totalTreeElements);
                  
                  const isNodeInTrace = activeTrace.includes(i);
                  const isCurrentHead = activeTrace[currentTraceIdx] === i;
                  
                  // Calculate dynamic node colors based on animation states
                  let nodeColor = '#1e293b';
                  let strokeColor = '#3b82f6';
                  
                  if (isNodeInTrace) {
                    nodeColor = traceType === 'query' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(124, 58, 237, 0.2)';
                    strokeColor = traceType === 'query' ? '#10b981' : '#8b5cf6';
                  }
                  if (isCurrentHead) {
                    nodeColor = '#f59e0b';
                    strokeColor = '#fff';
                  }

                  // Determine what index intervals this node stores (e.g., (i-lsb+1) to i)
                  const lsb = i & -i;
                  const rangeStr = lsb === 1 ? `[${i}]` : `[${i - lsb + 1}-${i}]`;

                  return (
                    <g key={`node-${i}`} transform={`translate(${x}, ${y})`} style={{ cursor: 'pointer' }}>
                      <circle
                        r="22"
                        fill={nodeColor}
                        stroke={strokeColor}
                        strokeWidth={isCurrentHead ? 3.5 : 2}
                        style={{ transition: 'all 0.25s' }}
                      />
                      {/* Registry internal array content value */}
                      <text fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" dy="-2">
                        {v}
                      </text>
                      {/* Component Index Marker Label */}
                      <text fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle" dy="11">
                        idx:{i}
                      </text>
                      {/* Interval range tracking labels */}
                      <text fill="#94a3b8" fontSize="7" textAnchor="middle" dy="32">
                        {rangeStr}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            <div className="log-overlay" style={{ background: 'rgba(15, 23, 42, 0.95)', color: '#fff', borderLeft: isAnimating ? '4px solid #f59e0b' : '1px solid #1e293b' }}>
              {log}
            </div>
          </div>

          {/* BASE REFERENCE ARRAY GRID */}
          <div style={{ marginTop: '1rem', background: '#111726', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
            <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Underlying Reference Leaf Array Values (Raw Context Inputs)
            </h5>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {rawData.map((val, idx) => (
                <div key={idx} style={{ background: '#0b0f19', border: '1px solid #334155', borderRadius: '0.25rem', padding: '0.4rem', minWidth: '55px', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', color: '#475569', fontWeight: 'bold' }}>Pos: {idx + 1}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         PANEL 2: STRUCTURAL ANALYSIS GRID
         ========================================== */}
      {activeTab === 'analysis' && (
        <div className="panel-content" style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#3b82f6', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Interval Binary Vector Decomposition Mapping
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#94a3b8' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e293b', textAlign: 'left', color: '#fff' }}>
                <th style={{ padding: '0.5rem' }}>Registry Index (i)</th>
                <th style={{ padding: '0.5rem' }}>Binary Sequence</th>
                <th style={{ padding: '0.5rem' }}>Isolating Least Set Bit (i & -i)</th>
                <th style={{ padding: '0.5rem' }}>Responsible Coverage Range</th>
              </tr>
            </thead>
            <tbody>
              {bit.map((_, i) => {
                if (i === 0) return null;
                const lsb = i & -i;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #1e293b', background: activeTrace.includes(i) ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold', color: '#fff' }}>Index {i}</td>
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{i.toString(2).padStart(4, '0')}</td>
                    <td style={{ padding: '0.5rem', color: '#f59e0b', fontFamily: 'monospace' }}>{lsb}</td>
                    <td style={{ padding: '0.5rem' }}>Sums elements from positions <strong style={{ color: '#fff' }}>{i - lsb + 1}</strong> up to <strong style={{ color: '#fff' }}>{i}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ==========================================
         PANEL 3: PERFORMANCE STATISTICS
         ========================================== */}
      {activeTab === 'performance' && (
        <div className="panel-content" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Tree Memory Footprint</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', margin: '0.25rem 0' }}>
              N + 1 Slots
            </div>
            <div style={{ color: '#475569', fontSize: '0.7rem' }}>Operates completely in-place over flat linear layout space without sub-pointer overhead.</div>
          </div>

          <div style={{ background: '#111726', border: '1px solid #1e293b', padding: '1.25rem', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#a855f7', marginBottom: '0.5rem' }}>Fenwick Operational Efficiency Profiling</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: '1.4' }}>
              By exploiting the binary representation of array indexes, point-updates and range queries navigate the structural hierarchy by clearing or adding the Least Significant Bit (LSB). This keeps the max step count bounded by the bit width.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#1e293b', padding: '0.6rem 1rem', borderRadius: '0.375rem', border: '1px solid #334155' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Range Query Time</span>
                <span style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#34d399' }}>O(log N)</span>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#334155' }} />
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Point Update Time</span>
                <span style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#a78bfa' }}>O(log N)</span>
              </div>
              <div style={{ width: '1px', height: '30px', background: '#334155' }} />
              <div>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Space Overhead</span>
                <span style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff' }}>O(N)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}