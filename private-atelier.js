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

  const MAX_IMAGES = 99;
  const GRID_COUNT = 8;
  const LIST_BATCH_SIZE = 4;
  const LIST_BATCH_DELAY = 180;

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

    img.onerror = function () {
      card.remove();
    };

    card.appendChild(img);
    return card;
  }

  function buildImageList() {
    const images = [];
    for (let i = 1; i <= MAX_IMAGES; i++) {
      images.push(`${String(i).padStart(2, "0")}.jpg`);
    }
    return images;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function renderListInBatches(images) {
    if (!listSlot || !images.length) return;

    for (let i = 0; i < images.length; i += LIST_BATCH_SIZE) {
      const batch = images.slice(i, i + LIST_BATCH_SIZE);

      batch.forEach((fileName) => {
        listSlot.appendChild(createImageCard(fileName, "shot"));
      });

      await sleep(LIST_BATCH_DELAY);
    }
  }

  async function loadImagesDirectly() {
    try {
      showStatus("Loading your private selection...");

      const images = buildImageList();

      if (!images.length) {
        showStatus("No images available right now.");
        return;
      }

      if (heroSlot) heroSlot.innerHTML = "";
      if (gridSlot) gridSlot.innerHTML = "";
      if (listSlot) listSlot.innerHTML = "";

      const imagePool = [...images];

      const heroImage = imagePool.shift();
      if (heroImage && heroSlot) {
        heroSlot.appendChild(createImageCard(heroImage, "hero-shot"));
      }

      const gridImages = imagePool.splice(0, GRID_COUNT);
      gridImages.forEach((fileName) => {
        if (gridSlot) gridSlot.appendChild(createImageCard(fileName, "shot"));
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

      // Load the rest gradually so the page feels fast on mobile
      await renderListInBatches(imagePool);
    } catch (error) {
      console.error("loadImagesDirectly error:", error);
      showStatus("Failed to load images.");
    }
  }

  function getSavedRequestPayload() {
    try {
      const raw = localStorage.getItem("psi_request_payload");
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  async function startAnotherLookCheckout() {
    if (!btnAnother) return;

    const originalText = btnAnother.textContent;

    try {
      btnAnother.disabled = true;
      btnAnother.textContent = "Loading...";

      const saved = getSavedRequestPayload();

      const payload = {
        email: saved.email || "",
        fullName: saved.fullName || "",
      };

      const res = await fetch("/api/create-another-look-session", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data || !data.url) {
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

  loadImagesDirectly();
})();
