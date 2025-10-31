import {parse, stringify} from 'qs';

import {generateQueryString, stringToArray} from './helpers';
import {type InferedTypeFromArray, type StrapiApiError, type StrapiApiResponse} from './types/base';
import {type CrudFilter, type CrudSorting, type DeepFilterType, type OrFilterCondition, type PopulateDeepOptions} from './types/crud';


export abstract class StrapiClientHelper<T> {
  protected url: string;

  protected constructor(url: string) {
    this.url = url;
  }

  readonly #normalizeData = (data: any): any => {
    const isObject = (data: any) => Object.prototype.toString.call(data) === '[object Object]';

    const flatten = (data: any) => {
      if (!data.attributes) return data;

      return {
        id: data.id,
        ...data.attributes,
      };
    };

    if (Array.isArray(data)) {
      return data.map((item) => this.#normalizeData(item));
    }

    if (isObject(data)) {
      if (Array.isArray(data.data)) {
        data = [...data.data];
      } else if (isObject(data.data)) {
        data = flatten({...data.data});
      } else if (data.data === null) {
        data = null;
      } else {
        data = flatten(data);
      }

      for (const key in data) {
        if (Object.hasOwn(data, key)) {
          data[key] = this.#normalizeData(data[key]);
        }
      }

      return data;
    }

    return data;
  };

  protected readonly returnDataHandler = (data: StrapiApiResponse<T>): StrapiApiResponse<T> => {
    return {
      data: this.#normalizeData(data.data) as T,
      meta: data.meta,
      error: data.error,
    };
  };

  protected readonly returnErrorHandler = (err: any): StrapiApiResponse<T> => {
    let error: StrapiApiError = {
      status: null,
      message: null,
      details: null,
      name: null,
    };

    if (err.code === 'ENOTFOUND' || err.syscall === 'getaddrinfo') {
      error.status = err.code;
      error.message = `The given url ${err.config.baseURL} is incorrect or invalid `;
      error.name = err.syscall;
    } else {
      if (!err.response.data.error) {
        error.status = err.response.status as number;
        error.message = err.response.statusText;
        error.name = err.response.data;
      } else {
        error = err.response.data.error as StrapiApiError;
      }
    }

    return {
      data: null,
      error,
    };
  };

  protected readonly generateFilter = ({field, operator, value}: CrudFilter<InferedTypeFromArray<T>>): string => {
    let rawQuery = '';
    if (Array.isArray(value)) {
      value.map((val) => {
        rawQuery += `&filters[${field}][$${operator}]=${val}`;
      });
    } else {
      rawQuery += `&filters[${field}][$${operator}]=${value}`;
    }
    const parsedQuery = parse(rawQuery);
    return this.handleUrl(generateQueryString(parsedQuery));
  };

  protected readonly generateRelationsFilter = (deepFilter: DeepFilterType): string => {
    let rawQuery = `filters`;
    const {path: fields, operator, value} = deepFilter;
    if (Array.isArray(fields)) {
      fields.map((field) => {
        rawQuery += `[${field}]`;
      });
    }

    const partialQuery = rawQuery;

    if (Array.isArray(value)) {
      value.map((val, index) => {
        if (index === 0) {
          rawQuery += `[$${operator}]=${val}`;
        } else {
          rawQuery += `&${partialQuery}[$${operator}]=${val}`;
        }
      });
    } else {
      rawQuery += `[$${operator}]=${value}`;
    }

    const parsedQuery = parse(rawQuery);
    return this.handleUrl(generateQueryString(parsedQuery));
  };

  protected readonly generateOrFilter = (conditions: OrFilterCondition[]): string => {
    let rawQuery = '';
    conditions.forEach((condition, index) => {
      const {path, operator, value} = condition;
      const fields = stringToArray(path);
      let filterPath = `filters[$or][${index}]`;

      fields.forEach((field) => {
        filterPath += `[${field}]`;
      });

      const encodedValue = encodeURIComponent(String(value));
      if (index > 0) {
        rawQuery += '&';
      }
      rawQuery += `${filterPath}[$${operator}]=${encodedValue}`;
    });

    const parsedQuery = parse(rawQuery);
    return this.handleUrl(generateQueryString(parsedQuery));
  };

  protected readonly generateSort = <T>(_sort: CrudSorting<T>): string => {
    const sort: string[] = [];
    _sort.map((item) => {
      if (item.order) {
        sort.push(`${item.field}:${item.order}`);
      } else {
        sort.push(`${item.field}`);
      }
    });
    return this.handleUrl(generateQueryString({sort}));
  };

  protected readonly handleUrl = (query: string): string => {
    const lastChar = this.url.charAt(this.url.length - 1);
    const hasQuerySymbol = this.url.includes('?');
    if (!hasQuerySymbol && lastChar !== '&') {
      return `${this.url}?${query}`;
    } else {
      return `${this.url}&${query}`;
    }
  };

  protected readonly generatePopulateDeep = (options: PopulateDeepOptions[]): string => {
    let urlString = '';
    options.map((q) => {
      const manipulatedPath = stringToArray(q.path);
      let partialQuery = '';
      if (Array.isArray(manipulatedPath)) {
        manipulatedPath.map((path, i) => {
          partialQuery += i === 0 ? `populate[${path}]` : `[populate][${path}]`;
        });
      }

      if (q.fields) {
        q.fields.map((field, i) => {
          urlString +=
            i === 0 && urlString === '' ?
              `${partialQuery}[fields][${i}]=${field}` :
              `&${partialQuery}[fields][${i}]=${field}`;
        });
      }

      if (q.children === '*') {
        urlString += `&${partialQuery}[populate]=%2A`;
      }

      if (q.children && q.children !== '*') {
        const partialQuery2 = partialQuery;
        let someQuery = '';
        q.children.map((child) => {
          if (!child.fields) {
            urlString += `&${partialQuery2}[populate][${child.key}]=%2A`;
          } else {
            child.fields.map((field, ind) => {
              someQuery += `&${partialQuery2}[populate][${child.key}][fields][${ind}]=${field}`;
            });
          }

          urlString += `${someQuery}`;
        });
      }
    });

    return this.handleUrl(stringify(parse(urlString)));
  };
}
