import { getPendingCount } from '@/api/approvalController';
import { useState, useCallback } from 'react';

const useApproval = () => {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const refreshPendingCount = useCallback(async () => {
    try {
      const res = await getPendingCount();
      if (res?.data?.total !== undefined) setPendingCount(res.data.total);
    } catch { /* 静默失败 */ }
  }, []);
  return { pendingCount, refreshPendingCount };
};

export default useApproval;
