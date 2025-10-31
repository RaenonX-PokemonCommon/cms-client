export type CrudOperators =
  | 'eq'
  | 'ne'
  | 'lt'
  | 'gt'
  | 'lte'
  | 'gte'
  | 'in'
  | 'notIn'
  | 'contains'
  | 'notContains'
  | 'containsi'
  | 'notContainsi'
  | 'between'
  | 'null'
  | 'notNull'
  | 'startsWith'
  | 'endsWith';

export type RelationalFilterOperators =
  | 'eq'
  | 'ne'
  | 'lt'
  | 'gt'
  | 'lte'
  | 'gte'
  | 'in'
  | 'notIn'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith';

export type CrudFilter<T> = {
  field: Extract<keyof T, string>,
  operator: CrudOperators,
  value: string | number | Array<string | number>,
};

export type CrudSort<T = any> = {
  field: Extract<keyof T, string>,
  order?: 'asc' | 'desc',
};

export type DeepFilterType = {
  path: Array<string>,
  operator: RelationalFilterOperators,
  value: string | number | Array<string | number>,
};

export type OrFilterCondition = {
  path: string,
  operator: RelationalFilterOperators,
  value: string | number | Array<string | number>,
};

type DeepChild = {
  key: string,
  fields?: string[],
};

export type PopulateDeepOptions = {
  path: string,
  fields?: string[],
  children?: DeepChild[] | '*',
};

export declare type CrudSorting<T = any> = CrudSort<T>[];

export type CrudFilters<T> = Array<CrudFilter<T>>;
