/** 全局设计 Token */
export const COLORS = {
  // Primary
  primaryBlue: '#2563eb',
  primaryBlueLight: '#eff6ff',
  primaryBlueBorder: '#2563eb',

  // Sequence colors
  seqM: '#8b5cf6',
  seqMLight: '#f5f3ff',
  seqMBorder: '#c4b5fd',
  seqP: '#2563eb',
  seqPLight: '#eff6ff',
  seqPBorder: '#bfdbfe',
  seqS: '#10b981',
  seqSLight: '#ecfdf5',
  seqSBorder: '#a7f3d0',

  // Sidebar
  sidebarBg: '#0f172a',
  sidebarText: '#94a3b8',
  sidebarTextActive: '#ffffff',
  sidebarBgActive: '#2563eb',
  sidebarDivider: '#1e293b',

  // Layout
  contentBg: '#f8fafc',
  cardBg: '#ffffff',
  cardBorder: '#e2e8f0',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',

  // Buttons
  btnPrimaryBg: '#2563eb',
  btnPrimaryText: '#ffffff',
  btnPrimaryHover: '#1d4ed8',
  btnSecondaryBg: '#ffffff',
  btnSecondaryBorder: '#e2e8f0',
  btnSecondaryText: '#475569',
} as const;

/** 三类序列的配色方案 */
export const SEQUENCE_COLORS: Record<
  string,
  { bg: string; color: string; border: string; lightBg: string }
> = {
  M: { bg: '#8b5cf6', color: '#7c3aed', border: '#c4b5fd', lightBg: '#f5f3ff' },
  P: { bg: '#2563eb', color: '#1d4ed8', border: '#bfdbfe', lightBg: '#eff6ff' },
  S: { bg: '#10b981', color: '#059669', border: '#a7f3d0', lightBg: '#ecfdf5' },
};

/** 职位序列数据 */
export const SEQUENCE_DATA = {
  M: {
    code: 'M' as const,
    name: '管理序列',
    label: 'M序列',
    levels: ['M1', 'M2', 'M3', 'M4', 'M5'],
    levelLabels: {
      M1: '主管',
      M2: '经理',
      M3: '高级经理',
      M4: '总监',
      M5: 'VP',
    },
  },
  P: {
    code: 'P' as const,
    name: '专业序列',
    label: 'P序列',
    levels: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'],
    levelLabels: {
      P3: '初级',
      P4: '中级',
      P5: '高级',
      P6: '资深',
      P7: '专家',
      P8: '高级专家',
      P9: '资深专家',
      P10: '首席',
    },
  },
  S: {
    code: 'S' as const,
    name: '支持序列',
    label: 'S序列',
    levels: ['S1', 'S2', 'S3', 'S4', 'S5'],
    levelLabels: {
      S1: '助理',
      S2: '专员',
      S3: '高级专员',
      S4: '主管',
      S5: '经理',
    },
  },
} as const;

/** 序列统计卡片数据 */
export interface SequenceStat {
  code: string;
  name: string;
  label: string;
  color: string;
  lightBg: string;
  positions: number;
  levelRange: string;
  tags: string[];
}

export const SEQUENCE_STATS: SequenceStat[] = [
  {
    code: 'M',
    name: '管理序列',
    label: 'M序列',
    color: '#8b5cf6',
    lightBg: '#f5f3ff',
    positions: 3,
    levelRange: 'M1 ~ M5',
    tags: ['M1', 'M2', 'M3', 'M4', 'M5'],
  },
  {
    code: 'P',
    name: '专业序列',
    label: 'P序列',
    color: '#2563eb',
    lightBg: '#eff6ff',
    positions: 5,
    levelRange: 'P1 ~ P10',
    tags: ['P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'],
  },
  {
    code: 'S',
    name: '支持序列',
    label: 'S序列',
    color: '#10b981',
    lightBg: '#ecfdf5',
    positions: 4,
    levelRange: 'S1 ~ S5',
    tags: ['S1', 'S2', 'S3', 'S4', 'S5'],
  },
];
