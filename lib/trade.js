const logger = require('./logger').ctpapp;
const _ = require('lodash');

function Trade(ctp, topicMode) {
	this.ctp = ctp;
	this._init(topicMode);
}

(function() {
	this._init = function(topicMode) {
		this._regsiterHandlers();

		this.ctp.createTdApi(this.ctp.accountID);
		//THOST_TERT_RESTART:从本交易日开始重传 0
		//THOST_TERT_RESUME:从上次收到的续传    1
		//THOST_TERT_QUICK:只传送登录后私有流的内容 2
		this.ctp.td.SubscribePrivateTopic(_.isUndefined(topicMode) ? 2 : topicMode);
		this.ctp.td.SubscribePublicTopic(_.isUndefined(topicMode) ? 2 : topicMode);
		this.ctp.registerTdFront();
	};

	this._regsiterHandlers = function() {
		var td = this.ctp.td;
		for (var property in this) {
			if (/^On[a-zA-Z]+$/.test(property)) {
				td.On(property, this[property].bind(this));
			}
		}
	};

	this.OnFrontConnected = function() {
		var account = this.ctp.getAccountByUserID(this.ctp.accountID);
		// 登录失败达到10次, 则释放该账户的ctp对象
		if (!account.loginCount || account.loginCount < 10) {
			account.loginCount = account.loginCount || 0;
			account.loginCount++;
			
			logger.info('Trade->ReqUserLogin : %s', this.ctp.td.ReqUserLogin(this.ctp.getAccountByUserID(this.ctp.accountID), this.ctp.nRequestID()));
	  	logger.info('Trade->OnFrontConnected');
		}
		// else {
		// 	this.ctp.md && this.ctp.md.Dispose();
		// 	this.ctp.td && this.ctp.td.Dispose();
		// }
	};

	this.OnFrontDisconnected = function(nReason) {
	  logger.info('Trade->OnFrontDisconnected nReason: %s', nReason);
	};

	this.OnRspAuthenticate = function(data, rsp, nRequestID, bIsLast) {
	  logger.info('Trade->OnRspAuthenticate : %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};

	this.OnRspUserLogin = function(data, rsp, nRequestID, bIsLast) {
	  logger.info('Trade->OnRspUserLogin : %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	  // 投资者结算结果确认, 做完这一步才可以进行正常的交易
	  this.ctp.td.ReqSettlementInfoConfirm({
	  	BrokerID: data.BrokerID,
	  	InvestorID: data.UserID,
	  	ConfirmDate: data.TradingDay,
	  	ConfirmTime: data.SHFETime
	  }, this.ctp.nRequestID());
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
	// 报单录入请求响应
	this.OnRspOrderInsert = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspOrderInsert: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 报单操作请求响应
	this.OnRspOrderAction = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspOrderAction: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 预埋单录入请求响应
	this.OnRspParkedOrderInsert = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspParkedOrderInsert: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 预埋撤单录入请求响应
	this.OnRspParkedOrderAction = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspParkedOrderAction: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 删除预埋单响应
	this.OnRspRemoveParkedOrder = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspParkedOrderAction: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 删除预埋撤单响应
	this.OnRspRemoveParkedOrderAction = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspParkedOrderAction: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 执行宣告录入请求响应
	this.OnRspExecOrderInsert = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspExecOrderInsert: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 执行宣告操作请求响应
	this.OnRspExecOrderAction = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspExecOrderAction: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 询价录入请求响应
	this.OnRspForQuoteInsert = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspForQuoteInsert: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 报价录入请求响应
	this.OnRspQuoteInsert = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQuoteInsert: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 报价操作请求响应
	this.OnRspQuoteAction = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQuoteAction: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 批量报单操作请求响应
	this.OnRspBatchOrderAction = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspBatchOrderAction: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 申请组合录入请求响应
	this.OnRspCombActionInsert = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspCombActionInsert: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询报单响应
	this.OnRspQryOrder = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryOrder: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询成交响应
	this.OnRspQryTrade = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryTrade: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 查询最大报单数量响应
	this.OnRspQueryMaxOrderVolume = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQueryMaxOrderVolume: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 投资者结算结果确认响应
	this.OnRspSettlementInfoConfirm = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspSettlementInfoConfirm: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询投资者持仓响应
	this.OnRspQryInvestorPosition = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryInvestorPosition: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询签约银行响应
	this.OnRspQryContractBank = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryContractBank: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询资金账户响应
	this.OnRspQryTradingAccount = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryTradingAccount: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 期货发起期货资金转银行应答
	this.OnRspFromFutureToBankByFuture = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspFromFutureToBankByFuture: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 期货发起银行资金转期货应答
	this.OnRspFromBankToFutureByFuture = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspFromBankToFutureByFuture: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
		// ctp.td.ReqTradingAccountPasswordUpdate({
		// 	BrokerID: '4040',
		// 	AccountID: '',
		// 	OldPassword: '',
		// 	NewPassword: '',
		// 	CurrencyID: ''
		// }, ctp.nRequestID());
	};
	// 用户口令更新请求响应
	this.OnRspUserPasswordUpdate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspUserPasswordUpdate: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 资金账户口令更新请求响应
	this.OnRspTradingAccountPasswordUpdate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspTradingAccountPasswordUpdate: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询投资者响应
	this.OnRspQryInvestor = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryInvestor: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询交易编码响应
	this.OnRspQryTradingCode = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryTradingCode: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询合约保证金率响应
	this.OnRspQryInstrumentMarginRate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryInstrumentMarginRate: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询合约手续费率响应 
	this.OnRspQryInstrumentCommissionRate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryInstrumentCommissionRate: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询交易所响应
	this.OnRspQryExchange = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryExchange: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询产品响应
	this.OnRspQryProduct = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryProduct: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询合约响应
	this.OnRspQryInstrument = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryInstrument: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询行情响应
	this.OnRspQryDepthMarketData = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryDepthMarketData: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询投资者结算结果响应
	this.OnRspQrySettlementInfo = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQrySettlementInfo: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询转帐银行响应
	this.OnRspQryTransferBank = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryTransferBank: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询投资者持仓明细响应
	this.OnRspQryInvestorPositionDetail = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryInvestorPositionDetail: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询客户通知响应
	this.OnRspQryNotice = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryNotice: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询结算信息确认响应
	this.OnRspQrySettlementInfoConfirm = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQrySettlementInfoConfirm: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询投资者持仓组合明细响应
	this.OnRspQryInvestorPositionCombineDetail = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryInvestorPositionCombineDetail: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 查询保证金监管系统经纪公司资金账户密钥响应
	this.OnRspQryCFMMCTradingAccountKey = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryCFMMCTradingAccountKey: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询仓单折抵信息响应
	this.OnRspQryEWarrantOffset = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryEWarrantOffset: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询投资者品种/跨品种保证金响应
	this.OnRspQryInvestorProductGroupMargin = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryInvestorProductGroupMargin: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询交易所保证金率响应
	this.OnRspQryExchangeMarginRate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryExchangeMarginRate: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询交易所调整保证金率响应
	this.OnRspQryExchangeMarginRateAdjust = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryExchangeMarginRateAdjust: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询汇率响应
	this.OnRspQryExchangeRate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryExchangeRate: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询二级代理操作员银期权限响应
	this.OnRspQrySecAgentACIDMap = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQrySecAgentACIDMap: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询产品报价汇率响应
	this.OnRspQryProductExchRate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryProductExchRate: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询产品组响应
	this.OnRspQryProductGroup = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryProductGroup: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询做市商合约手续费率响应
	this.OnRspQryMMInstrumentCommissionRate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryMMInstrumentCommissionRate: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询做市商期权合约手续费响应
	this.OnRspQryMMOptionInstrCommRate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryMMOptionInstrCommRate: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询报单手续费响应
	this.OnRspQryInstrumentOrderCommRate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryInstrumentOrderCommRate: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询期权交易成本响应
	this.OnRspQryOptionInstrTradeCost = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryOptionInstrTradeCost: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询期权合约手续费响应
	this.OnRspQryOptionInstrCommRate = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryOptionInstrCommRate: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询执行宣告响应
	this.OnRspQryExecOrder = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryExecOrder: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询询价响应
	this.OnRspQryForQuote = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryForQuote: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询报价响应
	this.OnRspQryQuote = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryQuote: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询组合合约安全系数响应
	this.OnRspQryCombInstrumentGuard = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryCombInstrumentGuard: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询申请组合响应
	this.OnRspQryCombAction = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryCombAction: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询转帐流水响应
	this.OnRspQryTransferSerial = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryTransferSerial: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询银期签约关系响应
	this.OnRspQryAccountregister = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryAccountregister: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 错误应答
	this.OnRspError = function(rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspError: %j, %s, %s', rsp, nRequestID, bIsLast);
	};
	// 报单录入错误回报
	this.OnErrRtnOrderInsert = function(data, rsp) {
		logger.info('Trade->OnErrRtnOrderInsert: %j, %j', data, rsp);
	};
	// 报单操作错误回报
	this.OnErrRtnOrderAction = function(data, rsp) {
		logger.info('Trade->OnErrRtnOrderAction: %j, %j', data, rsp);
	};
	// 合约交易状态通知
	this.OnRtnInstrumentStatus = function(data) {
		logger.info('Trade->OnRtnInstrumentStatus: %j', data);
	};
	// 交易所公告通知
	this.OnRtnBulletin = function(data) {
		logger.info('Trade->OnRtnBulletin: %j', data);
	};
	// 交易通知
	this.OnRtnTradingNotice = function(data) {
		logger.info('Trade->OnRtnTradingNotice: %j', data);
	};
	// 提示条件单校验错误
	this.OnRtnErrorConditionalOrder = function(data) {
		logger.info('Trade->OnRtnErrorConditionalOrder: %j', data);
	};
	// 执行宣告通知
	this.OnRtnExecOrder = function(data) {
		logger.info('Trade->OnRtnExecOrder: %j', data);
	};
	// 执行宣告录入错误回报
	this.OnErrRtnExecOrderInsert = function(data, rsp) {
		logger.info('Trade->OnErrRtnExecOrderInsert: %j, %j', data, rsp);
	};
	// 执行宣告操作错误回报
	this.OnErrRtnExecOrderAction = function(data, rsp) {
		logger.info('Trade->OnErrRtnExecOrderAction: %j, %j', data, rsp);
	};
	// 询价录入错误回报
	this.OnErrRtnForQuoteInsert = function(data, rsp) {
		logger.info('Trade->OnErrRtnForQuoteInsert: %j, %j', data, rsp);
	};
	// 报价通知
	this.OnRtnQuote = function(data) {
		logger.info('Trade->OnRtnQuote: %j', data);
	};
	// 报价录入错误回报
	this.OnErrRtnQuoteInsert = function(data, rsp) {
		logger.info('Trade->OnErrRtnQuoteInsert: %j, %j', data, rsp);
	};
	// 报价操作错误回报
	this.OnErrRtnQuoteAction = function(data, rsp) {
		logger.info('Trade->OnErrRtnQuoteAction: %j, %j', data, rsp);
	};
	// 询价通知
	this.OnRtnForQuoteRsp = function(data) {
		logger.info('Trade->OnRtnForQuoteRsp: %j', data);
	};
	// 保证金监控中心用户令牌
	this.OnRtnCFMMCTradingAccountToken = function(data) {
		logger.info('Trade->OnRtnCFMMCTradingAccountToken: %j', data);
	};
	// 批量报单操作错误回报
	this.OnErrRtnBatchOrderAction = function(data, rsp) {
		logger.info('Trade->OnErrRtnBatchOrderAction: %j, %j', data, rsp);
	};
	// 申请组合通知
	this.OnRtnCombAction = function(data) {
		logger.info('Trade->OnRtnCombAction: %j', data);
	};
	// 申请组合录入错误回报
	this.OnErrRtnCombActionInsert = function(data, rsp) {
		logger.info('Trade->OnErrRtnCombActionInsert: %j, %j', data, rsp);
	};
	// 请求查询预埋撤单响应
	this.OnRspQryParkedOrder = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryParkedOrder: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询交易通知响应
	this.OnRspQryTradingNotice = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryTradingNotice: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询经纪公司交易参数响应
	this.OnRspQryBrokerTradingParams = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryBrokerTradingParams: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询经纪公司交易算法响应
	this.OnRspQryBrokerTradingAlgos = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQryBrokerTradingAlgos: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 请求查询监控中心用户令牌响应
	this.OnRspQueryCFMMCTradingAccountToken = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQueryCFMMCTradingAccountToken: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 银行发起银行资金转期货通知
	this.OnRtnFromBankToFutureByBank = function(data) {
		logger.info('Trade->OnRtnFromBankToFutureByBank: %j', data);
	};
	// 银行发起期货资金转银行通知
	this.OnRtnFromFutureToBankByBank = function(data) {
		logger.info('Trade->OnRtnFromFutureToBankByBank: %j', data);
	};
	// 银行发起冲正银行转期货通知
	this.OnRtnRepealFromBankToFutureByBank = function(data) {
		logger.info('Trade->OnRtnRepealFromBankToFutureByBank: %j', data);
	};
	// 银行发起冲正期货转银行通知
	this.OnRtnRepealFromFutureToBankByBank = function(data) {
		logger.info('Trade->OnRtnRepealFromFutureToBankByBank: %j', data);
	};
	// 期货发起银行资金转期货通知
	this.OnRtnFromBankToFutureByFuture = function(data) {
		logger.info('Trade->OnRtnFromBankToFutureByFuture: %j', data);
	};
	// 期货发起期货资金转银行通知
	this.OnRtnFromFutureToBankByFuture = function(data) {
		logger.info('Trade->OnRtnFromFutureToBankByFuture: %j', data);
	};
	// 系统运行时期货端手工发起冲正银行转期货请求，银行处理完毕后报盘发回的通知
	this.OnRtnRepealFromBankToFutureByFutureManual = function(data) {
		logger.info('Trade->OnRtnRepealFromBankToFutureByFutureManual: %j', data);
	};
	// 系统运行时期货端手工发起冲正期货转银行请求，银行处理完毕后报盘发回的通知
	this.OnRtnRepealFromFutureToBankByFutureManual = function(data) {
		logger.info('Trade->OnRtnRepealFromFutureToBankByFutureManual: %j', data);
	};
	// 期货发起查询银行余额通知
	this.OnRtnQueryBankBalanceByFuture = function(data) {
		logger.info('Trade->OnRtnQueryBankBalanceByFuture: %j', data);
	};
	// 期货发起银行资金转期货错误回报
	this.OnErrRtnBankToFutureByFuture = function(data, rsp) {
		logger.info('Trade->OnErrRtnBankToFutureByFuture: %j, %j', data, rsp);
	};
	// 期货发起期货资金转银行错误回报
	this.OnErrRtnFutureToBankByFuture = function(data, rsp) {
		logger.info('Trade->OnErrRtnFutureToBankByFuture: %j, %',data, rsp);
	};
	// 系统运行时期货端手工发起冲正银行转期货错误回报
	this.OnErrRtnRepealBankToFutureByFutureManual = function(data, rsp) {
		logger.info('Trade->OnErrRtnRepealBankToFutureByFutureManual: %j, %j', data, rsp);
	};
	// 系统运行时期货端手工发起冲正期货转银行错误回报
	this.OnErrRtnRepealFutureToBankByFutureManual = function(data, rsp) {
		logger.info('Trade->OnErrRtnRepealFutureToBankByFutureManual: %j, %j', data, rsp);
	};
	// 期货发起查询银行余额错误回报
	this.OnErrRtnQueryBankBalanceByFuture = function(data, rsp) {
		logger.info('Trade->OnErrRtnQueryBankBalanceByFuture: %j, %j', data, rsp);
	};
	// 期货发起冲正银行转期货请求，银行处理完毕后报盘发回的通知
	this.OnRtnRepealFromBankToFutureByFuture = function(data) {
		logger.info('Trade->OnRtnRepealFromBankToFutureByFuture: %j', data);
	};
	// 期货发起冲正期货转银行请求，银行处理完毕后报盘发回的通知
	this.OnRtnRepealFromFutureToBankByFuture = function(data) {
		logger.info('Trade->OnRtnRepealFromFutureToBankByFuture: %j', data);
	};
	// 期货发起查询银行余额应答 
	this.OnRspQueryBankAccountMoneyByFuture = function(data, rsp, nRequestID, bIsLast) {
		logger.info('Trade->OnRspQueryBankAccountMoneyByFuture: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
	};
	// 银行发起银期开户通知
	this.OnRtnOpenAccountByBank = function(data) {
		logger.info('Trade->OnRtnOpenAccountByBank: %j', data);
	};
	// 银行发起银期销户通知
	this.OnRtnCancelAccountByBank = function(data) {
		logger.info('Trade->OnRtnCancelAccountByBank: %j', data);
	};
	// 银行发起变更银行账号通知
	this.OnRtnChangeAccountByBank = function(data) {
		logger.info('Trade->OnRtnChangeAccountByBank: %j', data);
	};
}).call(Trade.prototype);


module.exports = Trade;