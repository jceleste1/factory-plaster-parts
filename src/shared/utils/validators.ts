/**
 * Validate batch ID format
 */
export function validateBatchId(id: string): boolean {
  // Batch ID format: BATCH-YYYYMMDD-00001
  const batchIdPattern = /^BATCH-\d{8}-\d{5}$/;
  return batchIdPattern.test(id);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Validate required value
 */
export function validateRequired(value: string | number | null | undefined): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Validate numeric value is positive
 */
export function validatePositive(value: number): boolean {
  return value > 0;
}

/**
 * Validate array is not empty
 */
export function validateNonEmpty<T>(arr: T[]): boolean {
  return Array.isArray(arr) && arr.length > 0;
}
