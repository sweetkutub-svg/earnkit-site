/* EarnGrow — site behaviour. No dependencies. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Theme ----------------------------------------------------------- */
  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); }
    catch (e) { return null; }
  }
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    var b = $('.tgl');
    if (b) b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  var saved = store('eg-theme');
  applyTheme(saved || 'light');

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('.tgl') : null;
    if (!t) return;
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store('eg-theme', next);
  });

  /* ---- Sticky header + reading progress -------------------------------- */
  var hdr = $('.hdr'), prog = $('.prog'), ticking = false;
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (hdr) hdr.classList.toggle('is-stuck', y > 12);
    if (prog) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---- Mobile drawer ---------------------------------------------------- */
  var burger = $('.burger'), drawer = $('.drawer'), scrim = $('.scrim');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    if (scrim) scrim.classList.toggle('open', open);
    if (burger) burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) burger.addEventListener('click', function () {
    setDrawer(burger.getAttribute('aria-expanded') !== 'true');
  });
  if (scrim) scrim.addEventListener('click', function () { setDrawer(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  /* ---- Scroll reveal ---------------------------------------------------- */
  var targets = $$('.r');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- Count-up numbers ------------------------------------------------- */
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var dur = parseInt(el.getAttribute('data-dur') || '1500', 10);
    var pre = el.getAttribute('data-pre') || '';
    var suf = el.getAttribute('data-suf') || '';
    if (reduced) { el.textContent = pre + end.toLocaleString('en-IN') + suf; return; }
    var t0 = null;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(end * eased).toLocaleString('en-IN') + suf;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(countUp);
  }

  /* ---- Phone: subtle pointer parallax ----------------------------------- */
  var phone = $('.phone');
  if (phone && !reduced && window.matchMedia('(pointer:fine)').matches) {
    var stage = phone.parentElement;
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      phone.style.transform = 'rotateY(' + (-12 + x * 13) + 'deg) rotateX(' + (4 - y * 11) + 'deg) rotateZ(-1.5deg)';
    });
    stage.addEventListener('mouseleave', function () {
      phone.style.transform = 'rotateY(-12deg) rotateX(4deg) rotateZ(-1.5deg)';
    });
  }

  /* ---- Tabs -------------------------------------------------------------- */
  $$('[data-tabs]').forEach(function (group) {
    var tabs = $$('.tab', group);
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', String(on));
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = !on;
        });
      });
      tab.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(tab);
        if (e.key === 'ArrowRight') tabs[(i + 1) % tabs.length].focus();
        if (e.key === 'ArrowLeft') tabs[(i - 1 + tabs.length) % tabs.length].focus();
      });
    });
  });

  /* ---- Accordion: one open at a time ------------------------------------ */
  $$('.acc').forEach(function (acc) {
    var items = $$('details', acc);
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) items.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  /* ---- Toast + copy ------------------------------------------------------ */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(function () { toastEl.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  $$('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') ||
                 (btn.previousElementSibling ? btn.previousElementSibling.textContent.trim() : '');
      var done = function () {
        var old = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('done');
        toast('Copied to clipboard');
        setTimeout(function () { btn.textContent = old; btn.classList.remove('done'); }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { toast('Copy failed. Select the text manually.'); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); }
        catch (e) { toast('Copy failed. Select the text manually.'); }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---- Download page: device hint + click feedback ----------------------- */
  var dlBtn = $('[data-download]');
  var unavailable = $('[data-release-unavailable]');
  if (unavailable) unavailable.addEventListener('click', function(e){ e.preventDefault(); toast('APK release is not attached to this website package yet.'); });
  if (dlBtn) {
    var isAndroid = /android/i.test(navigator.userAgent);
    var hint = $('[data-device-hint]');
    if (hint) {
      hint.textContent = isAndroid
        ? 'Android detected. The file will save to your Downloads folder.'
        : 'This is an Android app. Open this page on your phone, or move the file across after downloading.';
    }
    dlBtn.addEventListener('click', function () {
      toast('Download started. Open the file from your notification bar.');
    });
  }

  /* ---- Live points ticker on the phone mockup ---------------------------- */
  var ticker = $('[data-ticker]');
  if (ticker && !reduced) {
    var base = parseInt(ticker.getAttribute('data-ticker'), 10) || 2460;
    var shown = 0;
    var t0 = null, dur = 1700;
    function tick(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      shown = Math.round(base * (1 - Math.pow(1 - p, 3)));
      ticker.textContent = shown.toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(tick);
      else {
        setInterval(function () {
          base += Math.floor(Math.random() * 12) + 6;
          ticker.textContent = base.toLocaleString('en-IN');
          ticker.animate(
            [{ opacity: .55, transform: 'translateY(-3px)' }, { opacity: 1, transform: 'none' }],
            { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' }
          );
        }, 4200);
      }
    }
    requestAnimationFrame(tick);
  } else if (ticker) {
    ticker.textContent = (parseInt(ticker.getAttribute('data-ticker'), 10) || 2460).toLocaleString('en-IN');
  }

  /* ---- Current year ------------------------------------------------------ */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
