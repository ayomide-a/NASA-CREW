const moonRadius = 1_737_400;
const analysis = {
  profileCount: 12,
  samplesPerProfile: 48,
  profileRangeMeters: 12_000,
  concurrency: 4
};
const requestTimeoutMs = 30_000;
const retryCount = 2;
const responseCache = new Map();
const responseCacheTtlMs = 30 * 60_000;
const lolaSpotCollectionId = 'lunar_orbiter_laser_altimeter';
const lolaSpotApiRoot = 'https://g6goyz4w56.execute-api.us-west-2.amazonaws.com/prod';
const lolaSpotMaxPoints = 450;
const globalDem = {
  id: 'global',
  title: 'LOLA DEM Global 256 ppd',
  projection: 'EPSG:104903',
  spatialReference: '104903',
  service: 'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_DEM_Global_256ppd_v06/ImageServer'
};
const northPolarDem = {
  id: 'north-pole',
  title: 'LOLA DEM North Pole 45 100 m/px',
  projection: 'EPSG:30118',
  spatialReference: '30118',
  service: 'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_DEM_NPole45_100mp_v04/ImageServer'
};
const southPolarDem = {
  id: 'south-pole',
  title: 'LOLA DEM South Pole 45 100 m/px',
  projection: 'EPSG:30120',
  spatialReference: '30120',
  service: 'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_DEM_SPole45_100mp_v04/ImageServer'
};

function number(params, key) {
  const value = params.get(key)?.trim();
  return value ? Number(value) : NaN;
}

function normalizeEastLongitude(longitude) {
  return ((longitude % 360) + 360) % 360;
}

function mapLongitude(eastLongitude) {
  return eastLongitude > 180 ? eastLongitude - 360 : eastLongitude;
}

function sampleCoordinate(latitude, longitude, dataset) {
  if (dataset.id === 'global') {
    return { x: longitude, y: latitude, sr: '104903' };
  }
  const [x, y] = geographicToPolar(latitude, longitude, dataset.id === 'north-pole' ? 'north' : 'south');
  return { x, y, sr: dataset.spatialReference };
}

function destination(latitude, longitude, azimuth, distance) {
  const angular = distance / moonRadius;
  const lat = latitude * Math.PI / 180;
  const lon = longitude * Math.PI / 180;
  const bearing = azimuth * Math.PI / 180;
  const targetLat = Math.asin(Math.sin(lat) * Math.cos(angular) +
    Math.cos(lat) * Math.sin(angular) * Math.cos(bearing));
  const targetLon = lon + Math.atan2(Math.sin(bearing) * Math.sin(angular) * Math.cos(lat),
    Math.cos(angular) - Math.sin(lat) * Math.sin(targetLat));
  return [targetLon * 180 / Math.PI, targetLat * 180 / Math.PI];
}

function geographicToPolar(latitude, longitude, hemisphere) {
  const latitudeRadians = latitude * Math.PI / 180;
  const longitudeRadians = longitude * Math.PI / 180;
  const angularDistance = hemisphere === 'north'
    ? Math.PI / 2 - latitudeRadians
    : Math.PI / 2 + latitudeRadians;
  const radius = 2 * moonRadius * Math.tan(angularDistance / 2);
  return [
    radius * Math.sin(longitudeRadians),
    (hemisphere === 'north' ? -1 : 1) * radius * Math.cos(longitudeRadians)
  ];
}

function selectDataset(latitude) {
  if (latitude >= 60) return northPolarDem;
  if (latitude <= -60) return southPolarDem;
  return globalDem;
}

function buildBbox(latitude, longitude, dataset) {
  if (dataset.id === 'global') {
    const halfSpan = 0.75;
    const minX = Math.max(-180, longitude - halfSpan);
    const maxX = Math.min(180, longitude + halfSpan);
    const minY = Math.max(-90, latitude - halfSpan);
    const maxY = Math.min(90, latitude + halfSpan);
    return [minX, minY, maxX, maxY];
  }
  const [x, y] = geographicToPolar(latitude, longitude, dataset.id === 'north-pole' ? 'north' : 'south');
  const halfSpan = 40_000;
  return [x - halfSpan, y - halfSpan, x + halfSpan, y + halfSpan];
}

