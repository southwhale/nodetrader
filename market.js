const logger = require('./lib/logger').ctpapp;
const ctp = require('./lib/ctp');

const object = require('7hoo/object');
var observer = require('7hoo/observer');

var account = ctp.getAccountByUserID('369888');

var handleMap = {
	OnFrontConnected: function() {
	  logger.info('login : %s', ctp.md.ReqUserLogin(account, ctp.nRequestID()));
	  logger.info('OnFrontConnected')
	},

	OnFrontDisconnected: function(nReason) {
	  logger.info('OnFrontDisconnected nReason: %s', nReason)
	},

	OnRspUserLogin:function(Login, Rsp, nRequestID, bIsLast) {
	  logger.info('OnRspUserLogin : %j, %j, %s, %s', Login, Rsp, nRequestID, bIsLast);
	 	console.log("subscribe:", ctp.md.SubscribeMarketData(['zn1707', 'ru1709', 'rb1710']));
	},

	OnRspUserLogout: function(Logout, Rsp, nRequestID,bIsLast) {
	  logger.info('OnRspUserLogout : %j, %j, %s, %s', Logout, Rsp, nRequestID, bIsLast);
	},

	OnHeartBeatWarning: function(nTimeLapse) {
	  console.log("OnHeartBeatWarning nTimeLapse:", nTimeLapse);
	},

	OnRspError: function(Rsp, nRequestID, bIsLast) {
    console.log("OnRspError:",  Rsp, nRequestID, bIsLast);
	},

	OnRspSubMarketData: function(Instrument, Rsp, nRequestID, bIsLast) {
    console.log("OnRspSubMarketData:", Instrument, Rsp, nRequestID, bIsLast);
	},

	OnRspUnSubMarketData: function(Instrument, Rsp, nRequestID, bIsLast) {
    console.log("OnRspSubMarketData:", Instrument, Rsp, nRequestID, bIsLast);
	},

	OnRspSubForQuoteRsp: function(Instrument, Rsp, nRequestID, bIsLast) {
    console.log("OnRspSubForQuoteRsp:", Instrument, Rsp, nRequestID, bIsLast);
	},

	OnRspUnSubForQuoteRsp: function(Instrument, Rsp, nRequestID, bIsLast) {
    console.log("OnRspUnSubForQuoteRsp:", Instrument, Rsp, nRequestID, bIsLast);
	},

	OnRtnForQuoteRsp: function(data) {
    console.log("OnRtnDepthMarketData:", data);
	},

	OnRtnDepthMarketData: function(data) {
    console.log("OnRtnDepthMarketData:", data);
	}
};

object.forEach(handleMap, function(callback, methodName) {
	ctp.md.On(methodName, callback);
});

ctp.createMdList();
ctp.registerMdFront();
