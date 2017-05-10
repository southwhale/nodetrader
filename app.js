const setting = require('./config/setting.json');

const logger = require('./lib/logger').ctpapp;
const mailer = require('./lib/mailer');
const tevent = require('./lib/traderevent');

const ctp = require('./lib/ctp');

const object = require('7hoo/object');
const lang = require('7hoo/lang');

process.on('uncaughtException', function(err) {
  logger.info('uncaughtException: %j', err);
});

ctp.init(setting);

require('./trade');
require('./market');



tevent.on('/trade/ReqQryTradingAccount', function(d) {
	logger.info('/trade/ReqQryTradingAccount: %j', d);
});