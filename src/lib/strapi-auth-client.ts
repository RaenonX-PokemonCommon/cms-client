import {AxiosInstance} from 'axios';

import {endPoints, STORAGE_KEY} from './constants';
import {isBrowser} from './helpers';
import {polyfillGlobalThis} from './helpers/polyfills';
import {StrapiClientHelper} from './strapi-client-helper';
import {AuthData, Session, SignInCredentials, SignUpCredentials, User} from './types/auth';
import {StrapiApiError, StrapiApiResponse, StrapiClientOptions, SupportedStorage} from './types/base';


polyfillGlobalThis(); // Make "globalThis" available

const DEFAULT_OPTIONS = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
};

export class StrapiAuthClient extends StrapiClientHelper<AuthData> {
  #httpClient: AxiosInstance;

  protected localStorage: SupportedStorage;
  protected autoRefreshToken: boolean;
  protected persistSession: boolean;

  /**
   * The currently logged-in user or null.
   */
  protected currentUser: User | null;
  /**
   * The session object for the currently logged-in user or null.
   */
  protected currentSession: Session | null;

  constructor(axiosInstance: AxiosInstance, options: StrapiClientOptions) {
    const settings = {...DEFAULT_OPTIONS, ...options};
    super(settings.url);
    this.#httpClient = axiosInstance;
    this.currentUser = null;
    this.currentSession = null;
    this.autoRefreshToken = settings.autoRefreshToken;
    this.persistSession = settings.persistSession;
    this.localStorage = settings.localStorage || globalThis.localStorage;
  }

  readonly signIn = (
    credentials: SignInCredentials,
  ): Promise<StrapiApiResponse<AuthData>> => new Promise<StrapiApiResponse<AuthData>>((resolve) => {
    this.#httpClient
      .post<AuthData>(endPoints.auth.signIn, {
        identifier: credentials.email,
        password: credentials.password,
      })
      .then((res) => {
        this.#saveSession({
          access_token: res.data.jwt,
          user: res.data.user,
        });
        resolve({
          data: res.data,
        });
      })
      .catch((err) => {
        if (err) {
          return resolve(this.returnErrorHandler(err));
        }
      });
  });

  /**
   * Sign up a new user
   * @param {SignUpCredentials} credentials object contains username, email and password
   * @return {StrapiApiResponse<AuthData>} data and error objects, data object contains jwt, user and provider
   */
  readonly signUp = async (
    credentials: SignUpCredentials,
  ): Promise<StrapiApiResponse<AuthData>> => new Promise<StrapiApiResponse<AuthData>>((resolve) => {
    this.#httpClient
      .post<AuthData>(endPoints.auth.signUp, credentials)
      .then((res) => {
        resolve({data: res.data});
        this.#saveSession({
          access_token: res.data.jwt,
          user: res.data.user,
        });
      })
      .catch((err) => {
        if (err) {
          if (err) {
            return resolve(this.returnErrorHandler(err));
          }
        }
      });
  });

  readonly getMe = async (): Promise<StrapiApiResponse<User>> => new Promise<StrapiApiResponse<User>>((resolve) => {
    this.#httpClient
      .get<User>(endPoints.auth.getMe)
      .then((res) => {
        resolve({data: res.data});
      })
      .catch((err: any) => {
        if (err) {
          const error = err.response.data.error as StrapiApiError;
          return resolve({
            data: null,
            error,
          });
        }
      });
  });

  /**
   * Inside a browser context, `signOut()` will remove the logged-in user from the browser session
   * and log them out - removing all items from localstorage and then trigger a "SIGNED_OUT" event.
   *
   * For server-side management, you can disable sessions by passing a JWT through to `auth.api.signOut(JWT: string)`
   */
  readonly signOut = async (): Promise<{error: StrapiApiError | null}> => {
    const accessToken = this.currentSession?.access_token;
    await this.#removeSession();
    if (accessToken) {
      // const { error } = await this.api.signOut(accessToken);
      //  if (error) return { error };
    }
    return {error: null};
  };

  readonly #saveSession = (session: Session) => {
    this.currentSession = session;
    this.currentUser = session.user;
    if (this.persistSession) {
      this.#persistSession(this.currentSession);
    }
  };

  readonly #removeSession = async () => {
    this.currentSession = null;
    this.currentUser = null;
    //  if (this.refreshTokenTimer) clearTimeout(this.refreshTokenTimer)
    isBrowser() && (await this.localStorage.removeItem(STORAGE_KEY));
  };

  readonly #persistSession = (currentSession: Session) => {
    const data = {currentSession, expiresAt: currentSession.expires_at};
    isBrowser() && this.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };
}
