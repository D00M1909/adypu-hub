// The 3D compass in the hero, drawn with three.js, and a way to the tools:
// each tool has a raised plaque on the bezel at its own bearing (north, east,
// south, west, read from the cards). Point at a plaque, or tab to its name,
// and the needle swings to it and the plaque lifts; click or tap it and the
// tool opens behind the red iris.
//
// It is an upgrade, not a requirement. index.html decides early whether the
// device will cope and starts the download; js/motion.js imports this module
// and calls mount(). Nothing shows in the compass's place until the first
// frame is ready, then the canvas fades in where it stands. If this fails, or
// is ready only after the deadline index.html set, the flat SVG dial is shown
// instead and nothing here runs.
//
// The needle takes its heading from window.ADYPUDial (js/compass.js), so it
// swings to a card or a chip just like the flat one. The cards, chips and
// finder stay the real links: the plaques only add to them, and the names
// under the plaques are links too, so the keyboard can reach them.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

var root = document.documentElement;
var DEG = Math.PI / 180;

// Where the plaques sit: on the bezel, which is a ring of this radius.
var BEZEL_R = 2.1;
var PLAQUE_R = 0.3;

export function mount() {
  if (root.classList.contains('three-off')) return Promise.resolve(false);

  var host = document.getElementById('hero-compass');
  var canvas = host.querySelector('.hero-canvas');
  var dial = window.ADYPUDial;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  var scene = new THREE.Scene();
  var pmrem = new THREE.PMREMGenerator(renderer);
  var room = new RoomEnvironment(renderer);
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  if (room.dispose) room.dispose();
  pmrem.dispose();

  // Set back a little further than the compass needs, so the plaques at east
  // and west stay inside the canvas, which is a little larger than the box.
  // About 40 degrees above the dial: high enough that the south plaque, at
  // the front, stands clear of the bezel, low enough to keep the depth.
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 6.3, 7.52);
  camera.lookAt(0, -0.1, 0);

  var rig = new THREE.Group();
  scene.add(rig);

  // Materials: red lacquer to match the university, gold for the small parts.
  var lacquer = new THREE.MeshPhysicalMaterial({ color: 0xb3151f, metalness: 0.35, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 });
  var gold = new THREE.MeshStandardMaterial({ color: 0xe9b949, metalness: 1, roughness: 0.28 });

  // The case: a lacquered wall closed underneath, a gold foot, the bezel on
  // top and a gold ring inside it. No shadow and no dark base: it floats over
  // the page in either theme.
  var wall = new THREE.Mesh(new THREE.CylinderGeometry(2.26, 2.16, 0.36, 128, 1, true), lacquer);
  wall.position.y = -0.12;
  rig.add(wall);
  var floor = new THREE.Mesh(new THREE.CircleGeometry(2.16, 96), lacquer);
  floor.rotation.x = Math.PI / 2;
  floor.position.y = -0.3;
  rig.add(floor);
  var foot = new THREE.Mesh(new THREE.TorusGeometry(2.17, 0.035, 16, 160), gold);
  foot.rotation.x = Math.PI / 2;
  foot.position.y = -0.3;
  rig.add(foot);

  var bezel = new THREE.Mesh(new THREE.TorusGeometry(BEZEL_R, 0.2, 48, 160), lacquer);
  bezel.rotation.x = Math.PI / 2;
  bezel.position.y = 0.06;
  rig.add(bezel);

  var inner = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.035, 24, 160), gold);
  inner.rotation.x = Math.PI / 2;
  inner.position.y = 0.04;
  rig.add(inner);

  // The face is drawn on a canvas, so the ticks and letters stay crisp and can
  // be redrawn when the theme changes.
  var faceCanvas = document.createElement('canvas');
  faceCanvas.width = faceCanvas.height = 1024;
  var faceTexture = new THREE.CanvasTexture(faceCanvas);
  faceTexture.colorSpace = THREE.SRGBColorSpace;
  faceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  function drawFace() {
    var dark = root.dataset.theme === 'dark';
    var S = 1024, c = S / 2, R = S / 2;
    var g = faceCanvas.getContext('2d');
    g.clearRect(0, 0, S, S);

    var bg = g.createRadialGradient(c, c, R * 0.1, c, c, R);
    bg.addColorStop(0, dark ? '#1c2533' : '#ffffff');
    bg.addColorStop(1, dark ? '#0e141c' : '#e6ebf2');
    g.fillStyle = bg;
    g.fillRect(0, 0, S, S);

    // The lights lift dark lines on a pale face, so the light theme's ink is
    // set darker than the page's to read the same.
    var ink = dark ? '#c3cfdc' : '#111a2b';
    var faint = dark ? '#5b6879' : '#56657a';
    var red = dark ? '#f87171' : '#C21B27';

    function at(deg, r) {
      var a = deg * DEG;
      return [c + Math.sin(a) * r, c - Math.cos(a) * r];
    }
    function ring(r, w, col) {
      g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.lineWidth = w; g.strokeStyle = col; g.stroke();
    }
    ring(R * 0.97, 3, faint);
    ring(R * 0.62, 1.5, faint);
    ring(R * 0.3, 1.5, faint);

    // A tick for every degree: long at 30, medium at 10, short at 5.
    g.lineCap = 'round';
    for (var i = 0; i < 360; i++) {
      var len = i % 30 === 0 ? 0.1 : i % 10 === 0 ? 0.07 : i % 5 === 0 ? 0.05 : 0.028;
      var w = i % 30 === 0 ? 5 : i % 10 === 0 ? 3 : i % 5 === 0 ? 2.2 : 1.2;
      var p1 = at(i, R * 0.94), p2 = at(i, R * (0.94 - len));
      g.beginPath(); g.moveTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]);
      g.lineWidth = w; g.strokeStyle = i % 30 === 0 ? ink : faint; g.stroke();
    }

    // Degrees every 30, set like an instrument's.
    g.font = '600 38px "IBM Plex Mono", monospace';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = faint;
    for (var d = 30; d < 360; d += 30) {
      if (d % 90 === 0) continue;
      var p = at(d, R * 0.76);
      g.fillText(String(d), p[0], p[1]);
    }

    // The eight-point star between the letters.
    g.strokeStyle = faint; g.lineWidth = 2;
    for (var s = 45; s < 360; s += 90) {
      var a = at(s, R * 0.56);
      g.beginPath(); g.moveTo(c, c); g.lineTo(a[0], a[1]); g.stroke();
    }

    // North, east, south, west.
    g.font = '700 118px "Playfair Display", Georgia, serif';
    [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(function (l) {
      var q = at(l[1], R * 0.64);
      g.fillStyle = l[0] === 'N' ? red : ink;
      g.fillText(l[0], q[0], q[1] + 6);
      // A thin stroke over the fill, so the letters keep their weight when the
      // lights wash a pale face.
      g.strokeStyle = g.fillStyle; g.lineWidth = 3; g.lineJoin = 'round';
      g.strokeText(l[0], q[0], q[1] + 6);
    });

    // The amber marker at north.
    var m = at(0, R * 0.985);
    g.fillStyle = '#FBBF24';
    g.beginPath(); g.moveTo(m[0], m[1] + 8); g.lineTo(m[0] - 26, m[1] + 52); g.lineTo(m[0] + 26, m[1] + 52); g.closePath(); g.fill();

    faceTexture.needsUpdate = true;
  }

  var faceMat = new THREE.MeshStandardMaterial({ map: faceTexture, roughness: 0.9, metalness: 0, envMapIntensity: 0.2 });
  faceMat.color.setScalar(0.95);
  var face = new THREE.Mesh(new THREE.CircleGeometry(1.9, 128), faceMat);
  face.rotation.x = -Math.PI / 2;
  face.position.y = 0.02;
  rig.add(face);

  // The needle. Both halves are flat kites; the red one points north (-Z).
  function half(len, mat) {
    var shape = new THREE.Shape();
    shape.moveTo(0, len);
    shape.lineTo(0.2, 0);
    shape.lineTo(-0.2, 0);
    shape.closePath();
    var geo = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3 });
    geo.rotateX(-Math.PI / 2);
    return new THREE.Mesh(geo, mat);
  }
  var needle = new THREE.Group();
  needle.add(half(1.5, new THREE.MeshPhysicalMaterial({ color: 0xd91e2b, metalness: 0.3, roughness: 0.25, clearcoat: 1 })));
  needle.add(half(-1.5, new THREE.MeshStandardMaterial({ color: 0xd4dae3, metalness: 0.6, roughness: 0.3 })));
  var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.16, 48), gold);
  cap.position.y = 0.06;
  needle.add(cap);
  needle.position.y = 0.1;
  rig.add(needle);

  // A glass dome over the face: it only has to catch the light.
  var dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.9, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.13, roughness: 0, metalness: 0, clearcoat: 1, envMapIntensity: 1.2, side: THREE.DoubleSide, depthWrite: false })
  );
  dome.scale.y = 0.2;
  dome.position.y = 0.04;
  dome.renderOrder = 2;
  rig.add(dome);

  // A few soft specks of amber drifting round it. Round, not the square
  // points WebGL draws by default.
  var speckCanvas = document.createElement('canvas');
  speckCanvas.width = speckCanvas.height = 64;
  var sg = speckCanvas.getContext('2d');
  var sgr = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
  sgr.addColorStop(0, 'rgba(255,255,255,1)');
  sgr.addColorStop(0.35, 'rgba(255,255,255,0.65)');
  sgr.addColorStop(1, 'rgba(255,255,255,0)');
  sg.fillStyle = sgr;
  sg.fillRect(0, 0, 64, 64);
  var speckTexture = new THREE.CanvasTexture(speckCanvas);
  speckTexture.colorSpace = THREE.SRGBColorSpace;
  var dustGeo = new THREE.BufferGeometry();
  var dustPos = new Float32Array(70 * 3);
  for (var k = 0; k < 70; k++) {
    var ang = Math.random() * Math.PI * 2, rad = 3.1 + Math.random() * 1.7;
    dustPos[k * 3] = Math.cos(ang) * rad;
    dustPos[k * 3 + 1] = -0.4 + Math.random() * 3;
    dustPos[k * 3 + 2] = Math.sin(ang) * rad;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xfbbf24, map: speckTexture, size: 0.09, transparent: true, opacity: 0.85, depthWrite: false }));
  if (!still) scene.add(dust);

  // Lights: a warm key, and a red rim from behind.
  var key = new THREE.DirectionalLight(0xfff1dd, 2.4);
  key.position.set(-4, 7, 5);
  scene.add(key);
  var rim = new THREE.PointLight(0xff4455, 40, 22);
  rim.position.set(4, 2.5, -5);
  scene.add(rim);

  // ---- The plaques -----------------------------------------------------------
  // One per card, at the card's bearing, so a fifth tool at 45 would take the
  // north-east slot with nothing else to change. Each is a lacquered disc with
  // the tool's icon inlaid in gold, a gold rim and a stem into the bezel, and
  // leans towards the viewer so the icon reads.
  var tools = Array.prototype.slice.call(document.querySelectorAll('.card')).map(function (card) {
    return {
      href: card.getAttribute('href'),
      tool: card.getAttribute('data-tool'),
      bearing: parseFloat(card.getAttribute('data-bearing')),
      name: card.querySelector('h2').textContent,
      short: card.getAttribute('data-short') || card.querySelector('h2').textContent,
      icon: card.getAttribute('data-icon')
    };
  }).filter(function (t) { return !isNaN(t.bearing); })
    .sort(function (a, b) { return a.bearing - b.bearing; });

  // The icon's shapes, read from the page's sprite and drawn with Path2D, so
  // the canvas stays clean for WebGL and the lines stay sharp.
  function iconPaths(id) {
    var sym = document.getElementById('icon-' + id);
    if (!sym) return [];
    var out = [];
    Array.prototype.forEach.call(sym.children, function (n) {
      var p = new Path2D(), get = function (a) { return parseFloat(n.getAttribute(a)) || 0; };
      if (n.tagName === 'path') p.addPath(new Path2D(n.getAttribute('d')));
      else if (n.tagName === 'rect') {
        var x = get('x'), y = get('y'), w = get('width'), h = get('height'), r = Math.min(get('rx'), w / 2, h / 2);
        if (r && p.roundRect) p.roundRect(x, y, w, h, r); else p.rect(x, y, w, h);
      } else if (n.tagName === 'circle') p.arc(get('cx'), get('cy'), get('r'), 0, Math.PI * 2);
      else return;
      out.push({ path: p, fill: n.getAttribute('fill') === 'currentColor' });
    });
    return out;
  }

  // Two textures per icon: the colour (red lacquer, gold lines) and where it
  // is metal (the lines and the inner ring), so the gold shines as gold.
  function iconTextures(id) {
    var S = 256, c = S / 2;
    var shapes = iconPaths(id);
    function paint(metal) {
      var cv = document.createElement('canvas');
      cv.width = cv.height = S;
      var g = cv.getContext('2d');
      if (metal) {
        g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
      } else {
        var bg = g.createRadialGradient(c * 0.8, c * 0.7, 10, c, c, c);
        bg.addColorStop(0, '#b81822');
        bg.addColorStop(0.7, '#850d16');
        bg.addColorStop(1, '#5c070e');
        g.fillStyle = bg; g.fillRect(0, 0, S, S);
      }
      var lineCol = metal ? '#fff' : '#ffd877';
      g.beginPath(); g.arc(c, c, c * 0.84, 0, Math.PI * 2);
      g.lineWidth = 6; g.strokeStyle = lineCol; g.stroke();
      g.save();
      g.translate(c - 66, c - 66);
      g.scale(5.5, 5.5);
      g.lineWidth = 2.4; g.lineCap = 'round'; g.lineJoin = 'round';
      if (!metal) {
        g.shadowColor = 'rgba(60, 0, 6, 0.55)';
        g.shadowOffsetY = 4; g.shadowBlur = 6;
      }
      shapes.forEach(function (s) {
        g.strokeStyle = lineCol; g.stroke(s.path);
        if (s.fill) { g.fillStyle = lineCol; g.fill(s.path); }
      });
      g.restore();
      var t = new THREE.CanvasTexture(cv);
      if (!metal) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return t;
    }
    return { map: paint(false), metal: paint(true) };
  }

  // The disc's top cap faces +Y; turned a quarter so the icon's top points
  // north (-Z), which the lean then brings round to face the viewer.
  var DISC_H = 0.12, RIM_TUBE = 0.026;
  var discGeo = new THREE.CylinderGeometry(PLAQUE_R, PLAQUE_R * 1.03, DISC_H, 64);
  discGeo.rotateY(Math.PI / 2);
  var rimGeo = new THREE.TorusGeometry(PLAQUE_R + 0.004, RIM_TUBE, 16, 80);
  rimGeo.rotateX(Math.PI / 2);
  var stemGeo = new THREE.CylinderGeometry(PLAQUE_R * 0.26, PLAQUE_R * 0.4, 1, 32);
  // The highest point of the bezel, the face and the dome under a plaque,
  // and how far clear of it a plaque rests.
  var BEZEL_TOP = 0.06 + 0.2, CLEAR = 0.05;

  var UP = new THREE.Vector3(0, 1, 0);
  var plaques = [];
  var hitTargets = [];
  tools.forEach(function (t, i) {
    var tex = iconTextures(t.icon);
    var top = new THREE.MeshPhysicalMaterial({
      // The disc faces the viewer, so it faces the brightest part of the
      // room light too: a little less of it keeps the red deep.
      map: tex.map, metalnessMap: tex.metal, metalness: 1, roughness: 0.4, envMapIntensity: 0.3,
      clearcoat: 0.6, clearcoatRoughness: 0.08, emissive: 0xff2a36, emissiveIntensity: 0
    });
    var group = new THREE.Group();
    var disc = new THREE.Mesh(discGeo, [lacquer, top, lacquer]);
    var rimMesh = new THREE.Mesh(rimGeo, gold);
    rimMesh.position.y = 0.06;
    var stem = new THREE.Mesh(stemGeo, gold);
    group.add(stem, disc, rimMesh);
    disc.userData.i = rimMesh.userData.i = i;
    hitTargets.push(disc, rimMesh);

    // Over the bezel at its bearing (0 is north, -Z; 90 is east, +X), leaning
    // most of the way towards the camera.
    var a = t.bearing * DEG;
    var base = new THREE.Vector3(Math.sin(a) * BEZEL_R, 0, -Math.cos(a) * BEZEL_R);
    var toCam = camera.position.clone().setY(camera.position.y - BEZEL_TOP).sub(base).normalize();
    var q = new THREE.Quaternion().slerpQuaternions(new THREE.Quaternion(), new THREE.Quaternion().setFromUnitVectors(UP, toCam), 0.55);
    group.quaternion.copy(q);
    // Leaning tips the disc's front edge down, so set the disc's height from
    // its lowest point: the edge of the disc, half its thickness and the gold
    // rim all clear the bezel at rest, and only the stem goes into it. The
    // lift on hover is then extra.
    var n = UP.clone().applyQuaternion(q);
    var edgeDrop = (PLAQUE_R * 1.03 + RIM_TUBE) * Math.sqrt(Math.max(0, 1 - n.y * n.y)) + (DISC_H / 2) * Math.abs(n.y);
    base.y = BEZEL_TOP + CLEAR + edgeDrop;
    group.position.copy(base);
    // The stem stands upright from the middle of the bezel's tube to the
    // disc's centre, whatever the lean, so it never shows through the face
    // or out of the side of the bezel.
    var qInv = q.clone().invert();
    var len = base.y - bezel.position.y;
    stem.quaternion.copy(qInv);
    stem.scale.set(1, len, 1);
    stem.position.copy(UP).applyQuaternion(qInv).multiplyScalar(-len / 2);
    rig.add(group);
    // Plaques on the far side of the dial carry their name above them, the
    // rest below, so a name never covers the face.
    plaques.push({ tool: t, group: group, top: top, base: base, normal: n, lift: 0, above: Math.cos(a) > 0.35 });
  });

  // The names, as links over the canvas. They are placed every frame under
  // their plaque, so they follow the case as it leans and floats.
  var nav = document.createElement('nav');
  nav.className = 'plaques';
  nav.setAttribute('aria-label', 'Tools on the compass');
  plaques.forEach(function (p, i) {
    var a = document.createElement('a');
    a.className = 'plaque';
    a.href = p.tool.href;
    a.setAttribute('data-aim', String(p.tool.bearing));
    a.setAttribute('data-name', p.tool.name);
    if (p.tool.tool) a.setAttribute('data-tool', p.tool.tool);
    a.style.setProperty('--i', i);
    if (p.above) a.classList.add('is-above');
    a.innerHTML = '<span class="plaque-dot" aria-hidden="true"></span><span class="plaque-name"></span><span class="sr-only"></span>';
    a.querySelector('.plaque-name').textContent = p.tool.short;
    if (p.tool.short !== p.tool.name) a.querySelector('.sr-only').textContent = ', ' + p.tool.name;
    nav.appendChild(a);
    p.tag = a;
    p.tagX = p.tagY = -1;
  });
  host.appendChild(nav);

  // ---- Which plaque is lifted ------------------------------------------------
  // The one under the pointer on the canvas, or else the one the needle has
  // been sent to by bearing: by its name below it (hover or focus), its chip
  // in the hero, its row in the finder, or, on a phone, its card scrolling
  // past. A card under a mouse sends the needle to the card itself instead,
  // so no plaque lifts for that.
  var rayIdx = -1, aimIdx = -1, active = -1;

  function aimed() {
    var t = dial.target();
    for (var i = 0; i < plaques.length; i++) {
      var off = (((t.heading - plaques[i].tool.bearing) % 360) + 360) % 360;
      if ((off < 0.5 || off > 359.5) && t.label === plaques[i].tool.name) return i;
    }
    return -1;
  }
  function settle() {
    var next = rayIdx >= 0 ? rayIdx : aimIdx;
    if (next === active) return;
    active = next;
    plaques.forEach(function (p, i) { p.tag.classList.toggle('is-on', i === active); });
    if (still) render();
  }

  // Picking on the canvas: a ray from the camera through the pointer, tested
  // against the plaques only.
  var raycaster = new THREE.Raycaster();
  var ndc = new THREE.Vector2();
  var pointerIn = false;

  function toNdc(e) {
    var r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }
  function pick() {
    raycaster.setFromCamera(ndc, camera);
    var hit = raycaster.intersectObjects(hitTargets, false)[0];
    return hit ? hit.object.userData.i : -1;
  }
  function setRay(i) {
    if (i === rayIdx) return;
    rayIdx = i;
    canvas.style.cursor = i >= 0 ? 'pointer' : '';
    if (i >= 0) dial.hold(plaques[i].tool.bearing, plaques[i].tool.name);
    else dial.free();
    settle();
  }

  canvas.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    pointerIn = true;
    toNdc(e);
    if (still || !raf) setRay(pick());
  });
  canvas.addEventListener('pointerleave', function () {
    pointerIn = false;
    setRay(-1);
  });
  canvas.addEventListener('click', function (e) {
    toNdc(e);
    var i = pick();
    if (i < 0) return;
    var href = plaques[i].tool.href;
    if (e.ctrlKey || e.metaKey || e.shiftKey) { window.open(href, '_blank', 'noopener'); return; }
    setRay(i);
    if (window.ADYPUHub) window.ADYPUHub.leave(href, e.clientX, e.clientY);
    else location.href = href;
  });

  // ---- Running it ------------------------------------------------------------
  var heading = dial.angle();
  var ptr = dial.pointer, sx = 0, sy = 0;
  var visible = true, raf = 0;
  var cw = 1, ch = 1, cx0 = 0, cy0 = 0, tipFrom = 0, tipOver = 1;
  var tmp = new THREE.Vector3();
  var tanHalf = Math.tan(camera.fov * DEG / 2);
  dial.subscribe(function (a) {
    heading = a;
    var i = aimed();
    if (i !== aimIdx) { aimIdx = i; settle(); }
    if (still) render();
  });

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    cw = w; ch = h; cx0 = canvas.offsetLeft; cy0 = canvas.offsetTop;
    // The case starts to tip away once the compass nears the top of the
    // window. On a phone it sits below the text, so that is well after the
    // page starts to scroll.
    var top = host.getBoundingClientRect().top + window.scrollY;
    tipFrom = Math.max(0, top - window.innerHeight * 0.2);
    tipOver = host.offsetHeight + window.innerHeight * 0.2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  }

  function render(now) {
    var t = (now || performance.now()) / 1000;
    if (!still) {
      sx += (ptr.x - sx) * 0.06;
      sy += (ptr.y - sy) * 0.06;
    }
    // 0 while the compass is well in view, 1 once it has scrolled away.
    var p = Math.min(1, Math.max(0, (window.scrollY - tipFrom) / tipOver));
    // Leaning back (pointer high on the page) is kept slight, so the case
    // never turns edge-on and hides the south plaque.
    rig.rotation.x = Math.max(-0.05, sy * 0.16) + p * 0.6;
    rig.rotation.z = -sx * 0.16;
    rig.rotation.y = sx * 0.1;
    rig.position.y = (still ? 0 : Math.sin(t * 1.1) * 0.06) + p * 0.9;
    rig.scale.setScalar(1 - p * 0.18);
    needle.rotation.y = -heading * DEG;
    dust.rotation.y = t * 0.05;

    // The pointer stays still while the case moves under it: pick again.
    if (pointerIn && !still) setRay(pick());

    plaques.forEach(function (pl, i) {
      var want = i === active ? 1 : 0;
      pl.lift = still ? want : pl.lift + (want - pl.lift) * 0.16;
      pl.group.position.copy(pl.base).addScaledVector(pl.normal, pl.lift * 0.16);
      pl.group.scale.setScalar(1 + pl.lift * 0.1);
      pl.top.emissiveIntensity = pl.lift * 0.22;
    });

    renderer.render(scene, camera);

    // Then place each name just under (or over) its plaque.
    plaques.forEach(function (pl) {
      pl.group.getWorldPosition(tmp);
      var dist = tmp.distanceTo(camera.position);
      tmp.project(camera);
      var perUnit = ch / (2 * dist * tanHalf);
      var gap = perUnit * (PLAQUE_R * pl.group.scale.x + 0.1);
      var x = cx0 + (tmp.x + 1) / 2 * cw;
      var y = cy0 + (1 - tmp.y) / 2 * ch + (pl.above ? -gap : gap);
      if (Math.abs(x - pl.tagX) > 0.1 || Math.abs(y - pl.tagY) > 0.1) {
        pl.tagX = x; pl.tagY = y;
        pl.tag.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
      }
    });
    // The names fade as the compass tips away with the scroll.
    var fade = Math.max(0, 1 - p * 2.4);
    nav.style.opacity = fade < 1 ? fade.toFixed(3) : '';
    nav.style.pointerEvents = fade < 0.3 ? 'none' : '';
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    render(now);
  }
  function start() { if (!raf && !still) raf = requestAnimationFrame(frame); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  function giveUp() {
    stop();
    nav.remove();
    dial.free();
    root.classList.remove('three-on', 'three-wait');
    root.classList.add('three-off');
  }

  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    giveUp();
  });

  // The theme changes the face; fonts arriving late change its lettering.
  new MutationObserver(function () { drawFace(); if (still) render(); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  // Ready the first frame out of sight: the face's fonts (for a moment at
  // most), the shaders compiled without blocking the page, then one render.
  // Only then does the canvas fade in, so it never appears half drawn.
  var fonts = document.fonts && document.fonts.load ? Promise.all([
    document.fonts.load('700 118px "Playfair Display"'),
    document.fonts.load('600 38px "IBM Plex Mono"')
  ]) : Promise.resolve();
  var briefly = new Promise(function (r) { setTimeout(r, 900); });
  return Promise.race([fonts, briefly]).catch(function () {}).then(function () {
    drawFace();
    resize();
    if (!renderer.compileAsync) { renderer.compile(scene, camera); return; }
    // A page that is not being drawn (a tab opened in the background) may
    // not finish compiling in parallel; after a moment the first render
    // compiles whatever is left.
    return Promise.race([renderer.compileAsync(scene, camera), new Promise(function (r) { setTimeout(r, 1500); })]);
  }).then(function () {
    if (root.classList.contains('three-off')) {
      // Too late: the flat dial is already showing, so leave it be.
      nav.remove();
      renderer.dispose();
      return false;
    }
    render();
    root.classList.remove('three-wait');
    root.classList.add('three-on');
    new ResizeObserver(resize).observe(host);
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !document.hidden) start(); else stop();
    }).observe(host);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else if (visible) start();
    });
    if (still) window.addEventListener('scroll', function () { render(); }, { passive: true });
    fonts.then(function () { drawFace(); if (still) render(); }, function () {});
    return true;
  });
}
