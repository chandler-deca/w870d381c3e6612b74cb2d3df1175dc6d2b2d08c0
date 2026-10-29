const CHAT = "https://decagon.ai/mobile/81Bceiy_decagon_health_cr";

const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"/></svg>',
  care: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10Z"/></svg>',
  pharmacy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
  bill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12v18l-2-1.2L14 21l-2-1.2L10 21l-2-1.2L6 21V3Z"/><path d="M9 8h6M9 12h6"/></svg>',
  coach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3"/><path d="M5 19c1.2-3 3.4-4.5 7-4.5S17.8 16 19 19"/></svg>',
};

const TABS = [
  ["home", "Home"],
  ["care", "Care"],
  ["pharmacy", "Pharmacy"],
  ["bill", "Bill"],
  ["coach", "Coach"],
];

let member;
let screen = "home";
let chatReady = false;

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

function el(html) {
  const node = document.createElement("div");
  node.innerHTML = html;
  return node;
}

function chatSrc() {
  const auth = self.__decagonAuth || {};
  const url = new URL(CHAT);
  if (auth["x-decagon-auth-signature"] && auth["x-decagon-auth-epoch"]) {
    url.searchParams.set("user_id_auth_signature", auth["x-decagon-auth-signature"]);
    url.searchParams.set("user_id_auth_epoch", auth["x-decagon-auth-epoch"]);
  }
  if (auth["x-decagon-user-token"]) url.searchParams.set("token", auth["x-decagon-user-token"]);
  return url.toString();
}

function openChat() {
  const sheet = document.getElementById("chat");
  const frame = document.getElementById("chat-frame");
  if (!chatReady) {
    frame.src = chatSrc();
    chatReady = true;
  }
  sheet.hidden = false;
  document.body.classList.add("in-chat");
}

function closeChat() {
  document.getElementById("chat").hidden = true;
  document.body.classList.remove("in-chat");
}

function home(m) {
  const rx = m.prescriptions.find((item) => item.tone === "ready");
  const visit = shownDate(m.appointment.day);
  return `
    <div class="hello">
      <h1>Hi, ${m.member.first_name}</h1>
      <p>${m.member.plan_type} · ${m.member.member_id}</p>
    </div>
    <button class="card" data-go="care" type="button">
      <span class="kicker">Upcoming visit</span>
      <strong>${m.appointment.visit_type}</strong>
      <em>${visit} · ${m.appointment.time}</em>
    </button>
    <button class="card" data-go="pharmacy" type="button">
      <span class="kicker">Pharmacy</span>
      <strong>${rx.medication} is ready</strong>
      <em>Pick up at the ${rx.place}</em>
    </button>
    <button class="card" data-go="bill" type="button">
      <span class="kicker">You owe</span>
      <strong>${money(m.bill.amount_due)}</strong>
      <em>Statement ${m.bill.statement_id}</em>
    </button>
    <button class="primary" id="home-chat" type="button">Chat with us</button>
    <p class="fine">Emergencies: call 911. This is a demo. Nothing here is a real account.</p>
  `;
}

function care(m) {
  const a = m.appointment;
  return `
    <div class="section">
      <h2>${a.visit_type}</h2>
      <p>${shownDate(a.day)} at ${a.time}</p>
      <p>${a.doctor} · ${a.department}</p>
      <p>${a.location}</p>
    </div>
    <p class="note">You can move this visit in chat until 24 hours before. A later change is $25.</p>
    <button class="primary" id="home-chat" type="button">Change this visit</button>
  `;
}

function pharmacy(m) {
  const cards = m.prescriptions.map((rx) => {
    let detail = rx.supply;
    if (rx.tone === "ready") detail = `Pick up by ${shownDate(rx.ready_since_day + rx.hold_days, false)} · ${rx.place}`;
    if (rx.tone === "hold") detail = `${rx.reason} · ${rx.prescriber}`;
    if (rx.tone === "shipped") detail = `Arrives ${shownDate(rx.delivery_day)} · ${rx.carrier}<br>${rx.tracking_number}`;
    return `
      <article class="card rx">
        <div>
          <h2>${rx.medication}</h2>
          <p>${detail}</p>
        </div>
        <span class="pill ${rx.tone}">${rx.status}</span>
      </article>`;
  }).join("");
  return `${cards}<button class="primary" id="home-chat" type="button">Ask about a prescription</button>`;
}

function bill(m) {
  const lines = m.bill.lines.map((line) => `
    <div class="line"><span>${line.service}</span><b>${line.owes ? money(line.owes) : "Covered"}</b></div>
  `).join("");
  return `
    <div class="hello">
      <h1>${money(m.bill.amount_due)}</h1>
      <p>${m.bill.statement_id} · ${shownDate(m.bill.visit_day)} · ${m.bill.location}</p>
    </div>
    <div class="card">${lines}</div>
    <p class="note">Deductible met. Pay in chat with the Visa ending in 4242 or the HSA card ending in 1881.</p>
    <button class="primary" id="home-chat" type="button">Review payment</button>
  `;
}

function coach(m) {
  const people = m.coaches.map((name) => `<article class="card"><strong>${name}</strong><em>Phone or video · 20 to 30 minutes</em></article>`).join("");
  return `
    <div class="section">
      <h2>Coaching is free on your plan</h2>
      <p>Weight, eating, activity, sleep, stress, or quitting tobacco. Coaches reply to messages within one business day.</p>
    </div>
    ${people}
    <button class="primary" id="home-chat" type="button">Book a session</button>
  `;
}

const RENDER = { home, care, pharmacy, bill, coach };

function paint() {
  const main = document.getElementById("main");
  main.innerHTML = RENDER[screen](member);
  main.querySelectorAll("[data-go]").forEach((node) => {
    node.addEventListener("click", () => { screen = node.dataset.go; paint(); });
  });
  const chat = document.getElementById("home-chat");
  if (chat) chat.addEventListener("click", openChat);
  document.getElementById("tabs").querySelectorAll("button").forEach((node) => {
    if (node.dataset.screen === screen) node.setAttribute("aria-current", "page");
    else node.removeAttribute("aria-current");
  });
}

function tabs() {
  document.getElementById("tabs").innerHTML = TABS.map(([id, label]) =>
    `<button type="button" data-screen="${id}">${ICONS[id]}<span>${label}</span></button>`
  ).join("");
  document.getElementById("tabs").addEventListener("click", (event) => {
    const node = event.target.closest("button");
    if (!node) return;
    screen = node.dataset.screen;
    paint();
  });
}

fetch("member.json")
  .then((res) => res.json())
  .then((data) => {
    member = data;
    document.getElementById("plan").textContent = data.member.first_name + " " + data.member.last_name;
    tabs();
    paint();
  })
  .catch(() => {
    document.getElementById("main").textContent = "The member record didn’t load. Refresh and try again.";
  });

document.getElementById("open-chat").addEventListener("click", openChat);
document.getElementById("close-chat").addEventListener("click", closeChat);
document.addEventListener("decagon-auth", () => {
  if (!chatReady) return;
  const frame = document.getElementById("chat-frame");
  const next = chatSrc();
  if (frame.src !== next) frame.src = next;
});
