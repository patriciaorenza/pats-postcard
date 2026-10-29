/* Shared modal helper: keeps keyboard focus inside the open dialog, makes the page behind it
   inert, and supports one dialog inside another (the postcard form inside the globe). */
window.PatModal = (function () {
  var stack = [], SEL = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function shown(el) { return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden'; }
  function items(d) { return Array.prototype.filter.call(d.querySelectorAll(SEL), function (el) { return shown(el) && !el.closest('[inert]') && !el.closest('[hidden]') && el.getAttribute('aria-hidden') !== 'true'; }); }
  function setInert() {
    var main = document.querySelector('main'), top = null, i; if (!main) return;
    for (i = stack.length - 1; i >= 0; i--) if (stack[i].parentNode === main) { top = stack[i]; break; }
    Array.prototype.forEach.call(main.children, function (c) { if (top && c !== top) c.setAttribute('inert', ''); else c.removeAttribute('inert'); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !stack.length) return;
    var d = stack[stack.length - 1], f = items(d); if (!f.length) { e.preventDefault(); return; }
    var a = document.activeElement, first = f[0], last = f[f.length - 1];
    if (!d.contains(a)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
    else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
  });
  return {
    open: function (d) { var i = stack.indexOf(d); if (i > -1) stack.splice(i, 1); stack.push(d); setInert(); },
    close: function (d) { var i = stack.indexOf(d); if (i > -1) stack.splice(i, 1); setInert(); }
  };
})();
