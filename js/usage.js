// The Academic Dashboard card's "attendance updates and page views in 30 days"
// line, kept current. The numbers come from the dashboard's Form-push Apps
// Script (its web app url is the script tag's data-src), which keeps the
// totals each push brings back. The figures typed into the page stay if the
// url is unset or the fetch fails, so the card never shows a blank or an error.
(function () {
  var me = document.currentScript;
  var src = me && me.getAttribute('data-src');
  var updatesEl = document.querySelector('[data-usage="updates"]');
  var viewsEl = document.querySelector('[data-usage="views"]');
  if (!src || !updatesEl || !viewsEl || !window.fetch) return;

  // Rounded down to a 50, with a "+", so the line reads as a boast and not as
  // a counter: 1,851 shows as 1,850+.
  function brag(n) {
    var shown = n >= 100 ? Math.floor(n / 50) * 50 : n;
    return shown.toLocaleString('en-US') + (shown < n ? '+' : '');
  }

  fetch(src)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d.ok || typeof d.updates !== 'number' || typeof d.views !== 'number') return;
      updatesEl.textContent = brag(d.updates);
      viewsEl.textContent = brag(d.views);
    })
    .catch(function () {});
})();
