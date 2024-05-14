import {AxiosInstance} from 'axios';

import {generateQueryFromRawString, generateQueryString, stringToArray} from './helpers';
import {StrapiClientHelper} from './strapi-client-helper';
import {InferedTypeFromArray, PublicationState, StrapiApiResponse} from './types/base';
import {CrudSorting, PopulateDeepOptions, RelationalFilterOperators} from './types/crud';


export class StrapiFilterBuilder<T> extends StrapiClientHelper<T> {
  #httpClient: AxiosInstance;
  #normalizeData: boolean;
  readonly #debug: boolean;

  constructor(
    url: string,
    axiosInstance: AxiosInstance,
    normalizeData: boolean,
    debug: boolean,
    private isNotUserContent: boolean,
    private isSingle: boolean,
  ) {
    super(url);
    this.#debug = debug;
    this.url = url;
    this.#httpClient = axiosInstance;
    this.#normalizeData = normalizeData;
    this.isSingle = isSingle;
  }

  async get(): Promise<StrapiApiResponse<T>>;
  async get(): Promise<StrapiApiResponse<InferedTypeFromArray<T>>>;
  async get(): Promise<StrapiApiResponse<T | InferedTypeFromArray<T>>> {
    if (this.#debug) {
      // eslint-disable-next-line no-console
      console.log(this.url);
    }
    return new Promise<StrapiApiResponse<T>>((resolve) => {
      if (this.isNotUserContent) {
        this.#httpClient
          .get<StrapiApiResponse<T>>(this.url)
          .then((res) => {
            const data = this.#normalizeData ? this.returnDataHandler(res.data) : res.data;
            if (this.isSingle && Array.isArray(data.data)) {
              resolve({data: data.data[0], meta: data.meta});
            } else {
              resolve(data);
            }
          })
          .catch((err) => {
            if (err) {
              resolve(this.returnErrorHandler(err));
            }
          });
      } else {
        this.#httpClient
          .get<T>(this.url)
          .then((res) => {
            resolve({data: res.data, meta: undefined});
          })
          .catch((err) => {
            if (err) {
              resolve(this.returnErrorHandler(err));
            }
          });
      }
    });
  }

  readonly equalTo = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string | number) => {
    this.url = this.generateFilter({
      field,
      operator: 'eq',
      value,
    });
    return this;
  }

  readonly notEqualTo = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string | number) => {
    this.url = this.generateFilter({
      field,
      operator: 'ne',
      value,
    });
    return this;
  }

  readonly lessThan = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string | number) => {
    this.url = this.generateFilter({
      field,
      operator: 'lt',
      value,
    });
    return this;
  }

  readonly lessThanOrEqualTo = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string | number) => {
    this.url = this.generateFilter({
      field,
      operator: 'lte',
      value,
    });
    return this;
  }

  readonly greaterThan = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string | number) => {
      this.url = this.generateFilter({
        field,
        operator: 'gt',
        value,
      });
      return this;
    }

  readonly greaterThanOrEqualTo = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string | number) => {
      this.url = this.generateFilter({
        field,
        operator: 'gte',
        value,
      });
      return this;
    }

  readonly containsCaseSensitive = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string) => {
      this.url = this.generateFilter({
        field,
        operator: 'contains',
        value,
      });
      return this;
    }

  readonly notContainsCaseSensitive = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string) => {
      this.url = this.generateFilter({
        field,
        operator: 'notContains',
        value,
      });
      return this;
    }

  readonly contains = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string) => {
      this.url = this.generateFilter({
        field,
        operator: 'containsi',
        value,
      });
      return this;
    }

  readonly  notContains = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string) => {
      this.url = this.generateFilter({
        field,
        operator: 'notContainsi',
        value,
      });
      return this;
    }

  readonly isNull = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string) => {
      this.url = this.generateFilter({
        field,
        operator: 'null',
        value,
      });
      return this;
    }

  readonly isNotNull = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string) => {
      this.url = this.generateFilter({
        field,
        operator: 'notNull',
        value,
      });
      return this;
    }

  readonly between = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: Array<any>) => {
      this.url = this.generateFilter({
        field,
        operator: 'between',
        value,
      });
      return this;
    }

  readonly startsWith = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string) => {
      this.url = this.generateFilter({
        field,
        operator: 'startsWith',
        value,
      });
      return this;
    }

  readonly endsWith = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string) => {
      this.url = this.generateFilter({
        field,
        operator: 'endsWith',
        value,
      });
      return this;
    }

  readonly in = (field: Extract<keyof InferedTypeFromArray<T>, string>, value: string[]) => {
      this.url = this.generateFilter({
        field,
        operator: 'in',
        value,
      });
      return this;
    }

  readonly filterDeep = (path: string, operator: RelationalFilterOperators, value: string | number | Array<string | number>) => {
      this.url = this.generateRelationsFilter({path: stringToArray(path), operator, value});
      return this;
    }

  readonly sortBy = (sort: CrudSorting<InferedTypeFromArray<T>>) => {
      this.url = this.generateSort(sort);
      return this;
    }

  readonly paginate = (page: number, pageSize: number) => {
      const paginateRawQuery = `pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
      this.url = this.handleUrl(generateQueryFromRawString(paginateRawQuery));
      return this;
    }

  readonly paginateByOffset = (start: number, limit: number) => {
      const paginateRawQuery = `pagination[start]=${start}&pagination[limit]=${limit}`;
      this.url = this.handleUrl(generateQueryFromRawString(paginateRawQuery));
      return this;
    }

  readonly withDraft = () => {
      this.url = this.handleUrl(`publicationState=${PublicationState.PREVIEW}`);
      return this;
    }

  readonly onlyDraft = () => {
      this.url = this.handleUrl(`publicationState=${PublicationState.PREVIEW}&filters[publishedAt][$null]=true`);
      return this;
    }

  readonly setLocale = (localeCode: string) => {
      this.url = this.handleUrl(`locale=${localeCode}`);
      return this;
    }

  readonly populate = () => {
      const obj = {
        populate: '*',
      };
      this.url = this.handleUrl(generateQueryString(obj));
      return this;
    }

  readonly populateWith = <Q>(
      relation: T extends Array<infer U> ? keyof U : keyof T,
      selectFields?: Array<keyof Q>,
      level2?: boolean,
    ) => {
      const obj = {
        populate: {
          [relation]: {
            fields: selectFields,
            populate: level2 ? '*' : null,
          },
        },
      };
      this.url = this.handleUrl(generateQueryString(obj));
      return this;
    }

  readonly populateDeep = (populateDeepValues: PopulateDeepOptions[]) => {
      this.url = this.generatePopulateDeep(populateDeepValues);
      return this;
    }
}
