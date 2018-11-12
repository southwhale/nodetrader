'use strict';

import Sequelize from 'sequelize';
import { db as cfg } from 'config';
import { getLogger } from 'logger';

const logger = getLogger('db');

const sequelize = new Sequelize(
    cfg.database,   // 数据库名
    cfg.username,   // 用户名
    cfg.password,   // 用户密码
    {
      dialect: cfg.dialect,   // 数据库使用mysql
      host: cfg.host,         // 数据库服务器ip
      port: cfg.port,         // 数据库服务器端口
      pool: cfg.pool,
      logging: cfg.logging && function(sql) {
        logger.info(sql);
      },
      benchmark: cfg.benchmark, // 是否打印sql执行时间
      // 'define': {
      //   字段以下划线（_）来分割（默认是驼峰命名风格）
      //   underscored: true,
      //   engine: 'INNO_DB' // 设置mysql数据库引擎, INNO_DB or MYISAM
      // }
    }
);

sequelize.sync({ force: false });
// SET AUTOCOMMIT = 0 执行这条sql可能会提高InnoDB类型数据库的性能
export default sequelize;