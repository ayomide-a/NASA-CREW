const form = document.querySelector('#query-form');
const run = document.querySelector('#run-observation');
const status = document.querySelector('#status');
const empty = document.querySelector('#empty');
const data = document.querySelector('#data');
const summary = document.querySelector('#summary');
const download = document.querySelector('.download');
const table = document.querySelector('tbody');
const tableToggle = document.querySelector('#table-toggle');
const tableDetails = document.querySelector('#table-details');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const range = document.querySelector('#range');
const comparisonTableHeaders = document.querySelectorAll('.comparison-column');
const canvas = document.querySelector('#chart');
const context = canvas.getContext('2d');
const slider = document.querySelector('#time-slider');
const playback = document.querySelector('#playback');
const reading = document.querySelector('#current-reading');
const selectedTargetLabel = document.querySelector('#selected-target-label');
const selectedReading = document.querySelector('#selected-reading');
const sunVisibilityPie = document.querySelector('#sun-visibility-pie');
const earthVisibilityPie = document.querySelector('#earth-visibility-pie');
const sunVisibilityValue = document.querySelector('#sun-visibility-value');
const earthVisibilityValue = document.querySelector('#earth-visibility-value');
const sunVisibilityDuration = document.querySelector('#sun-visibility-duration');
const earthVisibilityDuration = document.querySelector('#earth-visibility-duration');
const comparisonVisibility = document.querySelector('#comparison-visibility');
const compareSunVisibilityPie = document.querySelector('#compare-sun-visibility-pie');
const compareEarthVisibilityPie = document.querySelector('#compare-earth-visibility-pie');
const compareSunVisibilityValue = document.querySelector('#compare-sun-visibility-value');
const compareEarthVisibilityValue = document.querySelector('#compare-earth-visibility-value');
const compareSunVisibilityDuration = document.querySelector('#compare-sun-visibility-duration');
const compareEarthVisibilityDuration = document.querySelector('#compare-earth-visibility-duration');
const terrainStatus = document.querySelector('#terrain-status');
const siteRating = document.querySelector('#site-rating');
const siteVerdict = document.querySelector('#site-verdict');
const assessment = {
  sun: { visible: document.querySelector('#sun-assessment-visible'), time: document.querySelector('#sun-assessment-time'), max: document.querySelector('#sun-assessment-max'), obstruction: document.querySelector('#sun-assessment-obstruction') },
  earth: { visible: document.querySelector('#earth-assessment-visible'), time: document.querySelector('#earth-assessment-time'), max: document.querySelector('#earth-assessment-max'), obstruction: document.querySelector('#earth-assessment-obstruction') }
};
const assessmentSection = document.querySelector('.site-assessment');
const assessmentLaunch = document.querySelector('#assessment-launch');
const assessmentModal = document.querySelector('#assessment-modal');
const assessmentModalBody = document.querySelector('#assessment-modal-body');
const assessmentClose = document.querySelector('#assessment-close');
const assessmentSiteA = document.querySelector('#assessment-site-a');
const assessmentSiteB = document.querySelector('#assessment-site-b');
const mapElement = document.querySelector('#map');
const mapCoordinates = document.querySelector('#map-coordinates');
const mapViewSelect = document.querySelector('#map-view');
const lolaStatus = document.querySelector('#lola-status');
const quantStats = document.querySelector('#quant-stats');
const demDetails = document.querySelector('#dem-details');
const lolaPreview = document.querySelector('#lola-preview');
const poiCount = document.querySelector('#poi-count');
const poiPicker = document.querySelector('#poi-picker');
const poiOptions = document.querySelector('#poi-options');
const poiStatus = document.querySelector('#poi-status');
const latitudeInput = form.elements.namedItem('latitude');
const longitudeInput = form.elements.namedItem('longitude');
const startInput = form.elements.namedItem('start');
const stopInput = form.elements.namedItem('stop');
const pageSize = 8;
let result;
let page = 0;
const compareEnabled = document.querySelector('#compare-enabled');
const compareCoordinates = document.querySelector('#compare-coordinates');
const compareLatitudeInput = document.querySelector('#compare-latitude');
const compareLongitudeInput = document.querySelector('#compare-longitude');
const comparisonReadings = document.querySelector('#comparison-readings');
const comparisonSiteLabel = document.querySelector('#comparison-site-label');
const compareSunReading = document.querySelector('#compare-sun-reading');
const compareEarthReading = document.querySelector('#compare-earth-reading');
const compareSunDifference = document.querySelector('#compare-sun-difference');
const compareEarthDifference = document.querySelector('#compare-earth-difference');
const siteBKey = document.querySelector('#site-b-key');
const siteRecommendation = document.querySelector('#site-recommendation');
const recommendationTitle = document.querySelector('#recommendation-title');
const recommendationDetails = document.querySelector('#recommendation-details');
let comparisonResult;
let comparisonParams;
let resultParams;
let assessmentSite = 'a';
let currentIndex = 0;
let playbackTimer;
let pointsOfInterest = [];
const selectedPoiIndexes = new Set();
let chartZoom;
let lolaRequest;

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
const poiSource = new ol.source.Vector();
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
      source: poiSource,
      style: feature => [
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 15,
            fill: new ol.style.Fill({ color: 'rgba(188, 228, 247, 0.22)' }),
            stroke: new ol.style.Stroke({ color: '#bce4f7', width: 2 })
          })
        }),
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({ color: '#bce4f7' }),
            stroke: new ol.style.Stroke({ color: '#101113', width: 2 })
          }),
          text: new ol.style.Text({
            text: feature.get('mission'),
            offsetY: -20,
            font: '600 12px "DM Sans", sans-serif',
            fill: new ol.style.Fill({ color: '#f4f1eb' }),
            stroke: new ol.style.Stroke({ color: '#101113', width: 3 })
          })
        })
      ]
    }),
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

