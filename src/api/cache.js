const TTL_MS = 20 * 60 * 1000; // 20 minutes

export function getCached(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  const { value, timestamp } = JSON.parse(raw);
  if (Date.now() - timestamp > TTL_MS) {
    localStorage.removeItem(key);
    return null;
  }
  return value;
}

export function setCached(key, value) {
  localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
}