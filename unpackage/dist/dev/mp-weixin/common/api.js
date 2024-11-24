"use strict";
const utils_http = require("../utils/http.js");
const listCanteenForOption = (params, config = {}) => utils_http.http.get(
  "/system/canteen/listCanteenForOption",
  {
    params
  },
  config
);
exports.listCanteenForOption = listCanteenForOption;
