import axios, {type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig} from 'axios';

import {transformDatesInObject} from './transformDate';


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

  // Add response interceptor for date transformation
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      if (response.data) {
        response.data = transformDatesInObject(response.data);
      }

      return response;
    },
    (error) => Promise.reject(error),
  );

  return api;
};
