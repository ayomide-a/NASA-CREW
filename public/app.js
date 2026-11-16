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
const chartCanvases = {
  a: document.querySelector('#chart-a'),
  b: document.querySelector('#chart-b')
};
const chartContexts = {
  a: chartCanvases.a.getContext('2d'),
  b: chartCanvases.b.getContext('2d')
};
const slider = document.querySelector('#time-slider');
const playback = document.querySelector('#playback');
const reading = document.querySelector('#current-reading');
const sharedPlayback = document.querySelector('#shared-playback');
const sitePlayback = {
  a: {
    container: document.querySelector('#site-a-playback'),
    slider: document.querySelector('#time-slider-a'),
    button: document.querySelector('#playback-a'),
    reading: document.querySelector('#current-reading-a')
  },
  b: {
    container: document.querySelector('#site-b-playback'),
    slider: document.querySelector('#time-slider-b'),
    button: document.querySelector('#playback-b'),
    reading: document.querySelector('#current-reading-b')
  }
};
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
const objectiveTerrainScore = document.querySelector('#objective-terrain-score');
const objectiveSolarAngleScore = document.querySelector('#objective-solar-angle-score');
const objectiveSunlightScore = document.querySelector('#objective-sunlight-score');
const objectiveEarthScore = document.querySelector('#objective-earth-score');
const objectiveTerrainDetail = document.querySelector('#objective-terrain-detail');
const objectiveSolarAngleDetail = document.querySelector('#objective-solar-angle-detail');
const objectiveSunlightDetail = document.querySelector('#objective-sunlight-detail');
const objectiveEarthDetail = document.querySelector('#objective-earth-detail');
const objectiveOverall = document.querySelector('#objective-overall');
const objectiveLogic = document.querySelector('#objective-logic');
const objectiveWarnings = document.querySelector('#objective-warnings');
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
const mapViewSelect = document.querySelector('#map-view');
const map2d = document.querySelector('#map-2d');
const mapOnlyElements = document.querySelectorAll('[data-map-only]');
const mapInstructions = document.querySelector('#map-instructions');
const globeMode = document.querySelector('#globe-mode');
const mapMode = document.querySelector('#map-mode');
const globePanel = document.querySelector('#site-globe');
const globeStage = document.querySelector('.globe-stage');
const globeList = document.querySelector('#globe-site-list');
const globeStatus = document.querySelector('#globe-status');
const globeReset = document.querySelector('#globe-reset');
const lolaStatus = document.querySelector('#lola-status');
const quantStats = document.querySelector('#quant-stats');
const demDetails = document.querySelector('#dem-details');
const lolaPreview = document.querySelector('#lola-preview');
const lolaSpotPreview = document.querySelector('#lola-spot-preview');
const lolaPrevView = document.querySelector('#lola-prev-view');
const lolaNextView = document.querySelector('#lola-next-view');
const lolaViewLabel = document.querySelector('#lola-view-label');
const poiCount = document.querySelector('#poi-count');
const poiPicker = document.querySelector('#poi-picker');
const poiOptions = document.querySelector('#poi-options');
const poiStatus = document.querySelector('#poi-status');
const regionCount = document.querySelector('#region-count');
const regionPicker = document.querySelector('#region-picker');
const regionOptions = document.querySelector('#region-options');
const regionStatus = document.querySelector('#region-status');
const regionPopupElement = document.querySelector('#region-popup');
const regionPopupName = document.querySelector('#region-popup-name');
const regionAboutPanel = document.querySelector('#region-about-panel');
const regionAboutTitle = document.querySelector('#region-about-title');
const regionAboutDescription = document.querySelector('#region-about-description');
const regionAboutSource = document.querySelector('#region-about-source');
const closeRegionAbout = document.querySelector('#close-region-about');
const latitudeInput = form.elements.namedItem('latitude');
const longitudeInput = form.elements.namedItem('longitude');
const startInput = form.elements.namedItem('start');
const stopInput = form.elements.namedItem('stop');
const compareStartInput = document.querySelector('#compare-start');
const compareStopInput = document.querySelector('#compare-stop');
const separateWindowControl = document.querySelector('#separate-window-control');
const separateWindows = document.querySelector('#separate-windows');
const siteBTimeWindow = document.querySelector('#site-b-time-window');
const sharedWindowNote = document.querySelector('#shared-window-note');
const siteACoordinates = document.querySelector('#site-a-coordinates');
const siteBCoordinates = document.querySelector('#site-b-coordinates');
const siteAMapPickButton = document.querySelector('#site-a-map-pick');
const siteBMapPickButton = document.querySelector('#site-b-map-pick');
const siteAMapStatus = document.querySelector('#site-a-map-status');
const siteBMapStatus = document.querySelector('#site-b-map-status');
const siteBMapCard = document.querySelector('#site-b-map-card');
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
const siteBChartPanel = document.querySelector('#site-b-chart-panel');
const siteAChartTitle = document.querySelector('#site-a-chart-title');
const siteBChartTitle = document.querySelector('#site-b-chart-title');
const siteRecommendation = document.querySelector('#site-recommendation');
const recommendationTitle = document.querySelector('#recommendation-title');
const recommendationDetails = document.querySelector('#recommendation-details');
let comparisonResult;
let comparisonParams;
let resultParams;
let assessmentSite = 'a';
const currentIndices = { a: 0, b: 0 };
let playbackTimer;
const sitePlaybackTimers = { a: undefined, b: undefined };
let comparisonUsesSeparateWindows = false;
let pointsOfInterest = [];
let globeSites = [];
let globe;
let globeInitialization;
const globeSiteButtons = new Map();
const visibleGlobePoiIndexes = new Set();
let focusedGlobeSite;
const selectedPoiIndexes = new Set();
let regions = [];
const selectedRegionIndexes = new Set();
let activeRegionIndex;
let activeAboutRegionIndex;
const chartZoom = { a: undefined, b: undefined };
let lolaRequest;
const lolaTileViews = [];
let lolaTileViewIndex = 0;
const assessmentLolaData = { a: undefined, b: undefined };
const assessmentLolaCache = new Map();

function renderLolaTileView() {
  if (!lolaPreview || !lolaSpotPreview || !lolaPrevView || !lolaNextView || !lolaViewLabel) return;
  const hasViews = lolaTileViews.length > 0;
  lolaPreview.hidden = true;
  lolaSpotPreview.hidden = true;
  if (!hasViews) {
    lolaViewLabel.textContent = 'No tile';
    lolaPrevView.disabled = true;
    lolaNextView.disabled = true;
    return;
  }
  const current = lolaTileViews[lolaTileViewIndex];
  if (current?.key === 'dem') lolaPreview.hidden = false;
  if (current?.key === 'spot') lolaSpotPreview.hidden = false;
  lolaViewLabel.textContent = current?.label ?? 'Tile';
  const canNavigate = lolaTileViews.length > 1;
  lolaPrevView.disabled = !canNavigate;
  lolaNextView.disabled = !canNavigate;
}

function cycleLolaTileView(direction) {
  if (lolaTileViews.length < 2) return;
  lolaTileViewIndex = (lolaTileViewIndex + direction + lolaTileViews.length) % lolaTileViews.length;
  renderLolaTileView();
}

lolaPrevView?.addEventListener('click', () => cycleLolaTileView(-1));
lolaNextView?.addEventListener('click', () => cycleLolaTileView(1));
let activeSiteSelection = 'a';

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
const regionSource = new ol.source.Vector();

function regionColor(index, opacity) {
  const hue = ((index * 137.508) % 360).toFixed(1);
  return opacity === undefined ?
    'hsl(' + hue + ' 76% 57%)' :
    'hsla(' + hue + ', 76%, 57%, ' + opacity + ')';
}

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
    lolaStatus.textContent = 'Lunar imagery could not be loaded. You can still select coordinates.';
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
      source: regionSource,
      style: feature => new ol.style.Style({
        fill: new ol.style.Fill({ color: regionColor(feature.get('regionIndex'), 0.26) }),
        stroke: new ol.style.Stroke({ color: regionColor(feature.get('regionIndex')), width: 2 })
      })
    }),
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
      style: feature => {
        const color = feature.get('site') === 'B' ? '#bce4f7' : '#ffc384';
        const halo = feature.get('site') === 'B'
          ? 'rgba(188, 228, 247, 0.2)'
          : 'rgba(255, 195, 132, 0.2)';
        return [
          new ol.style.Style({
            image: new ol.style.Circle({
              radius: 11,
              fill: new ol.style.Fill({ color: halo })
            })
          }),
          new ol.style.Style({
            image: new ol.style.Circle({
              radius: 6,
              fill: new ol.style.Fill({ color }),
              stroke: new ol.style.Stroke({ color: '#101113', width: 2 })
            }),
            text: new ol.style.Text({
              text: feature.get('site'),
              offsetY: -14,
              font: '600 10px "DM Sans", sans-serif',
              fill: new ol.style.Fill({ color }),
              stroke: new ol.style.Stroke({ color: '#101113', width: 3 })
            })
          })
        ];
      }
    })
  ],
  view: createMapView('global')
});

const regionPopupOverlay = new ol.Overlay({
  element: regionPopupElement,
  positioning: 'bottom-center',
  offset: [0, -12],
  stopEvent: true
});
lunarMap.addOverlay(regionPopupOverlay);

function hideRegionPopup() {
  activeRegionIndex = undefined;
  regionPopupElement.hidden = true;
  regionPopupOverlay.setPosition(undefined);
}

function showRegionPopup(index, coordinate) {
  const region = regions[index];
  if (!region) return;
  activeRegionIndex = index;
  regionPopupName.textContent = region.name;
  regionPopupElement.hidden = false;
  regionPopupOverlay.setPosition(coordinate);
}

function hideRegionAbout() {
  activeAboutRegionIndex = undefined;
  regionAboutPanel.hidden = true;
}

function showRegionAbout(index) {
  const region = regions[index];
  if (!region || (!region.description && globePanel.hidden)) {
    hideRegionAbout();
    return;
  }
  activeAboutRegionIndex = index;
  regionAboutTitle.textContent = region.name;
  regionAboutDescription.textContent = region.description;
  regionAboutDescription.hidden = !region.description;
  if (region.descriptionSource) {
    regionAboutSource.href = region.descriptionSource;
    regionAboutSource.hidden = false;
  } else {
    regionAboutSource.removeAttribute('href');
    regionAboutSource.hidden = true;
  }
  regionAboutPanel.hidden = false;
}

