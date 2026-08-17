/**
 * UrbanWatch Sentinel - ML & Spatial Intelligence Types
 * 
 * Standardized type system for all 27 Machine Learning models and Algorithms.
 * Treats honesty in execution mode, engine attribution, and benchmark verification as first-class constraints.
 */

export type ExecutionMode = 'real' | 'hybrid' | 'simulation' | 'algorithm';

export type ModelStatus = 'production_real' | 'experimental_hybrid' | 'simulation_demo' | 'research_spec';

export type ModelDomain = 
  | 'earth-observation'
  | 'computer-vision'
  | 'forecasting'
  | 'spatial-graph-anomaly'
  | 'nlp-audio-multimodal';

export type MetricEvaluationType = 'verified_dataset_benchmark' | 'synthetic_validation' | 'not_benchmarked';

export interface ModelBenchmarkMetrics {
  metricType: MetricEvaluationType;
  datasetName?: string;
  split?: 'test' | 'val' | 'cross_val';
  metrics: {
    mIoU?: number | null;
    f1Score?: number | null;
    mAP50?: number | null;
    mAP50_95?: number | null;
    precision?: number | null;
    recall?: number | null;
    rmse?: number | null;
    mae?: number | null;
    r2Score?: number | null;
    accuracy?: number | null;
    wer?: number | null; // Word error rate for ASR
  };
}

export interface MLModelDefinition {
  modelId: string;
  modelName: string;
  domain: ModelDomain;
  task: string;
  executionMode: ExecutionMode;
  isRealInference: boolean;
  status: ModelStatus;
  description: string;
  primaryArchitecture: string;
  inputSchema: {
    type: string;
    description: string;
    requiredFields: string[];
    samplePayload: Record<string, any>;
  };
  outputSchema: {
    type: string;
    description: string;
    fields: string[];
  };
  engine: string;
  datasetTrainedOn?: string;
  evaluationMetrics: ModelBenchmarkMetrics;
  endpoint: string;
  typicalLatencyMs: number;
}

export interface MLInferenceMetadata {
  engine: string;
  executionMode: ExecutionMode;
  isRealInference: boolean;
  modelArchitecture: string;
  preprocessingTimeMs?: number;
  modelInferenceTimeMs?: number;
  postprocessingTimeMs?: number;
  totalTimeMs: number;
  datasetReference?: string;
  evaluationStatus: MetricEvaluationType;
  notes?: string;
}

export interface MLInferenceEnvelope<T = any> {
  modelId: string;
  modelName: string;
  executionMode: ExecutionMode;
  isRealInference: boolean;
  status: ModelStatus;
  inferenceLatencyMs: number;
  timestamp: string;
  data: T;
  metadata: MLInferenceMetadata;
}

// ----------------------------------------------------
// DOMAIN OUTPUT SCHEMAS
// ----------------------------------------------------

// 1. Earth Observation: SegFormer-B2 Waterlogging
export interface SegFormerWaterloggingOutput {
  satelliteSensor: string;
  passId: string;
  waterloggedAreaKm2: number;
  waterloggedAreaSqMeters: number;
  confidenceScore: number;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  ndwiMean: number;
  sarBackscatterMeanDb: number;
  maxEstimatedDepthCm: number;
  affectedHouseholdsEstimate: number;
  vulnerableWard: string;
  geoJsonMask: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      properties: {
        hazard: string;
        depthCm: number;
        severity: string;
        areaM2: number;
        confidence: number;
      };
      geometry: {
        type: 'Polygon';
        coordinates: number[][][];
      };
    }>;
  };
  highRiskZones: Array<{
    id: string;
    ward: string;
    locationName: string;
    lat: number;
    lng: number;
    depthCm: number;
    areaSqMeters: number;
    threatSummary: string;
  }>;
}

// 2. Earth Observation: U-Net Flood Segmentation
export interface UNetFloodSegmentationOutput {
  sensor: string;
  floodInundationAreaKm2: number;
  pixelCoveragePercentage: number;
  diceConfidenceScore: number;
  boundaryComplexityScore: number;
  segmentedClasses: {
    permanentWaterKm2: number;
    temporaryFloodKm2: number;
    saturatedSoilKm2: number;
    dryUrbanKm2: number;
  };
  segmentationPolygons: Array<{
    classLabel: string;
    coordinates: number[][];
  }>;
}

