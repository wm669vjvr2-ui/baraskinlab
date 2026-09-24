/* A local, fictional support flow. No network calls or persistent storage. */
(() => {
  const dialog = document.querySelector('#support-dialog');
  if (!dialog) return;
  const messages = dialog.querySelector('#support-messages');
  const suggestions = dialog.querySelector('#support-suggestions');
  const form = dialog.querySelector('#support-form');
  const input = dialog.querySelector('#support-input');
  const send = dialog.querySelector('#support-send');
  const typing = dialog.querySelector('#support-typing');
  const error = dialog.querySelector('#support-error');
  const initialOptions = ['Где мой заказ?', 'Доставка', 'Оплата', 'Возврат', 'Оператор'];
  let replyTimer = null;
  let pendingOrder = false;
  let previousTrigger = null;

  function addMessage(text, isUser = false) {
    const bubble = document.createElement('div');
    bubble.className = `support-message${isUser ? ' is-user' : ''}`;
    const author = document.createElement('strong');
    author.textContent = isUser ? 'Вы' : 'Бот · демо';
    const body = document.createElement('p');
    body.textContent = text;
    bubble.append(author, body);
    messages.append(bubble);
    while (messages.children.length > 60) messages.firstElementChild.remove();
    messages.scrollTop = messages.scrollHeight;
  }

  function setBusy(busy) {
    send.disabled = busy;
    suggestions.querySelectorAll('button').forEach(button => { button.disabled = busy; });
    typing.textContent = busy ? 'Бот готовит ответ…' : '';
    messages.setAttribute('aria-busy', String(busy));
  }

  function showOptions(options = initialOptions) {
    suggestions.replaceChildren();
    options.forEach(text => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.addEventListener('click', () => submitMessage(text));
      suggestions.append(button);
    });
  }

  function answerFor(raw) {
    const text = raw.toLowerCase().replaceAll('ё', 'е');
    if (/оператор|человек|менеджер/.test(text)) {
      pendingOrder = false;
      return { text: 'Показываю передачу диалога человеку: бот передаёт тему обращения и историю в очередь поддержки. В этом демо оператор не подключён, заявка никуда не отправляется.\n\nХотите попробовать другой сценарий?', options: ['Где мой заказ?', 'Доставка', 'Возврат'] };
    }
    if (/достав|привез|курьер/.test(text)) {
      pendingOrder = false;
      return { text: 'В учебном магазине доступны курьер и пункт выдачи. Пример срока — 2–4 дня. Это вымышленные условия для демонстрации.\n\nУже сделали заказ? Проверим учебный номер 1042.', options: ['Проверить заказ 1042', 'Оплата', 'Оператор'] };
    }
    if (/оплат|платеж|картой|сбп/.test(text)) {
      pendingOrder = false;
      return { text: 'В этом примере бот объясняет способы оплаты: карта или СБП на странице оформления. Здесь платежей нет — ничего оплачивать и вводить данные карты не нужно.\n\nЕсли платёж не прошёл, можно выбрать обращение к оператору.', options: ['Оператор', 'Где мой заказ?', 'Возврат'] };
    }
    if (/возврат|вернут|отмен/.test(text)) {
      pendingOrder = false;
      return { text: 'Для возврата бот уточнит заказ и причину, затем передаст обращение специалисту. Условия зависят от товара и правил конкретного магазина.\n\nЗдесь можно только посмотреть сценарий — реальный возврат не оформляется.', options: ['Оператор', 'Проверить заказ 1043', 'Доставка'] };
    }
    if (/заказ|\b104[23]\b/.test(text) || pendingOrder || /^#?\d+$/.test(text)) {
      const order = text.match(/\d+/)?.[0];
      pendingOrder = !order;
      if (!order) return { text: 'Напишите учебный номер заказа: 1042 или 1043. Настоящие номера здесь не нужны.', options: ['1042', '1043', 'Оператор'] };
      if (order === '1042') return { text: 'Учебный заказ №1042\nСтатус: передан курьеру.\nОжидаемая доставка в этом сценарии: завтра, с 10:00 до 18:00.\n\nВсе данные вымышленные. В рабочем боте статус можно получать из вашей системы заказов.', options: ['Доставка', 'Проверить заказ 1043', 'Оператор'] };
      if (order === '1043') return { text: 'Учебный заказ №1043\nСтатус: собирается на складе.\nСледующий шаг: передача в доставку.\n\nЭто тестовый статус, а не сведения о реальном заказе.', options: ['Доставка', 'Возврат', 'Оператор'] };
      pendingOrder = true;
      return { text: 'Такого заказа в демо нет. Попробуйте учебный номер 1042 или 1043.', options: ['1042', '1043', 'Оператор'] };
    }
    if (/привет|здравств|добрый/.test(text)) return { text: 'Привет! Я пример бота поддержки. Подскажу про доставку, оплату и возврат или проверю учебный заказ. С чего начнём?' };
    if (/спасибо|благодар/.test(text)) return { text: 'Пожалуйста! Можете проверить ещё один сценарий или начать диалог заново кнопкой «Сначала».' };
    return { text: 'В моём демо пока нет ответа на этот вопрос. Попробуйте доставку, оплату, возврат или заказ 1042. Сложный вопрос рабочий бот сможет передать человеку.', options: ['Где мой заказ?', 'Доставка', 'Оператор'] };
  }

  function submitMessage(raw) {
    if (replyTimer !== null) return;
    const text = raw.trim();
    if (!text || text.length > 500) {
      error.textContent = !text ? 'Напишите вопрос или выберите готовый вариант выше.' : 'Сократите сообщение до 500 символов.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    error.textContent = '';
    input.removeAttribute('aria-invalid');
    addMessage(text, true);
    input.value = '';
    setBusy(true);
    replyTimer = window.setTimeout(() => {
      replyTimer = null;
      const answer = answerFor(text);
      addMessage(answer.text);
      showOptions(answer.options);
      setBusy(false);
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550);
  }

  function clearConversation() {
    window.clearTimeout(replyTimer);
    replyTimer = null;
    pendingOrder = false;
    messages.replaceChildren();
    suggestions.replaceChildren();
    input.value = '';
    error.textContent = '';
    input.removeAttribute('aria-invalid');
    setBusy(false);
  }

  function resetConversation() {
    clearConversation();
    addMessage('Привет! Это демо поддержки магазина. Помогу с доставкой, оплатой, возвратом или учебным заказом. Нажмите вопрос ниже или напишите свой.');
    showOptions();
  }

  function openDemo(trigger) {
    if (dialog.open) return;
    previousTrigger = trigger || document.querySelector('[data-support-demo]');
    resetConversation();
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('support-open');
    dialog.querySelector('.support-close').focus();
  }

  document.querySelectorAll('[data-support-demo]').forEach(button => button.addEventListener('click', () => openDemo(button)));
  form.addEventListener('submit', event => { event.preventDefault(); submitMessage(input.value); });
  dialog.querySelector('#support-reset').addEventListener('click', () => { resetConversation(); input.focus(); });
  dialog.querySelector('.support-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    clearConversation();
    document.body.classList.remove('support-open');
    previousTrigger?.focus({ preventScroll: true });
  });
  window.addEventListener('hashchange', () => { if (location.hash === '#support-demo') openDemo(); });
  if (location.hash === '#support-demo') openDemo();
})();
