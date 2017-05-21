const object = require('iguzhi/object');
const fd = require('./fd');
// maxLogSize是以byte为单位计算的
const log4js = require('log4js');
const cfg = require('../config/logger.json');

fd.ensureDirectory('./logs');

var configure = {
  appenders: [
    { type: 'console' }
  ],
  replaceConsole: true
};

object.forEach(cfg.level, function(level, category) {
  configure.appenders.append({ type: 'file', filename: './logs/' + category + '.log', category: category,  backups: 5, maxLogSize: 2048000 });
});

log4js.configure(configure);

var logger = {};

configure.appenders.forEach(function(appender) {
  var category = appender.category;
  logger[category] = log4js.getLogger(category);
  logger[category].setLevel(cfg.level[category] || cfg.defaultLevel);
});

module.exports = logger;