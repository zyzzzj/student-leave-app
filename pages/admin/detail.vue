<template>
	<view class="page">
		<view class="header">
			<text class="back" @click="goBack">← 返回</text>
			<text class="title">请假详情</text>
			<view style="width: 80rpx;"></view>
		</view>
		
		<view class="card" v-if="detail">
			<view class="info-item">
				<text class="label">学生姓名</text>
				<text class="value">{{detail.nickname || '未知'}}</text>
			</view>
			<view class="info-item">
				<text class="label">请假类型</text>
				<text class="value">{{detail.typeName}}</text>
			</view>
			<view class="info-item">
				<text class="label">开始时间</text>
				<text class="value">{{detail.startTime}}</text>
			</view>
			<view class="info-item">
				<text class="label">结束时间</text>
				<text class="value">{{detail.endTime}}</text>
			</view>
			<view class="info-item">
				<text class="label">手机号</text>
				<text class="value">{{detail.phone}}</text>
			</view>
			<view class="info-item">
				<text class="label">请假原因</text>
				<text class="value reason">{{detail.reason}}</text>
			</view>
			<view class="info-item">
				<text class="label">申请时间</text>
				<text class="value">{{detail.createTime}}</text>
			</view>
			<view class="info-item">
				<text class="label">当前状态</text>
				<text :class="['value', 'status', detail.status]">{{detail.statusName}}</text>
			</view>
			
			<view class="images" v-if="detail.images && detail.images.length > 0">
				<text class="label">附件图片</text>
				<view class="image-list">
					<image v-for="(img, index) in detail.images" :key="index" :src="img" mode="aspectFill" class="image-item"></image>
				</view>
			</view>
			
			<view class="actions" v-if="detail.status === 'pending'">
				<button class="btn-reject" @click="handleReject">拒绝</button>
				<button class="btn-approve" @click="handleApprove">通过</button>
			</view>
		</view>
	</view>
</template>

<script>
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/utils/format.js'

export default {
	data() {
		return {
			detail: null
		}
	},
	onLoad(options) {
		if (options.id) {
			this.loadDetail(options.id)
		}
	},
	methods: {
		async loadDetail(id) {
			showLoading('加载中...')
			try {
				const token = uni.getStorageSync('adminToken')
				const [error, res] = await uni.request({
					url: `http://localhost:3000/api/admin/leave/${id}`,
					method: 'GET',
					header: {
						'Authorization': `Bearer ${token}`
					}
				})
				
				if (error) throw error
				
				if (res.statusCode === 200 && res.data && res.data.code === 200) {
					this.detail = res.data.data
				} else {
					showError(res.data?.message || '加载失败')
				}
			} catch (e) {
				showError('加载失败')
			} finally {
				hideLoading()
			}
		},
		
		async handleApprove() {
			showConfirm('确定要通过该请假申请吗？', '确认通过').then(async () => {
				showLoading('处理中...')
				try {
					const token = uni.getStorageSync('adminToken')
					const [error, result] = await uni.request({
						url: `http://localhost:3000/api/admin/leave/approve/${this.detail.id}`,
						method: 'PUT',
						header: {
							'Authorization': `Bearer ${token}`
						}
					})
					
					if (error) throw error
					
					if (result.statusCode === 200 && result.data && result.data.code === 200) {
						showSuccess('已通过')
						this.loadDetail(this.detail.id)
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
		
		async handleReject() {
			showConfirm('确定要拒绝该请假申请吗？', '确认拒绝').then(async () => {
				showLoading('处理中...')
				try {
					const token = uni.getStorageSync('adminToken')
					const [error, result] = await uni.request({
						url: `http://localhost:3000/api/admin/leave/reject/${this.detail.id}`,
						method: 'PUT',
						header: {
							'Authorization': `Bearer ${token}`
						}
					})
					
					if (error) throw error
					
					if (result.statusCode === 200 && result.data && result.data.code === 200) {
						showSuccess('已拒绝')
						this.loadDetail(this.detail.id)
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
		
		goBack() {
			uni.navigateBack()
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

.back {
	color: #fff;
	font-size: 32rpx;
}

.title {
	color: #fff;
	font-size: 32rpx;
	font-weight: bold;
}

.card {
	background: #fff;
	margin: 20rpx;
	border-radius: 16rpx;
	padding: 30rpx;
}

.info-item {
	display: flex;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #eee;
}

.info-item:last-child {
	border-bottom: none;
}

.label {
	color: #999;
	font-size: 28rpx;
}

.value {
	color: #333;
	font-size: 28rpx;
	max-width: 60%;
	text-align: right;
}

.value.reason {
	text-align: left;
}

.status {
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
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

.images {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #eee;
}

.image-list {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
	margin-top: 20rpx;
}

.image-item {
	width: 200rpx;
	height: 200rpx;
	border-radius: 12rpx;
}

.actions {
	display: flex;
	gap: 20rpx;
	margin-top: 30rpx;
}

.btn-approve, .btn-reject {
	flex: 1;
	height: 80rpx;
	border-radius: 40rpx;
	font-size: 30rpx;
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
</style>