export function parseTopics(text) {
  return text
    .split(/[\n,;]+/)
    .map(item => item.trim())
    .filter(Boolean);
}