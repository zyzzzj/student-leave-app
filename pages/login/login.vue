<template>
	<view class="page">
		<view class="login-container">
			<view class="logo-section">
				<view class="logo">请假</view>
				<text class="title">学生请假管理</text>
				<text class="subtitle">便捷请假，轻松管理</text>
			</view>
			
			<view class="form-section card">
				<view class="tabs">
					<text :class="['tab', {active: activeTab === 'login'}]" @click="switchTab('login')">登录</text>
					<text :class="['tab', {active: activeTab === 'register'}]" @click="switchTab('register')">注册</text>
					<text :class="['tab', {active: activeTab === 'admin'}]" @click="switchTab('admin')">管理员</text>
				</view>
				
				<view class="form" v-if="activeTab === 'login'">
					<view class="form-item">
						<text class="form-label">手机号</text>
						<input class="form-input" v-model="loginForm.phone" placeholder="请输入手机号" type="number" maxlength="11" />
					</view>
					<view class="form-item">
						<text class="form-label">密码</text>
						<input class="form-input" v-model="loginForm.password" placeholder="请输入密码" type="password" />
					</view>
					<button class="btn-primary" @click="handleLogin">登录</button>
				</view>
				
				<view class="form" v-else-if="activeTab === 'register'">
					<view class="form-item">
						<text class="form-label">手机号</text>
						<input class="form-input" v-model="registerForm.phone" placeholder="请输入手机号" type="number" maxlength="11" />
					</view>
					<view class="form-item">
						<text class="form-label">密码</text>
						<input class="form-input" v-model="registerForm.password" placeholder="请设置密码" type="password" />
					</view>
					<view class="form-item">
						<text class="form-label">确认密码</text>
						<input class="form-input" v-model="registerForm.confirmPassword" placeholder="请确认密码" type="password" />
					</view>
					<button class="btn-primary" @click="handleRegister">注册</button>
				</view>
				
				<view class="form" v-else>
					<view class="form-item">
						<text class="form-label">管理员账号</text>
						<input class="form-input" v-model="adminForm.username" placeholder="请输入管理员账号" />
					</view>
					<view class="form-item">
						<text class="form-label">密码</text>
						<input class="form-input" v-model="adminForm.password" placeholder="请输入密码" type="password" />
					</view>
					<button class="btn-primary admin-btn" @click="handleAdminLogin">管理员登录</button>
				</view>
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
			activeTab: 'login',
			loginForm: {
				phone: '',
				password: ''
			},
			registerForm: {
				phone: '',
				password: '',
				confirmPassword: ''
			},
			adminForm: {
				username: '',
				password: ''
			}
		}
	},
	methods: {
		switchTab(tab) {
			this.activeTab = tab
		},
		
		async handleLogin() {
			if (!this.loginForm.phone) {
				showError('请输入手机号')
				return
			}
			if (!validatePhone(this.loginForm.phone)) {
				showError('请输入正确的手机号')
				return
			}
			if (!this.loginForm.password) {
				showError('请输入密码')
				return
			}
			
			showLoading('登录中...')
			try {
				const res = await userApi.login(this.loginForm)
				if (res.code === 200) {
					uni.setStorageSync('token', res.data.token)
					uni.setStorageSync('userInfo', res.data.userInfo)
					showSuccess('登录成功')
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						})
					}, 1000)
				} else {
					showError(res.message || '登录失败')
				}
			} catch (e) {
				console.error('登录异常:', e)
				showError('登录失败: ' + (e.message || '未知错误'))
			} finally {
				hideLoading()
			}
		},
		
		async handleRegister() {
			if (!this.registerForm.phone) {
				showError('请输入手机号')
				return
			}
			if (!validatePhone(this.registerForm.phone)) {
				showError('请输入正确的手机号')
				return
			}
			if (!this.registerForm.password) {
				showError('请设置密码')
				return
			}
			if (this.registerForm.password !== this.registerForm.confirmPassword) {
				showError('两次密码不一致')
				return
			}
			
			showLoading('注册中...')
			try {
				const res = await userApi.register(this.registerForm)
				if (res.code === 200) {
					showSuccess('注册成功')
					this.activeTab = 'login'
				} else {
					showError(res.message || '注册失败')
				}
			} catch (e) {
				showError('注册失败，请重试')
			} finally {
				hideLoading()
			}
		},
		
		async handleAdminLogin() {
			if (!this.adminForm.username) {
				showError('请输入管理员账号')
				return
			}
			if (!this.adminForm.password) {
				showError('请输入密码')
				return
			}
			
			showLoading('登录中...')
			try {
				const [error, res] = await uni.request({
					url: 'http://localhost:3000/api/admin/login',
					method: 'POST',
					data: this.adminForm,
					header: {
						'Content-Type': 'application/json'
					}
				})
				
				if (error) {
					throw error
				}
				
				if (res.statusCode === 200 && res.data && res.data.code === 200) {
					uni.setStorageSync('adminToken', res.data.data.token)
					uni.setStorageSync('adminInfo', res.data.data.adminInfo)
					showSuccess('登录成功')
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/admin/index'
						})
					}, 1000)
				} else {
					showError(res.data?.message || '登录失败')
				}
			} catch (e) {
				console.error('管理员登录异常:', e)
				showError('登录失败，请重试')
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
	background: linear-gradient(180deg, #4A90E2 0%, #F5F5F5 40%);
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
	background-color: #ffffff;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 40rpx;
	font-weight: bold;
	color: #4A90E2;
	margin: 0 auto 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(74, 144, 226, 0.3);
}

.title {
	font-size: 40rpx;
	font-weight: bold;
	color: #ffffff;
	display: block;
	margin-bottom: 15rpx;
}

.subtitle {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.8);
}

.form-section {
	width: 100%;
}

.tabs {
	display: flex;
	margin-bottom: 40rpx;
}

.tab {
	flex: 1;
	text-align: center;
	padding: 20rpx 0;
	font-size: 32rpx;
	color: #999999;
	border-bottom: 4rpx solid transparent;
}

.tab.active {
	color: #4A90E2;
	border-bottom-color: #4A90E2;
	font-weight: bold;
}

.form .btn-primary {
	margin-top: 40rpx;
}

.code-input {
	display: flex;
	align-items: center;
}

.code-input .form-input {
	flex: 1;
	margin-right: 20rpx;
}

.btn-code {
	background-color: #4A90E2;
	color: #ffffff;
	font-size: 26rpx;
	padding: 0 30rpx;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 8rpx;
	border: none;
}

.btn-code[disabled] {
	background-color: #CCCCCC;
	color: #999999;
}

.admin-btn {
	background: linear-gradient(135deg, #FF6B6B, #FF8E53) !important;
}
</style>