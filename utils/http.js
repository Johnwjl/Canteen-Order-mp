const BASE_URL = 'https://your-api-base-url.com'; // 替换为你的实际接口地址

// 全局 Loading 状态
let loadingCount = 0;

// 显示 Loading
const showLoading = () => {
	if (loadingCount === 0) {
		uni.showLoading({
			title: '加载中',
			mask: true
		});
	}
	loadingCount++;
};

// 隐藏 Loading
const hideLoading = () => {
	loadingCount--;
	if (loadingCount === 0) {
		uni.hideLoading();
	}
};

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 通用请求函数
async function request({
	url,
	method,
	data,
	header,
	retries,
	delayMs,
	showLoading
}) {
	if (showLoading) showLoading();

	let attempt = 0;

	while (attempt <= retries) {
		try {
			const response = await new Promise((resolve, reject) => {
				uni.request({
					url,
					method,
					data,
					header,
					success: resolve,
					fail: reject,
				});
			});

			if (response.statusCode === 200) {
				return response.data;
			} else {
				throw new Error(`HTTP ${response.statusCode}: ${response.data.message || 'Unknown error'}`);
			}
		} catch (error) {
			attempt++;
			if (attempt > retries) {
				throw error; // 抛出最终失败的错误
			}
			console.warn(`Retrying request (${attempt}/${retries})...`);
			await delay(delayMs);
		}
	}
}

// 封装 http 方法
const http = ['get', 'post', 'put', 'delete'].reduce((api, method) => {
	api[method] = async (url, data = {}, options = {}) => {
		const {
			retries = 3, delayMs = 1000, showLoading: show = true
		} = options;
		const header = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${uni.getStorageSync('token') || ''}`,
		};

		try {
			return await request({
				url: `${BASE_URL}${url}`,
				method: method.toUpperCase(),
				data: method === 'get' || method === 'delete' ? data : JSON.stringify(data),
				header,
				retries,
				delayMs,
				showLoading: show,
			});
		} catch (error) {
			console.error(`${method.toUpperCase()} request failed:`, error);
			uni.showToast({
				title: '请求失败，请重试',
				icon: 'none'
			});
			throw error;
		} finally {
			if (show) hideLoading();
		}
	};
	return api;
}, {});

export {
	http
};