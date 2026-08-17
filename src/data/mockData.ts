import { 
  Incident, 
  MaintenanceCrew, 
  CitizenReport, 
  WardRiskProfile, 
  WeatherData,
  CityHealthOverview,
  PredictiveFloodForecast,
  YoloRoadDamageDetection,
  WasteHotspotItem,
  HeatwaveForecastItem,
  WaterSecurityForecastItem,
  SegFormerSARWaterlogging,
  HistoricalRiskHotspot,
  AuthorityUser,
  ApprovalRequest,
  AuditLogItem,
  CitizenFeedbackItem
} from '../types';

export const INITIAL_WEATHER: WeatherData = {
  city: 'Metropolitan Urban District',
  temperature: 28.4,
  precipitationMmPerHour: 62.5,
  windSpeedKmh: 58,
  windGustsKmh: 88,
  humidity: 92,
  radarStatus: 'HEAVY_PRECIPITATION',
  forecastNext6HoursMm: [62.5, 54.0, 41.5, 28.0, 18.0, 8.5],
  stormSurgeMeters: 4.85,
  highSurgeAlert: true,
  surgeWarningText: 'CRITICAL HIGH SURGE ALERT: +4.85m Astronomical Tide @ 18:45 IST coinciding with peak heavy monsoon downpour.',
  windWarningText: 'GALE WIND RED ALERT: Sustained 58 km/h winds with severe gusts reaching 88 km/h.',
  tidalHeightChartDatumMeters: 4.85,
  coastalSluiceGateStatus: 'CLOSED_FOR_SURGE'
};

