const Class = require('iguzhi/class');

function DefaultStrategy() {
	this.$superConstructor(arguments);
	this.strategyName = 'DefaultStrategy';
}

(function() {
	/**
	 * @param bar {Bar} 当前分钟bar
	 * @param lastbar {Bar} 前一分钟bar, 注意每天第一根bar生成的时候lastbar还没有生成
	 * @param tick {object} 从交易所服务器推送而来的tick
	 * @param barList {Array} bar列表
	 * @param engine {Engine} 交易引擎, 可能是实盘也可能是回测
	 * 到这一步时, 前一分钟bar所有需要的技术指标都已计算完成
	 * 具体交易逻辑应该写在这里
	 */
	this.onCurrentMinuteBarAndTick = function(bar, lastbar, tick, barList, engine) {
		this.logger.info('onCurrentMinuteBarAndTick: %j, %j, %j', bar, lastbar, tick);
	};

	/**
	 * 1分钟周期指标, 前一分钟bar
	 * 这里已经完成了对lastbar各指标的计算
	 */
	this.onLastMinuteBar = function(lastbar, tick, barList, engine) {
		this.logger.info('onLastMinuteBar: %j, %j', lastbar, tick);
	};

	/**
   * 报单通知, 订单状态发生变化时的响应
   * 要区分是下单成功、还是撤单、还是委托成功
   */
  this.onOrder = function(data) {
  	this.logger.info('onOrder: %j', data);
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
  	this.logger.info('onAccount: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
  };

  /**
   * 请求查询投资者持仓响应
   */
  this.onPosition = function(data, rsp, nRequestID, bIsLast) {
  	this.logger.info('onPosition: %j, %j, %s, %s', data, rsp, nRequestID, bIsLast);
  };

}).call(DefaultStrategy.prototype);

Class.inherit(DefaultStrategy, require('../base/strategy'));

module.exports = DefaultStrategy;