// 创建实例
const http = createHttp({
  baseURL: 'https://api.example.com',
  enableCache: true
});

// 添加请求拦截器
http.addInterceptor('request', async (config) => {
  const token = uni.getStorageSync('token');
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
});

// 添加响应拦截器
http.addInterceptor('response', async (response) => {
  // 处理响应数据
  return response;
});

// 类型化请求
interface User {
  id: number;
  name: string;
  email: string;
}

const getUser = async (id: number) => {
  try {
    const user = await http.get<User>(`/users/${id}`);
    return user;
  } catch (error) {
    if (error instanceof HttpError) {
      console.error(`错误类型: ${error.code}, 信息: ${error.message}`);
    }
    throw error;
  }
};

// 带进度监控的上传
const uploadFile = async (file: any) => {
  try {
    const result = await http.post('/upload', file, {
      onProgressUpdate: (res) => {
        console.log('上传进度：', res.progress);
      }
    });
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}; 