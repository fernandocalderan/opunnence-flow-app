const flows = {
  inmobiliaria: {
    label: 'Inmobiliaria',
    intro: 'Listo. Flow IA está captando interesados en tus propiedades y validando su financiación.',
    script: [
      'Perfecto. Para ayudarte mejor, ¿es algo inmediato o están comparando opciones?',
      'Tengo demanda activa en tu zona. ¿Es para venta o alquiler?',
      'Puedo agendar visitas con clientes validados. ¿Quieres que priorice quienes ya tienen financiación aprobada?'
    ],
    closing: 'Configuré la agenda y prioricé a los leads listos para visita.'
  },
  restaurante: {
    label: 'Restaurante',
    intro: 'Flow IA está en tu web tomando reservas y empujando horarios con mayor margen.',
    script: [
      '¿Buscamos reservas para hoy o campañas para el fin de semana?',
      '¿Qué ticket medio quieres priorizar esta semana?',
      'Puedo redirigir grupos a tu mejor horario. ¿Activo sala principal o terraza?'
    ],
    closing: 'Reservas optimizadas. Prioricé mesas rentables y confirmé asistencia.'
  },
  servicios: {
    label: 'Servicios profesionales',
    intro: 'Flow IA atiende consultas, cualifica y agenda reuniones en tu calendario.',
    script: [
      '¿Qué servicio quieres impulsar primero?',
      '¿Prefieres leads con urgencia inmediata o proyectos en evaluación?',
      'Puedo generar una propuesta base y enviarla antes de agendar. ¿Lo activo?'
    ],
    closing: 'Agenda abierta y leads priorizados según urgencia y presupuesto.'
  },
  ecommerce: {
    label: 'Ecommerce',
    intro: 'Flow IA recupera carritos y dinamiza clientes de alto ticket en tiempo real.',
    script: [
      '¿Qué categoría quieres impulsar primero?',
      '¿Cuál es el AOV objetivo para esta semana?',
      'Puedo activar push cuando el stock baja y priorizar clientes recurrentes. ¿Lo dejo listo?'
    ],
    closing: 'Segmentación activa: recurrencia, alto ticket y stock crítico listos.'
  }
};

const state = {
  business: null,
  flowIndex: 0,
  score: 42,
  intent: 'Media',
  budget: '€€',
  urgency: 'Media',
  qualified: false,
  locked: false,
  automationStarted: false
};

const elements = {
  selectPhase: document.getElementById('phase-select'),
  chatPhase: document.getElementById('phase-chat'),
  automationPhase: document.getElementById('phase-automation'),
  ctaPhase: document.getElementById('phase-cta'),
  timeline: document.getElementById('chat-timeline'),
  businessLabel: document.getElementById('business-label'),
  scoreNumber: document.getElementById('score-number'),
  scoreBar: document.getElementById('score-bar-fill'),
  intentValue: document.getElementById('intent-value'),
  budgetValue: document.getElementById('budget-value'),
  urgencyValue: document.getElementById('urgency-value'),
  statusPill: document.getElementById('status-pill'),
  automationList: document.getElementById('automation-list'),
  automationNote: document.getElementById('automation-note')
};

const businessCards = Array.from(document.querySelectorAll('.business-card'));
const quickReplies = Array.from(document.querySelectorAll('.quick-reply'));

businessCards.forEach(card => {
  card.addEventListener('click', () => startDemo(card.dataset.type));
});

quickReplies.forEach(btn => {
  btn.addEventListener('click', () => handleUserReply(btn.dataset.message));
});

function startDemo(type) {
  const selected = flows[type];
  if (!selected) return;

  resetState(type);
  elements.businessLabel.textContent = selected.label;
  elements.selectPhase.classList.add('hidden');
  elements.chatPhase.classList.remove('hidden');
  elements.timeline.innerHTML = '<div class="system-note">Flow IA replica tu tono comercial y mantiene la conversación en la web.</div>';

  addFlowMessage(`Configuré Flow IA para ${selected.label}.`, () => {
    addFlowMessage(selected.intro);
  }, 500);
}

function resetState(type) {
  state.business = type;
  state.flowIndex = 0;
  state.score = 42;
  state.intent = 'Media';
  state.budget = '€€';
  state.urgency = 'Media';
  state.qualified = false;
  state.locked = false;
  state.automationStarted = false;
  setQuickRepliesDisabled(false);
  updateIndicators(true);
}

function handleUserReply(message) {
  if (!state.business || state.locked || state.automationStarted) return;
  setQuickRepliesDisabled(true);
  addUserMessage(message);
  adjustScoreForReply(message);

  const flow = flows[state.business];
  const response = flow.script[state.flowIndex];
  state.flowIndex += 1;

  if (response) {
    addFlowMessage(response, () => {
      if (state.flowIndex >= flow.script.length) {
        triggerClosing(flow);
      } else {
        setQuickRepliesDisabled(false);
      }
    });
  } else {
    triggerClosing(flow);
  }
}

