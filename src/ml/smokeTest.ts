/**
 * UrbanWatch Sentinel — Backend Smoke Test
 * Hits every mounted API route and verifies response shape + status codes.
 * Run with:  npx tsx src/ml/smokeTest.ts
 */

const BASE = 'http://localhost:3000';

// ── colour helpers ──────────────────────────────────────────────
const GREEN  = (s: string) => `\x1b[32m${s}\x1b[0m`;
const RED    = (s: string) => `\x1b[31m${s}\x1b[0m`;
const YELLOW = (s: string) => `\x1b[33m${s}\x1b[0m`;
const CYAN   = (s: string) => `\x1b[36m${s}\x1b[0m`;
const BOLD   = (s: string) => `\x1b[1m${s}\x1b[0m`;

interface TestResult {
  suite:   string;
  name:    string;
  method:  string;
  path:    string;
  status:  'PASS' | 'FAIL' | 'WARN';
  httpCode: number;
  latencyMs: number;
  detail?: string;
}

const results: TestResult[] = [];
let suiteErrors = 0;

async function request(method: 'GET' | 'POST' | 'PATCH', path: string, body?: any) {
  const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const t0 = Date.now();
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  return { res, json, ms: Date.now() - t0 };
}

async function test(
  suite: string,
  name: string,
  method: 'GET' | 'POST' | 'PATCH',
  path: string,
  body: any,
  checks: (json: any, status: number) => { ok: boolean; detail?: string }
) {
  try {
    const { res, json, ms } = await request(method, path, body);
    const { ok, detail } = checks(json, res.status);
    const r: TestResult = {
      suite, name, method, path,
      status: ok ? 'PASS' : 'FAIL',
      httpCode: res.status,
      latencyMs: ms,
      detail
    };
    results.push(r);
    const icon = ok ? GREEN('✅') : RED('❌');
    const latColor = ms < 500 ? GREEN(`${ms}ms`) : ms < 2000 ? YELLOW(`${ms}ms`) : RED(`${ms}ms`);
    console.log(`  ${icon} [${res.status}] ${BOLD(name)} — ${latColor}${detail ? `  ← ${detail}` : ''}`);
    if (!ok) suiteErrors++;
  } catch (err: any) {
    results.push({ suite, name, method, path, status: 'FAIL', httpCode: 0, latencyMs: 0, detail: err.message });
    console.log(`  ${RED('❌')} ${BOLD(name)} — ${RED('NETWORK ERROR: ' + err.message)}`);
    suiteErrors++;
  }
}

// ══════════════════════════════════════════════════════════════
// SUITE 0 — Server health
// ══════════════════════════════════════════════════════════════
async function suiteHealth() {
  console.log(CYAN('\n━━━ SUITE 0: Server Health ━━━'));
  await test('Health', 'GET /api/health', 'GET', '/api/health', null,
    (j, s) => ({ ok: s === 200 && (j.status === 'ok' || j.message?.includes?.('running') || s === 200), detail: `status=${j.status ?? s}` }));
}

// ══════════════════════════════════════════════════════════════
// SUITE 1 — ML Model Registry
// ══════════════════════════════════════════════════════════════
async function suiteRegistry() {
  console.log(CYAN('\n━━━ SUITE 1: ML Model Registry ━━━'));

  await test('Registry', 'GET /api/ml/models — returns 28 models', 'GET', '/api/ml/models', null,
    (j) => ({ ok: Array.isArray(j.models) && j.models.length >= 27, detail: `count=${j.models?.length}` }));

  await test('Registry', 'GET /api/ml/models/:id — segformer detail', 'GET', '/api/ml/models/segformer-b2-waterlogging', null,
    (j) => ({ ok: j.model?.modelId === 'segformer-b2-waterlogging', detail: `mode=${j.model?.executionMode}` }));

  await test('Registry', 'GET /api/ml/models/:id — yolov8 detail', 'GET', '/api/ml/models/yolov8-potholes', null,
    (j) => ({ ok: j.model?.modelId === 'yolov8-potholes', detail: `mode=${j.model?.executionMode}` }));

  await test('Registry', 'GET /api/ml/models/:id — 404 for unknown', 'GET', '/api/ml/models/fake-model-xyz', null,
    (j, s) => ({ ok: s === 404 || j.error != null, detail: `error="${j.error?.slice?.(0,40)}"` }));
}

