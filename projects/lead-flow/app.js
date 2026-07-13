const localHost = ["127.0.0.1", "localhost"].includes(window.location.hostname);
const API_BASE = localHost ? "http://127.0.0.1:8787" : "/baraskin/api";

const apiStatus = document.querySelector("#api-status");
const leadForm = document.querySelector("#lead-form");
const submitButton = document.querySelector("#submit-button");
const formMessage = document.querySelector("#form-message");
const resultId = document.querySelector("#result-id");
const resultCopy = document.querySelector("#result-copy");
const leadList = document.querySelector("#lead-list");
const flowSteps = [...document.querySelectorAll("[data-step]")];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setApiStatus(mode, text) {
  apiStatus.classList.remove("online", "error");
  apiStatus.classList.add(mode);
  apiStatus.querySelector("span").textContent = text;
}

function setFormMessage(text, success = false) {
  formMessage.textContent = text;
  formMessage.classList.toggle("success", success);
}

function resetFlow() {
  flowSteps.forEach((step) => step.classList.remove("active", "done"));
}

function completeFlow(steps) {
  resetFlow();
  steps.forEach((_, index) => {
    window.setTimeout(() => {
      if (index > 0) flowSteps[index - 1].classList.remove("active");
      flowSteps[index].classList.add("active", "done");
      if (index === steps.length - 1) flowSteps[index].classList.remove("active");
    }, index * 180);
  });
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function renderLeads(leads) {
  if (!leads.length) {
    leadList.innerHTML = '<div class="empty-state">Журнал пуст. Первая отправленная заявка появится здесь.</div>';
    return;
  }

  leadList.innerHTML = leads
    .map(
      (lead) => `
        <article class="lead-row">
          <span class="lead-id">${escapeHtml(lead.id)}</span>
          <strong>${escapeHtml(lead.name)}</strong>
          <span>${escapeHtml(lead.service)}</span>
          <span>${formatDate(lead.created_at)}</span>
          <span class="lead-status">${escapeHtml(lead.status)}</span>
        </article>`
    )
    .join("");
}

async function loadLeads() {
  try {
    const response = await fetch(`${API_BASE}/leads?limit=8`, { cache: "no-store" });
    if (!response.ok) throw new Error("API недоступен");
    const data = await response.json();
    renderLeads(data.leads || []);
    setApiStatus("online", "API и SQLite работают");
  } catch (error) {
    leadList.innerHTML = '<div class="empty-state">Не удалось подключиться к журналу заявок.</div>';
    setApiStatus("error", "API недоступен");
  }
}

async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    if (!response.ok) throw new Error("health check failed");
    setApiStatus("online", "API и SQLite работают");
  } catch (error) {
    setApiStatus("error", "API недоступен");
  }
}

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  resetFlow();
  setFormMessage("");
  submitButton.disabled = true;
  submitButton.textContent = "Обработка...";
  flowSteps[0].classList.add("active");

  const formData = new FormData(leadForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(`${API_BASE}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Не удалось сохранить заявку");

    completeFlow(data.steps || []);
    resultId.textContent = data.lead.id;
    resultCopy.textContent = `${data.lead.name}, заявка сохранена в базе.`;
    setFormMessage("Готово: сервер подтвердил запись.", true);
    leadForm.reset();
    await loadLeads();
  } catch (error) {
    resetFlow();
    resultId.textContent = "Ошибка обработки";
    resultCopy.textContent = error.message;
    setFormMessage(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Отправить в автоматизацию";
  }
});

document.querySelector("#refresh-button").addEventListener("click", loadLeads);

checkHealth();
loadLeads();
