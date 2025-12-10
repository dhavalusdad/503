// Base Response Structure
export interface BaseResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> extends BaseResponse {
  data: {
    data: T[];
    pagination: Pagination;
  };
}

// Field Options s
export interface FieldOption {
  id: string;
  name: string;
}

export interface GetFieldOptionsByTypeRequest {
  fieldOptionType: string;
}

export interface GetFieldOptionsByTypeResponse {
  success: boolean;
  data: FieldOption[];
}

// Language s
export interface Language {
  id: string;
  code: string;
  name: string;
}

export interface Specialty {
  area_of_focus_id: string;
  area_of_focus: {
    name: string;
  };
}

export interface AreaOfFocus {
  id: string;
  name: string;
}

export interface TherapyType {
  id: string;
  name: string;
}

export interface GetLanguagesResponse {
  success: boolean;
  data: Language[];
}

// State s
export interface State {
  id: string;
  name: string;
  code?: string;
}

export interface GetStatesResponse {
  success: boolean;
  data: State[];
}

export interface DashboardData {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface GetDashboardDataResponse {
  success: boolean;
  data: DashboardData[];
}

// Error s
export interface APIError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export type CommonFilterParamsType = {
  page: number;
  limit: number;
  search?: string;
  sortColumn?: string;
  sortOrder?: string;
  timezone?: string;
};
