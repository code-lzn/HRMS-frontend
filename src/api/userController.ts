// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

// ========== 本地 Mock 登录数据（无后端时使用） ==========
const MOCK_USERS: Record<
  string,
  {
    id: number;
    userName: string;
    userAccount: string;
    userRole: string;
    password: string;
  }
> = {
  admin: {
    id: 1,
    userName: '管理员',
    userAccount: 'admin',
    userRole: 'admin',
    password: '123456',
  },
  user: {
    id: 2,
    userName: '测试用户',
    userAccount: 'user',
    userRole: 'user',
    password: '123456',
  },
};

const LOCAL_LOGIN_KEY = 'hrms_mock_login_user';

/** 本地登录 mock：任意账号 + 密码 123456 即可登录（admin/user 拥有完整权限） */
function localLoginMock(
  body: API.UserLoginRequest,
): API.BaseResponseLoginUserVO_ {
  const account = body?.userAccount ?? '';
  const password = body?.userPassword ?? '';
  // admin/user 直接通过
  let user = MOCK_USERS[account];
  // 其它任意账号，只要密码是 123456 也允许登录（保证演示可用）
  if (!user && password === '123456') {
    user = {
      id: Date.now(),
      userName: account || '访客',
      userAccount: account,
      userRole: 'user',
      password,
    };
  }
  if (!user || user.password !== password) {
    return {
      code: 40000,
      message: '账号或密码错误（演示账号：admin / user，密码：123456）',
      data: null as any,
    } as any;
  }
  const userVo: API.LoginUserVO = {
    id: user.id,
    userName: user.userName,
    userAccount: user.userAccount,
    userRole: user.userRole,
    userAvatar:
      'https://api.dicebear.com/7.x/identicon/svg?seed=' + user.userAccount,
  };
  // 写入 localStorage 供后续 getLoginUser 使用
  try {
    localStorage.setItem(LOCAL_LOGIN_KEY, JSON.stringify(userVo));
  } catch {}
  return {
    code: 0,
    message: 'ok',
    data: userVo,
  } as any;
}

/** 本地获取当前登录用户 */
function localGetLoginUserMock(): API.BaseResponseLoginUserVO_ {
  try {
    const raw = localStorage.getItem(LOCAL_LOGIN_KEY);
    if (raw) {
      return { code: 0, message: 'ok', data: JSON.parse(raw) } as any;
    }
  } catch {}
  return { code: 40100, message: '未登录', data: null } as any;
}

/** 本地退出登录 */
function localLogoutMock(): API.BaseResponseBoolean_ {
  try {
    localStorage.removeItem(LOCAL_LOGIN_KEY);
  } catch {}
  return { code: 0, message: 'ok', data: true } as any;
}

/** addUser POST /api/user/add */
export async function addUserUsingPost(
  body: API.UserAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>('/api/user/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** deleteUser POST /api/user/delete */
export async function deleteUserUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/user/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getUserById GET /api/user/get */
export async function getUserByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserByIdUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseUser_>('/api/user/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** getLoginUser GET /api/user/get/login */
export async function getLoginUserUsingGet(options?: { [key: string]: any }) {
  // 优先使用本地 mock，避免无后端时 axios 请求失败 / 超时
  try {
    const mockRes = localGetLoginUserMock();
    if (mockRes.code === 0) {
      return mockRes;
    }
    // 本地无登录态时直接返回未登录，不再走 axios（避免 60s 超时）
    if (mockRes.code === 40100) {
      return mockRes;
    }
  } catch {}
  return request<API.BaseResponseLoginUserVO_>('/api/user/get/login', {
    method: 'GET',
    ...(options || {}),
  });
}

/** getUserVOById GET /api/user/get/vo */
export async function getUserVoByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserVOByIdUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseUserVO_>('/api/user/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** listUserByPage POST /api/user/list/page */
export async function listUserByPageUsingPost(
  body: API.UserQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageUser_>('/api/user/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** listUserVOByPage POST /api/user/list/page/vo */
export async function listUserVoByPageUsingPost(
  body: API.UserQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageUserVO_>('/api/user/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** userLogin POST /api/user/login */
export async function userLoginUsingPost(
  body: API.UserLoginRequest,
  options?: { [key: string]: any },
) {
  // 优先使用本地 mock，确保无后端时也能演示登录
  try {
    const mockRes = localLoginMock(body);
    if (mockRes.code === 0) {
      return mockRes;
    }
    // 本地 mock 校验失败时直接返回，不发请求
    if (mockRes.code === 40000) {
      return mockRes;
    }
  } catch {}
  return request<API.BaseResponseLoginUserVO_>('/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** userLogout POST /api/user/logout */
export async function userLogoutUsingPost(options?: { [key: string]: any }) {
  // 优先使用本地 mock
  try {
    return localLogoutMock();
  } catch {}
  return request<API.BaseResponseBoolean_>('/api/user/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** userRegister POST /api/user/register */
export async function userRegisterUsingPost(
  body: API.UserRegisterRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>('/api/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** updateUser POST /api/user/update */
export async function updateUserUsingPost(
  body: API.UserUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/user/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** updateMyUser POST /api/user/update/my */
export async function updateMyUserUsingPost(
  body: API.UserUpdateMyRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/user/update/my', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
