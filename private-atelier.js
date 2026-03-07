// private-atelier.js
// FINAL — verifies Stripe session, then renders the private gallery on the same page

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

  function showStatus(message) {
    if (status) status.textContent = message || "";
  }

  function deny(message) {
    showStatus(message || "We couldn't confirm your access.");
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1500);
  }

  async function verifyAccess() {
    showStatus("Preparing your private selection...");

    if (!sessionId) {
      deny("We couldn't confirm your access.");
      return false;
    }

    try {
      const res = await fetch(
        `/api/verify-session?session_id=${encodeURIComponent(sessionId)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data || data.ok !== true) {
        console.error("verify-session failed:", data);
        deny("We couldn't confirm your access.");
        return false;
      }

      showStatus("Access confirmed. Loading your private selection...");
      return true;
    } catch (error) {
      console.error("verifyAccess error:", error);
      deny("Something went wrong while loading your selection.");
      return false;
    }
  }

  function createImageCard(fileName, className) {
    const card = document.createElement("div");
    card.className = className;

    const img = document.createElement("img");
    img.src = `/images/atelier/${fileName}`;
    img.alt = "Power Suit Identity private atelier look";
    img.loading = "lazy";
    img.decoding = "async";

    card.appendChild(img);
    return card;
  }

  async function loadImages() {
    try {
      const res = await fetch("/api/list-atelier-images", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data || !Array.isArray(data.images) || data.images.length === 0) {
        console.error("list-atelier-images failed:", data);
        showStatus("Your private selection is being prepared.");
        return;
      }

      const images = data.images.slice();

      if (heroSlot) heroSlot.innerHTML = "";
      if (gridSlot) gridSlot.innerHTML = "";
      if (listSlot) listSlot.innerHTML = "";

      // 1) Hero image
      const heroImage = images.shift();
      if (heroImage && heroSlot) {
        heroSlot.appendChild(createImageCard(heroImage, "hero-shot"));
      }

      // 2) Next 8 images in grid
      const gridImages = images.splice(0, 8);
      gridImages.forEach((fileName) => {
        if (gridSlot) {
          gridSlot.appendChild(createImageCard(fileName, "shot"));
        }
      });

      // 3) Remaining images in list
      images.forEach((fileName) => {
        if (listSlot) {
          listSlot.appendChild(createImageCard(fileName, "shot"));
        }
      });

      if (galleryWrap) {
        galleryWrap.classList.remove("hidden");
        galleryWrap.setAttribute("aria-hidden", "false");
      }

      if (upsell) {
        upsell.classList.remove("hidden");
        upsell.setAttribute("aria-hidden", "false");
      }

      showStatus("");
    } catch (error) {
      console.error("loadImages error:", error);
      showStatus("Your selection is ready shortly.");
    }
  }

  async function startAnotherLookCheckout() {
    if (!btnAnother) return;

    const originalText = btnAnother.textContent;

    try {
      btnAnother.disabled = true;
      btnAnother.textContent = "Loading...";

      const res = await fetch("/api/create-another-look-session", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data || !data.url) {
        console.error("create-another-look-session failed:", data);
        alert("Unable to start checkout right now.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("startAnotherLookCheckout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      btnAnother.disabled = false;
      btnAnother.textContent = originalText;
    }
  }

  if (btnAnother) {
    btnAnother.addEventListener("click", startAnotherLookCheckout);
  }

  (async function init() {
    const ok = await verifyAccess();
    if (!ok) return;

    await loadImages();
  })();
})();
