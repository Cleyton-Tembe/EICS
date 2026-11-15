<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- NASA SVS videos are streamed through `/api/public/svs` (allow-listed `/vis/...mp4` paths only) so the browser can read frames same-origin; never point `<video>` straight at svs.gsfc.nasa.gov, since its CORS blocks pixel reads.
- Frame→music mapping lives in pure functions (`src/lib/sonification.ts`) with tests; the Web Audio synth (`src/lib/jukebox-audio.ts`) only renders a `MusicState`, so mapping changes never touch audio code.
- Each visualization also has a phenomenon sound (wind, rain, ice…). Frame→phenomenon level→sound mapping lives in `src/lib/phenomena.ts` (ranges calibrated on the real SVS videos at 128×72); `src/lib/phenomenon-audio.ts` only renders a `PhenomenonSound`. The level must keep driving volume and pitch together: low phenomenon = quiet, low sound; high = loud, high sound.
- "Ver no Worldview" links are built in `src/lib/worldview.ts`; every layer id and date in `visualizations.ts` must exist in Worldview's config (https://worldview.earthdata.nasa.gov/config/wv.json), and high-resolution Landsat (HLS) layers need a date with a real, cloud-free pass.
- Visual style: NASA colours (NASA blue #0B3D91, NASA red #FC3D21, star white, with lighter blue tints for text) on the deep navy background with the nebula glow and twinkling `Starfield` from the first version. That background glow is the only gradient: buttons, cards and hover states stay solid. The rotating Earth (`EarthGlobe`, WebGL with NASA Blue Marble / Black Marble textures in `public/textures/`), with the Sun and the Moon balanced on opposite sides, lives only in the hero.
- Video cards keep the full-screen layout (video over its blurred poster). The title card starts minimised as one small button and expands on demand, so it does not cover the video; the description ("what the changes mean") and the live sonification panel also open on demand. Choices are remembered. No visible timeline/progress bar: going back and forward in time is by dragging the video or ←/→. The explanation of how sounds are made lives on `/sobre`.
- The hero shows the rotating Earth centred behind the text and plays a short welcome sound (`src/lib/intro-sound.ts`) on arrival, on the first visit only. It is never triggered by a click: if the browser blocks sound on arrival, it stays silent. Videos follow `FEATURED_ORDER` in `visualizations.ts` (ice first, then CO₂).
- The site is in English by default, with Portuguese as an option (`src/lib/i18n.ts`, `LangProvider`). Every visible string goes through `t()`; each visualization has its English text in `en` (the Portuguese is in the main fields).
