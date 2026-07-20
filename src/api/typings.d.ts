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
    /** detailId */
    detailId: number;
  };

  type ApprovalActionDTO = {
    comment?: string;
    toApproverId?: number;
  };

  type ApprovalDelegate = {
    createTime?: string;
    delegateId?: number;
    delegatorId?: number;
    enabled?: number;
    endTime?: string;
    id?: number;
    startTime?: string;
    updateTime?: string;
  };

  type ApprovalInstanceVO = {
    applicantId?: number;
    applicantName?: string;
    bizData?: Record<string, any>;
    bizType?: string;
    bizTypeDesc?: string;
    createTime?: string;
    currentNodeOrder?: number;
    deadLine?: string;
    instanceId?: number;
    nodes?: ApprovalNodeVO[];
    status?: number;
    statusDesc?: string;
    title?: string;
  };

  type ApprovalNodeVO = {
    approverId?: number;
    approverName?: string;
    comment?: string;
    nodeId?: number;
    nodeName?: string;
    nodeOrder?: number;
    operateTime?: string;
    originalApproverId?: number;
    originalApproverName?: string;
    status?: number;
    statusDesc?: string;
    transferred?: boolean;
  };

  type approveUsingPOSTParams = {
    /** nodeId */
    nodeId: number;
  };

  type AttendanceCalendarVO = {
    days?: DayItem[];
    month?: number;
    summary?: Summary;
    year?: number;
  };

  type AttendanceGroupCreateRequest = {
    coreEndTime?: string;
    coreStartTime?: string;
    earlyLeaveThreshold?: number;
    endTime?: string;
    flexEndTime?: string;
    flexStartTime?: string;
    ipWhitelist?: string;
    lateThreshold?: number;
    name?: string;
    restEndTime?: string;
    restStartTime?: string;
    rules?: RuleDTO[];
    shiftType?: number;
    startTime?: string;
  };

  type AttendanceGroupListVO = {
    createTime?: string;
    earlyLeaveThreshold?: number;
    endTime?: string;
    id?: number;
    lateThreshold?: number;
    name?: string;
    ruleSummary?: string;
    shiftType?: number;
    shiftTypeDesc?: string;
    startTime?: string;
  };

  type AttendanceGroupUpdateRequest = {
    coreEndTime?: string;
    coreStartTime?: string;
    earlyLeaveThreshold?: number;
    endTime?: string;
    flexEndTime?: string;
    flexStartTime?: string;
    ipWhitelist?: string;
    lateThreshold?: number;
    name?: string;
    restEndTime?: string;
    restStartTime?: string;
    rules?: RuleDTO[];
    shiftType?: number;
    startTime?: string;
  };

  type AttendanceGroupVO = {
    coreEndTime?: string;
    coreStartTime?: string;
    createTime?: string;
    earlyLeaveThreshold?: number;
    endTime?: string;
    flexEndTime?: string;
    flexStartTime?: string;
    id?: number;
    ipWhitelist?: string;
    lateThreshold?: number;
    name?: string;
    restEndTime?: string;
    restStartTime?: string;
    rules?: RuleDTO[];
    shiftType?: number;
    shiftTypeDesc?: string;
    startTime?: string;
    updateTime?: string;
  };

  type AttendanceRateChartVO = {
    months?: string[];
    series?: SeriesItem[];
  };

  type AttendanceRecordVO = {
    actualEndTime?: string;
    actualStartTime?: string;
    attendanceDate?: string;
    departmentName?: string;
    employeeId?: number;
    employeeName?: string;
    endStatus?: number;
    endStatusDesc?: string;
    id?: number;
    scheduledEndTime?: string;
    scheduledStartTime?: string;
    startStatus?: number;
    startStatusDesc?: string;
  };

  type BalanceItem = {
    leaveType?: number;
    leaveTypeDesc?: string;
    remainingDays?: number;
    totalDays?: number;
    usedDays?: number;
  };

  type BaseResponseApprovalDelegate_ = {
    code?: number;
    data?: ApprovalDelegate;
    message?: string;
  };

  type BaseResponseApprovalInstanceVO_ = {
    code?: number;
    data?: ApprovalInstanceVO;
    message?: string;
  };

  type BaseResponseAttendanceCalendarVO_ = {
    code?: number;
    data?: AttendanceCalendarVO;
    message?: string;
  };

  type BaseResponseAttendanceGroupVO_ = {
    code?: number;
    data?: AttendanceGroupVO;
    message?: string;
  };

  type BaseResponseAttendanceRateChartVO_ = {
    code?: number;
    data?: AttendanceRateChartVO;
    message?: string;
  };

  type BaseResponseBoolean_ = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseClockResultVO_ = {
    code?: number;
    data?: ClockResultVO;
    message?: string;
  };

  type BaseResponseDepartment_ = {
    code?: number;
    data?: Department;
    message?: string;
  };

  type BaseResponseDepartmentVO_ = {
    code?: number;
    data?: DepartmentVO;
    message?: string;
  };

  type BaseResponseEmployeeCreateVO_ = {
    code?: number;
    data?: EmployeeCreateVO;
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

  type BaseResponseEmployeeUpdateVO_ = {
    code?: number;
    data?: EmployeeUpdateVO;
    message?: string;
  };

  type BaseResponseFieldPermissionsVO_ = {
    code?: number;
    data?: FieldPermissionsVO;
    message?: string;
  };

  type BaseResponseLeaveBalanceVO_ = {
    code?: number;
    data?: LeaveBalanceVO;
    message?: string;
  };

  type BaseResponseLeaveRequestVO_ = {
    code?: number;
    data?: LeaveRequestVO;
    message?: string;
  };

  type BaseResponseListDepartmentTreeNode_ = {
    code?: number;
    data?: DepartmentTreeNode[];
    message?: string;
  };

  type BaseResponseListLeaveDistributionVO_ = {
    code?: number;
    data?: LeaveDistributionVO[];
    message?: string;
  };

  type BaseResponseListLeaveEarlyRankingVO_ = {
    code?: number;
    data?: LeaveEarlyRankingVO[];
    message?: string;
  };

  type BaseResponseListLoginLogVO_ = {
    code?: number;
    data?: LoginLogVO[];
    message?: string;
  };

  type BaseResponseListMapStringObject_ = {
    code?: number;
    data?: MapStringObject_[];
    message?: string;
  };

  type BaseResponseListPayslipListVO_ = {
    code?: number;
    data?: PayslipListVO[];
    message?: string;
  };

  type BaseResponseListPayslipVO_ = {
    code?: number;
    data?: PayslipVO[];
    message?: string;
  };

  type BaseResponseListPendingEmployeeVO_ = {
    code?: number;
    data?: PendingEmployeeVO[];
    message?: string;
  };

  type BaseResponseListSalaryAccountVO_ = {
    code?: number;
    data?: SalaryAccountVO[];
    message?: string;
  };

  type BaseResponseListSalaryChangeHistoryVO_ = {
    code?: number;
    data?: SalaryChangeHistoryVO[];
    message?: string;
  };

  type BaseResponseListSalaryItemVO_ = {
    code?: number;
    data?: SalaryItemVO[];
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

  type BaseResponseMapStringString_ = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  };

  type BaseResponseMyDelegatesVO_ = {
    code?: number;
    data?: MyDelegatesVO;
    message?: string;
  };

  type BaseResponseObject_ = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  };

  type BaseResponseOnboardingDetailVO_ = {
    code?: number;
    data?: OnboardingDetailVO;
    message?: string;
  };

  type BaseResponseOvertimeRecordVO_ = {
    code?: number;
    data?: OvertimeRecordVO;
    message?: string;
  };

  type BaseResponsePageAttendanceGroupListVO_ = {
    code?: number;
    data?: PageAttendanceGroupListVO_;
    message?: string;
  };

  type BaseResponsePageAttendanceRecordVO_ = {
    code?: number;
    data?: PageAttendanceRecordVO_;
    message?: string;
  };

  type BaseResponsePageEmployeeListVO_ = {
    code?: number;
    data?: PageEmployeeListVO_;
    message?: string;
  };

  type BaseResponsePageLeaveRequestVO_ = {
    code?: number;
    data?: PageLeaveRequestVO_;
    message?: string;
  };

  type BaseResponsePageOnboardingListVO_ = {
    code?: number;
    data?: PageOnboardingListVO_;
    message?: string;
  };

  type BaseResponsePageOvertimeRecordListVO_ = {
    code?: number;
    data?: PageOvertimeRecordListVO_;
    message?: string;
  };

  type BaseResponsePagePendingItemVO_ = {
    code?: number;
    data?: PagePendingItemVO_;
    message?: string;
  };

  type BaseResponsePagePositionVO_ = {
    code?: number;
    data?: PagePositionVO_;
    message?: string;
  };

  type BaseResponsePageProbationListVO_ = {
    code?: number;
    data?: PageProbationListVO_;
    message?: string;
  };

  type BaseResponsePageProcessedItemVO_ = {
    code?: number;
    data?: PageProcessedItemVO_;
    message?: string;
  };

  type BaseResponsePageResignationListVO_ = {
    code?: number;
    data?: PageResignationListVO_;
    message?: string;
  };

  type BaseResponsePageSalaryBatchVO_ = {
    code?: number;
    data?: PageSalaryBatchVO_;
    message?: string;
  };

  type BaseResponsePageSalaryDetailVO_ = {
    code?: number;
    data?: PageSalaryDetailVO_;
    message?: string;
  };

  type BaseResponsePageSupplementCardListVO_ = {
    code?: number;
    data?: PageSupplementCardListVO_;
    message?: string;
  };

  type BaseResponsePageTransferHistoryVO_ = {
    code?: number;
    data?: PageTransferHistoryVO_;
    message?: string;
  };

  type BaseResponsePageTransferListVO_ = {
    code?: number;
    data?: PageTransferListVO_;
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

  type BaseResponsePayslipVO_ = {
    code?: number;
    data?: PayslipVO;
    message?: string;
  };

  type BaseResponsePendingCountVO_ = {
    code?: number;
    data?: PendingCountVO;
    message?: string;
  };

  type BaseResponsePosition_ = {
    code?: number;
    data?: Position;
    message?: string;
  };

  type BaseResponsePositionVO_ = {
    code?: number;
    data?: PositionVO;
    message?: string;
  };

  type BaseResponseProbationDetailVO_ = {
    code?: number;
    data?: ProbationDetailVO;
    message?: string;
  };

  type BaseResponseProfileVO_ = {
    code?: number;
    data?: ProfileVO;
    message?: string;
  };

  type BaseResponseResignationDetailVO_ = {
    code?: number;
    data?: ResignationDetailVO;
    message?: string;
  };

  type BaseResponseSalaryAccountVO_ = {
    code?: number;
    data?: SalaryAccountVO;
    message?: string;
  };

  type BaseResponseSalaryBatchVO_ = {
    code?: number;
    data?: SalaryBatchVO;
    message?: string;
  };

  type BaseResponseSalaryTrendVO_ = {
    code?: number;
    data?: SalaryTrendVO;
    message?: string;
  };

  type BaseResponseString_ = {
    code?: number;
    data?: string;
    message?: string;
  };

  type BaseResponseSupplementCardVO_ = {
    code?: number;
    data?: SupplementCardVO;
    message?: string;
  };

  type BaseResponseTransferDetailVO_ = {
    code?: number;
    data?: TransferDetailVO;
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

  type BaseResponseVoid_ = {
    code?: number;
    message?: string;
  };

  type cancelDelegateUsingDELETEParams = {
    /** id */
    id: number;
  };

  type cancelLeaveUsingPOSTParams = {
    /** id */
    id: number;
  };

  type cancelUsingPOST1Params = {
    /** id */
    id: number;
  };

  type cancelUsingPOST2Params = {
    /** id */
    id: number;
  };

  type cancelUsingPOST3Params = {
    /** id */
    id: number;
  };

  type cancelUsingPOST4Params = {
    /** id */
    id: number;
  };

  type cancelUsingPOSTParams = {
    /** instanceId */
    instanceId: number;
  };

  type checkPhoneUsingGETParams = {
    /** excludeId */
    excludeId?: number;
    /** phone */
    phone: string;
  };

  type ClockRequest = {
    clockType?: number;
  };

  type ClockResultVO = {
    actualTime?: string;
    attendanceDate?: string;
    clockType?: number;
    clockTypeDesc?: string;
    scheduledTime?: string;
    status?: number;
    statusDesc?: string;
  };

  type clockUsingPOST1Params = {
    /** clockType */
    clockType: number;
  };

  type confirmJoinUsingPOSTParams = {
    /** actualHireDate */
    actualHireDate: string;
    /** id */
    id: number;
  };

  type confirmResignationUsingPOSTParams = {
    /** id */
    id: number;
  };

  type DayItem = {
    date?: string;
    dayType?: number;
    dayTypeDesc?: string;
    endStatus?: number;
    endStatusDesc?: string;
    hasLeave?: boolean;
    startStatus?: number;
    startStatusDesc?: string;
  };

  type DelegateSettingDTO = {
    delegateId?: number;
    endTime?: string;
    startTime?: string;
  };

  type deleteAccountUsingDELETEParams = {
    /** id */
    id: number;
  };

  type deleteAttendanceGroupUsingDELETEParams = {
    /** id */
    id: number;
  };

  type deleteDepartmentUsingDELETEParams = {
    /** id */
    id: number;
  };

  type deleteDraftUsingDELETE1Params = {
    /** id */
    id: number;
  };

  type deleteDraftUsingDELETE2Params = {
    /** id */
    id: number;
  };

  type deleteDraftUsingDELETE3Params = {
    /** id */
    id: number;
  };

  type deleteDraftUsingDELETEParams = {
    /** id */
    id: number;
  };

  type deleteItemUsingDELETEParams = {
    /** itemId */
    itemId: number;
  };

  type deleteOvertimeRecordUsingDELETEParams = {
    /** id */
    id: number;
  };

  type deletePositionUsingDELETEParams = {
    /** id */
    id: number;
  };

  type DeleteRequest = {
    id?: number;
  };

  type Department = {
    code?: string;
    createTime?: string;
    description?: string;
    id?: number;
    isDeleted?: number;
    level?: number;
    managerId?: number;
    name?: string;
    parentId?: number;
    sortOrder?: number;
    updateTime?: string;
  };

  type DepartmentCreateRequest = {
    code?: string;
    description?: string;
    managerId?: number;
    name?: string;
    parentId?: number;
    sortOrder?: number;
  };

  type DepartmentTreeNode = {
    children?: DepartmentTreeNode[];
    code?: string;
    description?: string;
    employeeCount?: number;
    id?: number;
    level?: number;
    managerId?: number;
    managerName?: string;
    name?: string;
    parentId?: number;
    sortOrder?: number;
  };

  type DepartmentUpdateRequest = {
    code?: string;
    description?: string;
    managerId?: number;
    name?: string;
    parentId?: number;
    sortOrder?: number;
  };

  type DepartmentVO = {
    childCount?: number;
    children?: DepartmentVO[];
    code?: string;
    createTime?: string;
    description?: string;
    employeeCount?: number;
    id?: number;
    level?: number;
    managerId?: number;
    managerName?: string;
    name?: string;
    parentId?: number;
    parentName?: string;
    sortOrder?: number;
    updateTime?: string;
  };

  type EmployeeCreateRequest = {
    bankAccount?: string;
    bankName?: string;
    baseSalary?: number;
    contractExpireDate?: string;
    contractType?: number;
    departmentId?: number;
    directReportId?: number;
    email?: string;
    gender?: number;
    hireDate?: string;
    hireType?: number;
    idCard?: string;
    jobLevel?: string;
    name?: string;
    phone?: string;
    positionId?: number;
    probationRatio?: number;
    salaryAccountId?: number;
    workLocation?: string;
  };

  type EmployeeCreateVO = {
    account?: string;
    employeeNo?: string;
    id?: number;
    initialPassword?: string;
  };

  type EmployeeDetailVO = {
    account?: string;
    createTime?: string;
    employeeNo?: string;
    hireDate?: string;
    hireType?: number;
    hireTypeDesc?: string;
    id?: number;
    personalInfo?: PersonalInfoVO;
    salaryInfo?: SalaryInfoVO;
    status?: number;
    statusDesc?: string;
    workInfo?: WorkInfoVO;
  };

  type EmployeeListVO = {
    departmentName?: string;
    employeeNo?: string;
    hireDate?: string;
    id?: number;
    jobLevel?: string;
    name?: string;
    positionName?: string;
    status?: number;
    statusDesc?: string;
  };

  type EmployeeSalaryUpdateRequest = {
    /** 薪资账套 ID */
    accountId?: number;
    /** 津贴补贴基数 */
    allowanceBase?: number;
    /** 月基本工资 */
    baseSalary?: number;
    /** 生效日期 */
    effectiveDate?: string;
    /** 公积金缴费基数 */
    housingFundBase?: number;
    /** 绩效工资基数 */
    performanceBase?: number;
    /** 变更备注 */
    remark?: string;
    /** 社保缴费基数 */
    socialSecurityBase?: number;
  };

  type EmployeeSalaryVO = {
    accountId?: number;
    accountName?: string;
    allowanceBase?: number;
    baseSalary?: number;
    createTime?: string;
    effectiveDate?: string;
    employeeId?: number;
    housingFundBase?: number;
    id?: number;
    performanceBase?: number;
    socialSecurityBase?: number;
    updateTime?: string;
  };

  type EmployeeUpdateVO = {
    flowRequiredFields?: string[];
    updatedFields?: string[];
  };

  type executeCalculateUsingPOSTParams = {
    /** id */
    id: number;
  };

  type FieldPermissionsVO = {
    editableFields?: string[];
    flowRequiredFields?: string[];
    viewableFields?: string[];
  };

  type getAccountUsingGETParams = {
    /** id */
    id: number;
  };

  type getAttendanceCalendarUsingGETParams = {
    /** yearMonth */
    yearMonth: string;
  };

  type getAttendanceRateUsingGETParams = {
    /** departmentIds */
    departmentIds?: number[];
    /** months */
    months?: number;
  };

  type getBalancesUsingGETParams = {
    /** employeeId */
    employeeId?: number;
    /** year */
    year?: number;
  };

  type getBatchDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getCalendarUsingGETParams = {
    /** employeeId */
    employeeId?: number;
    /** month */
    month: number;
    /** year */
    year: number;
  };

  type getDepartmentDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getDepartmentListUsingGETParams = {
    /** keyword */
    keyword?: string;
  };

  type getDetailUsingGET1Params = {
    /** id */
    id: number;
  };

  type getDetailUsingGET2Params = {
    /** id */
    id: number;
  };

  type getDetailUsingGET3Params = {
    /** id */
    id: number;
  };

  type getDetailUsingGET4Params = {
    /** id */
    id: number;
  };

  type getDetailUsingGETParams = {
    /** instanceId */
    instanceId: number;
  };

  type getEmployeeDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getEmployeeListUsingGETParams = {
    all?: boolean;
    current?: number;
    departmentIds?: number[];
    hireDateEnd?: string;
    hireDateStart?: string;
    jobLevels?: string[];
    keyword?: string;
    pageSize?: number;
    positionIds?: number[];
    sortField?: string;
    sortOrder?: string;
    statuses?: number[];
  };

  type getEmployeeSalaryUsingGETParams = {
    /** employeeId */
    employeeId: number;
  };

  type getHistoryUsingGETParams = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    /** employeeId */
    employeeId: number;
  };

  type getLateEarlyRankingUsingGETParams = {
    /** month */
    month: number;
    /** topN */
    topN?: number;
    /** year */
    year: number;
  };

  type getLeaveDistributionUsingGETParams = {
    /** month */
    month: number;
    /** year */
    year: number;
  };

  type getMyLeavesUsingGETParams = {
    page?: number;
    size?: number;
    status?: number;
  };

  type getPayslipDetailUsingGET1Params = {
    /** id */
    id: number;
  };

  type getPayslipDetailUsingGETParams = {
    /** id */
    id: number;
    /** verifyCode */
    verifyCode?: string;
  };

  type getPendingEmployeesUsingGETParams = {
    /** days */
    days?: number;
  };

  type getPendingListUsingGETParams = {
    bizType?: string;
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type getPositionDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getPositionListUsingGETParams = {
    current?: number;
    departmentId?: number;
    keyword?: string;
    pageSize?: number;
    sequence?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type getProcessedListUsingGETParams = {
    bizType?: string;
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type getRequestDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getSalaryHistoryUsingGETParams = {
    /** employeeId */
    employeeId: number;
  };

  type getUserByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getUserVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type handleResultUsingPOSTParams = {
    /** id */
    id: number;
  };

  type LeaveBalanceVO = {
    balances?: BalanceItem[];
    employeeId?: number;
  };

  type LeaveDistributionVO = {
    days?: number;
    leaveTypeDesc?: string;
    percentage?: number;
  };

  type LeaveEarlyRankingVO = {
    departmentName?: string;
    earlyLeaveCount?: number;
    lateCount?: number;
  };

  type LeaveRequestSubmitDTO = {
    attachmentUrl?: string;
    endTime?: string;
    handoverEmployeeId?: number;
    leaveDays?: number;
    leaveType?: number;
    reason?: string;
    startTime?: string;
  };

  type LeaveRequestVO = {
    attachmentUrl?: string;
    createTime?: string;
    departmentName?: string;
    employeeId?: number;
    employeeName?: string;
    endTime?: string;
    handoverEmployeeId?: number;
    id?: number;
    leaveDays?: number;
    leaveType?: number;
    leaveTypeDesc?: string;
    reason?: string;
    startTime?: string;
    status?: number;
    statusDesc?: string;
    updateTime?: string;
  };

  type List = Record<string, any>;

  type listAccountsUsingGETParams = {
    /** 账套名称（模糊搜索） */
    name?: string;
    /** 适用范围类型：1=部门, 2=职位, 3=职级 */
    scopeType?: number;
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type listBatchesUsingGETParams = {
    /** 薪资月份 */
    salaryMonth?: string;
    /** 批次状态 */
    status?: number;
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type listDetailsUsingGETParams = {
    /** 批次 ID */
    batchId?: number;
    /** 员工 ID */
    employeeId?: number;
    /** 异常级别 */
    isAbnormal?: number;
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    /** id */
    id: number;
  };

  type listItemsUsingGETParams = {
    /** id */
    id: number;
  };

  type listUsingGET1Params = {
    current?: number;
    departmentId?: number;
    employeeId?: number;
    keyword?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    status?: number;
  };

  type listUsingGET2Params = {
    current?: number;
    employeeId?: number;
    keyword?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    status?: number;
  };

  type listUsingGET3Params = {
    current?: number;
    employeeId?: number;
    keyword?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    status?: number;
  };

  type listUsingGETParams = {
    current?: number;
    departmentId?: number;
    hireDateEnd?: string;
    hireDateStart?: string;
    keyword?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    status?: number;
  };

  type LoginLogVO = {
    device?: string;
    id?: number;
    ipAddress?: string;
    loginTime?: string;
    result?: number;
    resultDesc?: string;
  };

  type LoginUserVO = {
    createTime?: string;
    id?: number;
    pwdReset?: number;
    token?: string;
    updateTime?: string;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type MapStringLong_ = true;

  type MapStringObject_ = true;

  type MapStringObject_1 = true;

  type MapStringObject_2 = true;

  type MapStringObject_3 = true;

  type MapStringObject_4 = true;

  type MapStringObject_5 = true;

  type MapStringString_ = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  };

  type ModelAndView = {
    empty?: boolean;
    model?: Record<string, any>;
    modelMap?: Record<string, any>;
    reference?: boolean;
    status?:
      | 'CONTINUE'
      | 'SWITCHING_PROTOCOLS'
      | 'PROCESSING'
      | 'CHECKPOINT'
      | 'OK'
      | 'CREATED'
      | 'ACCEPTED'
      | 'NON_AUTHORITATIVE_INFORMATION'
      | 'NO_CONTENT'
      | 'RESET_CONTENT'
      | 'PARTIAL_CONTENT'
      | 'MULTI_STATUS'
      | 'ALREADY_REPORTED'
      | 'IM_USED'
      | 'MULTIPLE_CHOICES'
      | 'MOVED_PERMANENTLY'
      | 'FOUND'
      | 'MOVED_TEMPORARILY'
      | 'SEE_OTHER'
      | 'NOT_MODIFIED'
      | 'USE_PROXY'
      | 'TEMPORARY_REDIRECT'
      | 'PERMANENT_REDIRECT'
      | 'BAD_REQUEST'
      | 'UNAUTHORIZED'
      | 'PAYMENT_REQUIRED'
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'METHOD_NOT_ALLOWED'
      | 'NOT_ACCEPTABLE'
      | 'PROXY_AUTHENTICATION_REQUIRED'
      | 'REQUEST_TIMEOUT'
      | 'CONFLICT'
      | 'GONE'
      | 'LENGTH_REQUIRED'
      | 'PRECONDITION_FAILED'
      | 'PAYLOAD_TOO_LARGE'
      | 'REQUEST_ENTITY_TOO_LARGE'
      | 'URI_TOO_LONG'
      | 'REQUEST_URI_TOO_LONG'
      | 'UNSUPPORTED_MEDIA_TYPE'
      | 'REQUESTED_RANGE_NOT_SATISFIABLE'
      | 'EXPECTATION_FAILED'
      | 'I_AM_A_TEAPOT'
      | 'INSUFFICIENT_SPACE_ON_RESOURCE'
      | 'METHOD_FAILURE'
      | 'DESTINATION_LOCKED'
      | 'UNPROCESSABLE_ENTITY'
      | 'LOCKED'
      | 'FAILED_DEPENDENCY'
      | 'TOO_EARLY'
      | 'UPGRADE_REQUIRED'
      | 'PRECONDITION_REQUIRED'
      | 'TOO_MANY_REQUESTS'
      | 'REQUEST_HEADER_FIELDS_TOO_LARGE'
      | 'UNAVAILABLE_FOR_LEGAL_REASONS'
      | 'INTERNAL_SERVER_ERROR'
      | 'NOT_IMPLEMENTED'
      | 'BAD_GATEWAY'
      | 'SERVICE_UNAVAILABLE'
      | 'GATEWAY_TIMEOUT'
      | 'HTTP_VERSION_NOT_SUPPORTED'
      | 'VARIANT_ALSO_NEGOTIATES'
      | 'INSUFFICIENT_STORAGE'
      | 'LOOP_DETECTED'
      | 'BANDWIDTH_LIMIT_EXCEEDED'
      | 'NOT_EXTENDED'
      | 'NETWORK_AUTHENTICATION_REQUIRED';
    view?: View;
    viewName?: string;
  };

  type MyDelegatesVO = {
    asDelegate?: ApprovalDelegate[];
    asDelegator?: ApprovalDelegate[];
  };

  type OnboardingCreateDTO = {
    defaultProbationMonths?: number;
    departmentId?: number;
    directReportId?: number;
    email?: string;
    expectedHireDate?: string;
    gender?: number;
    hireType?: number;
    idCard?: string;
    name?: string;
    phone?: string;
    positionId?: number;
    probationRatio?: number;
    submitDirectly?: boolean;
  };

  type OnboardingDetailVO = {
    applicantId?: number;
    applicantName?: string;
    approvalInstanceId?: number;
    approvalProgress?: ApprovalInstanceVO;
    createTime?: string;
    defaultProbationMonths?: number;
    departmentId?: number;
    departmentName?: string;
    directReportId?: number;
    directReportName?: string;
    email?: string;
    employeeId?: number;
    expectedHireDate?: string;
    gender?: number;
    genderDesc?: string;
    hireType?: number;
    hireTypeDesc?: string;
    id?: number;
    idCard?: string;
    name?: string;
    phone?: string;
    positionId?: number;
    positionName?: string;
    probationRatio?: number;
    status?: number;
    statusDesc?: string;
    updateTime?: string;
  };

  type OnboardingListVO = {
    applicantName?: string;
    createTime?: string;
    departmentName?: string;
    expectedHireDate?: string;
    id?: number;
    name?: string;
    phone?: string;
    positionName?: string;
    status?: number;
    statusDesc?: string;
  };

  type OnboardingUpdateDTO = {
    defaultProbationMonths?: number;
    departmentId?: number;
    directReportId?: number;
    email?: string;
    expectedHireDate?: string;
    gender?: number;
    hireType?: number;
    idCard?: string;
    name?: string;
    phone?: string;
    positionId?: number;
    probationRatio?: number;
  };

  type OrderItem = {
    asc?: boolean;
    column?: string;
  };

  type OvertimeRecordCreateDTO = {
    employeeId?: number;
    endTime?: string;
    hours?: number;
    overtimeDate?: string;
    startTime?: string;
  };

  type OvertimeRecordListVO = {
    createTime?: string;
    departmentName?: string;
    employeeId?: number;
    employeeName?: string;
    endTime?: string;
    expireDate?: string;
    hours?: number;
    id?: number;
    isUsed?: number;
    isUsedDesc?: string;
    overtimeDate?: string;
    startTime?: string;
  };

  type OvertimeRecordUpdateDTO = {
    endTime?: string;
    hours?: number;
    overtimeDate?: string;
    startTime?: string;
  };

  type OvertimeRecordVO = {
    compTimeAdded?: number;
    createTime?: string;
    employeeId?: number;
    endTime?: string;
    expireDate?: string;
    hours?: number;
    id?: number;
    overtimeDate?: string;
    startTime?: string;
  };

  type PageAttendanceGroupListVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: AttendanceGroupListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageAttendanceRecordVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: AttendanceRecordVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageEmployeeListVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: EmployeeListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageLeaveRequestVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: LeaveRequestVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageOnboardingListVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: OnboardingListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageOvertimeRecordListVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: OvertimeRecordListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PagePendingItemVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: PendingItemVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PagePositionVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: PositionVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageProbationListVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ProbationListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageProcessedItemVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ProcessedItemVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageResignationListVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ResignationListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageSalaryBatchVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: SalaryBatchVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageSalaryDetailVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: SalaryDetailVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageSupplementCardListVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: SupplementCardListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageTransferHistoryVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: TransferHistoryVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageTransferListVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: TransferListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
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

  type PasswordChangeDTO = {
    confirmPassword?: string;
    newPassword?: string;
    oldPassword?: string;
  };

  type PayslipListVO = {
    hasViewed?: boolean;
    id?: number;
    netSalary?: number;
    status?: number;
    statusDesc?: string;
    yearMonth?: string;
  };

  type PayslipVerifyRequest = {
    /** 验证码或密码 */
    verifyCode?: string;
    /** 验证类型：1=短信验证码, 2=登录密码 */
    verifyType?: number;
  };

  type PayslipVO = {
    batchNo?: string;
    createTime?: string;
    deductionItems?: SalaryItemDetailVO[];
    departmentName?: string;
    employeeName?: string;
    employeeNo?: string;
    grossPay?: number;
    id?: number;
    incomeItems?: SalaryItemDetailVO[];
    netPay?: number;
    payslipViewed?: number;
    salaryMonth?: string;
    totalDeductions?: number;
  };

  type PendingCountVO = {
    leaveApprovalResult?: number;
    newSalaryAvailable?: number;
    total?: number;
  };

  type PendingEmployeeVO = {
    daysRemaining?: number;
    departmentName?: string;
    employeeId?: number;
    employeeName?: string;
    employeeNo?: string;
    hasPendingApplication?: boolean;
    hireDate?: string;
    positionName?: string;
    probationEndDate?: string;
  };

  type PendingItemVO = {
    applicantId?: number;
    applicantName?: string;
    bizType?: string;
    bizTypeDesc?: string;
    canAct?: boolean;
    createTime?: string;
    deadLine?: string;
    delegatorName?: string;
    instanceId?: number;
    nodeId?: number;
    nodeName?: string;
    nodeOrder?: number;
    title?: string;
  };

  type PersonalInfoVO = {
    birthday?: string;
    currentAddress?: string;
    email?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    gender?: number;
    genderDesc?: string;
    idCard?: string;
    name?: string;
    phone?: string;
    registeredAddress?: string;
  };

  type PhoneChangeDTO = {
    newPhone?: string;
    verifyCode?: string;
  };

  type PhoneUnbindDTO = {
    newPhone?: string;
    verifyCode?: string;
  };

  type Position = {
    createTime?: string;
    defaultProbationMonths?: number;
    departmentId?: number;
    description?: string;
    id?: number;
    isDeleted?: number;
    levelMax?: number;
    levelMin?: number;
    name?: string;
    sequence?: number;
    updateTime?: string;
  };

  type PositionCreateRequest = {
    defaultProbationMonths?: number;
    departmentId?: number;
    description?: string;
    levelMax?: number;
    levelMin?: number;
    name?: string;
    sequence?: number;
  };

  type PositionUpdateRequest = {
    defaultProbationMonths?: number;
    departmentId?: number;
    description?: string;
    levelMax?: number;
    levelMin?: number;
    name?: string;
    sequence?: number;
  };

  type PositionVO = {
    createTime?: string;
    defaultProbationMonths?: number;
    departmentId?: number;
    departmentName?: string;
    description?: string;
    employeeCount?: number;
    id?: number;
    levelMax?: number;
    levelMin?: number;
    levelRange?: string;
    name?: string;
    sequence?: number;
    sequenceDesc?: string;
    updateTime?: string;
  };

  type previewEmployeeNoUsingPOSTParams = {
    /** departmentId */
    departmentId: number;
  };

  type ProbationCreateDTO = {
    employeeId?: number;
    performanceReview?: string;
    remark?: string;
    salaryAdjustment?: number;
    submitDirectly?: boolean;
  };

  type ProbationDetailVO = {
    applicantId?: number;
    applicantName?: string;
    approvalInstanceId?: number;
    approvalProgress?: ApprovalInstanceVO;
    createTime?: string;
    departmentName?: string;
    employeeId?: number;
    employeeName?: string;
    employeeNo?: string;
    extendedEndDate?: string;
    id?: number;
    jobLevel?: string;
    performanceReview?: string;
    positionName?: string;
    probationEndDate?: string;
    probationStartDate?: string;
    remark?: string;
    result?: number;
    resultDesc?: string;
    salaryAdjustment?: number;
    status?: number;
    statusDesc?: string;
    updateTime?: string;
  };

  type ProbationHandleResultDTO = {
    extendedEndDate?: string;
    result?: number;
  };

  type ProbationListVO = {
    applicantName?: string;
    createTime?: string;
    departmentName?: string;
    employeeId?: number;
    employeeName?: string;
    employeeNo?: string;
    id?: number;
    positionName?: string;
    probationEndDate?: string;
    probationStartDate?: string;
    salaryAdjustment?: number;
    status?: number;
    statusDesc?: string;
  };

  type ProbationUpdateDTO = {
    performanceReview?: string;
    remark?: string;
    salaryAdjustment?: number;
  };

  type ProcessedItemVO = {
    applicantName?: string;
    bizType?: string;
    bizTypeDesc?: string;
    comment?: string;
    instanceId?: number;
    nodeId?: number;
    nodeName?: string;
    nodeStatus?: number;
    nodeStatusDesc?: string;
    operateTime?: string;
    title?: string;
  };

  type ProfileUpdateDTO = {
    address?: string;
    email?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  };

  type ProfileVO = {
    address?: string;
    birthday?: string;
    departmentName?: string;
    editableFields?: string[];
    email?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    employeeId?: number;
    employeeNo?: string;
    gender?: number;
    genderDesc?: string;
    hireDate?: string;
    idCard?: string;
    jobLevel?: string;
    lockedFields?: string[];
    name?: string;
    phone?: string;
    positionName?: string;
    status?: number;
    statusDesc?: string;
  };

  type queryAttendanceGroupsUsingGETParams = {
    /** keyword */
    keyword?: string;
    /** page */
    page?: number;
    /** shiftType */
    shiftType?: number;
    /** size */
    size?: number;
  };

  type queryRecordsUsingGET1Params = {
    /** employeeId */
    employeeId?: number;
    /** endDate */
    endDate?: string;
    /** isUsed */
    isUsed?: number;
    /** page */
    page?: number;
    /** size */
    size?: number;
    /** startDate */
    startDate?: string;
  };

  type queryRecordsUsingGETParams = {
    current?: number;
    departmentId?: number;
    employeeId?: number;
    endDate?: string;
    endStatus?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    startDate?: string;
    startStatus?: number;
  };

  type queryRequestsUsingGETParams = {
    /** employeeId */
    employeeId?: number;
    /** endDate */
    endDate?: string;
    /** leaveType */
    leaveType?: number;
    /** page */
    page?: number;
    /** size */
    size?: number;
    /** startDate */
    startDate?: string;
    /** status */
    status?: number;
  };

  type querySupplementCardsUsingGETParams = {
    /** employeeId */
    employeeId?: number;
    /** endDate */
    endDate?: string;
    /** page */
    page?: number;
    /** size */
    size?: number;
    /** startDate */
    startDate?: string;
    /** status */
    status?: number;
  };

  type rejectUsingPOSTParams = {
    /** nodeId */
    nodeId: number;
  };

  type ResignationCreateDTO = {
    employeeId?: number;
    handoverToId?: number;
    reason?: string;
    remark?: string;
    resignationDate?: string;
    resignationType?: number;
    submitDirectly?: boolean;
  };

  type ResignationDetailVO = {
    actualResignationDate?: string;
    applicantId?: number;
    applicantName?: string;
    approvalInstanceId?: number;
    approvalProgress?: ApprovalInstanceVO;
    createTime?: string;
    departmentName?: string;
    employeeId?: number;
    employeeName?: string;
    employeeNo?: string;
    handoverToId?: number;
    handoverToName?: string;
    id?: number;
    positionName?: string;
    reason?: string;
    remark?: string;
    resignationDate?: string;
    resignationType?: number;
    resignationTypeDesc?: string;
    status?: number;
    statusDesc?: string;
    updateTime?: string;
  };

  type ResignationListVO = {
    applicantName?: string;
    createTime?: string;
    departmentName?: string;
    employeeId?: number;
    employeeName?: string;
    employeeNo?: string;
    id?: number;
    resignationDate?: string;
    resignationType?: number;
    resignationTypeDesc?: string;
    status?: number;
    statusDesc?: string;
  };

  type ResignationUpdateDTO = {
    handoverToId?: number;
    reason?: string;
    remark?: string;
    resignationDate?: string;
    resignationType?: number;
  };

  type RuleDTO = {
    ruleType?: number;
    targetId?: number;
  };

  type SalaryAccountAddRequest = {
    /** 生效日期 */
    effectiveDate?: string;
    /** 工资项目列表（可选，创建时同步添加） */
    items?: SalaryItemAddRequest[];
    /** 账套名称 */
    name?: string;
    /** 适用范围 ID 列表 */
    scopeIds?: number[];
    /** 适用范围类型：1=部门, 2=职位, 3=职级 */
    scopeType?: number;
  };

  type SalaryAccountUpdateRequest = {
    /** 生效日期 */
    effectiveDate?: string;
    /** 账套 ID */
    id?: number;
    /** 账套名称 */
    name?: string;
    /** 适用范围 ID 列表 */
    scopeIds?: number[];
    /** 适用范围类型：1=部门, 2=职位, 3=职级 */
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
    scopeTypeLabel?: string;
    updateTime?: string;
  };

  type SalaryBatchCreateRequest = {
    /** 薪资月份，格式 yyyy-MM */
    salaryMonth?: string;
  };

  type SalaryBatchVO = {
    batchNo?: string;
    createBy?: number;
    createTime?: string;
    id?: number;
    salaryMonth?: string;
    status?: number;
    statusLabel?: string;
    totalEmployees?: number;
    totalGrossPay?: number;
    totalNetPay?: number;
    totalTax?: number;
    updateTime?: string;
  };

  type SalaryChangeHistoryVO = {
    changeType?: number;
    changeTypeLabel?: string;
    createTime?: string;
    effectiveDate?: string;
    employeeId?: number;
    id?: number;
    newValue?: string;
    oldValue?: string;
    operatorId?: number;
    remark?: string;
  };

  type SalaryDetailAdjustRequest = {
    /** 调整金额（正=补发, 负=扣回） */
    adjustment?: number;
    /** 调整原因 */
    reason?: string;
  };

  type SalaryDetailVO = {
    abnormalLabel?: string;
    abnormalReason?: string;
    adjustmentReason?: string;
    batchId?: number;
    createTime?: string;
    employeeId?: number;
    grossPay?: number;
    housingFund?: number;
    id?: number;
    incomeTax?: number;
    isAbnormal?: number;
    manualAdjustment?: number;
    netPay?: number;
    salaryItems?: SalaryItemDetailVO[];
    socialSecurity?: number;
    totalDeductions?: number;
  };

  type SalaryInfoVO = {
    bankAccount?: string;
    bankName?: string;
    baseSalary?: number;
    contractExpireDate?: string;
    contractType?: number;
    contractTypeDesc?: string;
    probationRatio?: number;
    salaryAccountId?: number;
    salaryAccountName?: string;
  };

  type SalaryItemAddRequest = {
    /** 计算公式 */
    formula?: string;
    /** 是否计入应纳税所得额：1=是, 0=否 */
    isTaxable?: number;
    /** 项目类型：1=固定收入, 2=变动收入, 3=考勤扣款, 4=社保扣除, 5=公积金扣除, 6=个税 */
    itemType?: number;
    /** 项目名称 */
    name?: string;
    /** 排序号 */
    sortOrder?: number;
  };

  type SalaryItemDetailVO = {
    amount?: number;
    name?: string;
    type?: number;
  };

  type SalaryItemSortRequest = {
    /** 按顺序排列的项目 ID 列表 */
    itemIds?: number[];
  };

  type SalaryItemUpdateRequest = {
    /** 计算公式 */
    formula?: string;
    /** 项目 ID */
    id?: number;
    /** 是否计入应纳税所得额 */
    isTaxable?: number;
    /** 项目类型 */
    itemType?: number;
    /** 项目名称 */
    name?: string;
    /** 排序号 */
    sortOrder?: number;
  };

  type SalaryItemVO = {
    accountId?: number;
    createTime?: string;
    formula?: string;
    id?: number;
    isTaxable?: number;
    itemType?: number;
    itemTypeLabel?: string;
    name?: string;
    sortOrder?: number;
    updateTime?: string;
  };

  type SalaryTrendVO = {
    months?: string[];
    netSalaries?: number[];
  };

  type sendPayslipVerifyCodeUsingPOSTParams = {
    /** id */
    id: number;
  };

  type sendPhoneVerifyCodeUsingPOSTParams = {
    /** phone */
    phone: string;
  };

  type SeriesItem = {
    departmentName?: string;
    rates?: number[];
  };

  type sortItemsUsingPUTParams = {
    /** id */
    id: number;
  };

  type submitForApprovalUsingPUTParams = {
    /** id */
    id: number;
  };

  type submitToApprovalUsingPOST1Params = {
    /** id */
    id: number;
  };

  type submitToApprovalUsingPOST2Params = {
    /** id */
    id: number;
  };

  type submitToApprovalUsingPOST3Params = {
    /** id */
    id: number;
  };

  type submitToApprovalUsingPOSTParams = {
    /** id */
    id: number;
  };

  type Summary = {
    absentDays?: number;
    cardMissingDays?: number;
    earlyLeaveDays?: number;
    lateDays?: number;
    leaveDays?: number;
    normalDays?: number;
  };

  type SupplementCardListVO = {
    attendanceDate?: string;
    cardType?: number;
    cardTypeDesc?: string;
    createTime?: string;
    departmentName?: string;
    employeeId?: number;
    employeeName?: string;
    id?: number;
    reason?: string;
    status?: number;
    statusDesc?: string;
  };

  type SupplementCardSubmitDTO = {
    attendanceDate?: string;
    cardType?: number;
    reason?: string;
  };

  type SupplementCardVO = {
    attendanceDate?: string;
    cardType?: number;
    cardTypeDesc?: string;
    createTime?: string;
    employeeId?: number;
    id?: number;
    monthlyCount?: number;
    monthlyLimit?: number;
    reason?: string;
    status?: number;
    statusDesc?: string;
  };

  type TransferCreateDTO = {
    employeeId?: number;
    reason?: string;
    salaryAdjustment?: number;
    submitDirectly?: boolean;
    toDepartmentId?: number;
    toDirectReportId?: number;
    toJobLevel?: string;
    toPositionId?: number;
  };

  type TransferDetailVO = {
    applicantId?: number;
    applicantName?: string;
    approvalInstanceId?: number;
    approvalProgress?: ApprovalInstanceVO;
    createTime?: string;
    employeeId?: number;
    employeeName?: string;
    employeeNo?: string;
    fromDepartmentId?: number;
    fromDepartmentName?: string;
    fromDirectReportId?: number;
    fromDirectReportName?: string;
    fromJobLevel?: string;
    fromPositionId?: number;
    fromPositionName?: string;
    id?: number;
    reason?: string;
    salaryAdjustment?: number;
    status?: number;
    statusDesc?: string;
    toDepartmentId?: number;
    toDepartmentName?: string;
    toDirectReportId?: number;
    toDirectReportName?: string;
    toJobLevel?: string;
    toPositionId?: number;
    toPositionName?: string;
    updateTime?: string;
  };

  type TransferHistoryVO = {
    employeeId?: number;
    fromDepartmentName?: string;
    fromJobLevel?: string;
    fromPositionName?: string;
    id?: number;
    reason?: string;
    toDepartmentName?: string;
    toJobLevel?: string;
    toPositionName?: string;
    transferDate?: string;
  };

  type TransferListVO = {
    applicantName?: string;
    createTime?: string;
    employeeId?: number;
    employeeName?: string;
    employeeNo?: string;
    fromDepartmentName?: string;
    fromPositionName?: string;
    id?: number;
    status?: number;
    statusDesc?: string;
    toDepartmentName?: string;
    toPositionName?: string;
  };

  type TransferUpdateDTO = {
    reason?: string;
    salaryAdjustment?: number;
    toDepartmentId?: number;
    toDirectReportId?: number;
    toJobLevel?: string;
    toPositionId?: number;
  };

  type transferUsingPOSTParams = {
    /** nodeId */
    nodeId: number;
  };

  type updateAccountUsingPUTParams = {
    /** id */
    id: number;
  };

  type updateAttendanceGroupUsingPUTParams = {
    /** id */
    id: number;
  };

  type updateDepartmentUsingPUTParams = {
    /** id */
    id: number;
  };

  type updateDraftUsingPUT1Params = {
    /** id */
    id: number;
  };

  type updateDraftUsingPUT2Params = {
    /** id */
    id: number;
  };

  type updateDraftUsingPUT3Params = {
    /** id */
    id: number;
  };

  type updateDraftUsingPUTParams = {
    /** id */
    id: number;
  };

  type updateEmployeeSalaryUsingPUTParams = {
    /** employeeId */
    employeeId: number;
  };

  type updateEmployeeUsingPUTParams = {
    /** id */
    id: number;
  };

  type updateItemUsingPUTParams = {
    /** itemId */
    itemId: number;
  };

  type updateOvertimeRecordUsingPUTParams = {
    /** id */
    id: number;
  };

  type updatePositionUsingPUTParams = {
    /** id */
    id: number;
  };

  type uploadFileUsingPOSTParams = {
    biz?: string;
  };

  type User = {
    createTime?: string;
    id?: number;
    isDelete?: number;
    mpOpenId?: string;
    unionId?: string;
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

  type verifyPayslipUsingPOSTParams = {
    /** id */
    id: number;
  };

  type View = {
    contentType?: string;
  };

  type WorkInfoVO = {
    departmentId?: number;
    departmentName?: string;
    directReportId?: number;
    directReportName?: string;
    jobLevel?: string;
    positionId?: number;
    positionName?: string;
    workLocation?: string;
  };

  // ==================== 薪资管理 ====================

  type SalaryAccountVO = {
    id?: number;
    name?: string;
    scopeType?: number;
    scopeTypeLabel?: string;
    scopeIds?: string;
    effectiveDate?: string;
    createTime?: string;
    updateTime?: string;
    items?: SalaryItemVO[];
  };

  type SalaryItemVO = {
    id?: number;
    accountId?: number;
    name?: string;
    itemType?: number;
    itemTypeLabel?: string;
    formula?: string;
    sortOrder?: number;
    isTaxable?: number;
    createTime?: string;
    updateTime?: string;
  };

  type SalaryItemDetailVO = {
    name?: string;
    amount?: number;
    type?: number;
  };

  type EmployeeSalaryVO = {
    id?: number;
    employeeId?: number;
    accountId?: number;
    accountName?: string;
    baseSalary?: number;
    allowanceBase?: number;
    socialSecurityBase?: number;
    housingFundBase?: number;
    performanceBase?: number;
    effectiveDate?: string;
    createTime?: string;
    updateTime?: string;
  };

  type SalaryChangeHistoryVO = {
    id?: number;
    employeeId?: number;
    changeType?: number;
    changeTypeLabel?: string;
    oldValue?: string;
    newValue?: string;
    effectiveDate?: string;
    operatorId?: number;
    remark?: string;
    createTime?: string;
  };

  type SalaryBatchVO = {
    id?: number;
    batchNo?: string;
    salaryMonth?: string;
    status?: number;
    statusLabel?: string;
    totalEmployees?: number;
    totalGrossPay?: number;
    totalNetPay?: number;
    totalTax?: number;
    createBy?: number;
    createTime?: string;
    updateTime?: string;
  };

  type SalaryDetailVO = {
    id?: number;
    batchId?: number;
    employeeId?: number;
    salaryItems?: SalaryItemDetailVO[];
    grossPay?: number;
    socialSecurity?: number;
    housingFund?: number;
    incomeTax?: number;
    totalDeductions?: number;
    netPay?: number;
    isAbnormal?: number;
    abnormalLabel?: string;
    abnormalReason?: string;
    manualAdjustment?: number;
    adjustmentReason?: string;
    createTime?: string;
  };

  type PayslipVO = {
    id?: number;
    batchNo?: string;
    salaryMonth?: string;
    employeeName?: string;
    employeeNo?: string;
    departmentName?: string;
    incomeItems?: SalaryItemDetailVO[];
    deductionItems?: SalaryItemDetailVO[];
    grossPay?: number;
    totalDeductions?: number;
    netPay?: number;
    payslipViewed?: number;
    createTime?: string;
  };

  // ==================== 薪资请求 DTO ====================

  type SalaryAccountQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    name?: string;
    scopeType?: number;
  };

  type SalaryAccountAddRequest = {
    name?: string;
    scopeType?: number;
    scopeIds?: number[];
    effectiveDate?: string;
    items?: SalaryItemAddRequest[];
  };

  type SalaryAccountUpdateRequest = {
    id?: number;
    name?: string;
    scopeType?: number;
    scopeIds?: number[];
    effectiveDate?: string;
  };

  type SalaryItemAddRequest = {
    name?: string;
    itemType?: number;
    formula?: string;
    sortOrder?: number;
    isTaxable?: number;
  };

  type SalaryItemUpdateRequest = {
    id?: number;
    name?: string;
    itemType?: number;
    formula?: string;
    sortOrder?: number;
    isTaxable?: number;
  };

  type SalaryItemSortRequest = {
    itemIds?: number[];
  };

  type EmployeeSalaryUpdateRequest = {
    accountId?: number;
    baseSalary?: number;
    allowanceBase?: number;
    socialSecurityBase?: number;
    housingFundBase?: number;
    performanceBase?: number;
    effectiveDate?: string;
    remark?: string;
  };

  type SalaryBatchQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    salaryMonth?: string;
    status?: number;
  };

  type SalaryBatchCreateRequest = {
    salaryMonth?: string;
  };

  type SalaryBatchRejectRequest = {
    reason?: string;
  };

  type SalaryDetailQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    batchId?: number;
    employeeId?: number;
    isAbnormal?: number;
  };

  type SalaryDetailAdjustRequest = {
    adjustment?: number;
    reason?: string;
  };

  type PayslipVerifyRequest = {
    verifyType?: number;
    verifyCode?: string;
  };

  // ==================== 薪资分页响应 ====================
  type PageSalaryBatchVO_ = {
    records?: SalaryBatchVO[];
    total?: number;
    current?: number;
    size?: number;
  };

  type PageSalaryDetailVO_ = {
    records?: SalaryDetailVO[];
    total?: number;
    current?: number;
    size?: number;
  };

  // ==================== 薪资统计 ====================
  type BaseResponseListMapStringObject_ = {
    code?: number;
    data?: Record<string, any>[];
    message?: string;
  };

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

  type BaseResponseListSalaryItemVO_ = {
    code?: number;
    data?: SalaryItemVO[];
    message?: string;
  };

  type BaseResponseEmployeeSalaryVO_ = {
    code?: number;
    data?: EmployeeSalaryVO;
    message?: string;
  };

  // === 手写扩展类型 ===
  type BaseResponseOfApprovalDelegate = {
    code?: number;
    data?: ApprovalDelegate;
    message?: string;
  }
  type BaseResponseOfApprovalInstanceVO = {
    code?: number;
    data?: ApprovalInstanceVO;
    message?: string;
  }
  type BaseResponseOfAttendanceCalendarVO = {
    code?: number;
    data?: AttendanceCalendarVO;
    message?: string;
  }
  type BaseResponseOfAttendanceGroupVO = {
    code?: number;
    data?: AttendanceGroupVO;
    message?: string;
  }
  type BaseResponseOfAttendanceRateChartVO = {
    code?: number;
    data?: AttendanceRateChartVO;
    message?: string;
  }
  type BaseResponseOfboolean = {
    code?: number;
    data?: boolean;
    message?: string;
  }
  type BaseResponseOfClockResultVO = {
    code?: number;
    data?: ClockResultVO;
    message?: string;
  }
  type BaseResponseOfDepartment = {
    code?: number;
    data?: Department;
    message?: string;
  }
  type BaseResponseOfDepartmentVO = {
    code?: number;
    data?: DepartmentVO;
    message?: string;
  }
  type BaseResponseOfEmployeeCreateVO = {
    code?: number;
    data?: EmployeeCreateVO;
    message?: string;
  }
  type BaseResponseOfEmployeeDetailVO = {
    code?: number;
    data?: EmployeeDetailVO;
    message?: string;
  }
  type BaseResponseOfEmployeeSalaryVO = {
    code?: number;
    data?: EmployeeSalaryVO;
    message?: string;
  }

  type BaseResponseListSalaryChangeHistoryVO_ = {
    code?: number;
    data?: SalaryChangeHistoryVO[];
    message?: string;
  };

  type BaseResponsePageSalaryBatchVO_ = {
    code?: number;
    data?: PageSalaryBatchVO_;
    message?: string;
  };

  type BaseResponseSalaryBatchVO_ = {
    code?: number;
    data?: SalaryBatchVO;
    message?: string;
  };

  type BaseResponsePageSalaryDetailVO_ = {
    code?: number;
    data?: PageSalaryDetailVO_;
    message?: string;
  };

  type BaseResponseListPayslipVO_ = {
    code?: number;
    data?: PayslipVO[];
    message?: string;
  };

  type BaseResponseOfEmployeeUpdateVO = {
    code?: number;
    data?: EmployeeUpdateVO;
    message?: string;
  }
  type BaseResponseOfFieldPermissionsVO = {
    code?: number;
    data?: FieldPermissionsVO;
    message?: string;
  }
  type BaseResponseOfLeaveBalanceVO = {
    code?: number;
    data?: LeaveBalanceVO;
    message?: string;
  }
  type BaseResponseOfLeaveRequestVO = {
    code?: number;
    data?: LeaveRequestVO;
    message?: string;
  }
  type BaseResponseOfListOfDepartmentTreeNode = {
    code?: number;
    data?: DepartmentTreeNode[];
    message?: string;
  }
  type BaseResponseOfListOfLeaveDistributionVO = {
    code?: number;
    data?: LeaveDistributionVO[];
    message?: string;
  }
  type BaseResponseOfListOfLeaveEarlyRankingVO = {
    code?: number;
    data?: LeaveEarlyRankingVO[];
    message?: string;
  }
  type BaseResponseOfListOfMapOfstringAndobject = {
    code?: number;
    data?: MapOfstringAndobject[];
    message?: string;
  }
  type BaseResponseOfListOfPayslipVO = {
    code?: number;
    data?: PayslipVO[];
    message?: string;
  }

  type BaseResponsePayslipVO_ = {
    code?: number;
    data?: PayslipVO;
    message?: string;
  };

  type BaseResponseOfListOfPendingEmployeeVO = {
    code?: number;
    data?: PendingEmployeeVO[];
    message?: string;
  }
  type BaseResponseOfListOfSalaryAccountVO = {
    code?: number;
    data?: SalaryAccountVO[];
    message?: string;
  }
  type BaseResponseOfListOfSalaryChangeHistoryVO = {
    code?: number;
    data?: SalaryChangeHistoryVO[];
    message?: string;
  }
  type BaseResponseOfListOfSalaryItemVO = {
    code?: number;
    data?: SalaryItemVO[];
    message?: string;
  }
  type BaseResponseOfLoginUserVO = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  }
  type BaseResponseOflong = {
    code?: number;
    data?: number;
    message?: string;
  }
  type BaseResponseOfMapOfstringAndListOfApprovalDelegate = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  }
  type BaseResponseOfMapOfstringAndlong = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  }
  type BaseResponseOfMapOfstringAndobject = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  }
  type BaseResponseOfMapOfstringAndstring = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  }
  type BaseResponseOfobject = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  }
  type BaseResponseOfOnboardingDetailVO = {
    code?: number;
    data?: OnboardingDetailVO;
    message?: string;
  }
  type BaseResponseOfOvertimeRecordVO = {
    code?: number;
    data?: OvertimeRecordVO;
    message?: string;
  }
  type BaseResponseOfPageOfAttendanceGroupListVO = {
    code?: number;
    data?: PageOfAttendanceGroupListVO;
    message?: string;
  }
  type BaseResponseOfPageOfAttendanceRecordVO = {
    code?: number;
    data?: PageOfAttendanceRecordVO;
    message?: string;
  }
  type BaseResponseOfPageOfEmployeeListVO = {
    code?: number;
    data?: PageOfEmployeeListVO;
    message?: string;
  }
  type BaseResponseOfPageOfLeaveRequestVO = {
    code?: number;
    data?: PageOfLeaveRequestVO;
    message?: string;
  }
  type BaseResponseOfPageOfOnboardingListVO = {
    code?: number;
    data?: PageOfOnboardingListVO;
    message?: string;
  }
  type BaseResponseOfPageOfOvertimeRecordListVO = {
    code?: number;
    data?: PageOfOvertimeRecordListVO;
    message?: string;
  }
  type BaseResponseOfPageOfPendingItemVO = {
    code?: number;
    data?: PageOfPendingItemVO;
    message?: string;
  }
  type BaseResponseOfPageOfPositionVO = {
    code?: number;
    data?: PageOfPositionVO;
    message?: string;
  }
  type BaseResponseOfPageOfProbationListVO = {
    code?: number;
    data?: PageOfProbationListVO;
    message?: string;
  }
  type BaseResponseOfPageOfProcessedItemVO = {
    code?: number;
    data?: PageOfProcessedItemVO;
    message?: string;
  }
  type BaseResponseOfPageOfResignationListVO = {
    code?: number;
    data?: PageOfResignationListVO;
    message?: string;
  }
  type BaseResponseOfPageOfSalaryBatchVO = {
    code?: number;
    data?: PageOfSalaryBatchVO;
    message?: string;
  }
  type BaseResponseOfPageOfSalaryDetailVO = {
    code?: number;
    data?: PageOfSalaryDetailVO;
    message?: string;
  }
  type BaseResponseOfPageOfSupplementCardListVO = {
    code?: number;
    data?: PageOfSupplementCardListVO;
    message?: string;
  }
  type BaseResponseOfPageOfTransferHistoryVO = {
    code?: number;
    data?: PageOfTransferHistoryVO;
    message?: string;
  }
  type BaseResponseOfPageOfTransferListVO = {
    code?: number;
    data?: PageOfTransferListVO;
    message?: string;
  }
  type BaseResponseOfPageOfUser = {
    code?: number;
    data?: PageOfUser;
    message?: string;
  }
  type BaseResponseOfPageOfUserVO = {
    code?: number;
    data?: PageOfUserVO;
    message?: string;
  }
  type BaseResponseOfPayslipVO = {
    code?: number;
    data?: PayslipVO;
    message?: string;
  }
  type BaseResponseOfPosition = {
    code?: number;
    data?: Position;
    message?: string;
  }
  type BaseResponseOfPositionVO = {
    code?: number;
    data?: PositionVO;
    message?: string;
  }
  type BaseResponseOfProbationDetailVO = {
    code?: number;
    data?: ProbationDetailVO;
    message?: string;
  }
  type BaseResponseOfResignationDetailVO = {
    code?: number;
    data?: ResignationDetailVO;
    message?: string;
  }
  type BaseResponseOfSalaryAccountVO = {
    code?: number;
    data?: SalaryAccountVO;
    message?: string;
  }
  type BaseResponseOfSalaryBatchVO = {
    code?: number;
    data?: SalaryBatchVO;
    message?: string;
  }
  type BaseResponseOfstring = {
    code?: number;
    data?: string;
    message?: string;
  }
  type BaseResponseOfSupplementCardVO = {
    code?: number;
    data?: SupplementCardVO;
    message?: string;
  }
  type BaseResponseOfTransferDetailVO = {
    code?: number;
    data?: TransferDetailVO;
    message?: string;
  }
  type BaseResponseOfUser = {
    code?: number;
    data?: User;
    message?: string;
  }
  type BaseResponseOfUserVO = {
    code?: number;
    data?: UserVO;
    message?: string;
  }
  type BaseResponseOfVoid = {
    code?: number;
    message?: string;
  }
  type MapOfstringAndListOfApprovalDelegate = true;

  type MapOfstringAndlong = true;

  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndlong = true;

  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndlong = true;

  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndlong = true;

  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndlong = true;

  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject = true;

  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject1 = true;

  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject2 = true;

  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject3 = true;

  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject4 = true;

  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndobject5 = true;

  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type MapOfstringAndstring = true;

  type markAsPaidUsingPUTParams = {
    /** id */
    id: number;
  }
  type PageOfAttendanceGroupListVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: AttendanceGroupListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfAttendanceRecordVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: AttendanceRecordVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfEmployeeListVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: EmployeeListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfLeaveRequestVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: LeaveRequestVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfOnboardingListVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: OnboardingListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfOvertimeRecordListVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: OvertimeRecordListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfPendingItemVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: PendingItemVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfPositionVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: PositionVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfProbationListVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ProbationListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfProcessedItemVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ProcessedItemVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfResignationListVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ResignationListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfSalaryBatchVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: SalaryBatchVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfSalaryDetailVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: SalaryDetailVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfSupplementCardListVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: SupplementCardListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfTransferHistoryVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: TransferHistoryVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfTransferListVO = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: TransferListVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type PageOfUser = {
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
  }
  type PageOfUserVO = {
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
  }
  type BaseResponsePageDepartmentVO_ = {
    code?: number;
    data?: PageDepartmentVO_;
    message?: string;
  }
  type PageDepartmentVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: DepartmentVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }
  type ApprovalDelegateVO = {
    id?: number;
    delegatorId?: number;
    delegatorName?: string;
    delegateId?: number;
    delegateName?: string;
    startTime?: string;
    endTime?: string;
    enabled?: number;
  }
  type ApprovalActionRequest = { comment?: string; toApproverId?: number }
  type DelegateSettingRequest = {
    delegateId?: number;
    startTime?: string;
    endTime?: string;
  }
  type BaseResponseApprovalActionVO_ = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  }
  type BaseResponseApprovalDelegateVO_ = {
    code?: number;
    data?: ApprovalDelegateVO;
    message?: string;
  }
  type EmpProfileVO = {
    id?: number;
    name?: string;
    phone?: string;
    email?: string;
    idCard?: string;
    gender?: number;
    userAvatar?: string;
    departmentName?: string;
    positionName?: string;
  }
  type BaseResponseEmpProfileVO_ = {
    code?: number;
    data?: EmpProfileVO;
    message?: string;
  }
  type EmpProfileUpdateRequest = {
    name?: string;
    phone?: string;
    email?: string;
    gender?: number;
    userAvatar?: string;
  }
}
