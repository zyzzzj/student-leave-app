<template>
	<view class="status-card" :class="statusClass">
		<view class="status-header">
			<text class="status-title">{{title}}</text>
			<text :class="['status-tag', statusTagClass]">{{statusText}}</text>
		</view>
		<view class="status-content">
			<slot></slot>
		</view>
		<view class="status-footer" v-if="showFooter">
			<text class="status-time">{{time}}</text>
			<view class="status-actions">
				<slot name="actions"></slot>
			</view>
		</view>
	</view>
</template>

<script>
import { getStatusClass } from '@/utils/format.js'

export default {
	name: 'StatusCard',
	props: {
		title: {
			type: String,
			default: ''
		},
		status: {
			type: String,
			default: 'pending'
		},
		statusText: {
			type: String,
			default: '待审核'
		},
		time: {
			type: String,
			default: ''
		},
		showFooter: {
			type: Boolean,
			default: true
		}
	},
	computed: {
		statusClass() {
			return getStatusClass(this.status)
		},
		statusTagClass() {
			return `status-${this.status}`
		}
	}
}
</script>

<style scoped>
.status-card {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.status-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.status-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.status-content {
	margin-bottom: 20rpx;
}

.status-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 20rpx;
	border-top: 2rpx solid #F5F5F5;
}

.status-time {
	font-size: 24rpx;
	color: #999999;
}

.status-actions {
	display: flex;
	gap: 20rpx;
}
</style>