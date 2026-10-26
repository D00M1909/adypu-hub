// The hero compass. Its needle is a damped spring: it swings towards a target
// heading, overshoots a little and settles, the way a real needle does.
//
// One heading drives every needle on the page: the flat dial in the hero, the
// small one in the bearing pill, and the 3D one (js/hero3d.js, which listens
// through window.ADYPUDial). Where there is a mouse, the target is the card
// under the pointer, or the pointer itself. On a touch screen there is no
// pointer, so the page turns the needle instead: it swings with the scroll
// while the hero is in view, then points at whichever tool is mid-screen.
// Nothing moves for people who ask for reduced motion.
(function () {
  var hero = document.getElementById('hero-compass');
  if (!hero) return;
  var hud = document.getElementById('hud');
  var needles = document.querySelectorAll('[data-needle]');
  var bearingOut = document.querySelectorAll('[data-bearing-out]');
  var targetOut = document.querySelectorAll('[data-target-out]');
  var cards = document.querySelectorAll('.card');

  // Resting, the needle points north and sways a few degrees, like one that is
  // still settling; it only holds still for reduced motion.
  var REST = 0;
  var heroVisible = true;
  var IDLE_LABEL = 'Pick a tool';
  var angle = -70;     // starts off true, so the page opens on one settle
  var velocity = 0;
  var target = REST;
  var label = IDLE_LABEL;
  var running = false;
  var hovered = null;

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  var listeners = [];

  function norm(deg) { return ((Math.round(deg) % 360) + 360) % 360; }
  function format(deg) {
    var d = norm(deg);
    return ('00' + d).slice(-3) + '° ' + POINTS[Math.round(d / 45) % 8];
  }

  function draw() {
    var t = 'rotate(' + angle.toFixed(2) + 'deg)';
    Array.prototype.forEach.call(needles, function (n) { n.style.transform = t; });
    var f = format(angle);
    Array.prototype.forEach.call(bearingOut, function (el) { el.textContent = f; });
    Array.prototype.forEach.call(targetOut, function (el) { el.textContent = label; });
    for (var i = 0; i < listeners.length; i++) listeners[i](angle);
  }

  // The shortest way round: from 350 to 10 is +20, not -340.
  function delta(from, to) {
    return ((to - from + 540) % 360) - 180;
  }

  function step() {
    var goal = target;
    // Only when nothing is chosen: Attendance also sits at 0, and a chosen
    // tool's bearing must hold still.
    var swaying = target === REST && label === IDLE_LABEL && !hovered && !still;
    if (swaying) goal += Math.sin(performance.now() / 1700) * 5;
    velocity += delta(angle, goal) * 0.07;
    velocity *= 0.8;
    angle += velocity;
    draw();
    var settled = Math.abs(velocity) < 0.02 && Math.abs(delta(angle, goal)) < 0.05;
    // The sway keeps going while the hero is in view and stops with it.
    if (settled && !(swaying && heroVisible)) {
      running = false;
      return;
    }
    requestAnimationFrame(step);
  }

  function aim(heading, name) {
    target = heading;
    label = name;
    if (still) {
      angle = heading;
      draw();
      return;
    }
    if (!running) {
      running = true;
      requestAnimationFrame(step);
    }
  }

  // The pointer, -1 to 1 across the window, for the 3D compass to lean towards.
  var pointer = { x: 0, y: 0 };

  // Something that is not an element on the page (a plaque on the 3D
  // compass) can hold the needle, so the pointer moving over it does not pull
  // the needle away, and let go of it again.
  var HELD = {};

  window.ADYPUDial = {
    pointer: pointer,
    format: format,
    aim: aim,
    release: function () { aim(REST, IDLE_LABEL); },
    hold: function (heading, name) { hovered = HELD; aim(heading, name); },
    free: function () {
      if (hovered !== HELD) return;
      hovered = null;
      aim(REST, IDLE_LABEL);
    },
    angle: function () { return angle; },
    // Where the needle is heading, and the name it reads out.
    target: function () { return { heading: target, label: label }; },
    subscribe: function (fn) { listeners.push(fn); fn(angle); }
  };

  // Where headings are measured from: the hero compass while it is on screen,
  // the bearing pill once it has scrolled away.
  function origin() {
    var r = hero.getBoundingClientRect();
    var heroUp = r.bottom > 60 && r.top < window.innerHeight - 60;
    var b = (heroUp || !hud) ? r : hud.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  }

  // Compass heading from the origin to a point on screen: 0 is up.
  function headingTo(x, y) {
    var o = origin();
    return Math.atan2(x - o.x, -(y - o.y)) * 180 / Math.PI;
  }

  // Each tool has a bearing of its own (data-bearing on its card): north,
  // east, south and west, where its plaque sits on the 3D compass, so a phone
  // can point at it without a pointer. North is 0, so test for a number
  // rather than for a true value.
  function bearingOf(el) {
    var b = parseFloat(el.getAttribute('data-bearing') || el.getAttribute('data-aim'));
    return isNaN(b) ? REST : b;
  }
  function nameOf(el) {
    var n = el.getAttribute('data-name');
    if (n) return n;
    var h = el.querySelector && el.querySelector('h2');
    return h ? h.textContent : '';
  }

  function pointAt(el) {
    hovered = el;
    aim(bearingOf(el), nameOf(el));
  }
  function letGo(el) {
    if (hovered === el) hovered = null;
    aim(REST, IDLE_LABEL);
  }

  // Cards, the plaques and the finder's rows all take part through one
  // pair of listeners, so a tool added later needs no wiring.
  ['mouseover', 'focusin'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      var el = e.target.closest && e.target.closest('.card, [data-aim]');
      if (!el || el === hovered) return;
      if (type === 'mouseover' && !finePointer) return;
      pointAt(el);
    });
  });
  ['mouseout', 'focusout'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      var el = e.target.closest && e.target.closest('.card, [data-aim]');
      if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return;
      letGo(el);
    });
  });

  // While the needle is welcoming you back (below), a stray pointer move
  // does not pull it away.
  var welcomeUntil = 0;

  document.addEventListener('pointermove', function (e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    if (finePointer && !still && !hovered && Date.now() > welcomeUntil) aim(headingTo(e.clientX, e.clientY), IDLE_LABEL);
  }, { passive: true });

  if (finePointer && !still) {
    document.documentElement.addEventListener('mouseleave', function () {
      hovered = null;
      aim(REST, IDLE_LABEL);
    });
  }

  // Scrolling moves the cards under a still pointer: re-aim at the one held.
  // On a touch screen, scrolling is what steers the needle.
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (Date.now() < welcomeUntil) return;
      if (finePointer) return;
      if (still) return;
      var vh = window.innerHeight;
      if (hero.getBoundingClientRect().bottom > vh * 0.4) {
        aim(REST + window.scrollY * 0.25, IDLE_LABEL);
        return;
      }
      var best = null, bestGap = Infinity;
      Array.prototype.forEach.call(cards, function (card) {
        var b = card.getBoundingClientRect();
        if (b.bottom < 0 || b.top > vh) return;
        var gap = Math.abs(b.top + b.height / 2 - vh / 2);
        if (gap < bestGap) { bestGap = gap; best = card; }
      });
      if (best) aim(bearingOf(best), nameOf(best));
      else aim(REST, IDLE_LABEL);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // The bearing pill appears when the hero compass has left the screen, and
  // steps aside again at the foot of the page so it never covers the footer.
  var footer = document.querySelector('.site-footer');
  var footerVisible = false;
  function showPill() { if (hud) hud.classList.toggle('is-on', !heroVisible && !footerVisible); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      showPill();
      if (heroVisible) aim(target, label);
    }, { threshold: 0.05 }).observe(hero);
    if (footer) {
      new IntersectionObserver(function (entries) {
        footerVisible = entries[0].isIntersecting;
        showPill();
      }).observe(footer);
    }
  }

  if (still) angle = REST;
  draw();
  if (!still) aim(REST, IDLE_LABEL);

  // Back from a tool: the Compass button on each tool links here with
  // ?from=<tool> (embed/compass-link.js), so the needle swings to that tool's
  // card, reads "Back from" it, and the card lights up for a moment. The
  // query is dropped from the address so a reload or a shared link is clean.
  var match = /[?&]from=([a-z]+)/.exec(location.search);
  if (!match) return;
  if (window.history && history.replaceState) history.replaceState(null, '', location.pathname + location.hash);
  var from = document.querySelector('.card[data-tool="' + match[1] + '"]');
  if (!from) return;

  var badge = document.createElement('span');
  badge.className = 'card-from';
  badge.setAttribute('aria-hidden', 'true');
  badge.textContent = 'Where you were';
  from.querySelector('.card-art').appendChild(badge);
  from.classList.add('is-from');

  // On a phone the card can be below the fold: bring it up first.
  var box = from.getBoundingClientRect();
  var offscreen = box.top > window.innerHeight - 80;
  if (offscreen) from.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' });

  welcomeUntil = Date.now() + 2800;
  setTimeout(function () {
    aim(bearingOf(from), 'Back from ' + from.querySelector('h2').textContent);
  }, offscreen ? 450 : 0);
  setTimeout(function () {
    if (!hovered) aim(REST, IDLE_LABEL);
  }, 2800);
  setTimeout(function () {
    from.classList.remove('is-from');
    badge.addEventListener('transitionend', function () { badge.remove(); });
    badge.classList.add('is-gone');
    if (still) badge.remove();
  }, 4500);
})();
