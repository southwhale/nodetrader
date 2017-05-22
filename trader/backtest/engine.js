const Class = require('iguzhi/class');
const Tick = require('../../db/model/tick');
const ntevent = require('../../lib/ntevent');
const moment = require('moment');

function Engine() {
	this.$superConstructor(arguments);
	this.startDate = null;// 格式: 'YYYYMMDD'
	this.endDate = null;// 格式: 'YYYYMMDD'
}

(function() {

	this.prepare = function() {
		var instrumentIDList = this.strategy.instrumentIDList;

		var option = {};
		if (this.startDate) {
			option.$gte = moment(this.startDate, 'YYYYMMDD').valueOf();
		}

		if (this.endDate) {
			option.$lt = moment(this.endDate, 'YYYYMMDD').valueOf();
		}

		Tick.findOne({
			where: {
				InstrumentID: {
					$in: instrumentIDList
				},
				LogTime: option
			},
			order: 'id ASC'
		})
		.then(function(tick) {
			tick = tick.toJSON();
	  	loadTicks(instrumentIDList, tick.id);
		});
	};

	this.setStartDate = function(date) {
		this.startDate = date;
	};

	this.setEndDate = function(date) {
		this.endDate = date;
	};

	function loadTicks(instrumentIDList, lastid) {
		Tick.findAll({
			where: {
				InstrumentID: {
					$in: instrumentIDList
				},
				id: {
					$gt: lastid
				}
			},
			order: 'id ASC',
			limit : 10000
		})
		.then(function(list) {
			if (!list.length) {
				return;
			}
			
			list.forEach(function(tick, i, list) {
				ntevent.emit('/market/tick', tick);
				if (i === list.length - 1) {
					lastid = tick.id;
				}
			});

			loadTicks(instrumentIDList, lastid);
		});
	}

}).call(Engine.prototype);

Class.inherit(Engine, require('../engine'));

module.exports = Engine;

