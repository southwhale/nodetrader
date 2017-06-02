// 注意product.json中的作为key的交易所ID必须大写
const product = require('../config/product.json');
const object = require('iguzhi/object');

var r = {};

object.forEach(product, function(map, exchangeid) {
	map.list.forEach(function(item) {
		r[item.productID] = {
			ProductID: item.productID,
			ProductName: item.name,
			ExchangeID: exchangeid,
			ExchangeName: map.name
		};
	});
});

module.exports = r;