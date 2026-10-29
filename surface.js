(function (root) {
  var AUTH = ["x-decagon-auth-signature", "x-decagon-auth-epoch", "x-decagon-user-token"];

  function named(value) {
    var v = String(value || "").trim().toLowerCase();
    return v === "app" || v === "portal" ? v : "";
  }

  // Same split as the product widget: a phone or tablet is the app, and an
  // iPad that asks for the desktop site (Macintosh UA, no ?1 hint) stays the portal.
  function isPhone(ua, opts) {
    opts = opts || {};
    var namedSurface = named(opts.surfaceQuery);
    if (namedSurface === "portal") return false;
    if (namedSurface === "app") return true;
    ua = ua || "";
    if (/iPhone|iPod/i.test(ua)) return true;
    if (/Android/i.test(ua) && /Mobile/i.test(ua)) return true;
    if (opts.userAgentDataMobile) return true;
    if (opts.narrowTouch) return true;
    return false;
  }

  function deviceSurface(ua, secCh, dataMobile) {
    if (String(secCh || "").trim() === "?1" || dataMobile) return "app";
    ua = ua || "";
    if (/iPhone|iPod|iPad/i.test(ua)) return "app";
    if (/Android/i.test(ua)) return "app";
    return "portal";
  }

  function classify(input) {
    input = input || {};
    var surface = named(input.surfaceHeader) || named(input.surfaceQuery);
    var authIn = input.auth || {};
    var auth = {};
    AUTH.forEach(function (name) {
      if (authIn[name]) auth[name] = String(authIn[name]);
    });
    var hasAuth = AUTH.some(function (name) { return auth[name]; });
    if (!surface && hasAuth) surface = "app";
    if (!surface) surface = deviceSurface(input.userAgent, input.secChUaMobile, input.userAgentDataMobile);
    if (surface !== "app") auth = {};
    return { surface: surface, auth: auth };
  }

  root.decagonClassify = classify;
  root.decagonIsPhone = isPhone;

  if (typeof document === "undefined") return;

  // The page picks phone or desk inline, before this file. Do not navigate:
  // a service worker that rewrites the next URL was sending iPhones back to the booth.
  document.documentElement.classList.remove("pending");

  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "decagon-auth") return;
    root.__decagonAuth = event.data.auth || {};
    document.dispatchEvent(new CustomEvent("decagon-auth"));
  });
  navigator.serviceWorker.register("sw.js").then(function () {
    var keyMeta = document.querySelector('meta[name="decagon-auth-key"]');
    if (!keyMeta) return;
    var ask = function () {
      var worker = navigator.serviceWorker.controller;
      if (worker) worker.postMessage({ type: "decagon-auth", key: keyMeta.getAttribute("content") });
    };
    if (navigator.serviceWorker.controller) ask();
    else navigator.serviceWorker.ready.then(ask);
  }).catch(function () {});
})(typeof self !== "undefined" ? self : globalThis);
