import type { DefaultOptionType } from 'antd/es/select';

/** 合同类型选项 */
export const CONTRACT_OPTIONS: DefaultOptionType[] = [
  { value: 1, label: '固定期限' },
  { value: 2, label: '无固定期限' },
  { value: 3, label: '劳务合同' },
];

/** 录用类型选项 */
export const EMPLOYMENT_TYPE_OPTIONS: DefaultOptionType[] = [
  { value: 'FULL_TIME', label: '全职' },
  { value: 'PART_TIME', label: '兼职' },
  { value: 'INTERN', label: '实习' },
];

/** 录用类型 → 中文显示映射 */
export const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  FULL_TIME: '全职',
  PART_TIME: '兼职',
  INTERN: '实习',
};

/** 在职状态选项（筛选用） */
export const STATUS_OPTIONS: DefaultOptionType[] = [
  { value: 1, label: '试用期', color: 'blue' },
  { value: 2, label: '正式', color: 'green' },
  { value: 3, label: '待离职', color: 'orange' },
  { value: 4, label: '已离职', color: 'default' },
];

/** 在职状态 → 显示文本/颜色映射 */
export const STATUS_MAP: Record<number, { text: string; color: string }> = {
  1: { text: '试用期', color: 'blue' },
  2: { text: '正式', color: 'green' },
  3: { text: '待离职', color: 'orange' },
  4: { text: '已离职', color: 'default' },
};
