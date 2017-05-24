const logger = require('./lib/logger').ctpapp;
const tevent = require('./lib/ntevent');

const Class = require('iguzhi/class');

function Market(ctp, userID) {
	this.$superConstructor(arguments);
}

(function() {

	this.OnRspUserLogin = function(data, rsp, nRequestID, bIsLast) {
	  logger.info('OnRspUserLogin : %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	 	console.log("SubscribeMarketData:", this.ctp.md.SubscribeMarketData(this.ctp.getAccountByUserID(this.ctp.accountID).Strategy.subscribeInstrumentIDList));
	};

	this.OnRspSubMarketData = function(data, rsp, nRequestID, bIsLast) {
    console.log("OnRspSubMarketData:", data, rsp, nRequestID, bIsLast);
	};

	this.OnRspUnSubMarketData = function(data, rsp, nRequestID, bIsLast) {
    console.log("OnRspSubMarketData:", data, rsp, nRequestID, bIsLast);
	};

	this.OnRtnDepthMarketData = function(data) {
    tevent.emit('/market/OnRtnDepthMarketData', data);
	};
}).call(Market.prototype);

Class.inherit(Market, require('./lib/market'));

module.exports = Market;