closeRegionAbout.addEventListener('click', hideRegionAbout);

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
  selectActiveSite(site.latitude, site.longitude);
  if (activeSiteSelection === 'a') updateObservationWindow(site);
}

function validSiteCoordinates(latitudeField, longitudeField) {
  const latitude = Number(latitudeField.value);
  const longitude = Number(longitudeField.value);
  if (!latitudeField.value.trim() || !longitudeField.value.trim() ||
      !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 360) {
    return undefined;
  }
  return { latitude, longitude };
}

function updateMapMarkers() {
  updateSiteCoordinateLabels();
  updateGlobeSelectionMarkers();
  markerSource.clear();
  const mapView = mapViewSelect.value;
  const extent = mapView === 'global' ? lunarExtent : northPolarExtent;
  const sites = [
    { label: 'A', coordinates: validSiteCoordinates(latitudeInput, longitudeInput) },
    {
      label: 'B',
      coordinates: compareEnabled.checked
        ? validSiteCoordinates(compareLatitudeInput, compareLongitudeInput)
        : undefined
    }
  ];

  for (const { label, coordinates } of sites) {
    if (!coordinates) continue;
    const point = coordinateForSite(coordinates.latitude, coordinates.longitude, mapView);
    if (point[0] < extent[0] || point[0] > extent[2] ||
        point[1] < extent[1] || point[1] > extent[3]) continue;
    const feature = new ol.Feature(new ol.geom.Point(point));
    feature.set('site', label);
    markerSource.addFeature(feature);
  }
}

function updateGlobeSelectionMarkers() {
  const sites = [];
  const siteA = validSiteCoordinates(latitudeInput, longitudeInput);
  const siteB = compareEnabled.checked
    ? validSiteCoordinates(compareLatitudeInput, compareLongitudeInput)
    : undefined;
  if (siteA) sites.push({ label: 'A', ...siteA });
  if (siteB) sites.push({ label: 'B', ...siteB });
  globe?.setSelectionSites(sites);
}

function formatSiteCoordinates(coordinates) {
  const longitude = eastLongitude(coordinates.longitude);
  return 'Lat ' + coordinates.latitude.toFixed(3) + '° · Lon ' + longitude.toFixed(3) + '° E';
}

function updateSiteCoordinateLabels() {
  const siteA = validSiteCoordinates(latitudeInput, longitudeInput);
  const siteB = validSiteCoordinates(compareLatitudeInput, compareLongitudeInput);
  siteACoordinates.textContent = siteA
    ? formatSiteCoordinates(siteA)
    : 'Enter valid coordinates in Observation Setup.';
  siteBCoordinates.textContent = siteB
    ? formatSiteCoordinates(siteB)
    : 'Enter valid coordinates in Observation Setup.';
}

function updateSelectedSite(latitude, longitude) {
  const longitudeEast = eastLongitude(longitude);
  latitudeInput.value = latitude.toFixed(6);
  longitudeInput.value = longitudeEast.toFixed(6);
  updateGlobeSelection();
  updateMapMarkers();
  updateLolaDem(latitude, longitudeEast);
}

function selectActiveSite(latitude, longitude) {
  if (activeSiteSelection === 'b' && compareEnabled.checked) {
    const longitudeEast = eastLongitude(longitude);
    compareLatitudeInput.value = latitude.toFixed(6);
    compareLongitudeInput.value = longitudeEast.toFixed(6);
    updateMapMarkers();
    return;
  }
  updateSelectedSite(latitude, longitude);
}

function updateLolaDem(latitude, longitudeEast) {
  if (!lolaStatus || !quantStats || !demDetails || !lolaPreview) return;
  if (lolaRequest) lolaRequest.abort();
  lolaRequest = new AbortController();
  lolaStatus.textContent = 'Loading LOLA DEM tile and terrain metrics…';
  quantStats.textContent = 'DEM quantitative metrics pending.';
  demDetails.textContent = 'Aspect, roughness, curvature, and hazard indicators pending.';
  lolaTileViews.length = 0;
  lolaTileViewIndex = 0;
  lolaPreview.hidden = true;
  if (lolaSpotPreview) lolaSpotPreview.hidden = true;
  renderLolaTileView();

  const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitudeEast) });
  fetch('/api/lola?' + params, { signal: lolaRequest.signal })
    .then(async response => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'LOLA DEM request failed.');
      const siteKey = latitude.toFixed(4) + '|' + longitudeEast.toFixed(4);
      assessmentLolaCache.set(siteKey, payload);
      assessmentLolaData.a = payload;
      lolaPreview.src = payload.tile.previewUrl;
      lolaTileViews.push({ key: 'dem', label: 'DEM tile' });
      if (payload.spotObservations?.previewDataUrl && lolaSpotPreview) {
        lolaSpotPreview.src = payload.spotObservations.previewDataUrl;
        lolaTileViews.push({ key: 'spot', label: 'Spot observations' });
      }
      lolaTileViewIndex = 0;
      renderLolaTileView();

      const stats = payload.topography?.elevation;
      const local = payload.topography?.local;
      const aspect = payload.topography?.aspect;
      const roughness = payload.topography?.roughness;
      const curvature = payload.topography?.curvature;
      const hazard = payload.topography?.hazard;

      lolaStatus.textContent = payload.dataset.title + ' loaded for Lat ' + latitude.toFixed(3) +
        '°, Lon ' + longitudeEast.toFixed(3) + '° E.';

      if (stats && local) {
        quantStats.textContent =
          'Site elevation: ' + payload.elevationMeters.toFixed(1) + ' m\n' +
          'Min/Max: ' + stats.minMeters.toFixed(1) + ' / ' + stats.maxMeters.toFixed(1) + ' m\n' +
          'Mean/Median: ' + stats.meanMeters.toFixed(1) + ' / ' + stats.medianMeters.toFixed(1) + ' m\n' +
          'Std dev: ' + stats.stdDevMeters.toFixed(2) + ' m\n' +
          'Slope (avg/max): ' + local.slopeMeanDeg.toFixed(2) + '° / ' + local.slopeMaxDeg.toFixed(2) + '°';
      } else {
        quantStats.textContent = 'Site ' + payload.elevationMeters.toFixed(1) +
          ' m · detailed topography metrics unavailable for this request.';
      }

      if (aspect && roughness && curvature && hazard) {
        demDetails.textContent =
          'Aspect (downslope): ' + aspect.downslopeAzimuthDeg.toFixed(1) + '°\n' +
          'Roughness RMS / TRI: ' + roughness.rmsMeters.toFixed(2) + ' / ' + roughness.triMeters.toFixed(2) + ' m\n' +
          'Moving roughness std: ' + roughness.movingWindowStdDevMeters.toFixed(2) + ' m\n' +
          'Curvature (profile/plan/total): ' + curvature.profileMeanPerMeter.toExponential(2) + ' / ' +
          curvature.planMeanPerMeter.toExponential(2) + ' / ' + curvature.totalPerMeter.toExponential(2) + '\n' +
          'Local relief: ' + hazard.localReliefMeters.toFixed(1) + ' m\n' +
          'Slope > 10°: ' + (hazard.slopeExceedanceFractions.over10Deg * 100).toFixed(1) + '%\n' +
          'Open sky: ' + (hazard.horizonExposure.openSkyFraction * 100).toFixed(1) + '%';
      } else {
        demDetails.textContent = 'Aspect, roughness, curvature, and hazard indicators are unavailable for this request.';
      }

      if (payload.topographyError) {
        demDetails.textContent = 'Topography note: ' + payload.topographyError;
      }

      if (!payload.spotObservations?.previewDataUrl) {
        demDetails.textContent += ' LOLA spot observations are unavailable for this location.';
      }

      if (resultParams) updateAssessment(resultParams);
    })
    .catch(error => {
      if (error.name === 'AbortError') return;
      lolaStatus.textContent = 'LOLA DEM unavailable: ' + error.message;
      quantStats.textContent = 'DEM quantitative metrics unavailable.';
      demDetails.textContent = 'Could not compute aspect, roughness, curvature, or hazard indicators.';
      lolaTileViews.length = 0;
      lolaTileViewIndex = 0;
      lolaPreview.hidden = true;
      if (lolaSpotPreview) lolaSpotPreview.hidden = true;
      renderLolaTileView();
    })
    .finally(() => {
      lolaRequest = undefined;
    });
}

async function loadAssessmentLola(siteKey, params) {
  const latitude = Number(params?.get('latitude'));
  const longitude = Number(params?.get('longitude'));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
  const cacheKey = latitude.toFixed(4) + '|' + eastLongitude(longitude).toFixed(4);
  if (assessmentLolaCache.has(cacheKey)) {
    assessmentLolaData[siteKey] = assessmentLolaCache.get(cacheKey);
    updateAssessment(siteKey === 'b' ? comparisonParams : resultParams);
    return;
  }
  try {
    const query = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });
    const response = await fetch('/api/lola?' + query);
    const payload = await response.json();
    if (!response.ok) return;
    assessmentLolaCache.set(cacheKey, payload);
    assessmentLolaData[siteKey] = payload;
    updateAssessment(siteKey === 'b' ? comparisonParams : resultParams);
  } catch {
    // Keep assessment resilient when LOLA topography fetch fails.
  }
}

function updateMarkerFromInputs() {
  const coordinates = validSiteCoordinates(latitudeInput, longitudeInput);
  if (!coordinates) {
    highlightGlobeSite();
    updateMapMarkers();
    return;
  }
  updateSelectedSite(coordinates.latitude, coordinates.longitude);
}

function highlightGlobeSite(site) {
  globe?.select(site);
}

function updateGlobeSelection() {
  const site = globeSites.find(site => site.latitude.toFixed(6) === latitudeInput.value &&
    eastLongitude(site.longitude).toFixed(6) === longitudeInput.value);
  highlightGlobeSite(site);
}

function chooseGlobeSite(site) {
  const index = globeSites.indexOf(site);
  if (index >= 0) visibleGlobePoiIndexes.add(index);
  focusedGlobeSite = site;
  updateGlobePins();
  updateGlobeSiteButtons();
  if (activeSiteSelection === 'b' && compareEnabled.checked) {
    selectActiveSite(site.latitude, site.longitude);
    globe?.select(site);
    globe?.focus(site);
    return;
  }
  selectActiveSite(site.latitude, site.longitude);
  globe?.focus(site);
}

