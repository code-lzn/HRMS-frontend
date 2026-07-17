import { PageContainer } from '@ant-design/pro-components';
import { Empty, Layout } from 'antd';
import React, { useCallback, useState } from 'react';
import DepartmentDetailPanel from './components/DepartmentDetailPanel';
import DepartmentFormModal from './components/DepartmentFormModal';
import DepartmentTreePanel from './components/DepartmentTreePanel';
import styles from './index.less';

const { Sider, Content } = Layout;

/**
 * 部门管理页面
 * 布局：左侧部门树（可伸缩）+ 右侧部门详情面板
 */
const DepartmentManagement: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalDeptId, setModalDeptId] = useState<number | undefined>();
  const [modalParentId, setModalParentId] = useState<number | undefined>();
  const [modalExcludeIds, setModalExcludeIds] = useState<number[]>([]);
  const [modalInitialValues, setModalInitialValues] = useState<
    Record<string, any>
  >({});
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  // 新增根部门
  const handleAddRoot = useCallback(() => {
    setModalMode('create');
    setModalDeptId(undefined);
    setModalParentId(undefined);
    setModalExcludeIds([]);
    setModalInitialValues({});
    setModalOpen(true);
  }, []);

  // 新增子部门
  const handleAddChild = useCallback((parentId: number) => {
    setModalMode('create');
    setModalDeptId(undefined);
    setModalParentId(parentId);
    setModalExcludeIds([]);
    setModalInitialValues({});
    setModalOpen(true);
  }, []);

  // 编辑部门（需要先获取该部门数据，这里用 initialValues 简单回填）
  const handleEdit = useCallback((id: number) => {
    setModalMode('edit');
    setModalDeptId(id);
    setModalParentId(undefined);
    setModalExcludeIds([id]); // 过滤自身
    setModalInitialValues({});
    setModalOpen(true);
  }, []);

  const handleModalSuccess = useCallback(() => {
    setModalOpen(false);
    // 树会自动通过 queryClient invalidation 刷新
  }, []);

  return (
    <PageContainer>
      <Layout
        className={styles.departmentLayout}
        style={{ background: '#fff' }}
      >
        <Sider
          width={300}
          collapsedWidth={0}
          collapsible
          collapsed={siderCollapsed}
          onCollapse={setSiderCollapsed}
          theme="light"
          style={{
            borderRight: '1px solid #f0f0f0',
            overflow: 'auto',
          }}
        >
          <DepartmentTreePanel
            selectedId={selectedId}
            onSelect={handleSelect}
            onAddRoot={handleAddRoot}
          />
        </Sider>
        <Content style={{ minHeight: 500 }}>
          {selectedId ? (
            <DepartmentDetailPanel
              key={selectedId}
              deptId={selectedId}
              onEdit={(id) => handleEdit(id)}
              onAddChild={handleAddChild}
            />
          ) : (
            <Empty
              description="请选择左侧部门查看详情"
              style={{ marginTop: 120 }}
            />
          )}
        </Content>
      </Layout>

      <DepartmentFormModal
        open={modalOpen}
        mode={modalMode}
        deptId={modalDeptId}
        parentId={modalParentId}
        excludeIds={modalExcludeIds}
        initialValues={modalInitialValues}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </PageContainer>
  );
};

export default DepartmentManagement;
