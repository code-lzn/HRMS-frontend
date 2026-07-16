import React from 'react';
import { Modal, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { deleteAttendanceUsingDelete, batchDeleteAttendanceUsingDelete } from '@/api/hrAttendanceController';

interface DeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ids: number[];
}

const DeleteModal: React.FC<DeleteModalProps> = ({ visible, onClose, onConfirm, ids }) => {
  const handleConfirm = async () => {
    try {
      if (ids.length === 1) {
        await deleteAttendanceUsingDelete({ id: ids[0] });
      } else {
        await batchDeleteAttendanceUsingDelete(ids);
      }
      onConfirm();
    } catch (error) {
      message.error('删除失败');
    }
  };

  return (
    <Modal
      title="确认删除"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="confirm" type="primary" danger onClick={handleConfirm}>
          确认删除
        </Button>,
      ]}
      width={400}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <DeleteOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
        <p style={{ fontSize: 16, marginBottom: 8 }}>
          确认删除选中的 {ids.length} 条考勤记录？
        </p>
        <p style={{ fontSize: 14, color: '#999' }}>删除后数据无法恢复！</p>
      </div>
    </Modal>
  );
};

export default DeleteModal;