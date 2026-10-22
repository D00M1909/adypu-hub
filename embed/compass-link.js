// Shared by every ADYPU site: a "Back to ADYPU Compass" button in the
// bottom-left corner, and the feedback note at the foot of the page.
//
// Each site loads it with one line, so the button and the wording change in
// one place for all of them:
//
//   <script src="https://adypu.pages.dev/embed/compass-link.js" defer></script>
//
// data-link="off" on that tag leaves the button out (the Compass page itself
// uses this, since it is where the button goes). Nothing here reads or sends
// anything; it only adds two elements to the page.
(function () {
  if (window.__adypuCompassLink) return;
  window.__adypuCompassLink = true;

  var script = document.currentScript;
  var withLink = !script || script.getAttribute('data-link') !== 'off';
  var HOME = 'https://adypu.pages.dev/';
  var NOTE = 'For feedback or changes, contact the Dean Academics Office.';

  var css = [
    // Own class names and explicit values throughout, so no site's styles
    // leak in and none of these leak out.
    '.adypu-cx-link{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:10px;',
    'padding:7px 16px 7px 8px;border-radius:999px;background:#C21B27;color:#fff;text-decoration:none;',
    'font:500 13px/1.15 "IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;',
    'box-shadow:0 8px 20px -6px rgba(15,23,42,.35),0 2px 6px rgba(15,23,42,.15);transition:transform .2s,box-shadow .2s}',
    '.adypu-cx-link:hover{transform:translateY(-2px);box-shadow:0 12px 24px -8px rgba(15,23,42,.45),0 2px 6px rgba(15,23,42,.18);color:#fff}',
    '.adypu-cx-link:focus-visible{outline:3px solid #FBBF24;outline-offset:3px}',
    '.adypu-cx-link svg{width:30px;height:30px;flex:none;overflow:visible}',
    '.adypu-cx-text{display:flex;flex-direction:column}',
    '.adypu-cx-text small{font-size:11px;font-weight:500;opacity:.85}',
    '.adypu-cx-text strong{font-size:14px;font-weight:700;letter-spacing:.01em}',
    // The needle turns once on hover: the same compass that greets you on
    // the Compass page, pointing you back to it.
    '.adypu-cx-needle{transform-box:view-box;transform-origin:32px 34px;transform:rotate(40deg);transition:transform .9s cubic-bezier(.34,1.56,.64,1)}',
    '.adypu-cx-link:hover .adypu-cx-needle,.adypu-cx-link:focus-visible .adypu-cx-needle{transform:rotate(400deg)}',
    '.adypu-cx-note{margin:0;padding:18px 16px 22px;text-align:center;font-family:inherit;font-size:13px;line-height:1.5;color:inherit;opacity:.72}',
    // With the button on the page, the note leaves room under it, so the two
    // never overlap at the bottom of the page.
    '.adypu-cx-note.adypu-cx-clear{padding-bottom:84px}',
    // On a phone the button shrinks to the compass and one word, so it still
    // says where it goes without covering much of the page.
    '@media (max-width:640px){.adypu-cx-link{padding:6px 14px 6px 6px;gap:8px;left:12px;bottom:12px}',
    '.adypu-cx-text small,.adypu-cx-long{display:none}.adypu-cx-link svg{width:28px;height:28px}}',
    '@media (prefers-reduced-motion:reduce){.adypu-cx-link,.adypu-cx-needle{transition:none}}',
    '@media print{.adypu-cx-link,.adypu-cx-note{display:none}}'
  ].join('');

  function mount() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var note = document.createElement('p');
    note.className = 'adypu-cx-note';
    note.textContent = NOTE;
    if (withLink) note.className += ' adypu-cx-clear';
    document.body.appendChild(note);

    if (!withLink) return;
    var link = document.createElement('a');
    link.className = 'adypu-cx-link';
    link.href = HOME;
    link.title = 'Every ADYPU academic tool, in one place';
    link.setAttribute('aria-label', 'Back to ADYPU Compass, every academic tool in one place');
    link.innerHTML =
      '<svg viewBox="0 0 64 64" aria-hidden="true">' +
        '<circle cx="32" cy="34" r="19" fill="none" stroke="#fff" stroke-width="4"/>' +
        '<path d="M32 6.5 37 13.5H27Z" fill="#FBBF24"/>' +
        '<g class="adypu-cx-needle">' +
          '<path d="M32 17 37.5 34h-11Z" fill="#fff"/>' +
          '<path d="M32 51 26.5 34h11Z" fill="#fff" fill-opacity=".45"/>' +
        '</g>' +
        '<circle cx="32" cy="34" r="3" fill="#C21B27" stroke="#fff" stroke-width="2"/>' +
      '</svg>' +
      '<span class="adypu-cx-text"><small>Back to</small><strong><span class="adypu-cx-long">ADYPU </span>Compass</strong></span>';
    document.body.appendChild(link);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
