<template>
	<view class="page">
		<view class="container">
			<view class="form card">
				<view class="form-item">
					<text class="form-label">请假类型</text>
					<picker @change="onTypeChange" :value="typeIndex" :range="typeList">
						<view class="picker-input">
							<text :class="{placeholder: !formData.type}">{{formData.type ? getLeaveTypeText(formData.type) : '请选择请假类型'}}</text>
							<text class="arrow">▼</text>
						</view>
					</picker>
				</view>
				
				<view class="form-item">
					<text class="form-label">开始时间</text>
					<picker mode="date" @change="onStartTimeChange" :value="formData.startTime">
						<view class="picker-input">
							<text :class="{placeholder: !formData.startTime}">{{formData.startTime || '请选择开始时间'}}</text>
							<text class="arrow">▼</text>
						</view>
					</picker>
				</view>
				
				<view class="form-item">
					<text class="form-label">结束时间</text>
					<picker mode="date" @change="onEndTimeChange" :value="formData.endTime">
						<view class="picker-input">
							<text :class="{placeholder: !formData.endTime}">{{formData.endTime || '请选择结束时间'}}</text>
							<text class="arrow">▼</text>
						</view>
					</picker>
				</view>
				
				<view class="form-item">
					<text class="form-label">请假事由</text>
					<textarea class="form-textarea" v-model="formData.reason" placeholder="请详细说明请假原因" maxlength="500" />
					<text class="char-count">{{formData.reason.length}}/500</text>
				</view>
				
				<view class="form-item">
					<text class="form-label">附件（选填）</text>
					<view class="upload-area" @click="chooseImage">
						<view class="upload-item" v-for="(img, index) in formData.images" :key="index">
							<image :src="img" mode="aspectFill" class="upload-img"></image>
							<view class="delete-btn" @click.stop="deleteImage(index)">×</view>
						</view>
						<view class="upload-btn" v-if="formData.images.length < 3">
							<text class="upload-icon">+</text>
							<text class="upload-text">上传图片</text>
						</view>
					</view>
				</view>
				
				<button class="btn-primary" @click="handleSubmit">提交申请</button>
			</view>
		</view>
	</view>
</template>

<script>
import { getLeaveTypeText, showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/utils/format.js'
import { leaveApi } from '@/apis/index.js'

export default {
	data() {
		return {
			typeList: ['病假', '事假', '年假', '其他'],
			typeValue: ['sick', 'personal', 'annual', 'other'],
			typeIndex: 0,
			formData: {
				type: '',
				startTime: '',
				endTime: '',
				reason: '',
				images: []
			}
		}
	},
	methods: {
		getLeaveTypeText,
		
		onTypeChange(e) {
			this.typeIndex = e.detail.value
			this.formData.type = this.typeValue[this.typeIndex]
		},
		
		onStartTimeChange(e) {
			this.formData.startTime = e.detail.value
		},
		
		onEndTimeChange(e) {
			this.formData.endTime = e.detail.value
		},
		
		chooseImage() {
			uni.chooseImage({
				count: 3 - this.formData.images.length,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.formData.images = this.formData.images.concat(res.tempFilePaths)
				}
			})
		},
		
		deleteImage(index) {
			this.formData.images.splice(index, 1)
		},
		
		async handleSubmit() {
			if (!this.formData.type) {
				showError('请选择请假类型')
				return
			}
			if (!this.formData.startTime) {
				showError('请选择开始时间')
				return
			}
			if (!this.formData.endTime) {
				showError('请选择结束时间')
				return
			}
			if (this.formData.endTime <= this.formData.startTime) {
				showError('结束时间必须晚于开始时间')
				return
			}
			if (!this.formData.reason) {
				showError('请填写请假事由')
				return
			}
			
			try {
				await showConfirm('确认提交请假申请？')
			} catch (e) {
				return
			}
			
			showLoading('提交中...')
			try {
				const res = await leaveApi.apply(this.formData)
				if (res.code === 200) {
					showSuccess('提交成功')
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} else {
					showError(res.message || '提交失败')
				}
			} catch (e) {
				showError('提交失败，请重试')
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

.picker-input {
	background-color: #F5F5F5;
	border-radius: 8rpx;
	padding: 20rpx;
	font-size: 28rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.picker-input .placeholder {
	color: #999999;
}

.arrow {
	color: #999999;
	font-size: 20rpx;
}

.char-count {
	text-align: right;
	display: block;
	font-size: 24rpx;
	color: #999999;
	margin-top: 10rpx;
}

.upload-area {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.upload-item {
	position: relative;
	width: 200rpx;
	height: 200rpx;
}

.upload-img {
	width: 100%;
	height: 100%;
	border-radius: 8rpx;
}

.delete-btn {
	position: absolute;
	top: -10rpx;
	right: -10rpx;
	width: 40rpx;
	height: 40rpx;
	background-color: #FF4D4F;
	color: #ffffff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
}

.upload-btn {
	width: 200rpx;
	height: 200rpx;
	border: 2rpx dashed #CCCCCC;
	border-radius: 8rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #FAFAFA;
}

.upload-icon {
	font-size: 60rpx;
	color: #CCCCCC;
	line-height: 1;
}

.upload-text {
	font-size: 24rpx;
	color: #999999;
	margin-top: 10rpx;
}

.btn-primary {
	margin-top: 40rpx;
}
</style>