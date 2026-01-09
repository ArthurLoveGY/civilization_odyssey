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

/**
 * 存档元数据接口
 */
export interface SaveMetadata {
  exists: boolean;
  totalDays?: number;
  settlers?: number;
  currentSeason?: string;
  lastSaveTime?: number;
}

/**
 * 导出当前存档为 Base64 字符串
 *
 * 此函数会从 localStorage 读取游戏状态，将其序列化为 JSON，
 * 然后使用 Base64 编码，最后添加版本号和元数据。
 *
 * @returns Base64 编码的存档字符串
 * @throws 如果 localStorage 中没有存档数据
 */
export function exportSave(): string {
  const STORAGE_KEY = 'civ-odyssey-save';
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    throw new Error('没有找到存档数据');
  }

  // 解析 JSON 得到完整状态对象
  const state = JSON.parse(savedData);

  // 添加元数据
  const exportData = {
    version: 1,
    timestamp: Date.now(),
    state: state
  };

  // 转换为 JSON 并 Base64 编码
  // 使用 encodeURIComponent 处理中文字符
  const jsonString = JSON.stringify(exportData);
  const base64 = btoa(unescape(encodeURIComponent(jsonString)));

  return base64;
}

/**
 * 从 Base64 字符串导入存档
 *
 * 此函数会解码 Base64 字符串，解析 JSON，验证版本号，
 * 然后将状态写入 localStorage，最后刷新页面以触发 zustand persist 重新读取。
 *
 * @param base64String Base64 编码的存档字符串
 * @throws 如果字符串格式无效或版本不兼容
 */
export function importSave(base64String: string): void {
  try {
    // Base64 解码（使用对应的解码逻辑处理中文）
    const jsonString = decodeURIComponent(escape(atob(base64String)));

    // 解析 JSON
    const importData = JSON.parse(jsonString);

    // 验证结构
    if (!importData.version || !importData.state) {
      throw new Error('存档格式无效');
    }

    // 版本检查（未来支持迁移）
    if (importData.version !== 1) {
      throw new Error(`不支持的存档版本: ${importData.version}`);
    }

    // 写入 localStorage
    const STORAGE_KEY = 'civ-odyssey-save';
    const stateToSave = JSON.stringify(importData.state);
    localStorage.setItem(STORAGE_KEY, stateToSave);

    // 重新加载页面以触发 zustand persist 重新读取
    window.location.reload();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`导入失败: ${error.message}`);
    }
    throw new Error('导入失败: 未知错误');
  }
}

/**
 * 获取存档元数据
 *
 * 此函数从 localStorage 读取存档并提取元数据，用于 UI 显示。
 *
 * @returns 存档元数据，如果不存在则返回 exists: false
 */
export function getSaveMetadata(): SaveMetadata | null {
  const STORAGE_KEY = 'civ-odyssey-save';
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return { exists: false };
  }

  try {
    const state = JSON.parse(savedData);

    return {
      exists: true,
      totalDays: state.totalDays,
      settlers: state.resources?.settlers,
      currentSeason: state.currentSeason,
      lastSaveTime: Date.now() // 无法获取真实保存时间，使用当前时间近似
    };
  } catch (error) {
    console.error('Failed to parse save metadata:', error);
    return { exists: false };
  }
}