function toggleGlobeSite(site) {
  if (activeSiteSelection === 'b' && compareEnabled.checked) {
    chooseGlobeSite(site);
    return;
  }
  const index = globeSites.indexOf(site);
  if (visibleGlobePoiIndexes.has(index) && focusedGlobeSite === site) {
    visibleGlobePoiIndexes.delete(index);
    const nextIndex = [...visibleGlobePoiIndexes].pop();
    if (nextIndex === undefined) {
      focusedGlobeSite = undefined;
      updateGlobePins();
      updateGlobeSiteButtons();
      globe?.focus();
    } else {
      chooseGlobeSite(globeSites[nextIndex]);
    }
    return;
  }
  chooseGlobeSite(site);
}

function updateGlobePins() {
  globe?.setSites([...visibleGlobePoiIndexes].map(index => pointsOfInterest[index]));
  updateGlobeSelectionMarkers();
}

function updateGlobeSiteButtons() {
  for (const [site, button] of globeSiteButtons) {
    button.setAttribute('aria-pressed', String(visibleGlobePoiIndexes.has(globeSites.indexOf(site))));
  }
}

function renderGlobeSites() {
  globeSites = pointsOfInterest;
  globeSiteButtons.clear();
  if (!globeSites.length) {
    globeList.textContent = 'No points of interest found.';
    return;
  }

  const groups = new Map();
  globeSites.forEach((site, index) => {
    const program = poiProgram(site.mission);
    if (!groups.has(program)) groups.set(program, []);
    groups.get(program).push({ site, index });
  });

  const sections = [...groups].map(([program, sites]) => {
    const group = document.createElement('section');
    group.className = 'globe-program';

    const heading = document.createElement('div');
    heading.className = 'poi-program-heading';
    const name = document.createElement('strong');
    name.className = 'globe-program-name';
    name.textContent = program;

    const expander = document.createElement('button');
    expander.type = 'button';
    expander.className = 'poi-program-expander';
    expander.setAttribute('aria-expanded', 'false');
    expander.setAttribute('aria-label', 'Expand ' + program + ' missions');
    expander.textContent = sites.length + (sites.length === 1 ? ' mission' : ' missions');

    const items = document.createElement('div');
    items.className = 'globe-program-items';
    items.setAttribute('role', 'group');
    items.setAttribute('aria-label', program + ' missions');
    items.hidden = true;

    expander.addEventListener('click', () => {
      items.hidden = !items.hidden;
      expander.setAttribute('aria-expanded', String(!items.hidden));
      expander.setAttribute('aria-label',
        (items.hidden ? 'Expand ' : 'Collapse ') + program + ' missions');
    });

    for (const { site, index } of sites) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'globe-site-button';
      button.setAttribute('aria-pressed', String(visibleGlobePoiIndexes.has(index)));
      const title = document.createElement('strong');
      title.textContent = site.mission;
      const coords = document.createElement('small');
      coords.textContent = Math.abs(site.latitude).toFixed(3) + '° ' + (site.latitude < 0 ? 'S' : 'N') +
        ' · ' + Math.abs(site.longitude).toFixed(3) + '° ' + (site.longitude < 0 ? 'W' : 'E');
      button.append(title, coords);
      button.addEventListener('click', () => toggleGlobeSite(site));
      globeSiteButtons.set(site, button);
      items.append(button);
    }

    heading.append(name, expander);
    group.append(heading, items);
    return group;
  });
  globeList.replaceChildren(...sections);
  updateGlobePins();
  updateGlobeSiteButtons();
  updateGlobeSelection();
}

async function initializeGlobe() {
  try {
    const { createMoonGlobe } = await import('./moon-globe.js');
    globe = await createMoonGlobe({
      viewport: document.querySelector('#globe-canvas'),
      pinLayer: document.querySelector('#globe-pins'),
      onSelect: chooseGlobeSite,
      onRegionSelect(index, latitude, longitude) {
        showRegionAbout(index);
        selectActiveSite(latitude, longitude);
      },
      onSurfaceSelect(latitude, longitude) {
        selectActiveSite(latitude, longitude);
      }
    });
    updateGlobePins();
    updateGlobeSelection();
    updateGlobeRegions();
    if (activeAboutRegionIndex !== undefined) focusGlobeRegions([activeAboutRegionIndex]);
    globeStatus.hidden = true;
    globeReset.disabled = false;
  } catch (error) {
    globeStatus.textContent = 'The 3D globe couldn’t load. Choose a point of interest from the list or use the 2D map.';
    console.warn('Could not initialize the 3D Moon:', error);
  }
}

function showSiteView(isGlobe) {
  globeMode.setAttribute('aria-pressed', String(isGlobe));
  mapMode.setAttribute('aria-pressed', String(!isGlobe));
  globePanel.hidden = !isGlobe;
  map2d.hidden = isGlobe;
  for (const element of mapOnlyElements) element.hidden = isGlobe;
  (isGlobe ? globeStage : map2d).append(regionAboutPanel);
  updateMapInstructions();
  if (isGlobe) globeInitialization ??= initializeGlobe();
  else lunarMap.updateSize();
}