function previewUrl(dataset, bbox) {
  const query = new URLSearchParams({
    bbox: bbox.join(','),
    bboxSR: dataset.spatialReference,
    imageSR: dataset.spatialReference,
    size: '512,512',
    format: 'jpgpng',
    interpolation: 'RSP_BilinearInterpolation',
    f: 'image'
  });
  return dataset.service + '/exportImage?' + query;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function encodeSvgDataUrl(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function pickSpotValue(properties = {}) {
  const candidates = [
    properties.radius,
    properties.radius_km,
    properties.radiusKm,
    properties.elevation,
    properties.elevation_m,
    properties.value
  ];
  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric)) return numeric;
  }
  return NaN;
}

function buildSpotPreview(points, bbox) {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const width = 512;
  const height = 512;
  const lonSpan = Math.max(1e-6, maxLon - minLon);
  const latSpan = Math.max(1e-6, maxLat - minLat);

  const values = points.map(point => point.value).filter(Number.isFinite);
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 1;
  const valueSpan = Math.max(1e-9, maxValue - minValue);

  const circles = points.map(point => {
    const x = ((point.longitude - minLon) / lonSpan) * width;
    const y = height - ((point.latitude - minLat) / latSpan) * height;
    const normalized = Number.isFinite(point.value) ? (point.value - minValue) / valueSpan : 0.5;
    const hue = 210 - normalized * 180;
    return '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="1.85" fill="hsl(' +
      hue.toFixed(1) + ',85%,62%)" fill-opacity="0.82" />';
  }).join('');

  const label = points.length + ' spots';
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">' +
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e1114"/>' +
    '<stop offset="1" stop-color="#151b21"/></linearGradient></defs>' +
    '<rect width="512" height="512" fill="url(#bg)"/>' + circles +
    '<rect x="0.5" y="0.5" width="511" height="511" fill="none" stroke="#3b444f"/>' +
    '<text x="10" y="500" fill="#d0d6de" font-family="monospace" font-size="13">' + label + '</text>' +
    '</svg>';

  return encodeSvgDataUrl(svg);
}

async function fetchSpotObservations(latitude, longitude) {
  const halfSpan = 0.18;
  const bbox = [
    clamp(longitude - halfSpan, -180, 180),
    clamp(latitude - halfSpan, -90, 90),
    clamp(longitude + halfSpan, -180, 180),
    clamp(latitude + halfSpan, -90, 90)
  ];

  const query = new URLSearchParams({
    bbox: bbox.join(','),
    limit: String(lolaSpotMaxPoints)
  });
  const url = lolaSpotApiRoot + '/collections/' + lolaSpotCollectionId + '/items?' + query;
  const payload = await fetchJsonWithRetry(url, 'LOLA spot STAC query');
  const features = Array.isArray(payload?.features) ? payload.features : [];

  const points = features
    .map(feature => {
      const coordinates = feature?.geometry?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 2) return undefined;
      const longitudeValue = Number(coordinates[0]);
      const latitudeValue = Number(coordinates[1]);
      if (!Number.isFinite(longitudeValue) || !Number.isFinite(latitudeValue)) return undefined;
      return {
        longitude: longitudeValue,
        latitude: latitudeValue,
        value: pickSpotValue(feature?.properties)
      };
    })
    .filter(Boolean);

  if (!points.length) {
    return {
      collectionId: lolaSpotCollectionId,
      title: 'LOLA Shot Observations',
      count: 0,
      bbox,
      previewDataUrl: undefined,
      source: 'USGS Astrogeology STAC'
    };
  }

  return {
    collectionId: lolaSpotCollectionId,
    title: 'LOLA Shot Observations',
    count: points.length,
    bbox,
    previewDataUrl: buildSpotPreview(points, bbox),
    source: 'USGS Astrogeology STAC'
  };
}

async function fetchJsonWithRetry(url, errorLabel) {
  let lastError;
  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(requestTimeoutMs),
        headers: { 'User-Agent': 'Moonwalkers9/1.0 (https://moonwalkers9.vercel.app)' }
      });
      if (!response.ok) throw new Error(errorLabel + ' returned HTTP ' + response.status);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < retryCount) await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function sampleElevation(latitude, longitude, dataset) {
  const coordinate = sampleCoordinate(latitude, longitude, dataset);
  const query = new URLSearchParams({
    geometry: JSON.stringify({ x: coordinate.x, y: coordinate.y, spatialReference: { wkid: Number(coordinate.sr) } }),
    geometryType: 'esriGeometryPoint',
    sampleDistance: '0',
    sampleCount: '1',
    interpolation: 'RSP_BilinearInterpolation',
    returnFirstValueOnly: 'true',
    returnGeometry: 'false',
    sr: coordinate.sr,
    f: 'json'
  });
  const payload = await fetchJsonWithRetry(dataset.service + '/getSamples?' + query, 'LOLA getSamples');
  const elevation = Number(payload?.samples?.[0]?.value);
  if (!Number.isFinite(elevation)) throw new Error('LOLA elevation sample is unavailable.');
  return elevation;
}

