import { WarningOutlined } from '@ant-design/icons';
import { Card, DatePicker, Form, Input, Select, TreeSelect } from 'antd';
import type { FormInstance } from 'antd/es/form';
import React, { useMemo } from 'react';

interface WorkInfoSectionProps {
  form: FormInstance;
  mode: 'add' | 'edit';
  treeSelectData: any[];
  positionOptions: API.PositionVO[];
  inputStyle?: React.CSSProperties;
  disabledInputStyle?: React.CSSProperties;
  /** 新增模式：角色选项 */
  roleOptions?: { label: string; value: number }[];
  /** 员工选项（直属上级/汇报人） */
  employeeOptions?: { value: number; label: string }[];
  employeeLoading?: boolean;
  onSearchEmployee?: (keyword: string) => void;
  isLocked?: (field: string) => boolean;
  lockedLabel?: (label: string, field: string, tip: string) => React.ReactNode;
}

const InfoTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{
    display: 'inline-block', padding: '0 6px', fontSize: 11, lineHeight: '20px',
    color: '#999', background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: 4, marginLeft: 4,
  }}>
    {children}
  </span>
);

const WorkInfoSection: React.FC<WorkInfoSectionProps> = ({
  form,
  mode,
  treeSelectData,
  positionOptions,
  inputStyle = { borderRadius: 6 },
  disabledInputStyle = { borderRadius: 6, color: '#999', background: '#f5f5f5' },
  roleOptions = [],
  employeeOptions = [],
  employeeLoading = false,
  onSearchEmployee,
  isLocked = () => false,
  lockedLabel = (label) => label,
}) => {
  // 监听部门变化，筛选职位：所属部门职位 + 全公司通用职位
  const selectedDeptId = Form.useWatch('departmentId', form);
  const filteredPositionOptions = useMemo(() => {
    if (!selectedDeptId) return positionOptions;
    return positionOptions.filter(
      (p) => p.departmentId === selectedDeptId || p.departmentId == null,
    );
  }, [positionOptions, selectedDeptId]);

  return (
    <Card
      title={<span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>工作信息</span>}
      style={{ borderRadius: 8, border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
      styles={{ body: { padding: 20 } }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        {/* 所属部门 */}
        <Form.Item
          name="departmentId"
          label={
            <span>
              {lockedLabel('所属部门', 'departmentId', '需调岗流程')}
              {mode === 'edit' && isLocked('departmentId') && <InfoTag>需调岗流程</InfoTag>}
            </span>
          }
          rules={[{ required: true, message: '请选择所属部门' }]}
        >
          <TreeSelect
            treeData={treeSelectData} placeholder="请选择部门" allowClear
            style={inputStyle} disabled={isLocked('departmentId')}
          />
        </Form.Item>

        {/* 职位 */}
        <Form.Item
          name="positionId"
          label={
            <span>
              {lockedLabel('职位', 'positionId', '需调岗流程')}
              {mode === 'edit' && isLocked('positionId') && <InfoTag>需调岗流程</InfoTag>}
            </span>
          }
          rules={[{ required: true, message: '请选择职位' }]}
        >
          <Select
            placeholder="请选择职位" allowClear showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false}
            options={filteredPositionOptions.map((p) => ({ value: p.id, label: p.name }))}
            style={inputStyle} disabled={isLocked('positionId')}
          />
        </Form.Item>

        {/* 身份（仅新增模式） */}
        {mode === 'add' && roleOptions.length > 0 && (
          <Form.Item
            name="roleId"
            label="身份"
            rules={[{ required: true, message: '请选择身份' }]}
            tooltip="新增员工的系统角色权限"
          >
            <Select placeholder="请选择身份" options={roleOptions} style={inputStyle} />
          </Form.Item>
        )}

        {/* 直属上级 */}
        <Form.Item
          name="directReportId"
          label={
            <span>
              {lockedLabel('直属上级', 'directReportId', '需调岗流程')}
              {mode === 'edit' && isLocked('directReportId') && <InfoTag>需调岗流程</InfoTag>}
            </span>
          }
        >
          <Select
            placeholder="请输入姓名搜索" showSearch allowClear
            filterOption={false}
            loading={employeeLoading}
            onSearch={onSearchEmployee}
            options={employeeOptions}
            style={inputStyle} disabled={isLocked('directReportId')}
          />
        </Form.Item>

        {/* 工作地点 */}
        <Form.Item
          name="workLocation"
          label={
            <span>
              {lockedLabel('工作地点', 'workLocation', '需调岗流程')}
              {mode === 'edit' && isLocked('workLocation') && <InfoTag>需调岗流程</InfoTag>}
            </span>
          }
          rules={[{ max: 64 }]}
        >
          <Input
            placeholder="请输入工作地点" maxLength={64}
            style={isLocked('workLocation') ? disabledInputStyle : inputStyle}
            disabled={isLocked('workLocation')}
          />
        </Form.Item>

        {/* 入职日期 */}
        <Form.Item
          name="hireDate"
          label={lockedLabel('入职日期', 'hireDate', '需调岗流程修改')}
          rules={[{ required: true, message: '请选择入职日期' }]}
        >
          <DatePicker style={{ width: '100%', ...inputStyle }} disabled={isLocked('hireDate')} />
        </Form.Item>

        {/* 录用类型 */}
        <Form.Item
          name="employmentType"
          label={lockedLabel('录用类型', 'employmentType', '录用类型不可修改')}
          rules={[{ required: true, message: '请选择录用类型' }]}
        >
          <Select
            placeholder="请选择录用类型"
            options={[
              { value: 'FULL_TIME', label: '全职' },
              { value: 'PART_TIME', label: '兼职' },
              { value: 'INTERN', label: '实习' },
            ]}
            style={inputStyle} disabled={isLocked('employmentType')}
          />
        </Form.Item>
      </div>

      {/* 编辑模式下工作信息变更提示 */}
      {mode === 'edit' && (
        <div style={{
          marginTop: 12, padding: '10px 14px', background: '#fffbe6', borderRadius: 6,
          border: '1px solid #ffe58f', fontSize: 12, color: '#ad8b00',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <WarningOutlined />
          <span>工作信息变更需通过调岗流程，修改后提交审批方可生效。</span>
        </div>
      )}
    </Card>
  );
};

export default WorkInfoSection;
