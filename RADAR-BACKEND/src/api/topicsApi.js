const API_URL = 'http://localhost:3000';

export const analyzeTopicsRequest = async topics => {
  const response = await fetch(`${API_URL}/api/topics/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ topics }),
  });

  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.error?.message || 'Не удалось проанализировать темы.');
  }

  return body.data;
};

export const expandTopicRequest = async topic => {
  const response = await fetch(`${API_URL}/api/topics/expand`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ topic }),
  });

  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.error?.message || 'Не удалось раскрыть тему.');
  }

  return body.data;
};