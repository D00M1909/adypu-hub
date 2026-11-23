// How the page moves: the finder chip, the headline and the intro, and the
// red iris that opens when you leave for a tool. The cards are simply there:
// they do not fade in on scroll or follow the pointer.
//
// GSAP (loaded from a CDN in index.html) does the choreography. Everything
// here degrades: with no GSAP the page is simply still, and for people who
// ask for reduced motion nothing below animates at all.
(function () {
  var root = document.documentElement;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var dial = window.ADYPUDial;
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  // ---- The one chip under the headline opens the tool finder. ----
  var chips = document.getElementById('chips');
  if (chips) {
    var find = document.createElement('button');
    find.type = 'button';
    find.className = 'chip chip-find';
    find.setAttribute('data-open-palette', '');
    find.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
      '<span>Find a tool</span><kbd aria-hidden="true">' + (isMac ? '⌘ K' : 'Ctrl K') + '</kbd>';
    chips.appendChild(find);
  }

  // ---- Each card carries the bearing it answers to. ----
  cards.forEach(function (card) {
    if (!dial) return;
    var b = document.createElement('span');
    b.className = 'card-bearing';
    b.setAttribute('aria-hidden', 'true');
    b.textContent = dial.format(parseFloat(card.getAttribute('data-bearing')));
    card.querySelector('.card-art').appendChild(b);
  });

  // ---- Leaving: a red iris opens from the tap, then the tool loads. ----
  function leave(url, x, y) {
    if (still) { location.href = url; return; }
    var el = document.createElement('div');
    el.className = 'iris';
    el.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="34" r="19" fill="none" stroke="currentColor" stroke-width="4"/>' +
      '<path d="M32 6.5 37 13.5H27Z" fill="#FBBF24"/><path d="M32 17 37.5 34h-11Z" fill="currentColor"/>' +
      '<path d="M32 51 26.5 34h11Z" fill="currentColor" fill-opacity=".45"/><circle cx="32" cy="34" r="3" fill="#99151F" stroke="currentColor" stroke-width="2"/></svg>';
    document.body.appendChild(el);
    var at = x + 'px ' + y + 'px';
    el.animate(
      [{ clipPath: 'circle(0px at ' + at + ')' }, { clipPath: 'circle(150vmax at ' + at + ')' }],
      { duration: 560, easing: 'cubic-bezier(0.7, 0, 0.3, 1)', fill: 'forwards' }
    );
    setTimeout(function () { location.href = url; }, 520);
  }
  window.ADYPUHub = { leave: leave };

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.card, a.plaque');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    e.preventDefault();
    var x = e.clientX, y = e.clientY;
    if (!x && !y) {
      var b = a.getBoundingClientRect();
      x = b.left + b.width / 2;
      y = b.top + b.height / 2;
    }
    leave(a.href, x, y);
  });
  // Coming back with the browser's back button can restore the page as it was,
  // iris and all.
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    Array.prototype.forEach.call(document.querySelectorAll('.iris'), function (n) { n.remove(); });
  });

  // ---- The 3D compass. index.html has already decided whether this device
  // gets it and started the download; here it is started, straight away
  // rather than after the intro, so it is ready as the hero appears. If it
  // fails, the flat dial is shown instead. ----
  function noThree() {
    root.classList.remove('three-wait');
    root.classList.add('three-off');
  }
  if (root.classList.contains('three-wait')) {
    if (!dial) noThree();
    else import('../js/hero3d.js').then(function (m) { return m.mount(); }).catch(noThree);
  }

  // ---- Motion proper. ----
  function reveal() { root.classList.remove('motion'); }
  if (still || !window.gsap) { reveal(); return; }
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // The headline, one word per mask, so each can rise out of its own line.
  var h1 = document.querySelector('.hero h1');
  if (h1) {
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 1) { split(n); return; }
        if (n.nodeType !== 3) return;
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'), i = document.createElement('span');
          w.className = 'w'; i.className = 'w-in'; i.textContent = part;
          w.appendChild(i); frag.appendChild(w);
        });
        n.parentNode.replaceChild(frag, n);
      });
    })(h1);
  }

  gsap.set('.hero-text, .hero-visual', { opacity: 1 });
  reveal();

  // The compass itself fades in when it is ready (css/stage.css), so the
  // intro only brings in its readout.
  var intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro
    .from('.dial-readout', { opacity: 0, y: 12, duration: 1, ease: 'expo.out' }, 0.5)
    .from('.w-in', { yPercent: 118, duration: 1.1, stagger: 0.07 }, 0.2)
    .from('.intro', { y: 18, opacity: 0, duration: 0.8 }, 0.75)
    .from('.chip', { y: 20, opacity: 0, duration: 0.7, stagger: 0.07, clearProps: 'transform,opacity' }, 0.9)
    .from('.scroll-cue', { opacity: 0, y: -8, duration: 0.8, clearProps: 'transform,opacity' }, 1.6);

  if (!ScrollTrigger) return;

  // The scroll hint has done its job once you have started scrolling.
  ScrollTrigger.create({ trigger: '#hero', start: 'top+=40 top', toggleClass: { targets: '.scroll-cue', className: 'is-gone' } });
})();
