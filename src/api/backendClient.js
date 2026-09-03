/**
 * Backend API Client
 * Centralized HTTP client for Google Apps Script Web App backend.
 *
 * Transport Contract:
 * - Method: POST
 * - Headers: Content-Type: text/plain;charset=utf-8 (Simple Request to avoid CORS preflight)
 * - Security: ANONYMOUS_WEB_APP_ENDPOINT, WEB_APP_URL_IS_NOT_A_SECRET
 */

export const BACKEND_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec";

export class BackendClient {
  constructor(endpointUrl = BACKEND_WEB_APP_URL, timeoutMs = 12000) {
    this.endpointUrl = endpointUrl;
    this.timeoutMs = timeoutMs;
  }

  async health() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.endpointUrl}?op=health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        return { ok: false, error: { code: "HTTP_ERROR", message: `HTTP status ${res.status}` } };
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      return { ok: false, error: { code: err.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR", message: err.message } };
    }
  }

  async submitScore(scoreData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const payload = {
      op: "submitScore",
      data: { ...scoreData }
    };

    try {
      const res = await fetch(this.endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return { ok: false, error: { code: "HTTP_ERROR", message: `HTTP status ${res.status}` } };
      }

      const json = await res.json();
      return json;
    } catch (err) {
      clearTimeout(timeoutId);
      return {
        ok: false,
        error: {
          code: err.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR",
          message: err.message
        }
      };
    }
  }
}
