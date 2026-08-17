export type IncidentCategory = 
  | 'WATER_LOGGING'
  | 'POWER_FAILURE'
  | 'DRAINAGE_BLOCKAGE'
  | 'SEWAGE_OVERFLOW'
  | 'ROAD_SUBSIDENCE';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 
  | 'DETECTED'
  | 'AI_VERIFIED'
  | 'DISPATCHED'
  | 'ON_SITE'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  ward: string;
  zone: string;
}

export interface AiSatelliteAnalysis {
  confidence: number;
  hazardType: IncidentCategory;
  severity: IncidentSeverity;
  affectedAreaSqMeters: number;
  estimatedWaterDepthCm?: number;
  powerOutageRadiusMeters?: number;
  estimatedAffectedHouseholds: number;
  spectralIndex?: {
    ndwi: number; // Normalized Difference Water Index (-1 to 1)
    thermalAnomaly?: number; // deg C delta
    vegetationIndex?: number;
  };
  detectedFeatures: string[];
  recommendedCrewType: CrewType;
  requiredEquipment: string[];
  dispatchPriorityScore: number; // 1 - 100
  aiSummary: string;
  mitigationSteps: string[];
}

export interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: GeoLocation;
  detectedAt: string;
  updatedAt: string;
  satelliteImage: string;
  satellitePassId: string;
  satelliteSensor: string; // 'Sentinel-2 Multispectral' | 'SAR Sentinel-1' | 'WorldView-3' | 'Landsat-9'
  aiAnalysis: AiSatelliteAnalysis;
  assignedCrewId?: string;
  assignedCrewName?: string;
  assignedCrewEtaMinutes?: number;
  workOrderNumber?: string;
  communityReportsCount: number;
  communityVerified: boolean;
  publicAdvisoryIssued?: boolean;
  resolutionNotes?: string;
  resolvedAt?: string;
  headAdminVerified?: boolean;
  headAdminResolutionStatus?: 'PENDING_HEAD_ADMIN_REVIEW' | 'VERIFIED_RESOLVED' | 'REOPENED_FOR_ACTION';
  headAdminNotes?: string;
  headAdminVerifiedAt?: string;
  headAdminSignature?: string;
}

export type CrewType = 
  | 'DEWATERING_PUMP_UNIT'
  | 'HIGH_VOLTAGE_LINEMEN'
  | 'DRAINAGE_JETTING_SQUAD'
  | 'CIVIL_ROAD_REPAIR'
  | 'EMERGENCY_RESCUE_BOAT';

export type CrewStatus = 'AVAILABLE' | 'EN_ROUTE' | 'ON_SITE' | 'WORKING' | 'MAINTENANCE';

export interface MaintenanceCrew {
  id: string;
  name: string;
  type: CrewType;
  status: CrewStatus;
  currentLocation: { lat: number; lng: number; label: string };
  assignedIncidentId?: string;
  contactNumber: string;
  leadEngineer: string;
  equipment: string[];
  vehicleRegistration: string;
  etaToIncidentMinutes?: number;
  completedTasksToday: number;
}

export interface CitizenReport {
  id: string;
  reportedAt: string;
  userName: string;
  userPhone?: string;
  location: GeoLocation;
  category: IncidentCategory;
  waterLevelDescription?: 'ANKLE_DEEP' | 'KNEE_DEEP' | 'WAIST_DEEP' | 'VEHICLES_SUBMERGED';
  powerOutageDetails?: {
    transformerSparks: boolean;
    streetlightsOff: boolean;
    homesAffectedApprox: number;
  };
  drainageClogReason?: 'PLASTIC_DEBRIS' | 'SILT_ACCUMULATION' | 'TREE_BRANCHES' | 'BROKEN_SLAB';
  description: string;
  photoUrl: string;
  upvotes: number;
  verifiedByMunicipal: boolean;
  matchedIncidentId?: string;
}

