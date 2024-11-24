import { ref } from 'vue';

// 自定义错误类
export class HttpError extends Error {
  constructor(
    message: string,
    public code: ErrorType,
    public data?: any
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

// 请求队列管理类
export class RequestQueue {
  private queue = new Map<string, Promise<any>>();

  add(key: string, promise: Promise<any>) {
    this.queue.set(key, promise);
    return promise.finally(() => this.remove(key));
  }

  remove(key: string) {
    this.queue.delete(key);
  }

  has(key: string) {
    return this.queue.has(key);
  }

  get(key: string) {
    return this.queue.get(key);
  }

  clear() {
    this.queue.clear();
  }
}

// 缓存管理类
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; cacheTime: number }>();

  set(key: string, data: any, cacheTime: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      cacheTime
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.cacheTime) {
      return cached.data;
    }
    return null;
  }

  clear() {
    this.cache.clear();
  }

  clearExpired() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.cacheTime) {
        this.cache.delete(key);
      }
    }
  }
}

// 请求取消管理类
export class CancelTokenManager {
  private tokens = new Map<string, AbortController>();

  create(requestId: string) {
    const controller = new AbortController();
    this.tokens.set(requestId, controller);
    return controller;
  }

  cancel(requestId: string) {
    const controller = this.tokens.get(requestId);
    if (controller) {
      controller.abort();
      this.tokens.delete(requestId);
    }
  }

  cancelAll() {
    this.tokens.forEach(controller => controller.abort());
    this.tokens.clear();
  }
}

// Loading 状态管理类
export class LoadingManager {
  private requests = new Set<string>();
  private loading = ref(false);

  show(requestId: string) {
    this.requests.add(requestId);
    if (this.requests.size === 1) {
      this.loading.value = true;
      uni.showLoading({ title: "加载中...", mask: true });
    }
  }

  hide(requestId: string) {
    this.requests.delete(requestId);
    if (this.requests.size === 0) {
      this.loading.value = false;
      uni.hideLoading();
    }
  }

  get isLoading() {
    return this.loading;
  }
} 