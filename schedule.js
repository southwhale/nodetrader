const shell = require('shelljs');
const schedule = require('node-schedule');
const logger = require('./lib/logger').schedule;
const ctpmgr = require('./lib/ctpmanager');

function start() {
  shell.exec('pm2 start app.js -- --e=m');
}

function stop() {
  ctpmgr.disposeAll();
  shell.exec('pm2 stop app');
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