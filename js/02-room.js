(function () {
  var q = function (s, r) { return (r || document).querySelector(s); };
  var qa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  /* ---------------- scene 3: Pat's room ---------------- */
  var room = q('#room');
  var mqP = window.matchMedia('(max-aspect-ratio: 1/1)');
  /* phone crop of the photo (room-mobile.jpg): x 740..1536, plus a 300px plain band above for the heading (1324 tall) */
  function P(x, y) { return [(x * 15.36 - 740) / 7.96, (y * 10.24 + 300) / 13.24]; }
  function placeRoom() {
    var m = mqP.matches;
    qa('#room [data-d]').forEach(function (el) {
      var d = (m && el.dataset.m ? el.dataset.m : el.dataset.d).split(',').map(Number), x, y, w, h;
      if (m) { var p = P(d[0], d[1]); x = p[0]; y = p[1]; w = d[2] * 15.36 / 7.96; h = d[3] != null ? d[3] * 10.24 / 13.24 : null; }
      else { x = d[0]; y = d[1]; w = d[2]; h = d[3]; }
      el.style.left = x + '%'; el.style.top = y + '%';
      if (w != null && !isNaN(w)) el.style.width = w + '%';
      if (h != null && !isNaN(h)) el.style.height = h + '%';
    });
  }
  var ROOMHS = [
    ['open desktop', 81.2, 44.5, null, 'lap', 'mac'],
    ['say hi', 71.6, 47.6, [71.6, 47.6, 6, 13], 'stand', 'contact'],
    ['places i\'ve been', 64.3, 45.6, [64.3, 46, 8.5, 15], null, 'globe'],
    ['leave a note', 53.7, 55, [53.7, 45, 10, 25], 'b2', 'notes'],
    ['off the court', 63, 89.3, [63, 89.3, 11, 17], null, 'hoops']
  ];
  ROOMHS.forEach(function (h) {
    var g = null;
    if (h[3]) { g = document.createElement('div'); g.className = 'ro rglow'; g.dataset.d = h[3].join(','); room.appendChild(g); }
    var b = document.createElement('button'); b.type = 'button'; b.className = 'hs ro'; b.dataset.d = h[1] + ',' + h[2]; b.setAttribute('aria-label', h[0]);
    if (h[5]) b.dataset.act = h[5];
    b.innerHTML = '<span>' + h[0] + '</span>'; room.appendChild(b);
    var t = h[4] ? room.querySelector('[data-o="' + h[4] + '"]') : null;
    function on() { if (g) g.classList.add('on'); if (t && (t.classList.contains('rstk') || t.classList.contains('lap'))) t.classList.add('on'); }
    function off() { if (g) g.classList.remove('on'); if (t) t.classList.remove('on'); }
    b.addEventListener('mouseenter', on); b.addEventListener('mouseleave', off); b.addEventListener('focus', on); b.addEventListener('blur', off);
  });
  placeRoom();
  placeRoom();
  if (mqP.addEventListener) mqP.addEventListener('change', placeRoom); else if (mqP.addListener) mqP.addListener(placeRoom);
})();
