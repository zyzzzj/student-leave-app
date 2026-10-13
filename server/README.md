# 学生请假管理APP - 后端服务

基于 Node.js + Express + MySQL 的学生请假管理后端API服务

## 📦 技术栈

- **框架**: Express.js
- **数据库**: MySQL 8.0+
- **认证**: JWT (JSON Web Token)
- **密码加密**: bcryptjs
- **其他**: cors, body-parser, dotenv

## 🚀 快速开始

### 1. 环境要求

- Node.js 14.0+
- MySQL 8.0+

### 2. 安装依赖

```bash
cd server
npm install
```

### 3. 配置数据库

#### 3.1 创建数据库

在MySQL中执行以下SQL脚本：

```bash
mysql -u root -p < database/init.sql
```

或者在MySQL客户端中手动执行 `database/init.sql` 文件中的SQL语句。

#### 3.2 修改配置

复制 `.env.example` 为 `.env`，并修改数据库配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=student_leave_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### 4. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务启动后访问：http://localhost:3000

## 📚 API接口文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token（在请求头中添加 `Authorization: Bearer <token>`）
- **数据格式**: JSON

### 用户接口

#### 1. 用户注册

**POST** `/api/user/register`

请求体：
```json
{
  "phone": "13800138000",
  "code": "123456",
  "password": "123456"
}
```

响应：
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": 1
  }
}
```

#### 2. 用户登录

**POST** `/api/user/login`

请求体：
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

响应：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "phone": "13800138000",
      "nickname": "张三",
      "avatar": null,
      "gender": "男",
      "department": "计算机学院",
      "class": "软件工程2001",
      "studentNo": "2020001"
    }
  }
}
```

#### 3. 获取用户信息

**GET** `/api/user/info`

请求头：
```
Authorization: Bearer <token>
```

响应：
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "phone": "13800138000",
    "nickname": "张三",
    "avatar": null,
    "gender": "男",
    "department": "计算机学院",
    "class": "软件工程2001",
    "studentNo": "2020001",
    "createTime": "2024-03-01T08:00:00.000Z"
  }
}
```

#### 4. 更新用户信息

**PUT** `/api/user/info`

请求头：
```
Authorization: Bearer <token>
```

请求体：
```json
{
  "nickname": "新昵称",
  "avatar": "头像URL",
  "gender": "男",
  "department": "计算机学院",
  "class": "软件工程2001",
  "studentNo": "2020001"
}
```

#### 5. 修改密码

**POST** `/api/user/changePassword`

请求头：
```
Authorization: Bearer <token>
```

请求体：
```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

### 请假接口

#### 1. 提交请假申请

**POST** `/api/leave/apply`

请求头：
```
Authorization: Bearer <token>
```

请求体：
```json
{
  "type": "sick",
  "startTime": "2024-03-01 08:00:00",
  "endTime": "2024-03-02 18:00:00",
  "reason": "感冒发烧，需要休息",
  "phone": "13800138000",
  "images": ["http://example.com/image1.jpg"]
}
```

请假类型：
- `sick`: 病假
- `personal`: 事假
- `annual`: 年假
- `maternity`: 产假
- `other`: 其他

#### 2. 获取请假列表

**GET** `/api/leave/list?page=1&pageSize=10&type=sick&status=pending`

请求头：
```
Authorization: Bearer <token>
```

查询参数：
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认10）
- `type`: 请假类型（可选）
- `status`: 请假状态（可选）

请假状态：
- `pending`: 待审核
- `approved`: 已通过
- `rejected`: 已拒绝
- `cancelled`: 已取消

响应：
```json
{
  "code": 200,
  "data": {
    "list": [...],
    "total": 100,
    "stats": {
      "total": 100,
      "pending": 10,
      "approved": 80,
      "rejected": 10
    }
  }
}
```

#### 3. 获取请假详情

**GET** `/api/leave/:id`

请求头：
```
Authorization: Bearer <token>
```

#### 4. 取消请假

**PUT** `/api/leave/cancel/:id`

请求头：
```
Authorization: Bearer <token>
```

#### 5. 删除请假记录

