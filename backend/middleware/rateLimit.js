/**
 * Simple in-memory login rate limiter (no extra dependency).
 * After MAX_ATTEMPTS failed logins for the same IP + email within WINDOW_MS,
 * further attempts are blocked until the window passes. A successful login clears the counter.
 */
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const attempts = new Map(); // key -> { count, first }

function keyFor(req) {
  const email = String(req.body?.email || '').toLowerCase().trim();
  return `${req.ip}|${email}`;
}

function cleanup(now) {
  for (const [k, v] of attempts) {
    if (now - v.first > WINDOW_MS) attempts.delete(k);
  }
}

function loginRateLimit(req, res, next) {
  const now = Date.now();
  if (attempts.size > 10000) cleanup(now);

  const key = keyFor(req);
  const entry = attempts.get(key);
  if (entry && now - entry.first <= WINDOW_MS && entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.first + WINDOW_MS - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ message: `Too many failed login attempts. Try again in ${Math.ceil(retryAfter / 60)} minute(s).` });
  }

  // Count the attempt after the response is known
  res.on('finish', () => {
    if (res.statusCode === 401) {
      const cur = attempts.get(key);
      if (!cur || Date.now() - cur.first > WINDOW_MS) attempts.set(key, { count: 1, first: Date.now() });
      else cur.count += 1;
    } else if (res.statusCode === 200) {
      attempts.delete(key);
    }
  });
  next();
}

function resetLoginRateLimit() {
  attempts.clear();
}

module.exports = { loginRateLimit, resetLoginRateLimit };
