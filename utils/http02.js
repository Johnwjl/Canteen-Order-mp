import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";

// 状态管理
export const isLoading = ref(false);
export const progress = ref(0);
export const uploadProgress = ref(0);
export const downloadProgress = ref(0);

// 全局存储
const loadingRequests = new Set();
const cacheMap = new Map();
const abortControllers = new Map();
const requestQueue = new Map();

// 拦截器
const interceptors = {
  request: [],
  response: [],
  error: [],
};

// 自定义错误类
class HttpError extends Error {
  constructor(message, code, data) {
    super(message);
    this.name = "HttpError";
    this.code = code;
    this.data = data;
  }
}

// 默认配置
const defaultConfig = {
  baseURL: "",
  timeout: 30000,
  retryTimes: 3,
  retryDelay: 1000,
  enableCache: false,
  cacheTime: 60000,
  withCredentials: false,
  validateStatus: (status) => status >= 200 && status < 300,
};

// 定期清理缓存
const scheduleCacheCleanup = () => {
  setInterval(() => {
    const now = Date.now();
    cacheMap.forEach((value, key) => {
      if (now - value.timestamp > value.cacheTime) {
        cacheMap.delete(key);
      }
    });
  }, 60000);
};
scheduleCacheCleanup();

export const useHttp = (customConfig = {}) => {
  // 合并配置
  const config = {
    ...defaultConfig,
    ...customConfig,
  };

  const { baseURL, timeout, retryTimes, retryDelay, enableCache, cacheTime } =
    config;

  // 拦截器方法
  const addInterceptor = (type, callback) => {
    interceptors[type].push(callback);
    return () => {
      const index = interceptors[type].indexOf(callback);
      if (index !== -1) {
        interceptors[type].splice(index, 1);
      }
    };
  };

  // 运行拦截器
  const runInterceptors = async (type, data) => {
    let result = data;
    for (const interceptor of interceptors[type]) {
      result = await interceptor(result);
    }
    return result;
  };

  // Loading 控制
  const showLoading = () => {
    if (loadingRequests.size === 0) {
      uni.showLoading({ title: "加载中...", mask: true });
    }
  };

  const hideLoading = () => {
    if (loadingRequests.size === 0) {
      uni.hideLoading();
    }
  };

  // 缓存相关
  const generateCacheKey = (url, method, data) =>
    `${method}:${url}:${JSON.stringify(data)}`;

  // 错误处理中间件
  const errorMiddleware = {
    networkError: (error) => {
      uni.showToast({
        title: "网络连接失败，请检查网络设置",
        icon: "none",
        duration: 2000,
      });
      return Promise.reject(
        new HttpError(error.message, "NETWORK_ERROR", error)
      );
    },

    businessError: (error) => {
      uni.showToast({
        title: error.message || "业务处理失败",
        icon: "none",
        duration: 2000,
      });
      return Promise.reject(
        new HttpError(error.message, "BUSINESS_ERROR", error)
      );
    },

    timeoutError: () => {
      uni.showToast({
        title: "请求超时，请重试",
        icon: "none",
        duration: 2000,
      });
      return Promise.reject(new HttpError("请求超时", "TIMEOUT_ERROR"));
    },
  };

  // 重试机制
  const retry = async (fn, times, delay) => {
    try {
      return await fn();
    } catch (err) {
      if (times === 0) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retry(fn, times - 1, delay);
    }
  };

  // 核心请求方法
  const request = async (url, options = {}) => {
    const {
      method = "GET",
      data = {},
      headers = {},
      useCache = enableCache,
      customCacheTime = cacheTime,
      withRetry = true,
      showLoadingUI = true,
      onProgressUpdate,
    } = options;

    const fullURL = url.startsWith("http") ? url : baseURL + url;
    const requestId = uuidv4();
    const requestKey = generateCacheKey(fullURL, method, data);

    // 防止重复请求
    if (requestQueue.has(requestKey)) {
      return requestQueue.get(requestKey);
    }

    // 创建取消控制器
    const controller = new AbortController();
    abortControllers.set(requestId, controller);

    // 检查缓存
    if (useCache && method === "GET") {
      const cached = cacheMap.get(requestKey);
      if (cached && Date.now() - cached.timestamp < cached.cacheTime) {
        return cached.data;
      }
    }

    // 显示加载UI
    if (showLoadingUI) {
      loadingRequests.add(requestId);
      isLoading.value = true;
      showLoading();
    }

    const executeRequest = async () => {
      try {
        // 运行请求拦截器
        const requestConfig = await runInterceptors("request", {
          url: fullURL,
          method,
          data,
          headers,
        });

        const requestPromise = new Promise((resolve, reject) => {
          uni.request({
            ...requestConfig,
            timeout,
            success: async (response) => {
              const { statusCode, data: resData } = response;

              // 运行响应拦截器
              const processedResponse = await runInterceptors(
                "response",
                response
              );

              if (statusCode >= 200 && statusCode < 300) {
                if (resData.code === 0 || resData.code === 200) {
                  // 设置缓存
                  if (useCache && method === "GET") {
                    cacheMap.set(requestKey, {
                      data: resData.data,
                      timestamp: Date.now(),
                      cacheTime: customCacheTime,
                    });
                  }
                  resolve(resData.data);
                } else {
                  reject(
                    await errorMiddleware.businessError(
                      new Error(resData.message)
                    )
                  );
                }
              } else if (statusCode === 401) {
                uni.showToast({
                  title: "登录已失效，请重新登录",
                  icon: "none",
                  duration: 2000,
                });
                uni.navigateTo({ url: "/pages/login/login" });
                reject(new HttpError("请先登录", "UNAUTHORIZED"));
              } else {
                reject(
                  new HttpError(
                    resData.message || `状态码错误: ${statusCode}`,
                    "HTTP_ERROR"
                  )
                );
              }
            },
            fail: (error) => reject(errorMiddleware.networkError(error)),
            complete: () => {
              loadingRequests.delete(requestId);
              abortControllers.delete(requestId);
              requestQueue.delete(requestKey);
              if (showLoadingUI) {
                isLoading.value = loadingRequests.size > 0;
                hideLoading();
              }
            },
            onProgressUpdate: onProgressUpdate
              ? (res) => {
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

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => {
            reject(errorMiddleware.timeoutError());
            controller.abort();
          }, timeout)
        );

        return Promise.race([requestPromise, timeoutPromise]);
      } catch (error) {
        return Promise.reject(error);
      }
    };

    const requestPromise = withRetry
      ? retry(() => executeRequest(), retryTimes, retryDelay)
      : executeRequest();

    requestQueue.set(requestKey, requestPromise);
    return requestPromise;
  };

  // HTTP 方法别名
  const get = (url, params = {}, options = {}) =>
    request(url, { method: "GET", data: params, ...options });

  const post = (url, data = {}, options = {}) =>
    request(url, { method: "POST", data, ...options });

  const put = (url, data = {}, options = {}) =>
    request(url, { method: "PUT", data, ...options });

  const del = (url, params = {}, options = {}) =>
    request(url, { method: "DELETE", data: params, ...options });

  // 请求控制方法
  const cancelRequest = (requestId) => {
    const controller = abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      abortControllers.delete(requestId);
    }
  };

  const cancelAllRequests = () => {
    abortControllers.forEach((controller) => controller.abort());
    abortControllers.clear();
  };

  return {
    request,
    get,
    post,
    put,
    del,
    cancelRequest,
    cancelAllRequests,
    addInterceptor,
  };
};

// 导出工具方法
export const clearHttpCache = () => cacheMap.clear();