function updateMapInstructions() {
  const isGlobe = !globePanel.hidden;
  const activeSite = activeSiteSelection === 'a' ? 'Site A' : 'Site B';
  mapInstructions.textContent = isGlobe
    ? 'Click the globe surface or choose a point of interest to set ' + activeSite + '.'
    : 'Click the Moon to set ' + activeSite + '.';
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

function poiProgram(mission) {
  const programs = [
    [/^Apollo\b/i, 'Apollo'],
    [/^(?:IM-\d+|Intuitive Machines)\b/i, 'Intuitive Machines'],
    [/^Blue Ghost\b/i, 'Blue Ghost'],
    [/^Chandrayaan\b/i, 'Chandrayaan'],
    [/^Chang['’]e\b/i, "Chang'e"],
    [/^Luna\b/i, 'Luna'],
    [/^Surveyor\b/i, 'Surveyor'],
    [/^SLIM\b/i, 'SLIM']
  ];
  return programs.find(([pattern]) => pattern.test(mission))?.[1] || 'Other missions';
}

function updatePoiSelection() {
  poiCount.textContent = selectedPoiIndexes.size + ' selected';
  updatePoiHighlights();
}

function renderPoiOptions() {
  if (!pointsOfInterest.length) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No sites configured. Add entries to public/data/points-of-interest.json.';
    poiOptions.replaceChildren(emptyMessage);
    return;
  }

  const groups = new Map();
  pointsOfInterest.forEach((site, index) => {
    const program = poiProgram(site.mission);
    if (!groups.has(program)) groups.set(program, []);
    groups.get(program).push({ site, index });
  });

  const options = [...groups].map(([program, entries]) => {
    const group = document.createElement('section');
    group.className = 'poi-program';

    const heading = document.createElement('div');
    heading.className = 'poi-program-heading';

    const groupLabel = document.createElement('label');
    groupLabel.className = 'poi-program-toggle';
    const groupCheckbox = document.createElement('input');
    groupCheckbox.type = 'checkbox';
    groupCheckbox.setAttribute('aria-label', 'Select all ' + program + ' missions');

    const groupName = document.createElement('span');
    groupName.textContent = program;
    groupLabel.append(groupCheckbox, groupName);

    const expander = document.createElement('button');
    expander.type = 'button';
    expander.className = 'poi-program-expander';
    expander.setAttribute('aria-expanded', 'false');
    expander.setAttribute('aria-label', 'Expand ' + program + ' missions');
    expander.textContent = entries.length + (entries.length === 1 ? ' mission' : ' missions');
    const items = document.createElement('div');
    items.className = 'poi-program-items';
    items.setAttribute('role', 'group');
    items.setAttribute('aria-label', program + ' missions');
    items.hidden = true;
    const itemCheckboxes = [];

    expander.addEventListener('click', () => {
      items.hidden = !items.hidden;
      expander.setAttribute('aria-expanded', String(!items.hidden));
      expander.setAttribute('aria-label', (items.hidden ? 'Expand ' : 'Collapse ') + program + ' missions');
    });

    function syncGroupCheckbox() {
      const selectedCount = entries.filter(({ index }) => selectedPoiIndexes.has(index)).length;
      groupCheckbox.checked = selectedCount === entries.length;
      groupCheckbox.indeterminate = selectedCount > 0 && selectedCount < entries.length;
    }

    for (const { site, index } of entries) {
      const label = document.createElement('label');
      label.className = 'poi-option';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = String(index);
      checkbox.checked = selectedPoiIndexes.has(index);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          selectedPoiIndexes.add(index);
          selectPoiSite(site);
        } else {
          selectedPoiIndexes.delete(index);
        }
        syncGroupCheckbox();
        updatePoiSelection();
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
      items.append(label);
      itemCheckboxes.push(checkbox);
    }

    groupCheckbox.addEventListener('change', () => {
      for (const checkbox of itemCheckboxes) {
        const index = Number(checkbox.value);
        checkbox.checked = groupCheckbox.checked;
        if (groupCheckbox.checked) selectedPoiIndexes.add(index);
        else selectedPoiIndexes.delete(index);
      }
      if (groupCheckbox.checked) selectPoiSite(entries[0].site);
      updatePoiSelection();
    });

    syncGroupCheckbox();
    heading.append(groupLabel, expander);
    group.append(heading, items);
    return group;
  });
  poiOptions.replaceChildren(...options);
}

function angularDistanceBetween(start, end) {
  const radians = point => {
    const longitude = point[0] * Math.PI / 180;
    const latitude = point[1] * Math.PI / 180;
    return [
      Math.cos(latitude) * Math.cos(longitude),
      Math.cos(latitude) * Math.sin(longitude),
      Math.sin(latitude)
    ];
  };
  const first = radians(start);
  const second = radians(end);
  const dot = Math.max(-1, Math.min(1,
    first[0] * second[0] + first[1] * second[1] + first[2] * second[2]));
  return Math.acos(dot);
}

function greatCirclePoint(start, end, fraction) {
  const radians = point => {
    const longitude = point[0] * Math.PI / 180;
    const latitude = point[1] * Math.PI / 180;
    return [
      Math.cos(latitude) * Math.cos(longitude),
      Math.cos(latitude) * Math.sin(longitude),
      Math.sin(latitude)
    ];
  };
  const first = radians(start);
  const second = radians(end);
  const angle = angularDistanceBetween(start, end);
  if (angle < 1e-8) return [start[0], start[1]];

  const scale = Math.sin(angle);
  const firstScale = Math.sin((1 - fraction) * angle) / scale;
  const secondScale = Math.sin(fraction * angle) / scale;
  const x = first[0] * firstScale + second[0] * secondScale;
  const y = first[1] * firstScale + second[1] * secondScale;
  const z = first[2] * firstScale + second[2] * secondScale;
  return [
    Math.atan2(y, x) * 180 / Math.PI,
    Math.atan2(z, Math.hypot(x, y)) * 180 / Math.PI
  ];
}

function densifyGeographicRing(ring) {
  const coordinates = [];
  for (let index = 0; index < ring.length - 1; index++) {
    const start = ring[index];
    const end = ring[index + 1];
    const segments = Math.max(1, Math.ceil(
      angularDistanceBetween(start, end) * lunarRadius / 10000
    ));
    for (let segment = 0; segment < segments; segment++) {
      coordinates.push(greatCirclePoint(start, end, segment / segments));
    }
  }
  coordinates.push(ring[ring.length - 1]);
  return coordinates;
}

function projectGeographicRing(ring, mapView) {
  const coordinates = densifyGeographicRing(ring);
  if (mapView !== 'global') {
    return coordinates.map(([longitude, latitude]) =>
      coordinateForSite(latitude, longitude, mapView)
    );
  }

  let previousLongitude;
  return coordinates.map(([longitude, latitude], index) => {
    if (index > 0) {
      while (longitude - previousLongitude > 180) longitude -= 360;
      while (longitude - previousLongitude < -180) longitude += 360;
    }
    previousLongitude = longitude;
    return [longitude, latitude];
  });
}

function updateRegionHighlights() {
  if (activeRegionIndex !== undefined && !selectedRegionIndexes.has(activeRegionIndex)) {
    hideRegionPopup();
  }
  const mapView = mapViewSelect.value;
  const features = [...selectedRegionIndexes].flatMap(index => {
    const region = regions[index];
    const projectedRings = region.coordinates.map(ring => projectGeographicRing(ring, mapView));
    let minLongitude = Infinity;
    let maxLongitude = -Infinity;
    projectedRings.forEach(ring => ring.forEach(([longitude]) => {
      minLongitude = Math.min(minLongitude, longitude);
      maxLongitude = Math.max(maxLongitude, longitude);
    }));
    const offsets = mapView === 'global' ?
      [0, ...(minLongitude < -180 ? [360] : []),
        ...(maxLongitude > 180 ? [-360] : [])] : [0];
    return offsets.map(offset => {
      const rings = offset === 0 ? projectedRings :
        projectedRings.map(ring => ring.map(([x, y]) => [x + offset, y]));
      const feature = new ol.Feature(new ol.geom.Polygon(rings));
      feature.set('regionIndex', index);
      return feature;
    });
  });
  regionSource.clear();
  regionSource.addFeatures(features);
}

function updateRegionSelection() {
  regionCount.textContent = selectedRegionIndexes.size + ' selected';
  if (activeAboutRegionIndex !== undefined &&
      !selectedRegionIndexes.has(activeAboutRegionIndex)) {
    hideRegionAbout();
  }
  updateRegionHighlights();
  updateGlobeRegions();
}

function updateGlobeRegions() {
  if (!globe) return;
  globe.setRegions([...selectedRegionIndexes].map(index => ({
    index,
    color: regionColor(index),
    rings: regions[index].coordinates.map(ring => projectGeographicRing(ring, 'global'))
  })));
}

function focusGlobeRegions(indexes) {
  if (globePanel.hidden) return;
  globe?.focusRegions(indexes.map(index => regions[index].coordinates[0]));
}

function validateRegions(payload) {
  if (!payload || payload.type !== 'FeatureCollection' || !Array.isArray(payload.features)) {
    throw new Error('The JSON file must contain a GeoJSON FeatureCollection.');
  }
  const ids = new Set();
  return payload.features.map((feature, index) => {
    const properties = feature && feature.properties;
    const id = properties && properties.id;
    const entry = 'Region ' + (index + 1);
    if (!properties || typeof properties !== 'object') {
      throw new Error(entry + ' needs properties.');
    }
    if (typeof id !== 'string' || !id.trim() || ids.has(id)) {
      throw new Error(entry + ' needs a unique string id.');
    }
    if (typeof properties.name !== 'string' || !properties.name.trim() ||
        typeof properties.group !== 'string' || !properties.group.trim()) {
      throw new Error(entry + ' needs a name and group.');
    }
    if (!feature.geometry || feature.geometry.type !== 'Polygon' ||
        !Array.isArray(feature.geometry.coordinates) || !feature.geometry.coordinates.length) {
      throw new Error(entry + ' needs a polygon geometry.');
    }

    const coordinates = feature.geometry.coordinates.map((ring, ringIndex) => {
      if (!Array.isArray(ring) || ring.length < 4) {
        throw new Error(entry + ' polygon ring ' + (ringIndex + 1) + ' needs at least four points.');
      }
      return ring.map((point, pointIndex) => {
        if (!Array.isArray(point) || point.length < 2 ||
            typeof point[0] !== 'number' || !Number.isFinite(point[0]) ||
            point[0] < -180 || point[0] > 180 ||
            typeof point[1] !== 'number' || !Number.isFinite(point[1]) ||
            point[1] < -90 || point[1] > 90) {
          throw new Error(entry + ' point ' + (pointIndex + 1) +
            ' needs longitude and latitude within the lunar coordinate range.');
        }
        return [point[0], point[1]];
      });
    });
    if (coordinates.some(ring =>
      ring[0][0] !== ring[ring.length - 1][0] ||
      ring[0][1] !== ring[ring.length - 1][1]
    )) {
      throw new Error(entry + ' polygon rings must be closed.');
    }

    const description = typeof properties.description === 'string' ? properties.description.trim() : '';
    const descriptionSource = typeof properties.descriptionSource === 'string' ?
      properties.descriptionSource.trim() : '';
    if (descriptionSource) {
      let sourceUrl;
      try {
        sourceUrl = new URL(descriptionSource);
      } catch {
        throw new Error(entry + ' description source must be a valid HTTPS URL.');
      }
      if (sourceUrl.protocol !== 'https:') {
        throw new Error(entry + ' description source must be a valid HTTPS URL.');
      }
    }

    ids.add(id);
    return {
      id,
      name: properties.name.trim(),
      group: properties.group.trim(),
      description,
      descriptionSource,
      coordinates
    };
  });
}

function renderRegionOptions() {
  if (!regions.length) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No regions configured. Add entries to public/data/regions-of-interest.json.';
    regionOptions.replaceChildren(emptyMessage);
    return;
  }

  const groups = new Map();
  regions.forEach((region, index) => {
    if (!groups.has(region.group)) groups.set(region.group, []);
    groups.get(region.group).push({ region, index });
  });

  const options = [...groups].map(([groupName, entries]) => {
    const group = document.createElement('section');
    group.className = 'region-group';

    const heading = document.createElement('div');
    heading.className = 'poi-program-heading';
    const groupLabel = document.createElement('label');
    groupLabel.className = 'poi-program-toggle';
    const groupCheckbox = document.createElement('input');
    groupCheckbox.type = 'checkbox';
    groupCheckbox.setAttribute('aria-label', 'Select all ' + groupName);
    const title = document.createElement('span');
    title.textContent = groupName;
    groupLabel.append(groupCheckbox, title);

    const expander = document.createElement('button');
    expander.type = 'button';
    expander.className = 'poi-program-expander';
    expander.setAttribute('aria-expanded', 'false');
    expander.setAttribute('aria-label', 'Expand ' + groupName);
    expander.textContent = entries.length + (entries.length === 1 ? ' region' : ' regions');

    const items = document.createElement('div');
    items.className = 'poi-program-items';
    items.setAttribute('role', 'group');
    items.setAttribute('aria-label', groupName);
    items.hidden = true;
    const itemCheckboxes = [];

    function syncGroupCheckbox() {
      const selectedCount = entries.filter(({ index }) => selectedRegionIndexes.has(index)).length;
      groupCheckbox.checked = selectedCount === entries.length;
      groupCheckbox.indeterminate = selectedCount > 0 && selectedCount < entries.length;
    }

    expander.addEventListener('click', () => {
      items.hidden = !items.hidden;
      expander.setAttribute('aria-expanded', String(!items.hidden));
      expander.setAttribute('aria-label',
        (items.hidden ? 'Expand ' : 'Collapse ') + groupName);
    });

    for (const { region, index } of entries) {
      const option = document.createElement('div');
      option.className = 'region-option';
      const label = document.createElement('label');
      label.className = 'poi-option';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = String(index);
      checkbox.checked = selectedRegionIndexes.has(index);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          selectedRegionIndexes.add(index);
          showRegionAbout(index);
        } else {
          selectedRegionIndexes.delete(index);
        }
        syncGroupCheckbox();
        updateRegionSelection();
        if (checkbox.checked) focusGlobeRegions([index]);
      });

      const swatch = document.createElement('span');
      swatch.className = 'region-swatch';
      swatch.style.backgroundColor = regionColor(index);
      const copy = document.createElement('span');
      copy.className = 'poi-option-copy';
      const name = document.createElement('strong');
      name.textContent = region.name;
      copy.append(name);
      label.append(checkbox, swatch, copy);
      option.append(label);
      items.append(option);
      itemCheckboxes.push(checkbox);
    }

    groupCheckbox.addEventListener('change', () => {
      for (const checkbox of itemCheckboxes) {
        const index = Number(checkbox.value);
        checkbox.checked = groupCheckbox.checked;
        if (groupCheckbox.checked) selectedRegionIndexes.add(index);
        else selectedRegionIndexes.delete(index);
      }
      if (groupCheckbox.checked && entries.length === 1) {
        showRegionAbout(entries[0].index);
      }
      updateRegionSelection();
      if (groupCheckbox.checked) focusGlobeRegions(entries.map(({ index }) => index));
    });

    syncGroupCheckbox();
    heading.append(groupLabel, expander);
    group.append(heading, items);
    return group;
  });
  regionOptions.replaceChildren(...options);
}

