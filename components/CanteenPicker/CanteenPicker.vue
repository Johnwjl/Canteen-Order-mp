<template>
	<view style="position: sticky; top: 0; z-index: 999;">
		<view class="box" :style="'height:' + navbarHeight + 'rpx; background:' + bgc + '; position:' + position">
			<view class="banner-t" :style="'top:' + menuButtonTop + 'px'" @click="showPic">
				<!-- <view v-if="uiconShow" class="back" @click.stop="back">
					<u-icon size="38rpx" name="arrow-left" :color="bacColor"></u-icon>
				</view>
				<img v-if="locationShow" class="m-r4" style="width: 19px; height: 19px;"
					src="@/static/imgs/home/home6.png" alt="" />
				<view v-if="locationShow" class="m-r4">{{ canteenName }}</view> -->
				<!-- <u-icon v-if="locationShow" size="30rpx" name="arrow-down" color="#272727"></u-icon> -->
			</view>
		</view>
		<!-- <u-picker :show="show" :immediateChange="true" :columns="columns" keyName="canteenName" closeOnClickOverlay
			@close="show = false" @cancel="show = false" @confirm="confirm"></u-picker> -->
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue';
	import {
		useCanteenStore
	} from '@/stores/canteen';
	import {
		listCanteenForOption
	} from '@/common/api.js';

	const store = useCanteenStore();

	// Props
	const props = defineProps({
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
			default: ''
		},
		bacColor: {
			type: String,
			default: '#272727'
		},
		position: {
			type: String,
			default: 'none'
		},
	});

	// Data
	const show = ref(false);
	const columns = ref([]);
	const menuButtonTop = ref(0);

	// Computed properties
	const canteenName = computed(() => store.canteenName);
	const navbarHeight = computed(() => store.navbarHeight);

	// Methods
	const showPic = () => {
		if (props.locationShow) {
			show.value = true;
		}
	};

	const confirm = (e) => {
		store.setCanteenName(e.value[0].canteenName);
		store.setCanteenId(e.value[0].id);
		show.value = false;
	};

	const back = () => {
		uni.navigateBack();
	};

	const fetchCanteens = async () => {
		const res = await listCanteenForOption();
		columns.value = [res.data];

		if (!store.canteenName) {
			const userInfo = uni.getStorageSync('userInfo');
			const defaultCanteenId = userInfo?.sysUser?.defaultCanteenId;

			if (defaultCanteenId) {
				const defaultCanteen = res.data.find(item => item.id === defaultCanteenId);
				store.setCanteenId(defaultCanteenId);
				store.setCanteenName(defaultCanteen?.canteenName || '');
			} else {
				const firstCanteen = res.data[0];
				store.setCanteenId(firstCanteen?.id || '');
				store.setCanteenName(firstCanteen?.canteenName || '');
			}
		}
	};

	// Lifecycle hooks
	onMounted(() => {
		// 仅在微信小程序环境中执行
		/* #ifdef MP-WEIXIN */
		if (wx.getMenuButtonBoundingClientRect) {
			const rect = wx.getMenuButtonBoundingClientRect();
			console.log("菜单按钮位置信息：", rect);
			menuButtonTop.value = rect.top + rect.height / 4;
		} else {
			console.warn("wx.getMenuButtonBoundingClientRect 不可用");
		}
		/* #endif */

		if (uni.getStorageSync('token')) {
			fetchCanteens();
		}
	});
</script>

<style lang="scss" scoped>
	.box {
		width: 100%;

		.banner-t {
			display: flex;
			position: absolute;
			align-items: center;
			left: 30rpx;

			.m-r4 {
				margin-right: 4rpx;
			}

			.back {
				width: 60rpx;
			}
		}
	}
</style>