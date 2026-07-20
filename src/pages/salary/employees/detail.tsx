import {
  getEmployeeSalaryUsingGet,
  getSalaryHistoryUsingGet,
} from '@/api/salaryController';
import { SALARY_CHANGE_TYPE_MAP } from '@/constants/enums';
import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  message,
  Spin,
  Table,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { history, useParams } from '@umijs/max';
import { EditOutlined } from '@ant-design/icons';

const EmployeeSalaryDetail: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const empId = employeeId!;
  const [salary, setSalary] = useState<API.EmployeeSalaryVO | null>(null);
  const [historyList, setHistory] = useState<API.SalaryChangeHistoryVO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [salRes, histRes] = await Promise.all([
          getEmployeeSalaryUsingGet(empId),
          getSalaryHistoryUsingGet(empId),
        ]);
        setSalary(salRes.data ?? null);
        setHistory((histRes.data as any) ?? []);
      } catch {
        message.error('获取薪资数据失败');
      }
      setLoading(false);
    })();
  }, [empId]);

  if (loading) return <Spin style={{ display: 'block', margin: '120px auto' }} />;

  const historyColumns = [
    { title: '变更类型', dataIndex: 'changeTypeLabel', width: 100,
      render: (_: any, r: API.SalaryChangeHistoryVO) => (
        <Tag color="blue">{r.changeTypeLabel}</Tag>
      ),
    },
    { title: '变更前', dataIndex: 'oldValue', width: 200, ellipsis: true },
    { title: '变更后', dataIndex: 'newValue', width: 200, ellipsis: true },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 110,
      render: (_: any, r: API.SalaryChangeHistoryVO) =>
        r.effectiveDate ? dayjs(r.effectiveDate).format('YYYY-MM-DD') : '-',
    },
    { title: '备注', dataIndex: 'remark', width: 200, ellipsis: true },
    { title: '记录时间', dataIndex: 'createTime', width: 160,
      render: (_: any, r: API.SalaryChangeHistoryVO) =>
        r.createTime ? dayjs(r.createTime).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  return (
    <PageContainer
      title={`员工薪资档案`}
      extra={
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => history.push(`/salary/employees/${empId}/edit`)}
        >
          编辑薪资档案
        </Button>
      }
    >
      <Card title="当前薪资档案" style={{ marginBottom: 24 }}>
        {salary ? (
          <Descriptions column={3} bordered size="small">
            <Descriptions.Item label="适用账套">{salary.accountName || '-'}</Descriptions.Item>
            <Descriptions.Item label="基本工资">
              ¥{salary.baseSalary?.toLocaleString() ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="津贴基数">
              ¥{salary.allowanceBase?.toLocaleString() ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="社保基数">
              ¥{salary.socialSecurityBase?.toLocaleString() ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="公积金基数">
              ¥{salary.housingFundBase?.toLocaleString() ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="绩效基数">
              ¥{salary.performanceBase?.toLocaleString() ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="生效日期">
              {salary.effectiveDate
                ? dayjs(salary.effectiveDate).format('YYYY-MM-DD')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间" span={2}>
              {salary.updateTime ? dayjs(salary.updateTime).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description="该员工暂无薪资档案" />
        )}
      </Card>

      <Card title="调薪历史">
        <Table
          rowKey="id"
          dataSource={historyList}
          columns={historyColumns}
          pagination={false}
          size="small"
        />
      </Card>
    </PageContainer>
  );
};

export default EmployeeSalaryDetail;
