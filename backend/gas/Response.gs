/**
 * Base Typing Game Backend — Unified JSON Response Builder
 */

function createSuccessResponse(data) {
  var payload = {
    ok: true,
    data: data || {}
  };
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(code, message) {
  var payload = {
    ok: false,
    error: {
      code: code || CONFIG.ERROR_CODES.INTERNAL_ERROR,
      message: message || "An unexpected error occurred."
    }
  };
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
