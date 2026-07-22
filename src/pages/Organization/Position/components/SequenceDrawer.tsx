import { getSequencesUsingGet } from '@/api/positionController';
import { Card, Col, Drawer, Row, Spin, Tag } from 'antd';
import React, { useEffect, useState } from 'react';

const SEQUENCE_COLOR: Record<string, string> = {
  M: 'blue',
  P: 'green',
  S: 'orange',
};

interface SequenceDrawerProps {
  open: boolean;
  onClose: () => void;
}

const SequenceDrawer: React.FC<SequenceDrawerProps> = ({ open, onClose }) => {
  const [sequences, setSequences] = useState<API.SequenceLevelVO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getSequencesUsingGet();
        setSequences((res as any)?.data ?? []);
      } catch (e) { console.error('pages/Organization/Position/components/SequenceDrawer.tsx', e); } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  return (
    <Drawer title="序列职级对照表" open={open} onClose={onClose} width={640}>
      <Spin spinning={loading}>
        <Row gutter={16}>
          {sequences.map((seq) => (
            <Col span={8} key={seq.sequence}>
              <Card
                title={
                  <Tag color={SEQUENCE_COLOR[seq.sequenceCode ?? ''] ?? 'default'}>
                    {seq.sequenceName}
                  </Tag>
                }
                size="small"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {seq.levels?.map((level) => (
                    <Tag key={level} style={{ textAlign: 'center' }}>
                      {level}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
    </Drawer>
  );
};

export default SequenceDrawer;
