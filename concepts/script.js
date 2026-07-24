const views = document.querySelectorAll("[data-view]");
const switchButtons = document.querySelectorAll("[data-switch]");
const painButtons = document.querySelectorAll("[data-pain]");
const solutionCard = document.querySelector(".solution-card");

const concepts = new Set(["clear", "studio", "route"]);

const solutions = {
  offer: {
    number: "01",
    pain: "Клиент не понимает, чем вы отличаетесь и что делать дальше.",
    title: "Лендинг с ясным оффером",
    text: "Соберём предложение вокруг боли клиента, покажем выгоды и приведём к одному понятному действию.",
    outcome: "Понятное предложение + адаптивная страница + кнопка заявки",
    price: "от 2 000 ₽",
  },
  leads: {
    number: "02",
    pain: "Заявка пришла, но потерялась между формой, мессенджером и менеджером.",
    title: "Единый поток заявок",
    text: "Свяжем форму, Telegram, таблицу или CRM, добавим статусы и уведомления для ответственного.",
    outcome: "Все обращения в одном месте + уведомления + понятный статус",
    price: "от 5 000 ₽",
  },
  routine: {
    number: "03",
    pain: "Сотрудники копируют данные вручную и тратят время на повторяющиеся действия.",
    title: "Автоматизация процесса",
    text: "Разложим процесс на шаги и подключим API, CRM или бота там, где это действительно экономит время.",
    outcome: "Меньше ручных действий + контроль этапов + журнал операций",
    price: "от 5 000 ₽",
  },
  mvp: {
    number: "04",
    pain: "Есть идея, но не хочется сразу вкладываться в большую разработку.",
    title: "Рабочий прототип MVP",
    text: "Соберём ключевой сценарий, чтобы его можно было открыть, показать и проверить на первых пользователях.",
    outcome: "Кликабельный сценарий + демонстрация логики + план развития",
    price: "от 5 000 ₽",
  },
};

const solutionFields = {
  number: document.querySelector("#solution-number"),
  pain: document.querySelector("#solution-pain"),
  title: document.querySelector("#solution-title"),
  text: document.querySelector("#solution-text"),
  outcome: document.querySelector("#solution-outcome"),
  price: document.querySelector("#solution-price"),
};

function setConcept(name, pushState = true) {
  const next = concepts.has(name) ? name : "clear";
  document.body.dataset.concept = next;

  views.forEach((view) => {
    view.hidden = view.dataset.view !== next;
  });

  switchButtons.forEach((button) => {
    const active = button.dataset.switch === next;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (pushState) {
    const url = new URL(window.location.href);
    url.searchParams.set("style", next);
    window.history.replaceState({}, "", url);
  }

  window.scrollTo({ top: 0, behavior: "instant" });
}

function setSolution(key) {
  const solution = solutions[key];
  if (!solution) return;

  painButtons.forEach((button) => {
    const active = button.dataset.pain === key;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  solutionCard.classList.add("is-changing");

  window.setTimeout(() => {
    Object.entries(solutionFields).forEach(([field, element]) => {
      element.textContent = solution[field];
    });
    solutionCard.classList.remove("is-changing");
  }, 160);
}

switchButtons.forEach((button) => {
  button.addEventListener("click", () => setConcept(button.dataset.switch));
});

painButtons.forEach((button) => {
  button.addEventListener("click", () => setSolution(button.dataset.pain));
});

const queryConcept = new URLSearchParams(window.location.search).get("style");
setConcept(queryConcept || "clear", false);
