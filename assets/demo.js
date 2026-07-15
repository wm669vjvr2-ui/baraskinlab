const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const demo = document.body.dataset.demo;
const storageKey = `baraskin-lab-demo:${demo}:v2`;
const toast = $('.toast');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function readState(fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved && typeof saved === 'object' ? { ...fallback, ...saved } : fallback;
  } catch {
    return fallback;
  }
}

function saveState(state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function openDialog(dialog) {
  if (dialog && !dialog.open) dialog.showModal();
}

function closeDialog(button) {
  button.closest('dialog')?.close();
}

$$('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => closeDialog(button)));
$$('.demo-dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
}));

$$('[data-section]').forEach((button) => button.addEventListener('click', () => {
  $$('[data-section]').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const sectionName = $('span', button)?.textContent || button.dataset.section;
  const targetByDemo = {
    'lead-radar': { leads: '[data-lead-list]', sources: '[data-lead-filter]', exports: '[data-export-leads]', settings: '[data-lead-search]' },
    'bitrix-hub': { overview: '[data-sync-services]', exchange: '[data-sync-log]', pipelines: '[data-open-mapping]' },
    'whatsapp-flow': { campaigns: '[data-campaign]', clients: '[data-client-list]', templates: '[data-template-text]', api: '[data-campaign-log]' },
    'commerce-ai': { products: '[data-product-grid]', queue: '[data-commerce-log]', prompts: '[data-prompt]', api: '[data-publish-ready]' },
  };
  const target = $(targetByDemo[demo]?.[button.dataset.section]);
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (target?.focus) target.focus({ preventScroll: true });
  showToast(`Раздел «${sectionName}» открыт.`);
}));

