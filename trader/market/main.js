const setting = require('../../config/setting.json');

const Ctp = require('../../lib/ctp');
var Engine = require('./engine');

var Trade = require('../../mytrade');
var Market = require('../../mymarket');

require('../main');

var brokeID = '4500';
var st = setting[brokeID];
var accountID = '8010800635';

function start() {
	var ctp = new Ctp(st, accountID);

	new Trade(ctp);
	new Market(ctp);

	new Engine(ctp.getAccountByUserID(accountID)).start();
}

exports.start = start;

