import type { GenderEnum } from '@/enums';

export interface DependentUser {
  id: string;
  full_name: string;
  phone: string;
  gender: GenderEnum;
  email: string;
  dob: string;
  created_at: string;
}

export interface DependentRelationship {
  id: string;
  user_id: string;
  dependent_user_id: string;
  created_at: string;
  relationship: string;
  user: DependentUser;
}

export type DependentsResponse = DependentRelationship;

export interface CreateDependentData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: Date;
  relation: string;
  gender: GenderEnum;
}
