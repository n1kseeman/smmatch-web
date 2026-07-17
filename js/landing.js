(() => {
  const root = document.querySelector("body.smm-home");
  const menuButton = document.querySelector(".smm-home [data-menu-btn]");
  const mobileNav = document.querySelector(".smm-home [data-mobile-nav]");

  if (root instanceof HTMLElement) {
    root.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";
  }

  if (!(menuButton instanceof HTMLButtonElement) || !(mobileNav instanceof HTMLElement)) {
    return;
  }

  const closeMenu = () => {
    menuButton.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("show");
    mobileNav.setAttribute("aria-hidden", "true");
    root?.classList.remove("menu-open");
  };

  menuButton.setAttribute("aria-expanded", "false");
  mobileNav.setAttribute("aria-hidden", "true");
  menuButton.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("show");
    menuButton.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    mobileNav.setAttribute("aria-hidden", String(!isOpen));
    root?.classList.toggle("menu-open", isOpen);
  });
  mobileNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) closeMenu();
  });
})();
