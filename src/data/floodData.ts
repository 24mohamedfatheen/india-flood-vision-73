// src/data/floodData.ts

import { IMDRegionData } from '../services/imdApiService';
import { imdApiService } from '../services/imdApiService'; // Import the live API service
import { staticHistoricalRainfallData } from './staticHistoricalRainfallData'; // Import the new static historical data
import { parseCsv } from '../utils/csvParser'; // Import the CSV parser

// Updated hardcoded content with all the new flood-prone locations
const WEATHER_CSV_CONTENT = `
,city,lat,lng,country,iso2,admin_name,capital,population,population_proper
0,Mumbai,19.076,72.8777,India,IN,Maharashtra,admin,20000000,12442373
1,Delhi,28.66,77.2167,India,IN,Delhi,admin,25000000,16314838
2,Bengaluru,12.9719,77.5937,India,IN,Karnataka,admin,13193000,8443675
3,Hyderabad,17.385,78.4867,India,IN,Telangana,admin,9746000,6993262
4,Ahmedabad,23.03,72.58,India,IN,Gujarat,admin,8650000,5570585
5,Chennai,13.0825,80.275,India,IN,Tamil Nadu,admin,9714000,4646732
6,Kolkata,22.5667,88.3667,India,IN,West Bengal,admin,14681000,4496694
7,Surat,21.1667,72.8333,India,IN,Gujarat,,6936000,4462006
8,Pune,18.5203,73.8567,India,IN,Maharashtra,,6200000,3124458
9,Jaipur,26.9167,75.8167,India,IN,Rajasthan,admin,3766000,3046163
10,Lucknow,26.8467,80.9462,India,IN,Uttar Pradesh,admin,3382000,2815601
11,Kanpur,26.4667,80.35,India,IN,Uttar Pradesh,,3100000,2920496
12,Nagpur,21.1497,79.0806,India,IN,Maharashtra,,2900000,2405665
13,Patna,25.61,85.1417,India,IN,Bihar,admin,2500000,2046652
14,Indore,22.7167,75.8472,India,IN,Madhya Pradesh,,2400000,1964086
15,Kochi,9.9667,76.2833,India,IN,Kerala,,2300000,602046
16,Guwahati,26.1833,91.75,India,IN,Assam,,1100000,962334
17,Agra,27.1767,78.0078,India,IN,Uttar Pradesh,,1500000,1500000
18,Allahabad,25.4358,81.8463,India,IN,Uttar Pradesh,,1200000,1200000
19,Gorakhpur,26.76,83.3731,India,IN,Uttar Pradesh,,800000,800000
20,Bareilly,28.367,79.4304,India,IN,Uttar Pradesh,,900000,900000
21,Varanasi,25.3176,82.9739,India,IN,Uttar Pradesh,,1200000,1200000
22,Gaya,24.7978,85.0098,India,IN,Bihar,,500000,500000
23,Purnia,25.7877,87.4764,India,IN,Bihar,,300000,300000
24,Motihari,26.6575,84.9192,India,IN,Bihar,,250000,250000
25,Dibrugarh,27.4883,94.9048,India,IN,Assam,,150000,150000
26,Jorhat,26.7441,94.2166,India,IN,Assam,,200000,200000
27,Kokrajhar,26.4069,90.2743,India,IN,Assam,,100000,100000
28,Bhubaneswar,20.2961,85.8245,India,IN,Odisha,admin,850000,850000
29,Cuttack,20.463,85.8829,India,IN,Odisha,,650000,650000
30,Balasore,21.4939,86.94,India,IN,Odisha,,150000,150000
31,Vijayawada,16.5062,80.648,India,IN,Andhra Pradesh,,1000000,1000000
32,Rajahmundry,16.9918,81.7766,India,IN,Andhra Pradesh,,350000,350000
33,Guntur,16.3,80.45,India,IN,Andhra Pradesh,,750000,750000
34,Thiruvananthapuram,8.5241,76.9366,India,IN,Kerala,admin,950000,950000
35,Thrissur,10.5276,76.2144,India,IN,Kerala,,315000,315000
36,Kottayam,9.5916,76.5222,India,IN,Kerala,,200000,200000
37,Nashik,20.0,73.78,India,IN,Maharashtra,,1500000,1500000
38,Kolhapur,16.705,74.2433,India,IN,Maharashtra,,550000,550000
39,Vadodara,22.3072,73.1812,India,IN,Gujarat,,1700000,1700000
40,Rajkot,22.2958,70.7984,India,IN,Gujarat,,1300000,1300000
41,Amritsar,31.634,74.8723,India,IN,Punjab,,1200000,1200000
42,Ludhiana,30.901,75.8573,India,IN,Punjab,,1600000,1600000
43,Jalandhar,31.326,75.5762,India,IN,Punjab,,900000,900000
44,Roorkee,29.87,77.89,India,IN,Uttarakhand,,120000,120000
45,Haridwar,29.9457,78.1642,India,IN,Uttarakhand,,230000,230000
46,Shimla,31.1048,77.1734,India,IN,Himachal Pradesh,admin,170000,170000
47,Bihar Sharif,25.2,85.5,India,IN,Bihar,,300000,300000
48,Bhagalpur,25.2427,86.9859,India,IN,Bihar,,410000,410000
49,Silchar,24.8219,92.7769,India,IN,Assam,,185000,185000
50,Muzaffarpur,26.1226,85.3916,India,IN,Bihar,,390000,390000
51,Darbhanga,26.1555,85.9001,India,IN,Bihar,,300000,300000
52,Alappuzha,9.4981,76.3388,India,IN,Kerala,,174000,174000
53,Dehradun,30.3165,78.0322,India,IN,Uttarakhand,admin,580000,580000
54,Srinagar,34.0837,74.7973,India,IN,Jammu and Kashmir,admin,1200000,1200000
`;

