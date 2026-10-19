/**
 * Stenna Backend Logger
 * Provides structured, colorized, timestamped console logs for API requests,
 * business logic events, and detailed error / Zod validation diagnostics.
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function maskSensitive(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(maskSensitive);

  const clone = {};
  for (const [key, val] of Object.entries(obj)) {
    if (['password', 'password_hash', 'token', 'authorization'].includes(key.toLowerCase())) {
      clone[key] = '***';
    } else if (typeof val === 'object' && val !== null) {
      clone[key] = maskSensitive(val);
    } else {
      clone[key] = val;
    }
  }
  return clone;
}

export const logger = {
  info: (msg, meta) => {
    const time = `${colors.gray}[${formatTimestamp()}]${colors.reset}`;
    const tag = `${colors.cyan}${colors.bright}[INFO]${colors.reset}`;
    console.log(`${time} ${tag} ${msg}`, meta ? JSON.stringify(maskSensitive(meta)) : '');
  },

  success: (msg, meta) => {
    const time = `${colors.gray}[${formatTimestamp()}]${colors.reset}`;
    const tag = `${colors.green}${colors.bright}[SUCCESS]${colors.reset}`;
    console.log(`${time} ${tag} ${msg}`, meta ? JSON.stringify(maskSensitive(meta)) : '');
  },

  warn: (msg, meta) => {
    const time = `${colors.gray}[${formatTimestamp()}]${colors.reset}`;
    const tag = `${colors.yellow}${colors.bright}[WARN]${colors.reset}`;
    console.warn(`${time} ${tag} ${msg}`, meta ? JSON.stringify(maskSensitive(meta)) : '');
  },

  error: (msg, error, meta) => {
    const time = `${colors.gray}[${formatTimestamp()}]${colors.reset}`;
    const tag = `${colors.red}${colors.bright}[ERROR]${colors.reset}`;
    console.error(`${time} ${tag} ${colors.red}${msg}${colors.reset}`);

    if (error) {
      if (error.name === 'ZodError') {
        console.error(`${colors.yellow}↳ Zod Validation Failures:${colors.reset}`);
        (error.errors || []).forEach((err, idx) => {
          const path = err.path && err.path.length > 0 ? err.path.join('.') : '(root)';
          console.error(`  ${idx + 1}. Field: ${colors.bright}${path}${colors.reset} | Issue: ${colors.yellow}${err.message}${colors.reset} (code: ${err.code})`);
        });
      } else {
        console.error(`${colors.red}↳ ${error.stack || error.message}${colors.reset}`);
      }
    }

    if (meta) {
      console.error(`${colors.gray}↳ Context:${colors.reset}`, JSON.stringify(maskSensitive(meta), null, 2));
    }
  },

  http: (req, res, durationMs) => {
    const status = res.statusCode;
    const color = status >= 500 ? colors.red : status >= 400 ? colors.yellow : colors.green;
    const time = `${colors.gray}[${formatTimestamp()}]${colors.reset}`;
    const method = `${colors.bright}${req.method.padEnd(6)}${colors.reset}`;
    const url = req.originalUrl || req.url;
    console.log(`${time} ${method} ${url} ${color}${status}${colors.reset} (${durationMs}ms)`);
  }
};

export default logger;
