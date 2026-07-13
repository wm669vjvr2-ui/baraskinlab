const STORAGE_KEY = "baraskin-expenses-v1";

const defaultCategories = [
  { id: "food", name: "Еда", icon: "🍔" },
  { id: "cafe", name: "Кафе", icon: "☕" },
  { id: "transport", name: "Транспорт", icon: "🚕" },
  { id: "groceries", name: "Продукты", icon: "🛒" },
  { id: "home", name: "Дом", icon: "⌂" },
  { id: "health", name: "Здоровье", icon: "+" },
  { id: "other", name: "Другое", icon: "●" },
];

function dateOffset(days, hours = 12) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

function createInitialState() {
  return {
    categories: defaultCategories.map((category) => ({ ...category })),
    expenses: [
      { id: "seed-1", name: "Продукты на неделю", amount: 4280, categoryId: "groceries", createdAt: dateOffset(1, 19) },
      { id: "seed-2", name: "Такси", amount: 760, categoryId: "transport", createdAt: dateOffset(2, 22) },
      { id: "seed-3", name: "Кофе с собой", amount: 290, categoryId: "cafe", createdAt: dateOffset(3, 10) },
      { id: "seed-4", name: "Аптека", amount: 1340, categoryId: "health", createdAt: dateOffset(5, 18) },
      { id: "seed-5", name: "Ужин", amount: 2100, categoryId: "food", createdAt: dateOffset(7, 20) },
    ],
  };
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.categories?.length && Array.isArray(stored.expenses)) return stored;
  } catch (error) {
    console.warn("Не удалось прочитать сохранённые данные", error);
  }
  const initial = createInitialState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

let state = loadState();
let currentPeriod = "month";
let pendingExpense = null;
let lastDeleted = null;

const expenseForm = document.querySelector("#expense-form");
const expenseInput = document.querySelector("#expense-input");
const formMessage = document.querySelector("#form-message");
const expenseList = document.querySelector("#expense-list");
const categoryChart = document.querySelector("#category-chart");
const categoryList = document.querySelector("#category-list");
const categoryPicker = document.querySelector("#category-picker");
const categoryPickerGrid = document.querySelector("#category-picker-grid");
const pendingExpenseBox = document.querySelector("#pending-expense");
const newCategoryDialog = document.querySelector("#new-category-dialog");
const categoryForm = document.querySelector("#category-form");
const undoButton = document.querySelector("#undo-button");

const numberUnits = {
  ноль: 0,
  один: 1,
  одна: 1,
  два: 2,
  две: 2,
  три: 3,
  четыре: 4,
  пять: 5,
  шесть: 6,
  семь: 7,
  восемь: 8,
  девять: 9,
};

const numberTeens = {
  десять: 10,
  одиннадцать: 11,
  двенадцать: 12,
  тринадцать: 13,
  четырнадцать: 14,
  пятнадцать: 15,
  шестнадцать: 16,
  семнадцать: 17,
  восемнадцать: 18,
  девятнадцать: 19,
};

const numberTens = {
  двадцать: 20,
  тридцать: 30,
  сорок: 40,
  пятьдесят: 50,
  шестьдесят: 60,
  семьдесят: 70,
  восемьдесят: 80,
  девяносто: 90,
};

const numberHundreds = {
  сто: 100,
  двести: 200,
  триста: 300,
  четыреста: 400,
  пятьсот: 500,
  шестьсот: 600,
  семьсот: 700,
  восемьсот: 800,
  девятьсот: 900,
};

const numberScales = {
  тысяча: 1000,
  тысячи: 1000,
  тысяч: 1000,
  тыща: 1000,
  тыщ: 1000,
  миллион: 1000000,
  миллиона: 1000000,
  миллионов: 1000000,
  млн: 1000000,
};

const knownNumberWords = new Set([
  ...Object.keys(numberUnits),
  ...Object.keys(numberTeens),
  ...Object.keys(numberTens),
  ...Object.keys(numberHundreds),
  ...Object.keys(numberScales),
]);

function parseDigitToken(token) {
  let value = token.toLowerCase().trim().replace(",", ".");
  let multiplier = 1;

  if (value.endsWith("кк")) {
    multiplier = 1000000;
    value = value.slice(0, -2);
  } else if (value.endsWith("к") || value.endsWith("k")) {
    multiplier = 1000;
    value = value.slice(0, -1);
  }

  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  return Number(value) * multiplier;
}

