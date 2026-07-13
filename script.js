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
const caseCloseButtons = document.querySelectorAll(".case-close, .case-secondary-close");

const caseData = {
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
  "lawyer-crm": {
    type: "CRM · юридические услуги",
    title: "Система для работы юриста",
    summary:
      "Единое рабочее пространство для клиентов, дел, документов, задач и ближайших сроков. Нужная информация находится без переписок и разрозненных таблиц.",
    metrics: [
      ["1 база", "клиенты и дела"],
      ["Сроки", "задачи и напоминания"],
    ],
    list: [
      "Карточка клиента и история обращения",
      "Статусы дел и ответственные задачи",
      "Хранение ссылок на документы",
      "Фильтры по срокам и этапам работы",
    ],
    visual: "image",
    image: "assets/crm-lawyer-preview.png",
    alt: "Интерфейс CRM-системы для юриста",
  },
  "lead-automation": {
    type: "Автоматизация · заявки",
    title: "Заявка обрабатывается сама",
    summary:
      "Демонстрация простой связки: форма принимает контакт, система записывает клиента в CRM, отправляет уведомление менеджеру и подтверждает обращение клиенту.",
    metrics: [
      ["4 шага", "в одном сценарии"],
      ["Без копирования", "данные переносятся сами"],
    ],
    list: [
      "Приём заявки с сайта или формы",
      "Создание карточки клиента в CRM",
      "Уведомление менеджера в Telegram",
      "Автоматический ответ клиенту",
    ],
    visual: "automation",
  },
  "site-pack": {
    type: "Сайты · упаковка услуг",
    title: "Лендинги и мини-сайты",
    summary:
      "Несколько направлений для экспертов, локального бизнеса и небольших услуг: от одной продающей страницы до компактного сайта с несколькими разделами.",
    metrics: [
      ["От 1 страницы", "быстрый запуск"],
      ["7–10 тыс.", "стоимость лендинга"],
    ],
    list: [
      "Структура предложения и тексты",
      "Дизайн под нишу и аудиторию",
      "Адаптация под телефон",
      "Кнопки связи и базовые анимации",
    ],
    visual: "image",
    image: "assets/site-pack-preview.png",
    alt: "Примеры лендингов и мини-сайтов",
  },
  "support-bot": {
    type: "Telegram-бот · демо-сценарий",
    title: "Техподдержка без ожидания",
    summary:
      "Бот отвечает на типовые вопросы, проверяет статус заказа и передаёт сложный диалог оператору вместе с историей переписки.",
    metrics: [
      ["24/7", "первый ответ клиенту"],
      ["1 клик", "передача оператору"],
    ],
    list: [
      "Ответы на частые вопросы",
      "Проверка заказа по номеру",
      "Сбор контакта и причины обращения",
      "Передача диалога живому сотруднику",
    ],
    visual: "support",
  },
  "sales-crm": {
    type: "Мини-CRM · демо-интерфейс",
    title: "Учёт заявок для небольшой команды",
    summary:
      "Простой экран без перегруженных настроек: новые обращения, текущая работа и оплаченные заказы видны в одной воронке.",
    metrics: [
      ["3 статуса", "понятная воронка"],
      ["1 экран", "все активные заявки"],
    ],
    list: [
      "Карточки клиентов и услуг",
      "Сумма, источник и следующий контакт",
      "Перетаскивание по этапам воронки",
      "Напоминания о забытых заявках",
    ],
    visual: "crm",
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
  shadow.style.opacity = "0";
});

window.addEventListener("pointerenter", () => {
  shadow.style.opacity = "0.85";
});

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

