// 该模块用于创建表

const Bar = require('./model/bar');

Bar.drop().then(function() {
	Bar.sync({force: true});
});