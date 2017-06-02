const ntevent = require('../../lib/ntevent');
const logger = require('../../lib/logger').db;
const product = require('../product');
const setting = require('../../config/setting.json');
const Ctp = require('../../lib/ctp');
const Tick = require('../../db/model/tick');
const dict = require('../base/dict');


ntevent.on('/market/OnRtnDepthMarketData', function(tick) {
  // 下面三个函数调用顺序不能乱, 顺序依赖
	buildTickProductID(tick);
  buildTickExchangeID(tick);
	buildTickLogtime(tick);
  // 发送给交易引擎
  ntevent.emit('/market/tick', tick);
	// 存储tick
  saveToDB(tick);
});


/************************************************************/
// 保存行情到数据库
function saveToDB(tick) {
	// 这里用sequelize实现保存操作
  Tick.create(tick).then(function (p) {
    logger.info('save tick to db: %j', p);
  }).catch(function (err) {
    logger.error('failed save tick to db: %j', err);
  });
}


function buildTickLogtime(tick) {
	tick.LogTime = new Date(tick.ActionDay.match(/^\d{4}|\d{2}/g).join('/') + ' ' + tick.UpdateTime + '.' + tick.UpdateMillisec);
  if (tick.UpdateTime >= '20:00:00' || tick.UpdateTime < '08:00:00') {
    if (isDCE(tick)) {
      if (tick.UpdateTime >= '20:00:00') {
         tick.LogTime = new Date(tick.LogTime - 86400000);
      }
      if (tick.LogTime.getDay() < 1) {
         tick.LogTime = new Date(tick.LogTime - 172800000);
      }
    }
  }
  tick.LogTime = tick.LogTime.getTime();
}

function buildTickProductID(tick) {
	tick.ProductID = getProductID(tick.InstrumentID);
}

function buildTickExchangeID(tick) {
  tick.ExchangeID = product[tick.ProductID].ExchangeID;
}

function isDCE(tick) {
	return tick.ExchangeID === dict.ExchangeID_DCE;
}

function getProductID(instrumentID) {
  return instrumentID.replace(/\d+/, '');
}