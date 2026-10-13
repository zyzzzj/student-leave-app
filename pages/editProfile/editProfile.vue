<template>
	<view class="page">
		<view class="container">
			<view class="form card">
				<view class="avatar-section">
					<image class="avatar" :src="formData.avatar || '/static/default-avatar.png'" mode="aspectFill" @click="chooseAvatar"></image>
					<text class="avatar-tip">点击更换头像</text>
				</view>
				
				<view class="form-item">
					<text class="form-label">昵称</text>
					<input class="form-input" v-model="formData.nickname" placeholder="请输入昵称" maxlength="20" />
				</view>
				
				<view class="form-item">
					<text class="form-label">手机号</text>
					<input class="form-input" v-model="formData.phone" placeholder="请输入手机号" disabled />
				</view>
				
				<view class="form-item">
					<text class="form-label">性别</text>
					<picker @change="onGenderChange" :value="genderIndex" :range="genderList">
						<view class="picker-input">
							<text>{{formData.gender || '请选择性别'}}</text>
							<text class="arrow">▼</text>
						</view>
					</picker>
				</view>
				
				<view class="form-item">
					<text class="form-label">学院</text>
					<input class="form-input" v-model="formData.department" placeholder="请输入学院" />
				</view>
				
				<view class="form-item">
					<text class="form-label">班级</text>
					<input class="form-input" v-model="formData.class" placeholder="请输入班级" />
				</view>
				
				<button class="btn-primary" @click="handleSubmit">保存修改</button>
			</view>
		</view>
	</view>
</template>

<script>
import { validatePhone, showLoading, hideLoading, showSuccess, showError } from '@/utils/format.js'
import { userApi } from '@/apis/index.js'

export default {
	data() {
		return {
			genderList: ['男', '女'],
			genderIndex: 0,
			formData: {
				avatar: '',
				nickname: '',
				phone: '',
				gender: '',
				department: '',
				class: ''
			}
		}
	},
	onLoad() {
		this.loadUserInfo()
	},
	methods: {
		loadUserInfo() {
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				this.formData = {
					avatar: userInfo.avatar || '',
					nickname: userInfo.nickname || '',
					phone: userInfo.phone || '',
					gender: userInfo.gender || '',
					department: userInfo.department || '',
					class: userInfo.class || ''
				}
				if (this.formData.gender) {
					this.genderIndex = this.formData.gender === '男' ? 0 : 1
				}
			}
		},
		
		onGenderChange(e) {
			this.genderIndex = e.detail.value
			this.formData.gender = this.genderList[this.genderIndex]
		},
		
		chooseAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.formData.avatar = res.tempFilePaths[0]
				}
			})
		},
		
		async handleSubmit() {
			if (!this.formData.nickname) {
				showError('请输入昵称')
				return
			}
			
			showLoading('保存中...')
			try {
				const updateData = {
					nickname: this.formData.nickname,
					avatar: this.formData.avatar,
					gender: this.formData.gender,
					department: this.formData.department,
					class: this.formData.class
				}
				const res = await userApi.updateUserInfo(updateData)
				if (res.code === 200) {
					uni.setStorageSync('userInfo', res.data)
					showSuccess('保存成功')
					setTimeout(() => {
						uni.navigateBack()
					}, 1000)
				} else {
					showError(res.message || '保存失败')
				}
			} catch (e) {
				console.error('保存失败:', e)
				showError('保存失败: ' + (e.message || '未知错误'))
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

.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 40rpx;
}

.avatar {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	margin-bottom: 20rpx;
	border: 4rpx solid #4A90E2;
}

.avatar-tip {
	font-size: 24rpx;
	color: #999999;
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

.arrow {
	color: #999999;
	font-size: 20rpx;
}

.btn-primary {
	margin-top: 40rpx;
}
</style>