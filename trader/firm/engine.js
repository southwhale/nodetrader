const Class = require('iguzhi/class');
const Tick = require('../../db/model/tick');
const ntevent = require('../../lib/ntevent');
const moment = require('moment');
const BarModel = require('../../db/model/bar');
const dbLogger = require('../../lib/logger').db;

function Engine() {
	this.$superConstructor(arguments);
	this.engineName = 'FirmEngine';
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
   * @order {Order} 订单
   * 发送订单
   */
  this.sendOrder = function(order) {

  };

  /**
   * @order {Order} 订单
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
  this.queryPosition = function() {
  	var ctp = this.ctp;
  	ctp.td.ReqQryInvestorPosition(ctp.getAccountByUserID(ctp.accountID), ctp.nRequestID());
  };

  /**
   * 报单通知, 订单状态发生变化时的响应
   * 要区分是下单成功、还是撤单、还是委托成功
   */
  this.onOrder = function(data) {

  };

  /**
   * 成交通知, 订单成交时的响应
   */
  this.onTrade = function(data) {

  };

  /**
   * 请求查询资金账户响应
   */
  this.onAccount = function(data) {

  };

  /**
   * 请求查询投资者持仓响应
   */
  this.onPosition = function(data) {

  };

}).call(Engine.prototype);

Class.inherit(Engine, require('../base/engine'));

module.exports = Engine;

