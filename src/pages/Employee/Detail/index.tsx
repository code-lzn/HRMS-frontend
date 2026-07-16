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
  Collapse,
  Descriptions,
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

const { Title, Text } = Typography;

const STATUS_MAP: Record<number, { color: string }> = {
  1: { color: 'blue' },
  2: { color: 'green' },
  3: { color: 'orange' },
  4: { color: 'default' },
};

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  FULL_TIME: '全职',
  PART_TIME: '兼职',
  INTERN: '实习',
};

/** 脱敏显示：隐藏中间部分用 * 替换 */
const maskText = (text: string | undefined | null, prefixLen: number, suffixLen: number): string => {
  if (!text) return '-';
  if (text.length <= prefixLen + suffixLen) {
    return text.slice(0, prefixLen) + '****';
  }
  const prefix = text.slice(0, prefixLen);
  const suffix = text.slice(-suffixLen);
  const maskLen = text.length - prefixLen - suffixLen;
  return prefix + '*'.repeat(Math.max(maskLen, 1)) + suffix;
};

const EmployeeDetailPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const params = useParams<{ id: string }>();
  const employeeId = Number(params.id);

  // 无权限查看详情
  const canViewDetail =
    hasPermission(initialState?.currentUser, 'employee:list') ||
    hasPermission(initialState?.currentUser, 'employee:detail');
  if (!canViewDetail) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '60vh', padding: 40,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8edf2 100%)',
      }}>
        <Result
          status="403"
          title={<span style={{ fontSize: 20, fontWeight: 600 }}>暂无访问权限</span>}
          subTitle={
            <span style={{ color: '#8c8c8c' }}>
              您没有权限查看员工档案。如需开通权限，请联系系统管理员。
            </span>
          }
          extra={
            <Space>
              <Button type="primary" onClick={() => history.push('/home')} style={{ borderRadius: 8 }}>
                返回首页
              </Button>
              <Button onClick={() => history.push('/employee/list')} style={{ borderRadius: 8 }}>
                员工列表
              </Button>
            </Space>
          }
          style={{
            background: '#fff', borderRadius: 16, padding: '48px 64px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        />
      </div>
    );
  }

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<API.EmployeeDetailVO | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

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

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <Text type="secondary">未找到该员工信息</Text>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[detail.status ?? 0] ?? { color: 'default' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 页面头部 */}
      <Card size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar size={56} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {detail.employeeName ?? '-'}
                <Text type="secondary" style={{ marginLeft: 12, fontSize: 14 }}>
                  {detail.employeeNo}
                </Text>
              </Title>
              <Tag color={statusInfo.color} style={{ marginTop: 4 }}>
                {detail.statusDesc}
              </Tag>
            </div>
          </div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/employee/list')}>
              返回列表
            </Button>
            {perm.canSeeHistory && (
              <Button
                icon={<HistoryOutlined />}
                onClick={() => setHistoryDrawerOpen(true)}
              >
                变更历史
              </Button>
            )}
            {perm.canEdit && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => history.push(`/employee/edit/${employeeId}`)}
              >
                编辑
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* 基础信息 */}
      <Card title="基础信息" size="small">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="工号">{detail.employeeNo ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="系统账号">{detail.account ? `${detail.account.slice(0, 3)}***${detail.account.slice(-2)}` : (detail.phone ? `${detail.phone.slice(0, 3)}***${detail.phone.slice(-2)}` : '-')}</Descriptions.Item>
          <Descriptions.Item label="在职状态">
            <Tag color={statusInfo.color}>{detail.statusDesc ?? '-'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="入职日期">{detail.hireDate ? detail.hireDate.slice(0, 10) : '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{detail.createTime ?? '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 四分区可折叠卡片 */}
      <Collapse defaultActiveKey={['personal', 'work', ...(perm.canSeeSalary ? ['salary'] : []), ...(perm.canSeeEmergency ? ['emergency'] : [])]}>
        {/* 个人信息 */}
        <Collapse.Panel header="个人信息" key="personal">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="姓名">{detail.employeeName ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="性别">{detail.genderDesc ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="手机号">
              {perm.canSeeSensitivePersonal ? (detail.phone ?? '-') : maskText(detail.phone, 3, 4)}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">
              {perm.canSeeSensitivePersonal ? (detail.email ?? '-') : '****'}
            </Descriptions.Item>
            <Descriptions.Item label="身份证号">
              {perm.canSeeIdCard ? (detail.idCard ?? '-') : maskText(detail.idCard, 4, 4)}
            </Descriptions.Item>
            <Descriptions.Item label="生日">{detail.birthday ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="户籍地址" span={2}>
              {perm.canSeeRegisteredAddress ? (detail.registeredAddress ?? '-') : '****'}
            </Descriptions.Item>
            <Descriptions.Item label="现居住地址" span={2}>
              {perm.canSeeSensitivePersonal ? (detail.currentAddress ?? '-') : '****'}
            </Descriptions.Item>
          </Descriptions>
        </Collapse.Panel>

        {/* 工作信息 */}
        <Collapse.Panel header="工作信息" key="work">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="所属部门">{detail.departmentName ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="职位">{detail.positionName ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="直接汇报人">{detail.directReportName ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="工作地点">{detail.workLocation ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="录用类型">
              {detail.employmentType
                ? (EMPLOYMENT_TYPE_MAP[detail.employmentType] ?? detail.employmentType)
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        </Collapse.Panel>

        {/* 薪资与合同信息 — 仅特定角色可见 */}
        {perm.canSeeSalary && (
          <Collapse.Panel header="薪资与合同信息" key="salary">
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="合同类型">{detail.contractTypeDesc ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="合同到期日">{detail.contractExpireDate ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="试用期待遇比例">
                {detail.probationRatio !== null && detail.probationRatio !== undefined ? `${(detail.probationRatio * 100).toFixed(0)}%` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="基本工资">
                {detail.baseSalary !== null && detail.baseSalary !== undefined ? `¥${detail.baseSalary.toFixed(2)}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="银行账号">
                {detail.bankAccount ? maskText(detail.bankAccount, 0, 4) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="开户行">{detail.bankName ?? '-'}</Descriptions.Item>
            </Descriptions>
          </Collapse.Panel>
        )}

        {/* 紧急联系人 — 仅特定角色可见 */}
        {perm.canSeeEmergency && (
          <Collapse.Panel header="紧急联系人" key="emergency">
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="联系人姓名">{detail.emergencyContactName ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="联系人电话">
                {detail.emergencyContactPhone
                  ? maskText(detail.emergencyContactPhone, 3, 4)
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Collapse.Panel>
        )}
      </Collapse>

      {/* 变更历史抽屉 */}
      <ChangeHistoryDrawer
        open={historyDrawerOpen}
        employeeId={employeeId}
        onClose={() => setHistoryDrawerOpen(false)}
      />
    </div>
  );
};

export default EmployeeDetailPage;