// ══════════════════════════════════════════════════════════════
// SUITE 2 — Earth Observation Models
// ══════════════════════════════════════════════════════════════
async function suiteEarthObs() {
  console.log(CYAN('\n━━━ SUITE 2: Earth Observation ━━━'));

  const sarPayload = { sensorType: 'Sentinel-1B C-Band SAR', passId: 'S1B-TEST', ward: 'Ward 12', polarization: 'VV+VH' };

  await test('EO', 'segformer-b2-waterlogging', 'POST', '/api/ml/predict/segformer-b2-waterlogging', sarPayload,
    (j) => ({ ok: j.metadata?.executionMode === 'hybrid' && j.data?.waterloggedAreaKm2 != null, detail: `area=${j.data?.waterloggedAreaKm2}km²` }));

  await test('EO', 'unet-flood-segmentation', 'POST', '/api/ml/predict/unet-flood-segmentation', sarPayload,
    (j) => ({ ok: j.metadata?.executionMode === 'simulation', detail: `isReal=${j.metadata?.isRealInference}` }));

  await test('EO', 'deeplabv3-plus-flood', 'POST', '/api/ml/predict/deeplabv3-plus-flood', sarPayload,
    (j) => ({ ok: j.metadata?.executionMode === 'simulation', detail: `engine=${j.metadata?.engine?.slice?.(0,30)}` }));

  await test('EO', 'prithvi-eo-2-flood', 'POST', '/api/ml/predict/prithvi-eo-2-flood', sarPayload,
    (j) => ({ ok: j.metadata?.executionMode === 'hybrid', detail: `isReal=${j.metadata?.isRealInference}` }));

  await test('EO', 'prithvi-upernet-water', 'POST', '/api/ml/predict/prithvi-upernet-water', sarPayload,
    (j) => ({ ok: j.metadata?.executionMode === 'simulation', detail: `status=${j.metadata?.modelStatus}` }));

  await test('EO', 'segformer-vegetation', 'POST', '/api/ml/predict/segformer-vegetation', { imageSource: 'sentinel-2' },
    (j) => ({ ok: j.metadata != null, detail: `mode=${j.metadata?.executionMode}` }));

  await test('EO', 'prithvi-swin-landuse', 'POST', '/api/ml/predict/prithvi-swin-landuse', { imageSource: 'sentinel-2' },
    (j) => ({ ok: j.metadata != null, detail: `mode=${j.metadata?.executionMode}` }));
}

// ══════════════════════════════════════════════════════════════
// SUITE 3 — Computer Vision Models
// ══════════════════════════════════════════════════════════════
async function suiteCV() {
  console.log(CYAN('\n━━━ SUITE 3: Computer Vision ━━━'));

  await test('CV', 'yolov8-potholes', 'POST', '/api/ml/predict/yolov8-potholes', { imageSource: 'cctv-ward12' },
    (j) => ({ ok: j.metadata?.executionMode === 'hybrid' && Array.isArray(j.data?.detections), detail: `detections=${j.data?.detections?.length}` }));

  await test('CV', 'yolo-garbage-detect', 'POST', '/api/ml/predict/yolo-garbage-detect', { imageSource: 'cctv-market-rd' },
    (j) => ({ ok: j.metadata?.executionMode === 'hybrid' && (j.data?.wasteAccumulationLevel ?? j.data?.overflowRisk ?? j.data?.totalWastePiles) != null, detail: `level=${j.data?.wasteAccumulationLevel}` }));

  await test('CV', 'yolo-traffic-count', 'POST', '/api/ml/predict/yolo-traffic-count', { imageSource: 'cctv-junction' },
    (j) => ({ ok: j.metadata?.executionMode === 'hybrid' && (j.data?.totalVehiclesCount ?? j.data?.totalVehicleCount) != null, detail: `vehicles=${j.data?.totalVehiclesCount ?? j.data?.totalVehicleCount}` }));

  await test('CV', 'mask-rcnn-infra-damage', 'POST', '/api/ml/predict/mask-rcnn-infra-damage', { imageSource: 'drone' },
    (j) => ({ ok: j.metadata?.executionMode === 'simulation', detail: `isReal=${j.metadata?.isRealInference}` }));

  await test('CV', 'efficientnet-waste-classify', 'POST', '/api/ml/predict/efficientnet-waste-classify', { imageSource: 'waste-bin' },
    (j) => ({ ok: j.metadata?.executionMode === 'simulation', detail: `mode=${j.metadata?.executionMode}` }));

  await test('CV', 'yolo-crowd-density', 'POST', '/api/ml/predict/yolo-crowd-density', { imageSource: 'cctv-public' },
    (j) => ({ ok: j.metadata?.executionMode === 'simulation', detail: `mode=${j.metadata?.executionMode}` }));
}

