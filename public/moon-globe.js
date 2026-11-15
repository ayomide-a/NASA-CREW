import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const radius = 1;
const startView = { latitude: -44, longitude: 16 };

function lunarPosition({ latitude, longitude }, distance = radius) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  // The NASA texture has 0° longitude at its midpoint. Three.js maps that to +X.
  return new THREE.Vector3(
    distance * Math.cos(lat) * Math.cos(lon),
    distance * Math.sin(lat),
    -distance * Math.cos(lat) * Math.sin(lon)
  );
}

function createGlobeGeometry() {
  const geometry = new THREE.SphereGeometry(radius, 112, 80);
  const { position, normal, uv } = geometry.attributes;
  for (let vertex = 0; vertex < position.count; vertex++) {
    // Concentrate latitude rows near the poles for small landing regions.
    const latitude = 90 * Math.sin((uv.getY(vertex) - 0.5) * Math.PI);
    const longitude = 360 * uv.getX(vertex) - 180;
    const point = lunarPosition({ latitude, longitude });
    position.setXYZ(vertex, point.x, point.y, point.z);
    normal.setXYZ(vertex, point.x, point.y, point.z);
    uv.setY(vertex, (latitude + 90) / 180);
  }
  return geometry;
}

function createRegionLayer(moon, renderer) {
  const surface = document.createElement('canvas');
  const width = Math.min(4096, renderer.capabilities.maxTextureSize);
  const height = width / 2;
  surface.width = width;
  surface.height = height;
  const context = surface.getContext('2d');
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const overlay = new THREE.Mesh(moon.geometry, new THREE.MeshBasicMaterial({
    map: texture, transparent: true, depthWrite: false
  }));
  overlay.scale.setScalar(1.0005);
  moon.add(overlay);
  let paths = [];

  function setRegions(regions) {
    context.clearRect(0, 0, width, height);
    paths = regions.map(({ index, color, rings }) => {
      const path = new Path2D();
      // Duplicate the unwrapped polygon on both sides of the texture seam.
      const anchor = rings[0][0][0];
      for (const offset of [-360, 0, 360]) {
        for (const ring of rings) {
          const shift = offset + 360 * Math.round((anchor - ring[0][0]) / 360);
          ring.forEach(([longitude, latitude], vertex) => {
            const x = (longitude + shift + 180) * width / 360;
            const y = (90 - latitude) * height / 180;
            if (vertex === 0) path.moveTo(x, y);
            else path.lineTo(x, y);
          });
          path.closePath();
        }
      }
      context.fillStyle = color;
      context.strokeStyle = color;
      const latitude = THREE.MathUtils.degToRad(rings[0][0][1]);
      context.lineWidth = Math.max(0.6, 2 * Math.cos(latitude));
      context.globalAlpha = 0.35;
      context.fill(path, 'evenodd');
      context.globalAlpha = 0.9;
      context.stroke(path);
      return { index, path };
    });
    overlay.visible = paths.length > 0;
    texture.needsUpdate = true;
  }

  function regionAt(u, v) {
    return paths.findLast(({ path }) =>
      context.isPointInPath(path, u * width, (1 - v) * height, 'evenodd'))?.index;
  }

  return { setRegions, regionAt };
}

export async function createMoonGlobe({ viewport, pinLayer, onSelect, onRegionSelect }) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: true });
  if (!gl) throw new Error('WebGL 2 is unavailable');

  const texture = await new THREE.TextureLoader().loadAsync('/assets/lroc-color-2k.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true });
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  viewport.append(canvas);

  const moon = new THREE.Mesh(createGlobeGeometry(),
    new THREE.MeshLambertMaterial({ map: texture }));
  const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 20);
  const scene = new THREE.Scene();
  const light = new THREE.DirectionalLight(0xe3eeff, 1.35);
  scene.add(moon, new THREE.AmbientLight(0xffffff, 1.25), light, light.target);

  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.minDistance = 1.055;
  controls.maxDistance = 7;
  controls.rotateSpeed = 0.65;
  controls.zoomSpeed = 0.75;

  let pins = [];
  let regionLayer;
  let pointerStart;
  const projected = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function draw() {
    const { clientWidth: width, clientHeight: height } = viewport;
    if (!width || !height) return;
    light.position.copy(camera.position);
    light.position.x += 1.2;
    light.position.y += 1.8;
    renderer.render(scene, camera);

    for (const { button, position } of pins) {
      projected.copy(position).project(camera);
      const visible = position.dot(camera.position) > radius * radius &&
        Math.abs(projected.x) < 0.96 && Math.abs(projected.y) < 0.92;
      button.hidden = !visible;
      if (visible) {
        button.style.left = (projected.x + 1) * 50 + '%';
        button.style.top = (1 - projected.y) * 50 + '%';
      }
    }
  }

  function fitViewport() {
    const { clientWidth: width, clientHeight: height } = viewport;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    draw();
  }

  function aimAt(position) {
    camera.position.copy(position);
    controls.update();
    draw();
  }

  function focus(site = startView) {
    aimAt(lunarPosition(site, 3.55 / Math.min(1, camera.aspect)));
  }

  function focusRegions(outlines) {
    const vertices = outlines.flatMap(ring => ring.slice(0, -1).map(([longitude, latitude]) =>
      lunarPosition({ latitude, longitude })));
    const center = new THREE.Vector3();
    for (const vertex of vertices) center.add(vertex);
    center.normalize();
    const size = Math.max(...vertices.map(vertex => center.distanceTo(vertex)));
    const viewportSlope = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(1, camera.aspect);
    aimAt(center.multiplyScalar(1 + 1.5 * size / viewportSlope));
  }

  function setRegions(regions) {
    if (!regionLayer && regions.length) regionLayer = createRegionLayer(moon, renderer);
    regionLayer?.setRegions(regions);
    draw();
  }

  canvas.addEventListener('pointerdown', event => {
    pointerStart = event.isPrimary && event.button === 0 ? [event.clientX, event.clientY] : undefined;
  });
  canvas.addEventListener('pointermove', event => {
    if (pointerStart && Math.hypot(event.clientX - pointerStart[0], event.clientY - pointerStart[1]) > 5) {
      pointerStart = undefined;
    }
  });
  canvas.addEventListener('pointercancel', () => { pointerStart = undefined; });
  canvas.addEventListener('click', event => {
    if (!pointerStart || !regionLayer) return;
    pointerStart = undefined;
    const bounds = canvas.getBoundingClientRect();
    pointer.set(2 * (event.clientX - bounds.left) / bounds.width - 1,
      1 - 2 * (event.clientY - bounds.top) / bounds.height);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(moon, false)[0];
    if (!hit?.uv) return;
    const { x, y } = hit.uv;
    const index = regionLayer.regionAt(x, y);
    if (index !== undefined) onRegionSelect(index, y * 180 - 90, x * 360 - 180);
  });

  function setSites(sites) {
    pins = sites.map(site => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'globe-pin';
      button.setAttribute('aria-label', 'Select ' + site.mission + ' on globe');
      button.setAttribute('aria-pressed', 'false');
      button.title = site.mission;
      button.addEventListener('click', () => onSelect(site));
      return { site, button, position: lunarPosition(site) };
    });
    pinLayer.replaceChildren(...pins.map(({ button }) => button));
    draw();
  }

  function select(site) {
    for (const pin of pins) pin.button.setAttribute('aria-pressed', String(pin.site === site));
  }

  controls.addEventListener('change', draw);
  fitViewport();
  focus();
  new ResizeObserver(fitViewport).observe(viewport);
  return { setSites, select, focus, setRegions, focusRegions };
}
