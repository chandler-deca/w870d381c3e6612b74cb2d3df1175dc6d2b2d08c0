import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const code = readFileSync(new URL("./surface.js", import.meta.url), "utf8");
const context = { console };
context.self = context;
context.globalThis = context;
vm.runInNewContext(code, context, { filename: "surface.js" });
const classify = context.decagonClassify;

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const ANDROID = "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36";
const TABLET = "Mozilla/5.0 (Linux; Android 15; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const DESKTOP = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const IPAD = "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

test("a phone is the app and a desktop browser is the portal", () => {
  assert.equal(classify({ userAgent: IPHONE }).surface, "app");
  assert.equal(classify({ userAgent: ANDROID }).surface, "app");
  assert.equal(classify({ userAgent: TABLET }).surface, "app");
  assert.equal(classify({ userAgent: IPAD }).surface, "app");
  assert.equal(classify({ userAgent: DESKTOP }).surface, "portal");
  assert.equal(classify({ userAgent: "curl/8.0" }).surface, "portal");
});

test("an iPad requesting the desktop site stays the portal unless the mobile hint is set", () => {
  assert.equal(classify({ userAgent: DESKTOP, secChUaMobile: "?0" }).surface, "portal");
  assert.equal(classify({ userAgent: DESKTOP, secChUaMobile: "?1" }).surface, "app");
  assert.equal(classify({ userAgent: DESKTOP, userAgentDataMobile: true }).surface, "app");
});

test("a named surface wins over the device and over auth headers", () => {
  assert.equal(classify({ userAgent: DESKTOP, surfaceQuery: "app" }).surface, "app");
  assert.equal(classify({ userAgent: IPHONE, surfaceHeader: "portal" }).surface, "portal");
  assert.equal(classify({
    userAgent: IPHONE,
    surfaceHeader: "portal",
    surfaceQuery: "app",
    auth: { "x-decagon-auth-signature": "sig", "x-decagon-auth-epoch": "1" },
  }).surface, "portal");
});

test("auth headers select the app and are returned only for that surface", () => {
  const withAuth = classify({
    userAgent: DESKTOP,
    auth: {
      "x-decagon-auth-signature": "sig",
      "x-decagon-auth-epoch": "123",
      "x-decagon-user-token": "tok",
      "authorization": "Bearer no",
    },
  });
  assert.equal(withAuth.surface, "app");
  assert.deepEqual(JSON.parse(JSON.stringify(withAuth.auth)), {
    "x-decagon-auth-signature": "sig",
    "x-decagon-auth-epoch": "123",
    "x-decagon-user-token": "tok",
  });

  const forcedPortal = classify({
    userAgent: IPHONE,
    surfaceHeader: "portal",
    auth: { "x-decagon-auth-signature": "sig" },
  });
  assert.equal(forcedPortal.surface, "portal");
  assert.deepEqual(JSON.parse(JSON.stringify(forcedPortal.auth)), {});
});
