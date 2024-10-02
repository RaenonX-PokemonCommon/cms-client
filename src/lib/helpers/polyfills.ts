// @ts-nocheck

/**
 * https://mathiasbynens.be/notes/globalthis
 */
export function polyfillGlobalThis() {
  if (typeof globalThis === 'object') return;
  try {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Object.prototype, '__magic__', {
      get: function() {
        return this;
      },
      configurable: true,
    });
    __magic__.globalThis = __magic__;
    delete Object.prototype.__magic__;
  } catch (e) {
    console.error(e);
    if (typeof self !== 'undefined') {
      self.globalThis = self;
    }
  }
}
