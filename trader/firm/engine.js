const Class = require('iguzhi/class');
const Tick = require('../../db/model/tick');
const ntevent = require('../../lib/ntevent');
const moment = require('moment');
const BarModel = require('../../db/model/bar');
const dbLogger = require('../../lib/logger').db;

function Engine() {
	this.$superConstructor(arguments);
	this.engineName = 'FirmEngine';
}

(function() {

	// 保存指标到数据库
	this.saveBar = function(bar) {
		// 这里用sequelize实现保存操作
	  BarModel.create(bar).then(function (p) {
	    dbLogger.info('save bar to db: %j', p);
	  })
	  .catch(function (err) {
	    dbLogger.error('failed save bar to db: %j', err);
	  });
	};

}).call(Engine.prototype);

Class.inherit(Engine, require('../base/engine'));

module.exports = Engine;

