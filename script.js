const shadow = document.querySelector(".cursor-shadow");
const revealItems = document.querySelectorAll(".reveal");
const heroVisual = document.querySelector(".hero-visual");
const caseDialog = document.querySelector("#case-dialog");
const caseVisual = document.querySelector("#case-visual");
const caseType = document.querySelector("#case-type");
const caseTitle = document.querySelector("#case-title");
const caseSummary = document.querySelector("#case-summary");
const caseMetrics = document.querySelector("#case-metrics");
const caseList = document.querySelector("#case-list");
const caseProjectLink = document.querySelector("#case-project-link");
const caseContactLink = document.querySelector("#case-contact-link");
const caseCloseButtons = document.querySelectorAll(".case-close, .case-secondary-close");
const workFilters = document.querySelectorAll(".work-filter[data-filter]");
const workItems = document.querySelectorAll(".work-item[data-category]");
const workCount = document.querySelector("#work-count");
const scrollProgress = document.querySelector(".scroll-progress");
const tiltItems = document.querySelectorAll("[data-tilt]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const caseData = {
  "lead-radar": {
    type: "AI-агент · Telegram · CRM",
    title: "Lead Radar",
    summary:
      "Прототип AI-агента, который мониторит Telegram-источники, отделяет реальные запросы от шума, оценивает лиды и передаёт их менеджеру или в CRM.",
    metrics: [
      ["87%", "точность демонстрационного фильтра"],
      ["4 шага", "поиск, оценка, экспорт, CRM"],
    ],
    list: [
      "Мониторинг выбранных каналов и групп",
      "AI-классификация намерения и приоритета",
      "Дедупликация и исключение нерелевантных сообщений",
      "Экспорт в Excel или создание сделки в CRM",
    ],
    visual: "iframe",
    projectUrl: "projects/lead-radar/",
    projectLabel: "Открыть Lead Radar",
  },
  "bitrix-hub": {
    type: "Bitrix24 · REST API · интеграция",
    title: "CRM Integration Hub",
    summary:
      "Демонстрационный центр управления воронками, смарт-процессами, вебхуками и двусторонним обменом между Bitrix24 и внешней учётной системой.",
    metrics: [
      ["3", "смарт-процесса"],
      ["REST", "двусторонний обмен"],
    ],
    list: [
      "Воронки и обязательные поля по стадиям",
      "Смарт-процессы, роли и связи с CRM",
      "Входящие вебхуки и исходящие обработчики",
      "Журнал синхронизации и ошибок",
    ],
    visual: "iframe",
    projectUrl: "projects/bitrix-hub/",
    projectLabel: "Открыть CRM Hub",
  },
  "whatsapp-flow": {
    type: "Laravel · WhatsApp Business API",
    title: "Renewal Flow",
    summary:
      "Прототип модуля для ручных и автоматических напоминаний о продлении: сегменты клиентов, шаблоны, расписание, статусы доставки и отписки.",
    metrics: [
      ["90/30/7", "дней до напоминания"],
      ["Webhook", "статусы доставки"],
    ],
    list: [
      "Фильтрация клиентов по сроку услуги",
      "Ручные и автоматические кампании",
      "Шаблоны сообщений с переменными",
      "Лимиты, тихие часы и обработка отписок",
    ],
    visual: "iframe",
    projectUrl: "projects/whatsapp-flow/",
    projectLabel: "Открыть Renewal Flow",
  },
  "commerce-ai": {
    type: "OpenAI API · WooCommerce · Cron",
    title: "Commerce AI",
    summary:
      "Демонстрационный AI-модуль для генерации товарных описаний в фоне: очередь задач, системный Cron, повторные попытки и журнал публикаций.",
    metrics: [
      ["Cron", "фоновая обработка"],
      ["Retry", "повтор при сбое API"],
    ],
    list: [
      "Генерация описаний и SEO-полей",
      "Очередь без перегрузки WordPress",
      "Лимиты, повторные попытки и логирование",
      "Публикация результата в WooCommerce",
    ],
    visual: "iframe",
    projectUrl: "projects/commerce-ai/",
    projectLabel: "Открыть Commerce AI",
  },
  roofing: {
    type: "Лендинг · локальные услуги",
    title: "Сайт для кровельной компании",
    summary:
      "Посетитель сразу видит услугу, географию работы, выгоды и понятную кнопку расчёта стоимости. Страница собрана для заявок из рекламы и социальных сетей.",
    metrics: [
      ["Desktop + mobile", "адаптивная версия"],
      ["2 CTA", "звонок и Telegram"],
    ],
    list: [
      "Оффер и ключевые выгоды на первом экране",
      "Блоки услуг, этапов работы и доверия",
      "Быстрая связь без длинной формы",
      "Базовая SEO-подготовка страницы",
    ],
    visual: "image",
    image: "assets/roofing-landing-hero.jpg",
    alt: "Первый экран лендинга кровельной компании",
    projectUrl: "https://xn----8sbebb7beezgo4b1c0g.xn--p1ai/",
    projectLabel: "Открыть живой сайт",
  },
  "ai-video": {
    type: "AI-видео · короткий контент",
    title: "Серия вертикальных роликов",
    summary:
      "Подготовка героев, кадров и монтажных заготовок для Reels, Shorts и TikTok в едином визуальном стиле.",
    metrics: [
      ["9:16", "формат для соцсетей"],
      ["Сериями", "единый стиль контента"],
    ],
    list: [
      "Генерация персонажей и предметных сцен",
      "Обложки и стартовые кадры роликов",
      "Подготовка материала под монтаж",
      "Адаптация идеи под короткий формат",
    ],
    visual: "image",
    image: "assets/portfolio-page-4.png",
    alt: "Примеры AI-видео и короткого контента",
  },
  visuals: {
    type: "Дизайн · визуальные материалы",
    title: "Баннеры и презентации",
    summary:
      "Набор визуалов, который помогает быстро упаковать предложение для рекламы, соцсетей, рассылки или презентации клиенту.",
    metrics: [
      ["1 стиль", "единая подача"],
      ["Любой формат", "соцсети и PDF"],
    ],
    list: [
      "Рекламные баннеры и обложки",
      "Презентации и коммерческие предложения",
      "Адаптация под разные размеры",
      "AI-визуалы под задачу бренда",
    ],
    visual: "image",
    image: "assets/portfolio-page-5.png",
    alt: "Примеры баннеров и презентаций",
  },
  "visual-poster": {
    type: "Афиша · социальные сети",
    title: "Постер мероприятия",
    summary:
      "Вертикальная афиша в фирменной оранжево-бежевой стилистике: крупная типографика, портрет героя, акценты на дате, времени и месте.",
    metrics: [
      ["4:5", "формат для публикаций"],
      ["Mobile", "читается с телефона"],
    ],
    list: [
      "Композиция под быстрый просмотр в ленте",
      "Выделение имени, даты и времени",
      "Обработка и отделение героя от фона",
      "Подготовка к публикации в социальных сетях",
    ],
    visual: "image",
    image: "assets/visual-poster.png",
    alt: "Оранжево-белая афиша мероприятия",
  },
  "photo-banner": {
    type: "Фотобаннер · типографика",
    title: "Вертикальный баннер",
    summary:
      "Постерная композиция на основе фотографии с необычной оптикой и крупной типографикой. Формат подходит для анонса, события или рекламной публикации.",
    metrics: [
      ["9:16", "вертикальный формат"],
      ["Photo", "визуал вокруг одного кадра"],
    ],
    list: [
      "Подбор и обработка исходного изображения",
      "Типографическая композиция поверх фотографии",
      "Акценты на названии, времени и адресе",
      "Подготовка версии для сторис и вертикальной рекламы",
    ],
    visual: "image",
    image: "assets/banner.jpg",
    alt: "Фотобаннер с круговой пейзажной композицией",
  },
  "site-pack": {
    type: "Лендинги · упаковка услуг",
    title: "Сайты для быстрого запуска",
    summary:
      "Лендинги для локального бизнеса, экспертов и небольших предложений. Структура строится вокруг оффера, доверия и одного понятного действия.",
    metrics: [
      ["от 2 000 ₽", "простой первый запуск"],
      ["Desktop + mobile", "адаптивная версия"],
    ],
    list: [
      "Первый экран с ясным предложением",
      "Блоки услуг, преимуществ и контактов",
      "Кнопки звонка, Telegram или формы заявки",
      "Публикация страницы и базовая SEO-настройка",
    ],
    visual: "image",
    image: "assets/site-pack-preview.png",
    alt: "Подборка лендингов для бизнеса и экспертов",
    projectUrl: "https://xn----8sbebb7beezgo4b1c0g.xn--p1ai/",
    projectLabel: "Открыть живой лендинг",
  },
  "lawyer-crm": {
    type: "CRM · рабочий проект",
    title: "Legato CRM для юриста",
    summary:
      "Опубликованная CRM с клиентами, делами, календарём и настройками. Интерфейс работает в браузере, сохраняет изменения и доступен по отдельной ссылке.",
    metrics: [
      ["4 раздела", "клиенты, дела, календарь"],
      ["localStorage", "данные сохраняются"],
    ],
    list: [
      "Добавление, удаление и поиск клиентов",
      "Статусы дел и живые счётчики",
      "Рабочий календарь с событиями",
      "Адаптивная версия для телефона",
    ],
    visual: "image",
    image: "assets/crm-lawyer-preview.png",
    alt: "Интерфейс CRM-системы для юриста",
    projectUrl: "https://wm669vjvr2-ui.github.io/legato-crm/",
    projectLabel: "Открыть рабочую CRM",
  },
  "expense-bot": {
    type: "Telegram-бот · рабочий проект",
    title: "Учёт расходов без таблиц",
    summary:
      "Настоящий Telegram-бот на aiogram и SQLite: понимает сообщения вроде «кофе 300», предлагает категорию и сохраняет операцию. По ссылке открывается рабочая web-версия той же логики.",
    metrics: [
      ["Aiogram 3", "логика Telegram-бота"],
      ["SQLite + Stars", "база и оплата"],
    ],
    list: [
      "Разбор сумм цифрами и словами",
      "Свои категории и сохранение расходов",
      "Статистика за день, месяц и всё время",
      "Отмена последней записи и подписка",
    ],
    visual: "iframe",
    projectUrl: "projects/expenses/",
    projectLabel: "Открыть рабочую web-версию",
  },
  "lead-flow": {
    type: "Автоматизация · серверный проект",
    title: "Заявки: форма → API → SQLite",
    summary:
      "Рабочая автоматизация на отдельном серверном API. Форма отправляет данные, сервер проверяет поля, создаёт номер заявки и сохраняет запись в SQLite. Публичный журнал получает уже замаскированный контакт.",
    metrics: [
      ["POST API", "настоящая серверная обработка"],
      ["SQLite", "заявки сохраняются в базе"],
    ],
    list: [
      "Проверка и нормализация входящих данных",
      "Уникальный номер для каждой заявки",
      "Публичный журнал с защитой личных данных",
      "Ограничение частоты и хранение до 30 дней",
    ],
    visual: "iframe",
    projectUrl: "projects/lead-flow/",
    projectLabel: "Открыть автоматизацию",
  },
};

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let shadowX = mouseX;
let shadowY = mouseY;
let lastMouseX = mouseX;
let lastMouseY = mouseY;
let cursorEnergy = 0;

