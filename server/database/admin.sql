-- 创建管理员表
CREATE TABLE IF NOT EXISTS `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '管理员账号',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `name` varchar(50) DEFAULT NULL COMMENT '姓名',
  `role` varchar(20) DEFAULT 'admin' COMMENT '角色',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 插入默认管理员账号（密码: admin123）
INSERT INTO `admin` (`username`, `password`, `name`, `role`) VALUES
('admin', '$2a$10$LuDNJhUdniheLdGTN7uAaOBl1.hpmpGLJDmwWOPLJdgKN0h9L/aja', '系统管理员', 'admin');