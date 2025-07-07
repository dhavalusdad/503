import { useQuery } from ".";
import { axiosGet } from "./axios";
import { dashboardQueryKeyMap } from "./common/dashboard.queryKey";

export const useGetDashboardData = () => {
  return useQuery({
    queryKey: dashboardQueryKeyMap.getDashboardData(),
    queryFn: () => axiosGet("https://jsonplaceholder.typicode.com/users"),
    select: (res) => {
      return res.data;
    },

    experimental_prefetchInRender: true,
  });
};
