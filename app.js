const canvas = document.getElementById('glCanvas');
const ctx = canvas.getContext('2d');
const shaderSelect = document.getElementById('shaderSelect');
let mode = 'gour';

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function shade(baseColor, normal, lightDir, viewDir, kind) {
  const ambient = 0.2;
  const diffuse = Math.max(dot(normal, lightDir), 0.0);
  const specular = kind === 'blinn'
    ? Math.pow(Math.max(dot(normal, normalize(add(lightDir, viewDir))), 0.0), 32.0)
    : Math.pow(Math.max(dot(reflect(negate(lightDir), normal), viewDir), 0.0), 32.0);
  const intensity = ambient + diffuse * 0.8 + specular * 0.5;
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

function reflect(i, n) {
  const dotValue = dot(i, n);
  return [i[0] - 2 * dotValue * n[0], i[1] - 2 * dotValue * n[1], i[2] - 2 * dotValue * n[2]];
}

function projectPoint(point, rotationY, rotationX, scale, offsetX, offsetY) {
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

  return {
    x: offsetX + rotatedX * scale,
    y: offsetY - rotatedY * scale,
    z: finalZ,
  };
}

function drawFace(points, color, normal, lightDir, viewDir, kind, rotationY, rotationX) {
  const projected = points.map((point) => projectPoint(point, rotationY, rotationX, 140, canvas.clientWidth / 2, canvas.clientHeight / 2));
  const fillStyle = shade(color, normal, lightDir, viewDir, kind);
  ctx.beginPath();
  ctx.moveTo(projected[0].x, projected[0].y);
  projected.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.stroke();
}

function drawScene(time) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);

  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(0, 0);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = 'rgba(248,250,252,0.8)';
  ctx.fillText(`Lighting model: ${mode}`, 18, 28);
  ctx.restore();

  const rotY = time * 0.6;
  const rotX = 0.45 + Math.sin(time * 0.55) * 0.2;
  const lightDir = normalize([0.6, 0.8, 1.0]);
  const viewDir = normalize([0.0, 0.0, 1.0]);

  const faces = [
    { points: [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1]], normal: [0, 0, -1], color: [70, 130, 230] },
    { points: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], normal: [0, 0, 1], color: [150, 90, 220] },
    { points: [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]], normal: [-1, 0, 0], color: [35, 185, 120] },
    { points: [[1, -1, -1], [1, -1, 1], [1, 1, 1], [1, 1, -1]], normal: [1, 0, 0], color: [220, 90, 70] },
    { points: [[-1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, -1, -1]], normal: [0, -1, 0], color: [240, 180, 60] },
    { points: [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]], normal: [0, 1, 0], color: [170, 220, 90] },
  ];

  faces.forEach((face) => drawFace(face.points, face.color, face.normal, lightDir, viewDir, mode, rotY, rotX));
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
