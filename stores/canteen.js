import {
	defineStore
} from 'pinia';

export const useCanteenStore = defineStore('canteen', {
	state: () => ({
		canteenId: '',
		canteenName: '',
		userIdentityName: '',
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
		},
	},
});