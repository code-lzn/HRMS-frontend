import { Card } from 'antd';
import { useProfile } from '@/hooks/useProfile';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { profile, loading, fetchProfile } = useProfile();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <Card loading={loading} title="我的档案">
      <div>个人档案页面（待实现）</div>
    </Card>
  );
}
