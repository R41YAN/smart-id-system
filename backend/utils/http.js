/**
 * Sends a generic 500 response. The real error is logged on the server only,
 * so database/internal details are never exposed to the browser.
 */
function serverError(res, err, context = 'Server error') {
  console.error(`${context}:`, err);
  return res.status(500).json({ message: 'Server error' });
}

/**
 * Accepts only images that are safe to store and render in <img>:
 *  - data:image/(png|jpeg|webp|gif|svg+xml);base64,...
 *  - http(s):// URLs
 *  - built-in site paths such as /logos/uits.svg
 * Returns true for null/empty (meaning "no image").
 */
const MAX_IMAGE_LENGTH = 1.5 * 1024 * 1024; // ~1.1 MB of binary data
const DATA_URL_RE = /^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,[A-Za-z0-9+/]+={0,2}$/;
const SITE_PATH_RE = /^\/logos\/[a-z0-9_-]+\.(svg|png)$/i;

function isValidImage(value) {
  if (value === null || value === undefined || value === '') return true;
  if (typeof value !== 'string' || value.length > MAX_IMAGE_LENGTH) return false;
  if (DATA_URL_RE.test(value) || SITE_PATH_RE.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

module.exports = { serverError, isValidImage };
