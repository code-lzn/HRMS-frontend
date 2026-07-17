import { getDetailUsingGet } from '@/api/employeeController';
import {
  ArrowLeftOutlined,
  EditOutlined,
  HistoryOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  message,
  Result,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { history, useModel, useParams } from '@umijs/max';
import { hasPermission } from '@/utils/permission';
import ChangeHistoryDrawer from '../components/ChangeHistoryDrawer';
import useEmployeeFieldPermission from '@/hooks/useEmployeeFieldPermission';

const { Text } = Typography;

const STATUS_MAP: Record<number, { color: string; bg: string }> = {
  1: { color: '#1677ff', bg: '#e6f4ff' },
  2: { color: '#52c41a', bg: '#f6ffed' },
  3: { color: '#fa8c16', bg: '#fff7e6' },
  4: { color: '#999', bg: '#f5f5f5' },
};

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  FULL_TIME: '全职', PART_TIME: '兼职', INTERN: '实习',
};

/** 脱敏显示 */
const maskText = (text: string | undefined | null, prefixLen: number, suffixLen: number): string => {
  if (!text) return '-';
  if (text.length <= prefixLen + suffixLen) return text.slice(0, prefixLen) + '****';
  const prefix = text.slice(0, prefixLen);
  const suffix = text.slice(-suffixLen);
  return prefix + '*'.repeat(text.length - prefixLen - suffixLen) + suffix;
};

const CARD = { background: '#fff', borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' };

// ============================================================
// 字段行组件
// ============================================================
const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
    <span style={{ width: 90, flexShrink: 0, fontSize: 13, color: '#888' }}>{label}</span>
    <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{value ?? '-'}</span>
  </div>
);

/** 指标卡片组件 */
const MetricCard: React.FC<{ label: string; value: string | number | undefined | null }> = ({ label, value }) => (
  <Card style={{ background: '#eef0f4', borderRadius: 8, border: 'none', flex: 1 }}
    styles={{ body: { padding: '14px 16px' } }}>
    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: '#000' }}>{value ?? '-'}</div>
  </Card>
);