function initLeadRadar() {
  const defaults = {
    total: 48,
    leads: [
      { id: 1, title: 'Нужна гидроизоляция склада', source: '@stroika_msk', meta: 'Бюджет указан · Москва', score: 94, status: 'crm', note: '', summary: 'Компания ищет подрядчика для гидроизоляции складского помещения и готова обсуждать смету.' },
      { id: 2, title: 'Ищем подрядчика для сметы', source: '@business_requests', meta: 'Срочный запрос · Московская область', score: 88, status: 'new', note: '', summary: 'Запрос от бизнеса с конкретной задачей и коротким сроком принятия решения.' },
      { id: 3, title: 'Консультация инженера', source: '@pro_remont', meta: 'Частный объект · Химки', score: 71, status: 'contacted', note: '', summary: 'Пользователь выбирает техническое решение и готов заказать платную консультацию.' },
      { id: 4, title: 'Посоветуйте материал для крыши', source: '@dom_chat', meta: 'Информационный интерес', score: 43, status: 'new', note: '', summary: 'Ранний интерес без бюджета и сроков; подходит для прогрева, но не для срочной продажи.' },
    ],
    log: [
      { title: 'Лид отправлен в CRM', text: '«Гидроизоляция склада» · сохранён контакт и источник' },
      { title: 'AI исключил сообщение', text: 'Вакансия и реклама без запроса' },
      { title: 'Сканирование завершено', text: 'Проверено 326 сообщений' },
    ],
  };
  const state = readState(defaults);
  let activeLeadId = null;

  const statusLabel = { new: 'Новый', contacted: 'В работе', crm: 'В CRM', rejected: 'Отклонён' };
  const list = $('[data-lead-list]');
  const log = $('[data-lead-log]');
  const dialog = $('[data-lead-dialog]');

  function render() {
    const query = ($('[data-lead-search]')?.value || '').trim().toLowerCase();
    const filter = $('[data-lead-filter]')?.value || 'all';
    const visible = state.leads.filter((lead) => {
      const matchesQuery = `${lead.title} ${lead.source} ${lead.meta}`.toLowerCase().includes(query);
      const matchesFilter = filter === 'all' || (filter === 'hot' && lead.score >= 80) || filter === lead.status;
      return matchesQuery && matchesFilter;
    });
    list.innerHTML = visible.length ? visible.map((lead) => `
      <article class="data-row" data-lead-id="${lead.id}" tabindex="0">
        <i class="avatar">${escapeHtml(lead.title.split(' ').map((word) => word[0]).slice(0, 2).join(''))}</i>
        <div class="data-copy"><strong>${escapeHtml(lead.title)}</strong><span>${escapeHtml(lead.source)} · ${escapeHtml(statusLabel[lead.status])}</span></div>
        <b class="score ${lead.score < 60 ? 'low' : lead.score < 80 ? 'medium' : ''}">${lead.score}</b>
      </article>`).join('') : '<div class="empty-state">По этому фильтру лидов нет.</div>';
    $('[data-leads-total]').textContent = state.total;
    $('[data-leads-relevant]').textContent = state.leads.filter((lead) => lead.score >= 70 && lead.status !== 'rejected').length;
    $('[data-leads-crm]').textContent = state.leads.filter((lead) => lead.status === 'crm').length;
    log.innerHTML = state.log.map((item) => `<div class="log-item"><strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.text)}</div>`).join('');
    $$('[data-lead-id]', list).forEach((row) => {
      const handler = () => openLead(Number(row.dataset.leadId));
      row.addEventListener('click', handler);
      row.addEventListener('keydown', (event) => { if (event.key === 'Enter') handler(); });
    });
  }

  function openLead(id) {
    const lead = state.leads.find((item) => item.id === id);
    if (!lead) return;
    activeLeadId = id;
    $('[data-lead-dialog-title]').textContent = lead.title;
    $('[data-lead-dialog-meta]').textContent = `${lead.source} · оценка ${lead.score}/100 · ${lead.meta}`;
    $('[data-lead-dialog-summary]').textContent = lead.summary;
    $('[data-lead-status]').value = lead.status;
    $('[data-lead-note]').value = lead.note || '';
    openDialog(dialog);
  }

  function saveLead(forceCrm = false) {
    const lead = state.leads.find((item) => item.id === activeLeadId);
    if (!lead) return;
    lead.status = forceCrm ? 'crm' : $('[data-lead-status]').value;
    lead.note = $('[data-lead-note]').value.trim();
    if (forceCrm) state.log.unshift({ title: 'Лид передан в CRM', text: `${lead.title} · сделка создана` });
    else state.log.unshift({ title: 'Карточка обновлена', text: `${lead.title} · статус: ${statusLabel[lead.status]}` });
    saveState(state);
    render();
    dialog.close();
    showToast(forceCrm ? 'Сделка создана в демонстрационной CRM.' : 'Изменения сохранены.');
  }

  $('[data-lead-search]').addEventListener('input', render);
  $('[data-lead-filter]').addEventListener('change', render);
  $('[data-save-lead]').addEventListener('click', () => saveLead(false));
  $('[data-send-crm]').addEventListener('click', () => saveLead(true));
  $('[data-scan]').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = 'Проверяем сообщения…';
    $('[data-scan-status]').textContent = 'Сканирование';
    await wait(900);
    const newLead = { id: Date.now(), title: 'Нужна автоматизация заявок', source: '@owners_club', meta: 'Бюджет до 70 000 ₽ · сегодня', score: 91, status: 'new', note: '', summary: 'Владелец бизнеса ищет исполнителя для сбора заявок, квалификации и передачи в CRM.' };
    state.leads.unshift(newLead);
    state.total += 17;
    state.log.unshift({ title: 'Найден новый лид', text: `${newLead.title} · AI‑оценка ${newLead.score}` });
    saveState(state);
    button.disabled = false;
    button.textContent = 'Запустить сканирование';
    $('[data-scan-status]').textContent = 'Онлайн';
    render();
    showToast('Сканирование завершено: добавлен новый релевантный лид.');
  });
  $('[data-export-leads]').addEventListener('click', () => {
    const rows = [['Запрос', 'Источник', 'Оценка', 'Статус', 'Комментарий'], ...state.leads.map((lead) => [lead.title, lead.source, lead.score, statusLabel[lead.status], lead.note || ''])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lead-radar-export.csv';
    link.click();
    URL.revokeObjectURL(url);
    state.log.unshift({ title: 'Выгрузка создана', text: `${state.leads.length} лидов · CSV` });
    saveState(state);
    render();
    showToast('CSV сформирован и скачан.');
  });
  render();
}

