// 用于取代observer
const logger = require('./logger').ctpapp;
const EventEmitter = require('events');

class NTEventEmitter extends EventEmitter {}

var ntevent = new NTEventEmitter();

ntevent.on('error', function(err) {
  logger.info('ntevent error: %j', err);
});

module.exports = ntevent;