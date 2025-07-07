
import axios, { type AxiosRequestConfig } from "axios";

export const axiosGet = async (
  url: string,
  config?: AxiosRequestConfig<object>
) => {
  return axios.get(url, { ...config });
};

export const axiosPost = async (
  url: string,
  { data, ...config }: { data?: object } & AxiosRequestConfig<object>
) => axios.post(url, data, config);

export const axiosPatch = async (
  url: string,
  { data, ...config }: { data?: object } & AxiosRequestConfig<object>
) => axios.patch(url, data, config);

export const axiosPut = async (
  url: string,
  { data, ...config }: { data?: object } & AxiosRequestConfig<object>
) => axios.put(url, data, config);

export const axiosDelete = async (
  url: string,
  config?: AxiosRequestConfig<object>
) => axios.delete(url, config);

