export const tagQueryKey = {
  getTagKey: (params: string) => [params],
  getTagList: (params?: object) =>
    ['getFieldOptionsList', params].filter(item => item !== undefined),
  getTagById: (id: string | undefined) =>
    ['getFieldOptionsById', id].filter(item => item !== undefined),
  getSessionTagById: (id: string | undefined) =>
    ['getSessionTagById', id].filter(item => item !== undefined),
  getSessionTagWithSelectList: (params?: object) =>
    ['getSessionTagWithSelectList', params].filter(item => item !== undefined),
};
