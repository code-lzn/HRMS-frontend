import { getDepartmentTreeUsingGet, deleteDepartmentUsingPost } from '@/api/departmentController';
import { SearchOutlined, PlusOutlined, MergeCellsOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Input, message, Modal } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useModel } from '@umijs/max';
import { hasPermission } from '@/utils/permission';
import DepartmentDetail from './components/DepartmentDetail';
import DeptFormModal from './components/DeptFormModal';
import MergeDeptModal from './components/MergeDeptModal';

// ============================================================
// 工具函数
// ============================================================

/** 根据搜索关键词过滤树 */
const filterTree = (nodes: API.DepartmentTreeVO[], keyword: string): API.DepartmentTreeVO[] => {
  if (!keyword.trim()) return nodes;
  const kw = keyword.toLowerCase();
  const filter = (list: API.DepartmentTreeVO[]): API.DepartmentTreeVO[] =>
    list
      .filter(
        (n) =>
          n.name?.toLowerCase().includes(kw) ||
          n.code?.toLowerCase().includes(kw) ||
          n.managerName?.includes(kw),
      )
      .map((n) => ({
        ...n,
        children: n.children?.length ? filter(n.children) : [],
      }))
      .filter(
        (n) =>
          n.children?.length ||
          n.name?.toLowerCase().includes(kw) ||
          n.code?.toLowerCase().includes(kw),
      );
  return filter(nodes);
};

/** 获取子部门列表 */
const getChildren = (node: API.DepartmentTreeVO | null): API.DepartmentTreeVO[] => node?.children ?? [];

// ============================================================
// 树节点组件（自定义渲染，带连接线和层级缩进）
// ============================================================

