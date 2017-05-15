const ntevent = require('../../lib/ntevent');
const product = require('../product');
const setting = require('../../config/setting.json');
const Ctp = require('../../lib/ctp');
const Market = require('../mymarket');
const Tick = require('../../db/model/tick');

process.on('uncaughtException', function(err) {
  logger.info('uncaughtException: %j', err);
});

new Market(new Ctp(setting[4040]), 369888);


ntevent.on('/market/OnRtnDepthMarketData', function(tick) {
	buildTickProduct(tick);
	buildTickLogtime(tick);
	saveToDB(tick);
});


/************************************************************/
// 保存行情到数据库
function saveToDB(tick) {
	// 这里用sequelize实现保存操作
  Tick.create(tick).then(function (p) {
    console.log('created.' + JSON.stringify(p));
  }).catch(function (err) {
    console.log('failed: ' + err);
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

function buildTickProduct(tick) {
	tick.Product = getCode(tick.InstrumentID);
}

function isDCE(tick) {
	return product[tick.Product].ExchangeID === 'dce';
}

function getCode(instrumentID) {
  return instrumentID.replace(/\d+/, '');
}