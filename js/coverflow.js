document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("ccfTrack");
  const dotsWrap = document.getElementById("ccfDots");
  const prevBtn = document.getElementById("ccfPrev");
  const nextBtn = document.getElementById("ccfNext");
  const flagEl = document.getElementById("ccfFlag");
  const nameEl = document.getElementById("ccfName");

  if (!track || !dotsWrap || !prevBtn || !nextBtn || !flagEl || !nameEl) {
    console.error("Slider init failed: missing required elements.");
    return;
  }

  // IMPORTANT: query cards AFTER DOM is ready
  const cards = Array.from(track.querySelectorAll(".ccf__card"));
  console.log("Cards found:", cards.length);

  if (cards.length === 0) {
    console.error("Slider init failed: no .ccf__card elements inside #ccfTrack.");
    return;
  }

  let active = 0;
  const wrap = (i, len) => (i + len) % len;

  function buildDots() {
    dotsWrap.innerHTML = cards
      .map((_, i) => `<button class="ccf__dot" data-i="${i}" aria-label="Go to slide ${i + 1}"></button>`)
      .join("");

    dotsWrap.querySelectorAll(".ccf__dot").forEach((d) => {
      d.addEventListener("click", () => {
        active = Number(d.dataset.i);
        render();
      });
    });
  }

  function updatePill() {
    const c = cards[active];
    flagEl.textContent = c.dataset.flag || "";
    nameEl.textContent = c.dataset.name || "";
  }

  function render() {
    const len = cards.length;

    updatePill();

    // dots state
    dotsWrap.querySelectorAll(".ccf__dot").forEach((d, i) => {
      d.classList.toggle("is-active", i === active);
    });





    // active card class (for hover hint)
    cards.forEach((card, i) => {
      card.classList.toggle("is-active", i === active);
    });





    // coverflow transforms
    cards.forEach((card, i) => {
      let offset = i - active;

      // wrapping logic
      if (offset > len / 2) offset -= len;
      if (offset < -len / 2) offset += len;

      const abs = Math.abs(offset);

      // --- TUNING (you can adjust later) ---
      const x = offset * 220;
      const scale = offset === 0 ? 1.08 : Math.max(0.82, 1 - abs * 0.11);
      const rotate = offset === 0 ? 0 : offset * -14;
      const z = offset === 0 ? 260 : 140 - abs * 45;
      // ------------------------------------

      const opacity = abs > 3 ? 0 : 1;
      const blur = abs === 0 ? 0 : Math.min(7, abs * 2.2);

      card.style.opacity = opacity;
      card.style.filter = `blur(${blur}px)`;
      card.style.transform =
        `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`;

      // keep center on top
      card.style.zIndex = String(1000 - abs * 20);
      card.style.pointerEvents = abs > 3 ? "none" : "auto";
    });
  }

  function go(dir) {
    active = wrap(active + dir, cards.length);
    render();
  }

  // --- ACTIVE CARD REDIRECT (base URL + per-card hash) ---
  // Add data-hash="#section" to each .ccf__card in your HTML
const BASE_URL = new URL("programs.html", window.location.href).toString();



  function redirectActiveCard() {
    const c = cards[active];
    const hash = c.dataset.hash || "";
    if (!hash) return;
    window.location.href = `${BASE_URL}${hash}`;
  }

  // click on card activates OR redirects if already active
  cards.forEach((card, i) => {
    card.addEventListener("click", () => {
      if (i === active) {
        redirectActiveCard();
        return;
      }
      active = i;
      render();
    });
  });

  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });

  buildDots();
  render();

  // --- AUTO PLAY ---
  const AUTO_DELAY = 2000; // 2 seconds (change if needed)
  let autoTimer = null;

  function startAutoPlay() {
    stopAutoPlay();
    autoTimer = setInterval(() => {
      go(1);
    }, AUTO_DELAY);
  }

  function stopAutoPlay() {
    if (autoTimer) clearInterval(autoTimer);
  }

  // pause on hover
  track.addEventListener("mouseenter", stopAutoPlay);
  track.addEventListener("mouseleave", startAutoPlay);

  // restart autoplay after manual interaction
  prevBtn.addEventListener("click", startAutoPlay);
  nextBtn.addEventListener("click", startAutoPlay);
  dotsWrap.addEventListener("click", startAutoPlay);

  startAutoPlay();
});
