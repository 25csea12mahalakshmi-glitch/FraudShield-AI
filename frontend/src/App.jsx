import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Activity, Cpu, AlertTriangle, Play, Pause, RotateCcw,
  BarChart2, Server, Code, Eye, Zap, Settings, RefreshCw, Layers, CheckCircle2,
  Sliders, SlidersHorizontal, ArrowRight, Download, PieChart as PieChartIcon, X
} from 'lucide-react';

const INITIAL_TRANSACTIONS = [
  { id: 'TX-1001', time: 12, amount: 149.99, v1: -1.359, v2: -0.072, v3: 2.536, v14: -0.311, v17: 0.208, mlProb: 0.02, velocityScore: 0.15, amountZ: 0.4, surgeScore: 0.1, finalRisk: 12, decision: 'ALLOW', class: 0 },
  { id: 'TX-1002', time: 14, amount: 2.69, v1: 1.191, v2: 0.266, v3: 0.166, v14: -0.143, v17: -0.183, mlProb: 0.01, velocityScore: 0.12, amountZ: -0.5, surgeScore: 0.1, finalRisk: 8, decision: 'ALLOW', class: 0 },
  { id: 'TX-1003', time: 45, amount: 378.50, v1: -0.428, v2: 0.892, v3: 1.321, v14: -4.892, v17: -6.120, mlProb: 0.89, velocityScore: 0.65, amountZ: 1.8, surgeScore: 0.4, finalRisk: 84, decision: 'BLOCK', class: 1 },
  { id: 'TX-1004', time: 82, amount: 1250.00, v1: -2.311, v2: 1.622, v3: -1.082, v14: -1.210, v17: -0.890, mlProb: 0.42, velocityScore: 0.85, amountZ: 4.2, surgeScore: 0.7, finalRisk: 58, decision: 'REVIEW', class: 0 },
  { id: 'TX-1005', time: 110, amount: 15.00, v1: 0.982, v2: -0.120, v3: 0.450, v14: 0.050, v17: 0.110, mlProb: 0.03, velocityScore: 0.92, amountZ: -0.3, surgeScore: 0.8, finalRisk: 22, decision: 'ALLOW', class: 0 },
  { id: 'TX-1006', time: 142, amount: 520.10, v1: -4.120, v2: 3.820, v3: -5.110, v14: -8.920, v17: -11.40, mlProb: 0.96, velocityScore: 0.95, amountZ: 2.1, surgeScore: 0.8, finalRisk: 93, decision: 'BLOCK', class: 1 },
  { id: 'TX-1007', time: 180, amount: 88.20, v1: 1.050, v2: 0.010, v3: 0.220, v14: 0.120, v17: -0.050, mlProb: 0.01, velocityScore: 0.20, amountZ: 0.1, surgeScore: 0.1, finalRisk: 9, decision: 'ALLOW', class: 0 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTx, setSelectedTx] = useState(INITIAL_TRANSACTIONS[2]);
  
  // Modal state
  const [showResetModal, setShowResetModal] = useState(false);

  // Live Simulation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [simScenario, setSimScenario] = useState('normal');
  const [liveTransactions, setLiveTransactions] = useState(INITIAL_TRANSACTIONS);
  const [simSpeed, setSimSpeed] = useState(1000);

  // Settings / Thresholds
  const [blockThreshold, setBlockThreshold] = useState(70);
  const [reviewThreshold, setReviewThreshold] = useState(40);
  const [surgeTolerance, setSurgeTolerance] = useState(1.8);

  // Reset System Handler executed after user confirms modal
  const handleConfirmResetSystem = () => {
    setIsPlaying(false);
    setSimScenario('normal');
    setLiveTransactions(INITIAL_TRANSACTIONS);
    setSelectedTx(INITIAL_TRANSACTIONS[2]);
    setBlockThreshold(70);
    setReviewThreshold(40);
    setSurgeTolerance(1.8);
    setSimSpeed(1000);
    setShowResetModal(false);
  };

  // Live stream simulation engine
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        const nextId = `TX-${1000 + liveTransactions.length + 1}`;
        const newTime = Math.floor(Date.now() / 1000) % 86400;
        let mlProb, amount, velocityScore, surgeScore, isFraud;

        if (simScenario === 'normal') {
          isFraud = Math.random() < 0.02;
          mlProb = isFraud ? 0.75 + Math.random() * 0.2 : Math.random() * 0.1;
          amount = +(Math.random() * 200 + 5).toFixed(2);
          velocityScore = +(Math.random() * 0.3).toFixed(2);
          surgeScore = +(Math.random() * 0.2).toFixed(2);
        } else if (simScenario === 'flash_sale') {
          isFraud = Math.random() < 0.03;
          mlProb = isFraud ? 0.8 + Math.random() * 0.15 : Math.random() * 0.15;
          amount = +(Math.random() * 150 + 20).toFixed(2);
          velocityScore = +(0.7 + Math.random() * 0.25).toFixed(2);
          surgeScore = +(0.8 + Math.random() * 0.2).toFixed(2);
        } else {
          isFraud = Math.random() < 0.6;
          mlProb = isFraud ? 0.85 + Math.random() * 0.12 : Math.random() * 0.2;
          amount = +(Math.random() * 800 + 100).toFixed(2);
          velocityScore = +(0.85 + Math.random() * 0.15).toFixed(2);
          surgeScore = +(0.75 + Math.random() * 0.2).toFixed(2);
        }

        const amountZ = +((amount - 88) / 250).toFixed(2);
        const effectiveVelocity = (surgeScore > 0.6 && mlProb < 0.2) ? velocityScore * (1 / surgeTolerance) : velocityScore;
        const finalRisk = Math.min(99, Math.round((mlProb * 50) + (effectiveVelocity * 25) + (Math.min(amountZ, 3) * 10) + (surgeScore * 15)));

        let decision = 'ALLOW';
        if (finalRisk >= blockThreshold) decision = 'BLOCK';
        else if (finalRisk >= reviewThreshold) decision = 'REVIEW';

        const newTx = {
          id: nextId,
          time: newTime,
          amount,
          v1: +(Math.random() * 4 - 2).toFixed(3),
          v2: +(Math.random() * 4 - 2).toFixed(3),
          v3: +(Math.random() * 4 - 2).toFixed(3),
          v14: isFraud ? +(-5 - Math.random() * 5).toFixed(3) : +(Math.random() * 2 - 1).toFixed(3),
          v17: isFraud ? +(-6 - Math.random() * 5).toFixed(3) : +(Math.random() * 2 - 1).toFixed(3),
          mlProb: +mlProb.toFixed(3),
          velocityScore,
          amountZ,
          surgeScore,
          finalRisk,
          decision,
          class: isFraud ? 1 : 0
        };

        setLiveTransactions(prev => [newTx, ...prev.slice(0, 49)]);
      }, simSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simScenario, liveTransactions.length, simSpeed, blockThreshold, reviewThreshold, surgeTolerance]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative">
      
      {/* RESET SYSTEM CONFIRMATION MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-rose-900/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header with Red Warning Icon Container */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-500 shadow-inner">
                <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white tracking-tight">Reset System State?</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-normal">
                  This will completely clear transaction buffers and restart metrics.
                </p>
              </div>
            </div>

            {/* Dark Inner Card */}
            <div className="bg-[#060913] border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 leading-relaxed font-sans">
              Are you sure you want to reset system state, clear buffers, and restart counters? All live stream history will be purged.
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end items-center space-x-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResetSystem}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all"
              >
                Confirm Reset
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap justify-between items-center sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-slate-100">Adaptive Fraud Intelligence</h1>
            <p className="text-xs text-cyan-400/80 font-mono">Real-Time Risk & Temporal Surge Engine</p>
          </div>
        </div>

        {/* Navigation & Trigger Modal Button */}
        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition-all shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>RESET SYSTEM</span>
          </button>

          <nav className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
              { id: 'live', label: 'Live Monitor', icon: Activity },
              { id: 'analysis', label: 'Transaction Inspector', icon: Eye },
              { id: 'surge', label: 'Surge Intelligence', icon: Zap },
              { id: 'analytics', label: 'ML Analytics', icon: Cpu },
              { id: 'pipeline', label: 'Risk Engine', icon: Server },
              { id: 'api', label: 'API & Export', icon: Code },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Dataset Tx', val: '284,807', sub: 'Historical records', color: 'border-slate-800' },
                { label: 'Legitimate Tx', val: '284,315', sub: '99.83% of volume', color: 'border-slate-800' },
                { label: 'Fraudulent Tx', val: '492', sub: '0.172% fraud rate', color: 'border-rose-900/50 text-rose-400' },
                { label: 'Active High-Risk', val: liveTransactions.filter(t => t.decision === 'BLOCK').length.toString(), sub: 'In current buffer', color: 'border-amber-900/50 text-amber-400' },
                { label: 'Current Velocity', val: simScenario === 'flash_sale' ? '3,420 tx/m' : '1,150 tx/m', sub: 'Rolling window', color: 'border-slate-800' },
                { label: 'Surge Status', val: simScenario === 'flash_sale' ? 'FLASH SALE' : simScenario === 'attack' ? 'ATTACK' : 'NORMAL', sub: 'Adaptive tolerance ON', color: 'border-cyan-900/50 text-cyan-400' },
              ].map((kpi, idx) => (
                <div key={idx} className={`bg-slate-900/80 border ${kpi.color} p-4 rounded-xl shadow-lg`}>
                  <p className="text-xs text-slate-400 font-medium">{kpi.label}</p>
                  <p className="text-xl font-bold font-mono mt-1 text-slate-100">{kpi.val}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{kpi.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Transaction Volume & Velocity Over Time
                  </h3>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">Live Simulation Sync</span>
                </div>
                <div className="h-56 w-full flex items-end gap-1.5 pt-6 pb-2 px-2 border-b border-slate-800 relative">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className="border-b border-slate-400 w-full"></div>
                    <div className="border-b border-slate-400 w-full"></div>
                    <div className="border-b border-slate-400 w-full"></div>
                  </div>
                  {Array.from({ length: 28 }).map((_, i) => {
                    const h = Math.sin(i * 0.4) * 35 + 45 + (i > 15 && simScenario === 'flash_sale' ? 35 : 0);
                    const isFraudPeak = i === 12 || i === 22;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          style={{ height: `${h}%` }}
                          className={`w-full rounded-t transition-all ${
                            isFraudPeak ? 'bg-rose-500/80' : 'bg-cyan-500/60 group-hover:bg-cyan-400'
                          }`}
                        ></div>
                        <div className="absolute -top-8 hidden group-hover:flex bg-slate-950 text-[10px] font-mono px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-20">
                          Vol: {Math.round(h * 30)} tx/s
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
                  <span>00:00 (Time Elapsed)</span>
                  <span>12:00</span>
                  <span>24:00</span>
                  <span>36:00</span>
                  <span>48:00 (172,792s)</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-cyan-400" />
                  Historical Class Distribution
                </h3>
                <div className="my-4 flex justify-center items-center relative">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="60" stroke="#1e293b" strokeWidth="20" fill="transparent" />
                    <circle cx="80" cy="80" r="60" stroke="#06b6d4" strokeWidth="20" strokeDasharray="376.8" strokeDashoffset="0.6" fill="transparent" />
                    <circle cx="80" cy="80" r="60" stroke="#f43f5e" strokeWidth="20" strokeDasharray="376.8" strokeDashoffset="376.2" fill="transparent" />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-xl font-bold font-mono text-slate-100">0.172%</p>
                    <p className="text-[10px] text-slate-400">Fraud Ratio</p>
                  </div>
                </div>
                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Legitimate (Class 0)
                    </span>
                    <span className="text-slate-400">284,315</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Fraud (Class 1)
                    </span>
                    <span className="text-rose-400 font-bold">492</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-200">Recent Streamed Transactions</h3>
                <p className="text-xs text-slate-400 font-mono">Showing strict dataset schema (Time, V1–V28, Amount)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                      <th className="p-3">ID</th>
                      <th className="p-3">Time (s)</th>
                      <th className="p-3">Amount ($)</th>
                      <th className="p-3">ML Prob</th>
                      <th className="p-3">Velocity Risk</th>
                      <th className="p-3">Final Risk</th>
                      <th className="p-3">Decision</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {liveTransactions.slice(0, 5).map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-cyan-400 font-bold">{tx.id}</td>
                        <td className="p-3 text-slate-300">{tx.time}</td>
                        <td className="p-3 text-slate-100">${tx.amount.toFixed(2)}</td>
                        <td className="p-3">{(tx.mlProb * 100).toFixed(1)}%</td>
                        <td className="p-3">{(tx.velocityScore * 100).toFixed(0)}%</td>
                        <td className="p-3 font-bold">{tx.finalRisk} / 100</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.decision === 'ALLOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            tx.decision === 'REVIEW' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {tx.decision}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => { setSelectedTx(tx); setActiveTab('analysis'); }}
                            className="text-cyan-400 hover:text-cyan-300 underline text-[11px]"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE MONITOR */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Real-Time Transaction Stream Simulation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Simulates incoming transactions evaluated live by the Adaptive Engine</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                    isPlaying ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'PAUSE STREAM' : 'START SIMULATION'}</span>
                </button>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-xs font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Buffer</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'normal', name: 'Scenario 1: Normal Traffic', desc: 'Standard baseline transaction rate with nominal fraud occurrence.' },
                { id: 'flash_sale', name: 'Scenario 2: Legitimate Surge (Flash Sale)', desc: 'Massive surge in velocity; Adaptive engine prevents false positive blocks.' },
                { id: 'attack', name: 'Scenario 3: High-Velocity Fraud Attack', desc: 'Coordinated surge accompanied by strong ML fraud feature anomalies.' },
              ].map(scen => (
                <button
                  key={scen.id}
                  onClick={() => setSimScenario(scen.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    simScenario === scen.id
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200">{scen.name}</span>
                    {simScenario === scen.id && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{scen.desc}</p>
                </button>
              ))}
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  STREAM FEED (284,807 DATASET ROWS POOL)
                </span>
                <span className="text-xs font-mono text-slate-400">Total Streamed: {liveTransactions.length}</span>
              </div>
              <div className="divide-y divide-slate-800 max-h-[420px] overflow-y-auto">
                {liveTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex flex-wrap justify-between items-center hover:bg-slate-800/20 gap-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2.5 rounded-lg border ${
                        tx.decision === 'ALLOW' ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400' :
                        tx.decision === 'REVIEW' ? 'bg-amber-950/50 border-amber-800 text-amber-400' :
                        'bg-rose-950/50 border-rose-800 text-rose-400'
                      }`}>
                        {tx.decision === 'ALLOW' ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-200">{tx.id}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Time: {tx.time}s</span>
                        </div>
                        <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">${tx.amount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-mono">
                      <div>
                        <p className="text-[10px] text-slate-500">ML PROB</p>
                        <p className="text-slate-200 font-bold">{(tx.mlProb * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">VELOCITY</p>
                        <p className="text-slate-200 font-bold">{(tx.velocityScore * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">RISK SCORE</p>
                        <p className={`font-bold ${tx.finalRisk >= 70 ? 'text-rose-400' : 'text-cyan-300'}`}>{tx.finalRisk}/100</p>
                      </div>
                      <button
                        onClick={() => { setSelectedTx(tx); setActiveTab('analysis'); }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded border border-slate-700 text-[11px]"
                      >
                        Deep Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTION INSPECTOR */}
        {activeTab === 'analysis' && selectedTx && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-cyan-400">TRANSACTION INSPECTOR</span>
                <h2 className="text-lg font-bold text-slate-100 font-mono">{selectedTx.id} Detail Breakdown</h2>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-bold border ${
                selectedTx.decision === 'ALLOW' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                selectedTx.decision === 'REVIEW' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                'bg-rose-950 text-rose-400 border-rose-800'
              }`}>
                DECISION: {selectedTx.decision}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex flex-col justify-between items-center text-center">
                <h3 className="text-xs font-mono text-slate-400 mb-2">COMPOSITE RISK GAUGE</h3>
                <div className="relative flex justify-center items-center my-4">
                  <svg className="w-44 h-44 transform -rotate-90">
                    <circle cx="88" cy="88" r="70" stroke="#1e293b" strokeWidth="16" fill="transparent" />
                    <circle
                      cx="88"
                      cy="88"
                      r="70"
                      stroke={selectedTx.finalRisk >= 70 ? '#f43f5e' : selectedTx.finalRisk >= 40 ? '#f59e0b' : '#10b981'}
                      strokeWidth="16"
                      strokeDasharray="439.8"
                      strokeDashoffset={439.8 - (439.8 * selectedTx.finalRisk) / 100}
                      fill="transparent"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-3xl font-bold font-mono text-slate-100">{selectedTx.finalRisk}</p>
                    <p className="text-[10px] text-slate-500">OUT OF 100</p>
                  </div>
                </div>

                <div className="w-full space-y-2 border-t border-slate-800 pt-3 text-left">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">ML Fraud Probability:</span>
                    <span className="font-mono text-slate-200">{(selectedTx.mlProb * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Velocity Risk Score:</span>
                    <span className="font-mono text-slate-200">{(selectedTx.velocityScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Amount Z-Score:</span>
                    <span className="font-mono text-slate-200">{selectedTx.amountZ} σ</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Explainable Decision Reasoning
                </h3>

                <div className="space-y-3">
                  {[
                    { title: 'ML Fraud Pattern Analysis', desc: selectedTx.mlProb > 0.5 ? 'Strong mathematical signature matches known historical fraud clusters (V14, V17 anomaly detected).' : 'PCA feature vectors align with typical legitimate customer behavior.', severity: selectedTx.mlProb > 0.5 ? 'high' : 'low' },
                    { title: 'Temporal & Velocity Context', desc: selectedTx.velocityScore > 0.7 ? 'High frequency transaction burst detected within rolling 5-minute window.' : 'Normal velocity relative to user baseline.', severity: selectedTx.velocityScore > 0.7 ? 'medium' : 'low' },
                    { title: 'Adaptive Surge Intelligence Correction', desc: (selectedTx.surgeScore > 0.6 && selectedTx.mlProb < 0.2) ? 'SURGE TOLERANCED: Volume burst classified as legitimate macro surge. Risk weight reduced.' : 'Standard surge weight applied without discount.', severity: 'info' }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-3.5 rounded-lg border text-xs ${
                      item.severity === 'high' ? 'bg-rose-950/30 border-rose-800/60 text-rose-200' :
                      item.severity === 'medium' ? 'bg-amber-950/30 border-amber-800/60 text-amber-200' :
                      'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}>
                      <p className="font-bold mb-1 font-mono">{item.title}</p>
                      <p className="text-[11px] opacity-90 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <p className="text-xs font-mono text-slate-400 mb-2">Anonymized Features Snapshot (V1, V2, V3, V14, V17, Amount)</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 font-mono text-[11px]">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">V1</span>
                      <span className="text-slate-200">{selectedTx.v1}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">V2</span>
                      <span className="text-slate-200">{selectedTx.v2}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">V3</span>
                      <span className="text-slate-200">{selectedTx.v3}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">V14</span>
                      <span className={selectedTx.v14 < -3 ? 'text-rose-400 font-bold' : 'text-slate-200'}>{selectedTx.v14}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">V17</span>
                      <span className={selectedTx.v17 < -3 ? 'text-rose-400 font-bold' : 'text-slate-200'}>{selectedTx.v17}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">Amount</span>
                      <span className="text-cyan-300">${selectedTx.amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SURGE INTELLIGENCE */}
        {activeTab === 'surge' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
                <Zap className="w-4 h-4" />
                <span>TEMPORAL VELOCITY & MACRO SURGE DECOUPLING</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100">Adaptive Surge Mitigation Engine</h2>
              <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                Standard velocity models trigger massive false positives during promotional events (e.g., Flash Sales). 
                Our engine dynamic-decouples high velocity from fraud intention by verifying ML component signatures 
                before scaling risk weights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Dynamic Threshold Calibration
                  </h3>
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="text-[11px] font-mono text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset System
                  </button>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Block Risk Threshold:</span>
                      <span className="font-mono text-rose-400 font-bold">{blockThreshold} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      value={blockThreshold}
                      onChange={(e) => setBlockThreshold(Number(e.target.value))}
                      className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Manual Review Threshold:</span>
                      <span className="font-mono text-amber-400 font-bold">{reviewThreshold} / 100</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      value={reviewThreshold}
                      onChange={(e) => setReviewThreshold(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Macro Surge Dampening Multiplier:</span>
                      <span className="font-mono text-cyan-400 font-bold">{surgeTolerance}x</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.1"
                      value={surgeTolerance}
                      onChange={(e) => setSurgeTolerance(Number(e.target.value))}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">Flash Sale Safeguard Matrix</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <span>High Velocity + Low ML Prob</span>
                    <span className="text-emerald-400 font-bold">ALLOWED (Surge Dampened)</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <span>High Velocity + High ML Prob</span>
                    <span className="text-rose-400 font-bold">BLOCKED (Coordinated Attack)</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <span>Normal Velocity + Low ML Prob</span>
                    <span className="text-slate-400">ALLOWED (Baseline)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ML ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-cyan-400">MODEL METRICS</span>
                <h2 className="text-lg font-bold text-slate-100">XGBoost & PCA Feature Distribution</h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">AUC-ROC: 0.984</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Top Feature Importance (Gini Score)</h3>
                <div className="space-y-3 font-mono text-xs">
                  {[
                    { feat: 'V14 (PCA Transformed)', val: 92 },
                    { feat: 'V17 (PCA Transformed)', val: 86 },
                    { feat: 'V12 (PCA Transformed)', val: 74 },
                    { feat: 'V10 (PCA Transformed)', val: 68 },
                    { feat: 'Amount (Log Scaled)', val: 42 },
                  ].map((f, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-300">{f.feat}</span>
                        <span className="text-cyan-400">{f.val}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div style={{ width: `${f.val}%` }} className="bg-cyan-500 h-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Confusion Matrix (Test Evaluation)</h3>
                <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
                  <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <p className="text-slate-500 text-[10px]">TRUE NEGATIVE</p>
                    <p className="text-lg font-bold text-slate-200 mt-1">56,850</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded border border-amber-900/50">
                    <p className="text-amber-400 text-[10px]">FALSE POSITIVE</p>
                    <p className="text-lg font-bold text-amber-400 mt-1">12</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded border border-rose-900/50">
                    <p className="text-rose-400 text-[10px]">FALSE NEGATIVE</p>
                    <p className="text-lg font-bold text-rose-400 mt-1">8</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded border border-emerald-900/50">
                    <p className="text-emerald-400 text-[10px]">TRUE POSITIVE</p>
                    <p className="text-lg font-bold text-emerald-400 mt-1">92</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: RISK ENGINE PIPELINE */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
              <span className="text-xs font-mono text-cyan-400">ARCHITECTURE</span>
              <h2 className="text-lg font-bold text-slate-100">End-to-End Evaluation Pipeline</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 font-mono text-xs">
                {[
                  { step: '1. Ingestion', desc: 'Stream ingestion via Kafka / REST endpoints' },
                  { step: '2. PCA & Feature Scaling', desc: 'StandardScaler on Amount, PCA vector extraction' },
                  { step: '3. Multi-Model Score', desc: 'XGBoost prob + Velocity decay windowing' },
                  { step: '4. Decision Rules', desc: 'Adaptive surge dampening and thresholding' },
                ].map((p, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
                    <p className="text-cyan-400 font-bold">{p.step}</p>
                    <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: API & EXPORT */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-100">REST API Integration</h2>
                <button 
                  onClick={() => alert("Simulated: Exporting live transaction batch as JSON...")}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Buffer JSON
                </button>
              </div>
              <p className="text-xs text-slate-400">Post transaction payload to get real-time score and surge decision.</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                <pre>{`POST /api/v1/evaluate
Host: risk-engine.internal
Content-Type: application/json

{
  "time": 172792,
  "amount": 149.99,
  "v1": -1.359,
  "v2": -0.072,
  "v14": -0.311,
  "v17": 0.208
}

// Response: 200 OK
{
  "transaction_id": "TX-1008",
  "final_risk_score": 12,
  "decision": "ALLOW",
  "surge_adjusted": false
}`}</pre>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}