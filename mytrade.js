const logger = require('./lib/logger').ctpapp;
const ntevent = require('./lib/ntevent');

const Class = require('iguzhi/class');

function Trade(ctp, userID) {
	this.$superConstructor(arguments);
}

(function() {

	this.OnRspUserLogin = function(data, rsp, nRequestID, bIsLast) {
	  logger.info('OnRspUserLogin : %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	  // 投资者结算结果确认, 做完这一步才可以进行正常的交易
	  this.ctp.td.ReqSettlementInfoConfirm({
	  	BrokerID: data.BrokerID,
	  	InvestorID: data.UserID,
	  	ConfirmDate: data.TradingDay,
	  	ConfirmTime: data.SHFETime
	  }, this.ctp.nRequestID());

	  // 查询交易所信息
	  this.ctp.td.ReqQryExchange({}, this.ctp.nRequestID());
	};

	this.OnRspUserLogout = function(data, rsp, nRequestID, bIsLast) {
	  logger.info('OnRspUserLogout : %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询交易所响应
	this.OnRspQryExchange = function(data, rsp, nRequestID, bIsLast) {
		ntevent.emit('/trade/OnRspQryExchange', data);
		// 查询产品信息
		if (bIsLast) {
			var me = this;
			// 查询交易所和查询产品同属于查询接口, 时间间隔至少为1秒
			setTimeout(function() {
				me.ctp.td.ReqQryProduct({}, me.ctp.nRequestID());
			}, 1000);
		}
	};
	// 请求查询产品响应
	this.OnRspQryProduct = function(data, rsp, nRequestID, bIsLast) {
		ntevent.emit('/trade/OnRspQryProduct', data);
		bIsLast && ntevent.emit('/market/SubscribeMarketData', this.ctp);
	};
	// 报单通知
	this.OnRtnOrder = function(data) {
	  ntevent.emit('/trade/OnRtnOrder', data);
	};
	// 成交通知
	this.OnRtnTrade = function(data) {
		// 在这里查资金状况, 根据判断发出通知和出金改密操作
		// 平仓: OffsetFlag==3, 开仓: OffsetFlag==0
		// data.OffsetFlag != 0 && this.ctp.td.ReqQryTradingAccount(this.ctp.getAccountByUserID(data.InvestorID), this.ctp.nRequestID());
	  ntevent.emit('/trade/OnRtnTrade', data);
	};

	// 报单操作请求响应
	this.OnRspOrderAction = function(data, rsp, nRequestID, bIsLast) {
		ntevent.emit('/trade/OnRspOrderAction', data, rsp,  nRequestID, bIsLast);
	};

	this.OnRspQryTradingAccount = function(data, rsp, nRequestID, bIsLast) {
		// logger.info('OnRspQryTradingAccount: %j, %j, %s, %s',  data, rsp, nRequestID, bIsLast);
		ntevent.emit('/trade/OnRspQryTradingAccount', data, rsp, nRequestID, bIsLast);
	};

	// 请求查询投资者持仓响应
	this.OnRspQryInvestorPosition = function(data, rsp, nRequestID, bIsLast) {
		logger.info('OnRspQryInvestorPosition: %j, %j, %s, %s',  data, rsp, nRequestID, bIsLast);
		ntevent.emit('/trade/OnRspQryInvestorPosition', data, rsp, nRequestID, bIsLast);
	};

	this.OnRtnFromFutureToBankByFuture = function(data) {
		logger.info('OnRtnFromFutureToBankByFuture: %j',  data);
	};

	this.OnRtnFromBankToFutureByFuture = function(data) {
		logger.info('OnRtnFromBankToFutureByFuture: %j',  data);
		// ctp.td.ReqTradingAccountPasswordUpdate({
		// 	BrokerID: '4040',
		// 	AccountID: '',
		// 	OldPassword: '',
		// 	NewPassword: '',
		// 	CurrencyID: ''
		// }, ctp.nRequestID());
	};

	this.OnRspTradingAccountPasswordUpdate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('OnRspTradingAccountPasswordUpdate: %j, %j, %s, %s',  data, rsp, nRequestID, bIsLast)
	};
}).call(Trade.prototype);

Class.inherit(Trade, require('./lib/trade'));

module.exports = Trade;