**DELETE** `/api/leave/:id`

请求头：
```
Authorization: Bearer <token>
```

### 消息接口

#### 1. 获取消息列表

**GET** `/api/message/list?page=1&pageSize=10`

请求头：
```
Authorization: Bearer <token>
```

#### 2. 标记已读

**PUT** `/api/message/read/:id`

请求头：
```
Authorization: Bearer <token>
```

#### 3. 删除消息

**DELETE** `/api/message/:id`

请求头：
```
Authorization: Bearer <token>
```

## 🗄️ 数据库设计

### 用户表 (user)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| phone | VARCHAR(11) | 手机号（唯一） |
| password | VARCHAR(255) | 密码（bcrypt加密） |
| nickname | VARCHAR(50) | 昵称 |
| avatar | VARCHAR(255) | 头像URL |
| gender | VARCHAR(10) | 性别 |
| department | VARCHAR(100) | 学院 |
| class | VARCHAR(50) | 班级 |
| studentNo | VARCHAR(50) | 学号 |
| createTime | DATETIME | 创建时间 |
| updateTime | DATETIME | 更新时间 |

### 请假表 (leave)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| userId | INT | 用户ID（外键） |
| type | VARCHAR(20) | 请假类型 |
| startTime | DATETIME | 开始时间 |
| endTime | DATETIME | 结束时间 |
| reason | TEXT | 请假事由 |
| phone | VARCHAR(11) | 联系电话 |
| images | TEXT | 附件图片URL（逗号分隔） |
| status | VARCHAR(20) | 状态 |
| remark | TEXT | 审核备注 |
| createTime | DATETIME | 申请时间 |
| updateTime | DATETIME | 更新时间 |

### 消息表 (message)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| userId | INT | 用户ID（外键） |
| leaveId | INT | 关联请假ID（外键） |
| title | VARCHAR(100) | 消息标题 |
| content | TEXT | 消息内容 |
| isRead | TINYINT(1) | 是否已读 |
| createTime | DATETIME | 创建时间 |

## 🧪 测试账号

SQL脚本中已创建3个测试账号：

| 手机号 | 密码 | 昵称 |
|--------|------|------|
| 13800138000 | 123456 | 张三 |
| 13800138001 | 123456 | 李四 |
| 13800138002 | 123456 | 王五 |

**注意**：测试账号的密码需要在数据库中手动更新为bcrypt加密后的密码。

## 📁 项目结构

```
server/
├── database/
│   └── init.sql              # 数据库初始化脚本
├── src/
│   ├── app.js                # 应用入口
│   ├── config/
│   │   └── database.js       # 数据库配置
│   ├── middleware/
│   │   └── auth.js           # JWT认证中间件
│   └── routes/
│       ├── userRoutes.js     # 用户路由
│       ├── leaveRoutes.js    # 请假路由
│       └── messageRoutes.js  # 消息路由
├── .env                      # 环境配置
├── .env.example              # 环境配置示例
├── package.json              # 项目依赖
└── README.md                 # 说明文档
```

## ⚠️ 注意事项

1. **密码加密**：测试账号的密码需要使用bcrypt加密后更新到数据库
2. **JWT密钥**：生产环境请修改 `.env` 中的 `JWT_SECRET` 为强密钥
3. **CORS配置**：当前允许所有跨域请求，生产环境应限制域名
4. **图片上传**：当前仅保存图片URL，实际项目需要实现图片上传功能
5. **验证码**：当前注册接口未实现真实的验证码验证，生产环境需要接入短信服务

## 🔧 常见问题

### 1. 数据库连接失败

检查 `.env` 文件中的数据库配置是否正确，MySQL服务是否启动。

### 2. Token无效

检查请求头中的 `Authorization` 字段格式是否正确：`Bearer <token>`

### 3. 端口冲突

修改 `.env` 文件中的 `PORT` 配置为其他可用端口。

## 📝 更新日志

### v1.0.0 (2024-03-01)
- 完成用户系统接口
- 完成请假管理接口
- 完成消息通知接口
- 实现JWT认证
- 实现密码加密