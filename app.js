const canvas = document.getElementById('glCanvas');
const ctx = canvas.getContext('2d');
const shaderSelect = document.getElementById('shaderSelect');
let mode = 'gour';
let rotationY = 0;
let rotationX = 0.35;
let dragging = false;
let lastX = 0;
let lastY = 0;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function shade(baseColor, normal, lightDir, viewDir, kind) {
  const ambient = 0.08;
  const nDotL = Math.max(dot(normal, lightDir), 0.0);
  const diffuse = nDotL;

  let specular = 0.0;
  if (nDotL > 0.0) {
    if (kind === 'phong') {
      const reflected = reflect(negate(lightDir), normal);
      specular = Math.pow(Math.max(dot(reflected, viewDir), 0.0), 64.0) * nDotL;
    } else if (kind === 'blinn') {
      const halfway = normalize(add(lightDir, viewDir));
      specular = Math.pow(Math.max(dot(normal, halfway), 0.0), 96.0) * nDotL;
    }
  }

  const intensity =
    ambient + diffuse * 0.95 + specular * (kind === 'blinn' ? 0.7 : 0.45);
  const clamped = Math.max(0.0, Math.min(1.0, intensity));
  return `rgb(${Math.round(baseColor[0] * clamped)}, ${Math.round(baseColor[1] * clamped)}, ${Math.round(baseColor[2] * clamped)})`;
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
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function reflect(i, n) {
  const dotValue = dot(i, n);
  return [
    i[0] - 2 * dotValue * n[0],
    i[1] - 2 * dotValue * n[1],
    i[2] - 2 * dotValue * n[2],
  ];
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
  return t > 0.0001
    ? [
        origin[0] + direction[0] * t,
        origin[1] + direction[1] * t,
        origin[2] + direction[2] * t,
      ]
    : null;
}

function drawScene(time) {
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.22;
  const lightDirWorld = normalize([0.6, 0.4, 1.0]);
  const spinY = rotationY + time * 0.35;
  const spinX = rotationX;

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

      const baseNormal = normalize([
        dx / radius,
        dy / radius,
        Math.sqrt(Math.max(1 - (dx * dx + dy * dy) / (radius * radius), 0)),
      ]);
      const normal = rotatePoint(baseNormal, spinY, spinX);
      const lightDir = lightDirWorld;
      const baseColor = [180, 176, 205];
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
}

function render(now) {
  resizeCanvas();
  drawScene(now * 0.001);
  requestAnimationFrame(render);
}

shaderSelect.addEventListener('change', (event) => {
  mode = event.target.value;
});

canvas.addEventListener('pointerdown', (event) => {
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  if (!dragging) {
    return;
  }
  const deltaX = event.clientX - lastX;
  const deltaY = event.clientY - lastY;
  rotationY += deltaX * 0.01;
  rotationX = Math.max(-0.8, Math.min(0.8, rotationX + deltaY * 0.01));
  lastX = event.clientX;
  lastY = event.clientY;
});

canvas.addEventListener('pointerup', () => {
  dragging = false;
});
canvas.addEventListener('pointerleave', () => {
  dragging = false;
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(render);
