const Class = require('iguzhi/class');
const BarModel = require('../../db/model/bar');
const dbLogger = require('../../lib/logger').db;
const eelogger = require('../../lib/logger').tengine;
const dict = require('../base/dict');
const si = require('../si');

function Engine() {
	this.$superConstructor(arguments);
	this.engineName = dict.EngineName_Market;
}

(function() {

  this.subscribeMarket = function(ctp) {
    var strategy = this.strategy;
    var productMap = strategy.product;
    var instrumentIDList = strategy.subscribeInstrumentIDList = [];


    si.pullsi(function(list) {
      list.forEach(function(d) {
        var code = d.code;
        var product = productMap[code];
        if (!product) {
          code = code.toUpperCase();
          product = productMap[code];
          if (product) {
            d.instrumentid = d.instrumentid.replace(d.code, code);
          }
        }
        if (product) {
          d.instrumentid = d.instrumentid.replace(d.code, code);
          if(product.ExchangeID === dict.ExchangeID_CZCE && /^[a-zA-Z]+\d{4}$/.test(d.instrumentid)) {
            d.instrumentid = d.instrumentid.replace(/\d/, '');
          }
          instrumentIDList.push(d.instrumentid);
        }
      });

      eelogger.info("Subscribing instrumentIDList: %j", instrumentIDList);
      
      strategy.initContext();
      eelogger.info("SubscribeMarket: %s", ctp.md.SubscribeMarketData(instrumentIDList, instrumentIDList.length));
    });
  };

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

