import { getPendingListUsingGet } from '@/api/approvalController';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';
import { Button, Segmented, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

const TYPE_COLOR: Record<string, string> = {
  ONBOARDING: 'blue',
  REGULARIZATION: 'green',
  TRANSFER: 'orange',
  RESIGNATION: 'red',
  LEAVE: 'cyan',
  PATCH_CLOCK: 'purple',
  SALARY_BATCH: 'gold',
};

const FILTER_OPTIONS = ['全部', '入职', '转正', '调岗', '离职', '请假', '补卡', '薪资'];

/** Segmented 值 → businessType */
const FILTER_TYPE_MAP: Record<string, string | undefined> = {
  '入职': 'ONBOARDING',
  '转正': 'REGULARIZATION',
  '调岗': 'TRANSFER',
  '离职': 'RESIGNATION',
  '请假': 'LEAVE',
  '补卡': 'PATCH_CLOCK',
  '薪资': 'SALARY_BATCH',
};

const ApprovalWorkbench: React.FC = () => {
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>();
  const [typeFilter, setTypeFilter] = useState<string>('全部');

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
      defaultSortOrder: 'descend',
      sorter: (a, b) =>
        dayjs(a.applyTime).valueOf() - dayjs(b.applyTime).valueOf(),
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
          let data = res?.data ?? [];
          // 按类型筛选
          if (typeFilter !== '全部') {
            const targetType = FILTER_TYPE_MAP[typeFilter];
            data = data.filter((item) => item.businessType === targetType);
          }
          // 按申请时间倒序
          data.sort(
            (a, b) =>
              dayjs(b.applyTime).valueOf() - dayjs(a.applyTime).valueOf(),
          );
          return { data, success: true, total: data.length };
        } catch {
          return { data: [], success: false };
        }
      }}
      params={{ typeFilter }}
      rowKey="recordId"
      search={false}
      toolbar={{
        actions: [
          <Segmented
            key="filter"
            options={FILTER_OPTIONS}
            value={typeFilter}
            onChange={(val) => {
              setTypeFilter(val as string);
              actionRef.current?.reload();
            }}
          />,
        ],
      }}
    />
  );
};

export default ApprovalWorkbench;
