(function () {
  "use strict";

  var $  = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------- Splash ---------- */
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) return;
    var hide = function () { splash.classList.add("is-out"); };
    if (document.readyState === "complete") setTimeout(hide, 500);
    else window.addEventListener("load", function () { setTimeout(hide, 350); });
    setTimeout(hide, 3200);
  }

  /* ---------- Scroll suave en anclas ---------- */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - 60,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ---------- Cabecera: enlaces al salir del hero ---------- */
  function initNavState() {
    var nav = $("[data-nav]");
    var hero = $(".hero");
    if (!nav || !hero) return;
    var update = function () {
      var past = window.pageYOffset > hero.offsetHeight - 120;
      nav.classList.toggle("is-scrolled", past);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- Reveals ---------- */
  function initReveals() {
    var items = $$("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -4% 0px" });

    items.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$("[data-reveal]:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 1.5) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ---------- Parallax suave en los slots del hero ---------- */
  function initSlotParallax() {
    if (reduced) return;
    if (!window.gsap || !window.ScrollTrigger) return;
    var slots = $$(".bigtype .slot-img img");
    if (!slots.length) return;
    slots.forEach(function (img, i) {
      gsap.to(img, {
        yPercent: i % 2 === 0 ? -8 : 8,
        ease: "none",
        scrollTrigger: { trigger: ".bigtype", start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    safe(initSplash, "initSplash");
    safe(initAnchors, "initAnchors");
    safe(initNavState, "initNavState");
    safe(initReveals, "initReveals");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initSlotParallax, "initSlotParallax");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
