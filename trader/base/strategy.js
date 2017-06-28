// 策略基类, 所有自定义策略需继承此类
const sma = require('ta-lib.sma');
const macd = require('ta-lib.macd');
const logger = require('../../lib/logger').strategy;
const moment = require('moment');
const dict = require('./dict');
const constant = require('./constant');
const BarModel = require('../../db/model/bar');
const Bar= require('./bar');
const PositionBuffer = require('./positionbuffer');

// 策略的字段应如下:
// {
//  strategyName: 'DefaultStrategy',
//  tradeInstrumentIDList: [], // 要交易的合约 ['ru1709', 'zn1707']
//  initDays: 22, // 需要预加载存储在数据库Bar的天数, 在交易开始之前需要先获取前initDays天的Bar数据用于交易时分析
//  subscribeInstrumentIDList: [], // 订阅行情的合约, 之所有和交易的合约不完全一样, 是因为可能需要额外的合约作为参考 ['ru1709', 'rb1710', 'zn1707']
//  param: {}
// }
function Strategy(strategy) {
	this.strategyName = dict.StrategyName_Base;
	this.logger = logger;

  this.tradeInstrumentIDList = strategy.tradeInstrumentIDList || [];
  this.subscribeInstrumentIDList = strategy.subscribeInstrumentIDList || strategy.tradeInstrumentIDList || [];
  this.initDays = strategy.initDays || constant.strategy_defaultInitDays;
  this.periodValue = strategy.periodValue || constant.strategy_defaultPeriodValue;

  this.param = strategy.param || {};

  this.instrumentMap = {};

  // 产品信息, 交易引擎启动时会根据引擎的不同加载product或localproduct
  this.product = null;

	this.orderMap = {}; // 已提交订单的缓存
	this.tradeMap = {}; // 成交回报的缓存
	this.positionBuffer = new PositionBuffer();

  this.initContext();
}

