<template>
	<view class="page">
		<view class="container">
			<view class="profile-header card">
				<view class="user-info" @click="goEditProfile">
					<image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
					<view class="info-text">
						<text class="nickname">{{userInfo.nickname || '未设置昵称'}}</text>
						<text class="phone-text">{{userInfo.phone || '未设置手机号'}}</text>
					</view>
					<text class="edit-btn">编辑资料</text>
				</view>
			</view>
			
			<view class="menu-list card">
				<view class="menu-item" @click="goRecord">
					<view class="menu-left">
						<text class="menu-icon">📋</text>
						<text class="menu-text">请假记录</text>
					</view>
					<text class="menu-arrow">></text>
				</view>
				<view class="menu-item" @click="goMessage">
					<view class="menu-left">
						<text class="menu-icon">🔔</text>
						<text class="menu-text">消息通知</text>
					</view>
					<view class="menu-right">
						<text class="badge" v-if="unreadCount > 0">{{unreadCount}}</text>
						<text class="menu-arrow">></text>
					</view>
				</view>
				<view class="menu-item" @click="goEditProfile">
					<view class="menu-left">
						<text class="menu-icon">⚙️</text>
						<text class="menu-text">个人设置</text>
					</view>
					<text class="menu-arrow">></text>
				</view>
			</view>
			
			<view class="stats-section card">
				<text class="section-title">请假统计</text>
				<view class="stats-grid">
					<view class="stat-item">
						<text class="stat-num">{{stats.total}}</text>
						<text class="stat-label">总次数</text>
					</view>
					<view class="stat-item">
						<text class="stat-num pending">{{stats.pending}}</text>
						<text class="stat-label">待审核</text>
					</view>
					<view class="stat-item">
						<text class="stat-num approved">{{stats.approved}}</text>
						<text class="stat-label">已通过</text>
					</view>
					<view class="stat-item">
						<text class="stat-num rejected">{{stats.rejected}}</text>
						<text class="stat-label">已拒绝</text>
					</view>
				</view>
			</view>
			
			<button class="btn-logout" @click="handleLogout">退出登录</button>
		</view>
	</view>
</template>

<script>
import { leaveApi, messageApi } from '@/apis/index.js'
import { showConfirm } from '@/utils/format.js'

export default {
	data() {
		return {
			userInfo: {},
			unreadCount: 0,
			stats: {
				total: 0,
				pending: 0,
				approved: 0,
				rejected: 0
			}
		}
	},
	onShow() {
		this.loadUserInfo()
		this.loadStats()
	},
	methods: {
		loadUserInfo() {
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				this.userInfo = userInfo
			} else {
				uni.navigateTo({
					url: '/pages/login/login'
				})
			}
		},
		
		async loadStats() {
			try {
				const res = await leaveApi.getList({ page: 1, pageSize: 1 })
				if (res.code === 200) {
					this.stats = res.data.stats || this.stats
				}
			} catch (e) {
				console.error('加载统计失败', e)
			}
		},
		
		goEditProfile() {
			uni.navigateTo({
				url: '/pages/editProfile/editProfile'
			})
		},
		
		goRecord() {
			uni.switchTab({
				url: '/pages/record/record'
			})
		},
		
		goMessage() {
			uni.switchTab({
				url: '/pages/message/message'
			})
		},
		
		async handleLogout() {
			try {
				await showConfirm('确认退出登录？')
			} catch (e) {
				return
			}
			
			uni.removeStorageSync('token')
			uni.removeStorageSync('userInfo')
			uni.reLaunch({
				url: '/pages/login/login'
			})
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background-color: #F5F5F5;
	padding: 20rpx;
	padding-bottom: 120rpx;
}

.profile-header {
	padding: 40rpx;
}

.user-info {
	display: flex;
	align-items: center;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	margin-right: 30rpx;
}

.info-text {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.nickname {
	font-size: 34rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 10rpx;
}

.phone-text {
	font-size: 26rpx;
	color: #999999;
}

.edit-btn {
	font-size: 26rpx;
	color: #4A90E2;
}

.menu-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 0;
	border-bottom: 2rpx solid #F5F5F5;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-left {
	display: flex;
	align-items: center;
}

.menu-icon {
	font-size: 40rpx;
	margin-right: 20rpx;
}

.menu-text {
	font-size: 30rpx;
	color: #333333;
}

.menu-right {
	display: flex;
	align-items: center;
}

.badge {
	background-color: #FF4D4F;
	color: #ffffff;
	font-size: 20rpx;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	margin-right: 10rpx;
}

.menu-arrow {
	color: #CCCCCC;
	font-size: 32rpx;
}

.stats-section {
	padding: 30rpx;
}

.section-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 30rpx;
}

.stats-grid {
	display: flex;
	justify-content: space-around;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stat-num {
	font-size: 48rpx;
	font-weight: bold;
	color: #4A90E2;
}

.stat-num.pending {
	color: #FA8C16;
}

.stat-num.approved {
	color: #52C41A;
}

.stat-num.rejected {
	color: #FF4D4F;
}

.stat-label {
	font-size: 24rpx;
	color: #999999;
	margin-top: 10rpx;
}

.btn-logout {
	margin-top: 60rpx;
	background-color: #ffffff;
	color: #FF4D4F;
	border: 2rpx solid #FF4D4F;
	border-radius: 8rpx;
	font-size: 30rpx;
}
</style>