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

self.addEventListener("fetch", function (event) {
  if (event.request.mode !== "navigate") return;
  if (event.request.headers.get("x-decagon-fetch") === "1") return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  var scopePath = new URL(self.registration.scope).pathname;
  if (!url.pathname.startsWith(scopePath)) return;
  var rel = url.pathname.slice(scopePath.length);
  if (rel !== "" && rel !== "index.html" && rel !== "app.html") return;

  var headers = event.request.headers;
  var auth = {};
  AUTH.forEach(function (name) {
    var value = headers.get(name);
    if (value) auth[name] = value;
  });
  var decision = self.decagonClassify({
    userAgent: headers.get("user-agent") || "",
    secChUaMobile: headers.get("sec-ch-ua-mobile") || "",
    surfaceHeader: headers.get("x-decagon-surface") || "",
    surfaceQuery: url.searchParams.get("surface") || "",
    auth: auth,
  });

  var fileUrl = new URL(decision.surface === "app" ? "app.html" : "index.html", self.registration.scope);
  event.respondWith((async function () {
    var res = await fetch(fileUrl, { cache: "no-store", headers: { "x-decagon-fetch": "1" } });
    var html = await res.text();
    var key = (self.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
    authKeys.set(key, decision.auth);
    setTimeout(function () { authKeys.delete(key); }, 60000);
    html = html.replace(
      '<meta name="decagon-surface" content="">',
      '<meta name="decagon-surface" content="' + decision.surface + '"><meta name="decagon-auth-key" content="' + key + '">'
    );
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  })());
});