async function sampleElevationWithFallback(latitude, longitude, dataset) {
  try {
    return await sampleElevation(latitude, longitude, dataset);
  } catch (error) {
    if (dataset.id === globalDem.id) throw error;
    return sampleElevation(latitude, longitude, globalDem);
  }
}

function profileUrl(latitude, longitude, azimuth, service) {
  const endPoint = destination(latitude, longitude, azimuth, analysis.profileRangeMeters);
  const from = sampleCoordinate(latitude, longitude, service.dataset);
  const to = sampleCoordinate(endPoint[1], endPoint[0], service.dataset);
  const query = new URLSearchParams({
    geometry: JSON.stringify({ paths: [[[from.x, from.y], [to.x, to.y]]] }),
    geometryType: 'esriGeometryPolyline',
    sr: from.sr,
    returnFirstValueOnly: 'true',
    returnGeometry: 'false',
    sampleCount: String(analysis.samplesPerProfile),
    interpolation: 'RSP_BilinearInterpolation',
    f: 'json'
  });
  return service.url + '/getSamples?' + query;
}

async function fetchProfile(latitude, longitude, azimuth, service) {
  const payload = await fetchJsonWithRetry(profileUrl(latitude, longitude, azimuth, service), 'LOLA profile request');
  const elevations = (payload.samples ?? []).map(sample => Number(sample.value)).filter(Number.isFinite);
  if (elevations.length < 3) throw new Error('LOLA profile request returned insufficient samples.');
  return { azimuth, elevations };
}

async function fetchProfileWithFallback(latitude, longitude, azimuth, dataset) {
  return fetchProfile(latitude, longitude, azimuth, { url: dataset.service, dataset });
}

async function collectProfiles(latitude, longitude, dataset) {
  const profiles = [];
  for (let start = 0; start < analysis.profileCount; start += analysis.concurrency) {
    const tasks = [];
    for (let index = start; index < Math.min(start + analysis.concurrency, analysis.profileCount); index += 1) {
      tasks.push(fetchProfileWithFallback(latitude, longitude, index * 360 / analysis.profileCount, dataset));
    }
    profiles.push(...await Promise.all(tasks));
  }
  return profiles;
}

function summarize(values) {
  const sorted = [...values].sort((first, second) => first - second);
  const minMeters = sorted[0];
  const maxMeters = sorted[sorted.length - 1];
  const meanMeters = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const medianMeters = sorted.length % 2
    ? sorted[(sorted.length - 1) / 2]
    : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const stdDevMeters = Math.sqrt(sorted.reduce((sum, value) => sum + (value - meanMeters) ** 2, 0) / sorted.length);
  return {
    minMeters,
    maxMeters,
    rangeMeters: maxMeters - minMeters,
    meanMeters,
    medianMeters,
    stdDevMeters
  };
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values) {
  const average = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length);
}

function meanCircular(angles) {
  if (!angles.length) return NaN;
  let x = 0;
  let y = 0;
  for (const angle of angles) {
    const radians = angle * Math.PI / 180;
    x += Math.cos(radians);
    y += Math.sin(radians);
  }
  const normalized = Math.atan2(y / angles.length, x / angles.length) * 180 / Math.PI;
  return (normalized + 360) % 360;
}

function movingWindowStd(values, windowSize = 5) {
  if (values.length < windowSize) return NaN;
  const half = Math.floor(windowSize / 2);
  const deviations = [];
  for (let index = 0; index < values.length; index += 1) {
    const window = [];
    for (let offset = -half; offset <= half; offset += 1) {
      const wrapped = (index + offset + values.length) % values.length;
      window.push(values[wrapped]);
    }
    deviations.push(standardDeviation(window));
  }
  return mean(deviations);
}

