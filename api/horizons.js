const endpoint = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const minutes = { min: 1, h: 60, d: 1440 };
const targets = { sun: '10', earth: '399' };
let pending;
const cache = new Map();

function dateInUtc(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value ?? '')) return NaN;
  const time = Date.parse(value + ':00Z');
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 16) === value ? time : NaN;
}

function number(params, key) {
  const value = params.get(key)?.trim();
  return value ? Number(value) : NaN;
}

function buildQuery(params) {
  const target = params.get('target');
  const start = params.get('start');
  const stop = params.get('stop');
  const from = dateInUtc(start);
  const to = dateInUtc(stop);
  const step = number(params, 'step');
  const unit = params.get('unit');
  const latitude = number(params, 'latitude');
  const longitude = number(params, 'longitude');
  const altitude = number(params, 'altitude');
  if (!Object.hasOwn(targets, target)) throw new Error('Choose Sun or Earth.');
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) {
    throw new Error('Enter UTC times with the stop time later than the start time.');
  }
  if (!Object.hasOwn(minutes, unit) || !Number.isSafeInteger(step) || step < 1) {
    throw new Error('Enter a whole-number step size of at least one.');
  }
  const count = Math.floor((to - from) / (step * minutes[unit] * 60_000)) + 1;
  if (count > 5000) throw new Error('Use a larger step or shorter time range to request at most 5,000 rows.');
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error('Latitude must be between −90° and 90°.');
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 360) {
    throw new Error('Longitude must be between −180° and 360°.');
  }
  if (!Number.isFinite(altitude)) throw new Error('Enter an altitude in kilometers.');
  const east = ((longitude % 360) + 360) % 360;
  return new URLSearchParams({
    format: 'json', COMMAND: targets[target], EPHEM_TYPE: 'OBSERVER',
    CENTER: 'coord@301', COORD_TYPE: 'GEODETIC',
    SITE_COORD: "'" + [east, latitude, altitude].join(',') + "'",
    START_TIME: "'" + start.replace('T', ' ') + "'",
    STOP_TIME: "'" + stop.replace('T', ' ') + "'",
    STEP_SIZE: "'" + step + ' ' + unit + "'",
    QUANTITIES: '4', CSV_FORMAT: 'YES', APPARENT: 'AIRLESS', TIME_TYPE: 'UT', OBJ_DATA: 'NO'
  }).toString();
}

async function queryHorizons(query) {
  const response = await fetch(endpoint + '?' + query, {
    signal: AbortSignal.timeout(15_000),
    headers: { 'User-Agent': 'Moonwalkers9/1.0 (https://moonwalkers9.vercel.app)' }
  });
  if (!response.ok) return { status: 502, error: 'JPL Horizons is temporarily unavailable. Try again in a moment.' };
  const payload = await response.json();
  if (payload.error) return { status: 422, error: String(payload.error).trim().slice(0, 600) };
  const raw = payload.result;
  const table = typeof raw === 'string' && raw.match(/\$\$SOE\r?\n([\s\S]*?)\$\$EOE/);
  if (!table) return { status: 422, error: typeof raw === 'string' ?
    raw.trim().slice(0, 600) : 'Horizons returned no ephemeris table for this request.' };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const rows = table[1].trim().split(/\r?\n/).map(line => {
    const [date, , , azimuth, elevation] = line.split(',').map(field => field.trim());
    const match = date.match(/^(\d{4})-([A-Za-z]{3})-(\d{2}) (\d{2}:\d{2})$/);
    const month = match && months.indexOf(match[2]) + 1;
    if (!month || !azimuth || !elevation || !Number.isFinite(Number(azimuth)) || !Number.isFinite(Number(elevation))) {
      throw new Error('Unexpected Horizons output');
    }
    const time = [match[1], String(month).padStart(2, '0'), match[3]].join('-') + 'T' + match[4] + ':00Z';
    return { time, azimuth: Number(azimuth), elevation: Number(elevation) };
  });
  return { status: 200, rows, raw, version: payload.signature?.version ?? null };
}

export default {
  async fetch(request) {
    if (request.method !== 'GET') {
      return Response.json({ error: 'Send a GET request.' }, { status: 405, headers: { Allow: 'GET' } });
    }
    let query;
    try {
      query = buildQuery(new URL(request.url).searchParams);
    } catch (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    const saved = cache.get(query);
    if (saved?.expires > Date.now()) return success(saved.data);
    if (pending && pending.query !== query) {
      return Response.json({ error: 'A Horizons query is in progress. Try again in a moment.' },
        { status: 429, headers: { 'Retry-After': '3' } });
    }

    if (!pending) {
      const result = queryHorizons(query).finally(() => { pending = undefined; });
      pending = { query, result };
    }
    try {
      const data = await pending.result;
      if (data.status !== 200) return Response.json({ error: data.error }, { status: data.status });
      if (cache.size >= 24) cache.delete(cache.keys().next().value);
      cache.set(query, { data, expires: Date.now() + 3600_000 });
      return success(data);
    } catch (error) {
      const timedOut = error.name === 'TimeoutError';
      return Response.json({ error: timedOut ? 'JPL Horizons took too long to respond. Try again in a moment.' :
        'Could not read a response from JPL Horizons. Try again in a moment.' }, { status: timedOut ? 504 : 502 });
    }
  }
};

function success({ rows, raw, version }) {
  return Response.json({ rows, raw, version }, { headers: {
    'Cache-Control': 'public, max-age=300, s-maxage=3600'
  } });
}
