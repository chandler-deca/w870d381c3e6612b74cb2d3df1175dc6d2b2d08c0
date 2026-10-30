const CHAT = "https://decagon.ai/mobile/81Bceiy_decagon_health_cr";
const USER_ID = "jordan.rivera";

const IDENTITY = {
  first_name: "Jordan",
  last_name: "Rivera",
  date_of_birth: "1985-03-03",
  member_id: "DH-204517",
  plan_type: "Decagon Health HMO",
  source: "decagon_health_app",
};

const BLANK_ENTRY = {
  entry_screen: "",
  entry_action: "",
  entry_message: "",
  medication: "",
  prescription_status: "",
  visit_type: "",
  visit_doctor: "",
  statement_id: "",
  amount_due: "",
  coach_name: "",
};

const PILL_PHOTO = {
  "Atorvastatin 20 mg": "assets/pill-atorvastatin.jpg",
  "Lisinopril 10 mg": "assets/pill-lisinopril.jpg",
  "Eszopiclone 2 mg": "assets/pill-eszopiclone.jpg",
};

const PAY_LABEL = {
  "Visa ending in 4242": "Visa \u00b7\u00b7\u00b7\u00b74242",
  "HSA card ending in 1881": "HSA \u00b7\u00b7\u00b7\u00b71881",
};

const ICONS = {
  home:
    '<svg class="line" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"/></svg>' +
    '<svg class="solid" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"/></svg>',
  care:
    '<svg class="line" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10Z"/></svg>' +
    '<svg class="solid" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10Z"/></svg>',
  pharmacy:
    '<svg class="line" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><g transform="rotate(-45 12 12)"><rect x="3.2" y="7.6" width="17.6" height="8.8" rx="4.4"/><path d="M12 7.6v8.8"/></g></svg>' +
    '<svg class="solid" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3.2" y="7.6" width="17.6" height="8.8" rx="4.4" transform="rotate(-45 12 12)"/></svg>',
  bill:
    '<svg class="line" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M7 3.5h10a1 1 0 0 1 1 1V20l-2.2-1.3-2.3 1.3-1.5-1.3-1.5 1.3-2.2-1.3L6 20V4.5a1 1 0 0 1 1-1Z"/><path d="M9 8.5h6M9 12h6"/></svg>' +
    '<svg class="solid" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7 3.5h10a1 1 0 0 1 1 1V20l-2.2-1.3-2.3 1.3-1.5-1.3-1.5 1.3-2.2-1.3L6 20V4.5a1 1 0 0 1 1-1Zm2 5h6v1.3H9Zm0 3.5h6v1.3H9Z"/></svg>',
  coach:
    '<svg class="line" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 19c1.2-3 3.4-4.5 7-4.5S17.8 16 19 19"/></svg>' +
    '<svg class="solid" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="3.1"/><path d="M5.2 19.2c.3-.7 1.2-3.8 6.8-3.8s6.5 3.1 6.8 3.8c.2.4-.1.8-.6.8H5.8c-.5 0-.8-.4-.6-.8Z"/></svg>',
};

const TABS = [
  ["home", "Home"],
  ["care", "Care"],
  ["pharmacy", "Pharmacy"],
  ["bill", "Bill"],
  ["coach", "Coach"],
];

const CHEVRON = '<svg class="chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

let member;
let screen = "home";
let frameReady = false;
let frameLoaded = false;
let chatOpened = false;
let assignedSrc = "";
let entrySent = false;
let currentMeta = sessionMetadata();

function shownDate(offset, weekdays) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + Number(offset));
  if (weekdays !== false) {
    const py = (d.getDay() + 6) % 7;
    if (py >= 5) d.setDate(d.getDate() + (offset >= 0 ? 7 - py : 4 - py));
  }
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function money(n) {
  return Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function sessionMetadata(partial) {
  return Object.assign({}, IDENTITY, BLANK_ENTRY, partial || {});
}

function isPhoneApp() {
  const root = document.documentElement;
  if (root.classList.contains("desk")) return false;
  return root.classList.contains("phone") || root.classList.contains("app-page");
}

function setTheme(color) {
  if (!isPhoneApp()) return;
  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme) theme.setAttribute("content", color);
}

