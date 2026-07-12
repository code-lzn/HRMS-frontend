import { getPendingListUsingGet } from '@/api/approvalController';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';
import { Button, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useRef } from 'react';

/** 审批类型 → Tag 颜色 */
const TYPE_COLOR: Record<string, string> = {
  ONBOARDING: 'blue',
  REGULARIZATION: 'green',
  TRANSFER: 'orange',
  RESIGNATION: 'red',
  LEAVE: 'cyan',
  PATCH_CLOCK: 'purple',
  SALARY_BATCH: 'gold',
};

const ApprovalWorkbench: React.FC = () => {
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.ApprovalPendingVO>[] = [
    {
      title: '审批类型',
      dataIndex: 'businessTypeText',
      width: 120,
      render: (_, record) => (
        <Tag color={TYPE_COLOR[record.businessType ?? ''] ?? 'default'}>
          {record.businessTypeText}
        </Tag>
      ),
    },
    {
      title: '申请人',
      dataIndex: 'applicantName',
      width: 120,
    },
    {
      title: '当前节点',
      dataIndex: 'currentNodeName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '发起时间',
      dataIndex: 'applyTime',
      width: 180,
      render: (_, r) =>
        r.applyTime ? dayjs(r.applyTime).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() =>
            navigate(
              `/approval/detail/${record.recordId}?detailId=${record.detailId}`,
            )
          }
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <ProTable<API.ApprovalPendingVO>
      headerTitle="待审批"
      actionRef={actionRef}
      columns={columns}
      request={async () => {
        try {
          const res = await getPendingListUsingGet();
          return {
            data: res?.data ?? [],
            success: true,
            total: res?.data?.length ?? 0,
          };
        } catch {
          return { data: [], success: false };
        }
      }}
      rowKey="recordId"
      search={false}
    />
  );
};

export default ApprovalWorkbench;
