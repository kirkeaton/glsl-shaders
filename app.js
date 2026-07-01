const canvas = document.getElementById('glCanvas');
const ctx = canvas.getContext('2d');
const shaderSelect = document.getElementById('shaderSelect');
let mode = 'gour';

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function shade(baseColor, normal, lightDir, viewDir, kind) {
  const ambient = 0.18;
  const diffuse = Math.max(dot(normal, lightDir), 0.0);
  const specular = kind === 'blinn'
    ? Math.pow(Math.max(dot(normal, normalize(add(lightDir, viewDir))), 0.0), 48.0)
    : Math.pow(Math.max(dot(reflect(negate(lightDir), normal), viewDir), 0.0), 48.0);
  const intensity = ambient + diffuse * 0.9 + specular * 0.7;
  return `rgb(${Math.round(baseColor[0] * intensity)}, ${Math.round(baseColor[1] * intensity)}, ${Math.round(baseColor[2] * intensity)})`;
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function negate(v) {
  return [-v[0], -v[1], -v[2]];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(v) {
  const length = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / length, v[1] / length, v[2] / length];
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function reflect(i, n) {
  const dotValue = dot(i, n);
  return [i[0] - 2 * dotValue * n[0], i[1] - 2 * dotValue * n[1], i[2] - 2 * dotValue * n[2]];
}

function rotatePoint(point, rotationY, rotationX) {
  let x = point[0];
  let y = point[1];
  let z = point[2];

  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);
  const cosX = Math.cos(rotationX);
  const sinX = Math.sin(rotationX);

  const rotatedZ = z * cosY - x * sinY;
  const rotatedX = z * sinY + x * cosY;
  const rotatedY = y * cosX - rotatedZ * sinX;
  const finalZ = y * sinX + rotatedZ * cosX;

  return [rotatedX, rotatedY, finalZ];
}

function intersectSphere(origin, direction, radius) {
  const b = dot(origin, direction);
  const c = dot(origin, origin) - radius * radius;
  const discriminant = b * b - c;

  if (discriminant < 0) {
    return null;
  }

  const t = -b - Math.sqrt(discriminant);
  return t > 0.0001 ? [origin[0] + direction[0] * t, origin[1] + direction[1] * t, origin[2] + direction[2] * t] : null;
}

function drawScene(time) {
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.22;
  const lightDir = normalize([0.7, 0.8, 1.0]);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) {
        const idx = (y * w + x) * 4;
        data[idx] = 10;
        data[idx + 1] = 18;
        data[idx + 2] = 40;
        data[idx + 3] = 255;
        continue;
      }

      const normal = normalize([dx / radius, dy / radius, Math.sqrt(Math.max(1 - (dx * dx + dy * dy) / (radius * radius), 0))]);
      const baseColor = [90 + 70 * (0.5 + 0.5 * normal[0]), 120 + 60 * (0.5 + 0.5 * normal[1]), 220 + 30 * (0.5 + 0.5 * normal[2])];
      const viewDir = normalize([0, 0, 1]);
      const shaded = shade(baseColor, normal, lightDir, viewDir, mode);
      const [r, g, b] = shaded.match(/\d+/g).map(Number);

      const idx = (y * w + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = 'rgba(248,250,252,0.85)';
  ctx.fillText(`Lighting model: ${mode}`, 18, 28);
}

function render(now) {
  resizeCanvas();
  drawScene(now * 0.001);
  requestAnimationFrame(render);
}

shaderSelect.addEventListener('change', (event) => {
  mode = event.target.value;
});
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(render);
