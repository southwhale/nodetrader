
const fd = require('./fd');
// maxLogSize是以byte为单位计算的
const log4js = require('log4js');
const cfg = require('../config/logger.json');

fd.ensureDirectory('./logs');

var configure = {
  appenders: [
    { type: 'console' },
    { type: 'file', filename: './logs/ctpapp.log', category: 'ctpapp',  backups: 5, maxLogSize: 2048000 },
    { type: 'file', filename: './logs/schedule.log', category: 'schedule',  backups: 5, maxLogSize: 2048000 },
    // { type: 'file', filename: './logs/notify.log', category: 'notify',  backups: 5, maxLogSize: 2048000 },
    { type: 'file', filename: './logs/email.log', category: 'email',  backups: 5, maxLogSize: 2048000 }
  ],
  replaceConsole: true
};

log4js.configure(configure);

var logger = {};

configure.appenders.forEach(function(appender) {
  var category = appender.category;
  logger[category] = log4js.getLogger(category);
  logger[category].setLevel(cfg.level[category] || cfg.defaultLevel);
});

module.exports = logger;