function slopeExceedanceFractions(slopes) {
  const thresholds = [5, 10, 15, 20];
  const fractions = {};
  for (const threshold of thresholds) {
    fractions['over' + threshold + 'Deg'] = slopes.filter(value => value > threshold).length / slopes.length;
  }
  return fractions;
}

function deriveTopography(centerElevation, profiles) {
  const allElevations = [];
  const firstRing = [];
  const secondRing = [];
  const slopeDegrees = [];
  const slopePercents = [];
  const slopeAzimuths = [];
  const profileCurvatures = [];
  const horizonByAzimuth = [];
  const neighborDistance = analysis.profileRangeMeters / (analysis.samplesPerProfile - 1);
  for (const profile of profiles) {
    allElevations.push(...profile.elevations);
    const center = profile.elevations[0];
    const neighbor = profile.elevations[1];
    const next = profile.elevations[2];
    if (!Number.isFinite(center) || !Number.isFinite(neighbor)) continue;
    firstRing.push(neighbor);
    slopeAzimuths.push(profile.azimuth);
    const slope = Math.atan2(Math.abs(neighbor - centerElevation), neighborDistance) * 180 / Math.PI;
    slopeDegrees.push(slope);
    slopePercents.push(Math.tan(slope * Math.PI / 180) * 100);
    if (Number.isFinite(next)) {
      secondRing.push(next);
      profileCurvatures.push((next - 2 * neighbor + center) / (neighborDistance ** 2));
    }
    let horizonElevation = -90;
    for (let sample = 1; sample < profile.elevations.length; sample += 1) {
      const value = profile.elevations[sample];
      if (!Number.isFinite(value)) continue;
      const distance = neighborDistance * sample;
      horizonElevation = Math.max(horizonElevation, Math.atan2(value - center, distance) * 180 / Math.PI);
    }
    horizonByAzimuth.push({ azimuth: profile.azimuth, horizonElevation });
  }
  if (!allElevations.length || !firstRing.length || !slopeDegrees.length || !secondRing.length) {
    throw new Error('Could not derive topography statistics from sampled LOLA profiles.');
  }
  const roughnessRmsMeters = Math.sqrt(firstRing.reduce((sum, value) => sum + (value - centerElevation) ** 2, 0) / firstRing.length);
  const triMeters = firstRing.reduce((sum, value) => sum + Math.abs(value - centerElevation), 0) / firstRing.length;
  const slopeMeanDeg = mean(slopeDegrees);
  const slopeMaxDeg = Math.max(...slopeDegrees);
  const slopeMeanPercent = mean(slopePercents);
  const slopeMaxPercent = Math.max(...slopePercents);

  let gradientX = 0;
  let gradientY = 0;
  let gradientWeight = 0;
  for (let index = 0; index < firstRing.length; index += 1) {
    const delta = firstRing[index] - centerElevation;
    const radians = slopeAzimuths[index] * Math.PI / 180;
    gradientX += delta * Math.cos(radians);
    gradientY += delta * Math.sin(radians);
    gradientWeight += Math.abs(delta);
  }
  const upslopeAzimuthDeg = (Math.atan2(gradientY, gradientX) * 180 / Math.PI + 360) % 360;
  const downslopeAzimuthDeg = (upslopeAzimuthDeg + 180) % 360;
  const confidence = gradientWeight > 0 ? Math.hypot(gradientX, gradientY) / gradientWeight : 0;

  const arcStep = 2 * Math.PI * neighborDistance / firstRing.length;
  const planCurvatures = firstRing.map((value, index) => {
    const previous = firstRing[(index - 1 + firstRing.length) % firstRing.length];
    const next = firstRing[(index + 1) % firstRing.length];
    return (next - 2 * value + previous) / (arcStep ** 2);
  });
  const profileMeanPerMeter = mean(profileCurvatures);
  const planMeanPerMeter = mean(planCurvatures);
  const totalPerMeter = Math.sqrt(profileMeanPerMeter ** 2 + planMeanPerMeter ** 2);

  const openSkyFraction = horizonByAzimuth.filter(item => item.horizonElevation <= 0).length / horizonByAzimuth.length;
  const slopeFractions = slopeExceedanceFractions(slopeDegrees);

  return {
    elevation: summarize(allElevations),
    local: {
      slopeMeanDeg,
      slopeMaxDeg,
      slopeMeanPercent,
      slopeMaxPercent,
      roughnessRmsMeters,
      triMeters
    },
    aspect: {
      downslopeAzimuthDeg,
      upslopeAzimuthDeg,
      confidence
    },
    roughness: {
      rmsMeters: roughnessRmsMeters,
      triMeters,
      movingWindowStdDevMeters: movingWindowStd(firstRing)
    },
    curvature: {
      profileMeanPerMeter,
      planMeanPerMeter,
      totalPerMeter
    },
    hazard: {
      localReliefMeters: Math.max(...allElevations) - Math.min(...allElevations),
      slopeExceedanceFractions: slopeFractions,
      horizonExposure: {
        openSkyFraction,
        shadowedFraction: 1 - openSkyFraction,
        maxHorizonElevationDeg: Math.max(...horizonByAzimuth.map(item => item.horizonElevation)),
        meanHorizonElevationDeg: mean(horizonByAzimuth.map(item => item.horizonElevation)),
        dominantShadowAzimuthDeg: meanCircular(horizonByAzimuth
          .filter(item => item.horizonElevation > 0)
          .map(item => item.azimuth))
      }
    },
    directionalProfiles: {
      horizons: horizonByAzimuth
    },
    sampling: {
      profileCount: analysis.profileCount,
      samplesPerProfile: analysis.samplesPerProfile,
      profileRangeMeters: analysis.profileRangeMeters,
      neighborDistanceMeters: neighborDistance
    }
  };
}

