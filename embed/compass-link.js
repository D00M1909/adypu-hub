// Shared by every ADYPU site: a "Back to ADYPU Compass" button in the
// bottom-left corner, and the feedback note at the foot of the page.
//
// Each site loads it with one line, so the button and the wording change in
// one place for all of them:
//
//   <script src="https://adypu.pages.dev/embed/compass-link.js" defer></script>
//
// Options, as attributes on that tag:
//   data-link="off"        leaves the button out (the Compass page itself
//                          uses this, since it is where the button goes)
//   data-skin="daybook"    picks the button's look; by default it is chosen
//                          from the site's address, see TOOLS below
//   data-position="right"  moves it to the bottom-right corner
//   data-guard="forms"     asks before leaving when a form on the page has
//                          been edited and not submitted
//
// A site can also say it has unsaved work itself:
//   window.ADYPUCompass.setUnsaved(true)
//
// Nothing here sends anything anywhere. The one thing it keeps is the
// "Keep this button small" choice, in this browser's localStorage.
(function () {
  if (window.__adypuCompassLink) return;
  window.__adypuCompassLink = true;

  var script = document.currentScript;
  function option(name) { return script ? script.getAttribute('data-' + name) : null; }

  var HOME = 'https://adypu.pages.dev/';
  var NOTE = 'For feedback or changes, contact the Dean Academics Office.';
  var SMALL_KEY = 'adypu-cx-small';

  // The tools Compass links to. The id is also the skin and the ?from= value
  // the Compass page reads to point back at the card you came from, so keep
  // the ids in step with data-tool on the cards in index.html.
  var TOOLS = [
    { id: 'daybook', name: 'Academic Dashboard', blurb: 'Attendance and room timetables',
      url: 'https://adypu-daybook.fast-page.org/', host: 'adypu-daybook.fast-page.org', path: '/',
      icon: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m9 11 3 3L22 4"/>' },
    { id: 'report', name: 'Chairman Dashboard', blurb: 'The monthly report',
      url: 'https://adypuacademic.github.io/adypuacademicreport/', host: 'adypuacademic.github.io', path: '/adypuacademicreport',
      icon: '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/>' },
    { id: 'timetable', name: 'Timetable Generator', blurb: 'Clash-free timetables',
      url: 'https://adypu-timetable.22web.org/index.php', host: 'adypu-timetable.22web.org', path: '/',
      icon: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h2M14 14h2M8 18h2"/>' },
    { id: 'research', name: 'Research Publications', blurb: 'Papers, books and patents',
      url: 'https://adypu-research.fast-page.org/', host: 'adypu-research.fast-page.org', path: '/',
      icon: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>' }
  ];

  var here = null;
  TOOLS.forEach(function (t) {
    if (location.hostname === t.host && location.pathname.indexOf(t.path) === 0) here = t;
  });
  var SKINS = { compass: 1, daybook: 1, report: 1, timetable: 1, research: 1 };
  var skin = option('skin');
  if (!SKINS[skin]) skin = here ? here.id : 'compass';

  var withLink = option('link') !== 'off';
  var onRight = option('position') === 'right';
  var guardForms = option('guard') === 'forms';

  var css = [
    // Own class names and explicit values throughout, so no site's styles
    // leak in and none of these leak out. Every colour, corner and font is a
    // variable, so a skin below only has to name what it changes.
    '.adypu-cx-vars{--cx-bg:#C21B27;--cx-fg:#fff;--cx-sub:rgba(255,255,255,.82);--cx-accent:#FBBF24;--cx-hub:#C21B27;',
    '--cx-wash:rgba(0,0,0,.14);--cx-line:transparent;--cx-divider:rgba(255,255,255,.28);--cx-ring:#FBBF24;',
    '--cx-radius:999px;--cx-font:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;--cx-label-font:inherit;',
    '--cx-shadow:0 8px 20px -6px rgba(15,23,42,.35),0 2px 6px rgba(15,23,42,.15);',
    '--cx-shadow-hover:0 14px 28px -8px rgba(15,23,42,.45),0 3px 8px rgba(15,23,42,.18);',
    '--cx-m-bg:#fff;--cx-m-fg:#0f172a;--cx-m-muted:#64748b;--cx-m-line:#e2e8f0;--cx-m-hover:#f1f5f9;--cx-m-brand:#C21B27;--cx-m-cta:#C21B27;--cx-m-radius:16px}',
    '.adypu-cx{--cx-gap:16px;position:fixed;z-index:2147483000;',
    'left:calc(var(--cx-gap) + env(safe-area-inset-left,0px));bottom:calc(var(--cx-gap) + env(safe-area-inset-bottom,0px));',
    'display:flex;align-items:stretch;font:500 13px/1.15 var(--cx-font);color:var(--cx-fg);',
    'background:var(--cx-bg);border:1px solid var(--cx-line);border-radius:var(--cx-radius);box-shadow:var(--cx-shadow);',
    '-webkit-tap-highlight-color:transparent;transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s,opacity .35s}',
    '.adypu-cx.adypu-cx-right{left:auto;right:calc(var(--cx-gap) + env(safe-area-inset-right,0px))}',
    '.adypu-cx *{box-sizing:border-box}',
    // The press wash sits over the whole button, so it works on a gradient as
    // well as a flat colour.
    '.adypu-cx::after{content:"";position:absolute;inset:0;border-radius:inherit;background:var(--cx-wash);opacity:0;pointer-events:none;transition:opacity .2s}',
    // Hover effects only where there is a real pointer: a phone keeps
    // :hover stuck after a tap, which would leave the button raised.
    '@media (hover:hover){.adypu-cx:hover{transform:translateY(-2px);box-shadow:var(--cx-shadow-hover)}.adypu-cx:hover::after{opacity:.5}}',
    '.adypu-cx:active::after{opacity:1}',
    '.adypu-cx.adypu-cx-arriving{opacity:0;transform:translateY(14px)}',
    '.adypu-cx.adypu-cx-typing{opacity:0;transform:translateY(14px);pointer-events:none}',
    '.adypu-cx-link,.adypu-cx-more{all:unset;position:relative;z-index:1;display:flex;align-items:center;cursor:pointer;color:inherit;border-radius:var(--cx-radius)}',
    '.adypu-cx-link{gap:10px;padding:7px 14px 7px 7px;text-decoration:none;color:var(--cx-fg)}',
    '.adypu-cx-link:hover,.adypu-cx-link:visited{color:var(--cx-fg)}',
    '.adypu-cx-link:focus-visible,.adypu-cx-more:focus-visible{outline:3px solid var(--cx-ring);outline-offset:2px}',
    '.adypu-cx svg.adypu-cx-mark{width:30px;height:30px;flex:none;overflow:visible}',
    // The label folds away (scrolling down, or "Keep this button small") by
    // shrinking to nothing, so the button eases into a round compass.
    '.adypu-cx-text{display:flex;flex-direction:column;white-space:nowrap;overflow:hidden;max-width:170px;transition:max-width .35s cubic-bezier(.2,.8,.2,1),opacity .25s}',
    '.adypu-cx-text small{font-size:11px;font-weight:500;color:var(--cx-sub)}',
    '.adypu-cx-text strong{font-size:14px;font-weight:700;letter-spacing:.01em;font-family:var(--cx-label-font)}',
    '.adypu-cx-more{width:34px;justify-content:center;flex:none;overflow:hidden;transition:width .35s cubic-bezier(.2,.8,.2,1),opacity .25s}',
    '.adypu-cx-more::before{content:"";position:absolute;left:0;top:10px;bottom:10px;width:1px;background:var(--cx-divider)}',
    '.adypu-cx-more svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;transition:transform .25s}',
    '.adypu-cx-open .adypu-cx-more svg{transform:rotate(180deg)}',
    // It opens out again under a mouse (adypu-cx-peek, set from script so a
    // tap never counts), for keyboard focus, and while the menu is open.
    '.adypu-cx-compact:not(.adypu-cx-peek):not(.adypu-cx-open):not(:has(:focus-visible)) .adypu-cx-text{max-width:0;opacity:0}',
    '.adypu-cx-compact:not(.adypu-cx-peek):not(.adypu-cx-open):not(:has(:focus-visible)) .adypu-cx-more{width:0;opacity:0}',
    '.adypu-cx-compact:not(.adypu-cx-peek):not(.adypu-cx-open):not(:has(:focus-visible)) .adypu-cx-link{gap:0;padding-right:7px}',
    // The needle turns once on hover: the same compass that greets you on
    // the Compass page, pointing you back to it.
    '.adypu-cx-needle{transform-box:view-box;transform-origin:32px 34px;transform:rotate(40deg);transition:transform .9s cubic-bezier(.34,1.56,.64,1)}',
    '.adypu-cx-link:focus-visible .adypu-cx-needle{transform:rotate(400deg)}',
    '@media (hover:hover){.adypu-cx-link:hover .adypu-cx-needle{transform:rotate(400deg)}}',

    // The menu: the other tools, one tap away without a stop at Compass.
    '.adypu-cx-menu{position:absolute;left:0;bottom:calc(100% + 10px);width:308px;max-width:calc(100vw - 24px);padding:6px;',
    'background:var(--cx-m-bg);color:var(--cx-m-fg);border:1px solid var(--cx-m-line);border-radius:var(--cx-m-radius);',
    'box-shadow:0 18px 40px -12px rgba(15,23,42,.35),0 4px 12px rgba(15,23,42,.12);',
    'transform-origin:18px 100%;transition:opacity .18s,transform .22s cubic-bezier(.2,.8,.2,1),visibility 0s .22s;',
    'opacity:0;transform:translateY(6px) scale(.96);visibility:hidden}',
    '.adypu-cx-right .adypu-cx-menu{left:auto;right:0;transform-origin:calc(100% - 18px) 100%}',
    '.adypu-cx-open .adypu-cx-menu{opacity:1;transform:none;visibility:visible;transition:opacity .18s,transform .22s cubic-bezier(.2,.8,.2,1)}',
    '.adypu-cx-head{padding:8px 10px 6px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--cx-m-muted)}',
    '.adypu-cx-item{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:12px;width:100%;padding:9px 10px;border-radius:calc(var(--cx-m-radius) - 6px);',
    'cursor:pointer;color:var(--cx-m-fg);text-decoration:none;font:500 14px/1.2 var(--cx-font)}',
    '.adypu-cx-item:hover,.adypu-cx-item:focus-visible{background:var(--cx-m-hover);color:var(--cx-m-fg)}',
    '.adypu-cx-item:focus-visible{outline:2px solid var(--cx-m-brand);outline-offset:-2px}',
    '.adypu-cx-ico{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:calc(var(--cx-m-radius) - 7px);',
    'background:color-mix(in srgb,var(--cx-m-brand) 12%,transparent);color:var(--cx-m-brand)}',
    '.adypu-cx-ico svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.adypu-cx-item span span{display:block;font-size:12px;font-weight:400;color:var(--cx-m-muted);margin-top:2px}',
    '.adypu-cx-item[aria-current]{cursor:default;background:none}',
    '.adypu-cx-here{margin-left:auto;flex:none;white-space:nowrap;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:600;',
    'background:color-mix(in srgb,var(--cx-m-brand) 14%,transparent);color:var(--cx-m-brand)}',
    '.adypu-cx-sep{height:1px;margin:6px 4px;background:var(--cx-m-line)}',
    '.adypu-cx-switch{margin-left:auto;width:34px;height:20px;flex:none;border-radius:999px;background:var(--cx-m-line);position:relative;transition:background .2s}',
    '.adypu-cx-switch::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.3);transition:transform .2s}',
    '.adypu-cx-item[aria-checked="true"] .adypu-cx-switch{background:var(--cx-m-brand)}',
    '.adypu-cx-item[aria-checked="true"] .adypu-cx-switch::after{transform:translateX(14px)}',

    // Asked before leaving unsaved work.
    // Placed by hand: some sites reset every margin, which would pin a dialog
    // to the top-left corner.
    '.adypu-cx-dialog{position:fixed;inset:0;margin:auto;height:fit-content;max-height:calc(100vh - 32px);z-index:2147483001;',
    'width:min(400px,calc(100vw - 32px));padding:22px 22px 18px;border:1px solid var(--cx-m-line);border-radius:var(--cx-m-radius);',
    'background:var(--cx-m-bg);color:var(--cx-m-fg);font:400 14px/1.5 var(--cx-font);box-shadow:0 24px 60px -16px rgba(15,23,42,.5)}',
    '.adypu-cx-dialog::backdrop{background:rgba(15,23,42,.45)}',
    '.adypu-cx-dialog h2{margin:0 0 6px;font:700 17px/1.3 var(--cx-font);color:var(--cx-m-fg)}',
    '.adypu-cx-dialog p{margin:0 0 18px;color:var(--cx-m-muted)}',
    '.adypu-cx-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}',
    '.adypu-cx-actions button{all:unset;padding:9px 16px;border-radius:10px;font:600 14px/1.2 var(--cx-font);cursor:pointer;text-align:center}',
    '.adypu-cx-actions button:focus-visible{outline:3px solid var(--cx-m-brand);outline-offset:2px}',
    '.adypu-cx-actions .adypu-cx-stay{background:var(--cx-m-cta);color:#fff}',
    '.adypu-cx-actions .adypu-cx-leave{color:var(--cx-m-fg);box-shadow:inset 0 0 0 1px var(--cx-m-line)}',
    '.adypu-cx-actions .adypu-cx-leave:hover{background:var(--cx-m-hover)}',

    // One look per site, taken from that site's own header, buttons and type.
    // Attendance: its header's red gradient and 12px controls; in its dark
    // mode the deeper maroon of the dark header, with a hairline edge so the
    // button keeps its shape on the near-black page.
    '.adypu-cx-vars[data-skin="daybook"]{--cx-bg:linear-gradient(135deg,#C21B27,#99151F);--cx-hub:#AE1823;--cx-radius:12px;--cx-m-radius:14px}',
    ':root[data-theme="dark"] .adypu-cx-vars[data-skin="daybook"]{--cx-bg:linear-gradient(135deg,#7E1620,#4C0D14);--cx-hub:#65111A;',
    '--cx-line:rgba(255,255,255,.14);--cx-wash:rgba(255,255,255,.08);--cx-shadow:0 10px 24px -8px rgba(0,0,0,.7),0 2px 6px rgba(0,0,0,.4);',
    '--cx-shadow-hover:0 16px 30px -8px rgba(0,0,0,.8),0 3px 8px rgba(0,0,0,.45);',
    '--cx-m-bg:#151c25;--cx-m-fg:#e7edf4;--cx-m-muted:#9fb0c2;--cx-m-line:#243041;--cx-m-hover:#1d2733;--cx-m-brand:#f87171}',
    // Monthly report: Segoe UI, 8px corners, and the amber of its Compare
    // button on the compass tip and the focus ring.
    '.adypu-cx-vars[data-skin="report"]{--cx-radius:8px;--cx-m-radius:12px;--cx-font:"Segoe UI",Arial,sans-serif;',
    '--cx-accent:#f59e0b;--cx-ring:#f59e0b}',
    // Timetable: a white button that stands out on the plum sidebar, in the
    // sidebar's plum, the orange of the top bar, and Source Sans 3.
    '.adypu-cx-vars[data-skin="timetable"]{--cx-bg:#fff;--cx-fg:#7B1E5A;--cx-sub:#7b8190;--cx-hub:#fff;--cx-accent:#F7941D;',
    '--cx-wash:rgba(123,30,90,.1);--cx-line:#e3e5ea;--cx-divider:#e3e5ea;--cx-ring:#0A7CFF;--cx-radius:6px;--cx-m-radius:10px;',
    '--cx-font:"Source Sans 3","Source Sans Pro","Segoe UI",Tahoma,sans-serif;--cx-m-brand:#7B1E5A;--cx-m-cta:#7B1E5A;--cx-m-line:#e3e5ea;',
    '--cx-shadow:0 6px 18px -6px rgba(20,24,40,.35),0 1px 4px rgba(20,24,40,.12);--cx-shadow-hover:0 12px 26px -8px rgba(20,24,40,.4),0 2px 6px rgba(20,24,40,.14)}',
    '.adypu-cx-vars[data-skin="timetable"] .adypu-cx-text strong{font-weight:700;letter-spacing:0}',
    // Research: the pill of its Sign in button and "Compass" in the Playfair
    // of its headings; in its dark mode, its deeper red, since white on its
    // bright dark-mode red falls short of AA.
    '.adypu-cx-vars[data-skin="research"]{--cx-label-font:"Playfair Display",Georgia,serif;--cx-m-radius:18px}',
    '.adypu-cx-vars[data-skin="research"] .adypu-cx-text strong{font-size:15px;letter-spacing:0}',
    ':root[data-theme="dark"] .adypu-cx-vars[data-skin="research"]{--cx-bg:#c22536;--cx-hub:#c22536;--cx-line:rgba(255,255,255,.12);',
    '--cx-m-bg:#131821;--cx-m-fg:#e8edf4;--cx-m-muted:#95a1b4;--cx-m-line:#242c39;--cx-m-hover:#181e28;--cx-m-brand:#e8404f;--cx-m-cta:#c22536}',
    // Compass's own red, for any site without a skin of its own.
    ':root[data-theme="dark"] .adypu-cx-vars[data-skin="compass"]{--cx-line:rgba(255,255,255,.12);',
    '--cx-m-bg:#151c25;--cx-m-fg:#e7edf4;--cx-m-muted:#9fb0c2;--cx-m-line:#243041;--cx-m-hover:#1d2733;--cx-m-brand:#f87171}',

    '.adypu-cx-note{margin:0;padding:18px 16px 22px;text-align:center;font-family:inherit;font-size:13px;line-height:1.5;color:inherit;opacity:.72}',
    // With the button on the page, the note leaves room under it, so the two
    // never overlap at the bottom of the page.
    '.adypu-cx-note.adypu-cx-clear{padding-bottom:calc(84px + env(safe-area-inset-bottom,0px))}',
    // On a phone the button shrinks to the compass and one word, so it still
    // says where it goes without covering much of the page; it stays 44px
    // tall, a comfortable tap.
    '@media (max-width:640px){.adypu-cx{--cx-gap:12px}.adypu-cx-link{gap:8px;padding-right:12px}',
    '.adypu-cx-text small,.adypu-cx-long{display:none}.adypu-cx-more{width:32px}}',
    '@media (prefers-reduced-motion:reduce){.adypu-cx,.adypu-cx *,.adypu-cx::after{transition:none!important}',
    '.adypu-cx:hover{transform:none}.adypu-cx-link:hover .adypu-cx-needle,.adypu-cx-link:focus-visible .adypu-cx-needle{transform:rotate(40deg)}}',
    '@media print{.adypu-cx,.adypu-cx-note{display:none}}'
  ].join('');

  // ---- Unsaved work -------------------------------------------------------
  // Tools open in the same tab, so leaving through the button would drop a
  // half-filled form. A site opts in with data-guard="forms", or says so
  // itself with ADYPUCompass.setUnsaved().
  var unsaved = false;
  window.ADYPUCompass = {
    setUnsaved: function (on) { unsaved = !!on; },
    hasUnsaved: function () { return unsaved; }
  };
  if (guardForms) {
    var mark = function (e) {
      var el = e.target;
      if (!el || !el.form || el.form.hasAttribute('data-cx-ignore')) return;
      if (/^(search|hidden|submit|button|reset)$/.test(el.type)) return;
      unsaved = true;
    };
    document.addEventListener('input', mark, true);
    document.addEventListener('change', mark, true);
    document.addEventListener('submit', function () { unsaved = false; }, true);
  }

  var dialog = null;
  function askToLeave(go) {
    if (!unsaved) return go();
    if (!dialog || typeof dialog.showModal !== 'function') {
      if (window.confirm('Leave without saving? Changes you have not saved on this page will be lost.')) go();
      return;
    }
    dialog.onclose = function () { if (dialog.returnValue === 'leave') go(); };
    dialog.returnValue = '';
    dialog.showModal();
  }

  function guarded(a) {
    a.addEventListener('click', function (e) {
      if (!unsaved || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      askToLeave(function () { unsaved = false; location.href = a.href; });
    });
  }

  // ---- Building it --------------------------------------------------------
  var MARK =
    '<svg class="adypu-cx-mark" viewBox="0 0 64 64" aria-hidden="true">' +
      '<circle cx="32" cy="34" r="19" fill="none" stroke="currentColor" stroke-width="4"/>' +
      '<path d="M32 6.5 37 13.5H27Z" fill="var(--cx-accent)"/>' +
      '<g class="adypu-cx-needle">' +
        '<path d="M32 17 37.5 34h-11Z" fill="currentColor"/>' +
        '<path d="M32 51 26.5 34h11Z" fill="currentColor" fill-opacity=".45"/>' +
      '</g>' +
      '<circle cx="32" cy="34" r="3" fill="var(--cx-hub)" stroke="currentColor" stroke-width="2"/>' +
    '</svg>';

  function icon(paths) { return '<span class="adypu-cx-ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + paths + '</svg></span>'; }

  function readSmall() { try { return localStorage.getItem(SMALL_KEY) === '1'; } catch (e) { return false; } }
  function saveSmall(on) { try { localStorage.setItem(SMALL_KEY, on ? '1' : '0'); } catch (e) { /* private mode */ } }

  function buildMenu(box, more) {
    var menu = document.createElement('div');
    menu.className = 'adypu-cx-menu';
    menu.id = 'adypu-cx-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'ADYPU tools');

    var html = '<div class="adypu-cx-head" aria-hidden="true">ADYPU tools</div>' +
      '<a class="adypu-cx-item" role="menuitem" href="' + homeHref + '">' +
        icon('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z"/>') +
        '<span>ADYPU Compass<span>Every tool, one page</span></span></a>' +
      '<div class="adypu-cx-sep" role="separator"></div>';
    TOOLS.forEach(function (t) {
      if (t === here) {
        html += '<div class="adypu-cx-item" role="menuitem" aria-current="page" aria-disabled="true">' + icon(t.icon) +
          '<span>' + t.name + '<span>' + t.blurb + '</span></span><span class="adypu-cx-here">You’re here</span></div>';
      } else {
        html += '<a class="adypu-cx-item" role="menuitem" href="' + t.url + '">' + icon(t.icon) +
          '<span>' + t.name + '<span>' + t.blurb + '</span></span></a>';
      }
    });
    html += '<div class="adypu-cx-sep" role="separator"></div>' +
      '<button type="button" class="adypu-cx-item adypu-cx-small" role="menuitemcheckbox" aria-checked="false">' +
        icon('<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>') +
        '<span>Keep this button small<span>Show just the compass</span></span><span class="adypu-cx-switch" aria-hidden="true"></span></button>';
    menu.innerHTML = html;

    Array.prototype.forEach.call(menu.querySelectorAll('a.adypu-cx-item'), guarded);

    var smallItem = menu.querySelector('.adypu-cx-small');
    smallItem.setAttribute('aria-checked', String(small));
    smallItem.addEventListener('click', function () {
      small = !small;
      saveSmall(small);
      smallItem.setAttribute('aria-checked', String(small));
      refreshCompact();
    });

    function items() {
      return Array.prototype.filter.call(menu.querySelectorAll('.adypu-cx-item'), function (el) {
        return !el.hasAttribute('aria-disabled');
      });
    }
    function setOpen(open, focusFirst) {
      box.classList.toggle('adypu-cx-open', open);
      more.setAttribute('aria-expanded', String(open));
      if (open && focusFirst) items()[0].focus();
    }
    function close(returnFocus) {
      if (!box.classList.contains('adypu-cx-open')) return;
      setOpen(false);
      if (returnFocus) more.focus();
    }

    more.addEventListener('click', function () {
      // A pointer click opens without moving focus; a key press moves it in.
      setOpen(!box.classList.contains('adypu-cx-open'), more.__cxKey);
      more.__cxKey = false;
    });
    more.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') more.__cxKey = true;
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); setOpen(true, true); }
    });
    menu.addEventListener('keydown', function (e) {
      var list = items();
      var i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); list[list.length - 1].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') close(false);
    });
    document.addEventListener('pointerdown', function (e) { if (!box.contains(e.target)) close(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(box.contains(document.activeElement)); });
    return menu;
  }

  function buildDialog() {
    var d = document.createElement('dialog');
    d.className = 'adypu-cx-vars adypu-cx-dialog';
    d.setAttribute('data-skin', skin);
    d.setAttribute('aria-labelledby', 'adypu-cx-dialog-title');
    d.innerHTML =
      '<form method="dialog">' +
        '<h2 id="adypu-cx-dialog-title">Leave without saving?</h2>' +
        '<p>You have changes on this page that haven’t been saved. If you leave now, they’ll be lost.</p>' +
        '<div class="adypu-cx-actions">' +
          '<button class="adypu-cx-leave" value="leave">Leave</button>' +
          '<button class="adypu-cx-stay" value="stay" autofocus>Stay on this page</button>' +
        '</div>' +
      '</form>';
    return d;
  }

  var box, small = readSmall(), scrolledAway = false;
  var homeHref = HOME + (here ? '?from=' + here.id : '');

  function refreshCompact() {
    if (box) box.classList.toggle('adypu-cx-compact', small || scrolledAway);
  }

  // Scrolling down folds the label away so it covers less of the page;
  // scrolling up, or reaching the end of the page, brings it back. Some of
  // these sites scroll a panel rather than the window, so this listens to
  // every scroll and only counts the big ones.
  function watchScroll() {
    var last = new WeakMap();
    var pending = false, lastEvent = null;
    function onScroll(e) {
      lastEvent = e;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        var el = lastEvent.target === document ? document.scrollingElement || document.documentElement : lastEvent.target;
        if (!el || !el.clientHeight || el.clientHeight < window.innerHeight * 0.5) return;
        var y = el.scrollTop;
        var prev = last.get(el) || 0;
        last.set(el, y);
        var atEnd = y + el.clientHeight >= el.scrollHeight - 80;
        if (y < 120 || atEnd) scrolledAway = false;
        else if (y - prev > 6) scrolledAway = true;
        else if (prev - y > 6) scrolledAway = false;
        refreshCompact();
      });
    }
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
  }

  // On a phone, an on-screen keyboard pushes the bottom of the screen up, and
  // the button with it, right over the field being typed in: it steps aside
  // while a text field has focus.
  function watchTyping() {
    if (!window.matchMedia || !window.matchMedia('(pointer: coarse)').matches) return;
    function typing(el) {
      return el && (el.tagName === 'TEXTAREA' || el.isContentEditable ||
        (el.tagName === 'INPUT' && !/^(checkbox|radio|button|submit|reset|range|color|file|image)$/.test(el.type)));
    }
    document.addEventListener('focusin', function (e) { if (typing(e.target)) box.classList.add('adypu-cx-typing'); });
    document.addEventListener('focusout', function () { box.classList.remove('adypu-cx-typing'); });
  }

  function mount() {
    var style = document.createElement('style');
    style.id = 'adypu-cx-style';
    style.textContent = css;
    document.head.appendChild(style);

    var note = document.createElement('p');
    note.className = 'adypu-cx-note';
    note.textContent = NOTE;

    // Inside a frame the page around it has its own way home, so the button
    // would only be in the way.
    var framed = false;
    try { framed = window.self !== window.top; } catch (e) { framed = true; }
    var showLink = withLink && !framed;
    if (showLink) note.className += ' adypu-cx-clear';
    document.body.appendChild(note);
    if (!showLink) return;

    box = document.createElement('div');
    box.className = 'adypu-cx-vars adypu-cx adypu-cx-arriving' + (onRight ? ' adypu-cx-right' : '');
    box.setAttribute('data-skin', skin);

    var link = document.createElement('a');
    link.className = 'adypu-cx-link';
    link.href = homeHref;
    link.title = 'Every ADYPU academic tool, in one place';
    link.setAttribute('aria-label', 'Back to ADYPU Compass, every academic tool in one place');
    link.innerHTML = MARK +
      '<span class="adypu-cx-text"><small>Back to</small><strong><span class="adypu-cx-long">ADYPU </span>Compass</strong></span>';
    guarded(link);

    var more = document.createElement('button');
    more.type = 'button';
    more.className = 'adypu-cx-more';
    more.setAttribute('aria-label', 'More ADYPU tools');
    more.setAttribute('aria-haspopup', 'menu');
    more.setAttribute('aria-expanded', 'false');
    more.setAttribute('aria-controls', 'adypu-cx-menu');
    more.title = 'More ADYPU tools';
    more.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>';

    box.appendChild(link);
    box.appendChild(more);
    box.appendChild(buildMenu(box, more));
    document.body.appendChild(box);

    if (window.HTMLDialogElement) {
      dialog = buildDialog();
      document.body.appendChild(dialog);
    }

    box.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') box.classList.add('adypu-cx-peek'); });
    box.addEventListener('pointerleave', function () { box.classList.remove('adypu-cx-peek'); });

    refreshCompact();
    watchScroll();
    watchTyping();
    // Rises into place once the page has drawn, rather than popping in.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { box.classList.remove('adypu-cx-arriving'); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
