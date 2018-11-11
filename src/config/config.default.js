'use strict';

export const app = {
	env: process.env.NODE_ENV || 'dev',
};

export const logger = {
	defaultLevel: 'ERROR',
};

export const db = {
  database: 'numgame',
  username: 'root',
  password: 'Weiwei-1202',
  dialect: 'mysql',
  host: '119.3.27.228',
  port: 3306,
  logging: true,
  benchmark: false,
  // set: {
  //   autocommit: true
  // },
  pool: {
      max: 50,
      min: 5,
      // idle: 30000,
      // acquire: 20000,
      // evict: 20000,
      // autostart: true
  }
};

export const redis = {
  host: '192.168.1.188',
  port: 6379,
  // password: 'Weiwei-1202',
  db: 0
};
