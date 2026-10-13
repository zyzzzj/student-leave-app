// API请求封装
const BASE_URL = 'http://localhost:3000/api'

// 请求拦截器
function request(options) {
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token')
		
		uni.request({
			url: BASE_URL + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header: {
				'Content-Type': 'application/json',
				'Authorization': token ? `Bearer ${token}` : ''
			},
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data)
				} else if (res.statusCode === 401) {
					uni.removeStorageSync('token')
					uni.removeStorageSync('userInfo')
					uni.redirectTo({
						url: '/pages/login/login'
					})
					reject(new Error('未登录或登录已过期'))
				} else {
					reject(new Error(res.data.message || '请求失败'))
				}
			},
			fail: (err) => {
				reject(new Error('网络错误'))
			}
		})
	})
}

// GET请求
function get(url, data) {
	return request({
		url,
		method: 'GET',
		data
	})
}

// POST请求
function post(url, data) {
	return request({
		url,
		method: 'POST',
		data
	})
}

// PUT请求
function put(url, data) {
	return request({
		url,
		method: 'PUT',
		data
	})
}

// DELETE请求
function del(url, data) {
	return request({
		url,
		method: 'DELETE',
		data
	})
}

export default {
	get,
	post,
	put,
	del,
	BASE_URL
}