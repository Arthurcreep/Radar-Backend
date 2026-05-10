import {
  categoryLabels,
  decisionLabels,
  intentLabels,
  riskLabels,
  sourceLabels,
} from '../constants/labels';

export function translateDecision(value) {
  return decisionLabels[value] || value || 'неизвестно';
}

export function translateSource(value) {
  return sourceLabels[value] || value || 'неизвестно';
}

export function translateCategory(value) {
  return categoryLabels[value] || value || 'другое';
}

export function translateIntent(value, fallback) {
  return intentLabels[value] || fallback || value || 'общий интерес';
}

export function translateRisk(value) {
  return riskLabels[value] || value || 'неизвестно';
}

export function translateReason(reason) {
  if (!reason) return '';

  const map = {
    'Real suggestions show enough signal to explore this topic further.':
      'По реальным поисковым подсказкам есть достаточно сигнала, чтобы изучить тему глубже.',
    'The topic is clickable, but risk and competition are high.':
      'Тема кликабельная, но риск и конкуренция высокие.',
    'Real suggestions exist, but the topic needs a sharper commercial or problem-driven angle.':
      'Поисковые подсказки есть, но теме нужен более четкий коммерческий угол или выраженная боль.',
    'No real suggestion data was returned by the provider.':
      'Провайдер не вернул реальные поисковые подсказки.',
    'Search demand exists, but this topic has adult/platform/payment restrictions.':
      'Спрос есть, но тема имеет adult/platform/payment ограничения.',
    'Real suggestions show strong opportunity signals across clickability and business intent.':
      'Поисковые подсказки показывают сильные сигналы по кликабельности и коммерческому намерению.',
  };

  return map[reason] || reason;
}

export function translateSuggestionReason(reason) {
  if (!reason) return '';

  const map = {
    'Purchase intent. Good signal for ecommerce, ads or lead generation.':
      'Есть намерение купить. Хороший сигнал для ecommerce, рекламы или лидогенерации.',
    'Local intent. Good signal for service businesses and lead generation.':
      'Есть локальный спрос. Хороший сигнал для услуг и лидогенерации.',
    'Service intent. Good signal for lead generation or service business.':
      'Сервисный запрос. Хороший сигнал для услуги, лидогенерации или сервисного бизнеса.',
    'Device/use-case intent. Useful for guides, apps, onboarding or product workflows.':
      'Запрос про устройство или сценарий использования. Подходит для гайдов, приложений, onboarding или workflow.',
    'Problem-driven query. Good signal for useful products or services.':
      'Запрос связан с проблемой. Хороший сигнал для полезного продукта или услуги.',
    'Review intent. Useful for comparison pages, affiliate, content or product research.':
      'Запрос на обзоры/сравнение. Подходит для контента, affiliate или исследования продукта.',
    'Educational intent. Useful for content, guides, courses or beginner products.':
      'Обучающий запрос. Подходит для гайдов, курсов, контента или продуктов для новичков.',
    'Attention-driven query. Good for content, but weaker commercial signal.':
      'Запрос на внимание/новости. Хорошо для контента, но коммерческий сигнал слабее.',
    'General search intent. Needs sharper validation before product decisions.':
      'Общий поисковый интерес. Нужно глубже проверить, прежде чем делать продуктовые выводы.',
  };

  return map[reason] || reason;
}

export function translateNoiseReason(reason) {
  if (!reason) return '';

  if (reason.includes('global noise marker')) {
    return 'Удалено: глобальный мусорный маркер.';
  }

  if (reason.includes('merged brand')) {
    return 'Удалено: похоже на склеенный бренд или нерелевантную сущность.';
  }

  if (reason.includes('does not contain the topic')) {
    return 'Удалено: подсказка не содержит тему как отдельное слово или известный синоним.';
  }

  if (reason.includes('raw topic')) {
    return 'Слабый сигнал: только исходная тема без полезного уточнения.';
  }

  if (reason.includes('casino')) {
    return 'Удалено: casino-связка нерелевантна для анализа этой темы.';
  }

  return reason;
}