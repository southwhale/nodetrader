const logger = require('./lib/logger').ctpapp;
const tevent = require('./lib/traderevent');

const Class = require('7hoo/class');

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
	  });
	  // ctp.td.ReqQryTradingAccount(account, ctp.nRequestID());
	  //logger.info('ReqQryTradingAccount=', ctp.td.ReqQryTradingAccount(q, (new Date()).valueOf()/1000));
	  //sleep(2000);
	  //logger.info('ReqQryInvestorPosition=', ctp.td.ReqQryInvestorPosition(q, (new Date()).valueOf()/1000));
	  //logger.info('ReqQryTrade=', ctp.td.ReqQryTrade(q, (new Date()).valueOf()/1000));
	  //logger.info('ReqQryOrder=', ctp.td.ReqQryOrder(q, (new Date()).valueOf()/1000));
	  //logger.info('ReqQryProduct=', ctp.td.ReqQryProduct(q, (new Date()).valueOf()/1000));
	  //logger.info('ReqQryInstrument=', ctp.td.ReqQryInstrument(q, (new Date()).valueOf()/1000));
	  //logger.info('-----before ReqQryContractBank-----')
	  // ctp.td.ReqQryContractBank({
	  // 	BankID: '5',
			// BankBranchID: '0000',
			// BrokerID: '4040',
	  // }, ctp.nRequestID());
	  // logger.info('-----after ReqQryContractBank-----')

	  //ReqFromBankToFutureByFuture
		// ctp.td.ReqFromFutureToBankByFuture({
		// 	TradeCode: '202002',
		// 	BankID: '5',
		// 	BankBranchID: '0000',
		// 	BrokerID: '4040',
		// 	BankAccount: '', // 是否必填, 不确定
		// 	BankPassWord: '',
		// 	AccountID: account.UserID,
		// 	Password: account.FundPassword,
		// 	SecuPwdFlag: '1',// 明文核对
		// 	CurrencyID: 'CNY',
		// 	TradeAmount: 2000
		// }, ctp.nRequestID());

		// ctp.td.ReqFromBankToFutureByFuture({
		// 	TradeCode: '202001',
		// 	BankID: '5',
		// 	BankBranchID: '0000',
		// 	BrokerID: '4040',
		// 	BankAccount: '', // 是否必填, 不确定
		// 	BankPassWord: '',
		// 	AccountID: account.UserID,
		// 	Password: account.FundPassword,
		// 	SecuPwdFlag: '1',// 明文核对
		// 	CurrencyID: 'CNY',
		// 	TradeAmount: 2000
		// }, ctp.nRequestID());
	};

	this.OnRspUserLogout = function(data, rsp, nRequestID, bIsLast) {
	  logger.info('OnRspUserLogout : %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 报单通知
	this.OnRtnOrder = function(data) {
	  // logger.info('OnRtnOrder: %j',  data)
	};
	// 成交通知
	this.OnRtnTrade = function(data) {
		// 在这里查资金状况, 根据判断发出通知和出金改密操作
		// 平仓: OffsetFlag==3, 开仓: OffsetFlag==0
		data.OffsetFlag && this.ctp.td.ReqQryTradingAccount(this.ctp.getAccountByUserID(data.InvestorID), this.ctp.nRequestID());
	  logger.info('OnRtnTrade:',  data);
	};

	this.OnRspQryTradingAccount = function(data, rsp, nRequestID, bIsLast) {
		logger.info('OnRspQryTradingAccount: %j, %j, %s, %s',  data, rsp, nRequestID, bIsLast);
		tevent.emit('/trade/ReqQryTradingAccount', data);
	};

	this.OnRspFromFutureToBankByFuture = function(data, rsp, nRequestID, bIsLast) {
		logger.info('OnRspFromFutureToBankByFuture: %j, %j, %s, %s',  data, rsp, nRequestID, bIsLast);
	};

	this.OnRspFromBankToFutureByFuture = function(data, rsp, nRequestID, bIsLast) {
		logger.info('OnRspFromBankToFutureByFuture: %j, %j, %s, %s',  data, rsp, nRequestID, bIsLast);
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