// 3. Earth Observation: DeepLabV3+ Multi-Modal Fusion
export interface DeepLabV3FloodOutput {
  opticalSarFusionConfidence: number;
  atrousPyramidScales: number[];
  floodBoundarySharpnessScore: number;
  inundatedAreaM2: number;
  submergedRoadSegmentsCount: number;
  criticalInfrastructureSubmerged: string[];
}

// 4. Earth Observation: Prithvi-EO-2.0 Foundation Model
export interface PrithviEO2FloodOutput {
  foundationModelVersion: 'Prithvi-EO-2.0-300M';
  temporalChangeDetected: boolean;
  inundationExpansionRateKm2PerDay: number;
  latentEmbeddingSimilarity: number;
  surfaceWaterProbabilityMap: {
    meanProbability: number;
    peakProbability: number;
    highRiskCentroids: Array<{ lat: number; lng: number; prob: number }>;
  };
}

// 5. Earth Observation: Prithvi + UPerNet Advanced Water
export interface PrithviUPerNetWaterOutput {
  architecture: 'Prithvi-ViT + UPerNet Head';
  multiScaleFeatureLevels: string[];
  urbanWaterSegmentationConfidence: number;
  imperviousRunoffFactor: number;
  canopyObscuredWaterDetected: boolean;
  detailedZoningMask: {
    openWaterSqMeters: number;
    canopySubmergedSqMeters: number;
    pavementRunoffSqMeters: number;
  };
}

// 6. Computer Vision: YOLOv8 / YOLO11 Potholes
export interface YoloPotholeDetectionOutput {
  totalPotholesDetected: number;
  severityBreakdown: {
    p1Critical: number;
    p2High: number;
    p3Moderate: number;
  };
  detections: Array<{
    id: string;
    bbox: { x: number; y: number; width: number; height: number }; // normalized 0-1
    confidence: number;
    severity: 'P1' | 'P2' | 'P3';
    estimatedAreaM2: number;
    estimatedDepthCm?: number;
    repairUrgency: '24-48 hours' | '3-5 days' | 'Scheduled Maintenance';
    recommendedPatchMix: string;
  }>;
  overallRoadDamageScore: number; // 0-100
}

// 7. Computer Vision: YOLO / Mask R-CNN Infrastructure Damage
export interface InfrastructureDamageOutput {
  structuresScannedCount: number;
  damagesDetected: Array<{
    damageType: 'CONCRETE_SPALLING' | 'REBAR_EXPOSURE' | 'STRUCTURAL_CRACK' | 'BRIDGE_SCOUR' | 'SUBSIDENCE_FISSURE';
    severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    confidence: number;
    locationDescription: string;
    instanceMaskPolygon?: number[][];
    repairRecommendation: string;
  }>;
  structuralIntegrityIndex: number; // 0-100
}

// 8. Computer Vision: YOLO Garbage Detection
export interface YoloGarbageDetectionOutput {
  totalWastePiles: number;
  overflowingBinsDetected: number;
  wasteAccumulationLevel: 'CRITICAL_OVERFLOW' | 'HIGH' | 'MODERATE' | 'NORMAL';
  detections: Array<{
    id: string;
    bbox: { x: number; y: number; width: number; height: number };
    wasteType: 'UNCONTAINED_DEBRIS' | 'OVERFLOWING_DUMPSTER' | 'PLASTIC_LITTER' | 'ORGANIC_ACCUMULATION';
    confidence: number;
    estimatedVolumeM3: number;
  }>;
  estimatedTimeToFullOverflowHours: number;
  dispatchRecommended: boolean;
}

// 9. Computer Vision: EfficientNet / ResNet Waste Classification
export interface EfficientNetWasteClassificationOutput {
  primaryClass: 'PLASTIC' | 'ORGANIC' | 'PAPER' | 'METAL' | 'GLASS' | 'E_WASTE' | 'BIOMEDICAL' | 'HAZARDOUS';
  confidence: number;
  classProbabilities: Record<string, number>;
  recyclabilityIndex: number; // 0-100
  hazardLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'BIOHAZARD';
  recommendedDisposalMethod: string;
}

