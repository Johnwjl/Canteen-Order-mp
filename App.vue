<script setup>
	import {
		onLaunch,
		onShow,
		onHide
	} from '@dcloudio/uni-app';

	// 生命周期钩子
	onLaunch(() => {
		console.log('App Launch');
	});

	onShow(() => {
		console.log('App Show');
	});

	onHide(() => {
		console.log('App Hide');
	});
</script>

<style lang="scss">
	/* 每个页面公共 CSS */
	@import '@/uni_modules/uni-scss/index.scss';

	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';

	/* 设置整个项目的背景色 */
	page {
		background-color: #f5f5f5;
	}

	/* #endif */
</style>