export interface WardRiskProfile {
  wardId: string;
  wardName: string;
  zone: string;
  population: number;
  currentRiskScore: number; // 0 - 100
  floodRiskScore: number; // 0 - 100
  heatRiskScore: number; // 0 - 100
  waterRiskScore: number; // 0 - 100
  wasteRiskScore: number; // 0 - 100
  roadRiskScore: number; // 0 - 100
  expectedRainfallMm: number;
  highRiskRoadsCount: number;
  vulnerableAreasCount: number;
  recommendedAction: string;
  activeWaterloggingCount: number;
  activePowerOutageCount: number;
  activeDrainageBlockages: number;
  drainageCapacityPercentage: number;
  transformerHealthScore: number; // 0 - 100
  historicalFloodVulnerability: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface SegFormerSARWaterlogging {
  id: string;
  satellite: string; // e.g. 'Sentinel-1B C-Band SAR'
  passId: string;
  orbitMode: string; // 'Ascending (Track 114)'
  polarization: string; // 'VV + VH dual-pol backscatter (dB)'
  resolutionMeters: number; // 10
  overpassTimestamp: string;
  updatedTimeAgo: string; // '8 min ago'
  status: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'NORMAL';
  confidencePercentage: number; // 87.4%
  totalWaterloggedAreaKm2: number; // 2.34
  deltaLast3HoursKm2: number; // +0.82
  maxEstimatedDepthCm: number; // 48
  vulnerableHouseholdsInMask: number; // 14,200
  images: {
    beforeNormalUrl: string;
    currentSarUrl: string;
    segFormerMaskUrl: string;
  };
  highRiskZones: {
    id: string;
    ward: string;
    locationName: string;
    areaSqMeters: number;
    depthCm: number;
    confidence: number;
    lat: number;
    lng: number;
    priority: 'P1' | 'P2' | 'P3';
    criticalAssetThreat: string;
  }[];
  polygonCoordinates: { lat: number; lng: number }[][];
  pipelineDetails: {
    sensor: string;
    preprocessing: string;
    modelArchitecture: string;
    thresholdConfig: string;
    latencyMs: number;
  };
}

export interface HistoricalRiskHotspot {
  id: string;
  name: string;
  category: IncidentCategory | 'HEAT_ISLAND';
  ward: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  historicalFrequencyScore: number; // 0 - 100
  incidentsCount5Years: number; // count of recorded incidents from 2021-2025
  recurrenceTrigger: string; // e.g. '>30mm/hr precipitation or >4.2m high tide'
  averageSubmersionOrImpact: string; // e.g. '60-75cm water depth'
  vulnerabilityGrade: 'CHRONIC_P1' | 'HIGH_RECURRENCE_P2' | 'MODERATE_P3';
  primaryCause: string; // root infrastructure factor
  activeIncidentOverlapId?: string; // e.g. 'INC-2026-8812'
  activeIncidentOverlapTitle?: string;
  activeIncidentCorrelation: string; // analysis of how current matches history
  longTermMitigationPlan: string;
  colorHex: string;
  intensity: number; // 0.0 to 1.0 for heatmap weighting
}

export interface CityHealthOverview {
  overallScore: number; // e.g. 78/100
  status: string;
  floodRisk: number; // e.g. 72%
  heatRisk: number; // e.g. 41%
  waterRisk: number; // e.g. 53%
  wasteRisk: number; // e.g. 32%
  roadRisk: number; // e.g. 61%
  citizenComplaintsTotal: number;
  citizenComplaintsPending: number;
  activeCriticalAlerts: number;
  preventiveActionsDeployedToday: number;
}

export interface PredictiveFloodForecast {
  probability: number; // e.g. 87%
  peakHours: string; // e.g. "6 - 9 PM"
  expectedRainfallTotalMm: number;
  soilSaturationPercentage: number;
  drainageOverflowRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  highRiskWards: string[];
  timeline: { time: string; rainfallMm: number; runoffLitresSec: number; inundationRisk: number }[];
  aiRecommendedActions: string[];
}

export interface YoloRoadDamageDetection {
  id: string;
  imageUrl: string;
  source: 'CCTV_FEED' | 'CITIZEN_UPLOAD' | 'INSPECTION_VEHICLE';
  location: GeoLocation;
  detectedAt: string;
  defectType: 'POTHOLE' | 'ALLIGATOR_CRACKING' | 'LONGITUDINAL_CRACK' | 'ROAD_SUBSIDENCE' | 'DAMAGED_MANHOLE';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  priority: 'P1' | 'P2' | 'P3';
  repairUrgency: '24-48 hours' | '3-5 days' | 'Scheduled Maintenance';
  confidence: number;
  estimatedAreaSqM: number;
  estimatedDepthCm: number;
  recommendedRepair: string;
  boundingBoxes: { x: number; y: number; width: number; height: number; label: string; confidence: number }[];
  workOrderGenerated: boolean;
}

export interface WasteHotspotItem {
  id: string;
  hotspotName: string;
  location: GeoLocation;
  currentWasteLevel: 'HIGH' | 'MODERATE' | 'CRITICAL_OVERFLOW' | 'NORMAL';
  collectionDelayHours: number;
  predictedOverflowHours: number;
  binCapacityPercentage: number;
  cameraImageUrl: string;
  assignedTruckId?: string;
  actionRequired: string;
}

export interface HeatwaveForecastItem {
  peakTemperatureC: number;
  heatIndexC: number;
  riskLevel: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  vulnerableWards: string[];
  coolingCentresActive: number;
  totalCoolingCapacity: number;
  waterMistingStationsDeployed: number;
  advisoryText: string;
}

export interface WaterSecurityForecastItem {
  reservoirLevelsPercentage: number;
  groundwaterDepletionIndex: number;
  consumptionDeficitMld: number;
  stressPredictedWards: { ward: string; daysUntilStress: number; severity: 'HIGH' | 'MODERATE' }[];
  emergencyTankersAvailable: number;
  emergencyTankersDispatched: number;
  leakageAlertCount: number;
}

export interface AiCopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  structuredDetails?: {
    highRiskLocations?: { ward: string; risk: number; reason: string }[];
    rootCauses?: string[];
    recommendedActions?: {
      title: string;
      department: string;
      urgency: 'IMMEDIATE' | 'HIGH' | 'ROUTINE';
      actionType: 'DISPATCH_PUMPS' | 'INSPECT_DRAINAGE' | 'COOLING_ALERT' | 'DISPATCH_WASTE_TRUCK' | 'ROAD_PATCHING' | 'TANKER_ALLOCATION';
      params?: Record<string, any>;
    }[];
  };
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'CRITICAL_ALERT' | 'DISPATCH_UPDATE' | 'CITIZEN_REPORT' | 'SATELLITE_PASS' | 'WEATHER_WARNING';
  incidentId?: string;
  read: boolean;
}

