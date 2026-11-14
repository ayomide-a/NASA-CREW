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
const pageSize = 8;
let result;
let page = 0;
let displayedTarget;

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
