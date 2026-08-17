import * as THREE from 'three';

export interface GeoJsonFeature {
  type: 'Feature';
  properties: {
    name: string;
    iso_a3: string;
    continent: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export const WORLD_COUNTRIES_GEOJSON: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'India', iso_a3: 'IND', continent: 'Asia' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [68.1, 23.7], [70.5, 21.0], [72.8, 19.0], [73.8, 15.5], [75.8, 11.5],
          [77.5, 8.1], [79.8, 10.3], [80.2, 13.1], [82.5, 16.5], [84.8, 19.1],
          [87.0, 21.5], [88.3, 22.5], [89.0, 26.0], [92.0, 26.8], [95.0, 28.2],
          [97.0, 28.0], [94.5, 25.0], [92.5, 23.0], [88.5, 26.5], [85.0, 27.2],
          [81.0, 30.2], [78.5, 31.0], [77.0, 32.5], [74.5, 35.5], [73.0, 34.0],
          [71.5, 30.0], [70.0, 28.0], [68.5, 25.5], [68.1, 23.7]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'United States', iso_a3: 'USA', continent: 'Americas' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Contiguous USA
          [[
            [-124.7, 48.4], [-124.2, 43.0], [-120.0, 39.0], [-117.1, 32.5],
            [-111.0, 31.3], [-106.5, 31.8], [-104.9, 29.8], [-99.5, 26.4],
            [-97.2, 27.8], [-93.8, 29.7], [-89.5, 29.0], [-85.5, 29.7],
            [-81.0, 25.1], [-80.0, 26.8], [-80.8, 32.0], [-78.5, 33.9],
            [-75.5, 35.2], [-74.0, 40.5], [-70.0, 41.5], [-67.0, 45.0],
            [-71.0, 45.3], [-75.0, 45.0], [-79.0, 43.6], [-82.5, 41.7],
            [-88.0, 48.0], [-95.0, 49.0], [-104.0, 49.0], [-111.0, 49.0],
            [-117.0, 49.0], [-123.0, 49.0], [-124.7, 48.4]
          ]],
          // Alaska
          [[
            [-168.0, 65.5], [-160.0, 71.0], [-141.0, 69.6], [-141.0, 60.0],
            [-130.0, 55.0], [-135.0, 58.0], [-148.0, 60.0], [-160.0, 55.0],
            [-168.0, 65.5]
          ]]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'China', iso_a3: 'CHN', continent: 'Asia' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [73.5, 39.5], [80.0, 44.5], [87.5, 49.2], [100.0, 42.5], [110.0, 42.0],
          [120.0, 53.3], [131.0, 45.0], [135.0, 48.4], [130.0, 42.5], [122.0, 39.0],
          [120.0, 32.0], [121.8, 31.2], [119.5, 25.0], [114.0, 22.2], [108.0, 21.5],
          [102.0, 22.5], [98.0, 28.0], [92.0, 27.8], [88.0, 27.8], [81.0, 30.2],
          [78.5, 35.5], [74.5, 37.0], [73.5, 39.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Brazil', iso_a3: 'BRA', continent: 'Americas' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-73.5, -7.2], [-70.0, 4.4], [-60.0, 5.2], [-51.0, 4.0], [-47.5, -0.8],
          [-35.0, -5.2], [-34.8, -7.5], [-37.5, -13.0], [-40.0, -20.0], [-48.0, -25.5],
          [-53.5, -33.7], [-57.5, -30.2], [-58.0, -22.0], [-65.0, -20.0], [-69.5, -11.0],
          [-73.5, -7.2]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Australia', iso_a3: 'AUS', continent: 'Oceania' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [113.5, -21.8], [121.5, -18.5], [130.0, -12.0], [136.8, -12.0],
          [142.0, -10.8], [145.0, -15.0], [153.5, -28.2], [150.0, -37.5],
          [141.0, -38.5], [138.0, -35.0], [135.0, -33.0], [122.0, -34.0],
          [115.0, -34.5], [113.0, -25.5], [113.5, -21.8]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Russia', iso_a3: 'RUS', continent: 'Europe' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [28.0, 59.5], [31.5, 60.5], [33.0, 69.0], [40.0, 67.0], [60.0, 70.0],
          [80.0, 73.0], [110.0, 76.0], [140.0, 72.0], [170.0, 69.0], [180.0, 65.0],
          [170.0, 60.0], [160.0, 56.0], [143.0, 50.0], [131.0, 42.8], [135.0, 48.4],
          [120.0, 53.3], [100.0, 52.0], [87.5, 49.2], [70.0, 55.0], [50.0, 51.5],
          [38.0, 47.0], [38.0, 55.0], [28.0, 59.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Canada', iso_a3: 'CAN', continent: 'Americas' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-141.0, 69.6], [-130.0, 70.0], [-100.0, 72.0], [-80.0, 73.0], [-62.0, 62.0],
          [-55.0, 52.0], [-60.0, 46.0], [-67.0, 45.0], [-71.0, 45.3], [-75.0, 45.0],
          [-79.0, 43.6], [-82.5, 41.7], [-88.0, 48.0], [-95.0, 49.0], [-104.0, 49.0],
          [-111.0, 49.0], [-117.0, 49.0], [-123.0, 49.0], [-128.0, 54.0], [-135.0, 58.0],
          [-141.0, 60.0], [-141.0, 69.6]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'United Kingdom', iso_a3: 'GBR', continent: 'Europe' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-5.5, 50.0], [1.8, 51.2], [1.7, 52.8], [0.1, 53.6], [-0.5, 54.5],
          [-2.0, 55.8], [-3.0, 58.6], [-5.0, 58.6], [-6.2, 56.8], [-4.5, 54.8],
          [-3.0, 53.3], [-4.5, 51.5], [-5.5, 50.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'France', iso_a3: 'FRA', continent: 'Europe' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-4.8, 48.4], [-1.9, 49.7], [2.5, 51.1], [4.2, 49.5], [6.1, 49.0],
          [7.5, 48.0], [7.2, 43.7], [3.1, 42.4], [-1.8, 43.4], [-1.2, 46.0],
          [-4.8, 48.4]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Germany', iso_a3: 'DEU', continent: 'Europe' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [6.0, 50.8], [7.2, 53.7], [9.8, 54.8], [14.1, 53.8], [14.7, 51.0],
          [13.8, 50.8], [12.1, 47.7], [8.6, 47.8], [7.5, 48.0], [6.0, 50.8]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Japan', iso_a3: 'JPN', continent: 'Asia' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Honshu
          [[
            [139.8, 35.0], [140.8, 35.8], [141.0, 37.0], [141.5, 41.5],
            [140.0, 41.2], [137.0, 37.0], [135.5, 35.5], [131.0, 34.0],
            [132.5, 34.3], [136.0, 35.0], [139.8, 35.0]
          ]],
          // Hokkaido
          [[
            [140.0, 41.8], [145.5, 43.5], [142.5, 45.4], [140.0, 41.8]
          ]]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Egypt', iso_a3: 'EGY', continent: 'Africa' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [25.0, 31.6], [31.5, 31.5], [34.2, 31.3], [35.0, 29.5], [33.0, 27.5],
          [36.9, 22.0], [25.0, 22.0], [25.0, 31.6]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Saudi Arabia', iso_a3: 'SAU', continent: 'Asia' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [34.6, 29.5], [39.0, 32.0], [48.0, 30.0], [50.1, 26.5], [55.0, 22.5],
          [52.0, 19.0], [43.0, 16.5], [42.5, 12.6], [39.0, 21.5], [34.6, 29.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'South Africa', iso_a3: 'ZAF', continent: 'Africa' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [16.5, -28.5], [20.0, -27.0], [25.0, -22.0], [31.0, -22.0], [32.8, -27.0],
          [31.0, -30.0], [28.0, -33.0], [20.0, -34.8], [18.0, -34.5], [16.5, -28.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Argentina', iso_a3: 'ARG', continent: 'Americas' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-65.0, -22.0], [-58.0, -22.0], [-57.5, -30.2], [-58.5, -34.5],
          [-62.0, -39.0], [-65.0, -43.0], [-68.0, -55.0], [-73.0, -52.0],
          [-71.0, -40.0], [-69.0, -32.0], [-65.0, -22.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Mexico', iso_a3: 'MEX', continent: 'Americas' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-117.1, 32.5], [-106.5, 31.8], [-99.5, 26.4], [-97.2, 26.0],
          [-90.5, 21.0], [-87.0, 21.5], [-90.0, 18.0], [-92.2, 14.5],
          [-97.0, 16.0], [-105.0, 20.0], [-110.0, 23.0], [-115.0, 30.0],
          [-117.1, 32.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Italy', iso_a3: 'ITA', continent: 'Europe' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [7.5, 45.8], [13.8, 45.8], [13.5, 43.5], [18.5, 40.0], [16.0, 38.0],
          [15.5, 38.2], [14.0, 41.0], [10.0, 44.0], [7.5, 45.8]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Spain', iso_a3: 'ESP', continent: 'Europe' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-9.3, 43.0], [-1.8, 43.4], [3.1, 42.4], [0.2, 38.8], [-2.0, 36.8],
          [-6.0, 36.0], [-7.5, 37.2], [-9.5, 38.8], [-9.3, 43.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Indonesia', iso_a3: 'IDN', continent: 'Asia' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Sumatra
          [[ [95.0, 5.5], [105.0, -6.0], [103.0, -4.0], [98.0, 2.0], [95.0, 5.5] ]],
          // Java
          [[ [105.5, -6.0], [114.5, -8.8], [112.0, -7.0], [106.0, -6.0], [105.5, -6.0] ]],
          // Kalimantan / Borneo (Indonesia part)
          [[ [109.0, 1.0], [117.0, 4.0], [118.0, -4.0], [111.0, -3.5], [109.0, 1.0] ]]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Nigeria', iso_a3: 'NGA', continent: 'Africa' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [3.5, 6.5], [2.7, 9.0], [3.5, 11.7], [8.0, 13.8], [14.0, 13.0],
          [14.5, 10.0], [8.5, 4.5], [5.0, 5.0], [3.5, 6.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Turkey', iso_a3: 'TUR', continent: 'Asia' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [26.0, 40.0], [29.0, 41.0], [38.0, 42.0], [44.5, 41.0], [44.0, 37.0],
          [36.0, 36.5], [30.0, 36.0], [27.0, 38.5], [26.0, 40.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Iran', iso_a3: 'IRN', continent: 'Asia' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [44.0, 39.0], [50.0, 37.5], [54.0, 37.0], [61.0, 35.5], [63.0, 29.5],
          [60.0, 25.0], [56.0, 27.0], [50.0, 30.0], [48.0, 31.0], [45.0, 35.0],
          [44.0, 39.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Kenya', iso_a3: 'KEN', continent: 'Africa' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [34.0, 4.5], [41.8, 3.9], [41.0, -1.6], [39.0, -4.7], [37.5, -3.2],
          [34.0, -1.0], [34.0, 4.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'South Korea', iso_a3: 'KOR', continent: 'Asia' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [126.0, 38.0], [129.0, 38.5], [129.5, 35.5], [127.0, 34.5], [126.0, 38.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'New Zealand', iso_a3: 'NZL', continent: 'Oceania' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // North Island
          [[ [172.5, -34.5], [178.5, -37.5], [175.0, -41.5], [172.5, -34.5] ]],
          // South Island
          [[ [173.0, -41.0], [174.0, -41.5], [168.0, -46.5], [166.5, -45.0], [173.0, -41.0] ]]
        ]
      }
    }
  ]
};

// Helper to extract line loops for 3D sphere rendering or 2D canvas drawing
export function extractGeoJsonLines(radius: number = 5.015) {
  const lineGroups: Array<{ name: string; iso: string; points: THREE.Vector3[] }> = [];

  WORLD_COUNTRIES_GEOJSON.features.forEach(feature => {
    const { name, iso_a3 } = feature.properties;
    const geom = feature.geometry;

    const processPolygon = (polygonCoords: number[][]) => {
      const vecPoints: THREE.Vector3[] = [];
      polygonCoords.forEach(([lng, lat]) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        vecPoints.push(new THREE.Vector3(x, y, z));
      });
      if (vecPoints.length > 1) {
        lineGroups.push({ name, iso: iso_a3, points: vecPoints });
      }
    };

    if (geom.type === 'Polygon') {
      (geom.coordinates as number[][][]).forEach(ring => processPolygon(ring));
    } else if (geom.type === 'MultiPolygon') {
      (geom.coordinates as number[][][][]).forEach(poly => {
        poly.forEach(ring => processPolygon(ring));
      });
    }
  });

  return lineGroups;
}