function animateShadow() {
  if (!shadow || prefersReducedMotion.matches) return;

  const dx = mouseX - lastMouseX;
  const dy = mouseY - lastMouseY;
  const speed = Math.min(Math.hypot(dx, dy), 90);

  cursorEnergy += (speed / 90 - cursorEnergy) * 0.12;
  shadowX += (mouseX - shadowX) * 0.075;
  shadowY += (mouseY - shadowY) * 0.075;

  shadow.style.left = `${shadowX}px`;
  shadow.style.top = `${shadowY}px`;
  shadow.style.setProperty("--cursor-size", `${460 + cursorEnergy * 180}px`);
  shadow.style.setProperty("--cursor-saturation", `${1.12 + cursorEnergy * 0.45}`);

  lastMouseX = mouseX;
  lastMouseY = mouseY;
  requestAnimationFrame(animateShadow);
}

window.addEventListener("pointermove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

window.addEventListener("pointerleave", () => {
  if (shadow) shadow.style.opacity = "0";
});

window.addEventListener("pointerenter", () => {
  if (shadow) shadow.style.opacity = "0.85";
});

function updateScrollProgress() {
  if (!scrollProgress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  scrollProgress.style.setProperty("--scroll-progress", progress.toFixed(4));
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

if (!prefersReducedMotion.matches) {
  tiltItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      item.style.setProperty("--tilt-x", `${y * -2.2}deg`);
      item.style.setProperty("--tilt-y", `${x * 2.8}deg`);
    });

    item.addEventListener("pointerleave", () => {
      item.style.setProperty("--tilt-x", "0deg");
      item.style.setProperty("--tilt-y", "0deg");
    });
  });
}

