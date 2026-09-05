'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Cpu, 
  ShieldCheck
} from 'lucide-react';

export const GEMINI_KEY_STORAGE_KEY = 'superads_gemini_api_key';

interface DiscoveredModel {
  name: string;
  id: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedActions: string[];
}

interface TokenAnalytics {
  totals: {
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
    totalCostUsd: number;
    totalRequests: number;
  };
  byTask: Record<string, {
    requests: number;
    promptTokens: number;
    completionTokens: number;
    costUsd: number;
  }>;
  bySource: Record<string, {
    requests: number;
    tokens: number;
    costUsd: number;
  }>;
  recentRecords: Array<{
    id: string;
    timestamp: string;
    model: string;
    task: string;
    source: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
    durationMs: number;
  }>;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (newKey: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'keys' | 'tokens'>('keys');

  // Key Settings State
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(GEMINI_KEY_STORAGE_KEY) || '';
    }
    return '';
  });
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message?: string;
    keySource?: string;
    selectedVisionModel?: string;
    models?: DiscoveredModel[];
  }>({ status: 'idle' });

  // Token Analytics State
  const [analytics, setAnalytics] = useState<TokenAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const fetchTokenAnalytics = async () => {
    setIsLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const res = await fetch('/api/tokens/usage', {
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      if (data.success && data.analytics) {
        setAnalytics(data.analytics);
      } else {
        setAnalyticsError(data.error || 'Failed to fetch token telemetry');
      }
    } catch (err: any) {
      setAnalyticsError(err.message || 'Failed to reach telemetry endpoint');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Fetch token usage when switching to tokens tab or opening modal
  useEffect(() => {
    let isCancelled = false;
    if (isOpen && activeTab === 'tokens') {
      const timer = setTimeout(() => {
        if (!isCancelled) {
          fetchTokenAnalytics();
        }
      }, 0);
      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }
  }, [isOpen, activeTab]);

  const handleSaveKey = () => {
    if (typeof window !== 'undefined') {
      const cleanKey = apiKey.trim();
      if (cleanKey) {
        localStorage.setItem(GEMINI_KEY_STORAGE_KEY, cleanKey);
      } else {
        localStorage.removeItem(GEMINI_KEY_STORAGE_KEY);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
      if (onKeyUpdated) {
        onKeyUpdated(cleanKey);
      }
    }
  };

  const handleClearKey = () => {
    setApiKey('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GEMINI_KEY_STORAGE_KEY);
    }
    setTestResult({ status: 'idle' });
    if (onKeyUpdated) {
      onKeyUpdated('');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult({ status: 'idle' });

    try {
      const cleanKey = apiKey.trim();
      const headers: Record<string, string> = {};
      if (cleanKey) {
        headers['x-gemini-api-key'] = cleanKey;
      }

      const res = await fetch('/api/models', {
        headers,
        signal: AbortSignal.timeout(6000),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setTestResult({
          status: 'error',
          message: data.error || 'Failed to authenticate with Gemini API',
        });
      } else {
        setTestResult({
          status: 'success',
          message: `Connected successfully (${data.modelsCount || data.models?.length || 0} models discovered)`,
          keySource: data.keySource,
          selectedVisionModel: data.selectedVisionModel,
          models: data.models || [],
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err.message || 'Network error while contacting Gemini model endpoint',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">AI & Model Settings</h2>
              <p className="text-xs text-zinc-400">Zero-hardcode model discovery & token consumption ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/30 px-6 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2 py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'keys'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key className="w-4 h-4" />
            API Key & Dynamic Discovery
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`flex items-center gap-2 py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tokens'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Token & Cost Monitor
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'keys' && (
            <div className="space-y-6">
              {/* Key Input Section */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Google Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key (e.g. AIzaSy...)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Saved strictly in local browser storage; passed via request headers.
                  </span>
                  {isSaved && (
                    <span className="text-emerald-400 font-medium animate-in fade-in">
                      ✓ Saved to localStorage!
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveKey}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  Save Key Locally
                </button>
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testing Models...' : 'Test Connection & Discover Models'}
                </button>
                {apiKey && (
                  <button
                    onClick={handleClearKey}
                    className="px-3 py-2 rounded-xl text-zinc-400 hover:text-red-400 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Clear Key
                  </button>
                )}
              </div>

              {/* Connection Status Banner */}
              {testResult.status === 'success' && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {testResult.message}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 pt-1">
                    <div>
                      <span className="text-zinc-500">Key Source: </span>
                      <code className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-emerald-400 font-mono">
                        {testResult.keySource}
                      </code>
                    </div>
                    <div>
                      <span className="text-zinc-500">Active Vision Model: </span>
                      <code className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-indigo-400 font-mono">
                        {testResult.selectedVisionModel}
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {testResult.status === 'error' && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-start gap-3 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-200">Connection Failed</p>
                    <p className="text-zinc-400 mt-0.5">{testResult.message}</p>
                  </div>
                </div>
              )}

              {/* Discovered Models List */}
              {testResult.models && testResult.models.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Discovered Gemini Models ({testResult.models.length})</span>
                    <span className="text-[10px] text-zinc-500 font-normal lowercase">queried via @google/genai pager</span>
                  </h3>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {testResult.models.map((m) => {
                      const isVision = m.id === testResult.selectedVisionModel;
                      return (
                        <div
                          key={m.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            isVision
                              ? 'bg-indigo-950/40 border-indigo-700/60 text-indigo-200'
                              : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">{m.id}</span>
                              {isVision && (
                                <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                                  Default Vision
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate max-w-md">
                              {m.displayName || m.description}
                            </p>
                          </div>
                          <div className="text-right text-[10px] text-zinc-400 font-mono">
                            <div>Input: {m.inputTokenLimit ? (m.inputTokenLimit / 1000).toFixed(0) + 'k' : 'N/A'}</div>
                            <div>Output: {m.outputTokenLimit ? (m.outputTokenLimit / 1000).toFixed(0) + 'k' : 'N/A'}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Informational Card */}
              <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-xs text-zinc-400 space-y-1.5">
                <p className="font-medium text-zinc-300">Ambient Credentials & Microservice Guarantee</p>
                <p>
                  If you leave this field blank, SuperAds automatically falls back to environment variables or ambient host credentials (such as active Google Cloud Code Assist tokens), allowing seamless operation across SYNPHONYS and Hermes multi-agent workflows.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="space-y-6">
              {/* Header with Refresh Button */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Real-time Consumption & Cost Ledger
                </span>
                <button
                  onClick={fetchTokenAnalytics}
                  disabled={isLoadingAnalytics}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {analyticsError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  {analyticsError}
                </div>
              )}

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 font-medium">Total Tokens</div>
                  <div className="text-xl font-bold text-white font-mono mt-1">
                    {(analytics?.totals?.totalTokens || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                    Prompt: {(analytics?.totals?.totalPromptTokens || 0).toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 font-medium">Estimated Cost</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                    ${(analytics?.totals?.totalCostUsd || 0).toFixed(4)}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    USD based on model tiers
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 font-medium">Completion Tokens</div>
                  <div className="text-xl font-bold text-indigo-400 font-mono mt-1">
                    {(analytics?.totals?.totalCompletionTokens || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Generated JSON contracts
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 font-medium">Total API Requests</div>
                  <div className="text-xl font-bold text-zinc-200 font-mono mt-1">
                    {(analytics?.totals?.totalRequests || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Across all endpoints
                  </div>
                </div>
              </div>

              {/* Task Breakdown Table */}
              {analytics?.byTask && Object.keys(analytics.byTask).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Consumption by Task
                  </h3>
                  <div className="border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 text-[11px]">
                        <tr>
                          <th className="px-3 py-2 font-medium">Task</th>
                          <th className="px-3 py-2 font-medium">Requests</th>
                          <th className="px-3 py-2 font-medium">Prompt Tokens</th>
                          <th className="px-3 py-2 font-medium">Completion Tokens</th>
                          <th className="px-3 py-2 font-medium text-right">Cost (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50 bg-zinc-900/30 text-zinc-300 font-mono">
                        {Object.entries(analytics.byTask).map(([task, data]) => (
                          <tr key={task} className="hover:bg-zinc-800/40">
                            <td className="px-3 py-2 text-white font-sans">{task}</td>
                            <td className="px-3 py-2">{data.requests}</td>
                            <td className="px-3 py-2">{data.promptTokens.toLocaleString()}</td>
                            <td className="px-3 py-2">{data.completionTokens.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right text-emerald-400">${data.costUsd.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Caller Attribution Pills */}
              {analytics?.bySource && Object.keys(analytics.bySource).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Caller Origin Breakdown
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(analytics.bySource).map(([src, d]) => (
                      <div
                        key={src}
                        className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs flex items-center gap-2"
                      >
                        <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">
                          {src}
                        </span>
                        <span className="text-zinc-400 font-mono text-[11px]">
                          {d.requests} reqs · ${d.costUsd.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Request Ledger */}
              {analytics?.recentRecords && analytics.recentRecords.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Recent Request Ledger (Last {analytics.recentRecords.length})
                  </h3>
                  <div className="border border-zinc-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 font-medium">Time</th>
                          <th className="px-3 py-2 font-medium">Task</th>
                          <th className="px-3 py-2 font-medium">Model</th>
                          <th className="px-3 py-2 font-medium">Caller</th>
                          <th className="px-3 py-2 font-medium">Tokens</th>
                          <th className="px-3 py-2 font-medium text-right">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50 bg-zinc-900/30 text-zinc-300 font-mono">
                        {analytics.recentRecords.slice(0, 15).map((r) => (
                          <tr key={r.id} className="hover:bg-zinc-800/40">
                            <td className="px-3 py-1.5 text-zinc-400 text-[10px]">
                              {new Date(r.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-3 py-1.5 text-white font-sans">{r.task}</td>
                            <td className="px-3 py-1.5 text-indigo-300">{r.model}</td>
                            <td className="px-3 py-1.5 uppercase text-[10px] text-zinc-400">{r.source}</td>
                            <td className="px-3 py-1.5">{r.totalTokens}</td>
                            <td className="px-3 py-1.5 text-right text-emerald-400">${r.costUsd.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/60 text-xs text-zinc-400">
          <span>SuperAds Dynamic Microservice Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
