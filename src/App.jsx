import React, { useState, useEffect, useRef } from 'react';
import './index.css';

import { generateRandomArray, SPEED_MAP, parseArray } from './utils/helpers';
import { runAlgorithm, checkBackendHealth } from './api/algorithmApi';
import { Sun, Moon } from 'lucide-react';

import Visualizer from './components/Visualizer';
import StepLog from './components/StepLog';
import Legend from './components/Legend';

// ── Data ───────────────────────────────────────────────────────────────
const ALGORITHMS = [
  { group: 'Sorting', items: [
    { id: 'bubbleSort',    label: 'Bubble Sort',    icon: 'BB', time: 'O(N²)', space: 'O(1)' },
    { id: 'selectionSort', label: 'Selection Sort', icon: 'SS', time: 'O(N²)', space: 'O(1)' },
    { id: 'insertionSort', label: 'Insertion Sort', icon: 'IS', time: 'O(N²)', space: 'O(1)' },
  ]},
  { group: 'Search', items: [
    { id: 'linearSearch',  label: 'Linear Search',  icon: 'LS', time: 'O(N)',     space: 'O(1)' },
    { id: 'binarySearch',  label: 'Binary Search',  icon: 'BS', time: 'O(log N)', space: 'O(1)' },
  ]},
];

const ICON_COLORS = {
  bubbleSort:    { bg: 'rgba(220,38,38,.2)',   color: '#f87171' },
  selectionSort: { bg: 'rgba(220,38,38,.12)',  color: '#fca5a5' },
  insertionSort: { bg: 'rgba(153,27,27,.35)',  color: '#f87171' },
  linearSearch:  { bg: 'rgba(245,158,11,.15)', color: '#fcd34d' },
  binarySearch:  { bg: 'rgba(249,115,22,.15)', color: '#fdba74' },
};