function initBitrixHub() {
  const defaultMapping = [
    { source: 'crm.lead.TITLE', target: 'order_name', active: true },
    { source: 'crm.deal.OPPORTUNITY', target: 'amount', active: true },
    { source: 'crm.contact.PHONE', target: 'client_phone', active: true },
    { source: 'crm.item.UF_CRM_INN', target: 'tax_id', active: true },
  ];
  const defaults = { deals: 1284, events: 342, errors: 0, mapping: defaultMapping, log: [
    { title: 'Исходящий webhook', text: 'deal.update · HTTP 200' },
    { title: 'Счёт обновлён', text: 'invoice #1048 · статус «Оплачен»' },
    { title: 'Пакет синхронизирован', text: '48 объектов · без ошибок' },
  ] };
  const state = readState(defaults);
  const mappingDialog = $('[data-mapping-dialog]');

  function renderLog() {
    $('[data-sync-log]').innerHTML = state.log.length ? state.log.map((item) => `<div class="log-item"><strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.text)}</div>`).join('') : '<div class="empty-state">Журнал пока пуст.</div>';
    $('[data-deals-count]').textContent = state.deals.toLocaleString('ru-RU');
    $('[data-events-count]').textContent = state.events.toLocaleString('ru-RU');
    $('[data-errors-count]').textContent = state.errors;
  }

  function renderMapping() {
    $('[data-mapping-body]').innerHTML = state.mapping.map((row, index) => `<tr data-map-index="${index}"><td><span class="inline-code">${escapeHtml(row.source)}</span></td><td><select><option value="order_name" ${row.target === 'order_name' ? 'selected' : ''}>order_name</option><option value="amount" ${row.target === 'amount' ? 'selected' : ''}>amount</option><option value="client_phone" ${row.target === 'client_phone' ? 'selected' : ''}>client_phone</option><option value="tax_id" ${row.target === 'tax_id' ? 'selected' : ''}>tax_id</option></select></td><td><input class="row-check" type="checkbox" ${row.active ? 'checked' : ''} /></td></tr>`).join('');
  }

  $$('[data-open-mapping]').forEach((button) => button.addEventListener('click', () => { renderMapping(); openDialog(mappingDialog); }));
  $('[data-save-mapping]').addEventListener('click', () => {
    $$('[data-map-index]').forEach((row) => {
      const item = state.mapping[Number(row.dataset.mapIndex)];
      item.target = $('select', row).value;
      item.active = $('input', row).checked;
    });
    state.log.unshift({ title: 'Маппинг сохранён', text: `${state.mapping.filter((row) => row.active).length} активных связей` });
    saveState(state);
    renderLog();
    mappingDialog.close();
    showToast('Настройки полей сохранены.');
  });
  $('[data-reset-mapping]').addEventListener('click', () => { state.mapping = defaultMapping.map((row) => ({ ...row })); renderMapping(); showToast('Возвращён маппинг по умолчанию.'); });
  $('[data-clear-log]').addEventListener('click', () => { state.log = []; saveState(state); renderLog(); showToast('Журнал очищен.'); });
  $('[data-test-webhook]').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = 'Проверка…';
    await wait(650);
    state.events += 1;
    state.log.unshift({ title: 'Тестовый webhook', text: 'crm.deal.update · HTTP 200 · 184 мс' });
    saveState(state);
    renderLog();
    button.disabled = false;
    button.textContent = 'Тест webhook';
    showToast('Webhook отвечает: HTTP 200.');
  });
  $$('[data-service]').forEach((row) => row.addEventListener('click', () => showToast(`${row.dataset.service}: канал обмена работает.`)));
  $('[data-sync]').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const bar = $('[data-sync-progress]');
    button.disabled = true;
    button.textContent = 'Синхронизация…';
    for (const value of [18, 37, 58, 79, 100]) {
      bar.style.setProperty('--progress', `${value}%`);
      await wait(230);
    }
    state.deals += 12;
    state.events += 8;
    state.errors = 0;
    state.log.unshift({ title: 'Полная синхронизация', text: '12 записей обновлено · ошибок нет' });
    saveState(state);
    $('[data-sync-stamp]').textContent = 'только что';
    renderLog();
    button.disabled = false;
    button.textContent = 'Синхронизировать';
    showToast('Обмен завершён: 12 записей обновлено.');
  });
  renderLog();
}

