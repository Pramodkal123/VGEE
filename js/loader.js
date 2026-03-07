(function () {
  const LOADER_ID = "site-loader";
  const HIDDEN_CLASS = "is-hidden";
  const ROOT_LOADING_CLASS = "is-loading";

  const LOGO_SRC = "assets/icons/logo.svg";
  const LOGO_ALT = "VGEE";

  // Loader timing
  const MIN_DISPLAY_MS = 2000;   // keep loader visible at least 2 seconds
  const FAILSAFE_MS = 6000;      // hard fallback
  const REMOVE_DELAY_MS = 450;   // should match CSS fade duration

  let pageLoaded = false;
  let minTimeElapsed = false;
  let heroReady = false;
  let loaderHidden = false;

  document.documentElement.classList.add(ROOT_LOADING_CLASS);
  document.addEventListener("DOMContentLoaded", () => {
    if (document.body) {
      document.body.classList.add(ROOT_LOADING_CLASS);
    }
  });

  function createLoader() {
    if (document.getElementById(LOADER_ID)) return;

    const loader = document.createElement("div");
    loader.id = LOADER_ID;
    loader.setAttribute("aria-hidden", "true");

    loader.innerHTML = `
      <div class="site-loader__inner">
        <div class="site-loader__ring"></div>
        <div class="site-loader__logo-wrap">
          <img class="site-loader__logo" src="${LOGO_SRC}" alt="${LOGO_ALT}">
        </div>
      </div>
    `;

    const mount = () => {
      if (document.body) {
        document.body.prepend(loader);
      }
    };

    if (document.body) {
      mount();
    } else {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    }
  }

  function cleanupLoadingState() {
    document.documentElement.classList.remove(ROOT_LOADING_CLASS);
    if (document.body) {
      document.body.classList.remove(ROOT_LOADING_CLASS);
    }
  }

  function hideLoader() {
    if (loaderHidden) return;

    const loader = document.getElementById(LOADER_ID);
    if (!loader) {
      cleanupLoadingState();
      loaderHidden = true;
      return;
    }

    loaderHidden = true;
    loader.classList.add(HIDDEN_CLASS);
    cleanupLoadingState();

    window.setTimeout(() => {
      loader.remove();
    }, REMOVE_DELAY_MS);
  }

  function tryHideLoader() {
    if (pageLoaded && minTimeElapsed && heroReady) {
      hideLoader();
    }
  }

  function markHeroReady() {
    heroReady = true;
    tryHideLoader();
  }

  function waitForHeroAssets() {
    const heroVideo = document.querySelector(".bridge-hero__bg");
    const heroFallback = document.querySelector(".bridge-hero__fallback");

    // If hero video exists, consider it ready when it has enough data to render first frame
    if (heroVideo) {
      if (heroVideo.readyState >= 2) {
        markHeroReady();
        return;
      }

      const onVideoReady = () => {
        heroVideo.removeEventListener("loadeddata", onVideoReady);
        heroVideo.removeEventListener("canplay", onVideoReady);
        markHeroReady();
      };

      heroVideo.addEventListener("loadeddata", onVideoReady, { once: true });
      heroVideo.addEventListener("canplay", onVideoReady, { once: true });

      // backup in case browser behaves differently
      window.setTimeout(markHeroReady, 2500);
      return;
    }

    // If fallback hero image exists
    if (heroFallback) {
      if (heroFallback.complete) {
        markHeroReady();
        return;
      }

      heroFallback.addEventListener("load", markHeroReady, { once: true });
      heroFallback.addEventListener("error", markHeroReady, { once: true });

      window.setTimeout(markHeroReady, 2000);
      return;
    }

    // No hero asset to wait for
    markHeroReady();
  }

  createLoader();
  waitForHeroAssets();

  // Minimum display time
  window.setTimeout(() => {
    minTimeElapsed = true;
    tryHideLoader();
  }, MIN_DISPLAY_MS);

  // Full page load
  window.addEventListener("load", () => {
    pageLoaded = true;
    tryHideLoader();
  });

  // Failsafe
  window.setTimeout(() => {
    hideLoader();
  }, FAILSAFE_MS);
})();