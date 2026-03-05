// private-atelier.js (FULL) — Verify session then redirect to gallery
// ✅ Goal: After payment -> verify -> redirect to /atelier-gallery.html?paid=1
// ✅ Keeps protection: no verified session => redirect to /index.html

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

  function deny() {
    // Safer than "/"
    window.location.href = "/index.html";
  }

  function goToGallery() {
    // ✅ Simple redirect after verified
    window.location.href = "/atelier-gallery.html?paid=1";
  }

  async function verifyAccess() {
    if (status) status.textContent = "Verifying payment…";

    if (!sessionId) {
      if (status) status.textContent = "Missing session. Redirecting…";
      return setTimeout(deny, 700);
    }

    try {
      const res = await fetch(
        `/api/verify-session?session_id=${encodeURIComponent(sessionId)}`,
        { method: "GET", headers: { Accept: "application/json" } }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data || !data.ok) {
        console.error("Not verified:", data);
        if (status) status.textContent = "Access not verified. Redirecting…";
        return setTimeout(deny, 900);
      }

      if (status) status.textContent = "Access verified. Redirecting to gallery…";
      return setTimeout(goToGallery, 600);
    } catch (err) {
      console.error("Verification failed:", err);
      if (status) status.textContent = "Verification failed. Redirecting…";
      return setTimeout(deny, 900);
    }
  }

  verifyAccess();
})();
