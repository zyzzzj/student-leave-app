<template>
	<view class="page">
		<view class="header">
			<text class="title">请假审核</text>
			<text class="logout" @click="handleLogout">退出</text>
		</view>
		
		<view class="stats">
			<view class="stat-item" @click="filterByStatus('pending')">
				<text class="stat-num">{{stats.pending || 0}}</text>
				<text class="stat-label">待审核</text>
			</view>
			<view class="stat-item" @click="filterByStatus('approved')">
				<text class="stat-num">{{stats.approved || 0}}</text>
				<text class="stat-label">已通过</text>
			</view>
			<view class="stat-item" @click="filterByStatus('rejected')">
				<text class="stat-num">{{stats.rejected || 0}}</text>
				<text class="stat-label">已拒绝</text>
			</view>
		</view>
		
		<view class="filter-bar">
			<view class="filter-item" @click="showTypePicker = true">
				<text>{{currentType || '全部类型'}}</text>
				<text class="arrow">▼</text>
			</view>
			<view class="filter-item" @click="showStatusPicker = true">
				<text>{{currentStatusText || '全部状态'}}</text>
				<text class="arrow">▼</text>
			</view>
		</view>
		
		<view class="list">
			<view class="card" v-for="item in list" :key="item.id" @click="goDetail(item.id)">
				<view class="card-header">
					<text class="name">{{item.nickname || '学生'}}</text>
					<text :class="['status', item.status]">{{item.statusName}}</text>
				</view>
				<view class="card-body">
					<text class="type">{{item.typeName}}</text>
					<text class="time">{{item.startTime}} 至 {{item.endTime}}</text>
					<text class="reason">{{item.reason}}</text>
				</view>
				<view class="card-footer" v-if="item.status === 'pending'">
					<button class="btn-reject" @click.stop="handleReject(item.id)">拒绝</button>
					<button class="btn-approve" @click.stop="handleApprove(item.id)">通过</button>
				</view>
			</view>
			
			<view class="empty" v-if="list.length === 0">
				<text>暂无请假记录</text>
			</view>
		</view>
		
		<picker mode="selector" :range="typeList" @change="onTypeChange" :value="typeIndex" v-show="false">
			<view></view>
		</picker>
	</view>
</template>

<script>
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/utils/format.js'

