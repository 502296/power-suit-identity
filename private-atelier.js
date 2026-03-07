// private-atelier.js (FINAL)
// Verify session, then load atelier images on the same page

(function () {
  const $ = (id) => document.getElementById(id);

  const yearEl = $("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  const status = $("status");
  const gallery = $("gallery");

  function deny(message) {
    if (status) status.textContent = message || "Access not verified. Redirecting...";
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1200);
  }

  async function verifyAccess() {
    if (status) status.textContent = "Verifying payment...";

    if (!sessionId) {
      return deny("Missing session. Redirecting...");
    }

    try {
      const res = await fetch(
        `/api/verify-session?session_id=${encodeURIComponent(sessionId)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data || !data.ok) {
        console.error("Not verified:", data);
        return deny("Access not verified. Redirecting...");
      }

      if (status) status.textContent = "Access verified. Loading gallery...";
      return true;
    } catch (err) {
      console.error("Verification failed:", err);
      return deny("Verification failed. Redirecting...");
    }
  }

  async function loadImages() {
    try {
      const res = await fetch("/api/list-atelier-images", {
        headers: { Accept: "application/json" },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data || !data.images || !data.images.length) {
        console.error("Images load failed:", data);
        if (status) status.textContent = "Gallery error. Please try again.";
        return;
      }

      if (!gallery) {
        console.error("Missing #gallery element in HTML");
        if (status) status.textContent = "Gallery container not found.";
        return;
      }

      gallery.innerHTML = "";

      data.images.forEach((file) => {
        const card = document.createElement("div");
        card.className = "shot";

        const img = document.createElement("img");
        img.src = `/images/atelier/${file}`;
        img.alt = "Power Suit Identity Look";
        img.loading = "lazy";

        card.appendChild(img);
        gallery.appendChild(card);
      });

      gallery.classList.remove("hidden");
      gallery.setAttribute("aria-hidden", "false");

      if (status) status.textContent = "";
    } catch (err) {
      console.error("Load images error:", err);
      if (status) status.textContent = "Failed to load gallery.";
    }
  }

  (async function init() {
    const ok = await verifyAccess();
    if (!ok) return;
    await loadImages();
  })();
})();
