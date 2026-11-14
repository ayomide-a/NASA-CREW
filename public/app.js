const form = document.querySelector('#query-form');
const run = form.querySelector('.run');
const status = document.querySelector('#status');
const empty = document.querySelector('#empty');
const data = document.querySelector('#data');
const summary = document.querySelector('#summary');
const download = document.querySelector('.download');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const range = document.querySelector('#range');
const table = document.querySelector('tbody');
const canvas = document.querySelector('#chart');
const context = canvas.getContext('2d');
const slider = document.querySelector('#time-slider');
const playback = document.querySelector('#playback');
const reading = document.querySelector('#current-reading');
const sunReading = document.querySelector('#sun-reading');
const earthReading = document.querySelector('#earth-reading');
const sunVisibilityPie = document.querySelector('#sun-visibility-pie');
const earthVisibilityPie = document.querySelector('#earth-visibility-pie');
const sunVisibilityValue = document.querySelector('#sun-visibility-value');
const earthVisibilityValue = document.querySelector('#earth-visibility-value');
const sunVisibilityDuration = document.querySelector('#sun-visibility-duration');
const earthVisibilityDuration = document.querySelector('#earth-visibility-duration');
const terrainStatus = document.querySelector('#terrain-status');
const mapElement = document.querySelector('#map');
const mapCoordinates = document.querySelector('#map-coordinates');
const mapViewSelect = document.querySelector('#map-view');
const lolaStatus = document.querySelector('#lola-status');
const quantStats = document.querySelector('#quant-stats');
const demDetails = document.querySelector('#dem-details');
const lolaPreview = document.querySelector('#lola-preview');
const latitudeInput = form.elements.namedItem('latitude');
const longitudeInput = form.elements.namedItem('longitude');
const pageSize = 8;
let result;
let page = 0;
let currentIndex = 0;
let playbackTimer;
let chartZoom;
let lolaRequest;
const failedImageryViews = new Set();

const lunarExtent = [-180, -90, 180, 90];
const lunarProjection = new ol.proj.Projection({
  code: 'EPSG:104903',
  units: 'degrees',
  extent: lunarExtent
});
const northPolarExtent = [-1095700, -1095600, 1095600, 1095700];
const northPolarProjection = new ol.proj.Projection({
  code: 'EPSG:30118',
  units: 'm',
  extent: northPolarExtent
});
const southPolarProjection = new ol.proj.Projection({
  code: 'EPSG:30120',
  units: 'm',
  extent: northPolarExtent
});
ol.proj.addProjection(lunarProjection);
ol.proj.addProjection(northPolarProjection);
ol.proj.addProjection(southPolarProjection);

const markerSource = new ol.source.Vector();
function createImageryLayer(url, projection, spatialReference, options = {}) {
  const { mapViewName, fallbackOnError = false } = options;
  const source = new ol.source.ImageArcGISRest({
    url,
    projection,
    params: {
      format: 'jpgpng',
      bboxSR: spatialReference,
      imageSR: spatialReference
    }
  });
  source.on('imageloaderror', () => {
    if (fallbackOnError && mapViewName && mapViewName !== 'global') {
      failedImageryViews.add(mapViewName);
      if (mapViewSelect.value === mapViewName) {
        mapCoordinates.textContent = 'Polar imagery is unavailable. Showing global Moon imagery.';
        applyMapView('global');
      }
      return;
    }
    mapCoordinates.textContent = 'Lunar imagery could not be loaded. You can still select coordinates.';
  });
  return new ol.layer.Image({ source });
}

