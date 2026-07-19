/**
 * 登录用户缓存
 *
 * - sessionStorage 持久化：页面刷新不丢，但前端 dev server 重启会清除
 * - 内存缓存：SPA 内路由切换直接复用，无 sessionStorage I/O
 * - Token 存储在 sessionStorage，天然标签页隔离，支持多账号同时登录
 *
 * 流程：
 * 1. getInitialState 优先从 sessionStorage 恢复
 * 2. 登录成功后调用 setCachedLoginUser 同时写入内存和 sessionStorage
 * 3. 退出登录时调用 clearCachedLoginUser 清空内存和 sessionStorage
 */

const STORAGE_KEY = 'hrms_login_user';
const TOKEN_KEY = 'hrms_token';

let cachedUser: API.LoginUserVO | undefined = undefined;

export function getCachedLoginUser(): API.LoginUserVO | undefined {
  return cachedUser;
}

/** 获取当前标签页的 JWT Token */
export function getToken(): string | undefined {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || undefined;
  } catch {
    return undefined;
  }
}

/** 登录成功后更新缓存（内存 + sessionStorage） */
export function setCachedLoginUser(user: API.LoginUserVO | undefined) {
  cachedUser = user;
  try {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      // 同时存储 Token，供请求拦截器使用
      if (user.token) {
        sessionStorage.setItem(TOKEN_KEY, user.token);
      }
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
}

/** 退出登录时清空缓存（内存 + sessionStorage） */
export function clearCachedLoginUser() {
  cachedUser = undefined;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
}
