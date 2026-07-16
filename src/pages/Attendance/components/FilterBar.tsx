import React, { useState } from 'react';
import { Input, Select, DatePicker, Button, Space, Collapse } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { getDepartmentTreeUsingGet } from '@/api/departmentController';
import { useRequest } from '@umijs/max';
import dayjs from 'dayjs';

const { Panel } = Collapse;
const { Option } = Select;

const STATUS_OPTIONS = [
  { value: 0, label: '正常' },
  { value: 1, label: '迟到' },
  { value: 2, label: '早退' },
  { value: 3, label: '缺卡' },
  { value: 4, label: '请假' },
  { value: 5, label: '旷工' },
];

const PUNCH_TYPE_OPTIONS = [
  { value: 1, label: '上班打卡' },
  { value: 2, label: '下班打卡' },
];

interface FilterBarProps {
  params: any;
  onChange: (params: any) => void;
  onSearch: () => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ params, onChange, onSearch, onReset }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: departments } = useRequest(() =>
    getDepartmentTreeUsingGet().then((r) => {
      const treeData = r?.data?.list || [];
      const flatten = (arr: any[]) => arr.reduce((acc, item) => [...acc, item, ...flatten(item.children || [])], []);
      return flatten(treeData);
    })
  );

  const handleParamChange = (key: string, value: any) => {
    onChange({ [key]: value });
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Space wrap size="middle">
        <Space>
          <span style={{ fontWeight: 500 }}>员工姓名：</span>
          <Input
            placeholder="请输入员工姓名"
            value={params.employeeName}
            onChange={(e) => handleParamChange('employeeName', e.target.value)}
            style={{ width: 150 }}
          />
        </Space>

        <Space>
          <span style={{ fontWeight: 500 }}>工号：</span>
          <Input
            placeholder="请输入工号"
            value={params.employeeNo}
            onChange={(e) => handleParamChange('employeeNo', e.target.value)}
            style={{ width: 150 }}
          />
        </Space>

        <Space>
          <span style={{ fontWeight: 500 }}>所属部门：</span>
          <Select
            placeholder="请选择部门"
            value={params.departmentId}
            onChange={(value) => handleParamChange('departmentId', value)}
            style={{ width: 150 }}
            allowClear
          >
            {departments?.map((dept) => (
              <Option key={dept.id} value={dept.id}>
                {dept.deptName}
              </Option>
            ))}
          </Select>
        </Space>

        <Space>
          <span style={{ fontWeight: 500 }}>考勤月份：</span>
          <DatePicker
            picker="month"
            value={params.month ? dayjs(params.month) : undefined}
            onChange={(date) => handleParamChange('month', date?.format('YYYY-MM'))}
            style={{ width: 150 }}
          />
        </Space>

        <Space>
          <span style={{ fontWeight: 500 }}>考勤状态：</span>
          <Select
            placeholder="请选择状态"
            value={params.status}
            onChange={(value) => handleParamChange('status', value)}
            style={{ width: 150 }}
            allowClear
          >
            {STATUS_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Space>

        <Space>
          <span style={{ fontWeight: 500 }}>打卡类型：</span>
          <Select
            placeholder="请选择类型"
            value={params.punchType}
            onChange={(value) => handleParamChange('punchType', value)}
            style={{ width: 150 }}
            allowClear
          >
            {PUNCH_TYPE_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Space>

        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={onSearch}
        >
          查询
        </Button>

        <Button
          icon={<ReloadOutlined />}
          onClick={onReset}
        >
          重置
        </Button>

        <Button
          icon={<FilterOutlined />}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '收起高级筛选' : '高级筛选'}
        </Button>
      </Space>

      {showAdvanced && (
        <Collapse defaultActiveKey={['advanced']} style={{ marginTop: 16 }}>
          <Panel header="高级筛选" key="advanced">
            <Space wrap size="middle" style={{ padding: '16px 0' }}>
              <Space>
                <span style={{ fontWeight: 500 }}>岗位：</span>
                <Select
                  placeholder="请选择岗位"
                  style={{ width: 150 }}
                  allowClear
                >
                </Select>
              </Space>
              <Space>
                <span style={{ fontWeight: 500 }}>排班组别：</span>
                <Select
                  placeholder="请选择组别"
                  style={{ width: 150 }}
                  allowClear
                >
                </Select>
              </Space>
              <Space>
                <span style={{ fontWeight: 500 }}>打卡地点：</span>
                <Input
                  placeholder="请输入打卡地点"
                  style={{ width: 150 }}
                />
              </Space>
            </Space>
          </Panel>
        </Collapse>
      )}
    </div>
  );
};

export default FilterBar;