// 交易引擎基类
const sma = require('ta-lib.sma');
const macd = require('ta-lib.macd');
const ntevent = require('../lib/ntevent');
const logger = require('../lib/logger').ftengine;
const moment = require('moment');
const Bar = require('../bar');

function Engine(strategy) {
	this.strategy = strategy || {
		name: 'TestStrategy',
		instrumentIDList: [], // ['ru1709', 'rb1710', 'zn1707']
		param: {}
	};

	var barMap = this.barMap = {};
	var barListMap = this.barListMap = {};

	this.strategy.instrumentIDList.forEach(function(instrumentID) {
		barMap[instrumentID] = new Bar();
		barListMap[instrumentID] = [];
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

	// close指标列表, 即收盘价的列表
	this.closeList = [];
}

(function() {

	this.start = function() {
		ntevent.on('/market/tick', this.onTick);
	};

	this.onTick = function(tick) {
		// tick.moment = moment(tick.LogTime);

		// tick.datetime = tick.moment.format(this.pattern.datetime);
		// tick.date = tick.moment.format(this.pattern.date);
		// tick.time = tick.moment.format(this.pattern.time);

		var periodDatetime = this.getPeriodDatetimeByPeriod(tick.LogTime, this.defaultPeriod);
		var bar = this.barMap[tick.InstrumentID];
		var lastbar;

		if (periodDatetime != bar.periodDatetime) {
			if (bar.periodDatetime) {
				lastbar = bar;
				this.onLastMinuteBar(lastbar, tick);
			}

			bar = new Bar();
			this.barMap[tick.InstrumentID] = bar;

			bar.instrumentID = tick.InstrumentID;
			bar.periodDatetime = periodDatetime;
			bar.open = tick.LastPrice;
			bar.high = tick.LastPrice;
			bar.low = tick.LastPrice;
			bar.close = tick.LastPrice;

			bar.openVolume = lastbar && lastbar.closeVolume || 0;
			bar.closeVolume = tick.Volume;
			bar.volume = bar.closeVolume - bar.openVolume;
			bar.openInterest = tick.OpenInterest;

		}
		else {
      bar.high = Math.max(bar.high, tick.LastPrice);
      bar.low = Math.max(bar.low, tick.LastPrice);
      bar.close = bar.LastPrice;
      bar.closeVolume = tick.Volume;
      bar.volume = bar.closeVolume - bar.openVolume;
      bar.openInterest = tick.OpenInterest;
		}

		this.onCurrentMinuteBar(bar, lastbar, tick);
	};

	/**
	 * 1分钟周期指标, 前一分钟bar
	 * 只有一分钟走完之后才会计算这一分钟的ma和macd指标
	 */
	this.onLastMinuteBar = function(lastbar, tick) {
		var barList = this.barListMap[lastbar.instrumentID];
		barList.push(lastbar);
		
		this.closeList.push(lastbar.close);

		this.ma5List = sma(this.closeList, 5);
		this.ma10List = sma(this.closeList, 10);
		this.ma20List = sma(this.closeList, 20);
		this.ma40List = sma(this.closeList, 40);
		this.ma60List = sma(this.closeList, 60);

		lastbar.ma5 = this.ma5List[this.ma5List.length - 1];
		lastbar.ma10 = this.ma10List[this.ma10List.length - 1];
		lastbar.ma20 = this.ma20List[this.ma20List.length - 1];
		lastbar.ma40 = this.ma40List[this.ma40List.length - 1];
		lastbar.ma60 = this.ma60List[this.ma60List.length - 1];

		var msh = macd(this.closeList);
		this.macdList = msh.macd;
		this.signalLineList = msh.signalLine;
		this.histogramList = msh.histogram;

		lastbar.macd = this.macdList[this.macdList.length - 1];
		lastbar.signalLine = this.signalLineList[this.signalLineList.length - 1];
		lastbar.histogram = this.histogramList[this.histogramList.length - 1];

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
        ret = moment(date).format(this.pattern.secondbarPeriod);
        break;
      case 'minute':
      default:
        var minutes = date.getMinutes();
        var minuteInteger = parseInt(minutes / period.value);
        date.setMinutes(minuteInteger * period.value);
        ret = moment(date).format(this.pattern.minutebarPeriod);
        break;
    }

    return ret;
  };

}).call(Engine.prototype);

module.exports = Engine;