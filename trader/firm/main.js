const setting = require('../../config/setting.json');

const Ctp = require('../../lib/ctp');
var Engine = require('./engine');

const logger = require('../../lib/logger').ctpapp;


var Trade = require('../../mytrade');
var Market = require('../../mymarket');

// process.on('uncaughtException', function(err) {
//   logger.info('uncaughtException: %j', err);
// });

var brokeID = '4040';
var st = setting[brokeID];
var accountID = '369863';

var ctp = new Ctp(st, accountID);

new Trade(ctp);
new Market(ctp);


require('../main');


new Engine(ctp.getAccountByUserID(accountID)).start();