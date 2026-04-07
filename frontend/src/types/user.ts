export type Role = 'USER' | 'RESIDENT' | 'ADMIN';

export interface User {
  id: number;
  loginId?: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  birthDate?: string;
  gender?: string;
  nationality?: string;
  profileImage?: string;
  createdAt?: string;
}