function coordinateForSite(latitude, longitude, mapView) {
  const longitudeEast = eastLongitude(longitude);
  const mapLongitude = longitudeEast > 180 ? longitudeEast - 360 : longitudeEast;
  return mapView === 'global' ? [mapLongitude, latitude] :
    geographicToPolar(latitude, mapLongitude, mapView === 'north-pole' ? 'north' : 'south');
}

function utcDateTimeMilliseconds(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return NaN;
  const milliseconds = Date.parse(value + ':00Z');
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString().slice(0, 16) === value
    ? milliseconds
    : NaN;
}

function siteDateTime(site) {
  const time = site.time.trim().replace(/\s*UTC$/i, '');
  return site.date.trim() + 'T' + time;
}

function updateObservationWindow(site) {
  const currentStart = utcDateTimeMilliseconds(startInput.value);
  const currentStop = utcDateTimeMilliseconds(stopInput.value);
  const siteStart = siteDateTime(site);
  const siteStartMilliseconds = utcDateTimeMilliseconds(siteStart);
  if (!Number.isFinite(currentStart) || !Number.isFinite(currentStop) ||
      currentStop <= currentStart || !Number.isFinite(siteStartMilliseconds)) {
    poiStatus.classList.add('error');
    poiStatus.hidden = false;
    poiStatus.textContent = 'Could not set the site time. Enter a valid start and later stop time first.';
    return;
  }

  const duration = currentStop - currentStart;
  startInput.value = siteStart;
  stopInput.value = new Date(siteStartMilliseconds + duration).toISOString().slice(0, 16);
  poiStatus.classList.remove('error');
  poiStatus.hidden = true;
  poiStatus.textContent = '';
}

function selectPoiSite(site) {
  updateSelectedSite(site.latitude, site.longitude);
  updateObservationWindow(site);
}

function updateSelectedSite(latitude, longitude) {
  const longitudeEast = eastLongitude(longitude);
  latitudeInput.value = latitude.toFixed(6);
  longitudeInput.value = longitudeEast.toFixed(6);
  mapCoordinates.textContent = 'Lat ' + latitude.toFixed(3) + '° · Lon ' + longitudeEast.toFixed(3) + '° E';
  markerSource.clear();
  const mapView = mapViewSelect.value;
  const coordinate = coordinateForSite(latitude, longitudeEast, mapView);
  const extent = mapView === 'global' ? lunarExtent : northPolarExtent;
  if (coordinate[0] >= extent[0] && coordinate[0] <= extent[2] &&
      coordinate[1] >= extent[1] && coordinate[1] <= extent[3]) {
    markerSource.addFeature(new ol.Feature(new ol.geom.Point(coordinate)));
  }
  updateLolaDem(latitude, longitudeEast);
}

function updateLolaDem(latitude, longitudeEast) {
  if (!lolaStatus || !quantStats || !demDetails || !lolaPreview) return;
  if (lolaRequest) lolaRequest.abort();
  lolaRequest = new AbortController();
  lolaStatus.textContent = 'Loading LOLA DEM tile and terrain metrics…';
  quantStats.textContent = 'DEM quantitative metrics pending.';
  demDetails.textContent = 'Aspect, roughness, curvature, and hazard indicators pending.';
  lolaPreview.hidden = true;

  const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitudeEast) });
  fetch('/api/lola?' + params, { signal: lolaRequest.signal })
    .then(async response => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'LOLA DEM request failed.');
      lolaPreview.src = payload.tile.previewUrl;
      lolaPreview.hidden = false;

      const stats = payload.topography?.elevation;
      const local = payload.topography?.local;
      const aspect = payload.topography?.aspect;
      const roughness = payload.topography?.roughness;
      const curvature = payload.topography?.curvature;
      const hazard = payload.topography?.hazard;

      lolaStatus.textContent = payload.dataset.title + ' loaded for Lat ' + latitude.toFixed(3) +
        '°, Lon ' + longitudeEast.toFixed(3) + '° E.';

      if (stats && local) {
        quantStats.textContent = 'Site ' + payload.elevationMeters.toFixed(1) + ' m · min/max ' +
          stats.minMeters.toFixed(1) + '/' + stats.maxMeters.toFixed(1) + ' m · mean/median ' +
          stats.meanMeters.toFixed(1) + '/' + stats.medianMeters.toFixed(1) + ' m · std dev ' +
          stats.stdDevMeters.toFixed(2) + ' m · slope(avg/max) ' +
          local.slopeMeanDeg.toFixed(2) + '°/' + local.slopeMaxDeg.toFixed(2) + '°';
      } else {
        quantStats.textContent = 'Site ' + payload.elevationMeters.toFixed(1) +
          ' m · detailed topography metrics unavailable for this request.';
      }

      if (aspect && roughness && curvature && hazard) {
        demDetails.textContent = 'Aspect: ' + aspect.downslopeAzimuthDeg.toFixed(1) + '° · RMS roughness: ' +
          roughness.rmsMeters.toFixed(2) + ' m · TRI: ' + roughness.triMeters.toFixed(2) +
          ' m · moving roughness std: ' + roughness.movingWindowStdDevMeters.toFixed(2) +
          ' m · curvature (profile/plan/total): ' + curvature.profileMeanPerMeter.toExponential(2) + '/' +
          curvature.planMeanPerMeter.toExponential(2) + '/' + curvature.totalPerMeter.toExponential(2) +
          ' · local relief: ' + hazard.localReliefMeters.toFixed(1) + ' m · slope>10°: ' +
          (hazard.slopeExceedanceFractions.over10Deg * 100).toFixed(1) + '% · open sky: ' +
          (hazard.horizonExposure.openSkyFraction * 100).toFixed(1) + '%';
      } else {
        demDetails.textContent = 'Aspect, roughness, curvature, and hazard indicators are unavailable for this request.';
      }

      if (payload.topographyError) {
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

function updatePoiHighlights() {
  const mapView = mapViewSelect.value;
  const features = [...selectedPoiIndexes].map(index => {
    const site = pointsOfInterest[index];
    const feature = new ol.Feature(new ol.geom.Point(
      coordinateForSite(site.latitude, site.longitude, mapView)
    ));
    feature.set('poiIndex', index);
    feature.set('mission', site.mission);
    return feature;
  });
  poiSource.clear();
  poiSource.addFeatures(features);
}

function renderPoiOptions() {
  const options = pointsOfInterest.map((site, index) => {
    const label = document.createElement('label');
    label.className = 'poi-option';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = String(index);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedPoiIndexes.add(index);
        selectPoiSite(site);
      } else {
        selectedPoiIndexes.delete(index);
      }
      poiCount.textContent = selectedPoiIndexes.size + ' selected';
      updatePoiHighlights();
    });

    const copy = document.createElement('span');
    copy.className = 'poi-option-copy';
    const mission = document.createElement('strong');
    mission.textContent = site.mission;
    const coordinates = document.createElement('small');
    coordinates.textContent = site.latitude.toFixed(3) + '°, ' +
      eastLongitude(site.longitude).toFixed(3) + '° E · ' + site.date + ' ' + site.time;
    copy.append(mission, coordinates);
    label.append(checkbox, copy);
    return label;
  });
  if (!options.length) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No sites configured. Add entries to public/data/points-of-interest.json.';
    poiOptions.replaceChildren(emptyMessage);
    return;
  }
  poiOptions.replaceChildren(...options);
}

