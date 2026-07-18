import dayjs from 'dayjs';
const now = dayjs();

const pendingList = [
  { instanceId: 2001, nodeId: 10001, approvalNo: 'APR-2024-001', bizType: 'ONBOARDING', bizTypeDesc: '入职审批', title: '张晓雯的入职申请', applicantId: 300, applicantName: '张晓雯', applicantDepartment: '人力资源部', applicantPosition: 'HR专员', nodeName: '部门负责人审批', nodeOrder: 1, delegatorName: null, status: 1, statusDesc: '待审批', createTime: now.subtract(2, 'hour').format('YYYY-MM-DDTHH:mm:ss'), deadLine: now.add(46, 'hour').format('YYYY-MM-DDTHH:mm:ss'), hireDate: '2024-07-15', salary: '25000', contractType: '正式合同' },
  { instanceId: 2002, nodeId: 10002, approvalNo: 'APR-2024-002', bizType: 'PROBATION', bizTypeDesc: '转正审批', title: '刘海燕的转正申请', applicantId: 301, applicantName: '刘海燕', applicantDepartment: '人力资源部', applicantPosition: 'HR专员', nodeName: '部门负责人审批', nodeOrder: 1, delegatorName: null, status: 1, statusDesc: '待审批', createTime: now.subtract(50, 'hour').format('YYYY-MM-DDTHH:mm:ss'), deadLine: now.subtract(2, 'hour').format('YYYY-MM-DDTHH:mm:ss'), hireDate: '2024-01-15', salary: '28000', contractType: '正式合同' },
  { instanceId: 2003, nodeId: 10003, approvalNo: 'APR-2024-003', bizType: 'TRANSFER', bizTypeDesc: '调岗审批', title: '陈美玲的调岗申请', applicantId: 302, applicantName: '陈美玲', applicantDepartment: '人力资源部', applicantPosition: 'HR专员', nodeName: '新部门负责人审批', nodeOrder: 2, delegatorName: '赵六', status: 1, statusDesc: '待审批', createTime: now.subtract(6, 'hour').format('YYYY-MM-DDTHH:mm:ss'), deadLine: now.add(42, 'hour').format('YYYY-MM-DDTHH:mm:ss'), hireDate: '2023-06-01', salary: '30000', contractType: '正式合同' },
  { instanceId: 2004, nodeId: 10004, approvalNo: 'APR-2024-004', bizType: 'RESIGNATION', bizTypeDesc: '离职审批', title: '吴小明的离职申请', applicantId: 303, applicantName: '吴小明', applicantDepartment: '技术研发部', applicantPosition: '高级工程师', nodeName: 'HR负责人审批', nodeOrder: 2, delegatorName: null, status: 1, statusDesc: '待审批', createTime: now.subtract(24, 'hour').format('YYYY-MM-DDTHH:mm:ss'), deadLine: now.add(24, 'hour').format('YYYY-MM-DDTHH:mm:ss'), hireDate: '2021-03-15', salary: '35000', contractType: '正式合同' },
  { instanceId: 2005, nodeId: 10005, approvalNo: 'APR-2024-005', bizType: 'LEAVE', bizTypeDesc: '请假审批', title: '郑小红的年假申请', applicantId: 304, applicantName: '郑小红', applicantDepartment: '财务部', applicantPosition: '财务专员', nodeName: '直接上级审批', nodeOrder: 1, delegatorName: null, status: 1, statusDesc: '待审批', createTime: now.subtract(1, 'hour').format('YYYY-MM-DDTHH:mm:ss'), deadLine: now.add(47, 'hour').format('YYYY-MM-DDTHH:mm:ss'), hireDate: '2022-08-01', salary: '18000', contractType: '正式合同' },
  { instanceId: 2006, nodeId: 10006, approvalNo: 'APR-2024-006', bizType: 'CARD_REPLENISH', bizTypeDesc: '补卡审批', title: '王大伟的补卡申请', applicantId: 305, applicantName: '王大伟', applicantDepartment: '运营部', applicantPosition: '运营专员', nodeName: '直接上级审批', nodeOrder: 1, delegatorName: null, status: 1, statusDesc: '待审批', createTime: now.subtract(3, 'hour').format('YYYY-MM-DDTHH:mm:ss'), deadLine: now.add(45, 'hour').format('YYYY-MM-DDTHH:mm:ss'), hireDate: '2023-01-15', salary: '15000', contractType: '正式合同' },
];

