import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Eye,
  Play,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Database,
  BarChart3,
  Network,
  Layers,
  Brain,
  Radio,
  Leaf,
  Thermometer,
  Navigation,
  Activity,
  Mic,
  MessageSquare,
  Sparkles,
  Info,
  Shield,
  GitBranch,
  Server,
  ArrowRight
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Types (mirrors backend ml/types.ts — client-side only)
// ─────────────────────────────────────────────────────────────────
type ExecutionMode = 'real' | 'hybrid' | 'simulation' | 'algorithm';
type ModelStatus = 'production_real' | 'experimental_hybrid' | 'simulation_demo' | 'research_spec';
type ModelDomain =
  | 'earth-observation'
  | 'computer-vision'
  | 'time-series-forecasting'
  | 'spatial-graph'
  | 'nlp-audio-multimodal';

interface MLModelDefinition {
  modelId: string;
  modelName: string;
  domain: ModelDomain;
  task: string;
  executionMode: ExecutionMode;
  isRealInference: boolean;
  status: ModelStatus;
  description: string;
  primaryArchitecture: string;
  engine: string;
  datasetTrainedOn?: string;
  evaluationMetrics?: {
    metricType: 'measured' | 'not_benchmarked' | 'cited_paper';
    metrics: {
      mIoU?: number | null;
      f1Score?: number | null;
      mAP?: number | null;
      accuracy?: number | null;
      precision?: number | null;
      recall?: number | null;
      rmse?: number | null;
      mae?: number | null;
      r2?: number | null;
    };
  };
  endpoint: string;
  typicalLatencyMs: number;
}

// ─────────────────────────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────────────────────────
const MODE_META: Record<
  ExecutionMode,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode; desc: string }
> = {
  real: {
    label: 'REAL',
    color: 'text-emerald-300',
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-700/60',
    icon: <CheckCircle2 className="w-3 h-3" />,
    desc: 'Actual pretrained weights / official API'
  },
  hybrid: {
    label: 'HYBRID',
    color: 'text-cyan-300',
    bg: 'bg-cyan-950/60',
    border: 'border-cyan-700/60',
    icon: <GitBranch className="w-3 h-3" />,
    desc: 'Real ML + deterministic geospatial post-processing'
  },
  simulation: {
    label: 'SIMULATION',
    color: 'text-amber-300',
    bg: 'bg-amber-950/60',
    border: 'border-amber-700/60',
    icon: <FlaskConical className="w-3 h-3" />,
    desc: 'Algorithmic / physics-based heuristic baseline'
  },
  algorithm: {
    label: 'ALGORITHM',
    color: 'text-indigo-300',
    bg: 'bg-indigo-950/60',
    border: 'border-indigo-700/60',
    icon: <Network className="w-3 h-3" />,
    desc: 'Classical graph / spatial / statistical algorithm'
  }
};

const DOMAIN_META: Record<
  ModelDomain,
  { label: string; icon: React.ReactNode; accent: string }
> = {
  'earth-observation': {
    label: 'Earth Observation',
    icon: <Radio className="w-4 h-4" />,
    accent: 'text-cyan-400'
  },
  'computer-vision': {
    label: 'Computer Vision',
    icon: <Eye className="w-4 h-4" />,
    accent: 'text-orange-400'
  },
  'time-series-forecasting': {
    label: 'Time-Series Forecasting',
    icon: <BarChart3 className="w-4 h-4" />,
    accent: 'text-violet-400'
  },
  'spatial-graph': {
    label: 'Spatial & Graph',
    icon: <Navigation className="w-4 h-4" />,
    accent: 'text-indigo-400'
  },
  'nlp-audio-multimodal': {
    label: 'NLP / Audio / Multimodal',
    icon: <Mic className="w-4 h-4" />,
    accent: 'text-emerald-400'
  }
};

const DOMAIN_FILTER_ORDER: ModelDomain[] = [
  'earth-observation',
  'computer-vision',
  'time-series-forecasting',
  'spatial-graph',
  'nlp-audio-multimodal'
];

