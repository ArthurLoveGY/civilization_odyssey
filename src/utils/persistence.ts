import Decimal from 'decimal.js';

/**
 * Deep merge persisted state with rehydration of Decimal instances
 *
 * This function recursively merges persisted state (from localStorage) with the
 * initial state, ensuring that any field that was originally a Decimal instance
 * is properly rehydrated as a new Decimal instance.
 *
 * @param persistedState - The state loaded from localStorage (JSON, no Decimal prototypes)
 * @param initialState - The initial state with proper Decimal instances
 * @returns The merged state with Decimal instances rehydrated
 */
export function deepMergeAndRehydrate<T>(persistedState: any, initialState: T): T {
  if (!persistedState || typeof persistedState !== 'object') {
    return initialState;
  }

  const result = { ...initialState };

  for (const key in persistedState) {
    if (!Object.prototype.hasOwnProperty.call(persistedState, key)) {
      continue;
    }

    const persistedValue = persistedState[key];
    const initialValue = (initialState as any)[key];

    // Skip undefined values in persisted state (allows schema evolution)
    if (persistedValue === undefined) {
      continue;
    }

    // If the initial value doesn't exist, skip (new fields)
    if (initialValue === undefined) {
      continue;
    }

    // Rehydrate Decimal instances
    if (initialValue instanceof Decimal) {
      result[key as keyof T] = new Decimal(persistedValue) as any;
      continue;
    }

    // Recursively merge objects (but not arrays)
    if (
      typeof persistedValue === 'object' &&
      persistedValue !== null &&
      !Array.isArray(persistedValue) &&
      typeof initialValue === 'object' &&
      initialValue !== null &&
      !Array.isArray(initialValue)
    ) {
      result[key as keyof T] = deepMergeAndRehydrate(persistedValue, initialValue) as any;
      continue;
    }

    // For primitives, arrays, and other types, use persisted value directly
    result[key as keyof T] = persistedValue as any;
  }

  return result;
}

/**
 * Create a rehydrate function for zustand persist middleware
 *
 * This is a higher-order function that creates a merge function specifically
 * designed for use with zustand's persist middleware.
 *
 * @param _initialState - The initial state of your store (kept for API compatibility, not currently used)
 * @returns A merge function compatible with zustand persist middleware
 */
export function createRehydrateMerge<T>(_initialState: T) {
  return (persistedState: any, currentState: T): T => {
    return deepMergeAndRehydrate(persistedState, currentState);
  };
}

/**
 * Helper to check if a value is a Decimal instance
 */
export function isDecimal(value: any): value is Decimal {
  return value instanceof Decimal;
}

/**
 * Helper to safely convert a value to Decimal
 */
export function toDecimal(value: any): Decimal {
  if (value instanceof Decimal) {
    return value;
  }
  try {
    return new Decimal(value ?? 0);
  } catch (e) {
    console.warn('Failed to convert to Decimal:', value);
    return new Decimal(0);
  }
}