const imageryLayers = {
  global: createImageryLayer(
    'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_WAC_Mosaic_Global_303ppd_v02/ImageServer',
    lunarProjection,
    '104903',
    { mapViewName: 'global' }
  ),
  'north-pole': createImageryLayer(
    'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_WAC_Mosaic_NPole60_100m_v02/ImageServer',
    northPolarProjection,
    '30118',
    { mapViewName: 'north-pole', fallbackOnError: true }
  ),
  'south-pole': createImageryLayer(
    'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_WAC_Mosaic_SPole60_100m_v02/ImageServer',
    southPolarProjection,
    '30120',
    { mapViewName: 'south-pole', fallbackOnError: true }
  )
};
const polarDetailLayers = {
  'north-pole': createImageryLayer(
    'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_Shade_NPolar875_10m/ImageServer',
    northPolarProjection,
    '30118'
  ),
  'south-pole': createImageryLayer(
    'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_Shade_SPolar875_10m/ImageServer',
    southPolarProjection,
    '30120'
  )
};
imageryLayers['north-pole'].setVisible(false);
imageryLayers['south-pole'].setVisible(false);
for (const layer of Object.values(polarDetailLayers)) {
  layer.setVisible(false);
  layer.setOpacity(0.45);
  layer.setMaxResolution(80);
}

function createMapView(name) {
  const projection = name === 'north-pole' ? northPolarProjection :
    name === 'south-pole' ? southPolarProjection : lunarProjection;
  const extent = name === 'north-pole' || name === 'south-pole' ? northPolarExtent : lunarExtent;
  const view = new ol.View({
    projection,
    center: [0, 0],
    extent,
    minZoom: 0,
    maxZoom: 10
  });
  view.fit(extent, { size: [mapElement.clientWidth, mapElement.clientHeight] });
  return view;
}

const lunarMap = new ol.Map({
  target: mapElement,
  layers: [
    imageryLayers.global,
    imageryLayers['north-pole'],
    imageryLayers['south-pole'],
    polarDetailLayers['north-pole'],
    polarDetailLayers['south-pole'],
    new ol.layer.Vector({
      source: markerSource,
      style: [
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 11,
            fill: new ol.style.Fill({ color: 'rgba(255, 195, 132, 0.2)' })
          })
        }),
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({ color: '#ffc384' }),
            stroke: new ol.style.Stroke({ color: '#101113', width: 2 })
          })
        })
      ]
    })
  ],
  view: createMapView('global')
});

const lunarRadius = 1737400;

function eastLongitude(longitude) {
  return ((longitude % 360) + 360) % 360;
}

function geographicToPolar(latitude, longitude, hemisphere) {
  const latitudeRadians = latitude * Math.PI / 180;
  const longitudeRadians = longitude * Math.PI / 180;
  const angularDistance = hemisphere === 'north' ?
    Math.PI / 2 - latitudeRadians : Math.PI / 2 + latitudeRadians;
  const radius = 2 * lunarRadius * Math.tan(angularDistance / 2);
  return [
    radius * Math.sin(longitudeRadians),
    (hemisphere === 'north' ? -1 : 1) * radius * Math.cos(longitudeRadians)
  ];
}

function polarToGeographic([x, y], hemisphere) {
  const angularDistance = 2 * Math.atan(Math.hypot(x, y) / (2 * lunarRadius));
  const latitude = hemisphere === 'north' ?
    Math.PI / 2 - angularDistance : -Math.PI / 2 + angularDistance;
  const longitude = hemisphere === 'north' ? Math.atan2(x, -y) : Math.atan2(x, y);
  return [longitude * 180 / Math.PI, latitude * 180 / Math.PI];
}

function updateSelectedSite(latitude, longitude) {
  const longitudeEast = eastLongitude(longitude);
  const mapLongitude = longitudeEast > 180 ? longitudeEast - 360 : longitudeEast;
  latitudeInput.value = latitude.toFixed(6);
  longitudeInput.value = longitudeEast.toFixed(6);
  mapCoordinates.textContent = 'Lat ' + latitude.toFixed(3) + '° · Lon ' + longitudeEast.toFixed(3) + '° E';
  markerSource.clear();
  const mapView = mapViewSelect.value;
  const coordinate = mapView === 'global' ? [mapLongitude, latitude] :
    geographicToPolar(latitude, mapLongitude, mapView === 'north-pole' ? 'north' : 'south');
  const extent = mapView === 'global' ? lunarExtent : northPolarExtent;
  if (coordinate[0] >= extent[0] && coordinate[0] <= extent[2] &&
      coordinate[1] >= extent[1] && coordinate[1] <= extent[3]) {
    markerSource.addFeature(new ol.Feature(new ol.geom.Point(coordinate)));
  }
  updateLolaDem(latitude, longitudeEast);
}