const processedList = [
  { instanceId: 1001, nodeId: 9001, approvalNo: 'APR-2024-007', bizType: 'ONBOARDING', bizTypeDesc: '入职审批', title: '小明的入职申请', applicantName: 'HR管理员', applicantDepartment: '人力资源部', applicantPosition: 'HR主管', nodeName: '部门负责人审批', nodeStatus: 2, nodeStatusDesc: '已通过', comment: '同意入职', operateTime: now.subtract(2, 'day').format('YYYY-MM-DDTHH:mm:ss') },
  { instanceId: 1002, nodeId: 9002, approvalNo: 'APR-2024-008', bizType: 'PROBATION', bizTypeDesc: '转正审批', title: '小红的转正申请', applicantName: 'HR专员', applicantDepartment: '人力资源部', applicantPosition: 'HR专员', nodeName: '部门负责人审批', nodeStatus: 2, nodeStatusDesc: '已通过', comment: '表现优异，同意转正', operateTime: now.subtract(3, 'day').format('YYYY-MM-DDTHH:mm:ss') },
  { instanceId: 1003, nodeId: 9003, approvalNo: 'APR-2024-009', bizType: 'RESIGNATION', bizTypeDesc: '离职审批', title: '小刚的离职申请', applicantName: 'HR管理员', applicantDepartment: '技术研发部', applicantPosition: '开发工程师', nodeName: 'HR负责人审批', nodeStatus: 3, nodeStatusDesc: '已拒绝', comment: '交接未完成', operateTime: now.subtract(1, 'day').format('YYYY-MM-DDTHH:mm:ss') },
  { instanceId: 1004, nodeId: 9004, approvalNo: 'APR-2024-010', bizType: 'TRANSFER', bizTypeDesc: '调岗审批', title: '小丽的调岗申请', applicantName: 'HR专员', applicantDepartment: '产品部', applicantPosition: '产品经理', nodeName: '新部门负责人审批', nodeStatus: 4, nodeStatusDesc: '已转交', comment: '已转交', operateTime: now.subtract(5, 'day').format('YYYY-MM-DDTHH:mm:ss') },
];

const approvalNodes = (instanceId: number, bizType: string) => {
  const nodes: any[] = [
    { nodeId: instanceId * 10 + 1, nodeName: '部门负责人审批', nodeOrder: 1, approverId: 100, approverName: '李明', approverPosition: '部门负责人', originalApproverId: null, originalApproverName: null, status: 1, statusDesc: '等待审批中...', comment: null, operateTime: null },
  ];
  if (bizType === 'TRANSFER') nodes.push({ nodeId: instanceId * 10 + 3, nodeName: '新部门负责人审批', nodeOrder: 2, approverId: 300, approverName: '孙七', approverPosition: '高级工程师', originalApproverId: 200, originalApproverName: '王五', status: 1, statusDesc: '等待审批中...', comment: null, operateTime: null });
  nodes.push({ nodeId: instanceId * 10 + 2, nodeName: 'HR负责人审批', nodeOrder: bizType === 'TRANSFER' ? 3 : 2, approverId: 100, approverName: '王芳', approverPosition: 'HR负责人', originalApproverId: null, originalApproverName: null, status: 0, statusDesc: '', comment: null, operateTime: null });
  return nodes;
};

const employees = [
  { id: 100, employeeNo: 'EMP001', name: '李明', departmentName: '技术部', positionName: '部门负责人' },
  { id: 200, employeeNo: 'EMP002', name: '王五', departmentName: '产品部', positionName: '产品总监' },
  { id: 300, employeeNo: 'EMP003', name: '孙七', departmentName: '技术部', positionName: '高级工程师' },
  { id: 400, employeeNo: 'EMP004', name: '周八', departmentName: '运营部', positionName: '运营经理' },
  { id: 500, employeeNo: 'EMP005', name: '郑十', departmentName: '财务部', positionName: '财务主管' },
];

const myDelegates = {
  asDelegator: [
    { id: 601, delegatorId: 100, delegatorName: '李四', delegateId: 300, delegateName: '孙强', delegatePosition: '高级经理', startTime: now.subtract(3, 'day').format('YYYY-MM-DDTHH:mm:ss'), endTime: now.add(4, 'day').format('YYYY-MM-DDTHH:mm:ss'), enabled: 1, reason: '出差期间无法及时处理审批' },
    { id: 602, delegatorId: 100, delegatorName: '李四', delegateId: 400, delegateName: '周八', delegatePosition: '运营经理', startTime: now.subtract(10, 'day').format('YYYY-MM-DDTHH:mm:ss'), endTime: now.subtract(3, 'day').format('YYYY-MM-DDTHH:mm:ss'), enabled: 1 },
  ],
  asDelegate: [
    { id: 603, delegatorId: 200, delegatorName: '王五', delegateId: 100, delegateName: '李四', delegatePosition: '技术经理', startTime: now.subtract(1, 'day').format('YYYY-MM-DDTHH:mm:ss'), endTime: now.add(6, 'day').format('YYYY-MM-DDTHH:mm:ss'), enabled: 1 },
  ],
};