function triggerClosing(flow) {
  setQuickRepliesDisabled(true);
  if (flow.closing) {
    addFlowMessage(flow.closing, () => startAutomation(), 500);
  } else {
    startAutomation();
  }
}

function addUserMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'message user';
  msg.innerHTML = `<div>${text}</div><img class="avatar" src="assets/avatar-user.svg" alt="Usuario" />`;
  elements.timeline.appendChild(msg);
  elements.timeline.scrollTop = elements.timeline.scrollHeight;
}

function addFlowMessage(text, callback, delay) {
  const typing = document.createElement('div');
  typing.className = 'message flow';
  typing.innerHTML = `<img class="avatar" src="assets/avatar-flow.svg" alt="Flow IA" /><div class="typing"><span></span><span></span><span></span></div>`;
  elements.timeline.appendChild(typing);
  elements.timeline.scrollTop = elements.timeline.scrollHeight;
  state.locked = true;

  const wait = typeof delay === 'number' ? delay : randomDelay();

  setTimeout(() => {
    typing.remove();
    const msg = document.createElement('div');
    msg.className = 'message flow';
    msg.innerHTML = `<img class="avatar" src="assets/avatar-flow.svg" alt="Flow IA" /><div>${text}</div>`;
    elements.timeline.appendChild(msg);
    elements.timeline.scrollTop = elements.timeline.scrollHeight;
    bumpScore(4);
    state.locked = false;
    if (callback) callback();
  }, wait);
}

function adjustScoreForReply(message) {
  const boosts = {
    'Quiero información': 12,
    Precio: 16,
    'Hablar con alguien': 20
  };

  bumpScore(boosts[message] || 8);

  if (message === 'Precio') {
    state.budget = '€€€';
    state.intent = state.intent === 'Alta' ? 'Alta' : 'Media';
  }

  if (message === 'Quiero información') {
    state.intent = state.intent === 'Alta' ? 'Alta' : 'Media';
  }

  if (message === 'Hablar con alguien') {
    state.urgency = 'Alta';
    state.intent = 'Alta';
    state.qualified = true;
  }

  updateIndicators();
}

function bumpScore(amount) {
  const next = Math.min(100, state.score + amount);
  animateScore(state.score, next);
  state.score = next;
  updateIndicators();
}

function animateScore(from, to) {
  const start = performance.now();
  const duration = 420;

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(from + (to - from) * eased);
    elements.scoreNumber.textContent = value;
    elements.scoreBar.style.width = `${Math.min(100, value)}%`;
    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function updateIndicators(force) {
  const computedIntent = state.intent || (state.score >= 80 ? 'Alta' : state.score >= 60 ? 'Media' : 'Baja');
  const computedUrgency = state.urgency || (state.score >= 70 ? 'Alta' : 'Media');
  const isQualified = state.qualified || state.score >= 70;

  if (force) {
    elements.scoreNumber.textContent = state.score;
    elements.scoreBar.style.width = `${state.score}%`;
  }

  elements.intentValue.textContent = computedIntent;
  elements.budgetValue.textContent = state.budget;
  elements.urgencyValue.textContent = computedUrgency;
  elements.statusPill.textContent = isQualified ? 'Cualificado' : 'No cualificado';
  elements.statusPill.className = isQualified ? 'status ready' : 'status';

  state.intent = computedIntent;
  state.urgency = computedUrgency;
  state.qualified = isQualified;
}

function startAutomation() {
  if (state.automationStarted) return;
  state.automationStarted = true;
  setQuickRepliesDisabled(true);
  elements.automationPhase.classList.remove('hidden');
  elements.automationPhase.scrollIntoView({ behavior: 'smooth', block: 'center' });
  elements.statusPill.textContent = 'Cualificado';
  elements.statusPill.className = 'status ready';

  const items = Array.from(elements.automationList.querySelectorAll('[data-check]'));
  items.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add('done');
      const texts = [
        'Lead guardado en CRM',
        'Lead priorizado con scoring alto',
        'Cita agendada en calendario',
        'Comercial notificado con contexto'
      ];
      elements.automationNote.textContent = texts[index] || 'Flow IA ejecuta automáticamente sin intervención humana.';
    }, 550 * index);
  });

  setTimeout(() => {
    elements.automationNote.textContent = 'Flow IA ejecuta automáticamente sin intervención humana.';
    showCTA();
  }, 550 * items.length + 600);
}

function showCTA() {
  elements.ctaPhase.classList.remove('hidden');
  elements.ctaPhase.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setQuickRepliesDisabled(disabled) {
  quickReplies.forEach(btn => {
    btn.disabled = disabled;
  });
}

function randomDelay() {
  return 300 + Math.floor(Math.random() * 400);
}
