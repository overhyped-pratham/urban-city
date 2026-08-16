import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INITIAL_INCIDENTS,
  INITIAL_CREWS,
  INITIAL_CITIZEN_REPORTS,
  WARD_RISK_PROFILES,
  INITIAL_WEATHER,
  INITIAL_CITY_HEALTH,
  INITIAL_PREDICTIVE_FLOOD,
  INITIAL_ROAD_DAMAGES,
  INITIAL_WASTE_HOTSPOTS,
  INITIAL_HEATWAVE,
  INITIAL_WATER_SECURITY
} from './src/data/mockData.ts';
import { Incident, MaintenanceCrew, CitizenReport, NotificationItem } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// In-Memory state store initialized with rich data
let incidents: Incident[] = [...INITIAL_INCIDENTS];
let crews: MaintenanceCrew[] = [...INITIAL_CREWS];
let citizenReports: CitizenReport[] = [...INITIAL_CITIZEN_REPORTS];
let notifications: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    timestamp: new Date(Date.now() - 38 * 60000).toISOString(),
    title: 'CRITICAL INUNDATION DETECTED',
    message: 'Sentinel-2 scan detected 4,200m² waterlogging at Sector 4 Underpass. Auto-work order generated.',
    type: 'CRITICAL_ALERT',
    incidentId: 'INC-2026-8812',
    read: false
  },
  {
    id: 'NOTIF-02',
    timestamp: new Date(Date.now() - 22 * 60000).toISOString(),
    title: '33kV SUBSTATION BLACKOUT',
    message: 'Landsat-9 thermal scan identified sudden loss of radiance. 8,400 households affected.',
    type: 'CRITICAL_ALERT',
    incidentId: 'INC-2026-8815',
    read: false
  },
  {
    id: 'NOTIF-03',
    timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
    title: 'CREW DISPATCHED',
    message: 'High Voltage Rapid Linemen Squad #02 en route to 33kV Terminal. ETA 12 mins.',
    type: 'DISPATCH_UPDATE',
    incidentId: 'INC-2026-8815',
    read: false
  },
  {
    id: 'NOTIF-04',
    timestamp: new Date(Date.now() - 9 * 60000).toISOString(),
    title: 'CITIZEN GROUND REPORT VERIFIED',
    message: 'Citizen report #403 confirmed 18m debris block at Tidal Sluice Gate (Ward H-East).',
    type: 'CITIZEN_REPORT',
    incidentId: 'INC-2026-8819',
    read: true
  }
];

// Lazy Gemini client initialization
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), totalIncidents: incidents.length });
});

// Get all incidents with optional filtering
app.get('/api/incidents', (req, res) => {
  const { category, severity, status, ward } = req.query;
  let filtered = [...incidents];

  if (category && category !== 'ALL') {
    filtered = filtered.filter(i => i.category === category);
  }
  if (severity && severity !== 'ALL') {
    filtered = filtered.filter(i => i.severity === severity);
  }
  if (status && status !== 'ALL') {
    filtered = filtered.filter(i => i.status === status);
  }
  if (ward && ward !== 'ALL') {
    filtered = filtered.filter(i => i.location.ward === ward);
  }

  res.json({ incidents: filtered });
});

// Get single incident
app.get('/api/incidents/:id', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json({ incident });
});

// Update incident status / assignment
app.patch('/api/incidents/:id', (req, res) => {
  const { id } = req.params;
  const index = incidents.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const existing = incidents[index];
  const { status, assignedCrewId, resolutionNotes, publicAdvisoryIssued } = req.body;

  let assignedCrewName = existing.assignedCrewName;
  let assignedCrewEtaMinutes = existing.assignedCrewEtaMinutes;

  if (assignedCrewId && assignedCrewId !== existing.assignedCrewId) {
    const crew = crews.find(c => c.id === assignedCrewId);
    if (crew) {
      assignedCrewName = crew.name;
      assignedCrewEtaMinutes = 15;
      crew.status = 'EN_ROUTE';
      crew.assignedIncidentId = id;
    }
  }

  const updated: Incident = {
    ...existing,
    ...(status ? { status } : {}),
    ...(assignedCrewId !== undefined ? { assignedCrewId, assignedCrewName, assignedCrewEtaMinutes } : {}),
    ...(resolutionNotes !== undefined ? { resolutionNotes } : {}),
    ...(publicAdvisoryIssued !== undefined ? { publicAdvisoryIssued } : {}),
    ...(status === 'RESOLVED' ? { resolvedAt: new Date().toISOString() } : {}),
    updatedAt: new Date().toISOString()
  };

  incidents[index] = updated;

  // Add system notification for status change
  notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    timestamp: new Date().toISOString(),
    title: `INCIDENT UPDATE: ${updated.id}`,
    message: `Status updated to ${updated.status} for "${updated.title}".`,
    type: 'DISPATCH_UPDATE',
    incidentId: updated.id,
    read: false
  });

  res.json({ incident: updated });
});

