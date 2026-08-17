/**
 * UrbanWatch Sentinel - Urban Digital State & Risk Engine
 * 
 * Central representation of current city and ward digital states.
 * Keeps dashboard, risk models, and Gemini Copilot synchronized with single source of truth.
 */

import { UrbanDigitalState, WardDigitalState } from './types.ts';
import { WARD_RISK_PROFILES } from '../data/mockData.ts';

// In-Memory Urban Digital State
const INITIAL_WARDS: Record<string, WardDigitalState> = {};

WARD_RISK_PROFILES.forEach(w => {
  INITIAL_WARDS[w.wardId] = {
    wardId: w.wardId,
    wardName: w.wardName,
    zone: w.zone,
    population: w.population,
    overallRisk: w.currentRiskScore,
    riskLevel: w.currentRiskScore >= 80 ? 'CRITICAL' : w.currentRiskScore >= 60 ? 'HIGH' : 'MODERATE',
    floodRisk: w.floodRiskScore,
    heatRisk: w.heatRiskScore,
    waterRisk: w.waterRiskScore,
    wasteRisk: w.wasteRiskScore,
    roadRisk: w.roadRiskScore,
    trafficRisk: Math.min(100, Math.round(w.floodRiskScore * 0.5 + w.roadRiskScore * 0.5)),
    activeWaterloggedAreaM2: w.activeWaterloggingCount * 2200,
    activeComplaintsCount: w.vulnerableAreasCount * 3 + 2,
    activeAlerts: [
      w.floodRiskScore > 75 ? 'FLOOD_WATCH_ACTIVE' : '',
      w.heatRiskScore > 70 ? 'EXTREME_HEAT_ADVISORY' : '',
      w.transformerHealthScore < 70 ? 'TRANSFORMER_STRAIN' : ''
    ].filter(Boolean),
    highRiskRoadCount: w.highRiskRoadsCount,
    recommendedAction: w.recommendedAction,
    updatedAt: new Date().toISOString()
  };
});

export let currentUrbanDigitalState: UrbanDigitalState = {
  cityHealthScore: 78,
  cityStatus: 'Elevated Multi-Vector Risk',
  totalActiveIncidents: 4,
  totalActiveCrews: 4,
  wards: INITIAL_WARDS,
  multiHazardRiskSummary: {
    highestRiskWard: 'Ward 4 (North Basin)',
    criticalHazardsCount: 3,
    topRiskVector: 'Monsoon Inundation & Sluice Gate Surcharge'
  },
  lastUpdated: new Date().toISOString()
};

/**
 * Update a specific ward's digital state
 */
export function updateWardDigitalState(wardId: string, updates: Partial<WardDigitalState>): WardDigitalState {
  const existing = currentUrbanDigitalState.wards[wardId] || {
    wardId,
    wardName: wardId,
    zone: 'Zone II',
    population: 350000,
    overallRisk: 50,
    riskLevel: 'MODERATE',
    floodRisk: 50,
    heatRisk: 50,
    waterRisk: 50,
    wasteRisk: 50,
    roadRisk: 50,
    trafficRisk: 50,
    activeWaterloggedAreaM2: 0,
    activeComplaintsCount: 0,
    activeAlerts: [],
    highRiskRoadCount: 2,
    recommendedAction: 'Standard monitoring',
    updatedAt: new Date().toISOString()
  };

  const updated: WardDigitalState = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  currentUrbanDigitalState.wards[wardId] = updated;
  currentUrbanDigitalState.lastUpdated = new Date().toISOString();

  // Recompute city health score
  const wardScores = Object.values(currentUrbanDigitalState.wards).map(w => w.overallRisk);
  const avgRisk = wardScores.reduce((a, b) => a + b, 0) / wardScores.length;
  currentUrbanDigitalState.cityHealthScore = Math.max(0, Math.round(100 - avgRisk * 0.4));

  return updated;
}

/**
 * Get current Urban Digital State
 */
export function getUrbanDigitalState(): UrbanDigitalState {
  return currentUrbanDigitalState;
}
