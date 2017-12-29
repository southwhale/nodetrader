/**
 * 缠论中各概念的处理
 *
 */
const Bar = require('./dict');

function Chan(barList) {
	this.barList = barList || [];
	this.resultList = [];
}

(function() {

	this.initBarList = function(barList) {
		this.barList = barList || [];
	};

	this.addBar = function(bar) {
		this.barList.push(bar);
	};

	// 包含处理
	this.contain = function(bar1, bar2, bar3) {
		if (bar2.high > bar1.high && bar2.low > bar1.low
			&& bar2.high > bar3.high && bar2.low < bar3.low) {

		}
	};

	this.isSunBar = function(bar) {
		return bar.close > bar.open;
	};

	this.isMoonBar = function(bar) {
		return bar.close < bar.open;
	};

	this.containAll = function() {

	};

}).call(Chan.prototype);

module.exports = Chan;