import { getEmployeeListUsingGet } from '@/api/employeeController';
import { TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd';
import { useEffect, useState } from 'react';

interface EmployeeTreeSelectProps extends Omit<TreeSelectProps, 'treeData'> {
  /** 排除的员工 ID 列表（如排除自己） */
  excludeIds?: number[];
}

const EmployeeTreeSelect: React.FC<EmployeeTreeSelectProps> = ({ excludeIds, ...props }) => {
  const [treeData, setTreeData] = useState<any[]>([]);

  useEffect(() => {
    getEmployeeListUsingGet({ current: 1, pageSize: 1000 })
      .then((res) => {
        const employees = (res.data?.records || []) as any[];
        // 按部门分组
        const deptMap: Record<string, { title: string; value: string; children: any[] }> = {};
        employees.forEach((emp) => {
          if (excludeIds?.includes(emp.id)) return;
          if (emp.status === 4) return; // 排除已离职
          const deptName = emp.departmentName || '未分配部门';
          if (!deptMap[deptName]) {
            deptMap[deptName] = { title: deptName, value: `dept_${deptName}`, children: [], selectable: false };
          }
          deptMap[deptName].children.push({
            title: `${emp.name} (${emp.employeeNo})`,
            value: emp.id,
            employeeName: emp.name,
          });
        });
        setTreeData(Object.values(deptMap));
      })
      .catch(() => {});
  }, []);

  return (
    <TreeSelect
      treeData={treeData}
      treeDefaultExpandAll
      showSearch
      treeNodeFilterProp="title"
      placeholder="请选择"
      allowClear
      {...props}
    />
  );
};

export default EmployeeTreeSelect;
