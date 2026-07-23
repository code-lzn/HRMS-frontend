import {
  AuditOutlined,
  ClockCircleOutlined,
  ClusterOutlined,
  IdcardOutlined,
  PieChartOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Avatar, Button, Descriptions, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { getCalendarUsingGet } from '@/api/attendanceController';
import { getBalanceUsingGet } from '@/api/leaveController';
import { getMySalarySlipsUsingGet } from '@/api/salaryController';
import usePermission from '@/hooks/usePermission';
import styles from './index.less';

/** 时间段问候语 */
const getGreeting = (): string => {
  const h = dayjs().hour();
  if (h < 6) return '夜深了';
  if (h < 9) return '早上好';
  if (h < 12) return '上午好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
};

const ROLE_GRADIENT: Record<string, [string, string]> = {
  admin: ['#ff4d4f', '#cf1322'],
  hr: ['#1677ff', '#0958d9'],
  dept_head: ['#52c41a', '#389e0d'],
  finance: ['#fa8c16', '#d46b08'],
};
const DEFAULT_GRADIENT: [string, string] = ['#91caff', '#e6f4ff'];

const iconStyle = (color: string, bg: string): React.CSSProperties => ({
  color,
  background: bg,
});

const HomePage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const {
    hasPerm,
    canSeeEmployeeMenu,
    canSeeSalaryMenu,
    canSeeApprovalMenu,
    canSeeOrgMenu,
    isAdmin,
    dataScope,
    dataScopeDesc,
  } = usePermission();

  const currentUser = initialState?.currentUser;
  const roleCode = initialState?.roleCode ?? 'employee';
  const [grad1, grad2] = ROLE_GRADIENT[roleCode] ?? DEFAULT_GRADIENT;

  // 统计卡片数据
  const [attendanceDays, setAttendanceDays] = useState<number | null>(null);
  const [annualLeave, setAnnualLeave] = useState<number | null>(null);
  const [lastSalary, setLastSalary] = useState<number | null>(null);

  useEffect(() => {
    // 本月出勤天数
    getCalendarUsingGet({ month: dayjs().format('YYYY-MM') })
      .then((res) => { if (res?.data?.normalDays != null) setAttendanceDays(res.data.normalDays); })
      .catch(() => {});
    // 剩余年假
    getBalanceUsingGet()
      .then((res) => { if (res?.data?.annualRemaining != null) setAnnualLeave(res.data.annualRemaining); })
      .catch(() => {});
    // 最近薪资
    getMySalarySlipsUsingGet()
      .then((res) => {
        const slips = res?.data ?? [];
        if (slips.length > 0) {
          const latest = slips.reduce((a, b) =>
            (a.salaryMonth ?? '') > (b.salaryMonth ?? '') ? a : b
          );
          if (latest.netSalary != null) setLastSalary(latest.netSalary);
        }
      })
      .catch(() => {});
  }, []);

  if (!currentUser) {
    return (
      <PageContainer ghost>
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <SafetyCertificateOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
          <h2 style={{ color: '#8c8c8c', marginTop: 20 }}>请先登录</h2>
          <Button type="primary" size="large" onClick={() => history.push('/user/login')}>
            前往登录
          </Button>
        </div>
      </PageContainer>
    );
  }

  // === 快捷操作（按角色） ===
  const quickActions: { key: string; icon: React.ReactNode; bg: string; color: string; title: string; desc: string; path: string }[] = [];

  if (canSeeEmployeeMenu) {
    quickActions.push({
      key: 'employee', icon: <TeamOutlined />, bg: '#e6f4ff', color: '#1677ff',
      title: '员工管理', desc: '查看和管理员工信息', path: '/employee/list',
    });
  }
  if (hasPerm('employee:add')) {
    quickActions.push({
      key: 'addEmp', icon: <UserOutlined />, bg: '#f6ffed', color: '#52c41a',
      title: '新增员工', desc: '录入新员工档案', path: '/employee/add',
    });
  }
  if (canSeeSalaryMenu) {
    quickActions.push({
      key: 'salary', icon: <PieChartOutlined />, bg: '#fff7e6', color: '#fa8c16',
      title: '薪资管理', desc: '薪酬核算与发放', path: '/salary-manage/account',
    });
  }
  if (canSeeApprovalMenu) {
    quickActions.push({
      key: 'approval', icon: <AuditOutlined />, bg: '#f9f0ff', color: '#722ed1',
      title: '审批中心', desc: '处理待审批事项', path: '/approval/workbench',
    });
  }
  if (canSeeOrgMenu) {
    quickActions.push({
      key: 'org', icon: <ClusterOutlined />, bg: '#e6fffb', color: '#13c2c2',
      title: '组织架构', desc: '管理部门与职位', path: '/organization/department',
    });
  }
  if (isAdmin) {
    quickActions.push({
      key: 'admin', icon: <SettingOutlined />, bg: '#fff0f6', color: '#eb2f96',
      title: '系统管理', desc: '用户与角色配置', path: '/admin/dashboard',
    });
  }
  // 所有用户都有的入口
  quickActions.push({
    key: 'profile', icon: <IdcardOutlined />, bg: '#f0f5ff', color: '#597ef7',
    title: '我的档案', desc: '查看个人信息', path: '/personal/profile',
  });
  quickActions.push({
    key: 'attendance', icon: <ClockCircleOutlined />, bg: '#fcffe6', color: '#7cb305',
    title: '我的考勤', desc: '考勤记录与打卡', path: '/personal/attendance',
  });

  // === 统计卡片（按角色） ===
  const statCards: { key: string; icon: React.ReactNode; bg: string; color: string; label: string; value: string; desc?: string; path?: string }[] = [];

  if (roleCode === 'admin' || roleCode === 'hr') {
    statCards.push(
      { key: 'emp', icon: <TeamOutlined />, bg: '#e6f4ff', color: '#1677ff', label: '在职员工', value: '—', desc: '全公司' },
      { key: 'dept', icon: <ClusterOutlined />, bg: '#f6ffed', color: '#52c41a', label: '部门数', value: '—', desc: '组织架构' },
      { key: 'pending', icon: <AuditOutlined />, bg: '#fff7e6', color: '#fa8c16', label: '待审批', value: '—', desc: '需处理' },
      { key: 'salary', icon: <PieChartOutlined />, bg: '#f9f0ff', color: '#722ed1', label: '本月薪资', value: '—', desc: '核算中' },
    );
  } else if (roleCode === 'dept_head') {
    statCards.push(
      { key: 'team', icon: <TeamOutlined />, bg: '#e6f4ff', color: '#1677ff', label: '部门人数', value: '—', desc: '我的团队' },
      { key: 'pending', icon: <AuditOutlined />, bg: '#fff7e6', color: '#fa8c16', label: '待审批', value: '—', desc: '需处理' },
      { key: 'att', icon: <ClockCircleOutlined />, bg: '#f6ffed', color: '#52c41a', label: '今日出勤', value: '—', desc: '本部门' },
      { key: 'leave', icon: <ScheduleOutlined />, bg: '#f9f0ff', color: '#722ed1', label: '请假中', value: '—', desc: '当前' },
    );
  } else {
    statCards.push(
      { key: 'att', icon: <ClockCircleOutlined />, bg: '#e6f4ff', color: '#1677ff', label: '本月出勤', value: attendanceDays != null ? String(attendanceDays) : '—', desc: '正常天数', path: '/personal/attendance' },
      { key: 'leave', icon: <ScheduleOutlined />, bg: '#f6ffed', color: '#52c41a', label: '剩余年假', value: annualLeave != null ? `${annualLeave}天` : '—', desc: '可申请', path: '/personal/leave' },
      { key: 'salary', icon: <PieChartOutlined />, bg: '#fff7e6', color: '#fa8c16', label: '上月薪资', value: lastSalary != null ? `¥${lastSalary.toLocaleString()}` : '—', desc: '已发放', path: '/personal/salary' }
    );
  }

  return (
    <PageContainer ghost>
      <div className={styles.homePage}>
        {/* Welcome Banner */}
        <div className={styles.welcomeBanner} style={{ background: `linear-gradient(135deg, ${grad1} 0%, ${grad2} 100%)` }}>
          <div className={styles.welcomeGreeting}>
            {dayjs().format('YYYY年M月D日 dddd')} · {getGreeting()}
          </div>
          <div className={styles.welcomeName}>
            {currentUser.userName || '用户'}
          </div>
          <div className={styles.welcomeSubtitle}>
            <span>{dataScopeDesc || currentUser.roleName || '普通用户'}</span>
            <span className={styles.dot} />
            <span>欢迎使用人力资源管理系统</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className={styles.statRow}>
          {statCards.map((s) => (
            <div
              key={s.key}
              className={styles.statCard}
              onClick={() => s.path && history.push(s.path)}
              style={{ cursor: s.path ? 'pointer' : 'default' }}
            >
              <div className={styles.statIcon} style={iconStyle(s.color, s.bg)}>
                {s.icon}
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statValue}>{s.value}</div>
                {s.desc && <div className={styles.statDesc}>{s.desc}</div>}
              </div>
              <RightOutlined className={styles.statArrow} />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>快捷操作</span>
        </div>
        <div className={styles.quickActions}>
          {quickActions.slice(0, 8).map((a) => (
            <div
              key={a.key}
              className={styles.quickActionCard}
              onClick={() => history.push(a.path)}
            >
              <div className={styles.actionIcon} style={iconStyle(a.color, a.bg)}>
                {a.icon}
              </div>
              <div className={styles.actionTitle}>{a.title}</div>
              <div className={styles.actionDesc}>{a.desc}</div>
            </div>
          ))}
        </div>

        {/* Bottom Info Cards */}
        <div className={styles.bottomGrid}>
          {/* Personal Profile Summary */}
          <div className={styles.infoCard}>
            <div className={styles.infoCardHeader}>
              <span className={styles.infoCardTitle}>
                <IdcardOutlined style={{ marginRight: 8 }} />
                个人信息
              </span>
              <Button type="link" size="small" onClick={() => history.push('/personal/profile')}>
                查看详情
              </Button>
            </div>
            <Space size={24} align="start">
              <Avatar
                size={64}
                src={currentUser.userAvatar}
                icon={!currentUser.userAvatar && <UserOutlined />}
                style={{ flexShrink: 0 }}
              />
              <Descriptions column={2} size="small" colon={false}>
                <Descriptions.Item label="用户名">{currentUser.userName || '-'}</Descriptions.Item>
                <Descriptions.Item label="角色">
                  <Tag color={(ROLE_GRADIENT[roleCode]?.[0]) ?? '#8c8c8c'}>
                    {dataScopeDesc || currentUser.roleName || '普通用户'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="账号">{currentUser.userName || '-'}</Descriptions.Item>
                <Descriptions.Item label="注册时间">
                  {currentUser.createTime ? dayjs(currentUser.createTime).format('YYYY-MM-DD') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </div>

          {/* Quick Links / System Info */}
          <div className={styles.infoCard}>
            <div className={styles.infoCardHeader}>
              <span className={styles.infoCardTitle}>
                <ScheduleOutlined style={{ marginRight: 8 }} />
                常用链接
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {quickActions.slice(0, 6).map((a) => (
                <Button
                  key={a.key}
                  size="small"
                  type="default"
                  style={{ borderRadius: 8 }}
                  onClick={() => history.push(a.path)}
                >
                  {a.title}
                </Button>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: '12px 16px', background: '#fafafa', borderRadius: 8, fontSize: 12, color: '#8c8c8c', lineHeight: 1.8 }}>
              <div>系统时间：{dayjs().format('YYYY-MM-DD HH:mm:ss')}</div>
              <div>数据权限范围：{dataScopeDesc || '仅本人'}</div>
              <div>HRMS 人力资源管理系统 v1.0</div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default HomePage;
