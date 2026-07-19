// @ts-ignore
/* eslint-disable */
import request from '@/libs/request';

/** getMyLogs GET /api/mutation-logs/my */
export async function getMyLogsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListMutationLogVO_>('/api/mutation-logs/my', {
    method: 'GET',
    ...(options || {}),
  });
}
