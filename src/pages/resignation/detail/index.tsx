import ApprovalTimeline from '@/components/ApprovalTimeline';
import {
  RESIGNATION_STATUS,
  RESIGNATION_STATUS_COLOR,
  RESIGNATION_STATUS_MAP,
  RESIGNATION_TYPE_MAP,
} from '@/constants';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Descriptions,
  Result,
  Spin,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { ResignationDetail as ResignationDetailType, resignationDetails } from '../mock';

const ResignationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<ResignationDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDetail(id ? resignationDetails[Number(id)] || null : null);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return <PageContainer><div style={{ textAlign: 'center', padding: 120 }}><Spin size="large" /></div></PageContainer>;
  }

  if (!detail) {
    return <PageContainer>
      <Result status="error" title="加载失败" subTitle="无法获取离职申请信息"
        extra={<Button onClick={() => history.push('/hr-change/resignation')}>返回列表</Button>} />
    </PageContainer>;
  }

  const isResigned = detail.status === RESIGNATION_STATUS.RESIGNED;

  return (
    <PageContainer onBack={() => history.push('/hr-change/resignation')} title="离职详情">
      {/* 员工信息 */}
      <Card title="员工信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="员工姓名">{detail.employeeName}</Descriptions.Item>
          <Descriptions.Item label="工号">
            <span style={{ fontFamily: 'monospace' }}>{detail.employeeNo}</span>
          </Descriptions.Item>
          <Descriptions.Item label="部门">{detail.departmentName}</Descriptions.Item>
          <Descriptions.Item label="职位">{detail.positionName}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 离职信息 */}
      <Card title="离职信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="离职日期">{detail.resignationDate}</Descriptions.Item>
          <Descriptions.Item label="离职类型">
            <Tag>{detail.resignationTypeDesc}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="工作交接人">{detail.handoverToName}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={RESIGNATION_STATUS_COLOR[detail.status]}>
              {RESIGNATION_STATUS_MAP[detail.status]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="离职原因" span={2}>{detail.reason}</Descriptions.Item>
          {detail.actualResignationDate && (
            <Descriptions.Item label="实际离职日期">{detail.actualResignationDate}</Descriptions.Item>
          )}
          <Descriptions.Item label="创建时间">{detail.createTime}</Descriptions.Item>
        </Descriptions>
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

      {/* 已离职提示 */}
      {isResigned && (
        <Card style={{ marginBottom: 16, background: '#fafafa', borderColor: '#d9d9d9' }}>
          <div style={{ textAlign: 'center', color: '#999', fontSize: 14 }}>
            该员工已于 {detail.actualResignationDate} 正式离职，档案保留可查询
          </div>
        </Card>
      )}
    </PageContainer>
  );
};

export default ResignationDetailPage;
