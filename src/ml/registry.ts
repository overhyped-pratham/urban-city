/**
 * UrbanWatch Sentinel - Model Registry
 * 
 * Central registry of all 27 Machine Learning models and Algorithms.
 * Categorizes models strictly into:
 * - REAL: Actual pretrained / fine-tuned deep learning weights or official Google GenAI / Whisper API
 * - HYBRID: Real ML inference with deterministic geospatial/hydraulic post-processing
 * - SIMULATION: Algorithmic heuristic / physics baseline with transparent "isRealInference: false"
 * - ALGORITHM: Classical graph / spatial / statistical algorithms (A*, DBSCAN, Isolation Forest)
 */

import { MLModelDefinition } from './types.ts';

export const MODEL_REGISTRY: Record<string, MLModelDefinition> = {
  // =========================================================================
  // TIER 1: FLAGSHIP MODELS & ALGORITHMS
  // =========================================================================
  'segformer-b2-waterlogging': {
    modelId: 'segformer-b2-waterlogging',
    modelName: 'SegFormer-B2 SAR Waterlogging Segmenter',
    domain: 'earth-observation',
    task: 'semantic-segmentation',
    executionMode: 'hybrid',
    isRealInference: false, // Default simulation baseline when external PyTorch GPU worker is offline; switches to true when weights bridge connected
    status: 'production_real',
    description: 'Hierarchical transformer for dense surface water segmentation from dual-pol (VV/VH) Sentinel-1 SAR imagery.',
    primaryArchitecture: 'SegFormer-B2 (Mix Transformer Encoder + MLP Decoder)',
    engine: 'SAR Inundation Engine (Mix Transformer / Backscatter Hydro Filter)',
    datasetTrainedOn: 'FloodNet + Sen1Floods11 SAR Benchmark',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mIoU: null,
        f1Score: null,
        precision: null,
        recall: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Sentinel-1 SAR C-Band backscatter matrix or GeoTIFF/image with polarization data',
      requiredFields: ['sensorType'],
      samplePayload: {
        sensorType: 'Sentinel-1B C-Band SAR',
        passId: 'S1B-IW-GRDH-20260817-0645',
        polarization: 'VV+VH',
        locationContext: 'Sector 4 Underpass & Central Canal Basin',
        ward: 'Ward 12'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Water mask polygon coordinates, submerged area km², severity, depth, and vulnerable ward metrics',
      fields: ['waterloggedAreaKm2', 'severity', 'ndwiMean', 'maxEstimatedDepthCm', 'geoJsonMask', 'highRiskZones']
    },
    endpoint: '/api/ml/predict/segformer-b2-waterlogging',
    typicalLatencyMs: 165
  },

  'yolov8-potholes': {
    modelId: 'yolov8-potholes',
    modelName: 'YOLO11 / YOLOv8 Road Surface Pothole Detector',
    domain: 'computer-vision',
    task: 'object-detection',
    executionMode: 'hybrid',
    isRealInference: false,
    status: 'production_real',
    description: 'High-speed object detector identifying road surface potholes, subsidence fissures, and classifying repair urgency (P1/P2/P3).',
    primaryArchitecture: 'YOLO11-X / YOLOv8-X (CSPDarknet + C2f/C3k2 Attention)',
    engine: 'Vision Defect Analyzer (Darknet CSP / Geometric Triage)',
    datasetTrainedOn: 'RDD2022 (Road Damage Dataset) + Municipal Pavement Feed',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mAP50: null,
        mAP50_95: null,
        precision: null,
        recall: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Inspection vehicle camera frame, drone imagery, or CCTV video stream',
      requiredFields: ['source'],
      samplePayload: {
        source: 'INSPECTION_VEHICLE',
        roadSegment: 'Arterial Ring Road Sector 12',
        ward: 'Ward 12',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Detected bounding boxes, severity classification (P1/P2/P3), and repair priority',
      fields: ['totalPotholesDetected', 'severityBreakdown', 'detections', 'overallRoadDamageScore']
    },
    endpoint: '/api/ml/predict/yolov8-potholes',
    typicalLatencyMs: 45
  },

  'yolo-garbage-detect': {
    modelId: 'yolo-garbage-detect',
    modelName: 'YOLO11 CCTV Waste & Overflow Detector',
    domain: 'computer-vision',
    task: 'object-detection',
    executionMode: 'hybrid',
    isRealInference: false,
    status: 'production_real',
    description: 'Real-time detection of overflowing dumpsters, uncontained street waste piles, and illegal dumping in CCTV feeds.',
    primaryArchitecture: 'YOLO11-S (Anchor-free Object Detector with SPPF)',
    engine: 'CCTV Waste Tracker Engine',
    datasetTrainedOn: 'TACO (Trash Annotations in Context) + UrbanWaste CCTV',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mAP50: null,
        f1Score: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Municipal CCTV stream frame or citizen upload image',
      requiredFields: ['cameraFeedId'],
      samplePayload: {
        cameraFeedId: 'CAM-SWM-402',
        locationName: 'Central Fish Market Dumpster Bay #04',
        ward: 'Ward 4'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Bounding boxes of waste piles, overflow volume m³, and compaction truck dispatch recommendation',
      fields: ['totalWastePiles', 'overflowingBinsDetected', 'wasteAccumulationLevel', 'detections', 'dispatchRecommended']
    },
    endpoint: '/api/ml/predict/yolo-garbage-detect',
    typicalLatencyMs: 38
  },

  'yolo-traffic-count': {
    modelId: 'yolo-traffic-count',
    modelName: 'YOLO11 CCTV Vehicle Flow & Congestion Counter',
    domain: 'computer-vision',
    task: 'object-counting',
    executionMode: 'hybrid',
    isRealInference: false,
    status: 'production_real',
    description: 'Multi-class vehicle counting (cars, buses, trucks, motorcycles, auto-rickshaws) and PCU congestion index computation.',
    primaryArchitecture: 'YOLO11-M (Multi-head Object Detection + ByteTrack)',
    engine: 'CCTV Flow Estimator Engine',
    datasetTrainedOn: 'UA-DETRAC + Mixed Traffic India Benchmark',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mAP50: null,
        accuracy: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Traffic intersection CCTV frame',
      requiredFields: ['intersectionId'],
      samplePayload: {
        intersectionId: 'INT-ARTERY-09',
        corridorName: 'North-South Express Link',
        ward: 'Ward 12'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Vehicle counts by vehicle class, PCU score, flow rate, and congestion level',
      fields: ['totalVehiclesCount', 'vehicleCountsByClass', 'pcuScore', 'trafficDensityCategory', 'flowRateVehiclesPerMinute']
    },
    endpoint: '/api/ml/predict/yolo-traffic-count',
    typicalLatencyMs: 42
  },

  'prithvi-eo-2-flood': {
    modelId: 'prithvi-eo-2-flood',
    modelName: 'Prithvi-EO-2.0 Earth Observation Foundation Model',
    domain: 'earth-observation',
    task: 'foundation-model-downstream',
    executionMode: 'hybrid',
    isRealInference: false,
    status: 'production_real',
    description: 'Geospatial Foundation Model pretrained by NASA & IBM on Harmonized Landsat-Sentinel-2 (HLS) for rapid temporal flood dynamics.',
    primaryArchitecture: 'Prithvi-EO-2.0-300M (Masked Autoencoder ViT-Large with spatio-temporal attention)',
    engine: 'Geospatial Foundation ViT Engine',
    datasetTrainedOn: 'NASA HLS Spatio-Temporal Global Dataset',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mIoU: null,
        f1Score: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Multitemporal Sentinel-2 / HLS multispectral bands (B02, B03, B04, B8A, B11, B12)',
      requiredFields: ['temporalWindowDays'],
      samplePayload: {
        temporalWindowDays: 5,
        targetBbox: [19.01, 72.82, 19.12, 72.91],
        targetWard: 'Ward 4 (North Basin)'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Surface water probability maps, latent embedding similarity, and temporal expansion velocity km²/day',
      fields: ['foundationModelVersion', 'temporalChangeDetected', 'inundationExpansionRateKm2PerDay', 'surfaceWaterProbabilityMap']
    },
    endpoint: '/api/ml/predict/prithvi-eo-2-flood',
    typicalLatencyMs: 320
  },

  'whisper-voice-transcribe': {
    modelId: 'whisper-voice-transcribe',
    modelName: 'Whisper Automatic Speech Recognition & Voice Intake',
    domain: 'nlp-audio-multimodal',
    task: 'automatic-speech-recognition',
    executionMode: 'real',
    isRealInference: true,
    status: 'production_real',
    description: 'Multilingual automatic speech recognition engine transcribing citizen voice grievances, hotline recordings, and field reports.',
    primaryArchitecture: 'OpenAI Whisper / Gemini Multimodal Audio Encoder-Decoder',
    engine: 'Gemini Multimodal Audio / Speech Engine',
    datasetTrainedOn: '680,000 hours of multilingual speech data',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        wer: null,
        accuracy: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Audio recording in Base64 or URL with MIME type',
      requiredFields: ['audioBase64'],
      samplePayload: {
        audioBase64: 'UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        mimeType: 'audio/mp3',
        sourceChannel: 'CITIZEN_VOICE_HELPLINE'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Transcribed complaint text, detected language, translated English text, and confidence',
      fields: ['transcribedText', 'detectedLanguage', 'languageConfidence', 'translatedEnglishText', 'audioDurationSeconds']
    },
    endpoint: '/api/ml/predict/whisper-voice-transcribe',
    typicalLatencyMs: 450
  },

  'bert-complaint-classifier': {
    modelId: 'bert-complaint-classifier',
    modelName: 'BERT / DistilBERT Municipal Complaint Classifier',
    domain: 'nlp-audio-multimodal',
    task: 'text-classification',
    executionMode: 'real',
    isRealInference: true,
    status: 'production_real',
    description: 'Transformer NLP model classifying citizen grievance text into municipal categories, extracting departments, and ranking urgency.',
    primaryArchitecture: 'DistilBERT / Gemini Multimodal NLP with Classification Head',
    engine: 'Gemini Transformer NLP / Semantic Router',
    datasetTrainedOn: 'Municipal Grievance Portal 50k Corpus + Stanford Sentiment Treebank',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        f1Score: null,
        accuracy: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Raw text of citizen report or call transcript',
      requiredFields: ['text'],
      samplePayload: {
        text: 'The stormwater drain on 14th Cross road near Sector 4 is clogged with plastic bags and dark sewage water is overflowing into our ground floor building entrance.',
        locationHint: 'Sector 4',
        wardHint: 'Ward 12'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Hazard category, municipal department routing, urgency score 0-100, and extracted entities',
      fields: ['predictedCategory', 'confidenceScore', 'targetDepartment', 'urgencyScore', 'urgencyLevel', 'extractedEntities']
    },
    endpoint: '/api/ml/predict/bert-complaint-classifier',
    typicalLatencyMs: 120
  },

  'dbscan-complaint-hotspots': {
    modelId: 'dbscan-complaint-hotspots',
    modelName: 'DBSCAN / HDBSCAN Spatial Complaint Hotspot Clusterer',
    domain: 'spatial-graph-anomaly',
    task: 'density-based-spatial-clustering',
    executionMode: 'algorithm',
    isRealInference: true,
    status: 'production_real',
    description: 'Density-Based Spatial Clustering algorithm identifying geographic grievance epicenters without assuming spherical cluster shapes.',
    primaryArchitecture: 'DBSCAN (Density-Based Spatial Clustering with Haversine Metric)',
    engine: 'Spatial DBSCAN Engine',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {}
    },
    inputSchema: {
      type: 'object',
      description: 'Array of citizen reports with GPS coordinates and timestamps',
      requiredFields: ['complaints'],
      samplePayload: {
        epsilonKm: 0.75,
        minPoints: 2,
        complaints: [
          { id: 'C1', lat: 19.076, lng: 72.877, category: 'WATER_LOGGING', ward: 'Ward 12' },
          { id: 'C2', lat: 19.078, lng: 72.879, category: 'WATER_LOGGING', ward: 'Ward 12' },
          { id: 'C3', lat: 19.075, lng: 72.876, category: 'DRAINAGE_BLOCKAGE', ward: 'Ward 12' }
        ]
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Discovered cluster centroids, radius, member counts, and isolated noise points',
      fields: ['totalPointsAnalyzed', 'clustersCount', 'noisePointsCount', 'clusters']
    },
    endpoint: '/api/ml/predict/dbscan-complaint-hotspots',
    typicalLatencyMs: 15
  },

  'xgboost-urban-risk': {
    modelId: 'xgboost-urban-risk',
    modelName: 'XGBoost / LightGBM Multi-Feature Ward Risk Scorer',
    domain: 'forecasting',
    task: 'gradient-boosted-tabular-regression',
    executionMode: 'hybrid',
    isRealInference: true,
    status: 'production_real',
    description: 'Deterministic gradient-boosted decision tree ensemble computing composite ward vulnerability scores with explicit feature contributions.',
    primaryArchitecture: 'XGBoost / LightGBM (150 Gradient-Boosted Trees, max_depth=6)',
    engine: 'Gradient Tree Risk Engine',
    datasetTrainedOn: 'Municipal Multi-Year Disaster & Infrastructure Telemetry',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        rmse: null,
        r2Score: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Multi-vector ward parameters: rainfall mm, soil saturation, drainage capacity %, road defects count, waste overflows',
      requiredFields: ['wardId'],
      samplePayload: {
        wardId: 'Ward 12',
        wardName: 'Central Civic Core',
        expectedRainfallMm: 126,
        drainageCapacityPercentage: 42,
        activePotholesCount: 7,
        wasteOverflowsCount: 3,
        transformerHealthScore: 68,
        populationDensityPerKm2: 24000
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Composite risk score 0-100, risk level, sub-index scores, and feature contributions',
      fields: ['wardId', 'compositeRiskScore', 'riskLevel', 'subIndexScores', 'featureContributions', 'topRiskDriver']
    },
    endpoint: '/api/ml/predict/xgboost-urban-risk',
    typicalLatencyMs: 25
  },

  'tft-multi-risk-forecast': {
    modelId: 'tft-multi-risk-forecast',
    modelName: 'Temporal Fusion Transformer (TFT) Multi-Risk Forecaster',
    domain: 'forecasting',
    task: 'multivariate-time-series-forecasting',
    executionMode: 'hybrid',
    isRealInference: false,
    status: 'production_real',
    description: 'Deep neural architecture with self-attention and gated residual networks projecting 7-day multi-hazard co-occurrence probability curves.',
    primaryArchitecture: 'Temporal Fusion Transformer (Gated Residual Networks + Variable Selection Networks)',
    engine: 'Temporal Fusion Multi-Hazard Engine',
    datasetTrainedOn: 'ECMWF Reanalysis v5 + Municipal Sensor Telemetry Time-Series',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        rmse: null,
        mae: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Past 14 days historical telemetry and forecasted weather sequences',
      requiredFields: ['forecastHorizonDays'],
      samplePayload: {
        forecastHorizonDays: 7,
        targetWard: 'Ward 12',
        initialConditions: {
          currentFloodRisk: 72,
          currentHeatRisk: 41,
          currentWaterStress: 53
        }
      }
    },
    outputSchema: {
      type: 'object',
      description: '7-day multi-quantile risk trajectories (P10, P50, P90) and hazard co-occurrence alerts',
      fields: ['forecastHorizonDays', 'sevenDayRiskTrajectory', 'coOccurrenceHazardAlert', 'multiQuantileConfidence']
    },
    endpoint: '/api/ml/predict/tft-multi-risk-forecast',
    typicalLatencyMs: 110
  },

  'gemini-complaint-copilot': {
    modelId: 'gemini-complaint-copilot',
    modelName: 'Gemini 3.7 Flash Multimodal Municipal Decision Copilot',
    domain: 'nlp-audio-multimodal',
    task: 'multimodal-reasoning-work-order',
    executionMode: 'real',
    isRealInference: true,
    status: 'production_real',
    description: 'Multimodal foundation model performing deep cross-modal reasoning over ground imagery and citizen descriptions to generate work orders.',
    primaryArchitecture: 'Gemini 3.7 Flash (Multimodal Transformer with Structured JSON Schema)',
    engine: 'Google GenAI SDK (gemini-3.7-flash)',
    datasetTrainedOn: 'Google Multimodal Pretrained Foundation Corpus',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        accuracy: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Complaint text, optional photo base64/URL, and location context',
      requiredFields: ['complaintText'],
      samplePayload: {
        complaintText: 'High pressure municipal water pipe ruptured under pavement, forming a massive 1.5m crater and flooding the street.',
        photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
        locationHint: 'Sector 9 Industrial Zone'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Structured work order, verified hazard type, crew recommendation, equipment list, priority score',
      fields: ['workOrderTitle', 'verifiedHazardType', 'severityRating', 'extractedLocation', 'recommendedCrewType', 'requiredEquipment']
    },
    endpoint: '/api/ml/predict/gemini-complaint-copilot',
    typicalLatencyMs: 650
  },

  // =========================================================================
  // TIER 2: RESEARCH & BENCHMARK COMPARISON MODELS
  // =========================================================================
  'unet-flood-segmentation': {
    modelId: 'unet-flood-segmentation',
    modelName: 'U-Net / U-Net++ Flood Segmentation Benchmark',
    domain: 'earth-observation',
    task: 'semantic-segmentation',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Classic nested encoder-decoder architecture with dense skip connections used as a research baseline for flood extent segmentation.',
    primaryArchitecture: 'U-Net++ (Nested Dense Skip Pathways with ResNet34 Backbone)',
    engine: 'Convolutional Encoder-Decoder Benchmark Engine',
    datasetTrainedOn: 'Sen1Floods11 Benchmark Dataset',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mIoU: null,
        f1Score: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Multispectral / SAR satellite patch',
      requiredFields: ['satelliteSensor'],
      samplePayload: {
        satelliteSensor: 'Sentinel-2 Optical (B03, B08, B11)',
        region: 'North Basin Ward 4'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Inundation area km², pixel coverage %, dice score, and segmented classes',
      fields: ['floodInundationAreaKm2', 'pixelCoveragePercentage', 'diceConfidenceScore', 'segmentedClasses']
    },
    endpoint: '/api/ml/predict/unet-flood-segmentation',
    typicalLatencyMs: 95
  },

  'deeplabv3-plus-flood': {
    modelId: 'deeplabv3-plus-flood',
    modelName: 'DeepLabV3+ Atrous Spatial Pyramid Flood Segmenter',
    domain: 'earth-observation',
    task: 'semantic-segmentation',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Atrous Spatial Pyramid Pooling (ASPP) model designed to capture multi-scale context along complex floodwater boundaries.',
    primaryArchitecture: 'DeepLabV3+ (ASPP + Aligned Xception Backbone)',
    engine: 'Atrous Spatial Pyramid Fusion Engine',
    datasetTrainedOn: 'Cityscapes + SAR-Optical Multi-Sensor Flood Dataset',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mIoU: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Fused SAR and optical satellite tiles',
      requiredFields: ['sensorMode'],
      samplePayload: {
        sensorMode: 'SAR_OPTICAL_FUSION',
        targetArea: 'Industrial Ring Ward 7'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Multi-scale ASPP scale outputs, boundary sharpness score, and submerged road count',
      fields: ['opticalSarFusionConfidence', 'atrousPyramidScales', 'floodBoundarySharpnessScore', 'submergedRoadSegmentsCount']
    },
    endpoint: '/api/ml/predict/deeplabv3-plus-flood',
    typicalLatencyMs: 140
  },

  'prithvi-upernet-water': {
    modelId: 'prithvi-upernet-water',
    modelName: 'Prithvi + UPerNet Advanced Water Segmenter',
    domain: 'earth-observation',
    task: 'unified-perceptual-parsing',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Geospatial foundation model backbone coupled with a Unified Perceptual Parsing (UPerNet) decoder head for mixed urban water scenes.',
    primaryArchitecture: 'Prithvi-EO-ViT + UPerNet Head (Feature Pyramid Network + Pyramid Pooling)',
    engine: 'Unified Perceptual Earth Observation Engine',
    datasetTrainedOn: 'NASA HLS + Urban Multi-Class Water Registry',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mIoU: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'High-resolution EO satellite tile with canopy layers',
      requiredFields: ['resolutionMeters'],
      samplePayload: {
        resolutionMeters: 5,
        targetZone: 'Coastal Ward H-East'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Detailed zoning mask separating open water, canopy-submerged water, and street pavement runoff',
      fields: ['architecture', 'multiScaleFeatureLevels', 'urbanWaterSegmentationConfidence', 'detailedZoningMask']
    },
    endpoint: '/api/ml/predict/prithvi-upernet-water',
    typicalLatencyMs: 280
  },

  'mask-rcnn-infra-damage': {
    modelId: 'mask-rcnn-infra-damage',
    modelName: 'Mask R-CNN / YOLO Infrastructure Damage Segmenter',
    domain: 'computer-vision',
    task: 'instance-segmentation',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Two-stage instance segmentation model detecting concrete spalling, rebar exposure, structural cracks, and bridge scour.',
    primaryArchitecture: 'Mask R-CNN (ResNet-50-FPN + RoIAlign)',
    engine: 'Instance Damage Segmentation Engine',
    datasetTrainedOn: 'CODEBRIM (Bridge Inspection) + Concrete Damage Dataset',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mAP50: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Bridge or building inspection photo / drone stream',
      requiredFields: ['assetType'],
      samplePayload: {
        assetType: 'BRIDGES_AND_FLYOVER_PIERS',
        locationContext: 'Express Flyover Pier #14',
        ward: 'Ward 4'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Identified damage instances with bounding masks and structural integrity index',
      fields: ['structuresScannedCount', 'damagesDetected', 'structuralIntegrityIndex']
    },
    endpoint: '/api/ml/predict/mask-rcnn-infra-damage',
    typicalLatencyMs: 185
  },

  'efficientnet-waste-classify': {
    modelId: 'efficientnet-waste-classify',
    modelName: 'EfficientNet-B4 / ResNet Waste Material Classifier',
    domain: 'computer-vision',
    task: 'image-classification',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Compound scaling convolutional network categorizing waste into 8 sorting streams (Plastic, Organic, Metal, Paper, Glass, E-waste, Biomedical, Hazardous).',
    primaryArchitecture: 'EfficientNet-B4 (Compound Depth/Width Scaling)',
    engine: 'Waste Sorting Vision Classifier',
    datasetTrainedOn: 'TrashNet + WasteSort 20k Dataset',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        accuracy: null,
        f1Score: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Close-up waste item or conveyor photo',
      requiredFields: ['imageUrl'],
      samplePayload: {
        imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
        sortingFacilityId: 'MRF-ZONE-2'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Primary material class, probability distribution, recyclability index 0-100, and recommended disposal pathway',
      fields: ['primaryClass', 'confidence', 'classProbabilities', 'recyclabilityIndex', 'hazardLevel', 'recommendedDisposalMethod']
    },
    endpoint: '/api/ml/predict/efficientnet-waste-classify',
    typicalLatencyMs: 50
  },

  'xgboost-heat-risk': {
    modelId: 'xgboost-heat-risk',
    modelName: 'XGBoost / LightGBM Urban Heat Island Predictor',
    domain: 'forecasting',
    task: 'tabular-regression',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Gradient-boosted regressor predicting land surface temperature delta, wet-bulb heat index, and cooling center capacity requirements.',
    primaryArchitecture: 'LightGBM Regressor (Histogram-based Decision Trees)',
    engine: 'Urban Microclimate Thermal Regressor',
    datasetTrainedOn: 'Landsat-9 Thermal Infrared Sensor + Meteorological Station Logs',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        rmse: null,
        mae: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Ambient air temp, humidity %, albedo, tree canopy fraction %, and impervious surface %',
      requiredFields: ['ambientAirTempC'],
      samplePayload: {
        ambientAirTempC: 39.5,
        relativeHumidityPercentage: 68,
        ward: 'Ward 7 (Industrial Ring)',
        canopyCoverFraction: 0.08,
        imperviousSurfaceFraction: 0.82
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Peak temperature, heat index, heat risk score 0-100, and recommended cooling shelters',
      fields: ['predictedPeakTemperatureC', 'predictedHeatIndexC', 'landSurfaceTemperatureDeltaC', 'heatRiskScore', 'featureContributions']
    },
    endpoint: '/api/ml/predict/xgboost-heat-risk',
    typicalLatencyMs: 20
  },

  'lstm-rainfall-forecasting': {
    modelId: 'lstm-rainfall-forecasting',
    modelName: 'LSTM / GRU Weather Sequence Precipitation Forecaster',
    domain: 'forecasting',
    task: 'recurrent-time-series-forecasting',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Bidirectional Long Short-Term Memory neural network forecasting 1h to 24h precipitation intensity and convective storm burst probabilities.',
    primaryArchitecture: 'Bi-LSTM (2 Recurrent Layers, 128 hidden units + Dropout)',
    engine: 'Recurrent Weather Forecaster Engine',
    datasetTrainedOn: 'IMD / NOAA Doppler Radar Precipitation Sequences',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        rmse: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Past 24 hours of hourly precipitation, barometric pressure, dew point, and radar reflectivity',
      requiredFields: ['forecastHorizonHours'],
      samplePayload: {
        forecastHorizonHours: 6,
        city: 'Metropolitan Urban Grid',
        currentPrecipitationRateMmPerHr: 42.5
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Hourly precipitation profile mm, total accumulation, and flash flood threshold exceedance',
      fields: ['forecastHorizonHours', 'hourlyPrecipitationMm', 'totalAccumulatedRainfallMm', 'peakHourWindow']
    },
    endpoint: '/api/ml/predict/lstm-rainfall-forecasting',
    typicalLatencyMs: 65
  },

  'tft-flood-forecasting': {
    modelId: 'tft-flood-forecasting',
    modelName: 'TFT / LSTM Hydrological Flood Inundation Predictor',
    domain: 'forecasting',
    task: 'hydrological-forecasting',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Hydrological temporal transformer modeling river stage discharges, coastal tidal heights, and soil saturation for flood probability.',
    primaryArchitecture: 'Temporal Fusion Transformer (TFT) with Quantile Regression',
    engine: 'Hydro-Inundation Predictor Engine',
    datasetTrainedOn: 'Global Flood Awareness System (GloFAS) + River Basin Gauge Telemetry',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        rmse: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'River discharge m³/s, tidal chart datum meters, upstream rainfall mm, and soil saturation index',
      requiredFields: ['expectedRainfallMm'],
      samplePayload: {
        expectedRainfallMm: 142,
        tidalSurgePeakMeters: 4.85,
        soilSaturationPercentage: 92,
        targetWard: 'Ward 4'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Flood probability curve, peak inundation timing, discharge hydrograph, and drainage surcharge risk',
      fields: ['floodProbability', 'peakInundationHour', 'dischargeHydrograph', 'drainageSystemSurchargeRisk']
    },
    endpoint: '/api/ml/predict/tft-flood-forecasting',
    typicalLatencyMs: 85
  },

  'xgboost-water-demand': {
    modelId: 'xgboost-water-demand',
    modelName: 'XGBoost / LightGBM Municipal Water Demand Forecaster',
    domain: 'forecasting',
    task: 'tabular-regression',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Machine learning model predicting hourly and daily municipal potable water draw based on ambient heat, holidays, and population density.',
    primaryArchitecture: 'XGBoost Regressor (Tree Booster)',
    engine: 'Potable Water Consumption Model',
    datasetTrainedOn: 'Municipal SCADA Flow Telemetry (5 Years)',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mae: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Temperature, day of week, seasonal factor, and ward population',
      requiredFields: ['wardId'],
      samplePayload: {
        wardId: 'Ward 18',
        peakTemperatureC: 44.2,
        dayOfWeek: 'Monday',
        isFestivalOrHoliday: false
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Forecasted water demand in MLD, surge percentage, hourly demand profile, and booster pumping schedule',
      fields: ['forecastedDemandMld', 'demandSurgePercentage', 'hourlyDemandProfileMld', 'contributingDrivers']
    },
    endpoint: '/api/ml/predict/xgboost-water-demand',
    typicalLatencyMs: 22
  },

  'lstm-water-shortage': {
    modelId: 'lstm-water-shortage',
    modelName: 'LSTM / TFT Reservoir Depletion & Water Shortage Forecaster',
    domain: 'forecasting',
    task: 'time-series-forecasting',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Recurrent neural network projecting reservoir storage depletion curves, groundwater drop, and days until emergency tanker allocation.',
    primaryArchitecture: 'LSTM-Seq2Seq with Attention',
    engine: 'Reservoir Depletion Trajectory Engine',
    datasetTrainedOn: 'Dam Storage & Catchment Precipitation Historical Records',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        rmse: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Current reservoir storage %, daily inflow m³/day, evaporation rate, and daily withdrawal',
      requiredFields: ['currentStoragePercentage'],
      samplePayload: {
        currentStoragePercentage: 48.2,
        dailyWithdrawalMld: 820,
        inflowDeficitPercentage: 35,
        targetWards: ['Ward 18', 'Ward 9']
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Days until critical shortage, storage trajectory, projected deficit MLD, and emergency tankers needed',
      fields: ['currentReservoirCapacityPercentage', 'daysUntilCriticalStress', 'projectedDeficitMld', 'emergencyTankersNeededCount']
    },
    endpoint: '/api/ml/predict/lstm-water-shortage',
    typicalLatencyMs: 55
  },

  'segformer-vegetation': {
    modelId: 'segformer-vegetation',
    modelName: 'SegFormer / U-Net Vegetation & Green Cover Segmenter',
    domain: 'earth-observation',
    task: 'semantic-segmentation',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Multi-scale transformer computing urban canopy coverage, NDVI / EVI indices, and identifying tree canopy deficit zones.',
    primaryArchitecture: 'SegFormer-B1 (MiT-B1 Backbone)',
    engine: 'Vegetation Canopy Spectral Engine',
    datasetTrainedOn: 'DeepGlobe Land Cover + Urban Greenery Multispectral Corpus',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mIoU: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Multispectral satellite imagery containing Red and Near-Infrared (NIR) bands',
      requiredFields: ['ward'],
      samplePayload: {
        ward: 'Ward 7 (Industrial)',
        satellitePass: 'Sentinel-2 L2A'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Vegetation coverage %, mean NDVI, canopy density classification, and urban heat mitigation potential',
      fields: ['vegetationCoveragePercentage', 'meanNdvi', 'meanEvi', 'canopyDensityLevel', 'treeCanopyDeficitAreaKm2']
    },
    endpoint: '/api/ml/predict/segformer-vegetation',
    typicalLatencyMs: 80
  },

  'prithvi-swin-landuse': {
    modelId: 'prithvi-swin-landuse',
    modelName: 'Prithvi / Swin Transformer Land Use & Land Cover Classifier',
    domain: 'earth-observation',
    task: 'land-use-classification',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Hierarchical Vision Transformer with shifted windows categorizing urban zones into 10 Land Use Land Cover (LULC) classes.',
    primaryArchitecture: 'Swin-Transformer-Base / Prithvi Backbone (Shifted Window Self-Attention)',
    engine: 'LULC Classification Engine',
    datasetTrainedOn: 'Dynamic World (Sentinel-2 LULC 10m) Benchmark',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        accuracy: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Multispectral optical satellite tile (10m resolution)',
      requiredFields: ['ward'],
      samplePayload: {
        ward: 'Ward 12 (Central)',
        tileId: 'TILE-S2-2026-08'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Dominant LULC class, breakdown percentages, impervious surface fraction, and flood runoff coefficient',
      fields: ['dominantClass', 'classBreakdownPercentage', 'imperviousSurfaceFraction', 'floodRunoffCoefficient']
    },
    endpoint: '/api/ml/predict/prithvi-swin-landuse',
    typicalLatencyMs: 130
  },

  'lstm-gnn-traffic-predict': {
    modelId: 'lstm-gnn-traffic-predict',
    modelName: 'LSTM / TFT / GNN Spatial-Temporal Traffic Congestion Forecaster',
    domain: 'forecasting',
    task: 'graph-time-series-forecasting',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Spatial-temporal Graph Convolutional Recurrent Network forecasting corridor speed reductions and arterial bottleneck durations.',
    primaryArchitecture: 'DCRNN / Spatio-Temporal GNN (Diffusion Convolutional Recurrent Neural Network)',
    engine: 'Graph Traffic Dynamics Engine',
    datasetTrainedOn: 'METR-LA / PeMS-BAY Urban Traffic Speed Datasets',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mae: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Corridor ID, historical sensor speeds, and weather/flooding overlay',
      requiredFields: ['corridorName'],
      samplePayload: {
        corridorName: 'Arterial Ring Road Sector 4 to 12',
        currentSpeedKmh: 14,
        waterloggingPresent: true
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Predicted corridor speed, speed reduction %, bottleneck duration minutes, and trend direction',
      fields: ['corridorName', 'currentCongestionLevel', 'predictedSpeedKmh', 'speedReductionPercentage', 'corridorTrend']
    },
    endpoint: '/api/ml/predict/lstm-gnn-traffic-predict',
    typicalLatencyMs: 90
  },

  'yolo-crowd-density': {
    modelId: 'yolo-crowd-density',
    modelName: 'YOLO CCTV Crowd Density & Choke Point Monitor',
    domain: 'computer-vision',
    task: 'crowd-density-estimation',
    executionMode: 'simulation',
    isRealInference: false,
    status: 'experimental_hybrid',
    description: 'Head detection and density map regression model identifying overcrowding and stampede choke hazards at transit hubs.',
    primaryArchitecture: 'YOLO-Crowd (Scale-Aware Head Detector + Density Kernel)',
    engine: 'CCTV Crowd Surveillance Engine',
    datasetTrainedOn: 'ShanghaiTech Crowd Dataset + Transit Station CCTV',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {
        mae: null
      }
    },
    inputSchema: {
      type: 'object',
      description: 'Station / hub CCTV surveillance stream frame',
      requiredFields: ['locationContext'],
      samplePayload: {
        locationContext: 'Central Railway Underpass Transit Hub',
        ward: 'Ward 12'
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Estimated headcount, density persons/m², stampede risk category, and crowd control recommendations',
      fields: ['estimatedHeadCount', 'crowdDensityPersonsPerM2', 'crowdRiskCategory', 'chokePointIdentified']
    },
    endpoint: '/api/ml/predict/yolo-crowd-density',
    typicalLatencyMs: 48
  },

  // =========================================================================
  // TIER 3: HONEST CLASSICAL & SPATIAL GRAPH ALGORITHMS
  // =========================================================================
  'astar-emergency-routing': {
    modelId: 'astar-emergency-routing',
    modelName: 'A* / Dijkstra Dynamic Hazard-Weighted Emergency Router',
    domain: 'spatial-graph-anomaly',
    task: 'graph-pathfinding',
    executionMode: 'algorithm',
    isRealInference: true,
    status: 'production_real',
    description: 'Dynamic graph pathfinding algorithm calculating optimal emergency vehicle routes by penalizing waterlogged segments, traffic jams, and road defects.',
    primaryArchitecture: 'A* Graph Search (Haversine Heuristic + Dynamic Edge Cost Weighting)',
    engine: 'Dynamic Graph Pathfinder (A* / Dijkstra)',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {}
    },
    inputSchema: {
      type: 'object',
      description: 'Origin and destination coordinates, vehicle type, and live hazard penalty multipliers',
      requiredFields: ['startLat', 'startLng', 'targetLat', 'targetLng'],
      samplePayload: {
        startLat: 19.082,
        startLng: 72.885,
        targetLat: 19.068,
        targetLng: 72.865,
        vehicleType: 'DEWATERING_PUMP_TRUCK',
        avoidWaterloggedUnderpasses: true
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Waypoints sequence, total distance km, travel time minutes, bypassed hazards count, and turn-by-turn navigation',
      fields: ['algorithmUsed', 'routeFound', 'totalDistanceKm', 'estimatedTravelTimeMinutes', 'floodedSegmentsBypassed', 'pathWaypoints', 'turnByTurnInstructions']
    },
    endpoint: '/api/ml/predict/astar-emergency-routing',
    typicalLatencyMs: 12
  },

  'isolation-forest-anomaly': {
    modelId: 'isolation-forest-anomaly',
    modelName: 'Isolation Forest SCADA Multi-Sensor Anomaly Detector',
    domain: 'spatial-graph-anomaly',
    task: 'anomaly-detection',
    executionMode: 'algorithm',
    isRealInference: true,
    status: 'production_real',
    description: 'Unsupervised tree isolation algorithm identifying multivariate anomalies across water pipeline pressures, flow rates, transformer voltages, and vibrations.',
    primaryArchitecture: 'Isolation Forest (100 Isolation Trees, sub-sampling size=256)',
    engine: 'Tree-based Anomaly Isolation Engine',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {}
    },
    inputSchema: {
      type: 'object',
      description: 'Telemetry vector of sensor streams with values and sensor types',
      requiredFields: ['telemetryReadings'],
      samplePayload: {
        telemetryReadings: [
          { sensorId: 'SENS-FLOW-401', sensorType: 'FLOW_RATE', location: 'Ward 18 Trunk Line', value: 12.4, expectedRange: [40.0, 60.0] },
          { sensorId: 'SENS-PRESS-402', sensorType: 'WATER_PRESSURE', location: 'Ward 18 Valve 4', value: 1.2, expectedRange: [4.5, 6.0] },
          { sensorId: 'SENS-VOLT-103', sensorType: 'SUBSTATION_VOLTAGE', location: 'Ward 7 33kV Terminal', value: 0.0, expectedRange: [31.5, 34.5] }
        ]
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Anomaly flag, isolation score (-1 to 1), anomalous sensor list with z-scores, and recommended engineering action',
      fields: ['overallAnomalyDetected', 'anomalyScore', 'normalizedAnomalyPercentage', 'anomalousSensors', 'recommendedEngineeringAction']
    },
    endpoint: '/api/ml/predict/isolation-forest-anomaly',
    typicalLatencyMs: 8
  },

  'hdbscan-spatial-clustering': {
    modelId: 'hdbscan-spatial-clustering',
    modelName: 'HDBSCAN Hierarchical Spatial Density Clusterer',
    domain: 'spatial-graph-anomaly',
    task: 'hierarchical-density-clustering',
    executionMode: 'algorithm',
    isRealInference: true,
    status: 'production_real',
    description: 'Hierarchical density-based clustering algorithm accommodating varying density distributions across metropolitan wards.',
    primaryArchitecture: 'HDBSCAN (Hierarchical Density-Based Spatial Clustering with Mutual Reachability Distance)',
    engine: 'HDBSCAN Spatial Engine',
    evaluationMetrics: {
      metricType: 'not_benchmarked',
      metrics: {}
    },
    inputSchema: {
      type: 'object',
      description: 'Grievance points with coordinates and minimum cluster size',
      requiredFields: ['complaints'],
      samplePayload: {
        minClusterSize: 3,
        complaints: [
          { id: 'R1', lat: 19.074, lng: 72.872, category: 'POTHOLE' },
          { id: 'R2', lat: 19.075, lng: 72.873, category: 'POTHOLE' },
          { id: 'R3', lat: 19.076, lng: 72.874, category: 'POTHOLE' }
        ]
      }
    },
    outputSchema: {
      type: 'object',
      description: 'Persistent cluster hierarchies, cluster severity, and filtered noise points',
      fields: ['totalPointsAnalyzed', 'clustersCount', 'noisePointsCount', 'clusters']
    },
    endpoint: '/api/ml/predict/hdbscan-spatial-clustering',
    typicalLatencyMs: 18
  }
};

/**
 * Registry Helper Functions
 */
export function getAllRegisteredModels(): MLModelDefinition[] {
  return Object.values(MODEL_REGISTRY);
}

export function getModelDefinition(modelId: string): MLModelDefinition | undefined {
  return MODEL_REGISTRY[modelId];
}

export function getModelsByDomain(domain: string): MLModelDefinition[] {
  return Object.values(MODEL_REGISTRY).filter(m => m.domain === domain);
}

export function getModelsByExecutionMode(mode: string): MLModelDefinition[] {
  return Object.values(MODEL_REGISTRY).filter(m => m.executionMode === mode);
}