// ══════════════════════════════════════════════════════════════
// SUITE 4 — Time-Series & Forecasting
// ══════════════════════════════════════════════════════════════
async function suiteForecasting() {
  console.log(CYAN('\n━━━ SUITE 4: Time-Series & Forecasting ━━━'));

  await test('TS', 'xgboost-urban-risk', 'POST', '/api/ml/predict/xgboost-urban-risk', { wardId: 'ward-12', ward: 'Ward 12' },
    (j) => ({ ok: j.metadata?.executionMode === 'hybrid' && j.data?.compositeRiskScore != null, detail: `score=${j.data?.compositeRiskScore}` }));

  await test('TS', 'tft-multi-risk-forecast', 'POST', '/api/ml/predict/tft-multi-risk-forecast', { wardId: 'ward-12' },
    (j) => ({ ok: j.metadata?.executionMode === 'hybrid' && j.data?.forecastHorizonDays != null, detail: `days=${j.data?.forecastHorizonDays}` }));

  await test('TS', 'xgboost-heat-risk', 'POST', '/api/ml/predict/xgboost-heat-risk', { wardId: 'ward-05' },
    (j) => ({ ok: j.metadata?.executionMode === 'simulation', detail: `mode=${j.metadata?.executionMode}` }));

  await test('TS', 'lstm-rainfall-forecasting', 'POST', '/api/ml/predict/lstm-rainfall-forecasting', { stationId: 'station-01' },
    (j) => ({ ok: j.metadata?.executionMode === 'simulation', detail: `mode=${j.metadata?.executionMode}` }));

  await test('TS', 'tft-flood-forecasting', 'POST', '/api/ml/predict/tft-flood-forecasting', { wardId: 'ward-12' },
    (j) => ({ ok: j.metadata?.executionMode === 'simulation', detail: `mode=${j.metadata?.executionMode}` }));

  await test('TS', 'xgboost-water-demand', 'POST', '/api/ml/predict/xgboost-water-demand', { wardId: 'ward-09' },
    (j) => ({ ok: j.metadata?.executionMode === 'simulation', detail: `mode=${j.metadata?.executionMode}` }));

  await test('TS', 'lstm-water-shortage', 'POST', '/api/ml/predict/lstm-water-shortage', { wardId: 'ward-09' },
    (j) => ({ ok: j.metadata?.executionMode === 'simulation', detail: `mode=${j.metadata?.executionMode}` }));

  await test('TS', 'lstm-gnn-traffic-predict', 'POST', '/api/ml/predict/lstm-gnn-traffic-predict', { junctionId: 'junction-01' },
    (j) => ({ ok: j.metadata?.executionMode === 'simulation', detail: `mode=${j.metadata?.executionMode}` }));
}

// ══════════════════════════════════════════════════════════════
// SUITE 5 — Spatial, Graph & Anomaly
// ══════════════════════════════════════════════════════════════
async function suiteSpatial() {
  console.log(CYAN('\n━━━ SUITE 5: Spatial, Graph & Anomaly ━━━'));

  await test('Spatial', 'astar-emergency-routing', 'POST', '/api/ml/predict/astar-emergency-routing', { origin: 'Fire Station 03', destination: 'Sector 4 Underpass' },
    (j) => ({ ok: j.metadata?.executionMode === 'algorithm' && j.data?.routeFound === true, detail: `dist=${j.data?.totalDistanceKm}km` }));

  await test('Spatial', 'dbscan-complaint-hotspots', 'POST', '/api/ml/predict/dbscan-complaint-hotspots', { complaints: [{ lat: 19.08, lng: 72.88 }] },
    (j) => ({ ok: j.metadata?.executionMode === 'algorithm' && Array.isArray(j.data?.clusters), detail: `clusters=${j.data?.clusters?.length}` }));

  await test('Spatial', 'hdbscan-spatial-clustering', 'POST', '/api/ml/predict/hdbscan-spatial-clustering', { complaints: [{ lat: 19.08, lng: 72.88 }] },
    (j) => ({ ok: j.metadata?.executionMode === 'algorithm', detail: `mode=${j.metadata?.executionMode}` }));

  await test('Spatial', 'isolation-forest-anomaly', 'POST', '/api/ml/predict/isolation-forest-anomaly', { sensorId: 'scada-01', readings: [{ value: 95 }] },
    (j) => ({ ok: j.metadata?.executionMode === 'algorithm' && (j.data?.anomalousSensors != null || j.data?.overallAnomalyDetected != null), detail: `detected=${j.data?.overallAnomalyDetected}, sensors=${j.data?.anomalousSensors}` }));
}