function updateMarkerFromInputs() {
  const latitude = Number(latitudeInput.value);
  const longitude = Number(longitudeInput.value);
  if (!latitudeInput.value.trim() || !longitudeInput.value.trim() ||
      !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 360) {
    markerSource.clear();
    mapCoordinates.textContent = 'Enter valid coordinates to place the marker.';
    return;
  }
  updateSelectedSite(latitude, longitude);
}

function updateLolaDem(latitude, longitudeEast) {
  if (!lolaStatus || !lolaPreview || !quantStats || !demDetails) return;
  if (lolaRequest) lolaRequest.abort();
  lolaRequest = new AbortController();
  lolaStatus.textContent = 'Loading LOLA DEM tile and terrain metrics…';
  lolaPreview.hidden = true;
  quantStats.textContent = 'DEM quantitative metrics pending.';
  demDetails.textContent = 'Aspect, roughness, curvature, and hazard indicators pending.';
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitudeEast)
  });
  fetch('/api/lola?' + params, { signal: lolaRequest.signal })
    .then(async response => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'LOLA DEM request failed.');
      lolaPreview.src = payload.tile.previewUrl;
      lolaPreview.hidden = false;
      lolaStatus.textContent = payload.dataset.title + ' loaded for Lat ' + latitude.toFixed(3) +
        '°, Lon ' + longitudeEast.toFixed(3) + '° E.';
      const stats = payload.topography?.elevation;
      const local = payload.topography?.local;
      const aspect = payload.topography?.aspect;
      const roughness = payload.topography?.roughness;
      const curvature = payload.topography?.curvature;
      const hazard = payload.topography?.hazard;
      if (stats && local) {
        quantStats.textContent = 'Site ' + payload.elevationMeters.toFixed(1) + ' m · min/max ' +
          stats.minMeters.toFixed(1) + '/' + stats.maxMeters.toFixed(1) + ' m · slope(avg/max) ' +
          local.slopeMeanDeg.toFixed(2) + '°/' + local.slopeMaxDeg.toFixed(2) + '° · roughness RMS ' +
          local.roughnessRmsMeters.toFixed(2) + ' m';
        if (aspect && roughness && curvature && hazard) {
          demDetails.textContent = 'Aspect (downslope): ' + aspect.downslopeAzimuthDeg.toFixed(1) +
            '° · TRI: ' + roughness.triMeters.toFixed(2) + ' m · moving roughness std: ' +
            roughness.movingWindowStdDevMeters.toFixed(2) + ' m · curvature (profile/plan/total): ' +
            curvature.profileMeanPerMeter.toExponential(2) + '/' +
            curvature.planMeanPerMeter.toExponential(2) + '/' +
            curvature.totalPerMeter.toExponential(2) + ' · slope>10°: ' +
            (hazard.slopeExceedanceFractions.over10Deg * 100).toFixed(1) + '% · open-sky directions: ' +
            (hazard.horizonExposure.openSkyFraction * 100).toFixed(1) + '%';
        } else {
          demDetails.textContent = 'Extended terrain descriptors are unavailable for this request.';
        }
      } else {
        quantStats.textContent = 'Site ' + payload.elevationMeters.toFixed(1) +
          ' m · detailed topography metrics unavailable for this request.';
        demDetails.textContent = 'Extended terrain descriptors are unavailable for this request.';
      }
      if (payload.topographyError) {
        quantStats.textContent += ' (' + payload.topographyError + ')';
        demDetails.textContent = 'Topography note: ' + payload.topographyError;
      }
    })
    .catch(error => {
      if (error.name === 'AbortError') return;
      lolaStatus.textContent = 'LOLA DEM unavailable: ' + error.message;
      quantStats.textContent = 'DEM quantitative metrics unavailable.';
      demDetails.textContent = 'Could not compute aspect, roughness, curvature, or hazard indicators.';
      lolaPreview.hidden = true;
    })
    .finally(() => {
      lolaRequest = undefined;
    });
}

