const Class = require('iguzhi/class');
const Tick = require('../../db/model/tick');
const ntevent = require('../../lib/ntevent');
const moment = require('moment');

function Engine() {
	this.$superConstructor(arguments);
	this.engineName = 'BacktestEngine';

	this.startDate = null; // 格式: 'YYYYMMDD'
	this.endDate = null; // 格式: 'YYYYMMDD'
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

Class.inherit(Engine, require('../base/engine'));

module.exports = Engine;

