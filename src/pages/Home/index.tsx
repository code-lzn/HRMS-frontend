import Guide from '@/components/Guide';
import { trim } from '@/utils/format';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Result } from 'antd';
import { Link } from '@umijs/max';
import styles from './index.less';

const HomePage: React.FC = () => {
  const { name } = useModel('global');
  const { initialState } = useModel('@@initialState');

  if (!initialState?.currentUser) {
    return (
      <PageContainer ghost>
        <Result
          status="warning"
          title="未登录"
          subTitle="请先登录后再访问人力资源管理系统"
          extra={
            <Link to="/user/login">
              <Button type="primary">去登录</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <Guide name={trim(name)} />
      </div>
    </PageContainer>
  );
};

export default HomePage;