function applyMapView(requestedView) {
  const selectedView = failedImageryViews.has(requestedView) ? 'global' : requestedView;
  for (const [name, layer] of Object.entries(imageryLayers)) {
    layer.setVisible(name === selectedView);
  }
  for (const [name, layer] of Object.entries(polarDetailLayers)) {
    layer.setVisible(name === selectedView);
  }
  lunarMap.setView(createMapView(selectedView));
  if (mapViewSelect.value !== selectedView) mapViewSelect.value = selectedView;
  if (selectedView !== requestedView) {
    mapCoordinates.textContent = 'Selected imagery is unavailable. Global lunar imagery is shown instead.';
  }
  updateMarkerFromInputs();
}

mapViewSelect.addEventListener('change', () => {
  applyMapView(mapViewSelect.value);
});
lunarMap.on('singleclick', event => {
  const [longitude, latitude] = mapViewSelect.value === 'global' ?
    event.coordinate : polarToGeographic(event.coordinate, mapViewSelect.value === 'north-pole' ? 'north' : 'south');
  updateSelectedSite(latitude, longitude);
});
latitudeInput.addEventListener('change', updateMarkerFromInputs);
longitudeInput.addEventListener('change', updateMarkerFromInputs);
updateMarkerFromInputs();

function renderTable() {
  const start = page * pageSize;
  const end = Math.min(start + pageSize, result.rows.length);
  const items = result.rows.slice(start, end).map(({ time, sun, earth }, index) => {
    const row = document.createElement('tr');
    const terrain = result.terrain ? terrainAtAzimuth(result.terrain.horizons, sun.azimuth) : undefined;
    for (const value of [
      time.slice(0, 16).replace('T', ' '),
      sun.azimuth.toFixed(6),
      sun.elevation.toFixed(6),
      terrain ? (sun.elevation >= 0 && sun.elevation <= terrain.horizonElevation ? 'Blocked' : 'Clear') + ' · horizon ' + terrain.horizonElevation.toFixed(2) + '°' : 'Unavailable',
      earth.azimuth.toFixed(6),
      earth.elevation.toFixed(6),
      terrain ? (earth.elevation >= 0 && earth.elevation <= terrainAtAzimuth(result.terrain.horizons, earth.azimuth).horizonElevation ? 'Blocked' : 'Clear') + ' · horizon ' + terrainAtAzimuth(result.terrain.horizons, earth.azimuth).horizonElevation.toFixed(2) + '°' : 'Unavailable'
    ]) {
      const cell = row.insertCell();
      cell.textContent = value;
    }
    return row;
  });
  table.replaceChildren(...items);
  range.textContent = (start + 1) + '–' + end + ' of ' + result.rows.length;
  previous.disabled = page === 0;
  next.disabled = end === result.rows.length;
}

function terrainAtAzimuth(horizons, azimuth) {
  if (!horizons?.length) return undefined;
  const normalized = ((azimuth % 360) + 360) % 360;
  return horizons.reduce((closest, horizon) => {
    const distance = Math.abs(((horizon.azimuth - normalized + 540) % 360) - 180);
    const closestDistance = Math.abs(((closest.azimuth - normalized + 540) % 360) - 180);
    return distance < closestDistance ? horizon : closest;
  });
}