function ModeBadge({ mode }: { mode: ExecutionMode }) {
  const m = MODE_META[mode];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${m.bg} ${m.color} ${m.border}`}
      title={m.desc}
    >
      {m.icon}
      {m.label}
    </span>
  );
}

function MetricPill({ label, value }: { label: string; value: number | null | undefined }) {
  if (value == null) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">
      <span className="text-slate-500">{label}:</span>
      <span className="text-white font-semibold">{(value * 100).toFixed(1)}%</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Model Card
// ─────────────────────────────────────────────────────────────────
interface ModelCardProps {
  model: MLModelDefinition;
  onRun: (model: MLModelDefinition) => void;
  isRunning: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onRun, isRunning }) => {
  const [expanded, setExpanded] = useState(false);
  const domainMeta = DOMAIN_META[model.domain];
  const modeMeta = MODE_META[model.executionMode];

  const metrics = model.evaluationMetrics?.metrics;
  const benchmarked = model.evaluationMetrics?.metricType !== 'not_benchmarked';

  return (
    <div
      className={`rounded-xl border bg-slate-900/80 transition-all duration-200 hover:border-slate-600 ${
        expanded ? 'border-slate-600 shadow-lg shadow-black/30' : 'border-slate-800'
      }`}
    >
      {/* Card Header */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Domain icon */}
        <div className={`mt-0.5 shrink-0 ${domainMeta.accent}`}>{domainMeta.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white truncate">{model.modelName}</h3>
            <ModeBadge mode={model.executionMode} />
            {!model.isRealInference && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/60">
                <AlertTriangle className="w-2.5 h-2.5" />
                NOT real inference
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400 line-clamp-1">{model.description}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] text-slate-500 font-mono">{model.primaryArchitecture}</span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock className="w-3 h-3" />
              ~{model.typicalLatencyMs}ms
            </span>
            {benchmarked && metrics && (
              <>
                <MetricPill label="mIoU" value={metrics.mIoU} />
                <MetricPill label="F1" value={metrics.f1Score} />
                <MetricPill label="mAP" value={metrics.mAP} />
                <MetricPill label="Acc" value={metrics.accuracy} />
                <MetricPill label="R²" value={metrics.r2} />
              </>
            )}
            {!benchmarked && (
              <span className="text-[10px] text-slate-600 italic">metrics: not benchmarked</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={e => {
              e.stopPropagation();
              onRun(model);
            }}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-semibold transition-all active:scale-95 shadow shadow-indigo-600/20"
          >
            {isRunning ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            Run
          </button>
          <div className="text-slate-600">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-800 px-4 pb-4 pt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div>
              <div className="text-slate-500 uppercase text-[9px] font-semibold tracking-wider mb-1">Engine</div>
              <div className="text-slate-300 font-mono">{model.engine}</div>
            </div>
            <div>
              <div className="text-slate-500 uppercase text-[9px] font-semibold tracking-wider mb-1">Task</div>
              <div className="text-slate-300">{model.task}</div>
            </div>
            {model.datasetTrainedOn && (
              <div>
                <div className="text-slate-500 uppercase text-[9px] font-semibold tracking-wider mb-1">Training Data</div>
                <div className="text-slate-300">{model.datasetTrainedOn}</div>
              </div>
            )}
            <div>
              <div className="text-slate-500 uppercase text-[9px] font-semibold tracking-wider mb-1">Endpoint</div>
              <div className="text-slate-400 font-mono">{model.endpoint}</div>
            </div>
          </div>

          <div className={`rounded-lg p-3 border ${modeMeta.bg} ${modeMeta.border}`}>
            <div className="flex items-start gap-2">
              <div className={modeMeta.color}>{modeMeta.icon}</div>
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${modeMeta.color}`}>
                  {modeMeta.label} Mode
                </div>
                <div className="text-[11px] text-slate-300">{modeMeta.desc}</div>
                {!model.isRealInference && (
                  <div className="mt-1 text-[10px] text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <strong>isRealInference: false</strong> — no actual model weights loaded yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Inference Result Viewer
// ─────────────────────────────────────────────────────────────────
interface InferenceResult {
  modelId: string;
  modelName: string;
  executionMode: ExecutionMode;
  isRealInference: boolean;
  engine: string;
  latencyMs: number;
  result: any;
  error?: string;
  timestamp: string;
}

function InferenceResultPanel({ result }: { result: InferenceResult }) {
  const modeMeta = MODE_META[result.executionMode];
  const isErr = !!result.error;

  return (
    <div
      className={`rounded-xl border p-4 ${
        isErr ? 'bg-rose-950/30 border-rose-800/60' : 'bg-slate-900 border-slate-700'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <h4 className="text-sm font-bold text-white">{result.modelName}</h4>
        <ModeBadge mode={result.executionMode} />
        {!result.isRealInference && (
          <span className="text-[10px] text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> NOT real inference
          </span>
        )}
        <span className="ml-auto text-[10px] text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {result.latencyMs}ms
        </span>
      </div>

      <div className={`mb-3 text-[10px] font-mono px-2 py-1 rounded border ${modeMeta.bg} ${modeMeta.border} ${modeMeta.color}`}>
        engine: {result.engine}
      </div>

      {isErr ? (
        <div className="text-rose-400 text-xs">{result.error}</div>
      ) : (
        <pre className="text-[10px] text-slate-300 font-mono bg-slate-950/80 rounded-lg p-3 overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
          {JSON.stringify(result.result, null, 2)}
        </pre>
      )}

      <div className="mt-2 text-[10px] text-slate-600">
        {new Date(result.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Flagship Pipeline Viewer
// ─────────────────────────────────────────────────────────────────
interface FlagshipResult {
  loading: boolean;
  data: any | null;
  error: string | null;
}

function FlagshipPipelinePanel({
  result,
  onRun
}: {
  result: FlagshipResult;
  onRun: () => void;
}) {
  const steps = [
    { icon: <Radio className="w-3.5 h-3.5" />, label: 'Sentinel-1 SAR Input', color: 'text-cyan-400' },
    { icon: <Layers className="w-3.5 h-3.5" />, label: 'SegFormer-B2 Waterlogging', color: 'text-cyan-400' },
    { icon: <Shield className="w-3.5 h-3.5" />, label: 'Risk Engine', color: 'text-amber-400' },
    { icon: <Database className="w-3.5 h-3.5" />, label: 'Urban Digital State', color: 'text-indigo-400' },
    { icon: <Navigation className="w-3.5 h-3.5" />, label: 'A* Emergency Routing', color: 'text-violet-400' },
    { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Gemini 3.7 Flash Copilot', color: 'text-emerald-400' },
    { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Work Order / Dispatch', color: 'text-emerald-400' }
  ];

  return (
    <div className="rounded-xl border border-indigo-800/60 bg-gradient-to-br from-slate-900 to-indigo-950/30 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Flagship Showcase Pipeline</h3>
          </div>
          <p className="text-[11px] text-slate-400">
            End-to-end: Sentinel-1 SAR → SegFormer-B2 → Risk Engine → A* Routing → Gemini Copilot
          </p>
        </div>
        <button
          onClick={onRun}
          disabled={result.loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all active:scale-95 shadow shadow-indigo-600/20"
        >
          {result.loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Running…
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              Run Pipeline
            </>
          )}
        </button>
      </div>

      {/* Pipeline steps visualization */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[10px] font-medium ${step.color}`}>
              {step.icon}
              <span>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {result.error && (
        <div className="rounded-lg bg-rose-950/40 border border-rose-800/60 p-3 text-xs text-rose-400">
          {result.error}
        </div>
      )}

      {result.data && (
        <pre className="text-[10px] text-slate-300 font-mono bg-slate-950/80 rounded-lg p-3 overflow-x-auto max-h-80 border border-slate-700 leading-relaxed">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      )}

      {!result.data && !result.error && !result.loading && (
        <div className="text-center py-6 text-slate-600 text-xs">
          Click <strong className="text-slate-400">Run Pipeline</strong> to execute the full flagship chain
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────
export const MLWorkbench: React.FC = () => {
  const [models, setModels] = useState<MLModelDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [domainFilter, setDomainFilter] = useState<ModelDomain | 'all'>('all');
  const [modeFilter, setModeFilter] = useState<ExecutionMode | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [runningModelId, setRunningModelId] = useState<string | null>(null);
  const [inferenceResults, setInferenceResults] = useState<InferenceResult[]>([]);

  const [flagshipResult, setFlagshipResult] = useState<FlagshipResult>({
    loading: false,
    data: null,
    error: null
  });

  const [urbanState, setUrbanState] = useState<any | null>(null);
  const [activePanel, setActivePanel] = useState<'models' | 'pipeline' | 'state'>('models');

  // ── Fetch model registry ──────────────────────────────────────
  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ml/models');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setModels(data.models ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load model registry');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // ── Fetch urban state ─────────────────────────────────────────
  const fetchUrbanState = useCallback(async () => {
    try {
      const res = await fetch('/api/ml/urban-state');
      if (!res.ok) return;
      const data = await res.json();
      setUrbanState(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUrbanState();
  }, [fetchUrbanState]);

  // ── Run a single model inference ──────────────────────────────
  const handleRunModel = useCallback(async (model: MLModelDefinition) => {
    setRunningModelId(model.modelId);
    const start = Date.now();
    try {
      const res = await fetch(`/api/ml/predict/${model.modelId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify((model as any).inputSchema?.samplePayload ?? {})
      });
      const data = await res.json();
      const latencyMs = Date.now() - start;

      const entry: InferenceResult = {
        modelId: model.modelId,
        modelName: model.modelName,
        executionMode: model.executionMode,
        isRealInference: model.isRealInference,
        engine: data.metadata?.engine ?? model.engine,
        latencyMs: data.metadata?.latencyMs ?? latencyMs,
        result: data,
        error: res.ok ? undefined : (data.error ?? `HTTP ${res.status}`),
        timestamp: new Date().toISOString()
      };
      setInferenceResults(prev => [entry, ...prev].slice(0, 10));
      setActivePanel('models');
    } catch (err: any) {
      const entry: InferenceResult = {
        modelId: model.modelId,
        modelName: model.modelName,
        executionMode: model.executionMode,
        isRealInference: model.isRealInference,
        engine: model.engine,
        latencyMs: Date.now() - start,
        result: null,
        error: err.message ?? 'Network error',
        timestamp: new Date().toISOString()
      };
      setInferenceResults(prev => [entry, ...prev].slice(0, 10));
    } finally {
      setRunningModelId(null);
    }
  }, []);

  // ── Run flagship pipeline ─────────────────────────────────────
  const handleRunFlagship = useCallback(async () => {
    setFlagshipResult({ loading: true, data: null, error: null });
    setActivePanel('pipeline');
    try {
      const res = await fetch('/api/ml/pipeline/flagship-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sensorType: 'Sentinel-1B C-Band SAR',
          passId: 'S1B-IW-GRDH-20260817-0645',
          polarization: 'VV+VH',
          locationContext: 'Sector 4 Underpass & Central Canal Basin',
          ward: 'Ward 12',
          imageBase64: null,
          complaintText: 'Major waterlogging reported near underpass, road impassable'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setFlagshipResult({ loading: false, data, error: null });
    } catch (err: any) {
      setFlagshipResult({ loading: false, data: null, error: err.message });
    }
  }, []);

  // ── Filtered model list ───────────────────────────────────────
  const filtered = models.filter(m => {
    if (domainFilter !== 'all' && m.domain !== domainFilter) return false;
    if (modeFilter !== 'all' && m.executionMode !== modeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.modelName.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.primaryArchitecture.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Counts by domain ─────────────────────────────────────────
  const byDomain = DOMAIN_FILTER_ORDER.map(d => ({
    domain: d,
    count: models.filter(m => m.domain === d).length
  }));

  const byMode: Array<{ mode: ExecutionMode | 'all'; label: string; count: number }> = [
    { mode: 'all', label: 'All', count: models.length },
    { mode: 'real', label: 'Real', count: models.filter(m => m.executionMode === 'real').length },
    { mode: 'hybrid', label: 'Hybrid', count: models.filter(m => m.executionMode === 'hybrid').length },
    { mode: 'simulation', label: 'Simulation', count: models.filter(m => m.executionMode === 'simulation').length },
    { mode: 'algorithm', label: 'Algorithm', count: models.filter(m => m.executionMode === 'algorithm').length }
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* ── Header ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <Brain className="w-3.5 h-3.5" />
              ML Model Workbench
            </div>
            <h1 className="text-2xl font-bold text-white">27-Model Intelligence Registry</h1>
            <p className="text-sm text-slate-400 mt-1">
              Transparent ML execution explorer with live inference, execution mode badges, and the flagship SAR → SegFormer → Risk → Gemini pipeline.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Summary stat chips */}
            {byMode.slice(1).map(({ mode, label, count }) => {
              const m = MODE_META[mode as ExecutionMode];
              return (
                <div
                  key={mode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold ${m.bg} ${m.border} ${m.color}`}
                >
                  {m.icon}
                  <span>{count} {label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Panel tabs ── */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
        {(
          [
            { key: 'models', label: 'Model Registry', icon: <Database className="w-3.5 h-3.5" /> },
            { key: 'pipeline', label: 'Flagship Pipeline', icon: <Zap className="w-3.5 h-3.5" /> },
            { key: 'state', label: 'Urban Digital State', icon: <Activity className="w-3.5 h-3.5" /> }
          ] as const
        ).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActivePanel(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activePanel === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Model Registry Panel ── */}
      {activePanel === 'models' && (
        <div className="space-y-4">
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search models, architectures…"
              className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />

            <select
              value={modeFilter}
              onChange={e => setModeFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
            >
              {byMode.map(({ mode, label, count }) => (
                <option key={mode} value={mode}>
                  {label} ({count})
                </option>
              ))}
            </select>

            <button
              onClick={fetchModels}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Refresh model list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Domain tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDomainFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                domainFilter === 'all'
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Server className="w-3 h-3" />
              All ({models.length})
            </button>
            {byDomain.map(({ domain, count }) => {
              const dm = DOMAIN_META[domain];
              return (
                <button
                  key={domain}
                  onClick={() => setDomainFilter(domain)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                    domainFilter === domain
                      ? `bg-slate-700 text-white border-slate-600`
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className={dm.accent}>{dm.icon}</span>
                  {dm.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Loading / error */}
          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading model registry…</span>
            </div>
          )}
          {error && (
            <div className="rounded-xl bg-rose-950/40 border border-rose-800/60 p-4 text-sm text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
              <button onClick={fetchModels} className="ml-auto text-rose-300 underline">
                Retry
              </button>
            </div>
          )}

          {/* Disclaimer banner */}
          {!loading && !error && (
            <div className="rounded-xl bg-amber-950/30 border border-amber-800/50 p-3 flex items-start gap-2 text-[11px] text-amber-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Transparency:</strong> Each model explicitly declares its{' '}
                <code className="bg-amber-950/60 px-1 rounded">executionMode</code> and{' '}
                <code className="bg-amber-950/60 px-1 rounded">isRealInference</code> flag. Models marked{' '}
                <span className="text-rose-400 font-semibold">NOT real inference</span> are algorithmic simulations
                — no trained weights are loaded. Only models marked{' '}
                <span className="text-emerald-400 font-semibold">REAL</span> invoke actual pretrained weights or
                official APIs (Gemini, Whisper, BERT).
              </span>
            </div>
          )}

          {/* Model cards */}
          {!loading && !error && (
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-600 text-sm">
                  No models match your filter.
                </div>
              ) : (
                filtered.map(model => (
                  <ModelCard
                    key={model.modelId}
                    model={model}
                    onRun={handleRunModel}
                    isRunning={runningModelId === model.modelId}
                  />
                ))
              )}
            </div>
          )}

          {/* Inference results */}
          {inferenceResults.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Inference Results
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
                    last {inferenceResults.length}
                  </span>
                </h3>
                <button
                  onClick={() => setInferenceResults([])}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear
                </button>
              </div>
              {inferenceResults.map((r, i) => (
                <InferenceResultPanel key={i} result={r} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Flagship Pipeline Panel ── */}
      {activePanel === 'pipeline' && (
        <FlagshipPipelinePanel result={flagshipResult} onRun={handleRunFlagship} />
      )}

      {/* ── Urban Digital State Panel ── */}
      {activePanel === 'state' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Urban Digital Twin State
            </h3>
            <button
              onClick={fetchUrbanState}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {urbanState ? (
            <pre className="text-[10px] text-slate-300 font-mono bg-slate-950/80 rounded-xl p-4 overflow-x-auto border border-slate-800 leading-relaxed max-h-[70vh]">
              {JSON.stringify(urbanState, null, 2)}
            </pre>
          ) : (
            <div className="text-center py-12 text-slate-600 text-sm">
              No state available yet — run a model or the flagship pipeline to populate the urban digital twin.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
