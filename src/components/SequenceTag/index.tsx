import { SEQUENCE_MAP } from '@/constants/enums';
import { Tag } from 'antd';
import React from 'react';

interface SequenceTagProps {
  sequence: number;
}

/**
 * 职位序列标签组件
 * M=蓝色(管理序列)、P=绿色(专业序列)、S=灰色(支持序列)
 */
const SequenceTag: React.FC<SequenceTagProps> = ({ sequence }) => {
  const seq = SEQUENCE_MAP[sequence];
  if (!seq) return <Tag>未知</Tag>;

  return <Tag color={seq.color}>{`${seq.name} - ${seq.desc}`}</Tag>;
};

export default SequenceTag;
