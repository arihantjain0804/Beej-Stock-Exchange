const logger = require('./logger');

// ─── Twilio SMS ─────────────────────────────────────────────────────────────
// Same safe-default pattern as the data.gov.in commodity integration: if
// credentials aren't set, nothing breaks — sendSMS just returns false and
// the caller falls back to dev-mode (OTP logged + returned in the API
// response instead of texted). Every outcome is logged, same principle as
// fetchRealPrices — a silent no-op is what made "is this actually working"
// unanswerable there, so this never does that.

let client = null;
let initAttempted = false;

function getClient() {
  if (initAttempted) return client;
  initAttempted = true;

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    logger.warn('Twilio credentials not set — OTPs will be dev-mode only (logged, not texted)');
    return null;
  }

  try {
    // eslint-disable-next-line global-require
    const twilio = require('twilio');
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    logger.info('Twilio client initialized');
    return client;
  } catch (err) {
    logger.error('Twilio client init failed', { error: err.message });
    return null;
  }
}

/**
 * Send an SMS. Returns true if actually sent via Twilio, false if it fell
 * back (missing config, missing sender, or a Twilio-side send error) — the
 * caller decides what to do on false (e.g. keep the dev-mode OTP bypass).
 */
async function sendSMS(toPhone, body) {
  const c = getClient();
  if (!c) return false;

  const from = process.env.TWILIO_FROM_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  if (!from && !messagingServiceSid) {
    logger.warn('Twilio credentials set but no TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID — OTPs will be dev-mode only');
    return false;
  }

  try {
    const msg = await c.messages.create({
      to: toPhone,
      body,
      ...(messagingServiceSid ? { messagingServiceSid } : { from }),
    });
    logger.info('SMS sent via Twilio', { to: toPhone, sid: msg.sid, status: msg.status });
    return true;
  } catch (err) {
    // Common trial-account gotcha: Twilio trial accounts can only send to
    // phone numbers verified in the Twilio console. Surface that clearly
    // rather than a raw error code, since it's the most likely failure
    // during demo/testing with real judge/tester numbers.
    if (err.code === 21608) {
      logger.warn('Twilio send failed — number not verified (trial account restriction)', {
        to: toPhone,
        error: err.message,
      });
    } else {
      logger.warn('Twilio send failed — falling back to dev-mode OTP', {
        to: toPhone,
        code: err.code,
        error: err.message,
      });
    }
    return false;
  }
}

module.exports = { sendSMS };