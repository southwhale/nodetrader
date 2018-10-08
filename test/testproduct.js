const httpHelper = require('../lib/httphelper');
const httpCfg = require('../config/httpcfg.json');
const _ = require('lodash');

var productMap = require('../trader/localproduct');

function addProductExtraFields() {
	httpHelper.get(httpCfg.urlMap.productList, httpCfg.timeout, function(err, data) {
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
			// else {
			// 	console.log('unhandled product: %j', pdt);
			// }
		});

		console.dir(productMap);
	}, httpCfg.encoding, {"User-Agent": httpCfg["User-Agent"]});
}

addProductExtraFields();