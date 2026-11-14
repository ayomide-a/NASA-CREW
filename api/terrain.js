const endpoint = 'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_DEM_Global_256ppd_v06/ImageServer/getSamples';
const moonRadius = 1_737_400;
const directionCount = 72;
const samplesPerDirection = 100;
const rangeMeters = 100_000;
const concurrency = 6;

function number(params, key) {
  const value = params.get(key)?.trim();
  return value ? Number(value) : NaN;
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

function terrainUrl(latitude, longitude, azimuth) {
  const query = new URLSearchParams({
    geometry: JSON.stringify({ paths: [[[longitude, latitude], destination(latitude, longitude, azimuth, rangeMeters)]] }),
    geometryType: 'esriGeometryPolyline',
    sr: '104903',
    returnFirstValueOnly: 'true',
    returnGeometry: 'false',
    sampleCount: String(samplesPerDirection),
    interpolation: 'RSP_BilinearInterpolation',
    f: 'json'
  });
  return endpoint + '?' + query;
}

async function profile(latitude, longitude, azimuth, observerHeight) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(terrainUrl(latitude, longitude, azimuth), {
        signal: AbortSignal.timeout(30_000),
        headers: { 'User-Agent': 'Moonwalkers9/1.0 (https://moonwalkers9.vercel.app)' }
      });
      if (!response.ok) throw new Error('Moon Trek DEM returned HTTP ' + response.status);
      const payload = await response.json();
      if (!Array.isArray(payload.samples) || payload.samples.length < 2) {
        throw new Error('Moon Trek returned no terrain samples.');
      }
      const ground = Number(payload.samples[0].value);
      let horizon = -90;
      for (let sample = 1; sample < payload.samples.length; sample += 1) {
        const elevation = Number(payload.samples[sample].value);
        if (!Number.isFinite(ground) || !Number.isFinite(elevation)) continue;
        const distance = rangeMeters * sample / (payload.samples.length - 1);
        horizon = Math.max(horizon, Math.atan2(elevation - ground - observerHeight, distance) * 180 / Math.PI);
      }
      return { azimuth, horizonElevation: horizon };
    } catch (error) {
      lastError = error.name === 'TimeoutError' ? new Error('Moon Trek DEM request timed out.') : error;
      if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
  throw lastError;
}

async function profileAll(latitude, longitude, altitude) {
  const profiles = [];
  for (let start = 0; start < directionCount; start += concurrency) {
    const batch = [];
    for (let direction = start; direction < Math.min(start + concurrency, directionCount); direction += 1) {
      batch.push(profile(latitude, longitude, direction * 360 / directionCount, altitude * 1000));
    }
    profiles.push(...await Promise.all(batch));
  }
  return profiles;
}

export default {
  async fetch(request) {
    if (request.method !== 'GET') return Response.json({ error: 'Send a GET request.' }, { status: 405 });
    const params = new URL(request.url).searchParams;
    const latitude = number(params, 'latitude');
    const longitude = number(params, 'longitude');
    const altitude = number(params, 'altitude');
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(altitude)) {
      return Response.json({ error: 'Terrain requests need a valid site.' }, { status: 400 });
    }
    try {
      return Response.json({ horizons: await profileAll(latitude, longitude, altitude), source: 'NASA Moon Trek LOLA DEM samples' });
    } catch (error) {
      return Response.json({ error: 'NASA Moon Trek terrain data is unavailable: ' + error.message }, { status: 502 });
    }
  }
};
