const ntevent = require('../lib/ntevent');
const httpHelper = require('../lib/httphelper');
const httpCfg = require('../config/httpcfg.json');
const _ = require('lodash');

var exchangeMap = {};
var productMap = {};

ntevent.on('/trade/OnRspQryExchange', function(data, bIsLast) {
	exchangeMap[data.ExchangeID] = data;
});

ntevent.on('/trade/OnRspQryProduct', function(data, bIsLast) {
	var exchange = exchangeMap[data.ExchangeID];
	data.ExchangeName = exchange.ExchangeName;
	productMap[data.ProductID] = data;

	bIsLast && addProductExtraFields();
});

ntevent.on('/trade/OnRtnInstrumentStatus', function(data) {
	var d = productMap[data.InstrumentID];
	d && (d.InstrumentStatus = data.InstrumentStatus);
});

function addProductExtraFields() {
	httpHelper.get(httpCfg.urlMap.productList, httpCfg.timeout, function(err, data) {
		if (err) {
			addProductExtraFields();
			return;
		}

		data = JSON.parse(data);

		var map = {};
		data.success && data.result.list.forEach(function(pdt, code) {
			map[pdt.code] = pdt;
		});

		_.forEach(productMap, function(pdt, productID) {
			var p = map[productID.toUpperCase()];
			if (p) {
				pdt.tickDecimal = p.tickDecimal;
				pdt.dayOpenTime = p.dayOpenTime;
				pdt.dayCloseTime = p.dayCloseTime;
				pdt.nightOpenTime = p.nightOpenTime;
				pdt.nightCloseTime = p.nightCloseTime;
				pdt.kc = p.kc;
				pdt.pc = p.pc;
				pdt.declareFee = p.declareFee;
				pdt.chargeMethod = p.chargeMethod;
			}
		});
	}, httpCfg.encoding, {"User-Agent": httpCfg["User-Agent"]});
}

module.exports = productMap;