function hasUserSignature() {
  const auth = self.__decagonAuth || {};
  return !!(auth["x-decagon-auth-signature"] && auth["x-decagon-auth-epoch"]);
}

function chatSrc() {
  const auth = self.__decagonAuth || {};
  const url = new URL(CHAT);
  // The mobile chat copies these query params into session metadata before it
  // creates the conversation. A preload would create that conversation with the
  // empty entry fields, and a later postMessage would not replace it.
  const meta = currentMeta;
  Object.keys(meta).forEach((key) => url.searchParams.set(key, meta[key]));
  // An unsigned userId makes /conversation/user fail and the mobile chat
  // shows "Please reopen this interface." Set the widget user only with a signature.
  if (hasUserSignature()) {
    url.searchParams.set("userId", USER_ID);
    url.searchParams.set("user_id_auth_signature", auth["x-decagon-auth-signature"]);
    url.searchParams.set("user_id_auth_epoch", auth["x-decagon-auth-epoch"]);
  }
  if (auth["x-decagon-user-token"]) url.searchParams.set("token", auth["x-decagon-user-token"]);
  return url.toString();
}

function postContext() {
  const frame = document.getElementById("chat-frame");
  if (!frame || !frame.contentWindow) return;
  if (hasUserSignature()) frame.contentWindow.postMessage({ userId: USER_ID }, "*");
  frame.contentWindow.postMessage({ metadata: currentMeta }, "*");
}

// The tapped sentence goes in as the member's first message. The chat queues an
// sdkMessage until the conversation has loaded, but only hears it once its listener
// is up, which it announces with DECAGON_LOADED. Once per frame load.
function sendEntry() {
  const frame = document.getElementById("chat-frame");
  if (entrySent || !frame || !frame.contentWindow || !currentMeta.entry_message) return;
  entrySent = true;
  frame.contentWindow.postMessage({ sdkMessage: currentMeta.entry_message }, "*");
}

function ensureFrame() {
  if (!isPhoneApp()) return;
  const frame = document.getElementById("chat-frame");
  if (frameReady) return;
  window.addEventListener("message", (e) => {
    if (e.source !== frame.contentWindow || !e.data || e.data.type !== "DECAGON_LOADED") return;
    postContext();
    sendEntry();
  });
  frame.addEventListener("load", () => {
    if (!frame.getAttribute("src")) return;
    frameLoaded = true;
    postContext();
    setTimeout(postContext, 800);
    setTimeout(postContext, 2200);
  });
  frameReady = true;
}

function loadFrame() {
  ensureFrame();
  const frame = document.getElementById("chat-frame");
  const next = chatSrc();
  if (frame.getAttribute("src") === next) {
    if (frameLoaded) postContext();
    return;
  }
  assignedSrc = next;
  frameLoaded = false;
  entrySent = false;
  frame.src = next;
}

function openChat(partial) {
  currentMeta = sessionMetadata(partial);
  chatOpened = true;
  ensureFrame();
  const sheet = document.getElementById("chat");
  sheet.classList.remove("is-closed");
  sheet.inert = false;
  sheet.removeAttribute("aria-hidden");
  document.body.classList.add("in-chat");
  const app = document.querySelector(".app");
  if (app) app.inert = true;
  setTheme("#5956ff");
  loadFrame();
}

function statusLabel(rx) {
  if (rx.tone === "ready") return "Ready";
  if (rx.tone === "hold") return "On hold";
  if (rx.tone === "shipped") return "Shipped";
  return rx.status;
}

function rxDetail(rx) {
  let detail = rx.supply;
  if (rx.tone === "ready") detail = `Pick up by ${shownDate(rx.ready_since_day + rx.hold_days, false)} · ${rx.place}`;
  if (rx.tone === "hold") detail = `${rx.reason} · ${rx.prescriber}`;
  if (rx.tone === "shipped") detail = `Arrives ${shownDate(rx.delivery_day)} · ${rx.carrier}<br>${rx.tracking_number}`;
  return detail;
}

