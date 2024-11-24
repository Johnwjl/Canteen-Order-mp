"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_canteen = require("../../stores/canteen.js");
const common_api = require("../../common/api.js");
const _sfc_main = {
  __name: "CanteenPicker",
  props: {
    uiconShow: {
      type: Boolean,
      default: true
    },
    locationShow: {
      type: Boolean,
      default: true
    },
    bgc: {
      type: String,
      default: ""
    },
    bacColor: {
      type: String,
      default: "#272727"
    },
    position: {
      type: String,
      default: "none"
    }
  },
  setup(__props) {
    const store = stores_canteen.useCanteenStore();
    const props = __props;
    const show = common_vendor.ref(false);
    const columns = common_vendor.ref([]);
    const menuButtonTop = common_vendor.ref(0);
    common_vendor.computed(() => store.canteenName);
    const navbarHeight = common_vendor.computed(() => store.navbarHeight);
    const showPic = () => {
      if (props.locationShow) {
        show.value = true;
      }
    };
    const fetchCanteens = async () => {
      var _a;
      const res = await common_api.listCanteenForOption();
      columns.value = [res.data];
      if (!store.canteenName) {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        const defaultCanteenId = (_a = userInfo == null ? void 0 : userInfo.sysUser) == null ? void 0 : _a.defaultCanteenId;
        if (defaultCanteenId) {
          const defaultCanteen = res.data.find((item) => item.id === defaultCanteenId);
          store.setCanteenId(defaultCanteenId);
          store.setCanteenName((defaultCanteen == null ? void 0 : defaultCanteen.canteenName) || "");
        } else {
          const firstCanteen = res.data[0];
          store.setCanteenId((firstCanteen == null ? void 0 : firstCanteen.id) || "");
          store.setCanteenName((firstCanteen == null ? void 0 : firstCanteen.canteenName) || "");
        }
      }
    };
    common_vendor.onMounted(() => {
      if (common_vendor.wx$1.getMenuButtonBoundingClientRect) {
        const rect = common_vendor.wx$1.getMenuButtonBoundingClientRect();
        console.log("菜单按钮位置信息：", rect);
        menuButtonTop.value = rect.top + rect.height / 4;
      } else {
        console.warn("wx.getMenuButtonBoundingClientRect 不可用");
      }
      if (common_vendor.index.getStorageSync("token")) {
        fetchCanteens();
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.s("top:" + menuButtonTop.value + "px"),
        b: common_vendor.o(showPic),
        c: common_vendor.s("height:" + navbarHeight.value + "rpx; background:" + __props.bgc + "; position:" + __props.position)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-60037266"]]);
wx.createComponent(Component);
