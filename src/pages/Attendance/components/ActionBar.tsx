import React from 'react';
import { Button, Space } from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined, CheckSquareOutlined, DeleteOutlined } from '@ant-design/icons';

interface ActionBarProps {
  selectedCount: number;
  onAdd: () => void;
  onBatchDelete: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ selectedCount, onAdd, onBatchDelete }) => {
  return (
    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Space size="middle">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          新增考勤记录
        </Button>

        <Button
          icon={<UploadOutlined />}
          disabled
        >
          批量导入考勤
        </Button>

        <Button
          icon={<DownloadOutlined />}
          disabled
        >
          批量导出当月考勤
        </Button>

        <Button
          icon={<CheckSquareOutlined />}
          disabled={selectedCount === 0}
        >
          批量补卡审批
        </Button>

        <Button
          icon={<DeleteOutlined />}
          danger
          disabled={selectedCount === 0}
          onClick={onBatchDelete}
        >
          批量删除
          {selectedCount > 0 && ` (${selectedCount})`}
        </Button>
      </Space>

      {selectedCount > 0 && (
        <span style={{ color: '#1677ff', fontSize: 14 }}>
          已选择 {selectedCount} 条记录
        </span>
      )}
    </div>
  );
};

export default ActionBar;