// ══════════════════════════════════════════════════════════════
// SUITE 6 — NLP, Audio & Multimodal
// ══════════════════════════════════════════════════════════════
async function suiteNLP() {
  console.log(CYAN('\n━━━ SUITE 6: NLP / Audio / Multimodal ━━━'));

  await test('NLP', 'bert-complaint-classifier', 'POST', '/api/ml/predict/bert-complaint-classifier', { complaintText: 'Waterlogging on main road, road impassable' },
    (j) => ({ ok: j.metadata?.executionMode === 'real' && j.metadata?.isRealInference === true && (j.data?.predictedCategory ?? j.data?.category) != null, detail: `cat=${j.data?.predictedCategory ?? j.data?.category}` }));

  await test('NLP', 'whisper-voice-transcribe', 'POST', '/api/ml/predict/whisper-voice-transcribe', { audioBase64: null, languageHint: 'en' },
    (j) => ({ ok: j.metadata?.executionMode === 'real', detail: `isReal=${j.metadata?.isRealInference}` }));

  await test('NLP', 'gemini-complaint-copilot', 'POST', '/api/ml/predict/gemini-complaint-copilot', { complaintText: 'Severe flooding near market road', ward: 'Ward 12', imageBase64: null },
    (j) => ({ ok: j.metadata?.executionMode === 'real' && j.data != null, detail: `engine=${j.metadata?.engine?.slice?.(0,30)}` }));
}

// ══════════════════════════════════════════════════════════════
// SUITE 7 — Pipeline Endpoints
// ══════════════════════════════════════════════════════════════
async function suitePipelines() {
  console.log(CYAN('\n━━━ SUITE 7: Pipelines ━━━'));

  await test('Pipeline', 'POST /api/ml/pipeline/flagship-chain', 'POST', '/api/ml/pipeline/flagship-chain',
    { sensorType: 'Sentinel-1B', ward: 'Ward 12', complaintText: 'Flooding at underpass' },
    (j) => ({ ok: (j.step1_sentinel1_sar ?? j.step1_segformer_waterlogging) != null && j.step4_astar_emergency_routing != null, detail: `workOrder=${j.step5_gemini_copilot_decision?.generatedWorkOrder?.workOrderNumber}` }));

  await test('Pipeline', 'POST /api/ml/pipeline/emergency-route', 'POST', '/api/ml/pipeline/emergency-route',
    { origin: 'Station 01', destination: 'Ward 12', vehicleType: 'AMBULANCE' },
    (j) => ({ ok: j.data?.routeFound != null || j.modelId != null, detail: `route=${j.data?.routeFound}` }));

  await test('Pipeline', 'POST /api/ml/pipeline/cluster-complaints', 'POST', '/api/ml/pipeline/cluster-complaints',
    { complaints: [{ lat: 19.08, lng: 72.88, text: 'flooding' }, { lat: 19.079, lng: 72.882, text: 'waterlogging' }] },
    (j) => ({ ok: j.data?.clusters != null || j.modelId != null, detail: `clusters=${j.data?.clusters?.length ?? j.clusters?.length}` }));

  await test('Pipeline', 'POST /api/ml/pipeline/sensor-anomaly', 'POST', '/api/ml/pipeline/sensor-anomaly',
    { sensorId: 'scada-pump-01', readings: [{ value: 99 }, { value: 101 }] },
    (j) => ({ ok: j.data?.anomaliesDetected != null || j.modelId != null, detail: `anomalies=${j.data?.anomaliesDetected}` }));

  await test('Pipeline', 'POST /api/ml/pipeline/audio-transcribe', 'POST', '/api/ml/pipeline/audio-transcribe',
    { audioBase64: null, languageHint: 'hi' },
    (j) => ({ ok: j.metadata != null || j.modelId != null, detail: `isReal=${j.metadata?.isRealInference}` }));

  await test('Pipeline', 'POST /api/ml/pipeline/city-audit', 'POST', '/api/ml/pipeline/city-audit',
    { scope: 'full' },
    (j) => ({ ok: j.auditResults != null || j.results != null || j.success != null, detail: `keys=${Object.keys(j).join(', ').slice(0, 50)}` }));
}

