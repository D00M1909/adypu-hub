// The light/dark toggle. The theme itself is applied by the inline script in
// index.html's <head>, so there is no flash of the wrong one; this only wires
// the button. Where the browser can cross-fade between two states of the page
// (View Transitions), the new theme spreads outwards from the button.
(function () {
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function paint(theme) {
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    paint(theme);
    try { localStorage.setItem('adypu-theme', theme); } catch (e) { /* private mode */ }
  }

  paint(document.documentElement.dataset.theme);
  toggle.addEventListener('click', function () {
    var theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || still) { apply(theme); return; }

    var box = toggle.getBoundingClientRect();
    var x = box.left + box.width / 2, y = box.top + box.height / 2;
    var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    var transition = document.startViewTransition(function () { apply(theme); });
    transition.ready.then(function () {
      document.documentElement.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 650, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    }, function () {});
  });
})();
