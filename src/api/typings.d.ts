declare namespace API {
  type ApprovalActionRequest = {
    comment?: string;
    detailId?: number;
    targetUserId?: number;
  };

  type ApprovalDelegationVO = {
    businessTypes?: string;
    createTime?: string;
    delegateName?: string;
    delegatorName?: string;
    endDate?: string;
    id?: number;
    startDate?: string;
    status?: number;
  };

  type ApprovalDetailVO = {
    applicantName?: string;
    applyTime?: string;
    businessId?: number;
    businessType?: string;
    businessTypeText?: string;
    currentStep?: number;
    finishedAt?: string;
    nodeHistory?: NodeDetail[];
    recordId?: number;
    status?: string;
    statusText?: string;
    totalSteps?: number;
  };

  type ApprovalPendingVO = {
    applicantName?: string;
    applyTime?: string;
    businessId?: number;
    businessType?: string;
    businessTypeText?: string;
    currentNodeName?: string;
    detailId?: number;
    recordId?: number;
  };

  type ApprovalRequest = {
    comment?: string;
    id?: number;
    result?: number;
  };

  type AttendanceCalendarVO = {
    dailyStatus?: Record<string, any>;
    lateDays?: number;
    leaveDays?: number;
    makeupAvailableDates?: string[];
    missingDays?: number;
    month?: string;
    normalDays?: number;
  };

  type AttendanceVO = {
    attendanceDate?: string;
    id?: number;
    punchInTime?: string;
    punchInType?: number;
    punchOutTime?: string;
    punchOutType?: number;
    remark?: string;
    status?: number;
    statusText?: string;
  };

  type BaseResponseApprovalDetailVO_ = {
    code?: number;
    data?: ApprovalDetailVO;
    message?: string;
  };

  type BaseResponseAttendanceCalendarVO_ = {
    code?: number;
    data?: AttendanceCalendarVO;
    message?: string;
  };

  type BaseResponseAttendanceVO_ = {
    code?: number;
    data?: AttendanceVO;
    message?: string;
  };

  type BaseResponseBoolean_ = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseDepartmentMergeResultVO_ = {
    code?: number;
    data?: DepartmentMergeResultVO;
    message?: string;
  };

  type BaseResponseDepartmentTreeVO_ = {
    code?: number;
    data?: DepartmentTreeVO;
    message?: string;
  };

  type BaseResponseEmpProfileVO_ = {
    code?: number;
    data?: EmpProfileVO;
    message?: string;
  };

  type BaseResponseLeaveProgressVO_ = {
    code?: number;
    data?: LeaveProgressVO;
    message?: string;
  };

  type BaseResponseLeaveVO_ = {
    code?: number;
    data?: LeaveVO;
    message?: string;
  };

  type BaseResponseListApprovalDelegationVO_ = {
    code?: number;
    data?: ApprovalDelegationVO[];
    message?: string;
  };

  type BaseResponseListApprovalPendingVO_ = {
    code?: number;
    data?: ApprovalPendingVO[];
    message?: string;
  };

  type BaseResponseListAttendanceVO_ = {
    code?: number;
    data?: AttendanceVO[];
    message?: string;
  };

  type BaseResponseListDepartmentTreeVO_ = {
    code?: number;
    data?: DepartmentTreeVO[];
    message?: string;
  };

  type BaseResponseListLeaveVO_ = {
    code?: number;
    data?: LeaveVO[];
    message?: string;
  };

  type BaseResponseListLoginLogVO_ = {
    code?: number;
    data?: LoginLogVO[];
    message?: string;
  };

  type BaseResponseListMakeupPunchVO_ = {
    code?: number;
    data?: MakeupPunchVO[];
    message?: string;
  };

  type BaseResponseListPositionVO_ = {
    code?: number;
    data?: PositionVO[];
    message?: string;
  };

  type BaseResponseListSalarySlipVO_ = {
    code?: number;
    data?: SalarySlipVO[];
    message?: string;
  };

  type BaseResponseListSalaryTrendVO_ = {
    code?: number;
    data?: SalaryTrendVO[];
    message?: string;
  };

  type BaseResponseListSequenceLevelVO_ = {
    code?: number;
    data?: SequenceLevelVO[];
    message?: string;
  };

  type BaseResponseLoginUserVO_ = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type BaseResponseLong_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseMakeupPunchVO_ = {
    code?: number;
    data?: MakeupPunchVO;
    message?: string;
  };

  type BaseResponseMapStringLong_ = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  };

  type BaseResponsePageUser_ = {
    code?: number;
    data?: PageUser_;
    message?: string;
  };

  type BaseResponsePageUserVO_ = {
    code?: number;
    data?: PageUserVO_;
    message?: string;
  };

  type BaseResponseSalarySlipDetailVO_ = {
    code?: number;
    data?: SalarySlipDetailVO;
    message?: string;
  };

  type BaseResponseString_ = {
    code?: number;
    data?: string;
    message?: string;
  };

  type BaseResponseUser_ = {
    code?: number;
    data?: User;
    message?: string;
  };

  type BaseResponseUserVO_ = {
    code?: number;
    data?: UserVO;
    message?: string;
  };

  type BindPhoneRequest = {
    phone?: string;
  };

  type cancelDelegationUsingPOSTParams = {
    /** id */
    id: number;
  };

  type cancelUsingPOSTParams = {
    /** 请假ID */
    id: number;
  };

  type ChangePasswordRequest = {
    confirmPassword?: string;
    newPassword?: string;
    oldPassword?: string;
  };

  type DelegationRequest = {
    businessTypes?: string;
    delegateId?: number;
    endDate?: string;
    startDate?: string;
  };

  type DeleteRequest = {
    id?: number;
  };

  type DepartmentAddRequest = {
    code?: string;
    description?: string;
    managerId?: number;
    name?: string;
    parentId?: number;
    sortOrder?: number;
  };

  type DepartmentMergeRequest = {
    sourceDeptId?: number;
    targetDeptId?: number;
  };

  type DepartmentMergeResultVO = {
    transferredChildDepts?: number;
    transferredEmployees?: number;
  };

  type DepartmentTreeVO = {
    children?: DepartmentTreeVO[];
    code?: string;
    description?: string;
    employeeCount?: number;
    id?: number;
    managerId?: number;
    managerName?: string;
    name?: string;
    parentId?: number;
    sortOrder?: number;
  };

  type DepartmentUpdateRequest = {
    description?: string;
    id?: number;
    managerId?: number;
    name?: string;
    sortOrder?: number;
  };

  type EmployeeSimpleVO = {
    employeeName?: string;
    employeeNo?: string;
    id?: number;
  };

  type BaseResponseListEmployeeSimpleVO_ = {
    code?: number;
    data?: EmployeeSimpleVO[];
    message?: string;
  };

  type EmpProfileUpdateRequest = {
    currentAddress?: string;
    email?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  };

  type EmpProfileVO = {
    baseSalary?: number;
    createTime?: string;
    currentAddress?: string;
    departmentName?: string;
    editableFields?: string[];
    email?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    employeeName?: string;
    employeeNo?: string;
    employmentType?: string;
    gender?: number;
    hireDate?: string;
    hireType?: number;
    id?: number;
    idCard?: string;
    phone?: string;
    positionName?: string;
    status?: number;
    updateTime?: string;
  };

  type getApprovalDetailUsingGETParams = {
    /** recordId */
    recordId: number;
  };

  type getApprovalProgressUsingGETParams = {
    /** id */
    id: number;
  };

  type getCalendarUsingGETParams = {
    /** month */
    month: string;
  };

  type getDepartmentDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getMonthRecordsUsingGETParams = {
    /** month */
    month: string;
  };

  type getSalarySlipDetailUsingPOSTParams = {
    /** id */
    id: number;
  };

  type getUserByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getUserVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type LeaveApplyRequest = {
    endDate?: string;
    leaveType?: number;
    reason?: string;
    startDate?: string;
  };

  type LeaveProgressVO = {
    leave?: LeaveVO;
    progressNodes?: ProgressNode[];
  };

  type LeaveVO = {
    approveComment?: string;
    approveTime?: string;
    approverId?: number;
    createTime?: string;
    employeeId?: number;
    employeeName?: string;
    endDate?: string;
    id?: number;
    leaveType?: number;
    leaveTypeText?: string;
    reason?: string;
    startDate?: string;
    status?: number;
    statusText?: string;
    totalDays?: number;
  };

  type listPositionsUsingGETParams = {
    /** departmentId */
    departmentId?: number;
    /** sequence */
    sequence?: number;
  };

  type LoginLogVO = {
    device?: string;
    failReason?: string;
    id?: number;
    ip?: string;
    isSuccess?: number;
    loginTime?: string;
    loginType?: number;
    loginTypeText?: string;
  };

  type LoginUserVO = {
    createTime?: string;
    id?: number;
    updateTime?: string;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type MakeupPunchApplyRequest = {
    punchDate?: string;
    punchTime?: string;
    punchType?: number;
    reason?: string;
  };

  type MakeupPunchVO = {
    approveComment?: string;
    approveTime?: string;
    approverId?: number;
    createTime?: string;
    employeeId?: number;
    employeeName?: string;
    id?: number;
    punchDate?: string;
    punchTime?: string;
    punchType?: number;
    punchTypeText?: string;
    reason?: string;
    status?: number;
    statusText?: string;
  };

  type MapStringLong_ = true;

  type NodeDetail = {
    action?: string;
    actionText?: string;
    approverName?: string;
    comment?: string;
    delegatedByName?: string;
    isDelegated?: number;
    nodeName?: string;
    operateTime?: string;
    stepOrder?: number;
  };

  type OrderItem = {
    asc?: boolean;
    column?: string;
  };

  type PageUser_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: User[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageUserVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: UserVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PositionAddRequest = {
    defaultProbationMonths?: number;
    departmentId?: number;
    description?: string;
    levelMax?: string;
    levelMin?: string;
    name?: string;
    sequence?: number;
  };

  type PositionUpdateRequest = {
    defaultProbationMonths?: number;
    departmentId?: number;
    description?: string;
    id?: number;
    levelMax?: string;
    levelMin?: string;
    name?: string;
    sequence?: number;
  };

  type PositionVO = {
    createTime?: string;
    defaultProbationMonths?: number;
    departmentId?: number;
    departmentName?: string;
    description?: string;
    id?: number;
    levelMax?: string;
    levelMin?: string;
    levelRange?: string;
    name?: string;
    sequence?: number;
    sequenceName?: string;
  };

  type ProgressNode = {
    comment?: string;
    nodeName?: string;
    operateTime?: string;
    operatorName?: string;
    status?: number;
  };

  type PunchRequest = {
    location?: string;
    punchType?: number;
  };

  type SalarySlipDetailVO = {
    adjustReason?: string;
    allowance?: number;
    baseSalary?: number;
    employeeName?: string;
    employeeNo?: string;
    grossSalary?: number;
    housingFund?: number;
    id?: number;
    incomeTax?: number;
    lateDeduction?: number;
    leaveDeduction?: number;
    manualAdjust?: number;
    netSalary?: number;
    overtimePay?: number;
    performanceBonus?: number;
    salaryMonth?: string;
    socialMedical?: number;
    socialPension?: number;
    socialUnemployment?: number;
    totalDeduction?: number;
  };

  type SalarySlipVO = {
    batchStatus?: string;
    grossSalary?: number;
    hasAnomaly?: number;
    id?: number;
    netSalary?: number;
    salaryMonth?: string;
    totalDeduction?: number;
  };

  type SalaryTrendVO = {
    grossSalary?: number;
    month?: string;
    netSalary?: number;
  };

  type SequenceLevelVO = {
    levels?: string[];
    sequence?: number;
    sequenceCode?: string;
    sequenceName?: string;
  };

  type uploadFileUsingPOSTParams = {
    biz?: string;
  };

  type User = {
    createTime?: string;
    employeeId?: number;
    id?: number;
    isDelete?: number;
    roleId?: number;
    updateTime?: string;
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userPassword?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserAddRequest = {
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userRole?: string;
  };

  type UserLoginRequest = {
    userAccount?: string;
    userPassword?: string;
  };

  type UserQueryRequest = {
    current?: number;
    id?: number;
    mpOpenId?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    unionId?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserRegisterRequest = {
    checkPassword?: string;
    userAccount?: string;
    userPassword?: string;
  };

  type UserUpdateMyRequest = {
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
  };

  type UserUpdateRequest = {
    id?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserVO = {
    createTime?: string;
    id?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type VerifyPasswordRequest = {
    password?: string;
  };

  // ==================== 薪资管理 (SalaryManage) 请求类型 ====================

  type SalaryAccountRequest = {
    /** 生效日期 */
    effectiveDate?: string;
    /** 工资项目列表 */
    items?: SalaryItemRequest[];
    /** 账套名称 */
    name?: string;
    /** 适用范围ID集合(JSON数组) */
    scopeIds?: string;
    /** 适用范围类型：1=部门 2=职位 3=职级 */
    scopeType?: number;
  };

  type SalaryItemRequest = {
    /** 计算公式/规则描述 */
    formula?: string;
    /** 是否计入个税：0=否 1=是 */
    isTaxable?: number;
    /** 项目类型：1=固定收入 2=变动收入 3=考勤扣款 4=社保扣除 5=公积金扣除 6=个税 */
    itemType?: number;
    /** 项目名称 */
    name?: string;
    /** 排序序号 */
    sortOrder?: number;
  };

  type SalaryItemSortRequest = {
    /** 排序后的项目ID列表 */
    itemIds?: number[];
  };

  type SalaryBatchCreateRequest = {
    /** 核算月份，格式 yyyy-MM */
    salaryMonth?: string;
  };

  type SalaryBatchAdjustRequest = {
    /** 调整原因 */
    adjustReason?: string;
    /** 员工ID */
    employeeId?: number;
    /** 调整金额（正数=补发，负数=扣减） */
    manualAdjust?: number;
  };

  type SalaryBatchRejectRequest = {
    /** 驳回原因 */
    reason?: string;
  };

  type EmployeeSalaryUpdateRequest = {
    /** 适用账套ID */
    accountSetId?: number;
    /** 岗位津贴基数 */
    allowanceBase?: number;
    /** 基本工资 */
    baseSalary?: number;
    /** 生效日期 */
    effectiveDate?: string;
    /** 公积金缴纳基数 */
    housingFundBase?: number;
    /** 绩效奖金基数 */
    performanceBase?: number;
    /** 试用期薪资比例 */
    probationSalaryRatio?: number;
    /** 备注 */
    remark?: string;
    /** 社保缴纳基数 */
    socialInsuranceBase?: number;
  };

  type getBatchPreviewUsingGETParams = {
    /** current */
    current?: number;
    /** size */
    size?: number;
  };

  // ==================== 薪资管理 (SalaryManage) VO类型 ====================

  type SalaryAccountVO = {
    /** 创建时间 */
    createTime?: string;
    /** 生效日期 */
    effectiveDate?: string;
    /** 账套ID */
    id?: number;
    /** 工资项目列表 */
    items?: SalaryItemVO[];
    /** 账套名称 */
    name?: string;
    /** 适用范围ID集合(JSON数组) */
    scopeIds?: string;
    /** 适用范围类型：1=部门 2=职位 3=职级 */
    scopeType?: number;
    /** 适用范围类型文本 */
    scopeTypeText?: string;
    /** 更新时间 */
    updateTime?: string;
  };

  type SalaryItemVO = {
    /** 所属账套ID */
    accountId?: number;
    /** 计算公式/规则描述 */
    formula?: string;
    /** 项目ID */
    id?: number;
    /** 是否计入个税：0=否 1=是 */
    isTaxable?: number;
    /** 项目类型：1=固定收入 2=变动收入 3=考勤扣款 4=社保扣除 5=公积金扣除 6=个税 */
    itemType?: number;
    /** 项目类型文本 */
    itemTypeText?: string;
    /** 项目名称 */
    name?: string;
    /** 排序序号 */
    sortOrder?: number;
  };

  type SalaryBatchVO = {
    /** 批次编号 */
    batchNo?: string;
    /** 创建时间 */
    createdAt?: string;
    /** 批次ID */
    id?: number;
    /** 发放时间 */
    paidAt?: string;
    /** 核算月份 */
    salaryMonth?: string;
    /** 状态 */
    status?: string;
    /** 状态文本 */
    statusText?: string;
    /** 总扣除 */
    totalDeduction?: number;
    /** 总员工数 */
    totalEmployeeCount?: number;
    /** 总应发 */
    totalGross?: number;
    /** 总实发 */
    totalNet?: number;
  };

  type SalaryDetailVO = {
    /** 调整原因 */
    adjustReason?: string;
    /** 岗位津贴 */
    allowance?: number;
    /** 异常原因 */
    anomalyReason?: string;
    /** 基本工资 */
    baseSalary?: number;
    /** 批次ID */
    batchId?: number;
    /** 创建时间 */
    createdAt?: string;
    /** 部门名称 */
    departmentName?: string;
    /** 员工ID */
    employeeId?: number;
    /** 员工姓名 */
    employeeName?: string;
    /** 员工工号 */
    employeeNo?: string;
    /** 应发合计 */
    grossSalary?: number;
    /** 是否有异常 */
    hasAnomaly?: number;
    /** 公积金 */
    housingFund?: number;
    /** 明细ID */
    id?: number;
    /** 个人所得税 */
    incomeTax?: number;
    /** 迟到扣款 */
    lateDeduction?: number;
    /** 请假扣款 */
    leaveDeduction?: number;
    /** 手动调整 */
    manualAdjust?: number;
    /** 实发合计 */
    netSalary?: number;
    /** 加班费 */
    overtimePay?: number;
    /** 绩效奖金 */
    performanceBonus?: number;
    /** 医疗保险 */
    socialMedical?: number;
    /** 养老保险 */
    socialPension?: number;
    /** 失业保险 */
    socialUnemployment?: number;
    /** 扣除合计 */
    totalDeduction?: number;
  };

  type SalaryBatchPreviewVO = {
    /** 批次汇总信息 */
    batch?: SalaryBatchVO;
    /** 当前页码 */
    current?: number;
    /** 分页明细 */
    records?: SalaryDetailVO[];
    /** 每页大小 */
    size?: number;
    /** 总记录数 */
    total?: number;
  };

  type EmployeeSalaryVO = {
    /** 适用账套ID */
    accountSetId?: number;
    /** 账套名称 */
    accountName?: string;
    /** 岗位津贴基数 */
    allowanceBase?: number;
    /** 基本工资 */
    baseSalary?: number;
    /** 银行账号 */
    bankAccount?: string;
    /** 开户行 */
    bankName?: string;
    /** 创建时间 */
    createdTIme?: string;
    /** 部门名称 */
    departmentName?: string;
    /** 生效日期 */
    effectiveDate?: string;
    /** 员工ID */
    employeeId?: number;
    /** 员工姓名 */
    employeeName?: string;
    /** 员工工号 */
    employeeNo?: string;
    /** 公积金缴纳基数 */
    housingFundBase?: number;
    /** 档案ID */
    id?: number;
    /** 绩效奖金基数 */
    performanceBase?: number;
    /** 试用期薪资比例 */
    probationSalaryRatio?: number;
    /** 社保缴纳基数 */
    socialInsuranceBase?: number;
    /** 更新时间 */
    updatedTime?: string;
  };

  type SalaryChangeLogVO = {
    /** 变更类型 */
    changeType?: number;
    /** 变更类型文本 */
    changeTypeText?: string;
    /** 创建时间 */
    createTime?: string;
    /** 生效日期 */
    effectiveDate?: string;
    /** 员工ID */
    employeeId?: number;
    /** 日志ID */
    id?: number;
    /** 新值 */
    newValue?: string;
    /** 旧值 */
    oldValue?: string;
    /** 操作人ID */
    operatorId?: number;
    /** 操作人姓名 */
    operatorName?: string;
    /** 备注 */
    remark?: string;
  };

  // ==================== 薪资管理 (SalaryManage) BaseResponse类型 ====================

  type BaseResponseListSalaryAccountVO_ = {
    code?: number;
    data?: SalaryAccountVO[];
    message?: string;
  };

  type BaseResponseSalaryAccountVO_ = {
    code?: number;
    data?: SalaryAccountVO;
    message?: string;
  };

  type BaseResponseListSalaryBatchVO_ = {
    code?: number;
    data?: SalaryBatchVO[];
    message?: string;
  };

  type BaseResponseSalaryBatchVO_ = {
    code?: number;
    data?: SalaryBatchVO;
    message?: string;
  };

  type BaseResponseSalaryBatchPreviewVO_ = {
    code?: number;
    data?: SalaryBatchPreviewVO;
    message?: string;
  };

  type BaseResponseListSalaryDetailVO_ = {
    code?: number;
    data?: SalaryDetailVO[];
    message?: string;
  };

  type BaseResponseEmployeeSalaryVO_ = {
    code?: number;
    data?: EmployeeSalaryVO;
    message?: string;
  };

  type BaseResponseListSalaryChangeLogVO_ = {
    code?: number;
    data?: SalaryChangeLogVO[];
    message?: string;
  };
}
