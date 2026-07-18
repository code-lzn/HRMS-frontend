/**
 * Global Constraints:
 * - All API endpoints under /api/v1/profile/*
 * - No userId parameter in any function (backend extracts from token)
 * - Use Ant Design 5 components
 * - Mock delay 300-800ms
 *
 * Service layer for profile module.
 * Currently re-exports mock implementations.
 * Switch to real API by replacing imports from './mock' to './real' (future).
 */

export {
  getProfile, updateProfile,
  getAttendanceCalendar, clock,
  getLeaves, cancelLeave,
  getSalaryList, sendSalaryVerifyCode, getSalaryDetail, getSalaryTrend,
  changePassword, changePhone, getLoginLogs, getPendingCount,
} from './mock';
