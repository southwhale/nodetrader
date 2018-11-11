'use strict';

export const logger = {
	level: {
    app: 'ERROR',
    service: 'ERROR',
    db: 'ERROR',
    ctp: 'ERROR',
	}
};

export const db = {
  database: 'Profile',
  username: 'root',
  password: 'Weiwei-1202',
  dialect: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  logging: true,
  benchmark: false,
  // set: {
  //   autocommit: true
  // },
  // [options.pool.idle] The maximum time, in milliseconds, that a connection can be idle before being released
  // [options.pool.acquire] The maximum time, in milliseconds, that pool will try to get connection before throwing error
  // [options.pool.evict] The time interval, in milliseconds, for evicting stale connections. The default value is 0, which disables this feature.
  pool: {
      max: 50,
      min: 5,
      idle: 100,
      acquire: 5000,
      evict: 1000,
      // autostart: true
  }
};

export const redis = {
  host: '127.0.0.1',
  port: 6379,
  password: 'Weiwei-1202',
  db: 0
};

export const ctp = {
  server: {
    frontend: {
      BrokerID: '4040',// 银河期货
      MdURL: 'tcp://180.166.103.21:51213',
      TdURL: 'tcp://180.166.103.21:51205'
    }
  },
  account: {
    InvestorID: '369754',
    Password: 'iguzhi-1288'
  }
};
