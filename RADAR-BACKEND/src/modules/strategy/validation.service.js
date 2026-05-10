const BASE_QUESTIONS = [
  'Who exactly has this problem?',
  'How are they solving it today?',
  'What is painful about current solutions?',
  'How often does this problem occur?',
  'Would they try a simpler solution?',
  'Would they pay for it?',
];

const FINANCE_QUESTIONS = [
  'How do you currently track your money?',
  'What frustrates you about your current method?',
  'How often do you check your finances?',
  'Have you tried budgeting apps before? Why did you stop?',
];

const getQuestionsByNiche = seed => {
  if (seed.niche === 'finance') {
    return [...BASE_QUESTIONS, ...FINANCE_QUESTIONS];
  }

  return BASE_QUESTIONS;
};

const buildValidationQuestions = seed => {
  if (!seed) {
    return ['Submit a valid idea to generate validation questions.'];
  }

  if (seed.verdict.label === 'avoid') {
    return [
      'This idea is too weak. Why does it fail?',
      'Is there a stronger adjacent problem?',
      'What would make this idea 10x more compelling?',
    ];
  }

  return getQuestionsByNiche(seed);
};

module.exports = {
  buildValidationQuestions,
};