// The light/dark toggle. The theme itself is applied by the inline script in
// index.php's <head>, so there is no flash of the wrong one; this only wires
// the button.
(function () {
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function paint(theme) {
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  paint(document.documentElement.dataset.theme);
  toggle.addEventListener('click', function () {
    var theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    paint(theme);
    try { localStorage.setItem('adypu-theme', theme); } catch (e) { /* private mode */ }
  });
})();
