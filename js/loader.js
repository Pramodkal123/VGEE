(function () {
  const LOADER_ID = "site-loader";
  const HIDDEN_CLASS = "is-hidden";
  const ROOT_LOADING_CLASS = "is-loading";

  // Change this if you ever want to use the PNG instead
  const LOGO_SRC = "assets/icons/logo.svg";
  const LOGO_ALT = "VGEE";

  // Fallback so loader never gets stuck forever
  const FAILSAFE_MS = 3500;
  const REMOVE_DELAY_MS = 450;

  // Mark page as loading as early as possible
  document.documentElement.classList.add(ROOT_LOADING_CLASS);
  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add(ROOT_LOADING_CLASS);
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
      if (!document.body) return;
      document.body.prepend(loader);
    };

    if (document.body) {
      mount();
    } else {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    }
  }

  function hideLoader() {
    const loader = document.getElementById(LOADER_ID);
    if (!loader || loader.dataset.hidden === "true") return;

    loader.dataset.hidden = "true";
    loader.classList.add(HIDDEN_CLASS);

    document.documentElement.classList.remove(ROOT_LOADING_CLASS);
    document.body && document.body.classList.remove(ROOT_LOADING_CLASS);

    window.setTimeout(() => {
      loader.remove();
    }, REMOVE_DELAY_MS);
  }

  createLoader();

  window.addEventListener("load", hideLoader);

  window.setTimeout(hideLoader, FAILSAFE_MS);
})();