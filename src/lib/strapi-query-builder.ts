import {AxiosInstance} from 'axios';

import {generateQueryString} from './helpers';
import {StrapiClientHelper} from './strapi-client-helper';
import {StrapiFilterBuilder} from './strapi-filter-builder';
import {StrapiApiResponse} from './types/base';


type PostValuesType<T> = {
  data: T,
};

export class StrapiQueryBuilder<T> extends StrapiClientHelper<T> {
  readonly #httpClient: AxiosInstance;
  readonly #isNotUserContent: boolean;
  protected normalizeData: boolean;
  #isSingle: boolean;
  readonly #debug: boolean;

  constructor(
    url: string,
    axiosInstance: AxiosInstance,
    isNotUserContent: boolean,
    normalizeData: boolean,
    debug: boolean,
  ) {
    super(url);
    this.#debug = debug;
    this.#isSingle = true;
    this.normalizeData = normalizeData;
    this.url = `${url}`;
    this.#isNotUserContent = isNotUserContent;
    this.#httpClient = axiosInstance;
  }

  select(): StrapiFilterBuilder<T>;
  select(fields?: Array<keyof T>): StrapiFilterBuilder<T[]>;
  select(fields?: Array<keyof T> | string): StrapiFilterBuilder<T> | StrapiFilterBuilder<T[]> {
    if (fields) {
      const query = {
        fields,
      };
      const queryString = generateQueryString(query);
      this.url = `${this.url}?${queryString}`;
      this.#isSingle = false;

      return new StrapiFilterBuilder<T[]>(
        this.url,
        this.#httpClient,
        this.normalizeData,
        this.#debug,
        this.#isNotUserContent,
        this.#isSingle,
      );
    }

    return new StrapiFilterBuilder<T>(
      this.url,
      this.#httpClient,
      this.normalizeData,
      this.#debug,
      this.#isNotUserContent,
      this.#isSingle,
    );
  }

  readonly selectManyByID = async (ids: string[] | number[]): Promise<StrapiFilterBuilder<T[]>> => {
    if (ids) {
      const query = ids?.map((item: string | number) => `filters[id][$in]=${item}`).join('&');

      this.url = `${this.url}?${query}`;
    }

    return new StrapiFilterBuilder<T[]>(
      this.url,
      this.#httpClient,
      this.normalizeData,
      this.#debug,
      this.#isNotUserContent,
      this.#isSingle,
    );
  }

  readonly create = async (values: T): Promise<StrapiApiResponse<T>> => {
    return new Promise<StrapiApiResponse<T>>((resolve) => {
      this.#httpClient
        .post<StrapiApiResponse<T>>(this.url, this.#handleValues(values))
        .then((res) => {
          resolve(this.normalizeData ? this.returnDataHandler(res.data) : res.data);
        })
        .catch((err) => {
          if (err) {
            resolve(this.returnErrorHandler(err));
          }
        });
    });
  }

  readonly createMany = async (values: T[]): Promise<{success: true}> => {
    await Promise.all(
      values.map(async (value): Promise<StrapiApiResponse<T>> => {
        const {data} = await this.#httpClient.post<StrapiApiResponse<T>>(this.url, this.#handleValues(value));
        return Promise.resolve(data);
      }),
    ).catch((error) => {
      if (error) {
        this.returnErrorHandler(error);
      }
    });
    return Promise.resolve({
      success: true,
    });
  }

  readonly update = async (id: string | number, values: Partial<T>): Promise<StrapiApiResponse<T>> => {
    const url = `${this.url}/${id}`;

    return new Promise<StrapiApiResponse<T>>((resolve) => {
      this.#httpClient
        .put<StrapiApiResponse<T>>(url, this.#handleValues(values))
        .then((res) => {
          resolve(this.normalizeData ? this.returnDataHandler(res.data) : res.data);
        })
        .catch((err) => {
          if (err) {
            resolve(this.returnErrorHandler(err));
          }
        });
    });
  }

  readonly updateMany = async (values: {id: string | number; variables: Partial<T>}[]): Promise<{success: true}> => {
    await Promise.all(
      values.map(async (value): Promise<StrapiApiResponse<T>> => {
        const url = `${this.url}/${value.id}`;

        const {data} = await this.#httpClient.put<StrapiApiResponse<T>>(url, this.#handleValues(value.variables));
        return Promise.resolve(data);
      }),
    ).catch((error) => {
      if (error) {
        this.returnErrorHandler(error);
      }
    });
    return Promise.resolve({
      success: true,
    });
  }

  readonly deleteOne = async (id: string | number): Promise<StrapiApiResponse<T>> => {
    const url = `${this.url}/${id}`;
    return new Promise<StrapiApiResponse<T>>((resolve) => {
      this.#httpClient
        .delete<StrapiApiResponse<T>>(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          if (err) {
            resolve(this.returnErrorHandler(err));
          }
        });
    });
  }

  readonly deleteMany = async (ids: string[] | number[]): Promise<{success: true}> => {
    await Promise.all(
      ids.map(async (id) => {
        const {data} = await this.#httpClient.delete(`${this.url}/${id}`);
        return data;
      }),
    ).catch((err) => this.returnErrorHandler(err));

    return Promise.resolve({
      success: true,
    });
  }

  readonly #handleValues = (values: Partial<T>): Partial<T> | PostValuesType<Partial<T>> => {
    if (this.#isNotUserContent) {
      return {data: values};
    }

    return values;
  }
}