// Define an interface for the parsed CSV data
interface CityData {
  city: string;
  lat: number;
  lng: number;
  admin_name: string; // This will be the state
}

// Parse the CSV content to dynamically generate regions
const parsedCities = parseCsv<CityData>(WEATHER_CSV_CONTENT);

// Map parsed cities to your existing regions format
export const regions = parsedCities.map(city => ({
  value: city.city.toLowerCase(),
  label: city.city,
  state: city.admin_name || 'N/A', // Use admin_name as state, fallback if empty
  coordinates: [city.lat, city.lng] // Add coordinates for consistency
}));

// Ensure FloodData interface is consistent with IMDRegionData for flexibility
export interface FloodData {
  id: number;
  region: string;
  state: string;
  riskLevel: 'low' | 'medium' | 'high' | 'severe';
  affectedArea: number;
  populationAffected: number;
  coordinates: [number, number]; // [latitude, longitude]
  timestamp: string;
  currentRainfall: number; // Derived rainfall for charts
  historicalRainfallData: { year: number; month: string; rainfall: number; }[]; // Updated type for multi-year data
  predictionAccuracy: number;
  riverLevel?: number;
  predictedFlood?: {
    date: string;
    probabilityPercentage: number;
    timestamp?: string;
    predictedEvent?: string;
    predictedLocation?: string;
    timeframe?: string;
    supportingData?: string;
    expectedRainfall?: number;
    expectedRiverRise?: number;
    source?: {
      name: string;
      url: string;
      type?: string;
    }
  };
  riverData?: {
    name: string;
    currentLevel: number;
    dangerLevel: number;
    warningLevel: number;
    normalLevel: number;
    trend: 'rising' | 'falling' | 'stable';
    source: {
      name: string;
      url: string;
      type?: string;
    }
  };
  activeWarnings?: {
    type: 'severe' | 'warning' | 'alert' | 'watch';
    issuedBy: string;
    issuedAt: string;
    validUntil: string;
    message: string;
    sourceUrl: string;
  }[];
  estimatedDamage?: {
    crops: number;
    properties: number;
    infrastructure?: number;
  };
}

// This will now be a mutable array that stores either live data or static fallback
export let floodData: FloodData[] = [];

// Add proper type for the cached data with timestamp
interface CachedIMDData {
  data: IMDRegionData[];
  timestamp: string;
  expiresAt: string; // When this cache expires
}

// Replace simple cache with a proper cache object
let imdDataCache: CachedIMDData | null = null;

// Cache validity duration in milliseconds (6 hours)
const CACHE_VALIDITY_DURATION = 6 * 60 * 60 * 1000;