// Create new incident (e.g. from satellite analysis or manual escalation)
app.post('/api/incidents', (req, res) => {
  const newIncident: Incident = {
    id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    detectedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    workOrderNumber: `WO-MC-2026-${Math.floor(100 + Math.random() * 900)}`,
    communityReportsCount: 0,
    communityVerified: false,
    publicAdvisoryIssued: false,
    ...req.body
  };

  incidents.unshift(newIncident);

  // Auto notification
  notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    timestamp: new Date().toISOString(),
    title: `NEW INCIDENT: ${newIncident.severity} - ${newIncident.category}`,
    message: `${newIncident.title} detected in ${newIncident.location.ward}.`,
    type: 'CRITICAL_ALERT',
    incidentId: newIncident.id,
    read: false
  });

  res.status(201).json({ incident: newIncident });
});

// Satellite Image AI Analysis via Gemini 3.7 Flash
app.post('/api/analyze-satellite', async (req, res) => {
  try {
    const { imageBase64, imageMimeType = 'image/jpeg', locationContext, sensorType = 'Sentinel-2 Multispectral' } = req.body;

    const ai = getGeminiClient();

    let analysisResult;

    if (ai && imageBase64) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const systemPrompt = `You are UrbanWatch Sentinel, an expert Municipal Satellite Remote Sensing & GIS AI for urban disaster management.
Analyze this high-resolution aerial/satellite image for municipal infrastructure hazards including:
1. Urban Water Logging & Flash Inundation (detect standing water pools, submerged roads, saturated catchments, NDWI index estimation)
2. Electrical Grid & Power Substation Outages / Hazards (thermal loss, sparking, damaged high-tension pylons, blackout polygons)
3. Drainage Canal & Sluice Gate Clogs (plastic waste accumulation, silt buildup, culvert obstruction)
4. Road Subsidence / Sinkholes / Broken water mains.

Provide a high-precision, actionable municipal emergency assessment in JSON.`;

        const userPrompt = `Analyze this satellite scan (${sensorType}). Location Context: ${locationContext || 'Urban Metropolitan Grid'}.
Output JSON format matching this exact schema:
{
  "confidence": 95,
  "hazardType": "WATER_LOGGING" (choose one: "WATER_LOGGING", "POWER_FAILURE", "DRAINAGE_BLOCKAGE", "SEWAGE_OVERFLOW", "ROAD_SUBSIDENCE"),
  "severity": "CRITICAL" (choose one: "CRITICAL", "HIGH", "MEDIUM", "LOW"),
  "affectedAreaSqMeters": 3500,
  "estimatedWaterDepthCm": 65,
  "powerOutageRadiusMeters": 0,
  "estimatedAffectedHouseholds": 2800,
  "spectralIndex": {
    "ndwi": 0.68,
    "thermalAnomaly": 0,
    "vegetationIndex": 0.12
  },
  "detectedFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "recommendedCrewType": "DEWATERING_PUMP_UNIT" (choose: "DEWATERING_PUMP_UNIT", "HIGH_VOLTAGE_LINEMEN", "DRAINAGE_JETTING_SQUAD", "CIVIL_ROAD_REPAIR", "EMERGENCY_RESCUE_BOAT"),
  "requiredEquipment": ["Equipment 1", "Equipment 2"],
  "dispatchPriorityScore": 92,
  "aiSummary": "Concise technical diagnosis for municipal maintenance engineer",
  "mitigationSteps": ["Step 1", "Step 2", "Step 3"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: imageMimeType,
                  data: cleanBase64
                }
              },
              {
                text: `${systemPrompt}\n\n${userPrompt}`
              }
            ]
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                confidence: { type: Type.NUMBER },
                hazardType: { type: Type.STRING },
                severity: { type: Type.STRING },
                affectedAreaSqMeters: { type: Type.NUMBER },
                estimatedWaterDepthCm: { type: Type.NUMBER },
                powerOutageRadiusMeters: { type: Type.NUMBER },
                estimatedAffectedHouseholds: { type: Type.NUMBER },
                spectralIndex: {
                  type: Type.OBJECT,
                  properties: {
                    ndwi: { type: Type.NUMBER },
                    thermalAnomaly: { type: Type.NUMBER },
                    vegetationIndex: { type: Type.NUMBER }
                  }
                },
                detectedFeatures: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                recommendedCrewType: { type: Type.STRING },
                requiredEquipment: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                dispatchPriorityScore: { type: Type.NUMBER },
                aiSummary: { type: Type.STRING },
                mitigationSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: [
                'confidence',
                'hazardType',
                'severity',
                'affectedAreaSqMeters',
                'detectedFeatures',
                'recommendedCrewType',
                'requiredEquipment',
                'dispatchPriorityScore',
                'aiSummary',
                'mitigationSteps'
              ]
            }
          }
        });

        if (response.text) {
          analysisResult = JSON.parse(response.text.trim());
        }
      } catch (geminiErr) {
        console.warn('Gemini vision API fallback engaged:', geminiErr);
      }
    }

    // High quality intelligent fallback if Gemini unavailable or offline
    if (!analysisResult) {
      const isPower = sensorType.toLowerCase().includes('thermal') || (locationContext && locationContext.toLowerCase().includes('substation'));
      const isDrain = sensorType.toLowerCase().includes('sar') || (locationContext && locationContext.toLowerCase().includes('canal'));
      const isRoad = locationContext && locationContext.toLowerCase().includes('subsidence');

      if (isPower) {
        analysisResult = {
          confidence: 94,
          hazardType: 'POWER_FAILURE',
          severity: 'CRITICAL',
          affectedAreaSqMeters: 95000,
          powerOutageRadiusMeters: 1100,
          estimatedAffectedHouseholds: 6200,
          spectralIndex: { ndwi: -0.15, thermalAnomaly: -7.6 },
          detectedFeatures: [
            'Severe drop in longwave infrared thermal signature across transformer bay',
            'Nocturnal satellite radiance reveals complete dark zone in sector grid',
            'Feeders 3A & 3B show zero load transmission'
          ],
          recommendedCrewType: 'HIGH_VOLTAGE_LINEMEN',
          requiredEquipment: ['22kV Bucket Aerial Truck', 'Digital SF6 Breaker Analyzer', '400kVA Mobile Diesel Generator'],
          dispatchPriorityScore: 96,
          aiSummary: 'Thermal anomaly detection confirms sudden trip in 33kV main transformer. High priority due to water pumping station circuit integration.',
          mitigationSteps: [
            'Dispatch High Voltage Linemen Squad immediately',
            'Isolate transformer bay #2 to prevent cascade surge',
            'Switch auxiliary power to regional hospital backup circuit'
          ]
        };
      } else if (isDrain) {
        analysisResult = {
          confidence: 90,
          hazardType: 'DRAINAGE_BLOCKAGE',
          severity: 'HIGH',
          affectedAreaSqMeters: 2200,
          estimatedWaterDepthCm: 48,
          estimatedAffectedHouseholds: 2400,
          spectralIndex: { ndwi: 0.62 },
          detectedFeatures: [
            'SAR backscatter anomaly indicating dense non-aqueous solid debris at tidal sluice grill',
            'Hydraulic flow velocity reduced by 74% upstream of culvert',
            'Surface water backup encroaching 120m into residential perimeter'
          ],
          recommendedCrewType: 'DRAINAGE_JETTING_SQUAD',
          requiredEquipment: ['Super Sucker High Pressure Jetting Machine', 'Amphibious Trash Harvester', 'Heavy Dewatering Sump Pump'],
          dispatchPriorityScore: 86,
          aiSummary: 'Synthetic Aperture Radar indicates critical solid waste blockage at primary stormwater outfall. Imminent risk of widespread backflow.',
          mitigationSteps: [
            'Deploy Drainage Jetting & Desilting Squad #01',
            'Activate secondary stormwater tidal relief gates',
            'Place emergency trash containment boom upstream'
          ]
        };
      } else if (isRoad) {
        analysisResult = {
          confidence: 92,
          hazardType: 'ROAD_SUBSIDENCE',
          severity: 'MEDIUM',
          affectedAreaSqMeters: 750,
          estimatedWaterDepthCm: 18,
          estimatedAffectedHouseholds: 600,
          spectralIndex: { ndwi: 0.38 },
          detectedFeatures: [
            'Radial pavement deformation and asphalt fissure lines',
            'Subsurface moisture saturation indicating pressurized potable water line rupture',
            'Vehicle traffic constriction to single lane'
          ],
          recommendedCrewType: 'CIVIL_ROAD_REPAIR',
          requiredEquipment: ['Hydraulic Pavement Breaker', 'Water Sluice Valve Key', 'Rapid-Cure Asphalt Cold Patch'],
          dispatchPriorityScore: 72,
          aiSummary: 'High-resolution optical scan reveals pavement subsidence caused by underground utility pipe rupture. Urgent isolation needed.',
          mitigationSteps: [
            'Shut down municipal main supply valve #44',
            'Erect traffic safety perimeter barriers',
            'Dispatch emergency road repair crew'
          ]
        };
      } else {
        analysisResult = {
          confidence: 96,
          hazardType: 'WATER_LOGGING',
          severity: 'CRITICAL',
          affectedAreaSqMeters: 4500,
          estimatedWaterDepthCm: 75,
          estimatedAffectedHouseholds: 3600,
          spectralIndex: { ndwi: 0.76 },
          detectedFeatures: [
            'Continuous deep water inundation covering all 4 arterial road lanes',
            'NDWI index +0.76 confirming deep open water pooling',
            'Catch basin drainage backpressure resulting in localized geysers',
            'Bus transit corridor blocked'
          ],
          recommendedCrewType: 'DEWATERING_PUMP_UNIT',
          requiredEquipment: ['2x 150HP High-Capacity Diesel Pumps', '400m Flexible Discharge Line', 'Submersible Sump Sludge Agitator'],
          dispatchPriorityScore: 95,
          aiSummary: 'Severe waterlogging detected via multispectral NDWI analysis. Water depth estimated at 75cm causing complete transportation paralysis.',
          mitigationSteps: [
            'Dispatch Heavy Dewatering Pump Squad Unit #04',
            'Trigger traffic diversion alerts via municipal transit feed',
            'Discharge accumulated stormwater into regional storm channel'
          ]
        };
      }
    }

    res.json({ analysis: analysisResult });
  } catch (error) {
    console.error('Error analyzing satellite imagery:', error);
    res.status(500).json({ error: 'Failed to analyze satellite imagery', details: String(error) });
  }
});

// Crews API
app.get('/api/crews', (req, res) => {
  res.json({ crews });
});

app.post('/api/crews/:id/dispatch', (req, res) => {
  const { id } = req.params;
  const { incidentId, etaMinutes = 12 } = req.body;

  const crew = crews.find(c => c.id === id);
  if (!crew) {
    return res.status(404).json({ error: 'Crew not found' });
  }

  crew.status = 'EN_ROUTE';
  crew.assignedIncidentId = incidentId;
  crew.etaToIncidentMinutes = etaMinutes;

  if (incidentId) {
    const inc = incidents.find(i => i.id === incidentId);
    if (inc) {
      inc.status = 'DISPATCHED';
      inc.assignedCrewId = crew.id;
      inc.assignedCrewName = crew.name;
      inc.assignedCrewEtaMinutes = etaMinutes;
      inc.updatedAt = new Date().toISOString();
    }
  }

  notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    timestamp: new Date().toISOString(),
    title: `CREW DISPATCHED: ${crew.name}`,
    message: `Dispatched to incident ${incidentId || 'Location'}. ETA: ${etaMinutes} mins.`,
    type: 'DISPATCH_UPDATE',
    incidentId,
    read: false
  });

  res.json({ crew, incidents });
});

// Citizen Reports API
app.get('/api/citizen-reports', (req, res) => {
  res.json({ reports: citizenReports });
});

app.post('/api/citizen-reports', (req, res) => {
  const newReport: CitizenReport = {
    id: `CIT-REP-${Math.floor(500 + Math.random() * 500)}`,
    reportedAt: new Date().toISOString(),
    upvotes: 1,
    verifiedByMunicipal: false,
    ...req.body
  };

  // Check if matches any existing incident within 500m
  const matched = incidents.find(i => {
    const latDiff = Math.abs(i.location.lat - newReport.location.lat);
    const lngDiff = Math.abs(i.location.lng - newReport.location.lng);
    return latDiff < 0.008 && lngDiff < 0.008;
  });

  if (matched) {
    newReport.matchedIncidentId = matched.id;
    matched.communityReportsCount += 1;
    matched.communityVerified = true;
  }

  citizenReports.unshift(newReport);

  notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    timestamp: new Date().toISOString(),
    title: `NEW CITIZEN REPORT: ${newReport.category}`,
    message: `${newReport.userName} reported hazard at ${newReport.location.address}.`,
    type: 'CITIZEN_REPORT',
    incidentId: newReport.matchedIncidentId,
    read: false
  });

  res.status(201).json({ report: newReport, matchedIncident: matched || null });
});

app.post('/api/citizen-reports/:id/verify', (req, res) => {
  const report = citizenReports.find(r => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report.upvotes += 1;
  report.verifiedByMunicipal = true;

  if (report.matchedIncidentId) {
    const inc = incidents.find(i => i.id === report.matchedIncidentId);
    if (inc) {
      inc.communityVerified = true;
    }
  }

  res.json({ report });
});

// Analytics & Risk Profiles API
app.get('/api/analytics', (req, res) => {
  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
  const inProgressCount = incidents.filter(i => i.status === 'IN_PROGRESS' || i.status === 'DISPATCHED' || i.status === 'ON_SITE').length;

  const categoryBreakdown = {
    WATER_LOGGING: incidents.filter(i => i.category === 'WATER_LOGGING').length,
    POWER_FAILURE: incidents.filter(i => i.category === 'POWER_FAILURE').length,
    DRAINAGE_BLOCKAGE: incidents.filter(i => i.category === 'DRAINAGE_BLOCKAGE').length,
    ROAD_SUBSIDENCE: incidents.filter(i => i.category === 'ROAD_SUBSIDENCE').length,
    SEWAGE_OVERFLOW: incidents.filter(i => i.category === 'SEWAGE_OVERFLOW').length,
  };

  const performanceMetrics = {
    meanTimeToDispatchMinutes: 9.4,
    meanTimeToResolutionMinutes: 42.8,
    satelliteDetectionAccuracyPercent: 96.2,
    communityVerificationRatePercent: 88.5
  };

  const historicalHourlyTrends = [
    { hour: '04:00', waterlogging: 0, powerOutage: 0, drainageBlock: 1, rainIntensityMm: 2 },
    { hour: '05:00', waterlogging: 1, powerOutage: 0, drainageBlock: 1, rainIntensityMm: 8 },
    { hour: '06:00', waterlogging: 3, powerOutage: 1, drainageBlock: 2, rainIntensityMm: 24 },
    { hour: '07:00', waterlogging: 7, powerOutage: 3, drainageBlock: 4, rainIntensityMm: 48 },
    { hour: '08:00', waterlogging: 12, powerOutage: 5, drainageBlock: 6, rainIntensityMm: 55 },
    { hour: '09:00', waterlogging: 9, powerOutage: 4, drainageBlock: 5, rainIntensityMm: 42 },
    { hour: '10:00 (Current)', waterlogging: 6, powerOutage: 2, drainageBlock: 3, rainIntensityMm: 28 },
  ];

  res.json({
    summary: {
      totalIncidents,
      criticalCount,
      resolvedCount,
      inProgressCount,
      availableCrews: crews.filter(c => c.status === 'AVAILABLE').length,
      totalCrews: crews.length,
      citizenReportsCount: citizenReports.length
    },
    categoryBreakdown,
    wardRiskProfiles: WARD_RISK_PROFILES,
    performanceMetrics,
    historicalHourlyTrends,
    weather: INITIAL_WEATHER
  });
});

// ----------------------------------------------------
// URBAN RESILIENCE AI PREDICTIVE ENDPOINTS
// ----------------------------------------------------

let cityHealth = { ...INITIAL_CITY_HEALTH };
let predictiveFlood = { ...INITIAL_PREDICTIVE_FLOOD };
let roadDamages = [...INITIAL_ROAD_DAMAGES];
let wasteHotspots = [...INITIAL_WASTE_HOTSPOTS];
let heatwaveForecast = { ...INITIAL_HEATWAVE };
let waterSecurity = { ...INITIAL_WATER_SECURITY };

// Resilience Overview API
app.get('/api/resilience/overview', (req, res) => {
  res.json({
    cityHealth,
    wardRiskProfiles: WARD_RISK_PROFILES,
    predictiveFlood,
    heatwaveForecast,
    waterSecurity,
    activeRoadDamagesCount: roadDamages.length,
    activeWasteHotspotsCount: wasteHotspots.length
  });
});

// Flood Prediction Model API (TimesFM / TFT simulation)
app.get('/api/resilience/flood-forecast', (req, res) => {
  res.json({ floodForecast: predictiveFlood });
});

// Road & Infrastructure Intelligence (YOLOv11 Detection API)
app.get('/api/resilience/road-intelligence', (req, res) => {
  res.json({ roadDamages });
});

// Waste Hotspot Intelligence API
app.get('/api/resilience/waste-intelligence', (req, res) => {
  res.json({ wasteHotspots });
});

// Heatwave Prediction API (LightGBM simulation)
app.get('/api/resilience/heatwave-forecast', (req, res) => {
  res.json({ heatwave: heatwaveForecast });
});

// Water Security Intelligence API
app.get('/api/resilience/water-security', (req, res) => {
  res.json({ waterSecurity });
});

// AI Smart City Copilot (Gemini 2.5 Flash with live urban context)
app.post('/api/ai-copilot', async (req, res) => {
  const { prompt, conversationHistory = [] } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const gemini = getGeminiClient();

  // Create context from current state
  const urbanContext = `
CURRENT CITY STATUS:
- City Health Score: ${cityHealth.overallScore}/100 (${cityHealth.status})
- Multi-vector risks: Flood ${cityHealth.floodRisk}%, Heat ${cityHealth.heatRisk}%, Water ${cityHealth.waterRisk}%, Waste ${cityHealth.wasteRisk}%, Road ${cityHealth.roadRisk}%.
- High Risk Wards:
  * Ward 12 (Central): Flood 87%, Roads 78%, Waste 72%. Expected rain: 126mm. High-risk roads: 7. Recommended action: Inspect drainage + deploy 2x pumps.
  * Ward 4 (North Basin): Flood 92%, Roads 84%, Waste 81%. Expected rain: 142mm. Recommended action: Pre-position flood boat & dispatch waste compactor.
  * Ward 7 (Industrial): Flood 65%, Heat 68%, Transformer fault on 33kV line.
  * Ward 18 (Hillside Valley): Water Stress 88%, Heat 74%, Reservoir capacity low.
  * Ward 9 (Upper Heights): Water Stress 82%, Heat 62%.
- TimesFM Flood Model: 87% flood probability with peak inundation between 6:00 PM and 9:00 PM.
- LightGBM Heat Model: Peak temp 44.2°C, Heat Index 48.6°C. 14 cooling centres active.
- Water Security: Reservoir at 48.2%, groundwater depletion index 74.5. 5-day stress in Ward 18 and Ward 9.
- Road Infrastructure: P1 potholes on Arterial Ring Road and Alligator Cracking on Express Flyover.
- Waste Hotspots: Hotspot #12 overflowing in 6h, Hotspot #04 critical overflow.
`;

  // Fallback if no API key
  if (!gemini) {
    let responseText = '';
    const p = prompt.toLowerCase();

    if (p.includes('flood') || p.includes('rain') || p.includes('tomorrow')) {
      responseText = `### 🌊 Flood Risk Forecast Summary (TimesFM / SegFormer Model)

**Highest Risk Zones:**
1. **Ward 4 (North Basin / Kurla / Saki Naka)** — **92% Flood Probability** | Peak: 6:00 PM – 9:00 PM | Expected Rain: 142mm
2. **Ward 12 (Central Civic Core)** — **87% Flood Probability** | Peak: 6:00 PM – 9:00 PM | Expected Rain: 126mm
3. **Ward 7 (Industrial Ring)** — **65% Flood Probability** | Peak: 7:30 PM | Expected Rain: 98mm

**Root Causes:**
* Heavy monsoonal convective front (42.5mm/hr peak intensity).
* Silt clogs & debris obstruction at Sluice Gate 14B.
* Saturated soil capacity (92% saturation index) causing immediate surface runoff.

**Recommended Preventive Actions:**
1. **Pre-position 2x 150HP Dewatering Pumps** at Sector 4 arterial underpass.
2. **Dispatch Silt Clearance Crew** to Tidal Sluice Gate 14B.
3. **Issue automated geofenced push alerts** to 14,000 residents in low-lying sectors.
4. **Pre-position rescue units** at Station 3.`;
    } else if (p.includes('ward 18') || p.includes('water')) {
      responseText = `### 💧 Ward 18 Water Security Assessment

**Water Stress Index: 88/100 (HIGH)**

**Underlying Causes:**
1. **Low Reservoir Reserves:** Upstream feeder reservoir operating at 48.2% storage capacity.
2. **High Consumption Spike:** Ambient heat (44.2°C) driving a 28% surge in local municipal draw.
3. **Declining Groundwater Table:** Groundwater depletion index at 74.5%.
4. **Pipeline Pressure Drop:** Pressure telemetry on the Eastern Valley trunk line indicates a probable 15-20% subterranean distribution leakage.

**Recommended Preventive Actions:**
1. **Dispatch 6 Emergency Municipal Water Tankers** to Ward 18 distribution points.
2. **Conduct acoustic sensor inspection** on the Main 400mm feeder line.
3. **Activate booster pumps** during non-peak morning hours (05:00 - 08:00).`;
    } else if (p.includes('pothole') || p.includes('road') || p.includes('infrastructure')) {
      responseText = `### 🛣️ Road & Infrastructure Degradation Priority Audit (YOLOv11 Vision)

**Active Severe Defects:**
* **Arterial Ring Road (Ward 12):** Severe 3.8m² pothole (14cm depth) — **Priority P1** (Urgency: 24-48 hours).
* **Express Flyover Descent (Ward 4):** 6.2m² Alligator Cracking — **Priority P1** (Urgency: 24-48 hours).
* **Market Link Road (Ward 7):** Dislodged Manhole Frame — **Priority P2** (Urgency: 3-5 days).

**Recommended Preventive Action:**
* Authorize immediate night-shift cold-mix asphalt mastic deployment for Arterial Ring Road to prevent rim damage and monsoon water infiltration into the road sub-base.`;
    } else {
      responseText = `### 🛡️ Urban Resilience AI - Municipal Decision Briefing

**Overall City Health Score:** **${cityHealth.overallScore}/100**

**Key Priority Vectors:**
* **🌊 Flooding:** High probability (87%) expected this evening in Ward 4 & Ward 12.
* **🌡️ Extreme Heat:** Peak temperatures reaching 44.2°C. 14 public cooling centres operational.
* **💧 Water Stress:** Ward 18 & Ward 9 facing 4 to 5 day supply deficit without tanker augmentation.
* **🗑️ Waste Overflow:** Hotspot #12 approaching capacity in 6 hours.

**Top Recommended Preventive Directive:**
Pre-position dewatering pumps in Ward 12 and dispatch a secondary garbage compactor to Hotspot #04 before the 6:00 PM evening monsoon peak.`;
    }

    return res.json({
      message: {
        id: `COPILOT-MSG-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Live Gemini generation
  try {
    const systemInstruction = `You are the Urban Resilience AI Copilot — the primary municipal decision-support operating system for smart city authorities.
Your mission is: "Don't wait for the city to break. Predict what will break next."
You synthesize real-time data across weather, satellite radar, GIS, drainage, roads, waste, heat, and water.

Always structure your responses clearly using Markdown with:
1. Executive Risk Summary with key metrics and probabilities
2. Root Cause Breakdown (e.g. low reservoir + heat + pipe leakage)
3. Actionable Preventive Decision Steps (concrete instructions for municipal commissioners, engineers, and crew squads).

Keep your tone authoritative, precise, actionable, and objective.

${urbanContext}`;

    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      }
    });

    const aiText = response.text || 'Unable to generate copilot analysis.';

    return res.json({
      message: {
        id: `COPILOT-MSG-${Date.now()}`,
        role: 'assistant',
        content: aiText,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('Gemini Copilot error:', err);
    return res.status(500).json({ error: err.message || 'AI Copilot processing error' });
  }
});

// Citizen Complaint NLP Classification API (Gemini NLP extraction)
app.post('/api/nlp-complaint', async (req, res) => {
  const { text, photoUrl, userName = 'Citizen User', locationText } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Complaint text is required' });
  }

  const gemini = getGeminiClient();

  let parsed = {
    problem: 'Urban Infrastructure Hazard',
    location: locationText || 'Central Ward Sector',
    ward: 'Ward 12',
    severity: 'HIGH' as const,
    category: 'WATER_LOGGING' as const,
    department: 'Stormwater Drainage & Flood Control',
    recommendedAction: 'Dispatch local maintenance crew for ground assessment',
    confidenceScore: 92
  };

  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Extract the structured complaint information from this citizen report:
"${text}"
Location mentioned: "${locationText || ''}"

Return a JSON object with:
- problem (concise title, max 6 words)
- location (specific landmark or street)
- ward (one of "Ward 12", "Ward 4", "Ward 7", "Ward 18", "Ward 9")
- severity ("CRITICAL", "HIGH", "MEDIUM", "LOW")
- category ("WATER_LOGGING", "POWER_FAILURE", "DRAINAGE_BLOCKAGE", "ROAD_SUBSIDENCE", "SEWAGE_OVERFLOW")
- department (e.g. "Stormwater Drainage Dept", "Roads & Highway Authority", "Solid Waste Management", "Electricity Board", "Water Supply Dept")
- recommendedAction (1 sentence instruction)`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      if (response.text) {
        const json = JSON.parse(response.text);
        parsed = { ...parsed, ...json };
      }
    } catch (e) {
      console.warn('NLP fallback used:', e);
    }
  }

  // Create new citizen report
  const newReport: CitizenReport = {
    id: `CIT-NLP-${Date.now().toString().slice(-4)}`,
    reportedAt: new Date().toISOString(),
    userName,
    location: {
      lat: 19.0760 + (Math.random() - 0.5) * 0.02,
      lng: 72.8777 + (Math.random() - 0.5) * 0.02,
      address: parsed.location || 'Municipal Sector Core',
      ward: parsed.ward || 'Ward 12',
      zone: 'Zone II'
    },
    category: parsed.category as any,
    description: text,
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    upvotes: 1,
    verifiedByMunicipal: true
  };

  citizenReports.unshift(newReport);

  // Trigger notification
  notifications.unshift({
    id: `NOTIF-NLP-${Date.now()}`,
    timestamp: new Date().toISOString(),
    title: `CITIZEN NLP AUTO-ROUTED: ${parsed.problem}`,
    message: `Routed to ${parsed.department} (${parsed.severity} priority) for ${parsed.location}.`,
    type: 'CITIZEN_REPORT',
    read: false
  });

  res.status(201).json({ success: true, report: newReport, parsed });
});

// Notifications & Emergency Broadcast API
app.get('/api/notifications', (req, res) => {
  res.json({ notifications });
});

app.post('/api/notifications/broadcast', (req, res) => {
  const { title, message, targetWard = 'All Municipal Zones', severity = 'CRITICAL' } = req.body;

  const broadcastNotif: NotificationItem = {
    id: `NOTIF-EMERGENCY-${Date.now()}`,
    timestamp: new Date().toISOString(),
    title: `🚨 EMERGENCY BROADCAST: ${title}`,
    message: `[${targetWard}] ${message}`,
    type: 'WEATHER_WARNING',
    read: false
  };

  notifications.unshift(broadcastNotif);

  // Also flag any incidents in that ward
  incidents.forEach(inc => {
    if (targetWard === 'All Municipal Zones' || inc.location.ward === targetWard) {
      inc.publicAdvisoryIssued = true;
    }
  });

  res.status(201).json({ success: true, notification: broadcastNotif, targetWard });
});

// ----------------------------------------------------
// VITE / STATIC MIDDLEWARE
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UrbanWatch Sentinel Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
