-- 创建数据库
CREATE DATABASE IF NOT EXISTS student_leave_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE student_leave_db;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  `phone` VARCHAR(11) NOT NULL UNIQUE COMMENT '手机号',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `gender` VARCHAR(10) DEFAULT NULL COMMENT '性别',
  `department` VARCHAR(100) DEFAULT NULL COMMENT '学院',
  `class` VARCHAR(50) DEFAULT NULL COMMENT '班级',
  `createTime` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 请假表
CREATE TABLE IF NOT EXISTS `leave` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  `userId` INT NOT NULL COMMENT '用户ID',
  `type` VARCHAR(20) NOT NULL COMMENT '请假类型',
  `startTime` DATETIME NOT NULL COMMENT '开始时间',
  `endTime` DATETIME NOT NULL COMMENT '结束时间',
  `reason` TEXT NOT NULL COMMENT '请假事由',
  `phone` VARCHAR(11) NOT NULL COMMENT '联系电话',
  `images` TEXT DEFAULT NULL COMMENT '附件图片URL，逗号分隔',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending待审核, approved已通过, rejected已拒绝, cancelled已取消',
  `remark` TEXT DEFAULT NULL COMMENT '审核备注',
  `createTime` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `updateTime` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_userId` (`userId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_type` (`type`),
  FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='请假表';

-- 消息表
CREATE TABLE IF NOT EXISTS `message` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  `userId` INT NOT NULL COMMENT '用户ID',
  `leaveId` INT DEFAULT NULL COMMENT '关联请假ID',
  `title` VARCHAR(100) NOT NULL COMMENT '消息标题',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `isRead` TINYINT(1) DEFAULT 0 COMMENT '是否已读：0未读, 1已读',
  `createTime` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_userId` (`userId`),
  INDEX `idx_isRead` (`isRead`),
  FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`leaveId`) REFERENCES `leave`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- 插入测试用户（密码：123456）
INSERT INTO `user` (`phone`, `password`, `nickname`, `gender`, `department`, `class`) VALUES
('13800138000', '$2b$10$YourHashedPasswordHere', 'zhangsan', 'M', 'Computer Science', 'SE2001'),
('13800138001', '$2b$10$YourHashedPasswordHere', 'lisi', 'F', 'Computer Science', 'SE2001'),
('13800138002', '$2b$10$YourHashedPasswordHere', 'wangwu', 'M', 'Electronic Eng', 'CE2001');

-- 插入测试请假数据
INSERT INTO `leave` (`userId`, `type`, `startTime`, `endTime`, `reason`, `phone`, `status`) VALUES
(1, 'sick', '2024-03-01 08:00:00', '2024-03-02 18:00:00', '感冒发烧，需要休息', '13800138000', 'approved'),
(1, 'personal', '2024-03-10 08:00:00', '2024-03-10 18:00:00', '家里有事需要处理', '13800138000', 'pending'),
(2, 'sick', '2024-03-05 08:00:00', '2024-03-06 18:00:00', '身体不适，去医院检查', '13800138001', 'approved'),
(2, 'annual', '2024-03-15 08:00:00', '2024-03-17 18:00:00', '年假休息', '13800138001', 'pending'),
(3, 'personal', '2024-03-08 08:00:00', '2024-03-08 18:00:00', '参加重要活动', '13800138002', 'rejected');

-- 插入测试消息数据
INSERT INTO `message` (`userId`, `leaveId`, `title`, `content`, `isRead`) VALUES
(1, 1, '请假审批通过', '您的病假申请已审批通过，请注意休息', 1),
(1, 2, '请假申请已提交', '您的事假申请已提交，等待审批', 0),
(2, 3, '请假审批通过', '您的病假申请已审批通过，请注意身体', 1),
(2, 4, '请假申请已提交', '您的年假申请已提交，等待审批', 0),
(3, 5, '请假审批未通过', '您的事假申请未通过审批，请联系辅导员', 1);