/**
 * Bar 是指一个指标周期时间刻度对应的那一个时间段内所有需要的技术指标的组合
 * 既包括K线也包括成交量、持仓量、均线和MACD对应的数值
 * 若需要其它指标, 可在该类中添加, 但最好不要删除原有的一些指标字段
 */
function Bar() {
	this.periodDatetime = null; // 统计指标周期的时间
	this.instrumentID = null;
	// K线部分
	this.open = null;
	this.high = null;
	this.low = null;
	this.close = null;

	this.volume = null; // 成交量
	this.openInterest = null; //持仓量

	// 均线部分
	this.ma5 = null;
	this.ma10 = null;
	this.ma20 = null;
	this.ma40 = null;
	this.ma60 = null;
	
	// MACD部分, 各部分的含义可参考macd.gif和macd_histogram.gif两张图
	this.macd = null;
	this.signalLine = null;
	this.histogram = null;

	// 每个指标周期内开始和结束时成交量
	this.openVolume = null;
	this.closeVolume = null;
}

(function() {


}).call(Bar.prototype);

// 基础指标, 其他指标基于基础指标计算而来
Bar.baseIndicatorNameList = ['open', 'high', 'low', 'close', 'volume', 'openInterest'];

module.exports = Bar;