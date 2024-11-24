import {
	http
} from '@/utils/http.js';
// 获取菜单
export const fetchMenu = (params, config = {}) => http.post('/ebapi/public_api/index', params, config)

//验证
export const sendPhoneCode = params => http.get(`/api/sendPhoneCode?phone=${params}`)

//普通用户登录注册
export const doRegister = (params, config = {}) => http.post('/api/wxAuthorion/doRegister', params, config)

//内部员工登录
export const doBindAndLoginIn = (params, config = {}) => http.post('/api/wxAuthorion/doBindAndLoginIn', params, config)

//登录
export const doTryLogin = (params, config = {}) => http.post('/api/wxAuthorion/doTryLogin', params, config)

//首页信息
export const getMyHomeInfo = (params, config = {}) => http.get('/system/user/getMyHomeInfo', params, config)

//食堂下拉
export const listCanteenForOption = (params, config = {}) => http.get(
	'/system/canteen/listCanteenForOption', {
		params
	},
	config)

//摄像头
export const getCameraList = canteenId => http.get(`/LAPI/getCameraList?canteenId	=${canteenId}`)

//获取手机号
export const getPhoneNumber = (params, config = {}) => http.post('/api/wxAuthorion/getPhoneNumber', params, config)

//获取菜品
export const listForDay = (params, config = {}) => http.get('/food/foodPriceDay/listForDay', {
	params
}, config)

// 已订美食
export const getMyOrderList = (params, config = {}) => http.get('/reservationa/order/getMyOrderList', {
		params
	},
	config)

//预售美食
export const listForSale = (params, config = {}) => http.get('/food/reservationaFoods/listForSale', {
	params
}, config)

//下单
export const saveNewReservationaOrder = (params, config = {}) => http.post(
	'/reservationa/order/saveNewReservationaOrder', params, config)

// 取消订单
export const updateCancalOrder = (params, config = {}) => http.post('/reservationa/order/updateCancalOrder', params,
	config)

//退出
export const doUnBind = (params, config = {}) => http.post('/system/member/doUnBind', params, config)

//绑定的市民卡列表
export const listCitizenCardListByUser = (params, config = {}) => http.get(
	'/system/member/listCitizenCardListByUser', {
		params
	}, config)

//新增市民卡
export const addCitizenCard = (params, config = {}) => http.post('/system/member/addCitizenCard', params, config)

//解绑
export const delCitizenCard = (params, config = {}) => http.delete('/system/member/delCitizenCard?id=' + params.id, {},
	config)

//支付
export const doCreateOrder = (params, config = {}) => http.post('/pay/doCreateOrder', params, config)

//反馈列表
export const myFeedbackList = (params, config = {}) => http.get('/member/feedback/myFeedbackList', {
	params
}, config)

//新增反馈
export const feedback = (params, config = {}) => http.post('/member/feedback', params, config)

//二维码
export const getMyPayCode = (params, config = {}) => http.get('/system/member/getMyPayCode', {
	params
}, config)

//卡券二维码
export const getMyVoucherQrCode = (params, config = {}) => http.get('/voucher/getMyVoucherQrCode', {
	params
}, config)

//个人照片
export const updateMyPhotograph = (params, config = {}) => http.post('/system/member/updateMyPhotograph', params,
	config)

//获取照片
export const getMyPhotograph = (params, config = {}) => http.get('/system/member/getMyPhotograph', {
	params
}, config)

//修改手机号
export const updateMyPhoneNumber = (params, config = {}) => http.post('/system/member/updateMyPhoneNumber', params,
	config)

//人数统计
export const getPersonStatisticsByCanteenId = (params, config = {}) => http.get(
	'/api/canteen/getPersonStatisticsByCanteenId', {
		params
	}, config)

//监控
export const getCameraListForShow = (params, config = {}) => http.get('/LAPI/getCameraListForShow', {
	params
}, config)

export const getSicknessRestraint = (params, config = {}) => http.post('/sicknessRestraint/list', params, config)

export const sicknessRestraintInfo = (params, config = {}) => http.post('/sicknessRestraint/info', params, config)

export const baseQuestionareList = (params, config = {}) => http.post('/system/baseQuestionare/listW', params, config)

export const baseQuestionareAdd = (params, config = {}) => http.post('/baseQuestionareRecord/add', params, config)

export const baseQuestionareRecordList = (params, config = {}) => http.post('/baseQuestionareRecord/list', params,
	config)