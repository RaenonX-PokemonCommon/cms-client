const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d*)?(?:[-+]\d{2}:?\d{2}|Z)?)?$/;

export const transformDatesInObject = (obj: any): any => {
  if (obj == null) {
    return obj;
  }

  if (typeof obj === 'string' && dateRegex.test(obj)) {
    return new Date(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(transformDatesInObject);
  }

  if (typeof obj === 'object') {
    const transformed: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        transformed[key] = transformDatesInObject(obj[key]);
      }
    }
    return transformed;
  }

  return obj;
};
