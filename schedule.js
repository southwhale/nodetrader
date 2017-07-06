const schedule = require('node-schedule');
const logger = require('./lib/logger').schedule;
var ctpmgr = require('./lib/ctpmanager');

const object = require('iguzhi/object');

var argv = require('yargs').argv;

var engine = argv.e || argv.engine;

if (!engine) {
  console.error('缺少参数: --e 或 --engine');
}

switch(engine) {
  case 'f':
    engine = 'firm';
    break;
  case 'ft':
    engine = 'firmtest';
    break;
  case 'bt':
    engine = 'backtest';
    break;
  case 'm':
    engine = 'market';
    break;
}

function start() {
  require('./trader/' + engine + '/main');
}

function stop() {
  ctpmgr.disposeAll();
}


schedule.scheduleJob('0 45 08 * * 1-5', function() {
  logger.info('run schedule @ 0 45 08 * * 1-5!');
  start();
});

schedule.scheduleJob('0 45 20 * * 1-5', function() {
  logger.info('run schedule @ 0 45 20 * * 1-5!');
  start();
});

schedule.scheduleJob('0 31 02 * * 2-6', function() {
  logger.info('run schedule @ 0 31 02 * * 2-6!');
  stop();
});

////////
schedule.scheduleJob('0 16 15 * * 1-5', function() {
  logger.info('run schedule @ 0 16 15 * * 1-5!');
  stop();
});


////////////////////////////////////////////////////////////////////////

var dt = new Date();
var h = dt.getHours();
var m = dt.getMinutes();
var w = dt.getDay();

h = h < 10 ? '0' + h : h;
m = m < 10 ? '0' + m : m;
hm = h + ':' + m;

if (w >= 1 && w <= 5) {
  if (hm >= '08:45' && hm <= '15:30' || hm >='20:45' && hm <= '23:59') {
    start();
  }
  else if (hm >= '00:00' && hm <= '02:35' && w >= 2) {
    start();
  }
}
else if (w == 6 && hm >= '00:00' && hm <= '02:35') {
  start();
}