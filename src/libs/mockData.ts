/**
 * 集中式 Mock 数据
 * 由于项目使用 axios + 无后端，这里集中管理所有演示用 mock 数据
 * 通过 request.ts 的请求拦截器自动返回
 */

import dayjs from 'dayjs';

// ============ 部门 Mock ============
export const mockDepartments: any[] = [
  {
    id: 1,
    name: '集团总部',
    code: 'HQ',
    parentId: null,
    parentName: null,
    managerId: 1,
    managerName: '张总',
    employeeCount: 320,
    childCount: 3,
    sortOrder: 1,
    level: 1,
    description: '负责全集团战略规划与决策',
    children: [
      {
        id: 2,
        name: '技术中心',
        code: 'TECH',
        parentId: 1,
        parentName: '集团总部',
        managerId: 2,
        managerName: '李技术',
        employeeCount: 180,
        childCount: 3,
        sortOrder: 1,
        level: 2,
        description: '负责全集团技术研发与平台建设',
        children: [
          {
            id: 4,
            name: '前端工程部',
            code: 'FE',
            parentId: 2,
            parentName: '技术中心',
            managerId: 4,
            managerName: '陈前端',
            employeeCount: 55,
            childCount: 0,
            sortOrder: 1,
            level: 3,
            description: '负责前端技术研发',
            children: [],
          },
          {
            id: 5,
            name: '后端工程部',
            code: 'BE',
            parentId: 2,
            parentName: '技术中心',
            managerId: 5,
            managerName: '刘后端',
            employeeCount: 80,
            childCount: 0,
            sortOrder: 2,
            level: 3,
            description: '负责后端技术研发',
            children: [],
          },
          {
            id: 6,
            name: '数据工程部',
            code: 'DE',
            parentId: 2,
            parentName: '技术中心',
            managerId: 6,
            managerName: '孙数据',
            employeeCount: 45,
            childCount: 0,
            sortOrder: 3,
            level: 3,
            description: '负责大数据与数据分析',
            children: [],
          },
        ],
      },
      {
        id: 3,
        name: '商业中心',
        code: 'BIZ',
        parentId: 1,
        parentName: '集团总部',
        managerId: 3,
        managerName: '王商业',
        employeeCount: 90,
        childCount: 2,
        sortOrder: 2,
        level: 2,
        description: '负责全集团商业运营与市场拓展',
        children: [
          {
            id: 7,
            name: '商品运营部',
            code: 'PROD',
            parentId: 3,
            parentName: '商业中心',
            managerId: 7,
            managerName: '周运营',
            employeeCount: 50,
            childCount: 0,
            sortOrder: 1,
            level: 3,
            description: '负责商品运营管理',
            children: [],
          },
          {
            id: 8,
            name: '用户增长部',
            code: 'GROW',
            parentId: 3,
            parentName: '商业中心',
            managerId: 8,
            managerName: '吴增长',
            employeeCount: 40,
            childCount: 0,
            sortOrder: 2,
            level: 3,
            description: '负责用户增长与营销',
            children: [],
          },
        ],
      },
      {
        id: 9,
        name: '职能中心',
        code: 'FUNC',
        parentId: 1,
        parentName: '集团总部',
        managerId: 9,
        managerName: '赵职能',
        employeeCount: 50,
        childCount: 2,
        sortOrder: 3,
        level: 2,
        description: '负责集团行政管理与支持',
        children: [
          {
            id: 10,
            name: '人力资源部',
            code: 'HR',
            parentId: 9,
            parentName: '职能中心',
            managerId: 10,
            managerName: '郑人力',
            employeeCount: 18,
            childCount: 0,
            sortOrder: 1,
            level: 3,
            description: '负责人力资源管理',
            children: [],
          },
          {
            id: 11,
            name: '财务部',
            code: 'FIN',
            parentId: 9,
            parentName: '职能中心',
            managerId: 11,
            managerName: '钱财务',
            employeeCount: 32,
            childCount: 0,
            sortOrder: 2,
            level: 3,
            description: '负责财务管理',
            children: [],
          },
        ],
      },
    ],
  },
];

/** 把树形数据拍平为列表 */
export function flattenDepartments(depts: any[] = mockDepartments): any[] {
  const result: any[] = [];
  const walk = (list: any[]) => {
    list.forEach((d) => {
      result.push(d);
      if (d.children?.length) walk(d.children);
    });
  };
  walk(depts);
  return result;
}