export default {
	data() {
		return {
			list: [],
			stats: {},
			currentType: '',
			currentStatus: '',
			currentStatusText: '',
			typeList: ['病假', '事假', '年假', '其他'],
			typeValues: ['sick', 'personal', 'annual', 'other'],
			typeIndex: -1,
			showTypePicker: false,
			showStatusPicker: false,
			page: 1,
			pageSize: 10,
			loading: false
		}
	},
	onLoad() {
		this.loadData()
	},
	onPullDownRefresh() {
		this.page = 1
		this.loadData().then(() => {
			uni.stopPullDownRefresh()
		})
	},
	methods: {
		async loadData() {
			if (this.loading) return
			this.loading = true
			
			try {
				const token = uni.getStorageSync('adminToken')
				const [error, res] = await uni.request({
					url: `http://localhost:3000/api/admin/leave/list`,
					method: 'GET',
					data: {
						page: this.page,
						pageSize: this.pageSize,
						type: this.currentType,
						status: this.currentStatus
					},
					header: {
						'Authorization': `Bearer ${token}`
					}
				})
				
				if (error) throw error
				
				if (res.statusCode === 200 && res.data && res.data.code === 200) {
					if (this.page === 1) {
						this.list = res.data.data.list
					} else {
						this.list = [...this.list, ...res.data.data.list]
					}
					this.stats = res.data.data.stats
				}
			} catch (e) {
				console.error('加载请假列表失败:', e)
				showError('加载失败')
			} finally {
				this.loading = false
			}
		},
		
		filterByStatus(status) {
			if (this.currentStatus === status) {
				this.currentStatus = ''
				this.currentStatusText = ''
			} else {
				this.currentStatus = status
				const statusMap = {
					'pending': '待审核',
					'approved': '已通过',
					'rejected': '已拒绝'
				}
				this.currentStatusText = statusMap[status]
			}
			this.page = 1
			this.loadData()
		},
		
		onTypeChange(e) {
			this.typeIndex = e.detail.value
			this.currentType = this.typeValues[this.typeIndex]
			this.page = 1
			this.loadData()
		},
		
		async handleApprove(id) {
			showConfirm('确定要通过该请假申请吗？', '确认通过').then(async () => {
				showLoading('处理中...')
				try {
					const token = uni.getStorageSync('adminToken')
					const [error, result] = await uni.request({
						url: `http://localhost:3000/api/admin/leave/approve/${id}`,
						method: 'PUT',
						header: {
							'Authorization': `Bearer ${token}`
						}
					})
					
					if (error) throw error
					
					if (result.statusCode === 200 && result.data && result.data.code === 200) {
						showSuccess('已通过')
						this.page = 1
						this.loadData()
					} else {
						showError(result.data?.message || '操作失败')
					}
				} catch (e) {
					showError('操作失败')
				} finally {
					hideLoading()
				}
			}).catch(() => {})
		},
		
		async handleReject(id) {
			showConfirm('确定要拒绝该请假申请吗？', '确认拒绝').then(async () => {
				showLoading('处理中...')
				try {
					const token = uni.getStorageSync('adminToken')
					const [error, result] = await uni.request({
						url: `http://localhost:3000/api/admin/leave/reject/${id}`,
						method: 'PUT',
						header: {
							'Authorization': `Bearer ${token}`
						}
					})
					
					if (error) throw error
					
					if (result.statusCode === 200 && result.data && result.data.code === 200) {
						showSuccess('已拒绝')
						this.page = 1
						this.loadData()
					} else {
						showError(result.data?.message || '操作失败')
					}
				} catch (e) {
					showError('操作失败')
				} finally {
					hideLoading()
				}
			}).catch(() => {})
		},
		
		goDetail(id) {
			uni.navigateTo({
				url: `/pages/admin/detail?id=${id}`
			})
		},
		
		handleLogout() {
			uni.removeStorageSync('adminToken')
			uni.removeStorageSync('adminInfo')
			uni.redirectTo({
				url: '/pages/adminLogin/adminLogin'
			})
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background: #F5F5F5;
}

.header {
	background: #FF6B6B;
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.title {
	color: #fff;
	font-size: 36rpx;
	font-weight: bold;
}

.logout {
	color: #fff;
	font-size: 28rpx;
}

.stats {
	display: flex;
	background: #fff;
	padding: 30rpx;
	margin: 20rpx;
	border-radius: 16rpx;
}

.stat-item {
	flex: 1;
	text-align: center;
}

.stat-num {
	font-size: 40rpx;
	font-weight: bold;
	color: #FF6B6B;
	display: block;
}

.stat-label {
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
	display: block;
}

.filter-bar {
	display: flex;
	padding: 20rpx 30rpx;
	gap: 20rpx;
}

.filter-item {
	flex: 1;
	background: #fff;
	padding: 20rpx;
	border-radius: 12rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 28rpx;
}

.arrow {
	color: #999;
	font-size: 20rpx;
}

.list {
	padding: 0 30rpx;
}

.card {
	background: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.name {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.status {
	font-size: 24rpx;
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
}

.status.pending {
	background: #FFF3E0;
	color: #FF9800;
}

.status.approved {
	background: #E8F5E9;
	color: #4CAF50;
}

.status.rejected {
	background: #FFEBEE;
	color: #F44336;
}

.card-body {
	margin-bottom: 20rpx;
}

.type {
	font-size: 28rpx;
	color: #666;
	display: block;
	margin-bottom: 10rpx;
}

.time {
	font-size: 24rpx;
	color: #999;
	display: block;
	margin-bottom: 10rpx;
}

.reason {
	font-size: 26rpx;
	color: #666;
	display: block;
}

.card-footer {
	display: flex;
	gap: 20rpx;
	border-top: 1rpx solid #eee;
	padding-top: 20rpx;
}

.btn-approve, .btn-reject {
	flex: 1;
	height: 70rpx;
	border-radius: 35rpx;
	font-size: 28rpx;
	border: none;
}

.btn-approve {
	background: #4CAF50;
	color: #fff;
}

.btn-reject {
	background: #F44336;
	color: #fff;
}

.empty {
	text-align: center;
	padding: 100rpx 0;
	color: #999;
	font-size: 28rpx;
}
</style>