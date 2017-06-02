// 模拟交易所撮合成交
const object = require('iguzhi/object');
const ntevent = require('../../lib/ntevent');
const dict = require('../base/dict');
const moment = require('moment');
const OrderedMap = require('../../orderedmap');

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
		ntevent.on('/trade/sendOrder', this.sendOrder.bind(this));
		ntevent.on('/trade/cancelOrder', this.cancelOrder.bind(this));
		ntevent.on('/trade/queryPosition', this.queryPosition.bind(this));
	};

	this.onTick = function(tick) {
		var orderMap = this.workingOrderMap.filter({
			InstrumentID: tick.InstrumentID
		});

		if (orderMap.isEmpty()) {
			return;
		}

		var lastTick = this.lastTickMap[tick.InstrumentID] || tick;

		tick.VolumeTraded = tick.volume - lastTick.volume;
		// 商品成交量双边计算, 故需除以2
		if (tick.ExchangeID !== dict.ExchangeID_CFFEX) {
			tick.VolumeTraded = tick.VolumeTraded / 2;
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
				if (tick.bidPrice1 > order.LimitPrice) {
					order.VolumeTraded = Math.min(tick.VolumeTraded, order.VolumeTotalOriginal);
					order.VolumeTotal = order.VolumeTotalOriginal - order.VolumeTraded;
					order.OrderStatus = order.VolumeTotal === 0 ? dict.OrderStatus_AllTraded ? dict.OrderStatus_PartTradedQueueing;
					mt = moment(tick.LogTime);
					order.TradingDay = mt.format('YYYYMMDD');
					order.UpdateTime = mt.format('HH:mm:ss');

					if (order.OrderStatus === dict.OrderStatus_AllTraded
						|| order.OrderStatus === dict.OrderStatus_Canceled
						|| order.OrderStatus === dict.OrderStatus_PartTradedNotQueueing) {
						me.workingOrderMap.remove(orderRef);
					}

					ntevent.emit('/trade/OnRtnOrder', order);

					trade = object.clone(order);
					trade.TradeDate = order.TradingDay;
					trade.TradeTime = order.UpdateTime;
					trade.TradeID = me.nTradeID();
					trade.Price = order.LimitPrice;
					trade.Volume = order.VolumeTraded;
					me.tradeMap.add(trade.TradeID, trade);
					ntevent.emit('/trade/OnRtnTrade', trade);
				}
			}
			else if (order.Direction === dict.Direction_Sell) {
				if (tick.askPrice1 < order.LimitPrice) {
					order.VolumeTraded = Math.min(tick.VolumeTraded, order.VolumeTotalOriginal);
					order.VolumeTotal = order.VolumeTotalOriginal - order.VolumeTraded;
					order.OrderStatus = order.VolumeTotal === 0 ? dict.OrderStatus_AllTraded ? dict.OrderStatus_PartTradedQueueing;
					mt = moment(tick.LogTime);
					order.TradingDay = mt.format('YYYYMMDD');
					order.UpdateTime = mt.format('HH:mm:ss');

					if (order.OrderStatus === dict.OrderStatus_AllTraded
						|| order.OrderStatus === dict.OrderStatus_Canceled
						|| order.OrderStatus === dict.OrderStatus_PartTradedNotQueueing) {
						me.workingOrderMap.remove(orderRef);
					}

					ntevent.emit('/trade/OnRtnOrder', order);

					trade = object.clone(order);
					trade.TradeDate = order.TradingDay;
					trade.TradeTime = order.UpdateTime;
					trade.TradeID = me.nTradeID();
					trade.Price = order.LimitPrice;
					trade.Volume = order.VolumeTraded;
					me.tradeMap.add(trade.TradeID, trade);
					ntevent.emit('/trade/OnRtnTrade', trade);
				}
			}
		});

		this.lastTickMap[tick.InstrumentID] = tick;
	};

	this.sendOrder = function(order) {
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

		var lastTick = this.lastTickMap[tick.InstrumentID];
		if (lastTick) {
			mt = moment(lastTick.LogTime);
			order.TradingDay = mt.format('YYYYMMDD');
			order.UpdateTime = mt.format('HH:mm:ss');
		}

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
				order.OrderStatus = (order.VolumeTotal === 0 ? dict.OrderStatus_AllTraded : dict.OrderStatus_PartTradedNotQueueing);
				this.workingOrderMap.remove(order.OrderRef);
				ntevent.emit('/trade/OnRtnOrder', order);
			}
		}
	};

	this.queryPosition = function(data) {
		var tradeMap = this.tradeMap.filter({
			InstrumentID: data.InstrumentID
		});

		var unCloseSellCount = 0;
		var unCloseBuyCount = 0;

		tradeMap.forEach(function(trade, tradeID) {
			if (trade.Direction === dict.Direction_Buy) {
				if (trade.CombOffsetFlag === dict.OffsetFlag_Open) {
					unCloseBuyCount += trade.Volume;
				}
				else if (trade.CombOffsetFlag === dict.OffsetFlag_Close
					|| trade.CombOffsetFlag === dict.OffsetFlag_CloseToday
					|| trade.CombOffsetFlag === dict.OffsetFlag_CloseYesterday) {
					unCloseSellCount -= trade.Volume;
				}
			}
			else if (trade.Direction === dict.Direction_Sell) {
				if (trade.CombOffsetFlag === dict.OffsetFlag_Open) {
					unCloseSellCount += trade.Volume;
				}
				else if (trade.CombOffsetFlag === dict.OffsetFlag_Close
					|| trade.CombOffsetFlag === dict.OffsetFlag_CloseToday
					|| trade.CombOffsetFlag === dict.OffsetFlag_CloseYesterday) {
					unCloseBuyCount -= trade.Volume;
				}
			}
		});

		if (unCloseBuyCount) {
			ntevent.emit('/trade/OnRspQryInvestorPosition', {
				InstrumentID: trade.InstrumentID,
				PosiDirection: dict.PosiDirection_Long,
				Position: unCloseBuyCount,
				YdPosition: 0
				// 未完待续
			});
		}
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

module.exports = new Match();