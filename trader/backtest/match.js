// 模拟交易所撮合成交
const object = require('iguzhi/object');
const ntevent = require('../../lib/ntevent');
const dict = require('../base/dict');
const moment = require('moment');
const OrderedMap = require('../../lib/orderedmap');

function Match() {
	this.orderMap = new OrderedMap();
	this.workingOrderMap = new OrderedMap();
	this.tradeMap = new OrderedMap();
	this.lastTickMap = {};
}

(function() {

	var nTradeID = 0;
	var nOrderRef = 0;
	var nOrderActionRef = 0;

	this.start = function() {
		ntevent.on('/market/tick', this.onTick.bind(this));
		ntevent.on('/match/sendOrder', this.sendOrder.bind(this));
		ntevent.on('/match/cancelOrder', this.cancelOrder.bind(this));
		ntevent.on('/match/queryPosition', this.queryPosition.bind(this));
	};

	this.onTick = function(tick) {
		var lastTick = this.lastTickMap[tick.InstrumentID] || tick;
		this.lastTickMap[tick.InstrumentID] = tick;

		tick.VolumeTraded = tick.Volume - lastTick.Volume;
		// 商品成交量双边计算, 故需除以2
		if (tick.ExchangeID !== dict.ExchangeID_CFFEX) {
			tick.VolumeTraded = tick.VolumeTraded / 2;
		}

		var orderMap = this.workingOrderMap.filter({
			InstrumentID: tick.InstrumentID
		});

		if (orderMap.isEmpty()) {
			return;
		}

		var me = this;

		tick.VolumeTraded
		&& orderMap.forEach(function(order, orderRef) {
			// if (order.OrderStatus === dict.OrderStatus_AllTraded
			// 	|| order.OrderStatus === dict.OrderStatus_Canceled
			// 	|| order.OrderStatus === dict.OrderStatus_PartTradedNotQueueing) {
			// 	return;
			// }

			var trade, mt;

			if (order.Direction === dict.Direction_Buy) {
				if (tick.BidPrice1 < order.LimitPrice) {
					order.VolumeTraded = Math.min(tick.VolumeTraded, order.VolumeTotal);
					order.VolumeTotal = order.VolumeTotal - order.VolumeTraded;
					order.OrderStatus = order.VolumeTotal === 0 ? dict.OrderStatus_AllTraded : dict.OrderStatus_PartTradedQueueing;

					if (order.OrderStatus === dict.OrderStatus_AllTraded
						|| order.OrderStatus === dict.OrderStatus_Canceled
						|| order.OrderStatus === dict.OrderStatus_PartTradedNotQueueing) {
						me.workingOrderMap.remove(orderRef);
					}

					ntevent.emit('/trade/OnRtnOrder', order);

					mt = moment(tick.LogTime);
					trade = {};
					trade.TradeDate = mt.format('YYYYMMDD');
					trade.TradeTime = mt.format('HH:mm:ss');
					trade.TradeID = me.nTradeID();
					trade.InstrumentID = order.InstrumentID;
					trade.OrderRef = order.OrderRef;
					trade.Direction = order.Direction;
					trade.HedgeFlag = order.CombHedgeFlag;
					trade.OffsetFlag = order.CombOffsetFlag;
					trade.Price = order.LimitPrice;
					trade.Volume = order.VolumeTraded;
					me.tradeMap.add(trade.TradeID, trade);
					ntevent.emit('/trade/OnRtnTrade', trade);
				}
			}
			else if (order.Direction === dict.Direction_Sell) {
				if (tick.AskPrice1 > order.LimitPrice) {
					order.VolumeTraded = Math.min(tick.VolumeTraded, order.VolumeTotal);
					order.VolumeTotal = order.VolumeTotal - order.VolumeTraded;
					order.OrderStatus = order.VolumeTotal === 0 ? dict.OrderStatus_AllTraded : dict.OrderStatus_PartTradedQueueing;

					if (order.OrderStatus === dict.OrderStatus_AllTraded
						|| order.OrderStatus === dict.OrderStatus_Canceled
						|| order.OrderStatus === dict.OrderStatus_PartTradedNotQueueing) {
						me.workingOrderMap.remove(orderRef);
					}

					ntevent.emit('/trade/OnRtnOrder', order);

					mt = moment(tick.LogTime);
					trade = {};
					trade.TradeDate = mt.format('YYYYMMDD');
					trade.TradeTime = mt.format('HH:mm:ss');
					trade.TradeID = me.nTradeID();
					trade.InstrumentID = order.InstrumentID;
					trade.OrderRef = order.OrderRef;
					trade.Direction = order.Direction;
					trade.HedgeFlag = order.CombHedgeFlag;
					trade.OffsetFlag = order.CombOffsetFlag;
					trade.Price = order.LimitPrice;
					trade.Volume = order.VolumeTraded;
					me.tradeMap.add(trade.TradeID, trade);
					ntevent.emit('/trade/OnRtnTrade', trade);
				}
			}
		});
	};

	this.sendOrder = function(order) {
		var lastTick = this.lastTickMap[order.InstrumentID];
		if (!lastTick) {
			return;
		}

		var maxOrderRef = Math.max.apply(null, this.orderMap.keys());
		if (this.OrderRef <= maxOrderRef) {
			this.OrderRef = maxOrderRef;
		}

		if (!order.OrderRef) {
			order.OrderRef = this.nOrderRef();
		}
		else if (order.OrderRef > this.OrderRef) {
			this.OrderRef = order.OrderRef;
		}

		order.OrderStatus = dict.OrderStatus_NoTradeQueueing;
		order.VolumeTraded = 0;
		order.VolumeTotal = order.VolumeTotalOriginal;

		mt = moment(lastTick.LogTime);
		order.InsertDate = mt.format('YYYYMMDD');
		order.InsertTime = mt.format('HH:mm:ss');

		this.workingOrderMap.add(order.OrderRef, order);
		this.orderMap.add(order.OrderRef, order);
		ntevent.emit('/trade/OnRtnOrder', order);
	};

	this.cancelOrder = function(orderAction) {
		if (orderAction.ActionFlag === dict.ActionFlag_Delete) {
			orderAction.OrderActionRef = orderAction.OrderActionRef || this.nOrderActionRef();

			var orderMap = this.orderMap.filter({
				InstrumentID: orderAction.InstrumentID
			});

			if (orderMap.isEmpty()) {
				orderAction.OrderActionStatus = dict.OrderActionStatus_Rejected;
			}

			var order = orderMap.get(orderAction.OrderRef);

			if (!order) {
				orderAction.OrderActionStatus = dict.OrderActionStatus_Rejected;
			}
			else if (order.OrderStatus === dict.OrderStatus_AllTraded
				|| order.OrderStatus === dict.OrderStatus_Canceled
				|| order.OrderStatus === dict.OrderStatus_PartTradedNotQueueing) {
				orderAction.OrderActionStatus = dict.OrderActionStatus_Rejected;
			}
			else {
				order.OrderStatus = order.VolumeTotal === 0 ? dict.OrderStatus_AllTraded : dict.OrderStatus_PartTradedNotQueueing;
				this.workingOrderMap.remove(order.OrderRef);
				ntevent.emit('/trade/OnRtnOrder', order);
			}
		}
	};

	this.queryPosition = function(data) {
		// 这个函数按照ctp所给字段填充数据太复杂, 实际应用中也通常在策略里自己根据成交回报统计持仓, 那就不实现了吧
	};

	this.nTradeID = function() {
		return ++nTradeID;
	};

	this.nOrderRef = function() {
		return ++nOrderRef;
	};

	this.nOrderActionRef = function() {
		return ++nOrderActionRef;
	};

}).call(Match.prototype);

module.exports = Match;