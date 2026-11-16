const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let lastSparkleTime = 0;
let lastPointerX = 0;
let lastPointerY = 0;
let activeSparkles = 0;

document.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || reducedMotion.matches || !finePointer.matches) return;

  const now = performance.now();
  if (now - lastSparkleTime < 32 ||
      Math.hypot(event.clientX - lastPointerX, event.clientY - lastPointerY) < 10 ||
      activeSparkles >= 32) return;

  lastSparkleTime = now;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;

  const sparkle = document.createElement('span');
  sparkle.className = 'cursor-sparkle';
  sparkle.textContent = Math.random() < 0.5 ? '✧' : '✦';
  sparkle.setAttribute('aria-hidden', 'true');
  sparkle.style.left = event.clientX + 'px';
  sparkle.style.top = event.clientY + 'px';
  sparkle.style.setProperty('--sparkle-color', Math.random() < 0.5 ? 'var(--accent)' : 'var(--moonlight)');
  sparkle.style.setProperty('--sparkle-size', 11 + Math.random() * 8 + 'px');
  sparkle.style.setProperty('--sparkle-drift-x', (Math.random() * 28 - 14) + 'px');
  sparkle.style.setProperty('--sparkle-drift-y', (-12 - Math.random() * 22) + 'px');
  sparkle.style.setProperty('--sparkle-turn', (Math.random() * 100 - 50) + 'deg');
  document.body.append(sparkle);
  activeSparkles += 1;

  const removeSparkle = () => {
    if (!sparkle.isConnected) return;
    sparkle.remove();
    activeSparkles -= 1;
  };
  sparkle.addEventListener('animationend', removeSparkle, { once: true });
  window.setTimeout(removeSparkle, 800);
}, { passive: true });