export const SATELLITE_PRESETS = [
  {
    id: 'preset-flood-1',
    name: 'Sector 4 Expressway Underpass Inundation',
    category: 'WATER_LOGGING',
    sensor: 'Sentinel-2 Multispectral (NDWI)',
    location: {
      lat: 19.0760,
      lng: 72.8777,
      address: 'Central Arterial Underpass, Sector 4',
      ward: 'Ward G-North',
      zone: 'Zone II'
    },
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    description: 'Severe stormwater pooling detected across 4-lane arterial underpass with NDWI index reaching +0.72. Estimated water depth 65-80cm obstructing municipal bus transit.'
  },
  {
    id: 'preset-power-1',
    name: 'Eastern Industrial Substation Grid Blackout',
    category: 'POWER_FAILURE',
    sensor: 'Landsat-9 Thermal Infrared & Night-Lights',
    location: {
      lat: 19.0880,
      lng: 72.8950,
      address: 'Substation 33kV Terminal, Eastern Industrial Ring',
      ward: 'Ward L-East',
      zone: 'Zone III'
    },
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
    description: 'Thermal anomaly drop followed by total luminescent blackout across 1.4km radius. Feeder transformer #2 de-energized affecting 8,400 households and water pumping station.'
  },
  {
    id: 'preset-drain-1',
    name: 'North Silt Canal & Sluice Gate Obstruction',
    category: 'DRAINAGE_BLOCKAGE',
    sensor: 'SAR Sentinel-1 Radar Reflectivity',
    location: {
      lat: 19.0620,
      lng: 72.8620,
      address: 'Culvert 14B, Tidal Outfall Sluice Gate',
      ward: 'Ward H-East',
      zone: 'Zone I'
    },
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    description: 'Synthetic Aperture Radar detects massive 18-meter debris clump and urban silt accumulation completely blocking the primary stormwater outflow to tidal creek.'
  },
  {
    id: 'preset-road-1',
    name: 'Old City Boulevard Asphalt Subsidence',
    category: 'ROAD_SUBSIDENCE',
    sensor: 'WorldView-3 Optical 30cm Resolution',
    location: {
      lat: 19.0490,
      lng: 72.8450,
      address: 'Heritage Market Crossway, Ward F-South',
      ward: 'Ward F-South',
      zone: 'Zone I'
    },
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
    description: 'Subsurface water pipe rupture causing structural soil depression and 4.2-meter crater development on high-traffic intersection.'
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-8812',
    title: 'Severe Waterlogging - Highway Underpass Sector 4',
    category: 'WATER_LOGGING',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    location: {
      lat: 19.0760,
      lng: 72.8777,
      address: 'Central Arterial Underpass, Sector 4',
      ward: 'Ward G-North',
      zone: 'Zone II'
    },
    detectedAt: new Date(Date.now() - 42 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    satelliteImage: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    satellitePassId: 'PASS-SENTINEL2-993A',
    satelliteSensor: 'Sentinel-2 Multispectral',
    aiAnalysis: {
      confidence: 96,
      hazardType: 'WATER_LOGGING',
      severity: 'CRITICAL',
      affectedAreaSqMeters: 4200,
      estimatedWaterDepthCm: 72,
      estimatedAffectedHouseholds: 3200,
      spectralIndex: {
        ndwi: 0.74,
      },
      detectedFeatures: [
        'Flooded 4-lane roadway',
        '2 stranded commuter vehicles detected in SAR scan',
        'Catch basin silt overload',
        'Adjacent residential basements threatened'
      ],
      recommendedCrewType: 'DEWATERING_PUMP_UNIT',
      requiredEquipment: [
        '2x 150HP High-Volume Diesel Dewatering Pumps',
        '300m Flexible Discharge Hose Line',
        'Traffic Diversion Barricades'
      ],
      dispatchPriorityScore: 94,
      aiSummary: 'Critical inundation with NDWI 0.74 confirming deep surface water pool. Heavy traffic artery blocked. Directing stormwater into North Drain trunk line.',
      mitigationSteps: [
        'Deploy heavy dewatering pump squad Unit 04',
        'Close eastbound underpass ramps via traffic police alert',
        'Inspect feeder drainage grates for plastic clogs'
      ]
    },
    assignedCrewId: 'CREW-PUMP-04',
    assignedCrewName: 'Heavy Dewatering Unit #04',
    assignedCrewEtaMinutes: 8,
    workOrderNumber: 'WO-MC-2026-904',
    communityReportsCount: 14,
    communityVerified: true,
    publicAdvisoryIssued: true
  },
  {
    id: 'INC-2026-8815',
    title: '33kV Substation Outage & Transformer Trip',
    category: 'POWER_FAILURE',
    severity: 'CRITICAL',
    status: 'DISPATCHED',
    location: {
      lat: 19.0880,
      lng: 72.8950,
      address: 'Substation 33kV Terminal, Eastern Industrial Ring',
      ward: 'Ward L-East',
      zone: 'Zone III'
    },
    detectedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    satelliteImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
    satellitePassId: 'PASS-LANDSAT9-441B',
    satelliteSensor: 'Landsat-9 Thermal Infrared',
    aiAnalysis: {
      confidence: 94,
      hazardType: 'POWER_FAILURE',
      severity: 'CRITICAL',
      affectedAreaSqMeters: 140000,
      powerOutageRadiusMeters: 1200,
      estimatedAffectedHouseholds: 8400,
      spectralIndex: {
        ndwi: -0.12,
        thermalAnomaly: -8.4
      },
      detectedFeatures: [
        'Abrupt thermal signature loss on primary busbar',
        'Zero night-light radiance in sector polygon',
        'Substation security perimeter clear'
      ],
      recommendedCrewType: 'HIGH_VOLTAGE_LINEMEN',
      requiredEquipment: [
        'Insulated Boom Bucket Truck',
        'Transformer SF6 Gas Pressure Analyzer',
        '500kVA Mobile Backup Diesel Generator'
      ],
      dispatchPriorityScore: 98,
      aiSummary: 'Sudden loss of thermal signature and luminescence indicates breaker trip on 33kV circuit breaker B-4. High priority due to water pumping plant dependency.',
      mitigationSteps: [
        'Dispatch High Voltage Linemen Squad #02 with urgent priority',
        'Switch load to auxiliary feeder 11kV line if circuit integrity permits',
        'Notify Civil Hospital regarding backup generator status'
      ]
    },
    assignedCrewId: 'CREW-ELEC-02',
    assignedCrewName: 'High Voltage Rapid Linemen Squad #02',
    assignedCrewEtaMinutes: 14,
    workOrderNumber: 'WO-MC-2026-908',
    communityReportsCount: 22,
    communityVerified: true,
    publicAdvisoryIssued: true
  },
  {
    id: 'INC-2026-8819',
    title: 'Primary Storm Canal Plastic & Silt Obstruction',
    category: 'DRAINAGE_BLOCKAGE',
    severity: 'HIGH',
    status: 'AI_VERIFIED',
    location: {
      lat: 19.0620,
      lng: 72.8620,
      address: 'Culvert 14B, Tidal Outfall Sluice Gate',
      ward: 'Ward H-East',
      zone: 'Zone I'
    },
    detectedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    satelliteImage: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    satellitePassId: 'PASS-SENTINEL1-SAR-11',
    satelliteSensor: 'SAR Sentinel-1 Radar',
    aiAnalysis: {
      confidence: 89,
      hazardType: 'DRAINAGE_BLOCKAGE',
      severity: 'HIGH',
      affectedAreaSqMeters: 1800,
      estimatedWaterDepthCm: 45,
      estimatedAffectedHouseholds: 1900,
      spectralIndex: {
        ndwi: 0.58
      },
      detectedFeatures: [
        'SAR backscatter anomaly indicating solid waste mass in waterway',
        'Flow rate restricted by ~78% at sluice gate',
        'Upstream canal water level rising +30cm/hr'
      ],
      recommendedCrewType: 'DRAINAGE_JETTING_SQUAD',
      requiredEquipment: [
        'Super-Sucker High Pressure Jetting Machine',
        'Amphibious Backhoe Dredger',
        'Trash Screen Grappler'
      ],
      dispatchPriorityScore: 82,
      aiSummary: 'Radar reflectivity shows a dense choke point 40m upstream of tidal sluice gate. If not cleared within 45 minutes, upstream wards will face secondary flooding.',
      mitigationSteps: [
        'Dispatch Drainage Jetting & Desilting Squad #01',
        'Open manual bypass overflow gate #2',
        'Erect safety netting to capture incoming plastic waste'
      ]
    },
    workOrderNumber: 'WO-MC-2026-912',
    communityReportsCount: 7,
    communityVerified: true,
    publicAdvisoryIssued: false
  },
  {
    id: 'INC-2026-8822',
    title: 'Heritage Market Water Main Burst & Subsidence',
    category: 'ROAD_SUBSIDENCE',
    severity: 'MEDIUM',
    status: 'DETECTED',
    location: {
      lat: 19.0490,
      lng: 72.8450,
      address: 'Heritage Market Crossway, Ward F-South',
      ward: 'Ward F-South',
      zone: 'Zone I'
    },
    detectedAt: new Date(Date.now() - 6 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60000).toISOString(),
    satelliteImage: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
    satellitePassId: 'PASS-WV3-OPTICAL-09',
    satelliteSensor: 'WorldView-3 Optical',
    aiAnalysis: {
      confidence: 91,
      hazardType: 'ROAD_SUBSIDENCE',
      severity: 'MEDIUM',
      affectedAreaSqMeters: 650,
      estimatedWaterDepthCm: 15,
      estimatedAffectedHouseholds: 450,
      spectralIndex: {
        ndwi: 0.35
      },
      detectedFeatures: [
        'Radial water dispersion on pavement',
        'Cracking asphalt pattern visible in 30cm optical imagery',
        'Traffic slowing to 5 km/h'
      ],
      recommendedCrewType: 'CIVIL_ROAD_REPAIR',
      requiredEquipment: [
        'Pavement Saw & Excavator',
        'Water Isolation Valve Key (400mm main)',
        'Asphalt Cold Patch Compound'
      ],
      dispatchPriorityScore: 68,
      aiSummary: 'Pressurized water pipe rupture undermining road sub-base. Immediate valve isolation required to prevent cavity enlargement.',
      mitigationSteps: [
        'Isolate pipeline sector valve 44-F',
        'Cordone 50-meter safety zone around subsidence center',
        'Dispatch Civil & Water Works Repair Unit'
      ]
    },
    workOrderNumber: 'WO-MC-2026-918',
    communityReportsCount: 3,
    communityVerified: false,
    publicAdvisoryIssued: false
  }
];

export const INITIAL_CREWS: MaintenanceCrew[] = [
  {
    id: 'CREW-PUMP-04',
    name: 'Heavy Dewatering Unit #04',
    type: 'DEWATERING_PUMP_UNIT',
    status: 'WORKING',
    currentLocation: { lat: 19.0758, lng: 72.8775, label: 'Sector 4 Underpass Site' },
    assignedIncidentId: 'INC-2026-8812',
    contactNumber: '+91 98201 44512',
    leadEngineer: 'Chief Engr. Rajesh Sharma',
    equipment: ['2x 150HP High-Capacity Pumps', '300m Discharge Hose', 'Telemetry Sump Sensor'],
    vehicleRegistration: 'MH-01-MC-8841',
    etaToIncidentMinutes: 0,
    completedTasksToday: 3
  },
  {
    id: 'CREW-ELEC-02',
    name: 'High Voltage Rapid Linemen Squad #02',
    type: 'HIGH_VOLTAGE_LINEMEN',
    status: 'EN_ROUTE',
    currentLocation: { lat: 19.0820, lng: 72.8890, label: 'En route on Eastern Highway' },
    assignedIncidentId: 'INC-2026-8815',
    contactNumber: '+91 98202 77319',
    leadEngineer: 'Sr. Lineman Vikram Deshmukh',
    equipment: ['Insulated 22kV Aerial Platform', 'High Voltage Thermal Imager', 'Cable Fault Locator'],
    vehicleRegistration: 'MH-01-MC-9022',
    etaToIncidentMinutes: 12,
    completedTasksToday: 2
  },
  {
    id: 'CREW-DRAIN-01',
    name: 'Hydraulic Jetting & Desilting Squad #01',
    type: 'DRAINAGE_JETTING_SQUAD',
    status: 'AVAILABLE',
    currentLocation: { lat: 19.0600, lng: 72.8550, label: 'Ward H Depot Station' },
    contactNumber: '+91 98204 11984',
    leadEngineer: 'Supervisor Amit Kulkarni',
    equipment: ['Super Sucker Jetting Truck (8000L)', 'CCTV Drain Camera Crawler', 'Heavy Trash Claw'],
    vehicleRegistration: 'MH-01-MC-6632',
    completedTasksToday: 4
  },
  {
    id: 'CREW-CIVIL-03',
    name: 'Emergency Civil & Road Patch Unit #03',
    type: 'CIVIL_ROAD_REPAIR',
    status: 'AVAILABLE',
    currentLocation: { lat: 19.0520, lng: 72.8480, label: 'South Zone Maintenance Yard' },
    contactNumber: '+91 98205 33201',
    leadEngineer: 'Engr. Sunita Patel',
    equipment: ['Hydraulic Excavator', 'Quick-set Cold Asphalt Mix', 'Steel Trench Plates'],
    vehicleRegistration: 'MH-01-MC-5421',
    completedTasksToday: 1
  },
  {
    id: 'CREW-RESCUE-01',
    name: 'Disaster Management Inflatable Rescue Boat #01',
    type: 'EMERGENCY_RESCUE_BOAT',
    status: 'AVAILABLE',
    currentLocation: { lat: 19.0710, lng: 72.8680, label: 'Riverine Fire Station Base' },
    contactNumber: '+91 98209 88100',
    leadEngineer: 'Capt. Manoj Verma',
    equipment: ['Zodiac Rigid Inflatable Boat (10-seat)', 'Rescue Life Vests & Rings', 'Floodlights'],
    vehicleRegistration: 'MH-01-DM-0104',
    completedTasksToday: 0
  }
];

export const INITIAL_CITIZEN_REPORTS: CitizenReport[] = [
  {
    id: 'CIT-REP-401',
    reportedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    userName: 'Pooja Nair (Resident, Sector 4)',
    location: {
      lat: 19.0762,
      lng: 72.8779,
      address: 'Near Sunshine Tower, Underpass Service Road',
      ward: 'Ward G-North',
      zone: 'Zone II'
    },
    category: 'WATER_LOGGING',
    waterLevelDescription: 'WAIST_DEEP',
    description: 'Underpass is completely submerged. Water has entered commercial basement shops. Cars are stuck in middle lane. Municipal drainage is bubbling backwards!',
    photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    upvotes: 28,
    verifiedByMunicipal: true,
    matchedIncidentId: 'INC-2026-8812'
  },
  {
    id: 'CIT-REP-402',
    reportedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    userName: 'Karthik Rao (Society Secretary)',
    location: {
      lat: 19.0882,
      lng: 72.8953,
      address: 'Green Meadows Apartment complex, Eastern Ring',
      ward: 'Ward L-East',
      zone: 'Zone III'
    },
    category: 'POWER_FAILURE',
    powerOutageDetails: {
      transformerSparks: true,
      streetlightsOff: true,
      homesAffectedApprox: 1200
    },
    description: 'Heard a loud explosive bang from the 33kV substation down the road with bright blue sparks. Total blackout in entire neighbourhood including streetlights.',
    photoUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    upvotes: 19,
    verifiedByMunicipal: true,
    matchedIncidentId: 'INC-2026-8815'
  },
  {
    id: 'CIT-REP-403',
    reportedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    userName: 'Mohammed Arif',
    location: {
      lat: 19.0624,
      lng: 72.8618,
      address: 'Canal Crossing Bridge, Near Shivaji Nagar',
      ward: 'Ward H-East',
      zone: 'Zone I'
    },
    category: 'DRAINAGE_BLOCKAGE',
    drainageClogReason: 'PLASTIC_DEBRIS',
    description: 'A massive log and plastic waste bags are blocking the sluice gate grill. The water is backing up towards the residential alleys rapidly.',
    photoUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    upvotes: 11,
    verifiedByMunicipal: true,
    matchedIncidentId: 'INC-2026-8819'
  }
];

export const INITIAL_CITY_HEALTH: CityHealthOverview = {
  overallScore: 78,
  status: 'ELEVATED URBAN RISK - MONSOON & INFRASTRUCTURE CONVERGENCE',
  floodRisk: 72,
  heatRisk: 41,
  waterRisk: 53,
  wasteRisk: 32,
  roadRisk: 61,
  citizenComplaintsTotal: 54,
  citizenComplaintsPending: 12,
  activeCriticalAlerts: 4,
  preventiveActionsDeployedToday: 18,
};

export const INITIAL_PREDICTIVE_FLOOD: PredictiveFloodForecast = {
  probability: 87,
  peakHours: '6:00 PM – 9:00 PM',
  expectedRainfallTotalMm: 126.4,
  soilSaturationPercentage: 92,
  drainageOverflowRisk: 'CRITICAL',
  highRiskWards: ['Ward 12 (Central)', 'Ward 4 (North Basin)', 'Ward 7 (Industrial Ring)'],
  timeline: [
    { time: '14:00', rainfallMm: 18, runoffLitresSec: 2400, inundationRisk: 35 },
    { time: '16:00', rainfallMm: 36, runoffLitresSec: 5800, inundationRisk: 62 },
    { time: '18:00', rainfallMm: 74, runoffLitresSec: 12400, inundationRisk: 87 },
    { time: '20:00', rainfallMm: 92, runoffLitresSec: 15200, inundationRisk: 94 },
    { time: '22:00', rainfallMm: 45, runoffLitresSec: 8900, inundationRisk: 70 },
    { time: '00:00', rainfallMm: 14, runoffLitresSec: 3200, inundationRisk: 40 }
  ],
  aiRecommendedActions: [
    'Inspect primary stormwater drainage in Ward 12 immediately',
    'Deploy high-capacity dewatering pumps (2x 150HP) near Zone B underpass',
    'Clear detected debris blockage at Tidal Sluice Gate 14B',
    'Issue geofenced push alerts to 14,000 residents in low-lying sectors',
    'Pre-position emergency civil rescue teams at Station 3'
  ]
};

export const INITIAL_ROAD_DAMAGES: YoloRoadDamageDetection[] = [
  {
    id: 'YOLO-RD-01',
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    source: 'INSPECTION_VEHICLE',
    location: {
      lat: 19.0765,
      lng: 72.8780,
      address: 'Arterial Ring Road, Near Junction 4',
      ward: 'Ward 12',
      zone: 'Zone II'
    },
    detectedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    defectType: 'POTHOLE',
    severity: 'HIGH',
    priority: 'P1',
    repairUrgency: '24-48 hours',
    confidence: 94.2,
    estimatedAreaSqM: 3.8,
    estimatedDepthCm: 14,
    recommendedRepair: 'Deep milling + rapid cold-mix asphalt mastic compaction',
    boundingBoxes: [
      { x: 28, y: 35, width: 44, height: 38, label: 'Pothole (Severe)', confidence: 0.94 }
    ],
    workOrderGenerated: true
  },
  {
    id: 'YOLO-RD-02',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    source: 'CCTV_FEED',
    location: {
      lat: 19.0885,
      lng: 72.8955,
      address: 'Express Flyover Descent, Sector 8',
      ward: 'Ward 4',
      zone: 'Zone III'
    },
    detectedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    defectType: 'ALLIGATOR_CRACKING',
    severity: 'HIGH',
    priority: 'P1',
    repairUrgency: '24-48 hours',
    confidence: 89.6,
    estimatedAreaSqM: 6.2,
    estimatedDepthCm: 8,
    recommendedRepair: 'Polymer modified bitumen crack sealing & overlay',
    boundingBoxes: [
      { x: 15, y: 22, width: 68, height: 55, label: 'Alligator Cracking', confidence: 0.90 }
    ],
    workOrderGenerated: true
  },
  {
    id: 'YOLO-RD-03',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    source: 'CITIZEN_UPLOAD',
    location: {
      lat: 19.0620,
      lng: 72.8620,
      address: 'Market Link Road, Ward 7',
      ward: 'Ward 7',
      zone: 'Zone I'
    },
    detectedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    defectType: 'DAMAGED_MANHOLE',
    severity: 'MEDIUM',
    priority: 'P2',
    repairUrgency: '3-5 days',
    confidence: 91.4,
    estimatedAreaSqM: 1.5,
    estimatedDepthCm: 22,
    recommendedRepair: 'Cast iron frame stabilization + concrete apron recasting',
    boundingBoxes: [
      { x: 32, y: 40, width: 36, height: 36, label: 'Dislodged Manhole Frame', confidence: 0.91 }
    ],
    workOrderGenerated: false
  }
];

export const INITIAL_WASTE_HOTSPOTS: WasteHotspotItem[] = [
  {
    id: 'WASTE-HS-12',
    hotspotName: 'Commercial Market Dump Hotspot #12',
    location: {
      lat: 19.0740,
      lng: 72.8810,
      address: 'Fruit & Produce Market Plaza, Ward 12',
      ward: 'Ward 12',
      zone: 'Zone II'
    },
    currentWasteLevel: 'HIGH',
    collectionDelayHours: 8,
    predictedOverflowHours: 6,
    binCapacityPercentage: 94,
    cameraImageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    actionRequired: 'Dispatch automated garbage compactor vehicle within 4 hours to prevent runoff contamination'
  },
  {
    id: 'WASTE-HS-04',
    hotspotName: 'Transit Terminal Bin Cluster #04',
    location: {
      lat: 19.0860,
      lng: 72.8910,
      address: 'Metro Station West Exit, Ward 4',
      ward: 'Ward 4',
      zone: 'Zone III'
    },
    currentWasteLevel: 'CRITICAL_OVERFLOW',
    collectionDelayHours: 12,
    predictedOverflowHours: 1,
    binCapacityPercentage: 118,
    cameraImageUrl: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
    assignedTruckId: 'CREW-05',
    actionRequired: 'Secondary compactor en route. Bio-sanitization sweep scheduled.'
  },
  {
    id: 'WASTE-HS-18',
    hotspotName: 'Residential Collector Point #18',
    location: {
      lat: 19.0510,
      lng: 72.8480,
      address: 'Hillside Colony Avenue, Ward 18',
      ward: 'Ward 18',
      zone: 'Zone I'
    },
    currentWasteLevel: 'MODERATE',
    collectionDelayHours: 3,
    predictedOverflowHours: 14,
    binCapacityPercentage: 68,
    cameraImageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    actionRequired: 'Regular morning route pickup adequate'
  }
];

export const INITIAL_HEATWAVE: HeatwaveForecastItem = {
  peakTemperatureC: 44.2,
  heatIndexC: 48.6,
  riskLevel: 'VERY_HIGH',
  vulnerableWards: ['Ward 12 (Dense Concrete Urban Core)', 'Ward 4 (Industrial Basin)', 'Ward 18 (Sloped Low-Canopy)'],
  coolingCentresActive: 14,
  totalCoolingCapacity: 6500,
  waterMistingStationsDeployed: 28,
  advisoryText: 'Extreme heat index peaking 48.6°C between 12:30 PM and 4:30 PM. Heatwave protocol Phase 2 activated with extended public cooling centre hours.'
};

export const INITIAL_WATER_SECURITY: WaterSecurityForecastItem = {
  reservoirLevelsPercentage: 48.2,
  groundwaterDepletionIndex: 74.5,
  consumptionDeficitMld: 42.0,
  stressPredictedWards: [
    { ward: 'Ward 9 (Upper Heights)', daysUntilStress: 4, severity: 'HIGH' },
    { ward: 'Ward 18 (Eastern Slopes)', daysUntilStress: 5, severity: 'HIGH' },
    { ward: 'Ward 4 (Industrial Zone)', daysUntilStress: 8, severity: 'MODERATE' }
  ],
  emergencyTankersAvailable: 35,
  emergencyTankersDispatched: 18,
  leakageAlertCount: 6
};

export const WARD_RISK_PROFILES: WardRiskProfile[] = [
  {
    wardId: 'WARD-12',
    wardName: 'Ward 12 (Central Civic & Arterial Core)',
    zone: 'Zone II',
    population: 480000,
    currentRiskScore: 78,
    floodRiskScore: 87,
    heatRiskScore: 43,
    waterRiskScore: 61,
    wasteRiskScore: 72,
    roadRiskScore: 78,
    expectedRainfallMm: 126.4,
    highRiskRoadsCount: 7,
    vulnerableAreasCount: 3,
    recommendedAction: 'Inspect drainage + deploy 2x heavy dewatering pumps at Sector 4 underpass',
    activeWaterloggingCount: 3,
    activePowerOutageCount: 1,
    activeDrainageBlockages: 2,
    drainageCapacityPercentage: 34,
    transformerHealthScore: 68,
    historicalFloodVulnerability: 'HIGH'
  },
  {
    wardId: 'WARD-04',
    wardName: 'Ward 4 (North Basin / Kurla / Saki Naka)',
    zone: 'Zone III',
    population: 620000,
    currentRiskScore: 84,
    floodRiskScore: 92,
    heatRiskScore: 56,
    waterRiskScore: 68,
    wasteRiskScore: 81,
    roadRiskScore: 84,
    expectedRainfallMm: 142.0,
    highRiskRoadsCount: 9,
    vulnerableAreasCount: 5,
    recommendedAction: 'Pre-position emergency flood rescue boat & dispatch waste compactor to Hotspot #04',
    activeWaterloggingCount: 2,
    activePowerOutageCount: 2,
    activeDrainageBlockages: 4,
    drainageCapacityPercentage: 28,
    transformerHealthScore: 42,
    historicalFloodVulnerability: 'HIGH'
  },
  {
    wardId: 'WARD-07',
    wardName: 'Ward 7 (Eastern Industrial Ring & Substation)',
    zone: 'Zone III',
    population: 390000,
    currentRiskScore: 71,
    floodRiskScore: 65,
    heatRiskScore: 68,
    waterRiskScore: 54,
    wasteRiskScore: 45,
    roadRiskScore: 72,
    expectedRainfallMm: 98.0,
    highRiskRoadsCount: 4,
    vulnerableAreasCount: 2,
    recommendedAction: 'Energize auxiliary 33kV transformer line & clear debris at Sluice Gate 14B',
    activeWaterloggingCount: 1,
    activePowerOutageCount: 1,
    activeDrainageBlockages: 1,
    drainageCapacityPercentage: 55,
    transformerHealthScore: 52,
    historicalFloodVulnerability: 'MODERATE'
  },
  {
    wardId: 'WARD-18',
    wardName: 'Ward 18 (Eastern Hillside & Reservoir Valley)',
    zone: 'Zone I',
    population: 340000,
    currentRiskScore: 68,
    floodRiskScore: 42,
    heatRiskScore: 74,
    waterRiskScore: 88,
    wasteRiskScore: 52,
    roadRiskScore: 59,
    expectedRainfallMm: 64.0,
    highRiskRoadsCount: 3,
    vulnerableAreasCount: 4,
    recommendedAction: 'Increase tanker allocation (6 units) + inspect main pipeline pressure sensors for leakage',
    activeWaterloggingCount: 0,
    activePowerOutageCount: 0,
    activeDrainageBlockages: 0,
    drainageCapacityPercentage: 75,
    transformerHealthScore: 86,
    historicalFloodVulnerability: 'LOW'
  },
  {
    wardId: 'WARD-09',
    wardName: 'Ward 9 (Upper Heights & High Density)',
    zone: 'Zone IV',
    population: 510000,
    currentRiskScore: 64,
    floodRiskScore: 48,
    heatRiskScore: 62,
    waterRiskScore: 82,
    wasteRiskScore: 59,
    roadRiskScore: 61,
    expectedRainfallMm: 72.0,
    highRiskRoadsCount: 4,
    vulnerableAreasCount: 3,
    recommendedAction: 'Reroute water booster pumps & open 2 air-conditioned cooling relief centres',
    activeWaterloggingCount: 1,
    activePowerOutageCount: 0,
    activeDrainageBlockages: 1,
    drainageCapacityPercentage: 62,
    transformerHealthScore: 78,
    historicalFloodVulnerability: 'MODERATE'
  }
];

export const GIS_POWER_LINES = [
  {
    id: 'GRID-LINE-33KV-A',
    name: '33kV Feeder Main Grid Line Alpha',
    voltage: '33kV',
    status: 'FAULT',
    coordinates: [
      [19.0950, 72.9050],
      [19.0880, 72.8950],
      [19.0810, 72.8820],
      [19.0760, 72.8777]
    ]
  },
  {
    id: 'GRID-LINE-11KV-B',
    name: '11kV Distribution Ring Beta',
    voltage: '11kV',
    status: 'ONLINE',
    coordinates: [
      [19.0760, 72.8777],
      [19.0680, 72.8680],
      [19.0620, 72.8620],
      [19.0550, 72.8520]
    ]
  },
  {
    id: 'GRID-LINE-11KV-C',
    name: '11kV South Feeder Ring Gamma',
    voltage: '11kV',
    status: 'ONLINE',
    coordinates: [
      [19.0550, 72.8520],
      [19.0490, 72.8450],
      [19.0420, 72.8390]
    ]
  }
];

export const GIS_DRAINAGE_NETWORK = [
  {
    id: 'DRAIN-TRUNK-1',
    name: 'Mithi River Coastal Discharge Canal',
    capacityM3s: 180,
    currentStatus: 'CRITICAL_OVERFLOW',
    coordinates: [
      [19.0980, 72.8850],
      [19.0850, 72.8760],
      [19.0760, 72.8777],
      [19.0620, 72.8620],
      [19.0480, 72.8350]
    ]
  },
  {
    id: 'DRAIN-CULVERT-4B',
    name: 'Sector 4 Stormwater Interceptor Culvert',
    capacityM3s: 45,
    currentStatus: 'OBSTRUCTED',
    coordinates: [
      [19.0820, 72.8890],
      [19.0760, 72.8777],
      [19.0710, 72.8650]
    ]
  }
];

export const INITIAL_SAR_WATERLOGGING: SegFormerSARWaterlogging = {
  id: 'SAR-SEG-2026-8841',
  satellite: 'Sentinel-1B C-Band SAR (Copernicus)',
  passId: 'S1B_IW_GRDH_1SDV_20260816T172240',
  orbitMode: 'Ascending (Track 114, Frame 480)',
  polarization: 'VV + VH dual-pol backscatter (dB)',
  resolutionMeters: 10,
  overpassTimestamp: '2026-08-16T17:22:40Z',
  updatedTimeAgo: '8 min ago',
  status: 'CRITICAL',
  confidencePercentage: 87.4,
  totalWaterloggedAreaKm2: 2.34,
  deltaLast3HoursKm2: 0.82,
  maxEstimatedDepthCm: 55,
  vulnerableHouseholdsInMask: 14200,
  images: {
    // Before: normal clear dry baseline optical satellite view
    beforeNormalUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80',
    // Satellite SAR: current radar backscatter grayscale/false-color microwave image
    currentSarUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
    // AI SegFormer-B2 Mask: segmented waterlogged probability heatmap with cyan flooded mask & red critical perimeters
    segFormerMaskUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80'
  },
  highRiskZones: [
    {
      id: 'ZONE-SAR-12A',
      ward: 'Ward 12 (Central Basin)',
      locationName: 'Sector 4 Metro Underpass & Low-Lying Artery',
      areaSqMeters: 420000,
      depthCm: 55,
      confidence: 94.2,
      lat: 19.0760,
      lng: 72.8777,
      priority: 'P1',
      criticalAssetThreat: 'Submerged 33kV Feeder Pillar & Metro Subsurface Drainage'
    },
    {
      id: 'ZONE-SAR-04B',
      ward: 'Ward 4 (Harbor Lowlands)',
      locationName: 'Coastal Slum Sector & Sluice Channel Confluence',
      areaSqMeters: 890000,
      depthCm: 42,
      confidence: 88.6,
      lat: 19.0550,
      lng: 72.8520,
      priority: 'P1',
      criticalAssetThreat: 'Tidal Backwater Overflow into 2,400 Ground-Floor Dwellings'
    },
    {
      id: 'ZONE-SAR-07C',
      ward: 'Ward 7 (River Corridor)',
      locationName: 'Mithi River Canal Spillway & Rail Bridge Chokepoint',
      areaSqMeters: 610000,
      depthCm: 38,
      confidence: 83.1,
      lat: 19.0980,
      lng: 72.8850,
      priority: 'P2',
      criticalAssetThreat: 'Railway Embankment Ballast Scour Risk'
    },
    {
      id: 'ZONE-SAR-18D',
      ward: 'Ward 18 (Eastern Basin)',
      locationName: 'Industrial Estate Logistics Causeway',
      areaSqMeters: 420000,
      depthCm: 25,
      confidence: 83.7,
      lat: 19.0420,
      lng: 72.8390,
      priority: 'P3',
      criticalAssetThreat: 'Surface water pooling obstructing chemical freight transit'
    }
  ],
  polygonCoordinates: [
    // Ward 12 Main Inundation Polygon
    [
      { lat: 19.0790, lng: 72.8740 },
      { lat: 19.0815, lng: 72.8785 },
      { lat: 19.0780, lng: 72.8830 },
      { lat: 19.0735, lng: 72.8800 },
      { lat: 19.0740, lng: 72.8745 }
    ],
    // Ward 4 Coastal Inundation Polygon
    [
      { lat: 19.0590, lng: 72.8480 },
      { lat: 19.0610, lng: 72.8560 },
      { lat: 19.0520, lng: 72.8580 },
      { lat: 19.0490, lng: 72.8510 },
      { lat: 19.0540, lng: 72.8470 }
    ],
    // Ward 7 River Corridor Spillway
    [
      { lat: 19.1020, lng: 72.8810 },
      { lat: 19.1040, lng: 72.8890 },
      { lat: 19.0950, lng: 72.8910 },
      { lat: 19.0930, lng: 72.8830 }
    ]
  ],
  pipelineDetails: {
    sensor: 'Sentinel-1B Synthetic Aperture Radar (C-Band 5.405 GHz)',
    preprocessing: 'Calibrated γ0 backscatter (dB) + Refined Lee Speckle Filter (7x7) + Range-Doppler Terrain Correction',
    modelArchitecture: 'SegFormer-B2 (Hierarchical Transformer Encoder + All-MLP Decoder, Overlapping Patch Embeddings)',
    thresholdConfig: 'Otsu Dynamic Backscatter Bimodal Threshold (σ0_VV < -17.8 dB, σ0_VH < -24.2 dB) + Hydro-connectivity',
    latencyMs: 340
  }
};

export const HISTORICAL_RISK_HOTSPOTS: HistoricalRiskHotspot[] = [
  {
    id: 'HIST-HOTSPOT-01',
    name: 'Sector 4 Metro Underpass & Low-Lying Basin',
    category: 'WATER_LOGGING',
    ward: 'Ward G-North (Ward 12)',
    lat: 19.0760,
    lng: 72.8777,
    radiusMeters: 450,
    historicalFrequencyScore: 96,
    incidentsCount5Years: 48,
    recurrenceTrigger: 'Precipitation >32mm/h or Mithi River Spillway level >3.4m',
    averageSubmersionOrImpact: '65 - 80cm flood depth (Avg 4.2h transit outage)',
    vulnerabilityGrade: 'CHRONIC_P1',
    primaryCause: 'Bowl-shaped topographical depression (-1.9m MSL) combined with 600mm undersized storm culvert',
    activeIncidentOverlapId: 'INC-2026-8812',
    activeIncidentOverlapTitle: 'Severe Waterlogging - Highway Underpass Sector 4',
    activeIncidentCorrelation: 'Active incident matches 96% historical pattern: underpass catchment inundated, trapping vehicular transit and threatening 33kV pillar.',
    longTermMitigationPlan: 'Construct 35,000 m³ underground retention cistern & install twin 1200mm automated dewatering siphon lines (CIP FY27).',
    colorHex: '#ef4444',
    intensity: 0.95
  },
  {
    id: 'HIST-HOTSPOT-02',
    name: 'Tidal Outfall Sluice Gate 14B & North Silt Canal',
    category: 'DRAINAGE_BLOCKAGE',
    ward: 'Ward H-East',
    lat: 19.0620,
    lng: 72.8620,
    radiusMeters: 380,
    historicalFrequencyScore: 91,
    incidentsCount5Years: 36,
    recurrenceTrigger: 'High tide peak (>4.1m) during heavy inland monsoon runoff',
    averageSubmersionOrImpact: 'Sluice backpressure causing 45cm street backflow across 1.8 km²',
    vulnerabilityGrade: 'CHRONIC_P1',
    primaryCause: 'Tidal silt accumulation and dense non-biodegradable debris clumps choking flap gate',
    activeIncidentOverlapId: 'INC-2026-8819',
    activeIncidentOverlapTitle: 'Primary Storm Canal Plastic & Silt Obstruction',
    activeIncidentCorrelation: 'Active incident directly mirrors historical blockage profile at Culvert 14B; 78% flow restriction recorded.',
    longTermMitigationPlan: 'Install automated trash-rack rake screen and motorized vertical lift sluice gates with SCADA telemetry.',
    colorHex: '#f97316',
    intensity: 0.88
  },
  {
    id: 'HIST-HOTSPOT-03',
    name: 'Eastern Industrial 33kV Substation Grid Zone',
    category: 'POWER_FAILURE',
    ward: 'Ward L-East',
    lat: 19.0880,
    lng: 72.8950,
    radiusMeters: 550,
    historicalFrequencyScore: 88,
    incidentsCount5Years: 29,
    recurrenceTrigger: 'Transformer busbar thermal delta >12°C during high moisture storm fronts',
    averageSubmersionOrImpact: 'Sector-wide blackout affecting ~8,500 domestic meters & water pumps',
    vulnerabilityGrade: 'HIGH_RECURRENCE_P2',
    primaryCause: 'Subsurface cable trench water ingress & aging SF6 circuit breakers prone to flashovers',
    activeIncidentOverlapId: 'INC-2026-8815',
    activeIncidentOverlapTitle: '33kV Substation Outage & Transformer Trip',
    activeIncidentCorrelation: 'Active blackout is 29th recorded outage in this grid node; thermal anomaly confirmed by Landsat-9 infrared scan.',
    longTermMitigationPlan: 'Elevate switchgear plinths +1.5m above HFL and convert to gas-insulated substation (GIS) standard.',
    colorHex: '#a855f7',
    intensity: 0.82
  },
  {
    id: 'HIST-HOTSPOT-04',
    name: 'Heritage Market Boulevard Sub-base Corridors',
    category: 'ROAD_SUBSIDENCE',
    ward: 'Ward F-South',
    lat: 19.0490,
    lng: 72.8450,
    radiusMeters: 320,
    historicalFrequencyScore: 84,
    incidentsCount5Years: 24,
    recurrenceTrigger: 'High-pressure water main cycles + saturated sandy silt stratum',
    averageSubmersionOrImpact: 'Pavement cavitation (3-5m diameter craters) & localized flooding',
    vulnerabilityGrade: 'HIGH_RECURRENCE_P2',
    primaryCause: '90-year-old cast-iron water distribution main with joint leaks undermining road foundation',
    activeIncidentOverlapId: 'INC-2026-8822',
    activeIncidentOverlapTitle: 'Heritage Market Water Main Burst & Subsidence',
    activeIncidentCorrelation: 'Current burst aligns with historical pipeline rupture cluster at Intersection 44-F.',
    longTermMitigationPlan: 'Trenchless slip-lining rehabilitation of 2.4km feeder main with ductile iron (DI) class K9 piping.',
    colorHex: '#eab308',
    intensity: 0.78
  },
  {
    id: 'HIST-HOTSPOT-05',
    name: 'Harbor Slum Confluence & Coastal Lowlands',
    category: 'WATER_LOGGING',
    ward: 'Ward 4 (Harbor Lowlands)',
    lat: 19.0550,
    lng: 72.8520,
    radiusMeters: 600,
    historicalFrequencyScore: 98,
    incidentsCount5Years: 54,
    recurrenceTrigger: 'Spring tides (>4.5m) or concurrent cloudburst events (>50mm/h)',
    averageSubmersionOrImpact: 'Widespread 50cm inundation of 2,400 ground-floor informal housing units',
    vulnerabilityGrade: 'CHRONIC_P1',
    primaryCause: 'Lack of natural storm drainage gradient and high impervious surface ratio without retaining sea wall',
    activeIncidentOverlapTitle: 'SAR Detected Coastal Lowland Inundation Mask',
    activeIncidentCorrelation: 'Directly verified by SegFormer SAR mask (Zone SAR-04B: 890k m² submerged).',
    longTermMitigationPlan: 'Construct reinforced coastal sea bund, storm pumping station (4x 2000 m³/h), and raised access walkways.',
    colorHex: '#ef4444',
    intensity: 0.98
  },
  {
    id: 'HIST-HOTSPOT-06',
    name: 'Mithi River Canal Spillway & Rail Bridge Chokepoint',
    category: 'WATER_LOGGING',
    ward: 'Ward 7 (River Corridor)',
    lat: 19.0980,
    lng: 72.8850,
    radiusMeters: 520,
    historicalFrequencyScore: 92,
    incidentsCount5Years: 41,
    recurrenceTrigger: 'River gauge level >3.8m MSL during upstream catchment release',
    averageSubmersionOrImpact: 'Rail track ballast submergence (30-45cm) halting suburban train services',
    vulnerabilityGrade: 'CHRONIC_P1',
    primaryCause: 'Narrow bridge pier constrictions reducing river discharge cross-section by 42%',
    activeIncidentOverlapTitle: 'SAR Zone 07C Spillway Overflow',
    activeIncidentCorrelation: 'Matches historical riverbank overtopping pattern; railway embankment scour warning triggered.',
    longTermMitigationPlan: 'Deepen and widen river canal channel by 15m; reconstruct central railway pier with single-span girder.',
    colorHex: '#06b6d4',
    intensity: 0.91
  },
  {
    id: 'HIST-HOTSPOT-07',
    name: 'Eastern Highway Industrial Freight Causeway',
    category: 'ROAD_SUBSIDENCE',
    ward: 'Ward 18 (Eastern Basin)',
    lat: 19.0420,
    lng: 72.8390,
    radiusMeters: 420,
    historicalFrequencyScore: 78,
    incidentsCount5Years: 19,
    recurrenceTrigger: 'Heavy multi-axle freight traffic on moisture-softened flexible pavement',
    averageSubmersionOrImpact: 'Deep rutting (>8cm) and multiple alligator crack clusters',
    vulnerabilityGrade: 'MODERATE_P3',
    primaryCause: 'Inadequate sub-base drainage and saturated black cotton soil subgrade',
    activeIncidentOverlapTitle: 'YOLOv11 Detected Heavy Rutting & Road Cracking',
    activeIncidentCorrelation: 'Correlates with CCTV vision detection of longitudinal road cracks in industrial lane.',
    longTermMitigationPlan: 'Full-depth rigid pavement reconstruction with geotextile separation membrane and edge subsurface drains.',
    colorHex: '#f59e0b',
    intensity: 0.74
  },
  {
    id: 'HIST-HOTSPOT-08',
    name: 'Central Urban Core Microclimate Heat Island',
    category: 'HEAT_ISLAND',
    ward: 'Ward G-South',
    lat: 19.0150,
    lng: 72.8280,
    radiusMeters: 650,
    historicalFrequencyScore: 82,
    incidentsCount5Years: 33,
    recurrenceTrigger: 'Ambient temperature >36°C with relative humidity >70% (Heat Index >46°C)',
    averageSubmersionOrImpact: '+4.2°C surface temperature anomaly compared to suburban baseline',
    vulnerabilityGrade: 'HIGH_RECURRENCE_P2',
    primaryCause: 'Ultra-high concrete density, glass curtain facades, and negligible canopy cover (<4%)',
    activeIncidentOverlapTitle: 'Heatwave Alert Tier-2 Sector',
    activeIncidentCorrelation: 'Matches thermal infrared satellite anomaly hot zone requiring mobile misting deployment.',
    longTermMitigationPlan: 'Cool Roof mandate implementation, 12,000 native tree canopy corridor planting, and cool pavement coatings.',
    colorHex: '#f43f5e',
    intensity: 0.85
  }
];

export const AUTHORITY_USERS: Record<string, AuthorityUser> = {
  MONITOR: {
    id: 'USR-MON-8821',
    name: 'Officer Vikram Malhotra',
    title: 'Duty Operations Monitor',
    level: 'MONITOR',
    badgeId: 'L1-MON-8821',
    department: 'Urban Operations Command & Field Telemetry',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    securityClearance: 'Level 1 - Field Monitoring & Operations Clearance',
    pinCode: '1111',
    permissions: {
      canViewLiveFeed: true,
      canQueryGisMaps: true,
      canDraftEscalations: true,
      canDispatchRoutineCrew: true,
      canApproveCriticalDispatch: false,
      canBroadcastCitywide: false,
      canTuneAiThresholds: false,
      canOverridePowerGrid: false,
      canSignOffWorkOrders: false,
      canAuditLogs: true
    }
  },
  SUPER_MONITOR: {
    id: 'USR-SUP-001A',
    name: 'Commissioner Dr. Ananya Sen',
    title: 'Chief Incident Commander & Municipal Commissioner',
    level: 'SUPER_MONITOR',
    badgeId: 'L2-EXEC-001A',
    department: 'Executive Disaster Management & Urban Resilience Bureau',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    securityClearance: 'Level 2 - Super Monitor (Executive Command Authority Alpha)',
    pinCode: '9999',
    permissions: {
      canViewLiveFeed: true,
      canQueryGisMaps: true,
      canDraftEscalations: true,
      canDispatchRoutineCrew: true,
      canApproveCriticalDispatch: true,
      canBroadcastCitywide: true,
      canTuneAiThresholds: true,
      canOverridePowerGrid: true,
      canSignOffWorkOrders: true,
      canAuditLogs: true,
      canVerifyIssueResolution: true,
      canReopenUnresolvedIssue: true,
      canSignHeadAdminAudit: true,
      canAccessGoogleFeedbackPortal: true
    }
  },
  HEAD_ADMIN: {
    id: 'USR-HEAD-ADMIN-001',
    name: 'Director General R. K. Varma',
    title: 'Supreme Head Admin & Chief Quality Inspection Director',
    level: 'HEAD_ADMIN',
    badgeId: 'L3-HEAD-ADMIN-99X',
    department: 'Supreme Municipal Oversight & Quality Resolution Command',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    securityClearance: 'Level 3 - Head Admin (Supreme Resolution Audit & Final Sign-Off Clearance)',
    pinCode: '0000',
    permissions: {
      canViewLiveFeed: true,
      canQueryGisMaps: true,
      canDraftEscalations: true,
      canDispatchRoutineCrew: true,
      canApproveCriticalDispatch: true,
      canBroadcastCitywide: true,
      canTuneAiThresholds: true,
      canOverridePowerGrid: true,
      canSignOffWorkOrders: true,
      canAuditLogs: true,
      canVerifyIssueResolution: true,
      canReopenUnresolvedIssue: true,
      canSignHeadAdminAudit: true,
      canAccessGoogleFeedbackPortal: true
    }
  }
};

export const INITIAL_CITIZEN_FEEDBACK: CitizenFeedbackItem[] = [
  {
    id: 'FBK-2026-101',
    incidentId: 'INC-2026-8812',
    incidentTitle: 'Sector 4 Expressway Underpass Inundation',
    submittedAt: '12 mins ago',
    citizenName: 'Rahul Deshmukh',
    citizenPhone: '+91 98201 44210',
    ward: 'Ward G-North',
    groundSituation: 'FULLY_SOLVED',
    responseRating: 5,
    feedbackText: 'The heavy dewatering pump squad arrived within 20 mins. Water on underpass is 100% drained and traffic is moving normally now. Great work!',
    photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    googleFormResponseId: 'GFORM-RESP-8849102',
    verifiedByHeadAdmin: true
  },
  {
    id: 'FBK-2026-102',
    incidentId: 'INC-2026-8814',
    incidentTitle: 'Eastern Industrial Substation Grid Blackout',
    submittedAt: '28 mins ago',
    citizenName: 'Priya Sundaram',
    citizenPhone: '+91 97112 33091',
    ward: 'Ward L-East',
    groundSituation: 'PARTIALLY_SOLVED',
    responseRating: 3,
    feedbackText: 'Feeder line repair crew is on site and power restored in Sector 2, but streetlights in Sector 3 remain dark. Need Head Admin inspection.',
    photoUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    googleFormResponseId: 'GFORM-RESP-8849103',
    verifiedByHeadAdmin: false
  },
  {
    id: 'FBK-2026-103',
    incidentId: 'INC-2026-8815',
    incidentTitle: 'Mahim Bay Storm Drain Overflow & Debris Blockage',
    submittedAt: '45 mins ago',
    citizenName: 'Amitabh Sen',
    citizenPhone: '+91 99820 11928',
    ward: 'Ward F-South',
    groundSituation: 'NOT_SOLVED_CRITICAL',
    responseRating: 1,
    feedbackText: 'Drainage blockage still severe despite crew marking in-progress! Trash is clogging culvert #4 and water level rising near market area.',
    photoUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80',
    googleFormResponseId: 'GFORM-RESP-8849104',
    verifiedByHeadAdmin: false
  }
];

export const INITIAL_APPROVAL_REQUESTS: ApprovalRequest[] = [
  {
    id: 'APR-2026-901',
    requestedAt: '10 mins ago',
    requestedBy: 'Officer Vikram Malhotra (Monitor L1)',
    requestedByRole: 'Duty Operations Monitor',
    category: 'CRITICAL_DISPATCH',
    title: 'Emergency High-Capacity Dewatering Unit (5000 GPM) Allocation',
    description: 'Sentinel-1 SAR radar detected rapid 85cm water ingress at Sector 4 Expressway underpass. Critical bus transit artery blocked. Requires immediate diversion of Heavy Dewatering Squad #02 from standby depot.',
    ward: 'Ward 4 (Industrial Basin)',
    incidentId: 'INC-2026-8812',
    urgency: 'CRITICAL',
    status: 'PENDING'
  },
  {
    id: 'APR-2026-902',
    requestedAt: '24 mins ago',
    requestedBy: 'Duty Desk Sector West (Monitor L1)',
    requestedByRole: 'Duty Operations Monitor',
    category: 'GRID_LOCKOUT',
    title: '33kV Industrial Feeder Line Emergency De-Energization',
    description: 'Submerged step-down transformer detected with active telemetry ground fault arc. Line Linemen crew #01 request remote grid lockout authorization to avert electrocution hazard.',
    ward: 'Ward 4 (Substation Corridor)',
    incidentId: 'INC-2026-8814',
    urgency: 'CRITICAL',
    status: 'PENDING'
  },
  {
    id: 'APR-2026-903',
    requestedAt: '38 mins ago',
    requestedBy: 'Officer Vikram Malhotra (Monitor L1)',
    requestedByRole: 'Duty Operations Monitor',
    category: 'EMERGENCY_BROADCAST',
    title: 'Cell-Broadcast EAS Flash Flood Warning Push to 420,000 Citizens',
    description: 'TimesFM predicts +58mm cloudburst within next 90 minutes over Low-Lying Eastern Basin. Propose bilingual emergency SMS + cell broadcast sirens to evacuate underpasses.',
    ward: 'All Municipal Zones',
    urgency: 'HIGH',
    status: 'PENDING'
  },
  {
    id: 'APR-2026-898',
    requestedAt: '2 hours ago',
    requestedBy: 'Officer Vikram Malhotra (Monitor L1)',
    requestedByRole: 'Duty Operations Monitor',
    category: 'SLUICE_GATE_OVERRIDE',
    title: 'Mahim Sluice Gate #04 Tidal Backflow Valve Release',
    description: 'High tide peak at 3.8m coinciding with 42mm/h monsoon run-off. Requested motorized sluice gate opening.',
    ward: 'Ward G-North',
    urgency: 'HIGH',
    status: 'APPROVED',
    reviewedAt: '1 hr 45m ago',
    reviewedBy: 'Commissioner Dr. Ananya Sen (Super Monitor L2)',
    reviewNotes: 'Authorized with digital signature. Coordinate with coastal marine patrol.',
    digitalSignature: 'SIG-SHA256-7FA8991209BCE81D'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'AUD-8820',
    timestamp: '14 mins ago',
    actorName: 'Officer Vikram Malhotra',
    actorLevel: 'MONITOR',
    actionTitle: 'Submitted Escalation Request #APR-2026-901',
    targetEntity: 'Incident INC-2026-8812 (Sector 4 Dewatering)',
    category: 'ESCALATION_SUBMIT',
    digitalSignature: 'SIG-L1-AUTH-90928B'
  },
  {
    id: 'AUD-8819',
    timestamp: '1 hr 45m ago',
    actorName: 'Commissioner Dr. Ananya Sen',
    actorLevel: 'SUPER_MONITOR',
    actionTitle: 'Approved Sluice Gate Tidal Release #APR-2026-898',
    targetEntity: 'Mahim Sluice Gate #04',
    category: 'EXECUTIVE_SIGN_OFF',
    digitalSignature: 'SIG-SHA256-7FA8991209BCE81D'
  },
  {
    id: 'AUD-8815',
    timestamp: '3 hrs ago',
    actorName: 'Commissioner Dr. Ananya Sen',
    actorLevel: 'SUPER_MONITOR',
    actionTitle: 'Modified AI SAR Flood Detection Sensitivity',
    targetEntity: 'SegFormer-B2 Confidence Gate (Set to 70%)',
    category: 'MODEL_THRESHOLD_TUNE',
    digitalSignature: 'SIG-SHA256-88220A99443C'
  },
  {
    id: 'AUD-8810',
    timestamp: '5 hrs ago',
    actorName: 'Officer Vikram Malhotra',
    actorLevel: 'MONITOR',
    actionTitle: 'Dispatched Routine Road Repair Squad #04',
    targetEntity: 'Pothole Cluster #YOLO-RD-04',
    category: 'ROUTINE_DISPATCH',
    digitalSignature: 'SIG-L1-AUTH-11883A'
  }
];



