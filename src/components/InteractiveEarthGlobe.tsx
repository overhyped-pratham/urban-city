import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Globe, 
  MapPin, 
  Navigation, 
  Compass, 
  Sparkles, 
  CloudRain, 
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
  Info, 
  Zap, 
  ArrowRight,
  Bookmark,
  Check,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react';

export interface GlobalDestination {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  category: 'Capital' | 'Financial' | 'Megacity' | 'Hazard Zone' | 'Research Station';
  tempC: number;
  condition: string;
  aqi: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  population: string;
}

const PRESET_DESTINATIONS: GlobalDestination[] = [
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lng: 139.6503,
    category: 'Megacity',
    tempC: 22,
    condition: 'Clear Sky',
    aqi: 32,
    riskLevel: 'MEDIUM',
    description: 'High-density coastal metropolis with active seismic & typhoon monitoring networks.',
    population: '37.4 M'
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    category: 'Financial',
    tempC: 16,
    condition: 'Light Rain',
    aqi: 28,
    riskLevel: 'LOW',
    description: 'Thames Barrier flood defense system operating with automated surge sluices.',
    population: '9.0 M'
  },
  {
    id: 'newyork',
    name: 'New York',
    country: 'United States',
    lat: 40.7128,
    lng: -74.0060,
    category: 'Financial',
    tempC: 25,
    condition: 'Partly Cloudy',
    aqi: 45,
    riskLevel: 'MEDIUM',
    description: 'Coastal storm surge protection grids along East River and Hudson corridors.',
    population: '8.8 M'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    category: 'Megacity',
    tempC: 31,
    condition: 'Tropical Thunderstorm',
    aqi: 38,
    riskLevel: 'HIGH',
    description: 'Smart urban drainage canals and automated sea wall tidal barriers.',
    population: '5.9 M'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    lat: 19.0760,
    lng: 72.8777,
    category: 'Megacity',
    tempC: 29,
    condition: 'Monsoon Heavy Shower',
    aqi: 112,
    riskLevel: 'CRITICAL',
    description: 'Coastal urban flooding vulnerability; real-time pumping stations & sluice control.',
    population: '21.3 M'
  },
  {
    id: 'cairo',
    name: 'Cairo',
    country: 'Egypt',
    lat: 30.0444,
    lng: 31.2357,
    category: 'Capital',
    tempC: 36,
    condition: 'Extreme Heat',
    aqi: 140,
    riskLevel: 'HIGH',
    description: 'Nile Delta agricultural & water security monitoring grid under desert heatwave.',
    population: '10.1 M'
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    lat: -33.8688,
    lng: 151.2093,
    category: 'Capital',
    tempC: 21,
    condition: 'Sunny',
    aqi: 20,
    riskLevel: 'LOW',
    description: 'Harbor water telemetry and bushfire early detection satellite perimeter.',
    population: '5.3 M'
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    lat: 48.8566,
    lng: 2.3522,
    category: 'Capital',
    tempC: 19,
    condition: 'Overcast',
    aqi: 35,
    riskLevel: 'LOW',
    description: 'Seine River basin flood forecasting & urban heat island mitigation canopy.',
    population: '2.1 M'
  },
  {
    id: 'rio',
    name: 'Rio de Janeiro',
    country: 'Brazil',
    lat: -22.9068,
    lng: -43.1729,
    category: 'Hazard Zone',
    tempC: 28,
    condition: 'Tropical Rain',
    aqi: 42,
    riskLevel: 'HIGH',
    description: 'Favela hillside landslide radar sensors and torrential downpour warnings.',
    population: '6.7 M'
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    lat: 25.2048,
    lng: 55.2708,
    category: 'Financial',
    tempC: 41,
    condition: 'Haze & Extreme Heat',
    aqi: 125,
    riskLevel: 'HIGH',
    description: 'Smart storm drainage, desalination plant security, and cloud seeding tracking.',
    population: '3.6 M'
  },
  {
    id: 'reykjavik',
    name: 'Reykjavik',
    country: 'Iceland',
    lat: 64.1466,
    lng: -21.9426,
    category: 'Research Station',
    tempC: 6,
    condition: 'Windy Cold',
    aqi: 8,
    riskLevel: 'LOW',
    description: 'Geothermal energy monitoring, volcanic ash radar, and glacier ice dynamics.',
    population: '0.13 M'
  },
  {
    id: 'honolulu',
    name: 'Honolulu',
    country: 'United States',
    lat: 21.3069,
    lng: -157.8583,
    category: 'Hazard Zone',
    tempC: 27,
    condition: 'Trade Winds',
    aqi: 15,
    riskLevel: 'LOW',
    description: 'Pacific Tsunami Warning Center node & coral reef erosion sensor array.',
    population: '0.35 M'
  }
];