(function() {

  this.initContext = function() {
    var me = this;

    this.subscribeInstrumentIDList.forEach(function(instrumentID) {
      me.instrumentMap[instrumentID] = {
        // 1分钟指标
        lastbar: null, // 上一根bar
        bar: new Bar(), // 当前bar
        barList: [],
        closeList: [],
        // periodValue分钟指标
        lastPeriodBar: null,
        periodBar: new Bar(),
        periodBarList: [],
        periodBarCloseList: []
      };

      me.orderMap[instrumentID] = {};
      me.tradeMap[instrumentID] = {};
      me.positionBuffer.init(instrumentID);
    });
  };

  this.init = function(engine) {
    this.loadProduct(engine);
    this.preload(engine);
  };

  this.preload = function(engine) {
    var endTime = engine.engineName === dict.EngineName_Backtest
      ? moment(engine.startDateTime, constant.pattern_datetime).valueOf()
      : new Date().getTime();

    var startTime = endTime - this.initDays * 86400000;

    startTime = moment(startTime).format(constant.pattern_minuteBarPeriod);
    endTime = moment(endTime).format(constant.pattern_minuteBarPeriod);

    var instrumentMap = this.instrumentMap;

    var me = this;

    BarModel.findAll({
      where: {
        InstrumentID: {
          $in: this.subscribeInstrumentIDList
        },
        periodDatetime: {
          $gte: startTime,
          $lt: endTime
        }
      },
      order: 'id DESC'
    })
    .then(function(list) {
      if (!list.length) {
        return;
      }
      
      list.forEach(function(bar) {
        bar = bar.toJSON();
        var instmap = instrumentMap[bar.instrumentID];
        instmap.barList.unshift(bar);
      });

      me.periodValue > 1
      && list.reverse().forEach(function(bar) {
        bar = bar.toJSON();
        me.buildLastPeriodBar(bar);
      });
    });
  };

  this.loadProduct = function(engine) {
    var productModulePath =
      engine.engineName === dict.EngineName_Firm || engine.engineName === dict.EngineName_Market
      ? '../product' : '../localproduct';
    this.product = require(productModulePath);
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
		
	};

	/**
	 * 1分钟周期指标, 前一分钟bar
	 * 这里已经完成了对lastbar各指标的计算
	 */
	this.onLastBar = function(lastbar, barList, engine) {
		
	};

  /**
   * 根据指标周期periodValue, 使用1分钟bar生成所需周期的bar
   */
  this.buildLastPeriodBar = function(lastbar) {
    // 只有大于1分钟的周期（例如3分钟或5分钟）才生成相应的周期Bar
    if (this.periodValue > 1) {
      var periodDatetime = this.convertPeriodDatetime(lastbar.periodDatetime, this.periodValue);

      var instmap = this.instrumentMap[lastbar.instrumentID];
      var periodBar = instmap.periodBar;

      if (periodDatetime != periodBar.periodDatetime) {
        if (periodBar.periodDatetime) {
          instmap.lastPeriodBar = periodBar;
          this._onLastPeriodBar(periodBar);
        }

        periodBar = new Bar();
        this.instrumentMap[lastbar.instrumentID].periodBar = periodBar;

        periodBar.instrumentID = lastbar.instrumentID;
        periodBar.productID = lastbar.productID;
        periodBar.exchangeID = lastbar.exchangeID;
        periodBar.periodDatetime = periodDatetime;
        periodBar.open = lastbar.open;
        periodBar.high = lastbar.high;
        periodBar.low = lastbar.low;
        periodBar.close = lastbar.close;

        periodBar.volume = lastbar.volume;
        periodBar.openInterest = lastbar.openInterest;
        periodBar.settlement = lastbar.settlement;

      }
      else {
        periodBar.high = Math.max(periodBar.high, lastbar.high);
        periodBar.low = Math.min(periodBar.low, lastbar.low);
        periodBar.close = lastbar.close;
        periodBar.volume += lastbar.volume;
        periodBar.openInterest = lastbar.openInterest;
        periodBar.settlement = lastbar.settlement;
      }
    }
  };

  this._onLastPeriodBar = function(lastPeriodBar) {
    var instmap = this.instrumentMap[lastPeriodBar.instrumentID];
    instmap.periodBarList.push(lastPeriodBar);
    
    instmap.periodBarCloseList.push(lastPeriodBar.close);

    var ma5List = sma(instmap.periodBarCloseList, 5);
    var ma10List = sma(instmap.periodBarCloseList, 10);
    var ma20List = sma(instmap.periodBarCloseList, 20);
    var ma40List = sma(instmap.periodBarCloseList, 40);
    var ma60List = sma(instmap.periodBarCloseList, 60);

    lastPeriodBar.ma5 = ma5List[ma5List.length - 1] || null;
    lastPeriodBar.ma10 = ma10List[ma10List.length - 1] || null;
    lastPeriodBar.ma20 = ma20List[ma20List.length - 1] || null;
    lastPeriodBar.ma40 = ma40List[ma40List.length - 1] || null;
    lastPeriodBar.ma60 = ma60List[ma60List.length - 1] || null;

    var msh = macd(instmap.periodBarCloseList);
    var macdList = msh.macd;
    var signalLineList = msh.signalLine;
    var histogramList = msh.histogram;

    lastPeriodBar.macd = macdList[macdList.length - 1] || null;
    lastPeriodBar.signalLine = signalLineList[signalLineList.length - 1] || null;
    lastPeriodBar.histogram = histogramList[histogramList.length - 1] || null;
    lastPeriodBar.histogram && (lastPeriodBar.histogram = lastPeriodBar.histogram * 2);

    this.onLastPeriodBar(lastPeriodBar);
  };

  /**
   * periodValue分钟周期指标, 前一个periodBar
   */
  this.onLastPeriodBar = function(lastPeriodBar) {

  };

  this.convertPeriodDatetime = function(periodDatetime, periodValue) {
    var date = new Date(moment(periodDatetime, constant.pattern_minuteBarPeriod).valueOf());

    var minutes = date.getMinutes();
    var minuteInteger = parseInt(minutes / periodValue);
    date.setMinutes(minuteInteger * periodValue);
    return moment(date).format(constant.pattern_minuteBarPeriod);
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
   * @param {String|Object} data 合约代码或包含合约代码的对象
   */
  this.getInstrumentMap = function(data) {
    var instrumentID = lang.isString(data) ? data : data.InstrumentID;
    return this.instrumentMap[instrumentID];
  };
  /**
   * @param {String|Object} data 合约代码或包含合约代码的对象
   */
  this.getOrderMap = function(data) {
  	var instrumentID = lang.isString(data) ? data : data.InstrumentID;
  	return this.orderMap[instrumentID];
  };
  /**
   * @param {String|Object} data 合约代码或包含合约代码的对象
   */
  this.getTradeMap = function(data) {
  	var instrumentID = lang.isString(data) ? data : data.InstrumentID;
  	return this.tradeMap[instrumentID];
  };
  /**
   * @param {String|Object} data 合约代码或包含合约代码的对象
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