function drawChart() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!context || !width || !height || !result?.rows.length) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.scale(ratio, ratio);

  const style = getComputedStyle(document.documentElement);
  const muted = style.getPropertyValue('--muted').trim();
  const edge = style.getPropertyValue('--edge').trim();
  const sunColor = style.getPropertyValue('--accent').trim();
  const earthColor = style.getPropertyValue('--moonlight').trim();
  const plot = { left: 58, right: width - 18, top: 18, bottom: height - 50 };
  const viewCenter = chartZoom?.center ?? 180;
  const viewSpan = chartZoom ? 60 : 360;
  const relativeAzimuth = azimuth => ((azimuth - viewCenter + 540) % 360) - 180 + viewCenter;
  const x = azimuth => plot.left + (relativeAzimuth(azimuth) - (viewCenter - viewSpan / 2)) / viewSpan * (plot.right - plot.left);
  const y = elevation => plot.bottom - (elevation + 90) / 180 * (plot.bottom - plot.top);

  function drawTerrainHorizon() {
    const horizons = result.terrain?.horizons;
    if (!horizons?.length) return;
    context.beginPath();
    context.strokeStyle = '#c8cdd2';
    context.lineWidth = 3;
    context.setLineDash([8, 5]);
    let started = false;
    horizons.forEach(point => {
      const pointAzimuth = relativeAzimuth(point.azimuth);
      if (chartZoom && (pointAzimuth < viewCenter - viewSpan / 2 || pointAzimuth > viewCenter + viewSpan / 2)) return;
      const pointX = x(point.azimuth);
      const pointY = y(point.horizonElevation);
      if (!started) { context.moveTo(pointX, pointY); started = true; }
      else context.lineTo(pointX, pointY);
    });
    context.stroke();
    context.setLineDash([]);
  }

  context.fillStyle = muted;
  context.globalAlpha = 0.12;
  context.fillRect(plot.left, y(0), plot.right - plot.left, plot.bottom - y(0));
  context.globalAlpha = 1;

  context.font = '11px monospace';
  context.fillStyle = muted;
  context.textBaseline = 'middle';
  context.textAlign = 'right';
  for (const elevation of [-90, -60, -30, 0, 30, 60, 90]) {
    const position = y(elevation);
    context.beginPath();
    context.strokeStyle = elevation === 0 ? muted : edge;
    context.setLineDash(elevation === 0 ? [4, 4] : []);
    context.moveTo(plot.left, position);
    context.lineTo(plot.right, position);
    context.stroke();
    context.fillText(elevation + '°', plot.left - 8, position);
  }
  context.setLineDash([]);

  const azimuthLabels = chartZoom
    ? [-30, -15, 0, 15, 30].map(offset => Math.round((viewCenter + offset + 360) % 360) + '°')
    : ['0° N', '90° E', '180° S', '270° W', '360° N'];
  context.textAlign = 'center';
  for (let index = 0; index < azimuthLabels.length; index += 1) {
    const position = plot.left + index / (azimuthLabels.length - 1) * (plot.right - plot.left);
    context.beginPath();
    context.strokeStyle = edge;
    context.moveTo(position, plot.top);
    context.lineTo(position, plot.bottom);
    context.stroke();
    context.fillText(azimuthLabels[index], position, plot.bottom + 7);
  }
  context.fillStyle = muted;
  context.fillText('Azimuth (clockwise from north)', (plot.left + plot.right) / 2, height - 17);
  context.save();
  context.translate(13, (plot.top + plot.bottom) / 2);
  context.rotate(-Math.PI / 2);
  context.fillText('Elevation', 0, 0);
  context.restore();

  for (const [rows, color] of [[result.sun.rows, sunColor], [result.earth.rows, earthColor]]) {
    const aboveSegments = [];
    const belowSegments = [];
    const addSegment = (segments, start, end) => {
      segments.push([x(start.azimuth), y(start.elevation), x(end.azimuth), y(end.elevation)]);
    };
    for (let index = 1; index < rows.length; index += 1) {
      const previous = rows[index - 1];
      const row = rows[index];
      const previousAzimuth = relativeAzimuth(previous.azimuth);
      const azimuth = relativeAzimuth(row.azimuth);
      if (Math.abs(azimuth - previousAzimuth) > viewSpan / 2) continue;

      const start = { azimuth: previousAzimuth, elevation: previous.elevation };
      const end = { azimuth, elevation: row.elevation };
      const startsBelow = start.elevation < 0;
      const endsBelow = end.elevation < 0;
      if (startsBelow !== endsBelow && start.elevation !== 0 && end.elevation !== 0) {
        const progress = -start.elevation / (end.elevation - start.elevation);
        const crossing = {
          azimuth: start.azimuth + (end.azimuth - start.azimuth) * progress,
          elevation: 0
        };
        addSegment(startsBelow ? belowSegments : aboveSegments, start, crossing);
        addSegment(endsBelow ? belowSegments : aboveSegments, crossing, end);
      } else {
        addSegment(startsBelow || endsBelow ? belowSegments : aboveSegments, start, end);
      }
    }

    for (const [segments, opacity] of [[aboveSegments, 0.55], [belowSegments, 0.2]]) {
      context.beginPath();
      context.strokeStyle = color;
      context.globalAlpha = opacity;
      context.lineWidth = 1.5;
      for (const [startX, startY, endX, endY] of segments) {
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
      }
      context.stroke();
    }
    context.globalAlpha = 1;
  }

  for (const [row, color] of [
    [result.rows[currentIndex].sun, sunColor],
    [result.rows[currentIndex].earth, earthColor]
  ]) {
    context.globalAlpha = row.elevation < 0 ? 0.35 : 1;
    context.beginPath();
    context.arc(x(row.azimuth), y(row.elevation), 7, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = row.elevation < 0 ? 4 : 12;
    context.fill();
    context.shadowBlur = 0;
    context.strokeStyle = edge;
    context.lineWidth = 1;
    context.stroke();
    context.globalAlpha = 1;
  }
  drawTerrainHorizon();
}

