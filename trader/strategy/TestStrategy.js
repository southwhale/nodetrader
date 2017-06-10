const Class = require('iguzhi/class');
const moment = require('moment');

function TestStrategy() {
	this.$superConstructor(arguments);
	this.strategyName = 'TestStrategy';
}

(function() {
	/**
	 * @param {Bar} bar 当前分钟bar
	 * @param {Bar} lastbar 前一分钟bar, 注意每天第一根bar生成的时候lastbar还没有生成
	 * @param {Object} tick 从交易所服务器推送而来的tick
	 * @param {Array} barList bar列表
	 * @param {Engine} engine 交易引擎, 可能是实盘也可能是回测
	 * 到这一步时, 前一分钟bar所有需要的技术指标都已计算完成
	 * 具体交易逻辑应该写在这里
	 */
	this.onCurrentBarAndTick = function(bar, lastbar, tick, barList, engine) {
		
	};

	/**
	 * 1分钟周期指标, 前一分钟bar
	 * 这里已经完成了对lastbar各指标的计算
	 */
	this.onLastBar = function(lastbar, barList, engine) {
		
	};

	/**
   * periodValue分钟周期指标, 前一个periodBar
   */
  this.onLastPeriodBar = function(lastPeriodBar) {

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
  	this.logger.info('onTrade: %j', data);
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
  
}).call(TestStrategy.prototype);

Class.inherit(TestStrategy, require('../base/strategy'));

module.exports = TestStrategy;