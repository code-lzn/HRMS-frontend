import {
  getDepartmentDetailUsingGet,
  getDepartmentTreeUsingGet,
} from '@/api/departmentController';
import { Card, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from '@umijs/max';
import DepartmentDetail from './components/DepartmentDetail';
import DepartmentTree from './components/DepartmentTree';
import DeptFormModal from './components/DeptFormModal';
import MergeDeptModal from './components/MergeDeptModal';

const DepartmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const deptIdParam = searchParams.get('deptId');

  const [treeData, setTreeData] = useState<API.DepartmentTreeVO[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState<API.DepartmentTreeVO | null>(null);

  // 弹窗状态
  const [deptFormOpen, setDeptFormOpen] = useState(false);
  const [deptFormMode, setDeptFormMode] = useState<'add' | 'edit'>('add');
  const [editDept, setEditDept] = useState<API.DepartmentTreeVO | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);

  /** 加载部门树 */
  const loadTree = useCallback(async () => {
    setTreeLoading(true);
    try {
      const res = await getDepartmentTreeUsingGet();
      const data = (res as any)?.data ?? [];
      setTreeData(data);
      // 如果当前选中了部门，从新树中更新选中部门数据
      if (selectedDept?.id) {
        const findNode = (nodes: API.DepartmentTreeVO[]): API.DepartmentTreeVO | undefined => {
          for (const node of nodes) {
            if (node.id === selectedDept.id) return node;
            if (node.children?.length) {
              const found = findNode(node.children);
              if (found) return found;
            }
          }
          return undefined;
        };
        const updated = findNode(data);
        if (updated) setSelectedDept(updated);
      }
    } catch {
      // ignore
    } finally {
      setTreeLoading(false);
    }
  }, [selectedDept?.id]);

  /** 初始加载 */
  useEffect(() => {
    loadTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** URL 参数直达 */
  useEffect(() => {
    if (!deptIdParam) return;
    const id = Number(deptIdParam);
    if (Number.isNaN(id)) return;
    (async () => {
      try {
        const res = await getDepartmentDetailUsingGet({ id });
        const deptData = (res as any)?.data as API.DepartmentTreeVO | undefined;
        if (deptData) {
          setSelectedDept(deptData);
        }
      } catch {
        message.error('加载部门详情失败');
      }
    })();
  }, [deptIdParam]);

  const handleSelectDept = useCallback((dept: API.DepartmentTreeVO) => {
    setSelectedDept(dept);
  }, []);

  const handleAddDept = () => {
    setDeptFormMode('add');
    setEditDept(null);
    setDeptFormOpen(true);
  };

  const handleEditDept = (dept: API.DepartmentTreeVO) => {
    setDeptFormMode('edit');
    setEditDept(dept);
    setDeptFormOpen(true);
  };

  const handleDeptFormSuccess = () => {
    setDeptFormOpen(false);
    loadTree();
  };

  const handleMergeSuccess = () => {
    setMergeOpen(false);
    setSelectedDept(null);
    loadTree();
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 120px)' }}>
      {/* 左侧部门树 */}
      <Card
        style={{ width: 320, flexShrink: 0, overflow: 'auto' }}
        bodyStyle={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <DepartmentTree
          selectedDeptId={selectedDept?.id}
          onSelect={handleSelectDept}
          onAddDept={handleAddDept}
          onMergeDept={() => setMergeOpen(true)}
          treeData={treeData}
          loading={treeLoading}
        />
      </Card>

      {/* 右侧部门详情 */}
      <Card style={{ flex: 1, overflow: 'auto' }} bodyStyle={{ padding: 16 }}>
        <DepartmentDetail
          department={selectedDept}
          onEdit={handleEditDept}
          onRefreshTree={loadTree}
          treeData={treeData}
        />
      </Card>

      {/* 新增/编辑部门弹窗 */}
      <DeptFormModal
        open={deptFormOpen}
        mode={deptFormMode}
        editDept={editDept}
        defaultParentId={selectedDept?.id}
        treeData={treeData}
        onClose={() => setDeptFormOpen(false)}
        onSuccess={handleDeptFormSuccess}
      />

      {/* 合并部门弹窗 */}
      <MergeDeptModal
        open={mergeOpen}
        selectedDeptId={selectedDept?.id}
        treeData={treeData}
        onClose={() => setMergeOpen(false)}
        onSuccess={handleMergeSuccess}
      />
    </div>
  );
};

export default DepartmentPage;
