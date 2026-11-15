import { useEffect, useRef, useState } from "react";

// Rotating Earth seen from space, drawn with WebGL: NASA Blue Marble by day, Black Marble city
// lights by night, a moving day/night line, clouds, atmosphere and the Sun in the background.
// Only lives in the hero; it stops drawing when the hero is off screen or the tab is hidden.

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uSpin;
uniform vec3 uSun;
uniform vec2 uSunPos;
uniform sampler2D uDay;
uniform sampler2D uNight;

const float PI = 3.14159265;
const float TILT = 0.4084; // 23.4 degrees

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
                 mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
                 mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - uCenter) / uRadius;
  float r = length(p);
  vec3 L = normalize(uSun);
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  // The Sun far away, with a soft glare.
  float ds = length(frag - uSunPos) / uRadius;
  float sun = smoothstep(0.07, 0.055, ds) + 0.45 * exp(-ds * 6.0) + 0.14 * exp(-ds * 1.8);

  if (r < 1.0) {
    vec3 n = vec3(p, sqrt(1.0 - r * r));
    // View → Earth coordinates: undo axial tilt, then the daily spin.
    float ct = cos(TILT), st = sin(TILT);
    vec3 q = vec3(ct * n.x + st * n.y, -st * n.x + ct * n.y, n.z);
    float cs = cos(uSpin), ss = sin(uSpin);
    vec3 o = vec3(cs * q.x - ss * q.z, q.y, ss * q.x + cs * q.z);

    float lat = asin(clamp(o.y, -1.0, 1.0));
    float lon = atan(o.x, o.z);
    vec2 uv = vec2(0.5 + lon / (2.0 * PI), 0.5 - lat / PI);

    vec3 day = texture2D(uDay, uv).rgb;
    vec3 night = texture2D(uNight, uv).rgb;

    float diff = dot(n, L);
    float lit = smoothstep(-0.15, 0.2, diff);

    // Clouds turn with the planet and drift a little.
    float cl = fbm(o * 4.0 + vec3(uSpin * 0.15, 0.0, 0.0));
    float clouds = smoothstep(0.55, 0.85, cl) * 0.6;

    vec3 dayCol = day * (0.08 + 1.05 * max(diff, 0.0));
    // Warmer light along the day/night line (sunrise and sunset).
    dayCol *= mix(vec3(1.0), vec3(1.25, 0.82, 0.6), smoothstep(0.35, 0.0, diff) * lit);
    dayCol = mix(dayCol, vec3(max(diff, 0.0) * 1.05 + 0.04), clouds);

    float lum = dot(night, vec3(0.299, 0.587, 0.114));
    vec3 lights = vec3(1.0, 0.72, 0.4) * smoothstep(0.22, 0.75, lum) * 1.7 * (1.0 - clouds * 0.8);
    vec3 nightCol = night * 0.12 + lights;

    // Sun glint on the oceans.
    float ocean = smoothstep(0.02, 0.08, day.b - day.r) * (1.0 - clouds);
    vec3 h = normalize(L + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(n, h), 0.0), 60.0) * ocean * 0.55 * lit;

    col = mix(nightCol, dayCol, lit) + spec;

    // Atmosphere seen at the edge of the disc.
    float rim = pow(1.0 - n.z, 2.2);
    col += vec3(0.32, 0.55, 1.0) * rim * (0.08 + 0.9 * smoothstep(-0.25, 0.5, diff));
    col *= 0.78;
    alpha = 1.0;
  } else {
    // Thin glowing atmosphere around the planet, brighter towards the Sun.
    float side = smoothstep(-0.4, 0.8, dot(normalize(p), normalize(L.xy)));
    float halo = exp(-(r - 1.0) * 30.0) * (0.12 + 0.75 * side);
    col = vec3(0.32, 0.55, 1.0) * halo;
    alpha = halo;
    col += vec3(1.0, 0.96, 0.86) * sun;
    alpha = clamp(alpha + sun, 0.0, 1.0);
    // The canvas is not premultiplied: store the colour, let alpha do the fading.
    col = alpha > 0.001 ? min(col / alpha, vec3(1.0)) : col;
  }

  gl_FragColor = vec4(col, alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

function loadTexture(gl: WebGLRenderingContext, unit: number, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      // No mipmaps: they draw a seam where longitude wraps around.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      resolve();
    };
    img.onerror = () => reject(new Error(url));
    img.src = url;
  });
}

/** Seconds for one full turn of the planet. */
const DAY_SECONDS = 90;

export function EarthGlobe() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: false,
      antialias: true,
      alpha: true,
    });
    if (!gl) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    } catch {
      return;
    }
    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uRes = u("uRes");
    const uCenter = u("uCenter");
    const uRadius = u("uRadius");
    const uSpin = u("uSpin");
    const uSun = u("uSun");
    const uSunPos = u("uSunPos");
    gl.uniform1i(u("uDay"), 0);
    gl.uniform1i(u("uNight"), 1);
    // Sun to the right and slightly above: day on the right, night (city lights) on the left.
    const sunDir = [0.94, 0.26, 0.22];
    gl.uniform3fv(uSun, sunDir);

    let loaded = false;
    let visible = true;
    let raf = 0;
    const start = performance.now();
    // Start with Africa and Europe facing us.
    const spin0 = -0.35;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const wide = w >= 768;
      let radius: number, cx: number, cy: number, sx: number, sy: number;
      // GL y goes up: a low value is low on the screen.
      // The planet sits in the centre, behind the hero text.
      if (wide) {
        radius = Math.min(h * 0.4, w * 0.3);
        cx = w * 0.5;
        cy = h * 0.47;
        sx = Math.min(w - 70, cx + radius * 1.7);
        sy = Math.min(h - 100, cy + radius * 0.85);
      } else {
        radius = Math.min(w * 0.58, h * 0.32);
        cx = w * 0.5;
        cy = h * 0.47;
        sx = w - 30;
        sy = Math.min(h - 140, cy + radius * 1.25);
      }
      radius *= dpr;
      cx *= dpr;
      cy *= dpr;
      sx *= dpr;
      sy *= dpr;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uCenter, cx, cy);
      gl.uniform1f(uRadius, radius);
      gl.uniform2f(uSunPos, sx, sy);
    };

    const draw = () => {
      raf = 0;
      if (!loaded) return;
      const t = (performance.now() - start) / 1000;
      const spin = spin0 + (reduce ? 0 : (t / DAY_SECONDS) * Math.PI * 2);
      gl.uniform1f(uSpin, spin);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    layout();
    Promise.all([
      loadTexture(gl, 0, "/textures/earth-day.jpg"),
      loadTexture(gl, 1, "/textures/earth-night.jpg"),
    ])
      .then(() => {
        loaded = true;
        setReady(true);
        kick();
      })
      .catch(() => undefined);

    const obs = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      if (visible) kick();
    });
    obs.observe(canvas);
    const onResize = () => {
      layout();
      kick();
    };
    const onVis = () => kick();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`absolute inset-0 h-full w-full transition-opacity duration-[1500ms] ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
}
