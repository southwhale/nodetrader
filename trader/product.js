const product = require('../config/product.json');
const object = require('iguzhi/object');

var r = {};

object.forEach(product, function(map, exchangeid) {
	object.forEach(map, function(v, k) {
		v.list.forEach(function(item) {
			r[item.code] = {
				Code: item.code,
				ProductName: item.name,
				ExchangeID: exchangeid,
				ExchangeName: v.name
			};
		});
	});
});


module.exports = r;