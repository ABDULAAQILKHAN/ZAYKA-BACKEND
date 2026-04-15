export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toSnakeCase(v));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/(_\w)/g, (match) => match[1].toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}