function validatePointsOfInterest(payload) {
  if (!Array.isArray(payload)) throw new Error('The JSON file must contain an array of sites.');
  return payload.map((site, index) => {
    const entry = 'Site ' + (index + 1);
    if (!site || typeof site !== 'object' || Array.isArray(site)) {
      throw new Error(entry + ' must be a JSON object.');
    }
    if (typeof site.mission !== 'string' || !site.mission.trim()) {
      throw new Error(entry + ' needs a mission name.');
    }
    if (typeof site.latitude !== 'number' || !Number.isFinite(site.latitude) ||
        site.latitude < -90 || site.latitude > 90) {
      throw new Error(entry + ' latitude must be a number from -90 to 90.');
    }
    if (typeof site.longitude !== 'number' || !Number.isFinite(site.longitude) ||
        site.longitude < -180 || site.longitude > 360) {
      throw new Error(entry + ' longitude must be a number from -180 to 360.');
    }
    if (typeof site.date !== 'string' || !site.date.trim() ||
        typeof site.time !== 'string' || !site.time.trim()) {
      throw new Error(entry + ' needs date and time strings.');
    }
    const dateTime = site.date.trim() + 'T' + site.time.trim().replace(/\s*UTC$/i, '');
    if (!Number.isFinite(utcDateTimeMilliseconds(dateTime))) {
      throw new Error(entry + ' date and time must use YYYY-MM-DD and HH:mm UTC format.');
    }
    return {
      mission: site.mission.trim(),
      latitude: site.latitude,
      longitude: site.longitude,
      date: site.date.trim(),
      time: site.time.trim()
    };
  });
}

