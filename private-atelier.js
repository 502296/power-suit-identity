// private-atelier.js
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

  function showStatus(message) {
    if (status) status.textContent = message || "";
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
      showStatus("Loading your private selection...");

      const res = await fetch("/api/list-atelier-images");
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data || !Array.isArray(data.images) || data.images.length === 0) {
        showStatus("No images available right now.");
        return;
      }

      const images = data.images.slice();

      if (heroSlot) heroSlot.innerHTML = "";
      if (gridSlot) gridSlot.innerHTML = "";
      if (listSlot) listSlot.innerHTML = "";

      const heroImage = images.shift();
      if (heroImage && heroSlot) {
        heroSlot.appendChild(createImageCard(heroImage, "hero-shot"));
      }

      const gridImages = images.splice(0, 8);
      gridImages.forEach((fileName) => {
        if (gridSlot) gridSlot.appendChild(createImageCard(fileName, "shot"));
      });

      images.forEach((fileName) => {
        if (listSlot) listSlot.appendChild(createImageCard(fileName, "shot"));
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
      console.error(error);
      showStatus("Failed to load images.");
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
        alert("Unable to start checkout right now.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      btnAnother.disabled = false;
      btnAnother.textContent = originalText;
    }
  }

  if (btnAnother) {
    btnAnother.addEventListener("click", startAnotherLookCheckout);
  }

  loadImages();
})();
