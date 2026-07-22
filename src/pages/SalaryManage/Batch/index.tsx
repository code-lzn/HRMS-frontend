import {
  approveBatchUsingPost,
  calculateBatchUsingPost,
  createBatchUsingPost,
  exportBatchUsingGet,
  getAnomaliesUsingGet,
  getBatchDetailUsingGet,
  listBatchesUsingGet,
  markPaidUsingPost,
  previewBatchUsingGet,
  rejectBatchUsingPost,
  submitForApprovalUsingPost,
} from '@/api/salaryManageController';
import {
  getChangeDistributionUsingGet,
  getCompositionUsingGet,
  getDeptDistributionUsingGet,
  getMonthlyTrendUsingGet,
  getSocialSecurityComparisonUsingGet,
} from '@/api/salaryStatisticsController';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import usePermission from '@/hooks/usePermission';
import BatchAdjustModal from './components/BatchAdjustModal';

const { Title, Text } = Typography;
const { confirm } = Modal;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'default' },
  CALCULATING: { label: '计算中', color: 'processing' },
  PENDING_CONFIRM: { label: '待确认', color: 'warning' },
  APPROVING: { label: '审批中', color: 'orange' },
  APPROVED: { label: '已通过', color: 'cyan' },
  PAID: { label: '已发放', color: 'success' },
  REJECTED: { label: '已驳回', color: 'error' },
};

const ANOMALY_MAP: Record<number, { label: string; color: string; icon: string }> = {
  0: { label: '正常', color: 'success', icon: '' },
  1: { label: '预警', color: 'warning', icon: '⚠️' },
  2: { label: '阻断', color: 'error', icon: '🔴' },
};

const STEP_ITEMS = [
  { title: '草稿' }, { title: '计算中' }, { title: '待确认' },
  { title: '审批中' }, { title: '已通过' }, { title: '已发放' },
];

const STATUS_STEP_MAP: Record<string, number> = {
  DRAFT: 0, CALCULATING: 1, PENDING_CONFIRM: 2,
  APPROVING: 3, APPROVED: 4, PAID: 5,
};

const CHART_HEIGHT = 320;

