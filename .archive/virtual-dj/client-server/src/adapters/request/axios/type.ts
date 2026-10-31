import type { AxiosRequestConfig, AxiosResponse as AxiosResponseType } from 'axios';
import type { HttpsProxyAgent } from 'https-proxy-agent';

export type Agent = HttpsProxyAgent<string>;
export type Result<T> = ClientServer.Utilities.Trycatch.Result<Response<T>>;

export interface Request extends AxiosRequestConfig {
   agent?: Agent;
   hideToast?: boolean;
}

export interface Response<T> extends AxiosResponseType<T> {
   //
}

export type Make_Request = <T>(request: Request) => Promise<Result<T>>;
