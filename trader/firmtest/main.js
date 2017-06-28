const setting = require('../../config/setting.json');

const Ctp = require('../../lib/ctp');
var Engine = require('./engine');
var Match = require('../backtest/match');

var Trade = require('../../mytrade');
var Market = require('../../mymarket');

// 启动回测撮合服务
new Match().start();


var brokeID = '4500';
var st = setting[brokeID];
var accountID = '8010800635';

var ctp = new Ctp(st, accountID);

new Trade(ctp);
new Market(ctp);


require('../main');

new Engine(ctp.getAccountByUserID(accountID)).start();