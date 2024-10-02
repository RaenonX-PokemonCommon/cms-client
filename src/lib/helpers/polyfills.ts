// @ts-nocheck

/**
 * https://mathiasbynens.be/notes/globalthis
 */
export function polyfillGlobalThis() {
  if (typeof globalThis === 'object') return;
  try {
    // Check if globalThis is available in different environments
    if (typeof self !== 'undefined') {
      self.globalThis = self;
    } else if (typeof window !== 'undefined') {
      window.globalThis = window;
    } else if (typeof global !== 'undefined') {
      global.globalThis = global;
    } else {
      throw new Error('Unable to polyfill globalThis');
    }
  } catch (e) {
    console.error('Failed to polyfill globalThis', {cause: e});
  }
}