async function loadRegions() {
  try {
    const response = await fetch('/data/regions-of-interest.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    regions = validateRegions(await response.json());
    renderRegionOptions();
    regionStatus.classList.remove('error');
    regionStatus.hidden = true;
    regionStatus.textContent = '';
  } catch (error) {
    const unavailable = document.createElement('p');
    unavailable.textContent = 'Region list unavailable. See the status below.';
    regionOptions.replaceChildren(unavailable);
    regionStatus.classList.add('error');
    regionStatus.hidden = false;
    regionStatus.textContent = 'Could not load lunar regions: ' + error.message;
  }
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
    renderGlobeSites();
    poiStatus.classList.remove('error');
    poiStatus.hidden = true;
    poiStatus.textContent = '';
  } catch (error) {
    const unavailable = document.createElement('p');
    unavailable.textContent = 'Site list unavailable. See the status below.';
    poiOptions.replaceChildren(unavailable);
    globeList.textContent = 'The points of interest list is unavailable. Enter coordinates in Observation setup.';
    poiStatus.classList.add('error');
    poiStatus.hidden = false;
    poiStatus.textContent = 'Could not load points of interest: ' + error.message;
  }
}

document.addEventListener('click', event => {
  if (poiPicker.open && !poiPicker.contains(event.target)) poiPicker.open = false;
  if (regionPicker.open && !regionPicker.contains(event.target)) regionPicker.open = false;
});

mapViewSelect.addEventListener('change', () => {
  hideRegionPopup();
  for (const [name, layer] of Object.entries(imageryLayers)) {
    layer.setVisible(name === mapViewSelect.value);
  }
  for (const [name, layer] of Object.entries(polarDetailLayers)) {
    layer.setVisible(name === mapViewSelect.value);
  }
  lunarMap.setView(createMapView(mapViewSelect.value));
  updateMarkerFromInputs();
  updatePoiHighlights();
  updateRegionHighlights();
});
lunarMap.on('singleclick', event => {
  let clickedPoi;
  let clickedRegion;
  lunarMap.forEachFeatureAtPixel(event.pixel, feature => {
    if (Number.isInteger(feature.get('poiIndex'))) {
      clickedPoi = feature;
      return true;
    }
    if (!clickedRegion && Number.isInteger(feature.get('regionIndex'))) {
      clickedRegion = feature;
    }
    return undefined;
  }, { hitTolerance: 8 });
  if (clickedPoi) {
    hideRegionPopup();
    const site = pointsOfInterest[clickedPoi.get('poiIndex')];
    selectPoiSite(site);
    return;
  }
  const poiSite = clickedPoi && pointsOfInterest[clickedPoi.get('poiIndex')];
  const [longitude, latitude] = poiSite
    ? [poiSite.longitude, poiSite.latitude]
    : mapViewSelect.value === 'global'
      ? event.coordinate
      : polarToGeographic(event.coordinate, mapViewSelect.value === 'north-pole' ? 'north' : 'south');
  if (clickedRegion) {
    const regionIndex = clickedRegion.get('regionIndex');
    showRegionPopup(regionIndex, event.coordinate);
    showRegionAbout(regionIndex);
  } else {
    hideRegionPopup();
  }
  selectActiveSite(latitude, longitude);
});
latitudeInput.addEventListener('change', updateMarkerFromInputs);
longitudeInput.addEventListener('change', updateMarkerFromInputs);
globeMode.addEventListener('click', () => showSiteView(true));
mapMode.addEventListener('click', () => showSiteView(false));
globeReset.addEventListener('click', () => globe?.focus());
compareLatitudeInput.addEventListener('input', updateMapMarkers);
compareLongitudeInput.addEventListener('input', updateMapMarkers);
updateMarkerFromInputs();

function alignedResultRows() {
  const rowsByTime = new Map();
  for (const sample of result.rows) {
    rowsByTime.set(sample.time, { time: sample.time, siteA: sample });
  }
  if (comparisonResult) {
    for (const sample of comparisonResult.rows) {
      const aligned = rowsByTime.get(sample.time) ?? { time: sample.time };
      aligned.siteB = sample;
      rowsByTime.set(sample.time, aligned);
    }
  }
  return [...rowsByTime.values()].sort((first, second) => first.time.localeCompare(second.time));
}

function tableSiteValues(siteResult, sample) {
  if (!sample) return ['—', '—', '—', '—', '—', '—'];
  const terrainLabel = (position, horizon) => horizon
    ? (position.elevation >= 0 && position.elevation <= horizon.horizonElevation ? 'Blocked' : 'Clear') +
      ' · horizon ' + horizon.horizonElevation.toFixed(2) + '°'
    : 'Unavailable';
  const sunTerrain = siteResult.terrain
    ? terrainAtAzimuth(siteResult.terrain.horizons, sample.sun.azimuth) : undefined;
  const earthTerrain = siteResult.terrain
    ? terrainAtAzimuth(siteResult.terrain.horizons, sample.earth.azimuth) : undefined;
  return [
    sample.sun.azimuth.toFixed(6),
    sample.sun.elevation.toFixed(6),
    terrainLabel(sample.sun, sunTerrain),
    sample.earth.azimuth.toFixed(6),
    sample.earth.elevation.toFixed(6),
    terrainLabel(sample.earth, earthTerrain)
  ];
}

