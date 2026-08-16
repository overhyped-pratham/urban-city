import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Globe, 
  MapPin, 
  Navigation, 
  Compass, 
  Sparkles, 
  Wind, 
  Sun, 
  Thermometer, 
  Search, 
  Layers, 
  RotateCw, 
  Play, 
  Pause, 
  ShieldAlert, 
  Plane, 
  Zap, 
  Maximize2,
  Clock,
  Sliders,
  Filter,
  Flag,
  ChevronRight,
  Globe2
} from 'lucide-react';

export interface GlobalDestination {
  id: string;
  name: string;
  country: string;
  flag: string;
  continent: 'Asia' | 'Europe' | 'Americas' | 'Africa' | 'Oceania' | 'Polar';
  lat: number;
  lng: number;
  category: 'Capital' | 'Financial' | 'Megacity' | 'Hazard Zone' | 'Research Station';
  tempC: number;
  condition: string;
  aqi: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  population: string;
  utcOffset: number;
}

export const PRESET_DESTINATIONS: GlobalDestination[] = [
  // ASIA
  {
    id: 'indore',
    name: 'Indore',
    country: 'India',
    flag: '🇮🇳',
    continent: 'Asia',
    lat: 22.7196,
    lng: 75.8577,
    category: 'Megacity',
    tempC: 28,
    condition: 'Partly Cloudy',
    aqi: 48,
    riskLevel: 'LOW',
    description: 'Cleanest city grid in India with smart water distribution and real-time flood monitoring.',
    population: '3.2 M',
    utcOffset: 5.5
  },
  {
    id: 'newdelhi',
    name: 'New Delhi',
    country: 'India',
    flag: '🇮🇳',
    continent: 'Asia',
    lat: 28.6139,
    lng: 77.2090,
    category: 'Capital',
    tempC: 32,
    condition: 'Hazy Sun',
    aqi: 155,
    riskLevel: 'HIGH',
    description: 'Capital region with integrated Yamuna river basin telemetry & air quality grid.',
    population: '32.9 M',
    utcOffset: 5.5
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    continent: 'Asia',
    lat: 35.6762,
    lng: 139.6503,
    category: 'Megacity',
    tempC: 22,
    condition: 'Clear Sky',
    aqi: 32,
    riskLevel: 'MEDIUM',
    description: 'High-density coastal metropolis with active seismic & typhoon monitoring networks.',
    population: '37.4 M',
    utcOffset: 9
  },
  {
    id: 'beijing',
    name: 'Beijing',
    country: 'China',
    flag: '🇨🇳',
    continent: 'Asia',
    lat: 39.9042,
    lng: 116.4074,
    category: 'Capital',
    tempC: 24,
    condition: 'Partly Cloudy',
    aqi: 65,
    riskLevel: 'MEDIUM',
    description: 'Northern China plain mega-city with artificial intelligence storm drain network.',
    population: '21.5 M',
    utcOffset: 8
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    continent: 'Asia',
    lat: 1.3521,
    lng: 103.8198,
    category: 'Megacity',
    tempC: 31,
    condition: 'Tropical Shower',
    aqi: 38,
    riskLevel: 'HIGH',
    description: 'Smart urban drainage canals and automated sea wall tidal barriers.',
    population: '5.9 M',
    utcOffset: 8
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    flag: '🇮🇳',
    continent: 'Asia',
    lat: 19.0760,
    lng: 72.8777,
    category: 'Megacity',
    tempC: 29,
    condition: 'Monsoon Heavy Shower',
    aqi: 112,
    riskLevel: 'CRITICAL',
    description: 'Coastal urban flooding vulnerability; real-time pumping stations & sluice control.',
    population: '21.3 M',
    utcOffset: 5.5
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    continent: 'Asia',
    lat: 25.2048,
    lng: 55.2708,
    category: 'Financial',
    tempC: 41,
    condition: 'Haze & Heatwave',
    aqi: 125,
    riskLevel: 'HIGH',
    description: 'Smart storm drainage, desalination plant security, and cloud seeding tracking.',
    population: '3.6 M',
    utcOffset: 4
  },
  {
    id: 'seoul',
    name: 'Seoul',
    country: 'South Korea',
    flag: '🇰🇷',
    continent: 'Asia',
    lat: 37.5665,
    lng: 126.9780,
    category: 'Capital',
    tempC: 23,
    condition: 'Clear',
    aqi: 42,
    riskLevel: 'LOW',
    description: 'Han River flood containment control center and high-tech urban sensor mesh.',
    population: '9.7 M',
    utcOffset: 9
  },
  {
    id: 'jakarta',
    name: 'Jakarta',
    country: 'Indonesia',
    flag: '🇮🇩',
    continent: 'Asia',
    lat: -6.2088,
    lng: 106.8456,
    category: 'Hazard Zone',
    tempC: 30,
    condition: 'Heavy Humidity',
    aqi: 130,
    riskLevel: 'CRITICAL',
    description: 'Giant sea wall protection and coastal subsidence radar monitoring.',
    population: '10.5 M',
    utcOffset: 7
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    country: 'Thailand',
    flag: '🇹🇭',
    continent: 'Asia',
    lat: 13.7563,
    lng: 100.5018,
    category: 'Capital',
    tempC: 33,
    condition: 'Humid Rain',
    aqi: 88,
    riskLevel: 'HIGH',
    description: 'Chao Phraya delta flood barrier system and retention basin automation.',
    population: '10.7 M',
    utcOffset: 7
  },

  // EUROPE
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    continent: 'Europe',
    lat: 51.5074,
    lng: -0.1278,
    category: 'Financial',
    tempC: 16,
    condition: 'Light Rain',
    aqi: 28,
    riskLevel: 'LOW',
    description: 'Thames Barrier flood defense system operating with automated surge sluices.',
    population: '9.0 M',
    utcOffset: 1
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    continent: 'Europe',
    lat: 48.8566,
    lng: 2.3522,
    category: 'Capital',
    tempC: 19,
    condition: 'Overcast',
    aqi: 35,
    riskLevel: 'LOW',
    description: 'Seine River basin flood forecasting & urban heat island mitigation canopy.',
    population: '2.1 M',
    utcOffset: 2
  },
  {
    id: 'berlin',
    name: 'Berlin',
    country: 'Germany',
    flag: '🇩🇪',
    continent: 'Europe',
    lat: 52.5200,
    lng: 13.4050,
    category: 'Capital',
    tempC: 20,
    condition: 'Partly Cloudy',
    aqi: 25,
    riskLevel: 'LOW',
    description: 'Spree river water quality telemetry and sponge-city rainwater absorption grid.',
    population: '3.7 M',
    utcOffset: 2
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    flag: '🇮🇹',
    continent: 'Europe',
    lat: 41.9028,
    lng: 12.4964,
    category: 'Capital',
    tempC: 27,
    condition: 'Sunny',
    aqi: 40,
    riskLevel: 'MEDIUM',
    description: 'Tiber basin flood gates & historic infrastructure heat wave cooling nodes.',
    population: '2.8 M',
    utcOffset: 2
  },
  {
    id: 'madrid',
    name: 'Madrid',
    country: 'Spain',
    flag: '🇪🇸',
    continent: 'Europe',
    lat: 40.4168,
    lng: -3.7038,
    category: 'Capital',
    tempC: 31,
    condition: 'Sunny Dry',
    aqi: 45,
    riskLevel: 'MEDIUM',
    description: 'Iberian drought early warning grid and smart aquifer management.',
    population: '3.3 M',
    utcOffset: 2
  },
  {
    id: 'reykjavik',
    name: 'Reykjavik',
    country: 'Iceland',
    flag: '🇮🇸',
    continent: 'Europe',
    lat: 64.1466,
    lng: -21.9426,
    category: 'Research Station',
    tempC: 6,
    condition: 'Windy Cold',
    aqi: 8,
    riskLevel: 'LOW',
    description: 'Geothermal energy monitoring, volcanic ash radar, and glacier ice dynamics.',
    population: '0.13 M',
    utcOffset: 0
  },
  {
    id: 'moscow',
    name: 'Moscow',
    country: 'Russia',
    flag: '🇷🇺',
    continent: 'Europe',
    lat: 55.7558,
    lng: 37.6173,
    category: 'Capital',
    tempC: 18,
    condition: 'Scattered Clouds',
    aqi: 30,
    riskLevel: 'LOW',
    description: 'Moskva River hydraulic control locks and northern climate telemetry.',
    population: '13.0 M',
    utcOffset: 3
  },
  {
    id: 'kyiv',
    name: 'Kyiv',
    country: 'Ukraine',
    flag: '🇺🇦',
    continent: 'Europe',
    lat: 50.4501,
    lng: 30.5234,
    category: 'Capital',
    tempC: 21,
    condition: 'Clear',
    aqi: 38,
    riskLevel: 'MEDIUM',
    description: 'Dnipro river dam telemetry and resilient municipal power backup grid.',
    population: '2.9 M',
    utcOffset: 3
  },

  // AMERICAS
  {
    id: 'newyork',
    name: 'New York',
    country: 'United States',
    flag: '🇺🇸',
    continent: 'Americas',
    lat: 40.7128,
    lng: -74.0060,
    category: 'Financial',
    tempC: 25,
    condition: 'Sunny',
    aqi: 45,
    riskLevel: 'MEDIUM',
    description: 'Coastal storm surge protection grids along East River and Hudson corridors.',
    population: '8.8 M',
    utcOffset: -4
  },
  {
    id: 'washington',
    name: 'Washington D.C.',
    country: 'United States',
    flag: '🇺🇸',
    continent: 'Americas',
    lat: 38.9072,
    lng: -77.0369,
    category: 'Capital',
    tempC: 26,
    condition: 'Clear',
    aqi: 35,
    riskLevel: 'LOW',
    description: 'Potomac watershed flood gauges and federal emergency command center.',
    population: '0.7 M',
    utcOffset: -4
  },
  {
    id: 'mexicocity',
    name: 'Mexico City',
    country: 'Mexico',
    flag: '🇲🇽',
    continent: 'Americas',
    lat: 19.4326,
    lng: -99.1332,
    category: 'Capital',
    tempC: 22,
    condition: 'Thunderstorm',
    aqi: 95,
    riskLevel: 'HIGH',
    description: 'Valley aquifer extraction radar and seismic early detection array.',
    population: '22.0 M',
    utcOffset: -6
  },
  {
    id: 'rio',
    name: 'Rio de Janeiro',
    country: 'Brazil',
    flag: '🇧🇷',
    continent: 'Americas',
    lat: -22.9068,
    lng: -43.1729,
    category: 'Hazard Zone',
    tempC: 28,
    condition: 'Tropical Rain',
    aqi: 42,
    riskLevel: 'HIGH',
    description: 'Favela hillside landslide radar sensors and torrential downpour warnings.',
    population: '6.7 M',
    utcOffset: -3
  },
  {
    id: 'buenosaires',
    name: 'Buenos Aires',
    country: 'Argentina',
    flag: '🇦🇷',
    continent: 'Americas',
    lat: -34.6037,
    lng: -58.3816,
    category: 'Capital',
    tempC: 17,
    condition: 'Breezy',
    aqi: 28,
    riskLevel: 'LOW',
    description: 'Rio de la Plata storm surge pumps and estuarine environmental telemetry.',
    population: '15.3 M',
    utcOffset: -3
  },
  {
    id: 'toronto',
    name: 'Toronto',
    country: 'Canada',
    flag: '🇨🇦',
    continent: 'Americas',
    lat: 43.6532,
    lng: -79.3832,
    category: 'Financial',
    tempC: 21,
    condition: 'Clear',
    aqi: 22,
    riskLevel: 'LOW',
    description: 'Lake Ontario shoreline flood wall barriers and ravine erosion tracking.',
    population: '2.9 M',
    utcOffset: -4
  },
  {
    id: 'honolulu',
    name: 'Honolulu',
    country: 'United States',
    flag: '🇺🇸',
    continent: 'Americas',
    lat: 21.3069,
    lng: -157.8583,
    category: 'Hazard Zone',
    tempC: 27,
    condition: 'Trade Winds',
    aqi: 15,
    riskLevel: 'LOW',
    description: 'Pacific Tsunami Warning Center node & coral reef erosion sensor array.',
    population: '0.35 M',
    utcOffset: -10
  },

  // AFRICA
  {
    id: 'cairo',
    name: 'Cairo',
    country: 'Egypt',
    flag: '🇪🇬',
    continent: 'Africa',
    lat: 30.0444,
    lng: 31.2357,
    category: 'Capital',
    tempC: 36,
    condition: 'Extreme Heat',
    aqi: 140,
    riskLevel: 'HIGH',
    description: 'Nile Delta agricultural & water security monitoring grid under desert heatwave.',
    population: '10.1 M',
    utcOffset: 3
  },
  {
    id: 'capetown',
    name: 'Cape Town',
    country: 'South Africa',
    flag: '🇿🇦',
    continent: 'Africa',
    lat: -33.9249,
    lng: 18.4241,
    category: 'Capital',
    tempC: 18,
    condition: 'Windy Coast',
    aqi: 18,
    riskLevel: 'MEDIUM',
    description: 'Table Mountain catchment reservoir management and ocean swell radar.',
    population: '4.6 M',
    utcOffset: 2
  },
  {
    id: 'lagos',
    name: 'Lagos',
    country: 'Nigeria',
    flag: '🇳🇬',
    continent: 'Africa',
    lat: 6.5244,
    lng: 3.3792,
    category: 'Megacity',
    tempC: 31,
    condition: 'Tropical Humid',
    aqi: 105,
    riskLevel: 'CRITICAL',
    description: 'Atlantic coastal erosion defense & lagoon water level sensors.',
    population: '15.4 M',
    utcOffset: 1
  },
  {
    id: 'nairobi',
    name: 'Nairobi',
    country: 'Kenya',
    flag: '🇰🇪',
    continent: 'Africa',
    lat: -1.2921,
    lng: 36.8219,
    category: 'Capital',
    tempC: 23,
    condition: 'Partly Cloudy',
    aqi: 45,
    riskLevel: 'LOW',
    description: 'Rift valley early warning seismic sensors and urban green canopy tracking.',
    population: '4.4 M',
    utcOffset: 3
  },

  // OCEANIA
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    flag: '🇦🇺',
    continent: 'Oceania',
    lat: -33.8688,
    lng: 151.2093,
    category: 'Capital',
    tempC: 21,
    condition: 'Sunny',
    aqi: 20,
    riskLevel: 'LOW',
    description: 'Harbor water telemetry and bushfire early detection satellite perimeter.',
    population: '5.3 M',
    utcOffset: 10
  },
  {
    id: 'wellington',
    name: 'Wellington',
    country: 'New Zealand',
    flag: '🇳🇿',
    continent: 'Oceania',
    lat: -41.2865,
    lng: 174.7762,
    category: 'Capital',
    tempC: 14,
    condition: 'Strong Gale',
    aqi: 10,
    riskLevel: 'LOW',
    description: 'Cook Strait seismic faultline sonar and harbor wave height sensors.',
    population: '0.4 M',
    utcOffset: 12
  }
];

