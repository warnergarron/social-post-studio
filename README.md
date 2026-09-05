# FRAME

FRAME is a local-first social post editor built for quick image composition in the browser. It provides a focused alternative to hosted design tools: no account, backend, upload service, or project database is required.

The editor supports common social media formats, draggable text and image layers, gradient overlays, Google Fonts, and full-resolution PNG export.

## Features

- Square, portrait, story, reel, and landscape canvas presets
- Background image scaling and two-axis positioning
- Draggable text and image layers
- Per-layer rotation, opacity, duplication, and deletion
- Font family, weight, size, line height, tracking, alignment, color, italics, uppercase, and shadow controls
- Image sizing, corner radius, and optional borders
- Two-color gradient overlays with configurable opacity and direction
- Automatic local draft recovery
- PNG export at the selected format's native resolution
- Responsive desktop and mobile layout

## Technology

- [Next.js](https://nextjs.org/) for the local development and production build
- [React](https://react.dev/) for editor state and interactive controls
- TypeScript for layer and editor state definitions
- Native HTML Canvas API for PNG rendering and export
- Native Pointer Events for mouse and touch dragging
- Browser `FileReader` for local image loading
- Browser `localStorage` for draft persistence
- Google Fonts CSS API for typography
- Plain CSS for the interface; no component or styling framework

## How it works

The editor renders an interactive preview with regular HTML elements. Text and image positions are stored as percentages, keeping the composition stable across preview sizes.

Export uses a separate canvas at the selected preset's full resolution. Backgrounds, overlays, image layers, text styles, rotation, opacity, borders, and corner radii are redrawn onto that canvas before the browser downloads the PNG.

Uploaded files are converted to data URLs and remain inside the browser. The current design is serialized to `localStorage` and restored on the next visit.

## Project structure

```text
app/
  globals.css   Interface and canvas styles
  layout.tsx    Document metadata and root layout
  page.tsx      Editor state, controls, rendering, and export
public/
  favicon.svg
```

The project intentionally keeps the implementation compact. There is no API route, database, authentication layer, state library, canvas dependency, or analytics package.

## Run locally

Node.js 22.13 or newer is required.

```bash
git clone https://github.com/warnergarron/social-post-studio.git
cd social-post-studio
npm install
npm run dev
```

Open the local address printed in the terminal, normally `http://localhost:3000`.

## Production build

```bash
npm run build
npm start
```

## Validation

```bash
npm run lint
npm run build
```

## Privacy and limitations

- FRAME does not send designs or images to an application server.
- Google Fonts require an internet connection when a font is loaded for the first time.
- Browser storage capacity varies. Projects containing several large images can exceed the available `localStorage` quota.
- Drafts belong to the current browser and origin; they are not synchronized between devices.
- PNG is currently the only export format.

## Contributing

Bug reports and focused pull requests are welcome. Before opening a pull request, run the validation commands above and keep new dependencies justified by a concrete requirement.

## License

FRAME is available under the [MIT License](LICENSE). You may use, modify, and distribute it in personal and commercial projects.
