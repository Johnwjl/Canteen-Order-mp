"use strict";
const common_vendor = require("../common/vendor.js");
const useCanteenStore = common_vendor.defineStore("canteen", {
  state: () => ({
    canteenId: "",
    canteenName: "",
    userIdentityName: ""
  }),
  actions: {
    setCanteenId(id) {
      this.canteenId = id;
    },
    setCanteenName(name) {
      this.canteenName = name;
    },
    setUserIdentityName(name) {
      this.userIdentityName = name;
    }
  }
});
exports.useCanteenStore = useCanteenStore;
