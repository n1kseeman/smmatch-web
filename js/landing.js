(() => {
  const root = document.querySelector("body.smm-home");
  const themeButton = document.querySelector(".smm-home [data-theme-toggle]");
  const menuButton = document.querySelector(".smm-home [data-menu-btn]");
  const mobileNav = document.querySelector(".smm-home [data-mobile-nav]");

  const setTheme = (theme) => {
    if (!(root instanceof HTMLElement)) return;
    root.dataset.theme = theme;
    const isDark = theme === "dark";
    document.documentElement.style.colorScheme = theme;
    if (themeButton instanceof HTMLButtonElement) {
      themeButton.setAttribute("aria-pressed", String(isDark));
      themeButton.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
    }
  };

  if (root instanceof HTMLElement) {
    let savedTheme = null;
    try {
      savedTheme = window.localStorage.getItem("smmatch-theme");
    } catch {
      // The interface remains functional when storage is unavailable.
    }
    setTheme(savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  if (themeButton instanceof HTMLButtonElement) {
    themeButton.addEventListener("click", () => {
      const nextTheme = root?.dataset.theme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
      try {
        window.localStorage.setItem("smmatch-theme", nextTheme);
      } catch {
        // A theme preference is optional, so storage failures need no UI error.
      }
    });
  }

  if (!(menuButton instanceof HTMLButtonElement) || !(mobileNav instanceof HTMLElement)) {
    return;
  }

  const closeMenu = () => {
    menuButton.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("show");
    mobileNav.setAttribute("aria-hidden", "true");
  };

  menuButton.setAttribute("aria-expanded", "false");
  mobileNav.setAttribute("aria-hidden", "true");
  menuButton.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("show");
    menuButton.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    mobileNav.setAttribute("aria-hidden", String(!isOpen));
  });
  mobileNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 680) closeMenu();
  });
})();
