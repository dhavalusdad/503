export const agreementQueryKey = {
  getAgreementList: (params?: object) =>
    ['getAgreementList', params].filter(item => item !== undefined),
  getAgreementById: (id: string) => ['getAgreementById', id].filter(item => item !== undefined),
  getUserPendingAgreements: () => ['getUserPendingAgreements'].filter(item => item !== undefined),
};
