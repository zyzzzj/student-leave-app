<template>
	<view class="page">
		<view class="container">
			<view class="empty-state" v-if="list.length === 0 && !loading">
				<text>暂无消息通知</text>
			</view>
			
			<view class="message-list">
				<view class="message-item card" v-for="item in list" :key="item.id" @click="handleRead(item)">
					<view class="message-header">
						<text class="message-title">{{item.title}}</text>
						<view class="message-dot" v-if="!item.isRead"></view>
					</view>
					<text class="message-content">{{item.content}}</text>
					<view class="message-footer">
						<text class="message-time">{{item.createTime}}</text>
						<text class="message-delete" @click.stop="handleDelete(item.id)">删除</text>
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
import { messageApi } from '@/apis/index.js'
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/utils/format.js'

export default {
	data() {
		return {
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
	methods: {
		async loadData() {
			this.loading = true
			try {
				const res = await messageApi.getList({
					page: this.page,
					pageSize: this.pageSize
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
		
		async handleRead(item) {
			if (!item.isRead) {
				try {
					await messageApi.markRead(item.id)
					item.isRead = true
				} catch (e) {
					console.error('标记已读失败', e)
				}
			}
			
			if (item.leaveId) {
				uni.navigateTo({
					url: `/pages/detail/detail?id=${item.leaveId}`
				})
			}
		},
		
		async handleDelete(id) {
			try {
				await showConfirm('确认删除该消息？')
			} catch (e) {
				return
			}
			
			showLoading('删除中...')
			try {
				const res = await messageApi.delete(id)
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
	padding: 20rpx;
	padding-bottom: 120rpx;
}

.message-item {
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.message-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15rpx;
}

.message-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333333;
	flex: 1;
}

.message-dot {
	width: 16rpx;
	height: 16rpx;
	background-color: #FF4D4F;
	border-radius: 50%;
	margin-left: 10rpx;
}

.message-content {
	font-size: 26rpx;
	color: #666666;
	margin-bottom: 15rpx;
	line-height: 1.6;
}

.message-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 15rpx;
	border-top: 2rpx solid #F5F5F5;
}

.message-time {
	font-size: 24rpx;
	color: #999999;
}

.message-delete {
	font-size: 24rpx;
	color: #FF4D4F;
}

.empty-state {
	text-align: center;
	padding: 100rpx 0;
	color: #999999;
}

.load-more, .no-more {
	text-align: center;
	padding: 30rpx 0;
	color: #999999;
	font-size: 26rpx;
}
</style>