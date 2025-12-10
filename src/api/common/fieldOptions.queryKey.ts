export const fieldOptionsQueryKey = {
  getFieldOptionsKey: (params: string) => [params],
  getFieldOptionsList: (params?: object) =>
    ['getFieldOptionsList', params].filter(item => item !== undefined),
  getFieldOptionsById: (id: string | undefined) =>
    ['getFieldOptionsById', id].filter(item => item !== undefined),
};
