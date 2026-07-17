(function () {
  "use strict";

  const STORAGE_KEY = "smmatch_state_v1";
  const STATE_VERSION = 5;

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
      brand.classList.add("brand--has-image");
      brand.setAttribute("aria-label", label);
      brand.innerHTML = `<img class="brand-logo" src="${BRAND_LOGO_URL}" alt="${label}" loading="eager" decoding="async">`;
    });
  }

  const PAGE_POSTERS = [
    {
      matches: ["/specialists/", "/cases/", "/business/", "/blog/"],
      image: "assets/posters/team-strategy.webp",
      tone: "team",
      label: "Командная работа над SMM-стратегией",
    },
    {
      matches: ["/ai/", "/roi-calculator/", "/pricing/"],
      image: "assets/posters/content-desk.webp",
      tone: "tools",
      label: "Инструменты для создания короткого контента",
    },
    {
      matches: ["/task/", "/safety/", "/verification/"],
      image: "assets/posters/creator-studio.webp",
      tone: "creator",
      label: "Создатель контента в студии",
    },
  ];

  function initPagePosters() {
    if (document.body.classList.contains("smm-home") || isAuthPage) return;
    const definition = PAGE_POSTERS.find((item) => item.matches.some((match) => isPath(match)));
    const main = document.querySelector("main.container");
    const hero = main && main.querySelector(".page-hero, .roi-hero");
    if (!definition || !main || main.dataset.posterApplied === "1") return;

    const poster = document.createElement("figure");
    poster.className = `page-poster page-poster--${definition.tone}${hero ? "" : " page-poster--compact"}`;
    poster.dataset.pagePoster = "1";
    poster.setAttribute("aria-hidden", "true");
    poster.innerHTML = `<img src="${appUrl(definition.image)}" alt="" loading="lazy" decoding="async"><figcaption>${definition.label}</figcaption>`;
    if (hero) {
      hero.insertAdjacentElement("afterend", poster);
    } else {
      const host = main.querySelector(":scope > .card, :scope > article, :scope > section");
      if (!host) return;
      host.prepend(poster);
    }
    main.dataset.posterApplied = "1";
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

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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
      deals: [],
      disputes: [],
      withdrawals: [],
      verifications: [],
      chatSafety: {
        blockDirectContacts: true
      },
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
          aiMatch: { enabled: true, mode: "demo", limitPerDay: 200, hint: "AI Match использует алгоритм подбора по брифу и кейсам." },
          instagramAudit: {
            enabled: true,
            mode: "demo",
            limitPerDay: 200,
            hint: "Instagram Audit формирует экспресс-аудит профиля по открытым параметрам."
          },
          contentGenerator: {
            enabled: true,
            mode: "demo",
            limitPerDay: 200,
            hint: "Content Generator создает идеи на основе ниши, платформы и цели."
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

  function ensureDemoAccounts(next) {
    const businessEmail = "business@smmatch.local";
    const specialistEmail = "specialist@smmatch.local";
    let business = next.users.find((item) => normalize(item.email) === businessEmail);
    if (!business) {
      business = {
        id: "user_demo_business",
        role: "business",
        name: "Roastery Lab",
        email: businessEmail,
        passwordHash: hashPasswordPlaceholder("demo123"),
        blocked: false,
        createdAt: nowIso()
      };
      next.users.push(business);
    }

    let specialist = next.users.find((item) => normalize(item.email) === specialistEmail);
    if (!specialist) {
      specialist = {
        id: "user_demo_specialist",
        role: "specialist",
        name: "Алина Смирнова",
        email: specialistEmail,
        passwordHash: hashPasswordPlaceholder("demo123"),
        specialistId: "spec_alina",
        blocked: false,
        createdAt: nowIso()
      };
      next.users.push(specialist);
    }

    return { business, specialist };
  }

  function buildDemoReviews(businessUserId) {
    return [
      {
        id: "review_demo_roastery",
        businessUserId,
        specialistId: "spec_alina",
        rating: 5,
        comment: "За 6 недель получили понятную контент-систему, рост заявок и спокойный процесс без хаоса в чатах.",
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "review_demo_beauty",
        businessUserId,
        specialistId: "spec_sabina",
        rating: 5,
        comment: "Сильная упаковка UGC-креативов: CTR вырос, рекламные связки стало проще масштабировать.",
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "review_demo_flowers",
        businessUserId,
        specialistId: "spec_daria",
        rating: 5,
        comment: "Понравилось, что кейсы, бюджет и коммуникация собраны в одном месте. Быстро выбрали исполнителя.",
        createdAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "review_demo_performance",
        businessUserId,
        specialistId: "spec_roman",
        rating: 5,
        comment: "Роман быстро навел порядок в рекламе: понятные гипотезы, отчет по CPL и спокойный контроль бюджета.",
        createdAt: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "review_demo_influence",
        businessUserId,
        specialistId: "spec_valeria",
        rating: 5,
        comment: "Интеграции с блогерами перестали быть лотереей: получили медиаплан, трекинг и понятный CPA.",
        createdAt: new Date(Date.now() - 41 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "review_demo_telegram",
        businessUserId,
        specialistId: "spec_timur",
        rating: 4,
        comment: "Telegram-воронка стала заметно понятнее: появились рубрики, лид-магнит и регулярные заявки.",
        createdAt: new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  function buildDemoTasks(businessUserId) {
    return [
      {
        id: "task_demo_cafe_reels",
        title: "SMM и Reels для кофейни",
        category: "SMM",
        niche: "Кафе",
        budgetTier: "1500-3000 BYN",
        budgetValue: 320,
        budgetByn: 2100,
        platforms: "Instagram + Telegram",
        goals: "Увеличить поток заявок на доставку и прогреть аудиторию к летнему меню.",
        description: "Нужны рубрикатор, Reels, сторис и понятная аналитика по заявкам.",
        deadline: "",
        requiredSkills: ["reels", "контент", "таргет"],
        references: [],
        attachments: [],
        optionalNotes: "Нужен специалист с опытом в HoReCa.",
        needTarget: "Да",
        needContent: "Да",
        needReels: "Да",
        status: "in_progress",
        businessUserId,
        assignedSpecialistId: "spec_alina",
        revisionCount: 0,
        responses: [
          {
            id: "resp_demo_alina",
            specialistId: "spec_alina",
            score: 96,
            reasons: ["Есть кейс кофейни", "Вписывается в бюджет", "Сильные Reels и Telegram"],
            strongestAreas: ["HoReCa", "short-video", "воронка заявок"],
            estimatedCostByn: 1800,
            priceByn: 1800,
            deadlineDays: 14,
            attachments: [],
            status: "accepted",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "resp_demo_ilya",
            specialistId: "spec_ilya",
            score: 88,
            reasons: ["Сильный short-video продакшн", "Подходит по Reels"],
            strongestAreas: ["монтаж", "сценарии"],
            estimatedCostByn: 1200,
            priceByn: 1200,
            deadlineDays: 10,
            attachments: [],
            status: "new",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "task_demo_beauty_ugc",
        title: "UGC-креативы для beauty e-commerce",
        category: "UGC creator",
        niche: "Beauty",
        budgetTier: "1500-3000 BYN",
        budgetValue: 290,
        budgetByn: 1750,
        platforms: "TikTok + Instagram",
        goals: "Собрать пакет креативов для рекламы и снизить стоимость покупки.",
        description: "Нужны сценарии, съемка 8 UGC-роликов, монтаж и варианты hooks для тестов.",
        deadline: "",
        requiredSkills: ["ugc", "съемка", "монтаж"],
        references: [],
        attachments: [],
        optionalNotes: "Важно показать продукт в использовании, без студийной постановки.",
        needTarget: "Нет",
        needContent: "Да",
        needReels: "Да",
        status: "published",
        businessUserId,
        assignedSpecialistId: null,
        revisionCount: 0,
        responses: [
          {
            id: "resp_demo_elena",
            specialistId: "spec_elena",
            score: 94,
            reasons: ["Сильные UGC-кейсы", "Подходит по beauty-нише", "Вписывается в бюджет"],
            strongestAreas: ["UGC", "креативы", "TikTok"],
            estimatedCostByn: 1650,
            priceByn: 1650,
            deadlineDays: 9,
            attachments: [],
            status: "new",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "resp_demo_valeria",
            specialistId: "spec_valeria",
            score: 89,
            reasons: ["Опыт с beauty-брендами", "Может подключить блогеров"],
            strongestAreas: ["influencer marketing", "ugc"],
            estimatedCostByn: 2300,
            priceByn: 2300,
            deadlineDays: 14,
            attachments: [],
            status: "new",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "task_demo_b2b_telegram",
        title: "Telegram-воронка для B2B-сервиса",
        category: "Контент-менеджер",
        niche: "B2B",
        budgetTier: "800-1500 BYN",
        budgetValue: 230,
        budgetByn: 1450,
        platforms: "Telegram",
        goals: "Запустить экспертный канал и получать заявки на презентацию продукта.",
        description: "Нужны рубрики, контент-план, лид-магнит, прогрев и отчет по переходам.",
        deadline: "",
        requiredSkills: ["telegram", "b2b", "контент"],
        references: [],
        attachments: [],
        optionalNotes: "Продукт сложный, важно писать простым языком.",
        needTarget: "Не уверен",
        needContent: "Да",
        needReels: "Нет",
        status: "published",
        businessUserId,
        assignedSpecialistId: null,
        revisionCount: 0,
        responses: [
          {
            id: "resp_demo_nikita",
            specialistId: "spec_nikita",
            score: 92,
            reasons: ["B2B-опыт", "Telegram и кейсы", "Подходит по бюджету"],
            strongestAreas: ["b2b", "кейсы", "лидогенерация"],
            estimatedCostByn: 1750,
            priceByn: 1750,
            deadlineDays: 21,
            attachments: [],
            status: "new",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "resp_demo_timur",
            specialistId: "spec_timur",
            score: 90,
            reasons: ["Telegram growth", "Воронки и посевы", "Близко к бюджету"],
            strongestAreas: ["telegram", "воронки"],
            estimatedCostByn: 1350,
            priceByn: 1350,
            deadlineDays: 18,
            attachments: [],
            status: "new",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
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
        completedOrders: 52,
        responseRate: 96,
        responseTimeHours: 2,
        availabilityStatus: "available",
        verified: true,
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
        completedOrders: 41,
        responseRate: 93,
        responseTimeHours: 3,
        availabilityStatus: "available",
        verified: true,
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
        completedOrders: 33,
        responseRate: 91,
        responseTimeHours: 5,
        availabilityStatus: "busy",
        verified: true,
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
        completedOrders: 27,
        responseRate: 88,
        responseTimeHours: 6,
        availabilityStatus: "available",
        verified: true,
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
        completedOrders: 47,
        responseRate: 97,
        responseTimeHours: 2,
        availabilityStatus: "available",
        verified: true,
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
      },
      {
        id: "spec_maria",
        userId: null,
        slug: "maria-belova",
        name: "Мария Белова",
        avatar: appUrl("assets/visuals/analytics-grid.svg"),
        city: "Санкт-Петербург, Россия",
        country: "Россия",
        rating: 4.9,
        reviewsCount: 31,
        completedOrders: 58,
        responseRate: 95,
        responseTimeHours: 4,
        availabilityStatus: "available",
        verified: true,
        specialization: "SMM для e-commerce",
        experience: "senior",
        description: "Контент, performance-креативы и Telegram-воронки для интернет-магазинов.",
        about: "Соединяю контент, paid social и CRM-логику: делаю запуск измеримым от просмотра до покупки.",
        priceByn: 2400,
        platforms: ["Instagram", "Telegram", "VK"],
        niches: ["ecommerce", "beauty", "спорт"],
        skills: ["контент", "таргет", "аналитика", "воронки"],
        stats: { er: "7.9%", ctr: "3.8%", cpm: "16 BYN", views: "182 000", followersGrowth: "+7 400", reachGrowth: "+260%" },
        socials: {
          instagram: "https://instagram.com/maria.ecom.smm",
          tiktok: "",
          telegram: "https://t.me/maria_ecom_smm",
          behance: "https://www.behance.net/mariabelova"
        },
        cases: [
          { title: "Fashion e-commerce", result1: "CAC -24%", result2: "+31% повторных продаж", period: "12 недель" },
          { title: "Спортивный магазин", result1: "ROAS 3.7", result2: "+420 заказов", period: "3 месяца" }
        ]
      },
      {
        id: "spec_timur",
        userId: null,
        slug: "timur-nazarov",
        name: "Тимур Назаров",
        avatar: appUrl("assets/visuals/strategy-map.svg"),
        city: "Астана, Казахстан",
        country: "Казахстан",
        rating: 4.7,
        reviewsCount: 17,
        completedOrders: 29,
        responseRate: 89,
        responseTimeHours: 5,
        availabilityStatus: "available",
        verified: true,
        specialization: "Telegram growth strategist",
        experience: "middle",
        description: "Запуск и рост Telegram-каналов для экспертов, сервисов и локального бизнеса.",
        about: "Строю контент-воронки в Telegram: лид-магниты, прогревы, посевы, аналитика удержания.",
        priceByn: 1350,
        platforms: ["Telegram", "VK"],
        niches: ["недвижимость", "образование", "b2b"],
        skills: ["telegram", "контент", "посевы", "воронки"],
        stats: { er: "12.1%", ctr: "4.4%", cpm: "9 BYN", views: "64 000", followersGrowth: "+3 600", reachGrowth: "+118%" },
        socials: {
          instagram: "",
          tiktok: "",
          telegram: "https://t.me/timur_growth",
          behance: ""
        },
        cases: [
          { title: "Telegram для недвижимости", result1: "+2 900 подписчиков", result2: "43 заявки на показы", period: "7 недель" }
        ]
      },
      {
        id: "spec_elena",
        userId: null,
        slug: "elena-volkova",
        name: "Елена Волкова",
        avatar: appUrl("assets/visuals/camera-shot.svg"),
        city: "Минск, Беларусь",
        country: "Беларусь",
        rating: 4.8,
        reviewsCount: 22,
        completedOrders: 37,
        responseRate: 92,
        responseTimeHours: 3,
        availabilityStatus: "available",
        verified: true,
        specialization: "UGC producer",
        experience: "middle",
        description: "UGC-пакеты для рекламы: сценарии, кастинг, съемка, монтаж и тесты креативов.",
        about: "Помогаю брендам быстро получать наборы UGC-креативов для A/B тестов и performance-кампаний.",
        priceByn: 1650,
        platforms: ["Instagram", "TikTok"],
        niches: ["beauty", "ecommerce", "спорт"],
        skills: ["ugc", "съемка", "монтаж", "креативы"],
        stats: { er: "8.3%", ctr: "4.1%", cpm: "15 BYN", views: "119 000", followersGrowth: "+2 800", reachGrowth: "+174%" },
        socials: {
          instagram: "https://instagram.com/elena.ugc.pro",
          tiktok: "https://www.tiktok.com/@elena.ugc.pro",
          telegram: "",
          behance: "https://www.behance.net/elenaugc"
        },
        cases: [
          { title: "UGC для косметики", result1: "CTR +53%", result2: "CPA -19%", period: "5 недель" }
        ]
      },
      {
        id: "spec_roman",
        userId: null,
        slug: "roman-kuleshov",
        name: "Роман Кулешов",
        avatar: appUrl("assets/visuals/growth-chart.svg"),
        city: "Москва, Россия",
        country: "Россия",
        rating: 4.9,
        reviewsCount: 44,
        completedOrders: 69,
        responseRate: 98,
        responseTimeHours: 2,
        availabilityStatus: "busy",
        verified: true,
        specialization: "Performance SMM lead",
        experience: "senior",
        description: "Системный рост через paid social, креативную аналитику и unit-экономику.",
        about: "Настраиваю связку рекламных кабинетов, контента и отчетности так, чтобы бизнес видел прибыль, а не только охваты.",
        priceByn: 3200,
        platforms: ["Instagram", "VK", "Telegram", "YouTube"],
        niches: ["недвижимость", "ecommerce", "b2b"],
        skills: ["таргет", "аналитика", "romi", "креативы"],
        stats: { er: "5.8%", ctr: "4.7%", cpm: "22 BYN", views: "210 000", followersGrowth: "+5 100", reachGrowth: "+198%" },
        socials: {
          instagram: "https://instagram.com/roman.performance",
          tiktok: "",
          telegram: "https://t.me/roman_performance",
          behance: ""
        },
        cases: [
          { title: "Девелоперский проект", result1: "CPL -37%", result2: "126 квалифицированных лидов", period: "11 недель" }
        ]
      },
      {
        id: "spec_anastasia",
        userId: null,
        slug: "anastasia-orlova",
        name: "Анастасия Орлова",
        avatar: appUrl("assets/visuals/content-lab.svg"),
        city: "Онлайн",
        country: "СНГ",
        rating: 4.8,
        reviewsCount: 21,
        completedOrders: 35,
        responseRate: 94,
        responseTimeHours: 4,
        availabilityStatus: "available",
        verified: true,
        specialization: "Контент-директор",
        experience: "senior",
        description: "Редакционные системы, контент-планы и бренд-голос для сервисных компаний.",
        about: "Выстраиваю контент как продукт: рубрики, tone of voice, продакшн-процесс, календарь и отчетность.",
        priceByn: 2200,
        platforms: ["Instagram", "Telegram", "VK"],
        niches: ["образование", "b2b", "beauty"],
        skills: ["стратегия", "контент", "tone of voice", "редактура"],
        stats: { er: "9.6%", ctr: "2.8%", cpm: "13 BYN", views: "132 000", followersGrowth: "+4 900", reachGrowth: "+216%" },
        socials: {
          instagram: "https://instagram.com/anastasia.content",
          tiktok: "",
          telegram: "https://t.me/orlova_content",
          behance: "https://www.behance.net/anastasiaorlova"
        },
        cases: [
          { title: "Онлайн-школа", result1: "+64% заявок", result2: "ER 11.2%", period: "8 недель" }
        ]
      },
      {
        id: "spec_kirill",
        userId: null,
        slug: "kirill-sokolov",
        name: "Кирилл Соколов",
        avatar: appUrl("assets/visuals/reels-studio.svg"),
        city: "Ереван, Армения",
        country: "СНГ",
        rating: 4.6,
        reviewsCount: 13,
        completedOrders: 24,
        responseRate: 86,
        responseTimeHours: 7,
        availabilityStatus: "available",
        verified: true,
        specialization: "Short-video producer",
        experience: "middle",
        description: "Съемка и монтаж коротких роликов для экспертов, кафе и локальных брендов.",
        about: "Делаю быстрый продакшн: сценарии, съемочные листы, монтаж, субтитры и адаптации под Reels/TikTok.",
        priceByn: 1100,
        platforms: ["Instagram", "TikTok", "YouTube"],
        niches: ["кафе", "спорт", "образование"],
        skills: ["reels", "съемка", "монтаж", "сценарии"],
        stats: { er: "7.1%", ctr: "2.2%", cpm: "10 BYN", views: "88 000", followersGrowth: "+2 100", reachGrowth: "+151%" },
        socials: {
          instagram: "https://instagram.com/kirill.shortvideo",
          tiktok: "https://www.tiktok.com/@kirill.shortvideo",
          telegram: "",
          behance: ""
        },
        cases: [
          { title: "Локальная пекарня", result1: "+176% охватов", result2: "+51 предзаказ", period: "4 недели" }
        ]
      },
      {
        id: "spec_lola",
        userId: null,
        slug: "lola-karimova",
        name: "Лола Каримова",
        avatar: appUrl("assets/visuals/mobile-promo.svg"),
        city: "Ташкент, Узбекистан",
        country: "Узбекистан",
        rating: 4.7,
        reviewsCount: 18,
        completedOrders: 32,
        responseRate: 90,
        responseTimeHours: 5,
        availabilityStatus: "available",
        verified: true,
        specialization: "SMM для ресторанов",
        experience: "middle",
        description: "Контент, сторис и локальные инфлюенсеры для ресторанов и кофеен.",
        about: "Фокусируюсь на посадочных сторис, меню-офферах, локальных блогерах и понятной аналитике бронирований.",
        priceByn: 1450,
        platforms: ["Instagram", "Telegram", "TikTok"],
        niches: ["рестораны", "кафе", "beauty"],
        skills: ["stories", "influencer marketing", "контент", "reels"],
        stats: { er: "8.9%", ctr: "3.1%", cpm: "12 BYN", views: "101 000", followersGrowth: "+3 400", reachGrowth: "+187%" },
        socials: {
          instagram: "https://instagram.com/lola.restaurant.smm",
          tiktok: "https://www.tiktok.com/@lola.restaurant.smm",
          telegram: "https://t.me/lola_smm",
          behance: ""
        },
        cases: [
          { title: "Сеть кафе в Ташкенте", result1: "+72 брони/мес", result2: "ER 9.8%", period: "6 недель" }
        ]
      },
      {
        id: "spec_ksenia",
        userId: null,
        slug: "ksenia-larina",
        name: "Ксения Ларина",
        avatar: appUrl("assets/visuals/workspace-focus.svg"),
        city: "Варшава, Польша",
        country: "СНГ",
        rating: 4.8,
        reviewsCount: 20,
        completedOrders: 38,
        responseRate: 93,
        responseTimeHours: 4,
        availabilityStatus: "available",
        verified: true,
        specialization: "Personal brand SMM",
        experience: "senior",
        description: "Личные бренды экспертов: позиционирование, контент, прогрев и лидогенерация.",
        about: "Упаковываю экспертность в понятные рубрики, кейсы и прогревы, которые приводят заявки на консультации.",
        priceByn: 2600,
        platforms: ["Instagram", "Telegram", "YouTube"],
        niches: ["образование", "b2b", "недвижимость"],
        skills: ["личный бренд", "стратегия", "контент", "прогрев"],
        stats: { er: "11.3%", ctr: "3.4%", cpm: "17 BYN", views: "155 000", followersGrowth: "+6 100", reachGrowth: "+242%" },
        socials: {
          instagram: "https://instagram.com/ksenia.brand.smm",
          tiktok: "",
          telegram: "https://t.me/ksenia_brand",
          behance: ""
        },
        cases: [
          { title: "Эксперт по инвестициям", result1: "+94 заявки", result2: "12 продаж консультаций", period: "9 недель" }
        ]
      },
      {
        id: "spec_oleg",
        userId: null,
        slug: "oleg-mironov",
        name: "Олег Миронов",
        avatar: appUrl("assets/visuals/social-flow.svg"),
        city: "Москва, Россия",
        country: "Россия",
        rating: 4.6,
        reviewsCount: 16,
        completedOrders: 28,
        responseRate: 87,
        responseTimeHours: 6,
        availabilityStatus: "offline",
        verified: true,
        specialization: "VK Ads specialist",
        experience: "middle",
        description: "VK Ads и контент для локального бизнеса, образовательных проектов и сервисов.",
        about: "Запускаю VK Ads с понятными гипотезами, креативами, UTM-метками и отчетом по заявкам.",
        priceByn: 1300,
        platforms: ["VK", "Telegram"],
        niches: ["образование", "спорт", "b2b"],
        skills: ["vk ads", "таргет", "аналитика", "креативы"],
        stats: { er: "6.7%", ctr: "3.9%", cpm: "11 BYN", views: "72 000", followersGrowth: "+1 700", reachGrowth: "+136%" },
        socials: {
          instagram: "",
          tiktok: "",
          telegram: "https://t.me/oleg_vk_ads",
          behance: ""
        },
        cases: [
          { title: "Фитнес-клуб", result1: "CPL 8.1 BYN", result2: "186 лидов", period: "6 недель" }
        ]
      },
      {
        id: "spec_valeria",
        userId: null,
        slug: "valeria-gromova",
        name: "Валерия Громова",
        avatar: appUrl("assets/visuals/team-sync.svg"),
        city: "Алматы, Казахстан",
        country: "Казахстан",
        rating: 4.9,
        reviewsCount: 27,
        completedOrders: 46,
        responseRate: 96,
        responseTimeHours: 3,
        availabilityStatus: "available",
        verified: true,
        specialization: "Influencer marketing",
        experience: "senior",
        description: "Подбор блогеров, медиапланы, интеграции и аналитика CPA/ROMI.",
        about: "Собираю инфлюенсер-кампании под бизнес-цели: от отбора блогеров до трекинга продаж и отчетности.",
        priceByn: 2300,
        platforms: ["Instagram", "TikTok", "Telegram"],
        niches: ["beauty", "ecommerce", "рестораны"],
        skills: ["influencer marketing", "аналитика", "ugc", "медиаплан"],
        stats: { er: "9.8%", ctr: "3.7%", cpm: "18 BYN", views: "190 000", followersGrowth: "+4 600", reachGrowth: "+225%" },
        socials: {
          instagram: "https://instagram.com/valeria.influence",
          tiktok: "https://www.tiktok.com/@valeria.influence",
          telegram: "https://t.me/valeria_influence",
          behance: ""
        },
        cases: [
          { title: "Бьюти-бренд", result1: "CPA -28%", result2: "1.8 млн охвата", period: "8 недель" }
        ]
      },
      {
        id: "spec_nikita",
        userId: null,
        slug: "nikita-yakovlev",
        name: "Никита Яковлев",
        avatar: appUrl("assets/visuals/meeting-room.svg"),
        city: "Онлайн",
        country: "СНГ",
        rating: 4.7,
        reviewsCount: 15,
        completedOrders: 26,
        responseRate: 91,
        responseTimeHours: 5,
        availabilityStatus: "available",
        verified: true,
        specialization: "B2B social media",
        experience: "middle",
        description: "LinkedIn-like упаковка, Telegram и экспертный контент для B2B-команд.",
        about: "Помогаю B2B-компаниям объяснять сложный продукт через кейсы, экспертные посты и лид-магниты.",
        priceByn: 1750,
        platforms: ["Telegram", "VK", "YouTube"],
        niches: ["b2b", "образование", "недвижимость"],
        skills: ["b2b", "контент", "кейсы", "лидогенерация"],
        stats: { er: "7.5%", ctr: "2.9%", cpm: "14 BYN", views: "83 000", followersGrowth: "+2 200", reachGrowth: "+144%" },
        socials: {
          instagram: "",
          tiktok: "",
          telegram: "https://t.me/nikita_b2b_smm",
          behance: ""
        },
        cases: [
          { title: "B2B SaaS сервис", result1: "+38 заявок на демо", result2: "CTR +34%", period: "10 недель" }
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
    next.verified = next.verified !== false;
    next.completedOrders = Number(next.completedOrders || 0);
    next.responseRate = Number(next.responseRate || 0);
    next.responseTimeHours = Number(next.responseTimeHours || 24);
    next.availabilityStatus = next.availabilityStatus || "available";
    next.portfolioLinks = Array.isArray(next.portfolioLinks) ? next.portfolioLinks : [];
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
    if (!Array.isArray(next.deals)) next.deals = [];
    if (!Array.isArray(next.disputes)) next.disputes = [];
    if (!Array.isArray(next.withdrawals)) next.withdrawals = [];
    if (!Array.isArray(next.verifications)) next.verifications = [];
    if (!Array.isArray(next.complaints)) next.complaints = [];
    if (!Array.isArray(next.moderationHistory)) next.moderationHistory = [];
    if (!Array.isArray(next.notifications)) next.notifications = [];
    if (!Array.isArray(next.logs)) next.logs = [];
    if (!Array.isArray(next.reviews)) next.reviews = [];
    if (!Array.isArray(next.conversations)) next.conversations = [];
    if (!Array.isArray(next.payments)) next.payments = [];
    if (!next.favoritesByUser || typeof next.favoritesByUser !== "object") next.favoritesByUser = {};
    if (!next.chatSafety || typeof next.chatSafety !== "object") next.chatSafety = { blockDirectContacts: true };
    next.chatSafety = { blockDirectContacts: next.chatSafety.blockDirectContacts !== false };
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
    next.settings.site.primaryColor = "#7b6cff";
    next.settings.site.currency = "BYN";
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
      migrated.avatar = migrated.avatar || appUrl("assets/visuals/team-sync.svg");
      migrated.onboardingStatus = migrated.onboardingStatus || "incomplete";
      migrated.wallet = {
        held: Number(migrated.wallet && migrated.wallet.held) || 0,
        pending: Number(migrated.wallet && migrated.wallet.pending) || 0,
        available: Number(migrated.wallet && migrated.wallet.available) || 0,
        withdrawn: Number(migrated.wallet && migrated.wallet.withdrawn) || 0,
        platformFees: Number(migrated.wallet && migrated.wallet.platformFees) || 0
      };
      return migrated;
    });
    ensureDemoAdmin(next);
    const demoAccounts = ensureDemoAccounts(next);

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
    const demoSpecialists = buildMockSpecialists().map(normalizeSpecialistData);
    demoSpecialists.forEach((demoSpecialist) => {
      const existing = next.specialists.find((item) => item.id === demoSpecialist.id);
      if (!existing) {
        next.specialists.push({
          ...demoSpecialist,
          status: "active",
          recommended: demoSpecialist.rating >= 4.8,
          createdAt: nowIso()
        });
        return;
      }
      if (!existing.cases.length && demoSpecialist.cases.length) existing.cases = demoSpecialist.cases;
      if (!existing.avatar) existing.avatar = demoSpecialist.avatar;
      existing.completedOrders = Math.max(Number(existing.completedOrders || 0), Number(demoSpecialist.completedOrders || 0));
      existing.reviewsCount = Math.max(Number(existing.reviewsCount || 0), Number(demoSpecialist.reviewsCount || 0));
    });
    const alina = next.specialists.find((item) => item.id === "spec_alina");
    const demoSpecialistUser = next.users.find((item) => item.id === "user_demo_specialist");
    if (alina && demoSpecialistUser) {
      alina.userId = demoSpecialistUser.id;
      demoSpecialistUser.specialistId = alina.id;
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
      migrated.attachments = Array.isArray(migrated.attachments) ? migrated.attachments : [];
      migrated.requiredSkills = Array.isArray(migrated.requiredSkills) ? migrated.requiredSkills : [];
      migrated.references = Array.isArray(migrated.references) ? migrated.references : [];
      migrated.optionalNotes = migrated.optionalNotes || "";
      migrated.revisionCount = Number(migrated.revisionCount || 0);
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
        attachments: Array.isArray(response.attachments) ? response.attachments : [],
        status: response.status || "new",
        createdAt: response.createdAt || migrated.createdAt || nowIso()
      }));
      return migrated;
    });
    if (!next.tasks.length && demoAccounts.business) {
      next.tasks = buildDemoTasks(demoAccounts.business.id);
      next.ai.lastMatchTaskId = next.tasks[0].id;
      next.ui.selectedSpecialistId = "spec_alina";
    }
    if (demoAccounts.business) {
      buildDemoTasks(demoAccounts.business.id).forEach((demoTask) => {
        if (!next.tasks.some((task) => task.id === demoTask.id)) {
          next.tasks.push(demoTask);
        }
      });
      if (!next.ai.lastMatchTaskId) next.ai.lastMatchTaskId = "task_demo_cafe_reels";
    }

    next.deals = next.deals.map((deal) => ({
      id: deal.id || uid("deal"),
      taskId: deal.taskId || "",
      businessUserId: deal.businessUserId || null,
      specialistId: deal.specialistId || null,
      responseId: deal.responseId || null,
      grossAmount: Number(deal.grossAmount || deal.amount || 0),
      platformFee: Number(deal.platformFee || 0),
      specialistNet: Number(deal.specialistNet || 0),
      status: deal.status || "unpaid",
      paidAt: deal.paidAt || null,
      heldUntil: deal.heldUntil || null,
      releasedAt: deal.releasedAt || null,
      disputedAt: deal.disputedAt || null,
      timeline: Array.isArray(deal.timeline) ? deal.timeline : [],
      createdAt: deal.createdAt || nowIso(),
      revisionLimit: Number(deal.revisionLimit || 2),
      revisionUsed: Number(deal.revisionUsed || 0)
    }));
    if (!next.deals.length && demoAccounts.business) {
      const demoTask = next.tasks.find((task) => task.id === "task_demo_cafe_reels");
      const accepted = demoTask ? (demoTask.responses || []).find((item) => item.status === "accepted") : null;
      if (demoTask && accepted) {
        const grossAmount = Number(accepted.priceByn || accepted.estimatedCostByn || demoTask.budgetByn || 0);
        next.deals.push({
          id: "deal_demo_cafe_reels",
          taskId: demoTask.id,
          businessUserId: demoAccounts.business.id,
          specialistId: accepted.specialistId,
          responseId: accepted.id,
          grossAmount,
          platformFee: Math.round(grossAmount * 0.1),
          specialistNet: grossAmount - Math.round(grossAmount * 0.1),
          status: "held",
          paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          heldUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          releasedAt: null,
          disputedAt: null,
          timeline: [
            { id: "dt_demo_paid", status: "paid", text: "Сделка оплачена заказчиком.", ts: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "dt_demo_held", status: "held", text: "Средства в hold до приемки этапа.", ts: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
          ],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          revisionLimit: 2,
          revisionUsed: 0
        });
      }
    }

    next.disputes = next.disputes.map((item) => ({
      id: item.id || uid("dispute"),
      dealId: item.dealId || null,
      taskId: item.taskId || null,
      businessUserId: item.businessUserId || null,
      specialistId: item.specialistId || null,
      status: item.status || "opened",
      reason: item.reason || "",
      description: item.description || "",
      desiredResolution: item.desiredResolution || "resolved_partial",
      attachments: Array.isArray(item.attachments) ? item.attachments : [],
      adminComment: item.adminComment || "",
      timeline: Array.isArray(item.timeline) ? item.timeline : [],
      createdAt: item.createdAt || nowIso(),
      updatedAt: item.updatedAt || nowIso()
    }));

    next.reviews = next.reviews.map((review) => ({
      id: review.id || uid("review"),
      businessUserId: review.businessUserId || null,
      specialistId: review.specialistId || null,
      rating: Math.max(1, Math.min(5, Number(review.rating || 5))),
      comment: review.comment || "",
      createdAt: review.createdAt || nowIso()
    }));
    if (!next.reviews.length && demoAccounts.business) {
      next.reviews = buildDemoReviews(demoAccounts.business.id);
    }
    if (demoAccounts.business) {
      buildDemoReviews(demoAccounts.business.id).forEach((demoReview) => {
        if (!next.reviews.some((review) => review.id === demoReview.id)) {
          next.reviews.push(demoReview);
        }
      });
    }

    next.withdrawals = next.withdrawals.map((item) => ({
      id: item.id || uid("wd"),
      userId: item.userId || null,
      amount: Number(item.amount || 0),
      method: item.method || "bank_card",
      requisites: item.requisites || "",
      status: item.status || "requested",
      createdAt: item.createdAt || nowIso(),
      updatedAt: item.updatedAt || nowIso()
    }));

    next.verifications = next.verifications.map((item) => ({
      id: item.id || uid("ver"),
      userId: item.userId || null,
      specialistId: item.specialistId || null,
      fullName: item.fullName || "",
      country: item.country || "",
      city: item.city || "",
      phone: item.phone || "",
      email: item.email || "",
      portfolio: item.portfolio || "",
      socialLinks: item.socialLinks || "",
      attachments: Array.isArray(item.attachments) ? item.attachments : [],
      statusType: item.statusType || "individual",
      status: item.status || "not_verified",
      notes: item.notes || "",
      createdAt: item.createdAt || nowIso(),
      updatedAt: item.updatedAt || nowIso()
    }));

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

    next.conversations = next.conversations.map((item) => ({
      id: item.id || uid("conv"),
      businessUserId: item.businessUserId || null,
      specialistId: item.specialistId || null,
      messages: Array.isArray(item.messages) ? item.messages : [],
      readState: {
        businessTs: item.readState && item.readState.businessTs ? item.readState.businessTs : nowIso(),
        specialistTs: item.readState && item.readState.specialistTs ? item.readState.specialistTs : nowIso()
      }
    }));
    if (!next.conversations.length && demoAccounts.business) {
      next.conversations.push({
        id: "conv_demo_cafe_reels",
        businessUserId: demoAccounts.business.id,
        specialistId: "spec_alina",
        messages: [
          {
            id: "msg_demo_1",
            senderRole: "business",
            text: "Нужен запуск Reels и сторис под летнее меню. Важно видеть заявки, а не только охваты.",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "msg_demo_2",
            senderRole: "specialist",
            text: "Соберу контент-матрицу, 8 Reels и отчет по источникам заявок. Начнем с оффера и рубрик.",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString()
          }
        ],
        readState: {
          businessTs: nowIso(),
          specialistTs: nowIso()
        }
      });
    }

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
  advanceDealHoldStatus();
  recalculateWallets();

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
      work_submitted: "Работа отправлена",
      revision_requested: "Запрошена доработка",
      dispute_opened: "Открыт спор",
      completed: "Завершена",
      cancelled: "Отменена",
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

  function dealStatusLabel(status) {
    const labels = {
      unpaid: "Не оплачен",
      paid: "Оплачен",
      held: "В холде",
      released: "Выплачен",
      refunded: "Возврат",
      disputed: "Спор"
    };
    return labels[status] || status || "—";
  }

  function withdrawalStatusLabel(status) {
    const labels = {
      requested: "Запрошен",
      processing: "В обработке",
      completed: "Выполнен",
      rejected: "Отклонен"
    };
    return labels[status] || status || "—";
  }

  function disputeStatusLabel(status) {
    const labels = {
      opened: "Открыт",
      under_review: "На рассмотрении",
      resolved_refund: "Решено: возврат",
      resolved_release: "Решено: выплата",
      resolved_partial: "Решено: частично",
      rejected: "Отклонен"
    };
    return labels[status] || status || "—";
  }

  function verificationStatusLabel(status) {
    const labels = {
      not_verified: "Не верифицирован",
      pending: "На проверке",
      verified: "Верифицирован",
      rejected: "Отклонен"
    };
    return labels[status] || status || "—";
  }

  function availabilityStatusLabel(status) {
    if (status === "available") return "Доступен";
    if (status === "busy") return "Занят";
    return "Оффлайн";
  }

  function containsDirectContact(text) {
    const source = String(text || "").toLowerCase();
    if (!source) return false;
    const rules = [
      /\+?\d[\d\s\-()]{7,}/,
      /@[\w._-]{3,}/,
      /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/,
      /(t\.me\/|telegram|whatsapp|wa\.me|instagram\.com|vk\.com)/i
    ];
    return rules.some((rule) => rule.test(source));
  }

  function createSystemMessage(conversationId, text) {
    addMessage(conversationId, "system", `⚙ ${text}`);
  }

  function findDealByTaskId(taskId) {
    return state.deals.find((item) => item.taskId === taskId) || null;
  }

  function ensureWallet(userId) {
    const user = findUserById(userId);
    if (!user) return null;
    if (!user.wallet || typeof user.wallet !== "object") {
      user.wallet = { held: 0, pending: 0, available: 0, withdrawn: 0, platformFees: 0 };
    }
    return user.wallet;
  }

  function addDealTimeline(deal, status, text) {
    if (!deal) return;
    deal.timeline.unshift({ id: uid("dline"), status, text, ts: nowIso() });
    if (deal.timeline.length > 80) deal.timeline = deal.timeline.slice(0, 80);
  }

  function recalculateWallets() {
    state.users.forEach((user) => {
      const wallet = ensureWallet(user.id);
      if (!wallet) return;
      wallet.held = 0;
      wallet.pending = 0;
      wallet.available = 0;
      wallet.platformFees = 0;
    });

    state.deals.forEach((deal) => {
      const businessWallet = deal.businessUserId ? ensureWallet(deal.businessUserId) : null;
      const specialist = findSpecialistById(deal.specialistId);
      const specialistWallet = specialist && specialist.userId ? ensureWallet(specialist.userId) : null;

      if (businessWallet) businessWallet.platformFees += Number(deal.platformFee || 0);
      if (!specialistWallet) return;

      if (deal.status === "held" || deal.status === "disputed") {
        specialistWallet.held += Number(deal.specialistNet || 0);
      } else if (deal.status === "paid") {
        specialistWallet.pending += Number(deal.specialistNet || 0);
      } else if (deal.status === "released") {
        specialistWallet.available += Number(deal.specialistNet || 0);
      }
    });

    state.withdrawals.forEach((wd) => {
      const wallet = ensureWallet(wd.userId);
      if (!wallet) return;
      if (wd.status === "completed") wallet.withdrawn += Number(wd.amount || 0);
    });
  }

  function advanceDealHoldStatus() {
    const now = Date.now();
    state.deals.forEach((deal) => {
      if (deal.status !== "held" || !deal.heldUntil) return;
      const due = new Date(deal.heldUntil).getTime();
      if (!Number.isFinite(due) || due > now) return;
      deal.status = "released";
      deal.releasedAt = nowIso();
      addDealTimeline(deal, "released", "Средства переведены исполнителю.");
      const task = state.tasks.find((item) => item.id === deal.taskId);
      if (task && task.assignedSpecialistId) {
        const convo = ensureConversation(deal.businessUserId, task.assignedSpecialistId);
        createSystemMessage(convo.id, "Платеж выпущен. Средства доступны исполнителю.");
      }
      logEvent("deal_released", "deal", deal.id, `Deal released for task ${deal.taskId}`);
    });
    recalculateWallets();
  }

  function ensureDealForAcceptedResponse(task, response) {
    if (!task || !response) return null;
    let deal = findDealByTaskId(task.id);
    if (deal) return deal;
    const gross = Number(response.priceByn || task.budgetByn || 0);
    const platformFee = Math.round(gross * 0.1 * 100) / 100;
    const specialistNet = Math.max(0, gross - platformFee);
    deal = {
      id: uid("deal"),
      taskId: task.id,
      businessUserId: task.businessUserId || null,
      specialistId: response.specialistId,
      responseId: response.id,
      grossAmount: gross,
      platformFee,
      specialistNet,
      status: "unpaid",
      paidAt: null,
      heldUntil: null,
      releasedAt: null,
      disputedAt: null,
      timeline: [],
      createdAt: nowIso(),
      revisionLimit: 2,
      revisionUsed: 0
    };
    addDealTimeline(deal, "unpaid", "Сделка создана. Ожидается оплата.");
    state.deals.unshift(deal);
    recalculateWallets();
    logEvent("deal_created", "deal", deal.id, `Task ${task.id}`);
    return deal;
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
        messages: [{ id: uid("msg"), senderRole: "system", text: "Диалог создан.", ts: nowIso() }],
        readState: {
          businessTs: nowIso(),
          specialistTs: nowIso()
        }
      };
      state.conversations.unshift(convo);
      saveState();
    }
    return convo;
  }

  function addMessage(conversationId, senderRole, text) {
    const convo = state.conversations.find((item) => item.id === conversationId);
    if (!convo) return;
    const ts = nowIso();
    convo.messages.push({ id: uid("msg"), senderRole, text, ts });
    if (!convo.readState) {
      convo.readState = { businessTs: ts, specialistTs: ts };
    }
    if (senderRole === "business") convo.readState.businessTs = ts;
    if (senderRole === "specialist") convo.readState.specialistTs = ts;
    if (senderRole === "system") {
      convo.readState.businessTs = convo.readState.businessTs || ts;
      convo.readState.specialistTs = convo.readState.specialistTs || ts;
    }
    saveState();
  }

  function markConversationRead(conversation, role) {
    if (!conversation) return;
    if (!conversation.readState) {
      conversation.readState = { businessTs: nowIso(), specialistTs: nowIso() };
    }
    const key = role === "business" ? "businessTs" : "specialistTs";
    conversation.readState[key] = nowIso();
  }

  function unreadCountForRole(conversation, role) {
    if (!conversation || !Array.isArray(conversation.messages)) return 0;
    const lastRead = conversation.readState
      ? role === "business"
        ? conversation.readState.businessTs
        : conversation.readState.specialistTs
      : null;
    const lastReadTs = lastRead ? new Date(lastRead).getTime() : 0;
    const incomingRole = role === "business" ? "specialist" : "business";
    return conversation.messages.filter((msg) => {
      const ts = new Date(msg.ts || 0).getTime();
      return Number.isFinite(ts) && ts > lastReadTs && msg.senderRole === incomingRole;
    }).length;
  }

  function sendMessageWithSafety(conversationId, senderRole, textRaw) {
    const text = String(textRaw || "").trim();
    if (!text) return false;
    if (state.chatSafety && state.chatSafety.blockDirectContacts && containsDirectContact(text)) {
      showToast("Нельзя отправлять контакты в чате до завершения сделки", "error");
      return false;
    }
    addMessage(conversationId, senderRole, text);
    return true;
  }

  function simulateTypingReply(conversationId, senderRole) {
    const convo = state.conversations.find((item) => item.id === conversationId);
    if (!convo) return;
    const oppositeRole = senderRole === "business" ? "specialist" : "business";
    const typingText = oppositeRole === "specialist" ? "Специалист печатает..." : "Клиент печатает...";
    const typingId = uid("typing");
    convo.messages.push({ id: typingId, senderRole: "system", text: typingText, ts: nowIso() });
    saveState();
    window.setTimeout(() => {
      const freshConvo = state.conversations.find((item) => item.id === conversationId);
      if (!freshConvo) return;
      freshConvo.messages = freshConvo.messages.filter((msg) => msg.id !== typingId);
      const templates =
        oppositeRole === "specialist"
          ? [
              "Принял(а), спасибо. Подготовлю план и вернусь с деталями.",
              "Супер, уточню детали и отправлю следующий шаг.",
              "Вижу задачу, беру в работу и дам апдейт в ближайшее время."
            ]
          : [
              "Отлично, жду следующий апдейт по задаче.",
              "Принято, спасибо. Если нужно, отправлю комментарии по правкам.",
              "Ок, держите меня в курсе по срокам и статусу."
            ];
      const text = templates[Math.floor(Math.random() * templates.length)];
      addMessage(conversationId, oppositeRole, text);
    }, 1200);
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

  function initUnifiedNavigation() {
    if (isPath("/auth/") || isPath("/admin/")) return;
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;
    let nav = topbar.querySelector(".nav");
    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "nav";
      const actions = topbar.querySelector(".actions");
      topbar.insertBefore(nav, actions || null);
    }
    const links = [
      ["Главная", "index.html", ["/index.html", "/"]],
      ["Специалисты", "specialists/index.html", ["/specialists/"]],
      ["Кейсы", "cases/index.html", ["/cases/"]],
      ["Для бизнеса", "business/index.html", ["/business/"]],
      ["AI", "ai/match/index.html", ["/ai/"]],
      ["ROI", "roi-calculator/index.html", ["/roi-calculator/"]],
      ["Блог", "blog/index.html", ["/blog/"]]
    ];
    const current = normalizePathname(window.location.pathname);
    nav.innerHTML = links
      .map(([label, relativePath, matches]) => {
        const href = appUrl(relativePath);
        const active = matches.some((match) => {
          if (match === "/") return current === "/";
          return current === match || current.includes(match);
        })
          ? " class=\"active\""
          : "";
        return `<a${active} href="${href}">${label}</a>`;
      })
      .join("");

    const mobileNav = document.querySelector("[data-mobile-nav]");
    if (mobileNav) {
      mobileNav.innerHTML = links
        .map(([label, relativePath]) => `<a href="${appUrl(relativePath)}">${label}</a>`)
        .join("");
    }
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
      const hasRoi = Array.from(nav.querySelectorAll("a")).some(
        (item) => normalizePathname(item.getAttribute("href") || "") === normalizePathname(new URL(roiHref, window.location.href).pathname)
      );
      if (hasRoi || nav.querySelector("[data-global-roi-link]")) return;
      const link = document.createElement("a");
      link.href = roiHref;
      link.textContent = "ROI-калькулятор";
      link.setAttribute("data-global-roi-link", "1");
      if (isPath("/roi-calculator/")) link.classList.add("active");

      const blogLink = Array.from(nav.querySelectorAll("a")).find((item) => normalize(item.textContent).includes("блог"));
      nav.insertBefore(link, blogLink || null);
    });

    document.querySelectorAll("[data-mobile-nav]").forEach((mobileNav) => {
      const hasRoi = Array.from(mobileNav.querySelectorAll("a")).some(
        (item) =>
          normalize(item.textContent).includes("roi-калькулятор") ||
          normalizePathname(item.getAttribute("href") || "").includes("/roi-calculator")
      );
      if (hasRoi || mobileNav.querySelector("[data-global-roi-link]")) return;
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

    document.documentElement.style.setProperty("--brand", "#7b6cff");
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

  function ensureGlobalFooter() {
    if (document.querySelector("footer.footer")) return;
    if (isPath("/auth/") || isPath("/admin/")) return;
    const footer = document.createElement("footer");
    footer.className = "footer";
    footer.innerHTML = `
      <div class="container footer-grid">
        <div>
          <a href="${appUrl("index.html")}" class="brand">SMMATCH</a>
          <p class="meta">Платформа для подбора SMM-специалистов, безопасных сделок и прозрачной работы с результатами.</p>
        </div>
        <div>
          <h4>Платформа</h4>
          <ul>
            <li><a href="${appUrl("specialists/index.html")}">Специалисты</a></li>
            <li><a href="${appUrl("cases/index.html")}">Кейсы</a></li>
            <li><a href="${appUrl("roi-calculator/index.html")}">ROI-калькулятор</a></li>
          </ul>
        </div>
        <div>
          <h4>Бизнесу</h4>
          <ul>
            <li><a href="${appUrl("task/new/index.html")}">Создать задачу</a></li>
            <li><a href="${appUrl("safety/index.html")}">Безопасная сделка</a></li>
            <li><a href="${appUrl("dashboard/business/index.html")}">Кабинет</a></li>
          </ul>
        </div>
        <div>
          <h4>Специалистам</h4>
          <ul>
            <li><a href="${appUrl("verification/index.html")}">Верификация</a></li>
            <li><a href="${appUrl("pricing/index.html")}">Тарифы</a></li>
            <li><a href="${appUrl("dashboard/specialist/index.html")}">Рабочий кабинет</a></li>
          </ul>
        </div>
      </div>
    `;
    document.body.insertBefore(footer, document.querySelector("script[src*='js/app.js']") || null);
    initBrandLogos();
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
    const topbarWrap = document.querySelector(".topbar-wrap");
    const topbar = document.querySelector(".topbar");
    if (!topbarWrap || !topbar) return;

    let actions = topbar.querySelector(".actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "actions";
      topbar.appendChild(actions);
    }

    let menuBtn = actions.querySelector("[data-menu-btn]");
    if (!menuBtn) {
      menuBtn = document.createElement("button");
      menuBtn.type = "button";
      menuBtn.className = "btn btn-ghost mobile-menu-btn";
      menuBtn.setAttribute("data-menu-btn", "1");
      menuBtn.textContent = "Меню";
      actions.appendChild(menuBtn);
    }

    let mobileNav = topbarWrap.querySelector("[data-mobile-nav]");
    if (!mobileNav) {
      mobileNav = document.createElement("div");
      mobileNav.className = "container mobile-nav";
      mobileNav.setAttribute("data-mobile-nav", "1");
      const navLinks = Array.from(topbar.querySelectorAll(".nav a"));
      const fallbackLinks = [
        { href: appUrl("index.html"), label: "Главная" },
        { href: appUrl("specialists/index.html"), label: "Специалисты" },
        { href: appUrl("cases/index.html"), label: "Кейсы" },
        { href: appUrl("business/index.html"), label: "Для бизнеса" },
        { href: appUrl("blog/index.html"), label: "Блог" }
      ];
      const source = navLinks.length
        ? navLinks.map((link) => ({ href: link.getAttribute("href") || "#", label: (link.textContent || "").trim() }))
        : fallbackLinks;
      mobileNav.innerHTML = source
        .map((item) => `<a href="${item.href}">${item.label}</a>`)
        .join("");
      topbarWrap.appendChild(mobileNav);
    }

    if (!menuBtn || !mobileNav) return;

    // De-duplicate menu links to avoid repeated entries across templates/injections.
    const seen = new Set();
    Array.from(mobileNav.querySelectorAll("a")).forEach((link) => {
      const href = normalizePathname(link.getAttribute("href") || "");
      const key = `${href}|${normalize(link.textContent)}`;
      if (seen.has(key)) {
        link.remove();
      } else {
        seen.add(key);
      }
    });

    const buttonLabel = (menuBtn.textContent || "").trim() || "Меню";
    menuBtn.innerHTML = `<span class="sr-only">${buttonLabel}</span><span class="menu-icon" aria-hidden="true"></span>`;
    menuBtn.setAttribute("aria-label", buttonLabel);
    menuBtn.setAttribute("aria-expanded", "false");
    mobileNav.setAttribute("aria-hidden", "true");

    let backdrop = document.querySelector(".mobile-nav-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "mobile-nav-backdrop";
      document.body.appendChild(backdrop);
    }

    function openMenu() {
      menuBtn.classList.add("is-open");
      mobileNav.classList.add("show");
      backdrop.classList.add("show");
      document.body.classList.add("menu-open");
      menuBtn.setAttribute("aria-expanded", "true");
      mobileNav.setAttribute("aria-hidden", "false");
    }

    function closeMenu() {
      menuBtn.classList.remove("is-open");
      mobileNav.classList.remove("show");
      backdrop.classList.remove("show");
      document.body.classList.remove("menu-open");
      menuBtn.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
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
    backdrop.addEventListener("click", closeMenu);

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

  function enhanceResponsiveTables() {
    const tables = document.querySelectorAll(".table");
    tables.forEach((table) => {
      const headers = Array.from(table.querySelectorAll("thead th")).map((node) =>
        (node.textContent || "").trim().replace(/\s+/g, " ")
      );
      if (!headers.length) return;
      table.querySelectorAll("tbody tr").forEach((row) => {
        const cells = Array.from(row.children);
        cells.forEach((cell, index) => {
          if (!(cell instanceof HTMLElement)) return;
          if (!cell.dataset.label && headers[index]) {
            cell.dataset.label = headers[index];
          }
        });
      });
    });
  }

  function initResponsiveTableObserver() {
    enhanceResponsiveTables();
    let raf = 0;
    const observer = new MutationObserver(() => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        enhanceResponsiveTables();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
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
      cpl: root.querySelector("[data-roi-value='cpl']"),
      cac: root.querySelector("[data-roi-value='cac']"),
      roi: root.querySelector("[data-roi-value='roi']"),
      payback: root.querySelector("[data-roi-value='payback']")
    };
    const stateCard = root.querySelector("[data-roi-state]");
    const copyBtn = root.querySelector("[data-roi-copy]");
    const calculateBtn = root.querySelector("[data-roi-calculate]");
    const resultCard = root.querySelector(".roi-result-card");

    if (!fields.smmBudget || !metricNodes.roi) return;

    let previous = {
      newLeads: 0,
      sales: 0,
      revenue: 0,
      profit: 0,
      cpl: 0,
      cac: 0,
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
      if (resultCard) {
        resultCard.classList.add("is-updating");
        window.setTimeout(() => resultCard.classList.remove("is-updating"), 180);
      }
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
      const cpl = newLeads > 0 ? totalBudget / newLeads : null;
      const cac = sales > 0 ? totalBudget / sales : null;
      const roi = totalBudget > 0 ? ((profit - totalBudget) / totalBudget) * 100 : null;
      const payback = profit > 0 ? totalBudget / profit : null;

      const next = { newLeads, sales, revenue, profit, cpl, cac, roi, payback };
      animateValue(metricNodes.newLeads, previous.newLeads, next.newLeads, (v) =>
        `${Math.round(v).toLocaleString("ru-RU")}`
      );
      animateValue(metricNodes.sales, previous.sales, next.sales, (v) =>
        `${Math.round(v).toLocaleString("ru-RU")}`
      );
      animateValue(metricNodes.revenue, previous.revenue, next.revenue, (v) => formatMoney(v));
      animateValue(metricNodes.profit, previous.profit, next.profit, (v) => formatMoney(v));
      animateValue(metricNodes.cpl, previous.cpl, next.cpl, (v) => formatMoney(v));
      animateValue(metricNodes.cac, previous.cac, next.cac, (v) => formatMoney(v));
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
          `CPL: ${report.cpl === null || !Number.isFinite(report.cpl) ? "—" : formatMoney(report.cpl)}`,
          `CAC: ${report.cac === null || !Number.isFinite(report.cac) ? "—" : formatMoney(report.cac)}`,
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

    async function shareReport() {
      const text = buildReport();
      if (!text) return;
      if (navigator.share) {
        try {
          await navigator.share({
            title: "ROI-калькулятор SMM",
            text
          });
          showToast("Отчет отправлен");
          return;
        } catch (error) {
          // Ignore user cancel and fallback to copy.
        }
      }
      await copyReport();
    }

    if (copyBtn && !root.querySelector("[data-roi-share]")) {
      const shareBtn = document.createElement("button");
      shareBtn.type = "button";
      shareBtn.className = "btn btn-ghost";
      shareBtn.textContent = "Поделиться";
      shareBtn.setAttribute("data-roi-share", "1");
      copyBtn.parentElement?.appendChild(shareBtn);
      shareBtn.addEventListener("click", shareReport);
    }

    Object.values(fields).forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => {
        if (!stateCard) return;
        stateCard.classList.remove("positive", "negative");
        stateCard.classList.add("neutral");
        stateCard.textContent = "Данные изменены. Запустите расчет, чтобы обновить прогноз.";
      });
    });
    if (copyBtn) copyBtn.addEventListener("click", copyReport);
    if (calculateBtn) {
      calculateBtn.addEventListener("click", () => {
        const requiredFields = Object.values(fields).filter(Boolean);
        const missing = requiredFields.find((field) => field.value === "" || Number(field.value) < 0);
        if (missing) {
          missing.focus();
          missing.closest(".field")?.classList.add("field-has-error");
          showToast("Заполните поля калькулятора", "error");
          return;
        }
        requiredFields.forEach((field) => field.closest(".field")?.classList.remove("field-has-error"));
        calculateBtn.disabled = true;
        const prevText = calculateBtn.textContent;
        calculateBtn.textContent = "Считаем...";
        window.setTimeout(() => {
          recalc();
          calculateBtn.disabled = false;
          calculateBtn.textContent = prevText;
        }, 360);
      });
    }
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
    const verification = verificationForSpecialist(specialist);
    const verificationState = verification ? verification.status : specialist.verified ? "verified" : "not_verified";
    const verificationText = verification
      ? verificationStatusLabel(verification.status)
      : specialist.verified
        ? "Верифицирован"
        : "Не верифицирован";
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
          <div class="meta">Опыт: ${specialist.experience === "senior" ? "Senior" : specialist.experience === "middle" ? "Middle" : "Junior"} • ${specialist.completedOrders} проектов</div>
          <div class="verified ${verificationState}">${verificationText}</div>
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
            <span>Заказов: ${specialist.completedOrders}</span>
            <span>Ответов: ${specialist.responseRate}%</span>
            <span>Ответ: ~${specialist.responseTimeHours} ч</span>
            <span>Статус: ${availabilityStatusLabel(specialist.availabilityStatus)}</span>
          </div>
          <div class="chips">
            <a class="btn btn-primary" href="${specialistProfileUrl(rootPrefix, specialist)}" data-open-profile="${specialist.id}">Профиль</a>
            <button class="btn btn-ghost" data-contact-specialist="${specialist.id}" type="button">Связаться</button>
            <button class="btn btn-ghost" data-invite-specialist="${specialist.id}" type="button">Пригласить</button>
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
    const priceGroup = priceRange ? priceRange.closest(".filter-group") : null;
    const priceTitle = priceGroup ? priceGroup.querySelector("h4") : null;
    const searchInput = document.querySelector("[data-specialists-search]");
    let renderCount = 6;
    let currentSort = "relevance";
    document.querySelectorAll(".filter-group .option.active").forEach((item) => item.classList.remove("active"));
    if (priceRange) priceRange.value = "3000";

    const controls = document.createElement("div");
    controls.className = "chips specialists-toolbar";
    controls.innerHTML = `
      <label class="chip">Сортировка:
        <select data-specialists-sort>
          <option value="relevance">По релевантности</option>
          <option value="rating">По рейтингу</option>
          <option value="priceAsc">Сначала дешевле</option>
          <option value="priceDesc">Сначала дороже</option>
          <option value="orders">По заказам</option>
        </select>
      </label>
      <button class="chip" type="button" data-reset-specialists>Сбросить фильтры</button>
      <button class="chip" type="button" data-load-more-specialists>Показать ещё</button>
    `;
    const mainContainer = catalogGrid.parentElement;
    if (mainContainer && !mainContainer.querySelector("[data-specialists-sort]")) {
      mainContainer.insertBefore(controls, catalogGrid);
    }
    const sortSelect = document.querySelector("[data-specialists-sort]");
    const loadMoreBtn = document.querySelector("[data-load-more-specialists]");
    const resetBtn = document.querySelector("[data-reset-specialists]");
    let firstRenderDone = false;
    let filtersBackdrop = null;

    const sidebar = document.querySelector(".sidebar");
    if (sidebar && !document.querySelector("[data-open-filters]")) {
      const mobileTools = document.createElement("div");
      mobileTools.className = "mobile-catalog-tools";
      mobileTools.innerHTML = `
        <button class="btn btn-primary" type="button" data-open-filters>Фильтры</button>
      `;
      const insertAfter = mainContainer && mainContainer.querySelector("[data-specialists-sort]")
        ? mainContainer.querySelector("[data-specialists-sort]").closest(".chips")
        : null;
      if (insertAfter && insertAfter.parentElement) {
        insertAfter.parentElement.insertBefore(mobileTools, insertAfter.nextSibling);
      } else if (mainContainer) {
        mainContainer.insertBefore(mobileTools, catalogGrid);
      }

      filtersBackdrop = document.createElement("div");
      filtersBackdrop.className = "filters-backdrop";
      document.body.appendChild(filtersBackdrop);

      function closeFilters() {
        sidebar.classList.remove("mobile-open");
        document.body.classList.remove("filters-open");
      }

      function openFilters() {
        sidebar.classList.add("mobile-open");
        document.body.classList.add("filters-open");
      }

      const openBtn = mobileTools.querySelector("[data-open-filters]");
      if (openBtn) openBtn.addEventListener("click", openFilters);
      filtersBackdrop.addEventListener("click", closeFilters);

      if (!sidebar.querySelector("[data-filters-actions]")) {
        const actions = document.createElement("div");
        actions.className = "filters-actions";
        actions.setAttribute("data-filters-actions", "1");
        actions.innerHTML = `
          <button class="btn btn-ghost" type="button" data-reset-filters>Сбросить</button>
          <button class="btn btn-primary" type="button" data-apply-filters>Применить</button>
        `;
        sidebar.appendChild(actions);
        actions.querySelector("[data-reset-filters]")?.addEventListener("click", () => {
          sidebar.querySelectorAll(".option.active").forEach((item) => item.classList.remove("active"));
          if (priceRange) priceRange.value = "3000";
          if (searchInput) searchInput.value = "";
          renderCount = 6;
          render();
          closeFilters();
        });
        actions.querySelector("[data-apply-filters]")?.addEventListener("click", () => {
          renderCount = 6;
          render();
          closeFilters();
        });
      }

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeFilters();
      });
      window.addEventListener("resize", () => {
        if (window.innerWidth > 760) closeFilters();
      });
    }

    function renderSkeleton() {
      catalogGrid.innerHTML = Array.from({ length: 4 })
        .map(
          () => `
            <article class="card catalog-card">
              <div class="avatar"></div>
              <div>
                <h3>Загрузка...</h3>
                <div class="meta">Подбираем специалистов под ваши фильтры</div>
              </div>
            </article>
          `
        )
        .join("");
    }

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
      const selectedCountries = selectedOptions(3, "country");
      const selectedExperience = selectedOptions(4, "experience");
      const selectedNiches = selectedOptions(5, "niche");
      const selectedRatings = selectedOptions(6, "rating");
      const selectedSkills = selectedOptions(7, "skills");
      const selectedVerified = selectedOptions(8, "verified");
      const selectedAvailability = selectedOptions(9, "availability");
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
        const countryOk =
          selectedCountries.length === 0 ||
          selectedCountries.some((country) => normalize(specialist.country).includes(country));
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
        const verifiedOk =
          selectedVerified.length === 0 ||
          selectedVerified.some((item) => item.includes("verified") ? specialist.verified : true);
        const availabilityOk =
          selectedAvailability.length === 0 ||
          selectedAvailability.some((item) => {
            const label = specialist.availabilityStatus === "available" ? "доступен" : specialist.availabilityStatus === "busy" ? "занят" : "оффлайн";
            return label.includes(item);
          });
        const searchOk =
          !searchText ||
          normalize(specialist.name).includes(searchText) ||
          normalize(specialist.description).includes(searchText) ||
          specialist.skills.some((skill) => normalize(skill).includes(searchText));

        return categoryOk && platformOk && cityOk && countryOk && experienceOk && nicheOk && priceOk && ratingOk && skillsOk && verifiedOk && availabilityOk && searchOk;
      });

      filtered.sort((a, b) => {
        if (currentSort === "rating") return b.rating - a.rating;
        if (currentSort === "priceAsc") return a.priceByn - b.priceByn;
        if (currentSort === "priceDesc") return b.priceByn - a.priceByn;
        if (currentSort === "orders") return b.completedOrders - a.completedOrders;
        return b.rating - a.rating || a.priceByn - b.priceByn;
      });

      if (!filtered.length) {
        const emptyTitle = state.specialists.length
          ? "Ничего не найдено"
          : "Каталог специалистов формируется";
        const emptyText = state.specialists.length
          ? "Попробуйте снять часть фильтров или увеличить бюджет."
          : "Каталог готов к наполнению: добавьте специалистов через регистрацию или админку.";
        catalogGrid.innerHTML = `<article class="card"><h3>${emptyTitle}</h3><p class="meta">${emptyText}</p></article>`;
        if (loadMoreBtn) loadMoreBtn.style.display = "none";
        return;
      }

      const visible = filtered.slice(0, renderCount);
      catalogGrid.innerHTML = visible
        .map((specialist) => renderCatalogCard(specialist, "../"))
        .join("");
      if (loadMoreBtn) {
        loadMoreBtn.style.display = filtered.length > visible.length ? "inline-flex" : "none";
      }
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

      const contactTrigger = target.closest("[data-contact-specialist]");
      const contactId = contactTrigger ? contactTrigger.getAttribute("data-contact-specialist") : "";
      if (contactId) {
        event.preventDefault();
        const user = requireBusinessForAction();
        if (!user) return;
        const convo = ensureConversation(user.id, contactId);
        state.ui.selectedBusinessConversationId = convo.id;
        state.ui.selectedSpecialistId = contactId;
        saveState();
        window.location.href = appUrl("dashboard/business/messages/index.html");
      }

      const inviteTrigger = target.closest("[data-invite-specialist]");
      const inviteId = inviteTrigger ? inviteTrigger.getAttribute("data-invite-specialist") : "";
      if (inviteId) {
        event.preventDefault();
        const user = requireBusinessForAction();
        if (!user) return;
        state.ui.selectedSpecialistId = inviteId;
        saveState();
        window.location.href = appUrl("task/new/index.html");
      }
    });

    if (priceRange) {
      priceRange.addEventListener("input", render);
    }
    if (searchInput) {
      searchInput.addEventListener("input", render);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        currentSort = sortSelect.value || "relevance";
        render();
      });
    }
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        renderCount += 6;
        render();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        document.querySelectorAll(".option.active").forEach((item) => item.classList.remove("active"));
        if (priceRange) priceRange.value = "3000";
        if (searchInput) searchInput.value = "";
        currentSort = "relevance";
        if (sortSelect) sortSelect.value = currentSort;
        renderCount = 6;
        render();
      });
    }

    document.querySelectorAll(".option").forEach((option) => {
      option.addEventListener("click", () => {
        renderCount = 6;
        window.setTimeout(render, 0);
      });
    });

    if (!firstRenderDone) {
      renderSkeleton();
      window.setTimeout(() => {
        firstRenderDone = true;
        render();
      }, 260);
    } else {
      render();
    }
  }

  function initCasesPage() {
    if (!isPath("/cases/")) return;
    const casesGrid = document.querySelector(".cases-grid");
    if (!casesGrid) return;

    let renderCount = 6;
    let currentSort = "rating";
    let verifiedOnly = false;
    let selectedNiche = "all";

    const mainContainer = casesGrid.parentElement;
    if (mainContainer && !mainContainer.querySelector("[data-cases-controls]")) {
      const controls = document.createElement("section");
      controls.className = "section";
      controls.setAttribute("data-cases-controls", "1");
      controls.innerHTML = `
        <article class="card">
          <div class="field">
            <label for="cases-search">Поиск кейсов</label>
            <input id="cases-search" data-cases-search type="search" placeholder="Ниша, специалист, результат">
          </div>
          <div class="chips specialists-toolbar">
            <label class="chip">Сортировка:
              <select data-cases-sort>
                <option value="rating">По рейтингу специалиста</option>
                <option value="orders">По количеству заказов</option>
                <option value="priceAsc">Сначала дешевле</option>
                <option value="priceDesc">Сначала дороже</option>
              </select>
            </label>
            <button class="chip" type="button" data-cases-verified>Только verified</button>
            <button class="chip" type="button" data-load-more-cases>Показать ещё</button>
          </div>
          <div class="chips" data-cases-niches></div>
        </article>
      `;
      mainContainer.insertBefore(controls, casesGrid);
    }

    const searchInput = document.querySelector("[data-cases-search]");
    const sortSelect = document.querySelector("[data-cases-sort]");
    const verifiedBtn = document.querySelector("[data-cases-verified]");
    const loadMoreBtn = document.querySelector("[data-load-more-cases]");
    const nichesWrap = document.querySelector("[data-cases-niches]");

    function collectItems() {
      return state.specialists
        .filter((specialist) => specialist.status !== "blocked" && specialist.status !== "hidden")
        .flatMap((specialist) =>
          (specialist.cases || []).map((caseItem, index) => ({
            id: `${specialist.id}_${index}_${normalizeForSlug(caseItem.title || "case")}`,
            title: caseItem.title || "Кейс без названия",
            result1: caseItem.result1 || "Результат не указан",
            result2: caseItem.result2 || "Результат не указан",
            period: caseItem.period || "Период не указан",
            specialist
          }))
        );
    }

    function renderNicheFilters(items) {
      if (!nichesWrap) return;
      const counts = {};
      items.forEach((item) => {
        (item.specialist.niches || []).forEach((niche) => {
          const key = normalize(niche);
          if (!key) return;
          counts[key] = (counts[key] || 0) + 1;
        });
      });
      const topNiches = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map((entry) => entry[0]);
      const source = ["all", ...topNiches];
      nichesWrap.innerHTML = source
        .map((niche) => {
          const label = niche === "all" ? "Все ниши" : niche;
          const active = selectedNiche === niche ? "active" : "";
          return `<button class="chip ${active}" type="button" data-case-niche="${niche}">${label}</button>`;
        })
        .join("");
    }

    function renderCard(item) {
      const specialist = item.specialist;
      const platforms = (specialist.platforms || []).slice(0, 3).join(" + ");
      const budget = Number(item.budgetByn || specialist.priceByn || 0);
      return `
        <article class="card case-card">
          <div class="case-image" style="--media-photo: url('${specialist.avatar}')"></div>
          <strong>${item.title}</strong>
          <div class="meta">${specialist.name} • ${specialist.specialization}</div>
          <div class="meta">${specialist.city} • рейтинг ${specialist.rating.toFixed(1)}</div>
          <p class="meta">Задача: выстроить понятный контент-процесс, усилить воронку заявок и показать измеримый результат по KPI.</p>
          <div class="case-chart" aria-hidden="true"><span style="height: 38%"></span><span style="height: 56%"></span><span style="height: 78%"></span><span style="height: 100%"></span></div>
          <div class="kpi-line"><span>Результат</span><strong>${item.result1}</strong></div>
          <div class="kpi-line"><span>Дополнительно</span><strong>${item.result2}</strong></div>
          <div class="kpi-line"><span>Бюджет</span><strong>${formatMoneyByn(budget)}</strong></div>
          <div class="kpi-line"><span>Площадки</span><strong>${platforms || "SMM"}</strong></div>
          <div class="kpi-line"><span>Период</span><strong>${item.period}</strong></div>
          <div class="before-after">
            <span>До: разрозненные публикации</span>
            <span>После: система контента и лиды</span>
          </div>
          <div class="chips">
            <a class="chip" href="${specialistProfileUrl("../", specialist)}" data-open-profile-case="${specialist.id}">Профиль</a>
            <button class="chip" type="button" data-add-favorite-case="${specialist.id}">В избранное</button>
          </div>
        </article>
      `;
    }

    function render() {
      const items = collectItems();
      renderNicheFilters(items);

      const searchText = normalize(searchInput ? searchInput.value : "");
      const filtered = items.filter((item) => {
        const specialist = item.specialist;
        const nicheOk =
          selectedNiche === "all" || (specialist.niches || []).some((niche) => normalize(niche).includes(selectedNiche));
        const verifiedOk = !verifiedOnly || specialist.verified;
        const searchPool = [
          item.title,
          item.result1,
          item.result2,
          item.period,
          specialist.name,
          specialist.specialization,
          specialist.city,
          ...(specialist.platforms || []),
          ...(specialist.niches || [])
        ]
          .join(" ")
          .toLowerCase();
        const searchOk = !searchText || searchPool.includes(searchText);
        return nicheOk && verifiedOk && searchOk;
      });

      filtered.sort((a, b) => {
        if (currentSort === "orders") return b.specialist.completedOrders - a.specialist.completedOrders;
        if (currentSort === "priceAsc") return a.specialist.priceByn - b.specialist.priceByn;
        if (currentSort === "priceDesc") return b.specialist.priceByn - a.specialist.priceByn;
        return b.specialist.rating - a.specialist.rating;
      });

      if (!filtered.length) {
        casesGrid.innerHTML = `
          <article class="card">
            <h3>Кейсы не найдены</h3>
            <p class="meta">Измените фильтры или поисковый запрос. В каталоге уже есть кейсы по другим нишам и платформам.</p>
          </article>
        `;
        if (loadMoreBtn) loadMoreBtn.style.display = "none";
        return;
      }

      const visible = filtered.slice(0, renderCount);
      casesGrid.innerHTML = visible.map((item) => renderCard(item)).join("");
      if (loadMoreBtn) loadMoreBtn.style.display = filtered.length > visible.length ? "inline-flex" : "none";
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        renderCount = 6;
        render();
      });
    }
    if (sortSelect) {
      sortSelect.value = currentSort;
      sortSelect.addEventListener("change", () => {
        currentSort = sortSelect.value || "rating";
        render();
      });
    }
    if (verifiedBtn) {
      verifiedBtn.addEventListener("click", () => {
        verifiedOnly = !verifiedOnly;
        verifiedBtn.classList.toggle("active", verifiedOnly);
        renderCount = 6;
        render();
      });
    }
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        renderCount += 6;
        render();
      });
    }
    if (nichesWrap) {
      nichesWrap.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const button = target.closest("[data-case-niche]");
        if (!button) return;
        selectedNiche = button.getAttribute("data-case-niche") || "all";
        renderCount = 6;
        render();
      });
    }

    casesGrid.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const profileLink = target.closest("[data-open-profile-case]");
      const profileId = profileLink ? profileLink.getAttribute("data-open-profile-case") : "";
      if (profileId) {
        state.ui.selectedSpecialistId = profileId;
        const user = currentUser();
        if (user && user.role === "business") {
          const convo = ensureConversation(user.id, profileId);
          state.ui.selectedBusinessConversationId = convo.id;
        }
        saveState();
      }

      const favoriteButton = target.closest("[data-add-favorite-case]");
      const favoriteId = favoriteButton ? favoriteButton.getAttribute("data-add-favorite-case") : "";
      if (!favoriteId) return;
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
    });

    render();
  }

  function renderTaskPreviewMatches(task, wrapper) {
    if (!wrapper) return;
    const target = wrapper.querySelector("[data-task-match]")?.parentElement || wrapper;
    target.querySelectorAll(".panel-item[data-task-match]").forEach((item) => item.remove());
    const responses = task.responses || [];
    if (!responses.length) {
      const panelItem = document.createElement("div");
      panelItem.className = "panel-item";
      panelItem.setAttribute("data-task-match", "1");
      panelItem.innerHTML = `<strong>Подбор готовится</strong><div class="meta">Опишите задачу подробнее, и система покажет наиболее релевантных специалистов.</div>`;
      target.appendChild(panelItem);
      return;
    }
    responses.forEach((response) => {
      const specialist = findSpecialistById(response.specialistId);
      if (!specialist) return;
      const panelItem = document.createElement("div");
      panelItem.className = "panel-item";
      panelItem.setAttribute("data-task-match", "1");
      const reasonLine = Array.isArray(response.reasons) && response.reasons.length
        ? response.reasons[0]
        : "Подходит по параметрам задачи.";
      panelItem.innerHTML = `
        <strong>${specialist.name}</strong>
        <div class="meta">${response.score}% совпадения • ${specialist.specialization}</div>
        <div class="meta">${reasonLine}</div>
        <div class="chips"><a class="chip" href="${specialistProfileUrl("../../", specialist)}">Профиль</a></div>
      `;
      target.appendChild(panelItem);
    });
  }

  function enhanceTaskFormFlow(form) {
    if (form.dataset.flowEnhanced === "1") return;
    form.dataset.flowEnhanced = "1";
    form.classList.add("task-form");

    const groups = [
      {
        title: "1. Цель",
        hint: "Сформулируйте задачу так, чтобы специалист быстро понял контекст.",
        selectors: ["#task_title", "#task_category", "#niche", "#platforms"]
      },
      {
        title: "2. Бюджет и сроки",
        hint: "Укажите реалистичный бюджет, дедлайн и состав работ.",
        selectors: ["#budget", "#task_budget", "#task_deadline", "#task_need_target", "#task_need_content", "#task_need_reels"]
      },
      {
        title: "3. Бриф",
        hint: "Добавьте KPI, референсы и ограничения, чтобы получить точные отклики.",
        selectors: ["#task_description", "#task_skills_required", "#task_references", "#task_attachments", "#task_optional_notes"]
      }
    ];

    const submitBtn = form.querySelector("button[type='submit']");
    const progress = document.createElement("div");
    progress.className = "task-progress";
    progress.innerHTML = groups
      .map((group, index) => `<button type="button" data-task-step-jump="${index}">${group.title}</button>`)
      .join("");
    form.parentElement?.insertBefore(progress, form);

    const steps = groups.map((group, index) => {
      const section = document.createElement("section");
      section.className = "task-step";
      section.setAttribute("data-task-step", String(index));
      section.innerHTML = `<div class="task-step-head"><strong>${group.title}</strong><span>${group.hint}</span></div>`;
      group.selectors.forEach((selector) => {
        const field = form.querySelector(selector)?.closest(".field");
        if (field) section.appendChild(field);
      });
      form.insertBefore(section, submitBtn || null);
      return section;
    });

    const actions = document.createElement("div");
    actions.className = "task-flow-actions";
    actions.innerHTML = `
      <button class="btn btn-ghost" type="button" data-task-prev>Назад</button>
      <button class="btn btn-primary" type="button" data-task-next>Продолжить</button>
    `;
    form.insertBefore(actions, submitBtn || null);

    if (submitBtn) {
      submitBtn.classList.add("task-submit");
      submitBtn.textContent = "Опубликовать задачу и получить подбор";
    }

    let activeStep = 0;

    function validateStep(index) {
      const fields = Array.from(steps[index].querySelectorAll("input, select, textarea"));
      const invalid = fields.find((field) => field.hasAttribute("required") && !field.checkValidity());
      if (invalid) {
        invalid.reportValidity();
        invalid.closest(".field")?.classList.add("field-has-error");
        return false;
      }
      fields.forEach((field) => field.closest(".field")?.classList.remove("field-has-error"));
      return true;
    }

    function renderStep(nextStep) {
      activeStep = Math.max(0, Math.min(steps.length - 1, nextStep));
      steps.forEach((step, index) => {
        step.hidden = index !== activeStep;
      });
      progress.querySelectorAll("button").forEach((button, index) => {
        button.classList.toggle("active", index === activeStep);
        button.classList.toggle("complete", index < activeStep);
      });
      const prevBtn = actions.querySelector("[data-task-prev]");
      const nextBtn = actions.querySelector("[data-task-next]");
      if (prevBtn) prevBtn.toggleAttribute("disabled", activeStep === 0);
      if (nextBtn) nextBtn.hidden = activeStep === steps.length - 1;
      if (submitBtn) submitBtn.hidden = activeStep !== steps.length - 1;
    }

    actions.querySelector("[data-task-prev]")?.addEventListener("click", () => renderStep(activeStep - 1));
    actions.querySelector("[data-task-next]")?.addEventListener("click", () => {
      if (!validateStep(activeStep)) return;
      renderStep(activeStep + 1);
    });
    progress.querySelectorAll("[data-task-step-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextStep = Number(button.getAttribute("data-task-step-jump") || 0);
        if (nextStep > activeStep && !validateStep(activeStep)) return;
        renderStep(nextStep);
      });
    });

    renderStep(0);
  }

  function initTaskCreatePage() {
    if (!isPath("/task/new/")) return;
    const form = document.querySelector("main form");
    if (!form) return;
    enhanceTaskFormFlow(form);
    const draftKey = "smmatch_task_draft";
    const draftNote = document.querySelector("[data-task-draft-note]");

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

    function setDraftNote(text) {
      if (draftNote) draftNote.textContent = text;
    }

    function collectDraftPayload() {
      const attachmentsInput = form.querySelector("#task_attachments");
      const attachmentNames = attachmentsInput && attachmentsInput.files
        ? Array.from(attachmentsInput.files).map((file) => file.name)
        : [];
      return {
        title: (form.querySelector("#task_title") || { value: "" }).value,
        category: (form.querySelector("#task_category") || { value: "" }).value,
        niche: (form.querySelector("#niche") || { value: "" }).value,
        budgetTier: (form.querySelector("#budget") || { value: "" }).value,
        budgetByn: (form.querySelector("#task_budget") || { value: "" }).value,
        platforms: (form.querySelector("#platforms") || { value: "" }).value,
        description: (form.querySelector("#task_description") || { value: "" }).value,
        skillsRequired: (form.querySelector("#task_skills_required") || { value: "" }).value,
        references: (form.querySelector("#task_references") || { value: "" }).value,
        attachments: attachmentNames,
        deadline: (form.querySelector("#task_deadline") || { value: "" }).value,
        needTarget: (form.querySelector("#task_need_target") || { value: "Не уверен" }).value,
        needContent: (form.querySelector("#task_need_content") || { value: "Частично" }).value,
        needReels: (form.querySelector("#task_need_reels") || { value: "Да" }).value,
        optionalNotes: (form.querySelector("#task_optional_notes") || { value: "" }).value,
        updatedAt: nowIso()
      };
    }

    function saveDraft() {
      const payload = collectDraftPayload();
      localStorage.setItem(draftKey, JSON.stringify(payload));
      setDraftNote(`Черновик сохранен: ${new Date(payload.updatedAt).toLocaleTimeString("ru-RU")}`);
    }

    function restoreDraft() {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      try {
        const draft = JSON.parse(raw);
        [
          ["#task_title", "title"],
          ["#task_category", "category"],
          ["#niche", "niche"],
          ["#budget", "budgetTier"],
          ["#task_budget", "budgetByn"],
          ["#platforms", "platforms"],
          ["#task_description", "description"],
          ["#task_skills_required", "skillsRequired"],
          ["#task_references", "references"],
          ["#task_deadline", "deadline"],
          ["#task_need_target", "needTarget"],
          ["#task_need_content", "needContent"],
          ["#task_need_reels", "needReels"],
          ["#task_optional_notes", "optionalNotes"]
        ].forEach(([selector, key]) => {
          const input = form.querySelector(selector);
          if (!input || draft[key] === undefined || draft[key] === null) return;
          input.value = String(draft[key]);
        });
        setDraftNote(`Черновик восстановлен: ${new Date(draft.updatedAt || nowIso()).toLocaleString("ru-RU")}`);
      } catch (error) {
        localStorage.removeItem(draftKey);
      }
    }

    restoreDraft();
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("input", saveDraft);
      field.addEventListener("change", saveDraft);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const user = requireBusinessForAction();
      if (!user) return;
      const submitBtn = form.querySelector("button[type='submit']");
      const titleField = form.querySelector("#task_title");
      const categoryField = form.querySelector("#task_category");
      const budgetField = form.querySelector("#task_budget");
      const descriptionField = form.querySelector("#task_description");
      const deadlineField = form.querySelector("#task_deadline");
      const needTargetField = form.querySelector("#task_need_target");
      const needContentField = form.querySelector("#task_need_content");
      const needReelsField = form.querySelector("#task_need_reels");
      const skillsRequiredField = form.querySelector("#task_skills_required");
      const referencesField = form.querySelector("#task_references");
      const attachmentsField = form.querySelector("#task_attachments");
      const optionalNotesField = form.querySelector("#task_optional_notes");

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

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Публикуем задачу...";
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
        requiredSkills: skillsRequiredField
          ? skillsRequiredField.value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        references: referencesField
          ? referencesField.value
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        attachments:
          attachmentsField && attachmentsField.files
            ? Array.from(attachmentsField.files).map((file) => ({ id: uid("att"), name: file.name }))
            : [],
        optionalNotes: optionalNotesField ? optionalNotesField.value.trim() : "",
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
      const assignedSpecialistId = null;

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
        requiredSkills: taskInput.requiredSkills,
        references: taskInput.references,
        attachments: taskInput.attachments,
        optionalNotes: taskInput.optionalNotes,
        needTarget: taskInput.needTarget,
        needContent: taskInput.needContent,
        needReels: taskInput.needReels,
        status: "published",
        businessUserId,
        assignedSpecialistId,
        revisionCount: 0,
        responses,
        createdAt: nowIso()
      };

      window.setTimeout(() => {
        state.tasks.unshift(task);
        state.ai.lastMatchTaskId = task.id;
        state.ui.selectedSpecialistId = assignedSpecialistId || state.ui.selectedSpecialistId;

        if (assignedSpecialistId) {
          const convo = ensureConversation(businessUserId, assignedSpecialistId);
          addMessage(convo.id, "business", `Создана новая задача: ${task.title}. Цель: ${task.goals}`);
          state.ui.selectedBusinessConversationId = convo.id;
        }

        saveState();
        localStorage.removeItem(draftKey);
        logEvent("task_created", "task", task.id, `Создана задача ${task.title}`, user.id);
        if (secondPanel && previewTitle) {
          renderTaskPreviewMatches(task, previewTitle.parentElement);
        }
        showToast("Задача опубликована. AI Match обновлен.");
        form.reset();
        setDraftNote("Черновик очищен");
        window.setTimeout(() => {
          window.location.href = appUrl("dashboard/business/index.html");
        }, 420);
      }, 650);
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

  function renderHomeMarketplaceSections() {
    if (!(isPath("/index.html") || normalizePathname(window.location.pathname) === "" || normalizePathname(window.location.pathname) === "/")) {
      return;
    }

    const heroProof = document.querySelector(".hero-proof .meta");
    if (heroProof) {
      heroProof.textContent = `${state.specialists.length} специалистов уже в каталоге`;
    }
    const floatCards = document.querySelectorAll(".hero-board .float-card strong");
    if (floatCards.length >= 3) {
      const avgRating = state.specialists.length
        ? (
            state.specialists.reduce((sum, item) => sum + Number(item.rating || 0), 0) / state.specialists.length
          ).toFixed(1)
        : "0.0";
      const dealsCount = state.deals.length;
      const verifiedShare = state.specialists.length
        ? Math.round((state.specialists.filter((item) => item.verified).length / state.specialists.length) * 100)
        : 0;
      floatCards[0].textContent = `${avgRating}/5`;
      floatCards[1].textContent = `${dealsCount}`;
      floatCards[2].textContent = `${verifiedShare}%`;
    }
    const floatMeta = document.querySelectorAll(".hero-board .float-card small");
    if (floatMeta.length >= 3) {
      floatMeta[0].textContent = "средний рейтинг специалистов";
      floatMeta[1].textContent = "сделок через escrow";
      floatMeta[2].textContent = "проверенных профилей";
    }

    const topTitle = Array.from(document.querySelectorAll(".section-title")).find((item) =>
      normalize(item.textContent).includes("топ-специалист")
    );
    if (topTitle) topTitle.textContent = "Топ-специалисты для вашего бизнеса";
    const specialistGrid = document.querySelector(".specialist-grid");
    if (specialistGrid) {
      const top = state.specialists
        .filter((item) => item.status !== "blocked" && item.status !== "hidden")
        .slice()
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);
      specialistGrid.innerHTML = top.length
        ? top
            .map(
              (item) => `
                <article class="card specialist-card">
                  <div class="specialist-thumb" style="--media-photo: url('${item.avatar}')"></div>
                  <h3>${item.name}</h3>
                  <p class="meta">${item.specialization} • ${item.city}</p>
                  <p class="meta">Рейтинг: ${item.rating.toFixed(1)} • Заказов: ${item.completedOrders}</p>
                  <div class="price">от ${formatMoneyByn(item.priceByn)} / мес</div>
                  <div class="chips">
                    <a class="chip" href="${specialistProfileUrl("", item)}">Профиль</a>
                    <a class="chip" href="specialists/index.html">Найти похожих</a>
                  </div>
                </article>
              `
            )
            .join("")
        : "<article class='card'><h3>Каталог готов к запуску</h3><p class='meta'>Добавьте первых специалистов в админке или через регистрацию исполнителя.</p></article>";
    }

    const casesTitle = Array.from(document.querySelectorAll(".section-title")).find((item) =>
      normalize(item.textContent).includes("реальные кейсы") || normalize(item.textContent).includes("подтвержденные кейсы")
    );
    if (casesTitle) casesTitle.textContent = "Кейсы с измеримым результатом";
    const casesGrid = document.querySelector(".cases-grid");
    if (casesGrid) {
      const cases = state.specialists
        .flatMap((item) => (item.cases || []).map((caseItem) => ({ ...caseItem, specialist: item.name, city: item.city })))
        .slice(0, 3);
      casesGrid.innerHTML = cases.length
        ? cases
            .map(
              (item) => `
                <article class="card case-card">
                  <div class="case-image"></div>
                  <strong>${item.title}</strong>
                  <div class="meta">${item.specialist} • ${item.city}</div>
                  <div class="kpi-line"><span>Результат</span><strong>${item.result1}</strong></div>
                  <div class="kpi-line"><span>Дополнительно</span><strong>${item.result2}</strong></div>
                  <div class="kpi-line"><span>Период</span><strong>${item.period}</strong></div>
                </article>
              `
            )
            .join("")
        : "<article class='card'><h3>Кейсы готовятся к публикации</h3><p class='meta'>Добавьте кейсы в профили специалистов, чтобы показать результаты на главной.</p></article>";
    }

    const reviewsTitle = Array.from(document.querySelectorAll(".section-title")).find((item) =>
      normalize(item.textContent).includes("отзывы бизнеса")
    );
    if (reviewsTitle) reviewsTitle.textContent = "Что говорят клиенты платформы";
    const reviewsGrid = document.querySelector(".reviews");
    if (reviewsGrid) {
      const reviewItems = state.reviews.slice(-3).reverse();
      const fallback = [
        { date: nowIso(), rating: 5, comment: "Быстро нашли специалиста под запуск Reels. Результат в заявках уже в первый месяц." },
        { date: nowIso(), rating: 5, comment: "Удобная безопасная сделка и прозрачный чат по проекту. Вся коммуникация внутри платформы." },
        { date: nowIso(), rating: 4, comment: "Понравился AI Match и фильтры по нише. Подобрали релевантного эксперта под наш бюджет." }
      ];
      const source = reviewItems.length
        ? reviewItems.map((item) => ({ date: item.createdAt, rating: item.rating, comment: item.comment }))
        : fallback;
      reviewsGrid.innerHTML = source
        .slice(0, 3)
        .map(
          (item) => `
            <article class="card">
              <strong>${formatDate(item.date)}</strong>
              <div class="review-stars">${"★".repeat(Number(item.rating || 5))}${"☆".repeat(5 - Number(item.rating || 5))}</div>
              <p class="meta">${item.comment}</p>
            </article>
          `
        )
        .join("");
    }

    const statsStrip = document.querySelector(".stats-strip");
    if (statsStrip) {
      const activeSpecialists = state.specialists.filter((item) => !["hidden", "blocked"].includes(item.status)).length;
      const projects = state.tasks.length;
      const completed = state.specialists.reduce((sum, item) => sum + Number(item.completedOrders || 0), 0);
      const avgRating = state.specialists.length
        ? (
            state.specialists.reduce((sum, item) => sum + Number(item.rating || 0), 0) / state.specialists.length
          ).toFixed(1)
        : "0.0";
      statsStrip.innerHTML = `
        <article class="card stat-box"><strong>${activeSpecialists}</strong><span class="meta">специалистов в каталоге</span></article>
        <article class="card stat-box"><strong>${projects}</strong><span class="meta">проектов на платформе</span></article>
        <article class="card stat-box"><strong>${completed}</strong><span class="meta">заказов в портфолио</span></article>
        <article class="card stat-box"><strong>${avgRating}</strong><span class="meta">средний рейтинг</span></article>
      `;
    }

    const cta = document.querySelector(".cta");
    if (cta && !document.querySelector("[data-home-trust-section]")) {
      const trust = document.createElement("section");
      trust.className = "section";
      trust.setAttribute("data-home-trust-section", "1");
      trust.innerHTML = `
        <div class="section-head">
          <span class="pill">Trust & Safety</span>
          <h2 class="section-title">Почему бизнесу безопасно работать через SMMatch</h2>
        </div>
        <div class="grid-3">
          <article class="card"><h3>Escrow и комиссия 10%</h3><p class="meta">Оплата проходит через безопасную сделку: 10% платформе, остальное исполнителю после подтверждения.</p></article>
          <article class="card"><h3>Внутренний чат</h3><p class="meta">Проектные сообщения, системные статусы и история коммуникации без потери контекста.</p></article>
          <article class="card"><h3>Споры и арбитраж</h3><p class="meta">При конфликте открывается dispute-case, средства остаются в hold до решения.</p></article>
          <article class="card"><h3>Доработки</h3><p class="meta">До 2 бесплатных ревизий в рамках сделки до финальной приемки результата.</p></article>
          <article class="card"><h3>Верификация специалистов</h3><p class="meta">Проверка данных, соцсетей и портфолио снижает риски и повышает качество подбора.</p></article>
          <article class="card"><h3>Антифрод-защита</h3><p class="meta">Контроль передачи прямых контактов и логирование действий в системе.</p></article>
        </div>
      `;
      cta.parentElement.insertBefore(trust, cta);
    }
  }

  function renderBusinessLandingCases() {
    if (!isPath("/business/")) return;
    const casesGrid = document.querySelector(".cases-grid");
    if (!casesGrid) return;
    const cases = state.specialists
      .filter((specialist) => !["hidden", "blocked"].includes(specialist.status))
      .flatMap((specialist) =>
        (specialist.cases || []).map((caseItem) => ({
          ...caseItem,
          specialist
        }))
      )
      .slice(0, 6);
    if (!cases.length) return;
    casesGrid.innerHTML = cases
      .map((item) => {
        const platforms = item.specialist.platforms.slice(0, 3).join(" + ");
        return `
          <article class="card case-card">
            <div class="case-image" style="--media-photo: url('${item.specialist.avatar}')"></div>
            <strong>${item.title}</strong>
            <div class="meta">${item.specialist.specialization} • ${platforms}</div>
            <div class="kpi-line"><span>Рост</span><strong>${item.result1}</strong></div>
            <div class="kpi-line"><span>Бизнес-эффект</span><strong>${item.result2}</strong></div>
            <div class="kpi-line"><span>Срок</span><strong>${item.period}</strong></div>
            <div class="chips">
              <a class="chip" href="${specialistProfileUrl("../", item.specialist)}">Специалист</a>
              <a class="chip" href="../cases/index.html">Все кейсы</a>
            </div>
          </article>
        `;
      })
      .join("");
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

        const passwordInput = card.querySelector("input[type='password']");
        if (passwordInput && !card.querySelector("[data-password-strength]")) {
          const strength = document.createElement("div");
          strength.className = "password-strength";
          strength.setAttribute("data-password-strength", "1");
          strength.innerHTML = "<span></span><strong>Надежность пароля</strong>";
          passwordInput.closest(".field")?.appendChild(strength);
          passwordInput.addEventListener("input", () => {
            const value = passwordInput.value;
            const score = [
              value.length >= 6,
              /[A-ZА-Я]/.test(value),
              /\d/.test(value),
              /[^a-zA-Zа-яА-Я0-9]/.test(value)
            ].filter(Boolean).length;
            strength.dataset.level = String(score);
            strength.querySelector("strong").textContent =
              score >= 3 ? "Надежный пароль" : score >= 2 ? "Средний пароль" : "Слабый пароль";
          });
        }

        button.addEventListener("click", () => {
          button.disabled = true;
          const prevText = button.textContent;
          button.textContent = "Создаем аккаунт...";
          const inputs = card.querySelectorAll("input");
          const role = normalize(roleInput ? roleInput.value : "business");
          const name = inputs[1] ? inputs[1].value.trim() : "";
          const email = inputs[2] ? inputs[2].value.trim() : "";
          const password = inputs[3] ? inputs[3].value.trim() : "";
          const confirmPassword = card.querySelector("input[name='confirm_password']");
          const terms = card.querySelector("input[name='terms']");

          if (!name || !email || !password) {
            showToast("Заполните все поля", "error");
            button.disabled = false;
            button.textContent = prevText;
            return;
          }
          if (password.length < 6) {
            showToast("Пароль должен быть от 6 символов", "error");
            button.disabled = false;
            button.textContent = prevText;
            return;
          }
          if (confirmPassword && confirmPassword.value.trim() !== password) {
            showToast("Пароли не совпадают", "error");
            button.disabled = false;
            button.textContent = prevText;
            return;
          }
          if (terms && !terms.checked) {
            showToast("Подтвердите условия платформы", "error");
            button.disabled = false;
            button.textContent = prevText;
            return;
          }
          const exists = state.users.some((user) => normalize(user.email) === normalize(email));
          if (exists) {
            showToast("Email уже зарегистрирован", "error");
            button.disabled = false;
            button.textContent = prevText;
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
          }, 350);
        });
      }
    }

    if (isPath("/auth/login/")) {
      const card = document.querySelector(".auth-card");
      const button = card ? card.querySelector(".btn.btn-primary") : null;
      if (card && button) {
        button.addEventListener("click", () => {
          button.disabled = true;
          const prevText = button.textContent;
          button.textContent = "Входим...";
          const inputs = card.querySelectorAll("input");
          const email = inputs[0] ? inputs[0].value.trim() : "";
          const password = inputs[1] ? inputs[1].value.trim() : "";
          const user = state.users.find(
            (item) => normalize(item.email) === normalize(email) && verifyPassword(item, password)
          );
          if (!user) {
            showToast("Неверный email или пароль", "error");
            button.disabled = false;
            button.textContent = prevText;
            return;
          }
          if (user.blocked) {
            showToast("Аккаунт заблокирован", "error");
            button.disabled = false;
            button.textContent = prevText;
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
          }, 320);
        });
      }
    }

    if (isPath("/auth/forgot/")) {
      const card = document.querySelector(".auth-card");
      const button = card ? card.querySelector(".btn.btn-primary") : null;
      if (card && button) {
        button.addEventListener("click", () => {
          button.disabled = true;
          const prevText = button.textContent;
          button.textContent = "Отправляем...";
          const input = card.querySelector("input[type='email']");
          const email = input ? input.value.trim() : "";
          if (!email) {
            showToast("Введите email", "error");
            button.disabled = false;
            button.textContent = prevText;
            return;
          }
          showToast("Ссылка для восстановления отправлена");
          window.setTimeout(() => {
            button.disabled = false;
            button.textContent = prevText;
          }, 900);
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
          <h1>Профиль не найден</h1>
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

    root.innerHTML = `
      <article class="card profile-header">
        <div class="profile-avatar"></div>
        <div>
          <span class="pill">@${specialist.slug}</span>
          <h1>${specialist.name}</h1>
          <div class="meta">${specialist.city} • ${specialist.specialization}</div>
          <div class="verified">Верифицированный профиль</div>
          <p class="meta">${specialist.description}</p>
          <div class="chips">${specialist.skills.map((skill) => `<span class="chip">${skill}</span>`).join("")}</div>
        </div>
        <div>
          <div class="price">от ${formatMoneyByn(specialist.priceByn)} / мес</div>
          <div class="hero-buttons">
            <a class="btn btn-primary" href="${appUrl("dashboard/business/messages/index.html")}">Связаться</a>
            <button class="btn btn-ghost" type="button" data-report-specialist>Пожаловаться</button>
          </div>
        </div>
      </article>

      <article class="card">
        <h2>О специалисте</h2>
        <p class="meta">${specialist.about}</p>
      </article>

      <article class="card">
        <h2>Статистика</h2>
        <div class="metric-grid">
          <div class="metric"><strong>${specialist.stats.er}</strong><span class="meta">ER</span></div>
          <div class="metric"><strong>${specialist.stats.views}</strong><span class="meta">просмотры</span></div>
          <div class="metric"><strong>${specialist.stats.followersGrowth}</strong><span class="meta">рост аудитории</span></div>
          <div class="metric"><strong>${specialist.completedOrders}</strong><span class="meta">завершенных проектов</span></div>
          <div class="metric"><strong>${specialist.responseRate}%</strong><span class="meta">ответов</span></div>
        </div>
      </article>

      <article class="card">
        <h2>Кейсы</h2>
        <div class="cases-grid"></div>
      </article>

      <article class="card">
        <h2>Отзывы</h2>
        <div class="reviews"></div>
      </article>

      <article class="card">
        <h2>Соцсети и портфолио</h2>
        <div class="tabs">
          <a class="tab">Instagram</a>
          <a class="tab">TikTok</a>
          <a class="tab">Telegram</a>
          <a class="tab">Behance</a>
        </div>
      </article>
    `;

    const header = document.querySelector(".profile-header");
    if (header) {
      const avatar = header.querySelector(".profile-avatar");
      const h1 = header.querySelector("h1");
      const metas = header.querySelectorAll(".meta");
      const price = header.querySelector(".price");
      const chips = header.querySelector(".chips");
      const verification = verificationForSpecialist(specialist);
      const verificationText = verification
        ? verificationStatusLabel(verification.status)
        : specialist.verified
          ? "Верифицирован"
          : "Не верифицирован";
      if (h1) h1.textContent = specialist.name;
      if (avatar) avatar.style.setProperty("--media-photo", `url("${specialist.avatar}")`);
      if (metas[0]) {
        const ratingText =
          specialist.reviewsCount > 0
            ? `${specialist.rating.toFixed(1)} (${specialist.reviewsCount})`
            : "без оценок";
        metas[0].textContent = `${specialist.city} • ${specialist.specialization} • ${ratingText} • ${verificationText}`;
      }
      if (price) price.textContent = `от ${formatMoneyByn(specialist.priceByn)} / мес`;
      if (chips) {
        chips.innerHTML = specialist.skills.map((skill) => `<span class="chip">${skill}</span>`).join("");
        chips.innerHTML += `<span class="chip">${availabilityStatusLabel(specialist.availabilityStatus)}</span>`;
        chips.innerHTML += `<span class="chip">Заказов: ${specialist.completedOrders}</span>`;
        chips.innerHTML += `<span class="chip">Response: ${specialist.responseRate}%</span>`;
      }
    }

    const about = Array.from(document.querySelectorAll("article.card")).find((card) =>
      normalize(card.querySelector("h2")?.textContent).includes("about") ||
      normalize(card.querySelector("h2")?.textContent).includes("о специалист")
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
          casesGrid.innerHTML = '<div class="card"><p class="meta">Добавьте кейсы с результатами, чтобы усилить доверие бизнеса.</p></div>';
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
          reviewsWrap.innerHTML = '<div class="card"><p class="meta">У специалиста пока нет публичных отзывов, но вы можете оценить его кейсы и метрики.</p></div>';
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

    const socialCard = Array.from(document.querySelectorAll("article.card")).find((card) =>
      normalize(card.querySelector("h2")?.textContent).includes("соцсет")
    );
    if (socialCard) {
      const portfolioLinks = Array.isArray(specialist.portfolioLinks) ? specialist.portfolioLinks.filter(Boolean) : [];
      if (portfolioLinks.length) {
        const list = document.createElement("div");
        list.className = "chips";
        list.innerHTML = portfolioLinks
          .slice(0, 4)
          .map((link) => `<a class="chip" href="${link}" target="_blank" rel="noopener noreferrer">Портфолио</a>`)
          .join("");
        socialCard.appendChild(list);
      }
    }

    document.querySelectorAll("a.btn.btn-primary").forEach((button) => {
      if (!normalize(button.textContent).includes("связ")) return;
      button.href = appUrl("dashboard/business/messages/index.html");
      button.addEventListener("click", (event) => {
        const user = requireBusinessForAction();
        if (!user) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        const convo = ensureConversation(user.id, specialist.id);
        state.ui.selectedBusinessConversationId = convo.id;
        saveState();
        window.location.href = appUrl("dashboard/business/messages/index.html");
      });
    });

    const headerButtonsWrap = document.querySelector(".profile-header .hero-buttons");
    if (headerButtonsWrap && !headerButtonsWrap.querySelector("[data-invite-task]")) {
      const inviteBtn = document.createElement("a");
      inviteBtn.className = "btn btn-ghost";
      inviteBtn.href = appUrl("task/new/index.html");
      inviteBtn.textContent = "Пригласить в задачу";
      inviteBtn.setAttribute("data-invite-task", "1");
      inviteBtn.addEventListener("click", (event) => {
        const user = requireBusinessForAction();
        if (!user) {
          event.preventDefault();
          return;
        }
        state.ui.selectedSpecialistId = specialist.id;
        saveState();
      });
      headerButtonsWrap.appendChild(inviteBtn);
    }

    document.querySelectorAll("[data-report-specialist]").forEach((button) => {
      button.setAttribute("data-report-type", "specialist");
      button.setAttribute("data-report-id", specialist.id);
    });

  }

  function initVerificationPage() {
    if (!isPath("/verification/")) return;
    const main = document.querySelector("main.container.section");
    if (!main) return;

    const sessionUser = currentUser();
    const specialist =
      sessionUser && sessionUser.role === "specialist" && sessionUser.specialistId
        ? findSpecialistById(sessionUser.specialistId)
        : null;
    const existing = specialist ? verificationForSpecialist(specialist) : null;

    const card = document.createElement("article");
    card.className = "card";
    card.setAttribute("data-verification-widget", "1");
    card.innerHTML = `
      <h2>Заявка на верификацию</h2>
      <p class="meta">Заполните данные, чтобы получить бейдж Verified и повысить доверие клиентов.</p>
      <div class="panel-item">
        <strong>Текущий статус: ${existing ? verificationStatusLabel(existing.status) : specialist && specialist.verified ? "Верифицирован" : "Не отправлена"}</strong>
        <div class="meta">${
          existing
            ? `Тип: ${existing.statusType} • Обновлено: ${formatDate(existing.updatedAt)}${existing.notes ? ` • Комментарий: ${existing.notes}` : ""}`
            : "После отправки заявка попадет в модерацию."
        }</div>
      </div>
      <form class="grid-2 verification-form" data-verification-form>
        <div class="field"><label>ФИО</label><input name="fullName" required value="${existing ? escapeHtml(existing.fullName) : ""}"></div>
        <div class="field"><label>Страна</label><input name="country" required value="${existing ? escapeHtml(existing.country) : specialist ? escapeHtml(specialist.country) : ""}"></div>
        <div class="field"><label>Город</label><input name="city" required value="${existing ? escapeHtml(existing.city) : specialist ? escapeHtml(specialist.city) : ""}"></div>
        <div class="field"><label>Телефон</label><input name="phone" placeholder="+375..." value="${existing ? escapeHtml(existing.phone) : ""}"></div>
        <div class="field"><label>Email</label><input name="email" type="email" required value="${existing ? escapeHtml(existing.email) : sessionUser ? escapeHtml(sessionUser.email) : ""}"></div>
        <div class="field"><label>Тип</label><select name="statusType"><option value="individual">individual</option><option value="self-employed">self-employed</option><option value="company">company</option></select></div>
        <div class="field"><label>Портфолио</label><input name="portfolio" placeholder="https://..." value="${existing ? escapeHtml(existing.portfolio) : ""}"></div>
        <div class="field"><label>Соцсети</label><input name="socialLinks" placeholder="Instagram / Telegram / Behance" value="${existing ? escapeHtml(existing.socialLinks) : ""}"></div>
        <div class="field"><label>Документы / файлы</label><input name="attachments" type="file" multiple></div>
        <div class="field" style="grid-column: 1 / -1;">
          <label>Комментарий для модерации</label>
          <textarea name="notes" placeholder="Кратко опишите опыт и ссылки на кейсы">${existing ? escapeHtml(existing.notes) : ""}</textarea>
        </div>
        <div class="hero-buttons" style="grid-column: 1 / -1;">
          <button class="btn btn-primary" type="submit">Отправить на проверку</button>
          <a class="btn btn-ghost" href="${appUrl("dashboard/specialist/settings/index.html")}">Профиль специалиста</a>
        </div>
      </form>
    `;
    main.appendChild(card);

    const form = card.querySelector("[data-verification-form]");
    if (!(form instanceof HTMLFormElement)) return;
    if (existing && form.elements.statusType) form.elements.statusType.value = existing.statusType || "individual";

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const user = requireSpecialistForAction();
      if (!user) return;
      const currentSpecialist = user.specialistId ? findSpecialistById(user.specialistId) : null;
      if (!currentSpecialist) {
        showToast("Профиль специалиста не найден", "error");
        return;
      }

      const fullName = String(form.elements.fullName.value || "").trim();
      const country = String(form.elements.country.value || "").trim();
      const city = String(form.elements.city.value || "").trim();
      const email = String(form.elements.email.value || "").trim();
      if (!fullName || !country || !city || !email) {
        showToast("Заполните обязательные поля", "error");
        return;
      }

      const next = {
        id: existing ? existing.id : uid("ver"),
        userId: user.id,
        specialistId: currentSpecialist.id,
        fullName,
        country,
        city,
        phone: String(form.elements.phone.value || "").trim(),
        email,
        portfolio: String(form.elements.portfolio.value || "").trim(),
        socialLinks: String(form.elements.socialLinks.value || "").trim(),
        attachments:
          form.elements.attachments && form.elements.attachments.files
            ? Array.from(form.elements.attachments.files).map((file) => file.name)
            : existing && Array.isArray(existing.attachments)
              ? existing.attachments
              : [],
        statusType: String(form.elements.statusType.value || "individual"),
        status: "pending",
        notes: String(form.elements.notes.value || "").trim(),
        createdAt: existing ? existing.createdAt : nowIso(),
        updatedAt: nowIso()
      };

      const idx = state.verifications.findIndex((item) => item.id === next.id);
      if (idx >= 0) state.verifications[idx] = next;
      else state.verifications.unshift(next);
      currentSpecialist.verified = false;
      currentSpecialist.country = country;
      currentSpecialist.city = city;
      logEvent("verification_submitted", "verification", next.id, `${currentSpecialist.name}`, user.id);
      saveState();
      showToast("Заявка отправлена на модерацию");
      window.setTimeout(() => {
        window.location.reload();
      }, 260);
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
      cards[0].querySelector("strong").textContent = "87%";
      cards[1].querySelector("strong").textContent = "1.8 мин";
      cards[2].querySelector("strong").textContent = "5";
      panel.innerHTML =
        '<article class="panel-item"><strong>Создайте бриф для точного подбора</strong><div class="meta">AI Match сопоставит нишу, бюджет, площадки и кейсы специалистов, а затем покажет причины каждого совпадения.</div><div class="chips"><a class="chip" href="../../task/new/index.html">Создать задачу</a></div></article>';
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
      if (title) title.textContent = "Результат аудита";
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
      button.disabled = true;
      const originalText = button.textContent;
      button.textContent = "Анализируем...";
      const items = [
        {
          title: "Оценка профиля: 72/100",
          text: `Профиль @${account} в нише «${niche}»: сильный визуал, но оффер и путь к заявке можно сделать яснее.`
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

      window.setTimeout(() => {
        state.ai.lastAudit = { username: account, niche, items, createdAt: nowIso() };
        saveState();
        renderAudit(state.ai.lastAudit);
        button.disabled = false;
        button.textContent = originalText;
        showToast("Аудит готов");
      }, 900);
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

  function dealsForBusinessUser(businessUserId) {
    return state.deals.filter((deal) => deal.businessUserId === businessUserId);
  }

  function paymentsForSpecialist(specialistId) {
    const taskIds = tasksForSpecialist(specialistId).map((task) => task.id);
    return state.payments.filter((payment) => taskIds.includes(payment.taskId));
  }

  function dealsForSpecialist(specialistId) {
    return state.deals.filter((deal) => deal.specialistId === specialistId);
  }

  function conversationsForBusinessUser(businessUserId) {
    return state.conversations.filter((item) => item.businessUserId === businessUserId);
  }

  function conversationsForSpecialist(specialistId) {
    return state.conversations.filter((item) => item.specialistId === specialistId);
  }

  function notificationsForUser(user) {
    if (!user) return [];
    return state.notifications.filter((item) => {
      if (item.audience === "all") return true;
      if (item.audience === "user" && item.userId === user.id) return true;
      if (item.audience === user.role) return true;
      return false;
    });
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
        tableBody.innerHTML = "<tr><td colspan='4' class='meta'>Создайте первую задачу, чтобы получить отклики специалистов.</td></tr>";
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

    const notifications = notificationsForUser(user).slice(0, 2);
    if (notifications.length && latestMessagesCard) {
      notifications.forEach((item) => {
        const p = document.createElement("p");
        p.className = "meta";
        p.textContent = `Уведомление: ${item.title}`;
        latestMessagesCard.appendChild(p);
      });
    }

    const dashPanels = document.querySelector(".dash-panels");
    if (dashPanels && !dashPanels.querySelector("[data-activity-feed]")) {
      const feed = document.createElement("article");
      feed.className = "card";
      feed.setAttribute("data-activity-feed", "1");
      const latestDeals = dealsForBusinessUser(user.id).slice(0, 3);
      feed.innerHTML = `
        <h2>Активность</h2>
        <div class="panel-list">
          ${tasks.slice(0, 3).map((task) => `<div class="panel-item"><strong>${taskStatusLabel(task.status)}</strong><div class="meta">${task.title} • ${formatMoneyByn(task.budgetByn || 0)}</div></div>`).join("")}
          ${latestDeals.map((deal) => `<div class="panel-item"><strong>${dealStatusLabel(deal.status)}</strong><div class="meta">Сделка ${formatMoneyByn(deal.grossAmount)} • комиссия ${formatMoneyByn(deal.platformFee)}</div></div>`).join("")}
        </div>
      `;
      dashPanels.appendChild(feed);
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
      tbody.innerHTML = "<tr><td colspan='5' class='meta'>Создайте первую задачу, и она появится в этом разделе.</td></tr>";
      return;
    }
    tbody.innerHTML = tasks
      .map((task) => {
        const topResponses = (task.responses || [])
          .slice()
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((response) => {
            const specialist = findSpecialistById(response.specialistId);
            const attachments = Array.isArray(response.attachments) && response.attachments.length
              ? ` • вложения: ${response.attachments.slice(0, 2).join(", ")}`
              : "";
            return `<div class="meta">${specialist ? specialist.name : "Специалист"} • ${response.score}% • ${formatMoneyByn(response.priceByn)} • ${response.deadlineDays} дн.${attachments}</div>`;
          })
          .join("");
        return `
          <tr>
            <td>
              ${task.title}
              ${
                !task.assignedSpecialistId && (task.responses || []).length
                  ? `<div class="chips"><button class="chip" type="button" data-accept-best-response="${task.id}">Принять лучшего отклик</button></div>`
                  : ""
              }
              ${topResponses || "<div class='meta'>AI Match уже подобрал задачу; отклики специалистов будут собраны здесь.</div>"}
            </td>
            <td>${task.niche}</td>
            <td>${formatMoneyByn(task.budgetByn || 0)}</td>
            <td>${task.responses.length}</td>
            <td><span class="status">${taskStatusLabel(task.status)}</span></td>
          </tr>
        `;
      })
      .join("");

    tbody.onclick = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest("[data-accept-best-response]");
      if (!button) return;
      const taskId = button.getAttribute("data-accept-best-response");
      const task = state.tasks.find((item) => item.id === taskId && item.businessUserId === user.id);
      if (!task) return;
      const best = (task.responses || [])
        .filter((item) => item.status !== "rejected" && item.status !== "cancelled")
        .slice()
        .sort((a, b) => b.score - a.score)[0];
      if (!best) return;
      best.status = "accepted";
      task.assignedSpecialistId = best.specialistId;
      task.status = "in_progress";
      const deal = ensureDealForAcceptedResponse(task, best);
      if (deal) {
        const convo = ensureConversation(user.id, best.specialistId);
        createSystemMessage(convo.id, "Заказчик принял отклик. Создана безопасная сделка.");
      }
      logEvent("response_accepted", "response", best.id, task.title, user.id);
      saveState();
      renderBusinessTasks();
      showToast("Отклик принят. Перейдите в раздел платежей для оплаты сделки.");
    };
  }

  function renderBusinessFavorites() {
    if (!isPath("/dashboard/business/favorites/")) return;
    const user = requireLoggedInBusiness(true);
    if (!user) return;
    const favorites = state.favoritesByUser[user.id] || [];
    const list = document.querySelector(".panel-list");
    if (!list) return;
    if (!favorites.length) {
      list.innerHTML = '<div class="panel-item"><div class="meta">Добавьте специалистов в избранное для быстрого доступа.</div></div>';
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
    const deals = dealsForBusinessUser(user.id);
    const tbody = document.querySelector(".table tbody");
    if (!tbody) return;
    if (!deals.length) {
      tbody.innerHTML = "<tr><td colspan='4' class='meta'>Примите отклик в разделе задач, чтобы открыть безопасную сделку.</td></tr>";
      return;
    }
    tbody.innerHTML = deals
      .map((deal) => {
        const task = state.tasks.find((item) => item.id === deal.taskId);
        const specialist = findSpecialistById(deal.specialistId);
        const holdUntilText = deal.heldUntil ? new Date(deal.heldUntil).toLocaleString("ru-RU") : "—";
        const timelinePreview = (deal.timeline || [])
          .slice(0, 2)
          .map((item) => `${item.status}: ${item.text}`)
          .join(" • ");
        return `
          <tr>
            <td>
              ${task ? task.title : "Проект"}
              <div class="meta">${specialist ? specialist.name : "Исполнитель"} • комиссия 10% (${formatMoneyByn(deal.platformFee)}) • доработки ${deal.revisionUsed}/${deal.revisionLimit}</div>
              ${timelinePreview ? `<div class="meta">${timelinePreview}</div>` : ""}
            </td>
            <td>${formatMoneyByn(deal.grossAmount)}</td>
            <td><span class="status ${deal.status === "disputed" ? "warn" : ""}">${dealStatusLabel(deal.status)}</span><div class="meta">Hold до: ${holdUntilText}</div></td>
            <td>
              <div class="chips">
                ${deal.status === "unpaid" ? `<button class="chip" type="button" data-deal-action="pay" data-deal-id="${deal.id}">Оплатить</button>` : ""}
                ${deal.status === "paid" ? `<button class="chip" type="button" data-deal-action="hold" data-deal-id="${deal.id}">Перевести в hold</button>` : ""}
                ${deal.status === "held" ? `<button class="chip" type="button" data-deal-action="revision" data-deal-id="${deal.id}">Запросить доработку</button>` : ""}
                ${deal.status === "held" ? `<button class="chip" type="button" data-deal-action="release" data-deal-id="${deal.id}">Подтвердить и выпустить</button>` : ""}
                ${["held", "paid"].includes(deal.status) ? `<button class="chip" type="button" data-deal-action="dispute" data-deal-id="${deal.id}">Открыть спор</button>` : ""}
                ${deal.status === "disputed" ? `<button class="chip" type="button" data-deal-action="refund" data-deal-id="${deal.id}">Запросить возврат</button>` : ""}
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    tbody.onclick = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const actionNode = target.closest("[data-deal-action]");
      if (!actionNode) return;
      const action = actionNode.getAttribute("data-deal-action");
      const dealId = actionNode.getAttribute("data-deal-id");
      const deal = state.deals.find((item) => item.id === dealId && item.businessUserId === user.id);
      if (!deal) return;
      const task = state.tasks.find((item) => item.id === deal.taskId);
      const specialist = findSpecialistById(deal.specialistId);
      const convo = specialist && task ? ensureConversation(user.id, specialist.id) : null;

      if (action === "pay") {
        deal.status = "paid";
        deal.paidAt = nowIso();
        addDealTimeline(deal, "paid", "Заказчик оплатил сделку.");
        if (convo) createSystemMessage(convo.id, "Проект оплачен. Средства готовы к холду.");
        showToast("Платеж проведен");
      } else if (action === "hold") {
        deal.status = "held";
        deal.heldUntil = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        addDealTimeline(deal, "held", "Средства переведены в hold до приемки.");
        if (convo) createSystemMessage(convo.id, "Средства в холде. Можно отправлять работу.");
        showToast("Средства переведены в hold");
      } else if (action === "release") {
        deal.status = "released";
        deal.releasedAt = nowIso();
        addDealTimeline(deal, "released", "Заказчик принял работу. Выплата выпущена.");
        if (task) task.status = "completed";
        if (convo) createSystemMessage(convo.id, "Работа принята. Выплата выпущена исполнителю.");
        showToast("Выплата выпущена");
      } else if (action === "revision") {
        if (deal.revisionUsed >= deal.revisionLimit) {
          showToast("Лимит бесплатных доработок исчерпан. Можно открыть спор.", "error");
          return;
        }
        const note = window.prompt("Опишите правки для доработки");
        if (!note || !note.trim()) return;
        deal.revisionUsed += 1;
        if (task) {
          task.status = "revision_requested";
          task.revisionCount = Number(task.revisionCount || 0) + 1;
        }
        addDealTimeline(deal, "revision_requested", note.trim());
        if (convo) createSystemMessage(convo.id, `Запрошена доработка: ${note.trim()}`);
        showToast("Доработка отправлена исполнителю");
      } else if (action === "dispute") {
        const reason = window.prompt("Причина спора");
        if (!reason || !reason.trim()) return;
        const description = window.prompt("Подробное описание ситуации", "") || "";
        const desiredResolution =
          window.prompt("Желаемое решение: resolved_refund / resolved_release / resolved_partial", "resolved_partial") ||
          "resolved_partial";
        const attachmentsRaw = window.prompt("Ссылки на доказательства (через запятую)", "") || "";
        const attachments = attachmentsRaw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        deal.status = "disputed";
        deal.disputedAt = nowIso();
        addDealTimeline(deal, "disputed", reason.trim());
        if (task) task.status = "dispute_opened";
        state.disputes.unshift({
          id: uid("dispute"),
          dealId: deal.id,
          taskId: deal.taskId,
          businessUserId: user.id,
          specialistId: deal.specialistId,
          status: "opened",
          reason: reason.trim(),
          description: description.trim(),
          desiredResolution: ["resolved_refund", "resolved_release", "resolved_partial"].includes(desiredResolution.trim())
            ? desiredResolution.trim()
            : "resolved_partial",
          attachments,
          adminComment: "",
          timeline: [{ id: uid("dt"), status: "opened", text: reason.trim(), ts: nowIso() }],
          createdAt: nowIso(),
          updatedAt: nowIso()
        });
        state.complaints.unshift({
          id: uid("complaint"),
          reporterUserId: user.id,
          targetType: "task",
          targetId: deal.taskId,
          reason: `Спор по сделке: ${reason.trim()}`,
          status: "new",
          adminComment: "",
          createdAt: nowIso()
        });
        if (convo) createSystemMessage(convo.id, "Открыт спор. Средства заморожены до решения арбитража.");
        showToast("Спор открыт");
      } else if (action === "refund") {
        deal.status = "refunded";
        addDealTimeline(deal, "refunded", "Заказчик запросил возврат средств.");
        if (task) task.status = "cancelled";
        const dispute = state.disputes.find((item) => item.dealId === deal.id && ["opened", "under_review"].includes(item.status));
        if (dispute) {
          dispute.status = "resolved_refund";
          dispute.updatedAt = nowIso();
          dispute.timeline.unshift({ id: uid("dt"), status: "resolved_refund", text: "Возврат подтвержден заказчиком.", ts: nowIso() });
        }
        if (convo) createSystemMessage(convo.id, "Запрошен возврат. Сделка переведена в статус refund.");
        showToast("Статус сделки: возврат");
      }

      recalculateWallets();
      logEvent("deal_action", "deal", deal.id, action || "unknown", user.id);
      saveState();
      renderBusinessPayments();
    };

    const infoCard = document.querySelector(".dash-panels > article.card:nth-child(2)");
    if (infoCard) {
      const disputes = state.disputes.filter((item) => item.businessUserId === user.id).slice(0, 4);
      const disputesHtml = disputes.length
        ? disputes
            .map(
              (item) =>
                `<div class="panel-item"><strong>${disputeStatusLabel(item.status)}</strong><div class="meta">${item.reason || "Без причины"} • ${formatDate(item.createdAt)}</div></div>`
            )
            .join("")
        : "<div class='panel-item'><div class='meta'>Открытых споров нет. Все сделки идут по плану.</div></div>";
      infoCard.innerHTML = `<h2>Споры и арбитраж</h2><div class="panel-list">${disputesHtml}</div><a class="btn btn-ghost" href="${appUrl("safety/index.html")}">Подробнее о безопасной сделке</a>`;
    }
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
        : '<div class="panel-item"><div class="meta">Оставьте первый отзыв после завершения сделки со специалистом.</div></div>';
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
        return `
          <div class="chat-msg ${mine ? "mine" : ""}">
            <div>${escapeHtml(message.text)}</div>
            <div class="chat-meta">${new Date(message.ts || nowIso()).toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        `;
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
      chatCard.innerHTML = "<h2>Чат со специалистами</h2><p class='meta'>Выберите специалиста в каталоге или примите отклик, чтобы начать переписку.</p>";
      listCard.innerHTML = "<h2>Диалоги</h2><p class='meta'>Контакты с выбранными специалистами будут собраны здесь.</p>";
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
      markConversationRead(selected, "business");
      saveState();
      const selectedSpecialist = findSpecialistById(selected.specialistId);
      chatCard.innerHTML = `
        <h2>Чат: ${selectedSpecialist ? selectedSpecialist.name : "Специалист"}</h2>
        <div class="chat">${renderConversationMessages(selected, "business")}</div>
        <form class="field" data-chat-form>
          <label>Новое сообщение</label>
          <textarea placeholder="Напишите сообщение"></textarea>
          <div class="meta">Контакты и ссылки на мессенджеры скрываются до завершения сделки.</div>
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
              const unread = unreadCountForRole(convo, "business");
              return `
                <div class="panel-item" data-conversation-id="${convo.id}" style="${
                  convo.id === selectedId ? "border-color: rgba(183,170,255,0.45);" : ""
                }">
                  <strong>${specialist ? specialist.name : "Специалист"}</strong>
                  <div class="meta">${last ? escapeHtml(last.text) : "Нет сообщений"}</div>
                  ${unread ? `<div class="meta">Непрочитано: ${unread}</div>` : ""}
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
          if (!sendMessageWithSafety(selected.id, "business", text)) return;
          if (textArea) textArea.value = "";
          simulateTypingReply(selected.id, "business");
          render();
          window.setTimeout(render, 1300);
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

  function verificationForSpecialist(specialist) {
    if (!specialist) return null;
    const bySpecialist = state.verifications.find((item) => item.specialistId && item.specialistId === specialist.id);
    if (bySpecialist) return bySpecialist;
    if (specialist.userId) {
      return state.verifications.find((item) => item.userId && item.userId === specialist.userId) || null;
    }
    return null;
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
        : "<tr><td colspan='4' class='meta'>Опубликуйте отклик на задачу, чтобы отследить статус проекта.</td></tr>";
    }

    const panels = document.querySelectorAll(".dash-panels > article.card");
    const financePanel = panels[2];
    if (financePanel && user) {
      const notifications = notificationsForUser(user).slice(0, 2);
      notifications.forEach((item) => {
        const node = document.createElement("p");
        node.className = "meta";
        node.textContent = `Уведомление: ${item.title}`;
        financePanel.appendChild(node);
      });
    }

    const dashPanels = document.querySelector(".dash-panels");
    if (dashPanels && !dashPanels.querySelector("[data-specialist-activity]")) {
      const activity = document.createElement("article");
      activity.className = "card";
      activity.setAttribute("data-specialist-activity", "1");
      activity.innerHTML = `
        <h2>Рабочая лента</h2>
        <div class="panel-list">
          <div class="panel-item"><strong>Профиль</strong><div class="meta">${specialist.responseRate}% ответов • ${specialist.responseTimeHours} ч среднее время ответа</div></div>
          <div class="panel-item"><strong>Кейсы</strong><div class="meta">${specialist.cases.length} опубликованных кейсов • ${specialist.completedOrders} завершенных проектов</div></div>
          <div class="panel-item"><strong>Новые задачи</strong><div class="meta">${incoming.length} релевантных брифов доступны для отклика</div></div>
        </div>
      `;
      dashPanels.appendChild(activity);
    }
  }

  function renderSpecialistProjects() {
    if (!isPath("/dashboard/specialist/projects/")) return;
    const specialist = currentSpecialistForSession();
    if (!specialist) return;
    const user = requireSpecialistForAction();
    if (!user) return;
    const tbody = document.querySelector(".table tbody");
    if (!tbody) return;
    const tasks = tasksForSpecialist(specialist.id);
    const incoming = incomingTasksForSpecialist(specialist.id);
    const available = state.tasks.filter(
      (task) => task.status === "published" && !task.assignedSpecialistId && !task.hidden
    );
    const rows = tasks
      .map((task) => `
        <tr>
          <td>${task.title}</td>
          <td>${specialist.specialization}</td>
          <td>${formatDate(task.createdAt)}</td>
          <td>
            <span class="status">${taskStatusLabel(task.status)}</span>
            ${
              task.status === "in_progress"
                ? `<div class="chips"><button class="chip" type="button" data-specialist-submit-work="${task.id}">Отправить работу</button></div>`
                : ""
            }
          </td>
        </tr>
      `)
      .concat(
        available.map((task) => {
          const response = (task.responses || []).find((item) => item.specialistId === specialist.id);
          const score = response ? `${response.score}%` : "—";
          return `
            <tr>
              <td>${task.title}<div class="meta">${task.category} • бюджет ${formatMoneyByn(task.budgetByn || 0)}</div></td>
              <td>${response ? `Отклик (${score})` : "Новая задача"}</td>
              <td>${task.deadline ? formatDate(task.deadline) : "—"}</td>
              <td>
                <span class="status ${response ? "" : "warn"}">${response ? responseStatusLabel(response.status) : "Доступна"}</span>
                <div class="chips">
                  <button class="chip" type="button" data-specialist-respond="${task.id}">${response ? "Обновить отклик" : "Откликнуться"}</button>
                </div>
              </td>
            </tr>
          `;
        })
      );
    tbody.innerHTML = rows.length
      ? rows.join("")
      : "<tr><td colspan='4' class='meta'>Опубликуйте отклик на задачу, чтобы увидеть статус в этом разделе.</td></tr>";

    tbody.onclick = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const btn = target.closest("[data-specialist-respond]");
      const submitWorkBtn = target.closest("[data-specialist-submit-work]");
      if (submitWorkBtn) {
        const taskId = submitWorkBtn.getAttribute("data-specialist-submit-work");
        const task = state.tasks.find((item) => item.id === taskId && item.assignedSpecialistId === specialist.id);
        if (!task) return;
        task.status = "work_submitted";
        const businessUserId = task.businessUserId || null;
        if (businessUserId) {
          const convo = ensureConversation(businessUserId, specialist.id);
          createSystemMessage(convo.id, "Исполнитель отправил работу на проверку.");
        }
        const deal = findDealByTaskId(task.id);
        if (deal) addDealTimeline(deal, "work_submitted", "Работа отправлена заказчику.");
        logEvent("work_submitted", "task", task.id, specialist.name, user.id);
        saveState();
        renderSpecialistProjects();
        showToast("Работа отправлена на проверку");
        return;
      }
      if (!btn) return;
      const taskId = btn.getAttribute("data-specialist-respond");
      const task = state.tasks.find((item) => item.id === taskId && item.status === "published");
      if (!task) return;
      const prev = (task.responses || []).find((item) => item.specialistId === specialist.id);
      const priceRaw = window.prompt("Ваша цена (BYN)", String(prev ? prev.priceByn : specialist.priceByn || task.budgetByn || 0));
      const deadlineRaw = window.prompt("Срок выполнения (дней)", String(prev ? prev.deadlineDays : 14));
      const messageRaw = window.prompt("Сообщение заказчику", prev ? prev.message : "Готов(а) подключиться к задаче и предложить план запуска.");
      const attachmentsRaw = window.prompt("Ссылки/вложения (через запятую)", prev && prev.attachments ? prev.attachments.join(", ") : "");
      const price = Math.max(0, Number(priceRaw || 0));
      const deadlineDays = Math.max(1, Number(deadlineRaw || 14));
      const message = String(messageRaw || "").trim();
      const attachments = String(attachmentsRaw || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (!price || !message) {
        showToast("Укажите цену и сообщение", "error");
        return;
      }
      const scoreMeta = computeMatchAnalysis(specialist, task);
      if (prev) {
        prev.priceByn = price;
        prev.deadlineDays = deadlineDays;
        prev.message = message;
        prev.attachments = attachments;
        prev.score = scoreMeta.score;
        prev.reasons = scoreMeta.reasons;
        prev.strongestAreas = scoreMeta.strongestAreas;
        prev.estimatedCostByn = price;
        prev.status = "new";
        prev.createdAt = nowIso();
      } else {
        task.responses = Array.isArray(task.responses) ? task.responses : [];
        task.responses.unshift({
          id: uid("resp"),
          specialistId: specialist.id,
          score: scoreMeta.score,
          reasons: scoreMeta.reasons,
          strongestAreas: scoreMeta.strongestAreas,
          estimatedCostByn: price,
          message,
          priceByn: price,
          deadlineDays,
          attachments,
          status: "new",
          createdAt: nowIso()
        });
      }
      logEvent("response_created", "task", task.id, `${specialist.name}: ${formatMoneyByn(price)}`, user.id);
      saveState();
      renderSpecialistProjects();
      showToast(prev ? "Отклик обновлен" : "Отклик отправлен");
    };
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
      chatCard.innerHTML = "<h2>Чаты с клиентами</h2><p class='meta'>Диалоги с заказчиками будут собраны здесь после принятия отклика.</p>";
      listCard.innerHTML = "<h2>Диалоги</h2><p class='meta'>Откликнитесь на подходящую задачу, чтобы открыть коммуникацию с клиентом.</p>";
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
      markConversationRead(selected, "specialist");
      saveState();
      const user = findUserById(selected.businessUserId);
      chatCard.innerHTML = `
        <h2>Чат: ${user ? user.name : "Клиент"}</h2>
        <div class="chat">${renderConversationMessages(selected, "specialist")}</div>
        <form class="field" data-chat-form>
          <label>Новое сообщение</label>
          <textarea placeholder="Напишите сообщение"></textarea>
          <div class="meta">Контакты и ссылки на мессенджеры скрываются до завершения сделки.</div>
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
              const unread = unreadCountForRole(convo, "specialist");
              return `
                <div class="panel-item" data-conversation-id="${convo.id}" style="${
                  convo.id === selectedId ? "border-color: rgba(183,170,255,0.45);" : ""
                }">
                  <strong>${business ? business.name : "Бизнес"}</strong>
                  <div class="meta">${last ? escapeHtml(last.text) : "Нет сообщений"}</div>
                  ${unread ? `<div class="meta">Непрочитано: ${unread}</div>` : ""}
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
          if (!sendMessageWithSafety(selected.id, "specialist", text)) return;
          if (textArea) textArea.value = "";
          simulateTypingReply(selected.id, "specialist");
          render();
          window.setTimeout(render, 1300);
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
        casesGrid.innerHTML = '<div class="card"><p class="meta">Добавьте кейсы с результатами, чтобы усилить доверие бизнеса.</p></div>';
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
    recalculateWallets();
    const user = currentUser();
    const wallet = user ? ensureWallet(user.id) : null;
    const deals = dealsForSpecialist(specialist.id);
    const available = wallet ? wallet.available : 0;
    const pending = wallet ? wallet.pending : 0;
    const held = wallet ? wallet.held : 0;
    const turnover = deals.reduce((sum, deal) => sum + Number(deal.grossAmount || 0), 0);

    const boxes = document.querySelectorAll(".stats-strip .stat-box strong");
    if (boxes.length >= 4) {
      boxes[0].textContent = formatMoneyByn(turnover);
      boxes[1].textContent = formatMoneyByn(available);
      boxes[2].textContent = "10%";
      boxes[3].textContent = formatMoneyByn(held);
    }

    const panels = document.querySelector(".dash-panels");
    if (panels && !panels.querySelector("[data-specialist-finance-history]")) {
      const historyCard = document.createElement("article");
      historyCard.className = "card";
      historyCard.setAttribute("data-specialist-finance-history", "1");
      panels.appendChild(historyCard);
    }
    const historyCard = document.querySelector("[data-specialist-finance-history]");
    if (historyCard) {
      const activeFilter = state.ui.specialistFinanceFilter || "all";
      const withdrawalsRaw = user ? state.withdrawals.filter((item) => item.userId === user.id).slice(0, 20) : [];
      const withdrawals = activeFilter === "all" ? withdrawalsRaw : withdrawalsRaw.filter((item) => item.status === activeFilter);
      const dealsTimeline = deals.slice(0, 6);
      historyCard.innerHTML = `
        <h2>Кошелек и операции</h2>
        <div class="meta">Held: ${formatMoneyByn(held)} • Pending: ${formatMoneyByn(pending)} • Available: ${formatMoneyByn(available)}</div>
        <div class="chips">
          <button class="chip ${activeFilter === "all" ? "active" : ""}" type="button" data-fin-filter="all">Все</button>
          <button class="chip ${activeFilter === "requested" ? "active" : ""}" type="button" data-fin-filter="requested">requested</button>
          <button class="chip ${activeFilter === "processing" ? "active" : ""}" type="button" data-fin-filter="processing">processing</button>
          <button class="chip ${activeFilter === "completed" ? "active" : ""}" type="button" data-fin-filter="completed">completed</button>
          <button class="chip ${activeFilter === "rejected" ? "active" : ""}" type="button" data-fin-filter="rejected">rejected</button>
          <button class="chip" type="button" data-fin-export>Экспорт истории</button>
        </div>
        <table class="table">
          <thead><tr><th>Операция</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr></thead>
          <tbody>
            ${
              withdrawals.length
                ? withdrawals
                    .map(
                      (item) =>
                        `<tr><td>Вывод (${item.method})</td><td>${formatMoneyByn(item.amount)}</td><td>${withdrawalStatusLabel(item.status)}</td><td>${formatDate(item.createdAt)}</td></tr>`
                    )
                    .join("")
                : "<tr><td colspan='4' class='meta'>История выводов появится после первой заявки на выплату.</td></tr>"
            }
          </tbody>
        </table>
        <h3>Таймлайн сделок</h3>
        <div class="panel-list">
          ${
            dealsTimeline.length
              ? dealsTimeline
                  .map((deal) => {
                    const task = state.tasks.find((item) => item.id === deal.taskId);
                    const timelineTop = (deal.timeline || [])[0];
                    return `<div class="panel-item"><strong>${task ? task.title : "Сделка"} • ${dealStatusLabel(deal.status)}</strong><div class="meta">${timelineTop ? timelineTop.text : "Статус обновляется"} • ${formatMoneyByn(deal.specialistNet || 0)}</div></div>`;
                  })
                  .join("")
              : "<div class='panel-item'><div class='meta'>Примите отклик, чтобы запустить оплату и hold средств.</div></div>"
          }
        </div>
      `;
      historyCard.onclick = async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const filterBtn = target.closest("[data-fin-filter]");
        if (filterBtn) {
          state.ui.specialistFinanceFilter = filterBtn.getAttribute("data-fin-filter") || "all";
          saveState();
          renderSpecialistFinance();
          return;
        }
        const exportBtn = target.closest("[data-fin-export]");
        if (exportBtn) {
          const text = withdrawalsRaw
            .map((item) => `${formatDate(item.createdAt)} • ${formatMoneyByn(item.amount)} • ${withdrawalStatusLabel(item.status)} • ${item.method}`)
            .join("\n");
          try {
            await navigator.clipboard.writeText(text || "История пуста");
            showToast("История скопирована");
          } catch (error) {
            showToast("Не удалось скопировать", "error");
          }
        }
      };
    }

    const button = document.querySelector(".dash-panels .btn.btn-primary");
    if (button) {
      button.onclick = () => {
        if (!requireSpecialistForAction()) return;
        if (available <= 0) {
          showToast("Нет доступных средств к выводу", "error");
          return;
        }
        const amountRaw = window.prompt("Сумма вывода (BYN)", String(Math.floor(available)));
        const amount = Number(amountRaw || 0);
        if (!amount || amount <= 0 || amount > available) {
          showToast("Некорректная сумма вывода", "error");
          return;
        }
        const method = window.prompt("Способ вывода (card / iban / crypto)", "card") || "card";
        const requisites = window.prompt("Реквизиты для вывода", "") || "";
        state.withdrawals.unshift({
          id: uid("wd"),
          userId: user ? user.id : null,
          amount,
          method,
          requisites,
          status: "requested",
          createdAt: nowIso(),
          updatedAt: nowIso()
        });
        logEvent("withdrawal_requested", "withdrawal", state.withdrawals[0].id, `${amount} BYN`, user ? user.id : null);
        saveState();
        renderSpecialistFinance();
        showToast(`Запрос на вывод ${formatMoneyByn(amount)} отправлен`);
      };
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
          : `<div class="empty-state">Пользователей еще нет. Регистрация откроет первые профили здесь.</div>`;
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
          : `<div class="empty-state">Сейчас нет открытых задач под этот фильтр. Проверьте другой статус или обновите профиль.</div>`;
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
                  ${["draft", "pending_moderation", "published", "in_progress", "work_submitted", "revision_requested", "dispute_opened", "completed", "cancelled", "rejected", "archived"]
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
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">Откликов пока нет. Проверьте опубликованные задачи и активность специалистов.</div></td></tr>`;
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
      const verificationQueue = state.verifications.filter((item) => item.status === "pending");
      const disputesQueue = state.disputes.filter((item) => ["opened", "under_review"].includes(item.status));
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

      verificationQueue.forEach((item) => {
        const specialist = byId(state.specialists, item.specialistId);
        rows.push(`
          <article class="panel-item">
            <strong>Верификация: ${specialist ? specialist.name : item.fullName}</strong>
            <div class="meta">${item.statusType} • ${item.country}, ${item.city} • ${item.email}</div>
            <div class="meta">${item.notes ? escapeHtml(item.notes) : "Комментарий не добавлен"}</div>
            <div class="chips">
              <button class="chip" type="button" data-mod-approve-verification="${item.id}">Одобрить</button>
              <button class="chip" type="button" data-mod-rework-verification="${item.id}">На доработку</button>
              <button class="chip" type="button" data-mod-reject-verification="${item.id}">Отклонить</button>
            </div>
          </article>
        `);
      });

      disputesQueue.forEach((item) => {
        const task = byId(state.tasks, item.taskId);
        rows.push(`
          <article class="panel-item">
            <strong>Спор: ${task ? task.title : item.taskId}</strong>
            <div class="meta">${disputeStatusLabel(item.status)} • ${item.reason || "Без причины"}</div>
            <div class="chips">
              <button class="chip" type="button" data-mod-dispute-review="${item.id}">В review</button>
              <button class="chip" type="button" data-mod-dispute-release="${item.id}">Решить: выплата</button>
              <button class="chip" type="button" data-mod-dispute-refund="${item.id}">Решить: возврат</button>
              <button class="chip" type="button" data-mod-dispute-partial="${item.id}">Решить: частично</button>
              <button class="chip" type="button" data-mod-dispute-reject="${item.id}">Отклонить</button>
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
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">Новых жалоб нет. Качество взаимодействия остается стабильным.</div></td></tr>`;
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
      const deals = state.deals.slice();
      const withdrawals = state.withdrawals.slice();
      const turnover = deals.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0);
      const platformIncome = deals.reduce((sum, item) => sum + Number(item.platformFee || 0), 0);
      const avgCheck = deals.length ? Math.round(turnover / deals.length) : 0;
      financeKpis.innerHTML = `
        <div class="stat-box"><strong>${formatMoneyByn(turnover)}</strong><span class="meta">оборот</span></div>
        <div class="stat-box"><strong>${formatMoneyByn(platformIncome)}</strong><span class="meta">доход платформы</span></div>
        <div class="stat-box"><strong>${formatMoneyByn(avgCheck)}</strong><span class="meta">средний чек</span></div>
        <div class="stat-box"><strong>${deals.length}</strong><span class="meta">сделок</span></div>
      `;

      const filteredDeals =
        local.financeFilter === "all" ? deals : deals.filter((item) => item.status === local.financeFilter);
      const filteredWithdrawals =
        local.financeFilter === "all"
          ? withdrawals
          : withdrawals.filter((item) => item.status === local.financeFilter);
      const dealRows = filteredDeals.map((item) => {
        const task = byId(state.tasks, item.taskId);
        return `<tr><td>${task ? task.title : "Сделка"}</td><td>${formatMoneyByn(item.grossAmount)}</td><td>${formatMoneyByn(item.platformFee)}</td><td>${dealStatusLabel(item.status)}</td><td>${formatDate(item.createdAt || nowIso())}</td></tr>`;
      });
      const withdrawalRows = filteredWithdrawals.map((item) => {
        const user = byId(state.users, item.userId);
        return `<tr><td>Вывод средств (${user ? user.email : "специалист"})</td><td>${formatMoneyByn(item.amount)}</td><td>—</td><td>${withdrawalStatusLabel(item.status)}</td><td>${formatDate(item.createdAt || nowIso())}</td></tr>`;
      });
      const rows = dealRows.concat(withdrawalRows);
      tbody.innerHTML = rows.length
        ? rows.join("")
        : `<tr><td colspan="5"><div class="empty-state">Операции не найдены.</div></td></tr>`;
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
        list.innerHTML = `<div class="empty-state">Отправьте первое уведомление пользователям из этой панели.</div>`;
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
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Логи действий начнут заполняться после операций в системе.</div></td></tr>`;
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
        if (editBtn) {
          const nextName = window.prompt("Имя специалиста", specialist.name) || specialist.name;
          const nextSpecialization = window.prompt("Специализация", specialist.specialization) || specialist.specialization;
          const nextCity = window.prompt("Город", specialist.city) || specialist.city;
          const nextPrice = window.prompt("Стоимость (BYN)", String(specialist.priceByn || 0)) || String(specialist.priceByn || 0);
          specialist.name = nextName.trim() || specialist.name;
          specialist.specialization = nextSpecialization.trim() || specialist.specialization;
          specialist.city = nextCity.trim() || specialist.city;
          specialist.priceByn = Math.max(0, Number(nextPrice) || specialist.priceByn || 0);
          specialist.slug = normalizeForSlug(specialist.name);
          logEvent("specialist_updated", "specialist", specialist.id, specialist.name, adminUser.id);
          saveState();
          rerenderAll();
          showToast("Специалист обновлен");
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
          const deal = ensureDealForAcceptedResponse(pair.task, pair.response);
          if (deal && pair.task.businessUserId && pair.task.assignedSpecialistId) {
            const convo = ensureConversation(pair.task.businessUserId, pair.task.assignedSpecialistId);
            createSystemMessage(convo.id, "Отклик принят. Создана безопасная сделка.");
          }
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

        const approveVerification = target.closest("[data-mod-approve-verification]");
        if (approveVerification) {
          const id = approveVerification.getAttribute("data-mod-approve-verification");
          const verification = byId(state.verifications, id);
          if (!verification) return;
          verification.status = "verified";
          verification.notes = verification.notes || "Проверено администратором";
          verification.updatedAt = nowIso();
          const specialist = verification.specialistId ? byId(state.specialists, verification.specialistId) : null;
          if (specialist) specialist.verified = true;
          addModerationRecord("verification", verification.id, "approved");
          logEvent("verification_approved", "verification", verification.id, specialist ? specialist.name : "", adminUser.id);
          saveState();
          rerenderAll();
          showToast("Верификация подтверждена");
          return;
        }

        const reworkVerification = target.closest("[data-mod-rework-verification]");
        if (reworkVerification) {
          const id = reworkVerification.getAttribute("data-mod-rework-verification");
          const verification = byId(state.verifications, id);
          if (!verification) return;
          const reason = window.prompt("Комментарий для доработки", "Добавьте больше подтверждающих данных");
          verification.status = "pending";
          verification.notes = reason || verification.notes;
          verification.updatedAt = nowIso();
          addModerationRecord("verification", verification.id, "rework", reason || "");
          logEvent("verification_rework", "verification", verification.id, reason || "", adminUser.id);
          saveState();
          rerenderAll();
          showToast("Комментарий отправлен");
          return;
        }

        const rejectVerification = target.closest("[data-mod-reject-verification]");
        if (rejectVerification) {
          const id = rejectVerification.getAttribute("data-mod-reject-verification");
          const verification = byId(state.verifications, id);
          if (!verification) return;
          const reason = window.prompt("Причина отклонения", "Недостаточно подтверждающих данных");
          verification.status = "rejected";
          verification.notes = reason || verification.notes;
          verification.updatedAt = nowIso();
          const specialist = verification.specialistId ? byId(state.specialists, verification.specialistId) : null;
          if (specialist) specialist.verified = false;
          addModerationRecord("verification", verification.id, "rejected", reason || "");
          logEvent("verification_rejected", "verification", verification.id, reason || "", adminUser.id);
          saveState();
          rerenderAll();
          showToast("Верификация отклонена");
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

        const disputeReview = target.closest("[data-mod-dispute-review]");
        const disputeRelease = target.closest("[data-mod-dispute-release]");
        const disputeRefund = target.closest("[data-mod-dispute-refund]");
        const disputePartial = target.closest("[data-mod-dispute-partial]");
        const disputeReject = target.closest("[data-mod-dispute-reject]");
        const disputeId =
          (disputeReview && disputeReview.getAttribute("data-mod-dispute-review")) ||
          (disputeRelease && disputeRelease.getAttribute("data-mod-dispute-release")) ||
          (disputeRefund && disputeRefund.getAttribute("data-mod-dispute-refund")) ||
          (disputePartial && disputePartial.getAttribute("data-mod-dispute-partial")) ||
          (disputeReject && disputeReject.getAttribute("data-mod-dispute-reject")) ||
          "";
        if (disputeId) {
          const dispute = byId(state.disputes, disputeId);
          if (!dispute) return;
          const deal = byId(state.deals, dispute.dealId);
          if (disputeReview) dispute.status = "under_review";
          if (disputeRelease) dispute.status = "resolved_release";
          if (disputeRefund) dispute.status = "resolved_refund";
          if (disputePartial) dispute.status = "resolved_partial";
          if (disputeReject) dispute.status = "rejected";
          dispute.updatedAt = nowIso();
          dispute.timeline.unshift({
            id: uid("dt"),
            status: dispute.status,
            text: `Обновлено администратором: ${disputeStatusLabel(dispute.status)}`,
            ts: nowIso()
          });
          if (deal) {
            if (dispute.status === "resolved_release") deal.status = "released";
            if (dispute.status === "resolved_refund") deal.status = "refunded";
            if (dispute.status === "resolved_partial") deal.status = "released";
            if (dispute.status === "resolved_release" || dispute.status === "resolved_partial") {
              deal.releasedAt = nowIso();
            }
            addDealTimeline(deal, dispute.status, `Решение спора: ${disputeStatusLabel(dispute.status)}`);
          }
          const task = dispute.taskId ? byId(state.tasks, dispute.taskId) : null;
          if (task) {
            if (dispute.status === "resolved_refund") task.status = "cancelled";
            if (["resolved_release", "resolved_partial"].includes(dispute.status)) task.status = "completed";
          }
          logEvent("dispute_status_changed", "dispute", dispute.id, dispute.status, adminUser.id);
          recalculateWallets();
          saveState();
          rerenderAll();
          showToast(`Спор: ${disputeStatusLabel(dispute.status)}`);
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
          primaryColor: "#7b6cff",
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

  function initGlobalTheme() {
    if (!document.body || document.body.classList.contains("smm-home")) return;

    const controls = [];
    const addControl = (parent, className, label) => {
      if (!parent || parent.querySelector(`[data-theme-toggle="${className}"]`)) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `theme-toggle ${className}`;
      button.dataset.themeToggle = className;
      button.setAttribute("aria-label", label);
      button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42"/><circle cx="12" cy="12" r="4"/></svg>';
      if (className === "mobile-theme-toggle") button.append("Тема");
      parent.prepend(button);
      controls.push(button);
    };

    addControl(document.querySelector(".topbar .actions"), "topbar-theme-toggle", "Включить тёмную тему");
    addControl(document.querySelector(".mobile-nav"), "mobile-theme-toggle", "Включить тёмную тему");

    const applyTheme = (theme) => {
      document.body.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      const isDark = theme === "dark";
      controls.forEach((button) => {
        button.setAttribute("aria-pressed", String(isDark));
        button.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
      });
    };

    let savedTheme = null;
    try {
      savedTheme = window.localStorage.getItem("smmatch-theme");
    } catch {
      // Theme preference is optional when browser storage is unavailable.
    }
    applyTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : "dark");

    controls.forEach((button) => {
      button.addEventListener("click", () => {
        const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        try {
          window.localStorage.setItem("smmatch-theme", nextTheme);
        } catch {
          // The interface stays usable even if storage is blocked.
        }
      });
    });
  }

  function initMobileFab() {
    const user = currentUser();
    if (!user) return;
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    if (!isPath("/dashboard/business/")) return;
    if (document.querySelector("[data-mobile-fab]")) return;
    const fab = document.createElement("a");
    fab.href = appUrl("task/new/index.html");
    fab.className = "mobile-fab";
    fab.setAttribute("data-mobile-fab", "1");
    fab.setAttribute("aria-label", "Создать задачу");
    fab.textContent = "+ Задача";
    document.body.appendChild(fab);
  }

  if (!enforceSessionAndRole()) return;
  initGlobalRoiNavLink();
  initBrandLogos();
  syncProfileLinks();
  initUnifiedNavigation();
  initTopbarActionsByRole();
  initGlobalTheme();
  initGlobalSiteSettings();
  ensureGlobalFooter();
  initActionGuardsForLinks();
  initGlobalComplaintActions();
  initMobileMenu();
  initLandingRoleFlow();
  renderHomeMarketplaceSections();
  renderBusinessLandingCases();
  initFilterOptionToggle();
  initRoiCalculator();
  initRoiCalculatorPage();
  initAuthPages();
  initSpecialistsPage();
  initCasesPage();
  initTaskCreatePage();
  renderProfilePage();
  initVerificationPage();
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
  initResponsiveTableObserver();
  initMobileFab();
  initQuickActions();
  initPageHeroVisuals();
  initPagePosters();
  initCardVisualBoost();
  initMediaBlockVariations();
  initGlobalAnimations();
})();
