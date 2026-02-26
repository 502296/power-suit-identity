// private-atelier.js (FULL) — Verified access + Hero + Grid + List + Upsell

(function () {
const $ = (id) => document.getElementById(id);

// Footer year
const yearEl = $("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Query params
const params = new URLSearchParams(window.location.search);
const sessionId = params.get("session_id");

// Elements
const status = $("status");

// ✅ New gallery structure
const galleryWrap = $("galleryWrap");
const heroSlot = $("heroSlot");
const gridSlot = $("gridSlot");
const listSlot = $("listSlot");

const upsell = $("upsell");
const btnAnother = $("btnAnother");

function deny() {
window.location.href = "/";
}

function showVerified() {
if (status) status.textContent = "Access verified. Welcome to the Private Atelier.";

if (galleryWrap) {
galleryWrap.classList.remove("hidden");
galleryWrap.setAttribute("aria-hidden", "false");
}

if (upsell) {
upsell.classList.remove("hidden");
upsell.setAttribute("aria-hidden", "false");
}

// ✅ Load images dynamically into Hero + Grid + List
loadGallery();
}

function cleanFileName(file) {
// Only allow safe filename characters
return String(file || "").replace(/[^a-zA-Z0-9._-]/g, "");
}

function renderHero(file) {
if (!heroSlot) return;

heroSlot.innerHTML = "";

const safeFile = cleanFileName(file);
if (!safeFile) return;

const wrap = document.createElement("figure");
wrap.className = "hero-shot";

// Hero loads eager for best mobile UX
wrap.innerHTML = `
<img src="/images/atelier/${safeFile}" alt="Power Suit Identity — Featured Look" loading="eager" />
<div class="hero-cap">
<b>Featured Look</b>
<span>Private Atelier</span>
</div>
`;

heroSlot.appendChild(wrap);
}

function makeFigure(cls, file, caption) {
const safeFile = cleanFileName(file);
if (!safeFile) return null;

const fig = document.createElement("figure");
fig.className = cls;

fig.innerHTML = `
<img src="/images/atelier/${safeFile}" alt="Power Suit Identity — Private Atelier" loading="lazy" />
<figcaption>${caption}</figcaption>
`;

return fig;
}

async function loadGallery() {
try {
const res = await fetch("/api/list-atelier-images", {
method: "GET",
headers: { Accept: "application/json" },
});

const data = await res.json();

if (!res.ok || !data || !Array.isArray(data.images)) {
console.error("Bad gallery response");
return;
}

// Sanitize and keep only valid filenames
const images = data.images.map(cleanFileName).filter(Boolean);

if (images.length === 0) return;

// Clear slots
if (gridSlot) gridSlot.innerHTML = "";
if (listSlot) listSlot.innerHTML = "";

// ✅ 1) HERO = first image
renderHero(images[0]);

// ✅ 2) GRID = next 8 images (so top 9 are "featured" including hero)
const gridImages = images.slice(1, 9);
gridImages.forEach((file) => {
const fig = makeFigure("grid-item", file, "Power Suit Identity");
if (fig && gridSlot) gridSlot.appendChild(fig);
});

// ✅ 3) LIST = rest
const rest = images.slice(9);
rest.forEach((file) => {
const fig = makeFigure("list-item", file, "Power Suit Identity");
if (fig && listSlot) listSlot.appendChild(fig);
});
} catch (e) {
console.error("Gallery load error:", e);
}
}

async function verifyAccess() {
if (!status) return;

if (!sessionId) {
status.textContent = "Missing session. Redirecting…";
return setTimeout(deny, 700);
}

try {
const res = await fetch(
`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`,
{
method: "GET",
headers: { Accept: "application/json" },
}
);

const data = await res.json();

if (!res.ok || !data || !data.ok) {
status.textContent = "Access not verified. Redirecting…";
return setTimeout(deny, 700);
}

// ✅ Verified
showVerified();

// ✅ Upsell button handler
if (btnAnother) {
btnAnother.addEventListener("click", async () => {
btnAnother.disabled = true;
btnAnother.textContent = "Opening checkout…";

try {
const r = await fetch(`/api/create-another-look-session`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ parent_session_id: sessionId }),
});

const j = await r.json();

if (!r.ok || !j || !j.url) {
throw new Error("No checkout url returned");
}

window.location.href = j.url;
} catch (e) {
console.error("Upsell error:", e);
btnAnother.disabled = false;
btnAnother.textContent = "Book Another Look";
alert("Sorry — please try again.");
}
});
}
} catch (err) {
console.error("Verification failed:", err);
status.textContent = "Verification failed. Redirecting…";
return setTimeout(deny, 700);
}
}

// Start
verifyAccess();
})();
