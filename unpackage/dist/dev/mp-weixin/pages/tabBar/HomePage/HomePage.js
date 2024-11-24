"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const stores_canteen = require("../../../stores/canteen.js");
if (!Array) {
  const _easycom_CanteenPicker2 = common_vendor.resolveComponent("CanteenPicker");
  _easycom_CanteenPicker2();
}
const _easycom_CanteenPicker = () => "../../../components/CanteenPicker/CanteenPicker.js";
if (!Math) {
  _easycom_CanteenPicker();
}
const _sfc_main = {
  __name: "HomePage",
  setup(__props) {
    const store = stores_canteen.useCanteenStore();
    common_vendor.ref(null);
    common_vendor.onMounted(() => {
    });
    const go = (path, type) => {
      if (type && !getFood()) {
        common_vendor.index.showToast({
          title: "非内部员工不可使用",
          icon: "none"
        });
      } else {
        common_vendor.index.navigateTo({
          url: path
        });
      }
    };
    const getFood = () => {
      const result = common_vendor.index.getStorageSync("userInfo");
      if (result && result.sysUser) {
        store.setUserIdentityName(result.sysUser.userIdentityName);
      }
      if (!common_vendor.index.getStorageSync("token") || store.userIdentityName === "外来人员") {
        return false;
      }
      return true;
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.sr("canteenPicker", "6a9da885-0"),
        b: common_vendor.p({
          uiconShow: false,
          position: "absolute"
        }),
        c: common_assets._imports_0,
        d: common_assets._imports_1,
        e: common_vendor.o(($event) => go("/packageB/RealTime/RealTime")),
        f: common_assets._imports_2,
        g: common_vendor.o(($event) => go("/packageB/canteen/DiningView")),
        h: common_assets._imports_3,
        i: common_vendor.o(($event) => go("/packageB/subscribe/index", 1)),
        j: common_vendor.o(($event) => go("/pagesA/teaching/detailsList")),
        k: common_assets._imports_4,
        l: common_vendor.o(($event) => go("/pagesA/regimen/index")),
        m: common_assets._imports_5
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6a9da885"]]);
wx.createPage(MiniProgramPage);
