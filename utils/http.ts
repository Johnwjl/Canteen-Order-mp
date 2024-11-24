import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import {
  HttpConfig,
  RequestOptions,
  HttpResponse,
  Interceptors,
  ErrorType,
  ProgressEvent
} from "./types";
import {
  HttpError,
  RequestQueue,
  CacheManager,
  CancelTokenManager,
  LoadingManager
} from "./classes";

// 状态管理
export const progress = ref(0);
export const uploadProgress = ref(0);
export const downloadProgress = ref(0);

// 默认配置
const defaultConfig: HttpConfig = {
  baseURL: "",
  timeout: 30000,
  retryTimes: 3,
  retryDelay: 1000,
  enableCache: false,
  cacheTime: 60000,
  withCredentials: false,
  validateStatus: (status: number) => status >= 200 && status < 300,
};

// 错误处理中间件
const errorMiddleware = {
  [ErrorType.NETWORK]: (error: Error) => {
    uni.showToast({
      title: '网络连接失败，请检查网络设置',
      icon: 'none',
      duration: 2000
    });
    return new HttpError(error.message, ErrorType.NETWORK);
  },

  [ErrorType.TIMEOUT]: () => {
    uni.showToast({
      title: '请求超时，请重试',
      icon: 'none',
      duration: 2000
    });
    return new HttpError('请求超时', ErrorType.TIMEOUT);
  },

  [ErrorType.UNAUTHORIZED]: () => {
    uni.showToast({
      title: '登录已失效，请重新登录',
      icon: 'none',
      duration: 2000
    });
    uni.navigateTo({ url: '/pages/login/login' });
    return new HttpError('未授权', ErrorType.UNAUTHORIZED);
  }
};

export const useHttp = (customConfig: Partial<HttpConfig> = {}) => {
  // 合并配置
  const config: HttpConfig = { ...defaultConfig, ...customConfig };

  // 初始化管理器
  const requestQueue = new RequestQueue();
  const cacheManager = new CacheManager();
  const cancelTokenManager = new CancelTokenManager();
  const loadingManager = new LoadingManager();

  // 拦截器
  const interceptors: Interceptors = {
    request: [],
    response: [],
    error: [],
  };

  // 定期清理缓存
  const startCacheCleanup = () => {
    setInterval(() => {
      cacheManager.clearExpired();
    }, 60000);
  };
  startCacheCleanup();

  // 添加拦截器
  const addInterceptor = <T extends keyof Interceptors>(
    type: T,
    callback: Interceptors[T][number]
  ) => {
    interceptors[type].push(callback);
    return () => {
      const index = interceptors[type].indexOf(callback);
      if (index !== -1) {
        interceptors[type].splice(index, 1);
      }
    };
  };

  // 运行拦截器
  const runInterceptors = async <T>(type: keyof Interceptors, data: T): Promise<T> => {
    let result = data;
    for (const interceptor of interceptors[type]) {
      result = await interceptor(result);
    }
    return result;
  };

  // 生成缓存键
  const generateCacheKey = (url: string, method: string, data: any): string =>
    `${method}:${url}:${JSON.stringify(data)}`;

  // 重试机制
  const retry = async <T>(
    fn: () => Promise<T>,
    times: number,
    delay: number
  ): Promise<T> => {
    try {
      return await fn();
    } catch (err) {
      if (times === 0) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, times - 1, delay);
    }
  };

  // 核心请求方法
  const request = async <T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const {
      method = "GET",
      data = {},
      headers = {},
      useCache = config.enableCache,
      customCacheTime = config.cacheTime,
      withRetry = true,
      showLoadingUI = true,
      onProgressUpdate,
    } = options;

    const fullURL = url.startsWith("http") ? url : `${config.baseURL}${url}`;
    const requestId = uuidv4();
    const requestKey = generateCacheKey(fullURL, method, data);

    // 检查重复请求
    if (requestQueue.has(requestKey)) {
      return requestQueue.get(requestKey)!;
    }

    // 检查缓存
    if (useCache && method === "GET") {
      const cachedData = cacheManager.get(requestKey);
      if (cachedData) return cachedData;
    }

    // 创建取消令牌
    const controller = cancelTokenManager.create(requestId);

    // 显示加载UI
    if (showLoadingUI) {
      loadingManager.show(requestId);
    }

    const executeRequest = async (): Promise<T> => {
      try {
        // 运行请求拦截器
        const requestConfig = await runInterceptors("request", {
          url: fullURL,
          method,
          data,
          headers,
        });

        const requestPromise = new Promise<T>((resolve, reject) => {
          uni.request({
            ...requestConfig,
            timeout: config.timeout,
            success: async (res: any) => {
              const response = await runInterceptors("response", res);
              
              if (config.validateStatus(response.statusCode)) {
                if (useCache && method === "GET") {
                  cacheManager.set(requestKey, response.data, customCacheTime);
                }
                resolve(response.data);
              } else if (response.statusCode === 401) {
                reject(errorMiddleware[ErrorType.UNAUTHORIZED]());
              } else {
                reject(
                  new HttpError(
                    response.data?.message || `HTTP Error: ${response.statusCode}`,
                    ErrorType.BUSINESS,
                    response
                  )
                );
              }
            },
            fail: (error) => reject(errorMiddleware[ErrorType.NETWORK](error)),
            complete: () => {
              if (showLoadingUI) {
                loadingManager.hide(requestId);
              }
              cancelTokenManager.cancel(requestId);
              requestQueue.remove(requestKey);
            },
            onProgressUpdate: onProgressUpdate
              ? (res: ProgressEvent) => {
                  progress.value = res.progress;
                  if (res.totalBytesWritten) {
                    uploadProgress.value = res.progress;
                  }
                  if (res.totalBytesReceived) {
                    downloadProgress.value = res.progress;
                  }
                  onProgressUpdate(res);
                }
              : undefined,
          });
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => {
            reject(errorMiddleware[ErrorType.TIMEOUT]());
            controller.abort();
          }, config.timeout)
        );

        return Promise.race([requestPromise, timeoutPromise]);
      } catch (error) {
        throw await runInterceptors("error", error);
      }
    };

    const requestPromise = withRetry
      ? retry(() => executeRequest(), config.retryTimes, config.retryDelay)
      : executeRequest();

    return requestQueue.add(requestKey, requestPromise);
  };

  // HTTP 方法别名
  const get = <T = any>(url: string, params = {}, options = {}) =>
    request<T>(url, { method: "GET", data: params, ...options });

  const post = <T = any>(url: string, data = {}, options = {}) =>
    request<T>(url, { method: "POST", data, ...options });

  const put = <T = any>(url: string, data = {}, options = {}) =>
    request<T>(url, { method: "PUT", data, ...options });

  const del = <T = any>(url: string, params = {}, options = {}) =>
    request<T>(url, { method: "DELETE", data: params, ...options });

  return {
    request,
    get,
    post,
    put,
    del,
    addInterceptor,
    cancelRequest: (requestId: string) => cancelTokenManager.cancel(requestId),
    cancelAllRequests: () => cancelTokenManager.cancelAll(),
    clearCache: () => cacheManager.clear(),
    isLoading: loadingManager.isLoading,
  };
};

// 导出工具方法
export const createHttp = (config?: Partial<HttpConfig>) => useHttp(config); 