export default {
  'GET /api/v1/approvals/pending': (req: any, res: any) => {
    const { bizType, current = 1, pageSize = 20 } = req.query || {};
    let list = bizType ? pendingList.filter((i) => i.bizType === bizType) : [...pendingList];
    const start = (Number(current) - 1) * Number(pageSize);
    res.json({ code: 0, message: 'success', data: { records: list.slice(start, start + Number(pageSize)), total: list.length } });
  },
  'GET /api/v1/approvals/pending-count': (_: any, res: any) => { res.json({ code: 0, message: 'success', data: { count: pendingList.length } }); },
  'GET /api/v1/approvals/processed': (req: any, res: any) => {
    const { bizType, current = 1, pageSize = 20 } = req.query || {};
    let list = bizType ? processedList.filter((i) => i.bizType === bizType) : [...processedList];
    const start = (Number(current) - 1) * Number(pageSize);
    res.json({ code: 0, message: 'success', data: { records: list.slice(start, start + Number(pageSize)), total: list.length } });
  },
  'GET /api/v1/approvals/:instanceId': (req: any, res: any) => {
    const id = Number(req.params.instanceId);
    const p = pendingList.find((i) => i.instanceId === id);
    if (p) return res.json({ code: 0, message: 'success', data: { ...p, nodes: approvalNodes(p.instanceId, p.bizType), currentNodeOrder: p.nodeOrder } });
    const d = processedList.find((i) => i.instanceId === id);
    if (d) return res.json({ code: 0, message: 'success', data: { ...d, nodes: approvalNodes(d.instanceId, d.bizType).map((n: any) => n.nodeOrder === 2 ? { ...n, status: d.nodeStatus, statusDesc: d.nodeStatusDesc, comment: d.comment, operateTime: d.operateTime } : n), currentNodeOrder: 2 } });
    res.json({ code: 40001, message: '审批实例不存在', data: null });
  },
  'POST /api/v1/approvals/:nodeId/approve': (req: any, res: any) => { res.json({ code: 0, message: 'success', data: { nodeId: Number(req.params.nodeId), nodeStatus: 2, nodeStatusDesc: '已通过' } }); },
  'POST /api/v1/approvals/:nodeId/reject': (req: any, res: any) => { res.json({ code: 0, message: 'success', data: { nodeId: Number(req.params.nodeId), nodeStatus: 3, nodeStatusDesc: '已拒绝' } }); },
  'POST /api/v1/approvals/:nodeId/transfer': (req: any, res: any) => { res.json({ code: 0, message: 'success', data: { nodeId: Number(req.params.nodeId), toApproverId: req.body?.toApproverId || 300, nodeStatus: 4, nodeStatusDesc: '已转交' } }); },
  'POST /api/v1/approvals/:instanceId/cancel': (req: any, res: any) => { res.json({ code: 0, message: 'success', data: { instanceId: Number(req.params.instanceId), instanceStatus: 4, instanceStatusDesc: '已撤回' } }); },
  'POST /api/v1/approvals/delegates': (req: any, res: any) => { const e = employees.find((x) => x.id === req.body?.delegateId); res.json({ code: 0, message: 'success', data: { id: 700, delegatorId: 100, delegatorName: '李明', delegateId: req.body?.delegateId, delegateName: e?.name || '未知', delegatePosition: e?.positionName || '', startTime: req.body?.startTime || now.format('YYYY-MM-DDTHH:mm:ss'), endTime: req.body?.endTime || now.add(7, 'day').format('YYYY-MM-DDTHH:mm:ss'), enabled: true, reason: req.body?.reason || '' } }); },
  'DELETE /api/v1/approvals/delegates/:id': (_: any, res: any) => { res.json({ code: 0, message: 'success', data: null }); },
  'GET /api/v1/approvals/delegates/my': (_: any, res: any) => { res.json({ code: 0, message: 'success', data: myDelegates }); },
  'GET /api/v1/employees': (req: any, res: any) => {
    const { name } = req.query || {};
    let list = name ? employees.filter((e) => e.name.includes(name) || e.employeeNo.includes(name)) : employees;
    res.json({ code: 0, message: 'success', data: { records: list, total: list.length } });
  },
};
