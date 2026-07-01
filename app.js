const canvas = document.getElementById('glCanvas');
const shaderSelect = document.getElementById('shaderSelect');
let mode = 'gour';
let rotationY = 0;
let rotationX = 0.35;
let dragging = false;
let lastX = 0;
let lastY = 0;

let gl = null;
let program = null;
let buffers = null;
let uniforms = null;
let shaderSources = {};

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);

  if (!gl) {
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
}

function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

function multiply(out, a, b) {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  const b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
  const b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
  const b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
  const b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

  out[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
  out[1] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
  out[2] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
  out[3] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;

  out[4] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
  out[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
  out[6] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
  out[7] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;

  out[8] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
  out[9] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
  out[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
  out[11] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;

  out[12] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
  out[13] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
  out[14] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
  out[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

  return out;
}

function perspective(out, fovy, aspect, near, far) {
  const f = 1.0 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = 2 * far * near * nf;
  out[15] = 0;
  return out;
}

function lookAt(out, eye, center, up) {
  const [ex, ey, ez] = eye;
  const [ux, uy, uz] = up;
  const [cx, cy, cz] = center;

  const fx = cx - ex;
  const fy = cy - ey;
  const fz = cz - ez;
  const fLen = Math.hypot(fx, fy, fz);
  const fX = fx / fLen;
  const fY = fy / fLen;
  const fZ = fz / fLen;

  const sX = fY * uz - fZ * uy;
  const sY = fZ * ux - fX * uz;
  const sZ = fX * uy - fY * ux;
  const sLen = Math.hypot(sX, sY, sZ) || 1;
  const s = [sX / sLen, sY / sLen, sZ / sLen];
  const u = [s[1] * fZ - s[2] * fY, s[2] * fX - s[0] * fZ, s[0] * fY - s[1] * fX];

  out[0] = s[0];
  out[1] = u[0];
  out[2] = -fX;
  out[3] = 0;
  out[4] = s[1];
  out[5] = u[1];
  out[6] = -fY;
  out[7] = 0;
  out[8] = s[2];
  out[9] = u[2];
  out[10] = -fZ;
  out[11] = 0;
  out[12] = -(s[0] * ex + s[1] * ey + s[2] * ez);
  out[13] = -(u[0] * ex + u[1] * ey + u[2] * ez);
  out[14] = fX * ex + fY * ey + fZ * ez;
  out[15] = 1;
  return out;
}

function rotateX(out, a, rad) {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}

function rotateY(out, a, rad) {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

  out[0] = a00 * c + a20 * s;
  out[1] = a01 * c + a21 * s;
  out[2] = a02 * c + a22 * s;
  out[3] = a03 * c + a23 * s;
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a20 * c - a00 * s;
  out[9] = a21 * c - a01 * s;
  out[10] = a22 * c - a02 * s;
  out[11] = a23 * c - a03 * s;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}

function preprocessShader(source) {
  return source.replace(/^\s*#version[^\n]*\n/gm, '');
}

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info);
  }

  return shader;
}

function createProgram(vertexSource, fragmentSource) {
  const vertexShader = createShader(gl.VERTEX_SHADER, preprocessShader(vertexSource));
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, preprocessShader(fragmentSource));
  const newProgram = gl.createProgram();
  gl.attachShader(newProgram, vertexShader);
  gl.attachShader(newProgram, fragmentShader);
  gl.linkProgram(newProgram);

  if (!gl.getProgramParameter(newProgram, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(newProgram);
    gl.deleteProgram(newProgram);
    throw new Error(info);
  }

  return newProgram;
}

function buildSphereGeometry(detail = 48) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let lat = 0; lat <= detail; lat += 1) {
    const theta = (lat / detail) * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= detail; lon += 1) {
      const phi = (lon / detail) * Math.PI * 2;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;
      positions.push(x, y, z);
      normals.push(x, y, z);
    }
  }

  for (let lat = 0; lat < detail; lat += 1) {
    for (let lon = 0; lon < detail; lon += 1) {
      const first = lat * (detail + 1) + lon;
      const second = first + detail + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return { positions, normals, indices };
}

function createBuffers(geometry) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);

  return {
    positionBuffer,
    normalBuffer,
    indexBuffer,
    indexCount: geometry.indices.length,
  };
}

function bindAttribute(buffer, attribute, size) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const location = gl.getAttribLocation(program, attribute);
  if (location >= 0) {
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(location);
  }
}

