(function () {
  var q = function (s) { return document.querySelector(s); }, qa = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = !reduce && window.gsap && window.ScrollTrigger;
  function onView(el, fn, th) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); fn(); } }, { threshold: th || .15 });
    o.observe(el);
  }
  /* menu + progress */
  var bu = q('#nBurger'), mn = q('#nMenu');
  function menu(o) { mn.hidden = !o; bu.setAttribute('aria-expanded', o); document.body.classList.toggle('lock', o); }
  bu.addEventListener('click', function () { menu(mn.hidden); });
  qa('#nMenu a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mn.hidden) menu(false); });
  var bar = q('#nBar');
  addEventListener('scroll', function () { var h = document.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%'; }, { passive: true });
  /* passport: hover zooms on desktop (CSS); tap toggles on touch and keyboard */
  var pp = q('#nPP');
  function zoomPP(on) { pp.classList.toggle('zoom', on); }
  pp.addEventListener('click', function () { if (window.matchMedia('(hover: none)').matches || pp.classList.contains('kb')) zoomPP(!pp.classList.contains('zoom')); });
  pp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pp.classList.add('kb'); zoomPP(!pp.classList.contains('zoom')); } });
  /* copy email */
  q('#nCopy').addEventListener('click', function (e) {
    e.preventDefault(); var o = q('#nCopied');
    function done(t) { o.textContent = t; setTimeout(function () { o.textContent = ''; }, 2600); }
    try { navigator.clipboard.writeText('patorenza.work@gmail.com').then(function () { done('copied!'); }, function () { done('patorenza.work@gmail.com'); }); } catch (x) { done('patorenza.work@gmail.com'); }
  });
  /* daily essentials: scrolling unpacks the bag, items drift out as you go */
  var box = q('#nBox'), bag = q('#nBag'), bis = qa('.n-bi'), run = q('#nRun');
  onView(q('#nSee'), function () { q('#nSee').classList.add('in'); }, .6);
  function layoutFrom0() {
    var mx = bag.offsetLeft, my = bag.offsetTop - bag.offsetHeight * .02;
    return bis.map(function (b) { return { x: mx - b.offsetLeft, y: my - b.offsetTop }; });
  }
  var capm = q('#nCapM');
  bis.forEach(function (b) { b.addEventListener('click', function () { if (!window.matchMedia('(hover: none), (max-width: 720px)').matches) return; var was = b.classList.contains('on'); bis.forEach(function (x) { x.classList.remove('on'); }); if (!was) { b.classList.add('on'); capm.innerHTML = b.querySelector('.cap').innerHTML; } else capm.innerHTML = '<span class="h">Tap an item</span>'; }); });
  /* motion layer */
  if (G) {
    document.documentElement.classList.add('gs');
    gsap.registerPlugin(ScrollTrigger);
    // iOS: don't re-measure (and jump) when the address bar shows or hides while scrolling
    ScrollTrigger.config({ ignoreMobileResize: true });
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } }); window.nStartHero = function () { tl.play(); };
    gsap.set('.n-hero .ln > span', { yPercent: 110 });
    gsap.set('.n-hero .hv', { opacity: 0 });
    gsap.set('.n-rs', { opacity: 0, scale: 2.3, rotation: -24 });
    gsap.set('.n-ppw', { x: 260, y: 120 });
    tl.to('.n-hero .hv:not(.n-ppw)', { opacity: 1, duration: .8, stagger: .1 }, 0.1)
      .to('.n-hero .ln > span', { yPercent: 0, duration: 1.1, stagger: .14, ease: 'power4.out' }, 0.15)
      .to('.n-ppw', { opacity: 1, x: 0, y: 0, duration: 1.5, ease: 'power3.out' }, 0.3)
      .to('.n-rs', { opacity: 1, scale: 1, rotation: function (i) { return [-3, 2, -2][i]; }, duration: .55, stagger: .22, ease: 'back.out(2.2)' }, 1.0);
    if (run) {
      var etl = gsap.timeline({ scrollTrigger: { trigger: run, start: 'top 60%', end: 'bottom bottom', scrub: .5, invalidateOnRefresh: true, onUpdate: function (st) { box.classList.toggle('open', st.progress > .6); } } });
      bis.forEach(function (b, i) {
        etl.fromTo(b, { x: function () { return layoutFrom0()[i].x; }, y: function () { return layoutFrom0()[i].y; }, scale: .1, opacity: 0, rotation: (i % 2 ? 1 : -1) * (24 + i * 5) },
          { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0, ease: 'power2.out', duration: .36 }, i * .04);
      });
      etl.to({}, { duration: .1 });
      // keyboard users: tabbing onto an item that is still packed scrolls to the unpacked bag, so focus never lands on something invisible
      bis.forEach(function (b) { b.addEventListener('focus', function () {
        if (+gsap.getProperty(b, 'opacity') < .9 && etl.scrollTrigger) { var st = etl.scrollTrigger; window.scrollTo({ top: st.end - 2, behavior: 'instant' }); st.update && st.update(); etl.progress(1); }
      }); });
    }
    qa('.n-rv').forEach(function (el) {
      gsap.set(el, { y: 40, opacity: 0 });
      var d = parseFloat(el.style.getPropertyValue('--d')) || 0;
      onView(el, function () { gsap.to(el, { y: 0, opacity: 1, duration: 1, delay: d, ease: 'power3.out', clearProps: 'transform' }); }, .08);
    });
    if (window.innerWidth > 900) gsap.to('.n-ppw', { y: -40, ease: 'none', scrollTrigger: { trigger: '#hello', start: 'top top', end: 'bottom top', scrub: .6 } });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  } else {
    qa('.hv').forEach(function (e) { e.style.opacity = 1; });
    qa('.n-rv').forEach(function (e) { e.style.opacity = 1; });
  }
})();
