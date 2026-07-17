const departments = [
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

function findInChildren(children: any[], id: number): any | null {
  for (const child of children) {
    if (child.id === id) return child;
    if (child.children) {
      const found = findInChildren(child.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findDepartmentById(id: number): any | null {
  for (const dept of departments) {
    if (dept.id === id) return dept;
    if (dept.children) {
      const found = findInChildren(dept.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default {
  'GET /api/api/v1/departments/tree': (req: any, res: any) => {
    res.json({
      code: 0,
      message: 'success',
      data: departments,
    });
  },
  'GET /api/api/v1/departments/:id': (req: any, res: any) => {
    const id = parseInt(req.params.id, 10);
    const dept = findDepartmentById(id);
    if (dept) {
      res.json({
        code: 0,
        message: 'success',
        data: dept,
      });
    } else {
      res.json({
        code: 404,
        message: '部门不存在',
        data: null,
      });
    }
  },
  'GET /api/api/v1/departments': (req: any, res: any) => {
    res.json({
      code: 0,
      message: 'success',
      data: {
        current: 1,
        size: 10,
        total: departments.length,
        records: departments,
      },
    });
  },
  'POST /api/api/v1/departments': (req: any, res: any) => {
    const newDept = {
      id: Date.now(),
      ...req.body,
      employeeCount: 0,
      childCount: 0,
      children: [],
      level: 1,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };
    res.json({
      code: 0,
      message: '创建成功',
      data: newDept,
    });
  },
  'PUT /api/api/v1/departments/:id': (req: any, res: any) => {
    const id = parseInt(req.params.id, 10);
    res.json({
      code: 0,
      message: '更新成功',
      data: {
        id,
        ...req.body,
        updateTime: new Date().toISOString(),
      },
    });
  },
  'DELETE /api/api/v1/departments/:id': (req: any, res: any) => {
    res.json({
      code: 0,
      message: '删除成功',
      data: null,
    });
  },
};