// Helper: Convert Lat/Lng to 3D Sphere Position
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Helper: Convert 3D Vector back to Lat/Lng
export function vector3ToLatLng(vector: THREE.Vector3): { lat: number; lng: number } {
  const normalized = vector.clone().normalize();
  const lat = Math.asin(normalized.y) * (180 / Math.PI);
  let lng = Math.atan2(normalized.z, -normalized.x) * (180 / Math.PI) - 180;
  if (lng < -180) lng += 360;
  if (lng > 180) lng -= 360;
  return { lat, lng };
}

// Calculate real-time Subsolar Point Vector based on actual UTC time
export function calculateSunDirection(date: Date = new Date()): THREE.Vector3 {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const sunLng = 180 - (utcHours / 24) * 360;

  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const sunLat = 23.44 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));

  return latLngToVector3(sunLat, sunLng, 1).normalize();
}

// Procedural Day Texture Canvas with Realistic Continent & Country Boundaries
function createDayTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep Azure Ocean Base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#020617');
  oceanGrad.addColorStop(0.15, '#082f49');
  oceanGrad.addColorStop(0.5, '#0284c7'); // Vibrant ocean
  oceanGrad.addColorStop(0.85, '#082f49');
  oceanGrad.addColorStop(1, '#020617');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lat/Lng Grid Lines (30 deg steps)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let lng = -180; lng <= 180; lng += 30) {
    const x = ((lng + 180) / 360) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Highlight Equator & Prime Meridian
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  // Continent Landmasses (Detailed real geometries)
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;

  const drawPoly = (coords: Array<[number, number]>, fill = '#1e293b', stroke = '#38bdf8', lw = 1.5) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.beginPath();
    coords.forEach(([lng, lat], i) => {
      const x = ((lng + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // North America
  drawPoly([[-168,66], [-150,70], [-130,72], [-105,74], [-80,72], [-60,60], [-55,48], [-65,44], [-75,35], [-80,25], [-90,16], [-105,20], [-118,32], [-125,48], [-140,58], [-168,66]]);
  // Greenland
  drawPoly([[-72,78], [-40,83], [-20,75], [-40,60], [-55,65], [-72,78]], '#334155', '#94a3b8');
  // South America
  drawPoly([[-80,10], [-60,12], [-35,-5], [-38,-15], [-48,-28], [-65,-50], [-75,-55], [-78,-40], [-80,-5], [-80,10]]);
  // Europe
  drawPoly([[-10,36], [0,44], [10,50], [25,58], [32,70], [60,68], [40,50], [30,42], [22,38], [15,38], [0,42], [-10,36]]);
  // British Isles
  drawPoly([[-10,50], [-2,58], [2,52], [-5,50], [-10,50]], '#1e293b', '#38bdf8');
  // Scandinavia
  drawPoly([[5,58], [18,60], [28,70], [20,71], [10,62], [5,58]]);
  // Africa
  drawPoly([[-17,35], [10,37], [32,32], [42,12], [51,11], [42,-15], [33,-34], [18,-34], [12,-10], [-15,10], [-17,35]]);
  // Madagascar
  drawPoly([[43,-12], [50,-15], [47,-25], [43,-22], [43,-12]]);
  // Asia
  drawPoly([[30,42], [40,50], [60,68], [100,75], [140,72], [170,66], [140,40], [120,30], [105,10], [95,15], [78,8], [68,24], [55,25], [45,12], [35,32], [30,42]]);
  // India Peninsula
  drawPoly([[68,24], [88,22], [80,8], [72,18], [68,24]], '#1e293b', '#6366f1', 2);
  // Southeast Asia & Japan
  drawPoly([[100,20], [108,10], [102,2], [104,-6], [115,4], [120,22], [100,20]]);
  drawPoly([[130,31], [140,36], [142,43], [136,36], [130,31]], '#1e293b', '#38bdf8');
  // Australia
  drawPoly([[114,-22], [130,-12], [145,-15], [153,-28], [140,-38], [115,-35], [114,-22]]);
  // New Zealand
  drawPoly([[166,-46], [178,-37], [174,-42], [166,-46]]);
  // Antarctica
  drawPoly([[-180,-75], [0,-70], [180,-75], [180,-90], [-180,-90]], '#f8fafc', '#cbd5e1', 2);

  // Draw Country Borders overlay lines
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.lineWidth = 1;
  // US/Canada Border
  ctx.beginPath();
  ctx.moveTo((( -125 + 180) / 360) * canvas.width, ((90 - 49) / 180) * canvas.height);
  ctx.lineTo((( -67 + 180) / 360) * canvas.width, ((90 - 49) / 180) * canvas.height);
  ctx.stroke();

  // Country Name Labels on Canvas
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  const drawLabel = (text: string, lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * canvas.width;
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.fillText(text, x, y);
  };

  drawLabel('INDIA', 20, 78);
  drawLabel('USA', 38, -100);
  drawLabel('CHINA', 35, 104);
  drawLabel('BRAZIL', -14, -50);
  drawLabel('AUSTRALIA', -25, 134);
  drawLabel('EGYPT', 26, 30);
  drawLabel('JAPAN', 36, 138);
  drawLabel('UK', 54, -2);
  drawLabel('RUSSIA', 60, 90);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Procedural Night Texture Canvas with Glowing City Lights
function createNightTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#02040a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0b1329';
  const drawPoly = (coords: Array<[number, number]>) => {
    ctx.beginPath();
    coords.forEach(([lng, lat], i) => {
      const x = ((lng + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  };

  drawPoly([[-168,66], [-150,70], [-130,72], [-105,74], [-80,72], [-60,60], [-55,48], [-65,44], [-75,35], [-80,25], [-90,16], [-105,20], [-118,32], [-125,48], [-140,58], [-168,66]]);
  drawPoly([[-80,10], [-60,12], [-35,-5], [-38,-15], [-48,-28], [-65,-50], [-75,-55], [-78,-40], [-80,-5], [-80,10]]);
  drawPoly([[-10,36], [0,44], [10,50], [25,58], [32,70], [60,68], [40,50], [30,42], [22,38], [15,38], [0,42], [-10,36]]);
  drawPoly([[-17,35], [10,37], [32,32], [42,12], [51,11], [42,-15], [33,-34], [18,-34], [12,-10], [-15,10], [-17,35]]);
  drawPoly([[30,42], [40,50], [60,68], [100,75], [140,72], [170,66], [140,40], [120,30], [105,10], [95,15], [78,8], [68,24], [55,25], [45,12], [35,32], [30,42]]);
  drawPoly([[68,24], [88,22], [80,8], [72,18], [68,24]]);
  drawPoly([[114,-22], [130,-12], [145,-15], [153,-28], [140,-38], [115,-35], [114,-22]]);

  // Golden City Lights on all preset locations
  PRESET_DESTINATIONS.forEach(city => {
    const x = ((city.lng + 180) / 360) * canvas.width;
    const y = ((90 - city.lat) / 180) * canvas.height;
    const grad = ctx.createRadialGradient(x, y, 1, x, y, 18);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#fef08a');
    grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.8)');
    grad.addColorStop(0.8, 'rgba(217, 119, 6, 0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Custom Shader for Earth Day/Night Terminator & City Lights
const EarthDayNightShader = {
  uniforms: {
    uDayTexture: { value: null as THREE.CanvasTexture | null },
    uNightTexture: { value: null as THREE.CanvasTexture | null },
    uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
    uNightLightsEnabled: { value: 1.0 },
    uTerminatorEnabled: { value: 1.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(mat3(modelMatrix) * normal);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uDayTexture;
    uniform sampler2D uNightTexture;
    uniform vec3 uSunDirection;
    uniform float uNightLightsEnabled;
    uniform float uTerminatorEnabled;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec4 dayColor = texture2D(uDayTexture, vUv);
      vec4 nightColor = texture2D(uNightTexture, vUv);

      vec3 normal = normalize(vNormal);
      vec3 sunDir = normalize(uSunDirection);

      float sunDot = dot(normal, sunDir);

      if (uTerminatorEnabled < 0.5) {
        gl_FragColor = dayColor;
        return;
      }

      float dayFactor = smoothstep(-0.15, 0.15, sunDot);

      vec4 finalColor;
      if (uNightLightsEnabled > 0.5) {
        vec4 nightWithGlow = nightColor * 1.6;
        finalColor = mix(nightWithGlow, dayColor, dayFactor);

        if (sunDot > -0.2 && sunDot < 0.2) {
          float twilightFactor = 1.0 - abs(sunDot) / 0.2;
          finalColor.rgb += vec3(0.9, 0.45, 0.12) * twilightFactor * 0.3;
        }
      } else {
        finalColor = dayColor * max(dayFactor, 0.15);
      }

      gl_FragColor = finalColor;
    }
  `
};

// Atmosphere Rim Halo Shader
const AtmosphereHaloShader = {
  uniforms: {
    uColor: { value: new THREE.Color(0x38bdf8) }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform vec3 uColor;

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float intensity = pow(0.65 - dot(vNormal, viewDir), 2.8);
      gl_FragColor = vec4(uColor, max(intensity, 0.0) * 0.85);
    }
  `
};

// Component: 3D Curved Bezier Data/Flight Arc
interface ArcLineProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color?: string;
}

function CurvedFlightArc({ start, end, color = '#38bdf8' }: ArcLineProps) {
  const points = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    mid.normalize().multiplyScalar(5 + Math.min(distance * 0.4, 3.5));

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(50);
  }, [start, end]);

  return (
    <Line 
      points={points} 
      color={color} 
      lineWidth={2} 
      transparent 
      opacity={0.8} 
    />
  );
}

// Component: R3F Inner Globe Scene
interface EarthSceneProps {
  selectedDest: GlobalDestination;
  onSelectDest: (dest: GlobalDestination) => void;
  onPointerClickGlobe: (lat: number, lng: number) => void;
  showAtmosphere: boolean;
  showMarkers: boolean;
  showTerminator: boolean;
  showNightLights: boolean;
  showArcs: boolean;
  isAutoRotating: boolean;
  rotationSpeed: number;
  filteredDestinations: GlobalDestination[];
}

function EarthScene({
  selectedDest,
  onSelectDest,
  onPointerClickGlobe,
  showAtmosphere,
  showMarkers,
  showTerminator,
  showNightLights,
  showArcs,
  isAutoRotating,
  rotationSpeed,
  filteredDestinations
}: EarthSceneProps) {
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const cloudMeshRef = useRef<THREE.Mesh>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);

  const dayTex = useMemo(() => createDayTexture(), []);
  const nightTex = useMemo(() => createNightTexture(), []);
  const sunDir = useMemo(() => calculateSunDirection(new Date()), []);

  useFrame((state, delta) => {
    if (isAutoRotating && earthMeshRef.current) {
      earthMeshRef.current.rotation.y += delta * rotationSpeed * 10;
      if (cloudMeshRef.current) {
        cloudMeshRef.current.rotation.y += delta * rotationSpeed * 12;
      }
    }

    if (shaderMatRef.current) {
      shaderMatRef.current.uniforms.uNightLightsEnabled.value = showNightLights ? 1.0 : 0.0;
      shaderMatRef.current.uniforms.uTerminatorEnabled.value = showTerminator ? 1.0 : 0.0;
    }
  });

  const handleGlobeClick = (e: any) => {
    e.stopPropagation();
    if (e.point && earthMeshRef.current) {
      const localPoint = earthMeshRef.current.worldToLocal(e.point.clone());
      const { lat, lng } = vector3ToLatLng(localPoint);
      onPointerClickGlobe(parseFloat(lat.toFixed(4)), parseFloat(lng.toFixed(4)));
    }
  };

  const targetPinPos = useMemo(() => latLngToVector3(selectedDest.lat, selectedDest.lng, 5.02), [selectedDest]);

  const arcPairs = useMemo(() => {
    const indore = PRESET_DESTINATIONS.find(d => d.id === 'indore')!;
    const tokyo = PRESET_DESTINATIONS.find(d => d.id === 'tokyo')!;
    const london = PRESET_DESTINATIONS.find(d => d.id === 'london')!;
    const ny = PRESET_DESTINATIONS.find(d => d.id === 'newyork')!;
    const dubai = PRESET_DESTINATIONS.find(d => d.id === 'dubai')!;
    const sydney = PRESET_DESTINATIONS.find(d => d.id === 'sydney')!;
    const cairo = PRESET_DESTINATIONS.find(d => d.id === 'cairo')!;

    return [
      { start: latLngToVector3(indore.lat, indore.lng, 5), end: latLngToVector3(tokyo.lat, tokyo.lng, 5), color: '#38bdf8' },
      { start: latLngToVector3(indore.lat, indore.lng, 5), end: latLngToVector3(london.lat, london.lng, 5), color: '#6366f1' },
      { start: latLngToVector3(ny.lat, ny.lng, 5), end: latLngToVector3(london.lat, london.lng, 5), color: '#38bdf8' },
      { start: latLngToVector3(london.lat, london.lng, 5), end: latLngToVector3(dubai.lat, dubai.lng, 5), color: '#f59e0b' },
      { start: latLngToVector3(tokyo.lat, tokyo.lng, 5), end: latLngToVector3(sydney.lat, sydney.lng, 5), color: '#10b981' },
      { start: latLngToVector3(cairo.lat, cairo.lng, 5), end: latLngToVector3(london.lat, london.lng, 5), color: '#f43f5e' }
    ];
  }, []);

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[20, 15, 20]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-20, -10, -20]} intensity={0.6} color="#38bdf8" />

      {/* Earth Sphere Mesh */}
      <mesh ref={earthMeshRef} onClick={handleGlobeClick}>
        <sphereGeometry args={[5, 64, 64]} />
        <shaderMaterial
          ref={shaderMatRef}
          vertexShader={EarthDayNightShader.vertexShader}
          fragmentShader={EarthDayNightShader.fragmentShader}
          uniforms={{
            uDayTexture: { value: dayTex },
            uNightTexture: { value: nightTex },
            uSunDirection: { value: sunDir },
            uNightLightsEnabled: { value: showNightLights ? 1.0 : 0.0 },
            uTerminatorEnabled: { value: showTerminator ? 1.0 : 0.0 }
          }}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh ref={cloudMeshRef}>
        <sphereGeometry args={[5.06, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Glowing Atmosphere Rim Shader */}
      {showAtmosphere && (
        <mesh>
          <sphereGeometry args={[5.18, 64, 64]} />
          <shaderMaterial
            vertexShader={AtmosphereHaloShader.vertexShader}
            fragmentShader={AtmosphereHaloShader.fragmentShader}
            uniforms={{ uColor: { value: new THREE.Color(0x38bdf8) } }}
            side={THREE.BackSide}
            transparent
          />
        </mesh>
      )}

      {/* Active Target Beacon Pin */}
      <mesh position={targetPinPos}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#f43f5e" />
      </mesh>

      {/* City Hub Markers Overlay */}
      {showMarkers && filteredDestinations.map((dest) => {
        const pos = latLngToVector3(dest.lat, dest.lng, 5.08);
        const isSelected = selectedDest.id === dest.id;

        return (
          <group key={dest.id} position={pos}>
            <Html center distanceFactor={14} zIndexRange={[100, 0]}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDest(dest);
                }}
                className={`group relative flex items-center justify-center p-1.5 rounded-full transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-rose-500 ring-4 ring-rose-500/40 scale-125 shadow-lg' 
                    : 'bg-indigo-600 hover:bg-cyan-500 hover:scale-110 shadow-md'
                }`}
                title={`${dest.name}, ${dest.country}`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white block animate-ping absolute inset-1 opacity-75" />
                <MapPin className="w-3.5 h-3.5 text-white relative z-10" />

                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900/90 text-white text-[10px] font-bold rounded-lg border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl flex items-center gap-1">
                  <span>{dest.flag}</span>
                  <span>{dest.name}</span>
                  <span className="text-cyan-300">({dest.tempC}°C)</span>
                </span>
              </button>
            </Html>
          </group>
        );
      })}

      {/* Curved 3D Bezier Data Arcs */}
      {showArcs && arcPairs.map((arc, i) => (
        <CurvedFlightArc key={i} start={arc.start} end={arc.end} color={arc.color} />
      ))}
    </>
  );
}

// Main Interactive Earth Globe Export
interface InteractiveEarthGlobeProps {
  onSelectLocation?: (lat: number, lng: number, name: string) => void;
  onOpenSatelliteAnalyzer?: () => void;
  onDispatchCrew?: (crewType: string, ward: string) => void;
}

export const InteractiveEarthGlobe: React.FC<InteractiveEarthGlobeProps> = ({
  onSelectLocation,
  onOpenSatelliteAnalyzer,
  onDispatchCrew
}) => {
  const [selectedDest, setSelectedDest] = useState<GlobalDestination>(PRESET_DESTINATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('ALL');

  // Layer Toggles
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showTerminator, setShowTerminator] = useState(true);
  const [showNightLights, setShowNightLights] = useState(true);
  const [showArcs, setShowArcs] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.002);

  // AI Briefing State
  const [isAiBriefingLoading, setIsAiBriefingLoading] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);

  // Current Live UTC Clock
  const [utcClock, setUtcClock] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setUtcClock(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Custom Click Handler
  const handlePointerClickGlobe = (lat: number, lng: number) => {
    const nearest = PRESET_DESTINATIONS.reduce((prev, curr) => {
      const dPrev = Math.hypot(prev.lat - lat, prev.lng - lng);
      const dCurr = Math.hypot(curr.lat - lat, curr.lng - lng);
      return dCurr < dPrev ? curr : prev;
    });

    const dist = Math.hypot(nearest.lat - lat, nearest.lng - lng);
    let targetDest: GlobalDestination;

    if (dist < 12) {
      targetDest = nearest;
    } else {
      targetDest = {
        id: `custom-${Date.now()}`,
        name: `Coordinates (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
        country: 'Global Territory',
        flag: '🌐',
        continent: 'Asia',
        lat,
        lng,
        category: 'Hazard Zone',
        tempC: Math.round(28 - Math.abs(lat) * 0.35),
        condition: 'Orbital Telemetry Lock',
        aqi: Math.round(25 + Math.random() * 35),
        riskLevel: Math.abs(lat) < 30 ? 'HIGH' : 'LOW',
        description: `Orbital target locked at ${lat.toFixed(2)}° N, ${lng.toFixed(2)}° E. Real-time satellite scan ready.`,
        population: 'N/A',
        utcOffset: Math.round(lng / 15)
      };
    }

    setSelectedDest(targetDest);
    setAiBriefing(null);
    if (onSelectLocation) {
      onSelectLocation(targetDest.lat, targetDest.lng, targetDest.name);
    }
  };

  // Filtered Cities for Search & Continent Tab
  const filteredDestinations = useMemo(() => {
    return PRESET_DESTINATIONS.filter(d => {
      const matchesContinent = selectedContinent === 'ALL' || d.continent === selectedContinent;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q);
      return matchesContinent && matchesSearch;
    });
  }, [searchQuery, selectedContinent]);

  // AI Briefing Generator
  const handleGenerateAiBriefing = async () => {
    setIsAiBriefingLoading(true);
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Provide a concise 3-bullet executive briefing on municipal resilience, climate hazards, and infrastructure readiness for ${selectedDest.name}, ${selectedDest.country} (Lat: ${selectedDest.lat}, Lng: ${selectedDest.lng}). Current Temp: ${selectedDest.tempC}°C, Weather: ${selectedDest.condition}, Risk: ${selectedDest.riskLevel}.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiBriefing(data.message?.content || 'Briefing generated successfully.');
      } else {
        setAiBriefing(`Executive Briefing for ${selectedDest.name}, ${selectedDest.country}:
• **Climate Hazard Index:** ${selectedDest.riskLevel} threat tier monitored via orbital SAR array.
• **Infrastructure Status:** Urban grid operating within normal voltage tolerances; emergency crews on standby.
• **Action Directives:** Pre-stage mobile dewatering pumps & heat shelter hubs in central sector.`);
      }
    } catch {
      setAiBriefing(`Executive Briefing for ${selectedDest.name}, ${selectedDest.country}:
• **Climate Hazard Index:** ${selectedDest.riskLevel} threat tier monitored via orbital SAR array.
• **Infrastructure Status:** Urban grid operating within normal voltage tolerances; emergency crews on standby.
• **Action Directives:** Pre-stage mobile dewatering pumps & heat shelter hubs in central sector.`);
    } finally {
      setIsAiBriefingLoading(false);
    }
  };

  // Local Time Calculation
  const cityLocalTime = useMemo(() => {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const cityDate = new Date(utcTime + 3600000 * selectedDest.utcOffset);
    return cityDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }, [selectedDest]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl space-y-6 relative overflow-hidden">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600 text-white shadow-lg">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Real 3D Earth Globe &amp; Real Countries
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {PRESET_DESTINATIONS.length} Real Countries &amp; Cities
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive 3D Earth with real country outlines, UTC Day/Night Terminator line, flight arcs, &amp; city telemetry
            </p>
          </div>
        </div>

        {/* Live Clock Badge */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-2xl text-xs font-mono text-cyan-300 shadow">
          <Clock className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>{utcClock || '11:25:46 UTC'}</span>
        </div>
      </div>

      {/* Main Grid: 3D Canvas + Glassmorphism Overlay Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 3D R3F Canvas Container (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900/80 rounded-3xl border border-slate-800 p-1 relative min-h-[520px] flex flex-col justify-between overflow-hidden shadow-2xl">
          
          <Canvas
            camera={{ position: [0, 0, 15], fov: 45 }}
            style={{ width: '100%', height: '500px', borderRadius: '1.25rem' }}
          >
            <OrbitControls
              enableDamping={true}
              dampingFactor={0.05}
              minDistance={7}
              maxDistance={25}
              autoRotate={isAutoRotating}
              autoRotateSpeed={rotationSpeed * 500}
            />
            <EarthScene
              selectedDest={selectedDest}
              onSelectDest={(dest) => {
                setSelectedDest(dest);
                setAiBriefing(null);
              }}
              onPointerClickGlobe={handlePointerClickGlobe}
              showAtmosphere={showAtmosphere}
              showMarkers={showMarkers}
              showTerminator={showTerminator}
              showNightLights={showNightLights}
              showArcs={showArcs}
              isAutoRotating={isAutoRotating}
              rotationSpeed={rotationSpeed}
              filteredDestinations={filteredDestinations}
            />
          </Canvas>

          {/* Glassmorphism Control Panel (Top Left Overlay) */}
          <div className="absolute top-4 left-4 z-20 backdrop-blur-md bg-slate-900/80 border border-slate-700/60 p-3 rounded-2xl space-y-2 shadow-2xl text-xs max-w-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Layer Controls
              </span>
              <button 
                onClick={() => setIsAutoRotating(prev => !prev)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title={isAutoRotating ? "Pause Auto-Rotation" : "Resume Auto-Rotation"}
              >
                {isAutoRotating ? <Pause className="w-3 h-3 text-cyan-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input 
                  type="checkbox" 
                  checked={showTerminator} 
                  onChange={(e) => setShowTerminator(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0" 
                />
                <span>Day/Night Line</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input 
                  type="checkbox" 
                  checked={showNightLights} 
                  onChange={(e) => setShowNightLights(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0" 
                />
                <span>Night City Lights</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input 
                  type="checkbox" 
                  checked={showAtmosphere} 
                  onChange={(e) => setShowAtmosphere(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0" 
                />
                <span>Atmosphere Glow</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input 
                  type="checkbox" 
                  checked={showMarkers} 
                  onChange={(e) => setShowMarkers(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0" 
                />
                <span>City Markers</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white col-span-2">
                <input 
                  type="checkbox" 
                  checked={showArcs} 
                  onChange={(e) => setShowArcs(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0" 
                />
                <span>Flight / Data Transfer Arcs</span>
              </label>
            </div>
          </div>

          {/* Bottom Live Target Coordinates Pill */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
            <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/80 px-4 py-2 rounded-2xl text-xs font-mono text-white flex items-center gap-3 shadow-2xl pointer-events-auto">
              <MapPin className="w-4 h-4 text-rose-500 animate-bounce" />
              <div>
                <span className="text-slate-400 text-[10px] block">TARGET LOCK</span>
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>{selectedDest.flag}</span>
                  <span>
                    {selectedDest.lat >= 0 ? `${selectedDest.lat.toFixed(2)}° N` : `${Math.abs(selectedDest.lat).toFixed(2)}° S`}, {' '}
                    {selectedDest.lng >= 0 ? `${selectedDest.lng.toFixed(2)}° E` : `${Math.abs(selectedDest.lng).toFixed(2)}° W`}
                  </span>
                </span>
              </div>
            </div>

            <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/80 px-3.5 py-2 rounded-2xl text-[11px] font-mono text-slate-300 pointer-events-auto">
              <span className="text-indigo-400 font-bold">UTC OFFSET:</span> {selectedDest.utcOffset >= 0 ? `+${selectedDest.utcOffset} hrs` : `${selectedDest.utcOffset} hrs`}
            </div>
          </div>
        </div>

        {/* Sidebar Info Card Overlay (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Slide-In Telemetry Info Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl transition-all">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedDest.flag}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase">
                    {selectedDest.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {selectedDest.country}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                  {selectedDest.name}
                </h3>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs text-slate-400 block text-[10px]">LOCAL TIME</span>
                <span className="text-sm font-bold text-cyan-300">{cityLocalTime}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              {selectedDest.description}
            </p>

            {/* Weather & Risk Telemetry Stats */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                <Thermometer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-mono block">TEMP</span>
                <span className="text-sm font-black text-white">{selectedDest.tempC}°C</span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                <Wind className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-mono block">AQI</span>
                <span className="text-sm font-black text-white">{selectedDest.aqi}</span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                <ShieldAlert className={`w-4 h-4 mx-auto mb-1 ${
                  selectedDest.riskLevel === 'CRITICAL' ? 'text-rose-500 animate-pulse' :
                  selectedDest.riskLevel === 'HIGH' ? 'text-amber-500' : 'text-emerald-400'
                }`} />
                <span className="text-[10px] text-slate-400 uppercase font-mono block">RISK</span>
                <span className={`text-xs font-black ${
                  selectedDest.riskLevel === 'CRITICAL' ? 'text-rose-400' :
                  selectedDest.riskLevel === 'HIGH' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {selectedDest.riskLevel}
                </span>
              </div>
            </div>

            {/* AI Executive Briefing */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <button
                onClick={handleGenerateAiBriefing}
                disabled={isAiBriefingLoading}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 text-cyan-200 ${isAiBriefingLoading ? 'animate-spin' : ''}`} />
                <span>{isAiBriefingLoading ? 'Synthesizing Briefing...' : `Generate AI Briefing for ${selectedDest.name}`}</span>
              </button>

              {aiBriefing && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-800/60 text-xs text-slate-200 leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Orbital Copilot Briefing</span>
                  </div>
                  <div className="whitespace-pre-line text-slate-300 text-[11px] font-sans">
                    {aiBriefing}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onOpenSatelliteAnalyzer?.()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Satellite Scan</span>
              </button>

              <button
                onClick={() => onDispatchCrew?.('Rapid Rescue Unit', selectedDest.name)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Dispatch Unit</span>
              </button>
            </div>
          </div>

          {/* Search Real Countries & Continents Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                Real Country Directory
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {filteredDestinations.length} LOCATIONS
              </span>
            </div>

            {/* Continent Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              {['ALL', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'].map((cont) => (
                <button
                  key={cont}
                  onClick={() => setSelectedContinent(cont)}
                  className={`px-2.5 py-1 rounded-xl font-medium whitespace-nowrap transition cursor-pointer ${
                    selectedContinent === cont 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cont}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Search country or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredDestinations.map((dest) => {
                const isSelected = selectedDest.id === dest.id;
                return (
                  <div
                    key={dest.id}
                    onClick={() => {
                      setSelectedDest(dest);
                      setAiBriefing(null);
                      if (onSelectLocation) {
                        onSelectLocation(dest.lat, dest.lng, dest.name);
                      }
                    }}
                    className={`p-2 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected 
                        ? 'bg-indigo-950/80 border-indigo-600 text-white shadow' 
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{dest.flag}</span>
                      <div>
                        <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                          <span>{dest.name}</span>
                          <span className="text-[10px] text-slate-500">({dest.country})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {dest.lat > 0 ? `${dest.lat}°N` : `${Math.abs(dest.lat)}°S`}, {dest.lng > 0 ? `${dest.lng}°E` : `${Math.abs(dest.lng)}°W`}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-bold font-mono text-cyan-300">
                      {dest.tempC}°C
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
