/**
 * 从 API 响应中安全提取 data 字段
 * 替代 (res as any)?.data ?? [] 模式，提供完整的类型推断
 *
 * @example
 * // 之前
 * const records = (res as any)?.data ?? [];
 * // 之后
 * const records = extractData<API.EmployeeVO[]>(res, []);
 */
export function extractData<T>(res: unknown, fallback: T): T {
  if (res && typeof res === 'object' && 'data' in res) {
    return (res as { data: T }).data;
  }
  return fallback;
}

/**
 * 从 API 响应中安全提取嵌套 data.xxx 字段
 * 适用于返回结构为 { code, msg, data: { xxx } } 的场景
 *
 * @example
 * const records = extractNested<API.EmployeeVO[]>('records', res, []);
 */
export function extractNested<T>(key: string, res: unknown, fallback: T): T {
  if (res && typeof res === 'object' && 'data' in res) {
    const data = (res as Record<string, unknown>).data;
    if (data && typeof data === 'object' && key in data) {
      return (data as Record<string, T>)[key];
    }
  }
  return fallback;
}

/**
 * 类型安全的错误消息提取
 * 替代 catch (e: any) { message.error(e.message) } 模式
 *
 * @example
 * try { ... } catch (e: unknown) {
 *   message.error(getErrorMessage(e, '操作失败'));
 * }
 */
export function getErrorMessage(e: unknown, defaultMsg = '操作失败'): string {
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  if (e && typeof e === 'object') {
    const obj = e as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
  }
  return defaultMsg;
}