export default function App() {
  const [arrayStr, setArrayStr] = useState('64, 34, 25, 12, 22, 11, 90');
  const [array, setArray]       = useState([64, 34, 25, 12, 22, 11, 90]);
  const [algo, setAlgo]         = useState('bubbleSort');
  const [speed, setSpeed]       = useState('normal');
  const [theme, setTheme]       = useState('dark');
  const [targetVal, setTargetVal] = useState('12');

  const [steps, setSteps]                   = useState([]);
  const [currentStepIndex, setCurrentStep]  = useState(-1);
  const [isPlaying, setIsPlaying]           = useState(false);

  const [backendStatus, setBackendStatus] = useState('checking'); // checking | online | offline
  const [isLoading, setIsLoading]         = useState(false);
  const [toast, setToast]                 = useState(null);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Backend health
  useEffect(() => {
    checkBackendHealth().then(ok => setBackendStatus(ok ? 'online' : 'offline'));
  }, []);

  // Show toast helper
  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync array string → array state
  useEffect(() => {
    const parsed = parseArray(arrayStr);
    if (parsed.length > 0) { setArray(parsed); reset(); }
  }, [arrayStr]);

  // Auto-sort for binary search
  useEffect(() => {
    if (algo === 'binarySearch') {
      const sorted = [...array].sort((a, b) => a - b);
      setArray(sorted);
      setArrayStr(sorted.join(', '));
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algo]);

  const reset = () => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStep(-1);
  };

  const handleGenerate = () => {
    const arr = generateRandomArray(10, 10, 99);
    setArrayStr(arr.join(', '));
  };

  const getSteps = async () => {
    const isSearch = algo === 'linearSearch' || algo === 'binarySearch';
    const target   = isSearch ? parseInt(targetVal) || 0 : undefined;
    setIsLoading(true);
    try {
      const s = await runAlgorithm(algo, array, target);
      setIsLoading(false);
      return s;
    } catch (err) {
      setIsLoading(false);
      showToast(err.message || 'Backend error', 'error');
      return [];
    }
  };

  const handlePlay = async () => {
    if (currentStepIndex === steps.length - 1 && steps.length > 0) {
      reset();
      setTimeout(() => setIsPlaying(true), 50);
      return;
    }
    if (steps.length === 0) {
      const s = await getSteps();
      if (!s.length) return;
      setSteps(s);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(true);
  };

  const handleStepForward = async () => {
    if (steps.length === 0) {
      const s = await getSteps();
      if (!s.length) return;
      setSteps(s);
      setCurrentStep(0);
      return;
    }
    if (currentStepIndex < steps.length - 1) setCurrentStep(p => p + 1);
  };

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIndex >= steps.length - 1) { setIsPlaying(false); return; }
    const id = setTimeout(() => setCurrentStep(p => p + 1), SPEED_MAP[speed]);
    return () => clearTimeout(id);
  }, [isPlaying, currentStepIndex, steps.length, speed]);

  // Derived
  const currentStep  = steps[currentStepIndex];
  const displayArray = currentStep ? currentStep.array : array;
  const comparisons  = steps.slice(0, currentStepIndex + 1).filter(s => s.type === 'COMPARE').length;
  const ops          = steps.slice(0, currentStepIndex + 1).filter(s => ['SWAP','SET','OVERWRITE'].includes(s.type)).length;
  const allLogs      = steps.slice(0, Math.max(0, currentStepIndex)).map(s => s.message).filter(Boolean);
  const isSearch     = algo === 'linearSearch' || algo === 'binarySearch';
  const progress     = steps.length > 0 ? Math.round(((currentStepIndex + 1) / steps.length) * 100) : 0;

  const algoMeta = ALGORITHMS.flatMap(g => g.items).find(a => a.id === algo) || ALGORITHMS[0].items[0];

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-dot" />
          <span className="brand-title">Algorithm Playground</span>
        </div>
        <div className="header-right">
          <div className="backend-badge">
            <span className={`dot ${
              backendStatus === 'online'   ? 'dot-online'  :
              backendStatus === 'offline'  ? 'dot-offline' : 'dot-check'}`
            } />
            C++ {backendStatus === 'checking' ? '…' : backendStatus}
          </div>
          <button className="theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* ── Sidebar ── */}
      <aside className="sidebar">

        {/* Algorithm picker */}
        <div>
          <div className="section-title">Algorithm</div>
          <div className="algo-list">
            {ALGORITHMS.map(group => (
              <React.Fragment key={group.group}>
                <div className="algo-group-label">{group.group}</div>
                {group.items.map(item => {
                  const ic = ICON_COLORS[item.id];
                  return (
                    <button
                      key={item.id}
                      className={`algo-pill ${algo === item.id ? 'active' : ''}`}
                      onClick={() => setAlgo(item.id)}
                      disabled={isPlaying}
                    >
                      <div className="algo-icon" style={{ background: ic.bg, color: ic.color }}>
                        {item.icon}
                      </div>
                      {item.label}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Target and Actions */}
        <div>
          <div className="section-title">Input Array</div>
          <div className="array-input-wrap">
            <input
              type="text"
              value={arrayStr}
              onChange={e => setArrayStr(e.target.value)}
              placeholder="e.g. 64, 34, 25, 12"
              disabled={isPlaying}
            />
            {isSearch && (
              <div style={{ marginTop: '0.4rem' }}>
                <div className="section-title" style={{ marginTop: '0.4rem', marginBottom: '0.4rem' }}>Target Value</div>
                <input
                  type="number"
                  value={targetVal}
                  onChange={e => setTargetVal(e.target.value)}
                  placeholder="Target"
                  disabled={isPlaying}
                  style={{ 
                    width: '100%', 
                    background: 'var(--surface-2)', 
                    border: '1.5px solid var(--border)', 
                    color: 'var(--text)', 
                    padding: '.55rem .75rem', 
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>
            )}
            <div className="array-btns" style={{ marginTop: '0.5rem' }}>
              <button className="btn-ghost" onClick={handleGenerate} disabled={isPlaying}>Random</button>
              <button className="btn-ghost btn-reset" onClick={reset} disabled={isPlaying}>Reset</button>
            </div>
          </div>
        </div>

        {/* Speed */}
        <div>
          <div className="section-title">Speed</div>
          <div className="speed-wrap">
            <input
              type="range" min="1" max="3" step="1"
              value={speed === 'slow' ? 1 : speed === 'normal' ? 2 : 3}
              onChange={e => {
                const v = +e.target.value;
                setSpeed(v === 1 ? 'slow' : v === 2 ? 'normal' : 'fast');
              }}
              disabled={isPlaying}
            />
            <div className="speed-labels">
              <span>Slow</span><span>Normal</span><span>Fast</span>
            </div>
          </div>
        </div>

        {/* Playback */}
        <div>
          <div className="section-title">Playback</div>
          <div className="playback-btns">
            <button
              className="btn-play"
              onClick={handlePlay}
              disabled={isLoading}
            >
              {isLoading ? '…' : isPlaying ? '▶ Playing' : currentStepIndex >= 0 ? '▶ Resume' : '▶ Run'}
            </button>
            <button className="btn-pause btn-ghost" onClick={() => setIsPlaying(false)} disabled={!isPlaying}>
              ⏸ Pause
            </button>
            <button className="btn-ghost" onClick={handleStepForward} disabled={isPlaying || isLoading}>
              ⏭ Step
            </button>
            <button className="btn-reset btn-ghost" onClick={reset} disabled={isPlaying}>
              ↺ Reset
            </button>
          </div>
        </div>

        {/* Complexity */}
        <div>
          <div className="section-title">Complexity — {algoMeta.label}</div>
          <div className="complexity-cards">
            <div className="complexity-card">
              <span className="c-label">Time (Worst)</span>
              <span className="c-value">{algoMeta.time}</span>
            </div>
            <div className="complexity-card">
              <span className="c-label">Space</span>
              <span className="c-value">{algoMeta.space}</span>
            </div>
          </div>
        </div>

      </aside>

      {/* ── Main ── */}
      <div className="main-area">

        {/* Stats strip */}
        <div className="stats-strip">
          <div className="stat-chip accent-chip">
            <span className="s-label">Step</span>
            <span className="s-value" style={{ color: '#f87171' }}>{Math.max(0, currentStepIndex + 1)}/{steps.length || '–'}</span>
          </div>
          <div className="stat-chip">
            <span className="s-label">Comparisons</span>
            <span className="s-value">{comparisons}</span>
          </div>
          <div className="stat-chip">
            <span className="s-label">Operations</span>
            <span className="s-value">{ops}</span>
          </div>
          <div className="stats-spacer" />
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '8px', fontFamily: 'var(--font-mono)' }}>
            {progress}%
          </span>
        </div>

        {/* Canvas */}
        <div className="canvas-area">
          <div className="visualizer-panel">
            <Visualizer array={displayArray} currentStep={currentStep} isSearch={isSearch} />
            <Legend />
          </div>
          <StepLog currentStep={currentStep} allLogs={allLogs} />
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}

    </div>
  );
}
