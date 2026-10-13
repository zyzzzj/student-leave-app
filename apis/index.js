import api from './request.js'

// 用户相关接口
export const userApi = {
	// 登录
	login: (data) => api.post('/user/login', data),
	// 注册
	register: (data) => api.post('/user/register', data),
	// 获取用户信息
	getUserInfo: () => api.get('/user/info'),
	// 更新用户信息
	updateUserInfo: (data) => api.put('/user/info', data),
	// 修改密码
	changePassword: (data) => api.post('/user/changePassword', data)
}

// 请假相关接口
export const leaveApi = {
	// 提交请假申请
	apply: (data) => api.post('/leave/apply', data),
	// 获取请假列表
	getList: (params) => api.get('/leave/list', params),
	// 获取请假详情
	getDetail: (id) => api.get(`/leave/${id}`),
	// 取消请假
	cancel: (id) => api.put(`/leave/cancel/${id}`),
	// 删除请假记录
	delete: (id) => api.del(`/leave/${id}`)
}

// 消息相关接口
export const messageApi = {
	// 获取消息列表
	getList: (params) => api.get('/message/list', params),
	// 标记已读
	markRead: (id) => api.put(`/message/read/${id}`),
	// 删除消息
	delete: (id) => api.del(`/message/${id}`)
}

export default {
	userApi,
	leaveApi,
	messageApi
}