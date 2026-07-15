import { Card, Empty } from 'antd';

const MyChanges: React.FC = () => {
  return (
    <Card title="我的人事异动">
      <Empty description="人事异动记录将在此展示" />
    </Card>
  );
};

export default MyChanges;
