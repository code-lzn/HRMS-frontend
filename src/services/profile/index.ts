/**
 * 服务层入口 — 切换数据源只需改下面一行的 import 路径：
 *   './mock' → 纯前端 Mock 开发
 *   './real' → 联调真实后端
 */

// ▼▼▼ 改这里 ▼▼▼
export {
  getProfile, updateProfile,
  getAttendanceCalendar, clock, getMySupplementCards,
  getLeaves, cancelLeave,
  getSalaryList, sendSalaryVerifyCode, getSalaryDetail, getSalaryTrend,
  changePassword, changePhone, getLoginLogs, getPendingCount,
} from './real';
// ▲▲▲ 改这里 ▲▲▲