function renderCaseVisual(item) {
  if (item.visual === "automation") {
    return `
      <div class="case-demo automation-demo">
        <div class="demo-toolbar">
          <strong>Новая заявка #184</strong>
          <span data-demo-status>готово к запуску</span>
        </div>
        <div class="flow-demo">
          <div class="flow-node" data-flow-node><small>Шаг 1</small><strong>Форма сайта</strong></div>
          <div class="flow-node" data-flow-node><small>Шаг 2</small><strong>Карточка в CRM</strong></div>
          <div class="flow-node" data-flow-node><small>Шаг 3</small><strong>Telegram менеджеру</strong></div>
          <div class="flow-node" data-flow-node><small>Шаг 4</small><strong>Ответ клиенту</strong></div>
        </div>
        <div class="demo-console">
          <p data-demo-log>Сценарий готов принять новую заявку.</p>
          <button class="demo-run" type="button" data-run-automation>Запустить демо</button>
        </div>
      </div>`;
  }

  if (item.visual === "support") {
    return `
      <div class="case-demo support-demo">
        <div class="support-header">
          <strong>Поддержка магазина</strong>
          <span>онлайн</span>
        </div>
        <div class="support-chat">
          <div class="support-message">Здравствуйте! Когда будет готов заказ №184?</div>
          <div class="support-message bot">Заказ №184 уже готов. Его можно забрать сегодня до 20:00.</div>
          <div class="support-message">Можно поменять адрес доставки?</div>
          <div class="support-message bot pending" data-bot-reply>Передаю вопрос оператору. Он уже видит номер заказа и всю переписку.</div>
        </div>
        <div class="support-compose">
          <span>Сложный вопрос клиента</span>
          <button class="demo-run" type="button" data-run-bot>Показать ответ</button>
        </div>
      </div>`;
  }

  if (item.visual === "crm") {
    return `
      <div class="case-demo crm-demo">
        <div class="crm-demo-header"><strong>CRM · входящие заявки</strong><span>+ новая заявка</span></div>
        <div class="crm-dashboard">
          <div class="crm-kpis">
            <div><strong>18</strong><span>новых обращений</span></div>
            <div><strong>7</strong><span>сейчас в работе</span></div>
            <div><strong>4</strong><span>оплачено за неделю</span></div>
          </div>
          <div class="crm-pipeline">
            <div class="crm-column"><b>НОВЫЕ · 3</b><div class="crm-lead">Анна · Лендинг<span>Instagram · 09:40</span></div><div class="crm-lead">Роман · Бот<span>Telegram · 10:15</span></div></div>
            <div class="crm-column"><b>В РАБОТЕ · 2</b><div class="crm-lead">Игорь · Автоматизация<span>Смета отправлена</span></div><div class="crm-lead">Мария · Визуалы<span>Созвон сегодня</span></div></div>
            <div class="crm-column"><b>ОПЛАЧЕНО · 2</b><div class="crm-lead">Roof Pro · Сайт<span>Запуск 16 июля</span></div><div class="crm-lead">Алексей · Презентация<span>Готово</span></div></div>
          </div>
        </div>
      </div>`;
  }

  return `<div class="case-image-frame"><img src="${item.image}" alt="${item.alt}" /></div>`;
}

let lastCaseTrigger = null;
let demoTimers = [];

function clearDemoTimers() {
  demoTimers.forEach((timer) => window.clearTimeout(timer));
  demoTimers = [];
}

function openCase(caseId, trigger) {
  const item = caseData[caseId];
  if (!item || !caseDialog) return;

  clearDemoTimers();
  lastCaseTrigger = trigger;
  caseType.textContent = item.type;
  caseTitle.textContent = item.title;
  caseSummary.textContent = item.summary;
  caseMetrics.innerHTML = item.metrics
    .map(([value, label]) => `<div class="case-metric"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
  caseList.innerHTML = item.list.map((text) => `<li>${text}</li>`).join("");
  caseVisual.innerHTML = renderCaseVisual(item);
  document.body.classList.add("case-open");
  caseDialog.showModal();
  caseDialog.querySelector(".case-close").focus();
}

function closeCase() {
  if (!caseDialog?.open) return;
  clearDemoTimers();
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

caseVisual?.addEventListener("click", (event) => {
  const automationButton = event.target.closest("[data-run-automation]");
  if (automationButton) {
    const nodes = [...caseVisual.querySelectorAll("[data-flow-node]")];
    const status = caseVisual.querySelector("[data-demo-status]");
    const log = caseVisual.querySelector("[data-demo-log]");
    const messages = [
      "Заявка получена с сайта.",
      "Карточка клиента создана в CRM.",
      "Менеджер получил уведомление в Telegram.",
      "Клиенту отправлено подтверждение. Сценарий завершён.",
    ];

    clearDemoTimers();
    nodes.forEach((node) => node.classList.remove("is-complete"));
    automationButton.disabled = true;
    automationButton.textContent = "Выполняется...";
    status.textContent = "обработка";

    nodes.forEach((node, index) => {
      demoTimers.push(
        window.setTimeout(() => {
          node.classList.add("is-complete");
          log.textContent = messages[index];

          if (index === nodes.length - 1) {
            status.textContent = "выполнено";
            automationButton.disabled = false;
            automationButton.textContent = "Запустить ещё раз";
          }
        }, 480 * (index + 1))
      );
    });
  }

  const botButton = event.target.closest("[data-run-bot]");
  if (botButton) {
    caseVisual.querySelector("[data-bot-reply]")?.classList.add("is-visible");
    botButton.textContent = "Ответ показан";
    botButton.disabled = true;
  }
});

animateShadow();
