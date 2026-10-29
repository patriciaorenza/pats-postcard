(function () {
  var q = function (s) { return document.querySelector(s); };
  var intro = q('#intro');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function start() { if (window.nStartHero) window.nStartHero(); else document.querySelectorAll('.hv').forEach(function (e) { e.style.opacity = 1; }); }
  if (reduce || !window.gsap) { intro.remove(); start(); return; }
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var easeIO = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var easeO = function (t) { return 1 - Math.pow(1 - t, 3); };
  var easeI = function (t) { return t * t; };
  document.body.classList.add('lock');
  /* ---------- scene 2: scroll-driven 3-pointer, her own shooting poses ----------
     Four photos of her (A crouch with ball, B ball up, C release, D follow-through) are cross-dissolved while the body moves
     up and down. The ball in A and B is part of the photo; after release a separate ball sprite flies to the hoop. */
  var PHW = 1448, PHH = 1086, RIM = { x: 1250, y: 268 }, NETB = 346;
  var P = { ax: 390, ay: 1500, stand: 1214, bx: 476, by: 235, bd: 165 };   // pose canvas anchor (feet), standing height, ball in pose B
  var court = q('#court');
  var prompt = { style: {} }, pshd = q('#pshd'), sA = q('#sA'), sB = q('#sB'), sC = q('#sC'), sD = q('#sD'), player = q('#player'), pA = q('#pA'), pB = q('#pB'), pC = q('#pC'), pD = q('#pD'), fly = q('#fly'), net = q('#net'), gsh = q('#gsh');
  var L2 = {};
  function layout2() {
    var W = window.innerWidth, H = window.innerHeight, a = W / H, portrait = a < 1;
    var vbW, vbH, vbX, vbY;
    if (a >= PHW / PHH) { vbW = PHW; vbH = PHW / a; vbX = 0; vbY = (PHH - vbH) * 0.2; }
    else { vbH = PHH; vbW = PHH * a; vbX = PHW - vbW; vbY = 0; }
    court.setAttribute('viewBox', vbX + ' ' + vbY + ' ' + vbW + ' ' + vbH);
    var k = (portrait ? 0.42 : 0.5) * vbH / P.stand;   // larger, so she reads as standing on the court
    L2 = { vbX: vbX, vbY: vbY, vbW: vbW, vbH: vbH, k: k, px: vbX + vbW * (portrait ? 0.3 : 0.3), gy: vbY + vbH * (portrait ? 0.84 : 0.88), portrait: portrait };
  }
  layout2();
  var D1 = 54, RELEASE = 0.35, JH = 0.055;
  function bez(p0, p1, p2, p3, t) { var u = 1 - t; return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3; }
  function body(p) {
    var h = L2.vbH, enter = 1 - easeO(seg(p, 0, 0.1)), dy = 0;
    var jm = seg(p, 0.26, 0.36), ld = seg(p, 0.4, 0.52);
    // small knee dip before the jump, then a modest lift (JH) so the cut-out never slides like a sticker
    if (p < 0.26) dy = 0.012 * h * Math.sin(Math.PI * seg(p, 0.23, 0.265));
    else if (p < 0.4) dy = lerp(0, -JH * h, easeO(jm));
    else dy = lerp(-JH * h, 0, easeI(ld));
    dy += enter * h * 0.3;
    var crouch = Math.sin(Math.PI * seg(p, 0.1, 0.2)) * 0.5 * (1 - seg(p, 0.16, 0.2) * 0);
    var land = Math.sin(Math.PI * seg(p, 0.5, 0.6)); crouch += 0.9 * Math.sin(Math.PI * seg(p, 0.23, 0.265));
    var sy = 1 - 0.018 * crouch - 0.022 * land, sx = 1 + 0.01 * crouch + 0.012 * land;
    return { dy: dy, sy: sy, sx: sx };
  }
  function ballOnB(b) { return { x: L2.px + (P.bx - P.ax) * L2.k * b.sx, y: L2.gy + b.dy + (P.by - P.ay) * L2.k * b.sy }; }
  function render(p) {
    var b = body(p);
    prompt.style.opacity = seg(p, 0.03, 0.09) * (1 - seg(p, 0.2, 0.27));
    player.setAttribute('transform', 'translate(' + L2.px + ' ' + (L2.gy + b.dy) + ') scale(' + (L2.k * b.sx) + ' ' + (L2.k * b.sy) + ')');
    // near-cuts between poses: the incoming pose fades in over a fully opaque one, so two bodies never ghost
    var oA = p < 0.27 ? 1 : 0, oB = p < 0.358 ? seg(p, 0.262, 0.27) : 0,
        oC = p < 0.395 ? seg(p, 0.35, 0.358) : (p < 0.507 ? 0 : 1),
        oD = p < 0.387 ? 0 : (p < 0.507 ? seg(p, 0.387, 0.395) : 1 - seg(p, 0.507, 0.515));
    pA.setAttribute('opacity', oA); pB.setAttribute('opacity', oB); pC.setAttribute('opacity', oC); pD.setAttribute('opacity', oD);
    sA.setAttribute('opacity', oA); sB.setAttribute('opacity', oB); sC.setAttribute('opacity', oC); sD.setAttribute('opacity', oD);
    var air = clamp(-b.dy / (JH * L2.vbH), 0, 1);
    // long sunset shadow on the ground, cast toward the viewer like the palms'; it stays on the court when she jumps
    pshd.setAttribute('transform', 'translate(' + L2.px + ' ' + L2.gy + ') scale(' + (L2.k * b.sx) + ' ' + (-L2.k * 0.3) + ') skewX(12)');
    pshd.setAttribute('opacity', 0.85 * (1 - 0.5 * air));
    // slow camera push-in
    court.style.transform = 'scale(' + (1 + 0.05 * easeIO(seg(p, 0.23, 0.8))) + ')';
    gsh.setAttribute('cx', L2.px); gsh.setAttribute('cy', L2.gy - 4); gsh.setAttribute('rx', 150 * L2.k * 1.2 * (1 - 0.35 * air)); gsh.setAttribute('ry', 20 * L2.k * 1.3 * (1 - 0.3 * air)); gsh.setAttribute('opacity', 0.9 - 0.45 * air);
    // ball sprite: rides on the photo ball until release, then flies to the rim
    var rb = ballOnB(body(RELEASE)), bx, by, bd, bo, spin = 0, D0 = P.bd * L2.k;
    var f = seg(p, RELEASE, 0.64);
    if (p < RELEASE) { var c = ballOnB(b); bx = c.x; by = c.y; bd = D0; bo = p > 0.335 ? 1 : 0; }
    else if (p < 0.64) {
      var peak = RIM.y - 0.17 * L2.vbH;
      bx = bez(rb.x, rb.x + (RIM.x - rb.x) * 0.2, RIM.x - (RIM.x - rb.x) * 0.08, RIM.x, f);
      by = bez(rb.y, peak - 0.07 * L2.vbH, peak + 0.01 * L2.vbH, RIM.y, f);
      bd = lerp(D0, D1, easeO(f)); spin = 560 * f; bo = 1;
    } else {
      var g = seg(p, 0.64, 0.86);
      bx = RIM.x + 3 * Math.sin(g * 8) * (1 - g); bd = lerp(D1, 40, easeO(g));
      by = RIM.y + (NETB - RIM.y) * easeIO(seg(p, 0.64, 0.72)) + (p > 0.72 ? 760 * easeI(seg(p, 0.72, 0.86)) : 0);
      spin = 560 + 200 * g; bo = 1 - seg(p, 0.8, 0.86);
    }
    fly.setAttribute('x', -bd / 2); fly.setAttribute('y', -bd / 2); fly.setAttribute('width', bd); fly.setAttribute('height', bd);
    fly.setAttribute('transform', 'translate(' + bx + ' ' + by + ') rotate(' + spin + ')'); fly.setAttribute('opacity', bo);
    // net swish
    var nq = seg(p, 0.63, 0.86), swell = Math.sin(Math.PI * clamp(nq * 2.2, 0, 1));
    var nsy = 1 + 0.28 * swell * (1 - nq * 0.4), nsx = 1 - 0.1 * swell, sk = 8 * Math.sin(nq * 20) * Math.pow(1 - nq, 2) * (nq > 0 ? 1 : 0);
    net.setAttribute('transform', 'translate(1250 266.7) scale(' + nsx + ' ' + nsy + ') skewX(' + sk + ') translate(-1250 -266.7)');
  }
  var proxy = { p: 0 }, done = false;
  function onResize() { layout2(); render(proxy.p); }
  function onKey(e) { if (e.key === 'Escape') finish(true); }
  window.addEventListener('resize', onResize);
  render(0.23);
  function finish(fast) {
    if (done) return; done = true;
    var out = function () { gsap.killTweensOf(proxy); removeEventListener('resize', onResize); removeEventListener('keydown', onKey); document.body.classList.remove('lock'); intro.remove(); };
    if (fast) gsap.killTweensOf(proxy);
    start();
    gsap.to(intro, { opacity: 0, duration: fast ? .25 : .55, ease: 'power2.inOut', onComplete: out });
  }
  q('#nSkip').addEventListener('click', function () { finish(true); });
  addEventListener('keydown', onKey);
  var imgs = ['court-grade.webp', 'pose-A-lit.webp', 'pose-B-lit.webp', 'pose-C-lit.webp', 'pose-D-lit.webp', 'pose-A-shadow.webp', 'pose-B-shadow.webp', 'pose-C-shadow.webp', 'pose-D-shadow.webp', 'flyball.webp', 'net.webp'];
  var left = imgs.length, go = false;
  function play() {
    if (go) return; go = true; proxy.p = 0.23; layout2(); render(0.23);
    gsap.to(proxy, { p: 0.8, duration: 1.95, ease: 'none', onUpdate: function () { render(proxy.p); if (proxy.p > 0.72) finish(false); } });  // swish, then fade into About
  }
  imgs.forEach(function (n) { var im = new Image(); im.onload = im.onerror = function () { if (--left === 0) play(); }; im.src = 'assets/' + n; });
  setTimeout(play, 2500);
})();
