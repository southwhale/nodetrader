// 策略基类, 所有自定义策略需继承此类
const logger = require('../../lib/logger').strategy;
const dict = require('./dict');
const PositionBuffer = require('./positionbuffer');

function Strategy() {
	this.strategyName = 'BaseStrategy';
	this.tradeInstrumentIDList = [];
	this.subscribeInstrumentIDList = [];
	this.param = {};
	this.logger = logger;

	this.orderMap = {}; // 已提交订单的缓存
	this.tradeMap = {}; // 成交回报的缓存
	this.positionBuffer = new PositionBuffer();
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
		
	};

	/**
	 * 1分钟周期指标, 前一分钟bar
	 * 这里已经完成了对lastbar各指标的计算
	 */
	this.onLastMinuteBar = function(lastbar, tick, barList, engine) {
		
	};
	// 供交易引擎调用
  this.updateOrderMap = function(data) {
  	var orderMap = this.orderMap[data.InstrumentID];

  	orderMap[data.OrderRef] = data;
  };
  // 供交易引擎调用
  this.updateTradeMap = function(data) {
  	var tradeMap = this.tradeMap[data.InstrumentID];

  	tradeMap[data.TradeID] = data;

  	this.positionBuffer.add(data);
  };
  /**
   * @param data {String|Object} 合约代码或包含合约代码的对象
   */
  this.getOrderMap = function(data) {
  	var instrumentID = lang.isString(data) ? data : data.InstrumentID;
  	return this.orderMap[instrumentID];
  };
  /**
   * @param data {String|Object} 合约代码或包含合约代码的对象
   */
  this.getTradeMap = function(data) {
  	var instrumentID = lang.isString(data) ? data : data.InstrumentID;
  	return this.tradeMap[instrumentID];
  };
  /**
   * @param data {String|Object} 合约代码或包含合约代码的对象
   * @return {Object} 某个合约的净持仓和持仓均价, 字段说明如下:
   * {
	 *		pos: 2 || -2, // 持仓数量, 正数指净持仓为多单, 负数指净持仓为空单, 0表示空仓
	 *		price: 21220 // 持仓均价
   * }
   */
  this.getPosition = function(data) {
  	this.positionBuffer.get(data);
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
  this.onAccount = function(data, rsp, nRequestID, bIsLast) {

  };

  /**
   * 请求查询投资者持仓响应
   */
  this.onPosition = function(data, rsp, nRequestID, bIsLast) {

  };

}).call(Strategy.prototype);

module.exports = Strategy;