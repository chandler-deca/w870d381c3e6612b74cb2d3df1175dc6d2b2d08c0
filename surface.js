(function (root) {
  var AUTH = ["x-decagon-auth-signature", "x-decagon-auth-epoch", "x-decagon-user-token"];

  function named(value) {
    var v = String(value || "").trim().toLowerCase();
    return v === "app" || v === "portal" ? v : "";
  }

  // Same split as the product widget: a phone or tablet is the app, and an
  // iPad that asks for the desktop site (Macintosh UA, no ?1 hint) stays the portal.
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

  if (typeof document === "undefined") return;

  var meta = document.querySelector('meta[name="decagon-surface"]');
  var forced = meta && named(meta.getAttribute("content"));
  var query = "";
  try {
    query = new URLSearchParams(location.search).get("surface") || "";
  } catch (e) {}
  var decision = forced
    ? { surface: forced }
    : classify({
        userAgent: navigator.userAgent,
        surfaceQuery: query,
        userAgentDataMobile: !!(navigator.userAgentData && navigator.userAgentData.mobile),
      });
  var hereMeta = document.querySelector('meta[name="decagon-document"]');
  var here = hereMeta && hereMeta.getAttribute("content") === "app" ? "app" : "portal";
  if (decision.surface !== here) {
    location.replace((decision.surface === "app" ? "app.html" : "index.html") + location.search + location.hash);
    return;
  }
  document.documentElement.classList.remove("pending");

  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "decagon-auth") return;
    root.__decagonAuth = event.data.auth || {};
    document.dispatchEvent(new CustomEvent("decagon-auth"));
  });
  navigator.serviceWorker.register("sw.js").then(function () {
    var seen = false;
    try { seen = !!sessionStorage.getItem("dh-sw"); } catch (err) {}
    if (!navigator.serviceWorker.controller && !seen) {
      try { sessionStorage.setItem("dh-sw", "1"); } catch (err) {}
      navigator.serviceWorker.ready.then(function () { location.reload(); });
    }
    var keyMeta = document.querySelector('meta[name="decagon-auth-key"]');
    if (!keyMeta || here !== "app") return;
    var ask = function () {
      var worker = navigator.serviceWorker.controller;
      if (worker) worker.postMessage({ type: "decagon-auth", key: keyMeta.getAttribute("content") });
    };
    if (navigator.serviceWorker.controller) ask();
    else navigator.serviceWorker.ready.then(ask);
  }).catch(function () {});
})(typeof self !== "undefined" ? self : globalThis);
