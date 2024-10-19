import {stringify, parse} from 'qs';


export function generateQueryString(obj: object): string {
  return stringify(obj, {encodeValuesOnly: true, addQueryPrefix: true});
}

export function generateQueryFromRawString(rawQuery: string): string {
  return stringify(parse(rawQuery), {encodeValuesOnly: true});
}

export const isBrowser = () => typeof window !== 'undefined';

export const stringToArray = (value: string): string[] => value.split('.');