function initWhatsappFlow() {
  const defaults = { sent: 0, delivered: 0, clients: [
    { id: 1, name: 'Анна Ковалева', phone: '+7 985 111-20-30', days: 90, selected: true, status: 'active' },
    { id: 2, name: 'Илья Петров', phone: '+7 916 220-14-08', days: 30, selected: true, status: 'active' },
    { id: 3, name: 'Мария Соколова', phone: '+7 903 412-88-17', days: 7, selected: true, status: 'active' },
    { id: 4, name: 'Олег Волков', phone: '+7 926 777-31-09', days: 30, selected: false, status: 'active' },
    { id: 5, name: 'Елена Орлова', phone: '+7 999 120-20-20', days: 7, selected: false, status: 'unsubscribed' },
  ], log: [{ title: 'API подключён', text: 'Тестовый канал готов к отправке' }] };
  const state = readState(defaults);
  const clientDialog = $('[data-client-dialog]');
  const previewDialog = $('[data-preview-dialog]');

  function visibleClients() {
    const segment = $('[data-segment]').value;
    return state.clients.filter((client) => segment === 'all' || String(client.days) === segment);
  }

  function render() {
    const visible = visibleClients();
    $('[data-client-list]').innerHTML = visible.length ? visible.map((client) => `<article class="data-row ${client.selected ? 'selected' : ''}" data-client-id="${client.id}"><input class="row-check" type="checkbox" ${client.selected ? 'checked' : ''} ${client.status === 'unsubscribed' ? 'disabled' : ''} aria-label="Выбрать ${escapeHtml(client.name)}" /><div class="data-copy"><strong>${escapeHtml(client.name)}</strong><span>${escapeHtml(client.phone)} · ${client.days} дней до окончания</span></div><b class="status-pill ${client.status === 'unsubscribed' ? 'muted' : client.status === 'delivered' ? 'success' : ''}">${client.status === 'unsubscribed' ? 'Отписан' : client.status === 'delivered' ? 'Доставлено' : 'Активен'}</b></article>`).join('') : '<div class="empty-state">В этом сегменте клиентов нет.</div>';
    $$('[data-client-id]').forEach((row) => $('input', row).addEventListener('change', (event) => {
      const client = state.clients.find((item) => item.id === Number(row.dataset.clientId));
      client.selected = event.target.checked;
      saveState(state);
      render();
    }));
    $('[data-client-count]').textContent = state.clients.length;
    $('[data-sent]').textContent = state.sent;
    $('[data-delivered]').textContent = state.delivered;
    $('[data-unsubscribed]').textContent = state.clients.filter((client) => client.status === 'unsubscribed').length;
    $('[data-campaign-log]').innerHTML = state.log.map((item) => `<div class="log-item"><strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.text)}</div>`).join('');
  }

  const templates = {
    renewal: 'Здравствуйте, {{name}}! Срок вашей услуги заканчивается через {{days}} дней. Ответьте «Продлить», и менеджер свяжется с вами.',
    last: '{{name}}, напоминаем: до окончания услуги осталось {{days}} дней. Чтобы не потерять доступ, ответьте «Продлить».',
  };
  $('[data-segment]').addEventListener('change', render);
  $('[data-template]').addEventListener('change', (event) => { $('[data-template-text]').value = templates[event.target.value]; });
  $('[data-select-visible]').addEventListener('click', () => {
    const visibleIds = new Set(visibleClients().filter((client) => client.status !== 'unsubscribed').map((client) => client.id));
    state.clients.forEach((client) => { if (visibleIds.has(client.id)) client.selected = true; });
    saveState(state);
    render();
    showToast(`Выбрано получателей: ${visibleIds.size}.`);
  });
  $('[data-add-client]').addEventListener('click', () => openDialog(clientDialog));
  $('[data-client-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.clients.unshift({ id: Date.now(), name: form.get('name').trim(), phone: form.get('phone').trim(), days: Number(form.get('days')), selected: true, status: 'active' });
    state.log.unshift({ title: 'Клиент добавлен', text: `${form.get('name')} · ${form.get('days')} дней` });
    saveState(state);
    event.currentTarget.reset();
    clientDialog.close();
    render();
    showToast('Клиент добавлен в базу.');
  });
  $('[data-preview-campaign]').addEventListener('click', () => {
    const client = state.clients.find((item) => item.selected && item.status !== 'unsubscribed') || visibleClients().find((item) => item.status !== 'unsubscribed');
    if (!client) return showToast('Сначала выберите получателя.');
    const message = $('[data-template-text]').value.replaceAll('{{name}}', client.name).replaceAll('{{days}}', client.days).replaceAll('{{date}}', `через ${client.days} дней`);
    $('[data-preview-recipient]').textContent = client.name;
    $('[data-preview-text]').textContent = message;
    openDialog(previewDialog);
  });
  $('[data-campaign]').addEventListener('click', async (event) => {
    const recipients = state.clients.filter((client) => client.selected && client.status !== 'unsubscribed');
    if (!recipients.length) return showToast('Выберите хотя бы одного активного клиента.');
    const button = event.currentTarget;
    const progress = $('[data-campaign-progress]');
    const bar = $('[data-campaign-progress-bar]');
    button.disabled = true;
    progress.classList.add('active');
    for (let index = 0; index < recipients.length; index += 1) {
      $('[data-campaign-progress-text]').textContent = `Отправка ${index + 1} из ${recipients.length}: ${recipients[index].name}`;
      bar.style.setProperty('--progress', `${Math.round(((index + 1) / recipients.length) * 100)}%`);
      await wait(320);
      recipients[index].status = 'delivered';
      recipients[index].selected = false;
    }
    state.sent += recipients.length;
    state.delivered += recipients.length;
    state.log.unshift({ title: 'Кампания завершена', text: `${recipients.length} отправлено · ${recipients.length} доставлено` });
    saveState(state);
    render();
    button.disabled = false;
    progress.classList.remove('active');
    bar.style.setProperty('--progress', '0%');
    showToast('Кампания завершена, статусы доставки обновлены.');
  });
  render();
}