function renderTable() {
  const rows = alignedResultRows();
  const start = page * pageSize;
  const end = Math.min(start + pageSize, rows.length);
  const items = rows.slice(start, end).map(({ time, siteA, siteB }) => {
    const row = document.createElement('tr');
    const values = [time.slice(0, 16).replace('T', ' '), ...tableSiteValues(result, siteA)];
    if (comparisonResult) values.push(...tableSiteValues(comparisonResult, siteB));
    for (const value of values) {
      const cell = row.insertCell();
      cell.textContent = value;
    }
    return row;
  });
  table.replaceChildren(...items);
  range.textContent = (start + 1) + '–' + end + ' of ' + rows.length;
  previous.disabled = page === 0;
  next.disabled = end === rows.length;
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
loadRegions();

function drawChart(siteKey) {
  const canvas = chartCanvases[siteKey];
  const context = chartContexts[siteKey];
  const siteResult = siteKey === 'b' ? comparisonResult : result;
  const zoom = chartZoom[siteKey];
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!context || !width || !height || !siteResult?.rows.length) return;
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
  const viewCenter = zoom?.center ?? 180;
  const viewSpan = zoom ? 60 : 360;
  const relativeAzimuth = azimuth => ((azimuth - viewCenter + 540) % 360) - 180 + viewCenter;
  const x = azimuth => plot.left + (relativeAzimuth(azimuth) - (viewCenter - viewSpan / 2)) / viewSpan * (plot.right - plot.left);
  const zoomValues = zoom ? [
    ...siteResult[zoom.target].rows.filter(row => Math.abs(relativeAzimuth(row.azimuth) - viewCenter) <= viewSpan / 2).map(row => row.elevation),
    ...(siteResult.terrain?.horizons ?? []).filter(point => Math.abs(relativeAzimuth(point.azimuth) - viewCenter) <= viewSpan / 2).map(point => point.horizonElevation)
  ] : [];
  const zoomMinimum = zoomValues.length ? Math.max(-90, Math.min(...zoomValues) - 3) : -90;
  const zoomMaximum = zoomValues.length ? Math.min(90, Math.max(...zoomValues) + 3) : 90;
  const yMinimum = zoom ? zoomMinimum : -90;
  const yMaximum = zoom ? zoomMaximum : 90;
  const y = elevation => plot.bottom - (Math.max(yMinimum, Math.min(yMaximum, elevation)) - yMinimum) / (yMaximum - yMinimum) * (plot.bottom - plot.top);

  function drawTerrainHorizon() {
    const horizons = siteResult.terrain?.horizons;
    if (!horizons?.length) return;
    context.beginPath();
    context.strokeStyle = '#c8cdd2';
    context.lineWidth = 3;
    context.setLineDash([8, 5]);
    let started = false;
    let previousAzimuth;
    horizons.map(point => ({ point, azimuth: relativeAzimuth(point.azimuth) }))
      .filter(({ azimuth }) => !zoom ||
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
  const elevationTicks = zoom
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
    context.fillText((zoom ? elevation.toFixed(1) : elevation) + '°', plot.left - 8, position);
  }
  context.setLineDash([]);

  const azimuthLabels = zoom
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

  const plottedTargets = zoom ? [zoom.target] : ['sun', 'earth'];
  for (const target of plottedTargets) {
    const color = target === 'sun' ? sunColor : earthColor;
    const rows = siteResult[target].rows;
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

  const currentTargets = zoom ? [zoom.target] : ['sun', 'earth'];
  for (const target of currentTargets) {
    const color = target === 'sun' ? sunColor : earthColor;
    const row = siteResult.rows[currentIndices[siteKey]][target];
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

for (const [siteKey, canvas] of Object.entries(chartCanvases)) {
  canvas.addEventListener('click', event => {
    const siteResult = siteKey === 'b' ? comparisonResult : result;
    if (!siteResult?.rows.length) return;
    const bounds = canvas.getBoundingClientRect();
    const plotLeft = 58;
    const plotRight = canvas.clientWidth - 18;
    const zoom = chartZoom[siteKey];
    const clickAzimuth = zoom
      ? zoom.center - 30 + (event.clientX - bounds.left - plotLeft) / (plotRight - plotLeft) * 60
      : (event.clientX - bounds.left - plotLeft) / (plotRight - plotLeft) * 360;
    const angularDistance = azimuth => Math.abs(((azimuth - clickAzimuth + 540) % 360) - 180);
    if (zoom) chartZoom[siteKey] = undefined;
    else {
      const currentRows = [
        { target: 'sun', row: siteResult.rows[currentIndices[siteKey]].sun },
        { target: 'earth', row: siteResult.rows[currentIndices[siteKey]].earth }
      ];
      const selected = currentRows.find(item => angularDistance(item.row.azimuth) <= 8);
      if (!selected) return;
      chartZoom[siteKey] = { target: selected.target, center: selected.row.azimuth };
    }
    updateCurrentReading();
  });
}

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

function updateVisibility(params, comparisonSiteParams = params) {
  const updateTargetVisibility = (label, target, rows, pie, value, duration, siteResult, siteParams) => {
    const start = Date.parse(siteParams.get('start') + ':00Z');
    const stop = Date.parse(siteParams.get('stop') + ':00Z');
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
    params,
    sun: [sunVisibilityPie, sunVisibilityValue, sunVisibilityDuration],
    earth: [earthVisibilityPie, earthVisibilityValue, earthVisibilityDuration]
  }];
  if (comparisonResult) {
    sites.push({
      label: 'Site B',
      result: comparisonResult,
      params: comparisonSiteParams,
      sun: [compareSunVisibilityPie, compareSunVisibilityValue, compareSunVisibilityDuration],
      earth: [compareEarthVisibilityPie, compareEarthVisibilityValue, compareEarthVisibilityDuration]
    });
  }
  for (const site of sites) {
    site.sunPercent = updateTargetVisibility(site.label + ' Sun', 'sun', site.result.sun.rows, ...site.sun, site.result, site.params);
    site.earthPercent = updateTargetVisibility(site.label + ' Earth', 'earth', site.result.earth.rows, ...site.earth, site.result, site.params);
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

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}

function angularSeparation(first, second) {
  return Math.abs(((first - second + 540) % 360) - 180);
}

function letterGrade(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}

function terrainFactorScores(siteResult, stats, lolaPayload) {
  const scores = {
    elevationScore: 50,
    slopeScore: 50,
    roughnessScore: 50,
    curvatureScore: 50,
    downslopeScore: 50,
    hasTopography: false
  };

  const topography = lolaPayload?.topography;
  if (!topography?.elevation || !topography?.local || !topography?.roughness ||
      !topography?.curvature || !topography?.aspect || !topography?.hazard) {
    return scores;
  }

  scores.hasTopography = true;
  const elevation = topography.elevation;
  const local = topography.local;
  const roughness = topography.roughness;
  const curvature = topography.curvature;
  const aspect = topography.aspect;
  const hazard = topography.hazard;

  const elevationRange = Math.max(1, elevation.maxMeters - elevation.minMeters);
  const relativeElevation = (lolaPayload.elevationMeters - elevation.minMeters) / elevationRange;
  scores.elevationScore = clampScore(100 - Math.abs(relativeElevation - 0.5) * 120);
  scores.slopeScore = clampScore(100 - local.slopeMeanDeg * 8 - local.slopeMaxDeg * 2);
  scores.roughnessScore = clampScore(100 - roughness.rmsMeters * 1.2 - roughness.triMeters * 2.1);
  scores.curvatureScore = clampScore(100 - Math.abs(curvature.totalPerMeter) * 420000);

  const dominantShadow = hazard.horizonExposure.dominantShadowAzimuthDeg;
  const downslope = aspect.downslopeAzimuthDeg;
  const directionalScore = Number.isFinite(dominantShadow) && Number.isFinite(downslope)
    ? (angularSeparation(downslope, dominantShadow) / 180) * 100
    : 50;
  scores.downslopeScore = clampScore(directionalScore);

  return scores;
}

function overallTerrainRating(siteResult, stats, lolaPayload) {
  const factors = terrainFactorScores(siteResult, stats, lolaPayload);
  const score = factors.hasTopography
    ? factors.elevationScore * 0.60 +
      factors.slopeScore * 0.10 +
      factors.roughnessScore * 0.25 +
      factors.curvatureScore * 0.05 +
      factors.downslopeScore * 0.00
    : 50;
  const finalScore = clampScore(score);
  return { score: finalScore, letter: letterGrade(finalScore), factors };
}

function clampTen(value) {
  return Math.max(0, Math.min(10, value));
}

function directVisibilityMetrics(target, siteResult, params) {
  const targetRows = siteResult?.[target]?.rows ?? [];
  if (targetRows.length < 2 || !params) {
    return {
      durationPercent: 0,
      timeBeforeSetHours: 0,
      meanElevationDeg: 0,
      peakElevationDeg: 0
    };
  }

  const start = Date.parse(params.get('start') + ':00Z');
  const stop = Date.parse(params.get('stop') + ':00Z');
  if (!Number.isFinite(start) || !Number.isFinite(stop) || stop <= start) {
    return {
      durationPercent: 0,
      timeBeforeSetHours: 0,
      meanElevationDeg: 0,
      peakElevationDeg: 0
    };
  }

  const times = [
    start,
    ...targetRows.map(row => Date.parse(row.time)).filter(time => time > start && time < stop),
    stop
  ];
  const totalDuration = Math.max(1, stop - start);

  const apparentElevationAt = time => elevationAt(time, targetRows);
  const clearanceAt = time => {
    const horizon = terrainHorizonAt(time, target, siteResult);
    return apparentElevationAt(time) - horizon;
  };

  let visibleDuration = 0;
  let weightedElevation = 0;
  let weightedDuration = 0;
  let peakElevation = -90;
  let timeBeforeSetMs = 0;
  let waitingForSet = clearanceAt(start) > 0;

  for (let index = 1; index < times.length; index += 1) {
    const previousTime = times[index - 1];
    const currentTime = times[index];
    const interval = Math.max(0, currentTime - previousTime);
    const previousClearance = clearanceAt(previousTime);
    const currentClearance = clearanceAt(currentTime);
    const previousElevation = apparentElevationAt(previousTime);
    const currentElevation = apparentElevationAt(currentTime);

    let positiveDuration = 0;
    let positiveStartTime;
    let positiveEndTime;
    let positiveStartElevation;
    let positiveEndElevation;

    if (previousClearance > 0 && currentClearance > 0) {
      positiveDuration = interval;
      positiveStartTime = previousTime;
      positiveEndTime = currentTime;
      positiveStartElevation = previousElevation;
      positiveEndElevation = currentElevation;
    } else if (previousClearance > 0 && currentClearance <= 0) {
      const crossingFraction = previousClearance / (previousClearance - currentClearance);
      const crossingTime = previousTime + interval * crossingFraction;
      const crossingElevation = previousElevation + (currentElevation - previousElevation) * crossingFraction;
      positiveDuration = crossingTime - previousTime;
      positiveStartTime = previousTime;
      positiveEndTime = crossingTime;
      positiveStartElevation = previousElevation;
      positiveEndElevation = crossingElevation;
      if (waitingForSet) {
        timeBeforeSetMs = crossingTime - start;
        waitingForSet = false;
      }
    } else if (previousClearance <= 0 && currentClearance > 0) {
      const crossingFraction = previousClearance / (previousClearance - currentClearance);
      const crossingTime = previousTime + interval * crossingFraction;
      const crossingElevation = previousElevation + (currentElevation - previousElevation) * crossingFraction;
      positiveDuration = currentTime - crossingTime;
      positiveStartTime = crossingTime;
      positiveEndTime = currentTime;
      positiveStartElevation = crossingElevation;
      positiveEndElevation = currentElevation;
      waitingForSet = true;
    }

    visibleDuration += positiveDuration;

    if (positiveDuration > 0) {
      const meanElevation = (positiveStartElevation + positiveEndElevation) / 2;
      weightedElevation += Math.max(0, meanElevation) * (positiveEndTime - positiveStartTime);
      weightedDuration += positiveDuration;
      peakElevation = Math.max(peakElevation, positiveStartElevation, positiveEndElevation);
    }
  }

  if (waitingForSet) {
    timeBeforeSetMs = totalDuration;
  }

  const meanElevationDeg = weightedDuration > 0 ? weightedElevation / weightedDuration : 0;
  const durationPercent = visibleDuration / totalDuration * 100;
  return {
    durationPercent,
    timeBeforeSetHours: timeBeforeSetMs / 3_600_000,
    meanElevationDeg,
    peakElevationDeg: Math.max(0, peakElevation)
  };
}

function missionObjectiveScores(siteResult, siteParams, stats, lolaPayload, terrainRating) {
  const sun = directVisibilityMetrics('sun', siteResult, siteParams);
  const earth = directVisibilityMetrics('earth', siteResult, siteParams);

  const solarAngleEfficiency = Math.sin(Math.max(0, Math.min(90, sun.meanElevationDeg)) * Math.PI / 180);
  const solarPeakEfficiency = Math.sin(Math.max(0, Math.min(90, sun.peakElevationDeg)) * Math.PI / 180);
  const solarElevationScore = clampTen((solarAngleEfficiency * 0.75 + solarPeakEfficiency * 0.25) * 10);

  const sunlightDurationScore = clampTen(sun.durationPercent / 10);
  const sunlightSetBufferScore = clampTen(sun.timeBeforeSetHours / 2.4);
  const sunlightScore = clampTen(sunlightDurationScore * 0.65 + sunlightSetBufferScore * 0.35);

  const earthDurationScore = clampTen(earth.durationPercent / 10);
  const earthSetBufferScore = clampTen(earth.timeBeforeSetHours / 2.4);
  const directEarthScore = clampTen(earthDurationScore * 0.7 + earthSetBufferScore * 0.3);

  const terrainTen = clampTen(
    terrainRating.factors.hasTopography
      ? terrainRating.score / 10
      : 5
  );

  const finalScore = clampTen((terrainTen + solarElevationScore + sunlightScore + directEarthScore) / 4);

  const warnings = [];
  if (sunlightScore < 4) warnings.push('Limited sunlight windows: power margin is low and thermal swings may increase.');
  if (directEarthScore < 4) warnings.push('Direct-to-Earth communication windows are short; relay planning is recommended.');
  if (solarElevationScore < 4) warnings.push('Low average solar elevation reduces effective panel irradiance.');
  if (terrainTen < 4) warnings.push('Local terrain complexity may obstruct low-angle Sun/Earth lines of sight.');
  if (!terrainRating.factors.hasTopography) warnings.push('Full LOLA terrain categories are not available yet; terrain score is a fallback estimate.');

  return {
    terrainTen,
    solarElevationScore,
    sunlightScore,
    directEarthScore,
    finalScore,
    details: {
      sunDurationPercent: sun.durationPercent,
      sunTimeBeforeSetHours: sun.timeBeforeSetHours,
      sunMeanElevationDeg: sun.meanElevationDeg,
      sunPeakElevationDeg: sun.peakElevationDeg,
      earthDurationPercent: earth.durationPercent,
      earthTimeBeforeSetHours: earth.timeBeforeSetHours
    },
    warnings
  };
}

function renderObjectiveWarnings(items) {
  if (!objectiveWarnings) return;
  if (!items.length) {
    objectiveWarnings.hidden = true;
    objectiveWarnings.replaceChildren();
    return;
  }
  const entries = items.map(message => {
    const item = document.createElement('li');
    item.textContent = message;
    return item;
  });
  objectiveWarnings.replaceChildren(...entries);
  objectiveWarnings.hidden = false;
}

function updateAssessment(params) {
  const siteResult = assessmentSite === 'b' && comparisonResult ? comparisonResult : result;
  const siteParams = assessmentSite === 'b' && comparisonParams ? comparisonParams : params;
  if (!siteResult || !siteParams) return;
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

  const lolaPayload = assessmentLolaData[assessmentSite];
  const rating = overallTerrainRating(siteResult, stats, lolaPayload);
  const objectives = missionObjectiveScores(siteResult, siteParams, stats, lolaPayload, rating);
  const finalLetter = letterGrade(objectives.finalScore * 10);
  siteRating.textContent = 'Grade ' + finalLetter + ' · ' + objectives.finalScore.toFixed(1) + '/10';

  const factors = rating.factors;
  const siteLabel = assessmentSite === 'a' ? 'Site A' : 'Site B';
  const formatPeriodValue = value => (value ? value.replace('T', ' ') + ' UTC' : '—');
  const periodStart = formatPeriodValue(siteParams.get('start'));
  const periodStop = formatPeriodValue(siteParams.get('stop'));
  siteVerdict.textContent =
    'Site: ' + siteLabel + '\n' +
    'Period: ' + periodStart + ' to ' + periodStop + '\n' +
    'Final Weighted Score: ' + objectives.finalScore.toFixed(1) + '/10';
  const otherSiteResult = assessmentSite === 'a' ? comparisonResult : result;
  const otherSiteParams = assessmentSite === 'a' ? comparisonParams : resultParams;
  const otherLola = assessmentSite === 'a' ? assessmentLolaData.b : assessmentLolaData.a;
  const otherStats = otherSiteResult && otherSiteParams
    ? { sun: targetStats('sun', otherSiteParams, otherSiteResult), earth: targetStats('earth', otherSiteParams, otherSiteResult) }
    : undefined;
  const otherObjectives = otherStats
    ? missionObjectiveScores(otherSiteResult, otherSiteParams, otherStats, otherLola,
      overallTerrainRating(otherSiteResult, otherStats, otherLola))
    : undefined;

  const rankSuffix = (score, otherScore) => {
    if (!otherObjectives || !Number.isFinite(otherScore)) return '';
    if (Math.abs(score - otherScore) < 0.05) return ' (tied)';
    return score > otherScore ? ' (rank #1)' : ' (rank #2)';
  };

  objectiveTerrainScore.textContent = objectives.terrainTen.toFixed(1) + '/10' +
    rankSuffix(objectives.terrainTen, otherObjectives?.terrainTen);
  objectiveSolarAngleScore.textContent = objectives.solarElevationScore.toFixed(1) + '/10' +
    rankSuffix(objectives.solarElevationScore, otherObjectives?.solarElevationScore);
  objectiveSunlightScore.textContent = objectives.sunlightScore.toFixed(1) + '/10' +
    rankSuffix(objectives.sunlightScore, otherObjectives?.sunlightScore);
  objectiveEarthScore.textContent = objectives.directEarthScore.toFixed(1) + '/10' +
    rankSuffix(objectives.directEarthScore, otherObjectives?.directEarthScore);

  objectiveTerrainDetail.textContent =
    'Local terrain rating summarizes LOLA-derived elevation context, slope, roughness, and curvature into a single 0-10 score.';
  objectiveTerrainDetail.hidden = false;
  objectiveSolarAngleDetail.textContent = 'Based on mean/peak Sun elevation while visible.\nMean elevation: ' +
    objectives.details.sunMeanElevationDeg.toFixed(1) + '°.\nPeak elevation: ' +
    objectives.details.sunPeakElevationDeg.toFixed(1) + '°.';
  objectiveSunlightDetail.textContent = 'Duration: ' + objectives.details.sunDurationPercent.toFixed(1) +
    '% of window.\nTime before sunset: ' + objectives.details.sunTimeBeforeSetHours.toFixed(1) + ' hr.';
  objectiveEarthDetail.textContent = 'Direct Earth Access: ' + objectives.details.earthDurationPercent.toFixed(1) +
    '% of window.\nTime before Earth set: ' + objectives.details.earthTimeBeforeSetHours.toFixed(1) + ' hr.';

  objectiveOverall.textContent = 'Final Weighted Score: ' + objectives.finalScore.toFixed(1) + '/10' +
    rankSuffix(objectives.finalScore, otherObjectives?.finalScore);
  objectiveLogic.textContent = '';
  objectiveLogic.hidden = true;
  renderObjectiveWarnings(objectives.warnings);
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

function isSeparateWindowComparison() {
  return Boolean(comparisonResult && comparisonUsesSeparateWindows);
}

function rowTimeLabel(row) {
  return row.time.slice(0, 16).replace('T', ' ') + ' UTC';
}

function updateCurrentReading() {
  if (isSeparateWindowComparison()) {
    currentIndices.a = Number(sitePlayback.a.slider.value);
    currentIndices.b = Number(sitePlayback.b.slider.value);
  } else {
    currentIndices.a = Number(slider.value);
    currentIndices.b = currentIndices.a;
  }
  const { time, sun, earth } = result.rows[currentIndices.a];
  const siteAZoom = chartZoom.a;
  const current = siteAZoom ? result.rows[currentIndices.a][siteAZoom.target] : result.rows[currentIndices.a].sun;
  const timeLabel = rowTimeLabel({ time });
  reading.textContent = timeLabel;
  sitePlayback.a.reading.textContent = timeLabel;
  const horizon = result.terrain ? terrainAtAzimuth(result.terrain.horizons, current.azimuth)?.horizonElevation : 0;
  const blocked = current.elevation >= 0 && current.elevation <= horizon;
  if (siteAZoom) {
    selectedTargetLabel.textContent = siteAZoom.target === 'sun' ? 'Sun' : 'Earth';
    selectedTargetLabel.className = siteAZoom.target === 'sun' ? 'sun-color' : 'earth-color';
    selectedReading.textContent = current.azimuth.toFixed(1) + '° az · ' + current.elevation.toFixed(1) +
      '° el · ' + (blocked ? 'Blocked' : 'Clear') + ' · horizon ' + horizon.toFixed(1) + '°';
  } else {
    selectedTargetLabel.textContent = 'Sun + Earth';
    selectedTargetLabel.className = 'sun-color';
    selectedReading.textContent = 'Click a marker to zoom in its graph';
  }
  let accessibleReadings = timeLabel + ', Site A Sun azimuth ' + sun.azimuth.toFixed(1) +
    ' degrees, elevation ' + sun.elevation.toFixed(1) + ' degrees; Earth azimuth ' +
    earth.azimuth.toFixed(1) + ' degrees, elevation ' + earth.elevation.toFixed(1) + ' degrees';
  if (comparisonResult) {
    const comparison = comparisonResult.rows[currentIndices.b];
    const comparisonTimeLabel = rowTimeLabel(comparison);
    const sameTime = comparison.time === time;
    sitePlayback.b.reading.textContent = comparisonTimeLabel;
    comparisonSiteLabel.textContent = 'Site B · ' + comparisonParams.get('latitude') + '°, ' +
      comparisonParams.get('longitude') + '° E · ' + comparisonTimeLabel;
    const formatDifference = value => (value > 0 ? '+' : '') + value.toFixed(1) + '°';
    const sunAzimuthDifference = ((comparison.sun.azimuth - sun.azimuth + 540) % 360) - 180;
    const earthAzimuthDifference = ((comparison.earth.azimuth - earth.azimuth + 540) % 360) - 180;
    compareSunReading.textContent = comparison.sun.azimuth.toFixed(1) + '° az · ' + comparison.sun.elevation.toFixed(1) + '° el';
    compareEarthReading.textContent = comparison.earth.azimuth.toFixed(1) + '° az · ' + comparison.earth.elevation.toFixed(1) + '° el';
    compareSunDifference.textContent = sameTime
      ? 'Δ vs A: ' + formatDifference(sunAzimuthDifference) + ' az · ' +
        formatDifference(comparison.sun.elevation - sun.elevation) + ' el'
      : 'Δ unavailable · selected times differ';
    compareEarthDifference.textContent = sameTime
      ? 'Δ vs A: ' + formatDifference(earthAzimuthDifference) + ' az · ' +
        formatDifference(comparison.earth.elevation - earth.elevation) + ' el'
      : 'Δ unavailable · selected times differ';
    accessibleReadings += '; Site B at ' + comparisonTimeLabel + ', Sun azimuth ' + comparison.sun.azimuth.toFixed(1) +
      ' degrees, elevation ' + comparison.sun.elevation.toFixed(1) + ' degrees; Earth azimuth ' +
      comparison.earth.azimuth.toFixed(1) + ' degrees, elevation ' + comparison.earth.elevation.toFixed(1) + ' degrees';
  }
  if (isSeparateWindowComparison()) {
    sitePlayback.a.slider.setAttribute('aria-valuetext', timeLabel);
    sitePlayback.b.slider.setAttribute('aria-valuetext', rowTimeLabel(comparisonResult.rows[currentIndices.b]));
  } else {
    slider.setAttribute('aria-valuetext', accessibleReadings);
  }
  for (const [siteKey, siteResult] of [['a', result], ['b', comparisonResult]]) {
    if (!siteResult) continue;
    const siteLabel = siteKey === 'a' ? 'Site A' : 'Site B';
    const siteRows = siteResult.rows[currentIndices[siteKey]];
    const siteTimeLabel = rowTimeLabel(siteRows);
    const chartZoomState = chartZoom[siteKey];
    let chartDescription = 'At ' + siteTimeLabel + ', ' + siteLabel + ' Sun azimuth ' +
      siteRows.sun.azimuth.toFixed(1) + ' degrees and elevation ' + siteRows.sun.elevation.toFixed(1) +
      ' degrees; Earth azimuth ' + siteRows.earth.azimuth.toFixed(1) + ' degrees and elevation ' +
      siteRows.earth.elevation.toFixed(1) + ' degrees.';
    if (chartZoomState) {
      chartDescription += ' Zoomed to ' + chartZoomState.target + ' near ' +
        chartZoomState.center.toFixed(1) + ' degrees azimuth.';
    }
    chartCanvases[siteKey].setAttribute('aria-label', chartDescription);
    drawChart(siteKey);
  }
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
  stopSitePlayback('a');
  stopSitePlayback('b');
}

function startPlayback() {
  if (playbackTimer) return;
  if (Number(slider.value) === result.rows.length - 1) slider.value = '0';
  playback.textContent = 'Pause';
  playback.setAttribute('aria-pressed', 'true');
  updateCurrentReading();
  playbackTimer = window.setInterval(() => {
    if (Number(slider.value) >= result.rows.length - 1) {
      stopPlayback();
      return;
    }
    slider.value = String(Number(slider.value) + 1);
    updateCurrentReading();
  }, 250);
}

function stopSitePlayback(siteKey) {
  window.clearInterval(sitePlaybackTimers[siteKey]);
  sitePlaybackTimers[siteKey] = undefined;
  sitePlayback[siteKey].button.textContent = 'Play';
  sitePlayback[siteKey].button.setAttribute('aria-pressed', 'false');
}

function startSitePlayback(siteKey) {
  const control = sitePlayback[siteKey];
  const siteResult = siteKey === 'a' ? result : comparisonResult;
  if (sitePlaybackTimers[siteKey] || !siteResult?.rows.length) return;
  if (Number(control.slider.value) === siteResult.rows.length - 1) control.slider.value = '0';
  control.button.textContent = 'Pause';
  control.button.setAttribute('aria-pressed', 'true');
  updateCurrentReading();
  sitePlaybackTimers[siteKey] = window.setInterval(() => {
    if (Number(control.slider.value) >= siteResult.rows.length - 1) {
      stopSitePlayback(siteKey);
      return;
    }
    control.slider.value = String(Number(control.slider.value) + 1);
    updateCurrentReading();
  }, 250);
}

function renderResult(payload, params, comparison, comparisonParamsInput, separateWindowMode = false) {
  stopPlayback();
  result = payload;
  comparisonResult = comparison;
  resultParams = params;
  comparisonParams = comparisonParamsInput;
  comparisonUsesSeparateWindows = Boolean(comparisonResult && separateWindowMode);
  tableDetails.hidden = true;
  tableToggle.setAttribute('aria-expanded', 'false');
  tableToggle.firstElementChild.textContent = 'View additional topographical information';
  tableToggle.lastElementChild.textContent = '+';
  assessmentSiteB.disabled = !comparisonResult;
  setAssessmentSite('a');
  page = 0;
  currentIndices.a = 0;
  currentIndices.b = 0;
  slider.max = String(result.rows.length - 1);
  slider.value = '0';
  sitePlayback.a.slider.max = String(result.rows.length - 1);
  sitePlayback.a.slider.value = '0';
  if (comparisonResult) {
    sitePlayback.b.slider.max = String(comparisonResult.rows.length - 1);
    sitePlayback.b.slider.value = '0';
  }
  const site = params.get('latitude') + '°, ' + params.get('longitude') + '° E';
  const comparisonSite = comparisonParamsInput
    ? comparisonParamsInput.get('latitude') + '°, ' + comparisonParamsInput.get('longitude') + '° E'
    : '';
  siteAChartTitle.textContent = 'Site A · ' + site;
  siteBChartTitle.textContent = 'Site B · ' + comparisonSite;
  summary.textContent = 'Sun + Earth · Site A ' + site + ' · ' +
    params.get('start') + '–' + params.get('stop') + ' UTC · ' + result.rows.length + ' samples' +
    (comparisonResult ? ' · Site B ' + comparisonSite + ' · ' +
      comparisonParamsInput.get('start') + '–' + comparisonParamsInput.get('stop') + ' UTC · ' +
      comparisonResult.rows.length + ' samples' : '');
  empty.hidden = true;
  data.hidden = false;
  siteBChartPanel.hidden = !comparisonResult;
  sharedPlayback.hidden = comparisonUsesSeparateWindows;
  sitePlayback.a.container.hidden = !comparisonUsesSeparateWindows;
  sitePlayback.b.container.hidden = !comparisonUsesSeparateWindows || !comparisonResult;
  comparisonReadings.hidden = !comparisonResult;
  comparisonVisibility.hidden = !comparisonResult;
  for (const header of comparisonTableHeaders) header.hidden = !comparisonResult;
  status.textContent = comparisonResult
    ? comparisonUsesSeparateWindows
      ? 'Loaded ' + result.rows.length + ' Site A samples and ' + comparisonResult.rows.length + ' Site B samples. Playback is independent for each site.'
      : 'Loaded ' + result.rows.length + ' matching time samples at both sites.'
    : 'Loaded Sun and Earth ephemerides for ' + result.rows.length + ' time samples.';
  terrainStatus.textContent = result.terrainPending
    ? 'Terrain horizon: loading Moon Trek elevation data…'
    : result.terrain?.horizons
    ? 'Terrain horizon: ' + result.terrain.horizons.length + ' azimuth samples at 10° resolution.'
    : 'Terrain profile unavailable: ' + (result.terrainError ?? 'Moon Trek did not return elevation data.') +
      ' Increase the observation step size and try again.';
  download.disabled = false;
  assessmentLaunch.disabled = false;
  updateAssessment(params);
  loadAssessmentLola('a', params);
  if (comparisonParamsInput) loadAssessmentLola('b', comparisonParamsInput);
  openAssessmentModal();
  renderTable();
  const siteVisibility = updateVisibility(params, comparisonParamsInput);
  renderSiteRecommendation(siteVisibility);
  updateCurrentReading();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (comparisonUsesSeparateWindows) {
      startSitePlayback('a');
      startSitePlayback('b');
    } else {
      startPlayback();
    }
  }
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
  const formParams = new URLSearchParams(new FormData(form));
  const params = new URLSearchParams(formParams);
  const comparisonParams = compareEnabled.checked ? new URLSearchParams(formParams) : undefined;
  const separateWindowMode = Boolean(comparisonParams && separateWindows.checked);
  for (const key of ['compareLatitude', 'compareLongitude', 'compareStart', 'compareStop']) {
    params.delete(key);
  }
  if (comparisonParams) {
    for (const key of ['compareLatitude', 'compareLongitude', 'compareStart', 'compareStop']) {
      comparisonParams.delete(key);
    }
    comparisonParams.set('latitude', compareLatitudeInput.value);
    comparisonParams.set('longitude', compareLongitudeInput.value);
    if (separateWindowMode) {
      comparisonParams.set('start', compareStartInput.value);
      comparisonParams.set('stop', compareStopInput.value);
    }
  }
  comparisonResult = undefined;
  chartZoom.a = undefined;
  chartZoom.b = undefined;
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
      if (!separateWindowMode) assertMatchingSamples(combined, comparison);
    }
    renderResult(combined, params, comparison, comparisonParams, separateWindowMode);
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
  siteAMapPickButton.hidden = !enabled;
  siteBMapCard.hidden = !enabled;
  separateWindowControl.hidden = !enabled;
  separateWindows.disabled = !enabled;
  if (!enabled) {
    separateWindows.checked = false;
    setActiveSiteSelection('a');
  } else {
    setActiveSiteSelection('b');
  }
  updateTimeWindowFields();
  updateMapMarkers();
}

function updateTimeWindowFields() {
  const separate = compareEnabled.checked && separateWindows.checked;
  if (separate) {
    if (!compareStartInput.value) compareStartInput.value = startInput.value;
    if (!compareStopInput.value) compareStopInput.value = stopInput.value;
  }
  siteBTimeWindow.hidden = !separate;
  compareStartInput.disabled = !separate;
  compareStopInput.disabled = !separate;
  sharedWindowNote.hidden = !compareEnabled.checked || separate;
}

function setActiveSiteSelection(site) {
  activeSiteSelection = site;
  siteAMapPickButton.setAttribute('aria-pressed', String(site === 'a'));
  siteBMapPickButton.setAttribute('aria-pressed', String(site === 'b'));
  siteAMapStatus.textContent = site === 'a' ? 'Map selections update Site A.' : '';
  siteAMapStatus.hidden = !compareEnabled.checked || site !== 'a';
  siteBMapStatus.textContent = site === 'b' ? 'Map selections update Site B.' : '';
  siteBMapStatus.hidden = !compareEnabled.checked || site !== 'b';
  updateMapInstructions();
}
compareEnabled.addEventListener('change', updateComparisonFields);
separateWindows.addEventListener('change', updateTimeWindowFields);
siteAMapPickButton.addEventListener('click', () => setActiveSiteSelection('a'));
siteBMapPickButton.addEventListener('click', () => setActiveSiteSelection('b'));
updateComparisonFields();

playback.addEventListener('click', () => {
  if (playbackTimer) stopPlayback();
  else startPlayback();
});
for (const siteKey of ['a', 'b']) {
  sitePlayback[siteKey].button.addEventListener('click', () => {
    if (sitePlaybackTimers[siteKey]) stopSitePlayback(siteKey);
    else startSitePlayback(siteKey);
  });
  sitePlayback[siteKey].slider.addEventListener('input', () => {
    stopSitePlayback(siteKey);
    updateCurrentReading();
  });
}
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
  const csvSiteValues = (siteResult, sample) => {
    if (!sample) return ['', '', '', '', '', '', '', ''];
    const sunTerrain = siteResult.terrain
      ? terrainAtAzimuth(siteResult.terrain.horizons, sample.sun.azimuth) : undefined;
    const earthTerrain = siteResult.terrain
      ? terrainAtAzimuth(siteResult.terrain.horizons, sample.earth.azimuth) : undefined;
    return [sample.sun.azimuth, sample.sun.elevation,
      sunTerrain?.horizonElevation ?? '',
      sunTerrain ? sample.sun.elevation >= 0 && sample.sun.elevation <= sunTerrain.horizonElevation : '',
      sample.earth.azimuth, sample.earth.elevation,
      earthTerrain?.horizonElevation ?? '',
      earthTerrain ? sample.earth.elevation >= 0 && sample.earth.elevation <= earthTerrain.horizonElevation : ''];
  };
  const rows = alignedResultRows().map(({ time, siteA, siteB }) => {
    const values = [time, ...csvSiteValues(result, siteA)];
    if (comparisonResult) values.push(...csvSiteValues(comparisonResult, siteB));
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
const chartResizeObserver = new ResizeObserver(() => {
  drawChart('a');
  drawChart('b');
});
chartResizeObserver.observe(chartCanvases.a);
chartResizeObserver.observe(chartCanvases.b);
