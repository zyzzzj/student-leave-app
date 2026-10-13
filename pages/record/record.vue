<template>
	<view class="page">
		<view class="filter-bar card">
			<view class="filter-item" @click="showTypePicker = true">
				<text>{{currentType || '全部类型'}}</text>
				<text class="arrow">▼</text>
			</view>
			<view class="filter-item" @click="showStatusPicker = true">
				<text>{{currentStatus || '全部状态'}}</text>
				<text class="arrow">▼</text>
			</view>
		</view>
		
		<picker mode="selector" :range="typeList" @change="onTypeChange" :value="typeIndex" v-if="showTypePicker" @cancel="showTypePicker = false">
			<view></view>
		</picker>
		
		<picker mode="selector" :range="statusList" @change="onStatusChange" :value="statusIndex" v-if="showStatusPicker" @cancel="showStatusPicker = false">
			<view></view>
		</picker>
		
		<view class="container">
			<view class="empty-state" v-if="list.length === 0 && !loading">
				<text>暂无请假记录</text>
			</view>
			
			<view class="leave-list">
				<view class="leave-item card" v-for="item in list" :key="item.id" @click="goDetail(item.id)">
					<view class="leave-header">
						<text class="leave-type">{{getLeaveTypeText(item.type)}}</text>
						<text :class="['status-tag', getStatusClass(item.status)]">{{getLeaveStatusText(item.status)}}</text>
					</view>
					<view class="leave-content">
						<view class="info-row">
							<text class="label">时间：</text>
							<text class="value">{{item.startTime}} ~ {{item.endTime}}</text>
						</view>
						<view class="info-row">
							<text class="label">事由：</text>
							<text class="value">{{item.reason}}</text>
						</view>
						<view class="info-row" v-if="item.remark">
							<text class="label">备注：</text>
							<text class="value">{{item.remark}}</text>
						</view>
					</view>
					<view class="leave-footer">
						<text class="time">{{item.createTime}}</text>
						<view class="actions">
							<button class="btn-sm btn-danger" v-if="item.status === 'pending'" @click.stop="handleCancel(item.id)">取消</button>
							<button class="btn-sm btn-secondary" @click.stop="handleDelete(item.id)">删除</button>
						</view>
					</view>
				</view>
			</view>
			
			<view class="load-more" v-if="hasMore">
				<text v-if="loading">加载中...</text>
				<text v-else @click="loadMore">上拉加载更多</text>
			</view>
			<view class="no-more" v-else-if="list.length > 0">
				<text>没有更多了</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getLeaveTypeText, getLeaveStatusText, getStatusClass, showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/utils/format.js'
import { leaveApi } from '@/apis/index.js'

export default {
	data() {
		return {
			typeList: ['全部类型', '病假', '事假', '年假', '其他'],
			typeValue: ['', 'sick', 'personal', 'annual', 'other'],
			typeIndex: 0,
			currentType: '',
			
			statusList: ['全部状态', '待审核', '已通过', '已拒绝', '已取消'],
			statusValue: ['', 'pending', 'approved', 'rejected', 'cancelled'],
			statusIndex: 0,
			currentStatus: '',
			
			showTypePicker: false,
			showStatusPicker: false,
			
			list: [],
			page: 1,
			pageSize: 10,
			hasMore: true,
			loading: false
		}
	},
	onShow() {
		this.page = 1
		this.list = []
		this.loadData()
	},
	onPullDownRefresh() {
		this.page = 1
		this.list = []
		this.loadData().then(() => {
			uni.stopPullDownRefresh()
		})
	},
	methods: {
		getLeaveTypeText,
		getLeaveStatusText,
		getStatusClass,
		
		onTypeChange(e) {
			this.typeIndex = e.detail.value
			this.currentType = this.typeValue[this.typeIndex]
			this.showTypePicker = false
			this.page = 1
			this.list = []
			this.loadData()
		},
		
		onStatusChange(e) {
			this.statusIndex = e.detail.value
			this.currentStatus = this.statusValue[this.statusIndex]
			this.showStatusPicker = false
			this.page = 1
			this.list = []
			this.loadData()
		},
		
		async loadData() {
			this.loading = true
			try {
				const res = await leaveApi.getList({
					page: this.page,
					pageSize: this.pageSize,
					type: this.currentType,
					status: this.currentStatus
				})
				if (res.code === 200) {
					const newList = res.data.list || []
					if (this.page === 1) {
						this.list = newList
					} else {
						this.list = this.list.concat(newList)
					}
					this.hasMore = newList.length >= this.pageSize
				}
			} catch (e) {
				showError('加载失败')
			} finally {
				this.loading = false
			}
		},
		
		loadMore() {
			if (this.hasMore && !this.loading) {
				this.page++
				this.loadData()
			}
		},
		
		goDetail(id) {
			uni.navigateTo({
				url: `/pages/detail/detail?id=${id}`
			})
		},
		
		async handleCancel(id) {
			try {
				await showConfirm('确认取消该请假申请？')
			} catch (e) {
				return
			}
			
			showLoading('取消中...')
			try {
				const res = await leaveApi.cancel(id)
				if (res.code === 200) {
					showSuccess('取消成功')
					this.page = 1
					this.list = []
					this.loadData()
				} else {
					showError(res.message || '取消失败')
				}
			} catch (e) {
				showError('取消失败')
			} finally {
				hideLoading()
			}
		},
		
		async handleDelete(id) {
			try {
				await showConfirm('确认删除该请假记录？')
			} catch (e) {
				return
			}
			
			showLoading('删除中...')
			try {
				const res = await leaveApi.delete(id)
				if (res.code === 200) {
					showSuccess('删除成功')
					this.page = 1
					this.list = []
					this.loadData()
				} else {
					showError(res.message || '删除失败')
				}
			} catch (e) {
				showError('删除失败')
			} finally {
				hideLoading()
			}
		}
	},
	onReachBottom() {
		this.loadMore()
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background-color: #F5F5F5;
	padding-bottom: 120rpx;
}

.filter-bar {
	display: flex;
	justify-content: space-around;
	padding: 20rpx;
	margin: 20rpx;
}

.filter-item {
	display: flex;
	align-items: center;
	padding: 10rpx 20rpx;
	font-size: 28rpx;
	color: #333333;
}

.filter-item .arrow {
	margin-left: 10rpx;
	font-size: 20rpx;
	color: #999999;
}

.container {
	padding: 0 20rpx;
}

.leave-item {
	margin-bottom: 20rpx;
}

.leave-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.leave-type {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.leave-content {
	margin-bottom: 20rpx;
}

.info-row {
	display: flex;
	margin-bottom: 10rpx;
	font-size: 26rpx;
}

.info-row .label {
	color: #999999;
	width: 100rpx;
}

.info-row .value {
	color: #666666;
	flex: 1;
}

.leave-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 20rpx;
	border-top: 2rpx solid #F5F5F5;
}

.time {
	font-size: 24rpx;
	color: #999999;
}

.actions {
	display: flex;
	gap: 20rpx;
}

.btn-sm {
	padding: 10rpx 20rpx;
	font-size: 24rpx;
	border-radius: 8rpx;
}

.btn-danger {
	background-color: #FF4D4F;
	color: #ffffff;
	border: none;
}

.btn-secondary {
	background-color: #ffffff;
	color: #4A90E2;
	border: 2rpx solid #4A90E2;
}

.load-more, .no-more {
	text-align: center;
	padding: 30rpx 0;
	color: #999999;
	font-size: 26rpx;
}

.empty-state {
	text-align: center;
	padding: 100rpx 0;
	color: #999999;
}
</style>