export default {
  async fetch(request) {
    if (request.method !== 'GET') {
      return Response.json({ error: 'Send a GET request.' }, { status: 405, headers: { Allow: 'GET' } });
    }
    const params = new URL(request.url).searchParams;
    const latitude = number(params, 'latitude');
    const longitude = number(params, 'longitude');
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return Response.json({ error: 'Latitude must be between -90 and 90.' }, { status: 400 });
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 360) {
      return Response.json({ error: 'Longitude must be between -180 and 360 east.' }, { status: 400 });
    }

    const eastLongitude = normalizeEastLongitude(longitude);
    const normalizedLongitude = mapLongitude(eastLongitude);
    const dataset = selectDataset(latitude);
    const bbox = buildBbox(latitude, normalizedLongitude, dataset);
    const cacheKey = [dataset.id, latitude.toFixed(4), normalizedLongitude.toFixed(4)].join('|');
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.savedAt < responseCacheTtlMs) {
      return Response.json(cached.payload, { headers: { 'Cache-Control': 'public, max-age=120, s-maxage=600' } });
    }

    try {
      const elevationMeters = await sampleElevationWithFallback(latitude, normalizedLongitude, dataset);
      let topography;
      let topographyError;
      try {
        const profiles = await collectProfiles(latitude, normalizedLongitude, dataset);
        topography = deriveTopography(elevationMeters, profiles);
      } catch (error) {
        topographyError = error.message;
      }

      let spotObservations;
      try {
        spotObservations = await fetchSpotObservations(latitude, normalizedLongitude);
      } catch {
        spotObservations = {
          collectionId: lolaSpotCollectionId,
          title: 'LOLA Shot Observations',
          count: 0,
          source: 'USGS Astrogeology STAC'
        };
      }

      const payload = {
        schemaVersion: '2.0.0',
        dataset: {
          id: dataset.id,
          title: dataset.title,
          projection: dataset.projection,
          service: dataset.service
        },
        site: {
          latitude,
          longitudeEast: eastLongitude,
          longitudeMap: normalizedLongitude
        },
        tile: {
          bbox,
          bboxSR: dataset.spatialReference,
          imageSR: dataset.spatialReference,
          size: [512, 512],
          previewUrl: previewUrl(dataset, bbox)
        },
        references: {
          activeDem: {
            id: dataset.id,
            title: dataset.title,
            service: dataset.service
          }
        },
        elevationMeters,
        topography,
        topographyError,
        spotObservations,
        source: 'NASA Moon Trek LOLA DEM ImageServer'
      };
      responseCache.set(cacheKey, { payload, savedAt: Date.now() });
      return Response.json(payload, { headers: { 'Cache-Control': 'public, max-age=120, s-maxage=600' } });
    } catch (error) {
      if (cached) {
        const stalePayload = {
          ...cached.payload,
          topographyError: 'Using cached data due to temporary LOLA service issue: ' + error.message
        };
        return Response.json(stalePayload, { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' } });
      }
      return Response.json({ error: 'LOLA DEM request failed: ' + error.message }, { status: 502 });
    }
  }
};