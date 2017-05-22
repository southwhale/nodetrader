// 交易引擎基类
const sma = require('ta-lib.sma');
const macd = require('ta-lib.macd');
const ntevent = require('../lib/ntevent');
const logger = require('../lib/logger').ftengine;
const moment = require('moment');
const Bar = require('./bar');

function Engine(strategy) {
	this.strategy = strategy || {
		name: 'TestStrategy',
		instrumentIDList: [], // ['ru1709', 'rb1710', 'zn1707']
		param: {}
	};

	var instrumentMap = this.instrumentMap = {};

	this.strategy.instrumentIDList.forEach(function(instrumentID) {
		instrumentMap[instrumentID] = {
			lastbar: null,// 上一根bar
			bar: new Bar(),// 当前bar
			barList: [],
			closeList: [],
			ma5List: [],
			ma10List: [],
			ma20List: [],
			ma40List: [],
			ma60List: [],
			macdList: [],
			signalLineList: [],
			histogramList: []
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
      bar.low = Math.max(bar.low, tick.LastPrice);
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

		instmap.ma5List = sma(instmap.closeList, 5);
		instmap.ma10List = sma(instmap.closeList, 10);
		instmap.ma20List = sma(instmap.closeList, 20);
		instmap.ma40List = sma(instmap.closeList, 40);
		instmap.ma60List = sma(instmap.closeList, 60);

		lastbar.ma5 = instmap.ma5List[instmap.ma5List.length - 1];
		lastbar.ma10 = instmap.ma10List[instmap.ma10List.length - 1];
		lastbar.ma20 = instmap.ma20List[instmap.ma20List.length - 1];
		lastbar.ma40 = instmap.ma40List[instmap.ma40List.length - 1];
		lastbar.ma60 = instmap.ma60List[instmap.ma60List.length - 1];

		var msh = macd(instmap.closeList);
		instmap.macdList = msh.macd;
		instmap.signalLineList = msh.signalLine;
		instmap.histogramList = msh.histogram;

		lastbar.macd = instmap.macdList[instmap.macdList.length - 1];
		lastbar.signalLine = instmap.signalLineList[instmap.signalLineList.length - 1];
		lastbar.histogram = instmap.histogramList[instmap.histogramList.length - 1];

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

}).call(Engine.prototype);

module.exports = Engine;