function home(m) {
  const visit = shownDate(m.appointment.day);
  const ready = m.prescriptions.find((item) => item.tone === "ready");
  return `
    <div class="hello">
      <h1>Hi, ${m.member.first_name}</h1>
      <p>${m.member.plan_type}</p>
    </div>
    <button class="hero" type="button" data-go="care">
      <img src="assets/priya-patel.jpg" alt="" width="64" height="64">
      <span>
        <strong>${m.appointment.visit_type}</strong>
        <em>${visit} · ${m.appointment.time}</em>
        <em>${m.appointment.doctor}</em>
      </span>
    </button>
    <div class="tiles">
      <button class="tile mint" type="button" data-go="pharmacy">
        <img src="${PILL_PHOTO[ready.medication]}" alt="" width="48" height="48">
        <span class="copy">
          <strong>${ready.medication}</strong>
          <em>Ready</em>
        </span>
      </button>
      <button class="tile lavender" type="button" data-go="bill">
        <span class="copy">
          <strong>${money(m.bill.amount_due)}</strong>
          <em>You owe</em>
        </span>
      </button>
    </div>
    <button class="primary" type="button" data-chat="chat">Chat with us</button>
    <p class="fine">Emergencies: call 911. This is a demo. Nothing here is a real account.</p>
  `;
}

function care(m) {
  const a = m.appointment;
  return `
    <button class="visit" type="button" data-chat="visit">
      <img src="assets/priya-patel.jpg" alt="" width="56" height="56">
      <span class="visit-copy">
        <strong>${a.visit_type}</strong>
        <em>${shownDate(a.day)} at <span class="when">${a.time}</span></em>
      </span>
      <span class="pill ready">Scheduled</span>
    </button>
    <div class="facts">
      <div class="fact"><span>Doctor</span><b>${a.doctor}</b></div>
      <div class="fact"><span>Department</span><b>${a.department}</b></div>
      <div class="fact"><span>Address</span><b>${a.location}</b></div>
    </div>
    <p class="note">You can move this visit in chat until 24 hours before. A later change is $25.</p>
    <button class="primary" type="button" data-chat="visit">Change this visit</button>
  `;
}

function pharmacy(m) {
  const rows = m.prescriptions.map((rx) => `
    <button class="rx" type="button" data-chat="rx" data-med="${rx.medication}">
      <img src="${PILL_PHOTO[rx.medication]}" alt="" width="48" height="48">
      <span class="rx-copy">
        <strong>${rx.medication}</strong>
        <span class="detail">${rxDetail(rx)}</span>
      </span>
      <span class="pill ${rx.tone}">${statusLabel(rx)}</span>
    </button>
  `).join("");
  return `
    <div class="rx-list">${rows}</div>
    <button class="primary" type="button" data-chat="ask">Ask about a prescription</button>
  `;
}

function bill(m) {
  const lines = m.bill.lines.map((line) => `
    <span class="line"><span>${line.service}</span>${line.owes ? `<b>${money(line.owes)}</b>` : `<b class="covered">Covered</b>`}</span>
  `).join("");
  const pays = m.payment_methods.map((method) => {
    const label = PAY_LABEL[method] || method;
    const mark = label.startsWith("HSA") ? "H" : "V";
    return `<button class="pay" type="button" data-chat="bill"><span class="mark">${mark}</span><span>${label}</span>${CHEVRON}</button>`;
  }).join("");
  return `
    <div class="sheet">
      <button class="statement" type="button" data-chat="bill">
        <span class="amount">${money(m.bill.amount_due)}</span>
        <span class="meta">${m.bill.statement_id} · ${shownDate(m.bill.visit_day)}</span>
        <span class="deduct">
          <span class="track"><span class="fill"></span></span>
          <span class="deduct-label">Deductible met</span>
        </span>
        ${lines}
      </button>
      ${pays}
    </div>
    <button class="primary" type="button" data-chat="bill">Review payment</button>
  `;
}

