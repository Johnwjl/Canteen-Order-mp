"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "https://your-api-base-url.com";
let loadingCount = 0;
const hideLoading = () => {
  loadingCount--;
  if (loadingCount === 0) {
    common_vendor.index.hideLoading();
  }
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function request({
  url,
  method,
  data,
  header,
  retries,
  delayMs,
  showLoading
}) {
  if (showLoading)
    showLoading();
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const response = await new Promise((resolve, reject) => {
        common_vendor.index.request({
          url,
          method,
          data,
          header,
          success: resolve,
          fail: reject
        });
      });
      if (response.statusCode === 200) {
        return response.data;
      } else {
        throw new Error(`HTTP ${response.statusCode}: ${response.data.message || "Unknown error"}`);
      }
    } catch (error) {
      attempt++;
      if (attempt > retries) {
        throw error;
      }
      console.warn(`Retrying request (${attempt}/${retries})...`);
      await delay(delayMs);
    }
  }
}
const http = ["get", "post", "put", "delete"].reduce((api, method) => {
  api[method] = async (url, data = {}, options = {}) => {
    const {
      retries = 3,
      delayMs = 1e3,
      showLoading: show = true
    } = options;
    const header = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${common_vendor.index.getStorageSync("token") || ""}`
    };
    try {
      return await request({
        url: `${BASE_URL}${url}`,
        method: method.toUpperCase(),
        data: method === "get" || method === "delete" ? data : JSON.stringify(data),
        header,
        retries,
        delayMs,
        showLoading: show
      });
    } catch (error) {
      console.error(`${method.toUpperCase()} request failed:`, error);
      common_vendor.index.showToast({
        title: "请求失败，请重试",
        icon: "none"
      });
      throw error;
    } finally {
      if (show)
        hideLoading();
    }
  };
  return api;
}, {});
exports.http = http;
