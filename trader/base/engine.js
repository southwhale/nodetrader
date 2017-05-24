// 交易引擎基类
const sma = require('ta-lib.sma');
const macd = require('ta-lib.macd');
const lang = require('iguzhi/lang');
const ctpmgr = require('../../lib/ctpmanager');
const ntevent = require('../../lib/ntevent');
const logger = require('../../lib/logger').tengine;
const moment = require('moment');
const Bar = require('./bar');

function Engine(account) {
	this.engineName = 'BaseEngine';

	this.ctp = ctpmgr.get(account.UserID);

	this.strategy = account.Strategy || {
		name: 'TestStrategy',
		tradeInstrumentIDList: [], // 要交易的合约 ['ru1709', 'zn1707']
		subscribeInstrumentIDList: [], // 订阅行情的合约, 之所有和交易的合约不完全一样, 是因为可能需要额外的合约作为参考 ['ru1709', 'rb1710', 'zn1707']
		param: {}
	};

	var instrumentMap = this.instrumentMap = {};

	this.strategy.subscribeInstrumentIDList.forEach(function(instrumentID) {
		instrumentMap[instrumentID] = {
			lastbar: null,// 上一根bar
			bar: new Bar(),// 当前bar
			barList: [],
			closeList: []
		};
	});

	this.pattern = {
		datetime: 'YYYY/MM/DD HH:mm:ss',
		date: 'YYYY/MM/DD',
		time: 'HH:mm:ss',
		minuteBarPeriod: 'YYYY/MM/DD HH:mm',
		secondBarPeriod: 'YYYY/MM/DD HH:mm:ss'
	};

	// 默认指标周期为1分钟
	this.defaultPeriod = {
		type: 'minute',
		value: 1
	};
}

(function() {

	this.start = function() {
		ntevent.on('/market/tick', this.onTick.bind(this));
		ntevent.on('/trade/OnRtnOrder', this.onOrder.bind(this));
		ntevent.on('/trade/OnRtnTrade', this.onTrade.bind(this));

		logger.info('%s start!', this.engineName);
	};

	this.onTick = function(tick) {
		// tick.moment = moment(tick.LogTime);

		// tick.datetime = tick.moment.format(this.pattern.datetime);
		// tick.date = tick.moment.format(this.pattern.date);
		// tick.time = tick.moment.format(this.pattern.time);

		var periodDatetime = this.getPeriodDatetimeByPeriod(tick.LogTime, this.defaultPeriod);
		var instmap = this.instrumentMap[tick.InstrumentID];
		var bar = instmap.bar;

		if (periodDatetime != bar.periodDatetime) {
			if (bar.periodDatetime) {
				instmap.lastbar = bar;
				this.onLastMinuteBar(instmap.lastbar, tick);
			}

			bar = new Bar();
			this.instrumentMap[tick.InstrumentID].bar = bar;

			bar.instrumentID = tick.InstrumentID;
			bar.product = tick.Product;
			bar.periodDatetime = periodDatetime;
			bar.open = tick.LastPrice;
			bar.high = tick.LastPrice;
			bar.low = tick.LastPrice;
			bar.close = tick.LastPrice;

			bar.openVolume = instmap.lastbar && instmap.lastbar.closeVolume || tick.Volume;
			bar.closeVolume = tick.Volume;
			bar.volume = bar.closeVolume - bar.openVolume;
			bar.openInterest = tick.OpenInterest;

		}
		else {
      bar.high = Math.max(bar.high, tick.LastPrice);
      bar.low = Math.min(bar.low, tick.LastPrice);
      bar.close = tick.LastPrice;
      bar.closeVolume = tick.Volume;
      bar.volume = bar.closeVolume - bar.openVolume;
      bar.openInterest = tick.OpenInterest;
		}

		this.onCurrentMinuteBar(bar, instmap.lastbar, tick);
	};

	/**
	 * 1分钟周期指标, 前一分钟bar
	 * 只有一分钟走完之后才会计算这一分钟的ma和macd指标
	 */
	this.onLastMinuteBar = function(lastbar, tick) {
		var instmap = this.instrumentMap[tick.InstrumentID];

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

		// 保存指标到数据库, 供交易前预加载进来使用, 省去再次计算的时间
		// 只有实盘时才会保存, 回测时不用保存
		if (lang.isFunction(this.saveBar)) {
			this.saveBar(lastbar);
		}

		logger.info('%j', lastbar);
	};

	/**
	 * @param bar {Bar} 当前分钟bar
	 * @param lastbar {Bar} 前一分钟bar, 注意每天第一根bar生成的时候lastbar还没有生成
	 * @param tick {object} 从交易所服务器推送而来的tick
	 * 到这一步时, 前一分钟bar所有需要的技术指标都已计算完成
	 * 具体交易逻辑应该写在这里
	 */
	this.onCurrentMinuteBar = function(bar, lastbar, tick) {

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
        ret = moment(date).format(this.pattern.secondBarPeriod);
        break;
      case 'minute':
      default:
        var minutes = date.getMinutes();
        var minuteInteger = parseInt(minutes / period.value);
        date.setMinutes(minuteInteger * period.value);
        ret = moment(date).format(this.pattern.minuteBarPeriod);
        break;
    }

    return ret;
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

}).call(Engine.prototype);

module.exports = Engine;