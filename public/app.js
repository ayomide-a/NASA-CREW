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
const mapElement = document.querySelector('#map');
const mapCoordinates = document.querySelector('#map-coordinates');
const mapViewSelect = document.querySelector('#map-view');
const latitudeInput = form.elements.namedItem('latitude');
const longitudeInput = form.elements.namedItem('longitude');
const pageSize = 8;
let result;
let page = 0;
let displayedTarget;

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
function createImageryLayer(url, projection, spatialReference) {
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
    mapCoordinates.textContent = 'Lunar imagery could not be loaded. You can still select coordinates.';
  });
  return new ol.layer.Image({ source });
}

const imageryLayers = {
  global: createImageryLayer(
    'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_WAC_Mosaic_Global_303ppd_v02/ImageServer',
    lunarProjection,
    '104903'
  ),
  'north-pole': createImageryLayer(
    'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_WAC_Mosaic_NPole60_100m_v02/ImageServer',
    northPolarProjection,
    '30118'
  ),
  'south-pole': createImageryLayer(
    'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_WAC_Mosaic_SPole60_100m_v02/ImageServer',
    southPolarProjection,
    '30120'
  )
};
imageryLayers['north-pole'].setVisible(false);
imageryLayers['south-pole'].setVisible(false);

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

mapViewSelect.addEventListener('change', () => {
  for (const [name, layer] of Object.entries(imageryLayers)) {
    layer.setVisible(name === mapViewSelect.value);
  }
  lunarMap.setView(createMapView(mapViewSelect.value));
  updateMarkerFromInputs();
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
  const items = result.rows.slice(start, end).map(({ time, azimuth, elevation }) => {
    const row = document.createElement('tr');
    for (const value of [time.slice(0, 16).replace('T', ' '), azimuth.toFixed(6), elevation.toFixed(6)]) {
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

function drawChart() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!context || !width || !result?.rows.length) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.scale(ratio, ratio);

  const rows = result.rows;
  const values = rows.map(row => row.elevation);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const padding = Math.max(0.25, (max - min) * 0.12);
  const low = min - padding;
  const high = max + padding;
  const left = 47;
  const right = width - 10;
  const top = 19;
  const bottom = height - 33;
  const x = index => rows.length > 1 ? left + index / (rows.length - 1) * (right - left) : (left + right) / 2;
  const y = value => bottom - (value - low) / (high - low) * (bottom - top);

  const style = getComputedStyle(document.documentElement);
  const muted = style.getPropertyValue('--muted').trim();
  const stroke = style.getPropertyValue(displayedTarget === 'sun' ? '--accent' : '--moonlight').trim();
  context.font = '11px monospace';
  context.fillStyle = muted;
  context.textAlign = 'right';
  context.textBaseline = 'middle';

  for (const tick of [high, (high + low) / 2, low]) {
    const position = y(tick);
    context.strokeStyle = style.getPropertyValue('--edge').trim();
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(left, position);
    context.lineTo(right, position);
    context.stroke();
    context.fillText(tick.toFixed(1) + '°', left - 6, position);
  }
  context.beginPath();
  context.strokeStyle = muted;
  context.setLineDash([4, 4]);
  context.moveTo(left, y(0));
  context.lineTo(right, y(0));
  context.stroke();
  context.setLineDash([]);

  const indices = [...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])];
  for (const index of indices) {
    context.textAlign = index === 0 ? 'left' : index === rows.length - 1 ? 'right' : 'center';
    const label = rows[index].time.slice(5, 16).replace('T', ' ');
    const location = index === 0 ? left : index === rows.length - 1 ? right : x(index);
    context.fillText(label, location, bottom + 20);
  }

  context.beginPath();
  context.strokeStyle = stroke;
  context.fillStyle = stroke;
  context.lineWidth = 2;
  if (rows.length === 1) {
    context.arc(x(0), y(values[0]), 3, 0, 2 * Math.PI);
    context.fill();
  } else {
    context.moveTo(x(0), y(values[0]));
    values.slice(1).forEach((value, index) => context.lineTo(x(index + 1), y(value)));
    context.stroke();
  }
}

function renderResult(payload, params) {
  result = payload;
  displayedTarget = params.get('target');
  page = 0;
  const target = displayedTarget === 'sun' ? 'Sun' : 'Earth';
  const site = params.get('latitude') + '°, ' + params.get('longitude') + '° E';
  summary.textContent = target + ' · ' + site + ' · ' + payload.rows.length + ' samples';
  document.querySelector('#raw').textContent = payload.raw;
  empty.hidden = true;
  data.hidden = false;
  status.textContent = 'Loaded ' + payload.rows.length + ' samples for ' + target + '.';
  download.disabled = false;
  renderTable();
  drawChart();
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const params = new URLSearchParams(new FormData(form));
  run.disabled = true;
  run.firstElementChild.textContent = 'Running observation…';
  status.classList.remove('error');
  status.textContent = 'Requesting data from JPL Horizons…';
  status.hidden = false;
  empty.hidden = true;
  data.hidden = true;
  download.disabled = true;
  summary.textContent = 'JPL Horizons · Observer ephemeris';
  try {
    const response = await fetch('/api/horizons?' + params);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? 'The request failed.');
    renderResult(payload, params);
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
download.addEventListener('click', () => {
  const rows = result.rows.map(row => [row.time, row.azimuth, row.elevation].join(','));
  const csv = ['timestamp_utc,azimuth_deg,elevation_deg', ...rows].join('\n') + '\n';
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'moonwalkers-' + displayedTarget + '-ephemeris.csv';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});
new ResizeObserver(drawChart).observe(canvas);