export interface WeatherData {
  city: string;
  temperature: number;
  precipitationMmPerHour: number;
  windSpeedKmh: number;
  windGustsKmh?: number;
  humidity: number;
  radarStatus: 'HEAVY_PRECIPITATION' | 'SCATTERED_SHOWERS' | 'MONSOON_FRONT' | 'CLEAR';
  forecastNext6HoursMm: number[];
  stormSurgeMeters?: number;
  highSurgeAlert?: boolean;
  surgeWarningText?: string;
  windWarningText?: string;
  tidalHeightChartDatumMeters?: number;
  coastalSluiceGateStatus?: 'CLOSED_FOR_SURGE' | 'OPEN_DRAINAGE' | 'PARTIAL_RESTRICTION';
}

export type AuthorityLevel = 'MONITOR' | 'SUPER_MONITOR' | 'HEAD_ADMIN';

export interface AuthorityPermissions {
  canViewLiveFeed: boolean;
  canQueryGisMaps: boolean;
  canDraftEscalations: boolean;
  canDispatchRoutineCrew: boolean;
  canApproveCriticalDispatch: boolean;
  canBroadcastCitywide: boolean;
  canTuneAiThresholds: boolean;
  canOverridePowerGrid: boolean;
  canSignOffWorkOrders: boolean;
  canAuditLogs: boolean;
  canVerifyIssueResolution?: boolean;
  canReopenUnresolvedIssue?: boolean;
  canSignHeadAdminAudit?: boolean;
  canAccessGoogleFeedbackPortal?: boolean;
}

export interface CitizenFeedbackItem {
  id: string;
  incidentId: string;
  incidentTitle: string;
  submittedAt: string;
  citizenName: string;
  citizenPhone?: string;
  ward: string;
  groundSituation: 'FULLY_SOLVED' | 'PARTIALLY_SOLVED' | 'NOT_SOLVED_CRITICAL';
  responseRating: number; // 1 to 5
  feedbackText: string;
  photoUrl?: string;
  googleFormResponseId: string;
  verifiedByHeadAdmin?: boolean;
}

export interface AuthorityUser {
  id: string;
  name: string;
  title: string;
  level: AuthorityLevel;
  badgeId: string;
  department: string;
  avatar: string;
  securityClearance: string;
  pinCode: string;
  permissions: AuthorityPermissions;
}

export type ApprovalCategory = 
  | 'CRITICAL_DISPATCH'
  | 'EMERGENCY_BROADCAST'
  | 'SLUICE_GATE_OVERRIDE'
  | 'GRID_LOCKOUT'
  | 'TANKER_EMERGENCY_FLEET'
  | 'AI_THRESHOLD_MOD';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalRequest {
  id: string;
  requestedAt: string;
  requestedBy: string;
  requestedByRole: string;
  category: ApprovalCategory;
  title: string;
  description: string;
  ward: string;
  incidentId?: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: ApprovalStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  digitalSignature?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  location: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  role: string;
  agency: string;
  dutyStatus: 'ACTIVE_DUTY' | 'ON_CALL' | 'EMERGENCY_STANDBY' | 'EXECUTIVE_COMMAND';
  avatarInitials: string;
  joinedDate: string;
  badgeId: string;
  preferredContinent: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorLevel: AuthorityLevel;
  actionTitle: string;
  targetEntity: string;
  category: string;
  digitalSignature: string;
}

export interface ControlNetSatConfig {
  repoUrl: string;
  modelName: string;
  conditioningMode: 'DEM_DEPTH' | 'BUILDING_HEIGHT' | 'CLOUD_REMOVAL' | 'INUNDATION_SUB_SURFACE';
  guidanceScale: number;
  controlNetScale: number;
  resolution: '512' | '768' | '1024';
  numInferenceSteps: number;
  seed: number;
}

export interface ControlNetReconstructionResult {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  originalImageUrl: string;
  conditioningMapUrl: string; // depth/edge/DEM map
  reconstructedImageUrl: string;
  buildingHeightMapUrl?: string;
  psnrDb: number;
  ssimScore: number;
  maeHeightMeters: number;
  demResolutionMeters: number;
  reconstructionTimeMs: number;
  buildingCount: number;
  detectedBuildings: { name: string; heightMeters: number; status: string }[];
}

