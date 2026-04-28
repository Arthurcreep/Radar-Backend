const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.RADAR_API_URL || 'http://localhost:3000';
const TEST_USER_ID = `radar_test_${Date.now()}`;

const testCasesPath = path.join(
  process.cwd(),
  'test-cases',
  'radar-test-cases.json'
);

const readTestCases = () => {
  const raw = fs.readFileSync(testCasesPath, 'utf-8');

  return JSON.parse(raw);
};

const postReport = async testCase => {
  const response = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': TEST_USER_ID,
    },
    body: JSON.stringify({
      seeds: [testCase.input],
    }),
  });

  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(
      `API request failed for "${testCase.name}": ${JSON.stringify(body)}`
    );
  }

  return body.data;
};

const deleteReport = async id => {
  await fetch(`${BASE_URL}/api/reports/${id}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': TEST_USER_ID,
    },
  });
};

const assertIncludes = (list, value, message) => {
  if (!list.includes(value)) {
    throw new Error(`${message}. Expected one of: ${list.join(', ')}. Got: ${value}`);
  }
};

const assertEquals = (actual, expected, message) => {
  if (actual !== expected) {
    throw new Error(`${message}. Expected: ${expected}. Got: ${actual}`);
  }
};

const validateReport = (testCase, report) => {
  const seed = report.seeds[0];

  if (!seed) {
    throw new Error(`No seed returned for "${testCase.name}"`);
  }

  const verdict = seed.verdict?.label;
  const decision = report.recommendation?.decision?.label;
  const rejectedSeeds = report.recommendation?.rejectedSeeds || [];

  const isRejected = rejectedSeeds.some(
    rejectedSeed => rejectedSeed.value === seed.value
  );

  assertIncludes(
    testCase.expected.allowedVerdicts,
    verdict,
    `[${testCase.name}] invalid verdict`
  );

  assertIncludes(
    testCase.expected.allowedDecisions,
    decision,
    `[${testCase.name}] invalid decision`
  );

  assertEquals(
    isRejected,
    testCase.expected.shouldReject,
    `[${testCase.name}] invalid rejected status`
  );

  return {
    name: testCase.name,
    value: seed.value,
    verdict,
    decision,
    finalScore: seed.scores.finalScore,
    rejected: isRejected,
  };
};

const run = async () => {
  const testCases = readTestCases();
  const createdReportIds = [];
  const results = [];

  console.log('\nRADAR product logic test started');
  console.log(`API: ${BASE_URL}`);
  console.log(`User: ${TEST_USER_ID}\n`);

  try {
    for (const testCase of testCases) {
      const report = await postReport(testCase);

      createdReportIds.push(report.id);

      const result = validateReport(testCase, report);
      results.push(result);

      console.log(
        `PASS ${result.name} | verdict=${result.verdict} | decision=${result.decision} | score=${result.finalScore}`
      );
    }

    console.log('\nAll RADAR tests passed.\n');

    console.table(results);
  } catch (error) {
    console.error('\nRADAR tests failed.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    for (const id of createdReportIds) {
      await deleteReport(id);
    }
  }
};

run();