// 交易引擎基类
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
	this.engineName = dict.EngineName_Base;

	this.ctp = ctpmgr.get(account.AccountID);

	var strategy = strategyCfg[account.Strategy]
    || strategyCfg[dict.StrategyName_Default]
    || {
      strategyName: dict.StrategyName_Default,
      initDays: constant.strategy_defaultInitDays,
      periodValue: constant.strategy_defaultPeriodValue
    };

  var strategyDirPath = strategy.strategyName === dict.StrategyName_Default ? './' : '../strategy/';
	var StrategyClass = require(strategyDirPath + strategy.strategyName);
	this.strategy = new StrategyClass(strategy);

  this.periodValue = 1; // 交易引擎始终生成1分钟K线

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

	this.onTick = function(tick) {
		var periodDatetime = this.getPeriodDatetimeByPeriod(tick.LogTime, this.periodValue);
		var instmap = this.strategy.instrumentMap[tick.InstrumentID];
		var bar = instmap.bar;

		if (periodDatetime != bar.periodDatetime) {
			if (bar.periodDatetime) {
				instmap.lastbar = bar;
        // 当小节收盘或其他各种收盘时交易所仍会推送多余的tick过来, 这里可以通过bar的成交量来过滤掉 
				bar.volume && this.onLastBar(bar, tick);
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

		bar.volume && this.onCurrentBarAndTick(bar, instmap.lastbar, tick, instmap.barList, this);
	};

	/**
	 * 1分钟周期指标, 前一分钟bar
	 * 只有一分钟走完之后才会计算这一分钟的ma和macd指标
	 */
	this.onLastBar = function(lastbar) {
		lastbar.settlement = lastbar.turnover / lastbar.closeVolume / this.strategy.product[lastbar.productID].VolumeMultiple;

		var instmap = this.strategy.instrumentMap[lastbar.instrumentID];

		instmap.barList.push(lastbar);
		
		instmap.closeList.push(lastbar.close);

		// var ma5List = sma(instmap.closeList, 5);
		// var ma10List = sma(instmap.closeList, 10);
		// var ma20List = sma(instmap.closeList, 20);
		// var ma40List = sma(instmap.closeList, 40);
		// var ma60List = sma(instmap.closeList, 60);

		// lastbar.ma5 = ma5List[ma5List.length - 1] || null;
		// lastbar.ma10 = ma10List[ma10List.length - 1] || null;
		// lastbar.ma20 = ma20List[ma20List.length - 1] || null;
		// lastbar.ma40 = ma40List[ma40List.length - 1] || null;
		// lastbar.ma60 = ma60List[ma60List.length - 1] || null;

		// var msh = macd(instmap.closeList);
		// var macdList = msh.macd;
		// var signalLineList = msh.signalLine;
		// var histogramList = msh.histogram;

		// lastbar.macd = macdList[macdList.length - 1] || null;
		// lastbar.signalLine = signalLineList[signalLineList.length - 1] || null;
		// lastbar.histogram = histogramList[histogramList.length - 1] || null;
  //   lastbar.histogram && (lastbar.histogram = lastbar.histogram * 2);

		this.strategy.onLastBar(lastbar, instmap.barList, this);
    this.strategy.buildLastPeriodBar(lastbar);

		// 保存指标到数据库, 供交易前预加载进来使用, 省去再次计算的时间
		// 只有实盘时才会保存, 回测时不用保存
		if (lang.isFunction(this.saveBar)) {
			this.saveBar(lastbar);
		}

		// logger.info('%j', lastbar);
	};

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
		this.strategy.onCurrentBarAndTick(bar, lastbar, tick, barList, engine);
	};


	/**
	 * @param {Integer} logTime
	 * @param {Number} periodValue 几分钟K线
	 * @return {String}
	 * 计算指标周期的时间, 目前只支持 秒和分钟的周期
	 */
	this.getPeriodDatetimeByPeriod = function(logTime, periodValue) {
    var date = new Date(logTime);

    var minutes = date.getMinutes();
    var minuteInteger = parseInt(minutes / periodValue);
    date.setMinutes(minuteInteger * periodValue);
    return moment(date).format(constant.pattern_minuteBarPeriod);
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
   * @param {Object} order 订单
   * 发送订单
   */
  this.sendOrder = function(order) {

  };

  /**
   * @param {Object} order 订单
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

  // 是否可交易
  // this.isTradable = function(productID) {
  //   // 历史回测始终返回true
  //   if (this.engineName === dict.EngineName_Backtest) {
  //     return true;
  //   }

  //   var pdt = this.strategy.product[productID];
  //   return pdt.InstrumentStatus && pdt.InstrumentStatus === dict.InstrumentStatus_Continous;
  // };

}).call(Engine.prototype);

module.exports = Engine;