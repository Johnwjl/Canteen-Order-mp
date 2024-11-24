// 类型定义
export interface HttpConfig {
  baseURL: string;
  timeout: number;
  retryTimes: number;
  retryDelay: number;
  enableCache: boolean;
  cacheTime: number;
  withCredentials: boolean;
  validateStatus: (status: number) => boolean;
}

export interface RequestOptions {
  method?: string;
  data?: any;
  headers?: Record<string, string>;
  useCache?: boolean;
  customCacheTime?: number;
  withRetry?: boolean;
  showLoadingUI?: boolean;
  onProgressUpdate?: (res: ProgressEvent) => void;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ProgressEvent {
  progress: number;
  totalBytesWritten?: number;
  totalBytesExpectedToWrite?: number;
  totalBytesReceived?: number;
  totalBytesExpectedToReceive?: number;
}

export type RequestInterceptor = (config: RequestOptions) => Promise<RequestOptions>;
export type ResponseInterceptor = (response: HttpResponse) => Promise<HttpResponse>;
export type ErrorInterceptor = (error: HttpError) => Promise<never>;

export interface Interceptors {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
  error: ErrorInterceptor[];
}

export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  BUSINESS = 'BUSINESS_ERROR',
  CANCEL = 'CANCEL_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED'
} 