importScripts("surface.js");

var AUTH = ["x-decagon-auth-signature", "x-decagon-auth-epoch", "x-decagon-user-token"];
var authKeys = new Map();

self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", function (event) {
  if (!event.data || event.data.type !== "decagon-auth") return;
  var auth = authKeys.get(event.data.key) || {};
  if (event.source) event.source.postMessage({ type: "decagon-auth", auth: auth });
});

// Ordinary visits are decided in the page from navigator, not here. Safari
// often leaves User-Agent off the navigation request, and swapping in the
// booth on that miss is what pinned iPhones to the desktop chat card.
self.addEventListener("fetch", function (event) {
  if (event.request.mode !== "navigate") return;
  if (event.request.headers.get("x-decagon-fetch") === "1") return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  var headers = event.request.headers;
  var surfaceHeader = (headers.get("x-decagon-surface") || "").trim().toLowerCase();
  var auth = {};
  AUTH.forEach(function (name) {
    var value = headers.get(name);
    if (value) auth[name] = value;
  });
  var hasAuth = AUTH.some(function (name) { return auth[name]; });
  if (surfaceHeader !== "app" && surfaceHeader !== "portal" && !hasAuth) return;

  var decision = self.decagonClassify({
    userAgent: headers.get("user-agent") || "",
    secChUaMobile: headers.get("sec-ch-ua-mobile") || "",
    surfaceHeader: surfaceHeader,
    surfaceQuery: url.searchParams.get("surface") || "",
    auth: auth,
  });

  event.respondWith((async function () {
    var res = await fetch(event.request, { cache: "no-store", headers: { "x-decagon-fetch": "1" } });
    var html = await res.text();
    var key = (self.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
    authKeys.set(key, decision.surface === "app" ? decision.auth : {});
    setTimeout(function () { authKeys.delete(key); }, 60000);
    html = html
      .replace(
        '<meta name="decagon-explicit-surface" content="">',
        '<meta name="decagon-explicit-surface" content="' + decision.surface + '">'
      )
      .replace(
        '<meta name="decagon-auth-slot" content="">',
        '<meta name="decagon-auth-key" content="' + key + '">'
      );
    return new Response(html, {
      status: res.status,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  })());
});