// ============================================================
// 页面组件
// ============================================================
const EmployeeDetailPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const params = useParams<{ id: string }>();
  const employeeId = Number(params.id);

  const canViewDetail =
    hasPermission(initialState?.currentUser, 'employee:list') ||
    hasPermission(initialState?.currentUser, 'employee:detail');

  if (!canViewDetail) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: 40, background: '#f5f7fa' }}>
        <Result status="403" title={<span style={{ fontSize: 20, fontWeight: 600 }}>暂无访问权限</span>}
          subTitle={<span style={{ color: '#8c8c8c' }}>您没有权限查看员工档案。如需开通权限，请联系系统管理员。</span>}
          extra={
            <Space>
              <Button type="primary" style={{ borderRadius: 6 }} onClick={() => history.push('/home')}>返回首页</Button>
              <Button style={{ borderRadius: 6 }} onClick={() => history.push('/employee/list')}>员工列表</Button>
            </Space>
          }
          style={{ background: '#fff', borderRadius: 16, padding: '48px 64px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        />
      </div>
    );
  }

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<API.EmployeeDetailVO | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'work' | 'salary'>('personal');

  const perm = useEmployeeFieldPermission(employeeId, detail);

  const fetchDetail = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const res = await getDetailUsingGet({ id: employeeId });
      setDetail((res as any)?.data ?? null);
    } catch (e: any) {
      message.error(e.message ?? '加载员工详情失败');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  if (!detail) return <div style={{ textAlign: 'center', padding: 64 }}><Text type="secondary">未找到该员工信息</Text></div>;

  const statusInfo = STATUS_MAP[detail.status ?? 0] ?? { color: '#999', bg: '#f5f5f5' };
  const hasSalary = detail.baseSalary != null || detail.contractType != null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f5f7fa' }}>
      {/* ===== Header 卡片 ===== */}
      <Card style={CARD} styles={{ body: { padding: 24 } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* 左侧：头像 + 基本信息 */}
          <div style={{ display: 'flex', gap: 20 }}>
            <Avatar size={64} icon={<UserOutlined />}
              style={{ background: 'linear-gradient(135deg, #1677ff, #69b1ff)', borderRadius: 12 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#000', lineHeight: '28px' }}>
                  {detail.employeeName ?? '-'}
                </span>
                <Tag style={{
                  borderRadius: 4, padding: '0 8px', fontSize: 12, fontWeight: 500,
                  background: statusInfo.bg, color: statusInfo.color, border: 'none',
                }}>
                  {detail.statusDesc}
                </Tag>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#666' }}>{detail.employeeNo}</span>
                <span style={{ color: '#ddd' }}>|</span>
                <span style={{ fontSize: 13, color: '#666' }}>{detail.departmentName ?? '-'}</span>
                <span style={{ color: '#ddd' }}>|</span>
                <span style={{ fontSize: 13, color: '#666' }}>{detail.positionName ?? '-'}</span>
                {detail.jobLevel && (
                  <Tag style={{ borderRadius: 4, background: '#f5f0ff', color: '#7c3aed', border: '1px solid #d8b4fe', fontSize: 12, fontWeight: 500 }}>
                    {detail.jobLevel}
                  </Tag>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#999' }}>
                <span>入职日期：{detail.hireDate?.slice(0, 10) ?? '-'}</span>
                <span>工龄：{detail.hireDate ? `${Math.floor((Date.now() - new Date(detail.hireDate).getTime()) / 31536000000)}年` : '-'}</span>
                <span>工作地：{detail.workLocation ?? '-'}</span>
              </div>
            </div>
          </div>

          {/* 右侧：按钮 */}
          <Space>
            <Button icon={<ArrowLeftOutlined />} style={{ borderRadius: 6, borderColor: '#d9d9d9' }}
              onClick={() => history.push('/employee/list')}>返回列表</Button>
            {perm.canSeeHistory && (
              <Button icon={<HistoryOutlined />} style={{ borderRadius: 6, borderColor: '#d9d9d9' }}
                onClick={() => setHistoryDrawerOpen(true)}>变更历史</Button>
            )}
            {perm.canEdit && (
              <Button type="primary" icon={<EditOutlined />}
                style={{ borderRadius: 6, background: '#1677ff' }}
                onClick={() => history.push(`/employee/edit/${employeeId}`)}>编辑档案</Button>
            )}
          </Space>
        </div>
      </Card>

      {/* ===== 4 个指标卡片 ===== */}
      <div style={{ display: 'flex', gap: 16 }}>
        <MetricCard label="直接汇报人" value={detail.directReportName} />
        <MetricCard label="入职类型" value={detail.employmentType ? (EMPLOYMENT_TYPE_MAP[detail.employmentType] ?? detail.employmentType) : '-'} />
        <MetricCard label="合同类型" value={detail.contractTypeDesc ?? '-'} />
        <MetricCard label="试用期待遇比例"
          value={detail.probationRatio != null ? `${(detail.probationRatio * 100).toFixed(0)}%` : '-'} />
      </div>

      {/* ===== Tab 切换栏 ===== */}
      <Card style={CARD} styles={{ body: { padding: 0 } }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
          {[
            { key: 'personal', label: '个人信息' },
            { key: 'work', label: '工作信息' },
            ...(hasSalary ? [{ key: 'salary', label: '薪资合同' }] : []),
          ].map((tab) => (
            <div key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1, padding: '14px 0', textAlign: 'center', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                color: activeTab === tab.key ? '#fff' : '#333',
                background: activeTab === tab.key ? '#1677ff' : '#fff',
                borderRight: '1px solid #f0f0f0', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (activeTab !== tab.key) e.currentTarget.style.background = '#fafafa'; }}
              onMouseLeave={(e) => { if (activeTab !== tab.key) e.currentTarget.style.background = '#fff'; }}>
              {tab.label}
            </div>
          ))}
        </div>

        {/* ===== Tab 内容 ===== */}
        <div style={{ padding: 20 }}>
          {/* --- 个人信息 Tab --- */}
          {activeTab === 'personal' && (
            <div style={{ display: 'flex', gap: 32 }}>
              {/* 左栏：基础信息 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#000', marginBottom: 12 }}>基础信息</div>
                <InfoRow label="工号" value={detail.employeeNo} />
                <InfoRow label="系统账号"
                  value={detail.account ? `${detail.account.slice(0, 3)}***${detail.account.slice(-2)}` : (detail.phone ? `${detail.phone.slice(0, 3)}***${detail.phone.slice(-2)}` : '-')} />
                <InfoRow label="在职状态"
                  value={<Tag style={{ borderRadius: 4, background: statusInfo.bg, color: statusInfo.color, border: 'none' }}>{detail.statusDesc}</Tag>} />
                <InfoRow label="入职日期" value={detail.hireDate?.slice(0, 10)} />
                <InfoRow label="创建时间" value={detail.createTime} />
              </div>
              {/* 右栏：个人信息 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#000', marginBottom: 12 }}>个人信息</div>
                <InfoRow label="姓名" value={detail.employeeName} />
                <InfoRow label="性别" value={detail.genderDesc} />
                <InfoRow label="手机号"
                  value={perm.canSeeSensitivePersonal ? detail.phone : maskText(detail.phone, 3, 4)} />
                <InfoRow label="邮箱" value={perm.canSeeSensitivePersonal ? detail.email : '****'} />
                <InfoRow label="身份证号"
                  value={perm.canSeeIdCard ? detail.idCard : maskText(detail.idCard, 4, 4)} />
                <InfoRow label="生日" value={detail.birthday} />
                <InfoRow label="户籍地址" value={perm.canSeeRegisteredAddress ? detail.registeredAddress : '****'} />
                <InfoRow label="现居住地址" value={perm.canSeeSensitivePersonal ? detail.currentAddress : '****'} />
              </div>
            </div>
          )}

          {/* --- 工作信息 Tab --- */}
          {activeTab === 'work' && (
            <div style={{ maxWidth: 500 }}>
              <InfoRow label="所属部门" value={detail.departmentName} />
              <InfoRow label="职位" value={detail.positionName} />
              <InfoRow label="直接汇报人" value={detail.directReportName} />
              <InfoRow label="工作地点" value={detail.workLocation} />
              <InfoRow label="录用类型" value={detail.employmentType ? (EMPLOYMENT_TYPE_MAP[detail.employmentType] ?? detail.employmentType) : '-'} />
            </div>
          )}

          {/* --- 薪资合同 Tab --- */}
          {activeTab === 'salary' && hasSalary && (
            <div style={{ maxWidth: 500 }}>
              <InfoRow label="合同类型" value={detail.contractTypeDesc} />
              <InfoRow label="合同到期日" value={detail.contractExpireDate} />
              <InfoRow label="试用期待遇比例"
                value={detail.probationRatio != null ? `${(detail.probationRatio * 100).toFixed(0)}%` : '-'} />
              <InfoRow label="基本工资"
                value={detail.baseSalary != null ? `¥${detail.baseSalary.toFixed(2)}` : '-'} />
              <InfoRow label="银行账号" value={detail.bankAccount ? maskText(detail.bankAccount, 0, 4) : '-'} />
              <InfoRow label="开户行" value={detail.bankName} />
            </div>
          )}
        </div>
      </Card>

      {/* ===== 变更历史抽屉 ===== */}
      <ChangeHistoryDrawer open={historyDrawerOpen} employeeId={employeeId}
        onClose={() => setHistoryDrawerOpen(false)} />
    </div>
  );
};

export default EmployeeDetailPage;
