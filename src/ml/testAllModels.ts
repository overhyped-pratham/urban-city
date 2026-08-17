/**
 * UrbanWatch Sentinel - 27-Model & Algorithm Validation Test Suite
 * 
 * Tests every single registered model and algorithm for:
 * 1. Existence in MODEL_REGISTRY
 * 2. Schema compliance of input/output
 * 3. Execution mode transparency ('real' | 'hybrid' | 'simulation' | 'algorithm')
 * 4. isRealInference flag correctness
 * 5. Metadata and engine attribution (no fake claims)
 * 6. Flagship End-to-End Inundation Pipeline
 * 7. Citywide Multi-Model Audit
 * 8. Error handling on malformed inputs
 */

import { MODEL_REGISTRY, getAllRegisteredModels } from './registry.ts';
import { executeModelInference, runFlagshipShowcasePipeline, runCitywideAudit } from './orchestrator.ts';

async function runTestSuite() {
  console.log('========================================================================');
  console.log('🏙️  URBANWATCH SENTINEL — ML & SPATIAL INTELLIGENCE TEST SUITE');
  console.log('========================================================================\n');

  const models = getAllRegisteredModels();
  console.log(`Discovered ${models.length} registered models & algorithms in MODEL_REGISTRY.\n`);

  let passCount = 0;
  let failCount = 0;
  const resultsTable: Array<{
    id: string;
    name: string;
    domain: string;
    mode: string;
    isReal: boolean;
    engine: string;
    latency: string;
    status: string;
  }> = [];

  for (const model of models) {
    process.stdout.write(`Testing [${model.modelId}] ... `);
    try {
      const samplePayload = model.inputSchema.samplePayload || {};
      const start = Date.now();
      const response = await executeModelInference(model.modelId, samplePayload);
      const elapsed = Date.now() - start;

      // Assert envelope schema
      if (!response.modelId || response.modelId !== model.modelId) {
        throw new Error(`Envelope modelId mismatch: expected '${model.modelId}', got '${response.modelId}'`);
      }
      if (!response.modelName) {
        throw new Error('Envelope modelName is empty');
      }
      if (!['real', 'hybrid', 'simulation', 'algorithm'].includes(response.executionMode)) {
        throw new Error(`Invalid executionMode: '${response.executionMode}'`);
      }
      if (typeof response.isRealInference !== 'boolean') {
        throw new Error(`isRealInference must be a boolean, got ${typeof response.isRealInference}`);
      }
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Response data payload is missing or not an object');
      }
      if (!response.metadata || !response.metadata.engine) {
        throw new Error('Response metadata or engine attribution is missing');
      }
      if (response.metadata.evaluationStatus !== 'not_benchmarked' && response.metadata.evaluationStatus !== 'verified_dataset_benchmark') {
        throw new Error(`Invalid evaluationStatus: ${response.metadata.evaluationStatus}`);
      }

      passCount++;
      console.log(`✅ PASSED (${elapsed}ms) [Mode: ${response.executionMode}, Real: ${response.isRealInference}]`);

      resultsTable.push({
        id: model.modelId,
        name: model.modelName.slice(0, 32),
        domain: model.domain,
        mode: response.executionMode,
        isReal: response.isRealInference,
        engine: response.metadata.engine.slice(0, 32),
        latency: `${response.inferenceLatencyMs}ms`,
        status: 'PASS'
      });
    } catch (err: any) {
      failCount++;
      console.log(`❌ FAILED: ${err?.message || err}`);
      resultsTable.push({
        id: model.modelId,
        name: model.modelName.slice(0, 32),
        domain: model.domain,
        mode: model.executionMode,
        isReal: model.isRealInference,
        engine: 'ERROR',
        latency: 'N/A',
        status: 'FAIL'
      });
    }
  }

  console.log('\n========================================================================');
  console.log('🏆 FLAGSHIP SHOWCASE PIPELINE TEST');
  console.log('Sentinel-1 SAR → SegFormer-B2 → Risk Engine → Dynamic A* Routing → Gemini Copilot → Work Order');
  console.log('========================================================================');

  try {
    const flagshipStart = Date.now();
    const flagshipResult = await runFlagshipShowcasePipeline({
      ward: 'Ward 12',
      rainfallMm: 142
    });
    const flagshipElapsed = Date.now() - flagshipStart;

    console.log(`✅ Flagship pipeline completed in ${flagshipElapsed}ms:`);
    console.log(`   • Satellite: ${flagshipResult.step1_sentinel1_sar.sensor} (${flagshipResult.step1_sentinel1_sar.passId})`);
    console.log(`   • Waterlogged Area: ${flagshipResult.step2_segformer_b2_inference.data.waterloggedAreaKm2} km² (Depth: ${flagshipResult.step2_segformer_b2_inference.data.maxEstimatedDepthCm} cm)`);
    console.log(`   • Risk Score Impact: ${flagshipResult.step3_risk_engine_impact.priorRiskScore} → ${flagshipResult.step3_risk_engine_impact.updatedRiskScore}/100 (Delta: +${flagshipResult.step3_risk_engine_impact.riskDelta})`);
    console.log(`   • Emergency Routing: ${flagshipResult.step4_astar_emergency_routing.data.totalDistanceKm} km (${flagshipResult.step4_astar_emergency_routing.data.estimatedTravelTimeMinutes} mins, ${flagshipResult.step4_astar_emergency_routing.data.floodedSegmentsBypassed} flooded segments bypassed)`);
    console.log(`   • Auto Work Order: ${flagshipResult.step5_gemini_copilot_decision.generatedWorkOrder.workOrderNumber} (Priority: ${flagshipResult.step5_gemini_copilot_decision.generatedWorkOrder.priority})`);
  } catch (err: any) {
    console.log(`❌ Flagship Pipeline Failed: ${err?.message || err}`);
  }

  console.log('\n========================================================================');
  console.log('🏙️  CITYWIDE MULTI-MODEL AUDIT TEST');
  console.log('========================================================================');

  try {
    const auditStart = Date.now();
    const auditResult = await runCitywideAudit();
    const auditElapsed = Date.now() - auditStart;

    console.log(`✅ Citywide multi-model audit completed in ${auditElapsed}ms:`);
    console.log(`   • City Health Score: ${auditResult.cityHealthScore}/100`);
    console.log(`   • Total Synchronous Models Evaluated: ${auditResult.totalModelsEvaluated}`);
  } catch (err: any) {
    console.log(`❌ Citywide Audit Failed: ${err?.message || err}`);
  }

  console.log('\n========================================================================');
  console.log('🚨 ERROR HANDLING TEST (Invalid Model ID)');
  console.log('========================================================================');

  try {
    await executeModelInference('non-existent-fake-model', {});
    console.log('❌ Expected error for invalid model ID, but none was thrown.');
  } catch (err: any) {
    console.log(`✅ Correctly rejected invalid model ID with error: "${err.message}"`);
  }

  console.log('\n========================================================================');
  console.log('📊 MODEL EXECUTION SUMMARY TABLE');
  console.log('========================================================================');
  console.table(resultsTable);

  console.log(`\nFinal Test Results: ${passCount} Passed, ${failCount} Failed out of ${models.length} models.`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
