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
  humidity: number;
  radarStatus: 'HEAVY_PRECIPITATION' | 'SCATTERED_SHOWERS' | 'MONSOON_FRONT' | 'CLEAR';
  forecastNext6HoursMm: number[];
}