canvas.addEventListener('click', event => {
  if (!result?.rows.length) return;
  const bounds = canvas.getBoundingClientRect();
  const plotLeft = 58;
  const plotRight = canvas.clientWidth - 18;
  const clickAzimuth = chartZoom
    ? chartZoom.center - 30 + (event.clientX - bounds.left - plotLeft) / (plotRight - plotLeft) * 60
    : (event.clientX - bounds.left - plotLeft) / (plotRight - plotLeft) * 360;
  const current = result.rows[currentIndex];
  const angularDistance = azimuth => Math.abs(((azimuth - clickAzimuth + 540) % 360) - 180);
  if (chartZoom) chartZoom = undefined;
  else if (angularDistance(current.sun.azimuth) <= 8) chartZoom = { center: current.sun.azimuth };
  else if (angularDistance(current.earth.azimuth) <= 8) chartZoom = { center: current.earth.azimuth };
  else return;
  drawChart();
});

function elevationAt(time, rows) {
  if (time <= Date.parse(rows[0].time)) return rows[0].elevation;
  for (let index = 1; index < rows.length; index += 1) {
    const before = Date.parse(rows[index - 1].time);
    const after = Date.parse(rows[index].time);
    if (time <= after) {
      const progress = (time - before) / (after - before);
      return rows[index - 1].elevation + (rows[index].elevation - rows[index - 1].elevation) * progress;
    }
  }
  return rows[rows.length - 1].elevation;
}

function terrainHorizonAt(time, target) {
  if (!result.terrain?.horizons?.length) return 0;
  const rows = result.rows;
  const firstTerrain = terrainAtAzimuth(result.terrain.horizons, rows[0][target].azimuth);
  if (time <= Date.parse(rows[0].time)) {
    return firstTerrain?.horizonElevation ?? 0;
  }
  for (let index = 1; index < rows.length; index += 1) {
    const before = Date.parse(rows[index - 1].time);
    const after = Date.parse(rows[index].time);
    if (time <= after) {
      const progress = (time - before) / (after - before);
      const first = terrainAtAzimuth(result.terrain.horizons, rows[index - 1][target].azimuth)?.horizonElevation ?? 0;
      const last = terrainAtAzimuth(result.terrain.horizons, rows[index][target].azimuth)?.horizonElevation ?? 0;
      return first + (last - first) * progress;
    }
  }
  return terrainAtAzimuth(result.terrain.horizons, rows[rows.length - 1][target].azimuth)?.horizonElevation ?? 0;
}

