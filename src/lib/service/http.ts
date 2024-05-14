import axios, {InternalAxiosRequestConfig, AxiosInstance} from 'axios';
import {addAxiosDateTransformer} from 'axios-date-transformer';


export const getAxiosInstance = (url: string, apiToken?: string): AxiosInstance => {
  const api = axios.create();

  api.defaults.baseURL = url;

  const axiosConfig = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (apiToken) {
      config.headers.Authorization = `Bearer ${apiToken}`;
    }
    return config;
  };

  api.interceptors.request.use(axiosConfig);

  return addAxiosDateTransformer(api);
};