// 10. Climate & GIS: XGBoost / LightGBM Heat Prediction
export interface XGBoostHeatPredictionOutput {
  predictedPeakTemperatureC: number;
  predictedHeatIndexC: number;
  landSurfaceTemperatureDeltaC: number;
  heatRiskScore: number; // 0-100
  heatRiskLevel: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  vulnerablePopulationEstimate: number;
  featureContributions: Array<{
    feature: string;
    impactDeltaC: number;
    description: string;
  }>;
  recommendedCoolingSheltersCount: number;
  advisoryText: string;
}

// 11. Meteorology: LSTM / GRU Rainfall Forecasting
export interface LSTMRainfallForecastOutput {
  forecastHorizonHours: number;
  hourlyPrecipitationMm: Array<{
    hourOffset: number;
    timestamp: string;
    rainfallMm: number;
    convectiveStormProb: number;
  }>;
  totalAccumulatedRainfallMm: number;
  peakRainfallRateMmPerHour: number;
  peakHourWindow: string;
  flashFloodWarningThresholdExceeded: boolean;
}

// 12. Hydrology: TFT / LSTM Flood Forecasting
export interface TFTFloodForecastOutput {
  modelArchitecture: 'Temporal Fusion Transformer (TFT)';
  floodProbability: number; // 0-1
  peakInundationHour: string;
  dischargeHydrograph: Array<{
    time: string;
    riverDischargeM3Sec: number;
    tidalHeightMeters: number;
    p10InundationProb: number;
    p50InundationProb: number;
    p90InundationProb: number;
  }>;
  drainageSystemSurchargeRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  projectedWaterloggingWards: string[];
}

// 13. Water Management: XGBoost / LightGBM Water Demand
export interface XGBoostWaterDemandOutput {
  forecastedDemandMld: number; // Million Litres per Day
  baselineDemandMld: number;
  demandSurgePercentage: number;
  peakConsumptionWindow: string;
  hourlyDemandProfileMld: number[];
  contributingDrivers: Array<{ factor: string; deltaMld: number }>;
  recommendedBoosterPumpingSchedule: string;
}

// 14. Water Management: LSTM / TFT Water Shortage
export interface LSTMWaterShortageOutput {
  currentReservoirCapacityPercentage: number;
  depletionRatePercentagePerDay: number;
  daysUntilCriticalStress: number;
  projectedDeficitMld: number;
  emergencyTankersNeededCount: number;
  groundwaterDepletionIndex: number;
  stressAlertWards: string[];
}

// 15. Earth Observation: SegFormer / U-Net Vegetation
export interface VegetationGreenCoverOutput {
  vegetationCoveragePercentage: number;
  meanNdvi: number;
  meanEvi: number;
  canopyDensityLevel: 'DENSE_CANOPY' | 'MODERATE_SHRUB' | 'SPARSE_URBAN' | 'BARREN_SOIL';
  urbanHeatMitigationPotential: 'EXCELLENT' | 'GOOD' | 'POOR';
  treeCanopyDeficitAreaKm2: number;
}

// 16. Earth Observation: Prithvi / Swin Land-Use
export interface LandUseClassificationOutput {
  dominantClass: string;
  classBreakdownPercentage: {
    highDensityBuiltUp: number;
    residentialLowRise: number;
    industrialCommercial: number;
    waterBodies: number;
    urbanGreenery: number;
    roadsAndTransport: number;
    bareSoil: number;
  };
  imperviousSurfaceFraction: number; // 0-1
  floodRunoffCoefficient: number; // 0-1
}

// 17. Smart Mobility: LSTM / TFT / GNN Traffic Prediction
export interface TrafficCongestionForecastOutput {
  corridorName: string;
  currentCongestionLevel: 'FREE_FLOW' | 'MODERATE' | 'HEAVY' | 'GRIDLOCK';
  predictedSpeedKmh: number;
  freeFlowSpeedKmh: number;
  speedReductionPercentage: number;
  projectedBottleneckDurationMinutes: number;
  corridorTrend: 'WORSENING' | 'IMPROVING' | 'STABLE';
}

// 18. Computer Vision: YOLO Traffic Detection
export interface YoloTrafficCountOutput {
  totalVehiclesCount: number;
  vehicleCountsByClass: {
    cars: number;
    buses: number;
    trucks: number;
    motorcycles: number;
    autoRickshaws: number;
  };
  pcuScore: number; // Passenger Car Unit equivalent
  trafficDensityCategory: 'CONGESTED' | 'MODERATE_FLOW' | 'LIGHT_TRAFFIC';
  flowRateVehiclesPerMinute: number;
  incidentObstructionDetected: boolean;
}

