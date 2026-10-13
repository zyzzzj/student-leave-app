// 工具函数

// 手机号验证
export function validatePhone(phone) {
	const reg = /^1[3-9]\d{9}$/
	return reg.test(phone)
}

// 日期格式化
export function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
	if (!date) return ''
	const d = new Date(date)
	const year = d.getFullYear()
	const month = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	const hour = String(d.getHours()).padStart(2, '0')
	const minute = String(d.getMinutes()).padStart(2, '0')
	
	return format
		.replace('YYYY', year)
		.replace('MM', month)
		.replace('DD', day)
		.replace('HH', hour)
		.replace('mm', minute)
}

// 请假类型映射
export function getLeaveTypeText(type) {
	const typeMap = {
		'sick': '病假',
		'personal': '事假',
		'annual': '年假',
		'other': '其他'
	}
	return typeMap[type] || '未知'
}

// 请假状态映射
export function getLeaveStatusText(status) {
	const statusMap = {
		'pending': '待审核',
		'approved': '已通过',
		'rejected': '已拒绝',
		'cancelled': '已取消'
	}
	return statusMap[status] || '未知'
}

// 获取状态样式类
export function getStatusClass(status) {
	const classMap = {
		'pending': 'status-pending',
		'approved': 'status-approved',
		'rejected': 'status-rejected',
		'cancelled': 'status-cancelled'
	}
	return classMap[status] || ''
}

// 计算时间差
export function getTimeDiff(startTime, endTime) {
	const start = new Date(startTime)
	const end = new Date(endTime)
	const diff = end - start
	const days = Math.floor(diff / (1000 * 60 * 60 * 24))
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	
	if (days > 0) {
		return `${days}天${hours}小时`
	}
	return `${hours}小时`
}

// 显示加载提示
export function showLoading(title = '加载中...') {
	uni.showLoading({
		title: title,
		mask: true
	})
}

// 隐藏加载提示
export function hideLoading() {
	uni.hideLoading()
}

// 显示成功提示
export function showSuccess(title = '操作成功') {
	uni.showToast({
		title: title,
		icon: 'success',
		duration: 2000
	})
}

// 显示错误提示
export function showError(title = '操作失败') {
	uni.showToast({
		title: title,
		icon: 'error',
		duration: 2000
	})
}

// 显示确认弹窗
export function showConfirm(content, title = '提示') {
	return new Promise((resolve, reject) => {
		uni.showModal({
			title: title,
			content: content,
			success: (res) => {
				if (res.confirm) {
					resolve(true)
				} else {
					reject(false)
				}
			}
		})
	})
}

// 本地存储
export const storage = {
	set: (key, value) => {
		uni.setStorageSync(key, value)
	},
	get: (key) => {
		return uni.getStorageSync(key)
	},
	remove: (key) => {
		uni.removeStorageSync(key)
	},
	clear: () => {
		uni.clearStorageSync()
	}
}

export default {
	validatePhone,
	formatDate,
	getLeaveTypeText,
	getLeaveStatusText,
	getStatusClass,
	getTimeDiff,
	showLoading,
	hideLoading,
	showSuccess,
	showError,
	showConfirm,
	storage
}