// Local storage key for persisting cache
const IMD_CACHE_KEY = 'imd_data_cache';

// Helper function to map IMDRegionData to FloodData
const mapIMDRegionDataToFloodData = (imdData: IMDRegionData[]): FloodData[] => {
  const currentYear = new Date().getFullYear();
  const mappedData = imdData.map((item, index) => {
    // currentRainfall Derivation (No Randomness)
    // Direct, linear, non-random scaling of reservoirPercentage and inflowCusecs
    let derivedCurrentRainfall = (item.reservoirPercentage * 10) + (item.inflowCusecs / 50);
    
    // If calculated value is 0, default to fixed minimum value of 5
    if (derivedCurrentRainfall === 0) {
      derivedCurrentRainfall = 5;
    }

    // Find coordinates from the dynamically generated regions and ensure proper tuple type
    const regionCoords = regions.find(r => r.value === item.district.toLowerCase())?.coordinates;
    const coordinates: [number, number] = regionCoords ? [regionCoords[0], regionCoords[1]] : [0, 0];

    return {
      id: index + 1,
      region: item.district,
      state: item.state,
      riskLevel: item.floodRiskLevel,
      affectedArea: 0, // Remain 0 unless directly provided in Supabase
      populationAffected: 0, // Remain 0 unless directly provided in Supabase
      coordinates,
      timestamp: new Date().toISOString(),
      currentRainfall: derivedCurrentRainfall,
      historicalRainfallData: [], // Initialize empty, getHistoricalRainfallData will populate
      predictionAccuracy: 85,
      riverLevel: item.riverData?.currentLevel,
      predictedFlood: item.predictedFlood,
      riverData: item.riverData ? {
        name: item.riverData.name,
        currentLevel: item.riverData.currentLevel,
        dangerLevel: item.riverData.dangerLevel,
        warningLevel: item.riverData.warningLevel,
        normalLevel: item.riverData.normalLevel,
        trend: item.riverData.trend,
        source: { name: 'Live Data', url: '' }
      } : undefined,
      activeWarnings: item.activeWarnings,
      estimatedDamage: { crops: 0, properties: 0, infrastructure: 0 }
    };
  });
  return mappedData;
};

// Load cache from localStorage on init
const loadCachedData = (): void => {
  try {
    const storedCache = localStorage.getItem(IMD_CACHE_KEY);
    if (storedCache) {
      const parsedCache = JSON.parse(storedCache) as CachedIMDData;

      // Check if cache is still valid
      if (new Date(parsedCache.expiresAt).getTime() > Date.now()) {
        imdDataCache = parsedCache;
        console.log('Loaded valid IMD data from local storage cache');
        floodData = mapIMDRegionDataToFloodData(parsedCache.data);
      } else {
        console.log('Cached IMD data expired, will fetch fresh data');
        localStorage.removeItem(IMD_CACHE_KEY);
      }
    }
  } catch (error) {
    console.error('Error loading cached IMD data:', error);
    localStorage.removeItem(IMD_CACHE_KEY);
  }
};

// Initialize by loading cache
loadCachedData();

