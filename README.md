# 学生请假管理APP

基于UniApp开发的学生请假管理跨平台应用

## 项目结构

```
├── apis/              # API请求封装
│   ├── index.js       # 接口统一管理
│   └── request.js     # 请求封装
├── common/            # 公共样式
│   └── common.css     # 全局样式
├── components/        # 可复用组件
│   └── StatusCard/    # 状态卡片组件
├── pages/             # 页面文件
│   ├── index/         # 首页
│   ├── login/         # 登录注册页
│   ├── apply/         # 请假申请页
│   ├── record/        # 请假记录页
│   ├── detail/        # 请假详情页
│   ├── profile/       # 个人中心页
│   ├── message/       # 消息通知页
│   └── editProfile/   # 编辑资料页
├── static/            # 静态资源
│   └── tab/           # 底部导航图标
├── utils/             # 工具函数
│   └── format.js      # 格式化函数
├── App.vue            # 应用入口
├── main.js            # 主入口文件
├── pages.json         # 页面配置
├── manifest.json      # 应用配置
└── package.json       # 项目依赖
```

## 功能模块

### 1. 用户系统
- 手机号注册/登录
- 验证码获取
- 个人信息编辑（昵称、头像、性别、学院、班级、学号）
- 退出登录

### 2. 核心服务模块
- 请假申请（病假、事假、年假、产假、其他）
- 时间段选择
- 请假事由填写
- 附件上传
- 请假状态查询（待审核、已通过、已拒绝、已取消）
- 请假取消

### 3. 数据管理模块
- 请假记录列表
- 请假详情查看
- 数据筛选（按类型、按状态）
- 下拉刷新
- 上拉加载更多
- 数据删除
- 本地缓存

### 4. 交互反馈模块
- 加载状态提示（uni.showLoading）
- 操作结果通知（uni.showToast）
- 关键操作确认（uni.showModal）
- 表单验证（手机号正则校验）

## 技术特性

### 页面与交互
- 统一设计风格（common.css）
- 底部TabBar导航
- 页面跳转与参数传递
- 下拉刷新
- 上拉加载更多
- 表单验证
- 图片上传与预览

### 兼容性
- Android 8.0+
- iOS 12.0+
- 多端适配

### 性能优化
- 图片懒加载
- 条件渲染（v-if/v-show）
- 数据缓存
- 请求拦截

## 开发环境

### 环境要求
- HBuilderX 3.0+
- Node.js 12.0+

### 运行项目
1. 使用HBuilderX打开项目目录
2. 运行到浏览器或模拟器
3. 打包发布

### 打包配置
- Android: manifest.json中配置minSdkVersion=26
- iOS: manifest.json中配置deploymentTarget=12.0

## API接口说明

### 用户接口
- POST /api/user/login - 用户登录
- POST /api/user/register - 用户注册
- GET /api/user/info - 获取用户信息
- PUT /api/user/info - 更新用户信息

### 请假接口
- POST /api/leave/apply - 提交请假申请
- GET /api/leave/list - 获取请假列表
- GET /api/leave/:id - 获取请假详情
- PUT /api/leave/cancel/:id - 取消请假
- DELETE /api/leave/:id - 删除请假记录

### 消息接口
- GET /api/message/list - 获取消息列表
- PUT /api/message/read/:id - 标记已读
- DELETE /api/message/:id - 删除消息

## 测试说明

### 功能测试
1. 登录注册功能
2. 请假申请流程
3. 请假记录查询
4. 消息通知功能
5. 个人信息管理

### 兼容性测试
- Android 8.0+
- iOS 12.0+

### 性能测试
- 首次启动时间 < 3秒
- 页面切换流畅度
- 数据加载效率

## 注意事项

1. 需要在static/tab目录放置底部导航图标
2. 需要在static目录放置默认头像default-avatar.png
3. API地址在apis/request.js中配置
4. 图标素材需自行准备，禁止使用商业品牌素材

## 开发规范

1. 页面文件放在pages目录下，每个页面单独建文件夹
2. 组件放在components目录下
3. 工具函数放在utils目录下
4. API接口统一管理在apis目录下
5. 公共样式放在common目录下

## 版本历史

- v1.0.0 - 初始版本
  - 完成基础功能开发
  - 实现用户系统
  - 实现请假管理
  - 实现消息通知