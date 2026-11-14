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
const visibilityPie = document.querySelector('#visibility-pie');
const visibilityValue = document.querySelector('#visibility-value');
const visibilityDuration = document.querySelector('#visibility-duration');
const pageSize = 8;
let result;
let page = 0;
let displayedTarget;
let currentIndex = 0;
let playbackTimer;

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
  if (!context || !width || !height || !result?.rows.length) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.scale(ratio, ratio);

  const elevation = result.rows[currentIndex].elevation;
  const scale = Math.max(1, ...result.rows.map(row => Math.abs(row.elevation))) * 1.15;
  const centerY = height / 2;
  const extent = Math.max(24, centerY - 25);
  const y = centerY - elevation / scale * extent;
  const style = getComputedStyle(document.documentElement);
  const muted = style.getPropertyValue('--muted').trim();
  const edge = style.getPropertyValue('--edge').trim();
  const stroke = style.getPropertyValue(displayedTarget === 'sun' ? '--accent' : '--moonlight').trim();
  context.font = '11px monospace';
  context.fillStyle = muted;
  context.textBaseline = 'middle';
  context.textAlign = 'left';
  context.strokeStyle = muted;
  context.setLineDash([4, 4]);
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(38, centerY);
  context.lineTo(width - 10, centerY);
  context.stroke();
  context.setLineDash([]);

  context.fillText('+' + scale.toFixed(1) + '°', 3, 14);
  context.fillText('0°', 10, centerY);
  context.fillText('−' + scale.toFixed(1) + '°', 3, height - 14);

  context.beginPath();
  context.arc(width * 0.57, y, 10, 0, 2 * Math.PI);
  context.fillStyle = stroke;
  context.shadowColor = stroke;
  context.shadowBlur = 16;
  context.fill();
  context.shadowBlur = 0;
  context.strokeStyle = edge;
  context.lineWidth = 1;
  context.stroke();
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

function updateVisibility(params) {
  const rows = result.rows;
  const start = Date.parse(params.get('start') + ':00Z');
  const stop = Date.parse(params.get('stop') + ':00Z');
  const times = [start, ...rows.map(row => Date.parse(row.time)).filter(time => time > start && time < stop), stop];
  let above = 0;
  for (let index = 1; index < times.length; index += 1) {
    const duration = times[index] - times[index - 1];
    const first = elevationAt(times[index - 1], rows);
    const last = elevationAt(times[index], rows);
    if (first > 0 && last > 0) above += duration;
    else if (first > 0 && last <= 0) above += duration * first / (first - last);
    else if (first <= 0 && last > 0) above += duration * last / (last - first);
  }
  const percentage = above / (stop - start) * 100;
  const rounded = Math.round(percentage);
  visibilityPie.style.background = 'conic-gradient(var(--accent) ' + percentage + '%, var(--edge) 0)';
  visibilityPie.setAttribute('aria-label', rounded + '% of selected time above the horizon');
  visibilityValue.textContent = rounded + '%';
  const hours = above / 3_600_000;
  visibilityDuration.textContent = hours < 1
    ? Math.round(above / 60_000) + ' min'
    : hours.toFixed(1) + ' hr';
}

function updateCurrentReading() {
  currentIndex = Number(slider.value);
  const row = result.rows[currentIndex];
  reading.textContent = row.time.slice(0, 16).replace('T', ' ') + ' UTC · ' + row.elevation.toFixed(2) + '°';
  slider.setAttribute('aria-valuetext', row.time.slice(0, 16).replace('T', ' ') + ' UTC, ' + row.elevation.toFixed(2) + ' degrees');
  canvas.setAttribute('aria-label', row.elevation.toFixed(2) + ' degrees ' +
    (row.elevation >= 0 ? 'above' : 'below') + ' the horizon at ' + row.time + '.');
  drawChart();
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
  displayedTarget = params.get('target');
  page = 0;
  currentIndex = 0;
  slider.max = String(payload.rows.length - 1);
  slider.value = '0';
  const target = displayedTarget === 'sun' ? 'Sun' : 'Earth';
  const site = params.get('latitude') + '°, ' + params.get('longitude') + '° E';
  summary.textContent = target + ' · ' + site + ' · ' + payload.rows.length + ' samples';
  document.querySelector('#raw').textContent = payload.raw;
  empty.hidden = true;
  data.hidden = false;
  status.textContent = 'Loaded ' + payload.rows.length + ' samples for ' + target + '.';
  download.disabled = false;
  renderTable();
  updateVisibility(params);
  updateCurrentReading();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startPlayback();
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  stopPlayback();
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
playback.addEventListener('click', () => {
  if (playbackTimer) stopPlayback();
  else startPlayback();
});
slider.addEventListener('input', () => {
  stopPlayback();
  updateCurrentReading();
});
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
