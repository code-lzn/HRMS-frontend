import { NODE_STATUS, NODE_STATUS_COLOR } from '@/constants';
import { Tag, Timeline } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export interface ApprovalTimelineProps {
  nodes?: API.ApprovalNodeVO[];
  currentNodeOrder?: number;
}

const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ nodes, currentNodeOrder }) => {
  if (!nodes || nodes.length === 0) return <span style={{ color: '#999' }}>暂无审批记录</span>;

  return (
    <Timeline
      items={nodes.map((node) => {
        const isActive = node.nodeOrder === currentNodeOrder && node.status === NODE_STATUS.PENDING;
        const isDelegated = node.originalApproverId && node.originalApproverId !== node.approverId;
        return {
          color: isActive ? 'blue' : NODE_STATUS_COLOR[node.status ?? 0] || 'gray',
          children: (
            <div>
              <div style={{ fontWeight: isActive ? 600 : 400 }}>
                {node.nodeName}
                <Tag color={NODE_STATUS_COLOR[node.status ?? 0]} style={{ marginLeft: 8 }}>{node.statusDesc || '-'}</Tag>
              </div>
              <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
                <span>审批人：{node.originalApproverName && isDelegated ? node.originalApproverName : node.approverName || '-'}</span>
                {isDelegated && node.originalApproverName && (
                  <Tag color="orange" style={{ marginLeft: 6, fontSize: 11, borderRadius: 4 }}>委托</Tag>
                )}
                {isDelegated && node.originalApproverName && (
                  <span>{node.approverName}</span>
                )}
              </div>
              {node.comment && <div style={{ color: '#999', fontSize: 12, marginTop: 4, background: '#fafafa', padding: '4px 8px', borderRadius: 4 }}>审批意见：{node.comment}</div>}
              {node.operateTime && <div style={{ color: '#bbb', fontSize: 12, marginTop: 4 }}>{dayjs(node.operateTime).format('YYYY-MM-DD HH:mm')}</div>}
            </div>
          ),
        };
      })}
    />
  );
};

export default ApprovalTimeline;
