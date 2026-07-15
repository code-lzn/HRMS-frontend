import { searchEmployeesUsingGet } from '@/api/employeeController';
import {
  getEmployeeSalaryUsingGet,
} from '@/api/salaryManageController';
import {
  EditOutlined,
  HistoryOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  List,
  message,
  Row,
  Select,
  Space,
  Spin,
  Tag,
} from 'antd';
import React, { useCallback, useState } from 'react';
import HistoryDrawer from './components/HistoryDrawer';
import SalaryEditModal from './components/SalaryEditModal';

const EmployeeSalaryPage: React.FC = () => {
  // 搜索
  const [keyword, setKeyword] = useState('');
  const [employees, setEmployees] = useState<API.EmployeeSimpleVO[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<API.EmployeeSimpleVO | null>(null);

  // 薪资档案
  const [salary, setSalary] = useState<API.EmployeeSalaryVO | null>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);

  // 弹窗
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) return;
    setSearchLoading(true);
    try {
      const res = await searchEmployeesUsingGet({ keyword: keyword.trim() });
      const data = (res as any)?.data ?? [];
      setEmployees(data);
      if (data.length === 0) message.info('未找到匹配的员工');
    } catch {
      // ignore
    } finally {
      setSearchLoading(false);
    }
  }, [keyword]);

  const handleSelectEmployee = async (emp: API.EmployeeSimpleVO) => {
    setSelectedEmployee(emp);
    setSalary(null);
    setSalaryLoading(true);
    try {
      const res = await getEmployeeSalaryUsingGet({ employeeId: emp.id! });
      setSalary((res as any)?.data ?? null);
    } catch {
      // ignore
    } finally {
      setSalaryLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 120px)' }}>
      {/* 左侧员工搜索 */}
      <Card
        title="员工搜索"
        style={{ width: 340, flexShrink: 0, overflow: 'auto' }}
        bodyStyle={{ padding: 16 }}
      >
        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Input
            placeholder="输入姓名或工号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={searchLoading}
          />
        </Space.Compact>

        <Spin spinning={searchLoading}>
          <List
            dataSource={employees}
            locale={{ emptyText: '请输入关键词搜索员工' }}
            renderItem={(emp) => (
              <List.Item
                onClick={() => handleSelectEmployee(emp)}
                style={{
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 6,
                  background:
                    selectedEmployee?.id === emp.id
                      ? '#e6f4ff'
                      : undefined,
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{emp.employeeName}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    工号：{emp.employeeNo}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Spin>
      </Card>

      {/* 右侧薪资档案 */}
      <Card
        style={{ flex: 1, overflow: 'auto' }}
        title="薪资档案"
        extra={
          selectedEmployee && salary ? (
            <Space>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => setHistoryOpen(true)}
              >
                调薪历史
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditOpen(true)}
              >
                编辑档案
              </Button>
            </Space>
          ) : null
        }
      >
        {!selectedEmployee ? (
          <Empty description="请在左侧搜索并选择员工" />
        ) : salaryLoading ? (
          <Spin tip="加载中..." />
        ) : !salary ? (
          <Empty description="该员工暂无薪资档案" />
        ) : (
          <>
            {/* 基本信息 */}
            <Descriptions
              title="基本信息"
              column={3}
              size="small"
              bordered
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="员工姓名">
                {salary.employeeName ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="工号">
                {salary.employeeNo ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="部门">
                {salary.departmentName ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="适用账套">
                <Tag color="blue">{salary.accountName ?? '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="生效日期">
                {salary.effectiveDate ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="银行信息">
                {salary.bankName
                  ? `${salary.bankName} ${salary.bankAccount ?? ''}`
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* 薪资基数 */}
            <Descriptions
              title="薪资基数"
              column={3}
              size="small"
              bordered
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="基本工资">
                <span style={{ fontWeight: 600, color: '#1677ff' }}>
                  ¥{(salary.baseSalary ?? 0).toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="岗位津贴基数">
                ¥{(salary.allowanceBase ?? 0).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="绩效奖金基数">
                ¥{(salary.performanceBase ?? 0).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="社保基数">
                ¥{(salary.socialInsuranceBase ?? 0).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="公积金基数">
                ¥{(salary.housingFundBase ?? 0).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="试用期比例">
                {salary.probationSalaryRatio != null
                  ? `${(salary.probationSalaryRatio * 100).toFixed(0)}%`
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* 预估社保公积金扣除 */}
            <Descriptions
              title="预估月度扣除（按基数×默认比例）"
              column={3}
              size="small"
              bordered
            >
              <Descriptions.Item label="养老保险（8%）">
                ¥{((salary.socialInsuranceBase ?? 0) * 0.08).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="医疗保险（2%）">
                ¥{((salary.socialInsuranceBase ?? 0) * 0.02).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="失业保险（0.5%）">
                ¥{((salary.socialInsuranceBase ?? 0) * 0.005).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="公积金（12%）">
                ¥{((salary.housingFundBase ?? 0) * 0.12).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="社保公积金合计">
                <span style={{ fontWeight: 600, color: '#ff4d4f' }}>
                  ¥{(
                    (salary.socialInsuranceBase ?? 0) * 0.105 +
                    (salary.housingFundBase ?? 0) * 0.12
                  ).toFixed(2)}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>

      {/* 编辑弹窗 */}
      <SalaryEditModal
        open={editOpen}
        employeeId={selectedEmployee?.id!}
        editRecord={salary}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false);
          if (selectedEmployee) handleSelectEmployee(selectedEmployee);
        }}
      />

      {/* 调薪历史抽屉 */}
      <HistoryDrawer
        open={historyOpen}
        employeeId={selectedEmployee?.id ?? null}
        employeeName={selectedEmployee?.employeeName ?? ''}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
};

export default EmployeeSalaryPage;
