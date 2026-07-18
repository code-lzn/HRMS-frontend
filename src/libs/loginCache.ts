/**
 * 登录用户缓存
 *
 * - sessionStorage 持久化：页面刷新不丢，但前端 dev server 重启会清除
 * - 内存缓存：SPA 内路由切换直接复用，无 sessionStorage I/O
 *
 * 流程：
 * 1. getInitialState 优先从 sessionStorage 恢复
 * 2. 登录成功后调用 setCachedLoginUser 同时写入内存和 sessionStorage
 * 3. 退出登录时调用 clearCachedLoginUser 清空内存和 sessionStorage
 */

const STORAGE_KEY = 'hrms_login_user';

let cachedUser: API.LoginUserVO | undefined = undefined;

export function getCachedLoginUser(): API.LoginUserVO | undefined {
  return cachedUser;
}

/** 登录成功后更新缓存（内存 + sessionStorage） */
export function setCachedLoginUser(user: API.LoginUserVO | undefined) {
  cachedUser = user;
  try {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

/** 退出登录时清空缓存（内存 + sessionStorage） */
export function clearCachedLoginUser() {
  cachedUser = undefined;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}
