// 持仓缓存类
const dict = require('./dict');
const _ = require('lodash');

function PositionBuffer() {
	this.map = {};
}


(function() {

	this.init = function(instrumentID) {
		this.map[instrumentID] = {
			pos: 0, // 持仓数量
			price: 0 // 持仓均价
		};
	};

	this.add = function(trade) {
		var d = this.map[trade.InstrumentID];
	// if (trade.OffsetFlag === dict.OffsetFlag_Open) {
  // 		if (trade.Direction === dict.Direction_Buy) {
  // 			d.pos += trade.Volume;
  // 		}
  // 		else if (trade.Direction === dict.Direction_Sell) {
  // 			d.pos -= trade.Volume;
  // 		}
  // 	}
  // 	else if (trade.OffsetFlag === dict.OffsetFlag_Close // 平仓
  // 		|| trade.OffsetFlag === dict.OffsetFlag_CloseToday // 平今
  // 		|| trade.OffsetFlag === dict.OffsetFlag_CloseYesterday) { // 平昨
  // 		if (trade.Direction === dict.Direction_Buy) {
  // 			d.pos += trade.Volume;
  // 		}
  // 		else if (trade.Direction === dict.Direction_Sell) {
  // 			d.pos -= trade.Volume;
  // 		}
  // 	}
  	if (trade.Direction === dict.Direction_Buy) {
  		var price = Math.abs(d.pos * d.price + trade.Volume * trade.Price);
			d.pos += trade.Volume;
			d.price = d.pos ? Math.abs(price / d.pos) : 0;
		}
		else if (trade.Direction === dict.Direction_Sell) {
			var price = Math.abs(d.pos * d.price - trade.Volume * trade.Price);
			d.pos -= trade.Volume;
			d.price = d.pos ? Math.abs(price / d.pos) : 0;
		}
	};

	this.get = function(data) {
		var instrumentID = _.isString(data) ? data : data.InstrumentID;
		return this.map[instrumentID];
	};

	this.clear = function() {
		this.map = {};
	};

}).call(PositionBuffer.prototype);

module.exports = PositionBuffer;