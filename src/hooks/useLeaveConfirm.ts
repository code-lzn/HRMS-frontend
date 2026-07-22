import { Modal } from 'antd';
import { useCallback } from 'react';

/**
 * 表单离开确认 hook
 * 统一处理 dirty 状态下离开页面的二次确认逻辑
 *
 * @example
 * const { handleCancel } = useLeaveConfirm();
 * // 在返回按钮中使用
 * handleCancel(dirty, () => history.push('/employee/list'));
 */
export function useLeaveConfirm() {
  const handleCancel = useCallback(
    (dirty: boolean, onLeave: () => void) => {
      if (dirty) {
        Modal.confirm({
          title: '未保存的更改将丢失',
          content: '确定要离开吗？已填写的信息将不会保存。',
          okText: '确定离开',
          cancelText: '继续填写',
          okType: 'danger',
          onOk: onLeave,
        });
      } else {
        onLeave();
      }
    },
    [],
  );

  return { handleCancel };
}
