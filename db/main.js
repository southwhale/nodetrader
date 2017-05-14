// 该模块用于创建表

const Tick = require('./model/tick');

Tick.drop().then(function() {
	Tick.sync({force: true});
});