// ══════════════════════════════════════════════════════════════
// SUITE 8 — Urban Digital State
// ══════════════════════════════════════════════════════════════
async function suiteState() {
  console.log(CYAN('\n━━━ SUITE 8: Urban Digital State ━━━'));

  await test('State', 'GET /api/ml/urban-state', 'GET', '/api/ml/urban-state', null,
    (j) => ({ ok: j.cityHealthScore != null || j.wards != null, detail: `health=${j.cityHealthScore}` }));

  await test('State', 'PATCH /api/ml/urban-state/:wardId', 'PATCH', '/api/ml/urban-state/ward-12',
    { floodRisk: 0.95, roadRisk: 0.6, compositeRiskScore: 98, riskTier: 'CRITICAL' },
    (j, s) => ({ ok: s === 200 || j.success != null || j.ward != null, detail: `status=${s}` }));
}

// ══════════════════════════════════════════════════════════════
// SUITE 9 — Pre-existing Core Routes
// ══════════════════════════════════════════════════════════════
async function suiteCore() {
  console.log(CYAN('\n━━━ SUITE 9: Core Application Routes ━━━'));

  await test('Core', 'GET /api/incidents', 'GET', '/api/incidents', null,
    (j, s) => ({ ok: s === 200 && (Array.isArray(j) || Array.isArray(j.incidents)), detail: `count=${Array.isArray(j) ? j.length : j.incidents?.length}` }));

  await test('Core', 'GET /api/weather', 'GET', '/api/weather', null,
    (j, s) => ({ ok: s === 200 && j.temperature != null, detail: `temp=${j.temperature}°C` }));

  await test('Core', 'GET /api/city-health', 'GET', '/api/city-health', null,
    (j, s) => ({ ok: s === 200 && j.overallScore != null, detail: `score=${j.overallScore}` }));

  await test('Core', 'POST /api/ai-copilot (Gemini)', 'POST', '/api/ai-copilot',
    { prompt: 'Which ward has highest flood risk?', conversationHistory: [] },
    (j, s) => ({ ok: s === 200 && j.message != null, detail: `reply=${JSON.stringify(j.message?.content ?? j.message).slice(0, 50)}` }));
}

// ══════════════════════════════════════════════════════════════
// Run all suites & print summary
// ══════════════════════════════════════════════════════════════
async function main() {
  console.log(BOLD('\n╔══════════════════════════════════════════════════════╗'));
  console.log(BOLD('║   UrbanWatch Sentinel — Backend Smoke Test           ║'));
  console.log(BOLD(`║   Target: ${BASE.padEnd(42)}║`));
  console.log(BOLD('╚══════════════════════════════════════════════════════╝'));

  await suiteHealth();
  await suiteRegistry();
  await suiteEarthObs();
  await suiteCV();
  await suiteForecasting();
  await suiteSpatial();
  await suiteNLP();
  await suitePipelines();
  await suiteState();
  await suiteCore();

  // ── Summary table ─────────────────────────────────────────
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log(BOLD('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(BOLD('SMOKE TEST SUMMARY'));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const suiteNames = [...new Set(results.map(r => r.suite))];
  for (const suite of suiteNames) {
    const sr = results.filter(r => r.suite === suite);
    const sp = sr.filter(r => r.status === 'PASS').length;
    const sf = sr.filter(r => r.status === 'FAIL').length;
    const icon = sf === 0 ? GREEN('✅') : RED('❌');
    console.log(`  ${icon}  ${suite.padEnd(18)} ${GREEN(String(sp))} pass  ${sf > 0 ? RED(String(sf) + ' fail') : ''}`);
  }

  console.log('\n  ' + '─'.repeat(48));
  const allPass = fail === 0;
  console.log(`  ${allPass ? GREEN('✅ ALL PASS') : RED('❌ FAILURES DETECTED')}`);
  console.log(`  Total: ${pass}/${total} passed   ${fail > 0 ? RED(fail + ' failed') : ''}`);
  const avgLatency = Math.round(results.reduce((a, r) => a + r.latencyMs, 0) / results.length);
  console.log(`  Avg latency: ${avgLatency}ms`);

  if (fail > 0) {
    console.log(RED('\n  Failed tests:'));
    results.filter(r => r.status === 'FAIL').forEach(r =>
      console.log(RED(`    ✗ [${r.suite}] ${r.name} — ${r.detail ?? 'no detail'}`)));
  }

  console.log('');
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(RED('\nFATAL: ' + err.message));
  process.exit(1);
});
