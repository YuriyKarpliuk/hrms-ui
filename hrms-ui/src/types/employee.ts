export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'| 'TERMINATED';
export type Gender = 'MALE' | 'FEMALE';
export type MaritalStatus = 'SINGLE' | 'MARRIED';

export interface Employee {
  id: number;
  orgId: number | null;
  userId: string | null;
  deptId: number | null;
  position: string | null;
  managerId: number | null;
  hrId: number | null;
  email: string;
  roles: string[];
  firstName: string;
  lastName: string;
  phone: string | null;
  status: EmployeeStatus;
  gender: Gender;
  maritalStatus: MaritalStatus;
  taxNumber: string | null;
  about: string | null;
  officeLocation: string | null;
  birthDate: string | null; 
  age: number | null;
  hiredAt: string | null;
  terminatedAt: string | null;
  avatarUrl: string | null;
  cvKey: string | null;
}
