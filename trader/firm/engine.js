const Class = require('iguzhi/class');
const Tick = require('../../db/model/tick');
const ntevent = require('../../lib/ntevent');
const moment = require('moment');
const BarModel = require('../../db/model/bar');
const dbLogger = require('../../lib/logger').db;
const Order = require('../base/order');
const dict = require('../base/dict');

function Engine() {
	this.$superConstructor(arguments);
	this.engineName = 'FirmEngine';
	this.orderRef = 0;
}

(function() {

	// 保存指标到数据库
	this.saveBar = function(bar) {
		// 这里用sequelize实现保存操作
	  BarModel.create(bar).then(function (p) {
	    dbLogger.info('save bar to db: %j', p);
	  })
	  .catch(function (err) {
	    dbLogger.error('failed save bar to db: %j', err);
	  });
	};

	/**
   * @param order {object} 订单, 用于填充Order实例, 需要提供如下字段:
   * {
	 *		InstrumentID: 'rb1710', // 合约
	 *		Direction: dict.Direction_Buy || dict.Direction_Sell, // 买卖
	 *		CombOffsetFlag: dict.OffsetFlag_Open || dict.OffsetFlag_Close || dict.OffsetFlag_CloseToday || dict.OffsetFlag_CloseYesterday, // 开平
	 *		LimitPrice: 3200, // 价格
	 *		VolumeTotalOriginal: 100 // 数量
   * }
   * 发送订单
   */
  this.sendOrder = function(order) {
  	var o = new Order();

  	o.OrderPriceType = dict.PriceType_LimitPrice;
  	o.CombHedgeFlag = dict.HedgeFlag_Speculation;
  	o.TimeCondition = dict.TimeCondition_GFD;
  	o.VolumeCondition = dict.VolumeCondition_AV;
  	o.MinVolume = 1;
  	o.ContingentCondition = dict.ContingentCondition_Immediately;
  	o.ForceCloseReason = dict.ForceCloseReason_NotForceClose;
  	o.IsAutoSuspend = dict.IsAutoSuspend_No;
  	o.UserForceClose = dict.UserForceClose_No;

  	o.InstrumentID = order.InstrumentID;
  	o.Direction = order.Direction;
  	o.CombOffsetFlag = order.CombOffsetFlag;
  	o.LimitPrice = order.LimitPrice;
  	o.VolumeTotalOriginal = order.VolumeTotalOriginal;

  	var ctp = this.ctp;
  	var account = ctp.getAccountByUserID(ctp.accountID);

  	o.BrokerID = account.BrokerID;
  	o.UserID = account.UserID;
  	o.InvestorID = account.InvestorID;

  	o.OrderRef = this.nOrderRef();

  	ctp.reqOrderInsert(o, ctp.nRequestID());
  };

  this.nOrderRef = function() {
  	return ++this.orderRef;
  };

  /**
   * @param order {object} 订单
   * 撤单
   */
  this.cancelOrder = function(order) {

  };

  /**
   * 查询账户资金
   */
  this.queryAccount = function() {
  	var ctp = this.ctp;
  	ctp.td.ReqQryTradingAccount(ctp.getAccountByUserID(ctp.accountID), ctp.nRequestID());
  };

  /**
   * 查询持仓
   */
  this.queryPosition = function(instrumentID) {
  	var ctp = this.ctp;
    var account = ctp.getAccountByUserID(ctp.accountID);

    var data = {
      BrokerID: account.BrokerID,
      InvestorID: account.InvestorID
    };

    instrumentID && (data.InstrumentID = instrumentID);

    ctp.td.ReqQryInvestorPosition(data, ctp.nRequestID());
  };

  /**
   * 报单通知, 订单状态发生变化时的响应
   * 要区分是下单成功、还是撤单、还是委托成功
   */
  this.onOrder = function(data) {
  	this.orderRef = Math.max(this.orderRef, Number(data.OrderRef));
  };

  /**
   * 成交通知, 订单成交时的响应
   */
  this.onTrade = function(data) {

  };

  /**
   * 请求查询资金账户响应
   */
  this.onAccount = function(data, rsp, nRequestID, bIsLast) {

  };

  /**
   * 请求查询投资者持仓响应
   */
  this.onPosition = function(data, rsp, nRequestID, bIsLast) {

  };

}).call(Engine.prototype);

Class.inherit(Engine, require('../base/engine'));

module.exports = Engine;

