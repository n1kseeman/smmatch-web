(function () {
  "use strict";

  const STORAGE_KEY = "smmatch_state_v1";
  const STATE_VERSION = 3;

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

  const BRAND_LOGO_URL = appUrl("assets/brand/logo-nav-clean.png");

  function initBrandLogos() {
    const brands = document.querySelectorAll(".brand");
    brands.forEach((brand) => {
      if (brand.dataset.logoApplied === "1") return;
      const label = (brand.textContent || "SMMATCH").trim();
      brand.dataset.logoApplied = "1";
      brand.setAttribute("aria-label", label);
      brand.innerHTML = `<img class="brand-logo" src="${BRAND_LOGO_URL}" alt="${label}" loading="eager" decoding="async">`;
    });
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

  function formatMoneyByn(amount) {
    const value = Number(amount) || 0;
    return `${value.toLocaleString("ru-RU")} BYN`;
  }

  function formatMoneyRub(amount) {
    return formatMoneyByn(amount);
  }

  function normalizeForSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, "-")
      .replace(/^-+|-+$/g, "");
  }

  function specialistProfileUrl(rootPrefix, specialist) {
    const slug = specialist && specialist.slug ? specialist.slug : "specialist";
    return `${rootPrefix}u/username/index.html?slug=${encodeURIComponent(slug)}`;
  }

  function hashPasswordPlaceholder(password) {
    // This is intentionally simple and replaceable when backend auth is connected.
    const input = String(password || "");
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `v1_${(hash >>> 0).toString(16)}`;
  }

  function verifyPassword(user, password) {
    if (!user) return false;
    const nextHash = hashPasswordPlaceholder(password);
    if (user.passwordHash) return user.passwordHash === nextHash;
    // Backward compatibility for existing local states before migration.
    return String(user.password || "") === String(password || "");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  const VISUAL_LIBRARY = {
    social: [appUrl("assets/visuals/social-flow.svg"), appUrl("assets/visuals/workspace-focus.svg")],
    analytics: [appUrl("assets/visuals/analytics-grid.svg"), appUrl("assets/visuals/growth-chart.svg")],
    team: [appUrl("assets/visuals/team-sync.svg"), appUrl("assets/visuals/meeting-room.svg")],
    mobile: [appUrl("assets/visuals/mobile-promo.svg"), appUrl("assets/visuals/content-lab.svg")],
    content: [appUrl("assets/visuals/content-lab.svg"), appUrl("assets/visuals/workspace-focus.svg")],
    reels: [appUrl("assets/visuals/reels-studio.svg"), appUrl("assets/visuals/camera-shot.svg")],
    security: [appUrl("assets/visuals/brand-shield.svg"), appUrl("assets/visuals/strategy-map.svg")],
    media: [appUrl("assets/visuals/camera-shot.svg"), appUrl("assets/visuals/reels-studio.svg")],
    growth: [appUrl("assets/visuals/growth-chart.svg"), appUrl("assets/visuals/analytics-grid.svg")],
    strategy: [appUrl("assets/visuals/strategy-map.svg"), appUrl("assets/visuals/workspace-focus.svg")]
  };

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

  function pickVisualAsset(theme, seedIndex, usedSet) {
    const order = [
      theme,
      "social",
      "content",
      "analytics",
      "team",
      "strategy",
      "growth",
      "mobile",
      "security",
      "media",
      "reels"
    ];
    for (const key of order) {
      const pool = VISUAL_LIBRARY[key] || [];
      if (!pool.length) continue;
      const available = pool.filter((item) => !usedSet.has(item));
      if (available.length) {
        const chosen = available[seedIndex % available.length];
        usedSet.add(chosen);
        return chosen;
      }
    }
    const fallbackPool = VISUAL_LIBRARY.social;
    return fallbackPool[seedIndex % fallbackPool.length];
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
      complaints: [],
      moderationHistory: [],
      notifications: [],
      logs: [],
      favoritesByUser: {},
      conversations: [],
      reviews: [],
      payments: [],
      settings: {
        site: {
          platformName: "SMMATCH",
          logoUrl: "",
          primaryColor: "#7b6cff",
          currency: "BYN",
          contactEmail: "hello@smmatch.local",
          socials: {
            instagram: "",
            telegram: "",
            vk: "",
            tiktok: ""
          },
          footerText: "© SMMATCH. Все права защищены.",
          registrationEnabled: true,
          taskPublishingEnabled: true,
          specialistsCatalogEnabled: true
        },
        aiTools: {
          aiMatch: { enabled: true, mode: "demo", limitPerDay: 200, hint: "AI Match использует демо-алгоритм подбора." },
          instagramAudit: {
            enabled: true,
            mode: "demo",
            limitPerDay: 200,
            hint: "Instagram Audit показывает пример демо-анализа."
          },
          contentGenerator: {
            enabled: true,
            mode: "demo",
            limitPerDay: 200,
            hint: "Content Generator создает демо-идеи на основе формы."
          },
          roiCalculator: { enabled: true, mode: "demo", limitPerDay: 500, hint: "ROI калькулятор показывает прогноз по введенным данным." }
        },
        content: {
          homeHeroTitle: "Найдите SMM-специалиста, который реально даст результат",
          benefitsTitle: "Преимущества платформы",
          faqTitle: "Частые вопросы",
          platformRules: "Правила платформы SMMATCH.",
          privacyPolicy: "Политика конфиденциальности SMMATCH.",
          termsOfUse: "Условия использования SMMATCH."
        }
      },
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

  function defaultSiteSettings() {
    return seedState().settings.site;
  }

  function defaultAiToolsSettings() {
    return seedState().settings.aiTools;
  }

  function defaultContentSettings() {
    return seedState().settings.content;
  }

  function ensureDemoAdmin(next) {
    const adminEmail = "admin@smmatch.local";
    let admin = next.users.find((item) => normalize(item.email) === adminEmail);
    if (!admin) {
      admin = {
        id: uid("user"),
        role: "admin",
        name: "SMMatch Admin",
        email: adminEmail,
        passwordHash: hashPasswordPlaceholder("admin123"),
        blocked: false,
        createdAt: nowIso()
      };
      next.users.unshift(admin);
    } else {
      admin.role = "admin";
      if (!admin.passwordHash) admin.passwordHash = hashPasswordPlaceholder("admin123");
      admin.blocked = Boolean(admin.blocked);
    }
    return admin;
  }

  function buildMockSpecialists() {
    return [
      {
        id: "spec_alina",
        userId: null,
        slug: "alina-smirnova",
        name: "Алина Смирнова",
        avatar: appUrl("assets/visuals/team-sync.svg"),
        city: "Минск, Беларусь",
        country: "Беларусь",
        rating: 4.9,
        reviewsCount: 36,
        specialization: "SMM-стратег",
        experience: "senior",
        description: "Стратегия роста для Instagram и Telegram с упором на лидогенерацию.",
        about: "8 лет в SMM. Запускаю контент-системы и продажи через short-video и воронки в директ.",
        priceByn: 1800,
        platforms: ["Instagram", "Telegram", "TikTok"],
        niches: ["кафе", "beauty", "ecommerce"],
        skills: ["reels", "контент-план", "storytelling", "таргет"],
        stats: { er: "8.7%", ctr: "3.2%", cpm: "14 BYN", views: "124 000", followersGrowth: "+4 100", reachGrowth: "+230%" },
        socials: {
          instagram: "https://instagram.com/alina.smm.lab",
          tiktok: "https://www.tiktok.com/@alina.smm.lab",
          telegram: "https://t.me/alina_smm_lab",
          behance: ""
        },
        cases: [
          { title: "Кофейня в Минске", result1: "+230% охватов", result2: "+4 100 подписчиков", period: "2 месяца" },
          { title: "Beauty-студия", result1: "CPL 6.4 BYN", result2: "+62 заявки/мес", period: "3 месяца" }
        ]
      },
      {
        id: "spec_maxim",
        userId: null,
        slug: "maxim-pavlov",
        name: "Максим Павлов",
        avatar: appUrl("assets/visuals/workspace-focus.svg"),
        city: "Москва, Россия",
        country: "Россия",
        rating: 4.8,
        reviewsCount: 24,
        specialization: "Таргетолог / Performance",
        experience: "senior",
        description: "Meta и VK Ads, фокус на ROMI и стабильный поток лидов.",
        about: "Строю рекламные связки под продажи: тесты креативов, аналитика, оптимизация воронки.",
        priceByn: 2100,
        platforms: ["Instagram", "VK", "Telegram"],
        niches: ["рестораны", "ecommerce", "недвижимость"],
        skills: ["таргет", "аналитика", "креативы", "лидогенерация"],
        stats: { er: "6.1%", ctr: "2.9%", cpm: "19 BYN", views: "98 000", followersGrowth: "+2 700", reachGrowth: "+165%" },
        socials: {
          instagram: "https://instagram.com/max.performance.smm",
          tiktok: "",
          telegram: "https://t.me/max_performance_ads",
          behance: ""
        },
        cases: [
          { title: "Сеть ресторанов", result1: "-31% CPL", result2: "+118 лидов/мес", period: "10 недель" }
        ]
      },
      {
        id: "spec_daria",
        userId: null,
        slug: "daria-kim",
        name: "Дарья Ким",
        avatar: appUrl("assets/visuals/content-lab.svg"),
        city: "Алматы, Казахстан",
        country: "Казахстан",
        rating: 4.8,
        reviewsCount: 19,
        specialization: "Контент-менеджер",
        experience: "middle",
        description: "Контент-матрицы и продакшн под Reels/TikTok для брендов и экспертов.",
        about: "Собираю связку: рубрикатор, сценарии, съемка, монтаж, публикации и отчетность.",
        priceByn: 1550,
        platforms: ["Instagram", "TikTok", "YouTube"],
        niches: ["beauty", "спорт", "цветы"],
        skills: ["контент", "reels", "монтаж", "ugc"],
        stats: { er: "9.2%", ctr: "2.4%", cpm: "12 BYN", views: "143 000", followersGrowth: "+5 200", reachGrowth: "+280%" },
        socials: {
          instagram: "https://instagram.com/daria.reels.lab",
          tiktok: "https://www.tiktok.com/@daria.reels.lab",
          telegram: "",
          behance: "https://www.behance.net/dariakimstudio"
        },
        cases: [
          { title: "Магазин цветов", result1: "+310% просмотров reels", result2: "+87 заявок", period: "6 недель" }
        ]
      },
      {
        id: "spec_ilya",
        userId: null,
        slug: "ilya-voronov",
        name: "Илья Воронов",
        avatar: appUrl("assets/visuals/reels-studio.svg"),
        city: "Онлайн",
        country: "СНГ",
        rating: 4.7,
        reviewsCount: 14,
        specialization: "Reels maker / Монтажер",
        experience: "middle",
        description: "Сценарии и монтаж коротких видео, которые удерживают внимание.",
        about: "Делаю короткие ролики под продажи, обучающие воронки и прогревы.",
        priceByn: 1200,
        platforms: ["Instagram", "TikTok", "YouTube"],
        niches: ["кафе", "спорт", "beauty"],
        skills: ["reels", "монтаж", "hooks", "сценарии"],
        stats: { er: "7.4%", ctr: "2.1%", cpm: "11 BYN", views: "76 000", followersGrowth: "+1 900", reachGrowth: "+142%" },
        socials: {
          instagram: "https://instagram.com/ilya.shortvideo",
          tiktok: "https://www.tiktok.com/@ilya.shortvideo",
          telegram: "https://t.me/ilya_shortvideo",
          behance: ""
        },
        cases: [
          { title: "Фитнес-студия", result1: "+190% ER", result2: "+2 300 новых подписчиков", period: "2 месяца" }
        ]
      },
      {
        id: "spec_sabina",
        userId: null,
        slug: "sabina-askarova",
        name: "Сабина Аскарова",
        avatar: appUrl("assets/visuals/mobile-promo.svg"),
        city: "Ташкент, Узбекистан",
        country: "Узбекистан",
        rating: 4.9,
        reviewsCount: 28,
        specialization: "SMM + UGC creator",
        experience: "senior",
        description: "Контент и UGC-креативы для ecom и beauty с фокусом на конверсию.",
        about: "Веду контент и продюсирую UGC-креативы для ads, повышая CTR и продажи.",
        priceByn: 1950,
        platforms: ["Instagram", "TikTok", "Telegram"],
        niches: ["beauty", "ecommerce", "цветы"],
        skills: ["ugc", "контент", "таргет", "storytelling"],
        stats: { er: "10.4%", ctr: "3.6%", cpm: "13 BYN", views: "168 000", followersGrowth: "+6 300", reachGrowth: "+340%" },
        socials: {
          instagram: "https://instagram.com/sabina.ugc.smm",
          tiktok: "https://www.tiktok.com/@sabina.ugc.smm",
          telegram: "https://t.me/sabina_ugc_smm",
          behance: ""
        },
        cases: [
          { title: "Beauty e-commerce", result1: "ROAS 4.1", result2: "CTR +46%", period: "9 недель" }
        ]
      }
    ];
  }

  function normalizeSpecialistData(specialist) {
    const next = { ...specialist };
    next.slug = next.slug || normalizeForSlug(next.name || next.id || "specialist");
    next.priceByn = Number(next.priceByn || next.priceRub || 0);
    next.priceRub = undefined;
    next.priceUsd = undefined;
    if (!next.country) {
      next.country = normalize(next.city).includes("минск") ? "Беларусь" : "СНГ";
    }
    if (!next.socials) next.socials = {};
    next.socials = {
      instagram: next.socials.instagram || "",
      tiktok: next.socials.tiktok || "",
      telegram: next.socials.telegram || "",
      behance: next.socials.behance || ""
    };
    if (!Array.isArray(next.skills)) next.skills = [];
    if (!Array.isArray(next.platforms)) next.platforms = [];
    if (!Array.isArray(next.niches)) next.niches = [];
    if (!Array.isArray(next.cases)) next.cases = [];
    if (!next.stats) next.stats = {};
    next.avatar = next.avatar || appUrl("assets/visuals/team-sync.svg");
    next.stats = {
      er: next.stats.er || "0%",
      ctr: next.stats.ctr || "0%",
      cpm: String(next.stats.cpm || "0 BYN").replace("₽", "BYN").replace("$", "BYN "),
      views: next.stats.views || "0",
      followersGrowth: next.stats.followersGrowth || "+0",
      reachGrowth: next.stats.reachGrowth || "+0%"
    };
    return next;
  }

  function migrateState(data) {
    const next = { ...data };
    if (!Array.isArray(next.users)) next.users = [];
    if (!Array.isArray(next.specialists)) next.specialists = [];
    if (!Array.isArray(next.tasks)) next.tasks = [];
    if (!Array.isArray(next.complaints)) next.complaints = [];
    if (!Array.isArray(next.moderationHistory)) next.moderationHistory = [];
    if (!Array.isArray(next.notifications)) next.notifications = [];
    if (!Array.isArray(next.logs)) next.logs = [];
    if (!Array.isArray(next.reviews)) next.reviews = [];
    if (!Array.isArray(next.conversations)) next.conversations = [];
    if (!Array.isArray(next.payments)) next.payments = [];
    if (!next.favoritesByUser || typeof next.favoritesByUser !== "object") next.favoritesByUser = {};
    if (!next.ai || typeof next.ai !== "object") next.ai = { lastMatchTaskId: null, lastAudit: null, lastContentIdeas: null };
    if (!next.settings || typeof next.settings !== "object") next.settings = {};
    if (!next.settings.site || typeof next.settings.site !== "object") next.settings.site = {};
    if (!next.settings.aiTools || typeof next.settings.aiTools !== "object") next.settings.aiTools = {};
    if (!next.settings.content || typeof next.settings.content !== "object") next.settings.content = {};
    if (!next.ui || typeof next.ui !== "object") {
      next.ui = { selectedSpecialistId: null, selectedBusinessConversationId: null, selectedSpecialistConversationId: null };
    }

    next.settings.site = {
      ...defaultSiteSettings(),
      ...next.settings.site,
      socials: { ...defaultSiteSettings().socials, ...(next.settings.site.socials || {}) }
    };
    next.settings.aiTools = {
      ...defaultAiToolsSettings(),
      ...next.settings.aiTools,
      aiMatch: { ...defaultAiToolsSettings().aiMatch, ...(next.settings.aiTools.aiMatch || {}) },
      instagramAudit: { ...defaultAiToolsSettings().instagramAudit, ...(next.settings.aiTools.instagramAudit || {}) },
      contentGenerator: { ...defaultAiToolsSettings().contentGenerator, ...(next.settings.aiTools.contentGenerator || {}) },
      roiCalculator: { ...defaultAiToolsSettings().roiCalculator, ...(next.settings.aiTools.roiCalculator || {}) }
    };
    next.settings.content = { ...defaultContentSettings(), ...next.settings.content };

    next.users = next.users.map((user) => {
      const migrated = { ...user };
      if (!migrated.passwordHash && migrated.password) {
        migrated.passwordHash = hashPasswordPlaceholder(migrated.password);
        delete migrated.password;
      }
      migrated.role = migrated.role === "admin" ? "admin" : migrated.role === "specialist" ? "specialist" : "business";
      migrated.blocked = Boolean(migrated.blocked);
      migrated.createdAt = migrated.createdAt || nowIso();
      return migrated;
    });
    ensureDemoAdmin(next);

    next.specialists = next.specialists.map(normalizeSpecialistData).map((specialist) => ({
      ...specialist,
      status: specialist.status || "active",
      recommended: Boolean(specialist.recommended),
      createdAt: specialist.createdAt || nowIso()
    }));
    if (!next.specialists.length) {
      next.specialists = buildMockSpecialists().map(normalizeSpecialistData).map((specialist) => ({
        ...specialist,
        status: "active",
        recommended: false,
        createdAt: nowIso()
      }));
    }

    next.tasks = next.tasks.map((task) => {
      const migrated = { ...task };
      if (!migrated.title) migrated.title = `Задача ${migrated.id || ""}`.trim();
      if (!migrated.description) migrated.description = migrated.goals || "";
      if (!migrated.category) migrated.category = migrated.niche || "SMM";
      if (!migrated.budgetByn) migrated.budgetByn = Number(migrated.budgetValue || 0) * 6 || 0;
      if (!Array.isArray(migrated.responses)) migrated.responses = [];
      const statusMap = {
        active: "published",
        paused: "archived",
        done: "completed"
      };
      migrated.status = statusMap[migrated.status] || migrated.status || "published";
      migrated.hidden = Boolean(migrated.hidden);
      migrated.createdAt = migrated.createdAt || nowIso();
      migrated.responses = migrated.responses.map((response) => ({
        id: response.id || uid("resp"),
        specialistId: response.specialistId,
        score: Number(response.score || 0),
        reasons: Array.isArray(response.reasons) ? response.reasons : [],
        strongestAreas: Array.isArray(response.strongestAreas) ? response.strongestAreas : [],
        estimatedCostByn: Number(response.estimatedCostByn || 0),
        message: response.message || "Готов(а) подключиться к задаче и предложить план работ.",
        priceByn: Number(response.priceByn || response.estimatedCostByn || 0),
        deadlineDays: Number(response.deadlineDays || 14),
        status: response.status || "new",
        createdAt: response.createdAt || migrated.createdAt || nowIso()
      }));
      return migrated;
    });

    next.complaints = next.complaints.map((item) => ({
      id: item.id || uid("complaint"),
      reporterUserId: item.reporterUserId || null,
      targetType: item.targetType || "specialist",
      targetId: item.targetId || "",
      reason: item.reason || "Без указания причины",
      status: item.status || "new",
      adminComment: item.adminComment || "",
      createdAt: item.createdAt || nowIso()
    }));

    next.notifications = next.notifications.map((item) => ({
      id: item.id || uid("notif"),
      audience: item.audience || "all",
      userId: item.userId || null,
      title: item.title || "Уведомление",
      text: item.text || "",
      createdAt: item.createdAt || nowIso(),
      createdBy: item.createdBy || null
    }));

    next.logs = next.logs.map((item) => ({
      id: item.id || uid("log"),
      ts: item.ts || nowIso(),
      action: item.action || "unknown",
      actorUserId: item.actorUserId || null,
      targetType: item.targetType || "system",
      targetId: item.targetId || "",
      details: item.details || ""
    }));

    next.version = STATE_VERSION;
    return next;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = migrateState(seedState());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid state");
      }
      const migrated = parsed.version === STATE_VERSION ? migrateState(parsed) : migrateState(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch (error) {
      const seeded = migrateState(seedState());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
  }

  const state = loadState();

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function logEvent(action, targetType, targetId, details, actorUserId) {
    state.logs.unshift({
      id: uid("log"),
      ts: nowIso(),
      action,
      actorUserId: actorUserId || (currentUser() ? currentUser().id : null),
      targetType: targetType || "system",
      targetId: targetId || "",
      details: details || ""
    });
    if (state.logs.length > 800) state.logs = state.logs.slice(0, 800);
  }

  function roleLabel(role) {
    if (role === "admin") return "Админ";
    if (role === "specialist") return "Специалист";
    return "Бизнес";
  }

  function taskStatusLabel(status) {
    const labels = {
      draft: "Черновик",
      pending_moderation: "На модерации",
      published: "Опубликована",
      in_progress: "В работе",
      completed: "Завершена",
      rejected: "Отклонена",
      archived: "В архиве"
    };
    return labels[status] || status || "—";
  }

  function responseStatusLabel(status) {
    const labels = {
      new: "Новый",
      accepted: "Принят",
      rejected: "Отклонен",
      cancelled: "Отменен"
    };
    return labels[status] || status || "—";
  }

  function aiToolConfig(key) {
    const defaults = defaultAiToolsSettings();
    const tools = state.settings && state.settings.aiTools ? state.settings.aiTools : defaults;
    return { ...(defaults[key] || {}), ...(tools[key] || {}) };
  }

  function ensureAiToolEnabled(key, toolName) {
    const config = aiToolConfig(key);
    if (config.enabled) return true;
    showToast(`${toolName || "Инструмент"} временно отключен`, "error");
    return false;
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
    if (user.blocked) {
      showToast("Ваш аккаунт заблокирован", "error");
      state.currentUserId = null;
      saveState();
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

  function initGlobalComplaintActions() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const trigger = target.closest("[data-report-type]");
      if (!trigger) return;
      event.preventDefault();
      const reporter = requestAuthForAction("Сначала войдите, чтобы отправить жалобу");
      if (!reporter) return;
      const targetType = trigger.getAttribute("data-report-type") || "specialist";
      const targetId = trigger.getAttribute("data-report-id") || "";
      const reason = window.prompt("Опишите причину жалобы");
      if (!reason || !reason.trim()) return;
      state.complaints.unshift({
        id: uid("complaint"),
        reporterUserId: reporter.id,
        targetType,
        targetId,
        reason: reason.trim(),
        status: "new",
        adminComment: "",
        createdAt: nowIso()
      });
      logEvent("complaint_created", "complaint", targetId, `${targetType}: ${reason.trim()}`, reporter.id);
      saveState();
      showToast("Жалоба отправлена");
    });
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
    if (normalizedPath.includes("/dashboard/business/")) {
      return "business";
    }
    if (normalizedPath.includes("/dashboard/specialist/")) {
      return "specialist";
    }
    if (normalizedPath.includes("/admin/")) {
      return "admin";
    }
    return null;
  }

  function defaultDashboardByRole(role) {
    if (role === "admin") return appUrl("admin/index.html");
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
    if (!user) {
      const requiredRole = requiredRoleForPath(window.location.pathname);
      if (requiredRole) {
        redirectToLogin();
        return false;
      }
      return true;
    }

    if (user.blocked) {
      state.currentUserId = null;
      saveState();
      showToast("Ваш аккаунт заблокирован", "error");
      redirectToLogin();
      return false;
    }

    if (isAuthPage) {
      window.location.href = resolvePostAuthDestination(user);
      return false;
    }

    const onBusinessOnlyRoute = isPath("/dashboard/business/");
    const onSpecialistOnlyRoute = isPath("/dashboard/specialist/");
    const onAdminOnlyRoute = isPath("/admin/");

    if (user.role === "business" && onSpecialistOnlyRoute) {
      window.location.href = appUrl("dashboard/business/index.html");
      return false;
    }

    if (user.role === "specialist" && onBusinessOnlyRoute) {
      window.location.href = appUrl("dashboard/specialist/index.html");
      return false;
    }

    if (user.role !== "admin" && onAdminOnlyRoute) {
      redirectToLogin();
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

    if (user.role === "admin") {
      addAction("Админка", "admin/index.html", "btn btn-primary keep-mobile");
      addLogout();
      return;
    }

    addAction("Кабинет", "dashboard/specialist/index.html", "btn btn-ghost keep-mobile");
    const specialist = user.specialistId ? findSpecialistById(user.specialistId) : null;
    const profilePath = specialist ? specialistProfileUrl("", specialist).replace(/^\//, "") : "u/username/index.html";
    addAction("Мой профиль", profilePath, "btn btn-primary keep-mobile");
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

  function syncProfileLinks() {
    const user = currentUser();
    const specialist =
      user && user.role === "specialist" && user.specialistId
        ? findSpecialistById(user.specialistId)
        : findSpecialistById(state.ui.selectedSpecialistId) || state.specialists[0];
    if (!specialist) return;

    document.querySelectorAll("a[href*='u/username/index.html']").forEach((link) => {
      if (!(link instanceof HTMLAnchorElement)) return;
      const href = link.getAttribute("href") || "";
      if (!href.includes("u/username/index.html")) return;
      const isRelativeRoot = href.startsWith("../../");
      const isThree = href.startsWith("../../../");
      const isOne = href.startsWith("../");
      let prefix = "";
      if (isThree) prefix = "../../../";
      else if (isRelativeRoot) prefix = "../../";
      else if (isOne) prefix = "../";
      link.href = specialistProfileUrl(prefix, specialist);
    });
  }

  function initGlobalSiteSettings() {
    const site = state.settings && state.settings.site ? state.settings.site : defaultSiteSettings();
    const content = state.settings && state.settings.content ? state.settings.content : defaultContentSettings();

    document.documentElement.style.setProperty("--brand", site.primaryColor || "#7b6cff");
    document.title = document.title.replace("SMMATCH", site.platformName || "SMMATCH");

    if (site.logoUrl) {
      document.querySelectorAll(".brand-logo").forEach((img) => {
        img.src = site.logoUrl;
      });
    }

    const footerMeta = document.querySelector("footer .meta");
    if (footerMeta && site.footerText) footerMeta.textContent = site.footerText;

    if (isPath("/index.html") || window.location.pathname === "/") {
      const heroTitle = document.querySelector(".hero h1");
      if (heroTitle && content.homeHeroTitle) heroTitle.textContent = content.homeHeroTitle;
      document.querySelectorAll(".section-title").forEach((node) => {
        const txt = normalize(node.textContent);
        if (txt.includes("faq") || txt.includes("вопрос")) node.textContent = content.faqTitle || node.textContent;
        if (txt.includes("преим")) node.textContent = content.benefitsTitle || node.textContent;
      });
    }

    if (!site.registrationEnabled) {
      document.querySelectorAll("a[href*='auth/register']").forEach((link) => {
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", (event) => {
          event.preventDefault();
          showToast("Регистрация временно отключена", "error");
        });
      });
    }

    if (!site.taskPublishingEnabled) {
      document.querySelectorAll("a[href*='task/new']").forEach((link) => {
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", (event) => {
          event.preventDefault();
          showToast("Публикация задач временно отключена", "error");
        });
      });
      if (isPath("/task/new/")) {
        showToast("Публикация задач временно отключена", "error");
        window.setTimeout(() => {
          window.location.href = appUrl("index.html");
        }, 250);
      }
    }

    if (!site.specialistsCatalogEnabled) {
      document.querySelectorAll("a[href*='specialists/index.html']").forEach((link) => {
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", (event) => {
          event.preventDefault();
          showToast("Каталог специалистов временно скрыт", "error");
        });
      });
      if (isPath("/specialists/")) {
        const root = document.querySelector("main.container");
        if (root) {
          root.innerHTML = `<section class="section"><article class="card"><h1>Каталог временно скрыт</h1><p class="meta">Администратор отключил каталог специалистов. Попробуйте позже.</p></article></section>`;
        }
      }
    }
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
    if (isPath("/dashboard/") || isPath("/auth/") || isPath("/admin/")) return;

    const title = hero.querySelector("h1")?.textContent || "";
    const collage = document.createElement("div");
    collage.className = "hero-collage";
    const used = new Set();
    const baseTheme = pickVisualTheme(title);
    const visualThemes = [baseTheme, "analytics", "content"];
    const visuals = visualThemes.map((theme, index) => pickVisualAsset(theme, index, used));

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
    if (isPath("/admin/")) return;
    const cards = document.querySelectorAll("main .card");
    if (!cards.length) return;
    const used = new Set();

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
      const visual = pickVisualAsset(theme, index, used);
      const photo = document.createElement("div");
      photo.className = "card-photo";
      photo.style.setProperty("--card-photo", `url("${visual}")`);
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
    const used = new Set();
    nodes.forEach((node, index) => {
      const title =
        node.closest(".card, article")?.querySelector("h1, h2, h3, h4, strong")?.textContent ||
        node.className ||
        "visual";
      const theme = pickVisualTheme(title);
      node.style.setProperty("--media-photo", `url("${pickVisualAsset(theme, index, used)}")`);
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
        <strong>${estimatedRevenue.toLocaleString("ru-RU")} BYN</strong> прогноз оборота
      `;
    });
  }

  function initRoiCalculatorPage() {
    if (!isPath("/roi-calculator/")) return;
    const root = document.querySelector("[data-roi-tool]");
    if (!root) return;
    if (!ensureAiToolEnabled("roiCalculator", "ROI-калькулятор")) {
      root.innerHTML = `<section class="section"><article class="card"><h2>ROI-калькулятор временно отключен</h2><p class="meta">${aiToolConfig("roiCalculator").hint || "Инструмент отключен администратором."}</p></article></section>`;
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fields = {
      smmBudget: root.querySelector("[name='smm_budget']"),
      adsBudget: root.querySelector("[name='ads_budget']"),
      avgCheck: root.querySelector("[name='avg_check']"),
      currentLeads: root.querySelector("[name='current_leads']"),
      growthPercent: root.querySelector("[name='growth_percent']"),
      conversion: root.querySelector("[name='conversion']"),
      margin: root.querySelector("[name='margin']")
    };
    const metricNodes = {
      newLeads: root.querySelector("[data-roi-value='new-leads']"),
      sales: root.querySelector("[data-roi-value='sales']"),
      revenue: root.querySelector("[data-roi-value='revenue']"),
      profit: root.querySelector("[data-roi-value='profit']"),
      roi: root.querySelector("[data-roi-value='roi']"),
      payback: root.querySelector("[data-roi-value='payback']")
    };
    const stateCard = root.querySelector("[data-roi-state]");
    const copyBtn = root.querySelector("[data-roi-copy]");

    if (!fields.smmBudget || !metricNodes.roi) return;

    let previous = {
      newLeads: 0,
      sales: 0,
      revenue: 0,
      profit: 0,
      roi: 0,
      payback: null
    };

    function parseNumber(node) {
      if (!node) return 0;
      const parsed = Number(node.value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    function formatMoney(value) {
      return `${value.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} BYN`;
    }

    function formatPercent(value) {
      if (value === null || !Number.isFinite(value)) return "—";
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
      const smmBudget = Math.max(0, parseNumber(fields.smmBudget));
      const adsBudget = Math.max(0, parseNumber(fields.adsBudget));
      const avgCheck = Math.max(0, parseNumber(fields.avgCheck));
      const currentLeads = Math.max(0, parseNumber(fields.currentLeads));
      const growthPercent = Math.max(0, parseNumber(fields.growthPercent));
      const conversion = Math.max(0, parseNumber(fields.conversion));
      const margin = Math.max(0, parseNumber(fields.margin));

      const totalBudget = smmBudget + adsBudget;
      const newLeads = currentLeads * (1 + growthPercent / 100);
      const sales = newLeads * (conversion / 100);
      const revenue = sales * avgCheck;
      const profit = revenue * (margin / 100);
      const roi = totalBudget > 0 ? ((profit - totalBudget) / totalBudget) * 100 : null;
      const payback = profit > 0 ? totalBudget / profit : null;

      const next = { newLeads, sales, revenue, profit, roi, payback };
      animateValue(metricNodes.newLeads, previous.newLeads, next.newLeads, (v) =>
        `${Math.round(v).toLocaleString("ru-RU")}`
      );
      animateValue(metricNodes.sales, previous.sales, next.sales, (v) =>
        `${Math.round(v).toLocaleString("ru-RU")}`
      );
      animateValue(metricNodes.revenue, previous.revenue, next.revenue, (v) => formatMoney(v));
      animateValue(metricNodes.profit, previous.profit, next.profit, (v) => formatMoney(v));
      animateValue(metricNodes.roi, previous.roi, next.roi, (v) => formatPercent(v));
      animateValue(metricNodes.payback, previous.payback, next.payback, (v) =>
        v === null || !Number.isFinite(v) ? "—" : `${v.toFixed(1)} мес`
      );

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
      root.setAttribute("data-roi-report", JSON.stringify(next));
    }

    function buildReport() {
      const raw = root.getAttribute("data-roi-report");
      if (!raw) return "";
      try {
        const report = JSON.parse(raw);
        return [
          `ROI: ${report.roi === null ? "—" : formatPercent(report.roi)}`,
          `Новые заявки: ${Math.round(report.newLeads || 0).toLocaleString("ru-RU")}`,
          `Продажи: ${Math.round(report.sales || 0).toLocaleString("ru-RU")}`,
          `Выручка: ${formatMoney(report.revenue || 0)}`,
          `Прибыль: ${formatMoney(report.profit || 0)}`,
          `Окупаемость: ${report.payback === null || !Number.isFinite(report.payback) ? "—" : `${report.payback.toFixed(1)} мес`}`
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
    if (tier.includes("до 800")) return 800;
    if (tier.includes("800-1500")) return 1500;
    if (tier.includes("1500-3000")) return 3000;
    if (tier.includes("3000+")) return 5000;
    return 1500;
  }

  function collectSkillHints(taskInput) {
    const hints = [];
    const category = normalize(taskInput.category || "");
    const description = normalize(taskInput.description || taskInput.goals || "");
    if (category) hints.push(category);
    if (normalize(taskInput.needReels) === "да" || description.includes("reels") || description.includes("tiktok")) {
      hints.push("reels", "монтаж");
    }
    if (normalize(taskInput.needTarget) === "да" || description.includes("таргет") || description.includes("реклама")) {
      hints.push("таргет");
    }
    if (normalize(taskInput.needContent) !== "нет" || description.includes("контент")) {
      hints.push("контент");
    }
    return hints;
  }

  function computeMatchAnalysis(specialist, taskInput) {
    const budgetByn = Number(taskInput.budgetByn || taskInput.budgetValue || 0) || 0;
    const niche = normalize(taskInput.niche);
    const platformsText = normalize(taskInput.platforms);
    const skillHints = collectSkillHints(taskInput);
    const specialistSkills = specialist.skills.map((item) => normalize(item));

    let score = 20;
    const reasons = [];
    const strongestAreas = [];

    const specializationText = normalize(specialist.specialization);
    const categoryMatched = !taskInput.category || specializationText.includes(normalize(taskInput.category)) || skillHints.some((hint) => specialistSkills.some((skill) => skill.includes(hint)));
    if (categoryMatched) {
      score += 22;
      reasons.push("Совпадает по специализации и типу задач.");
      strongestAreas.push("Специализация по вашей задаче");
    }

    if (specialist.niches.some((item) => normalize(item) === niche)) {
      score += 15;
      reasons.push(`Есть кейсы в нише «${taskInput.niche}».`);
      strongestAreas.push("Опыт в вашей нише");
    }

    const platformMatch = specialist.platforms.some((item) => platformsText.includes(normalize(item)));
    if (platformMatch) {
      score += 12;
      reasons.push("Работает на нужных площадках.");
      strongestAreas.push("Площадки совпадают");
    }

    const skillMatches = skillHints.filter((hint) => specialistSkills.some((skill) => skill.includes(hint)));
    if (skillMatches.length) {
      score += Math.min(16, 5 + skillMatches.length * 3);
      reasons.push(`Подходит по навыкам: ${skillMatches.slice(0, 3).join(", ")}.`);
      strongestAreas.push("Релевантные навыки");
    }

    if (budgetByn > 0) {
      if (specialist.priceByn <= budgetByn) {
        score += 17;
        reasons.push("Вписывается в ваш бюджет.");
      } else if (specialist.priceByn <= budgetByn * 1.2) {
        score += 8;
        reasons.push("Немного выше бюджета, но в рабочем диапазоне.");
      } else {
        reasons.push("Требует больший бюджет, чем указан в задаче.");
      }
    }

    const ratingPart = (Number(specialist.rating || 0) / 5) * 10;
    score += Math.round(ratingPart);
    if (specialist.rating >= 4.8) strongestAreas.push("Высокий рейтинг");

    if (specialist.experience === "senior") score += 8;
    else if (specialist.experience === "middle") score += 5;
    else score += 2;

    const finalScore = Math.max(35, Math.min(99, Math.round(score)));
    return {
      score: finalScore,
      reasons: reasons.slice(0, 3),
      strongestAreas: Array.from(new Set(strongestAreas)).slice(0, 3),
      estimatedCostByn: specialist.priceByn
    };
  }

  function renderCatalogCard(specialist, rootPrefix) {
    const ratingText =
      specialist.reviewsCount > 0 ? `${specialist.rating.toFixed(1)} (${specialist.reviewsCount})` : "без оценок";
    const socialEntries = [
      ["Instagram", specialist.socials.instagram],
      ["TikTok", specialist.socials.tiktok],
      ["Telegram", specialist.socials.telegram],
      ["Portfolio", specialist.socials.behance]
    ].filter((item) => item[1]);
    return `
      <article class="card catalog-card">
        <div class="avatar" style="--media-photo: url('${specialist.avatar}')"></div>
        <div>
          <h3>${specialist.name}</h3>
          <div class="meta">${specialist.specialization} • ${specialist.city} • ${ratingText}</div>
          <div class="verified">Verified профиль</div>
          <p class="meta">${specialist.description}</p>
          <div class="chips">
            ${specialist.platforms.slice(0, 3).map((item) => `<span class="chip">${item}</span>`).join("")}
          </div>
          <div class="chips">
            ${specialist.skills.slice(0, 3).map((item) => `<span class="chip">${item}</span>`).join("")}
          </div>
          <div class="chips">
            ${
              socialEntries.length
                ? socialEntries
                    .slice(0, 2)
                    .map((item) => `<a class="chip" href="${item[1]}" target="_blank" rel="noopener noreferrer">${item[0]}</a>`)
                    .join("")
                : '<span class="chip">Нет публичных ссылок</span>'
            }
          </div>
        </div>
        <div class="catalog-side">
          <div>
            <div class="price">от ${formatMoneyByn(specialist.priceByn)} / мес</div>
            <div class="meta">${specialist.cases.length} кейсов</div>
          </div>
          <div class="catalog-metrics">
            <span>ER: ${specialist.stats.er}</span>
            <span>CTR: ${specialist.stats.ctr}</span>
            <span>Рост: ${specialist.stats.reachGrowth}</span>
          </div>
          <div class="chips">
            <a class="btn btn-primary" href="${specialistProfileUrl(rootPrefix, specialist)}" data-open-profile="${specialist.id}">Смотреть профиль</a>
            <button class="btn btn-ghost" data-add-favorite="${specialist.id}" type="button">В избранное</button>
            <button class="btn btn-ghost" data-report-type="specialist" data-report-id="${specialist.id}" type="button">Пожаловаться</button>
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
    const priceGroup = priceRange ? priceRange.closest(".filter-group") : null;
    const priceTitle = priceGroup ? priceGroup.querySelector("h4") : null;
    const searchInput = document.querySelector("[data-specialists-search]");

    function selectedOptions(groupIndex, groupName) {
      const namedGroup = groupName
        ? document.querySelector(`.filter-group[data-filter-group='${groupName}']`)
        : null;
      const group = namedGroup || groups[groupIndex];
      if (!group) return [];
      return Array.from(group.querySelectorAll(".option.active")).map((item) => normalize(item.textContent));
    }

    function render() {
      const selectedCategories = selectedOptions(0, "categories");
      const selectedPlatforms = selectedOptions(1, "platforms");
      const selectedCities = selectedOptions(2, "city");
      const selectedExperience = selectedOptions(4, "experience");
      const selectedNiches = selectedOptions(5, "niche");
      const selectedRatings = selectedOptions(6, "rating");
      const selectedSkills = selectedOptions(7, "skills");
      const maxPrice = Number(priceRange ? priceRange.value : 3000);
      const searchText = normalize(searchInput ? searchInput.value : "");

      if (priceTitle) {
        priceTitle.textContent = `Цена: до ${formatMoneyByn(maxPrice)}`;
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
        const priceOk = specialist.priceByn <= maxPrice;
        const ratingOk =
          selectedRatings.length === 0 ||
          selectedRatings.some((item) => {
            if (item.includes("4.8")) return specialist.rating >= 4.8;
            if (item.includes("4.5")) return specialist.rating >= 4.5;
            if (item.includes("4+")) return specialist.rating >= 4;
            return true;
          });
        const skillsOk =
          selectedSkills.length === 0 ||
          selectedSkills.some((skill) => specialist.skills.some((item) => normalize(item).includes(skill)));
        const searchOk =
          !searchText ||
          normalize(specialist.name).includes(searchText) ||
          normalize(specialist.description).includes(searchText) ||
          specialist.skills.some((skill) => normalize(skill).includes(searchText));

        return categoryOk && platformOk && cityOk && experienceOk && nicheOk && priceOk && ratingOk && skillsOk && searchOk;
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

      const openProfileTrigger = target.closest("[data-open-profile]");
      const openProfileId = openProfileTrigger ? openProfileTrigger.getAttribute("data-open-profile") : "";
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

      const favoriteTrigger = target.closest("[data-add-favorite]");
      const favoriteId = favoriteTrigger ? favoriteTrigger.getAttribute("data-add-favorite") : "";
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
    if (searchInput) {
      searchInput.addEventListener("input", render);
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
      const reasonLine = Array.isArray(response.reasons) && response.reasons.length
        ? response.reasons[0]
        : "Подходит по параметрам задачи.";
      card.innerHTML = `
        <strong>${specialist.name}</strong>
        <div class="meta">Match score: ${response.score}% • ${specialist.specialization}</div>
        <div class="meta">${reasonLine}</div>
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
      const titleField = form.querySelector("#task_title");
      const categoryField = form.querySelector("#task_category");
      const budgetField = form.querySelector("#task_budget");
      const descriptionField = form.querySelector("#task_description");
      const deadlineField = form.querySelector("#task_deadline");
      const needTargetField = form.querySelector("#task_need_target");
      const needContentField = form.querySelector("#task_need_content");
      const needReelsField = form.querySelector("#task_need_reels");

      const title = titleField ? titleField.value.trim() : "";
      const category = categoryField ? categoryField.value.trim() : "";
      const budgetByn = Number(budgetField ? budgetField.value : 0);
      const description = descriptionField ? descriptionField.value.trim() : "";
      const deadline = deadlineField ? deadlineField.value : "";

      if (!title) {
        showToast("Укажите название задачи", "error");
        return;
      }
      if (!category) {
        showToast("Выберите категорию", "error");
        return;
      }
      if (!budgetByn || budgetByn <= 0) {
        showToast("Укажите бюджет в BYN", "error");
        return;
      }
      if (!description) {
        showToast("Добавьте описание задачи", "error");
        return;
      }
      if (deadlineField && !deadline) {
        showToast("Укажите дедлайн", "error");
        return;
      }

      const taskInput = {
        title,
        category,
        niche: (form.querySelector("#niche") || { value: "Кафе" }).value,
        budgetTier: (form.querySelector("#budget") || { value: "" }).value || "",
        budgetByn,
        platforms: (form.querySelector("#platforms") || { value: "Instagram" }).value,
        description,
        goals: description,
        deadline,
        needTarget: needTargetField ? needTargetField.value : "Не уверен",
        needContent: needContentField ? needContentField.value : "Частично",
        needReels: needReelsField ? needReelsField.value : "Да"
      };

      const budgetValue = getBudgetMaxByTier(taskInput.budgetTier || "");
      taskInput.budgetValue = budgetValue || budgetByn;

      const responses = state.specialists
        .map((specialist) => ({
          id: uid("resp"),
          specialistId: specialist.id,
          ...computeMatchAnalysis(specialist, taskInput),
          message: "Готов(а) подключиться и предложить план запуска на 2 недели.",
          priceByn: specialist.priceByn,
          deadlineDays: 14,
          status: "new",
          createdAt: nowIso()
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      const businessUserId = user.id;
      const assignedSpecialistId = responses[0] ? responses[0].specialistId : null;
      const holdAmount = Math.round(budgetByn * 0.4);

      const task = {
        id: uid("task"),
        title: taskInput.title,
        category: taskInput.category,
        niche: taskInput.niche,
        budgetTier: taskInput.budgetTier || `до ${formatMoneyByn(budgetByn)}`,
        budgetValue,
        budgetByn,
        platforms: taskInput.platforms,
        goals: taskInput.goals || "Рост заявок и охватов",
        description: taskInput.description,
        deadline: taskInput.deadline || "",
        needTarget: taskInput.needTarget,
        needContent: taskInput.needContent,
        needReels: taskInput.needReels,
        status: "pending_moderation",
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
        amount: holdAmount,
        status: "Холд",
        date: nowIso()
      });

      if (assignedSpecialistId) {
        const convo = ensureConversation(businessUserId, assignedSpecialistId);
        addMessage(convo.id, "business", `Создана новая задача: ${task.title}. Цель: ${task.goals}`);
        state.ui.selectedBusinessConversationId = convo.id;
      }

      saveState();
      logEvent("task_created", "task", task.id, `Создана задача ${task.title}`, user.id);
      if (secondPanel && previewTitle) {
        renderTaskPreviewMatches(task, previewTitle.parentElement);
      }
      showToast("Задача опубликована. AI Match обновлен.");
      form.reset();
      window.setTimeout(() => {
        window.location.href = appUrl("dashboard/business/index.html");
      }, 420);
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
            passwordHash: hashPasswordPlaceholder(password),
            blocked: false,
            createdAt: nowIso()
          };

          if (user.role === "specialist") {
            const specialistId = uid("spec");
            user.specialistId = specialistId;
            state.specialists.push(normalizeSpecialistData({
              id: specialistId,
              userId,
              slug: normalizeForSlug(name),
              name,
              city: "Онлайн",
              country: "СНГ",
              rating: 0,
              reviewsCount: 0,
              specialization: "SMM-специалист",
              experience: "junior",
              description: "Новый специалист на платформе.",
              about: "Добавьте подробное описание в настройках профиля.",
              priceByn: 800,
              platforms: ["Instagram"],
              niches: ["кафе"],
              skills: ["smm"],
              stats: { er: "0%", ctr: "0%", cpm: "0 BYN", views: "0", followersGrowth: "+0", reachGrowth: "+0%" },
              socials: {
                instagram: "",
                tiktok: "",
                telegram: "",
                behance: ""
              },
              cases: []
            }));
          }

          state.users.push(user);
          logEvent("user_created", "user", user.id, `Создан пользователь (${user.role})`, user.id);
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
            (item) => normalize(item.email) === normalize(email) && verifyPassword(item, password)
          );
          if (!user) {
            showToast("Неверный email или пароль", "error");
            return;
          }
          if (user.blocked) {
            showToast("Аккаунт заблокирован", "error");
            return;
          }
          state.currentUserId = user.id;
          if (user.role === "admin") {
            logEvent("admin_login", "user", user.id, "Вход администратора", user.id);
          }
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
    if (!isPath("/u/")) return;
    const root = document.querySelector("main.container");
    if (!root) return;
    if (!state.specialists.length) {
      root.innerHTML = `
        <article class="card">
          <h1>Профили пока не опубликованы</h1>
          <p class="meta">Зарегистрируйтесь как специалист и заполните профиль в кабинете.</p>
        </article>
      `;
      return;
    }

    const url = new URL(window.location.href);
    const slugFromQuery = normalize(url.searchParams.get("slug"));
    const specialistBySlug = slugFromQuery
      ? state.specialists.find((item) => normalize(item.slug) === slugFromQuery)
      : null;
    const specialistBySelected = state.ui.selectedSpecialistId ? findSpecialistById(state.ui.selectedSpecialistId) : null;
    const sessionUser = currentUser();
    const specialistBySession =
      sessionUser && sessionUser.role === "specialist" && sessionUser.specialistId
        ? findSpecialistById(sessionUser.specialistId)
        : null;
    const specialist = specialistBySlug || specialistBySelected || specialistBySession || state.specialists[0];

    if (slugFromQuery && !specialistBySlug) {
      root.innerHTML = `
        <article class="card">
          <h1>Профиль не найден</h1>
          <p class="meta">Проверьте ссылку или вернитесь в каталог специалистов.</p>
          <a class="btn btn-primary" href="${appUrl("specialists/index.html")}">Перейти в каталог</a>
        </article>
      `;
      return;
    }

    const header = document.querySelector(".profile-header");
    if (header) {
      const avatar = header.querySelector(".profile-avatar");
      const h1 = header.querySelector("h1");
      const metas = header.querySelectorAll(".meta");
      const price = header.querySelector(".price");
      const chips = header.querySelector(".chips");
      if (h1) h1.textContent = specialist.name;
      if (avatar) avatar.style.setProperty("--media-photo", `url("${specialist.avatar}")`);
      if (metas[0]) {
        const ratingText =
          specialist.reviewsCount > 0
            ? `${specialist.rating.toFixed(1)} (${specialist.reviewsCount})`
            : "оценок пока нет";
        metas[0].textContent = `${specialist.city} • ${specialist.specialization} • ${ratingText}`;
      }
      if (price) price.textContent = `от ${formatMoneyByn(specialist.priceByn)} / мес`;
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
      const links = [
        specialist.socials.instagram,
        specialist.socials.tiktok,
        specialist.socials.telegram,
        specialist.socials.behance
      ];
      tabs.forEach((tab, index) => {
        const href = links[index] || "";
        const isUsable =
          href &&
          !/instagram\.com\/?$|tiktok\.com\/?$|telegram\.org\/?$|behance\.net\/?$/i.test(href);
        if (isUsable) {
          tab.href = href;
          tab.removeAttribute("aria-disabled");
          tab.classList.remove("is-disabled");
        } else {
          tab.removeAttribute("href");
          tab.setAttribute("aria-disabled", "true");
          tab.classList.add("is-disabled");
        }
      });
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

    document.querySelectorAll("[data-report-specialist]").forEach((button) => {
      button.setAttribute("data-report-type", "specialist");
      button.setAttribute("data-report-id", specialist.id);
    });

  }

  function initAiMatchPage() {
    if (!isPath("/ai/match/")) return;
    if (!ensureAiToolEnabled("aiMatch", "AI Match")) {
      const root = document.querySelector("main.container");
      if (root) {
        root.innerHTML = `<section class="section"><article class="card"><h2>AI Match временно отключен</h2><p class="meta">${aiToolConfig("aiMatch").hint || "Инструмент отключен администратором."}</p></article></section>`;
      }
      return;
    }
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
    cards[2].querySelector("strong").textContent = String(Math.min(5, responses.length));

    panel.innerHTML = responses
      .slice(0, 5)
      .map((response, index) => {
        const specialist = findSpecialistById(response.specialistId);
        if (!specialist) return "";
        const reasonText = Array.isArray(response.reasons) && response.reasons.length
          ? response.reasons.join(" ")
          : "Подходит по параметрам задачи.";
        const strengths = Array.isArray(response.strongestAreas) && response.strongestAreas.length
          ? response.strongestAreas.join(" • ")
          : "Сильные стороны уточняются";
        return `
          <article class="panel-item">
            <strong>${index + 1}. ${specialist.name}</strong>
            <div class="meta">${response.score}% совпадения • ${specialist.specialization} • ${specialist.city}</div>
            <div class="meta">${reasonText}</div>
            <div class="meta">Сильные стороны: ${strengths}</div>
            <div class="meta">Ориентир стоимости: от ${formatMoneyByn(response.estimatedCostByn || specialist.priceByn)} / мес</div>
            <div class="chips"><a class="chip" href="${specialistProfileUrl("../../", specialist)}">Перейти в профиль</a></div>
          </article>
        `;
      })
      .join("");
  }

  function initAiAuditPage() {
    if (!isPath("/ai/instagram-audit/")) return;
    if (!ensureAiToolEnabled("instagramAudit", "Instagram Audit")) {
      const root = document.querySelector("main.container");
      if (root) {
        root.innerHTML = `<section class="section"><article class="card"><h2>Instagram Audit временно отключен</h2><p class="meta">${aiToolConfig("instagramAudit").hint || "Инструмент отключен администратором."}</p></article></section>`;
      }
      return;
    }
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
      const title = cards[1].querySelector("h2");
      if (title) title.textContent = "Результат демо-аудита";
    }

    if (state.ai.lastAudit) {
      renderAudit(state.ai.lastAudit);
    }

    button.addEventListener("click", () => {
      const username = input ? input.value.trim() : "";
      const niche = select ? select.value : "Кафе";
      const normalizedValue = username.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\?.*$/, "").replace(/\/+$/, "");
      const account = normalizedValue.replace(/^@/, "");
      if (!account || !/^[a-z0-9._]{2,30}$/i.test(account)) {
        showToast("Укажите корректный username или ссылку Instagram", "error");
        return;
      }
      const items = [
        {
          title: "Оценка профиля: 72/100",
          text: `Демо-анализ для @${account} в нише «${niche}». Сильный визуал, но слабая упаковка оффера в био.`
        },
        {
          title: "Сильные стороны",
          text: "Регулярные публикации и качественная визуальная подача контента."
        },
        {
          title: "Слабые стороны",
          text: "Мало продающих CTA и не хватает серийных рубрик под лиды."
        },
        {
          title: "Рекомендации",
          text: "Добавьте 2 экспертных Reels в неделю, укрепите CTA в био и настройте автоответ в директ."
        },
        {
          title: "Идеи контента",
          text: "Серия «до/после», короткие разборы ошибок и кейс-ролики на 20–30 секунд."
        }
      ];

      state.ai.lastAudit = { username: account, niche, items, createdAt: nowIso() };
      saveState();
      renderAudit(state.ai.lastAudit);
      showToast("Демо-аудит готов");
    });
  }

  function initAiContentPage() {
    if (!isPath("/ai/content-generator/")) return;
    if (!ensureAiToolEnabled("contentGenerator", "Content Generator")) {
      const root = document.querySelector("main.container");
      if (root) {
        root.innerHTML = `<section class="section"><article class="card"><h2>Content Generator временно отключен</h2><p class="meta">${aiToolConfig("contentGenerator").hint || "Инструмент отключен администратором."}</p></article></section>`;
      }
      return;
    }
    const cards = document.querySelectorAll("main .card");
    if (cards.length < 2) return;
    const controlsCard = cards[0];
    const resultPanel = cards[1].querySelector(".panel-list");
    const button = controlsCard.querySelector(".btn.btn-primary");
    const selects = controlsCard.querySelectorAll("select");
    const qtyInput = controlsCard.querySelector("input[type='number']");
    if (!button || !resultPanel || selects.length < 4) return;

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
      let copyBtn = cards[1].querySelector("[data-copy-ideas]");
      if (!copyBtn) {
        copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "btn btn-ghost";
        copyBtn.textContent = "Скопировать";
        copyBtn.setAttribute("data-copy-ideas", "1");
        cards[1].appendChild(copyBtn);
      }
      copyBtn.onclick = async () => {
        const text = ideas.map((item, i) => `${i + 1}. ${item.title}\n${item.text}`).join("\n\n");
        try {
          await navigator.clipboard.writeText(text);
          showToast("Контент скопирован");
        } catch (error) {
          showToast("Не удалось скопировать", "error");
        }
      };
    }

    if (state.ai.lastContentIdeas) renderIdeas(state.ai.lastContentIdeas.ideas);

    button.addEventListener("click", () => {
      const niche = selects[0].value;
      const platform = selects[1].value;
      const goal = selects[2].value;
      const tone = selects[3].value;
      const count = Math.max(1, Math.min(10, Number(qtyInput ? qtyInput.value : 5) || 5));

      button.disabled = true;
      const originalText = button.textContent;
      button.textContent = "Генерируем...";

      window.setTimeout(() => {
        const ideas = Array.from({ length: count }, (_, index) => {
          const n = index + 1;
          if (n % 3 === 1) {
            return {
              title: `Пост #${n}: «${niche} — ошибка, которая сливает ${goal.toLowerCase()}»`,
              text: `${platform}, тон: ${tone.toLowerCase()}. Добавьте CTA в конце и 3 хэштега по нише.`
            };
          }
          if (n % 3 === 2) {
            return {
              title: `Reels/TikTok #${n}: быстрый разбор кейса`,
              text: `Hook 2 секунды, демонстрация результата и CTA на ${goal.toLowerCase()}.`
            };
          }
          return {
            title: `Stories-серия #${n}: прогрев перед оффером`,
            text: "3 сторис: боль, решение, социальное доказательство + кнопка «Написать»."
          };
        });

        state.ai.lastContentIdeas = { niche, platform, goal, tone, ideas, createdAt: nowIso() };
        saveState();
        renderIdeas(ideas);
        button.disabled = false;
        button.textContent = originalText;
        showToast("Контент-идеи готовы");
      }, 1300);
    });
  }

  function tasksForBusinessUser(businessUserId) {
    return state.tasks.filter((item) => item.businessUserId === businessUserId);
  }

  function tasksForSpecialist(specialistId) {
    return state.tasks.filter((item) => item.assignedSpecialistId === specialistId);
  }

  function incomingTasksForSpecialist(specialistId) {
    return state.tasks.filter((task) => {
      if (task.assignedSpecialistId === specialistId) return false;
      return (task.responses || []).some((response) => response.specialistId === specialistId);
    });
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
    const panels = document.querySelectorAll(".dash-panels > article.card");
    if (panels[0]) {
      const title = panels[0].querySelector("h2");
      if (title) title.textContent = `Активные проекты • ${user.name} (${user.email})`;
    }

    const tableBody = document.querySelector(".table tbody");
    if (tableBody) {
      if (!tasks.length) {
        tableBody.innerHTML = "<tr><td colspan='4' class='meta'>Пока нет задач. Разместите первую задачу, чтобы получить отклики.</td></tr>";
      } else {
        tableBody.innerHTML = tasks
          .slice(0, 5)
          .map((task) => {
            const specialist = findSpecialistById(task.assignedSpecialistId);
            const status = taskStatusLabel(task.status);
            return `<tr>
              <td>${task.title}</td>
              <td>${specialist ? specialist.name : "Не назначен"}</td>
              <td>${status}</td>
              <td>${formatMoneyByn(task.budgetByn || 0)}</td>
            </tr>`;
          })
          .join("");
      }
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
      stats[3].textContent = Number(avgRating).toFixed(1);
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
    if (!tasks.length) {
      tbody.innerHTML = "<tr><td colspan='5' class='meta'>У вас пока нет опубликованных задач.</td></tr>";
      return;
    }
    tbody.innerHTML = tasks
      .map(
        (task) => `
          <tr>
            <td>${task.title}</td>
            <td>${task.niche}</td>
            <td>${formatMoneyByn(task.budgetByn || 0)}</td>
            <td>${task.responses.length}</td>
            <td><span class="status">${taskStatusLabel(task.status)}</span></td>
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
    if (!favorites.length) {
      list.innerHTML = '<div class="panel-item"><div class="meta">Пока нет избранных специалистов.</div></div>';
      return;
    }
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
    if (!payments.length) {
      tbody.innerHTML = "<tr><td colspan='4' class='meta'>Платежей пока нет.</td></tr>";
      return;
    }
    tbody.innerHTML = payments
      .map((payment) => {
        const task = state.tasks.find((item) => item.id === payment.taskId);
        return `
          <tr>
            <td>${task ? task.title : "Проект"}</td>
            <td>${formatMoneyByn(payment.amount)}</td>
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
          if (!requireBusinessForAction()) return;
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
    const incoming = incomingTasksForSpecialist(specialist.id);
    const user = currentUser();
    const projectsCard = Array.from(document.querySelectorAll(".dash-panels > article.card")).find((card) =>
      normalize(card.querySelector("h2")?.textContent).includes("проекты")
    );
    if (projectsCard && user) {
      const h2 = projectsCard.querySelector("h2");
      if (h2) h2.textContent = `Проекты • ${user.name} (${user.email})`;
    }
    const statNodes = document.querySelectorAll(".stats-strip .stat-box strong");
    if (statNodes.length >= 4) {
      statNodes[0].textContent = specialist.reviewsCount > 0 ? specialist.rating.toFixed(1) : "—";
      statNodes[1].textContent = String(incoming.length);
      const conversion = tasks.length ? Math.min(98, 38 + tasks.length * 8) : 0;
      statNodes[2].textContent = `${conversion}%`;
      statNodes[3].textContent = specialist.stats.views;
    }

    const tbody = document.querySelector(".table tbody");
    if (tbody) {
      const rows = [];
      tasks.forEach((task) => {
        rows.push(`
          <tr>
            <td>${task.title}</td>
            <td>${task.platforms}</td>
            <td>${formatDate(task.createdAt)}</td>
            <td>В работе</td>
          </tr>
        `);
      });
      incoming.forEach((task) => {
        rows.push(`
          <tr>
            <td>${task.title}</td>
            <td>${task.platforms}</td>
            <td>${formatDate(task.createdAt)}</td>
            <td>Доступна</td>
          </tr>
        `);
      });
      tbody.innerHTML = rows.length
        ? rows.join("")
        : "<tr><td colspan='4' class='meta'>Пока нет проектов и входящих задач.</td></tr>";
    }
  }

  function renderSpecialistProjects() {
    if (!isPath("/dashboard/specialist/projects/")) return;
    const specialist = currentSpecialistForSession();
    if (!specialist) return;
    const tbody = document.querySelector(".table tbody");
    if (!tbody) return;
    const tasks = tasksForSpecialist(specialist.id);
    const incoming = incomingTasksForSpecialist(specialist.id);
    const rows = tasks
      .map(
        (task) => `
          <tr>
            <td>${task.title}</td>
            <td>${specialist.specialization}</td>
            <td>${formatDate(task.createdAt)}</td>
            <td><span class="status">В работе</span></td>
          </tr>
        `
      )
      .concat(
        incoming.map((task) => {
          const response = (task.responses || []).find((item) => item.specialistId === specialist.id);
          const score = response ? `${response.score}%` : "—";
          return `
            <tr>
              <td>${task.title}</td>
              <td>Отклик (${score})</td>
              <td>${formatDate(task.createdAt)}</td>
              <td><span class="status warn">Доступна</span></td>
            </tr>
          `;
        })
      );
    tbody.innerHTML = rows.length
      ? rows.join("")
      : "<tr><td colspan='4' class='meta'>Проектов и откликов пока нет.</td></tr>";
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

  function openConfirmModal(options) {
    const title = options && options.title ? options.title : "Подтвердите действие";
    const text = options && options.text ? options.text : "Это действие нельзя отменить.";
    const confirmText = options && options.confirmText ? options.confirmText : "Подтвердить";
    const cancelText = options && options.cancelText ? options.cancelText : "Отмена";
    const onConfirm = options && typeof options.onConfirm === "function" ? options.onConfirm : () => {};

    const backdrop = document.createElement("div");
    backdrop.className = "app-modal-backdrop";
    backdrop.innerHTML = `
      <div class="app-modal">
        <h3>${title}</h3>
        <p>${text}</p>
        <div class="hero-buttons">
          <button class="btn btn-danger" type="button" data-confirm-modal-ok>${confirmText}</button>
          <button class="btn btn-ghost" type="button" data-confirm-modal-cancel>${cancelText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    function close() {
      backdrop.remove();
    }

    backdrop.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target === backdrop || target.closest("[data-confirm-modal-cancel]")) {
        close();
        return;
      }
      if (target.closest("[data-confirm-modal-ok]")) {
        close();
        onConfirm();
      }
    });
  }

  function initAdminPanel() {
    if (!isPath("/admin/")) return;
    const root = document.querySelector("[data-admin-root]");
    if (!root) return;
    const adminUser = currentUser();
    if (!adminUser || adminUser.role !== "admin") {
      redirectToLogin();
      return;
    }

    const tabsWrap = root.querySelector("[data-admin-tabs]");
    const tabButtons = Array.from(root.querySelectorAll("[data-admin-tab-btn]"));
    const sections = Array.from(root.querySelectorAll("[data-admin-tab]"));
    const local = {
      userFilter: "all",
      userSearch: "",
      specialistSearch: "",
      taskFilter: "all",
      taskSearch: "",
      financeFilter: "all"
    };

    function byId(list, id) {
      return list.find((item) => item.id === id) || null;
    }

    function userName(userId) {
      const user = byId(state.users, userId);
      return user ? `${user.name} (${user.email})` : "Неизвестный пользователь";
    }

    function taskOwner(task) {
      const user = task ? byId(state.users, task.businessUserId) : null;
      return user ? user.name : "—";
    }

    function specialistNameById(specialistId) {
      const specialist = byId(state.specialists, specialistId);
      return specialist ? specialist.name : "—";
    }

    function allResponses() {
      return state.tasks.flatMap((task) =>
        (task.responses || []).map((response) => ({ ...response, taskId: task.id, taskTitle: task.title }))
      );
    }

    function setTab(tabName) {
      tabButtons.forEach((btn) => {
        const active = btn.getAttribute("data-admin-tab-btn") === tabName;
        btn.classList.toggle("active", active);
      });
      sections.forEach((section) => {
        const active = section.getAttribute("data-admin-tab") === tabName;
        section.classList.toggle("active", active);
      });
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabName);
      window.history.replaceState({}, "", url.toString());
    }

    function renderDashboard() {
      const kpis = root.querySelector("[data-admin-kpis]");
      const users = state.users.length;
      const business = state.users.filter((item) => item.role === "business").length;
      const specialists = state.specialists.length;
      const tasksTotal = state.tasks.length;
      const tasksActive = state.tasks.filter((item) => ["published", "in_progress", "pending_moderation"].includes(item.status)).length;
      const tasksCompleted = state.tasks.filter((item) => item.status === "completed").length;
      const responses = allResponses().length;
      const complaints = state.complaints.length;
      if (kpis) {
        kpis.innerHTML = `
          <div class="stat-box"><strong>${users}</strong><span class="meta">пользователей</span></div>
          <div class="stat-box"><strong>${business}</strong><span class="meta">бизнес-аккаунтов</span></div>
          <div class="stat-box"><strong>${specialists}</strong><span class="meta">специалистов</span></div>
          <div class="stat-box"><strong>${tasksTotal}</strong><span class="meta">задач всего</span></div>
          <div class="stat-box"><strong>${tasksActive}</strong><span class="meta">активных задач</span></div>
          <div class="stat-box"><strong>${tasksCompleted}</strong><span class="meta">завершенных задач</span></div>
          <div class="stat-box"><strong>${responses}</strong><span class="meta">откликов</span></div>
          <div class="stat-box"><strong>${complaints}</strong><span class="meta">жалоб и модераций</span></div>
        `;
      }

      const latestUsers = root.querySelector("[data-admin-latest-users]");
      if (latestUsers) {
        const items = state.users
          .slice()
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 6);
        latestUsers.innerHTML = items.length
          ? items
              .map((user) => `<div class="panel-item"><strong>${user.name}</strong><div class="meta">${user.email} • ${roleLabel(user.role)}</div></div>`)
              .join("")
          : `<div class="empty-state">Пользователи пока отсутствуют.</div>`;
      }

      const latestTasks = root.querySelector("[data-admin-latest-tasks]");
      if (latestTasks) {
        const items = state.tasks
          .slice()
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 6);
        latestTasks.innerHTML = items.length
          ? items
              .map(
                (task) =>
                  `<div class="panel-item"><strong>${task.title}</strong><div class="meta">${task.category} • ${taskStatusLabel(task.status)} • ${taskOwner(task)}</div></div>`
              )
              .join("")
          : `<div class="empty-state">Задач пока нет.</div>`;
      }
    }

    function renderUsers() {
      const tbody = root.querySelector("[data-users-table]");
      if (!tbody) return;
      const query = normalize(local.userSearch);
      let list = state.users.slice();
      if (local.userFilter !== "all") {
        if (local.userFilter === "blocked") list = list.filter((item) => item.blocked);
        else list = list.filter((item) => item.role === local.userFilter);
      }
      if (query) {
        list = list.filter((item) => normalize(item.name).includes(query) || normalize(item.email).includes(query));
      }
      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Пользователи не найдены.</div></td></tr>`;
        return;
      }
      tbody.innerHTML = list
        .map(
          (user) => `
            <tr>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${roleLabel(user.role)}</td>
              <td>${user.blocked ? "Заблокирован" : "Активен"}</td>
              <td>
                <div class="chips">
                  <button class="chip" type="button" data-user-view="${user.id}">Профиль</button>
                  <button class="chip" type="button" data-user-role="${user.id}">Роль</button>
                  <button class="chip" type="button" data-user-block="${user.id}">${user.blocked ? "Разблокировать" : "Блок"}</button>
                  <button class="chip" type="button" data-user-edit="${user.id}">Редактировать</button>
                  <button class="chip" type="button" data-user-delete="${user.id}">Удалить</button>
                </div>
              </td>
            </tr>
          `
        )
        .join("");
    }

    function renderSpecialists() {
      const tbody = root.querySelector("[data-specialists-table]");
      if (!tbody) return;
      const q = normalize(local.specialistSearch);
      const list = state.specialists.filter((item) => {
        if (!q) return true;
        return (
          normalize(item.name).includes(q) ||
          normalize(item.specialization).includes(q) ||
          normalize(item.description).includes(q)
        );
      });
      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Специалисты не найдены.</div></td></tr>`;
        return;
      }
      tbody.innerHTML = list
        .map(
          (item) => `
            <tr>
              <td>${item.name}${item.recommended ? " ⭐" : ""}</td>
              <td>
                <select data-spec-status=\"${item.id}\">
                  <option value=\"active\" ${item.status === "active" ? "selected" : ""}>active</option>
                  <option value=\"pending_moderation\" ${item.status === "pending_moderation" ? "selected" : ""}>pending</option>
                  <option value=\"hidden\" ${item.status === "hidden" ? "selected" : ""}>hidden</option>
                  <option value=\"blocked\" ${item.status === "blocked" ? "selected" : ""}>blocked</option>
                </select>
              </td>
              <td>${Number(item.rating || 0).toFixed(1)}</td>
              <td>${formatMoneyByn(item.priceByn || 0)}</td>
              <td>
                <div class="chips">
                  <button class="chip" type="button" data-spec-edit="${item.id}">Редактировать</button>
                  <button class="chip" type="button" data-spec-rec="${item.id}">${item.recommended ? "Убрать ⭐" : "Рекомендовать"}</button>
                  <button class="chip" type="button" data-spec-delete="${item.id}">Удалить</button>
                </div>
              </td>
            </tr>
          `
        )
        .join("");
    }

    function renderTasks() {
      const tbody = root.querySelector("[data-tasks-table]");
      if (!tbody) return;
      const q = normalize(local.taskSearch);
      let list = state.tasks.slice();
      if (local.taskFilter !== "all") {
        list = list.filter((item) => item.status === local.taskFilter);
      }
      if (q) {
        list = list.filter((item) => {
          const owner = byId(state.users, item.businessUserId);
          return (
            normalize(item.title).includes(q) ||
            normalize(item.category).includes(q) ||
            normalize(owner ? owner.name : "").includes(q)
          );
        });
      }
      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Задачи не найдены.</div></td></tr>`;
        return;
      }
      tbody.innerHTML = list
        .map((task) => {
          const specialistOptions = [
            `<option value=\"\">Не назначен</option>`,
            ...state.specialists.map(
              (item) => `<option value=\"${item.id}\" ${task.assignedSpecialistId === item.id ? "selected" : ""}>${item.name}</option>`
            )
          ].join("");
          return `
            <tr>
              <td>${task.title}<div class="meta">${taskOwner(task)}</div></td>
              <td>${task.category}</td>
              <td>
                <select data-task-status="${task.id}">
                  ${["draft", "pending_moderation", "published", "in_progress", "completed", "rejected", "archived"]
                    .map((status) => `<option value="${status}" ${task.status === status ? "selected" : ""}>${status}</option>`)
                    .join("")}
                </select>
              </td>
              <td><select data-task-specialist="${task.id}">${specialistOptions}</select></td>
              <td>
                <div class="chips">
                  <a class="chip" href="${appUrl(`task/new/index.html`)}">Открыть</a>
                  <button class="chip" type="button" data-task-edit="${task.id}">Редактировать</button>
                  <button class="chip" type="button" data-task-hide="${task.id}">${task.hidden ? "Показать" : "Скрыть"}</button>
                  <button class="chip" type="button" data-task-delete="${task.id}">Удалить</button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("");
    }

    function renderResponses() {
      const tbody = root.querySelector("[data-responses-table]");
      if (!tbody) return;
      const list = allResponses();
      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">Откликов пока нет.</div></td></tr>`;
        return;
      }
      tbody.innerHTML = list
        .map((item) => {
          const specialist = byId(state.specialists, item.specialistId);
          return `
            <tr>
              <td>${item.taskTitle}</td>
              <td>${specialist ? specialist.name : "—"}</td>
              <td>${item.message || "—"}</td>
              <td>${formatMoneyByn(item.priceByn || item.estimatedCostByn || 0)}</td>
              <td>${item.deadlineDays || 0} дн.</td>
              <td>${responseStatusLabel(item.status)}</td>
              <td>
                <div class="chips">
                  <button class="chip" type="button" data-resp-accept="${item.id}" data-task-id="${item.taskId}">Принять</button>
                  <button class="chip" type="button" data-resp-reject="${item.id}" data-task-id="${item.taskId}">Отклонить</button>
                  <button class="chip" type="button" data-resp-delete="${item.id}" data-task-id="${item.taskId}">Удалить</button>
                  <a class="chip" href="${specialist ? specialistProfileUrl("../", specialist) : "#"}">Профиль</a>
                </div>
              </td>
            </tr>
          `;
        })
        .join("");
    }

    function renderModeration() {
      const panel = root.querySelector("[data-moderation-list]");
      if (!panel) return;
      const specialistQueue = state.specialists.filter((item) => item.status === "pending_moderation");
      const taskQueue = state.tasks.filter((item) => item.status === "pending_moderation");
      const complaintQueue = state.complaints.filter((item) => item.status === "new");
      const rows = [];

      specialistQueue.forEach((item) => {
        rows.push(`
          <article class="panel-item">
            <strong>Специалист: ${item.name}</strong>
            <div class="meta">${item.specialization} • ${item.city}</div>
            <div class="chips">
              <button class="chip" type="button" data-mod-approve-spec="${item.id}">Одобрить</button>
              <button class="chip" type="button" data-mod-rework-spec="${item.id}">На доработку</button>
              <button class="chip" type="button" data-mod-reject-spec="${item.id}">Отклонить</button>
              <button class="chip" type="button" data-mod-block-user="${item.userId || ""}">Блокировка</button>
            </div>
          </article>
        `);
      });

      taskQueue.forEach((item) => {
        rows.push(`
          <article class="panel-item">
            <strong>Задача: ${item.title}</strong>
            <div class="meta">${item.category} • ${formatMoneyByn(item.budgetByn || 0)}</div>
            <div class="chips">
              <button class="chip" type="button" data-mod-approve-task="${item.id}">Одобрить</button>
              <button class="chip" type="button" data-mod-rework-task="${item.id}">На доработку</button>
              <button class="chip" type="button" data-mod-reject-task="${item.id}">Отклонить</button>
            </div>
          </article>
        `);
      });

      complaintQueue.forEach((item) => {
        rows.push(`
          <article class="panel-item">
            <strong>Жалоба #${item.id.slice(-5)}</strong>
            <div class="meta">${item.targetType} • ${item.reason}</div>
            <div class="chips">
              <button class="chip" type="button" data-mod-open-complaint="${item.id}">Открыть жалобу</button>
            </div>
          </article>
        `);
      });

      panel.innerHTML = rows.length ? rows.join("") : `<div class="empty-state">Новых объектов для модерации нет.</div>`;
    }

    function renderComplaints() {
      const tbody = root.querySelector("[data-complaints-table]");
      if (!tbody) return;
      if (!state.complaints.length) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">Жалоб пока нет.</div></td></tr>`;
        return;
      }
      tbody.innerHTML = state.complaints
        .map((item) => `
          <tr>
            <td>${userName(item.reporterUserId)}</td>
            <td>${item.targetType}: ${item.targetId || "—"}</td>
            <td>${item.reason}</td>
            <td>${formatDate(item.createdAt)}</td>
            <td>
              <select data-complaint-status="${item.id}">
                <option value="new" ${item.status === "new" ? "selected" : ""}>new</option>
                <option value="reviewing" ${item.status === "reviewing" ? "selected" : ""}>reviewing</option>
                <option value="resolved" ${item.status === "resolved" ? "selected" : ""}>resolved</option>
                <option value="rejected" ${item.status === "rejected" ? "selected" : ""}>rejected</option>
              </select>
            </td>
            <td>${item.adminComment || "—"}</td>
            <td>
              <div class="chips">
                <button class="chip" type="button" data-complaint-comment="${item.id}">Комментарий</button>
              </div>
            </td>
          </tr>
        `)
        .join("");
    }

    function renderFinance() {
      const financeKpis = root.querySelector("[data-finance-kpis]");
      const tbody = root.querySelector("[data-finance-table]");
      if (!financeKpis || !tbody) return;
      const list = state.payments.map((item) => {
        const statusRaw = normalize(item.status);
        const status =
          statusRaw.includes("холд") || statusRaw.includes("ожидает")
            ? "pending"
            : statusRaw.includes("отмен") ? "cancelled" : statusRaw.includes("refund") ? "refunded" : "paid";
        return { ...item, status };
      });

      const turnover = list.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const platformIncome = Math.round(turnover * 0.1);
      const avgCheck = list.length ? Math.round(turnover / list.length) : 0;
      financeKpis.innerHTML = `
        <div class="stat-box"><strong>${formatMoneyByn(turnover)}</strong><span class="meta">оборот</span></div>
        <div class="stat-box"><strong>${formatMoneyByn(platformIncome)}</strong><span class="meta">доход платформы</span></div>
        <div class="stat-box"><strong>${formatMoneyByn(avgCheck)}</strong><span class="meta">средний чек</span></div>
        <div class="stat-box"><strong>${list.length}</strong><span class="meta">сделок</span></div>
      `;

      const filtered = local.financeFilter === "all" ? list : list.filter((item) => item.status === local.financeFilter);
      if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Платежи не найдены.</div></td></tr>`;
        return;
      }
      tbody.innerHTML = filtered
        .map((item) => {
          const fee = Math.round(Number(item.amount || 0) * 0.1);
          const task = byId(state.tasks, item.taskId);
          return `<tr><td>${task ? task.title : "Сделка"}</td><td>${formatMoneyByn(item.amount)}</td><td>${formatMoneyByn(fee)}</td><td>${item.status}</td><td>${formatDate(item.date || nowIso())}</td></tr>`;
        })
        .join("");
    }

    function renderAiTools() {
      const wrap = root.querySelector("[data-ai-tools-grid]");
      if (!wrap) return;
      const tools = [
        ["aiMatch", "AI Match"],
        ["instagramAudit", "Instagram Audit"],
        ["contentGenerator", "Content Generator"],
        ["roiCalculator", "ROI Calculator"]
      ];
      wrap.innerHTML = tools
        .map(([key, label]) => {
          const cfg = aiToolConfig(key);
          return `
            <form class="card" data-ai-tool-form="${key}">
              <h3>${label}</h3>
              <div class="field"><label>Описание</label><input name="hint" value="${cfg.hint || ""}"></div>
              <div class="field"><label>Лимит использований</label><input name="limitPerDay" type="number" min="0" value="${Number(cfg.limitPerDay || 0)}"></div>
              <div class="field"><label>Режим</label><select name="mode"><option value="demo" ${cfg.mode === "demo" ? "selected" : ""}>demo</option><option value="live" ${cfg.mode === "live" ? "selected" : ""}>live</option></select></div>
              <label class="chip"><input type="checkbox" name="enabled" ${cfg.enabled ? "checked" : ""}> Включен</label>
              <button class="btn btn-primary" type="submit">Сохранить</button>
            </form>
          `;
        })
        .join("");
    }

    function hydrateSettingsForms() {
      const site = state.settings.site;
      const content = state.settings.content;
      const siteForm = root.querySelector("[data-site-settings-form]");
      if (siteForm) {
        siteForm.elements.platformName.value = site.platformName || "SMMATCH";
        siteForm.elements.logoUrl.value = site.logoUrl || "";
        siteForm.elements.primaryColor.value = site.primaryColor || "#7b6cff";
        siteForm.elements.currency.value = site.currency || "BYN";
        siteForm.elements.contactEmail.value = site.contactEmail || "";
        siteForm.elements.footerText.value = site.footerText || "";
        siteForm.elements.instagram.value = site.socials.instagram || "";
        siteForm.elements.telegram.value = site.socials.telegram || "";
        siteForm.elements.vk.value = site.socials.vk || "";
        siteForm.elements.tiktok.value = site.socials.tiktok || "";
        siteForm.elements.registrationEnabled.checked = Boolean(site.registrationEnabled);
        siteForm.elements.taskPublishingEnabled.checked = Boolean(site.taskPublishingEnabled);
        siteForm.elements.specialistsCatalogEnabled.checked = Boolean(site.specialistsCatalogEnabled);
      }
      const contentForm = root.querySelector("[data-content-settings-form]");
      if (contentForm) {
        Object.keys(defaultContentSettings()).forEach((key) => {
          if (contentForm.elements[key]) contentForm.elements[key].value = content[key] || "";
        });
      }
    }

    function renderNotifications() {
      const list = root.querySelector("[data-notifications-list]");
      if (!list) return;
      if (!state.notifications.length) {
        list.innerHTML = `<div class="empty-state">Уведомления пока не отправлялись.</div>`;
        return;
      }
      list.innerHTML = state.notifications
        .slice(0, 30)
        .map(
          (item) =>
            `<div class="panel-item"><strong>${item.title}</strong><div class="meta">${item.audience}${item.userId ? ` (${item.userId})` : ""} • ${formatDate(item.createdAt)}</div><div class="meta">${item.text}</div></div>`
        )
        .join("");
    }

    function renderLogs() {
      const tbody = root.querySelector("[data-logs-table]");
      if (!tbody) return;
      const rows = state.logs.slice(0, 300);
      if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Логи пока пустые.</div></td></tr>`;
        return;
      }
      tbody.innerHTML = rows
        .map((item) => {
          const actor = item.actorUserId ? byId(state.users, item.actorUserId) : null;
          return `<tr><td>${new Date(item.ts).toLocaleString("ru-RU")}</td><td>${item.action}</td><td>${actor ? actor.email : "system"}</td><td>${item.targetType}:${item.targetId || "—"}</td><td>${item.details || "—"}</td></tr>`;
        })
        .join("");
    }

    function findTaskAndResponse(taskId, responseId) {
      const task = byId(state.tasks, taskId);
      if (!task) return { task: null, response: null };
      const response = (task.responses || []).find((item) => item.id === responseId) || null;
      return { task, response };
    }

    function rerenderAll() {
      renderDashboard();
      renderUsers();
      renderSpecialists();
      renderTasks();
      renderResponses();
      renderModeration();
      renderComplaints();
      renderFinance();
      renderAiTools();
      hydrateSettingsForms();
      renderNotifications();
      renderLogs();
    }

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-admin-tab-btn") || "dashboard";
        setTab(tab);
      });
    });

    root.querySelectorAll("[data-admin-quick]").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.getAttribute("data-admin-quick");
        if (mode === "add-specialist") {
          setTab("specialists");
          const form = root.querySelector("[data-specialist-form]");
          if (form && form.elements.name) form.elements.name.focus();
        }
        if (mode === "add-task") {
          const title = window.prompt("Название новой задачи");
          if (!title || !title.trim()) return;
          state.tasks.unshift({
            id: uid("task"),
            title: title.trim(),
            category: "SMM",
            niche: "Кафе",
            budgetTier: "до 1500 BYN",
            budgetValue: 1500,
            budgetByn: 1500,
            platforms: "Instagram",
            goals: "Рост заявок",
            description: "Задача создана администратором.",
            deadline: "",
            needTarget: "Да",
            needContent: "Да",
            needReels: "Да",
            status: "draft",
            businessUserId: null,
            assignedSpecialistId: null,
            responses: [],
            hidden: false,
            createdAt: nowIso()
          });
          logEvent("task_created", "task", state.tasks[0].id, "Создана администратором", adminUser.id);
          saveState();
          rerenderAll();
          setTab("tasks");
          showToast("Черновик задачи создан");
          return;
        }
        if (mode === "open-moderation") setTab("moderation");
        if (mode === "open-settings") setTab("settings");
      });
    });

    const userFilterWrap = root.querySelector("[data-user-filter]");
    if (userFilterWrap) {
      userFilterWrap.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const chip = target.closest("[data-value]");
        if (!chip) return;
        local.userFilter = chip.getAttribute("data-value") || "all";
        userFilterWrap.querySelectorAll("[data-value]").forEach((node) => node.classList.remove("active"));
        chip.classList.add("active");
        renderUsers();
      });
    }
    const userSearch = root.querySelector("[data-user-search]");
    if (userSearch) {
      userSearch.addEventListener("input", () => {
        local.userSearch = userSearch.value || "";
        renderUsers();
      });
    }

    const usersTable = root.querySelector("[data-users-table]");
    if (usersTable) {
      usersTable.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const viewBtn = target.closest("[data-user-view]");
        const roleBtn = target.closest("[data-user-role]");
        const blockBtn = target.closest("[data-user-block]");
        const editBtn = target.closest("[data-user-edit]");
        const delBtn = target.closest("[data-user-delete]");
        const id =
          (viewBtn && viewBtn.getAttribute("data-user-view")) ||
          (roleBtn && roleBtn.getAttribute("data-user-role")) ||
          (blockBtn && blockBtn.getAttribute("data-user-block")) ||
          (editBtn && editBtn.getAttribute("data-user-edit")) ||
          (delBtn && delBtn.getAttribute("data-user-delete")) ||
          "";
        if (!id) return;
        const user = byId(state.users, id);
        if (!user) return;

        if (viewBtn) {
          showToast(`${user.name} • ${user.email} • ${roleLabel(user.role)}`);
          return;
        }
        if (roleBtn) {
          const nextRoleRaw = window.prompt("Новая роль: business / specialist / admin", user.role);
          const nextRole = normalize(nextRoleRaw);
          if (!["business", "specialist", "admin"].includes(nextRole)) return;
          user.role = nextRole;
          logEvent("user_role_changed", "user", user.id, `Роль изменена на ${nextRole}`, adminUser.id);
          saveState();
          rerenderAll();
          showToast("Роль обновлена");
          return;
        }
        if (blockBtn) {
          user.blocked = !user.blocked;
          logEvent(user.blocked ? "user_blocked" : "user_unblocked", "user", user.id, user.email, adminUser.id);
          saveState();
          renderUsers();
          showToast(user.blocked ? "Пользователь заблокирован" : "Пользователь разблокирован");
          return;
        }
        if (editBtn) {
          const nextName = window.prompt("Имя", user.name) || user.name;
          const nextEmail = window.prompt("Email", user.email) || user.email;
          user.name = nextName.trim() || user.name;
          user.email = nextEmail.trim() || user.email;
          logEvent("user_edited", "user", user.id, "Имя/email обновлены", adminUser.id);
          saveState();
          renderUsers();
          showToast("Пользователь обновлен");
          return;
        }
        if (delBtn) {
          openConfirmModal({
            title: "Удалить пользователя?",
            text: `${user.name} (${user.email}) будет удален.`,
            confirmText: "Удалить",
            onConfirm: () => {
              state.users = state.users.filter((item) => item.id !== user.id);
              if (state.currentUserId === user.id) state.currentUserId = null;
              logEvent("user_deleted", "user", user.id, user.email, adminUser.id);
              saveState();
              rerenderAll();
              showToast("Пользователь удален");
            }
          });
        }
      });
    }

    const specialistSearch = root.querySelector("[data-specialist-search]");
    if (specialistSearch) {
      specialistSearch.addEventListener("input", () => {
        local.specialistSearch = specialistSearch.value || "";
        renderSpecialists();
      });
    }

    const specialistForm = root.querySelector("[data-specialist-form]");
    const specialistFormTitle = root.querySelector("[data-specialist-form-title]");
    function resetSpecialistForm() {
      if (!specialistForm) return;
      specialistForm.reset();
      specialistForm.elements.id.value = "";
      if (specialistFormTitle) specialistFormTitle.textContent = "Добавить специалиста";
    }
    if (specialistForm) {
      specialistForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(specialistForm);
        const id = String(formData.get("id") || "");
        const payload = {
          name: String(formData.get("name") || "").trim(),
          specialization: String(formData.get("specialization") || "").trim(),
          avatar: String(formData.get("avatar") || "").trim(),
          city: String(formData.get("city") || "").trim() || "Онлайн",
          experience: String(formData.get("experience") || "middle"),
          rating: Number(formData.get("rating") || 0),
          skills: String(formData.get("skills") || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          priceByn: Number(formData.get("priceByn") || 0),
          description: String(formData.get("description") || "").trim(),
          socials: {
            instagram: String(formData.get("instagram") || "").trim(),
            tiktok: String(formData.get("tiktok") || "").trim(),
            telegram: String(formData.get("telegram") || "").trim(),
            behance: String(formData.get("behance") || "").trim()
          },
          cases: String(formData.get("cases") || "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((title) => ({ title, result1: "Добавьте метрику", result2: "Добавьте метрику", period: "Укажите период" }))
        };
        if (!payload.name || !payload.specialization) {
          showToast("Имя и специализация обязательны", "error");
          return;
        }

        if (id) {
          const specialist = byId(state.specialists, id);
          if (!specialist) return;
          Object.assign(specialist, normalizeSpecialistData({ ...specialist, ...payload }));
          logEvent("specialist_updated", "specialist", specialist.id, specialist.name, adminUser.id);
          showToast("Специалист обновлен");
        } else {
          const specialist = normalizeSpecialistData({
            id: uid("spec"),
            slug: normalizeForSlug(payload.name),
            userId: null,
            country: "СНГ",
            reviewsCount: 0,
            about: payload.description || "Профиль создан администратором.",
            niches: ["кафе"],
            platforms: ["Instagram"],
            stats: { er: "0%", ctr: "0%", cpm: "0 BYN", views: "0", followersGrowth: "+0", reachGrowth: "+0%" },
            ...payload
          });
          specialist.status = "pending_moderation";
          specialist.recommended = false;
          specialist.createdAt = nowIso();
          state.specialists.unshift(specialist);
          logEvent("specialist_created", "specialist", specialist.id, specialist.name, adminUser.id);
          showToast("Специалист добавлен");
        }
        saveState();
        resetSpecialistForm();
        rerenderAll();
      });
    }
    const specialistResetBtn = root.querySelector("[data-specialist-form-reset]");
    if (specialistResetBtn) specialistResetBtn.addEventListener("click", resetSpecialistForm);

    const specialistsTable = root.querySelector("[data-specialists-table]");
    if (specialistsTable) {
      specialistsTable.addEventListener("change", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLSelectElement)) return;
        const id = target.getAttribute("data-spec-status");
        if (!id) return;
        const specialist = byId(state.specialists, id);
        if (!specialist) return;
        specialist.status = target.value;
        logEvent("specialist_status_changed", "specialist", specialist.id, specialist.status, adminUser.id);
        saveState();
        renderModeration();
        showToast("Статус обновлен");
      });
      specialistsTable.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const editBtn = target.closest("[data-spec-edit]");
        const recBtn = target.closest("[data-spec-rec]");
        const delBtn = target.closest("[data-spec-delete]");
        const id =
          (editBtn && editBtn.getAttribute("data-spec-edit")) ||
          (recBtn && recBtn.getAttribute("data-spec-rec")) ||
          (delBtn && delBtn.getAttribute("data-spec-delete")) ||
          "";
        if (!id) return;
        const specialist = byId(state.specialists, id);
        if (!specialist) return;
        if (editBtn && specialistForm) {
          specialistForm.elements.id.value = specialist.id;
          specialistForm.elements.name.value = specialist.name || "";
          specialistForm.elements.specialization.value = specialist.specialization || "";
          specialistForm.elements.avatar.value = specialist.avatar || "";
          specialistForm.elements.city.value = specialist.city || "";
          specialistForm.elements.experience.value = specialist.experience || "middle";
          specialistForm.elements.rating.value = String(specialist.rating || 0);
          specialistForm.elements.skills.value = (specialist.skills || []).join(", ");
          specialistForm.elements.priceByn.value = String(specialist.priceByn || 0);
          specialistForm.elements.description.value = specialist.description || "";
          specialistForm.elements.instagram.value = specialist.socials.instagram || "";
          specialistForm.elements.tiktok.value = specialist.socials.tiktok || "";
          specialistForm.elements.telegram.value = specialist.socials.telegram || "";
          specialistForm.elements.behance.value = specialist.socials.behance || "";
          specialistForm.elements.cases.value = (specialist.cases || []).map((item) => item.title).join("\n");
          if (specialistFormTitle) specialistFormTitle.textContent = `Редактирование: ${specialist.name}`;
          return;
        }
        if (recBtn) {
          specialist.recommended = !specialist.recommended;
          logEvent(
            specialist.recommended ? "specialist_recommended" : "specialist_unrecommended",
            "specialist",
            specialist.id,
            specialist.name,
            adminUser.id
          );
          saveState();
          renderSpecialists();
          return;
        }
        if (delBtn) {
          openConfirmModal({
            title: "Удалить специалиста?",
            text: specialist.name,
            confirmText: "Удалить",
            onConfirm: () => {
              state.specialists = state.specialists.filter((item) => item.id !== specialist.id);
              state.tasks.forEach((task) => {
                if (task.assignedSpecialistId === specialist.id) task.assignedSpecialistId = null;
                task.responses = (task.responses || []).filter((resp) => resp.specialistId !== specialist.id);
              });
              logEvent("specialist_deleted", "specialist", specialist.id, specialist.name, adminUser.id);
              saveState();
              rerenderAll();
              showToast("Специалист удален");
            }
          });
        }
      });
    }

    const taskFilter = root.querySelector("[data-task-filter]");
    if (taskFilter) {
      taskFilter.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const chip = target.closest("[data-value]");
        if (!chip) return;
        local.taskFilter = chip.getAttribute("data-value") || "all";
        taskFilter.querySelectorAll("[data-value]").forEach((node) => node.classList.remove("active"));
        chip.classList.add("active");
        renderTasks();
      });
    }
    const taskSearch = root.querySelector("[data-task-search]");
    if (taskSearch) {
      taskSearch.addEventListener("input", () => {
        local.taskSearch = taskSearch.value || "";
        renderTasks();
      });
    }

    const tasksTable = root.querySelector("[data-tasks-table]");
    if (tasksTable) {
      tasksTable.addEventListener("change", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLSelectElement)) return;
        const statusId = target.getAttribute("data-task-status");
        const specialistId = target.getAttribute("data-task-specialist");
        if (statusId) {
          const task = byId(state.tasks, statusId);
          if (!task) return;
          task.status = target.value;
          logEvent("task_status_changed", "task", task.id, task.status, adminUser.id);
          saveState();
          rerenderAll();
          return;
        }
        if (specialistId) {
          const task = byId(state.tasks, specialistId);
          if (!task) return;
          task.assignedSpecialistId = target.value || null;
          if (task.assignedSpecialistId) task.status = "in_progress";
          logEvent("task_specialist_assigned", "task", task.id, task.assignedSpecialistId || "none", adminUser.id);
          saveState();
          rerenderAll();
        }
      });
      tasksTable.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const editBtn = target.closest("[data-task-edit]");
        const hideBtn = target.closest("[data-task-hide]");
        const delBtn = target.closest("[data-task-delete]");
        const id =
          (editBtn && editBtn.getAttribute("data-task-edit")) ||
          (hideBtn && hideBtn.getAttribute("data-task-hide")) ||
          (delBtn && delBtn.getAttribute("data-task-delete")) ||
          "";
        if (!id) return;
        const task = byId(state.tasks, id);
        if (!task) return;
        if (editBtn) {
          const nextTitle = window.prompt("Название задачи", task.title) || task.title;
          const nextCategory = window.prompt("Категория", task.category) || task.category;
          task.title = nextTitle.trim() || task.title;
          task.category = nextCategory.trim() || task.category;
          logEvent("task_updated", "task", task.id, task.title, adminUser.id);
          saveState();
          rerenderAll();
          return;
        }
        if (hideBtn) {
          task.hidden = !task.hidden;
          logEvent(task.hidden ? "task_hidden" : "task_unhidden", "task", task.id, task.title, adminUser.id);
          saveState();
          renderTasks();
          showToast(task.hidden ? "Задача скрыта" : "Задача опубликована");
          return;
        }
        if (delBtn) {
          openConfirmModal({
            title: "Удалить задачу?",
            text: task.title,
            confirmText: "Удалить",
            onConfirm: () => {
              state.tasks = state.tasks.filter((item) => item.id !== task.id);
              state.payments = state.payments.filter((item) => item.taskId !== task.id);
              logEvent("task_deleted", "task", task.id, task.title, adminUser.id);
              saveState();
              rerenderAll();
              showToast("Задача удалена");
            }
          });
        }
      });
    }

    const responsesTable = root.querySelector("[data-responses-table]");
    if (responsesTable) {
      responsesTable.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const acceptBtn = target.closest("[data-resp-accept]");
        const rejectBtn = target.closest("[data-resp-reject]");
        const deleteBtn = target.closest("[data-resp-delete]");
        const responseId =
          (acceptBtn && acceptBtn.getAttribute("data-resp-accept")) ||
          (rejectBtn && rejectBtn.getAttribute("data-resp-reject")) ||
          (deleteBtn && deleteBtn.getAttribute("data-resp-delete")) ||
          "";
        const taskId =
          (acceptBtn && acceptBtn.getAttribute("data-task-id")) ||
          (rejectBtn && rejectBtn.getAttribute("data-task-id")) ||
          (deleteBtn && deleteBtn.getAttribute("data-task-id")) ||
          "";
        if (!responseId || !taskId) return;
        const pair = findTaskAndResponse(taskId, responseId);
        if (!pair.task || !pair.response) return;

        if (acceptBtn) {
          pair.response.status = "accepted";
          pair.task.assignedSpecialistId = pair.response.specialistId;
          pair.task.status = "in_progress";
          logEvent("response_accepted", "response", pair.response.id, pair.task.title, adminUser.id);
          saveState();
          rerenderAll();
          return;
        }
        if (rejectBtn) {
          pair.response.status = "rejected";
          logEvent("response_rejected", "response", pair.response.id, pair.task.title, adminUser.id);
          saveState();
          renderResponses();
          return;
        }
        if (deleteBtn) {
          pair.task.responses = (pair.task.responses || []).filter((item) => item.id !== pair.response.id);
          logEvent("response_deleted", "response", pair.response.id, pair.task.title, adminUser.id);
          saveState();
          rerenderAll();
        }
      });
    }

    const moderationList = root.querySelector("[data-moderation-list]");
    if (moderationList) {
      moderationList.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        function addModerationRecord(entityType, entityId, action, reason) {
          state.moderationHistory.unshift({
            id: uid("mod"),
            entityType,
            entityId,
            action,
            reason: reason || "",
            byUserId: adminUser.id,
            createdAt: nowIso()
          });
        }

        const approveSpec = target.closest("[data-mod-approve-spec]");
        if (approveSpec) {
          const id = approveSpec.getAttribute("data-mod-approve-spec");
          const specialist = byId(state.specialists, id);
          if (!specialist) return;
          specialist.status = "active";
          addModerationRecord("specialist", specialist.id, "approved");
          logEvent("moderation_approved", "specialist", specialist.id, specialist.name, adminUser.id);
          saveState();
          rerenderAll();
          return;
        }

        const reworkSpec = target.closest("[data-mod-rework-spec]");
        if (reworkSpec) {
          const id = reworkSpec.getAttribute("data-mod-rework-spec");
          const specialist = byId(state.specialists, id);
          if (!specialist) return;
          specialist.status = "hidden";
          addModerationRecord("specialist", specialist.id, "rework", "Отправлен на доработку");
          logEvent("moderation_rework", "specialist", specialist.id, specialist.name, adminUser.id);
          saveState();
          rerenderAll();
          return;
        }

        const rejectSpec = target.closest("[data-mod-reject-spec]");
        if (rejectSpec) {
          const id = rejectSpec.getAttribute("data-mod-reject-spec");
          const specialist = byId(state.specialists, id);
          if (!specialist) return;
          const reason = window.prompt("Причина отклонения", "Недостаточно данных профиля");
          specialist.status = "blocked";
          addModerationRecord("specialist", specialist.id, "rejected", reason || "");
          logEvent("moderation_rejected", "specialist", specialist.id, reason || "", adminUser.id);
          saveState();
          rerenderAll();
          return;
        }

        const blockUserBtn = target.closest("[data-mod-block-user]");
        if (blockUserBtn) {
          const id = blockUserBtn.getAttribute("data-mod-block-user");
          if (!id) return;
          const user = byId(state.users, id);
          if (!user) return;
          user.blocked = true;
          addModerationRecord("user", user.id, "blocked", "Блокировка через модерацию");
          logEvent("user_blocked", "user", user.id, user.email, adminUser.id);
          saveState();
          rerenderAll();
          return;
        }

        const approveTask = target.closest("[data-mod-approve-task]");
        if (approveTask) {
          const id = approveTask.getAttribute("data-mod-approve-task");
          const task = byId(state.tasks, id);
          if (!task) return;
          task.status = "published";
          addModerationRecord("task", task.id, "approved");
          logEvent("moderation_approved", "task", task.id, task.title, adminUser.id);
          saveState();
          rerenderAll();
          return;
        }

        const reworkTask = target.closest("[data-mod-rework-task]");
        if (reworkTask) {
          const id = reworkTask.getAttribute("data-mod-rework-task");
          const task = byId(state.tasks, id);
          if (!task) return;
          task.status = "draft";
          addModerationRecord("task", task.id, "rework", "Нужно уточнить описание");
          logEvent("moderation_rework", "task", task.id, task.title, adminUser.id);
          saveState();
          rerenderAll();
          return;
        }

        const rejectTask = target.closest("[data-mod-reject-task]");
        if (rejectTask) {
          const id = rejectTask.getAttribute("data-mod-reject-task");
          const task = byId(state.tasks, id);
          if (!task) return;
          const reason = window.prompt("Причина отклонения", "Нарушение правил публикации");
          task.status = "rejected";
          addModerationRecord("task", task.id, "rejected", reason || "");
          logEvent("moderation_rejected", "task", task.id, reason || "", adminUser.id);
          saveState();
          rerenderAll();
          return;
        }

        const openComplaint = target.closest("[data-mod-open-complaint]");
        if (openComplaint) {
          const id = openComplaint.getAttribute("data-mod-open-complaint");
          const item = byId(state.complaints, id);
          if (!item) return;
          item.status = "reviewing";
          saveState();
          setTab("complaints");
          renderComplaints();
        }
      });
    }

    const complaintsTable = root.querySelector("[data-complaints-table]");
    if (complaintsTable) {
      complaintsTable.addEventListener("change", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLSelectElement)) return;
        const id = target.getAttribute("data-complaint-status");
        if (!id) return;
        const item = byId(state.complaints, id);
        if (!item) return;
        item.status = target.value;
        logEvent("complaint_status_changed", "complaint", item.id, item.status, adminUser.id);
        saveState();
        renderComplaints();
      });
      complaintsTable.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const commentBtn = target.closest("[data-complaint-comment]");
        if (!commentBtn) return;
        const id = commentBtn.getAttribute("data-complaint-comment");
        const item = byId(state.complaints, id);
        if (!item) return;
        const comment = window.prompt("Комментарий администратора", item.adminComment || "");
        if (comment === null) return;
        item.adminComment = comment.trim();
        logEvent("complaint_comment_added", "complaint", item.id, item.adminComment, adminUser.id);
        saveState();
        renderComplaints();
      });
    }

    const financeFilter = root.querySelector("[data-finance-filter]");
    if (financeFilter) {
      financeFilter.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const chip = target.closest("[data-value]");
        if (!chip) return;
        local.financeFilter = chip.getAttribute("data-value") || "all";
        financeFilter.querySelectorAll("[data-value]").forEach((node) => node.classList.remove("active"));
        chip.classList.add("active");
        renderFinance();
      });
    }

    const aiWrap = root.querySelector("[data-ai-tools-grid]");
    if (aiWrap) {
      aiWrap.addEventListener("submit", (event) => {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;
        event.preventDefault();
        const key = form.getAttribute("data-ai-tool-form");
        if (!key) return;
        const current = aiToolConfig(key);
        state.settings.aiTools[key] = {
          ...current,
          hint: String(form.elements.hint.value || ""),
          limitPerDay: Number(form.elements.limitPerDay.value || 0),
          mode: String(form.elements.mode.value || "demo"),
          enabled: Boolean(form.elements.enabled.checked)
        };
        logEvent("ai_tool_updated", "ai", key, JSON.stringify(state.settings.aiTools[key]), adminUser.id);
        saveState();
        renderAiTools();
        showToast("AI-настройки сохранены");
      });
    }

    const siteForm = root.querySelector("[data-site-settings-form]");
    if (siteForm) {
      siteForm.addEventListener("submit", (event) => {
        event.preventDefault();
        state.settings.site = {
          ...state.settings.site,
          platformName: String(siteForm.elements.platformName.value || "SMMATCH"),
          logoUrl: String(siteForm.elements.logoUrl.value || ""),
          primaryColor: String(siteForm.elements.primaryColor.value || "#7b6cff"),
          currency: String(siteForm.elements.currency.value || "BYN"),
          contactEmail: String(siteForm.elements.contactEmail.value || ""),
          footerText: String(siteForm.elements.footerText.value || ""),
          socials: {
            instagram: String(siteForm.elements.instagram.value || ""),
            telegram: String(siteForm.elements.telegram.value || ""),
            vk: String(siteForm.elements.vk.value || ""),
            tiktok: String(siteForm.elements.tiktok.value || "")
          },
          registrationEnabled: Boolean(siteForm.elements.registrationEnabled.checked),
          taskPublishingEnabled: Boolean(siteForm.elements.taskPublishingEnabled.checked),
          specialistsCatalogEnabled: Boolean(siteForm.elements.specialistsCatalogEnabled.checked)
        };
        logEvent("site_settings_updated", "settings", "site", "Обновлены настройки сайта", adminUser.id);
        saveState();
        showToast("Настройки сайта сохранены");
      });
    }

    const contentForm = root.querySelector("[data-content-settings-form]");
    if (contentForm) {
      contentForm.addEventListener("submit", (event) => {
        event.preventDefault();
        Object.keys(defaultContentSettings()).forEach((key) => {
          if (contentForm.elements[key]) {
            state.settings.content[key] = String(contentForm.elements[key].value || "");
          }
        });
        logEvent("content_updated", "settings", "content", "Обновлены контентные тексты", adminUser.id);
        saveState();
        showToast("Тексты сохранены");
      });
    }

    const notificationForm = root.querySelector("[data-notification-form]");
    if (notificationForm) {
      notificationForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const audience = String(notificationForm.elements.audience.value || "all");
        const userId = String(notificationForm.elements.userId.value || "").trim();
        const title = String(notificationForm.elements.title.value || "").trim();
        const text = String(notificationForm.elements.text.value || "").trim();
        if (!title || !text) {
          showToast("Заполните заголовок и текст", "error");
          return;
        }
        if (audience === "user" && !userId) {
          showToast("Укажите ID пользователя", "error");
          return;
        }
        state.notifications.unshift({
          id: uid("notif"),
          audience,
          userId: audience === "user" ? userId : null,
          title,
          text,
          createdAt: nowIso(),
          createdBy: adminUser.id
        });
        logEvent("notification_created", "notification", audience, title, adminUser.id);
        saveState();
        notificationForm.reset();
        renderNotifications();
        showToast("Уведомление отправлено");
      });
    }

    const initialTab = new URL(window.location.href).searchParams.get("tab") || "dashboard";
    setTab(initialTab);
    rerenderAll();
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
  initBrandLogos();
  syncProfileLinks();
  initTopbarActionsByRole();
  initGlobalSiteSettings();
  initActionGuardsForLinks();
  initGlobalComplaintActions();
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
  initAdminPanel();
  initQuickActions();
  initPageHeroVisuals();
  initCardVisualBoost();
  initMediaBlockVariations();
  initGlobalAnimations();
})();
