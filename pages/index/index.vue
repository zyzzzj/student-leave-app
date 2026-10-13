<template>
	<view class="page">
		<view class="header">
			<view class="logo-area">
				<view class="logo">请假</view>
				<text class="app-name">学生请假管理</text>
			</view>
			<view class="user-info" v-if="userInfo" @click="goProfile">
				<image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
				<text class="username">{{userInfo.nickname || '同学'}}</text>
			</view>
		</view>
		
		<view class="container">
			<view class="quick-actions card">
				<text class="section-title">快捷操作</text>
				<view class="action-grid">
					<view class="action-item" @click="goApply">
						<view class="action-icon apply">
							<text class="icon">📝</text>
						</view>
						<text class="action-text">请假申请</text>
					</view>
					<view class="action-item" @click="goRecord">
						<view class="action-icon record">
							<text class="icon">📋</text>
						</view>
						<text class="action-text">请假记录</text>
					</view>
					<view class="action-item" @click="goMessage">
						<view class="action-icon message">
							<text class="icon">🔔</text>
						</view>
						<text class="action-text">消息通知</text>
					</view>
					<view class="action-item" @click="goProfile">
						<view class="action-icon profile">
							<text class="icon">👤</text>
						</view>
						<text class="action-text">个人中心</text>
					</view>
				</view>
			</view>
			
			<view class="stats card">
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
			
			<view class="recent card">
				<view class="section-header">
					<text class="section-title">最近请假</text>
					<text class="more" @click="goRecord">查看全部 ></text>
				</view>
				<view class="empty-state" v-if="recentList.length === 0">
					<text>暂无请假记录</text>
				</view>
				<view class="leave-item" v-for="item in recentList" :key="item.id" @click="goDetail(item.id)">
					<view class="leave-info">
						<view class="leave-header">
							<text class="leave-type">{{getLeaveTypeText(item.type)}}</text>
							<text :class="['status-tag', getStatusClass(item.status)]">{{getLeaveStatusText(item.status)}}</text>
						</view>
						<text class="leave-time">{{item.startTime}} ~ {{item.endTime}}</text>
						<text class="leave-reason">{{item.reason}}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getLeaveTypeText, getLeaveStatusText, getStatusClass } from '@/utils/format.js'
import { leaveApi } from '@/apis/index.js'

export default {
	data() {
		return {
			userInfo: null,
			stats: {
				total: 0,
				pending: 0,
				approved: 0,
				rejected: 0
			},
			recentList: []
		}
	},
	onShow() {
		this.loadUserInfo()
		this.loadData()
	},
	onPullDownRefresh() {
		this.loadData().then(() => {
			uni.stopPullDownRefresh()
		})
	},
	methods: {
		getLeaveTypeText,
		getLeaveStatusText,
		getStatusClass,
		
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
		
		async loadData() {
			try {
				const res = await leaveApi.getList({ page: 1, pageSize: 5 })
				if (res.code === 200) {
					this.recentList = res.data.list || []
					this.stats = res.data.stats || this.stats
				}
			} catch (e) {
				console.error('加载数据失败', e)
			}
		},
		
		goApply() {
			uni.navigateTo({
				url: '/pages/apply/apply'
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
		
		goProfile() {
			uni.switchTab({
				url: '/pages/profile/profile'
			})
		},
		
		goDetail(id) {
			uni.navigateTo({
				url: `/pages/detail/detail?id=${id}`
			})
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background-color: #F5F5F5;
	padding-bottom: 120rpx;
}

.header {
	background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
	padding: 40rpx 30rpx 60rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.logo-area {
	display: flex;
	align-items: center;
}

.logo {
	width: 80rpx;
	height: 80rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: bold;
	color: #4A90E2;
	margin-right: 20rpx;
}

.app-name {
	color: #ffffff;
	font-size: 36rpx;
	font-weight: bold;
}

.user-info {
	display: flex;
	align-items: center;
}

.avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	margin-right: 15rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.username {
	color: #ffffff;
	font-size: 28rpx;
}

.container {
	padding: 20rpx;
	margin-top: -40rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 20rpx;
	display: block;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.more {
	color: #4A90E2;
	font-size: 26rpx;
}

.action-grid {
	display: flex;
	justify-content: space-around;
}

.action-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx;
}

.action-icon {
	width: 100rpx;
	height: 100rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 15rpx;
}

.action-icon .icon {
	font-size: 48rpx;
}

.apply {
	background-color: #E6F7FF;
}

.record {
	background-color: #F6FFED;
}

.message {
	background-color: #FFF7E6;
}

.profile {
	background-color: #F9F0FF;
}

.action-text {
	font-size: 26rpx;
	color: #666666;
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

.leave-item {
	padding: 20rpx 0;
	border-bottom: 2rpx solid #F5F5F5;
}

.leave-item:last-child {
	border-bottom: none;
}

.leave-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.leave-type {
	font-size: 30rpx;
	font-weight: 500;
	color: #333333;
}

.leave-time {
	font-size: 24rpx;
	color: #999999;
	margin-bottom: 10rpx;
}

.leave-reason {
	font-size: 26rpx;
	color: #666666;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.empty-state {
	text-align: center;
	padding: 60rpx 0;
	color: #999999;
}
</style>