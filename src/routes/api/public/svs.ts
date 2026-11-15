import { createFileRoute } from "@tanstack/react-router";
import { isAllowedSvsPath } from "@/lib/svs";

// Streams NASA SVS videos through our origin so the jukebox can analyse frames.
// Only public NASA visualization files (/vis/...mp4) are allowed.
const PASS_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "last-modified",
  "etag",
];

export const Route = createFileRoute("/api/public/svs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const path = url.searchParams.get("path");
        if (!isAllowedSvsPath(path)) {
          return new Response("Invalid path", { status: 400 });
        }

        const upstreamHeaders = new Headers();
        const range = request.headers.get("range");
        if (range) upstreamHeaders.set("range", range);

        const upstream = await fetch(`https://svs.gsfc.nasa.gov${path}`, {
          headers: upstreamHeaders,
        });

        if (!upstream.ok && upstream.status !== 206) {
          return new Response("Upstream error", { status: upstream.status });
        }

        const headers = new Headers();
        for (const h of PASS_HEADERS) {
          const v = upstream.headers.get(h);
          if (v) headers.set(h, v);
        }
        if (!headers.has("accept-ranges")) headers.set("accept-ranges", "bytes");
        headers.set("cache-control", "public, max-age=86400");

        return new Response(upstream.body, { status: upstream.status, headers });
      },
    },
  },
});