if (heroVisual) {
  heroVisual.addEventListener("pointermove", (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroVisual.style.transform = `rotateX(${y * -4}deg) rotateY(${x * 5}deg)`;
  });

  heroVisual.addEventListener("pointerleave", () => {
    heroVisual.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

const ticker = document.querySelector(".ticker");
if (ticker) {
  ticker.innerHTML += ticker.innerHTML;
}

function formatWorkCount(count) {
  if (count === 1) return "1 работа";
  if (count > 1 && count < 5) return `${count} работы`;
  return `${count} работ`;
}

workFilters.forEach((filterButton) => {
  filterButton.addEventListener("click", () => {
    const selectedFilter = filterButton.dataset.filter;
    let visibleCount = 0;

    workFilters.forEach((button) => {
      const isActive = button === filterButton;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    workItems.forEach((item) => {
      const isVisible = selectedFilter === "all" || item.dataset.category === selectedFilter;
      item.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (workCount) workCount.textContent = formatWorkCount(visibleCount);
  });
});

function renderCaseVisual(item) {
  if (item.visual === "iframe") {
    return `<div class="case-live-frame"><iframe src="${item.projectUrl}" title="Рабочая версия проекта ${item.title}" loading="lazy"></iframe></div>`;
  }

  return `<div class="case-image-frame"><img src="${item.image}" alt="${item.alt}" /></div>`;
}

let lastCaseTrigger = null;

function openCase(caseId, trigger) {
  const item = caseData[caseId];
  if (!item || !caseDialog) return;

  lastCaseTrigger = trigger;
  caseType.textContent = item.type;
  caseTitle.textContent = item.title;
  caseSummary.textContent = item.summary;
  caseMetrics.innerHTML = item.metrics
    .map(([value, label]) => `<div class="case-metric"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
  caseList.innerHTML = item.list.map((text) => `<li>${text}</li>`).join("");
  caseVisual.innerHTML = renderCaseVisual(item);
  caseProjectLink.hidden = !item.projectUrl;
  caseProjectLink.href = item.projectUrl || "#";
  caseProjectLink.textContent = item.projectLabel || "Открыть проект";
  caseContactLink.classList.toggle("button-solid", !item.projectUrl);
  caseContactLink.classList.toggle("button-outline", Boolean(item.projectUrl));
  document.body.classList.add("case-open");
  caseDialog.showModal();
  caseDialog.querySelector(".case-close").focus();
}

function closeCase() {
  if (!caseDialog?.open) return;
  caseDialog.close();
}

document.querySelectorAll(".work-item[data-case]").forEach((button) => {
  button.addEventListener("click", () => openCase(button.dataset.case, button));
});

caseCloseButtons.forEach((button) => button.addEventListener("click", closeCase));

caseDialog?.addEventListener("click", (event) => {
  if (event.target === caseDialog) closeCase();
});

caseDialog?.addEventListener("close", () => {
  document.body.classList.remove("case-open");
  lastCaseTrigger?.focus();
});

if (!prefersReducedMotion.matches) animateShadow();
