export const clinicAddressesQueryKey = {
  getClinicAddressKey: (params: string) => ['getClinicAddressTagKey', params],
  getClinicAddressesList: (params?: object) =>
    ['getClinicAddressTagList', params].filter(item => item !== undefined),
  getClinicAddressById: (id: string | undefined) =>
    ['getClinicAddressTagById', id].filter(item => item !== undefined),
  getClinicAddressSessionTagById: (id: string | undefined) =>
    ['getClinicAddressSessionTagById', id].filter(item => item !== undefined),
  getClinicAddressSessionTagWithSelectList: (params?: object) =>
    ['getClinicAddressSessionTagWithSelectList', params].filter(item => item !== undefined),
};
