const logger = require('./lib/logger').ctpapp;
const ctp = require('./lib/ctp');
const tevent = require('./lib/traderevent');

const object = require('7hoo/object');

var account = ctp.getAccountByUserID('369888');

var handleMap = {
	OnFrontConnected: function() {
	  logger.info('login : %s', ctp.td.ReqUserLogin(account, ctp.nRequestID()));
	  logger.info('OnFrontConnected')
	},

	OnFrontDisconnected: function(nReason) {
	  logger.info('OnFrontDisconnected nReason: %s', nReason)
	},

	OnRspUserLogin:function(Login, Rsp, nRequestID, bIsLast) {
	  logger.info('OnRspUserLogin : %j, %j, %s, %s', Login, Rsp, nRequestID, bIsLast);
	  ctp.td.ReqQryTradingAccount(account, ctp.nRequestID());
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
	},

	OnRspUserLogout: function(Logout, Rsp, nRequestID,bIsLast) {
	  logger.info('OnRspUserLogout : %j, %j, %s, %s', Logout, Rsp, nRequestID, bIsLast);
	},
	// 报单通知
	OnRtnOrder: function(data) {
	  logger.info('OnRtnOrder: %j',  data)
	},
	// 成交通知
	OnRtnTrade: function(data) {
		// 在这里查资金状况, 根据判断发出通知和出金改密操作
		ctp.td.ReqQryTradingAccount(account, ctp.nRequestID());

	  logger.info('OnRtnTrade:',  data)
	},

	OnRspQryContractBank: function(data, Rsp, nRequestID,bIsLast) {
		logger.info('OnRspQryContractBank: %j',  data)
		logger.info('OnRspQryContractBank: %j, %j, %s, %s', data, Rsp, nRequestID, bIsLast);
	},

	OnRspQryTradingAccount: function(data, Rsp, nRequestID,bIsLast) {
		logger.info('OnRspQryTradingAccount: %j, %j, %s, %s',  data, Rsp, nRequestID,bIsLast);
		tevent.emit('/trade/ReqQryTradingAccount', data);
	},

	OnRspFromFutureToBankByFuture: function(data, Rsp, nRequestID,bIsLast) {
		logger.info('OnRspFromFutureToBankByFuture: %j, %j, %s, %s',  data, Rsp, nRequestID,bIsLast);
	},

	OnRspFromBankToFutureByFuture: function(data, Rsp, nRequestID,bIsLast) {
		// ctp.td.ReqTradingAccountPasswordUpdate({
		// 	BrokerID: '4040',
		// 	AccountID: '',
		// 	OldPassword: '',
		// 	NewPassword: '',
		// 	CurrencyID: ''
		// }, ctp.nRequestID());
	},

	OnRspTradingAccountPasswordUpdate: function(data, Rsp, nRequestID,bIsLast) {
		logger.info('OnRspTradingAccountPasswordUpdate: %j, %j, %s, %s',  data, Rsp, nRequestID,bIsLast)
	}
};

object.forEach(handleMap, function(callback, methodName) {
	ctp.td.On(methodName, callback);
});

//THOST_TERT_RESTART:从本交易日开始重传 0
//THOST_TERT_RESUME:从上次收到的续传    1
//THOST_TERT_QUICK:只传送登录后私有流的内容 2
ctp.td.SubscribePrivateTopic(2);
ctp.td.SubscribePublicTopic(2);

ctp.createTdList();
ctp.registerTdFront();