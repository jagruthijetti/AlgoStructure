import React, { useState } from 'react';
import Dashboard from './dashboard';
import BstVisualizer from './bst';
import AvlVisualizer from './avl';
import BTreeVisualizer from './btree';
import BPlusTreeVisualizer from './b+tree';
import SegmentTreeVisualizer from './segment';
import FenwickTreeVisualizer from './fenwick';
import BfsTraversalVisualizer from './bfsTraversal';
import BfsSearchVisualizer from './bfsSearch';
import DfsTraversalVisualizer from './dfsTraversal';
import DfsSearchVisualizer from './dfsSearch';
import PrimsVisualizer from './prims';
import KruskalsVisualizer from './kruskals';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('dashboard');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard setView={setCurrentView} />;
      case 'bst': return <BstVisualizer />;
      case 'avl': return <AvlVisualizer />;
      case 'btree': return <BTreeVisualizer />;
      case 'bplus': return <BPlusTreeVisualizer />;
      case 'segment': return <SegmentTreeVisualizer />;
      case 'fenwick': return <FenwickTreeVisualizer />;
      case 'bfsTraversal': return <BfsTraversalVisualizer />;
      case 'bfsSearch': return <BfsSearchVisualizer />;
      case 'dfsTraversal': return <DfsTraversalVisualizer />;
      case 'dfsSearch': return <DfsSearchVisualizer />;
      case 'prims': return <PrimsVisualizer />;
      case 'kruskals': return <KruskalsVisualizer />;
      default: return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          {currentView !== 'dashboard' && (
            <button className="btn btn-secondary" onClick={() => setCurrentView('dashboard')}>
              ← Back to Dashboard
            </button>
          )}
          <h1 className="app-title">AlgoStructure</h1>
        </div>
        <button className="btn btn-secondary" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </header>
      <main style={{ flex: 1 }}>
        {renderView()}
      </main>
    </div>
  );
} 