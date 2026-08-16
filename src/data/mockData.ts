import { Incident, MaintenanceCrew, CitizenReport, WardRiskProfile, WeatherData } from '../types';

export const INITIAL_WEATHER: WeatherData = {
  city: 'Metropolitan Urban District',
  temperature: 28.4,
  precipitationMmPerHour: 42.5,
  windSpeedKmh: 28,
  humidity: 89,
  radarStatus: 'HEAVY_PRECIPITATION',
  forecastNext6HoursMm: [42.5, 38.0, 29.5, 18.0, 12.0, 4.5],
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

export const WARD_RISK_PROFILES: WardRiskProfile[] = [
  {
    wardId: 'WARD-G-N',
    wardName: 'Ward G-North (Dadar / Matunga / Mahim)',
    zone: 'Zone II',
    population: 480000,
    currentRiskScore: 88,
    activeWaterloggingCount: 3,
    activePowerOutageCount: 1,
    activeDrainageBlockages: 2,
    drainageCapacityPercentage: 34,
    transformerHealthScore: 68,
    historicalFloodVulnerability: 'HIGH'
  },
  {
    wardId: 'WARD-L-E',
    wardName: 'Ward L-East (Kurla / Saki Naka)',
    zone: 'Zone III',
    population: 620000,
    currentRiskScore: 92,
    activeWaterloggingCount: 2,
    activePowerOutageCount: 2,
    activeDrainageBlockages: 4,
    drainageCapacityPercentage: 28,
    transformerHealthScore: 42,
    historicalFloodVulnerability: 'HIGH'
  },
  {
    wardId: 'WARD-H-E',
    wardName: 'Ward H-East (Bandra East / Khar)',
    zone: 'Zone I',
    population: 390000,
    currentRiskScore: 74,
    activeWaterloggingCount: 1,
    activePowerOutageCount: 0,
    activeDrainageBlockages: 1,
    drainageCapacityPercentage: 55,
    transformerHealthScore: 82,
    historicalFloodVulnerability: 'MODERATE'
  },
  {
    wardId: 'WARD-F-S',
    wardName: 'Ward F-South (Parel / Sewri)',
    zone: 'Zone I',
    population: 310000,
    currentRiskScore: 61,
    activeWaterloggingCount: 1,
    activePowerOutageCount: 0,
    activeDrainageBlockages: 0,
    drainageCapacityPercentage: 68,
    transformerHealthScore: 89,
    historicalFloodVulnerability: 'LOW'
  },
  {
    wardId: 'WARD-K-W',
    wardName: 'Ward K-West (Andheri West / Juhu)',
    zone: 'Zone IV',
    population: 550000,
    currentRiskScore: 65,
    activeWaterloggingCount: 1,
    activePowerOutageCount: 1,
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
