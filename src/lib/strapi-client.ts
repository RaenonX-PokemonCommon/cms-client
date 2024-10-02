import {AxiosInstance} from 'axios';

import {getAxiosInstance} from './service/http';
import {StrapiAuthClient} from './strapi-auth-client';
import {StrapiQueryBuilder} from './strapi-query-builder';
import {StrapiClientOptions} from './types/base';


export class StrapiClient {
  readonly #httpClient: AxiosInstance;
  readonly #options: StrapiClientOptions;
  #isNotUserContent: boolean;
  readonly #normalizeData: boolean;
  readonly #debug: boolean;

  auth: StrapiAuthClient;

  constructor(options: StrapiClientOptions) {
    this.#debug = options.debug || false;
    this.#httpClient = getAxiosInstance(options.url, options.apiToken);
    this.auth = this.#initStrapiAuthClient(this.#httpClient);
    this.#normalizeData = options.normalizeData ? options.normalizeData : false;
    this.#options = options;
    this.#isNotUserContent = true;
  }

  readonly from = <T = any>(contentName: string): StrapiQueryBuilder<T> => {
    contentName === 'users' ? (this.#isNotUserContent = false) : (this.#isNotUserContent = true);
    const url = `${this.#options.url}/${contentName}`;
    return new StrapiQueryBuilder<T>(url, this.#httpClient, this.#isNotUserContent, this.#normalizeData, this.#debug);
  };

  readonly getApiUrl = (): string => this.#options.url;

  readonly setToken = (token: string): void => {
    this.#httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  readonly removeToken = (): void => {
    delete this.#httpClient.defaults.headers.common['Authorization'];
  };

  readonly #initStrapiAuthClient = (
    axiosInstance: AxiosInstance,
  ) => new StrapiAuthClient(axiosInstance, this.#options);
}
