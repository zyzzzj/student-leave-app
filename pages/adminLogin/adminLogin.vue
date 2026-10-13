<template>
	<view class="page">
		<view class="login-container">
			<view class="logo-section">
				<view class="logo">管理</view>
				<text class="title">管理员登录</text>
				<text class="subtitle">请假审批管理系统</text>
			</view>
			
			<view class="form-section card">
				<view class="form">
					<view class="form-item">
						<text class="form-label">管理员账号</text>
						<input class="form-input" v-model="loginForm.username" placeholder="请输入管理员账号" />
					</view>
					<view class="form-item">
						<text class="form-label">密码</text>
						<input class="form-input" v-model="loginForm.password" placeholder="请输入密码" type="password" />
					</view>
					<button class="btn-primary" @click="handleLogin">登录</button>
				</view>
			</view>
			
			<view class="footer">
				<text class="link" @click="goToStudentLogin">学生登录入口</text>
			</view>
		</view>
	</view>
</template>

<script>
import { showLoading, hideLoading, showSuccess, showError } from '@/utils/format.js'

export default {
	data() {
		return {
			loginForm: {
				username: '',
				password: ''
			}
		}
	},
	methods: {
		async handleLogin() {
			if (!this.loginForm.username) {
				showError('请输入管理员账号')
				return
			}
			if (!this.loginForm.password) {
				showError('请输入密码')
				return
			}
			
			showLoading('登录中...')
			try {
				const res = await uni.request({
					url: 'http://localhost:3000/api/admin/login',
					method: 'POST',
					data: this.loginForm,
					header: {
						'Content-Type': 'application/json'
					}
				})
				
				if (res.data.code === 200) {
					uni.setStorageSync('adminToken', res.data.data.token)
					uni.setStorageSync('adminInfo', res.data.data.adminInfo)
					showSuccess('登录成功')
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/admin/index'
						})
					}, 1000)
				} else {
					showError(res.data.message || '登录失败')
				}
			} catch (e) {
				showError('登录失败，请重试')
			} finally {
				hideLoading()
			}
		},
		
		goToStudentLogin() {
			uni.redirectTo({
				url: '/pages/login/login'
			})
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background: linear-gradient(180deg, #FF6B6B 0%, #F5F5F5 40%);
	padding: 100rpx 30rpx;
}

.login-container {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.logo-section {
	text-align: center;
	margin-bottom: 60rpx;
}

.logo {
	width: 120rpx;
	height: 120rpx;
	background: #FF6B6B;
	color: #fff;
	font-size: 48rpx;
	font-weight: bold;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 20rpx;
}

.title {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 10rpx;
}

.subtitle {
	font-size: 26rpx;
	color: #666;
}

.form-section {
	width: 100%;
	background: #fff;
	border-radius: 20rpx;
	padding: 40rpx 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.form-item {
	margin-bottom: 30rpx;
}

.form-label {
	font-size: 28rpx;
	color: #333;
	display: block;
	margin-bottom: 15rpx;
}

.form-input {
	width: 100%;
	height: 80rpx;
	background: #F5F5F5;
	border-radius: 12rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	box-sizing: border-box;
}

.btn-primary {
	width: 100%;
	height: 88rpx;
	background: linear-gradient(135deg, #FF6B6B, #FF8E53);
	color: #fff;
	font-size: 32rpx;
	border-radius: 44rpx;
	border: none;
	margin-top: 20rpx;
}

.footer {
	margin-top: 40rpx;
	text-align: center;
}

.link {
	color: #4A90E2;
	font-size: 28rpx;
}
</style>