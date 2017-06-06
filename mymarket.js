const logger = require('./lib/logger').ctpapp;
const ntevent = require('./lib/ntevent');

const Class = require('iguzhi/class');

function Market(ctp, userID) {
	this.$superConstructor(arguments);
}

(function() {

	this.OnRspUserLogin = function(data, rsp, nRequestID, bIsLast) {
	  logger.info('OnRspUserLogin : %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};

	this.OnRspSubMarketData = function(data, rsp, nRequestID, bIsLast) {
    logger.info("OnRspSubMarketData: %j, %j, %s, %s", data, rsp, nRequestID, bIsLast);
	};

	this.OnRspUnSubMarketData = function(data, rsp, nRequestID, bIsLast) {
    logger.info("OnRspSubMarketData: %j, %j, %s, %s", data, rsp, nRequestID, bIsLast);
	};

	this.OnRtnDepthMarketData = function(data) {
    ntevent.emit('/market/OnRtnDepthMarketData', data);
	};
}).call(Market.prototype);

Class.inherit(Market, require('./lib/market'));

module.exports = Market;


