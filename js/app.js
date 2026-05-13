(function () {
  "use strict";

  const STORAGE_KEY = "smmatch_state_v1";
  const STATE_VERSION = 2;

  const path = window.location.pathname;
  const isPath = (chunk) => path.includes(chunk);
  const isAuthPage = isPath("/auth/login/") || isPath("/auth/register/") || isPath("/auth/forgot/");

  const scriptEl = document.querySelector("script[src*='js/app.js']");
  const scriptUrl = scriptEl ? new URL(scriptEl.getAttribute("src"), window.location.href) : null;
  const appRootUrl = scriptUrl ? new URL("../", scriptUrl) : new URL("./", window.location.href);

  function appUrl(relativePath) {
    return new URL(relativePath, appRootUrl).toString();
  }

  function appPath(relativePath) {
    return new URL(relativePath, appRootUrl).pathname;
  }

  function normalizePathname(pathname) {
    const compact = String(pathname || "/").replace(/\/{2,}/g, "/");
    if (compact.length > 1 && compact.endsWith("/")) {
      return compact.slice(0, -1);
    }
    return compact;
  }

  function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("ru-RU");
  }

  function formatMoneyRub(amount) {
    return `${Number(amount).toLocaleString("ru-RU")} ₽`;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function hashSeed(value) {
    let hash = 2166136261;
    const text = String(value || "smmatch");
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash >>> 0);
  }

  function seededNumber(seed, min, max) {
    const h = hashSeed(seed);
    const ratio = (h % 1000) / 1000;
    return min + (max - min) * ratio;
  }

  function pickVisualTheme(text) {
    const source = normalize(text);
    if (
      source.includes("reels") ||
      source.includes("tiktok") ||
      source.includes("short") ||
      source.includes("ugc") ||
      source.includes("монтаж")
    ) {
      return "reels";
    }
    if (
      source.includes("таргет") ||
      source.includes("аналит") ||
      source.includes("roi") ||
      source.includes("метрик") ||
      source.includes("конверс")
    ) {
      return "analytics";
    }
    if (source.includes("кейс") || source.includes("результат") || source.includes("продаж") || source.includes("рост")) {
      return "growth";
    }
    if (
      source.includes("блог") ||
      source.includes("контент") ||
      source.includes("стратег") ||
      source.includes("сторител")
    ) {
      return "content";
    }
    if (source.includes("специалист") || source.includes("бизнес") || source.includes("команд")) {
      return "team";
    }
    if (source.includes("вериф") || source.includes("безопас") || source.includes("сделк")) {
      return "security";
    }
    if (source.includes("съемк") || source.includes("камера") || source.includes("креатив")) {
      return "media";
    }
    if (source.includes("платформ") || source.includes("instagram") || source.includes("vk") || source.includes("telegram")) {
      return "mobile";
    }
    return "social";
  }

  function buildVisualDataUri(seedLabel, theme) {
    const h = hashSeed(`${theme}:${seedLabel}`);
    const hueA = h % 360;
    const hueB = (hueA + 52 + (h % 120)) % 360;
    const hueC = (hueA + 180) % 360;

    const bars = Array.from({ length: 4 })
      .map((_, i) => {
        const x = 180 + i * 180;
        const height = Math.round(seededNumber(`${seedLabel}:${i}`, 120, 420));
        const y = 820 - height;
        return `<rect x="${x}" y="${y}" width="120" height="${height}" rx="18" fill="hsla(${hueB},85%,62%,0.42)"/>`;
      })
      .join("");

    const dots = Array.from({ length: 3 })
      .map((_, i) => {
        const cx = Math.round(seededNumber(`${seedLabel}:dot:${i}`, 360, 1320));
        const cy = Math.round(seededNumber(`${seedLabel}:doty:${i}`, 180, 760));
        const r = Math.round(seededNumber(`${seedLabel}:dotr:${i}`, 44, 90));
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="hsla(${hueC},90%,65%,0.22)"/>`;
      })
      .join("");

    const title = String(theme || "smm").slice(0, 12).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hueA},46%,17%)"/>
      <stop offset="1" stop-color="hsl(${hueB},48%,10%)"/>
    </linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="hsla(${hueB},90%,64%,0.9)"/>
      <stop offset="1" stop-color="hsla(${hueC},90%,66%,0.9)"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#bg)"/>
  ${dots}
  <rect x="120" y="150" width="1360" height="700" rx="28" fill="hsla(${hueA},55%,10%,0.64)" stroke="hsla(${hueC},80%,76%,0.26)" stroke-width="3"/>
  <path d="M220 700 L480 620 L760 470 L1040 360 L1320 240" fill="none" stroke="url(#line)" stroke-width="8" stroke-linecap="round"/>
  ${bars}
  <text x="220" y="250" fill="hsla(${hueC},95%,92%,0.9)" font-family="Sora, Manrope, sans-serif" font-size="62" font-weight="700">${title}</text>
</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  function showToast(message, type = "ok") {
    const existing = document.querySelector(".app-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "app-toast";
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.right = "16px";
    toast.style.bottom = "16px";
    toast.style.zIndex = "1000";
    toast.style.padding = "10px 12px";
    toast.style.borderRadius = "10px";
    toast.style.border = "1px solid rgba(255,255,255,0.15)";
    toast.style.background = type === "error" ? "rgba(255, 111, 142, 0.95)" : "rgba(46, 211, 154, 0.95)";
    toast.style.color = "#fff";
    toast.style.fontWeight = "700";
    toast.style.fontSize = "0.86rem";
    toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.25)";
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2200);
  }

  function seedState() {
    return {
      version: STATE_VERSION,
      users: [],
      currentUserId: null,
      specialists: [],
      tasks: [],
      favoritesByUser: {},
      conversations: [],
      reviews: [],
      payments: [],
      ai: {
        lastMatchTaskId: null,
        lastAudit: null,
        lastContentIdeas: null
      },
      ui: {
        selectedSpecialistId: null,
        selectedBusinessConversationId: null,
        selectedSpecialistConversationId: null
      }
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = seedState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid state");
      }
      if (parsed.version !== STATE_VERSION) {
        const seeded = seedState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return parsed;
    } catch (error) {
      const seeded = seedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
  }

  const state = loadState();

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function findSpecialistById(id) {
    return state.specialists.find((item) => item.id === id) || null;
  }

  function findUserById(id) {
    return state.users.find((item) => item.id === id) || null;
  }

  function currentUser() {
    return findUserById(state.currentUserId);
  }

  function ensureConversation(businessUserId, specialistId) {
    let convo = state.conversations.find(
      (item) => item.businessUserId === businessUserId && item.specialistId === specialistId
    );

    if (!convo) {
      convo = {
        id: uid("conv"),
        businessUserId,
        specialistId,
        messages: [{ id: uid("msg"), senderRole: "system", text: "Диалог создан.", ts: nowIso() }]
      };
      state.conversations.unshift(convo);
      saveState();
    }
    return convo;
  }

  function addMessage(conversationId, senderRole, text) {
    const convo = state.conversations.find((item) => item.id === conversationId);
    if (!convo) return;
    convo.messages.push({ id: uid("msg"), senderRole, text, ts: nowIso() });
    saveState();
  }

  function specialistName(id) {
    const specialist = findSpecialistById(id);
    return specialist ? specialist.name : "Неизвестный специалист";
  }

  function requireLoggedInBusiness(silent) {
    const user = currentUser();
    if (!user || user.role !== "business") {
      if (!silent) showToast("Войдите как бизнес-аккаунт", "error");
      return null;
    }
    return user;
  }

  function requestAuthForAction(message) {
    const user = currentUser();
    if (!user) {
      showToast(message || "Сначала войдите или зарегистрируйтесь", "error");
      window.setTimeout(redirectToLogin, 250);
      return null;
    }
    return user;
  }

  function requireBusinessForAction() {
    const user = requestAuthForAction("Сначала войдите или зарегистрируйтесь");
    if (!user) return null;
    if (user.role !== "business") {
      showToast("Это действие доступно бизнес-аккаунту", "error");
      return null;
    }
    return user;
  }

  function requireSpecialistForAction() {
    const user = requestAuthForAction("Сначала войдите или зарегистрируйтесь");
    if (!user) return null;
    if (user.role !== "specialist") {
      showToast("Это действие доступно аккаунту специалиста", "error");
      return null;
    }
    return user;
  }

  function getRedirectAfterLogin() {
    const url = new URL(window.location.href);
    const next = url.searchParams.get("next");
    if (!next) return null;
    try {
      const nextUrl = new URL(next, window.location.origin);
      if (nextUrl.origin !== window.location.origin) return null;
      return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
    } catch (error) {
      return null;
    }
  }

  function redirectToLogin() {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.href = `${appUrl("auth/login/index.html")}?next=${encodeURIComponent(next)}`;
  }

  function requiredRoleForPath(pathname) {
    const normalizedPath = normalizePathname(pathname);
    if (normalizedPath.includes("/dashboard/business/") || normalizedPath.includes("/task/new/")) {
      return "business";
    }
    if (normalizedPath.includes("/dashboard/specialist/")) {
      return "specialist";
    }
    return null;
  }

  function defaultDashboardByRole(role) {
    return role === "specialist" ? appUrl("dashboard/specialist/index.html") : appUrl("dashboard/business/index.html");
  }

  function resolvePostAuthDestination(user) {
    const next = getRedirectAfterLogin();
    if (next) {
      const requiredRole = requiredRoleForPath(next);
      if (!requiredRole || requiredRole === user.role) {
        return next;
      }
    }
    return defaultDashboardByRole(user.role);
  }

  function enforceSessionAndRole() {
    const user = currentUser();
    if (!user) return true;

    if (isAuthPage) {
      window.location.href = resolvePostAuthDestination(user);
      return false;
    }

    const onBusinessOnlyRoute = isPath("/dashboard/business/") || isPath("/task/new/");
    const onSpecialistOnlyRoute = isPath("/dashboard/specialist/");

    if (user.role === "business" && onSpecialistOnlyRoute) {
      window.location.href = appUrl("dashboard/business/index.html");
      return false;
    }

    if (user.role === "specialist" && onBusinessOnlyRoute) {
      window.location.href = appUrl("dashboard/specialist/index.html");
      return false;
    }

    return true;
  }

  function initTopbarActionsByRole() {
    const actions = document.querySelector(".topbar .actions");
    if (!actions) return;

    actions.querySelectorAll("[data-dynamic-action]").forEach((item) => item.remove());
    actions.querySelectorAll("a.btn, button.btn").forEach((item) => {
      if (item.hasAttribute("data-menu-btn")) return;
      item.style.display = "none";
    });

    function addAction(label, relativePath, className) {
      const link = document.createElement("a");
      link.className = className;
      link.href = appUrl(relativePath);
      link.textContent = label;
      link.setAttribute("data-dynamic-action", "1");
      actions.insertBefore(link, actions.querySelector("[data-menu-btn]") || null);
    }

    function addLogout() {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-ghost keep-mobile";
      button.textContent = "Выйти";
      button.setAttribute("data-dynamic-action", "1");
      button.addEventListener("click", () => {
        state.currentUserId = null;
        saveState();
        window.location.href = appUrl("index.html");
      });
      actions.insertBefore(button, actions.querySelector("[data-menu-btn]") || null);
    }

    const user = currentUser();
    if (!user) {
      addAction("Войти", "auth/login/index.html", "btn btn-ghost keep-mobile");
      addAction("Регистрация", "auth/register/index.html", "btn btn-primary keep-mobile");
      return;
    }

    if (user.role === "business") {
      addAction("Кабинет", "dashboard/business/index.html", "btn btn-ghost keep-mobile");
      addAction("Разместить задачу", "task/new/index.html", "btn btn-primary keep-mobile");
      addLogout();
      return;
    }

    addAction("Кабинет", "dashboard/specialist/index.html", "btn btn-ghost keep-mobile");
    addAction("Мой профиль", "u/username/index.html", "btn btn-primary keep-mobile");
    addLogout();
  }

  function initActionGuardsForLinks() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const link = target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      const needsAuth = link.hasAttribute("data-auth-action");
      if (!needsAuth) return;
      event.preventDefault();
      requestAuthForAction();
    });
  }

  function initGlobalRoiNavLink() {
    const roiHref = appUrl("roi-calculator/index.html");

    document.querySelectorAll(".nav").forEach((nav) => {
      if (nav.querySelector("[data-global-roi-link]")) return;
      const link = document.createElement("a");
      link.href = roiHref;
      link.textContent = "ROI-калькулятор";
      link.setAttribute("data-global-roi-link", "1");
      if (isPath("/roi-calculator/")) link.classList.add("active");

      const blogLink = Array.from(nav.querySelectorAll("a")).find((item) => normalize(item.textContent).includes("блог"));
      nav.insertBefore(link, blogLink || null);
    });

    document.querySelectorAll("[data-mobile-nav]").forEach((mobileNav) => {
      if (mobileNav.querySelector("[data-global-roi-link]")) return;
      const link = document.createElement("a");
      link.href = roiHref;
      link.textContent = "ROI-калькулятор";
      link.setAttribute("data-global-roi-link", "1");
      mobileNav.appendChild(link);
    });
  }

  function initGlobalAnimations() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = document.querySelectorAll(
      "main .page-hero, main .section-head, main .card, main .panel-item, main .blog-item, main .catalog-card, main .case-card, main .stat-box"
    );
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );

    items.forEach((item, index) => {
      if (item.classList.contains("reveal")) return;
      item.classList.add("auto-reveal");
      item.style.transitionDelay = `${Math.min(index % 6, 5) * 0.05}s`;
      observer.observe(item);
    });
  }

  function initPageHeroVisuals() {
    const hero = document.querySelector(".page-hero");
    if (!hero || hero.querySelector(".hero-collage") || isPath("/roi-calculator/")) return;
    if (isPath("/dashboard/") || isPath("/auth/")) return;

    const title = hero.querySelector("h1")?.textContent || "";
    const collage = document.createElement("div");
    collage.className = "hero-collage";
    const baseTheme = pickVisualTheme(title);
    const visuals = Array.from({ length: 3 }).map((_, index) =>
      buildVisualDataUri(`${window.location.pathname}:hero:${index}:${title}`, index === 0 ? baseTheme : "analytics")
    );

    visuals.forEach((url) => {
      const item = document.createElement("div");
      item.className = "hero-collage-item";
      item.style.setProperty("--hero-photo", `url("${url}")`);
      collage.appendChild(item);
    });

    hero.classList.add("with-collage");
    hero.appendChild(collage);
  }

  function initCardVisualBoost() {
    const cards = document.querySelectorAll("main .card");
    if (!cards.length) return;

    cards.forEach((card, index) => {
      if (
        card.querySelector(".card-photo, .case-image, .specialist-thumb, .blog-thumb, .avatar, .profile-avatar, .roi-hero-board")
      ) {
        return;
      }
      if (card.querySelector("form, table, input, select, textarea, .chat, .panel-list, .kpi-cards")) return;
      if (card.closest(".roi-layout, .roi-hero, .roi-help-grid")) return;
      if (card.classList.contains("stat-box")) return;

      const title = card.querySelector("h1, h2, h3, h4, strong")?.textContent || card.textContent.slice(0, 120);
      const theme = pickVisualTheme(title);
      const photo = document.createElement("div");
      photo.className = "card-photo";
      photo.style.setProperty(
        "--card-photo",
        `url("${buildVisualDataUri(`${window.location.pathname}:card:${index}:${title}`, theme)}")`
      );
      card.insertBefore(photo, card.firstChild);
      card.classList.add("card-has-photo");
    });
  }

  function initMediaBlockVariations() {
    const mediaSelectors = [
      ".specialist-thumb",
      ".case-image",
      ".avatar",
      ".profile-avatar",
      ".blog-thumb"
    ];
    const nodes = document.querySelectorAll(mediaSelectors.join(","));
    nodes.forEach((node, index) => {
      const title =
        node.closest(".card, article")?.querySelector("h1, h2, h3, h4, strong")?.textContent ||
        node.className ||
        "visual";
      const theme = pickVisualTheme(title);
      node.style.setProperty(
        "--media-photo",
        `url("${buildVisualDataUri(`${window.location.pathname}:media:${index}:${title}`, theme)}")`
      );
    });
  }

  function initMobileMenu() {
    const menuBtn = document.querySelector("[data-menu-btn]");
    const mobileNav = document.querySelector("[data-mobile-nav]");
    if (!menuBtn || !mobileNav) return;

    const buttonLabel = (menuBtn.textContent || "").trim() || "Меню";
    menuBtn.innerHTML = `<span class="sr-only">${buttonLabel}</span><span class="menu-icon" aria-hidden="true"></span>`;
    menuBtn.setAttribute("aria-label", buttonLabel);
    menuBtn.setAttribute("aria-expanded", "false");

    function openMenu() {
      menuBtn.classList.add("is-open");
      mobileNav.classList.add("show");
      document.body.classList.add("menu-open");
      menuBtn.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      menuBtn.classList.remove("is-open");
      mobileNav.classList.remove("show");
      document.body.classList.remove("menu-open");
      menuBtn.setAttribute("aria-expanded", "false");
    }

    menuBtn.addEventListener("click", () => {
      if (mobileNav.classList.contains("show")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileNav.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  function initFilterOptionToggle() {
    const options = document.querySelectorAll(".option");
    options.forEach((option) => {
      option.addEventListener("click", () => {
        option.classList.toggle("active");
      });
    });
  }

  function initRoiCalculator() {
    const roiForm = document.querySelector("[data-roi-form]");
    const roiResult = document.querySelector("[data-roi-result]");
    if (!roiForm || !roiResult) return;

    roiForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const budget = Number(roiForm.elements.budget.value) || 0;
      const avgCheck = Number(roiForm.elements.avg_check.value) || 0;
      const conversion = Number(roiForm.elements.conversion.value) || 0;
      const estimatedLeads = Math.max(Math.round((budget / 10) * 1.9), 0);
      const estimatedClients = Math.max(Math.round(estimatedLeads * (conversion / 100)), 0);
      const estimatedRevenue = estimatedClients * avgCheck;

      roiResult.innerHTML = `
        <strong>${estimatedLeads}</strong> потенциальных лидов в месяц<br>
        <strong>${estimatedClients}</strong> клиентов при текущей конверсии<br>
        <strong>${estimatedRevenue.toLocaleString("ru-RU")} ₽</strong> прогноз оборота
      `;
    });
  }

  function initRoiCalculatorPage() {
    if (!isPath("/roi-calculator/")) return;
    const root = document.querySelector("[data-roi-tool]");
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fields = {
      smm: root.querySelector("[name='smm_costs']"),
      ads: root.querySelector("[name='ads_budget']"),
      extra: root.querySelector("[name='extra_costs']"),
      leads: root.querySelector("[name='leads']"),
      sales: root.querySelector("[name='sales']"),
      avg: root.querySelector("[name='avg_check']"),
      margin: root.querySelector("[name='margin']"),
      currency: root.querySelector("[name='currency']")
    };
    const metricNodes = {
      roi: root.querySelector("[data-roi-value='roi']"),
      totalCosts: root.querySelector("[data-roi-value='total-costs']"),
      revenue: root.querySelector("[data-roi-value='revenue']"),
      netProfit: root.querySelector("[data-roi-value='net-profit']"),
      cpl: root.querySelector("[data-roi-value='cpl']"),
      cps: root.querySelector("[data-roi-value='cps']"),
      conversion: root.querySelector("[data-roi-value='conversion']")
    };
    const stateCard = root.querySelector("[data-roi-state]");
    const copyBtn = root.querySelector("[data-roi-copy]");
    const currencyBadges = root.querySelectorAll("[data-roi-currency]");

    if (!fields.smm || !fields.currency || !metricNodes.roi) return;

    let previous = {
      roi: 0,
      totalCosts: 0,
      revenue: 0,
      netProfit: 0,
      cpl: null,
      cps: null,
      conversion: null
    };

    function parseNumber(node) {
      if (!node) return 0;
      const parsed = Number(node.value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    function formatMoney(value, currency) {
      return `${value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
    }

    function formatPercent(value) {
      const sign = value > 0 ? "+" : "";
      return `${sign}${value.toFixed(1)}%`;
    }

    function animateValue(node, from, to, formatter) {
      if (!node) return;
      if (to === null || !Number.isFinite(to)) {
        node.textContent = "—";
        return;
      }
      if (reduceMotion) {
        node.textContent = formatter(to);
        return;
      }
      const start = performance.now();
      const duration = 420;
      const fromNum = Number.isFinite(from) ? from : 0;
      const delta = to - fromNum;

      function frame(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = fromNum + delta * eased;
        node.textContent = formatter(value);
        if (p < 1) requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    }

    function recalc() {
      const smm = Math.max(0, parseNumber(fields.smm));
      const ads = Math.max(0, parseNumber(fields.ads));
      const extra = Math.max(0, parseNumber(fields.extra));
      const leads = Math.max(0, parseNumber(fields.leads));
      const sales = Math.max(0, parseNumber(fields.sales));
      const avgCheck = Math.max(0, parseNumber(fields.avg));
      const margin = Math.max(0, parseNumber(fields.margin));
      const currency = (fields.currency.value || "BYN").toUpperCase();

      const totalCosts = smm + ads + extra;
      const revenue = sales * avgCheck;
      const netProfit = revenue * (margin / 100);
      const roi = totalCosts > 0 ? ((netProfit - totalCosts) / totalCosts) * 100 : null;
      const cpl = leads > 0 ? totalCosts / leads : null;
      const cps = sales > 0 ? totalCosts / sales : null;
      const conversion = leads > 0 ? (sales / leads) * 100 : null;

      const next = { roi, totalCosts, revenue, netProfit, cpl, cps, conversion };
      animateValue(metricNodes.roi, previous.roi, next.roi, (v) => formatPercent(v));
      animateValue(metricNodes.totalCosts, previous.totalCosts, next.totalCosts, (v) => formatMoney(v, currency));
      animateValue(metricNodes.revenue, previous.revenue, next.revenue, (v) => formatMoney(v, currency));
      animateValue(metricNodes.netProfit, previous.netProfit, next.netProfit, (v) => formatMoney(v, currency));
      animateValue(metricNodes.cpl, previous.cpl, next.cpl, (v) => formatMoney(v, currency));
      animateValue(metricNodes.cps, previous.cps, next.cps, (v) => formatMoney(v, currency));
      animateValue(metricNodes.conversion, previous.conversion, next.conversion, (v) => `${v.toFixed(1)}%`);

      currencyBadges.forEach((item) => {
        item.textContent = currency;
      });

      if (stateCard) {
        stateCard.classList.remove("positive", "neutral", "negative");
        if (roi === null) {
          stateCard.classList.add("neutral");
          stateCard.textContent = "Введите данные для расчета ROI.";
        } else if (roi > 0) {
          stateCard.classList.add("positive");
          stateCard.textContent = "SMM окупается и приносит прибыль.";
        } else if (roi < 0) {
          stateCard.classList.add("negative");
          stateCard.textContent = "SMM пока не окупается. Стоит пересмотреть стратегию.";
        } else {
          stateCard.classList.add("neutral");
          stateCard.textContent = "Продвижение работает в ноль.";
        }
      }

      previous = next;
      root.setAttribute("data-roi-report", JSON.stringify({ ...next, currency }));
    }

    function buildReport() {
      const raw = root.getAttribute("data-roi-report");
      if (!raw) return "";
      try {
        const report = JSON.parse(raw);
        return [
          `ROI: ${report.roi === null ? "—" : formatPercent(report.roi)}`,
          `Расходы: ${formatMoney(report.totalCosts || 0, report.currency || "BYN")}`,
          `Прибыль: ${formatMoney(report.netProfit || 0, report.currency || "BYN")}`,
          `Стоимость лида: ${report.cpl === null ? "—" : formatMoney(report.cpl, report.currency || "BYN")}`,
          `Конверсия: ${report.conversion === null ? "—" : `${report.conversion.toFixed(1)}%`}`
        ].join("\n");
      } catch (error) {
        return "";
      }
    }

    async function copyReport() {
      const text = buildReport();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast("Отчет скопирован");
      } catch (error) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "readonly");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        showToast("Отчет скопирован");
      }
    }

    Object.values(fields).forEach((field) => {
      if (!field) return;
      field.addEventListener("input", recalc);
      field.addEventListener("change", recalc);
    });
    if (copyBtn) copyBtn.addEventListener("click", copyReport);
    recalc();
  }

  function specialistMatchesCategory(specialist, category) {
    const c = normalize(category);
    const spec = normalize(specialist.specialization);
    if (c === "smm") return spec.includes("smm");
    if (c === "reels maker") return spec.includes("reels");
    if (c === "таргетолог") return spec.includes("таргет");
    if (c === "контент-менеджер") return spec.includes("контент");
    if (c === "дизайнер") return spec.includes("дизайн");
    if (c === "монтажер") return specialist.skills.some((skill) => normalize(skill).includes("монтаж"));
    if (c === "ugc creator") return specialist.skills.some((skill) => normalize(skill).includes("ugc"));
    return true;
  }

  function specialistMatchesExperience(specialist, label) {
    const normalized = normalize(label);
    if (normalized === "новичок") return specialist.experience === "junior";
    if (normalized === "middle") return specialist.experience === "middle";
    if (normalized === "senior") return specialist.experience === "senior";
    return true;
  }

  function getBudgetMaxByTier(tierText) {
    const tier = normalize(tierText);
    if (tier.includes("до 300")) return 300;
    if (tier.includes("300-700")) return 700;
    if (tier.includes("700-1500")) return 1500;
    return 700;
  }

  function computeMatchScore(specialist, taskInput) {
    let score = 60;
    const niche = normalize(taskInput.niche);
    const platforms = normalize(taskInput.platforms);

    if (specialist.niches.some((item) => normalize(item) === niche)) score += 15;
    if (specialist.platforms.some((item) => platforms.includes(normalize(item)))) score += 12;
    if (normalize(taskInput.needReels) === "да" && specialist.skills.some((skill) => normalize(skill).includes("reels")))
      score += 7;
    if (normalize(taskInput.needTarget) === "да" && specialist.skills.some((skill) => normalize(skill).includes("таргет")))
      score += 6;
    if (normalize(taskInput.needContent) !== "нет" && specialist.skills.some((skill) => normalize(skill).includes("контент")))
      score += 5;
    if (specialist.priceUsd <= Number(taskInput.budgetValue || 700)) score += 5;

    return Math.min(99, Math.max(50, Math.round(score)));
  }

  function renderCatalogCard(specialist, rootPrefix) {
    const ratingText =
      specialist.reviewsCount > 0 ? `${specialist.rating.toFixed(1)} (${specialist.reviewsCount})` : "без оценок";
    return `
      <article class="card catalog-card">
        <div class="avatar"></div>
        <div>
          <h3>${specialist.name}</h3>
          <div class="meta">${specialist.specialization} • ${specialist.city} • ${ratingText}</div>
          <div class="verified">Verified профиль</div>
          <p class="meta">${specialist.description}</p>
          <div class="chips">
            ${specialist.platforms.slice(0, 3).map((item) => `<span class="chip">${item}</span>`).join("")}
          </div>
        </div>
        <div class="catalog-side">
          <div>
            <div class="price">от ${formatMoneyRub(specialist.priceRub)} / мес</div>
            <div class="meta">${specialist.cases.length} кейсов</div>
          </div>
          <div class="catalog-metrics">
            <span>ER: ${specialist.stats.er}</span>
            <span>CTR: ${specialist.stats.ctr}</span>
            <span>Рост: ${specialist.stats.reachGrowth}</span>
          </div>
          <div class="chips">
            <a class="btn btn-primary" href="${rootPrefix}u/username/index.html" data-open-profile="${specialist.id}">Написать</a>
            <button class="btn btn-ghost" data-add-favorite="${specialist.id}" type="button">В избранное</button>
          </div>
        </div>
      </article>
    `;
  }

  function initSpecialistsPage() {
    if (!isPath("/specialists/")) return;

    const catalogGrid = document.querySelector(".catalog-grid");
    if (!catalogGrid) return;

    const groups = Array.from(document.querySelectorAll(".filter-group"));
    const priceRange = document.querySelector(".range");
    const priceTitle = groups[3] ? groups[3].querySelector("h4") : null;

    function selectedOptions(groupIndex) {
      const group = groups[groupIndex];
      if (!group) return [];
      return Array.from(group.querySelectorAll(".option.active")).map((item) => normalize(item.textContent));
    }

    function render() {
      const selectedCategories = selectedOptions(0);
      const selectedPlatforms = selectedOptions(1);
      const selectedCities = selectedOptions(2);
      const selectedExperience = selectedOptions(4);
      const selectedNiches = selectedOptions(5);
      const maxPrice = Number(priceRange ? priceRange.value : 1500);

      if (priceTitle) {
        priceTitle.textContent = `Цена: до ${maxPrice}$`;
      }

      const filtered = state.specialists.filter((specialist) => {
        const categoryOk =
          selectedCategories.length === 0 ||
          selectedCategories.some((category) => specialistMatchesCategory(specialist, category));
        const platformOk =
          selectedPlatforms.length === 0 ||
          selectedPlatforms.some((platform) =>
            specialist.platforms.some((item) => normalize(item).includes(platform))
          );
        const cityOk =
          selectedCities.length === 0 ||
          selectedCities.some((city) => normalize(specialist.city).includes(city));
        const experienceOk =
          selectedExperience.length === 0 ||
          selectedExperience.some((item) => specialistMatchesExperience(specialist, item));
        const nicheOk =
          selectedNiches.length === 0 ||
          selectedNiches.some((niche) => specialist.niches.some((item) => normalize(item).includes(niche)));
        const priceOk = specialist.priceUsd <= maxPrice;

        return categoryOk && platformOk && cityOk && experienceOk && nicheOk && priceOk;
      });

      if (!filtered.length) {
        const emptyTitle = state.specialists.length
          ? "Ничего не найдено"
          : "Профили специалистов пока не добавлены";
        const emptyText = state.specialists.length
          ? "Попробуйте снять часть фильтров или увеличить бюджет."
          : "После регистрации и заполнения профилей карточки появятся здесь.";
        catalogGrid.innerHTML = `<article class="card"><h3>${emptyTitle}</h3><p class="meta">${emptyText}</p></article>`;
        return;
      }

      catalogGrid.innerHTML = filtered
        .map((specialist) => renderCatalogCard(specialist, "../"))
        .join("");
    }

    catalogGrid.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const openProfileId = target.getAttribute("data-open-profile");
      if (openProfileId) {
        state.ui.selectedSpecialistId = openProfileId;
        const user = currentUser();
        if (user && user.role === "business") {
          const convo = ensureConversation(user.id, openProfileId);
          state.ui.selectedBusinessConversationId = convo.id;
        }
        saveState();
        return;
      }

      const favoriteId = target.getAttribute("data-add-favorite");
      if (favoriteId) {
        event.preventDefault();
        const user = requireBusinessForAction();
        if (!user) return;
        if (!state.favoritesByUser[user.id]) state.favoritesByUser[user.id] = [];
        if (!state.favoritesByUser[user.id].includes(favoriteId)) {
          state.favoritesByUser[user.id].push(favoriteId);
          saveState();
          showToast("Специалист добавлен в избранное");
        } else {
          showToast("Уже в избранном");
        }
      }
    });

    if (priceRange) {
      priceRange.addEventListener("input", render);
    }

    document.querySelectorAll(".option").forEach((option) => {
      option.addEventListener("click", () => {
        window.setTimeout(render, 0);
      });
    });

    render();
  }

  function renderTaskPreviewMatches(task, wrapper) {
    if (!wrapper) return;
    wrapper.querySelectorAll(".card").forEach((item) => item.remove());
    const responses = task.responses || [];
    if (!responses.length) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<div class="meta">Рекомендации появятся после добавления профилей специалистов.</div>`;
      wrapper.appendChild(card);
      return;
    }
    responses.forEach((response) => {
      const specialist = findSpecialistById(response.specialistId);
      if (!specialist) return;
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <strong>${specialist.name}</strong>
        <div class="meta">Match score: ${response.score}% • ${specialist.specialization}</div>
      `;
      wrapper.appendChild(card);
    });
  }

  function initTaskCreatePage() {
    if (!isPath("/task/new/")) return;
    const form = document.querySelector("main form");
    if (!form) return;

    const secondPanel = document.querySelectorAll("main article.card")[1] || null;
    const previewTitle = secondPanel ? secondPanel.querySelector("h3") : null;

    function latestTaskForCurrentBusiness() {
      const user = currentUser();
      if (!user || user.role !== "business") return null;
      const tasks = state.tasks.filter((task) => task.businessUserId === user.id);
      return tasks.length ? tasks[tasks.length - 1] : null;
    }

    const latest = latestTaskForCurrentBusiness();
    if (latest && secondPanel && previewTitle) {
      renderTaskPreviewMatches(latest, previewTitle.parentElement);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const user = requireBusinessForAction();
      if (!user) return;
      const selects = form.querySelectorAll("select");
      const taskInput = {
        niche: (form.querySelector("#niche") || selects[0]).value,
        budgetTier: (form.querySelector("#budget") || selects[1]).value,
        platforms: (form.querySelector("#platforms") || selects[2]).value,
        goals: (form.querySelector("#goals") || { value: "" }).value.trim(),
        needTarget: selects[3] ? selects[3].value : "Не уверен",
        needContent: selects[4] ? selects[4].value : "Частично",
        needReels: selects[5] ? selects[5].value : "Да"
      };

      const budgetValue = getBudgetMaxByTier(taskInput.budgetTier);
      taskInput.budgetValue = budgetValue;

      const responses = state.specialists
        .map((specialist) => ({
          specialistId: specialist.id,
          score: computeMatchScore(specialist, taskInput)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      const businessUserId = user.id;
      const assignedSpecialistId = responses[0] ? responses[0].specialistId : null;
      const budgetRub = budgetValue * 100;

      const task = {
        id: uid("task"),
        title: `${taskInput.platforms} для ${taskInput.niche.toLowerCase()}`,
        niche: taskInput.niche,
        budgetTier: taskInput.budgetTier,
        budgetValue,
        platforms: taskInput.platforms,
        goals: taskInput.goals || "Рост заявок и охватов",
        needTarget: taskInput.needTarget,
        needContent: taskInput.needContent,
        needReels: taskInput.needReels,
        status: "active",
        businessUserId,
        assignedSpecialistId,
        responses,
        createdAt: nowIso()
      };

      state.tasks.unshift(task);
      state.ai.lastMatchTaskId = task.id;
      state.ui.selectedSpecialistId = assignedSpecialistId || state.ui.selectedSpecialistId;
      state.payments.unshift({
        id: uid("pay"),
        taskId: task.id,
        amount: budgetRub,
        status: "Холд",
        date: nowIso()
      });

      if (assignedSpecialistId) {
        const convo = ensureConversation(businessUserId, assignedSpecialistId);
        addMessage(convo.id, "business", `Создана новая задача: ${task.title}. Цель: ${task.goals}`);
        state.ui.selectedBusinessConversationId = convo.id;
      }

      saveState();
      if (secondPanel && previewTitle) {
        renderTaskPreviewMatches(task, previewTitle.parentElement);
      }
      showToast("Задача опубликована. AI Match обновлен.");
    });
  }

  function initLandingRoleFlow() {
    const roleLinks = document.querySelectorAll("[data-landing-intent]");
    if (!roleLinks.length) return;

    roleLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = event.currentTarget;
        if (!(target instanceof HTMLElement)) return;
        const roleIntent = target.getAttribute("data-landing-intent");
        if (!roleIntent) return;
        if (currentUser()) return;

        event.preventDefault();
        window.location.href = `${appUrl("auth/register/index.html")}?role=${encodeURIComponent(roleIntent)}`;
      });
    });
  }

  function initAuthPages() {
    if (isPath("/auth/register/")) {
      const card = document.querySelector(".auth-card");
      const button = card ? card.querySelector(".btn.btn-primary") : null;
      if (card && button) {
        const roleInput = card.querySelector("input[name='account_role']");
        const roleButtons = card.querySelectorAll("[data-role-btn]");
        const search = new URL(window.location.href).searchParams;

        function applyRoleSelection(rawRole) {
          const role = rawRole === "specialist" ? "specialist" : "business";
          if (roleInput) roleInput.value = role;
          roleButtons.forEach((item) => {
            const isActive = item.getAttribute("data-role-btn") === role;
            item.classList.toggle("active-role", isActive);
            item.setAttribute("aria-pressed", isActive ? "true" : "false");
          });
        }

        roleButtons.forEach((roleButton) => {
          roleButton.addEventListener("click", () => {
            const value = roleButton.getAttribute("data-role-btn") || "business";
            applyRoleSelection(value);
          });
        });

        const roleFromQuery = normalize(search.get("role"));
        if (roleFromQuery === "specialist" || roleFromQuery === "business") {
          applyRoleSelection(roleFromQuery);
        }

        button.addEventListener("click", () => {
          const inputs = card.querySelectorAll("input");
          const role = normalize(roleInput ? roleInput.value : "business");
          const name = inputs[1] ? inputs[1].value.trim() : "";
          const email = inputs[2] ? inputs[2].value.trim() : "";
          const password = inputs[3] ? inputs[3].value.trim() : "";

          if (!name || !email || !password) {
            showToast("Заполните все поля", "error");
            return;
          }
          if (password.length < 6) {
            showToast("Пароль должен быть от 6 символов", "error");
            return;
          }
          const exists = state.users.some((user) => normalize(user.email) === normalize(email));
          if (exists) {
            showToast("Email уже зарегистрирован", "error");
            return;
          }

          const userId = uid("user");
          const user = {
            id: userId,
            role: role === "specialist" ? "specialist" : "business",
            name,
            email,
            password
          };

          if (user.role === "specialist") {
            const specialistId = uid("spec");
            user.specialistId = specialistId;
            state.specialists.push({
              id: specialistId,
              userId,
              name,
              city: "Онлайн",
              rating: 0,
              reviewsCount: 0,
              specialization: "SMM-специалист",
              experience: "junior",
              description: "Новый специалист на платформе.",
              about: "Добавьте подробное описание в настройках профиля.",
              priceRub: 30000,
              priceUsd: 400,
              platforms: ["instagram"],
              niches: ["кафе"],
              skills: ["smm"],
              stats: { er: "0%", ctr: "0%", cpm: "$0", views: "0", followersGrowth: "+0", reachGrowth: "+0%" },
              socials: {
                instagram: "https://instagram.com/",
                tiktok: "https://www.tiktok.com/",
                telegram: "https://telegram.org/",
                behance: "https://www.behance.net/"
              },
              cases: []
            });
          }

          state.users.push(user);
          state.currentUserId = userId;
          saveState();
          showToast("Аккаунт создан");
          window.setTimeout(() => {
            window.location.href = resolvePostAuthDestination(user);
          }, 300);
        });
      }
    }

    if (isPath("/auth/login/")) {
      const card = document.querySelector(".auth-card");
      const button = card ? card.querySelector(".btn.btn-primary") : null;
      if (card && button) {
        button.addEventListener("click", () => {
          const inputs = card.querySelectorAll("input");
          const email = inputs[0] ? inputs[0].value.trim() : "";
          const password = inputs[1] ? inputs[1].value.trim() : "";
          const user = state.users.find(
            (item) => normalize(item.email) === normalize(email) && item.password === password
          );
          if (!user) {
            showToast("Неверный email или пароль", "error");
            return;
          }
          state.currentUserId = user.id;
          saveState();
          showToast("Вы вошли в систему");
          window.setTimeout(() => {
            window.location.href = resolvePostAuthDestination(user);
          }, 300);
        });
      }
    }

    if (isPath("/auth/forgot/")) {
      const card = document.querySelector(".auth-card");
      const button = card ? card.querySelector(".btn.btn-primary") : null;
      if (card && button) {
        button.addEventListener("click", () => {
          const input = card.querySelector("input[type='email']");
          const email = input ? input.value.trim() : "";
          if (!email) {
            showToast("Введите email", "error");
            return;
          }
          showToast("Ссылка для восстановления отправлена");
        });
      }
    }
  }

  function renderProfilePage() {
    if (!isPath("/u/username/")) return;
    if (!state.specialists.length) {
      const root = document.querySelector("main.container");
      if (root) {
        root.innerHTML = `
          <article class="card">
            <h1>Профиль пока не заполнен</h1>
            <p class="meta">Фейковые данные удалены. Зарегистрируйтесь как специалист и заполните профиль в кабинете.</p>
          </article>
        `;
      }
      return;
    }
    const specialistId =
      state.ui.selectedSpecialistId ||
      (currentUser() && currentUser().specialistId ? currentUser().specialistId : state.specialists[0].id);
    const specialist = findSpecialistById(specialistId) || state.specialists[0];
    if (!specialist) return;

    const header = document.querySelector(".profile-header");
    if (header) {
      const h1 = header.querySelector("h1");
      const metas = header.querySelectorAll(".meta");
      const price = header.querySelector(".price");
      const chips = header.querySelector(".chips");
      if (h1) h1.textContent = specialist.name;
      if (metas[0]) {
        const ratingText =
          specialist.reviewsCount > 0
            ? `${specialist.rating.toFixed(1)} (${specialist.reviewsCount})`
            : "оценок пока нет";
        metas[0].textContent = `${specialist.city} • ${specialist.specialization} • ${ratingText}`;
      }
      if (price) price.textContent = `от ${formatMoneyRub(specialist.priceRub)} / мес`;
      if (chips) {
        chips.innerHTML = specialist.skills.map((skill) => `<span class="chip">${skill}</span>`).join("");
      }
    }

    const about = Array.from(document.querySelectorAll("article.card")).find((card) =>
      normalize(card.querySelector("h2")?.textContent).includes("about")
    );
    if (about) {
      const p = about.querySelector(".meta");
      if (p) p.textContent = specialist.about;
    }

    const metrics = document.querySelectorAll(".metric");
    if (metrics.length >= 5) {
      const values = [
        specialist.stats.er,
        specialist.stats.views,
        specialist.stats.followersGrowth,
        specialist.stats.cpm,
        specialist.stats.ctr
      ];
      metrics.forEach((metric, index) => {
        const strong = metric.querySelector("strong");
        if (strong && values[index]) strong.textContent = values[index];
      });
    }

    const casesCard = Array.from(document.querySelectorAll("article.card")).find((card) =>
      normalize(card.querySelector("h2")?.textContent).includes("кейсы")
    );
    if (casesCard) {
      const casesGrid = casesCard.querySelector(".cases-grid");
      if (casesGrid) {
        if (!specialist.cases.length) {
          casesGrid.innerHTML = '<div class="card"><p class="meta">Кейсы пока не добавлены.</p></div>';
        } else {
          casesGrid.innerHTML = specialist.cases
          .map(
            (item) => `
              <div class="card case-card">
                <div class="case-image"></div>
                <strong>${item.title}</strong>
                <p class="meta">${specialist.specialization} • ${specialist.city}</p>
                <div class="kpi-line"><span>Результат 1</span><strong>${item.result1}</strong></div>
                <div class="kpi-line"><span>Результат 2</span><strong>${item.result2}</strong></div>
                <div class="kpi-line"><span>Период</span><strong>${item.period}</strong></div>
              </div>
            `
          )
          .join("");
        }
      }
    }

    const reviewsCard = Array.from(document.querySelectorAll("article.card")).find((card) =>
      normalize(card.querySelector("h2")?.textContent).includes("отзывы")
    );
    if (reviewsCard) {
      const reviewsWrap = reviewsCard.querySelector(".reviews");
      if (reviewsWrap) {
        const specialistReviews = state.reviews.filter((item) => item.specialistId === specialist.id);
        if (specialistReviews.length) {
          reviewsWrap.innerHTML = specialistReviews
            .slice()
            .reverse()
            .slice(0, 3)
            .map(
              (review) => `
                <div class="card">
                  <strong>${formatDate(review.createdAt)}</strong>
                  <div class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
                  <p class="meta">${review.comment}</p>
                </div>
              `
            )
            .join("");
        } else {
          reviewsWrap.innerHTML = '<div class="card"><p class="meta">Оценок и отзывов пока нет.</p></div>';
        }
      }
    }

    const tabs = document.querySelectorAll(".tabs .tab");
    if (tabs.length >= 4) {
      tabs[0].href = specialist.socials.instagram;
      tabs[1].href = specialist.socials.tiktok;
      tabs[2].href = specialist.socials.telegram;
      tabs[3].href = specialist.socials.behance;
    }

    document.querySelectorAll("a.btn.btn-primary").forEach((button) => {
      if (!normalize(button.textContent).includes("связ")) return;
      button.addEventListener("click", (event) => {
        const user = requireBusinessForAction();
        if (!user) {
          event.preventDefault();
          return;
        }
        const convo = ensureConversation(user.id, specialist.id);
        state.ui.selectedBusinessConversationId = convo.id;
        saveState();
      });
    });
  }

  function initAiMatchPage() {
    if (!isPath("/ai/match/")) return;
    const cards = document.querySelectorAll(".kpi-cards .card");
    const panel = document.querySelector(".panel-list");
    const latestTask = state.tasks.find((task) => task.id === state.ai.lastMatchTaskId) || state.tasks[0];
    if (!cards.length || !panel) return;
    if (!latestTask || !(latestTask.responses || []).length) {
      cards[0].querySelector("strong").textContent = "0%";
      cards[1].querySelector("strong").textContent = "0 мин";
      cards[2].querySelector("strong").textContent = "0";
      panel.innerHTML =
        '<article class="panel-item"><strong>Нет данных</strong><div class="meta">Добавьте задачу и профили специалистов для AI Match.</div></article>';
      return;
    }

    const responses = latestTask.responses || [];
    const avgScore = responses.length
      ? Math.round(responses.reduce((sum, item) => sum + item.score, 0) / responses.length)
      : 0;

    const generatedMinutes = Math.max(1.2, (responses.length * 0.7).toFixed(1));
    cards[0].querySelector("strong").textContent = `${avgScore}%`;
    cards[1].querySelector("strong").textContent = `${generatedMinutes} мин`;
    cards[2].querySelector("strong").textContent = String(responses.length);

    panel.innerHTML = responses
      .map((response, index) => {
        const specialist = findSpecialistById(response.specialistId);
        if (!specialist) return "";
        return `
          <article class="panel-item">
            <strong>${index + 1}. ${specialist.name}</strong>
            <div class="meta">Score ${response.score}% • ${specialist.specialization} • ${specialist.city}</div>
          </article>
        `;
      })
      .join("");
  }

  function initAiAuditPage() {
    if (!isPath("/ai/instagram-audit/")) return;
    const cards = document.querySelectorAll("main .card");
    if (cards.length < 2) return;
    const controlsCard = cards[0];
    const resultPanel = cards[1].querySelector(".panel-list");
    const button = controlsCard.querySelector(".btn.btn-primary");
    const input = controlsCard.querySelector("input");
    const select = controlsCard.querySelector("select");
    if (!button || !resultPanel) return;

    function renderAudit(data) {
      resultPanel.innerHTML = data.items
        .map(
          (item) => `
            <div class="panel-item">
              <strong>${item.title}</strong>
              <div class="meta">${item.text}</div>
            </div>
          `
        )
        .join("");
    }

    if (state.ai.lastAudit) {
      renderAudit(state.ai.lastAudit);
    }

    button.addEventListener("click", () => {
      if (!requestAuthForAction()) return;
      const username = input ? input.value.trim() : "";
      const niche = select ? select.value : "Кафе";
      if (!username) {
        showToast("Укажите username", "error");
        return;
      }
      const items = [
        {
          title: "Bio и оффер",
          text: `Для ниши «${niche}» добавьте более конкретный CTA и УТП в первые 80 символов.`
        },
        {
          title: "Контент-сетка",
          text: "Доля экспертного контента ниже 20%. Рекомендуется 2 экспертных ролика в неделю."
        },
        {
          title: "Reels hooks",
          text: "Добавьте сильный первый кадр и субтитры в первые 2 секунды."
        },
        {
          title: "Воронка в директ",
          text: "Подключите автоответы и квалификационный сценарий для лидов."
        }
      ];

      state.ai.lastAudit = { username, niche, items, createdAt: nowIso() };
      saveState();
      renderAudit(state.ai.lastAudit);
      showToast("Аудит готов");
    });
  }

  function initAiContentPage() {
    if (!isPath("/ai/content-generator/")) return;
    const cards = document.querySelectorAll("main .card");
    if (cards.length < 2) return;
    const controlsCard = cards[0];
    const resultPanel = cards[1].querySelector(".panel-list");
    const button = controlsCard.querySelector(".btn.btn-primary");
    const selects = controlsCard.querySelectorAll("select");
    if (!button || !resultPanel || selects.length < 3) return;

    function renderIdeas(ideas) {
      resultPanel.innerHTML = ideas
        .map(
          (idea) => `
            <div class="panel-item">
              <strong>${idea.title}</strong>
              <div class="meta">${idea.text}</div>
            </div>
          `
        )
        .join("");
    }

    if (state.ai.lastContentIdeas) renderIdeas(state.ai.lastContentIdeas.ideas);

    button.addEventListener("click", () => {
      if (!requestAuthForAction()) return;
      const niche = selects[0].value;
      const platform = selects[1].value;
      const goal = selects[2].value;

      const ideas = [
        {
          title: `${platform}: ролик «3 ошибки в нише ${niche.toLowerCase()}»`,
          text: `Hook + быстрая демонстрация + CTA на ${goal.toLowerCase()}.`
        },
        {
          title: `Серия stories «до/после»`,
          text: `Покажите конкретные цифры и социальное доказательство для цели: ${goal.toLowerCase()}.`
        },
        {
          title: "Контент-план на 7 дней",
          text: "2 reels, 3 stories-серии, 1 экспертный пост, 1 отзыв клиента."
        }
      ];

      state.ai.lastContentIdeas = { niche, platform, goal, ideas, createdAt: nowIso() };
      saveState();
      renderIdeas(ideas);
      showToast("Контент-идеи сгенерированы");
    });
  }

  function tasksForBusinessUser(businessUserId) {
    return state.tasks.filter((item) => item.businessUserId === businessUserId);
  }

  function tasksForSpecialist(specialistId) {
    return state.tasks.filter((item) => item.assignedSpecialistId === specialistId);
  }

  function paymentsForBusinessUser(businessUserId) {
    const taskIds = tasksForBusinessUser(businessUserId).map((task) => task.id);
    return state.payments.filter((payment) => taskIds.includes(payment.taskId));
  }

  function paymentsForSpecialist(specialistId) {
    const taskIds = tasksForSpecialist(specialistId).map((task) => task.id);
    return state.payments.filter((payment) => taskIds.includes(payment.taskId));
  }

  function conversationsForBusinessUser(businessUserId) {
    return state.conversations.filter((item) => item.businessUserId === businessUserId);
  }

  function conversationsForSpecialist(specialistId) {
    return state.conversations.filter((item) => item.specialistId === specialistId);
  }

  function renderBusinessOverview() {
    if (
      !isPath("/dashboard/business/") ||
      isPath("/dashboard/business/messages/") ||
      isPath("/dashboard/business/tasks/") ||
      isPath("/dashboard/business/favorites/") ||
      isPath("/dashboard/business/payments/") ||
      isPath("/dashboard/business/reviews/")
    ) {
      return;
    }
    const user = requireLoggedInBusiness(true);
    if (!user) return;
    const tasks = tasksForBusinessUser(user.id);

    const tableBody = document.querySelector(".table tbody");
    if (tableBody) {
      tableBody.innerHTML = tasks
        .slice(0, 5)
        .map((task) => {
          const specialist = findSpecialistById(task.assignedSpecialistId);
          return `<tr>
            <td>${task.title}</td>
            <td>${specialist ? specialist.name : "Не назначен"}</td>
            <td>${task.status}</td>
            <td>${formatMoneyRub(task.budgetValue * 100)}</td>
          </tr>`;
        })
        .join("");
    }

    const stats = document.querySelectorAll(".stats-strip .stat-box strong");
    const favorites = state.favoritesByUser[user.id] || [];
    const avgRating =
      state.reviews.length > 0
        ? (
            state.reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / state.reviews.length
          ).toFixed(1)
        : "0.0";
    const responsesCount = tasks.reduce((sum, task) => sum + (task.responses ? task.responses.length : 0), 0);

    if (stats.length >= 4) {
      stats[0].textContent = String(tasks.length);
      stats[1].textContent = String(responsesCount);
      stats[2].textContent = String(favorites.length);
      stats[3].textContent = avgRating;
    }

    const latestMessagesCard = Array.from(document.querySelectorAll(".dash-panels > article.card")).find((card) =>
      normalize(card.querySelector("h2")?.textContent).includes("последние")
    );
    if (latestMessagesCard) {
      const convos = conversationsForBusinessUser(user.id);
      const lines = convos
        .flatMap((convo) => {
          const spec = findSpecialistById(convo.specialistId);
          const last = convo.messages[convo.messages.length - 1];
          if (!spec || !last) return [];
          return `${spec.name}: ${last.text}`;
        })
        .slice(-2)
        .reverse();
      latestMessagesCard.querySelectorAll("p.meta").forEach((p) => p.remove());
      lines.forEach((line) => {
        const p = document.createElement("p");
        p.className = "meta";
        p.textContent = line;
        latestMessagesCard.appendChild(p);
      });
    }
  }

  function renderBusinessTasks() {
    if (!isPath("/dashboard/business/tasks/")) return;
    const user = requireLoggedInBusiness(true);
    if (!user) return;
    const tasks = tasksForBusinessUser(user.id);
    const tbody = document.querySelector(".table tbody");
    if (!tbody) return;
    tbody.innerHTML = tasks
      .map(
        (task) => `
          <tr>
            <td>${task.title}</td>
            <td>${task.niche}</td>
            <td>${task.budgetTier}</td>
            <td>${task.responses.length}</td>
            <td><span class="status">${task.status === "active" ? "Активна" : task.status}</span></td>
          </tr>
        `
      )
      .join("");
  }

  function renderBusinessFavorites() {
    if (!isPath("/dashboard/business/favorites/")) return;
    const user = requireLoggedInBusiness(true);
    if (!user) return;
    const favorites = state.favoritesByUser[user.id] || [];
    const list = document.querySelector(".panel-list");
    if (!list) return;
    list.innerHTML = favorites
      .map((id) => {
        const specialist = findSpecialistById(id);
        if (!specialist) return "";
        const ratingText = specialist.reviewsCount > 0 ? specialist.rating.toFixed(1) : "без оценок";
        return `<div class="panel-item"><strong>${specialist.name}</strong><div class="meta">${specialist.specialization} • ${specialist.city} • ${ratingText}</div></div>`;
      })
      .join("");
  }

  function renderBusinessPayments() {
    if (!isPath("/dashboard/business/payments/")) return;
    const user = requireLoggedInBusiness(true);
    if (!user) return;
    const payments = paymentsForBusinessUser(user.id);
    const tbody = document.querySelector(".table tbody");
    if (!tbody) return;
    tbody.innerHTML = payments
      .map((payment) => {
        const task = state.tasks.find((item) => item.id === payment.taskId);
        return `
          <tr>
            <td>${task ? task.title : "Проект"}</td>
            <td>${formatMoneyRub(payment.amount)}</td>
            <td><span class="status ${normalize(payment.status).includes("ожидает") ? "warn" : ""}">${payment.status}</span></td>
            <td>${formatDate(payment.date)}</td>
          </tr>
        `;
      })
      .join("");
  }

  function renderBusinessReviews() {
    if (!isPath("/dashboard/business/reviews/")) return;
    const user = requireLoggedInBusiness(true);
    if (!user) return;
    const reviewList = document.querySelector(".panel-list");
    const cards = document.querySelectorAll(".dash-panels > article.card");
    const formCard = cards[1] || null;

    if (reviewList) {
      const reviews = state.reviews.filter((item) => item.businessUserId === user.id);
      reviewList.innerHTML = reviews.length
        ? reviews
        .slice()
        .reverse()
        .map(
          (review) => `
            <div class="panel-item">
              <strong>${specialistName(review.specialistId)} • ${"★".repeat(review.rating)}${"☆".repeat(
                5 - review.rating
              )}</strong>
              <div class="meta">${review.comment}</div>
            </div>
          `
        )
        .join("")
        : '<div class="panel-item"><div class="meta">Пока нет оценок и отзывов.</div></div>';
    }

    if (!formCard) return;
    const selects = formCard.querySelectorAll("select");
    const textarea = formCard.querySelector("textarea");
    const button = formCard.querySelector(".btn.btn-primary");
    if (selects.length < 2 || !textarea || !button) return;

    const specialistSelect = selects[0];
    const ratingSelect = selects[1];

    if (!state.specialists.length) {
      specialistSelect.innerHTML = "<option>Нет специалистов</option>";
      button.disabled = true;
      return;
    }
    specialistSelect.innerHTML = state.specialists
      .map((specialist) => `<option value="${specialist.id}">${specialist.name}</option>`)
      .join("");

    button.addEventListener("click", () => {
      const specialistId = specialistSelect.value;
      const rating = Number(ratingSelect.value || 5);
      const comment = textarea.value.trim();
      if (!comment) {
        showToast("Добавьте комментарий", "error");
        return;
      }
      const specialist = findSpecialistById(specialistId);
      if (!specialist) return;

      state.reviews.push({
        id: uid("review"),
        businessUserId: user.id,
        specialistId,
        rating,
        comment,
        createdAt: nowIso()
      });

      specialist.rating = Number(
        ((specialist.rating * specialist.reviewsCount + rating) / (specialist.reviewsCount + 1)).toFixed(1)
      );
      specialist.reviewsCount += 1;
      saveState();
      textarea.value = "";
      renderBusinessReviews();
      showToast("Отзыв сохранен");
    });
  }

  function renderConversationMessages(conversation, rolePerspective) {
    return conversation.messages
      .map((message) => {
        const mine = message.senderRole === rolePerspective;
        return `<div class="chat-msg ${mine ? "mine" : ""}">${message.text}</div>`;
      })
      .join("");
  }

  function initBusinessMessagesPage() {
    if (!isPath("/dashboard/business/messages/")) return;
    const user = requireLoggedInBusiness(true);
    if (!user) return;

    const articles = document.querySelectorAll(".dash-panels > article.card");
    if (articles.length < 2) return;
    const chatCard = articles[0];
    const listCard = articles[1];
    const convos = conversationsForBusinessUser(user.id);
    if (!convos.length) {
      chatCard.innerHTML = "<h2>Чат со специалистами</h2><p class='meta'>Диалогов пока нет.</p>";
      listCard.innerHTML = "<h2>Диалоги</h2><p class='meta'>Пусто</p>";
      return;
    }

    let selectedId = state.ui.selectedBusinessConversationId;
    if (!selectedId || !convos.some((item) => item.id === selectedId)) {
      selectedId = convos[0].id;
      state.ui.selectedBusinessConversationId = selectedId;
      saveState();
    }

    function render() {
      const selected = convos.find((item) => item.id === selectedId) || convos[0];
      const selectedSpecialist = findSpecialistById(selected.specialistId);
      chatCard.innerHTML = `
        <h2>Чат: ${selectedSpecialist ? selectedSpecialist.name : "Специалист"}</h2>
        <div class="chat">${renderConversationMessages(selected, "business")}</div>
        <form class="field" data-chat-form>
          <label>Новое сообщение</label>
          <textarea placeholder="Напишите сообщение"></textarea>
          <button class="btn btn-primary" type="submit">Отправить</button>
        </form>
      `;

      listCard.innerHTML = `
        <h2>Диалоги</h2>
        <div class="panel-list">
          ${convos
            .map((convo) => {
              const specialist = findSpecialistById(convo.specialistId);
              const last = convo.messages[convo.messages.length - 1];
              return `
                <div class="panel-item" data-conversation-id="${convo.id}" style="${
                  convo.id === selectedId ? "border-color: rgba(183,170,255,0.45);" : ""
                }">
                  <strong>${specialist ? specialist.name : "Специалист"}</strong>
                  <div class="meta">${last ? last.text : "Нет сообщений"}</div>
                </div>
              `;
            })
            .join("")}
        </div>
      `;

      const form = chatCard.querySelector("[data-chat-form]");
      if (form) {
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          if (!requireSpecialistForAction()) return;
          const textArea = form.querySelector("textarea");
          const text = textArea ? textArea.value.trim() : "";
          if (!text) return;
          addMessage(selected.id, "business", text);
          if (textArea) textArea.value = "";
          render();
        });
      }
    }

    listCard.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const row = target.closest("[data-conversation-id]");
      if (!row) return;
      const nextId = row.getAttribute("data-conversation-id");
      if (!nextId) return;
      selectedId = nextId;
      state.ui.selectedBusinessConversationId = nextId;
      saveState();
      render();
    });

    render();
  }

  function currentSpecialistForSession() {
    if (!state.specialists.length) return null;
    const user = currentUser();
    if (user && user.role === "specialist" && user.specialistId) {
      return findSpecialistById(user.specialistId) || state.specialists[0];
    }
    return findSpecialistById(state.ui.selectedSpecialistId) || state.specialists[0];
  }

  function renderSpecialistOverview() {
    if (
      !isPath("/dashboard/specialist/") ||
      isPath("/dashboard/specialist/projects/") ||
      isPath("/dashboard/specialist/messages/") ||
      isPath("/dashboard/specialist/cases/") ||
      isPath("/dashboard/specialist/analytics/") ||
      isPath("/dashboard/specialist/finance/") ||
      isPath("/dashboard/specialist/settings/")
    ) {
      return;
    }
    const specialist = currentSpecialistForSession();
    if (!specialist) return;

    const tasks = tasksForSpecialist(specialist.id);
    const statNodes = document.querySelectorAll(".stats-strip .stat-box strong");
    if (statNodes.length >= 4) {
      statNodes[0].textContent = specialist.reviewsCount > 0 ? specialist.rating.toFixed(1) : "—";
      statNodes[1].textContent = String(conversationsForSpecialist(specialist.id).length);
      const conversion = tasks.length ? Math.min(98, 42 + tasks.length * 6) : 42;
      statNodes[2].textContent = `${conversion}%`;
      statNodes[3].textContent = specialist.stats.views;
    }

    const tbody = document.querySelector(".table tbody");
    if (tbody) {
      tbody.innerHTML = tasks
        .map(
          (task) => `
            <tr>
              <td>${task.niche}</td>
              <td>${task.platforms}</td>
              <td>${formatDate(task.createdAt)}</td>
              <td>${task.status}</td>
            </tr>
          `
        )
        .join("");
    }
  }

  function renderSpecialistProjects() {
    if (!isPath("/dashboard/specialist/projects/")) return;
    const specialist = currentSpecialistForSession();
    if (!specialist) return;
    const tbody = document.querySelector(".table tbody");
    if (!tbody) return;
    const tasks = tasksForSpecialist(specialist.id);
    tbody.innerHTML = tasks
      .map(
        (task) => `
          <tr>
            <td>${task.niche}</td>
            <td>${specialist.specialization}</td>
            <td>${formatDate(task.createdAt)}</td>
            <td><span class="status">${task.status === "active" ? "В работе" : task.status}</span></td>
          </tr>
        `
      )
      .join("");
  }

  function initSpecialistMessagesPage() {
    if (!isPath("/dashboard/specialist/messages/")) return;
    const specialist = currentSpecialistForSession();
    if (!specialist) return;

    const articles = document.querySelectorAll(".dash-panels > article.card");
    if (articles.length < 2) return;
    const chatCard = articles[0];
    const listCard = articles[1];
    const convos = conversationsForSpecialist(specialist.id);
    if (!convos.length) {
      chatCard.innerHTML = "<h2>Чаты с клиентами</h2><p class='meta'>Диалогов пока нет.</p>";
      listCard.innerHTML = "<h2>Диалоги</h2><p class='meta'>Пусто</p>";
      return;
    }

    let selectedId = state.ui.selectedSpecialistConversationId;
    if (!selectedId || !convos.some((item) => item.id === selectedId)) {
      selectedId = convos[0].id;
      state.ui.selectedSpecialistConversationId = selectedId;
      saveState();
    }

    function render() {
      const selected = convos.find((item) => item.id === selectedId) || convos[0];
      const user = findUserById(selected.businessUserId);
      chatCard.innerHTML = `
        <h2>Чат: ${user ? user.name : "Клиент"}</h2>
        <div class="chat">${renderConversationMessages(selected, "specialist")}</div>
        <form class="field" data-chat-form>
          <label>Новое сообщение</label>
          <textarea placeholder="Напишите сообщение"></textarea>
          <button class="btn btn-primary" type="submit">Отправить</button>
        </form>
      `;
      listCard.innerHTML = `
        <h2>Диалоги</h2>
        <div class="panel-list">
          ${convos
            .map((convo) => {
              const business = findUserById(convo.businessUserId);
              const last = convo.messages[convo.messages.length - 1];
              return `
                <div class="panel-item" data-conversation-id="${convo.id}" style="${
                  convo.id === selectedId ? "border-color: rgba(183,170,255,0.45);" : ""
                }">
                  <strong>${business ? business.name : "Бизнес"}</strong>
                  <div class="meta">${last ? last.text : "Нет сообщений"}</div>
                </div>
              `;
            })
            .join("")}
        </div>
      `;

      const form = chatCard.querySelector("[data-chat-form]");
      if (form) {
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          const textArea = form.querySelector("textarea");
          const text = textArea ? textArea.value.trim() : "";
          if (!text) return;
          addMessage(selected.id, "specialist", text);
          if (textArea) textArea.value = "";
          render();
        });
      }
    }

    listCard.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const row = target.closest("[data-conversation-id]");
      if (!row) return;
      const nextId = row.getAttribute("data-conversation-id");
      if (!nextId) return;
      selectedId = nextId;
      state.ui.selectedSpecialistConversationId = nextId;
      saveState();
      render();
    });

    render();
  }

  function renderSpecialistCases() {
    if (!isPath("/dashboard/specialist/cases/")) return;
    const specialist = currentSpecialistForSession();
    if (!specialist) return;
    const casesGrid = document.querySelector(".cases-grid");
    const button = document.querySelector(".dash-panels .btn.btn-primary");
    if (casesGrid) {
      if (!specialist.cases.length) {
        casesGrid.innerHTML = '<div class="card"><p class="meta">Кейсы пока не добавлены.</p></div>';
      } else {
        casesGrid.innerHTML = specialist.cases
        .map(
          (item) => `
            <div class="card case-card">
              <strong>${item.title}</strong>
              <div class="kpi-line"><span>Результат 1</span><strong>${item.result1}</strong></div>
              <div class="kpi-line"><span>Результат 2</span><strong>${item.result2}</strong></div>
              <div class="kpi-line"><span>Период</span><strong>${item.period}</strong></div>
            </div>
          `
        )
        .join("");
      }
    }
    if (button) {
      button.addEventListener("click", () => {
        if (!requireSpecialistForAction()) return;
        const next = specialist.cases.length + 1;
        specialist.cases.unshift({
          title: `Новый кейс #${next}`,
          result1: "Заполните результат",
          result2: "Заполните результат",
          period: "Укажите период"
        });
        saveState();
        renderSpecialistCases();
        showToast("Кейс добавлен");
      });
    }
  }

  function renderSpecialistAnalytics() {
    if (!isPath("/dashboard/specialist/analytics/")) return;
    const specialist = currentSpecialistForSession();
    if (!specialist) return;
    const cards = document.querySelectorAll(".kpi-cards .card strong");
    if (cards.length >= 3) {
      cards[0].textContent = specialist.stats.er;
      cards[1].textContent = specialist.stats.ctr;
      cards[2].textContent = specialist.stats.cpm;
    }
    const tbody = document.querySelector(".table tbody");
    if (tbody) {
      const tasks = tasksForSpecialist(specialist.id);
      const currentMonthViews = Number(specialist.stats.views.replace(/[^\d]/g, "")) || 0;
      const previousMonthViews = Math.round(currentMonthViews * 0.74);
      tbody.innerHTML = `
        <tr><td>Просмотры профиля</td><td>${previousMonthViews.toLocaleString("ru-RU")}</td><td>${currentMonthViews.toLocaleString("ru-RU")}</td></tr>
        <tr><td>Новые контакты</td><td>${Math.max(1, tasks.length * 6)}</td><td>${Math.max(2, tasks.length * 9)}</td></tr>
        <tr><td>Конверсия в сделку</td><td>${Math.max(30, tasks.length * 9)}%</td><td>${Math.max(42, tasks.length * 11)}%</td></tr>
      `;
    }
  }

  function renderSpecialistFinance() {
    if (!isPath("/dashboard/specialist/finance/")) return;
    const specialist = currentSpecialistForSession();
    if (!specialist) return;
    const payments = paymentsForSpecialist(specialist.id);
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const hold = payments
      .filter((payment) => normalize(payment.status).includes("холд") || normalize(payment.status).includes("ожидает"))
      .reduce((sum, payment) => sum + payment.amount, 0);
    const commission = Math.round(total * 0.1);
    const available = Math.max(0, total - hold - commission);

    const boxes = document.querySelectorAll(".stats-strip .stat-box strong");
    if (boxes.length >= 4) {
      boxes[0].textContent = formatMoneyRub(total);
      boxes[1].textContent = formatMoneyRub(available);
      boxes[2].textContent = "10%";
      boxes[3].textContent = formatMoneyRub(hold);
    }

    const button = document.querySelector(".dash-panels .btn.btn-primary");
    if (button) {
      button.addEventListener("click", () => {
        if (!requireSpecialistForAction()) return;
        if (available <= 0) {
          showToast("Нет доступных средств к выводу", "error");
          return;
        }
        showToast(`Запрос на вывод ${formatMoneyRub(available)} отправлен`);
      });
    }
  }

  function renderSpecialistSettings() {
    if (!isPath("/dashboard/specialist/settings/")) return;
    const specialist = currentSpecialistForSession();
    if (!specialist) return;
    const card = document.querySelector(".dash-panels > article.card");
    if (!card) return;

    const inputs = card.querySelectorAll("input");
    const textarea = card.querySelector("textarea");
    const button = card.querySelector(".btn.btn-primary");
    if (inputs.length >= 3) {
      inputs[0].value = specialist.name;
      inputs[1].value = specialist.city;
      inputs[2].value = specialist.specialization;
    }
    if (textarea) textarea.value = specialist.about;

    if (button) {
      button.addEventListener("click", () => {
        if (!requireSpecialistForAction()) return;
        if (inputs.length >= 3) {
          specialist.name = inputs[0].value.trim() || specialist.name;
          specialist.city = inputs[1].value.trim() || specialist.city;
          specialist.specialization = inputs[2].value.trim() || specialist.specialization;
        }
        if (textarea) specialist.about = textarea.value.trim() || specialist.about;

        const user = currentUser();
        if (user && user.role === "specialist") {
          user.name = specialist.name;
        }
        saveState();
        showToast("Настройки сохранены");
      });
    }
  }

  function initQuickActions() {
    const logoutTargets = document.querySelectorAll("[data-logout]");
    logoutTargets.forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        state.currentUserId = null;
        saveState();
        window.location.href = appUrl("index.html");
      });
    });
  }

  if (!enforceSessionAndRole()) return;
  initGlobalRoiNavLink();
  initTopbarActionsByRole();
  initActionGuardsForLinks();
  initMobileMenu();
  initLandingRoleFlow();
  initFilterOptionToggle();
  initRoiCalculator();
  initRoiCalculatorPage();
  initAuthPages();
  initSpecialistsPage();
  initTaskCreatePage();
  renderProfilePage();
  initAiMatchPage();
  initAiAuditPage();
  initAiContentPage();
  renderBusinessOverview();
  renderBusinessTasks();
  renderBusinessFavorites();
  renderBusinessPayments();
  renderBusinessReviews();
  initBusinessMessagesPage();
  renderSpecialistOverview();
  renderSpecialistProjects();
  initSpecialistMessagesPage();
  renderSpecialistCases();
  renderSpecialistAnalytics();
  renderSpecialistFinance();
  renderSpecialistSettings();
  initQuickActions();
  initPageHeroVisuals();
  initCardVisualBoost();
  initMediaBlockVariations();
  initGlobalAnimations();
})();
