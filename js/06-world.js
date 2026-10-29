(function () {
  var q = function (s, r) { return (r || document).querySelector(s); };
  var qa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = Math.PI / 180, lastFocus = null;
  function lockOn() { document.body.classList.add('lock'); }
  function lockOff() { if (!qa('.mx.open, .nt.open, .ct.open, .ov.open').length) document.body.classList.remove('lock'); }

  /* ================= GLOBE ================= */
  var TRIPS = [
    { n: 'Singapore', f: '🇸🇬', ll: [103.82, 1.35], tag: 'home', vis: 'Singapore', s: 'Home base. The court, the coaching and most of this website happen here.', ph: [] },
    { n: 'Philippines', f: '🇵🇭', ll: [122, 12.5], tag: 'pinned', vis: 'Philippines', s: '', ph: [] },
    { n: 'Malaysia', f: '🇲🇾', ll: [101.7, 3.1], tag: 'pinned', vis: 'Malaysia', s: '', ph: [] },
    { n: 'Indonesia', f: '🇮🇩', ll: [113.5, -2.2], tag: 'pinned', vis: 'Indonesia', s: '', ph: [] },
    { n: 'Taiwan', f: '🇹🇼', ll: [121, 23.7], tag: 'pinned', vis: 'Taiwan', s: '', ph: [] },
    { n: 'Vietnam', f: '🇻🇳', ll: [106, 16.5], tag: 'pinned', vis: 'Vietnam', s: '', ph: [] },
    { n: 'Hong Kong', f: '🇭🇰', ll: [114.17, 22.3], tag: 'pinned', vis: 'Hong Kong', s: '', ph: [] },
    { n: 'Türkiye', f: '🇹🇷', ll: [32.9, 39.5], tag: 'pinned', vis: 'Turkey', s: '', ph: [] },
    { n: 'Italy', f: '🇮🇹', ll: [12.5, 41.9], tag: 'pinned', vis: 'Italy', s: 'Rome in golden light, cobbled streets and gelato in hand.', ph: ['assets/it-1.jpg', 'assets/it-2.jpg'] },
    { n: 'United States', f: '🇺🇸', ll: [-98, 39], tag: 'pinned', vis: 'United States of America', s: '', ph: [] }
  ];
  var gl = q('#gl'), gBuilt = false, cv, ctx, W = 0, H = 0, dpr = 1, lon = 95, lat = 12, zoom = 1, vx = 0, vy = 0, drag = false, auto = true, raf = 0, sel = -1, fly = null, cyF = .54, cyT = .54, pins = [], ptrs = {}, pinch0 = 0, zoom0 = 1, touched = false;
  var sinL = 0, cosL = 1;
  function loadWorld(cb) { if (window.WORLD) return cb(); var s = document.createElement('script'); s.src = 'assets/world.js'; s.onload = cb; s.onerror = cb; document.head.appendChild(s); }
  function buildGlobe() {
    gl.innerHTML = '<canvas id="glC" aria-label="Interactive globe. Drag to spin."></canvas>' +
      '<div class="gl-top"><h2 class="gl-code">print(&quot;Hello, World!&quot;)</h2><p class="gl-lg">' + '<span class="lg-i"><span class="lgd">●</span> places i’ve been</span><span class="lg-i"><span class="lge">✉</span> <span id="glPcLg">postcards from visitors</span></span></p><div class="gl-chips" id="glChips">' + TRIPS.map(function (t, i) { return '<button type="button" class="gl-chip" data-i="' + i + '" aria-label="' + esc(t.n) + '"><span class="fl">' + t.f + '</span><span class="nm"> ' + esc(t.n) + '</span></button>'; }).join('') + '</div></div>' +
      '<div id="glPins"></div><div id="glPcPins"></div><button type="button" class="gl-pcb" id="glPcb">✉ Leave a postcard!<small>Share a travel story, a favourite memory or a must-visit place</small></button><div class="gl-hint" id="glHint">drag to spin · pinch to zoom</div>' +
      '<div class="gl-z"><button type="button" id="glIn" aria-label="Zoom in">+</button><button type="button" id="glOut" aria-label="Zoom out">−</button></div>' +
      '<div class="gl-card" id="glCard" hidden></div><div class="pc-wrap" id="glForm" hidden><div class="pc-card" id="pcCard" role="dialog" aria-label="Write a postcard"><button class="cx" type="button" aria-label="Close" id="pcX">×</button><form id="pcForm" autocomplete="off"><div class="pc-l"><label class="pc-hi" for="pcText">Dear Pat,</label><textarea id="pcText" maxlength="240" required placeholder="Share a travel story, a favourite memory or a must-visit place…"></textarea><div class="pc-sign">With love, <span id="pcSignN">—</span></div></div><div class="pc-r"><div class="pc-top"><div class="pc-pm"><svg class="pc-pmsvg" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="pcPmA" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1 -88 0"/></defs><g fill="none" stroke="#6B2229" stroke-width="1.6"><circle cx="60" cy="60" r="55"/><circle cx="60" cy="60" r="33" stroke-width="1"/></g><text font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="600" letter-spacing="2.4" fill="#6B2229"><textPath href="#pcPmA" startOffset="0">POSTCARD · FROM THE GLOBE · </textPath></text><text id="pcPmC" x="60" y="64" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" letter-spacing="1" fill="#6B2229">YOUR PLACE</text></svg><svg class="pc-wave" viewBox="0 0 120 40" aria-hidden="true"><path d="M0 8q15-8 30 0t30 0t30 0t30 0M0 18q15-8 30 0t30 0t30 0t30 0M0 28q15-8 30 0t30 0t30 0t30 0" fill="none" stroke="#6B2229" stroke-width="1.6"/></svg></div><div class="pc-stamp"><svg class="pc-stampsvg" viewBox="0 0 80 96" aria-hidden="true"><defs><mask id="pcsm"><rect width="80" height="96" fill="#fff"/><g fill="#000"><circle cx="5" cy="0" r="3.2"/><circle cx="5" cy="96" r="3.2"/><circle cx="15" cy="0" r="3.2"/><circle cx="15" cy="96" r="3.2"/><circle cx="25" cy="0" r="3.2"/><circle cx="25" cy="96" r="3.2"/><circle cx="35" cy="0" r="3.2"/><circle cx="35" cy="96" r="3.2"/><circle cx="45" cy="0" r="3.2"/><circle cx="45" cy="96" r="3.2"/><circle cx="55" cy="0" r="3.2"/><circle cx="55" cy="96" r="3.2"/><circle cx="65" cy="0" r="3.2"/><circle cx="65" cy="96" r="3.2"/><circle cx="75" cy="0" r="3.2"/><circle cx="75" cy="96" r="3.2"/><circle cx="0" cy="6" r="3.2"/><circle cx="80" cy="6" r="3.2"/><circle cx="0" cy="18" r="3.2"/><circle cx="80" cy="18" r="3.2"/><circle cx="0" cy="30" r="3.2"/><circle cx="80" cy="30" r="3.2"/><circle cx="0" cy="42" r="3.2"/><circle cx="80" cy="42" r="3.2"/><circle cx="0" cy="54" r="3.2"/><circle cx="80" cy="54" r="3.2"/><circle cx="0" cy="66" r="3.2"/><circle cx="80" cy="66" r="3.2"/><circle cx="0" cy="78" r="3.2"/><circle cx="80" cy="78" r="3.2"/><circle cx="0" cy="90" r="3.2"/><circle cx="80" cy="90" r="3.2"/></g></mask></defs><g mask="url(#pcsm)"><rect width="80" height="96" fill="#F3D2D0"/><rect x="6" y="6" width="68" height="84" fill="none" stroke="#9B3040" stroke-width="1.2"/><circle cx="40" cy="38" r="21" fill="#9B3040" fill-opacity=".1" stroke="#9B3040" stroke-width="1"/><path d="M22 40l36-12-8 14 6 14-8-4-6 10-4-12-16-4z" fill="#9B3040" transform="translate(2 -2) scale(.95)"/><text x="40" y="76" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.2" font-weight="600" letter-spacing="1.2" fill="#9B3040">POSTAGE</text><text x="40" y="84" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="5" letter-spacing="1" fill="#9B3040">SINGAPORE</text></g></svg></div></div><div class="pc-addr"><label for="pcName">From</label><input id="pcName" maxlength="40" required placeholder="Your name"><label for="pcCountry">Where in the world?</label><select id="pcCountry" required><option value="">Choose your country</option>' + CTRY.map(function (c) { return '<option>' + esc(c[0]) + '</option>'; }).join('') + '</select><div class="pc-to"><small>To</small>Pat<br>Singapore</div></div><input id="pcHp" tabindex="-1" aria-hidden="true" style="position:absolute;left:-9999px"><button class="go" id="pcGo" type="submit">Send postcard ✈</button><div class="msg" id="pcMsg" role="status"></div></div></form></div></div><button class="ov-x" type="button" aria-label="Close globe" id="glX">×</button>';
    cv = q('#glC'); ctx = cv.getContext('2d');
    q('#glPins').innerHTML = TRIPS.map(function (t, i) { return '<button type="button" class="gl-pin" data-i="' + i + '" aria-label="' + esc(t.n) + '"><span>' + esc(t.n) + '</span></button>'; }).join('');
    pins = qa('.gl-pin', gl);
    q('#glX').addEventListener('click', closeGlobe);
    q('#glPcb').addEventListener('click', openForm); q('#pcX').addEventListener('click', closeForm);
    q('#glForm').addEventListener('click', function (e) { if (e.target === this) closeForm(); });
    q('#pcCountry').addEventListener('change', function () { q('#pcPmC').textContent = (this.value || 'YOUR PLACE').toUpperCase().slice(0, 15); });
    q('#pcName').addEventListener('input', function () { q('#pcSignN').textContent = this.value.trim() || '—'; }); q('#pcForm').addEventListener('submit', submitPc);
    gl.addEventListener('click', function (e) { var b = e.target.closest('.gl-pcp'); if (b) showPc(+b.dataset.p); });
    loadPcs();
    q('#glIn').addEventListener('click', function () { setZoom(zoom * 1.3); });
    q('#glOut').addEventListener('click', function () { setZoom(zoom / 1.3); });
    gl.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b && (b.classList.contains('gl-pin') || b.classList.contains('gl-chip'))) select(+b.dataset.i, true); });
    cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.clientX, e.clientY]; touched = true; auto = false; fly = null; vx = vy = 0; hint(); var k = Object.keys(ptrs); if (k.length === 2) { pinch0 = pdist(); zoom0 = zoom; } });
    cv.addEventListener('pointermove', function (e) {
      var p = ptrs[e.pointerId]; if (!p) return; var dx = e.clientX - p[0], dy = e.clientY - p[1]; p[0] = e.clientX; p[1] = e.clientY;
      if (Object.keys(ptrs).length >= 2) { setZoom(zoom0 * pdist() / (pinch0 || 1)); return; }
      var r = rad(); lon -= dx / r * 57.3; lat += dy / r * 57.3; lat = Math.max(-80, Math.min(80, lat)); vx = -dx / r * 57.3; vy = dy / r * 57.3;
    });
    var up = function (e) { delete ptrs[e.pointerId]; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', function (e) { e.preventDefault(); touched = true; auto = false; hint(); setZoom(zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)); }, { passive: false });
    window.addEventListener('resize', size);
    gBuilt = true;
  }
  function pdist() { var k = Object.keys(ptrs); if (k.length < 2) return 1; var a = ptrs[k[0]], b = ptrs[k[1]]; return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function hint() { var h = q('#glHint'); if (h) h.style.opacity = 0; }
  function setZoom(z) { zoom = Math.max(.75, Math.min(3.2, z)); }
  function size() { if (!cv) return; dpr = Math.min(2, window.devicePixelRatio || 1); W = gl.clientWidth; H = gl.clientHeight; cv.width = W * dpr; cv.height = H * dpr; }
  function rad() { return Math.min(W, H * (W < 761 ? .8 : 1)) * .4 * zoom; }
  function proj(lo, la) { var l = (lo - lon) * D, p = la * D, sp = Math.sin(p), cp = Math.cos(p); return [cp * Math.sin(l), cosL * sp - sinL * cp * Math.cos(l), sinL * sp + cosL * cp * Math.cos(l)]; }
  function ringPath(ring, cx, cy, r) {
    var n = ring.length / 2, P = [], vis = 0, i;
    for (i = 0; i < n; i++) { var p = proj(ring[2 * i], ring[2 * i + 1]); P.push(p); if (p[2] >= 0) vis++; }
    if (!vis) return;
    var out = [];
    if (vis === n) { for (i = 0; i < n; i++) out.push([P[i][0], P[i][1], 0]); }
    else {
      for (i = 0; i < n; i++) {
        var a = P[i], b = P[(i + 1) % n];
        if (a[2] >= 0) out.push([a[0], a[1], 0]);
        if ((a[2] >= 0) !== (b[2] >= 0)) { var t = a[2] / (a[2] - b[2]), ix = a[0] + (b[0] - a[0]) * t, iy = a[1] + (b[1] - a[1]) * t, m = Math.hypot(ix, iy) || 1; out.push([ix / m, iy / m, 1]); }
      }
    }
    var fin = [], L = out.length;
    for (i = 0; i < L; i++) {
      var c = out[i]; fin.push(c);
      var d = out[(i + 1) % L];
      if (c[2] && d[2]) { var a0 = Math.atan2(c[1], c[0]), a1 = Math.atan2(d[1], d[0]), da = a1 - a0; while (da > Math.PI) da -= 6.2832; while (da < -Math.PI) da += 6.2832; var k = Math.max(2, Math.ceil(Math.abs(da) / .15)); for (var q2 = 1; q2 < k; q2++) { var aa = a0 + da * q2 / k; fin.push([Math.cos(aa), Math.sin(aa), 0]); } }
    }
    ctx.moveTo(cx + fin[0][0] * r, cy - fin[0][1] * r);
    for (i = 1; i < fin.length; i++) ctx.lineTo(cx + fin[i][0] * r, cy - fin[i][1] * r);
    ctx.closePath();
  }
  function draw() {
    sinL = Math.sin(lat * D); cosL = Math.cos(lat * D);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    cyF += (cyT - cyF) * .12; var cx = W / 2, cy = H * cyF, r = rad();
    // atmosphere
    var ag = ctx.createRadialGradient(cx, cy, r * .98, cx, cy, r * 1.18); ag.addColorStop(0, 'rgba(240,150,175,.38)'); ag.addColorStop(1, 'rgba(240,150,175,0)');
    ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, cy, r * 1.18, 0, 6.2832); ctx.fill();
    // ocean
    var og = ctx.createRadialGradient(cx - r * .35, cy - r * .4, r * .1, cx, cy, r); og.addColorStop(0, '#7A3248'); og.addColorStop(1, '#3A1522');
    ctx.fillStyle = og; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.clip();
    // graticule
    ctx.strokeStyle = 'rgba(255,215,222,.10)'; ctx.lineWidth = 1; ctx.beginPath();
    for (var g = -150; g <= 180; g += 30) { var on = false; for (var a = -90; a <= 90; a += 5) { var p = proj(g, a); if (p[2] > 0) { var X = cx + p[0] * r, Y = cy - p[1] * r; on ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); on = true; } else on = false; } }
    for (var t = -60; t <= 60; t += 30) { var on2 = false; for (var b = -180; b <= 180; b += 5) { var p2 = proj(b, t); if (p2[2] > 0) { var X2 = cx + p2[0] * r, Y2 = cy - p2[1] * r; on2 ? ctx.lineTo(X2, Y2) : ctx.moveTo(X2, Y2); on2 = true; } else on2 = false; } }
    ctx.stroke();
    var WD = window.WORLD;
    if (WD) {
      ctx.beginPath(); WD.base.forEach(function (rg) { ringPath(rg, cx, cy, r); }); ctx.fillStyle = '#E9C4C4'; ctx.fill(); ctx.strokeStyle = 'rgba(70,25,35,.35)'; ctx.lineWidth = .6; ctx.stroke();
      TRIPS.forEach(function (t, i) { var rs = WD.vis[t.vis]; if (!rs) return; ctx.beginPath(); rs.forEach(function (rg) { ringPath(rg, cx, cy, r); }); ctx.fillStyle = i === sel ? '#FF8FB0' : '#E27FA0'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = i === sel ? 1.6 : .9; ctx.stroke(); });
    }
    var sh = ctx.createRadialGradient(cx - r * .3, cy - r * .35, r * .5, cx, cy, r); sh.addColorStop(0, 'rgba(255,230,235,0)'); sh.addColorStop(1, 'rgba(20,5,12,.5)');
    ctx.fillStyle = sh; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
    // pins
    TRIPS.forEach(function (t, i) { var p = proj(t.ll[0], t.ll[1]), el = pins[i]; if (p[2] > .08) { el.style.visibility = 'visible'; el.style.transform = 'translate(' + (cx + p[0] * r) + 'px,' + (cy - p[1] * r) + 'px)'; } else el.style.visibility = 'hidden'; });
    placePc(cx, cy, r);
  }

  var SB2 = { url: 'https://rhswuqkpkspcbtrdlynf.supabase.co', key: 'sb_publishable_SdVZC9RHpp3U7y9U60CnGw_Nq6KWJQ3' };
  var CTRY = 'Afghanistan 66 33.9;Albania 20 41;Algeria 2.6 28;Andorra 1.6 42.5;Angola 17.9 -12.3;Antigua and Barbuda -61.8 17.1;Argentina -64 -34;Armenia 45 40.2;Australia 134 -25;Austria 14.5 47.5;Azerbaijan 47.6 40.4;Bahamas -77.4 25;Bahrain 50.5 26;Bangladesh 90 24;Barbados -59.5 13.2;Belarus 28 53.7;Belgium 4.5 50.8;Belize -88.5 17.2;Benin 2.3 9.3;Bhutan 90.4 27.5;Bolivia -64.7 -16.7;Bosnia and Herzegovina 17.8 44;Botswana 24.7 -22.3;Brazil -52 -10;Brunei 114.7 4.5;Bulgaria 25.5 42.7;Burkina Faso -1.6 12.2;Burundi 29.9 -3.4;Cabo Verde -23.6 15.1;Cambodia 105 12.5;Cameroon 12.4 5.7;Canada -100 57;Central African Republic 20.9 6.6;Chad 18.7 15.5;Chile -71 -33;China 104 35;Colombia -74 4;Comoros 43.9 -11.9;Congo (Republic) 15.8 -0.7;Congo (DRC) 23.6 -2.9;Costa Rica -84 9.9;Côte d’Ivoire -5.5 7.5;Croatia 16 45.1;Cuba -79.5 21.6;Cyprus 33 35;Czechia 15.5 49.8;Denmark 10 56;Djibouti 42.6 11.8;Dominica -61.4 15.4;Dominican Republic -70.2 18.9;Ecuador -78.4 -1.4;Egypt 30 27;El Salvador -88.9 13.7;Equatorial Guinea 10.3 1.7;Eritrea 38.9 15.2;Estonia 25.5 58.7;Eswatini 31.5 -26.5;Ethiopia 39.6 8.6;Fiji 178 -17.8;Finland 26 64;France 2.5 46.5;Gabon 11.7 -0.8;Gambia -15.4 13.4;Georgia 43.4 42.3;Germany 10.5 51;Ghana -1.2 7.9;Greece 22 39;Grenada -61.7 12.1;Guatemala -90.4 15.7;Guinea -10.9 10.4;Guinea-Bissau -15 12;Guyana -58.9 4.9;Haiti -72.7 19;Honduras -86.6 14.8;Hong Kong 114.17 22.3;Hungary 19.5 47;Iceland -18.6 64.9;India 78 22;Indonesia 113 -2;Iran 53.7 32.4;Iraq 43.7 33;Ireland -8 53;Israel 35 31.5;Italy 12.5 42;Jamaica -77.3 18.1;Japan 138 37;Jordan 36.5 31;Kazakhstan 67 48;Kenya 38 0;Kiribati 173 1.4;Kosovo 20.9 42.6;Kuwait 47.6 29.3;Kyrgyzstan 74.6 41.2;Laos 103 18;Latvia 24.9 56.9;Lebanon 35.9 33.9;Lesotho 28.2 -29.6;Liberia -9.4 6.4;Libya 17.2 27;Liechtenstein 9.55 47.15;Lithuania 23.9 55.2;Luxembourg 6.1 49.8;Macau 113.55 22.2;Madagascar 46.9 -19;Malawi 34.3 -13.2;Malaysia 102 4;Maldives 73.5 3.2;Mali -3.5 17.6;Malta 14.4 35.9;Marshall Islands 171 7.1;Mauritania -10.9 20.3;Mauritius 57.6 -20.3;Mexico -102 23;Micronesia 158.2 6.9;Moldova 28.4 47.2;Monaco 7.4 43.7;Mongolia 103.8 46.9;Montenegro 19.3 42.7;Morocco -7 32;Mozambique 35.5 -18.7;Myanmar 96 21;Namibia 17.1 -22;Nauru 166.9 -0.5;Nepal 84 28;Netherlands 5.3 52.2;New Zealand 172 -41;Nicaragua -85 12.9;Niger 8.1 17.6;Nigeria 8 9.5;North Korea 127.5 40;North Macedonia 21.7 41.6;Norway 9 61;Oman 56 21;Pakistan 69 30;Palau 134.5 7.5;Palestine 35.2 31.9;Panama -80.1 8.5;Papua New Guinea 144 -6.3;Paraguay -58 -23.4;Peru -75 -10;Philippines 122 12.5;Poland 19 52;Portugal -8 39.6;Puerto Rico -66.5 18.2;Qatar 51.2 25.3;Romania 25 46;Russia 100 60;Rwanda 29.9 -2;Saint Kitts and Nevis -62.7 17.3;Saint Lucia -61 13.9;Saint Vincent and the Grenadines -61.2 13.2;Samoa -172.1 -13.8;San Marino 12.46 43.94;São Tomé and Príncipe 6.6 0.2;Saudi Arabia 45 24;Senegal -14.5 14.5;Serbia 21 44;Seychelles 55.5 -4.7;Sierra Leone -11.8 8.5;Singapore 103.82 1.35;Slovakia 19.7 48.7;Slovenia 14.8 46.1;Solomon Islands 160 -9.6;Somalia 46 6;South Africa 24 -29;South Korea 127.8 36.5;South Sudan 30 7;Spain -3.7 40.3;Sri Lanka 80.7 7.8;Sudan 30 15.5;Suriname -56 4;Sweden 16 62;Switzerland 8.2 46.8;Syria 38.5 35;Taiwan 121 23.7;Tajikistan 71 38.9;Tanzania 34.9 -6.4;Thailand 101 15;Timor-Leste 125.7 -8.8;Togo 1 8.6;Tonga -175.2 -21.2;Trinidad and Tobago -61.2 10.7;Tunisia 9.5 34;Türkiye 35 39;Turkmenistan 59.6 39.1;Tuvalu 179.2 -8.5;Uganda 32.4 1.4;Ukraine 31.2 49;United Arab Emirates 54 24;United Kingdom -2 54;United States -98 39;Uruguay -56 -32.8;Uzbekistan 64.6 41.4;Vanuatu 167 -16;Vatican City 12.45 41.9;Venezuela -66.6 7.1;Vietnam 106 16.5;Yemen 47.6 15.9;Zambia 27.8 -13.1;Zimbabwe 29.9 -19'.split(';').map(function (r) { var m = r.match(/^(.*) (-?[\d.]+) (-?[\d.]+)$/); return [m[1], +m[2], +m[3]]; });
  var PCS = [], pcEls = [];
  var BAD = /\b(fuck|shit|bitch|asshole|cunt|dick|nigg|slut|whore|porn|sex|viagra|casino|http|www\.)/i;
  function pcPos(c, k) { var r = (Math.sin(k * 12.9898) * 43758.5453) % 1; var r2 = (Math.sin(k * 78.233) * 12345.678) % 1; return [c[1] + r * 1.6, c[2] + r2 * 1.6]; }
  function loadPcs() {
    fetch(SB2.url + '/rest/v1/postcards?approved=eq.true&select=name,country,message&order=created_at.desc&limit=80', { headers: { apikey: SB2.key } })
      .then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
        PCS = (rows || []).map(function (x, k) { var c = CTRY.filter(function (c) { return c[0] === x.country; })[0]; return c ? { n: x.name, c: x.country, m: x.message, ll: pcPos(c, k + 1) } : null; }).filter(Boolean);
        q('#glPcPins').innerHTML = PCS.map(function (p, i) { return '<button type="button" class="gl-pcp" data-p="' + i + '" aria-label="Postcard from ' + esc(p.c) + '"></button>'; }).join('');
        pcEls = qa('.gl-pcp', gl);
        var lg = q('#glPcLg'); if (lg) lg.textContent = PCS.length ? 'postcards from visitors (' + PCS.length + ')' : 'postcards from visitors';
      }).catch(function () {});
  }
  function placePc(cx, cy, r) { PCS.forEach(function (t, i) { var p = proj(t.ll[0], t.ll[1]), el = pcEls[i]; if (!el) return; if (p[2] > .08) { el.style.visibility = 'visible'; el.style.transform = 'translate(' + (cx + p[0] * r) + 'px,' + (cy - p[1] * r) + 'px)'; } else el.style.visibility = 'hidden'; }); }
  function showPc(i) {
    var t = PCS[i], card = q('#glCard'); if (!t) return; closeForm(true); flyTo(t.ll, Math.max(zoom, W < 761 ? 1.5 : 1.7)); cyT = W < 761 ? .32 : .54; auto = false; hint();
    card.innerHTML = '<button class="cx" type="button" aria-label="Close card">×</button><div class="in"><div class="tag">postcard · ' + esc(t.c) + '</div><h3>' + esc(t.n) + '</h3><p>' + esc(t.m) + '</p></div>'; card.hidden = false; gl.classList.add('card-open');
    q('.cx', card).onclick = function () { hideCard(); cyT = .54; };
  }
  function openForm() {
    var f = q('#glForm'); hideCard(); f.hidden = false; gl.classList.add('pc-open'); PatModal.open(f); var m = q('#pcMsg'); if (m) m.textContent = ''; setTimeout(function () { var n = q('#pcName'); if (n) n.focus({ preventScroll: true }); }, 350);
  }
  function submitPc(e) {
    e.preventDefault(); var n = q('#pcName').value.trim(), c = q('#pcCountry').value, m = q('#pcText').value.trim(), out = q('#pcMsg'), btn = q('#pcGo');
    if (q('#pcHp').value) return;
    if (!n || !c || m.length < 3) { out.textContent = 'Add your name, country and a short message.'; return; }
    if (BAD.test(n + ' ' + m)) { out.textContent = 'Please keep it kind and link-free so it can go on the globe.'; return; }
    btn.disabled = true; out.textContent = 'Sending…';
    fetch(SB2.url + '/rest/v1/postcards', { method: 'POST', headers: { apikey: SB2.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ name: n.slice(0, 40), country: c, message: m.slice(0, 240) }) })
      .then(function (r) {
        if (!r.ok) return r.json().catch(function () { return {}; }).then(function (b) { throw (b && b.code === 'P0001' && b.message) || ''; });
        out.textContent = 'Postmarked! Thank you. I’ll read it and pin it on the globe soon.'; q('#pcCard').classList.add('sent'); setTimeout(function () { q('#pcCard').classList.remove('sent'); }, 2600); q('#pcForm').reset(); q('#pcSignN').textContent = '—'; q('#pcPmC').textContent = 'YOUR PLACE'; })
      .catch(function (why) { out.textContent = (typeof why === 'string' && why) || 'Couldn’t send just now. Please try again in a moment.'; }).then(function () { btn.disabled = false; });
  }
  var last = 0;
  function loop(ts) {
    if (!gl.classList.contains('open')) { raf = 0; return; }
    var dt = Math.min(48, ts - last || 16); last = ts;
    if (fly) { var k = Math.min(1, (ts - fly.t0) / fly.d), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; lon = fly.l0 + (fly.l1 - fly.l0) * e; lat = fly.a0 + (fly.a1 - fly.a0) * e; zoom = fly.z0 + (fly.z1 - fly.z0) * e; if (k >= 1) fly = null; }
    else if (!Object.keys(ptrs).length) {
      if (auto && !reduce) lon += .1 * dt / 16;
      else if (Math.abs(vx) + Math.abs(vy) > .01) { lon += vx; lat = Math.max(-80, Math.min(80, lat + vy)); vx *= .95; vy *= .95; }
    }
    draw(); raf = requestAnimationFrame(loop);
  }
  function flyTo(ll, z) {
    var dl = ((ll[0] - lon + 540) % 360) - 180, a1 = Math.max(-60, Math.min(60, ll[1] * .8));
    if (reduce) { lon += dl; lat = a1; zoom = z; return; }
    fly = { t0: performance.now(), d: 950, l0: lon, l1: lon + dl, a0: lat, a1: a1, z0: zoom, z1: z };
  }
  function select(i, move) {
    sel = i; var t = TRIPS[i]; auto = false; hint();
    qa('.gl-pin', gl).forEach(function (p, k) { p.classList.toggle('on', k === i); });
    qa('.gl-chip', gl).forEach(function (p, k) { p.classList.toggle('on', k === i); });
    if (move) flyTo(t.ll, Math.max(zoom, W < 761 ? 1.5 : 1.7));
    cyT = W < 761 ? .32 : .54;
    var card = q('#glCard');
    var pics = t.ph.length ? t.ph.map(function (u) { return '<div class="pc" style="background-image:url(' + u + ')"></div>'; }).join('') : '<div class="pc"></div><div class="pc"></div><div class="pc"></div>';
    card.innerHTML = '<button class="cx" type="button" aria-label="Close card">×</button><div class="in"><div class="tag">' + (t.tag === 'home' ? 'home base' : 'pinned · ' + (i + 1) + ' of ' + TRIPS.length) + '</div><h3><i>' + t.f + '</i>' + esc(t.n) + '</h3>' +
      (t.s ? '<p>' + esc(t.s) + '</p>' : '<p class="soon">The story from this trip is coming soon: where i went, who with, and the moment i keep thinking about.</p>') +
      '<div class="pics">' + pics + '</div><div class="nav"><button type="button" data-d="-1">← prev</button><button type="button" data-d="1">next →</button><button type="button" class="pc-go">✉ send a postcard</button></div></div>';
    card.hidden = false; gl.classList.add('card-open');
    q('.pc-go', card).onclick = openForm;
    q('.cx', card).onclick = function () { hideCard(); sel = -1; cyT = .54; qa('.gl-pin,.gl-chip', gl).forEach(function (p) { p.classList.remove('on'); }); };
    qa('.nav button[data-d]', card).forEach(function (b) { b.onclick = function () { select((sel + +b.dataset.d + TRIPS.length) % TRIPS.length, true); }; });
    var chip = q('.gl-chip.on', gl), row = q('#glChips');
    if (chip && row) { var cr = chip.getBoundingClientRect(), rr = row.getBoundingClientRect(); row.scrollTo({ left: row.scrollLeft + (cr.left - rr.left) - (row.clientWidth - cr.width) / 2, behavior: reduce ? 'auto' : 'smooth' }); }
    gl.scrollLeft = 0;  // scrollIntoView used to slide the whole overlay sideways on phones
  }
  function closeForm(silent) {
    var f = q('#glForm'); if (!f || f.hidden) return; f.hidden = true; gl.classList.remove('pc-open'); PatModal.close(f);
    if (!silent) { var b = q('#glPcb'); if (b) b.focus({ preventScroll: true }); }
  }
  function hideCard() {
    var c = q('#glCard'); if (c) c.hidden = true; gl.classList.remove('card-open');
  }
  function openGlobe() {
    lastFocus = document.activeElement; gl.hidden = false; gl.classList.add('open'); lockOn(); PatModal.open(gl);
    var go = function () { if (!gBuilt) buildGlobe(); size(); auto = !touched; if (!raf) raf = requestAnimationFrame(loop); q('#glX').focus({ preventScroll: true }); };
    loadWorld(go);
  }
  function closeGlobe() { closeForm(true); hideCard(); sel = -1; cyT = .54; qa('.gl-pin,.gl-chip', gl).forEach(function (p) { p.classList.remove('on'); }); gl.classList.remove('open'); gl.hidden = true; PatModal.close(gl); lockOff(); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }

  /* ================= BASKETBALL STORY ================= */
  var bb = q('#bb'), bBuilt = false, bIO = null;
  var CH = [
    { yr: 'The team', big: '01', t: 'the sisterhood', p: ['Basketball gave me a second family. Teammates became sisters: the ones who celebrate your good days, carry you through the bad ones, and make early-morning trainings worth showing up for.'], cap: 'my girls', img: '' },
    { yr: 'The coaches', big: '02', t: 'the people who believed in me', p: ['My coaches saw more in me than i saw in myself. Their mentorship taught me how to take feedback, stay coachable and keep going when it got hard.'], cap: 'thank you, coach', img: '' },
    { yr: '2014 – 2022', big: '03', t: 'discipline, the quiet kind', p: ['From the Schools Colors Award (2014–2015) to representing Singapore at the ASEAN School Games (2017–2018), and later Temasek Polytechnic’s POL-ITE and IVP teams, the game asked for reps nobody sees and showing up anyway. That work ethic now follows me into everything i do.'], cap: 'reps nobody sees', img: '' },
    { yr: '2025', big: '04', t: 'winning together', p: ['In 2025 we finished as Women’s National Basketball League Division 1 champions. The trophy is nice, but the real win was the trust we built along the way.'], cap: 'champions ’25', img: 'assets/bb-champs.jpg' },
    { yr: '2022 – 2026', big: '05', t: 'passing it on', p: ['In 2022 i started Hoop Nation Basketball, a youth programme for players aged 6 to 16. As head coach i wanted every kid to feel what my teammates and coaches gave me: belonging, discipline, and someone in their corner.'], cap: 'hoop nation', img: '' }
  ];
  function frame(c, k) {
    var inner = c.img ? '<div class="im" style="background-image:url(' + c.img + ')"></div>' : '<div class="im"><img src="assets/ball.webp" alt=""></div>';
    return '<div class="bb-fr" style="--r:' + (k % 2 ? 3 : -3) + 'deg">' + inner + '<small>' + esc(c.cap) + '</small></div>';
  }
  function buildBB() {
    var chs = CH.map(function (c, k) {
      return '<section class="bb-ch" data-k="' + (k + 1) + '"><div class="bb-txt rv"><div class="bb-yr"><b>' + c.big + '</b>' + esc(c.yr) + '</div><h3>' + esc(c.t) + '</h3>' + c.p.map(function (x) { return '<p' + (c.soon ? ' class="soon"' : '') + '>' + esc(x) + '</p>'; }).join('') + '</div><div class="bb-pics rv">' + frame(c, k) + '</div></section>';
    }).join('');
    bb.innerHTML = '<div class="bb-prog" id="bbP"></div><div class="bb-num" id="bbN"></div><button class="ov-x" type="button" aria-label="Close story" id="bbX">×</button>' +
      '<header class="bb-hero"><div><div class="lab">off the court</div><h2>what basketball <em>taught me</em></h2><p>the sisterhood, the coaches and the habits that shaped how i work and how i coach.</p><button class="bb-ball" type="button" id="bbBall" aria-label="Spin the ball"><img src="assets/ball.webp" alt=""></button></div><div class="bb-down">scroll ↓</div></header>' + chs +
      '<section class="bb-vals"><div class="vl">what it gave me</div><div class="chips">' + ['teamwork', 'discipline', 'resilience', 'leadership', 'humility', 'showing up'].map(function (v) { return '<span>' + v + '</span>'; }).join('') + '</div></section>' +
      '<section class="bb-shot"><h3>one last shot?</h3><p>tap the button and see if it drops.</p><div class="bb-court" id="bbCourt"><svg viewBox="0 0 420 300" aria-hidden="true"><rect x="170" y="22" width="80" height="52" rx="3" fill="#fff" stroke="#9B3040" stroke-width="3"/><rect x="198" y="46" width="24" height="18" fill="none" stroke="#E27FA0" stroke-width="2"/><path d="M178 100 L242 100" stroke="#E2603B" stroke-width="5" stroke-linecap="round"/><path d="M180 102 L192 138 M196 102 L200 138 M210 102 L210 140 M224 102 L220 138 M240 102 L228 138 M186 120 L234 120" stroke="rgba(107,34,41,.5)" stroke-width="1.4" fill="none"/><path d="M60 290 H360" stroke="#d9aeb4" stroke-width="3"/></svg><div class="bb-b" id="bbB"></div></div><button class="bb-go" type="button" id="bbGo">take the shot</button><div class="bb-score" id="bbS" aria-live="polite">made 0 / 0</div></section>';
    q('#bbX').addEventListener('click', closeBB);
    q('#bbBall').addEventListener('click', function () { var b = this; b.classList.remove('spin'); void b.offsetWidth; b.classList.add('spin'); });
    var made = 0, tries = 0, busy = false;
    q('#bbGo').addEventListener('click', function () {
      if (busy) return; busy = true; var go = this; go.disabled = true; tries++;
      var ok = Math.random() < .65, ball = q('#bbB'), sx = 18, sy = 80;
      var kf = ok ? [{ left: sx + '%', top: sy + '%', easing: 'cubic-bezier(.3,.7,.4,1)' }, { left: '36%', top: '2%', offset: .5, easing: 'cubic-bezier(.6,0,.9,.6)' }, { left: '50%', top: '27%', offset: .8, easing: 'ease-in' }, { left: '50%', top: '68%' }]
        : [{ left: sx + '%', top: sy + '%', easing: 'cubic-bezier(.3,.7,.4,1)' }, { left: '36%', top: '2%', offset: .5, easing: 'cubic-bezier(.6,0,.9,.6)' }, { left: '58%', top: '27%', offset: .75, easing: 'ease-out' }, { left: '82%', top: '16%', offset: .85, easing: 'ease-in' }, { left: '92%', top: '80%' }];
      ball.style.left = sx + '%'; ball.style.top = sy + '%'; ball.style.bottom = 'auto';
      var an = ball.animate ? ball.animate(kf, { duration: reduce ? 10 : 1500, fill: 'forwards' }) : null;
      var fin = function () {
        if (ok) made++; q('#bbS').textContent = (ok ? 'swish! ' : 'rim out, again ') + '· made ' + made + ' / ' + tries;
        setTimeout(function () { if (an) an.cancel(); ball.style.left = '50%'; ball.style.top = ''; ball.style.bottom = '8px'; busy = false; go.disabled = false; }, 700);
      };
      if (an) an.onfinish = fin; else fin();
    });
    bb.addEventListener('scroll', function () { var h = bb.scrollHeight - bb.clientHeight; q('#bbP').style.width = (h > 0 ? bb.scrollTop / h * 100 : 0) + '%'; }, { passive: true });
    if ('IntersectionObserver' in window) {
      bIO = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); if (e.target.classList.contains('bb-txt')) { var n = q('#bbN'); n.textContent = 'chapter ' + e.target.parentNode.dataset.k + ' / ' + CH.length; n.classList.add('on'); } } }); }, { root: bb, threshold: .25 });
      qa('.rv', bb).forEach(function (el) { bIO.observe(el); });
    } else qa('.rv', bb).forEach(function (el) { el.classList.add('in'); });
    bBuilt = true;
  }
  function openBB() { lastFocus = document.activeElement; if (!bBuilt) buildBB(); bb.hidden = false; bb.classList.add('open'); bb.scrollTop = 0; lockOn(); PatModal.open(bb); q('#bbX').focus({ preventScroll: true }); }
  function closeBB() { bb.classList.remove('open'); bb.hidden = true; PatModal.close(bb); lockOff(); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }

  document.addEventListener('click', function (e) { var h = e.target.closest('[data-act]'); if (!h) return; if (h.dataset.act === 'globe') openGlobe(); else if (h.dataset.act === 'hoops') openBB(); });
  document.addEventListener('keydown', function (e) { if (e.key !== 'Escape') return; if (gl.classList.contains('open')) { var pf = q('#glForm'); if (pf && !pf.hidden) closeForm(); else closeGlobe(); } else if (bb.classList.contains('open')) closeBB(); });
})();