async function loadPointsOfInterest() {
  try {
    const response = await fetch('/data/points-of-interest.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    pointsOfInterest = validatePointsOfInterest(await response.json());
    renderPoiOptions();
    poiStatus.classList.remove('error');
    poiStatus.hidden = true;
    poiStatus.textContent = '';
  } catch (error) {
    const unavailable = document.createElement('p');
    unavailable.textContent = 'Site list unavailable. See the status below.';
    poiOptions.replaceChildren(unavailable);
    poiStatus.classList.add('error');
    poiStatus.hidden = false;
    poiStatus.textContent = 'Could not load points of interest: ' + error.message;
  }
}

document.addEventListener('click', event => {
  if (poiPicker.open && !poiPicker.contains(event.target)) poiPicker.open = false;
});

mapViewSelect.addEventListener('change', () => {
  for (const [name, layer] of Object.entries(imageryLayers)) {
    layer.setVisible(name === mapViewSelect.value);
  }
  for (const [name, layer] of Object.entries(polarDetailLayers)) {
    layer.setVisible(name === mapViewSelect.value);
  }
  lunarMap.setView(createMapView(mapViewSelect.value));
  updateMarkerFromInputs();
  updatePoiHighlights();
});
lunarMap.on('singleclick', event => {
  let clickedPoi;
  lunarMap.forEachFeatureAtPixel(event.pixel, feature => {
    if (Number.isInteger(feature.get('poiIndex'))) {
      clickedPoi = feature;
      return true;
    }
    return undefined;
  }, { hitTolerance: 8 });
  if (clickedPoi) {
    const site = pointsOfInterest[clickedPoi.get('poiIndex')];
    selectPoiSite(site);
    return;
  }
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
    const earthTerrain = result.terrain ? terrainAtAzimuth(result.terrain.horizons, earth.azimuth) : undefined;
    const terrainLabel = (position, horizon) => horizon
      ? (position.elevation >= 0 && position.elevation <= horizon.horizonElevation ? 'Blocked' : 'Clear') +
        ' · horizon ' + horizon.horizonElevation.toFixed(2) + '°'
      : 'Unavailable';
    const values = [
      time.slice(0, 16).replace('T', ' '),
      sun.azimuth.toFixed(6),
      sun.elevation.toFixed(6),
      terrainLabel(sun, terrain),
      earth.azimuth.toFixed(6),
      earth.elevation.toFixed(6),
      terrainLabel(earth, earthTerrain)
    ];
    if (comparisonResult) {
      const comparison = comparisonResult.rows[start + index];
      const compareSunTerrain = comparisonResult.terrain
        ? terrainAtAzimuth(comparisonResult.terrain.horizons, comparison.sun.azimuth) : undefined;
      const compareEarthTerrain = comparisonResult.terrain
        ? terrainAtAzimuth(comparisonResult.terrain.horizons, comparison.earth.azimuth) : undefined;
      values.push(comparison.sun.azimuth.toFixed(6), comparison.sun.elevation.toFixed(6),
        terrainLabel(comparison.sun, compareSunTerrain),
        comparison.earth.azimuth.toFixed(6), comparison.earth.elevation.toFixed(6),
        terrainLabel(comparison.earth, compareEarthTerrain));
    }
    for (const value of values) {
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
loadPointsOfInterest();

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
  const zoomValues = chartZoom ? [
    ...result[chartZoom.target].rows.filter(row => Math.abs(relativeAzimuth(row.azimuth) - viewCenter) <= viewSpan / 2).map(row => row.elevation),
    ...(result.terrain?.horizons ?? []).filter(point => Math.abs(relativeAzimuth(point.azimuth) - viewCenter) <= viewSpan / 2).map(point => point.horizonElevation),
    ...(comparisonResult?.[chartZoom.target].rows ?? []).filter(row => Math.abs(relativeAzimuth(row.azimuth) - viewCenter) <= viewSpan / 2).map(row => row.elevation),
    ...(comparisonResult?.terrain?.horizons ?? []).filter(point => Math.abs(relativeAzimuth(point.azimuth) - viewCenter) <= viewSpan / 2).map(point => point.horizonElevation)
  ] : [];
  const zoomMinimum = zoomValues.length ? Math.max(-90, Math.min(...zoomValues) - 3) : -90;
  const zoomMaximum = zoomValues.length ? Math.min(90, Math.max(...zoomValues) + 3) : 90;
  const yMinimum = chartZoom ? zoomMinimum : -90;
  const yMaximum = chartZoom ? zoomMaximum : 90;
  const y = elevation => plot.bottom - (Math.max(yMinimum, Math.min(yMaximum, elevation)) - yMinimum) / (yMaximum - yMinimum) * (plot.bottom - plot.top);

  function drawTerrainHorizon(siteResult, isComparison) {
    const horizons = siteResult.terrain?.horizons;
    if (!horizons?.length) return;
    context.beginPath();
    context.strokeStyle = '#c8cdd2';
    context.lineWidth = 3;
    context.setLineDash(isComparison ? [2, 5] : [8, 5]);
    let started = false;
    let previousAzimuth;
    horizons.map(point => ({ point, azimuth: relativeAzimuth(point.azimuth) }))
      .filter(({ azimuth }) => !chartZoom ||
        (azimuth >= viewCenter - viewSpan / 2 && azimuth <= viewCenter + viewSpan / 2))
      .sort((first, second) => first.azimuth - second.azimuth)
      .forEach(({ point, azimuth }) => {
      if (previousAzimuth !== undefined && azimuth - previousAzimuth > 15) {
        context.stroke();
        context.beginPath();
        started = false;
      }
      const pointX = x(point.azimuth);
      const pointY = y(point.horizonElevation);
      if (!started) { context.moveTo(pointX, pointY); started = true; }
      else context.lineTo(pointX, pointY);
      previousAzimuth = azimuth;
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
  const elevationTicks = chartZoom
    ? Array.from({ length: 5 }, (_, index) => yMinimum + (yMaximum - yMinimum) * index / 4)
    : [-90, -60, -30, 0, 30, 60, 90];
  for (const elevation of elevationTicks) {
    const position = y(elevation);
    context.beginPath();
    context.strokeStyle = elevation === 0 ? muted : edge;
    context.setLineDash(elevation === 0 ? [4, 4] : []);
    context.moveTo(plot.left, position);
    context.lineTo(plot.right, position);
    context.stroke();
    context.fillText((chartZoom ? elevation.toFixed(1) : elevation) + '°', plot.left - 8, position);
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
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.translate(12, (plot.top + plot.bottom) / 2);
  context.rotate(-Math.PI / 2);
  context.fillText('Elevation', 0, 0);
  context.restore();

  const plottedTargets = chartZoom ? [chartZoom.target] : ['sun', 'earth'];
  const traces = plottedTargets.flatMap(target => {
    const color = target === 'sun' ? sunColor : earthColor;
    const siteATrace = { rows: result[target].rows, color, isComparison: false };
    return comparisonResult
      ? [siteATrace, { rows: comparisonResult[target].rows, color, isComparison: true }]
      : [siteATrace];
  });
  for (const { rows, color, isComparison } of traces) {
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
      context.lineWidth = isComparison ? 2 : 1.5;
      context.setLineDash(isComparison ? [6, 4] : []);
      for (const [startX, startY, endX, endY] of segments) {
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
      }
      context.stroke();
      context.setLineDash([]);
    }
    context.globalAlpha = 1;
  }

  const currentTargets = chartZoom ? [chartZoom.target] : ['sun', 'earth'];
  const currentTracks = currentTargets.flatMap(target => {
    const color = target === 'sun' ? sunColor : earthColor;
    const siteATrack = { row: result.rows[currentIndex][target], color, isComparison: false };
    return comparisonResult
      ? [siteATrack, { row: comparisonResult.rows[currentIndex][target], color, isComparison: true }]
      : [siteATrack];
  });
  for (const { row, color, isComparison } of currentTracks) {
    context.globalAlpha = row.elevation < 0 ? 0.35 : 1;
    context.beginPath();
    context.arc(x(row.azimuth), y(row.elevation), isComparison ? 8 : 7, 0, 2 * Math.PI);
    context.fillStyle = isComparison ? '#17191c' : color;
    context.shadowColor = color;
    context.shadowBlur = isComparison ? 0 : row.elevation < 0 ? 4 : 12;
    context.fill();
    context.shadowBlur = 0;
    context.strokeStyle = isComparison ? color : edge;
    context.lineWidth = isComparison ? 2 : 1;
    context.stroke();
    context.globalAlpha = 1;
  }
  drawTerrainHorizon(result, false);
  if (comparisonResult) drawTerrainHorizon(comparisonResult, true);
}

canvas.addEventListener('click', event => {
  if (!result?.rows.length) return;
  const bounds = canvas.getBoundingClientRect();
  const plotLeft = 58;
  const plotRight = canvas.clientWidth - 18;
  const clickAzimuth = chartZoom
    ? chartZoom.center - 30 + (event.clientX - bounds.left - plotLeft) / (plotRight - plotLeft) * 60
    : (event.clientX - bounds.left - plotLeft) / (plotRight - plotLeft) * 360;
  const angularDistance = azimuth => Math.abs(((azimuth - clickAzimuth + 540) % 360) - 180);
  if (chartZoom) chartZoom = undefined;
  else {
    const currentRows = [
      { target: 'sun', row: result.rows[currentIndex].sun },
      { target: 'earth', row: result.rows[currentIndex].earth },
      ...(comparisonResult ? [
        { target: 'sun', row: comparisonResult.rows[currentIndex].sun },
        { target: 'earth', row: comparisonResult.rows[currentIndex].earth }
      ] : [])
    ];
    const selected = currentRows.find(item => angularDistance(item.row.azimuth) <= 8);
    if (!selected) return;
    chartZoom = { target: selected.target, center: selected.row.azimuth };
  }
  updateCurrentReading();
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

function terrainHorizonAt(time, target, siteResult = result) {
  if (!siteResult.terrain?.horizons?.length) return 0;
  const rows = siteResult.rows;
  const firstTerrain = terrainAtAzimuth(siteResult.terrain.horizons, rows[0][target].azimuth);
  if (time <= Date.parse(rows[0].time)) {
    return firstTerrain?.horizonElevation ?? 0;
  }
  for (let index = 1; index < rows.length; index += 1) {
    const before = Date.parse(rows[index - 1].time);
    const after = Date.parse(rows[index].time);
    if (time <= after) {
      const progress = (time - before) / (after - before);
      const first = terrainAtAzimuth(siteResult.terrain.horizons, rows[index - 1][target].azimuth)?.horizonElevation ?? 0;
      const last = terrainAtAzimuth(siteResult.terrain.horizons, rows[index][target].azimuth)?.horizonElevation ?? 0;
      return first + (last - first) * progress;
    }
  }
  return terrainAtAzimuth(siteResult.terrain.horizons, rows[rows.length - 1][target].azimuth)?.horizonElevation ?? 0;
}

function updateVisibility(params) {
  const start = Date.parse(params.get('start') + ':00Z');
  const stop = Date.parse(params.get('stop') + ':00Z');
  const updateTargetVisibility = (label, target, rows, pie, value, duration, siteResult) => {
    const times = [start, ...rows.map(row => Date.parse(row.time)).filter(time => time > start && time < stop), stop];
    let above = 0;
    for (let index = 1; index < times.length; index += 1) {
      const interval = times[index] - times[index - 1];
      const first = elevationAt(times[index - 1], rows) - terrainHorizonAt(times[index - 1], target, siteResult);
      const last = elevationAt(times[index], rows) - terrainHorizonAt(times[index], target, siteResult);
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
    return percentage;
  };
  const sites = [{
    label: 'Site A',
    result,
    sun: [sunVisibilityPie, sunVisibilityValue, sunVisibilityDuration],
    earth: [earthVisibilityPie, earthVisibilityValue, earthVisibilityDuration]
  }];
  if (comparisonResult) {
    sites.push({
      label: 'Site B',
      result: comparisonResult,
      sun: [compareSunVisibilityPie, compareSunVisibilityValue, compareSunVisibilityDuration],
      earth: [compareEarthVisibilityPie, compareEarthVisibilityValue, compareEarthVisibilityDuration]
    });
  }
  for (const site of sites) {
    site.sunPercent = updateTargetVisibility(site.label + ' Sun', 'sun', site.result.sun.rows, ...site.sun, site.result);
    site.earthPercent = updateTargetVisibility(site.label + ' Earth', 'earth', site.result.earth.rows, ...site.earth, site.result);
    site.score = (site.sunPercent + site.earthPercent) / 2;
  }
  return sites;
}

function renderSiteRecommendation(sites) {
  siteRecommendation.hidden = !comparisonResult;
  if (!comparisonResult) return;

  if (sites.some(site => !Array.isArray(site.result.terrain?.horizons) || !site.result.terrain.horizons.length)) {
    recommendationTitle.textContent = 'Recommendation unavailable';
    recommendationDetails.textContent = 'Terrain data is missing for at least one site, so terrain-based Sun and Earth visibility cannot be compared reliably.';
    return;
  }

  const [siteA, siteB] = sites;
  const scoreA = Math.round(siteA.score * 10) / 10;
  const scoreB = Math.round(siteB.score * 10) / 10;
  recommendationTitle.textContent = scoreA === scoreB
    ? 'No clear preference — the sites are tied'
    : 'Recommendation: ' + (scoreA > scoreB ? 'Site A' : 'Site B');
  recommendationDetails.textContent =
    'Equal-weight visibility score (average time above local terrain): Site A ' + scoreA.toFixed(1) +
    '% (Sun ' + siteA.sunPercent.toFixed(1) + '%, Earth ' + siteA.earthPercent.toFixed(1) +
    '%); Site B ' + scoreB.toFixed(1) + '% (Sun ' + siteB.sunPercent.toFixed(1) +
    '%, Earth ' + siteB.earthPercent.toFixed(1) +
    '%). This compares Sun and Earth visibility equally and does not assess other landing risks.';
}

function targetStats(target, params, siteResult = result) {
  const rows = siteResult[target].rows;
  const start = Date.parse(params.get('start') + ':00Z');
  const stop = Date.parse(params.get('stop') + ':00Z');
  const times = [start, ...rows.map(row => Date.parse(row.time)).filter(time => time > start && time < stop), stop];
  let above = 0;
  let blocked = 0;
  let maximum = -90;
  for (let index = 1; index < times.length; index += 1) {
    const interval = times[index] - times[index - 1];
    const first = elevationAt(times[index - 1], rows) - terrainHorizonAt(times[index - 1], target, siteResult);
    const last = elevationAt(times[index], rows) - terrainHorizonAt(times[index], target, siteResult);
    maximum = Math.max(maximum, elevationAt(times[index - 1], rows), elevationAt(times[index], rows));
    if (first > 0 && last > 0) above += interval;
    else if (first > 0 && last <= 0) above += interval * first / (first - last);
    else if (first <= 0 && last > 0) above += interval * last / (last - first);
    blocked += interval - (first > 0 && last > 0 ? interval : 0);
  }
  const percentage = above / (stop - start) * 100;
  return { percentage, maximum, blockedPercentage: blocked / (stop - start) * 100 };
}

function updateAssessment(params) {
  const siteResult = assessmentSite === 'b' && comparisonResult ? comparisonResult : result;
  const siteParams = assessmentSite === 'b' && comparisonParams ? comparisonParams : params;
  const stats = { sun: targetStats('sun', siteParams, siteResult), earth: targetStats('earth', siteParams, siteResult) };
  for (const target of ['sun', 'earth']) {
    const current = assessment[target];
    const targetStatsValue = stats[target];
    const percentage = Math.round(targetStatsValue.percentage);
    current.visible.textContent = percentage >= 50 ? 'Strong' : percentage > 0 ? 'Limited' : 'Unavailable';
    current.time.textContent = percentage + '%';
    current.max.textContent = targetStatsValue.maximum.toFixed(1) + '°';
    current.obstruction.textContent = targetStatsValue.blockedPercentage < 10 ? 'Low' : targetStatsValue.blockedPercentage < 40 ? 'Moderate' : 'High';
  }
  const solar = stats.sun.percentage;
  const communications = stats.earth.percentage;
  const rating = solar >= 50 && communications >= 50 ? 'Promising site' : solar > 0 && communications > 0 ? 'Conditional site' : 'Challenging site';
  siteRating.textContent = rating;
  siteVerdict.textContent = solar >= 50 && communications >= 50
    ? 'Strong solar power and Earth communication windows.'
    : solar >= 50
      ? 'Good solar potential, but Earth visibility is limited.'
      : communications >= 50
        ? 'Strong Earth visibility, but limited solar availability.'
        : 'Both power and communication windows are limited by the terrain horizon.';
}

function openAssessmentModal() {
  if (!assessmentSection || !assessmentModal || !assessmentModalBody) return;
  assessmentModal.hidden = false;
  assessmentClose.focus();
}

function closeAssessmentModal() {
  if (!assessmentModal) return;
  assessmentModal.hidden = true;
}

assessmentLaunch.addEventListener('click', openAssessmentModal);
function setAssessmentSite(site) {
  assessmentSite = site;
  assessmentSiteA.classList.toggle('is-active', site === 'a');
  assessmentSiteB.classList.toggle('is-active', site === 'b');
  assessmentSiteA.setAttribute('aria-pressed', String(site === 'a'));
  assessmentSiteB.setAttribute('aria-pressed', String(site === 'b'));
  updateAssessment(site === 'b' ? comparisonParams : resultParams);
}
assessmentSiteA.addEventListener('click', () => setAssessmentSite('a'));
assessmentSiteB.addEventListener('click', () => setAssessmentSite('b'));
assessmentClose.addEventListener('click', closeAssessmentModal);
assessmentModal.addEventListener('click', event => {
  if (event.target === assessmentModal) closeAssessmentModal();
});
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !assessmentModal.hidden) closeAssessmentModal();
});

function updateCurrentReading() {
  currentIndex = Number(slider.value);
  const { time, sun, earth } = result.rows[currentIndex];
  const current = chartZoom ? result.rows[currentIndex][chartZoom.target] : result.rows[currentIndex].sun;
  const timeLabel = time.slice(0, 16).replace('T', ' ') + ' UTC';
  reading.textContent = timeLabel;
  const horizon = result.terrain ? terrainAtAzimuth(result.terrain.horizons, current.azimuth)?.horizonElevation : 0;
  const blocked = current.elevation >= 0 && current.elevation <= horizon;
  if (chartZoom) {
    selectedTargetLabel.textContent = chartZoom.target === 'sun' ? 'Sun' : 'Earth';
    selectedTargetLabel.className = chartZoom.target === 'sun' ? 'sun-color' : 'earth-color';
    selectedReading.textContent = current.azimuth.toFixed(1) + '° az · ' + current.elevation.toFixed(1) +
      '° el · ' + (blocked ? 'Blocked' : 'Clear') + ' · horizon ' + horizon.toFixed(1) + '°';
  } else {
    selectedTargetLabel.textContent = 'Sun + Earth';
    selectedTargetLabel.className = 'sun-color';
    selectedReading.textContent = 'Click a marker to zoom';
  }
  let accessibleReadings = timeLabel + ', Site A Sun azimuth ' + sun.azimuth.toFixed(1) +
    ' degrees, elevation ' + sun.elevation.toFixed(1) + ' degrees; Earth azimuth ' +
    earth.azimuth.toFixed(1) + ' degrees, elevation ' + earth.elevation.toFixed(1) + ' degrees';
  let chartDescription = 'At ' + timeLabel + ', Site A Sun azimuth ' + sun.azimuth.toFixed(1) +
    ' degrees and elevation ' + sun.elevation.toFixed(1) + ' degrees; Earth azimuth ' +
    earth.azimuth.toFixed(1) + ' degrees and elevation ' + earth.elevation.toFixed(1) + ' degrees.';
  if (comparisonResult) {
    const comparison = comparisonResult.rows[currentIndex];
    const formatDifference = value => (value > 0 ? '+' : '') + value.toFixed(1) + '°';
    const sunAzimuthDifference = ((comparison.sun.azimuth - sun.azimuth + 540) % 360) - 180;
    const earthAzimuthDifference = ((comparison.earth.azimuth - earth.azimuth + 540) % 360) - 180;
    compareSunReading.textContent = comparison.sun.azimuth.toFixed(1) + '° az · ' + comparison.sun.elevation.toFixed(1) + '° el';
    compareEarthReading.textContent = comparison.earth.azimuth.toFixed(1) + '° az · ' + comparison.earth.elevation.toFixed(1) + '° el';
    compareSunDifference.textContent = 'Δ vs A: ' + formatDifference(sunAzimuthDifference) + ' az · ' +
      formatDifference(comparison.sun.elevation - sun.elevation) + ' el';
    compareEarthDifference.textContent = 'Δ vs A: ' + formatDifference(earthAzimuthDifference) + ' az · ' +
      formatDifference(comparison.earth.elevation - earth.elevation) + ' el';
    accessibleReadings += '; Site B Sun azimuth ' + comparison.sun.azimuth.toFixed(1) +
      ' degrees, elevation ' + comparison.sun.elevation.toFixed(1) + ' degrees; Earth azimuth ' +
      comparison.earth.azimuth.toFixed(1) + ' degrees, elevation ' + comparison.earth.elevation.toFixed(1) + ' degrees';
    chartDescription += ' Site B Sun azimuth ' + comparison.sun.azimuth.toFixed(1) +
      ' degrees and elevation ' + comparison.sun.elevation.toFixed(1) + ' degrees; Earth azimuth ' +
      comparison.earth.azimuth.toFixed(1) + ' degrees and elevation ' + comparison.earth.elevation.toFixed(1) + ' degrees.';
  }
  slider.setAttribute('aria-valuetext', accessibleReadings);
  canvas.setAttribute('aria-label', chartDescription);
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

function renderResult(payload, params, comparison, comparisonParamsInput) {
  stopPlayback();
  result = payload;
  comparisonResult = comparison;
  resultParams = params;
  comparisonParams = comparisonParamsInput;
  tableDetails.hidden = true;
  tableToggle.setAttribute('aria-expanded', 'false');
  tableToggle.firstElementChild.textContent = 'View additional topographical information';
  tableToggle.lastElementChild.textContent = '+';
  assessmentSiteB.disabled = !comparisonResult;
  setAssessmentSite('a');
  page = 0;
  currentIndex = 0;
  slider.max = String(result.rows.length - 1);
  slider.value = '0';
  const site = params.get('latitude') + '°, ' + params.get('longitude') + '° E';
  const comparisonSite = comparisonParamsInput
    ? comparisonParamsInput.get('latitude') + '°, ' + comparisonParamsInput.get('longitude') + '° E'
    : '';
  summary.textContent = 'Sun + Earth · Site A ' + site +
    (comparisonResult ? ' · Site B ' + comparisonSite : '') + ' · ' + result.rows.length + ' samples';
  empty.hidden = true;
  data.hidden = false;
  comparisonReadings.hidden = !comparisonResult;
  comparisonVisibility.hidden = !comparisonResult;
  siteBKey.hidden = !comparisonResult;
  if (comparisonResult) {
    comparisonSiteLabel.textContent = 'Site B · ' + comparisonSite;
  }
  for (const header of comparisonTableHeaders) header.hidden = !comparisonResult;
  status.textContent = 'Loaded Sun and Earth ephemerides for ' + result.rows.length +
    ' matching time samples' + (comparisonResult ? ' at both sites.' : '.');
  terrainStatus.textContent = result.terrainPending
    ? 'Terrain horizon: loading Moon Trek elevation data…'
    : result.terrain?.horizons
    ? 'Terrain horizon: ' + result.terrain.horizons.length + ' azimuth samples at 10° resolution.'
    : 'Terrain profile unavailable: ' + (result.terrainError ?? 'Moon Trek did not return elevation data.') +
      ' Increase the observation step size and try again.';
  download.disabled = false;
  assessmentLaunch.disabled = false;
  updateAssessment(params);
  openAssessmentModal();
  renderTable();
  const siteVisibility = updateVisibility(params);
  renderSiteRecommendation(siteVisibility);
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

async function fetchSiteResults(params, label) {
  status.textContent = 'Requesting ' + label + ' Sun ephemeris from JPL Horizons…';
  const sun = await fetchTarget(params, 'sun');
  status.textContent = label + ' Sun data stored. Requesting Earth ephemeris from JPL Horizons…';
  const earth = await fetchTarget(params, 'earth');
  const combined = combineResults(sun, earth);
  status.textContent = 'Loading ' + label + ' terrain profile…';
  const terrainParams = new URLSearchParams({
    latitude: params.get('latitude'), longitude: params.get('longitude'), altitude: params.get('altitude')
  });
  const terrainResponse = await fetch('/api/terrain?' + terrainParams);
  const terrainPayload = await terrainResponse.json();
  if (terrainResponse.ok) combined.terrain = terrainPayload;
  else combined.terrainError = terrainPayload.error ?? 'Moon Trek did not return elevation data.';
  return combined;
}

function assertMatchingSamples(first, second) {
  if (first.rows.length !== second.rows.length ||
      first.rows.some((row, index) => row.time !== second.rows[index].time)) {
    throw new Error('The two sites returned different time samples. Try the comparison again.');
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  stopPlayback();
  const params = new URLSearchParams(new FormData(form));
  const comparisonParams = compareEnabled.checked ? new URLSearchParams(params) : undefined;
  for (const key of ['compareEnabled', 'compareLatitude', 'compareLongitude']) {
    params.delete(key);
    comparisonParams?.delete(key);
  }
  if (comparisonParams) {
    comparisonParams.set('latitude', compareLatitudeInput.value);
    comparisonParams.set('longitude', compareLongitudeInput.value);
  }
  comparisonResult = undefined;
  run.disabled = true;
  run.firstElementChild.textContent = comparisonParams ? 'Comparing sites…' : 'Running observation…';
  status.classList.remove('error');
  status.textContent = 'Preparing observation…';
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
    combined.terrainPending = true;
    status.textContent = 'Ephemeris loaded. Loading Moon Trek terrain horizon…';
    const terrainParams = new URLSearchParams({
      latitude: params.get('latitude'), longitude: params.get('longitude'), altitude: params.get('altitude'),
    });
    const terrainResponse = await fetch('/api/terrain?' + terrainParams);
    const terrainPayload = await terrainResponse.json();
    if (terrainResponse.ok) combined.terrain = terrainPayload;
    else combined.terrainError = terrainPayload.error ?? 'Moon Trek did not return elevation data.';
    combined.terrainPending = false;
    renderResult(combined, params, undefined, undefined);
    let comparison;
    if (comparisonParams) {
      comparison = await fetchSiteResults(comparisonParams, 'Site B');
      assertMatchingSamples(combined, comparison);
    }
    renderResult(combined, params, comparison, comparisonParams);
  } catch (error) {
    status.textContent = error instanceof SyntaxError ? 'The service returned an unexpected response.' : error.message;
    status.classList.add('error');
  } finally {
    run.disabled = false;
    run.firstElementChild.textContent = 'Run observation';
  }
});

function updateComparisonFields() {
  const enabled = compareEnabled.checked;
  compareCoordinates.hidden = !enabled;
  compareLatitudeInput.disabled = !enabled;
  compareLongitudeInput.disabled = !enabled;
}
compareEnabled.addEventListener('change', updateComparisonFields);
updateComparisonFields();

playback.addEventListener('click', () => {
  if (playbackTimer) stopPlayback();
  else startPlayback();
});
previous.addEventListener('click', () => { page -= 1; renderTable(); });
next.addEventListener('click', () => { page += 1; renderTable(); });
tableToggle.addEventListener('click', () => {
  const isVisible = !tableDetails.hidden;
  tableDetails.hidden = isVisible;
  tableToggle.setAttribute('aria-expanded', String(!isVisible));
  tableToggle.firstElementChild.textContent = isVisible
    ? 'View additional topographical information'
    : 'Hide additional topographical information';
  tableToggle.lastElementChild.textContent = isVisible ? '+' : '−';
});
slider.addEventListener('input', () => {
  stopPlayback();
  updateCurrentReading();
});
download.addEventListener('click', () => {
  const rows = result.rows.map(({ time, sun, earth }, index) => {
    const sunTerrain = result.terrain ? terrainAtAzimuth(result.terrain.horizons, sun.azimuth) : undefined;
    const earthTerrain = result.terrain ? terrainAtAzimuth(result.terrain.horizons, earth.azimuth) : undefined;
    const values = [time, sun.azimuth, sun.elevation,
      sunTerrain?.horizonElevation ?? '', sunTerrain ? sun.elevation >= 0 && sun.elevation <= sunTerrain.horizonElevation : '',
      earth.azimuth, earth.elevation,
      earthTerrain?.horizonElevation ?? '', earthTerrain ? earth.elevation >= 0 && earth.elevation <= earthTerrain.horizonElevation : ''];
    if (comparisonResult) {
      const { sun: compareSun, earth: compareEarth } = comparisonResult.rows[index];
      const compareSunTerrain = comparisonResult.terrain
        ? terrainAtAzimuth(comparisonResult.terrain.horizons, compareSun.azimuth) : undefined;
      const compareEarthTerrain = comparisonResult.terrain
        ? terrainAtAzimuth(comparisonResult.terrain.horizons, compareEarth.azimuth) : undefined;
      values.push(compareSun.azimuth, compareSun.elevation,
        compareSunTerrain?.horizonElevation ?? '',
        compareSunTerrain ? compareSun.elevation >= 0 && compareSun.elevation <= compareSunTerrain.horizonElevation : '',
        compareEarth.azimuth, compareEarth.elevation,
        compareEarthTerrain?.horizonElevation ?? '',
        compareEarthTerrain ? compareEarth.elevation >= 0 && compareEarth.elevation <= compareEarthTerrain.horizonElevation : '');
    }
    return values.join(',');
  });
  const headers = [comparisonResult
    ? 'timestamp_utc,site_a_sun_azimuth_deg,site_a_sun_elevation_deg,site_a_sun_terrain_horizon_deg,site_a_sun_terrain_blocked,site_a_earth_azimuth_deg,site_a_earth_elevation_deg,site_a_earth_terrain_horizon_deg,site_a_earth_terrain_blocked'
    : 'timestamp_utc,sun_azimuth_deg,sun_elevation_deg,sun_terrain_horizon_deg,sun_terrain_blocked,earth_azimuth_deg,earth_elevation_deg,earth_terrain_horizon_deg,earth_terrain_blocked'];
  if (comparisonResult) {
    headers.push('site_b_sun_azimuth_deg,site_b_sun_elevation_deg,site_b_sun_terrain_horizon_deg,site_b_sun_terrain_blocked,site_b_earth_azimuth_deg,site_b_earth_elevation_deg,site_b_earth_terrain_horizon_deg,site_b_earth_terrain_blocked');
  }
  const csv = [headers.join(','),
    ...rows].join('\n') + '\n';
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = comparisonResult ? 'moonwalkers-ephemeris-comparison.csv' : 'moonwalkers-ephemeris.csv';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});
new ResizeObserver(drawChart).observe(canvas);
