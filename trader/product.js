const ntevent = require('../lib/ntevent');

var exchangeMap = {};
var productMap = {};

ntevent.on('/trade/OnRspQryExchange', function(data) {
	exchangeMap[data.ExchangeID] = data;
});

ntevent.on('/trade/OnRspQryProduct', function(data) {
	var exchange = exchangeMap[data.ExchangeID];
	data.ExchangeName = exchange.ExchangeName;
	productMap[data.ProductID] = data;
});

module.exports = productMap;