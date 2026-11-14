const endpoint = 'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_DEM_Global_256ppd_v06/ImageServer/getSamples';
const moonRadius = 1_737_400;
const maxProfiles = 120;

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
  const path = [[longitude, latitude], destination(latitude, longitude, azimuth, 100_000)];
  const query = new URLSearchParams({
    geometry: JSON.stringify({ paths: [path] }),
    geometryType: 'esriGeometryPolyline',
    sr: '104903',
    returnFirstValueOnly: 'true',
    returnGeometry: 'false',
    sampleCount: '100',
    interpolation: 'RSP_BilinearInterpolation',
    f: 'json'
  });
  return endpoint + '?' + query;
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function profile(latitude, longitude, azimuth, observerHeight) {
  let payload;
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(terrainUrl(latitude, longitude, azimuth), {
        signal: AbortSignal.timeout(30_000),
        headers: { 'User-Agent': 'Moonwalkers9/1.0 (https://moonwalkers9.vercel.app)' }
      });
      if (!response.ok) throw new Error('Moon Trek DEM returned HTTP ' + response.status);
      payload = await response.json();
      break;
    } catch (error) {
      lastError = error.name === 'TimeoutError' ? new Error('Moon Trek DEM request timed out.') : error;
      if (attempt === 0) await delay(250);
    }
  }
  if (!payload) throw lastError;
  if (!Array.isArray(payload.samples) || payload.samples.length < 2) {
    throw new Error('Moon Trek returned no terrain samples.');
  }
  const ground = Number(payload.samples[0].value);
  let horizon = -90;
  for (let index = 1; index < payload.samples.length; index += 1) {
    const distance = 100_000 * index / (payload.samples.length - 1);
    const elevation = Number(payload.samples[index].value);
    if (!Number.isFinite(distance) || !Number.isFinite(elevation) || !Number.isFinite(ground)) continue;
    horizon = Math.max(horizon, Math.atan2(elevation - ground - observerHeight, distance) * 180 / Math.PI);
  }
  return { horizonElevation: horizon };
}

export default {
  async fetch(request) {
    if (request.method !== 'GET') return Response.json({ error: 'Send a GET request.' }, { status: 405 });
    const params = new URL(request.url).searchParams;
    const latitude = number(params, 'latitude');
    const longitude = number(params, 'longitude');
    const altitude = number(params, 'altitude');
    let rows;
    try { rows = JSON.parse(params.get('rows') || '[]'); } catch { rows = []; }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(altitude) ||
      !Array.isArray(rows) || rows.length === 0 || rows.length * 2 > maxProfiles) {
      return Response.json({ error: 'Terrain requests need a valid site and no more than 60 time samples.' }, { status: 400 });
    }
    try {
      const profiles = await Promise.all(rows.flatMap(row => [
        profile(latitude, longitude, Number(row.sun.azimuth), altitude * 1000),
        profile(latitude, longitude, Number(row.earth.azimuth), altitude * 1000)
      ]));
      const results = rows.map((row, index) => {
        const sun = profiles[index * 2];
        const earth = profiles[index * 2 + 1];
        return {
          time: row.time,
          sun: { ...sun, obstructed: Number(row.sun.elevation) >= 0 && Number(row.sun.elevation) <= sun.horizonElevation },
          earth: { ...earth, obstructed: Number(row.earth.elevation) >= 0 && Number(row.earth.elevation) <= earth.horizonElevation }
        };
      });
      return Response.json({ results, source: 'NASA Moon Trek LOLA DEM samples' });
    } catch (error) {
      return Response.json({ error: 'NASA Moon Trek terrain data is unavailable: ' + error.message }, { status: 502 });
    }
  }
};