// 19. Graph Optimization: A* / Dijkstra Emergency Routing
export interface AStarEmergencyRoutingOutput {
  algorithmUsed: 'A*_DYNAMIC_HAZARD_PENALIZED' | 'DIJKSTRA';
  routeFound: boolean;
  totalDistanceKm: number;
  estimatedTravelTimeMinutes: number;
  hazardAvoidancePenaltyMinutes: number;
  floodedSegmentsBypassed: number;
  trafficJamsBypassed: number;
  pathWaypoints: Array<{
    lat: number;
    lng: number;
    segmentName: string;
    hazardDepthCm: number;
    roadCondition: 'CLEAR' | 'WATERLOGGED_PASSABLE' | 'HEAVY_TRAFFIC' | 'HAZARD_BLOCKED';
  }>;
  turnByTurnInstructions: string[];
}

// 20. Computer Vision: YOLO Crowd Detection
export interface YoloCrowdDensityOutput {
  estimatedHeadCount: number;
  crowdDensityPersonsPerM2: number;
  crowdRiskCategory: 'STAMPEDE_HAZARD' | 'DENSE_CONGREGATION' | 'MODERATE' | 'NORMAL_FOOTFALL';
  chokePointIdentified: boolean;
  locationContext: string;
  recommendedCrowdControlAction: string;
}

// 21. NLP: BERT / DistilBERT Complaint Classification
export interface BERTComplaintClassificationOutput {
  predictedCategory: 'WATER_LOGGING' | 'POWER_FAILURE' | 'DRAINAGE_BLOCKAGE' | 'SEWAGE_OVERFLOW' | 'ROAD_SUBSIDENCE' | 'SOLID_WASTE' | 'PUBLIC_HEALTH';
  confidenceScore: number;
  targetDepartment: string;
  urgencyScore: number; // 0-100
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  extractedEntities: {
    landmarkOrStreet?: string;
    wardMentioned?: string;
    hazardKeywords: string[];
  };
  sentimentPolarity: 'URGENT_DISTRESS' | 'FRUSTRATED' | 'INFORMATIVE';
}

// 22. Audio / Speech: Whisper Voice Transcription
export interface WhisperVoiceTranscriptionOutput {
  transcribedText: string;
  detectedLanguage: string;
  languageConfidence: number;
  translatedEnglishText?: string;
  audioDurationSeconds: number;
  wordCount: number;
  acousticNoiseLevel: 'CLEAN' | 'MODERATE_NOISE' | 'HEAVY_BACKGROUND_NOISE';
  extractedComplaintSummary?: string;
}

// 23. Multimodal AI: Gemini 3.7 Flash Complaint Work Order
export interface GeminiComplaintWorkOrderOutput {
  workOrderTitle: string;
  verifiedHazardType: string;
  severityRating: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  extractedLocation: {
    address: string;
    ward: string;
    zone: string;
    lat?: number;
    lng?: number;
    locationStatus: 'VERIFIED_COORDINATES' | 'INFERRED_FROM_LANDMARK' | 'missing';
  };
  visualVerificationDetails?: {
    hazardVisibleInPhoto: boolean;
    detectedVisualArtifacts: string[];
    waterDepthVisualEstimateCm?: number;
    infrastructureDefectDescription?: string;
  };
  recommendedCrewDepartment: string;
  recommendedCrewType: string;
  requiredEquipment: string[];
  dispatchPriorityScore: number; // 1-100
  actionableDirectives: string[];
}

// 24. Spatial Intelligence: DBSCAN / HDBSCAN Spatial Hotspot Clustering
export interface DBSCANComplaintHotspotOutput {
  algorithm: 'DBSCAN_SPATIAL_TEMPORAL' | 'HDBSCAN';
  parameters: {
    epsilonKm: number;
    minPoints: number;
  };
  totalPointsAnalyzed: number;
  clustersCount: number;
  noisePointsCount: number;
  clusters: Array<{
    clusterId: number;
    ward: string;
    centroid: { lat: number; lng: number };
    radiusMeters: number;
    complaintCount: number;
    dominantCategory: string;
    criticalityScore: number; // 0-100
    complaintIds: string[];
    clusterSeverity: 'CRITICAL_CLUSTER' | 'HIGH_CONCENTRATION' | 'EMERGING_HOTSPOT';
  }>;
}

