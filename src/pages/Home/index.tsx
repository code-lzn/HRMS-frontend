import { getPendingList } from '@/api/approvalController';
import { getEmployeeListUsingGet } from '@/api/employeeController';
import { getDepartmentDistributionUsingGet } from '@/api/salaryController';
import {
  AuditOutlined,
  BarChartOutlined,
  ClusterOutlined,
  DeploymentUnitOutlined,
  FileProtectOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Card, Col, Row, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import './index.less';

interface DashboardStats {
  totalEmployees: number;
  pendingApprovals: number;
  departmentCount: number;
}

const greeting = () => {
  const h = dayjs().hour();
  if (h < 8) return '早上好';
  if (h < 12) return '上午好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
};

const HomePage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingApprovals: 0,
    departmentCount: 0,
  });

  useEffect(() => {
    // 员工总数
    getEmployeeListUsingGet({ current: 1, pageSize: 1 })
      .then((res) => {
        const data = res?.data as any;
        setStats((s) => ({ ...s, totalEmployees: data?.total ?? 0 }));
      })
      .catch(() => {});

    // 待审批数量 — 与审批中心使用同一个接口和参数
    getPendingList({ current: 1, pageSize: 1000 } as any)
      .then((res) => {
        setStats((s) => ({
          ...s,
          pendingApprovals: (res?.data as any)?.total ?? 0,
        }));
      })
      .catch(() => {});

    // 部门数
    getDepartmentDistributionUsingGet()
      .then((res) => {
        const data = res?.data as any;
        if (Array.isArray(data)) {
          setStats((s) => ({ ...s, departmentCount: data.length }));
        }
      })
      .catch(() => {});
  }, []);

  const statCards = [
    {
      key: 'employees',
      title: '在职员工',
      value: stats.totalEmployees,
      icon: <TeamOutlined />,
      color: '#1677ff',
      bg: '#e6f4ff',
      onClick: () => history.push('/employees'),
    },
    {
      key: 'departments',
      title: '部门数',
      value: stats.departmentCount,
      icon: <ClusterOutlined />,
      color: '#52c41a',
      bg: '#f6ffed',
      onClick: () => history.push('/organization/departments'),
    },
    {
      key: 'approvals',
      title: '待办审批',
      value: stats.pendingApprovals,
      icon: <AuditOutlined />,
      color: '#fa8c16',
      bg: '#fff7e6',
      suffix: stats.pendingApprovals > 0 ? (
        <Tag color="error" style={{ marginLeft: 8 }}>
          待处理
        </Tag>
      ) : undefined,
      onClick: () => history.push('/approval/pending'),
    },
    {
      key: 'today',
      title: '今日日期',
      value: dayjs().format('M/DD'),
      icon: <ScheduleOutlined />,
      color: '#722ed1',
      bg: '#f9f0ff',
      suffix: (
        <span style={{ fontSize: 14, color: '#8c8c8c', marginLeft: 8 }}>
          {dayjs().format('dddd')}
        </span>
      ),
    },
  ];

  const quickActions = [
    {
      key: 'employees',
      icon: <SolutionOutlined />,
      label: '员工档案',
      desc: '查看和管理全体员工信息',
      path: '/employees',
      color: '#1677ff',
    },
    {
      key: 'org',
      icon: <ClusterOutlined />,
      label: '组织架构',
      desc: '部门与职位管理',
      path: '/organization/departments',
      color: '#52c41a',
    },
    {
      key: 'attendance',
      icon: <ScheduleOutlined />,
      label: '考勤管理',
      desc: '打卡、请假、加班与统计',
      path: '/attendance',
      color: '#fa8c16',
    },
    {
      key: 'salary',
      icon: <BarChartOutlined />,
      label: '薪资管理',
      desc: '账套、核算与工资条',
      path: '/salary/accounts',
      color: '#eb2f96',
    },
    {
      key: 'onboarding',
      icon: <UserSwitchOutlined />,
      label: '入转调离',
      desc: '入职、转正、调岗、离职',
      path: '/hr-change',
      color: '#13c2c2',
    },
    {
      key: 'approval',
      icon: <FileProtectOutlined />,
      label: '审批中心',
      desc: '处理待办审批与委托',
      path: '/approval',
      color: '#722ed1',
    },
    {
      key: 'profile',
      icon: <DeploymentUnitOutlined />,
      label: '个人中心',
      desc: '我的档案、考勤与薪资',
      path: '/profile',
      color: '#faad14',
    },
  ];

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      {/* 欢迎横幅 */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">
            {greeting()}
            {currentUser?.userName ? `，${currentUser.userName}` : ''}
          </h1>
          <p className="welcome-desc">
            欢迎使用人资管理系统 — 高效管理企业人力资源全生命周期
          </p>
        </div>
        <div className="welcome-illustration">
          <svg
            width="200"
            height="120"
            viewBox="0 0 400 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="80" cy="120" r="50" fill="#1677ff" opacity="0.15" />
            <circle cx="200" cy="80" r="40" fill="#52c41a" opacity="0.12" />
            <circle cx="320" cy="140" r="60" fill="#fa8c16" opacity="0.1" />
            <rect
              x="50"
              y="90"
              width="300"
              height="8"
              rx="4"
              fill="#1677ff"
              opacity="0.2"
            />
            <rect
              x="70"
              y="110"
              width="250"
              height="8"
              rx="4"
              fill="#52c41a"
              opacity="0.2"
            />
            <rect
              x="90"
              y="130"
              width="200"
              height="8"
              rx="4"
              fill="#fa8c16"
              opacity="0.2"
            />
          </svg>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.key}>
            <Card
              hoverable={!!card.onClick}
              onClick={card.onClick}
              className="stat-card"
              style={{ borderLeft: `4px solid ${card.color}` }}
            >
              <div className="stat-card-inner">
                <div className="stat-info">
                  <span className="stat-title">{card.title}</span>
                  <div className="stat-value-row">
                    <span className="stat-value">{card.value}</span>
                    {card.suffix}
                  </div>
                </div>
                <div
                  className="stat-icon"
                  style={{ backgroundColor: card.bg, color: card.color }}
                >
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 快捷操作 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="快捷功能" className="quick-actions-card">
            <Row gutter={[12, 12]}>
              {quickActions.map((action) => (
                <Col xs={12} sm={8} md={8} lg={8} key={action.key}>
                  <div
                    className="quick-action-item"
                    onClick={() => history.push(action.path)}
                  >
                    <div
                      className="quick-action-icon"
                      style={{ color: action.color }}
                    >
                      {action.icon}
                    </div>
                    <div className="quick-action-text">
                      <span className="quick-action-label">
                        {action.label}
                      </span>
                      <span className="quick-action-desc">
                        {action.desc}
                      </span>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 底部品牌栏 */}
      <div className="footer-brand">
        <span>HRMS 人资管理系统 v2.0</span>
        <span className="footer-divider">|</span>
        <span>高效 · 安全 · 智能</span>
      </div>
    </PageContainer>
  );
};

export default HomePage;
