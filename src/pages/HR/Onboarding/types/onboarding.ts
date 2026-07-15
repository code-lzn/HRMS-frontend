export interface OnboardingAddRequest {
  candidateName: string;
  phone: string;
  idCard?: string;
  email: string;
  deptId: number;
  positionId: number;
  hireDate: string;
  probationMonth?: number;
  employmentType: string;
  contractType?: number;
  contractExpireDate?: string;
  flowId?: number;
  baseSalary?: number;
  socialInsuranceBase?: number;
  housingFundBase?: number;
  bankAccount?: string;
  bankName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  remark?: string;
}

export interface OnboardingVO {
  id: number;
  businessNo: string;
  flowId?: number;
  recordId?: number;
  deptId: number;
  deptName?: string;
  positionId: number;
  positionName?: string;
  hireDate: string;
  probationMonth?: number;
  employmentType: string;
  contractType?: number;
  contractExpireDate?: string;
  baseSalary?: number;
  socialInsuranceBase?: number;
  housingFundBase?: number;
  bankAccount?: string;
  bankName?: string;
  candidateName: string;
  phone: string;
  idCard?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  employeeId?: number;
  operatorId: number;
  approverId?: number;
  approverName?: string;
  remark?: string;
  createTime: string;
  updateTime: string;
  approvalStatus?: string;
  approvalProgress?: string;
}

export interface PageVO<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}
