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
  activeWaterloggingCount: number;
  activePowerOutageCount: number;
  activeDrainageBlockages: number;
  drainageCapacityPercentage: number;
  transformerHealthScore: number; // 0 - 100
  historicalFloodVulnerability: 'HIGH' | 'MODERATE' | 'LOW';
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
