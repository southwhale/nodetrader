const Class = require('iguzhi/class');
const TickModel = require('../../db/model/tick');
const ntevent = require('../../lib/ntevent');
const moment = require('moment');
const Order = require('../base/order');
const constant = require('../base/constant');
const dict = require('../base/dict');

function Engine() {
	this.$superConstructor(arguments);
	this.engineName = 'BacktestEngine';

	this.startDateTime = null; // 格式: 'YYYY/MM/DD HH:mm:ss'
	this.endDateTime = null; // 格式: 'YYYY/MM/DD HH:mm:ss'
	this.step = 10000; // 加载tick数据条数的步长
}

(function() {

	this.prepare = function() {
		var instrumentIDList = this.strategy.subscribeInstrumentIDList;

		var option = {};
		if (this.startDateTime) {
			option.$gte = moment(this.startDateTime, constant.pattern_datetime).valueOf();
		}

		if (this.endDateTime) {
			option.$lt = moment(this.endDateTime, constant.pattern_datetime).valueOf();
		}

		var me = this;

		TickModel.findOne({
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
	  	me.loadTicks(instrumentIDList, tick.id);
		});
	};

	this.setStartDateTime = function(dateTime) {
		this.startDateTime = dateTime;
	};

	this.setEndDateTime = function(dateTime) {
		this.endDateTime = dateTime;
	};

	this.setStep = function(step) {
		this.step = step;
	};

	/**
   * @param order {object} 订单
   * 发送订单
   */
  this.sendOrder = function(order) {
  	var o = new Order();

  	o.OrderPriceType = dict.PriceType_LimitPrice;
  	o.CombHedgeFlag = dict.HedgeFlag_Speculation;
  	o.TimeCondition = dict.TimeCondition_GFD;
  	o.VolumeCondition = dict.VolumeCondition_AV;
  	o.MinVolume = 1;
  	o.ContingentCondition = dict.ContingentCondition_Immediately;
  	o.ForceCloseReason = dict.ForceCloseReason_NotForceClose;
  	o.IsAutoSuspend = dict.IsAutoSuspend_No;
  	o.UserForceClose = dict.UserForceClose_No;

  	o.InstrumentID = order.InstrumentID;
  	o.Direction = order.Direction;
  	o.CombOffsetFlag = order.CombOffsetFlag;
  	o.LimitPrice = order.LimitPrice;
  	o.VolumeTotalOriginal = order.VolumeTotalOriginal;

  	o.OrderRef = this.nOrderRef();

  	ntevent.emit('/match/sendOrder', o);
  };

  /**
   * @param order {object} 订单
   * 撤单
   */
  this.cancelOrder = function(order) {
  	var data = {
      InstrumentID: order.InstrumentID,
      ActionFlag: dict.ActionFlag_Delete,
      OrderRef: order.OrderRef
    };

    ntevent.emit('/match/cancelOrder', data);
  };

  /**
   * 查询账户资金
   */
  this.queryAccount = function() {
  	// 回测不支持该方法
  };

  /**
   * 查询持仓
   */
  this.queryPosition = function() {
  	// 回测不支持该方法, 实盘中也很少用到, 多是根据成交回报自己统计持仓数据
  };

	this.loadTicks = function (instrumentIDList, lastid) {
		var me = this;

		TickModel.findAll({
			where: {
				InstrumentID: {
					$in: instrumentIDList
				},
				id: {
					$gt: lastid
				}
			},
			order: 'id ASC',
			limit : this.step
		})
		.then(function(list) {
			if (!list.length) {
				return;
			}
			
			list.forEach(function(tick, i, list) {
				tick = tick.toJSON();
				ntevent.emit('/market/tick', tick);
				if (i === list.length - 1) {
					lastid = tick.id;
				}
			});

			me.loadTicks(instrumentIDList, lastid);
		});
	};

}).call(Engine.prototype);

Class.inherit(Engine, require('../base/engine'));

module.exports = Engine;