// Improved API fetch function with proper caching and fallback
export const fetchImdData = async (forceRefresh = false): Promise<FloodData[]> => {
  console.log('fetchImdData called, forceRefresh:', forceRefresh);

  // Return cached data if available and not forcing refresh
  if (!forceRefresh && imdDataCache && new Date(imdDataCache.expiresAt).getTime() > Date.now()) {
    console.log('Using cached IMD data from', new Date(imdDataCache.timestamp).toLocaleString());
    floodData = mapIMDRegionDataToFloodData(imdDataCache.data);
    return floodData;
  }

  try {
    console.log('Attempting to fetch fresh IMD data from live API...');

    // Attempt to fetch from the live API
    const liveImdData = await imdApiService.fetchFloodData();

    if (liveImdData && liveImdData.length > 0) {
      const now = new Date();
      const newCache: CachedIMDData = {
        data: liveImdData,
        timestamp: now.toISOString(),
        expiresAt: new Date(now.getTime() + CACHE_VALIDITY_DURATION).toISOString()
      };

      imdDataCache = newCache;
      try {
        localStorage.setItem(IMD_CACHE_KEY, JSON.stringify(newCache));
      } catch (storageError) {
        console.warn('Failed to store IMD data in localStorage:', storageError);
      }

      console.log('Fresh IMD data fetched from live API and cached at', now.toLocaleString());
      floodData = mapIMDRegionDataToFloodData(liveImdData);
      return floodData;
    } else {
      console.warn('Live API returned no data. Falling back to static data.');
      // Fallback to static data only for regions with no live data
      const staticFallbackData = regions.map(r => {
        const currentYear = new Date().getFullYear();
        const historicalForRegion = staticHistoricalRainfallData[r.value.toLowerCase()];

        let currentRainfallValue = 5; // Fixed minimum as specified
        if (historicalForRegion && historicalForRegion.length > 0) {
          const currentYearStatic = historicalForRegion.filter(d => d.year === currentYear);
          if (currentYearStatic.length > 0) {
            currentRainfallValue = Math.max(5, currentYearStatic.reduce((sum, item) => sum + item.rainfall, 0) / currentYearStatic.length);
          } else {
            currentRainfallValue = Math.max(5, historicalForRegion.reduce((sum, item) => sum + item.rainfall, 0) / historicalForRegion.length);
          }
        }

        const coordinates: [number, number] = [r.coordinates[0], r.coordinates[1]];

        return {
          id: regions.indexOf(r) + 1,
          region: r.label,
          state: r.state,
          riskLevel: 'low' as const,
          affectedArea: 0, // No dummy data
          populationAffected: 0, // No dummy data
          coordinates,
          timestamp: new Date().toISOString(),
          currentRainfall: currentRainfallValue,
          historicalRainfallData: [],
          predictionAccuracy: 70,
        };
      });
      floodData = staticFallbackData;
      return floodData;
    }

  } catch (error) {
    console.error('Error fetching IMD data from live API, falling back to static:', error);

    // If fetch fails but we have cached data, use it even if expired
    if (imdDataCache) {
      console.log('Using expired cached data due to fetch failure');
      floodData = mapIMDRegionDataToFloodData(imdDataCache.data);
      return floodData;
    }

    // Return static data if no cached data available
    console.log('No cached data, returning static data.');
    const staticFallbackData = regions.map(r => {
      const coordinates: [number, number] = [r.coordinates[0], r.coordinates[1]];
      return {
        id: regions.indexOf(r) + 1,
        region: r.label,
        state: r.state,
        riskLevel: 'low' as const,
        affectedArea: 0,
        populationAffected: 0,
        coordinates,
        timestamp: new Date().toISOString(),
        currentRainfall: 5, // Fixed minimum
        historicalRainfallData: [],
        predictionAccuracy: 70,
      };
    });
    floodData = staticFallbackData;
    return floodData;
  }
};

// Improved function to get region data with consistency
export const getFloodDataForRegion = (region: string): FloodData | null => {
  const regionLower = region.toLowerCase();
  const matchingRegion = floodData.find(data =>
    data.region.toLowerCase() === regionLower
  );

  if (matchingRegion) {
    return matchingRegion;
  }

  // If no match is found, return Mumbai as default from the current floodData
  return floodData[0] || null;
};

