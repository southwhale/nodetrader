const setting = require('./config/setting.json');

const logger = require('./lib/logger').ctpapp;
const mailer = require('./lib/mailer');
const ntevent = require('./lib/ntevent');

const Ctp = require('./lib/ctp');

const object = require('iguzhi/object');
const lang = require('iguzhi/lang');
const string = require('iguzhi/string');

var Trade = require('./mytrade');
var Market = require('./mymarket');

process.on('uncaughtException', function(err) {
  logger.info('uncaughtException: %j', err);
});

object.forEach(setting, function(st, brokeID) {
	object.forEach(st.accountMap, function(account, accountID) {
		var ctp = new Ctp(st, accountID);

		new Trade(ctp);
		new Market(ctp);
	});
});