(function () {
  var q = function (s, r) { return (r || document).querySelector(s); };
  var qa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var mx = q('#mx'), nt = q('#nt'), built = false, ntBuilt = false, app = 'finder', lastFocus = null;

  /* ---------- content ---------- */
  var TABS = [
    { id: 'li', title: 'Patricia Orenza | LinkedIn', url: 'https://www.linkedin.com/in/patricia-orenza/', show: 'linkedin.com/in/patricia-orenza', fav: 'in', col: '#6F8FB5', cta: 'Open on LinkedIn' },
    { id: 'ig', title: 'pat.orenza • Instagram', url: 'https://www.instagram.com/pat.orenza/', show: 'instagram.com/pat.orenza', fav: 'ig', col: 'linear-gradient(135deg,#F2A0B5,#B8456F)', cta: 'Open on Instagram' },
    { id: 'pf', title: 'Patricia Orenza | Portfolio', url: 'https://patriciaorenza.github.io/', show: 'patriciaorenza.github.io', fav: 'P', col: '#8E2F45', cta: 'Open my portfolio' },
    { id: 'gh', title: 'patriciaorenza on GitHub', url: 'https://github.com/patriciaorenza', show: 'github.com/patriciaorenza', fav: 'gh', col: '#3b2a2f', cta: 'Open on GitHub' }
  ];
  /* her real portfolio can be framed when this site lives on github.io; elsewhere (previews) show a faithful stand-in */
  var CAN_FRAME = /(^|\.)github\.io$/.test(location.hostname);
  var QUOTES = ['Small steps still count.', 'Be soft with yourself, then get back to it.', 'You don’t have to see the whole staircase.', 'Make it a little braver than yesterday.', 'Done is a good place to start.', 'Rest is part of the work.', 'Take the shot. Learn from the rebound.', 'Your pace is still a pace.', 'Dream big, work hard, stay kind.', 'Show up, even when it’s messy.'];
  var REM = ['10k steps', 'Journal', 'Drink water', 'Feed Luna', 'Keep going'];
  var MEMOJI = ['hello', 'wave', 'kiss', 'wink', 'heart', 'smile', 'thumb', 'think', 'fist'];

  function pageHTML(t) {
    if (t.id === 'li') return '<div class="shot-bg-li"><picture><source media="(max-width: 720px)" srcset="assets/li-m.webp"><img class="shot li" src="assets/li.webp" alt="Patricia Orenza on LinkedIn: profile, about, featured, activity, experience, education, certifications, volunteering and skills" draggable="false"></picture></div>';
    if (t.id === 'ig') return '<div class="shot-bg-ig"><picture><source media="(max-width: 720px)" srcset="assets/ig-m.webp"><img class="shot ig" src="assets/ig.webp" alt="pat.orenza on Instagram: profile, highlights and photo grid" draggable="false"></picture></div>';
    if (t.id === 'pf') {
      if (CAN_FRAME) return '<iframe class="ch-frame" src="' + t.url + '" title="Patricia Orenza portfolio" loading="lazy" referrerpolicy="no-referrer"></iframe>';
      return '<div class="pf"><div class="nav"><span>About</span><span>Projects</span><span>Experience</span><span>Coaching</span><span>Contact</span></div><h2>Patricia Orenza</h2><p class="tag">Turning data patterns into business insights and decisions.</p>' +
        '<h4>Projects</h4><div class="projs">' +
        '<div><span>Completed</span><b>VAFPQR · Secure QR Code Development</b><p>A secure QR authentication system built for a live client. 26 of 27 test cases passed.</p></div>' +
        '<div><span>Completed</span><b>Airbnb Data Warehouse &amp; BI Analysis</b><p>Star-schema warehouse of Australian Airbnb listings in Python, PostgreSQL and Power BI.</p></div>' +
        '<div><span>In progress</span><b>HawkerAI · Demand Forecasting</b><p>A hackathon project to forecast menu-item demand and reduce food waste.</p></div>' +
        '<div><span>In progress</span><b>Spotify Listening Analytics</b><p>A product-analytics case study on my own streaming history.</p></div></div></div>';
    }
    var oct = '<svg viewBox="0 0 16 16" width="32" height="32" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
    var repo = function (n, l, d, c) { return '<div class="repo"><div class="rt"><a href="https://github.com/patriciaorenza/' + n + '" target="_blank" rel="noopener">' + n + '</a><i>Public</i></div>' + (d ? '<p class="rd">' + d + '</p>' : '') + (l ? '<p class="rl" style="--c:' + c + '">' + l + '</p>' : '') + '</div>'; };
    return '<div class="gh2"><div class="ghb"><span class="hb" aria-hidden="true"><i></i><i></i><i></i></span>' + oct + '<b>patriciaorenza</b></div>' +
      '<div class="ght"><span class="on">Overview</span><span>Repositories <em>5</em></span><span>Projects</span><span>Packages</span><span>Stars <em>3</em></span></div>' +
      '<div class="ghm"><aside><img src="assets/gh-avatar.webp" alt="" width="200" height="200"><div class="un">patriciaorenza</div><div class="eb">Edit profile</div><p class="fo"><b>4</b> followers · <b>5</b> following</p></aside>' +
      '<main><div class="rd-card"><div class="rpath">patriciaorenza / README.md</div><h2>Hi, I’m Patricia 👋</h2><div class="bd"><a href="https://www.linkedin.com/in/patricia-orenza/" target="_blank" rel="noopener" style="background:#0A66C2">LinkedIn</a><a href="https://patriciaorenza.github.io/" target="_blank" rel="noopener" style="background:#12312B">Portfolio</a><a href="mailto:patorenza.work@gmail.com" style="background:#D44638">Email</a></div>' +
      '<p>Aspiring Business Analyst sitting at the intersection of business and technology. I’m passionate about working with data and turning it into actionable insights that support smarter decisions. I ask the questions that uncover what’s really driving a problem, then work to translate those insights into process improvements and solutions that help businesses achieve their goals.</p>' +
      '<p>Off-screen, I was a founder and head coach of <b>Hoop Nation</b>, a youth basketball program I ran from 2022–2026. Coaching and business analysis turn out to have more in common than people expect: both are about reading a situation properly before you decide what to do next.</p>' +
      '<h3>What I work with</h3><p class="tools"><code>SQL</code><code>Python</code><code>Power BI</code><code>IBM SPSS Modeler</code><code>Google Analytics</code><code>Figma</code></p><p><b>Also comfortable with:</b> business requirements analysis, business process modeling, market research, UI/UX design</p>' +
      '<h3>Featured project</h3><p><a href="https://github.com/patriciaorenza/VAFPQR-Secure-QR-Code-System" target="_blank" rel="noopener">VAFPQR — Secure QR Code Authentication System</a> A live-client project (ICT302, Murdoch University) building a JWT-based secure QR platform — web dashboard, mobile app, and backend. I was the Project Manager &amp; Business Analyst across a 6-person team, and also designed the UI/UX prototype in Figma. 26 of 27 formal test cases passed.</p>' +
      '<h3>Background</h3><ul><li>🎓 Bachelor of Information Technology (Business Information Systems), Murdoch University — 2023–2026</li><li>📊 Interned in digital strategy &amp; performance marketing at <b>Performics (Publicis Groupe)</b> and <b>StratAgile</b></li><li>🏀 Former Singapore national basketball representative (ASEAN School Games, 2017–2018)</li><li>🏆 Singapore Schools Sports Council Colors Award recipient (2014–2015)</li></ul></div>' +
      '<div class="pop"><h4>Popular repositories</h4><div class="repos">' + repo('patriciaorenza.github.io', 'HTML', '', '#e34c26') + repo('VAFPQR-Secure-QR-Code-System', '', '', '') + repo('patriciaorenza', '', '', '') + repo('Airbnb-Data-Warehouse-BI-Analysis', 'Jupyter Notebook', 'Star-schema data warehouse for Australian Airbnb listings: Python ETL, PostgreSQL, and a Power BI analysis of tourism spending vs estimated sales.', '#DA5B0B') + '</div>' +
      '<img class="grf" src="assets/gh-graph.webp" alt="GitHub contribution graph: 50 contributions in the last year" loading="lazy"></div></main></div></div>';
  }

  /* ---------- icons ---------- */
  var S = function (inner) { return '<svg viewBox="0 0 64 64" aria-hidden="true">' + inner + '</svg>'; };
  var petals = ''; for (var i = 0; i < 8; i++) petals += '<ellipse cx="0" cy="-13" rx="8" ry="12" transform="rotate(' + (i * 45) + ')" fill="#fff" opacity="' + (i % 2 ? .6 : .85) + '"/>';
  var DOCK = [
    { id: 'finder', n: 'Finder', g: 'linear-gradient(135deg,#F7B3C4,#D9668A)', s: S('<path d="M32 8v20" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="23" cy="26" r="3.2" fill="#fff"/><circle cx="41" cy="26" r="3.2" fill="#fff"/><path d="M19 41q13 11 26 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>') },
    { id: 'safari', n: 'Safari', g: 'linear-gradient(135deg,#F29BB5,#B8456F)', s: S('<circle cx="32" cy="32" r="22" fill="none" stroke="#fff" stroke-width="3.5"/><path d="M42 22L35 35 22 42 29 29z" fill="#fff"/>') },
    { id: 'messages', n: 'Messages', g: 'linear-gradient(135deg,#F5A3B7,#CC5C85)', s: S('<path d="M32 12c13 0 22 7.5 22 17S45 46 32 46c-2.5 0-5-.3-7-.9L15 50l3-8c-5-3-8-7-8-13 0-9.500 9-17 22-17z" fill="#fff"/>') },
    { id: 'chrome', n: 'Google Chrome', g: 'linear-gradient(135deg,#E88AA6,#9B3040)', s: S('<circle cx="32" cy="32" r="24" fill="none" stroke="#fff" stroke-width="3.5"/><circle cx="32" cy="32" r="9.500" fill="#fff"/><path d="M39.800 27.500L53.500 19.500M32 41.500V58M24.200 27.500L10.500 19.500" stroke="#fff" stroke-width="3.5"/>'), b: 1 },
    { id: 'photos', n: 'Photos', g: 'linear-gradient(135deg,#F9C1CD,#D96F92)', s: S('<g transform="translate(32 32)">' + petals + '</g>'), b: 1 },
    { id: 'calendar', n: 'Calendar', cal: 1 },
    { id: 'music', n: 'Music', g: 'linear-gradient(135deg,#F08AA5,#C23E6E)', s: S('<path d="M26 44V18l24-6v26" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="21" cy="46" r="6" fill="#fff"/><circle cx="45" cy="40" r="6" fill="#fff"/>') },
    { id: 'podcasts', n: 'Podcasts', g: 'linear-gradient(135deg,#C98BB0,#8E3A6E)', s: S('<circle cx="32" cy="28" r="6" fill="#fff"/><path d="M32 36v18" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M20 28a12 12 0 0 1 24 0M14 28a18 18 0 0 1 36 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>') },
    'sep',
    { id: 'trash', n: 'Trash', g: 'linear-gradient(135deg,rgba(255,255,255,.35),rgba(255,255,255,.12))', s: S('<path d="M18 20h28l-3 34H21z" fill="none" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"/><path d="M14 20h36M26 20v-6h12v6" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>') }
  ];
  var APPLE = '<svg width="14" height="16" viewBox="0 0 24 28" aria-hidden="true"><path d="M17 1c0 3-2.500 5.500-5.500 5.500C11.500 3.500 14 1 17 1zM12 8c2 0 3 1.200 5 1.200 2 0 3.500-1.200 5-1.200-1 1-3 2.500-3 5.500 0 4 3.500 5 3.500 5-1 3.500-4 8.500-7 8.500-1.500 0-2.500-1-4.500-1S9 27.500 7.500 27.500C4 27.500 0 20 0 15 0 10 4 8 7 8c2 0 3 1 5 0z" fill="currentColor"/></svg>';
  var SYS = '<svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><path d="M1 4.500a10 10 0 0 1 14 0M3.500 7a6.500 6.500 0 0 1 9 0M6 9.500a3 3 0 0 1 4 0" fill="none" stroke="currentColor" stroke-width="1.500" stroke-linecap="round"/></svg><svg width="24" height="12" viewBox="0 0 24 12" aria-hidden="true"><rect x=".5" y=".5" width="20" height="11" rx="3" fill="none" stroke="currentColor"/><rect x="2" y="2" width="14" height="8" rx="1.500" fill="currentColor"/><rect x="21.500" y="4" width="2" height="4" rx="1" fill="currentColor"/></svg>';
  /* FREELANCE WORK: add real projects here. t = title, r = what I did, d = one-line result, img = image path, url = link (optional) */
  var FL = [
    { t: 'Project 01', r: 'Brand · Role', d: 'Case study coming soon.', img: '', url: '' },
    { t: 'Project 02', r: 'Brand · Role', d: 'Case study coming soon.', img: '', url: '' },
    { t: 'Project 03', r: 'Brand · Role', d: 'Case study coming soon.', img: '', url: '' }
  ];
  var FLSVG = '<svg viewBox="0 0 64 52"><path d="M4 10q0-6 6-6h14l6 6h24q6 0 6 6v26q0 6-6 6H10q-6 0-6-6z" fill="#E7708F"/><path d="M4 18h56v24q0 6-6 6H10q-6 0-6-6z" fill="#F7A3BA"/><path d="M32 25l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" fill="#fff"/></svg>';
  var MENUS = { finder: ['File', 'Edit', 'View', 'Go', 'Window', 'Help'], freelance: ['File', 'Edit', 'View', 'Go', 'Window', 'Help'], chrome: ['File', 'Edit', 'View', 'History', 'Bookmarks', 'Window'], photos: ['File', 'Edit', 'Image', 'View', 'Window', 'Help'] };
  var NAMES = { finder: 'Finder', freelance: 'Finder', chrome: 'Google Chrome', photos: 'Photos' };

  /* ---------- build ---------- */
  function build() {
    var w = '<div class="mx-wall"></div>' +
      '<div class="mx-bar">' + APPLE + '<b id="mxApp">Finder</b><div class="menus" id="mxMenus"></div><div class="sys">' + SYS + '<span id="mxClock"></span></div></div>' +
      '<button class="mx-back" id="mxBack" type="button" aria-label="Back"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.500" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<div class="mx-desk">' +
      '<div class="mx-quote" aria-hidden="true"><svg viewBox="0 0 720 200"><defs><path id="mxcurve" d="M60 120Q200 50 360 92T660 70"/></defs><text font-family="Newsreader, Georgia, serif" font-weight="600" font-size="62" fill="#E27FA0" text-anchor="middle"><textPath href="#mxcurve" startOffset="50%">dream big work hard</textPath></text><g fill="none" stroke="#B8707A" stroke-width="2"><path d="M24 118c-8-16-28-4 0 18 28-22 8-34 0-18z"/><path d="M700 62c-8-16-28-4 0 18 28-22 8-34 0-18z"/></g></svg></div>' +
      '<div class="mx-wgs" id="mxWgs"></div>' +
      '<button class="mx-fl" id="mxFl" type="button" aria-label="Open Freelance work folder"><span class="fic">' + FLSVG + '<span class="shn" style="--fm:url(&quot;data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 52%27%3E%3Cpath d=%27M4 10q0-6 6-6h14l6 6h24q6 0 6 6v26q0 6-6 6H10q-6 0-6-6z%27/%3E%3C/svg%3E&quot;)"></span></span><span class="lb">Freelance work</span></button>' +
      '<div class="mx-fold" aria-hidden="true">' + ['Projects', 'Coaching', 'Travel'].map(function (n) { return '<div><svg viewBox="0 0 64 52"><path d="M4 10q0-6 6-6h14l6 6h24q6 0 6 6v26q0 6-6 6H10q-6 0-6-6z" fill="#F29BB5"/><path d="M4 18h56v24q0 6-6 6H10q-6 0-6-6z" fill="#F7B3C4"/></svg>' + n + '</div>'; }).join('') + '</div>' +
      chromeHTML() + photosHTML() + flHTML() + '<div class="mx-dock" id="mxDock"></div></div>';
    mx.innerHTML = w;
    // widgets
    q('#mxWgs').innerHTML =
      '<div class="wg w1" id="wgTime"><h4 id="wgDay"></h4><div class="big" id="wgClock"></div><div class="small" id="wgZone" style="margin-top:6px"></div></div>' +
      '<div class="wg w2"><h4>Reminders</h4><ul>' + REM.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ul></div>' +
      '<div class="wg trip w3"><h4 style="color:#FFD3DE">Next trip</h4><div class="big">SIN → ?</div><div class="small" style="margin-top:6px">somewhere new, soon</div></div>' +
      '<div class="wg q w4"><h4><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.500" fill="none" stroke="currentColor" stroke-width="1.800"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke="currentColor" stroke-width="1.800" stroke-linecap="round"/></svg>Quote of the day</h4><p id="wgQuote"></p></div>';
    // dock
    q('#mxDock').innerHTML = DOCK.map(function (d) {
      if (d === 'sep') return '<div class="sep"></div>';
      var ic = d.cal ? '<span class="ic" style="background:#fff;color:#C23E6E;flex-direction:column;display:flex;align-items:center;justify-content:center;line-height:1"><small id="calM" style="font:700 9px/1 var(--font-body);letter-spacing:.06em"></small><b id="calD" style="font:500 24px/1 var(--font-display);color:#3A1A22"></b></span>' : '<span class="ic" style="background:' + d.g + '">' + d.s + '</span>';
      return '<button type="button" data-app="' + d.id + '" aria-label="' + d.n + '">' + ic + '<span class="tip">' + d.n + '</span></button>';
    }).join('');
    q('#mxDock').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-app]'); if (!b) return;
      var id = b.dataset.app;
      if (id === 'chrome' || id === 'photos') openApp(id); else if (id === 'finder') closeApp();
    });
    q('#mxBack').addEventListener('click', back); q('#mxFl').addEventListener('click', function () { openApp('freelance'); });
    qa('.mx-tl.r', mx).forEach(function (b) { b.addEventListener('click', closeApp); });
    qa('.ch-tab', mx).forEach(function (b) { b.addEventListener('click', function () { selectTab(b.dataset.tab); }); });
    built = true; selectTab('li'); tick(); refreshDock();
  }
  function chromeHTML() {
    var tabs = TABS.map(function (t, i) { return '<button class="ch-tab" role="tab" type="button" data-tab="' + t.id + '" aria-selected="' + (i === 0) + '"><span class="ch-fav" style="background:' + t.col + '">' + t.fav + '</span><span class="t">' + esc(t.title) + '</span></button>'; }).join('');
    var pages = TABS.map(function (t) { return '<div class="ch-page" data-page="' + t.id + '">' + pageHTML(t) + '</div>'; }).join('');
    var ar = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; };
    return '<div class="mx-win" id="wChrome" role="dialog" aria-label="Google Chrome"><div class="mx-tbar"><button class="mx-tl r" type="button" aria-label="Close Google Chrome"></button><span class="mx-tl y"></span><span class="mx-tl g"></span><div class="ch-tabs" role="tablist">' + tabs + '</div></div>' +
      '<div class="ch-bar">' + ar('M15 5l-7 7 7 7') + ar('M9 5l7 7-7 7') + ar('M20 12a8 8 0 1 1-2.500-5.800M20 4v5h-5') + '<div class="ch-url"><svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg><span id="chUrl"></span></div><a class="ch-open" id="chOpen" href="#" target="_blank" rel="noopener">open ↗</a></div>' +
      '<div class="ch-view" id="chView">' + pages + '</div><a class="ch-fab" id="chFab" href="#" target="_blank" rel="noopener"></a></div>';
  }
  function flHTML() {
    var cards = FL.map(function (c) {
      var th = c.img ? '<div class="th" style="background-image:url(' + esc(c.img) + ')"></div>' : '<div class="th">coming soon</div>';
      var inner = th + '<div class="tx"><b>' + esc(c.t) + '</b><small>' + esc(c.r) + '</small><p>' + esc(c.d) + '</p></div>';
      return c.url ? '<a class="fl-card" href="' + esc(c.url) + '" target="_blank" rel="noopener">' + inner + '</a>' : '<div class="fl-card">' + inner + '</div>';
    }).join('');
    return '<div class="mx-win" id="wFl" role="dialog" aria-label="Freelance work"><div class="mx-tbar"><button class="mx-tl r" type="button" aria-label="Close Freelance work"></button><span class="mx-tl y"></span><span class="mx-tl g"></span><b style="margin-left:10px;font:600 13px var(--font-body);color:#5A2634">Freelance work</b></div><div class="fl-main"><h3>Freelance work</h3><p class="sub">A few things I’ve made for brands as a freelance marketer.</p><div class="fl-grid">' + cards + '</div></div></div>';
  }
  function photosHTML() {
    return '<div class="mx-win" id="wPhotos" role="dialog" aria-label="Photos"><div class="mx-tbar"><button class="mx-tl r" type="button" aria-label="Close Photos"></button><span class="mx-tl y"></span><span class="mx-tl g"></span></div>' +
      '<div style="display:flex;flex:1;min-height:0"><div class="ph-side"><h5>Photos</h5><div class="on">Library</div><div>Memories</div><div>People &amp; Pets</div><h5>Albums</h5><div>Favorites</div><div>Recents</div></div>' +
      '<div class="ph-main"><div class="ph-tools"><span>Years</span><span>Months</span><span>Days</span><span class="on">All Photos</span></div><div class="ph-empty"><div>No photos yet<small>Photos will show up here soon.</small></div></div></div></div></div>';
  }
  function selectTab(id) {
    var t = TABS.filter(function (x) { return x.id === id; })[0];
    qa('.ch-tab', mx).forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === id)); });
    qa('.ch-page', mx).forEach(function (p) { p.classList.toggle('on', p.dataset.page === id); });
    q('#chUrl').textContent = t.show; var a = q('#chOpen'); a.href = t.url; var f = q('#chFab'); f.href = t.url; f.textContent = t.cta + ' ↗'; var v = q('#chView'); v.scrollTop = 0; v.scrollLeft = 0; v.classList.toggle('fr', id === 'pf' && CAN_FRAME);
  }
  function refreshDock() {
    qa('#mxDock button[data-app]').forEach(function (b) {
      var id = b.dataset.app, running = (id === app) && id !== 'finder';
      b.classList.toggle('run', running || id === 'finder');
      b.classList.toggle('bounce', (id === 'chrome' || id === 'photos') && app !== id);
    });
    q('#mxApp').textContent = NAMES[app];
    q('#mxMenus').innerHTML = MENUS[app].map(function (m) { return '<span>' + m + '</span>'; }).join('');
    q('#wChrome').classList.toggle('open', app === 'chrome');
    q('#wPhotos').classList.toggle('open', app === 'photos');
    q('#wFl').classList.toggle('open', app === 'freelance');
  }
  function openApp(id) { app = id; refreshDock(); }
  function closeApp() { app = 'finder'; refreshDock(); }
  function back() { if (app !== 'finder') closeApp(); else closeMac(); }
  function openMac() {
    lastFocus = document.activeElement; if (!built) build();
    app = 'finder'; refreshDock(); tick();
    mx.hidden = false; mx.classList.add('open'); document.body.classList.add('lock'); PatModal.open(mx);
    var b = q('#mxBack'); if (b) b.focus({ preventScroll: true });
  }
  function closeMac() {
    mx.classList.remove('open'); mx.hidden = true; document.body.classList.remove('lock'); PatModal.close(mx);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function tick() {
    if (!built) return;
    var d = new Date();
    q('#mxClock').textContent = d.toLocaleDateString('en-GB', { weekday: 'short' }) + ' ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    q('#wgDay').textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    q('#wgClock').textContent = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    var z = ''; try { z = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace(/_/g, ' '); } catch (e) {}
    q('#wgZone').textContent = z;
    q('#calM').textContent = d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(); q('#calD').textContent = d.getDate();
    var doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
    q('#wgQuote').textContent = QUOTES[doy % QUOTES.length];
  }
  setInterval(tick, 20000);

  /* ---------- post-it wall ---------- */
  var NK = 'patsRoomNotes.v1', CK = 'patsRoomContacts.v1';
  var COLS = ['#F8D9D6', '#F1B8BB', '#FBEFD9', '#E6B9C6', '#F6CDAE'];

  /* ---- online storage (Supabase). Paste your Project URL and publishable key between the quotes. ---- */
  var SB = { url: 'https://rhswuqkpkspcbtrdlynf.supabase.co', key: 'sb_publishable_SdVZC9RHpp3U7y9U60CnGw_Nq6KWJQ3' };
  var sbOn = function () { return !!(SB.url && SB.key); };
  function sbFetch(path, opts) {
    opts = opts || {};
    return fetch(SB.url.replace(/\/$/, '') + '/rest/v1/' + path, { method: opts.method || 'GET', headers: { apikey: SB.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: opts.body ? JSON.stringify(opts.body) : undefined }).then(function (r) {
      if (r.ok) return opts.json ? r.json() : null;
      // P0001 = a friendly message raised by our own database guard (rate limit, paused); show it as-is
      return r.json().catch(function () { return {}; }).then(function (b) { var er = new Error('sb ' + r.status); er.friendly = b && b.code === 'P0001' && b.message ? b.message : ''; throw er; });
    });
  }
  var remote = [];
  function hashR(id) { var h = 0; id = String(id || ''); for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0; return ((Math.abs(h) % 61) - 30) / 10; }
  function pullNotes() {
    if (!sbOn()) return;
    sbFetch('notes?select=id,created_at,note,name,color&order=created_at.desc&limit=60', { json: true }).then(function (rows) {
      remote = (rows || []).map(function (x) { return { t: x.note, n: x.name || 'anon', c: x.color || 0, r: hashR(x.id) }; });
      renderPits(); if (nt.classList.contains('open')) renderWall();
    }).catch(function () {});
  }
  function blanks(n) { var a = []; for (var i = 0; i < n; i++) a.push({ t: '', n: '', c: [0, 2, 3, 1, 4][i % 5], r: [-3, 2, -2, 3, -1][i % 5], b: 1 }); return a; }
  function loadNotes() {
    var a = []; try { var s = JSON.parse(localStorage.getItem(NK)); if (Array.isArray(s)) a = s; } catch (e) {}
    var all = sbOn() ? remote.slice() : a;
    return all.concat(blanks(Math.max(0, 5 - all.length)));
  }
  /* resolves only once the note is really saved; rejects (with .friendly when the database explains why) otherwise */
  function saveUser(n) {
    if (sbOn()) return sbFetch('notes', { method: 'POST', body: { note: n.t, name: n.n === 'anon' ? null : n.n, color: n.c } }).then(function () { remote.unshift(n); });
    var a = []; try { var s = JSON.parse(localStorage.getItem(NK)); if (Array.isArray(s)) a = s; } catch (e) {}
    a.unshift(n); try { localStorage.setItem(NK, JSON.stringify(a.slice(0, 200))); } catch (e) {}
    return Promise.resolve();
  }

  /* ---------- keep the wall kind: simple word filter (the database double-checks the same list) ---------- */
  var BAD_C = ["fuck", "bitch", "asshole", "motherf", "whore", "dickhead", "putangina", "pakyu", "pukimak", "cheebai", "chibai", "lanjiao", "killyourself", "killyourself"], BAD_W = ["ass", "dick", "cock", "cum", "tits", "slut", "sluts", "slutty", "pussy", "cunt", "cunts", "shit", "shitty", "bastard", "wanker", "twat", "nigga", "niggas", "nigger", "niggers", "fag", "fags", "faggot", "faggots", "retard", "retarded", "rape", "porn", "nsfw", "kys", "ccb", "knn", "cb", "tangina", "gago", "puta", "ulol", "tarantado", "bwisit", "pantek", "sial", "babi"];
  var LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i' };
  var collapse = function (x) { return x.replace(/(.)\1+/g, '$1'); };
  var BAD_CC = BAD_C.map(collapse);
  function isRude(text) {
    var t = String(text || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[0134578@$!]/g, function (c) { return LEET[c]; });
    if (/(https?:\/\/|www\.|\.com\b|\.sg\b|\.net\b)/.test(String(text || '').toLowerCase())) return true;
    var words = ' ' + t.replace(/[^a-z]+/g, ' ').trim() + ' ';
    for (var i = 0; i < BAD_W.length; i++) if (words.indexOf(' ' + BAD_W[i] + ' ') > -1) return true;
    var c = collapse(t.replace(/[^a-z]/g, ''));
    for (var j = 0; j < BAD_CC.length; j++) if (c.indexOf(BAD_CC[j]) > -1) return true;
    return false;
  }
  function renderPits() {
    var box = q('#pits'); if (!box) return;
    box.innerHTML = loadNotes().slice(0, 5).map(function (n) { return '<div class="pit" style="background:' + COLS[n.c % COLS.length] + ';--r:' + (n.r || 0) + 'deg">' + esc(n.t.length > 34 ? n.t.slice(0, 32) + '…' : n.t) + '</div>'; }).join('');
  }
  function renderWall() {
    q('#ntGrid').innerHTML = loadNotes().map(function (n) { return '<div class="note-p' + (n.b ? ' blank' : '') + '" style="background:' + COLS[n.c % COLS.length] + ';--r:' + (n.r || 0) + 'deg"><span>' + esc(n.t) + '</span><small>' + esc(n.b ? '' : (n.n || 'anon')) + '</small></div>'; }).join('');
  }
  function buildNotes() {
    nt.innerHTML = '<div class="nt-box"><button class="nt-x" type="button" aria-label="Close">×</button>' +
      '<form class="nt-form" id="ntForm" autocomplete="off"><h3>leave something</h3><p>a hello, a compliment, a question, a song to listen to. stick a little note on my wall.</p>' +
      '<label for="ntText" style="position:absolute;left:-9999px">Your note</label><textarea id="ntText" maxlength="280" placeholder="write something…" required></textarea><div class="nt-meta"><span id="ntCount">0/280</span></div>' +
      '<label for="ntName" style="position:absolute;left:-9999px">Your name</label><input type="text" id="ntName" maxlength="24" placeholder="your name (optional)">' +
      '<div class="nt-cols" role="radiogroup" aria-label="Note colour">' + COLS.map(function (c, i) { return '<label style="background:' + c + '"><input type="radio" name="ntc" value="' + i + '"' + (i === 0 ? ' checked' : '') + ' aria-label="Colour ' + (i + 1) + '"></label>'; }).join('') + '</div>' +
      '<button class="nt-go" type="submit" id="ntGo">stick it on the wall</button><div class="nt-kind" id="ntMsg" aria-live="polite">keep it kind :) only your note and name are shown.</div></form>' +
      '<div class="nt-spine" aria-hidden="true"></div><div class="nt-wall"><h3>the wall</h3><div class="nt-grid" id="ntGrid"></div></div></div>';
    q('.nt-x', nt).addEventListener('click', closeNotes);
    nt.addEventListener('click', function (e) { if (e.target === nt) closeNotes(); });
    q('#ntText').addEventListener('input', function () { q('#ntCount').textContent = this.value.length + '/280'; });
    q('#ntForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var t = q('#ntText').value.trim(); if (!t) { q('#ntText').focus(); return; }
      if (isRude(t) || isRude(q('#ntName').value)) { q('#ntMsg').textContent = 'let’s keep the wall kind :) no rude words or links, please. try rephrasing.'; return; }
      var c = +(q('input[name=ntc]:checked', nt) || { value: 0 }).value;
      var go = q('#ntGo'), msg = q('#ntMsg');
      go.disabled = true; msg.textContent = 'sticking it on…';
      saveUser({ t: t.slice(0, 280), n: (q('#ntName').value.trim() || 'anon').slice(0, 24), c: c, r: Math.round((Math.random() * 6 - 3) * 10) / 10 }).then(function () {
        q('#ntText').value = ''; q('#ntCount').textContent = '0/280'; renderWall(); renderPits();
        msg.textContent = 'stuck it on the wall :)'; setTimeout(function () { msg.textContent = 'keep it kind :) only your note and name are shown.'; }, 2600);
        q('#ntGrid').parentNode.scrollTop = 0;
      }, function (er) {
        // keep what they wrote so they can try again
        msg.textContent = (er && er.friendly) || 'couldn’t stick that on just now. check your connection and try again.';
      }).then(function () { go.disabled = false; });
    });
    ntBuilt = true;
  }
  function openNotes() {
    lastFocus = document.activeElement; if (!ntBuilt) buildNotes(); renderWall();
    nt.hidden = false; nt.classList.add('open'); document.body.classList.add('lock'); PatModal.open(nt); q('#ntText').focus({ preventScroll: true });
  }
  function closeNotes() {
    nt.classList.remove('open'); nt.hidden = true; PatModal.close(nt); if (!mx.classList.contains('open')) document.body.classList.remove('lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- phone: leave name + email ---------- */
  var ct = q('#ct'), ctBuilt = false;
  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
  function buildContact() {
    ct.innerHTML = '<div class="ct-ph"><div class="ct-isl"></div><button class="ct-x" type="button" aria-label="Close">×</button>' +
      '<div class="ct-st"><span id="ctTime"></span><span aria-hidden="true">●●● 5G</span></div>' +
      '<div class="ct-hd"><button class="bk" type="button" id="ctBk">‹ Back</button><div class="who"><img src="assets/memoji-hello.webp" alt=""><b>Pat</b><small>iMessage</small></div><span></span></div>' +
      '<form id="ctForm" novalidate style="display:flex;flex-direction:column;flex:1;min-height:0"><div class="ct-body" id="ctBody"><div class="ct-ts" id="ctTs"></div>' +
      '<div class="ct-b in">hi!! you found my phone 🩷</div>' +
      '<div class="ct-b in">drop your name, a message and your email, and i’ll get back to you when i can. i read every single one myself.</div>' +
      '<div class="ct-b out" id="ctN"><label for="ctName">Name</label><input id="ctName" type="text" maxlength="60" placeholder="your name…" autocomplete="name" required></div>' +
      '<div class="ct-b out" id="ctM"><label for="ctText">Message (optional)</label><textarea id="ctText" rows="3" maxlength="1000" placeholder="say hi, ask me anything…"></textarea></div><div class="ct-b out" id="ctE"><label for="ctEmail">Email (optional)</label><input id="ctEmail" type="email" inputmode="email" maxlength="254" placeholder="your email (optional)…" autocomplete="email"></div><div class="ct-note">optional. just so we can stay in touch and connect. never shown, never shared.</div>' +
      '<div id="ctMsg" aria-live="polite" style="display:flex;flex-direction:column;gap:8px"></div></div>' +
      '<div class="ct-in"><span class="plus" aria-hidden="true">+</span><div class="pill"><span>iMessage</span><button type="submit" id="ctGo" aria-label="Send">↑</button></div></div></form><div class="ct-home"></div></div>';
    q('.ct-x', ct).addEventListener('click', closeContact); q('#ctBk').addEventListener('click', closeContact);
    ct.addEventListener('click', function (e) { if (e.target === ct) closeContact(); });
    q('#ctForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = q('#ctName').value.trim(), email = q('#ctEmail').value.trim(), text = q('#ctText').value.trim(), msg = q('#ctMsg'), err = '';
      if (!name) err = 'oops, what should i call you?';
      else if (email && (!EMAIL_RE.test(email) || email.length > 254)) err = 'hmm, that email doesn’t look right. try something like name@example.com, or leave it blank.';
      if (err) { msg.innerHTML = '<div class="ct-b err" role="alert">' + esc(err) + '</div>'; q(!name ? '#ctName' : '#ctEmail').focus(); q('#ctBody').scrollTop = 1e5; return; }
      var go = q('#ctGo'); go.disabled = true;
      var rec = { name: name.slice(0, 60), email: email || '', text: text.slice(0, 1000), at: new Date().toISOString() };
      var done = function () {
        q('#ctN').hidden = true; q('#ctE').hidden = true; q('#ctM').hidden = true; var nn = q('.ct-note', ct); if (nn) nn.hidden = true;
        msg.innerHTML = '<div class="ct-b out sent">' + esc(rec.name) + (rec.email ? '<br>' + esc(rec.email) : '') + '</div>' + (rec.text ? '<div class="ct-b out sent">' + esc(rec.text) + '</div>' : '') + '<div class="ct-b in">' + (rec.email ? 'got it, thank you!! talk soon 🩷' : 'hi ' + esc(rec.name) + '!! thanks for stopping by 🩷') + '</div>';
        q('#ctBody').scrollTop = 1e5;
      };
      var keep = function () { var a = []; try { a = JSON.parse(localStorage.getItem(CK)) || []; } catch (x) {} a.push(rec); try { localStorage.setItem(CK, JSON.stringify(a.slice(-50))); } catch (x) {} };
      if (sbOn()) sbFetch('contacts', { method: 'POST', body: { name: rec.name, email: rec.email || null, message: rec.text || null } }).then(done, function (er) { go.disabled = false; msg.innerHTML = '<div class="ct-b err" role="alert">' + esc((er && er.friendly) || 'couldn’t send that just now. check your connection and try again.') + '</div>'; });
      else { keep(); done(); }
    });
    ctBuilt = true;
  }
  function openContact() {
    lastFocus = document.activeElement; if (!ctBuilt) buildContact();
    var d = new Date(); q('#ctTime').textContent = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); q('#ctTs').textContent = 'Today ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    ct.hidden = false; ct.classList.add('open'); document.body.classList.add('lock'); PatModal.open(ct); q('#ctName').focus({ preventScroll: true });
  }
  function closeContact() {
    ct.classList.remove('open'); ct.hidden = true; PatModal.close(ct); if (!mx.classList.contains('open') && !nt.classList.contains('open')) document.body.classList.remove('lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- wiring ---------- */
  renderPits(); pullNotes();
  document.addEventListener('click', function (e) {
    var h = e.target.closest('[data-act]'); if (h) { if (h.dataset.act === 'mac') openMac(); else if (h.dataset.act === 'notes') openNotes(); else if (h.dataset.act === 'contact') openContact(); return; }
    if (e.target.closest('img.stand')) { openContact(); return; }
    if (e.target.closest('#lid')) { openMac(); return; }
    if (e.target.closest('.rframe[data-o="b2"]')) openNotes();
  });
  var lid = q('#lid'), lap = q('.lap');
  if (lid && lap) { lid.addEventListener('mouseenter', function () { lap.classList.add('on'); }); lid.addEventListener('mouseleave', function () { lap.classList.remove('on'); }); }
  var b2 = q('.rframe[data-o="b2"]'); if (b2) b2.style.cursor = 'pointer'; var stn = q('img.stand'); if (stn) stn.style.cursor = 'pointer';
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (ct.classList.contains('open')) closeContact(); else if (nt.classList.contains('open')) closeNotes(); else if (mx.classList.contains('open')) back();
  });
})();
