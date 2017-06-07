const setting = require('../../config/setting.json');

var Engine = require('./engine');
var Match = require('./match');

// 启动回测撮合服务
new Match().start();

var brokeID = '4040';
var st = setting[brokeID];
var accountID = '369863';

var e = new Engine(st.accountMap[accountID]);
e.setStartDateTime('2017/05/22 00:00:00');
e.prepare();

e.start();