# Horse Racing

A six-round racing dashboard built with Vue 3, Pinia and Vite. Generate a program to draw the fields, then start, pause or resume the meeting. Each completed round adds ten official placings to the Results panel.

## Requirements

- **Offline demo:** Any modern browser. Extract the ZIP archive and open the top-level `index.html`.
- **Source and tests:** Node.js 22.12 or later, with npm. npm is included with Node.js. Check the installation:

  ```bash
  node --version
  npm --version
  ```

- **Browser tests:** Playwright's Chromium headless shell. Node.js alone is sufficient for unit tests.

This project declares npm dependencies in `package.json` and pins their versions in `package-lock.json`. From the `horse-racing` folder, where `package.json` is located, install them with:

```bash
npm ci
```

## Run locally

```bash
npm run dev
```

Open the local URL printed by Vite.

To rebuild the standalone demo:

```bash
npm run build
```

Then open `dist/index.html`. The build embeds the application, styles and Inter font. Editable source files live in `src/`.

## Game rules

- Each draw generates the full pool of 20 horses, matching the explicit pool size in the rules. Names and unique colors are shuffled, and each horse receives an integer condition from 1 through 100.
- Each round draws ten different horses without replacement. All 20 are eligible again in the next round. Distances in order are 1200, 1400, 1600, 1800, 2000 and 2200 metres.
- Each horse has a condition-influenced pace and a random pace adjustment in each of six equal-distance sectors. The clock is compressed for viewing. Position is interpolated between sector crossings, so refresh rate does not alter the result.
- Placings use exact simulated finish times, including when two horses cross in one frame. In an exact tie, the lower starting lane takes precedence.
- The entire result appears when the last horse crosses. The completed field stays at the line for one second before the next round starts. Generating a program at any time starts a fresh meeting.

## Project structure

| Location | Responsibility |
| --- | --- |
| `src/domain/roster.js` | Stable, colors and random sampling |
| `src/domain/race.js` | Program draw, sector pace, progress and finish order |
| `src/stores/race.js` | Pinia store for the meeting, phase transitions and publication of results |
| `src/composables/useRaceClock.js` | Animation-frame scheduling and cleanup on pause, regeneration or unmount |
| `src/components/` | Controls, roster, track, galloping horse and reusable program/results panel |
| `tests/unit/` | Race rules and store transitions using the Node.js test runner |
| `tests/browser/` | Chromium end-to-end tests and visual regression tests with reference images |

## Tests

Run these commands from the `horse-racing` folder.

On Windows or macOS, install the dependencies and Chromium headless shell with:

```bash
npm ci
npx playwright install --only-shell chromium
npm test
```

On Linux, install Chromium and its system dependencies with:

```bash
npm ci
npx playwright install --with-deps --only-shell chromium
npm test
```

`npm test` runs the unit tests first, then starts Playwright. Browser tests run against the production build.

To run only one test group:

```bash
npm run test:unit
npm run test:e2e
npm run test:visual
```

| Test group | Scenarios |
| --- | --- |
| Unit | Roster size and color uniqueness, condition limits, six distances, sampling without duplicates, sector interpolation, close finishes, exact ties, pause/resume, round advancement, regeneration and completion |
| End-to-end | Draw from the visible stable, start gating, movement and pause, sequential publication of all 60 placings, finish-line alignment, regeneration mid-meet and opening the standalone demo offline |
| Layout checks | Left-hand gates stacked in order 1 through 10 with labels rotated 90° counterclockwise and no horizontal page overflow at 360, 768, 1024 and 1440 px |
| Visual regression | Empty desktop, paused desktop race, completed meeting and full mobile starting grid |

Browser tests run against the production build. The visual fixtures fix the random seed, viewport, font, motion preference and race clock. Baselines are captured on Linux with the Chromium revision pinned by Playwright. Other operating systems can render text slightly differently. After an intentional design change, inspect the comparison and use `npm run test:visual -- --update-snapshots` to accept new references.
