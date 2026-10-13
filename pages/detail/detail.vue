<template>
	<view class="page">
		<view class="container" v-if="detail">
			<view class="detail-card card">
				<view class="detail-header">
					<text class="detail-type">{{getLeaveTypeText(detail.type)}}</text>
					<text :class="['status-tag', getStatusClass(detail.status)]">{{getLeaveStatusText(detail.status)}}</text>
				</view>
				
				<view class="divider"></view>
				
				<view class="detail-content">
					<view class="detail-row">
						<text class="detail-label">请假时间</text>
						<text class="detail-value">{{detail.startTime}} ~ {{detail.endTime}}</text>
					</view>
					<view class="detail-row">
						<text class="detail-label">请假时长</text>
						<text class="detail-value">{{getTimeDiff(detail.startTime, detail.endTime)}}</text>
					</view>
					<view class="detail-row">
						<text class="detail-label">请假事由</text>
						<text class="detail-value">{{detail.reason}}</text>
					</view>
					<view class="detail-row" v-if="detail.remark">
						<text class="detail-label">审核备注</text>
						<text class="detail-value">{{detail.remark}}</text>
					</view>
					<view class="detail-row">
						<text class="detail-label">申请时间</text>
						<text class="detail-value">{{detail.createTime}}</text>
					</view>
				</view>
				
				<view class="divider" v-if="detail.images && detail.images.length > 0"></view>
				
				<view class="images-section" v-if="detail.images && detail.images.length > 0">
					<text class="section-title">附件图片</text>
					<view class="images-grid">
						<image v-for="(img, index) in detail.images" :key="index" :src="img" mode="aspectFill" class="detail-img" @click="previewImage(index)"></image>
					</view>
				</view>
			</view>
			
			<view class="action-section" v-if="detail.status === 'pending'">
				<button class="btn-danger" @click="handleCancel">取消请假</button>
			</view>
		</view>
	</view>
</template>

<script>
import { getLeaveTypeText, getLeaveStatusText, getStatusClass, getTimeDiff, showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/utils/format.js'
import { leaveApi } from '@/apis/index.js'

export default {
	data() {
		return {
			id: '',
			detail: null
		}
	},
	onLoad(options) {
		this.id = options.id
		this.loadDetail()
	},
	methods: {
		getLeaveTypeText,
		getLeaveStatusText,
		getStatusClass,
		getTimeDiff,
		
		async loadDetail() {
			showLoading('加载中...')
			try {
				const res = await leaveApi.getDetail(this.id)
				if (res.code === 200) {
					this.detail = res.data
				} else {
					showError(res.message || '加载失败')
				}
			} catch (e) {
				showError('加载失败')
			} finally {
				hideLoading()
			}
		},
		
		previewImage(index) {
			uni.previewImage({
				current: index,
				urls: this.detail.images
			})
		},
		
		async handleCancel() {
			try {
				await showConfirm('确认取消该请假申请？')
			} catch (e) {
				return
			}
			
			showLoading('取消中...')
			try {
				const res = await leaveApi.cancel(this.id)
				if (res.code === 200) {
					showSuccess('取消成功')
					this.loadDetail()
				} else {
					showError(res.message || '取消失败')
				}
			} catch (e) {
				showError('取消失败')
			} finally {
				hideLoading()
			}
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background-color: #F5F5F5;
	padding: 20rpx;
}

.detail-card {
	padding: 40rpx;
}

.detail-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.detail-type {
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
}

.detail-content {
	padding: 20rpx 0;
}

.detail-row {
	display: flex;
	margin-bottom: 30rpx;
}

.detail-label {
	width: 160rpx;
	font-size: 28rpx;
	color: #999999;
}

.detail-value {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
}

.images-section {
	padding: 20rpx 0;
}

.section-title {
	font-size: 30rpx;
	font-weight: 500;
	color: #333333;
	margin-bottom: 20rpx;
	display: block;
}

.images-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.detail-img {
	width: 200rpx;
	height: 200rpx;
	border-radius: 8rpx;
}

.action-section {
	margin-top: 40rpx;
}
</style>