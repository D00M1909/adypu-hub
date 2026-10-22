// The hero compass. Its needle is a damped spring: it swings towards a target
// heading, overshoots a little and settles, the way a real needle does.
//
// The target is the card under the pointer or keyboard focus, so the compass
// points you at the tool you are about to open and reads out its bearing;
// otherwise it is the pointer itself, and when the pointer leaves the page the
// needle drifts back to rest at north-east. Nothing moves for people who ask
// for reduced motion, and on touch screens it simply rests.
(function () {
  var dial = document.querySelector('.dial');
  if (!dial) return;
  var needle = dial.querySelector('.dial-needle');
  var bearingEl = dial.querySelector('.dial-bearing');
  var targetEl = dial.querySelector('.dial-target');
  var cards = document.querySelectorAll('.card');

  var REST = 40;
  var IDLE_LABEL = 'Pick a tool';
  var angle = -70;     // starts off true, so the page opens on one settle
  var velocity = 0;
  var target = REST;
  var label = IDLE_LABEL;
  var running = false;

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  function draw() {
    needle.style.transform = 'rotate(' + angle.toFixed(2) + 'deg)';
    var deg = ((Math.round(angle) % 360) + 360) % 360;
    bearingEl.textContent = ('00' + deg).slice(-3) + '° ' + POINTS[Math.round(deg / 45) % 8];
    targetEl.textContent = label;
  }

  // The shortest way round: from 350 to 10 is +20, not -340.
  function delta(from, to) {
    return ((to - from + 540) % 360) - 180;
  }

  function step() {
    velocity += delta(angle, target) * 0.07;
    velocity *= 0.8;
    angle += velocity;
    draw();
    if (Math.abs(velocity) < 0.02 && Math.abs(delta(angle, target)) < 0.05) {
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

  // Compass heading from the dial's centre to a point on screen: 0 is up.
  function headingTo(x, y) {
    var box = dial.querySelector('svg').getBoundingClientRect();
    var dx = x - (box.left + box.width / 2);
    var dy = y - (box.top + box.height / 2);
    return Math.atan2(dx, -dy) * 180 / Math.PI;
  }

  function headingToCard(card) {
    var box = card.getBoundingClientRect();
    return headingTo(box.left + box.width / 2, box.top + box.height / 2);
  }

  var hovered = null;

  Array.prototype.forEach.call(cards, function (card) {
    var name = card.querySelector('h2').textContent;
    function point() { hovered = card; aim(headingToCard(card), name); }
    function release() { if (hovered === card) hovered = null; aim(REST, IDLE_LABEL); }
    card.addEventListener('focus', point);
    card.addEventListener('blur', release);
    if (finePointer) {
      card.addEventListener('mouseenter', point);
      card.addEventListener('mouseleave', release);
    }
  });

  if (finePointer && !still) {
    document.addEventListener('mousemove', function (e) {
      if (!hovered) aim(headingTo(e.clientX, e.clientY), IDLE_LABEL);
    });
    document.documentElement.addEventListener('mouseleave', function () {
      hovered = null;
      aim(REST, IDLE_LABEL);
    });
    // Scrolling moves the cards under a still pointer: re-aim at the one held.
    window.addEventListener('scroll', function () {
      if (hovered) aim(headingToCard(hovered), label);
    }, { passive: true });
  }

  if (still) angle = REST;
  draw();
  if (!still) aim(REST, IDLE_LABEL);
})();
