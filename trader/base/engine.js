// 交易引擎基类
const sma = require('ta-lib.sma');
const macd = require('ta-lib.macd');
const lang = require('iguzhi/lang');
const ctpmgr = require('../../lib/ctpmanager');
const ntevent = require('../../lib/ntevent');
const logger = require('../../lib/logger').tengine;
const moment = require('moment');
const Bar = require('./bar');
const constant = require('./constant');
const dict = require('./dict');
const strategyCfg = require('../../config/strategy.json');

// 为了适配回测引擎, 这里需要传入account而不是accountID
function Engine(account) {
	this.engineName = 'BaseEngine';

	this.ctp = ctpmgr.get(account.AccountID);

	var strategy = strategyCfg[account.Strategy || 'DefaultStrategy'];

	var StrategyClass = require('../strategy/' + strategy.strategyName);
	this.strategy = new StrategyClass(strategy);

	// 默认指标周期为1分钟
	this.defaultPeriod = {
		type: 'minute',
		value: 1
	};

	this.localOrderRef = 0;
}

(function() {

	this.start = function() {
		ntevent.on('/market/tick', this.onTick.bind(this));
		ntevent.on('/trade/OnRtnOrder', this.onOrder.bind(this));
		ntevent.on('/trade/OnRtnTrade', this.onTrade.bind(this));
		ntevent.on('/trade/onRspQryTradingAccount', this.onAccount.bind(this));
		ntevent.on('/trade/OnRspQryInvestorPosition', this.onPosition.bind(this));
		this.subscribeMarket && ntevent.on('/market/SubscribeMarketData', this.subscribeMarket.bind(this));

		this.strategy.init(this);

		logger.info('%s start!', this.engineName);
	};

	this.setPeriod = function(period) {
		this.defaultPeriod = period;
	};

	this.onTick = function(tick) {
		// tick.moment = moment(tick.LogTime);

		// tick.datetime = tick.moment.format(constant.pattern_datetime);
		// tick.date = tick.moment.format(constant.pattern_date);
		// tick.time = tick.moment.format(constant.pattern_time);

		var periodDatetime = this.getPeriodDatetimeByPeriod(tick.LogTime, this.defaultPeriod);
		var instmap = this.strategy.instrumentMap[tick.InstrumentID];
		var bar = instmap.bar;

		if (periodDatetime != bar.periodDatetime) {
			if (bar.periodDatetime) {
				instmap.lastbar = bar;
				this.onLastMinuteBar(instmap.lastbar, tick);
			}

			bar = new Bar();
			this.strategy.instrumentMap[tick.InstrumentID].bar = bar;

			bar.instrumentID = tick.InstrumentID;
			bar.productID = tick.ProductID;
			bar.exchangeID = tick.ExchangeID;
			bar.periodDatetime = periodDatetime;
			bar.open = tick.LastPrice;
			bar.high = tick.LastPrice;
			bar.low = tick.LastPrice;
			bar.close = tick.LastPrice;

			bar.openVolume = instmap.lastbar && instmap.lastbar.closeVolume || tick.Volume;
			bar.closeVolume = tick.Volume;
			bar.volume = bar.closeVolume - bar.openVolume;
			bar.openInterest = tick.OpenInterest;
			bar.turnover = tick.Turnover;

		}
		else {
      bar.high = Math.max(bar.high, tick.LastPrice);
      bar.low = Math.min(bar.low, tick.LastPrice);
      bar.close = tick.LastPrice;
      bar.closeVolume = tick.Volume;
      bar.volume = bar.closeVolume - bar.openVolume;
      bar.openInterest = tick.OpenInterest;
      bar.turnover = tick.Turnover;
		}

		this.onCurrentMinuteBarAndTick(bar, instmap.lastbar, tick, instmap.barList, this);
	};

	/**
	 * 1分钟周期指标, 前一分钟bar
	 * 只有一分钟走完之后才会计算这一分钟的ma和macd指标
	 */
	this.onLastMinuteBar = function(lastbar, tick) {
		lastbar.settlement = lastbar.turnover / lastbar.closeVolume / this.strategy.product[lastbar.productID].VolumeMultiple;

		var instmap = this.strategy.instrumentMap[tick.InstrumentID];

		instmap.barList.push(lastbar);
		
		instmap.closeList.push(lastbar.close);

		var ma5List = sma(instmap.closeList, 5);
		var ma10List = sma(instmap.closeList, 10);
		var ma20List = sma(instmap.closeList, 20);
		var ma40List = sma(instmap.closeList, 40);
		var ma60List = sma(instmap.closeList, 60);

		lastbar.ma5 = ma5List[ma5List.length - 1] || null;
		lastbar.ma10 = ma10List[ma10List.length - 1] || null;
		lastbar.ma20 = ma20List[ma20List.length - 1] || null;
		lastbar.ma40 = ma40List[ma40List.length - 1] || null;
		lastbar.ma60 = ma60List[ma60List.length - 1] || null;

		var msh = macd(instmap.closeList);
		var macdList = msh.macd;
		var signalLineList = msh.signalLine;
		var histogramList = msh.histogram;

		lastbar.macd = macdList[macdList.length - 1] || null;
		lastbar.signalLine = signalLineList[signalLineList.length - 1] || null;
		lastbar.histogram = histogramList[histogramList.length - 1] || null;

		this.strategy.onLastMinuteBar(lastbar, tick, instmap.barList, this);

		// 保存指标到数据库, 供交易前预加载进来使用, 省去再次计算的时间
		// 只有实盘时才会保存, 回测时不用保存
		if (lang.isFunction(this.saveBar)) {
			this.saveBar(lastbar);
		}

		// logger.info('%j', lastbar);
	};

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
		this.strategy.onCurrentMinuteBarAndTick(bar, lastbar, tick, barList, engine);
	};


	/**
	 * @param {int} logTime
	 * @param {object} period
	 * @return {string}
	 * 计算指标周期的时间, 目前只支持 秒和分钟的周期
	 */
	this.getPeriodDatetimeByPeriod = function(logTime, period) {
    var date = new Date(logTime);
    var ret;
    switch(period.type) {
      case 'second':
        var seconds = date.getSeconds();
        var secondInteger = parseInt(seconds / period.value);
        date.setSeconds(secondInteger * period.value);
        ret = moment(date).format(constant.pattern_secondBarPeriod);
        break;
      case 'minute':
      default:
        var minutes = date.getMinutes();
        var minuteInteger = parseInt(minutes / period.value);
        date.setMinutes(minuteInteger * period.value);
        ret = moment(date).format(constant.pattern_minuteBarPeriod);
        break;
    }

    return ret;
  };

  this.nOrderRef = function() {
  	return ++this.localOrderRef;
  };

  // 买开
  this.buyOpen = function(instrumentID, price, volume) {
  	this.sendOrder({
  		InstrumentID: instrumentID,
  		Direction: dict.Direction_Buy,
  		CombOffsetFlag: dict.OffsetFlag_Open,
  		LimitPrice: price,
  		VolumeTotalOriginal: volume
  	});
  };
  // 卖开
  this.sellOpen = function(instrumentID, price, volume) {
  	this.sendOrder({
  		InstrumentID: instrumentID,
  		Direction: dict.Direction_Sell,
  		CombOffsetFlag: dict.OffsetFlag_Open,
  		LimitPrice: price,
  		VolumeTotalOriginal: volume
  	});
  };
  // 买平
  this.buyClose = function(instrumentID, price, volume) {
  	this.sendOrder({
  		InstrumentID: instrumentID,
  		Direction: dict.Direction_Buy,
  		CombOffsetFlag: dict.OffsetFlag_Close,
  		LimitPrice: price,
  		VolumeTotalOriginal: volume
  	});
  };
  // 卖平
  this.sellClose = function(instrumentID, price, volume) {
  	this.sendOrder({
  		InstrumentID: instrumentID,
  		Direction: dict.Direction_Sell,
  		CombOffsetFlag: dict.OffsetFlag_Close,
  		LimitPrice: price,
  		VolumeTotalOriginal: volume
  	});
  };

  /**
   * @param order {object} 订单
   * 发送订单
   */
  this.sendOrder = function(order) {

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

  };

  /**
   * 查询持仓
   */
  this.queryPosition = function() {

  };

  /**
   * 报单通知, 订单状态发生变化时的响应
   * 要区分是下单成功、还是撤单、还是委托成功
   */
  this.onOrder = function(data) {
  	// 更新本地localOrderRef
  	this.localOrderRef = Math.max(this.localOrderRef, data.OrderRef);
  	// 更新策略订单缓存
  	this.strategy.updateOrderMap(data);
  	// 转发给策略
  	this.strategy.onOrder(data);
  };

  /**
   * 成交通知, 订单成交时的响应
   */
  this.onTrade = function(data) {
  	// 更新策略成交缓存
  	this.strategy.updateTradeMap(data);
  	// 转发给策略
  	this.strategy.onTrade(data);
  };

  /**
   * 请求查询资金账户响应
   */
  this.onAccount = function(data, rsp, nRequestID, bIsLast) {
  	// 转发给策略
  	this.strategy.onAccount(data, rsp, nRequestID, bIsLast);
  };

  /**
   * 请求查询投资者持仓响应
   */
  this.onPosition = function(data, rsp, nRequestID, bIsLast) {
  	// 转发给策略
  	this.strategy.onPosition(data, rsp, nRequestID, bIsLast);
  };

}).call(Engine.prototype);

module.exports = Engine;