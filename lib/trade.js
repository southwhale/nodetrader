const logger = require('./logger').ctpapp;
const object = require('7hoo/object');

function Trade(ctp, userID, topicMode) {
	this.ctp = ctp;
	this.userID = userID;

	this._init(topicMode);
}

(function() {
	this._init = function(topicMode) {
		this._regsiterHandlers();

		this.ctp.createTdApi(this.userID);
		//THOST_TERT_RESTART:从本交易日开始重传 0
		//THOST_TERT_RESUME:从上次收到的续传    1
		//THOST_TERT_QUICK:只传送登录后私有流的内容 2
		this.ctp.td.SubscribePrivateTopic(lang.isUndefined(topicMode) ? 2 : topicMode);
		this.ctp.td.SubscribePublicTopic(lang.isUndefined(topicMode) ? 2 : topicMode);
		this.ctp.registerTdFront();
	};

	this._regsiterHandlers = function() {
		var td = this.ctp.td;
		object.forEach(this, function(v, k) {
			if (/^On[a-zA-Z]+$/.test(k)) {
				td.On(k, v);
			}
		});
	};

	this.OnFrontConnected = function() {
		logger.info('Trade->ReqUserLogin : %s', this.ctp.td.ReqUserLogin(this.ctp.getAccountByUserID(this.userID), this.ctp.nRequestID()));
	  logger.info('Trade->OnFrontConnected');
	};

	this.OnFrontDisconnected = function(nReason) {
	  logger.info('Trade->OnFrontDisconnected nReason: %s', nReason);
	};

	this.OnRspUserLogin = function(data, rsp, nRequestID, bIsLast) {
	  logger.info('Trade->OnRspUserLogin : %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	  // 投资者结算结果确认, 做完这一步才可以进行正常的交易
	  this.ctp.td.ReqSettlementInfoConfirm({
	  	BrokerID: data.BrokerID,
	  	InvestorID: data.UserID,
	  	ConfirmDate: data.TradingDay,
	  	ConfirmTime: data.SHFETime
	  });
	};

	this.OnRspUserLogout = function(data, rsp, nRequestID, bIsLast) {
	  logger.info('Trade->OnRspUserLogout : %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 报单通知
	this.OnRtnOrder = function(data) {
	  logger.info('Trade->OnRtnOrder: %j',  data)
	};
	// 成交通知
	this.OnRtnTrade = function(data) {
	  logger.info('Trade->OnRtnTrade:',  data);
	};

	this.OnRspQryContractBank = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryContractBank: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};

	this.OnRspQryTradingAccount = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryTradingAccount: %j, %j, %s, %s',  data, rsp, nRequestID, bIsLast);
	};

	this.OnRspFromFutureToBankByFuture = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspFromFutureToBankByFuture: %j, %j, %s, %s',  data, rsp, nRequestID, bIsLast);
	};

	this.OnRspFromBankToFutureByFuture = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspFromBankToFutureByFuture: %j, %j, %s, %s',  data, rsp, nRequestID, bIsLast);
		// ctp.td.ReqTradingAccountPasswordUpdate({
		// 	BrokerID: '4040',
		// 	AccountID: '',
		// 	OldPassword: '',
		// 	NewPassword: '',
		// 	CurrencyID: ''
		// }, ctp.nRequestID());
	};

	this.OnRspTradingAccountPasswordUpdate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspTradingAccountPasswordUpdate: %j, %j, %s, %s',  data, rsp, nRequestID, bIsLast)
	};
}).call(Trade.prototype);


module.exports = Trade;