function updateVisibility(params) {
  const start = Date.parse(params.get('start') + ':00Z');
  const stop = Date.parse(params.get('stop') + ':00Z');
  const updateTargetVisibility = (label, target, rows, pie, value, duration) => {
    const times = [start, ...rows.map(row => Date.parse(row.time)).filter(time => time > start && time < stop), stop];
    let above = 0;
    for (let index = 1; index < times.length; index += 1) {
      const interval = times[index] - times[index - 1];
      const first = elevationAt(times[index - 1], rows) - terrainHorizonAt(times[index - 1], target);
      const last = elevationAt(times[index], rows) - terrainHorizonAt(times[index], target);
      if (first > 0 && last > 0) above += interval;
      else if (first > 0 && last <= 0) above += interval * first / (first - last);
      else if (first <= 0 && last > 0) above += interval * last / (last - first);
    }
    const percentage = above / (stop - start) * 100;
    const rounded = Math.round(percentage);
    pie.style.background = 'conic-gradient(var(--visibility-color) ' + percentage + '%, var(--edge) 0)';
    pie.setAttribute('aria-label', label + ' above terrain horizon ' + rounded + '%');
    value.textContent = rounded + '%';
    const hours = above / 3_600_000;
    duration.textContent = hours < 1
      ? Math.round(above / 60_000) + ' min'
      : hours.toFixed(1) + ' hr';
  };
  updateTargetVisibility('Sun', 'sun', result.sun.rows, sunVisibilityPie, sunVisibilityValue, sunVisibilityDuration);
  updateTargetVisibility('Earth', 'earth', result.earth.rows, earthVisibilityPie, earthVisibilityValue, earthVisibilityDuration);
}

function updateCurrentReading() {
  currentIndex = Number(slider.value);
  const { time, sun, earth } = result.rows[currentIndex];
  const timeLabel = time.slice(0, 16).replace('T', ' ') + ' UTC';
  reading.textContent = timeLabel;
  sunReading.textContent = sun.azimuth.toFixed(1) + '° az · ' + sun.elevation.toFixed(1) + '° el';
  earthReading.textContent = earth.azimuth.toFixed(1) + '° az · ' + earth.elevation.toFixed(1) + '° el';
  slider.setAttribute('aria-valuetext', timeLabel + ', Sun azimuth ' + sun.azimuth.toFixed(1) +
    ' degrees, elevation ' + sun.elevation.toFixed(1) + ' degrees; Earth azimuth ' +
    earth.azimuth.toFixed(1) + ' degrees, elevation ' + earth.elevation.toFixed(1) + ' degrees');
  canvas.setAttribute('aria-label', 'At ' + timeLabel + ', Sun azimuth ' + sun.azimuth.toFixed(1) +
    ' degrees and elevation ' + sun.elevation.toFixed(1) + ' degrees; Earth azimuth ' +
    earth.azimuth.toFixed(1) + ' degrees and elevation ' + earth.elevation.toFixed(1) + ' degrees.');
  drawChart();
}

function combineResults(sun, earth) {
  if (sun.rows.length !== earth.rows.length ||
      sun.rows.some((row, index) => row.time !== earth.rows[index].time)) {
    throw new Error('Sun and Earth data returned different time samples. Try the observation again.');
  }
  return {
    sun,
    earth,
    rows: sun.rows.map((sunRow, index) => ({
      time: sunRow.time,
      sun: sunRow,
      earth: earth.rows[index]
    }))
  };
}

function stopPlayback() {
  window.clearInterval(playbackTimer);
  playbackTimer = undefined;
  playback.textContent = 'Play';
  playback.setAttribute('aria-pressed', 'false');
}

function startPlayback() {
  if (playbackTimer) return;
  if (currentIndex === result.rows.length - 1) slider.value = '0';
  playback.textContent = 'Pause';
  playback.setAttribute('aria-pressed', 'true');
  updateCurrentReading();
  playbackTimer = window.setInterval(() => {
    if (currentIndex >= result.rows.length - 1) {
      stopPlayback();
      return;
    }
    slider.value = String(currentIndex + 1);
    updateCurrentReading();
  }, 250);
}

