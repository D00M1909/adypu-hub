// The tool finder: Ctrl+K (or /, or the "Find a tool" chip, or the bearing
// pill) opens a search over every tool on the page. Arrow keys move, Enter
// opens, Escape closes. The compass needle points at whichever row is
// highlighted, so the finder and the page share one idea.
//
// The tools are read from the cards, so there is nothing to keep in step.
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  if (!cards.length || !window.HTMLDialogElement) return;
  var toggle = document.getElementById('theme-toggle');
  var dial = window.ADYPUDial;

  var items = cards.map(function (card) {
    var login = !!card.querySelector('.tag-login');
    return {
      group: 'Tools',
      name: card.querySelector('h2').textContent,
      sub: card.querySelector('.card-blurb').textContent,
      words: (card.getAttribute('data-short') || '') + ' ' + (card.getAttribute('data-tool') || ''),
      icon: card.getAttribute('data-icon'),
      meta: login ? 'Login' : 'Open',
      aim: card.getAttribute('data-bearing'),
      href: card.getAttribute('href')
    };
  });
  items.push({
    group: 'Page', name: 'Switch theme', sub: 'Light or dark', words: 'dark light mode theme night', icon: 'moon', meta: '',
    run: function () { if (toggle) toggle.click(); }
  });
  var source = document.querySelector('.footer-gh');
  if (source) items.push({ group: 'Page', name: 'Source on GitHub', sub: 'How this page is built', words: 'code repo github', icon: 'arrow', meta: '↗', external: source.href });

  var dlg = document.createElement('dialog');
  dlg.className = 'palette';
  dlg.setAttribute('aria-label', 'Find a tool');
  dlg.innerHTML =
    '<div class="pal-box">' +
      '<div class="pal-search">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
        '<input type="text" placeholder="Search tools" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list" aria-label="Search tools">' +
        '<kbd aria-hidden="true">Esc</kbd>' +
      '</div>' +
      '<ul class="pal-list" id="pal-list" role="listbox"></ul>' +
      '<div class="pal-foot" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span></div>' +
    '</div>';
  document.body.appendChild(dlg);
  var input = dlg.querySelector('input');
  var list = dlg.querySelector('.pal-list');
  var shown = [], active = 0;

  // Substring first (earlier is better), then letters in order.
  function score(q, item) {
    if (!q) return 1;
    var t = (item.name + ' ' + item.sub + ' ' + item.words).toLowerCase();
    var i = t.indexOf(q);
    if (i >= 0) return 100 - Math.min(i, 90);
    var qi = 0;
    for (var k = 0; k < t.length && qi < q.length; k++) if (t[k] === q[qi]) qi++;
    return qi === q.length ? 10 : 0;
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    shown = items.map(function (it) { return { it: it, s: score(q, it) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .map(function (x) { return x.it; });
    if (active >= shown.length) active = 0;
    var html = '', last = '';
    shown.forEach(function (it, i) {
      if (it.group !== last && !q) { html += '<li class="pal-group" role="presentation">' + it.group + '</li>'; last = it.group; }
      html += '<li class="pal-item" role="option" id="pal-' + i + '" data-i="' + i + '" aria-selected="' + (i === active) + '">' +
        '<span class="pal-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-' + it.icon + '"/></svg></span>' +
        '<span><span class="pal-name"></span><span class="pal-sub"></span></span>' +
        '<span class="pal-meta"></span></li>';
    });
    list.innerHTML = html || '<li class="pal-empty" role="presentation">Nothing matches that.</li>';
    Array.prototype.forEach.call(list.querySelectorAll('.pal-item'), function (li) {
      var it = shown[+li.getAttribute('data-i')];
      li.querySelector('.pal-name').textContent = it.name;
      li.querySelector('.pal-sub').textContent = it.sub;
      li.querySelector('.pal-meta').textContent = it.meta;
    });
    input.setAttribute('aria-activedescendant', shown.length ? 'pal-' + active : '');
    point();
  }

  function point() {
    var it = shown[active];
    if (!dial) return;
    // Held, so the pointer moving over the page does not pull it away.
    if (it && it.aim) dial.hold(parseFloat(it.aim), it.name);
    else { dial.free(); dial.release(); }
  }

  function move(to) {
    if (!shown.length) return;
    active = (to + shown.length) % shown.length;
    Array.prototype.forEach.call(list.querySelectorAll('.pal-item'), function (li, i) {
      li.setAttribute('aria-selected', String(i === active));
      if (i === active) li.scrollIntoView({ block: 'nearest' });
    });
    input.setAttribute('aria-activedescendant', 'pal-' + active);
    point();
  }

  function choose(it) {
    if (!it) return;
    if (it.href) {
      var b = dlg.querySelector('.pal-item[aria-selected="true"]');
      var r = (b || dlg).getBoundingClientRect();
      dlg.close();
      if (window.ADYPUHub) window.ADYPUHub.leave(it.href, r.left + r.width / 2, r.top + r.height / 2);
      else location.href = it.href;
      return;
    }
    dlg.close();
    if (it.external) window.open(it.external, '_blank', 'noopener');
    else if (it.run) it.run();
  }

  function open() {
    if (dlg.open) return;
    input.value = '';
    active = 0;
    render();
    dlg.showModal();
    input.focus();
  }

  input.addEventListener('input', function () { active = 0; render(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(active - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(shown[active]); }
  });
  list.addEventListener('click', function (e) {
    var li = e.target.closest('.pal-item');
    if (li) { active = +li.getAttribute('data-i'); choose(shown[active]); }
  });
  list.addEventListener('mousemove', function (e) {
    var li = e.target.closest('.pal-item');
    if (li && +li.getAttribute('data-i') !== active) move(+li.getAttribute('data-i'));
  });
  // A click on the dimmed page outside the box closes it.
  dlg.addEventListener('mousedown', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (dial) { dial.free(); dial.release(); } });

  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '')) || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); open(); }
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-open-palette], #hud')) open();
  });
})();
