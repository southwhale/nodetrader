const setting = require('./config/setting.json');

const logger = require('./lib/logger').ctpapp;
const mailer = require('./lib/mailer');

const ctp = require('./lib/ctp');

const object = require('7hoo/object');
const lang = require('7hoo/lang');
var observer = require('7hoo/observer');

ctp.init(setting);

require('./trade');
require('./market');



observer.watch('/trade/ReqQryTradingAccount', function(d) {
	logger.info('/trade/ReqQryTradingAccount: %j', d);
});