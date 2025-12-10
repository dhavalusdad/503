export const cityQueryKey = {
  getCitiesKey: (params?: { page?: number; limit?: number; search?: string }) => ['cities', params],
  getCitiesByStateKey: (stateId: string) => ['cities', stateId],
};