interface TreeNodeProps {
  node: API.DepartmentTreeVO;
  depth: number;
  selectedId: number | null;
  onSelect: (node: API.DepartmentTreeVO) => void;
  isLast: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth, selectedId, onSelect, isLast }) => {
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      {/* 节点行 */}
      <div
        onClick={() => onSelect(node)}
        style={{
          position: 'relative',
          padding: '10px 12px 10px 12px',
          paddingLeft: 12 + depth * 24,
          cursor: 'pointer',
          borderRadius: 6,
          background: isSelected ? '#eff6ff' : 'transparent',
          border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
          transition: 'all 0.15s',
          marginBottom: 2,
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = '#f8fafc';
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'transparent';
        }}
      >
        {/* 连接线（竖直 + 水平） */}
        {depth > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 12 + (depth - 1) * 24 + 12,
              top: 0,
              bottom: isLast ? '50%' : 0,
              width: 1,
              background: '#d1d5db',
            }}
          />
        )}
        {depth > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 12 + (depth - 1) * 24 + 12,
              top: '50%',
              width: 12,
              height: 1,
              background: '#d1d5db',
            }}
          />
        )}

        {/* 圆点 */}
        <div
          style={{
            position: 'absolute',
            left: depth > 0 ? 12 + (depth - 1) * 24 + 24 + 4 : 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: depth > 0 ? 8 : 10,
            height: depth > 0 ? 8 : 10,
            borderRadius: '50%',
            background: isSelected ? '#2563eb' : '#cbd5e1',
            zIndex: 1,
          }}
        />

        {/* 节点内容 */}
        <div style={{ marginLeft: depth > 0 ? 28 : 20 }}>
          {/* 第一行：名称 + 编码 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: isSelected ? '#2563eb' : '#1e293b',
                lineHeight: '20px',
              }}
            >
              {node.name}
            </span>
            {node.code && (
              <span
                style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  background: '#f1f5f9',
                  padding: '0 6px',
                  borderRadius: 4,
                  lineHeight: '18px',
                }}
              >
                {node.code}
              </span>
            )}
          </div>
          {/* 第二行：负责人 + 人数 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>{node.managerName ?? '-'}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                background: '#dbeafe',
                color: '#2563eb',
                padding: '1px 8px',
                borderRadius: 9999,
                lineHeight: '18px',
              }}
            >
              {node.employeeCount ?? 0}人
            </span>
          </div>
        </div>
      </div>

      {/* 子节点 */}
      {hasChildren && (
        <div>
          {node.children!.map((child, idx) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              isLast={idx === node.children!.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// 页面组件
// ============================================================

const DepartmentPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const canManage = hasPermission(currentUser, 'org:manage');

  const [treeData, setTreeData] = useState<API.DepartmentTreeVO[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState<API.DepartmentTreeVO | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 弹窗状态
  const [deptFormOpen, setDeptFormOpen] = useState(false);
  const [deptFormMode, setDeptFormMode] = useState<'add' | 'edit'>('add');
  const [editDept, setEditDept] = useState<API.DepartmentTreeVO | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);

  /** 删除部门 */
  const handleDelete = (dept: API.DepartmentTreeVO) => {
    Modal.confirm({
      title: '确定删除该部门吗？',
      icon: <ExclamationCircleOutlined />,
      content: `将删除部门「${dept.name}」，此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteDepartmentUsingPost({ id: dept.id });
          message.success('删除成功');
          if (selectedDept?.id === dept.id) setSelectedDept(null);
          loadTree();
        } catch (e: any) {
          message.error(e.message ?? '删除失败');
        }
      },
    });
  };

  /** 加载部门树 */
  const loadTree = useCallback(async () => {
    setTreeLoading(true);
    try {
      const res = await getDepartmentTreeUsingGet();
      const data = (res as any)?.data ?? [];
      setTreeData(data);
    } catch {
      // ignore
    } finally {
      setTreeLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  /** 树数据变化后同步更新选中节点 */
  useEffect(() => {
    if (!selectedDept?.id || treeData.length === 0) return;
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
    const updated = findNode(treeData);
    if (updated) {
      setSelectedDept((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(updated)) return prev;
        return updated;
      });
    }
  }, [treeData, selectedDept?.id]);

  // 搜索过滤后的树
  const filteredTree = useMemo(() => filterTree(treeData, searchKeyword), [treeData, searchKeyword]);

  const handleSelectDept = useCallback((node: API.DepartmentTreeVO) => {
    setSelectedDept(node);
  }, []);

  const handleEditDept = (dept: API.DepartmentTreeVO) => {
    setDeptFormMode('edit');
    setEditDept(dept);
    setDeptFormOpen(true);
  };

  const handleAddRootDept = () => {
    setDeptFormMode('add');
    setEditDept(null);
    setDeptFormOpen(true);
  };

  // 子部门列表
  const subDepartments = useMemo(() => getChildren(selectedDept), [selectedDept]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* ===== 页面标题 ===== */}
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', flexShrink: 0 }}>
        部门管理
      </h1>

      {/* ===== 操作栏 ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          gap: 16,
          flexShrink: 0,
        }}
      >
        <Input
          placeholder="搜索部门名称或编码"
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 360, borderRadius: 6, border: '1px solid #e2e8f0' }}
          allowClear
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {canManage && (
            <>
              <Button
                icon={<MergeCellsOutlined />}
                onClick={() => setMergeOpen(true)}
                style={{ borderRadius: 6, display: 'flex', alignItems: 'center' }}
              >
                合并部门
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddRootDept}
                style={{
                  borderRadius: 6,
                  background: '#2563eb',
                  borderColor: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                新增根部门
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ===== Split View（自动占满剩余高度） ===== */}
      <div style={{ display: 'flex', gap: 20, flex: 1, overflow: 'hidden' }}>
        {/* ===== 左侧：部门树（独立滚动） ===== */}
        <div
          style={{
            width: 380,
            flexShrink: 0,
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'auto',
            padding: '12px 0',
            height: '100%',
          }}
        >
          {treeLoading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              加载中...
            </div>
          ) : filteredTree.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              未找到匹配的部门
            </div>
          ) : (
            filteredTree.map((node, idx) => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                selectedId={selectedDept?.id ?? null}
                onSelect={handleSelectDept}
                isLast={idx === filteredTree.length - 1}
              />
            ))
          )}
        </div>

        {/* ===== 右侧：详情区（独立滚动） ===== */}
        <div style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'auto' }}>
          <DepartmentDetail
            department={selectedDept}
            subDepartments={subDepartments}
            onEdit={handleEditDept}
            onDelete={handleDelete}
            canManage={canManage}
            treeData={treeData}
          />
        </div>
      </div>

      {/* ===== 新增/编辑部门弹窗 ===== */}
      <DeptFormModal
        open={deptFormOpen}
        mode={deptFormMode}
        editDept={editDept}
        defaultParentId={selectedDept?.id}
        treeData={treeData}
        onClose={() => setDeptFormOpen(false)}
        onSuccess={() => {
          setDeptFormOpen(false);
          loadTree();
        }}
      />

      {/* ===== 合并部门弹窗 ===== */}
      <MergeDeptModal
        open={mergeOpen}
        selectedDeptId={selectedDept?.id}
        treeData={treeData}
        onClose={() => setMergeOpen(false)}
        onSuccess={() => {
          setMergeOpen(false);
          setSelectedDept(null);
          loadTree();
        }}
      />
    </div>
  );
};

export default DepartmentPage;
