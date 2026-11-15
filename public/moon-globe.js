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

export async function createMoonGlobe({ viewport, pinLayer, onSelect }) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: true });
  if (!gl) throw new Error('WebGL 2 is unavailable');

  const texture = await new THREE.TextureLoader().loadAsync('/assets/lroc-color-2k.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true });
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  viewport.append(canvas);

  const moon = new THREE.Mesh(new THREE.SphereGeometry(radius, 80, 48),
    new THREE.MeshLambertMaterial({ map: texture }));
  const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 20);
  const scene = new THREE.Scene();
  const light = new THREE.DirectionalLight(0xe3eeff, 1.35);
  scene.add(moon, new THREE.AmbientLight(0xffffff, 1.25), light, light.target);

  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.minDistance = 1.32;
  controls.maxDistance = 7;
  controls.rotateSpeed = 0.65;
  controls.zoomSpeed = 0.75;

  let pins = [];
  const projected = new THREE.Vector3();

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

  function focus(site = startView) {
    const distance = Math.max(3.55, 3.55 / Math.min(1, camera.aspect));
    camera.position.copy(lunarPosition(site, distance));
    controls.update();
    draw();
  }

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
  return { setSites, select, focus };
}