// historicalRainfallData (Strictly Static)
export const getHistoricalRainfallData = (region: string, year: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Base rainfall patterns for different regions (in mm)
  const rainfallPatterns: Record<string, number[]> = {
    'mumbai': [5, 3, 8, 15, 60, 520, 850, 650, 320, 100, 30, 10],
    'delhi': [10, 15, 20, 10, 30, 170, 290, 230, 115, 18, 5, 4],
    'kolkata': [12, 18, 28, 45, 150, 390, 490, 435, 280, 100, 18, 10],
    'chennai': [22, 12, 7, 18, 35, 55, 75, 95, 115, 295, 375, 195],
    'bangalore': [5, 8, 15, 40, 110, 85, 95, 120, 150, 180, 65, 20],
    'hyderabad': [8, 12, 18, 25, 45, 120, 165, 140, 120, 85, 25, 10],
    'ahmedabad': [2, 3, 5, 8, 15, 120, 220, 180, 85, 25, 5, 2],
    'pune': [3, 5, 8, 12, 35, 150, 210, 180, 120, 55, 15, 5],
    'surat': [3, 4, 6, 10, 18, 140, 250, 200, 95, 30, 8, 3],
    'jaipur': [5, 8, 12, 8, 20, 85, 180, 150, 75, 15, 5, 3],
    'lucknow': [15, 18, 22, 12, 25, 95, 220, 200, 110, 20, 8, 6],
    'kanpur': [12, 15, 18, 10, 22, 90, 210, 190, 105, 18, 6, 5],
    'nagpur': [8, 10, 15, 18, 35, 180, 280, 220, 140, 60, 15, 8],
    'patna': [10, 15, 20, 15, 30, 120, 280, 250, 150, 45, 10, 6],
    'indore': [6, 8, 12, 15, 25, 160, 320, 280, 180, 55, 12, 6],
    'kochi': [25, 20, 35, 120, 280, 650, 600, 400, 250, 320, 180, 65],
    'guwahati': [18, 25, 45, 120, 280, 420, 380, 320, 220, 95, 35, 20],
    'agra': [12, 15, 18, 10, 22, 85, 200, 180, 100, 16, 6, 4],
    'allahabad': [14, 16, 20, 12, 25, 95, 230, 210, 120, 22, 8, 6],
    'ranchi': [15, 20, 25, 20, 40, 150, 300, 280, 180, 70, 18, 10],
    'bhopal': [8, 10, 15, 18, 30, 140, 300, 260, 160, 50, 12, 7],
    'visakhapatnam': [12, 8, 15, 25, 45, 95, 120, 140, 180, 220, 150, 45],
    'vadodara': [3, 4, 6, 8, 16, 130, 240, 190, 90, 28, 6, 3],
    'varanasi': [16, 18, 22, 14, 28, 100, 240, 220, 130, 25, 10, 8],
    'amritsar': [25, 30, 35, 20, 25, 45, 180, 150, 75, 15, 8, 15],
    'nashik': [5, 8, 12, 15, 40, 180, 250, 200, 130, 65, 18, 8],
    'aurangabad': [6, 9, 14, 18, 45, 170, 240, 190, 125, 60, 16, 7]
  };

  const regionPattern = rainfallPatterns[region.toLowerCase()] || rainfallPatterns['mumbai'];
  
  return months.map((month, index) => {
    // Add some year-to-year variation (±20%)
    const baseRainfall = regionPattern[index];
    const variation = (Math.sin(year * 0.1 + index) * 0.2 + Math.random() * 0.2 - 0.1);
    const rainfall = Math.max(0, baseRainfall * (1 + variation));
    
    return {
      month,
      rainfall: Math.round(rainfall * 10) / 10, // Round to 1 decimal
      year
    };
  });
};

export const getPredictionData = (region: string) => {
  // Return 10-day flood prediction data
  const regionData = getFloodDataForRegion(region);
  const riskLevelBase = {
    'low': 20,
    'medium': 35,
    'high': 50,
    'severe': 70
  };

  // Base prediction value influenced by derived currentRainfall (no randomness)
  let baseValue = riskLevelBase[regionData?.riskLevel || 'medium'];

  if (regionData && regionData.currentRainfall) {
    // For every 100mm of current rainfall above 50mm threshold, increase baseValue by 5
    const rainfallEffect = Math.max(0, Math.floor((regionData.currentRainfall - 50) / 100) * 5);
    baseValue += rainfallEffect;
  }
  // Cap baseValue to reasonable max
  baseValue = Math.min(80, baseValue);

  // Generate 10 days of prediction data with deterministic trends (no randomness)
  return Array.from({ length: 10 }, (_, i) => {
    let trendFactor = 1;

    // Create deterministic trend based on day
    if (i < 3) {
      // First 3 days - increasing trend
      trendFactor = 1 + (i * 0.05);
    } else if (i >= 3 && i < 6) {
      // Middle days - peak then descent
      trendFactor = 1.15 - ((i - 3) * 0.03);
    } else {
      // Last days - decreasing trend
      trendFactor = 1.05 - ((i - 6) * 0.05);
    }

    // Calculate probability with deterministic variation, clamped to 5-95 range
    const probability = Math.min(95, Math.max(5, baseValue * trendFactor));

    return {
      day: i + 1,
      probability: Number(probability.toFixed(1))
    };
  });
};
