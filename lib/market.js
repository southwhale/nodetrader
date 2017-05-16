const logger = require('./logger').ctpapp;

function Market(ctp) {
	this.ctp = ctp;
	this._init();
}

(function() {
	this._init = function() {
		this._regsiterHandlers();

		this.ctp.createMdApi(this.ctp.accountID);
		this.ctp.registerMdFront();
	};

	this._regsiterHandlers = function() {
		var md = this.ctp.md;
		for (var property in this) {
			if (/^On[a-zA-Z]+$/.test(property)) {
				md.On(property, this[property].bind(this));
			}
		}
	};

	this.OnFrontConnected = function() {
	  logger.info('Market->ReqUserLogin : %s', this.ctp.md.ReqUserLogin(this.ctp.getAccountByUserID(this.ctp.accountID), this.ctp.nRequestID()));
	  logger.info('Market->OnFrontConnected');
	};

	this.OnFrontDisconnected = function(nReason) {
	  logger.info('Market->OnFrontDisconnected nReason: %s', nReason);
	};

	this.OnRspUserLogin = function(data, rsp, nRequestID, bIsLast) {
	  logger.info('Market->OnRspUserLogin: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};

	this.OnRspUserLogout = function(data, rsp, nRequestID, bIsLast) {
	  logger.info('Market->OnRspUserLogout: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};

	this.OnRspError = function(rsp, nRequestID, bIsLast) {
    logger.info('Market->OnRspError: %j, %s, %s', rsp, nRequestID, bIsLast);
	};

	this.OnRspSubMarketData = function(data, rsp, nRequestID, bIsLast) {
    logger.info('Market->OnRspSubMarketData: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};

	this.OnRspUnSubMarketData = function(data, rsp, nRequestID, bIsLast) {
    logger.info('Market->OnRspSubMarketData: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};

	this.OnRspSubForQuoteRsp = function(data, rsp, nRequestID, bIsLast) {
    logger.info('Market->OnRspSubForQuoteRsp: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};

	this.OnRspUnSubForQuoteRsp = function(data, rsp, nRequestID, bIsLast) {
    logger.info('Market->OnRspUnSubForQuoteRsp: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};

	this.OnRtnForQuoteRsp = function(data) {
    logger.info('Market->OnRtnForQuoteRsp: %j', data);
	};

	this.OnRtnDepthMarketData = function(data) {
    logger.info('Market->OnRtnDepthMarketData: %j', data);
	};
}).call(Market.prototype);


module.exports = Market;


