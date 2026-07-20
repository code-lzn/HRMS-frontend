import ApprovalTimeline from '@/components/ApprovalTimeline';
import {
  TRANSFER_STATUS,
  TRANSFER_STATUS_COLOR,
  TRANSFER_STATUS_MAP,
} from '@/constants';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Result,
  Space,
  Spin,
  Tag,
  message,
} from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { TransferDetail as TransferDetailType } from '../mock';
import { getDetailUsingGet4 } from '@/api/transferController';

const TransferDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<TransferDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    getDetailUsingGet4({ id: Number(id) })
      .then((res) => {
        if (res.code === 0 && res.data) {
          setDetail(res.data as unknown as TransferDetailType);
        } else {
          setDetail(null);
        }
      })
      .catch(() => {
        message.error('获取调岗详情失败');
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <PageContainer><div style={{ textAlign: 'center', padding: 120 }}><Spin size="large" /></div></PageContainer>;
  }

  if (!detail) {
    return <PageContainer>
      <Result status="error" title="加载失败" subTitle="无法获取调岗申请信息"
        extra={<Button onClick={() => history.push('/hr-change/transfer')}>返回列表</Button>} />
    </PageContainer>;
  }

  return (
    <PageContainer onBack={() => history.push('/hr-change/transfer')} title="调岗详情">
      {/* 基本信息 */}
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="员工姓名">{detail.employeeName}</Descriptions.Item>
          <Descriptions.Item label="工号">
            <span style={{ fontFamily: 'monospace' }}>{detail.employeeNo}</span>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={TRANSFER_STATUS_COLOR[detail.status]}>{TRANSFER_STATUS_MAP[detail.status]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="调岗生效日期">{detail.transferDate || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 调岗对比 */}
      <Card title="调岗对比" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
          {/* 原信息 */}
          <Card size="small" title="原岗位信息" style={{ flex: 1, background: '#fff7e6' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="部门">{detail.fromDepartmentName}</Descriptions.Item>
              <Descriptions.Item label="职位">{detail.fromPositionName}</Descriptions.Item>
              <Descriptions.Item label="职级">{detail.fromJobLevel || '-'}</Descriptions.Item>
              <Descriptions.Item label="汇报人">{detail.fromDirectReportName || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, color: '#1677ff' }}>
            <ArrowRightOutlined />
          </div>

          {/* 新信息 */}
          <Card size="small" title="新岗位信息" style={{ flex: 1, background: '#e6f4ff' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="部门">
                <span style={{ color: '#1677ff', fontWeight: 500 }}>{detail.toDepartmentName}</span>
              </Descriptions.Item>
              <Descriptions.Item label="职位">
                <span style={{ color: '#1677ff' }}>{detail.toPositionName}</span>
              </Descriptions.Item>
              <Descriptions.Item label="职级">
                <span style={{ color: '#1677ff' }}>{detail.toJobLevel || '-'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="汇报人">
                <span style={{ color: '#1677ff' }}>{detail.toDirectReportName || '-'}</span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        {detail.salaryAdjustment && (
          <div style={{ marginTop: 16, padding: '8px 12px', background: '#f6ffed', borderRadius: 6 }}>
            <span>薪资调整：</span>
            <span style={{ color: detail.salaryAdjustment > 0 ? '#52c41a' : '#ff4d4f', fontWeight: 500 }}>
              {detail.salaryAdjustment > 0 ? '+' : ''}¥{detail.salaryAdjustment.toLocaleString()}
            </span>
          </div>
        )}
      </Card>

      {/* 调岗原因 */}
      <Card title="调岗原因" style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, lineHeight: 1.8 }}>{detail.reason}</p>
      </Card>

      {/* 审批进度 */}
      {detail.approvalProgress && (
        <Card title="审批进度" style={{ marginBottom: 16 }}>
          <ApprovalTimeline
            nodes={detail.approvalProgress.nodes}
            currentNodeOrder={detail.approvalProgress.currentNodeOrder}
          />
        </Card>
      )}
    </PageContainer>
  );
};

export default TransferDetailPage;
