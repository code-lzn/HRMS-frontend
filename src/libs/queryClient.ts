import { QueryClient } from '@tanstack/react-query';

/**
 * 全局 QueryClient 配置
 * - staleTime: 30s，减少不必要的重新请求
 * - gcTime: 5min（v5 中替代 cacheTime）
 * - retry: 查询失败重试1次，变更不重试
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
