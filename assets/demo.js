const ticker = document.querySelector('.ticker');
if (ticker) ticker.innerHTML += ticker.innerHTML;

document.querySelectorAll('[data-scroll]').forEach((button) => {
  button.addEventListener('click', () => document.querySelector(button.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' }));
});

const toast = document.querySelector('.toast');
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

document.querySelectorAll('[data-toast]').forEach((button) => {
  button.addEventListener('click', () => showToast(button.dataset.toast));
});

const demo = document.body.dataset.demo;

document.querySelectorAll('.side-nav button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.side-nav button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    showToast(`Открыт раздел «${button.textContent.trim()}» — в прототипе показан основной сценарий.`);
  });
});

document.querySelectorAll('[data-search]').forEach((input) => {
  input.addEventListener('input', () => {
    const query = input.value.toLowerCase();
    document.querySelectorAll('.data-row').forEach((row) => {
      row.hidden = !row.textContent.toLowerCase().includes(query);
    });
  });
});

document.querySelectorAll('.data-row').forEach((row) => {
  row.addEventListener('click', () => showToast(`Карточка «${row.querySelector('strong')?.textContent}» открыта для обработки.`));
});

const syncButton = document.querySelector('[data-sync]');
if (syncButton) {
  syncButton.addEventListener('click', () => {
    syncButton.disabled = true;
    syncButton.textContent = 'Синхронизация…';
    const progress = document.querySelector('.progress i');
    if (progress) progress.style.setProperty('--progress', '100%');
    setTimeout(() => {
      syncButton.disabled = false;
      syncButton.textContent = 'Синхронизировать';
      const stamp = document.querySelector('[data-sync-stamp]');
      if (stamp) stamp.textContent = 'только что';
      showToast('Обмен завершён: 12 записей обновлено, ошибок нет.');
    }, 1100);
  });
}

const campaignButton = document.querySelector('[data-campaign]');
if (campaignButton) {
  campaignButton.addEventListener('click', () => {
    campaignButton.textContent = 'Кампания запущена';
    document.querySelector('[data-sent]').textContent = '128';
    document.querySelector('[data-delivered]').textContent = '121';
    showToast('Тестовая рассылка запущена с лимитами и обработкой отписок.');
  });
}

document.querySelectorAll('[data-generate]').forEach((button) => {
  button.addEventListener('click', () => {
    const product = button.closest('.product');
    const text = product.querySelector('p');
    button.disabled = true;
    button.textContent = 'Генерируем…';
    setTimeout(() => {
      text.textContent = 'Описание готово: преимущества, характеристики и SEO-фразы сформированы по карточке товара.';
      button.textContent = 'Обновить текст';
      button.disabled = false;
      showToast('AI-описание создано и поставлено в очередь публикации.');
    }, 850);
  });
});

if (demo) document.documentElement.dataset.ready = 'true';
