declare namespace API {
  type abandonUsingPOSTParams = {
    /** id */
    id: number;
  };

  type addItemUsingPOSTParams = {
    /** id */
    id: number;
  };

  type adjustDetailUsingPUTParams = {
    /** id */
    id: number;
  };

  type AnalyticsSummaryVO = {
    activeUsers?: number;
    activeUsersChange?: number;
    avgConversionRate?: number;
    avgConversionRateChange?: number;
    retentionRate?: number;
    retentionRateChange?: number;
    totalRevenue?: number;
    totalRevenueChange?: number;
    totalUsers?: number;
    totalUsersChange?: number;
  };

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

  type ApprovalDetail = {
    action?: string;
    approverId?: number;
    approverName?: string;
    comment?: string;
    createTime?: string;
    delegatedBy?: number;
    id?: number;
    isDelegated?: number;
    nodeId?: number;
    nodeName?: string;
    operateTime?: string;
    recordId?: number;
    stepOrder?: number;
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

  type approveBatchUsingPOSTParams = {
    /** id */
    id: number;
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

  type BaseResponseAnalyticsSummaryVO_ = {
    code?: number;
    data?: AnalyticsSummaryVO;
    message?: string;
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

  type BaseResponseDashboardMetricsVO_ = {
    code?: number;
    data?: DashboardMetricsVO;
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

  type BaseResponseEmployeeDetailVO_ = {
    code?: number;
    data?: EmployeeDetailVO;
    message?: string;
  };

  type BaseResponseEmployeeSalaryVO_ = {
    code?: number;
    data?: EmployeeSalaryVO;
    message?: string;
  };

  type BaseResponseEmpProfileVO_ = {
    code?: number;
    data?: EmpProfileVO;
    message?: string;
  };

  type BaseResponseHrRegularization_ = {
    code?: number;
    data?: HrRegularization;
    message?: string;
  };

  type BaseResponseHrResignation_ = {
    code?: number;
    data?: HrResignation;
    message?: string;
  };

  type BaseResponseHrTransfer_ = {
    code?: number;
    data?: HrTransfer;
    message?: string;
  };

  type BaseResponseInt_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseLeaveBalanceVO_ = {
    code?: number;
    data?: LeaveBalanceVO;
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

  type BaseResponseListConversionRateVO_ = {
    code?: number;
    data?: ConversionRateVO[];
    message?: string;
  };

  type BaseResponseListDepartmentTreeVO_ = {
    code?: number;
    data?: DepartmentTreeVO[];
    message?: string;
  };

  type BaseResponseListGrowthTrendVO_ = {
    code?: number;
    data?: GrowthTrendVO[];
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

  type BaseResponseListModuleUsageVO_ = {
    code?: number;
    data?: ModuleUsageVO[];
    message?: string;
  };

  type BaseResponseListMutationLogVO_ = {
    code?: number;
    data?: MutationLogVO[];
    message?: string;
  };

  type BaseResponseListPositionVO_ = {
    code?: number;
    data?: PositionVO[];
    message?: string;
  };

  type BaseResponseListRecentLogVO_ = {
    code?: number;
    data?: RecentLogVO[];
    message?: string;
  };

  type BaseResponseListRoleVO_ = {
    code?: number;
    data?: RoleVO[];
    message?: string;
  };

  type BaseResponseListSalaryAccountVO_ = {
    code?: number;
    data?: SalaryAccountVO[];
    message?: string;
  };

  type BaseResponseListSalaryBatchVO_ = {
    code?: number;
    data?: SalaryBatchVO[];
    message?: string;
  };

  type BaseResponseListSalaryChangeLogVO_ = {
    code?: number;
    data?: SalaryChangeLogVO[];
    message?: string;
  };

  type BaseResponseListSalaryDetailVO_ = {
    code?: number;
    data?: SalaryDetailVO[];
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

  type BaseResponseListSourceDistributionVO_ = {
    code?: number;
    data?: SourceDistributionVO[];
    message?: string;
  };

  type BaseResponseListString_ = {
    code?: number;
    data?: string[];
    message?: string;
  };

  type BaseResponseListVisitTrendVO_ = {
    code?: number;
    data?: VisitTrendVO[];
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

  type BaseResponseMapStringObject_ = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  };

  type BaseResponseMyProfileVO_ = {
    code?: number;
    data?: MyProfileVO;
    message?: string;
  };

  type BaseResponseOnboardingVO_ = {
    code?: number;
    data?: OnboardingVO;
    message?: string;
  };

  type BaseResponsePageEmployeeChangeLogVO_ = {
    code?: number;
    data?: PageEmployeeChangeLogVO_;
    message?: string;
  };

  type BaseResponsePageEmployeeVO_ = {
    code?: number;
    data?: PageEmployeeVO_;
    message?: string;
  };

  type BaseResponsePageOnboardingVO_ = {
    code?: number;
    data?: PageOnboardingVO_;
    message?: string;
  };

  type BaseResponsePageRegularizationVO_ = {
    code?: number;
    data?: PageRegularizationVO_;
    message?: string;
  };

  type BaseResponsePageResignationVO_ = {
    code?: number;
    data?: PageResignationVO_;
    message?: string;
  };

  type BaseResponsePageRoleVO_ = {
    code?: number;
    data?: PageRoleVO_;
    message?: string;
  };

  type BaseResponsePageTransferVO_ = {
    code?: number;
    data?: PageTransferVO_;
    message?: string;
  };

  type BaseResponsePageUserVO_ = {
    code?: number;
    data?: PageUserVO_;
    message?: string;
  };

  type BaseResponseRegularizationVO_ = {
    code?: number;
    data?: RegularizationVO;
    message?: string;
  };

  type BaseResponseResignationVO_ = {
    code?: number;
    data?: ResignationVO;
    message?: string;
  };

  type BaseResponseRoleVO_ = {
    code?: number;
    data?: RoleVO;
    message?: string;
  };

  type BaseResponseSalaryAccountVO_ = {
    code?: number;
    data?: SalaryAccountVO;
    message?: string;
  };

  type BaseResponseSalaryBatchPreviewVO_ = {
    code?: number;
    data?: SalaryBatchPreviewVO;
    message?: string;
  };

  type BaseResponseSalaryBatchVO_ = {
    code?: number;
    data?: SalaryBatchVO;
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

  type BaseResponseTransferVO_ = {
    code?: number;
    data?: TransferVO;
    message?: string;
  };

  type BaseResponseUser_ = {
    code?: number;
    data?: User;
    message?: string;
  };

  type BaseResponseUserPermissionVO_ = {
    code?: number;
    data?: UserPermissionVO;
    message?: string;
  };

  type BaseResponseUserVO_ = {
    code?: number;
    data?: UserVO;
    message?: string;
  };

  type BaseResponseVoid_ = {
    code?: number;
    message?: string;
  };

  type BindPhoneRequest = {
    phone?: string;
  };

  type calculateBatchUsingPOSTParams = {
    /** id */
    id: number;
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

  type checkPermissionUsingGETParams = {
    /** code */
    code: string;
  };

  type confirmUsingPOSTParams = {
    /** actualEntryDate */
    actualEntryDate: string;
    /** id */
    id: number;
  };

  type ConversionRateVO = {
    channelName?: string;
    conversion?: number;
    exposure?: number;
    rate?: number;
  };

  type copyAccountUsingPOSTParams = {
    /** id */
    id: number;
  };

  type DashboardMetricsVO = {
    activeUsers?: number;
    activeUsersGrowth?: number;
    systemHealth?: number;
    systemHealthChange?: number;
    todayOrders?: number;
    todayOrdersGrowth?: number;
    totalUsers?: number;
    totalUsersGrowth?: number;
  };

  type DelegationRequest = {
    businessTypes?: string;
    delegateId?: number;
    endDate?: string;
    startDate?: string;
  };

  type deleteAccountUsingDELETEParams = {
    /** id */
    id: number;
  };

  type deleteItemUsingDELETEParams = {
    /** itemId */
    itemId: number;
  };

  type DeleteRequest = {
    id?: number;
  };

  type deleteRoleUsingPOSTParams = {
    /** id */
    id: number;
  };

  type deleteUsingDELETE1Params = {
    /** id */
    id: number;
  };

  type deleteUsingDELETE2Params = {
    /** id */
    id: number;
  };

  type deleteUsingDELETE3Params = {
    /** id */
    id: number;
  };

  type deleteUsingDELETEParams = {
    /** id */
    id: number;
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

  type detailUsingGET1Params = {
    /** id */
    id: number;
  };

  type detailUsingGET2Params = {
    /** id */
    id: number;
  };

  type detailUsingGET3Params = {
    /** id */
    id: number;
  };

  type detailUsingGETParams = {
    /** id */
    id: number;
  };

  type EmployeeAddRequest = {
    bankAccount?: string;
    bankName?: string;
    baseSalary?: number;
    birthday?: string;
    contractExpireDate?: string;
    contractType?: number;
    currentAddress?: string;
    departmentId?: number;
    directReportId?: number;
    email?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    employeeName?: string;
    employmentType?: string;
    gender?: number;
    hireDate?: string;
    hireType?: number;
    idCard?: string;
    jobLevel?: string;
    phone?: string;
    positionId?: number;
    probationRatio?: number;
    registeredAddress?: string;
    workLocation?: string;
  };

  type EmployeeChangeLogVO = {
    changeType?: string;
    changeTypeDesc?: string;
    createTime?: string;
    employeeId?: number;
    fieldDesc?: string;
    fieldName?: string;
    id?: number;
    newValue?: string;
    oldValue?: string;
    operatorName?: string;
    remark?: string;
  };

  type employeeConfirmUsingPOSTParams = {
    /** id */
    id: number;
  };

  type EmployeeDetailVO = {
    account?: string;
    bankAccount?: string;
    bankName?: string;
    baseSalary?: number;
    birthday?: string;
    contractExpireDate?: string;
    contractType?: number;
    contractTypeDesc?: string;
    createTime?: string;
    currentAddress?: string;
    departmentId?: number;
    departmentName?: string;
    directReportId?: number;
    directReportName?: string;
    email?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    employeeName?: string;
    employeeNo?: string;
    employmentType?: string;
    employmentTypeDesc?: string;
    gender?: number;
    genderDesc?: string;
    hireDate?: string;
    hireType?: number;
    id?: number;
    idCard?: string;
    jobLevel?: string;
    phone?: string;
    positionId?: number;
    positionName?: string;
    probationRatio?: number;
    registeredAddress?: string;
    status?: number;
    statusDesc?: string;
    workLocation?: string;
  };

  type EmployeeSalaryUpdateRequest = {
    accountSetId?: number;
    allowanceBase?: number;
    baseSalary?: number;
    effectiveDate?: string;
    housingFundBase?: number;
    performanceBase?: number;
    probationSalaryRatio?: number;
    remark?: string;
    socialInsuranceBase?: number;
  };

  type EmployeeSalaryVO = {
    accountName?: string;
    accountSetId?: number;
    allowanceBase?: number;
    bankAccount?: string;
    bankName?: string;
    baseSalary?: number;
    createdTIme?: string;
    departmentName?: string;
    effectiveDate?: string;
    employeeId?: number;
    employeeName?: string;
    employeeNo?: string;
    housingFundBase?: number;
    id?: number;
    performanceBase?: number;
    probationSalaryRatio?: number;
    socialInsuranceBase?: number;
    updatedTime?: string;
  };

  type EmployeeUpdateRequest = {
    bankAccount?: string;
    bankName?: string;
    baseSalary?: number;
    birthday?: string;
    contractExpireDate?: string;
    contractType?: number;
    currentAddress?: string;
    departmentId?: number;
    directReportId?: number;
    email?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    employeeName?: string;
    employmentType?: string;
    gender?: number;
    hireDate?: string;
    id?: number;
    idCard?: string;
    jobLevel?: string;
    phone?: string;
    positionId?: number;
    probationRatio?: number;
    registeredAddress?: string;
    workLocation?: string;
  };

  type EmployeeVO = {
    createTime?: string;
    departmentId?: number;
    departmentName?: string;
    email?: string;
    employeeName?: string;
    employeeNo?: string;
    employmentType?: string;
    employmentTypeDesc?: string;
    gender?: number;
    hireDate?: string;
    id?: number;
    jobLevel?: string;
    phone?: string;
    positionId?: number;
    positionName?: string;
    status?: number;
    statusDesc?: string;
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

  type getAccountDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getAnomaliesUsingGETParams = {
    /** id */
    id: number;
  };

  type getApprovalDetailUsingGETParams = {
    /** recordId */
    recordId: number;
  };

  type getApprovalProgressUsingGETParams = {
    /** id */
    id: number;
  };

  type getBatchDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getCalendarUsingGETParams = {
    /** month */
    month: string;
  };

  type getChangeLogsUsingGET1Params = {
    /** employeeId */
    employeeId?: number;
    /** pageNum */
    pageNum: number;
    /** pageSize */
    pageSize: number;
  };

  type getChangeLogsUsingGETParams = {
    /** employeeId */
    employeeId?: number;
    /** page */
    page?: number;
    /** size */
    size?: number;
  };

  type getConversionRateUsingGETParams = {
    /** range */
    range?: string;
  };

  type getDepartmentDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getDetailUsingGETParams = {
    /** id */
    id?: number;
  };

  type getEmployeeSalaryHistoryUsingGETParams = {
    /** employeeId */
    employeeId: number;
  };

  type getEmployeeSalaryUsingGETParams = {
    /** employeeId */
    employeeId: number;
  };

  type getGrowthTrendUsingGETParams = {
    /** range */
    range?: string;
  };

  type getMonthRecordsUsingGETParams = {
    /** month */
    month: string;
  };

  type getMyProfileUsingGET1Params = {
    /** employeeId */
    employeeId?: number;
  };

  type getRoleByIdUsingGETParams = {
    /** id */
    id: number;
  };

  type getSalarySlipDetailUsingPOSTParams = {
    /** id */
    id: number;
  };

  type getSourceDistributionUsingGETParams = {
    /** range */
    range?: string;
  };

  type getSummaryUsingGETParams = {
    /** range */
    range?: string;
  };

  type getUserByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getUserVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type GrowthTrendVO = {
    date?: string;
    revenue?: number;
    userCount?: number;
  };

  type HrRegularization = {
    adjustRemark?: string;
    approverId?: number;
    businessNo?: string;
    confirmBaseSalary?: number;
    confirmDate?: string;
    createTime?: string;
    employeeId?: number;
    extendedMonths?: number;
    flowId?: number;
    id?: number;
    isDeleted?: number;
    operatorId?: number;
    originHireDate?: string;
    probationComment?: string;
    probationEndDate?: string;
    probationScore?: number;
    recordId?: number;
    remark?: string;
    result?: string;
    salaryAdjustment?: number;
    status?: string;
    updateTime?: string;
  };

  type HrResignation = {
    applyDate?: string;
    approverId?: number;
    businessNo?: string;
    createTime?: string;
    employeeId?: number;
    flowId?: number;
    handoverPersonId?: number;
    handoverStatus?: number;
    id?: number;
    isDeleted?: number;
    lastWorkDate?: string;
    operatorId?: number;
    recordId?: number;
    remark?: string;
    resignReason?: string;
    resignReasonType?: string;
    resignType?: number;
    settleDate?: string;
    settleSalary?: number;
    status?: string;
    updateTime?: string;
  };

  type HrTransfer = {
    approverId?: number;
    businessNo?: string;
    createTime?: string;
    employeeId?: number;
    flowId?: number;
    id?: number;
    isDeleted?: number;
    newBaseSalary?: number;
    operatorId?: number;
    recordId?: number;
    remark?: string;
    sourceDeptId?: number;
    sourcePositionId?: number;
    status?: string;
    targetDeptId?: number;
    targetPositionId?: number;
    toRankCode?: string;
    toReporterId?: number;
    transferDate?: string;
    transferReason?: string;
    updateTime?: string;
  };

  type LeaveApplyRequest = {
    endDate?: string;
    leaveType?: number;
    reason?: string;
    startDate?: string;
  };

  type LeaveBalanceVO = {
    annualRemaining?: number;
    compRemaining?: number;
    sickRemaining?: number;
    totalRemaining?: number;
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

  type listEmployeesUsingGETParams = {
    departmentIds?: number[];
    hireDateEnd?: string;
    hireDateStart?: string;
    jobLevels?: string[];
    keyword?: string;
    page?: number;
    positionIds?: number[];
    size?: number;
    statuses?: number[];
  };

  type listPositionsUsingGETParams = {
    /** departmentId */
    departmentId?: number;
    /** sequence */
    sequence?: number;
  };

  type listUsingGET1Params = {
    /** keyword */
    keyword?: string;
    /** page */
    page?: number;
    /** size */
    size?: number;
    /** statuses */
    statuses?: string[];
  };

  type listUsingGET2Params = {
    /** keyword */
    keyword?: string;
    /** page */
    page?: number;
    /** size */
    size?: number;
    /** statuses */
    statuses?: string[];
  };

  type listUsingGET3Params = {
    /** keyword */
    keyword?: string;
    /** page */
    page?: number;
    /** size */
    size?: number;
    /** statuses */
    statuses?: string[];
  };

  type listUsingGETParams = {
    /** keyword */
    keyword?: string;
    /** page */
    page?: number;
    /** size */
    size?: number;
    /** statuses */
    statuses?: string[];
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
    employeeId?: number;
    id?: number;
    roleId?: number;
    roleName?: string;
    updateTime?: string;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
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

  type markPaidUsingPOSTParams = {
    /** id */
    id: number;
  };

  type ModuleUsageVO = {
    moduleName?: string;
    usageCount?: number;
  };

  type MutationLogVO = {
    approvalDetails?: ApprovalDetail[];
    approvalStatus?: string;
    businessId?: number;
    businessNo?: string;
    businessType?: string;
    createTime?: string;
    deptId?: number;
    deptName?: string;
    effectDate?: string;
    employeeId?: number;
    employeeName?: string;
    id?: number;
    operatorId?: number;
    operatorName?: string;
  };

  type MyDetailUpdateRequest = {
    currentAddress?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    employeeId?: number;
  };

  type MyProfileVO = {
    account?: string;
    bankAccount?: string;
    bankName?: string;
    baseSalary?: number;
    birthday?: string;
    contractExpireDate?: string;
    contractType?: number;
    contractTypeDesc?: string;
    currentAddress?: string;
    departmentId?: number;
    departmentName?: string;
    directReportId?: number;
    directReportName?: string;
    editableFields?: string[];
    email?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    employeeName?: string;
    employeeNo?: string;
    gender?: number;
    genderDesc?: string;
    hireDate?: string;
    hireType?: number;
    id?: number;
    idCard?: string;
    isSensitiveRole?: boolean;
    jobLevel?: string;
    phone?: string;
    positionId?: number;
    positionName?: string;
    probationRatio?: number;
    registeredAddress?: string;
    status?: number;
    statusDesc?: string;
    workLocation?: string;
  };

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

  type OnboardingAddRequest = {
    bankAccount?: string;
    bankName?: string;
    baseSalary?: number;
    candidateName?: string;
    contractExpireDate?: string;
    contractType?: number;
    deptId?: number;
    email?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    employmentType?: string;
    flowId?: number;
    hireDate?: string;
    housingFundBase?: number;
    idCard?: string;
    phone?: string;
    positionId?: number;
    probationMonth?: number;
    remark?: string;
    socialInsuranceBase?: number;
  };

  type OnboardingVO = {
    approvalProgress?: string;
    approvalStatus?: string;
    approverId?: number;
    approverName?: string;
    bankAccount?: string;
    bankName?: string;
    baseSalary?: number;
    businessNo?: string;
    candidateName?: string;
    contractExpireDate?: string;
    contractType?: number;
    createTime?: string;
    deptId?: number;
    deptName?: string;
    email?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    employeeId?: number;
    employmentType?: string;
    flowId?: number;
    hireDate?: string;
    housingFundBase?: number;
    id?: number;
    idCard?: string;
    operatorId?: number;
    phone?: string;
    positionId?: number;
    positionName?: string;
    probationMonth?: number;
    recordId?: number;
    remark?: string;
    socialInsuranceBase?: number;
    updateTime?: string;
  };

  type OrderItem = {
    asc?: boolean;
    column?: string;
  };

  type PageEmployeeChangeLogVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: EmployeeChangeLogVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageEmployeeVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: EmployeeVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageOnboardingVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: OnboardingVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageRegularizationVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: RegularizationVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageResignationVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ResignationVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageRoleVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: RoleVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageTransferVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: TransferVO[];
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

  type previewBatchUsingGETParams = {
    /** current */
    current?: number;
    /** id */
    id: number;
    /** size */
    size?: number;
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

  type RecentLogVO = {
    actionType?: string;
    description?: string;
    operateTime?: string;
    operatorName?: string;
  };

  type RegularizationAddRequest = {
    adjustRemark?: string;
    employeeId?: number;
    evaluation?: string;
    extendedMonths?: number;
    flowId?: number;
    probationScore?: number;
    remark?: string;
    result?: string;
    salaryAdjustment?: number;
  };

  type RegularizationVO = {
    adjustRemark?: string;
    approvalProgress?: string;
    approvalStatus?: string;
    approverId?: number;
    approverName?: string;
    businessNo?: string;
    createTime?: string;
    deptName?: string;
    employeeId?: number;
    employeeName?: string;
    employeeNo?: string;
    evaluation?: string;
    extendedMonths?: number;
    flowId?: number;
    id?: number;
    operatorId?: number;
    operatorName?: string;
    positionName?: string;
    probationEndDate?: string;
    probationStartDate?: string;
    recordId?: number;
    remark?: string;
    result?: string;
    salaryAdjustment?: number;
    status?: string;
    updateTime?: string;
  };

  type rejectBatchUsingPOSTParams = {
    /** id */
    id: number;
  };

  type ResignationAddRequest = {
    detailReason?: string;
    employeeId?: number;
    flowId?: number;
    handoverPersonId?: number;
    remark?: string;
    resignDate?: string;
    resignReasonType?: string;
    resignType?: string;
  };

  type ResignationVO = {
    approvalProgress?: string;
    approvalStatus?: string;
    approverId?: number;
    approverName?: string;
    businessNo?: string;
    createTime?: string;
    deptName?: string;
    detailReason?: string;
    employeeId?: number;
    employeeName?: string;
    employeeNo?: string;
    flowId?: number;
    handoverPersonId?: number;
    handoverPersonName?: string;
    id?: number;
    operatorId?: number;
    operatorName?: string;
    positionName?: string;
    recordId?: number;
    remark?: string;
    resignDate?: string;
    resignReasonType?: string;
    resignType?: string;
    status?: string;
    updateTime?: string;
  };

  type RoleAddRequest = {
    dataScope?: number;
    description?: string;
    fieldPermissions?: string;
    permissions?: string;
    roleCode?: string;
    roleName?: string;
  };

  type RoleAssignRequest = {
    roleId?: number;
    userId?: number;
  };

  type RoleQueryRequest = {
    current?: number;
    dataScope?: number;
    id?: number;
    pageSize?: number;
    roleCode?: string;
    roleName?: string;
    sortField?: string;
    sortOrder?: string;
    status?: number;
  };

  type RoleUpdateRequest = {
    dataScope?: number;
    description?: string;
    fieldPermissions?: string;
    id?: number;
    permissions?: string;
    roleCode?: string;
    roleName?: string;
    status?: number;
  };

  type RoleVO = {
    dataScope?: number;
    dataScopeDesc?: string;
    description?: string;
    fieldPermissions?: string;
    id?: number;
    permissionCodes?: string[];
    permissions?: string;
    roleCode?: string;
    roleName?: string;
    status?: number;
  };

  type SalaryAccountRequest = {
    effectiveDate?: string;
    items?: SalaryItemRequest[];
    name?: string;
    scopeIds?: string;
    scopeType?: number;
  };

  type SalaryAccountVO = {
    createTime?: string;
    effectiveDate?: string;
    id?: number;
    items?: SalaryItemVO[];
    name?: string;
    scopeIds?: string;
    scopeType?: number;
    scopeTypeText?: string;
    updateTime?: string;
  };

  type SalaryBatchAdjustRequest = {
    adjustReason?: string;
    employeeId?: number;
    manualAdjust?: number;
  };

  type SalaryBatchCreateRequest = {
    salaryMonth?: string;
  };

  type SalaryBatchPreviewVO = {
    batch?: SalaryBatchVO;
    current?: number;
    records?: SalaryDetailVO[];
    size?: number;
    total?: number;
  };

  type SalaryBatchRejectRequest = {
    reason?: string;
  };

  type SalaryBatchVO = {
    batchNo?: string;
    createdAt?: string;
    id?: number;
    paidAt?: string;
    salaryMonth?: string;
    status?: string;
    statusText?: string;
    totalDeduction?: number;
    totalEmployeeCount?: number;
    totalGross?: number;
    totalNet?: number;
  };

  type SalaryChangeLogVO = {
    changeType?: number;
    changeTypeText?: string;
    createTime?: string;
    effectiveDate?: string;
    employeeId?: number;
    id?: number;
    newValue?: string;
    oldValue?: string;
    operatorId?: number;
    operatorName?: string;
    remark?: string;
  };

  type SalaryDetailVO = {
    adjustReason?: string;
    allowance?: number;
    anomalyReason?: string;
    baseSalary?: number;
    batchId?: number;
    createdAt?: string;
    departmentName?: string;
    employeeId?: number;
    employeeName?: string;
    employeeNo?: string;
    grossSalary?: number;
    hasAnomaly?: number;
    housingFund?: number;
    id?: number;
    incomeTax?: number;
    lateDeduction?: number;
    leaveDeduction?: number;
    manualAdjust?: number;
    netSalary?: number;
    overtimePay?: number;
    performanceBonus?: number;
    socialMedical?: number;
    socialPension?: number;
    socialUnemployment?: number;
    totalDeduction?: number;
  };

  type SalaryItemRequest = {
    formula?: string;
    isTaxable?: number;
    itemType?: number;
    name?: string;
    sortOrder?: number;
  };

  type SalaryItemSortRequest = {
    itemIds?: number[];
  };

  type SalaryItemVO = {
    accountId?: number;
    formula?: string;
    id?: number;
    isTaxable?: number;
    itemType?: number;
    itemTypeText?: string;
    name?: string;
    sortOrder?: number;
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

  type sortItemsUsingPUTParams = {
    /** id */
    id: number;
  };

  type SourceDistributionVO = {
    count?: number;
    percentage?: number;
    sourceName?: string;
  };

  type submitDraftUsingPOST1Params = {
    /** id */
    id: number;
  };

  type submitDraftUsingPOST2Params = {
    /** id */
    id: number;
  };

  type submitDraftUsingPOST3Params = {
    /** id */
    id: number;
  };

  type submitDraftUsingPOSTParams = {
    /** id */
    id: number;
  };

  type submitForApprovalUsingPOSTParams = {
    /** id */
    id: number;
  };

  type TransferAddRequest = {
    effectiveDate?: string;
    employeeId?: number;
    flowId?: number;
    reason?: string;
    remark?: string;
    salaryAdjustment?: number;
    toDeptId?: number;
    toPositionId?: number;
    toRankCode?: string;
    toReporterId?: number;
  };

  type TransferVO = {
    approvalProgress?: string;
    approvalStatus?: string;
    approverId?: number;
    approverName?: string;
    businessNo?: string;
    createTime?: string;
    effectiveDate?: string;
    employeeId?: number;
    employeeName?: string;
    employeeNo?: string;
    flowId?: number;
    fromDeptId?: number;
    fromDeptName?: string;
    id?: number;
    operatorId?: number;
    operatorName?: string;
    reason?: string;
    recordId?: number;
    remark?: string;
    salaryAdjustment?: number;
    status?: string;
    toDeptId?: number;
    toDeptName?: string;
    toPositionId?: number;
    toPositionName?: string;
    toRankCode?: string;
    toReporterId?: number;
    toReporterName?: string;
    updateTime?: string;
  };

  type updateAccountUsingPUTParams = {
    /** id */
    id: number;
  };

  type updateEmployeeSalaryUsingPUTParams = {
    /** employeeId */
    employeeId: number;
  };

  type updateItemUsingPUTParams = {
    /** itemId */
    itemId: number;
  };

  type updateUserStatusUsingPOSTParams = {
    /** id */
    id?: number;
    /** status */
    status?: number;
  };

  type updateUsingPUT1Params = {
    /** id */
    id: number;
  };

  type updateUsingPUT2Params = {
    /** id */
    id: number;
  };

  type updateUsingPUT3Params = {
    /** id */
    id: number;
  };

  type updateUsingPUTParams = {
    /** id */
    id: number;
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
  };

  type UserAddRequest = {
    roleId?: number;
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
  };

  type UserLoginRequest = {
    userAccount?: string;
    userPassword?: string;
  };

  type UserPermissionVO = {
    dataScope?: number;
    dataScopeDesc?: string;
    fieldPermissions?: string;
    permissionCodes?: string[];
    permissions?: string;
    roleCode?: string;
    roleId?: number;
    roleName?: string;
    userAccount?: string;
    userId?: number;
    userName?: string;
  };

  type UserQueryRequest = {
    current?: number;
    id?: number;
    mpOpenId?: string;
    pageSize?: number;
    roleId?: number;
    sortField?: string;
    sortOrder?: string;
    unionId?: string;
    userName?: string;
    userProfile?: string;
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
    roleId?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
  };

  type UserVO = {
    createTime?: string;
    id?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRoleName?: string;
  };

  type VerifyPasswordRequest = {
    password?: string;
  };

  type VisitTrendVO = {
    date?: string;
    pageViews?: number;
  };
}