function initCommerceAi() {
  const defaults = { products: [
    { id: 1, icon: '▰', name: 'Лист стальной 3 мм', status: 'empty', description: '', seo: '' },
    { id: 2, icon: '▱', name: 'Труба профильная', status: 'empty', description: '', seo: '' },
    { id: 3, icon: '╱', name: 'Арматура А500', status: 'empty', description: '', seo: '' },
    { id: 4, icon: '⬡', name: 'Сетка сварная', status: 'empty', description: '', seo: '' },
  ], log: [{ title: 'Cron готов', text: 'Очередь генерации ожидает задачи' }] };
  const state = readState(defaults);
  let activeProductId = null;
  const dialog = $('[data-product-dialog]');
  const statusName = { empty: 'Нет описания', queue: 'В очереди', ready: 'Готово', published: 'Опубликовано' };

  function render() {
    const query = $('[data-product-search]').value.trim().toLowerCase();
    const filter = $('[data-product-filter]').value;
    const visible = state.products.filter((product) => product.name.toLowerCase().includes(query) && (filter === 'all' || product.status === filter));
    $('[data-product-grid]').innerHTML = visible.length ? visible.map((product) => `<article class="product ${product.status === 'ready' || product.status === 'published' ? 'ready' : ''}" data-product-id="${product.id}"><div class="product-visual">${product.icon}</div><span class="status-pill ${product.status === 'published' ? 'success' : product.status === 'empty' ? 'muted' : ''}">${statusName[product.status]}</span><strong style="display:block;margin-top:9px">${escapeHtml(product.name)}</strong><p>${escapeHtml(product.description || 'Описание ещё не создано.')}</p><div class="product-actions">${product.status === 'empty' ? '<button class="button primary small" data-generate-product>Создать</button>' : product.status === 'queue' ? '<button class="button small" disabled>Генерация…</button>' : '<button class="button ghost small" data-edit-product>Изменить</button>'}${product.status === 'ready' ? '<button class="button primary small" data-publish-one>Опубликовать</button>' : ''}${product.status === 'published' ? '<button class="button ghost small" data-unpublish-one>Снять</button>' : ''}</div></article>`).join('') : '<div class="empty-state">Товары не найдены.</div>';
    $('[data-products-empty]').textContent = state.products.filter((item) => item.status === 'empty').length;
    $('[data-products-ready]').textContent = state.products.filter((item) => item.status === 'ready').length;
    $('[data-products-queue]').textContent = state.products.filter((item) => item.status === 'queue').length;
    $('[data-products-published]').textContent = state.products.filter((item) => item.status === 'published').length;
    $('[data-commerce-log]').innerHTML = state.log.map((item) => `<div class="log-item"><strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.text)}</div>`).join('');
    $$('[data-product-id]').forEach((card) => {
      const id = Number(card.dataset.productId);
      $('[data-generate-product]', card)?.addEventListener('click', () => generateProduct(id));
      $('[data-edit-product]', card)?.addEventListener('click', () => openProduct(id));
      $('[data-publish-one]', card)?.addEventListener('click', () => publishProduct(id));
      $('[data-unpublish-one]', card)?.addEventListener('click', () => unpublishProduct(id));
    });
  }

  async function generateProduct(id) {
    const product = state.products.find((item) => item.id === id);
    if (!product || product.status === 'queue') return;
    product.status = 'queue';
    saveState(state);
    render();
    await wait(720);
    product.description = `${product.name} для строительных и производственных задач. Точная геометрия, стабильные характеристики и удобная поставка под объём проекта.`;
    product.seo = `${product.name} — характеристики, цена и заказ`;
    product.status = 'ready';
    state.log.unshift({ title: 'Описание создано', text: `${product.name} · готово к проверке` });
    saveState(state);
    render();
    showToast(`Описание «${product.name}» готово.`);
  }

  function openProduct(id) {
    const product = state.products.find((item) => item.id === id);
    if (!product) return;
    activeProductId = id;
    $('[data-product-dialog-title]').textContent = product.name;
    $('[data-product-name]').value = product.name;
    $('[data-product-description]').value = product.description;
    $('[data-product-seo]').value = product.seo;
    openDialog(dialog);
  }

  function saveProduct(publish = false) {
    const product = state.products.find((item) => item.id === activeProductId);
    if (!product) return;
    product.name = $('[data-product-name]').value.trim() || product.name;
    product.description = $('[data-product-description]').value.trim();
    product.seo = $('[data-product-seo]').value.trim();
    product.status = publish ? 'published' : product.description ? 'ready' : 'empty';
    state.log.unshift({ title: publish ? 'Товар опубликован' : 'Карточка сохранена', text: product.name });
    saveState(state);
    render();
    dialog.close();
    showToast(publish ? 'Карточка опубликована в демо‑каталоге.' : 'Изменения сохранены.');
  }

  function publishProduct(id) {
    const product = state.products.find((item) => item.id === id);
    if (!product) return;
    product.status = 'published';
    state.log.unshift({ title: 'Товар опубликован', text: product.name });
    saveState(state);
    render();
    showToast('Товар опубликован.');
  }

  function unpublishProduct(id) {
    const product = state.products.find((item) => item.id === id);
    if (!product) return;
    product.status = 'ready';
    state.log.unshift({ title: 'Товар снят с публикации', text: product.name });
    saveState(state);
    render();
    showToast('Товар возвращён в черновики.');
  }

  $('[data-product-search]').addEventListener('input', render);
  $('[data-product-filter]').addEventListener('change', render);
  $('[data-save-product]').addEventListener('click', () => saveProduct(false));
  $('[data-publish-product]').addEventListener('click', () => saveProduct(true));
  $('[data-generate-all]').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const pending = state.products.filter((product) => product.status === 'empty');
    if (!pending.length) return showToast('У всех товаров уже есть описания.');
    button.disabled = true;
    for (let index = 0; index < pending.length; index += 1) {
      button.textContent = `Генерация ${index + 1}/${pending.length}`;
      await generateProduct(pending[index].id);
    }
    button.disabled = false;
    button.textContent = 'Создать все описания';
    showToast('Все описания сформированы.');
  });
  $('[data-publish-ready]').addEventListener('click', () => {
    const ready = state.products.filter((product) => product.status === 'ready');
    if (!ready.length) return showToast('Нет готовых карточек для публикации.');
    ready.forEach((product) => { product.status = 'published'; });
    state.log.unshift({ title: 'Пакет опубликован', text: `${ready.length} карточек · WooCommerce` });
    saveState(state);
    render();
    showToast(`Опубликовано карточек: ${ready.length}.`);
  });
  $('[data-reset-products]').addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    Object.assign(state, JSON.parse(JSON.stringify(defaults)));
    render();
    showToast('Демо возвращено в исходное состояние.');
  });
  render();
}

if (demo === 'lead-radar') initLeadRadar();
if (demo === 'bitrix-hub') initBitrixHub();
if (demo === 'whatsapp-flow') initWhatsappFlow();
if (demo === 'commerce-ai') initCommerceAi();
document.documentElement.dataset.ready = 'true';
