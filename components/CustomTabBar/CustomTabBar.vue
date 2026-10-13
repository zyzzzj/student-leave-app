<template>
	<view class="custom-tab-bar">
		<view 
			v-for="(item, index) in tabList" 
			:key="index" 
			class="tab-item"
			:class="{ active: currentIndex === index }"
			@click="switchTab(index)"
		>
			<text class="tab-icon">{{ item.icon }}</text>
			<text class="tab-text">{{ item.text }}</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'CustomTabBar',
	data() {
		return {
			currentIndex: 0,
			tabList: [
				{
					pagePath: '/pages/index/index',
					text: '首页',
					icon: '🏠',
					activeIcon: '🏠'
				},
				{
					pagePath: '/pages/record/record',
					text: '记录',
					icon: '📋',
					activeIcon: '📋'
				},
				{
					pagePath: '/pages/message/message',
					text: '消息',
					icon: '💬',
					activeIcon: '💬'
				},
				{
					pagePath: '/pages/profile/profile',
					text: '我的',
					icon: '👤',
					activeIcon: '👤'
				}
			]
		}
	},
	methods: {
		switchTab(index) {
			if (this.currentIndex === index) return
			
			this.currentIndex = index
			const item = this.tabList[index]
			
			uni.switchTab({
				url: item.pagePath
			})
		},
		
		// 设置当前激活的 tab
		setActive(index) {
			this.currentIndex = index
		}
	}
}
</script>

<style scoped>
.custom-tab-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100rpx;
	background-color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: space-around;
	border-top: 1rpx solid #e0e0e0;
	z-index: 999;
	padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.tab-item.active .tab-icon {
	transform: scale(1.1);
}

.tab-item.active .tab-text {
	color: #4A90E2;
	font-weight: 600;
}

.tab-icon {
	font-size: 40rpx;
	line-height: 1;
	margin-bottom: 6rpx;
	transition: transform 0.2s;
}

.tab-text {
	font-size: 22rpx;
	color: #999999;
	transition: color 0.2s;
}
</style>