function renderResult(payload, params) {
  stopPlayback();
  result = payload;
  page = 0;
  currentIndex = 0;
  slider.max = String(result.rows.length - 1);
  slider.value = '0';
  const site = params.get('latitude') + '°, ' + params.get('longitude') + '° E';
  summary.textContent = 'Sun + Earth · ' + site + ' · ' + result.rows.length + ' samples';
  document.querySelector('#raw').textContent = 'SUN\n' + result.sun.raw + '\n\nEARTH\n' + result.earth.raw;
  empty.hidden = true;
  data.hidden = false;
  status.textContent = 'Loaded Sun and Earth ephemerides for ' + result.rows.length + ' matching time samples.';
  terrainStatus.textContent = result.terrain?.horizons
    ? 'Terrain horizon: ' + result.terrain.horizons.length + ' azimuth samples around the site.'
    : 'Terrain profile unavailable: ' + (result.terrainError ?? 'Moon Trek did not return elevation data.') +
      ' Increase the observation step size and try again.';
  download.disabled = false;
  renderTable();
  updateVisibility(params);
  updateCurrentReading();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startPlayback();
}

async function fetchTarget(params, target) {
  const query = new URLSearchParams(params);
  query.set('target', target);
  const response = await fetch('/api/horizons?' + query);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? 'The ' + target + ' request failed.');
  return payload;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  stopPlayback();
  const params = new URLSearchParams(new FormData(form));
  run.disabled = true;
  run.firstElementChild.textContent = 'Running observation…';
  status.classList.remove('error');
  status.textContent = 'Requesting Sun ephemeris from JPL Horizons…';
  status.hidden = false;
  empty.hidden = true;
  data.hidden = true;
  download.disabled = true;
  summary.textContent = 'JPL Horizons · Observer ephemeris';
  try {
    const sun = await fetchTarget(params, 'sun');
    status.textContent = 'Sun data stored. Requesting Earth ephemeris from JPL Horizons…';
    const earth = await fetchTarget(params, 'earth');
    const combined = combineResults(sun, earth);
    const terrainParams = new URLSearchParams({
      latitude: params.get('latitude'), longitude: params.get('longitude'), altitude: params.get('altitude'),
    });
    const terrainResponse = await fetch('/api/terrain?' + terrainParams);
    const terrainPayload = await terrainResponse.json();
    if (terrainResponse.ok) combined.terrain = terrainPayload;
    else combined.terrainError = terrainPayload.error ?? 'Moon Trek did not return elevation data.';
    renderResult(combined, params);
  } catch (error) {
    status.textContent = error instanceof SyntaxError ? 'The service returned an unexpected response.' : error.message;
    status.classList.add('error');
  } finally {
    run.disabled = false;
    run.firstElementChild.textContent = 'Run observation';
  }
});

previous.addEventListener('click', () => { page -= 1; renderTable(); });
next.addEventListener('click', () => { page += 1; renderTable(); });
playback.addEventListener('click', () => {
  if (playbackTimer) stopPlayback();
  else startPlayback();
});
slider.addEventListener('input', () => {
  stopPlayback();
  updateCurrentReading();
});
download.addEventListener('click', () => {
  const rows = result.rows.map(({ time, sun, earth }, index) => {
    const sunTerrain = result.terrain ? terrainAtAzimuth(result.terrain.horizons, sun.azimuth) : undefined;
    const earthTerrain = result.terrain ? terrainAtAzimuth(result.terrain.horizons, earth.azimuth) : undefined;
    return [time, sun.azimuth, sun.elevation,
      sunTerrain?.horizonElevation ?? '', sunTerrain ? sun.elevation >= 0 && sun.elevation <= sunTerrain.horizonElevation : '',
      earth.azimuth, earth.elevation,
      earthTerrain?.horizonElevation ?? '', earthTerrain ? earth.elevation >= 0 && earth.elevation <= earthTerrain.horizonElevation : ''].join(',');
  });
  const csv = ['timestamp_utc,sun_azimuth_deg,sun_elevation_deg,sun_terrain_horizon_deg,sun_terrain_blocked,earth_azimuth_deg,earth_elevation_deg,earth_terrain_horizon_deg,earth_terrain_blocked',
    ...rows].join('\n') + '\n';
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'moonwalkers-ephemeris.csv';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});
new ResizeObserver(drawChart).observe(canvas);
