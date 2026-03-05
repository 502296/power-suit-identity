// private-atelier.js (FULL) — Verified access + Hero + Grid + List + Upsell
// ✅ Updated: image path fallback + clearer debugging

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

    loadGallery();
  }

  function cleanFileName(file) {
    return String(file || "").replace(/[^a-zA-Z0-9._-]/g, "");
  }

  // ✅ Try these base paths in order
  // 1) Vercel/static: /images/atelier/..  (if files are in /public/images/atelier)
  // 2) Some builds:  /public/images/atelier/.. (rare, but harmless)
  const IMAGE_BASES = ["/images/atelier/", "/public/images/atelier/"];

  function createSmartImg(file, alt, loading) {
    const safeFile = cleanFileName(file);
    const img = document.createElement("img");
    img.alt = alt || "Power Suit Identity — Private Atelier";
    img.loading = loading || "lazy";

    let idx = 0;
    const tryNext = () => {
      if (idx >= IMAGE_BASES.length) {
        console.warn("Image failed in all paths:", safeFile);
        return;
      }
      img.src = IMAGE_BASES[idx] + safeFile;
      idx++;
    };

    img.addEventListener("error", () => tryNext());
    tryNext();
    return img;
  }

  function renderHero(file) {
    if (!heroSlot) return;

    heroSlot.innerHTML = "";

    const safeFile = cleanFileName(file);
    if (!safeFile) return;

    const wrap = document.createElement("figure");
    wrap.className = "hero-shot";

    const img = createSmartImg(
      safeFile,
      "Power Suit Identity — Featured Look",
      "eager"
    );

    const cap = document.createElement("div");
    cap.className = "hero-cap";
    cap.innerHTML = `<b>Featured Look</b><span>Private Atelier</span>`;

    wrap.appendChild(img);
    wrap.appendChild(cap);

    heroSlot.appendChild(wrap);
  }

  function makeFigure(cls, file, caption) {
    const safeFile = cleanFileName(file);
    if (!safeFile) return null;

    const fig = document.createElement("figure");
    fig.className = cls;

    const img = createSmartImg(
      safeFile,
      "Power Suit Identity — Private Atelier",
      "lazy"
    );

    const fc = document.createElement("figcaption");
    fc.textContent = caption || "Power Suit Identity";

    fig.appendChild(img);
    fig.appendChild(fc);

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
        console.error("Bad gallery response:", data);
        if (status) status.textContent = "Gallery error. Please try again.";
        return;
      }

      const images = data.images.map(cleanFileName).filter(Boolean);

      if (images.length === 0) {
        console.warn("No images returned from API");
        if (status) status.textContent = "Verified, but no images found.";
        return;
      }

      if (gridSlot) gridSlot.innerHTML = "";
      if (listSlot) listSlot.innerHTML = "";

      renderHero(images[0]);

      const gridImages = images.slice(1, 9);
      gridImages.forEach((file) => {
        const fig = makeFigure("grid-item", file, "Power Suit Identity");
        if (fig && gridSlot) gridSlot.appendChild(fig);
      });

      const rest = images.slice(9);
      rest.forEach((file) => {
        const fig = makeFigure("list-item", file, "Power Suit Identity");
        if (fig && listSlot) listSlot.appendChild(fig);
      });
    } catch (e) {
      console.error("Gallery load error:", e);
      if (status) status.textContent = "Gallery failed to load. Please try again.";
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
        { method: "GET", headers: { Accept: "application/json" } }
      );

      const data = await res.json();

      if (!res.ok || !data || !data.ok) {
        console.error("Not verified:", data);
        status.textContent = "Access not verified. Redirecting…";
        return setTimeout(deny, 700);
      }

      showVerified();

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

            if (!r.ok || !j || !j.url) throw new Error("No checkout url returned");

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

  verifyAccess();
})();