function wordsToNumber(tokens) {
  let total = 0;
  let current = 0;

  for (const token of tokens) {
    if (token in numberHundreds) current += numberHundreds[token];
    else if (token in numberTens) current += numberTens[token];
    else if (token in numberTeens) current += numberTeens[token];
    else if (token in numberUnits) current += numberUnits[token];
    else if (token in numberScales) {
      current = (current || 1) * numberScales[token];
      total += current;
      current = 0;
    } else return null;
  }

  return total + current;
}

function parseExpense(text) {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;

  const digitAmount = parseDigitToken(tokens[tokens.length - 1]);
  if (digitAmount && digitAmount > 0) {
    return {
      name: tokens.slice(0, -1).join(" ") || "Без названия",
      amount: digitAmount,
    };
  }

  let numberStart = tokens.length;
  while (numberStart > 0 && knownNumberWords.has(tokens[numberStart - 1].toLowerCase())) {
    numberStart -= 1;
  }

  if (numberStart < tokens.length) {
    const wordAmount = wordsToNumber(tokens.slice(numberStart).map((token) => token.toLowerCase()));
    if (wordAmount && wordAmount > 0) {
      return {
        name: tokens.slice(0, numberStart).join(" ") || "Без названия",
        amount: wordAmount,
      };
    }
  }

  return null;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatAmount(amount) {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(amount)} ₽`;
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(isoDate));
}

function categoryById(categoryId) {
  return state.categories.find((category) => category.id === categoryId) || {
    name: "Другое",
    icon: "●",
  };
}

function expensesForPeriod() {
  const now = new Date();
  return state.expenses
    .filter((expense) => {
      if (currentPeriod === "all") return true;
      const date = new Date(expense.createdAt);
      if (currentPeriod === "today") return date.toDateString() === now.toDateString();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

function renderExpenses() {
  const expenses = expensesForPeriod();
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const average = expenses.length ? total / expenses.length : 0;

  document.querySelector("#total-value").textContent = formatAmount(total);
  document.querySelector("#expense-count").textContent = expenses.length;
  document.querySelector("#average-value").textContent = formatAmount(average);
  document.querySelector("#result-count").textContent = `${expenses.length} ${expenseWord(expenses.length)}`;

  if (!expenses.length) {
    expenseList.innerHTML = '<div class="empty-state">За выбранный период записей нет.</div>';
  } else {
    expenseList.innerHTML = expenses
      .map((expense) => {
        const category = categoryById(expense.categoryId);
        return `
          <article class="expense-row">
            <span class="expense-icon" aria-hidden="true">${escapeHtml(category.icon)}</span>
            <div class="expense-info">
              <strong>${escapeHtml(expense.name)}</strong>
              <span>${escapeHtml(category.name)}</span>
            </div>
            <span class="expense-date">${formatDate(expense.createdAt)}</span>
            <strong class="expense-amount">−${formatAmount(expense.amount)}</strong>
            <button class="delete-expense" type="button" data-delete-expense="${escapeHtml(expense.id)}" aria-label="Удалить ${escapeHtml(expense.name)}" title="Удалить">×</button>
          </article>`;
      })
      .join("");
  }

  renderChart(expenses, total);
}

function expenseWord(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "запись";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "записи";
  return "записей";
}

function renderChart(expenses, total) {
  const sums = expenses.reduce((result, expense) => {
    result[expense.categoryId] = (result[expense.categoryId] || 0) + expense.amount;
    return result;
  }, {});

  const rows = Object.entries(sums).sort((left, right) => right[1] - left[1]);
  if (!rows.length) {
    categoryChart.innerHTML = '<div class="empty-state">Статистика появится после первой записи.</div>';
    return;
  }

  categoryChart.innerHTML = rows
    .map(([categoryId, amount]) => {
      const category = categoryById(categoryId);
      const width = total ? Math.max((amount / total) * 100, 4) : 0;
      return `
        <div class="chart-row">
          <div class="chart-label">
            <span>${escapeHtml(category.icon)} ${escapeHtml(category.name)}</span>
            <span>${formatAmount(amount)}</span>
          </div>
          <div class="chart-track"><div class="chart-fill" style="width:${width}%"></div></div>
        </div>`;
    })
    .join("");
}

function renderCategories() {
  categoryList.innerHTML = state.categories
    .map((category) => {
      const usedCount = state.expenses.filter((expense) => expense.categoryId === category.id).length;
      return `
        <article class="category-row">
          <span class="expense-icon" aria-hidden="true">${escapeHtml(category.icon)}</span>
          <strong>${escapeHtml(category.name)}</strong>
          <span>${usedCount} ${expenseWord(usedCount)}</span>
          <button class="delete-category" type="button" data-delete-category="${escapeHtml(category.id)}" ${usedCount ? "disabled" : ""} aria-label="Удалить категорию ${escapeHtml(category.name)}" title="${usedCount ? "Категория используется" : "Удалить"}">×</button>
        </article>`;
    })
    .join("");
}

function renderCategoryPicker() {
  if (!pendingExpense) return;
  pendingExpenseBox.innerHTML = `
    <span><strong>${escapeHtml(pendingExpense.name)}</strong><span>ожидает категории</span></span>
    <b>${formatAmount(pendingExpense.amount)}</b>`;
  categoryPickerGrid.innerHTML = state.categories
    .map(
      (category) => `
        <button type="button" data-pick-category="${escapeHtml(category.id)}">
          <span aria-hidden="true">${escapeHtml(category.icon)}</span>
          <strong>${escapeHtml(category.name)}</strong>
        </button>`
    )
    .join("");
}

function renderAll() {
  renderExpenses();
  renderCategories();
  undoButton.disabled = !lastDeleted;
}

function setMessage(text, type = "error") {
  formMessage.textContent = text;
  formMessage.classList.toggle("success", type === "success");
}

function setView(viewName) {
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    const active = panel.dataset.viewPanel === viewName;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  document.querySelectorAll(".nav-button[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
}

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const parsed = parseExpense(expenseInput.value);
  if (!parsed) {
    setMessage("Добавьте сумму в конце записи.");
    expenseInput.focus();
    return;
  }

  pendingExpense = parsed;
  setMessage("");
  renderCategoryPicker();
  categoryPicker.showModal();
});

categoryPickerGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pick-category]");
  if (!button || !pendingExpense) return;

  state.expenses.push({
    id: `expense-${Date.now()}`,
    name: pendingExpense.name,
    amount: pendingExpense.amount,
    categoryId: button.dataset.pickCategory,
    createdAt: new Date().toISOString(),
  });
  const savedName = pendingExpense.name;
  pendingExpense = null;
  saveState();
  categoryPicker.close();
  expenseInput.value = "";
  setMessage(`${savedName}: запись сохранена.`, "success");
  renderAll();
});

expenseList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-expense]");
  if (!button) return;
  const index = state.expenses.findIndex((expense) => expense.id === button.dataset.deleteExpense);
  if (index < 0) return;
  lastDeleted = { expense: state.expenses[index], index };
  state.expenses.splice(index, 1);
  saveState();
  renderAll();
});

undoButton.addEventListener("click", () => {
  if (!lastDeleted) return;
  state.expenses.splice(lastDeleted.index, 0, lastDeleted.expense);
  lastDeleted = null;
  saveState();
  renderAll();
});

document.querySelectorAll("[data-period]").forEach((button) => {
  button.addEventListener("click", () => {
    currentPeriod = button.dataset.period;
    document.querySelectorAll("[data-period]").forEach((item) => item.classList.toggle("active", item === button));
    renderExpenses();
  });
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelector("#open-category-dialog").addEventListener("click", () => {
  categoryForm.reset();
  newCategoryDialog.showModal();
  document.querySelector("#category-name").focus();
});

categoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nameInput = document.querySelector("#category-name");
  const iconInput = document.querySelector("#category-icon");
  const name = nameInput.value.trim();
  const icon = iconInput.value.trim() || "●";
  if (!name) {
    nameInput.focus();
    return;
  }

  state.categories.push({ id: `category-${Date.now()}`, name, icon });
  saveState();
  newCategoryDialog.close();
  renderAll();
});

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-category]");
  if (!button || button.disabled) return;
  state.categories = state.categories.filter((category) => category.id !== button.dataset.deleteCategory);
  saveState();
  renderAll();
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.querySelector("#reset-button").addEventListener("click", () => {
  state = createInitialState();
  lastDeleted = null;
  saveState();
  renderAll();
  setMessage("Исходные данные восстановлены.", "success");
});

renderAll();
