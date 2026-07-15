declare namespace API {
  type BaseResponseBoolean_ = {
    code?: number;
    data?: boolean;
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

  type BaseResponseListDepartmentTreeNode_ = {
    code?: number;
    data?: DepartmentTreeNode[];
    message?: string;
  };

  type BaseResponseListMapStringObject_ = {
    code?: number;
    data?: MapStringObject_[];
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

  type BaseResponsePageDepartmentVO_ = {
    code?: number;
    data?: PageDepartmentVO_;
    message?: string;
  };

  type BaseResponsePageEmployeeListVO_ = {
    code?: number;
    data?: PageEmployeeListVO_;
    message?: string;
  };

  type BaseResponsePagePositionVO_ = {
    code?: number;
    data?: PagePositionVO_;
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

  type BaseResponseVoid_ = {
    code?: number;
    message?: string;
  };

  type deleteDepartmentUsingDELETEParams = {
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

  type EmployeeUpdateVO = {
    flowRequiredFields?: string[];
    updatedFields?: string[];
  };

  type FieldPermissionsVO = {
    editableFields?: string[];
    flowRequiredFields?: string[];
    viewableFields?: string[];
  };

  type getDepartmentDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getDepartmentListUsingGETParams = {
    current?: number;
    keyword?: string;
    pageSize?: number;
    parentId?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type getEmployeeDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getEmployeeListUsingGETParams = {
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

  type getUserByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getUserVOByIdUsingGETParams = {
    /** id */
    id?: number;
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

  type MapStringObject_ = true;

  type MapStringObject_1 = true;

  type OrderItem = {
    asc?: boolean;
    column?: string;
  };

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
    id?: number;
    levelMax?: number;
    levelMin?: number;
    levelRange?: string;
    name?: string;
    sequence?: number;
    sequenceDesc?: string;
    updateTime?: string;
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

  type updateDepartmentUsingPUTParams = {
    /** id */
    id: number;
  };

  type updateEmployeeUsingPUTParams = {
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
}
