<template>
	<view class="container">
		<CanteenPicker ref="canteenPicker" :uiconShow="false" :position="'absolute'" />
		<header class="banner">
			<image class="bannerBG" src="../../../static/imgs/home/bannerBG.png" lazy-load="true" mode="aspectFill">
			</image>
			<view class="content">
				<view class="banner-title">智慧食堂</view>
				<view class="banner-title-1">自助取菜用餐新体验</view>
			</view>
		</header>
		<view class="menu">
			<view class="menu-item align-items-end" @click="go('/packageB/RealTime/RealTime')">
				<image class="img" src="@/static/imgs/home/RealTime.png" mode="widthFix" alt="就餐详情" />
			</view>
			<view class="menu-item align-items-end" @click="go('/packageB/canteen/DiningView')">
				<image class="img" src="@/static/imgs/home/DiningView.png" mode="widthFix" alt="本周菜谱" />
			</view>
			<view class="menu-item" @click="go('/packageB/subscribe/index', 1)">
				<image class="img" src="@/static/imgs/home/subscribe.png" mode="widthFix" alt="预定美食" />
			</view>
			<view class="menu-item menu-item1">
				<image class="img" @click="go('/pagesA/teaching/detailsList')" src="@/static/imgs/home/teaching.png"
					mode="widthFix" alt="美食教学" />
				<image class="img" @click="go('/pagesA/regimen/index')" src="@/static/imgs/home/regimen.png"
					mode="widthFix" alt="中医养生" />
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		useCanteenStore
	} from '@/stores/canteen';
	// import canteenPicker from '@/components/CanteenPicker/CanteenPicker.vue';

	const store = useCanteenStore();
	const canteenPickerRef = ref(null);

	// 页面显示时触发
	onMounted(() => {
		// if (!store.canteenName && uni.getStorageSync('token')) {
		// 	canteenPickerRef.value.listCanteenForOption();
		// }
	});

	// 跳转页面
	const go = (path, type) => {
		if (type && !getFood()) {
			uni.showToast({
				title: '非内部员工不可使用',
				icon: 'none',
			});
		} else {
			uni.navigateTo({
				url: path
			});
		}
	};

	// 校验是否为内部员工
	const getFood = () => {
		const result = uni.getStorageSync('userInfo');
		if (result && result.sysUser) {
			store.setUserIdentityName(result.sysUser.userIdentityName);
		}
		if (!uni.getStorageSync('token') || store.userIdentityName === '外来人员') {
			return false;
		}
		return true;
	};
</script>

<style lang="scss" scoped>
	.container {
		// 使用CSS变量存储关键值
		--container-height: calc(100vh - var(--window-bottom));
		--banner-height: 40%;
		--menu-height: 60%;
		--primary-color: #149b05;
		--secondary-color: #5ea616;


		width: 100vw;
		height: var(--container-height);
		display: flex;
		flex-direction: column;

		.banner {
			position: relative;
			height: var(--banner-height);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			.bannerBG {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}

			.content {
				position: relative;
				/* 默认层级高于背景 */
				z-index: 1;

				.banner-title {
					font-size: 42px;
					font-family: PingFang SC-Heavy, PingFang SC;
					font-weight: 800;
					color: var(--primary-color);
					// 添加文字阴影提升可读性
					text-shadow: 5px 9px 9px #7cb287;
				}

				.banner-title-1 {
					display: flex;
					justify-content: center;
					align-items: center;
					background: var(--secondary-color);
					border-radius: 15px 15px 15px 15px;
					color: #fff;
					font-size: 12px;
					padding: 5px 20px;
				}
			}


		}

		.menu {
			height: var(--menu-height);
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 0 20px;
			padding: 0 15rpx;
			margin-top: -15px;
			border-radius: 25px 25px 0 0;
			box-shadow: 0 -12px 10px rgba(0, 0, 0, 0.2);
			background-color: #f5f5f5;
			overflow-y: auto;
			z-index: 1;

			.menu-item {
				// box-shadow: 4px 4px 12px 0 rgba(0, 106, 72, 0.12);
				// border-radius: 25px;
				display: flex;
				justify-content: center;
				align-items: center;

				&.align-items-end {
					align-items: flex-end;
				}

				.img {
					width: 100%;
					object-fit: contain;
				}

			}

			.menu-item1 {
				display: flex;
				flex-direction: column;
				justify-content: space-evenly;
			}

		}
	}
</style>