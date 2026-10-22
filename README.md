# ADYPU Compass

One page linking every academic tool at Ajeenkya D Y Patil University.

Live site: <https://adypu.pages.dev/>

#### Compass, desktop, light

![The Compass page on a desktop in light mode](docs/screenshots/compass.png)

## The tools

| Tool | What it is |
| --- | --- |
| Academic Dashboard | Daily attendance and room timetables |
| Chairman Dashboard | The monthly report, school by school |
| Timetable Generator | Clash-free timetables for Engineering |
| Research Publications | Papers, books and patents, with proof |

## What the page does

- A compass in the header whose needle settles when the page loads.
- A hero compass whose needle follows the pointer on a spring, points at the card under it, and reads out the bearing and the tool's name.
- Each card has a small CSS preview of its tool and a one-line proof point with real figures.
- Light and dark themes, remembered between visits.
- Works on a phone; the cards stack in one column.

#### Compass, desktop, dark

![The Compass page on a desktop in dark mode](docs/screenshots/compass-dark.png)

#### Compass, phone

<img src="docs/screenshots/phone.png" alt="The Compass page on a phone" width="260">

## Add a tool

1. Copy one `<a class="card">` block in `index.html`.
2. Change its name, line, tag, preview and link.

## Run it locally

Plain HTML, CSS and a few lines of JS. No build step. Serve the folder with any static server:

```bash
php -S localhost:8100
```

Open <http://localhost:8100/>.

## Link back from another site

Every ADYPU site can load one script to get a "Back to ADYPU Compass" button and the feedback note ("For feedback or changes, contact the Dean Academics Office."):

```html
<script src="https://adypu.pages.dev/embed/compass-link.js" defer></script>
```

- The button sits in the bottom-left corner and shrinks to the compass and one word on a phone.
- Add `data-link="off"` to the tag to leave the button out and keep only the note.
- The script only adds two elements to the page. It reads and sends nothing.
- Change the wording or the link once in `embed/compass-link.js` and every site picks it up.

## Project layout

| Path | What it is |
| --- | --- |
| `index.html` | The page and its cards |
| `css/` | Styles, light and dark |
| `js/compass.js` | The hero compass and its needle |
| `js/theme.js` | The light and dark toggle |
| `embed/compass-link.js` | The script other sites include |
| `img/` | The Compass mark, logo and share image |
| `docs/screenshots/` | Screenshots used above |

## Deploy

Hosted on Cloudflare Pages. Every push to `main` goes live.
