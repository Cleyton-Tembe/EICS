// Helpers for NASA Scientific Visualization Studio (SVS) media.
// Videos are streamed through our own /api/public/svs route so the browser can read
// their pixels (same-origin) for real-time sonification.

const SVS_PATH_RE = /^\/vis\/a\d{6}\/a\d{6}\/a\d{6}\/[A-Za-z0-9_,.-]+\.mp4$/;

export function isAllowedSvsPath(path: string | null | undefined): path is string {
  if (!path || path.length > 300) return false;
  if (path.includes("..")) return false;
  return SVS_PATH_RE.test(path);
}

export function svsVideoProxyUrl(path: string): string {
  return `/api/public/svs?path=${encodeURIComponent(path)}`;
}

export function svsAssetUrl(path: string): string {
  return `https://svs.gsfc.nasa.gov${path}`;
}
