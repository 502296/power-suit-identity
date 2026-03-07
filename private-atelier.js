// private-atelier.js (FINAL)
// Verify session, then load atelier images inside private-atelier.html

(function () {
  const $ = (id) => document.getElementById(id);

  const yearEl = $("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const status = $("status");
  const galleryWrap = $("galleryWrap");
  const heroSlot = $("heroSlot");
  const gridSlot = $("gridSlot");
  const listSlot = $("listSlot");
  const upsell = $("upsell");
  const btnAnother = $("btnAnother");

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  function deny(message) {
    if (status) status.textContent = message || "Access not verified. Redirecting...";
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1200);
  }

  async function verifyAccess() {
    if (status) status.textContent = "Verifying payment...";

    if (!sessionId) {
      deny("Missing session. Redirecting...");
      return false;
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
        deny("Access not verified. Redirecting...");
        return false;
      }

      if (status) status.textContent = "Access verified. Loading selection...";
      return true;
    } catch (err) {
      console.error("Verification failed:", err);
      deny("Verification failed. Redirecting...");
      return false;
    }
  }

  function makeCard(file, extraClass = "") {
    const card = document.createElement("div");
    card.className = extraClass ? extraClass : "shot";

    const img = document.createElement("img");
    img.src = `/images/atelier/${file}`;
    img.alt = "Power Suit Identity Look";
    img.loading = "lazy";

    card.appendChild(img);
    return card;
  }

  async function loadImages() {
    try {
      const res = await fetch("/api/list-atelier-images", {
        headers: { Accept: "application/json" },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data || !Array.isArray(data.images) || !data.images.length) {
        console.error("Images load failed:", data);
        if (status) status.textContent = "Gallery error. Please try again.";
        return;
      }

      const images = data.images;

      if (heroSlot) heroSlot.innerHTML = "";
      if (gridSlot) gridSlot.innerHTML = "";
      if (listSlot) listSlot.innerHTML = "";

      // أول صورة = Hero
      if (images[0] && heroSlot) {
        const heroCard = makeCard(images[0], "hero-shot");
        heroSlot.appendChild(heroCard);
      }

      // 8 صور بعد الـ Hero = Grid
      const gridImages = images.slice(1, 9);
      gridImages.forEach((file) => {
        if (gridSlot) gridSlot.appendChild(makeCard(file, "shot"));
      });

      // الباقي = List
      const listImages = images.slice(9);
      listImages.forEach((file) => {
        if (listSlot) listSlot.appendChild(makeCard(file, "shot"));
      });

      if (galleryWrap) {
        galleryWrap.classList.remove("hidden");
        galleryWrap.setAttribute("aria-hidden", "false");
      }

      if (upsell) {
        upsell.classList.remove("hidden");
        upsell.setAttribute("aria-hidden", "false");
      }

      if (status) status.textContent = "";
    } catch (err) {
      console.error("Load images error:", err);
      if (status) status.textContent = "Failed to load gallery.";
    }
  }

  async function createAnotherLookSession() {
    try {
      if (btnAnother) {
        btnAnother.disabled = true;
        btnAnother.textContent = "Loading...";
      }

      const res = await fetch("/api/create-another-look-session", {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data || !data.url) {
        console.error("Another look session failed:", data);
        alert("Could not start checkout. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      if (btnAnother) {
        btnAnother.disabled = false;
        btnAnother.textContent = "Book Another Look";
      }
    }
  }

  if (btnAnother) {
    btnAnother.addEventListener("click", createAnotherLookSession);
  }

  (async function init() {
    const ok = await verifyAccess();
    if (!ok) return;
    await loadImages();
  })();
})();