// ============ 职位 Mock ============
export const mockPositions: any[] = [
  {
    id: 1,
    name: 'CEO 首席执行官',
    code: 'CEO',
    departmentId: 1,
    departmentName: '集团总部',
    sequence: '管理序列',
    level: 'P10',
    description: '全面负责公司经营',
  },
  {
    id: 2,
    name: 'CTO 首席技术官',
    code: 'CTO',
    departmentId: 2,
    departmentName: '技术中心',
    sequence: '管理序列',
    level: 'P9',
    description: '负责技术战略',
  },
  {
    id: 3,
    name: '前端工程师',
    code: 'FE_ENG',
    departmentId: 4,
    departmentName: '前端工程部',
    sequence: '专业序列',
    level: 'P6',
    description: '负责前端开发',
  },
  {
    id: 4,
    name: '高级前端工程师',
    code: 'SR_FE_ENG',
    departmentId: 4,
    departmentName: '前端工程部',
    sequence: '专业序列',
    level: 'P7',
    description: '负责核心前端架构',
  },
  {
    id: 5,
    name: '后端工程师',
    code: 'BE_ENG',
    departmentId: 5,
    departmentName: '后端工程部',
    sequence: '专业序列',
    level: 'P6',
    description: '负责后端开发',
  },
  {
    id: 6,
    name: '高级后端工程师',
    code: 'SR_BE_ENG',
    departmentId: 5,
    departmentName: '后端工程部',
    sequence: '专业序列',
    level: 'P7',
    description: '负责核心后端架构',
  },
  {
    id: 7,
    name: '数据工程师',
    code: 'DE_ENG',
    departmentId: 6,
    departmentName: '数据工程部',
    sequence: '专业序列',
    level: 'P6',
    description: '负责数据平台',
  },
  {
    id: 8,
    name: '产品经理',
    code: 'PM',
    departmentId: 3,
    departmentName: '商业中心',
    sequence: '专业序列',
    level: 'P6',
    description: '负责产品规划',
  },
  {
    id: 9,
    name: '运营专员',
    code: 'OPS',
    departmentId: 7,
    departmentName: '商品运营部',
    sequence: '专业序列',
    level: 'P5',
    description: '负责日常运营',
  },
  {
    id: 10,
    name: '市场专员',
    code: 'MKT',
    departmentId: 8,
    departmentName: '用户增长部',
    sequence: '专业序列',
    level: 'P5',
    description: '负责市场推广',
  },
  {
    id: 11,
    name: 'HR 专员',
    code: 'HR',
    departmentId: 10,
    departmentName: '人力资源部',
    sequence: '专业序列',
    level: 'P5',
    description: '负责人力资源',
  },
  {
    id: 12,
    name: '财务分析师',
    code: 'FIN_ANA',
    departmentId: 11,
    departmentName: '财务部',
    sequence: '专业序列',
    level: 'P6',
    description: '负责财务分析',
  },
];

// ============ 员工 Mock ============
const STATUSES = [
  { value: 1, label: '正式', color: 'green' },
  { value: 2, label: '试用', color: 'orange' },
  { value: 3, label: '离职', color: 'red' },
];

const GENDERS = ['男', '女'];
const JOB_LEVELS = ['P4', 'P5', 'P6', 'P7', 'P8', 'P9'];
const EMPLOYMENT_TYPES = ['全职', '兼职', '实习'];

function randomPhone() {
  return '138' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
}

function randomIdCard() {
  // 18 位身份证号
  const area = '110101';
  const birth = '19900101';
  const seq = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  const check = '0123456789X'[Math.floor(Math.random() * 11)];
  return area + birth + seq + check;
}

function buildEmployee(index: number) {
  const dept = flattenDepartments()[index % 11] || mockDepartments[0];
  const pos = mockPositions[index % mockPositions.length];
  const status = STATUSES[index % 2].value; // 多数为正式/试用
  const gender = GENDERS[index % 2];
  return {
    id: index + 1,
    name: '员工' + String(index + 1).padStart(3, '0'),
    employeeNo: 'E' + String(20240000 + index + 1),
    account: 'user' + String(index + 1).padStart(3, '0'),
    gender: gender,
    phone: randomPhone(),
    email: `user${index + 1}@company.com`,
    idCard: randomIdCard(),
    birthDate: '1992-03-15',
    householdAddress: '上海市浦东新区',
    currentAddress: '上海市浦东新区张江高科园区',
    departmentId: dept.id,
    departmentName: dept.name,
    positionId: pos.id,
    positionName: pos.name,
    jobLevel: JOB_LEVELS[index % JOB_LEVELS.length],
    employmentType: EMPLOYMENT_TYPES[0],
    workLocation: '上海',
    hireDate: dayjs()
      .subtract(index * 30, 'day')
      .format('YYYY-MM-DD'),
    status: status,
    statusLabel: STATUSES.find((s) => s.value === status)?.label,
    createTime: dayjs()
      .subtract(index * 30 + 10, 'day')
      .format('YYYY-MM-DD'),
    updateTime: dayjs().subtract(index, 'day').format('YYYY-MM-DD'),
  };
}

export const mockEmployees: any[] = Array.from({ length: 60 }, (_, i) =>
  buildEmployee(i),
);

/** 员工详情（含薪资、合同等扩展信息） */
export function getMockEmployeeDetail(id: number) {
  const emp = mockEmployees.find((e) => e.id === id) || mockEmployees[0];
  return {
    ...emp,
    /** 基础信息 */
    systemAccount: emp.account,
    /** 工作信息 */
    directReportName: '王总',
    /** 合同信息 */
    contractType: '无固定期限',
    contractEndDate: null,
    probationRatio: 0.8,
    salaryAccount: '标准账套B',
    baseSalary: 20000,
    bankAccount: '6228 4800 8888 8888',
    bankName: '招商银行',
    /** 权限：哪些字段可见 */
    permissions: ['phone', 'idCard'],
  };
}

// ============ 通用分页响应 ============
export function paginate<T>(list: T[], current = 1, pageSize = 10) {
  const start = (current - 1) * pageSize;
  return {
    records: list.slice(start, start + pageSize),
    total: list.length,
    current: Number(current) || 1,
    size: Number(pageSize) || 10,
  };
}
