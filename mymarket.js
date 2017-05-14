const logger = require('./lib/logger').ctpapp;
const tevent = require('./lib/traderevent');

const Class = require('7hoo/class');

function Market(ctp, userID) {
	this.$superConstructor(arguments);
}

(function() {

	this.OnRspUserLogin = function(Login, Rsp, nRequestID, bIsLast) {
	  logger.info('OnRspUserLogin : %j, %j, %s, %s', Login, Rsp, nRequestID, bIsLast);
	 	console.log("SubscribeMarketData:", this.ctp.md.SubscribeMarketData(['zn1707', 'ru1709', 'rb1710']));
	};

	this.OnRspSubMarketData = function(Instrument, Rsp, nRequestID, bIsLast) {
    console.log("OnRspSubMarketData:", Instrument, Rsp, nRequestID, bIsLast);
	};

	this.OnRspUnSubMarketData = function(Instrument, Rsp, nRequestID, bIsLast) {
    console.log("OnRspSubMarketData:", Instrument, Rsp, nRequestID, bIsLast);
	};

	this.OnRtnDepthMarketData = function(data) {
    console.log("OnRtnDepthMarketData:", data);
	};
}).call(Market.prototype);

Class.inherit(Market, require('./lib/market'));

module.exports = Market;


