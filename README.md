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

- A 3D compass in the hero (three.js), and it is also the way in. Each tool has a lacquer and gold plaque on the bezel, at its own bearing: Attendance at north, Report at east, Timetables at south and Research at west. Pointing at a plaque, or tabbing to its name, lifts it and swings the needle to it. Clicking or tapping one opens the tool.
- The needle follows the pointer on a spring, points at the card under it, and reads out the bearing and the tool's name. The case leans a little towards the pointer and tips away as you scroll.
- three.js starts loading as soon as the page does, and the 3D compass fades in where the flat one would be, so only one is ever shown. A flat SVG dial stands in only where WebGL is missing, the device looks slow, or the 3D one fails to load within a few seconds.
- On a phone there is no pointer, so scrolling turns the needle: it swings with the page, then points at whichever tool is mid-screen. A tap on a plaque opens its tool.
- A "Scroll" hint under the hero leads down to the cards, and goes once you start scrolling.
- Once the hero scrolls away, a small bearing pill follows you down the page. Tap it to find a tool.
- `Ctrl K` (or `/`) opens a finder over every tool. The needle points at the highlighted row.
- The headline, the finder button and the cards animate in (GSAP). The drawing on each card builds itself as it comes into view, and a light follows the pointer across a card.
- Choosing a tool opens a red iris from where you tapped. Switching theme spreads the new one out from the toggle.
- Light and dark themes, remembered between visits.
- Nothing moves for people who ask for reduced motion.

#### Compass, desktop, dark

![The Compass page on a desktop in dark mode](docs/screenshots/compass-dark.png)

#### Compass, phone

<img src="docs/screenshots/phone.png" alt="The Compass page on a phone" width="260">

## Add a tool

1. Copy one `<a class="card">` block in `index.html`.
2. Change its name, line, tag, preview and link.
3. Set its `data-bearing` (a heading from 0 to 359 that no other tool uses), `data-short` (the word on its plaque) and `data-icon` (an `icon-` symbol in the page's sprite).

The bearing is where the tool's plaque sits on the 3D compass. North, east, south and west are taken, so a fifth tool goes on a diagonal: 45, 135, 225 or 315.

The plaques, the finder and the card badges are built from the cards, so there is nothing else to change.

## Run it locally

Plain HTML, CSS and JS; three.js and GSAP load from a CDN. No build step. Serve the folder with any static server:

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
- It takes each tool's own look: its colours, corners and type. The look is picked from the site's address, and follows the site's dark mode where it has one.
- The arrow beside it opens a menu of the other tools, so you can go straight from one to another. The menu can also keep the button small, as just the compass.
- Scrolling down folds the label away; scrolling up brings it back. On a phone it steps aside while you type.
- Coming back, Compass points its needle at the tool you came from and marks its card for a moment.
- The script reads and sends nothing. The only thing it keeps is the "keep it small" choice, in your browser.
- Change the wording, the links or a look once in `embed/compass-link.js` and every site picks it up within five minutes.

Options, as attributes on the tag:

| Attribute | What it does |
| --- | --- |
| `data-link="off"` | Leaves the button out and keeps only the note |
| `data-skin="daybook"` | Picks the look by hand: `compass`, `daybook`, `report`, `timetable` or `research` |
| `data-position="right"` | Moves the button to the bottom-right corner |
| `data-guard="forms"` | Asks before leaving when a form on the page has been edited and not submitted |

A site with its own idea of unsaved work can tell the button with `ADYPUCompass.setUnsaved(true)`, and `false` once it is saved. Add `data-cx-ignore` to a form, such as a filter, that should never count.

## Project layout

| Path | What it is |
| --- | --- |
| `index.html` | The page and its cards |
| `css/` | Styles, light and dark |
| `css/stage.css` | The hero, the bearing pill, the finder and the card effects |
| `js/compass.js` | The needle: one heading drives every compass on the page |
| `js/hero3d.js` | The 3D compass and its plaques, loaded at once where WebGL will cope |
| `js/motion.js` | Headline and scroll animation, card effects, the iris |
| `js/palette.js` | The `Ctrl K` finder |
| `js/theme.js` | The light and dark toggle |
| `embed/compass-link.js` | The script other sites include |
| `_headers` | Cache rules Cloudflare Pages applies to that script |
| `img/` | The Compass mark, logo and share image |
| `docs/screenshots/` | Screenshots used above |

## Deploy

Hosted on Cloudflare Pages. Every push to `main` goes live.