// Helper: Convert Lat/Lng to 3D Sphere Position
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Helper: Convert 3D Point on Unit Sphere back to Lat/Lng
function vector3ToLatLng(vector: THREE.Vector3): { lat: number; lng: number } {
  const normalized = vector.clone().normalize();
  const lat = Math.asin(normalized.y) * (180 / Math.PI);
  // Revert the theta math used above
  let lng = Math.atan2(normalized.z, -normalized.x) * (180 / Math.PI) - 180;
  if (lng < -180) lng += 360;
  if (lng > 180) lng -= 360;
  return { lat, lng };
}

// Procedurally generate a high-contrast dark tech Earth Texture on HTML5 Canvas
function createProceduralEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Ocean background gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#030712'); // Dark midnight
  oceanGrad.addColorStop(0.5, '#0b132b'); // Deep indigo ocean
  oceanGrad.addColorStop(1, '#030712');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Latitude and Longitude Grid Lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;

  // Parallels (Latitudes)
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Meridians (Longitudes)
  for (let lng = -180; lng <= 180; lng += 30) {
    const x = ((lng + 180) / 360) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Equator highlight line
  const equatorY = canvas.height / 2;
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, equatorY);
  ctx.lineTo(canvas.width, equatorY);
  ctx.stroke();

  // 3. Draw Stylized Landmass Shapes (Continents Approximation for 3D Earth)
  ctx.fillStyle = '#1e293b'; // Slate dark continent land
  ctx.strokeStyle = '#38bdf8'; // Cyan land outline
  ctx.lineWidth = 1.5;

  const drawPolygon = (coords: Array<[number, number]>) => {
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
  drawPolygon([[-165,65], [-140,70], [-100,75], [-60,60], [-65,45], [-75,35], [-80,25], [-105,20], [-120,32], [-130,50], [-165,65]]);
  // South America
  drawPolygon([[-80,10], [-60,12], [-35,-5], [-40,-22], [-55,-35], [-70,-55], [-75,-40], [-80,-5], [-80,10]]);
  // Eurasia
  drawPolygon([[-10,36], [0,50], [20,60], [40,70], [80,72], [140,70], [170,60], [140,35], [120,22], [100,10], [80,8], [60,25], [35,32], [25,35], [-10,36]]);
  // Africa
  drawPolygon([[-17,35], [10,37], [32,32], [42,12], [50,11], [40,-15], [30,-34], [18,-34], [10,-5], [-15,10], [-17,35]]);
  // Australia
  drawPolygon([[114,-22], [130,-12], [145,-15], [153,-28], [140,-38], [115,-35], [114,-22]]);
  // Antarctica
  drawPolygon([[-180,-75], [0,-70], [180,-75], [180,-90], [-180,-90]]);

  // 4. Night City Lights Glow Dots
  ctx.fillStyle = '#38bdf8';
  PRESET_DESTINATIONS.forEach(dest => {
    const x = ((dest.lng + 180) / 360) * canvas.width;
    const y = ((90 - dest.lat) / 180) * canvas.height;
    
    // Outer glow
    const radGrad = ctx.createRadialGradient(x, y, 1, x, y, 12);
    radGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
    radGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.4)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Center bright node
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

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
  const mountRef = useRef<HTMLDivElement>(null);

  // Selected Destination State
  const [selectedDest, setSelectedDest] = useState<GlobalDestination>(PRESET_DESTINATIONS[0]);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.002);
  const [activeLayer, setActiveLayer] = useState<'STANDARD' | 'RISK' | 'FLIGHTS' | 'CLIMATE'>('STANDARD');
  const [isAiBriefingLoading, setIsAiBriefingLoading] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['tokyo', 'london']);

  // Flight Path Route Target
  const [routeDestination, setRouteDestination] = useState<GlobalDestination | null>(PRESET_DESTINATIONS[1]);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudMeshRef = useRef<THREE.Mesh | null>(null);
  const pinMarkerRef = useRef<THREE.Group | null>(null);
  const flightArcsGroupRef = useRef<THREE.Group | null>(null);

  // Mouse drag interaction variables
  const isDraggingRef = useRef(false);
  const previousMousePosRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });

  // Camera fly-to target state
  const isFlyingRef = useRef(false);
  const flyProgressRef = useRef(0);
  const flyStartQuatRef = useRef(new THREE.Quaternion());
  const flyEndQuatRef = useRef(new THREE.Quaternion());

  // Filtered cities list for search
  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return PRESET_DESTINATIONS;
    const q = searchQuery.toLowerCase();
    return PRESET_DESTINATIONS.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.country.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // ----------------------------------------------------
  // INITIALIZE THREE.JS GLOBE SCENE
  // ----------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight1.position.set(20, 20, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x6366f1, 1.0);
    dirLight2.position.set(-20, -10, -20);
    scene.add(dirLight2);

    // 5. Starfield Background Particles
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 200;
      starPos[i + 1] = (Math.random() - 0.5) * 200;
      starPos[i + 2] = (Math.random() - 0.5) * 200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.6,
      transparent: true,
      opacity: 0.6
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 6. Earth Mesh (Radius: 5)
    const earthRadius = 5;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthTex = createProceduralEarthTexture();
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.6,
      metalness: 0.2
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 7. Outer Atmospheric Glow Mesh (Radius: 5.18)
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.035, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosMesh);

    // 8. Rotating Clouds Mesh (Radius: 5.06)
    const cloudGeo = new THREE.SphereGeometry(earthRadius * 1.012, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloudMesh);
    cloudMeshRef.current = cloudMesh;

    // 9. Interactive Pin Marker Group
    const pinGroup = new THREE.Group();
    
    // Pin Pole
    const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 16);
    const poleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.y = 0.4;
    pinGroup.add(poleMesh);

    // Pin Glowing Beacon Head
    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const headMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 0.8;
    pinGroup.add(headMesh);

    // Pulsing Ground Ring
    const ringGeo = new THREE.RingGeometry(0.1, 0.25, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    pinGroup.add(ringMesh);

    scene.add(pinGroup);
    pinMarkerRef.current = pinGroup;

    // 10. Flight Arcs Container
    const flightGroup = new THREE.Group();
    scene.add(flightGroup);
    flightArcsGroupRef.current = flightGroup;

    // Initial position pin
    const initPos = latLngToVector3(selectedDest.lat, selectedDest.lng, earthRadius);
    pinGroup.position.copy(initPos);
    pinGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), initPos.clone().normalize());

    // ----------------------------------------------------
    // ANIMATION & RENDER LOOP
    // ----------------------------------------------------
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Auto rotation
      if (isAutoRotating && !isDraggingRef.current && !isFlyingRef.current && earthMeshRef.current) {
        earthMeshRef.current.rotation.y += rotationSpeed;
        if (cloudMeshRef.current) {
          cloudMeshRef.current.rotation.y += rotationSpeed * 1.3;
        }
      }

      // Smooth Camera Fly-To Interpolation
      if (isFlyingRef.current && cameraRef.current) {
        flyProgressRef.current += 0.025;
        if (flyProgressRef.current >= 1) {
          flyProgressRef.current = 1;
          isFlyingRef.current = false;
        }

        // Interpolate camera position around sphere
        const currentQuat = new THREE.Quaternion();
        currentQuat.slerpQuaternions(flyStartQuatRef.current, flyEndQuatRef.current, flyProgressRef.current);
        
        const cameraDistance = 15;
        const camPos = new THREE.Vector3(0, 0, cameraDistance).applyQuaternion(currentQuat);
        cameraRef.current.position.copy(camPos);
        cameraRef.current.lookAt(0, 0, 0);
      }

      // Pin ring pulse scale
      if (pinMarkerRef.current) {
        const time = Date.now() * 0.003;
        const ring = pinMarkerRef.current.children[2] as THREE.Mesh;
        if (ring) {
          const s = 1 + Math.sin(time) * 0.25;
          ring.scale.set(s, s, s);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // ----------------------------------------------------
    // RESIZE HANDLER
    // ----------------------------------------------------
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // ----------------------------------------------------
  // DRAW FLIGHT / ROUTE ARCS WHEN LAYER OR SELECTION CHANGES
  // ----------------------------------------------------
  useEffect(() => {
    if (!flightArcsGroupRef.current || !earthMeshRef.current) return;
    const group = flightArcsGroupRef.current;
    
    // Clear old arcs
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (activeLayer === 'FLIGHTS' || routeDestination) {
      const radius = 5;
      const startDest = selectedDest;
      const targetDest = routeDestination || PRESET_DESTINATIONS[1];

      if (startDest.id !== targetDest.id) {
        const p1 = latLngToVector3(startDest.lat, startDest.lng, radius);
        const p2 = latLngToVector3(targetDest.lat, targetDest.lng, radius);

        // Control point curved outwards above Earth surface
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const midLength = mid.length();
        mid.normalize().multiplyScalar(radius + Math.min(p1.distanceTo(p2) * 0.45, 3.5));

        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const points = curve.getPoints(50);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

        const arcMat = new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          linewidth: 2,
          transparent: true,
          opacity: 0.85
        });

        const arcLine = new THREE.Line(arcGeo, arcMat);
        group.add(arcLine);

        // Moving node particle along flight path
        const nodeGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const nodeMat = new THREE.MeshBasicMaterial({ color: 0x6366f1 });
        const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        nodeMesh.position.copy(p1);
        group.add(nodeMesh);
      }
    }
  }, [activeLayer, selectedDest, routeDestination]);

  // ----------------------------------------------------
  // FLY CAMERA TO SPECIFIC LAT/LNG
  // ----------------------------------------------------
  const flyToLocation = (lat: number, lng: number) => {
    if (!cameraRef.current || !earthMeshRef.current || !pinMarkerRef.current) return;

    // Update 3D Pin Position
    const radius = 5;
    const targetPos = latLngToVector3(lat, lng, radius);
    pinMarkerRef.current.position.copy(targetPos);
    pinMarkerRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), targetPos.clone().normalize());

    // Calculate rotation to face camera at target coordinates
    const cameraDistance = 15;
    const normTarget = targetPos.clone().normalize();
    
    // Starting camera direction
    const currentCamPos = cameraRef.current.position.clone().normalize();
    const startQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), currentCamPos);
    
    // Target camera direction
    const endQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normTarget);

    flyStartQuatRef.current.copy(startQuat);
    flyEndQuatRef.current.copy(endQuat);
    flyProgressRef.current = 0;
    isFlyingRef.current = true;
  };

  // ----------------------------------------------------
  // HANDLE GLOBE CLICK & RAYCASTING
  // ----------------------------------------------------
  const handleGlobeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !earthMeshRef.current || isDraggingRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const intersects = raycaster.intersectObject(earthMeshRef.current);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      
      // Calculate Earth mesh current rotation
      const pointInEarthSpace = hitPoint.clone().applyMatrix4(earthMeshRef.current.matrixWorld.clone().invert());
      const { lat, lng } = vector3ToLatLng(pointInEarthSpace);

      setClickedCoords({ lat, lng });

      // Find nearest preset destination or create custom dynamic point
      const nearest = PRESET_DESTINATIONS.reduce((prev, curr) => {
        const dPrev = Math.hypot(prev.lat - lat, prev.lng - lng);
        const dCurr = Math.hypot(curr.lat - lat, curr.lng - lng);
        return dCurr < dPrev ? curr : prev;
      });

      // If clicked very close to preset (within 15 degrees), pick preset; otherwise build dynamic custom location
      const dist = Math.hypot(nearest.lat - lat, nearest.lng - lng);
      let targetDest: GlobalDestination;

      if (dist < 15) {
        targetDest = nearest;
      } else {
        const isOcean = Math.abs(lat) < 60 && (lng < -30 || lng > 150 || (lng > 30 && lng < 100 && lat < 0));
        targetDest = {
          id: `custom-${Date.now()}`,
          name: isOcean ? 'Maritime Zone' : `Coordinates (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
          country: isOcean ? 'International Waters' : 'Global Territory',
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
          category: 'Hazard Zone',
          tempC: Math.round(30 - Math.abs(lat) * 0.4),
          condition: isOcean ? 'High Wave Telemetry' : 'Urban Sensor Node',
          aqi: Math.round(20 + Math.random() * 40),
          riskLevel: Math.abs(lat) < 25 ? 'HIGH' : 'MEDIUM',
          description: `Custom target locked at ${lat.toFixed(2)}° N, ${lng.toFixed(2)}° E. Live satellite telemetry online.`,
          population: 'N/A'
        };
      }

      setSelectedDest(targetDest);
      flyToLocation(targetDest.lat, targetDest.lng);

      if (onSelectLocation) {
        onSelectLocation(targetDest.lat, targetDest.lng, targetDest.name);
      }
    }
  };

  // Mouse Drag Handlers for Rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !earthMeshRef.current) return;

    const deltaX = e.clientX - previousMousePosRef.current.x;
    const deltaY = e.clientY - previousMousePosRef.current.y;

    earthMeshRef.current.rotation.y += deltaX * 0.005;
    earthMeshRef.current.rotation.x += deltaY * 0.005;

    // Clamp vertical tilt
    earthMeshRef.current.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, earthMeshRef.current.rotation.x));

    previousMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // ----------------------------------------------------
  // GENERATE AI DESTINATION BRIEFING
  // ----------------------------------------------------
  const handleGenerateAiBriefing = async () => {
    setIsAiBriefingLoading(true);
    setAiBriefing(null);
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
        setAiBriefing(data.message?.content || 'Telemetry briefing generated successfully.');
      } else {
        setAiBriefing(`Executive Briefing for ${selectedDest.name}:
• **Climate Hazard Index:** ${selectedDest.riskLevel} threat tier monitored via orbital SAR array.
• **Infrastructure Status:** Urban grid operating within normal voltage tolerances; emergency crews on standby.
• **Action Directives:** Pre-stage mobile dewatering pumps & heat shelter hubs in central sector.`);
      }
    } catch {
      setAiBriefing(`Executive Briefing for ${selectedDest.name}:
• **Climate Hazard Index:** ${selectedDest.riskLevel} threat tier monitored via orbital SAR array.
• **Infrastructure Status:** Urban grid operating within normal voltage tolerances; emergency crews on standby.
• **Action Directives:** Pre-stage mobile dewatering pumps & heat shelter hubs in central sector.`);
    } finally {
      setIsAiBriefingLoading(false);
    }
  };

  // Toggle Bookmark
  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                Interactive Earth Globe
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  WebGL 3D
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Click anywhere on the globe to target coordinates, inspect climate telemetry, & trigger flight paths
              </p>
            </div>
          </div>
        </div>

        {/* Global Layer Controls & Auto Rotation Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Layer Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveLayer('STANDARD')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                activeLayer === 'STANDARD' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setActiveLayer('FLIGHTS')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeLayer === 'FLIGHTS' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plane className="w-3.5 h-3.5 text-cyan-300" />
              Flight Routes
            </button>
            <button
              onClick={() => setActiveLayer('RISK')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeLayer === 'RISK' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Risk Nodes
            </button>
          </div>

          {/* Auto Rotate Play/Pause */}
          <button
            onClick={() => setIsAutoRotating(prev => !prev)}
            className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              isAutoRotating 
                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800 hover:bg-indigo-900' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title={isAutoRotating ? 'Pause Earth Auto-Rotation' : 'Resume Earth Auto-Rotation'}
          >
            {isAutoRotating ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline">{isAutoRotating ? 'Spinning' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Canvas Viewport + Sidebar HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 3D WebGL Canvas Container (8 Cols on Desktop) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-2 relative min-h-[500px] flex flex-col justify-between overflow-hidden shadow-inner">
          
          {/* WebGL Canvas Mount Node */}
          <div 
            ref={mountRef}
            onClick={handleGlobeClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-[480px] rounded-2xl cursor-grab active:cursor-grabbing relative"
          />

          {/* Canvas Floating Overlay Controls & Telemetry HUD */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            
            {/* Click Guidance Prompt */}
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-3.5 py-2 rounded-2xl text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-lg pointer-events-auto">
              <Compass className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Click any spot on Earth to inspect coordinates</span>
            </div>

            {/* Rotation Speed Control Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-2xl text-xs text-slate-300 pointer-events-auto">
              <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-mono">SPEED:</span>
              <input 
                type="range" 
                min="0.0005" 
                max="0.008" 
                step="0.0005"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                className="w-16 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Bottom Live Target Coordinates Pill */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/80 px-4 py-2 rounded-2xl text-xs font-mono text-white flex items-center gap-3 shadow-xl pointer-events-auto">
              <MapPin className="w-4 h-4 text-rose-500 animate-bounce" />
              <div>
                <span className="text-slate-400 text-[10px] block">TARGET LOCK</span>
                <span className="font-bold text-cyan-300">
                  {selectedDest.lat >= 0 ? `${selectedDest.lat.toFixed(2)}° N` : `${Math.abs(selectedDest.lat).toFixed(2)}° S`}, {' '}
                  {selectedDest.lng >= 0 ? `${selectedDest.lng.toFixed(2)}° E` : `${Math.abs(selectedDest.lng).toFixed(2)}° W`}
                </span>
              </div>
            </div>

            <button
              onClick={() => flyToLocation(selectedDest.lat, selectedDest.lng)}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition cursor-pointer pointer-events-auto"
            >
              <Navigation className="w-3.5 h-3.5" />
              Center Camera
            </button>
          </div>
        </div>

        {/* Sidebar HUD & Destination Inspector (5 Cols on Desktop) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Selected Destination Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase">
                    {selectedDest.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {selectedDest.country}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                  {selectedDest.name}
                </h3>
              </div>

              <button
                onClick={() => toggleBookmark(selectedDest.id)}
                className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                  bookmarkedIds.includes(selectedDest.id)
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="Bookmark Location"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              {selectedDest.description}
            </p>

            {/* Weather & Risk Telemetry Stats */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
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

            {/* AI Executive Briefing Trigger */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <button
                onClick={handleGenerateAiBriefing}
                disabled={isAiBriefingLoading}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 text-cyan-200 ${isAiBriefingLoading ? 'animate-spin' : ''}`} />
                <span>{isAiBriefingLoading ? 'Synthesizing Orbital Briefing...' : 'Generate AI Location Briefing'}</span>
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

            {/* Direct Action Buttons */}
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

          {/* Preset Destinations & Search Explorer */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                Global Destinations Search
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {filteredDestinations.length} LOCATIONS
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Search city, country, or hazard zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Destinations Scroll List */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {filteredDestinations.map((dest) => {
                const isSelected = selectedDest.id === dest.id;
                return (
                  <div
                    key={dest.id}
                    onClick={() => {
                      setSelectedDest(dest);
                      flyToLocation(dest.lat, dest.lng);
                      if (onSelectLocation) {
                        onSelectLocation(dest.lat, dest.lng, dest.name);
                      }
                    }}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected 
                        ? 'bg-indigo-950/80 border-indigo-600 text-white shadow' 
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-xl ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                          <span>{dest.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({dest.country})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {dest.lat > 0 ? `${dest.lat}°N` : `${Math.abs(dest.lat)}°S`}, {dest.lng > 0 ? `${dest.lng}°E` : `${Math.abs(dest.lng)}°W`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-cyan-300 block">
                        {dest.tempC}°C
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                        dest.riskLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        dest.riskLevel === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {dest.riskLevel}
                      </span>
                    </div>
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
