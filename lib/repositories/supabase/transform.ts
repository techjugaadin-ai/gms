export function toCamelCaseKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function toSnakeCaseKey(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

export function toCamelCaseObject<T extends Record<string, any>>(row: T | null | undefined): any {
  if (!row) return row;

  return Object.entries(row).reduce((acc, [key, value]) => {
    acc[toCamelCaseKey(key)] = value;
    return acc;
  }, {} as Record<string, any>);
}

export function toSnakeCaseObject<T extends Record<string, any>>(input: T | null | undefined): any {
  if (!input) return input;

  return Object.entries(input).reduce((acc, [key, value]) => {
    acc[toSnakeCaseKey(key)] = value;
    return acc;
  }, {} as Record<string, any>);
}
