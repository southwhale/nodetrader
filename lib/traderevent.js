// 用于取代observer
const EventEmitter = require('events');

class TraderEmitter extends EventEmitter {}

module.exports = new TraderEmitter();