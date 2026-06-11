import React, { useState } from 'react';

const algorithms = [
  { id: 'bst', shorthand: 'BST', name: 'Binary Search Tree', type: 'Tree', desc: 'A node-based structure where each node has at most two children, with left subtree values less than the root.' },
  { id: 'avl', shorthand: 'AVL', name: 'AVL Tree (Balanced)', type: 'Tree', desc: 'A self-balancing BST that maintains O(log n) height by rotating nodes after each insertion or deletion.' },
  { id: 'btree', shorthand: 'B', name: 'B-Tree', type: 'Tree', desc: 'A self-balancing multi-way search tree designed for disk-based storage with variable numbers of children per node.' },
  { id: 'bplus', shorthand: 'B+', name: 'B+ Tree', type: 'Tree', desc: 'A multi-level indexed tree where all values reside in leaf nodes linked for efficient range queries.' },
  { id: 'segment', shorthand: 'SEG', name: 'Segment Tree', type: 'Tree', desc: 'A tree built over an array that answers range queries and point updates in O(log n) time.' },
  { id: 'fenwick', shorthand: 'BIT', name: 'Fenwick Tree (BIT)', type: 'Tree', desc: 'A compact binary-indexed structure supporting prefix sum queries and updates in O(log n) space.' },
  { id: 'bfsTraversal', shorthand: 'BFS', name: 'BFS Traversal', type: 'Graph', desc: 'Explores a graph level by level using a queue, visiting all neighbors before going deeper.' },
  { id: 'bfsSearch', shorthand: 'BFS', name: 'BFS Search', type: 'Graph', desc: 'Uses breadth-first expansion to find the shortest unweighted path between a source and target node.' },
  { id: 'dfsTraversal', shorthand: 'DFS', name: 'DFS Traversal', type: 'Graph', desc: 'Explores as deep as possible along each branch using a stack before backtracking.' },
  { id: 'dfsSearch', shorthand: 'DFS', name: 'DFS Search', type: 'Graph', desc: 'Applies depth-first exploration to locate a target node, useful for maze and puzzle solving.' },
  { id: 'prims', shorthand: 'MST', name: "Prim's MST Algorithm", type: 'Graph', desc: 'Greedily builds a minimum spanning tree by always adding the lowest-weight edge connecting the visited set.' },
  { id: 'kruskals', shorthand: 'MST', name: "Kruskal's MST Algorithm", type: 'Graph', desc: 'Builds a minimum spanning tree by sorting all edges by weight and adding them greedily using a union-find structure.' }
];

export default function Dashboard({ setView }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredAlgorithms = algorithms.filter(algo => {
    if (activeFilter === 'all') return true;
    return algo.type.toLowerCase() === activeFilter;
  });

  return (
    <div className="dashboard-wrapper">
      {/* 2. HERO PRESENTATION TEXT */}
      <div className="hero-container">
        <h1 className="hero-title">
          Explore & Visualize
        </h1><br />
         <h1 className="hero-title">
          Data Structures
        </h1>
        <p className="hero-subtitle">
          Select an algorithm below to open its interactive visualizer workspace.
        </p>
      </div>

      {/* 3. FILTER ROW SUBHEADER BAR */}
      <div className="library-filter-row">
        <div className="library-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          ALGORITHM LIBRARY
        </div>
        <div className="filter-pill-group">
          <button 
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`} 
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-pill ${activeFilter === 'tree' ? 'active' : ''}`} 
            onClick={() => setActiveFilter('tree')}
          >
            Trees
          </button>
          <button 
            className={`filter-pill ${activeFilter === 'graph' ? 'active' : ''}`} 
            onClick={() => setActiveFilter('graph')}
          >
            Graphs
          </button>
        </div>
      </div>

      {/* 4. SOLIDIFIED 3x4 CARD GRID ARCHITECTURE */}
      <div className="dashboard-grid">
        {filteredAlgorithms.map((algo) => (
          <div 
            key={algo.id} 
            className={`algo-card card-${algo.type.toLowerCase()}`} 
            onClick={() => setView(algo.id)}
          >
            <div className="algo-shorthand">{algo.shorthand}</div>
            <span className={`badge badge-${algo.type.toLowerCase()}`}>{algo.type}</span>
            <h2>{algo.name}</h2>
            <p>{algo.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}