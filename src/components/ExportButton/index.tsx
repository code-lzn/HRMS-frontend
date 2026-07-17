import { ExportOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { Button, message } from 'antd';
import React, { useState } from 'react';

interface ExportButtonProps {
  onExport: () => Promise<void>;
}

/**
 * Excel 导出按钮组件
 * - 仅 HR/Admin/部门主管可见
 * - Loading 状态 + 防重复点击
 * - 导出失败时给出错误提示
 */
const ExportButton: React.FC<ExportButtonProps> = ({ onExport }) => {
  const [loading, setLoading] = useState(false);
  const access = useAccess();

  if (!access.canExportEmployee) {
    return null;
  }

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport();
      message.success('导出成功');
    } catch {
      message.error('导出失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      icon={<ExportOutlined />}
      loading={loading}
      onClick={handleExport}
    >
      导出Excel
    </Button>
  );
};

export default ExportButton;
