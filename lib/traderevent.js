// 用于取代observer
const logger = require('./logger').ctpapp;
const EventEmitter = require('events');

class TraderEmitter extends EventEmitter {}

var tevent = new TraderEmitter();

tevent.on('error', function(err) {
  logger.info('traderevent error: %j', err);
});

module.exports = tevent;