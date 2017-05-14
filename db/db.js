const Sequelize = require('sequelize');
const cfg = require('../config/db.json');

var sequelize = new Sequelize(
    cfg.database, 		// 数据库名
    cfg.username,   // 用户名
    cfg.password,   // 用户密码
    {
      'dialect': cfg.dialect,  // 数据库使用mysql
      'host': cfg.host, 			 // 数据库服务器ip
      'port': cfg.port,         // 数据库服务器端口
      'pool': cfg.pool
      // 'define': {
      //     // 字段以下划线（_）来分割（默认是驼峰命名风格）
      //     'underscored': true
      // }
    }
);

module.exports = sequelize;