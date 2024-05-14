import {StrapiClient} from './lib/strapi-client';
import {StrapiClientOptions} from './lib/types/base';


const defaultOptions: StrapiClientOptions = {
  url: '',
  normalizeData: true,
};

const createClient = (options: StrapiClientOptions): StrapiClient => new StrapiClient({...defaultOptions, ...options});

export {createClient, StrapiClient};

export type {
  StrapiUnifiedResponse,
  StrapiTimestamp,
  StrapiPopulatedResponse,
  StrapiClientOptions,
} from './lib/types/base';

export type {SignInCredentials, SignUpCredentials} from './lib/types/auth';

export type {StrapiImage} from './lib/types/image';

export * from './lib/strapi-query-builder';

export * from './lib/strapi-filter-builder';
