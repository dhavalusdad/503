export const transactionQueryKey = {
  getTransactionList: (params?: object) =>
    ['getTransactionList', params].filter(item => item !== undefined),
  getTransactionById: (id: string | undefined) =>
    ['getTransactionById', id].filter(item => item !== undefined),
};