function setUniforms() {
  uniforms = {
    uModelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
    uModelViewProjectionMatrix: gl.getUniformLocation(program, 'uModelViewProjectionMatrix'),
    uNormalMatrix: gl.getUniformLocation(program, 'uNormalMatrix'),
    uMaterialAmbient: gl.getUniformLocation(program, 'uMaterialAmbient'),
    uMaterialDiffuse: gl.getUniformLocation(program, 'uMaterialDiffuse'),
    uMaterialSpecular: gl.getUniformLocation(program, 'uMaterialSpecular'),
    uMaterialShininess: gl.getUniformLocation(program, 'uMaterialShininess'),
    uLightAmbient: gl.getUniformLocation(program, 'uLightAmbient'),
    uLightDiffuse: gl.getUniformLocation(program, 'uLightDiffuse'),
    uLightSpecular: gl.getUniformLocation(program, 'uLightSpecular'),
    uLightPosition: gl.getUniformLocation(program, 'uLightPosition'),
    uLightConstantAttenuation: gl.getUniformLocation(program, 'uLightConstantAttenuation'),
    uLightLinearAttenuation: gl.getUniformLocation(program, 'uLightLinearAttenuation'),
    uLightQuadraticAttenuation: gl.getUniformLocation(program, 'uLightQuadraticAttenuation'),
    uSceneColor: gl.getUniformLocation(program, 'uSceneColor'),
  };
}

async function loadAndUseShader(nextMode) {
  if (!shaderSources[nextMode]) {
    const [vertexSource, fragmentSource] = await Promise.all([
      fetch(`./${nextMode}/${nextMode}.vert`).then((response) => response.text()),
      fetch(`./${nextMode}/${nextMode}.frag`).then((response) => response.text()),
    ]);
    shaderSources[nextMode] = { vertexSource, fragmentSource };
  }

  const source = shaderSources[nextMode];
  program = createProgram(source.vertexSource, source.fragmentSource);
  gl.useProgram(program);
  setUniforms();
  bindAttribute(buffers.positionBuffer, 'aPosition', 3);
  bindAttribute(buffers.normalBuffer, 'aNormal', 3);
  mode = nextMode;
}

function drawScene(time) {
  if (!program || !buffers) {
    return;
  }

  const aspect = canvas.width / Math.max(canvas.height, 1);
  const projectionMatrix = [
    1.35 / aspect, 0, 0, 0,
    0, 1.35, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];

  let modelViewMatrix = identity([]);
  modelViewMatrix = rotateX(modelViewMatrix, modelViewMatrix, rotationX + Math.sin(time * 0.7) * 0.08);
  modelViewMatrix = rotateY(modelViewMatrix, modelViewMatrix, rotationY + time * 0.2);
  modelViewMatrix[14] = -3.2;

  const modelViewProjectionMatrix = multiply([], projectionMatrix, modelViewMatrix);
  const normalMatrix = [
    modelViewMatrix[0], modelViewMatrix[1], modelViewMatrix[2],
    modelViewMatrix[4], modelViewMatrix[5], modelViewMatrix[6],
    modelViewMatrix[8], modelViewMatrix[9], modelViewMatrix[10],
  ];

  gl.clearColor(0.03, 0.06, 0.12, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);
  gl.uniformMatrix4fv(uniforms.uModelViewMatrix, false, modelViewMatrix);
  gl.uniformMatrix4fv(uniforms.uModelViewProjectionMatrix, false, modelViewProjectionMatrix);
  gl.uniformMatrix3fv(uniforms.uNormalMatrix, false, normalMatrix);
  gl.uniform4fv(uniforms.uMaterialAmbient, [0.22, 0.2, 0.25, 1.0]);
  gl.uniform4fv(uniforms.uMaterialDiffuse, [0.78, 0.8, 0.9, 1.0]);
  gl.uniform4fv(uniforms.uMaterialSpecular, [0.95, 0.95, 0.95, 1.0]);
  gl.uniform1f(uniforms.uMaterialShininess, 40.0);
  gl.uniform4fv(uniforms.uLightAmbient, [0.15, 0.15, 0.18, 1.0]);
  gl.uniform4fv(uniforms.uLightDiffuse, [0.95, 0.9, 0.85, 1.0]);
  gl.uniform4fv(uniforms.uLightSpecular, [1.0, 1.0, 1.0, 1.0]);
  gl.uniform4fv(uniforms.uLightPosition, [0.9, 0.6, 2.3, 1.0]);
  gl.uniform1f(uniforms.uLightConstantAttenuation, 1.0);
  gl.uniform1f(uniforms.uLightLinearAttenuation, 0.0);
  gl.uniform1f(uniforms.uLightQuadraticAttenuation, 0.0);
  gl.uniform4fv(uniforms.uSceneColor, [0.02, 0.03, 0.07, 1.0]);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
  gl.drawElements(gl.TRIANGLES, buffers.indexCount, gl.UNSIGNED_SHORT, 0);
}

function render(now) {
  resizeCanvas();
  drawScene(now * 0.001);
  requestAnimationFrame(render);
}

async function start() {
  gl = canvas.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) {
    throw new Error('WebGL is not available in this browser.');
  }

  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0.03, 0.06, 0.12, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  buffers = createBuffers(buildSphereGeometry(48));
  await loadAndUseShader(mode);
  requestAnimationFrame(render);
}

shaderSelect.addEventListener('change', async (event) => {
  await loadAndUseShader(event.target.value);
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
start().catch((error) => {
  console.error(error);
  canvas.outerHTML = `<p class="error">The shader demo could not start. ${error.message}</p>`;
});
