// /atelier-gallery.js  (SECURE)
(function () {
  const $ = (id) => document.getElementById(id);

  const yearEl = $("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const status = $("status");
  const gallery = $("gallery");

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  function goHome() {
    window.location.href = "/";
  }

  function deny(msg) {
    if (status) status.textContent = msg || "Access not verified. Redirecting…";
    setTimeout(goHome, 900);
  }

  async function verify() {
    if (!sessionId) return deny("Missing session. Redirecting…");

    const res = await fetch(
      `/api/verify-session?session_id=${encodeURIComponent(sessionId)}`,
      { headers: { Accept: "application/json" } }
    );

    const data = await res.json();

    if (!res.ok || !data?.ok) {
      console.error("verify failed:", data);
      return deny("Access not verified. Redirecting…");
    }

    return true;
  }

  async function loadImages() {
    const r = await fetch("/api/list-atelier-images", {
      headers: { Accept: "application/json" },
    });
    const j = await r.json();

    if (!r.ok || !j?.images?.length) {
      console.error("list images failed:", j);
      if (status) status.textContent = "Gallery error. Please try again.";
      return;
    }

    gallery.innerHTML = "";
    j.images.forEach((file) => {
      const wrap = document.createElement("div");
      wrap.className = "shot";

      const img = document.createElement("img");
      img.src = `/images/atelier/${file}`;   // ✅ matches your repo: /images/atelier/01.jpg
      img.alt = "Power Suit Identity — Private Atelier";
      img.loading = "lazy";

      wrap.appendChild(img);
      gallery.appendChild(wrap);
    });

    gallery.classList.remove("hidden");
    gallery.setAttribute("aria-hidden", "false");
    if (status) status.textContent = "";
  }

  (async function init() {
    try {
      if (status) status.textContent = "Verifying access…";
      const ok = await verify();
      if (!ok) return;

      if (status) status.textContent = "Access verified. Loading gallery…";
      await loadImages();
    } catch (e) {
      console.error(e);
      deny("Verification failed. Redirecting…");
    }
  })();
})();
