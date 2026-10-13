<script>
export default {
	onLaunch: function() {
		console.log('App Launch')
		// 检查登录状态
		const token = uni.getStorageSync('token')
		if (!token) {
			uni.removeStorageSync('userInfo')
		}
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	}
}
</script>

<style>
@import "./common/common.css";
</style>