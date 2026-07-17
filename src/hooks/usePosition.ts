import {
  getPositionListUsingGet,
  getSequencesUsingGet,
} from '@/api/positionController';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

interface PositionListParams {
  keyword?: string;
  sequence?: number;
  departmentId?: number;
  current?: number;
  pageSize?: number;
}

/**
 * 职位列表查询 hook
 */
export function usePositionList(params: PositionListParams) {
  return useQuery<API.PagePositionVO_>({
    queryKey: queryKeys.positions.list(params),
    queryFn: async () => {
      const res = await getPositionListUsingGet(params);
      return res.data as API.PagePositionVO_;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

/**
 * 职位序列枚举查询 hook
 */
export function useSequences() {
  return useQuery<Record<string, any>[]>({
    queryKey: queryKeys.positions.sequences(),
    queryFn: async () => {
      const res = await getSequencesUsingGet();
      return (res.data ?? []) as Record<string, any>[];
    },
    staleTime: 60 * 1000,
  });
}