// 25. IoT & Sensor SCADA: Isolation Forest Sensor Anomaly
export interface IsolationForestAnomalyOutput {
  overallAnomalyDetected: boolean;
  anomalyScore: number; // -1 to 1 (negative = outlier)
  normalizedAnomalyPercentage: number; // 0-100%
  sensorsEvaluatedCount: number;
  anomalousSensors: Array<{
    sensorId: string;
    sensorType: 'FLOW_RATE' | 'WATER_PRESSURE' | 'PIPE_VIBRATION' | 'SUBSTATION_VOLTAGE' | 'AIR_QUALITY';
    location: string;
    observedValue: number;
    expectedRange: [number, number];
    zScore: number;
    anomalySeverity: 'CRITICAL' | 'HIGH' | 'MODERATE';
    suspectedRootCause: string;
  }>;
  recommendedEngineeringAction: string;
}

// 26. Tabular / ML: XGBoost / LightGBM Urban Risk Scoring
export interface XGBoostUrbanRiskOutput {
  wardId: string;
  wardName: string;
  compositeRiskScore: number; // 0-100
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  subIndexScores: {
    floodRisk: number;
    heatRisk: number;
    waterStressRisk: number;
    wasteRisk: number;
    roadRisk: number;
    trafficRisk: number;
  };
  featureContributions: Array<{
    feature: string;
    rawInput: string | number;
    weightMultiplier: number;
    contributionPoints: number;
    description: string;
  }>;
  topRiskDriver: string;
  preventiveMitigationSummary: string;
}

// 27. Time-Series: Temporal Fusion Transformer (TFT) Multi-Risk Forecast
export interface TFTMultiRiskForecastOutput {
  forecastHorizonDays: number;
  sevenDayRiskTrajectory: Array<{
    dayOffset: number;
    date: string;
    compositeRiskScore: number;
    floodRiskProbability: number;
    heatRiskProbability: number;
    waterStressProbability: number;
    powerGridStrainProbability: number;
    dominantHazard: string;
  }>;
  coOccurrenceHazardAlert?: {
    day: string;
    overlappingHazards: string[];
    escalationWarning: string;
  };
  multiQuantileConfidence: {
    p10Risk: number[];
    p50Risk: number[];
    p90Risk: number[];
  };
}

// ----------------------------------------------------
// URBAN DIGITAL STATE & RISK ENGINE
// ----------------------------------------------------

export interface WardDigitalState {
  wardId: string;
  wardName: string;
  zone: string;
  population: number;
  overallRisk: number; // 0-100
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  floodRisk: number;
  heatRisk: number;
  waterRisk: number;
  wasteRisk: number;
  roadRisk: number;
  trafficRisk: number;
  activeWaterloggedAreaM2: number;
  activeComplaintsCount: number;
  activeAlerts: string[];
  highRiskRoadCount: number;
  recommendedAction: string;
  updatedAt: string;
}

export interface UrbanDigitalState {
  cityHealthScore: number; // 0-100
  cityStatus: string;
  totalActiveIncidents: number;
  totalActiveCrews: number;
  wards: Record<string, WardDigitalState>;
  multiHazardRiskSummary: {
    highestRiskWard: string;
    criticalHazardsCount: number;
    topRiskVector: string;
  };
  lastUpdated: string;
}

export interface FlagshipPipelineResult {
  step1_sentinel1_sar: {
    passId: string;
    sensor: string;
    overpassTime: string;
  };
  step2_segformer_b2_inference: MLInferenceEnvelope<SegFormerWaterloggingOutput>;
  step3_risk_engine_impact: {
    affectedWardId: string;
    priorRiskScore: number;
    updatedRiskScore: number;
    riskDelta: number;
  };
  step4_astar_emergency_routing: MLInferenceEnvelope<AStarEmergencyRoutingOutput>;
  step5_gemini_copilot_decision: {
    situationExecutiveSummary: string;
    rootCauseAnalysis: string;
    recommendedActions: Array<{
      actionTitle: string;
      department: string;
      urgency: string;
      assignedCrewType: string;
      targetLocation: string;
    }>;
    generatedWorkOrder: {
      workOrderNumber: string;
      priority: string;
      equipmentAllocated: string[];
      slaResponseMinutes: number;
    };
  };
  pipelineLatencyMs: number;
  timestamp: string;
}
