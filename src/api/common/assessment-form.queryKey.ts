import type { AssessmentFormParamsType, ClientFormsParamsType } from '@/api/types/user.dto';

export const FORMS_KEY_NAME = {
  LIST: 'forms-list',
  BY_ID: 'forms-edit',
  LIST_BY_USER_ID: 'forms-users-id',
  FORM_RESPONSE: 'form-user-response',
};

export const formsQueryKey = {
  getList: (params?: string | AssessmentFormParamsType, userId?: string) =>
    ['forms', 'list', params, userId] as const,
  getFormById: (id?: string) => [FORMS_KEY_NAME.BY_ID, id],
  getFormResponseById: (id?: string) => [FORMS_KEY_NAME.FORM_RESPONSE, id],
  getFormsByUserId: (params?: ClientFormsParamsType | string) => [
    FORMS_KEY_NAME.LIST_BY_USER_ID,
    params,
  ],
  getListData: () => ['forms', 'list'] as const,
  deleteAssignedForm: (params?: string) =>
    ['deleteAssignedForms', params].filter(d => d !== undefined),
};
