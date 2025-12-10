export interface Role {
  id: string;
  role_name: string;
  slug: string; // this is roleType
  createdAt?: string;
  updatedAt?: string;
}
export interface RoleModalProps {
  mode: 'create' | 'edit';
  initialData: Role | null;
  onClose: () => void;
  onSuccess: () => void;
}