const CARD_STYLE: React.CSSProperties = {
  border: '1px solid #f0f0f0', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

const BatchPage: React.FC = () => {
  const { canAuditSalary } = usePermission();

  // 用 ref 保持选中批次，避免刷新/操作后跳转
  const activeBatchIdRef = useRef<number | null>(null);

  const [batches, setBatches] = useState<API.SalaryBatchVO[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<number | null>(null);
  const [activeBatch, setActiveBatch] = useState<API.SalaryBatchVO | null>(null);

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewRecords, setPreviewRecords] = useState<API.SalaryDetailVO[]>([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [anomalyCount, setAnomalyCount] = useState(0);

  const [chartLoading, setChartLoading] = useState(false);
  const [trend, setTrend] = useState<API.SalaryMonthlyTrendVO[]>([]);
  const [deptDist, setDeptDist] = useState<API.SalaryDeptDistributionVO[]>([]);
  const [composition, setComposition] = useState<API.SalaryCompositionVO[]>([]);
  const [socialSecurity, setSocialSecurity] = useState<API.SalarySocialSecurityVO[]>([]);
  const [changeDist, setChangeDist] = useState<API.SalaryChangeDistributionVO[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMonth, setCreateMonth] = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const setActiveId = (id: number | null) => {
    activeBatchIdRef.current = id;
    setActiveBatchId(id);
  };

  // ========== 数据加载 ==========

  const loadBatches = async () => {
    setBatchesLoading(true);
    try {
      const res = await listBatchesUsingGet();
      const data: API.SalaryBatchVO[] = (res as any)?.data ?? [];
      setBatches(data);
      if (!activeBatchIdRef.current && data.length > 0) {
        setActiveId(data[data.length - 1].id!);
      }
    } catch { /* ignore */ } finally {
      setBatchesLoading(false);
    }
  };

  const loadBatchDetail = async (batchId: number) => {
    // 加载批次信息
    try {
      const res = await getBatchDetailUsingGet({ id: batchId });
      setActiveBatch((res as any)?.data ?? null);
    } catch { setActiveBatch(null); }

    // 加载预览数据
    setPreviewLoading(true);
    try {
      const [previewRes, anomalyRes] = await Promise.all([
        previewBatchUsingGet({ id: batchId, current: 1, size: 20 }),
        getAnomaliesUsingGet({ id: batchId }),
      ]);
      const raw: any = previewRes;
      const data = raw?.data ?? raw;
      let records: any[] = [];
      if (Array.isArray(data)) records = data;
      else if (data && Array.isArray(data.records)) records = data.records;
      setPreviewRecords(records);
      setPreviewTotal(Number(data?.total) || records.length);
      setAnomalyCount(((anomalyRes as any)?.data ?? []).length);
    } catch (e) {
      console.error('加载预览失败:', e);
    } finally {
      setPreviewLoading(false);
    }

    // 加载图表数据
    setChartLoading(true);
    try {
      const [trendRes, deptRes, compRes, secRes, chgRes] = await Promise.all([
        getMonthlyTrendUsingGet({ months: 6 }),
        getDeptDistributionUsingGet({ batchId }),
        getCompositionUsingGet({ batchId }),
        getSocialSecurityComparisonUsingGet({ batchId }),
        getChangeDistributionUsingGet({ batchId }),
      ]);
      setTrend((trendRes as any)?.data ?? []);
      setDeptDist((deptRes as any)?.data ?? []);
      setComposition((compRes as any)?.data ?? []);
      setSocialSecurity((secRes as any)?.data ?? []);
      setChangeDist((chgRes as any)?.data ?? []);
    } catch { /* ignore */ } finally {
      setChartLoading(false);
    }
  };

  // 首次加载列表
  useEffect(() => { loadBatches(); }, []);

  // 选中批次变化时加载详情
  useEffect(() => {
    if (activeBatchId) loadBatchDetail(activeBatchId);
  }, [activeBatchId]);

  /** 刷新：依次等列表和详情都加载完 */
  const refresh = async () => {
    await loadBatches();
    if (activeBatchIdRef.current) await loadBatchDetail(activeBatchIdRef.current);
  };

  // ========== 乐观更新：API 成功后立刻改本地状态 ==========

  /** 同步更新 activeBatch 和 batches 列表中的状态 */
  const updateLocalStatus = (newStatus: string) => {
    const id = activeBatchIdRef.current;
    setActiveBatch((prev) => (prev ? { ...prev, status: newStatus } : prev));
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
  };

  // ========== 操作 ==========

  const handleCalculate = async () => {
    if (!activeBatchIdRef.current) return;
    try {
      await calculateBatchUsingPost({ id: activeBatchIdRef.current });
      updateLocalStatus('PENDING_CONFIRM');
      message.success('计算完成');
    } catch (e: any) { message.error(e.message ?? '计算失败'); }
    await refresh();
  };

  const handleSubmit = () => {
    if (!activeBatchIdRef.current) return;
    confirm({
      title: '确认提交审批？', icon: <ExclamationCircleOutlined />,
      content: '提交后将不能再手动调整。提交后请等待审批人审核。', okText: '确定', cancelText: '取消',
      onOk: async () => {
        try {
          await submitForApprovalUsingPost({ id: activeBatchIdRef.current! });
          updateLocalStatus('APPROVING');
          message.success('已提交审批');
        } catch (e: any) { message.error(e.message ?? '提交失败'); }
        await refresh();
      },
    });
  };

  const handleApprove = async () => {
    if (!activeBatchIdRef.current) return;
    try {
      await approveBatchUsingPost({ id: activeBatchIdRef.current });
      updateLocalStatus('APPROVED');
      message.success('审批通过');
    } catch (e: any) { message.error(e.message ?? '审批失败'); }
    await refresh();
  };

  const handleReject = () => {
    if (!activeBatchIdRef.current) return;
    confirm({
      title: '确认驳回？', icon: <ExclamationCircleOutlined />,
      content: (
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}>请输入驳回原因：</div>
          <Input.TextArea rows={3} placeholder="请输入驳回原因" onChange={(e) => setRejectReason(e.target.value)} />
        </div>
      ),
      okText: '确定驳回', okType: 'danger', cancelText: '取消',
      onOk: async () => {
        try {
          await rejectBatchUsingPost({ id: activeBatchIdRef.current! }, { reason: rejectReason || '无' });
          updateLocalStatus('REJECTED');
          setRejectReason('');
          message.success('已驳回');
        } catch (e: any) { message.error(e.message ?? '驳回失败'); }
        await refresh();
      },
    });
  };

  const handleMarkPaid = () => {
    if (!activeBatchIdRef.current) return;
    confirm({
      title: '确认标记已发放？', icon: <ExclamationCircleOutlined />,
      content: '确认后工资条将对员工可见。', okText: '确定', cancelText: '取消',
      onOk: async () => {
        try {
          await markPaidUsingPost({ id: activeBatchIdRef.current! });
          updateLocalStatus('PAID');
          message.success('已标记发放');
        } catch (e: any) { message.error(e.message ?? '操作失败'); }
        await refresh();
      },
    });
  };

  const handleCreate = async () => {
    if (!createMonth) { message.warning('请选择核算月份'); return; }
    setCreateLoading(true);
    try {
      const res = await createBatchUsingPost({ salaryMonth: createMonth });
      message.success('创建批次成功');
      setCreateOpen(false); setCreateMonth(null);
      await loadBatches();
      const newId = (res as any)?.data;
      if (newId) setActiveId(newId);
    } catch (e: any) { message.error(e.message ?? '创建失败'); }
    finally { setCreateLoading(false); }
  };

  const handleExport = async () => {
    if (!activeBatchIdRef.current) return;
    try {
      const res: any = await exportBatchUsingGet({ id: activeBatchIdRef.current });
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data ?? res]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeBatch?.batchNo ?? '薪资核算'}_${activeBatch?.salaryMonth ?? ''}.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch (e: any) {
      message.error(e.message ?? '导出失败');
    }
  };

  // ==================== ECharts（不变） ====================

  const trendOption = useMemo<EChartsOption>(() => {
    const months = trend.map((t) => t.month?.substring(0, 7) ?? '');
    return {
      tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#e8e8e8', textStyle: { color: '#333', fontSize: 13 }, padding: [10, 14],
        formatter: (params: any) => {
          const [g, n] = params;
          return `<div style="font-weight:600;margin-bottom:6px">${g?.axisValue}</div>
            <div style="display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#1677ff"></span>应发总额 <strong style="margin-left:8px">¥${(g?.value??0).toLocaleString()}</strong></div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#52c41a"></span>实发总额 <strong style="margin-left:8px">¥${(n?.value??0).toLocaleString()}</strong></div>`;
        } },
      legend: { bottom: 0, left: 'center', icon: 'rect', itemWidth: 12, itemHeight: 2, textStyle: { fontSize: 12, color: '#666' } },
      grid: { top: 12, right: 24, bottom: 40, left: 60 },
      xAxis: { type: 'category', data: months, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 11, color: '#999' } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }, axisLabel: { fontSize: 11, color: '#999', formatter: (v: number) => `¥${(v/10000).toFixed(0)}万` } },
      series: [
        { name: '应发总额', type: 'line', data: trend.map(t=>t.grossTotal??0), smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 2, color: '#1677ff' }, itemStyle: { color: '#1677ff' } },
        { name: '实发总额', type: 'line', data: trend.map(t=>t.netTotal??0), smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 2, color: '#52c41a' }, itemStyle: { color: '#52c41a' } },
      ],
    };
  }, [trend]);

  const deptOption = useMemo<EChartsOption>(() => ({
    tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#e8e8e8', textStyle: { color: '#333', fontSize: 13 }, padding: [10, 14],
      formatter: (params: any) => { const p=Array.isArray(params)?params[0]:params; return `<div style="font-weight:600;margin-bottom:4px">${p?.name}</div><div>应发总额 <strong>¥${(p?.value??0).toLocaleString()}</strong></div><div style="color:#999;font-size:11px">人数：${deptDist.find(d=>d.departmentName===p?.name)?.employeeCount??'-'}</div>`; } },
    grid: { top: 24, right: 24, bottom: 48, left: 60 },
    xAxis: { type: 'category', data: deptDist.map(d=>d.departmentName??'') as string[], axisLabel: { fontSize: 11, color: '#666', rotate: deptDist.length>5?30:0 }, axisTick: { show: false }, axisLine: { lineStyle: { color: '#e8e8e8' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }, axisLabel: { fontSize: 11, color: '#999', formatter: (v: number) => `¥${(v/10000).toFixed(0)}万` } },
    series: [{ type: 'bar', data: deptDist.map(d=>d.grossTotal??0), barWidth: '50%', itemStyle: { borderRadius: [4,4,0,0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#7B68EE' },{ offset: 1, color: '#b3a6ff' }] } }, label: { show: true, position: 'top', fontSize: 10, color: '#999', formatter: (p:any) => `¥${((p.value??0)/10000).toFixed(1)}万` } }],
  }), [deptDist]);

  const compositionOption = useMemo<EChartsOption>(() => ({
    tooltip: { trigger: 'item', backgroundColor: '#fff', borderColor: '#e8e8e8', textStyle: { color: '#333', fontSize: 13 }, padding: [10, 14], formatter: '{b}: ¥{c} ({d}%)' },
    legend: { bottom: 0, left: 'center', icon: 'circle', itemWidth: 6, itemHeight: 6, textStyle: { fontSize: 12, color: '#666' } },
    color: ['#1677ff','#52c41a','#faad14','#ff7a45','#597ef7','#13c2c2','#b37feb','#ff4d4f'],
    series: [{ type: 'pie', radius: ['55%','78%'], center: ['50%','46%'], data: composition.map(c=>({name:c.itemName,value:c.amount??0})), label: { show: false }, emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' }, itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } }, itemStyle: { borderColor: '#fff', borderWidth: 2 } }],
  }), [composition]);

  const socialSecurityOption = useMemo<EChartsOption>(() => {
    const items: string[] = socialSecurity.map(s=>s.itemName??'');
    return {
      tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#e8e8e8', textStyle: { color: '#333', fontSize: 13 }, padding: [10, 14] },
      legend: { bottom: 0, left: 'center', icon: 'rect', itemWidth: 12, itemHeight: 2, textStyle: { fontSize: 12, color: '#666' } },
      grid: { top: 24, right: 24, bottom: 40, left: 60 },
      xAxis: { type: 'category', data: items, axisLabel: { fontSize: 11, color: '#666' }, axisTick: { show: false }, axisLine: { lineStyle: { color: '#e8e8e8' } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }, axisLabel: { fontSize: 11, color: '#999', formatter: (v: number) => `¥${(v/10000).toFixed(1)}万` } },
      series: [
        { name: '企业缴纳', type: 'bar', data: socialSecurity.map(s=>s.companyAmount??0), barGap:'20%', barWidth:'35%', itemStyle:{borderRadius:[4,4,0,0],color:'#1677ff'} },
        { name: '个人缴纳', type: 'bar', data: socialSecurity.map(s=>s.personalAmount??0), barWidth:'35%', itemStyle:{borderRadius:[4,4,0,0],color:'#ff7a45'} },
      ],
    };
  }, [socialSecurity]);

  const changeOption = useMemo<EChartsOption>(() => ({
    tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#e8e8e8', textStyle: { color: '#333', fontSize: 13 }, padding: [10, 14],
      formatter: (params: any) => { const p=Array.isArray(params)?params[0]:params; return `<div style="font-weight:600">${p?.name}</div><div>人数 <strong>${p?.value??0} 人</strong></div>`; } },
    grid: { top: 24, right: 24, bottom: 48, left: 48 },
    xAxis: { type: 'category', data: changeDist.map(d=>d.rangeLabel??'') as string[], axisLabel: { fontSize: 11, color: '#666', rotate: changeDist.length>4?20:0 }, axisTick: { show: false }, axisLine: { lineStyle: { color: '#e8e8e8' } } },
    yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }, axisLabel: { fontSize: 11, color: '#999' } },
    series: [{ type: 'bar', data: changeDist.map((d) => { const label = d.rangeLabel??''; let color = '#1677ff'; if (label.includes('-')&&!label.startsWith('0')) color='#ff4d4f'; else if (label.startsWith('0')) color='#faad14'; else if (label.includes('+')) color='#52c41a'; return { value: d.count??0, itemStyle: { color, borderRadius: [4,4,0,0] } }; }), barWidth: '55%', label: { show: true, position: 'top', fontSize: 11, color: '#666', formatter: (p:any)=>`${p.value}人` } }],
  }), [changeDist]);

  // ========== 预览表格列（不变） ==========

  const previewColumns: ColumnsType<API.SalaryDetailVO> = [
    { title: '工号', dataIndex: 'employeeNo', width: 100, fixed: 'left' as const },
    { title: '姓名', dataIndex: 'employeeName', width: 80, fixed: 'left' as const },
    { title: '部门', dataIndex: 'departmentName', width: 100, ellipsis: true },
    { title: '基本工资', dataIndex: 'baseSalary', width: 100, align: 'right', render: (v) => v != null ? `¥${(v as number).toLocaleString()}` : '-' },
    { title: '绩效奖金', dataIndex: 'performanceBonus', width: 90, align: 'right', render: (v) => v != null ? `¥${(v as number).toLocaleString()}` : '-' },
    { title: '应发合计', dataIndex: 'grossSalary', width: 100, align: 'right', render: (v) => <span style={{ fontWeight: 500 }}>{v != null ? `¥${(v as number).toLocaleString()}` : '-'}</span> },
    { title: '社保+公积金', width: 110, align: 'right', render: (_, r) => { const total = (r.socialPension??0)+(r.socialMedical??0)+(r.socialUnemployment??0)+(r.housingFund??0); return <span style={{ color: '#ff4d4f' }}>-¥{total.toLocaleString()}</span>; } },
    { title: '个税', dataIndex: 'incomeTax', width: 80, align: 'right', render: (v) => v ? <span style={{ color: '#ff4d4f' }}>-¥{(v as number).toLocaleString()}</span> : '-' },
    { title: '实发工资', dataIndex: 'netSalary', width: 110, align: 'right', fixed: 'right' as const, render: (v) => <span style={{ fontWeight: 600, color: '#1677ff', fontSize: 13 }}>{v != null ? `¥${(v as number).toLocaleString()}` : '-'}</span> },
    { title: '状态', dataIndex: 'hasAnomaly', width: 90, fixed: 'right' as const, render: (v, r) => { const info = ANOMALY_MAP[v??0]; if (v===0) return <Tag color="success">正常</Tag>; return <span><Tag color={info.color}>{info.icon} {info.label}</Tag>{r.anomalyReason && <div style={{ fontSize: 11, color: v===2?'#ff4d4f':'#faad14', maxWidth: 140 }}>{r.anomalyReason.length>20?r.anomalyReason.substring(0,20)+'…':r.anomalyReason}</div>}</span>; } },
  ];

  // ========== 步骤条 ==========

  const status = activeBatch?.status ?? '';
  const stepCurrent = STATUS_STEP_MAP[status] ?? 0;
  const isRejected = status === 'REJECTED';
  const stepperItems = STEP_ITEMS.map((item, i) => {
    let stepStatus: 'wait' | 'process' | 'finish' | 'error' = 'wait';
    if (isRejected) stepStatus = i <= stepCurrent ? 'finish' : 'wait';
    else if (i < stepCurrent) stepStatus = 'finish';
    else if (i === stepCurrent) stepStatus = 'process';
    return { ...item, status: stepStatus };
  });

  // ========== 底部操作栏（修正版） ==========

  const footerActions = () => {
    const s = status;
    const btns: React.ReactNode[] = [];

    if (s === 'DRAFT') {
      btns.push(<Button key="calc" type="primary" icon={<PlayCircleOutlined />} onClick={handleCalculate}>开始计算</Button>);
    }

    if (s === 'PENDING_CONFIRM') {
      btns.push(<Button key="adjust" icon={<SettingOutlined />} onClick={() => setAdjustOpen(true)}>手动调整</Button>);
      btns.push(<Button key="submit" type="primary" icon={<SendOutlined />} onClick={handleSubmit}>提交审批</Button>);
    }

    // 审批中：只显示导出，不显示审批按钮（审批由审批中心处理）
    if (s === 'APPROVING') {
      btns.push(<Button key="export" icon={<DownloadOutlined />} onClick={handleExport}>导出 Excel</Button>);
    }

    // 已通过：可导出 + 可调整 + 标记发放
    if (s === 'APPROVED') {
      btns.push(<Button key="adjust" icon={<SettingOutlined />} onClick={() => setAdjustOpen(true)}>手动调整</Button>);
      btns.push(<Button key="export" icon={<DownloadOutlined />} onClick={handleExport}>导出 Excel</Button>);
      if (canAuditSalary) {
        btns.push(<Button key="paid" type="primary" icon={<DollarOutlined />} onClick={handleMarkPaid}>标记已发放</Button>);
      }
    }

    // 已发放：可导出
    if (s === 'PAID') {
      btns.push(<Button key="export" icon={<DownloadOutlined />} onClick={handleExport}>导出 Excel</Button>);
    }

    return btns;
  };

  // ========== 渲染 ==========

  const showCharts = activeBatchId && (trend.length > 0 || deptDist.length > 0 || composition.length > 0 || socialSecurity.length > 0 || changeDist.length > 0);

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, marginBottom: 4 }}>月度薪资核算</Title>
          <Text type="secondary">管理和审核每月员工薪资发放</Text>
        </div>
        <Space>
          <Select style={{ width: 280 }} value={activeBatchId} onChange={(v) => setActiveId(v)}
            loading={batchesLoading} placeholder="选择核算批次" showSearch optionFilterProp="label"
            options={batches.map((b) => ({
              label: `${b.salaryMonth ?? ''} · ${b.batchNo ?? ''} (${STATUS_MAP[b.status ?? '']?.label ?? b.status ?? '-'})`,
              value: b.id,
            }))}
          />
          {canAuditSalary && <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>新建核算批次</Button>}
          <Button icon={<ReloadOutlined />} onClick={() => refresh()}>刷新</Button>
        </Space>
      </div>

      {/* 步骤条 */}
      <Card style={{ marginBottom: 16, ...CARD_STYLE }}>
        <Steps current={isRejected ? -1 : stepCurrent} status={isRejected ? 'error' : 'process'} items={stepperItems} />
      </Card>

      {/* 统计卡片 */}
      {activeBatch && (
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}><Card size="small" style={CARD_STYLE}><Statistic title="参与核算人数" value={activeBatch.totalEmployeeCount ?? 0} suffix="人" valueStyle={{ color: '#1677ff', fontSize: 26, fontWeight: 600 }} /></Card></Col>
          <Col span={6}><Card size="small" style={CARD_STYLE}><Statistic title="应发总额" value={activeBatch.totalGross ?? 0} precision={2} prefix="¥" valueStyle={{ color: '#52c41a', fontSize: 26, fontWeight: 600 }} /></Card></Col>
          <Col span={6}><Card size="small" style={CARD_STYLE}><Statistic title="实发总额" value={activeBatch.totalNet ?? 0} precision={2} prefix="¥" valueStyle={{ color: '#722ED1', fontSize: 26, fontWeight: 600 }} /></Card></Col>
          <Col span={6}><Card size="small" style={CARD_STYLE}><Statistic title="异常标记" value={anomalyCount} suffix="条" valueStyle={{ color: anomalyCount > 0 ? '#ff4d4f' : '#999', fontSize: 26, fontWeight: 600 }} /></Card></Col>
        </Row>
      )}

      {/* 审批中状态提示 */}
      {status === 'APPROVING' && (
        <Alert type="info" showIcon style={{ marginBottom: 16 }}
          message={canAuditSalary
            ? '该批次正在审批中。作为审批人，你可以审核通过或驳回。'
            : '该批次已提交审批，正在等待审批人审核。审批通过后工资条将对员工可见。'}
        />
      )}

      {/* 核算预览表格 */}
      <Card
        title={<Space><EyeOutlined /><span>核算预览</span><Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>{activeBatch && `批次 ${activeBatch.batchNo} · 共 ${previewTotal} 条`}</Text></Space>}
        extra={<Button size="small" onClick={async () => { if (!activeBatchIdRef.current) return; setPreviewLoading(true); try { const raw: any = await previewBatchUsingGet({ id: activeBatchIdRef.current, current: 1, size: 20 }); const pData = raw?.data ?? raw; let records: any[] = []; if (Array.isArray(pData)) records = pData; else if (pData && Array.isArray(pData.records)) records = pData.records; setPreviewRecords(records); setPreviewTotal(pData?.total ?? records.length); } catch (e) { console.error('刷新预览失败:', e); } finally { setPreviewLoading(false); } }}>刷新数据</Button>}
        style={{ marginBottom: 20, ...CARD_STYLE }}
      >
        <Spin spinning={previewLoading}>
          {previewRecords.length === 0 ? (
            <Empty description={!activeBatch ? '请先选择一个批次' : status === 'DRAFT' ? '批次尚未计算，点击底部「开始计算」生成核算数据' : '暂无核算数据'} />
          ) : (
            <>
              <style>{`.row-anomaly-warn td{background-color:#fffbe6!important}.row-anomaly-block td{background-color:#fff1f0!important}`}</style>
              <Table<API.SalaryDetailVO> columns={previewColumns} dataSource={previewRecords} rowKey="id" size="middle" scroll={{ x: 1100 }}
                rowClassName={(r) => { if (r.hasAnomaly === 2) return 'row-anomaly-block'; if (r.hasAnomaly === 1) return 'row-anomaly-warn'; return ''; }}
                pagination={{ total: previewTotal, showSizeChanger: true, showTotal: (t) => `共 ${t} 条`, pageSizeOptions: ['20', '50', '100'],
                  onChange: async (page, size) => { if (!activeBatchIdRef.current) return; setPreviewLoading(true); try { const raw: any = await previewBatchUsingGet({ id: activeBatchIdRef.current, current: page, size }); const pData = raw?.data ?? raw; let records: any[] = []; if (Array.isArray(pData)) records = pData; else if (pData && Array.isArray(pData.records)) records = pData.records; setPreviewRecords(records); } catch (e) { console.error('分页加载失败:', e); } finally { setPreviewLoading(false); } },
                }}
              />
            </>
          )}
        </Spin>
      </Card>

      {/* 图表分析区 */}
      <Spin spinning={chartLoading}>
        {showCharts && (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}><Card title={<span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>薪资成本月度趋势</span>} size="small" style={CARD_STYLE} styles={{ body: { padding: '8px 12px 4px' } }}>{trend.length > 0 ? <ReactECharts option={trendOption} style={{ height: CHART_HEIGHT }} /> : <Empty description="暂无数据" />}</Card></Col>
              <Col span={12}><Card title={<span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>部门薪资分布</span>} size="small" style={CARD_STYLE} styles={{ body: { padding: '8px 12px 4px' } }}>{deptDist.length > 0 ? <ReactECharts option={deptOption} style={{ height: CHART_HEIGHT }} /> : <Empty description="暂无数据" />}</Card></Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}><Card title={<span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>薪资构成占比</span>} size="small" style={CARD_STYLE} styles={{ body: { padding: '8px 12px 4px' } }}>{composition.length > 0 ? <ReactECharts option={compositionOption} style={{ height: CHART_HEIGHT }} /> : <Empty description="暂无数据" />}</Card></Col>
              <Col span={12}><Card title={<span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>社保公积金对比</span>} size="small" style={CARD_STYLE} styles={{ body: { padding: '8px 12px 4px' } }}>{socialSecurity.length > 0 ? <ReactECharts option={socialSecurityOption} style={{ height: CHART_HEIGHT }} /> : <Empty description="暂无数据" />}</Card></Col>
            </Row>
            <Row gutter={16}><Col span={12}><Card title={<span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>薪资变动分布（与上月对比）</span>} size="small" style={CARD_STYLE} styles={{ body: { padding: '8px 12px 4px' } }}>{changeDist.length > 0 ? <ReactECharts option={changeOption} style={{ height: CHART_HEIGHT }} /> : <Empty description="暂无数据" />}</Card></Col></Row>
          </>
        )}
        {!showCharts && activeBatchId && !chartLoading && <Empty description="暂无统计数据" style={{ padding: 40 }} />}
      </Spin>

      {/* 底部固定操作栏 */}
      {activeBatch && footerActions().length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 200, right: 0, zIndex: 100,
          background: '#fff', borderTop: '1px solid #f0f0f0', padding: '12px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        }}>
          <Space>
            <Text strong>{activeBatch.salaryMonth} 薪资核算</Text>
            <Text type="secondary">·</Text>
            <Tag color={STATUS_MAP[status]?.color}>{STATUS_MAP[status]?.label ?? status}</Tag>
            <Text type="secondary">批次号：{activeBatch.batchNo}</Text>
          </Space>
          <Space size={12}>{footerActions()}</Space>
        </div>
      )}

      {/* 弹窗 */}
      <Modal title="新建核算批次" open={createOpen}
        onCancel={() => { setCreateOpen(false); setCreateMonth(null); }}
        onOk={handleCreate} confirmLoading={createLoading}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 8 }}>选择核算月份：</div>
          <DatePicker picker="month" style={{ width: '100%' }} placeholder="请选择月份" format="YYYY-MM"
            value={createMonth ? dayjs(createMonth) : null}
            onChange={(_, dateStr) => setCreateMonth(dateStr as string)}
          />
        </div>
      </Modal>

      <BatchAdjustModal open={adjustOpen} batchId={activeBatchId ?? 0}
        onClose={() => setAdjustOpen(false)}
        onSuccess={async () => { setAdjustOpen(false); await refresh(); }}
      />
    </div>
  );
};

export default BatchPage;