function coach(m) {
  const rows = m.coaches.map((full) => {
    const maya = full.includes("Maya");
    const who = maya ? "Maya" : "Andre";
    const photo = maya ? "assets/maya-thompson.jpg" : "assets/andre-lewis.jpg";
    const name = maya ? "Maya Thompson" : "Andre Lewis";
    const focus = maya ? "Weight, eating, activity" : "Sleep, stress, tobacco";
    return `
      <button class="person" type="button" data-chat="coach" data-who="${who}">
        <img src="${photo}" alt="" width="56" height="56">
        <span class="person-copy">
          <strong>${name}</strong>
          <em>NBC-HWC</em>
          <em>Phone or video · 20 to 30 minutes</em>
          <em>${focus}</em>
        </span>
        ${CHEVRON}
      </button>`;
  }).join("");
  return `
    <div class="intro">
      <h2>Coaching is free on your plan</h2>
      <p>Weight, eating, activity, sleep, stress, tobacco.</p>
    </div>
    <div class="people">${rows}</div>
    <button class="primary" type="button" data-chat="book">Book a session</button>
  `;
}

const RENDER = { home, care, pharmacy, bill, coach };

function contextFrom(node) {
  const kind = node.dataset.chat;
  if (kind === "rx") {
    const rx = member.prescriptions.find((item) => item.medication === node.dataset.med);
    return {
      entry_screen: "pharmacy",
      entry_action: "ask_prescription",
      entry_message: `I have a question about my ${rx.medication}.`,
      medication: rx.medication,
      prescription_status: rx.status,
    };
  }
  if (kind === "ask") {
    return {
      entry_screen: "pharmacy",
      entry_action: "ask_prescription",
      entry_message: "I have a question about a prescription.",
    };
  }
  if (kind === "visit") {
    return {
      entry_screen: "care",
      entry_action: "reschedule_visit",
      entry_message: "I need to reschedule my annual physical.",
      visit_type: member.appointment.visit_type,
      visit_doctor: member.appointment.doctor,
    };
  }
  if (kind === "bill") {
    return {
      entry_screen: "bill",
      entry_action: "explain_bill",
      entry_message: "Can you explain my bill?",
      statement_id: member.bill.statement_id,
      amount_due: String(member.bill.amount_due),
    };
  }
  if (kind === "coach") {
    const who = node.dataset.who;
    const full = member.coaches.find((name) => name.includes(who));
    return {
      entry_screen: "coach",
      entry_action: "book_session",
      entry_message: who === "Maya"
        ? "I'd like to book a session with Coach Maya Thompson."
        : "I'd like to book a session with Coach Andre Lewis.",
      coach_name: full || "",
    };
  }
  if (kind === "book") {
    return {
      entry_screen: "coach",
      entry_action: "book_session",
      entry_message: "I'd like to book a session with a health coach.",
    };
  }
  return {};
}

function paint() {
  const main = document.getElementById("main");
  main.innerHTML = RENDER[screen](member);
  main.scrollTop = 0;
  document.body.dataset.screen = screen;
  document.getElementById("tabs").querySelectorAll("button").forEach((node) => {
    if (node.dataset.screen === screen) node.setAttribute("aria-current", "page");
    else node.removeAttribute("aria-current");
  });
  if (!document.body.classList.contains("in-chat")) {
    setTheme(screen === "bill" ? "#f2f2f7" : "#ffffff");
  }
}

function tabs() {
  document.getElementById("tabs").innerHTML = TABS.map(([id, label]) =>
    `<button type="button" data-screen="${id}"><span class="ico">${ICONS[id]}</span><span>${label}</span></button>`
  ).join("");
}

document.getElementById("main").addEventListener("click", (event) => {
  const go = event.target.closest("[data-go]");
  if (go) {
    screen = go.dataset.go;
    paint();
    return;
  }
  const node = event.target.closest("[data-chat]");
  if (node) openChat(contextFrom(node));
});

document.getElementById("tabs").addEventListener("click", (event) => {
  const node = event.target.closest("button");
  if (!node || !node.dataset.screen) return;
  screen = node.dataset.screen;
  paint();
});

document.getElementById("open-chat").addEventListener("click", () => openChat({}));

document.addEventListener("decagon-auth", () => {
  if (!isPhoneApp() || chatOpened || frameLoaded || !assignedSrc) return;
  const next = chatSrc();
  if (next === assignedSrc) return;
  assignedSrc = next;
  document.getElementById("chat-frame").src = next;
});

fetch("member.json")
  .then((res) => res.json())
  .then((data) => {
    member = data;
    tabs();
    paint();
  })
  .catch(() => {
    document.getElementById("main").textContent = "The member record didn’t load. Refresh and try again.";
  });
