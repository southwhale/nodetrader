const httpHelper = require('../lib/httphelper');
const httpCfg = require('../config/httpcfg.json');
const constant = require('./base/constant');
const object = require('iguzhi/object');

function pullFromSina(callback) {
  httpHelper.get(httpCfg.urlMap.instrumentList, httpCfg.timeout, function (err, data) {
    if (err) {
      return;
    }

    // logger.info(data);

    data = JSON.parse(data);
    data = data && data[0];

    if (data) {
      var fieldMap = {};
      var instrumentMap = {};
      var code, arr, instrumentid, ishot, volume, market, hot, lessHot, result = [];

      data.fields.forEach(function(fieldName, index) {
        fieldMap[fieldName] = index;
      });

      data.items.forEach(function(item) {
        market = item[fieldMap.market];
        instrumentid = item[fieldMap.symbol].toLowerCase();
        // instrumentid = market === 'czce' ? instrumentid.replace(/\d/, '') : instrumentid;
        ishot = !!Number(item[fieldMap.is_hot]);
        volume = Number(item[fieldMap.volume]);

        if (/*ishot != 1 && */volume < constant.collector_baseVolume) {
          return;
        }
        code = instrumentid.replace(/\d+/, '');
        arr = instrumentMap[code] = instrumentMap[code] || [];
        arr.push({
          instrumentid: instrumentid,
          ishot: ishot,
          volume: volume,
          code: code
        });
      });

      
      object.forEach(instrumentMap, function(list, code) {
        list.sort(function(d1, d2) {
          return d1.instrumentid < d2.instrumentid;
        });

        

        for(var i = 0;i < list.length;i++) {
          var d = list[i];
          if (d.ishot) {
            // 根据成交量重置主力合约, 扯淡的新浪是不是根据持仓量来识别主力合约的?
            // 当主力和次主力合约的持仓量相差不多的情况下, 我们会选择交易成交量大的合约
            var jump = false;
            for (var j = i + 1;j < list.length;j++) {
              if (list[j].volume > d.volume) {
                d.ishot = false;
                list[j].ishot = true;
                jump = true;
                break;
              }
            }

            if (jump) {
              continue;
            }

            list.splice(i + 1, list.length - i - 1);

            hot = lessHot = null;
            list.forEach(function(d) {
              if (d.ishot) {
                hot = d;
              }
              else if (!lessHot || d.volume > lessHot.volume) {
                lessHot = d;
              }
            });
            
            if (lessHot) {
              if (hot.volume >= lessHot.volume) {
                result.push(hot);
                if (hot.volume / lessHot.volume < constant.collector_volumeTimes) {
                  result.push(lessHot);
                }
              }
              else {
                result.push(lessHot);
                if (lessHot.volume / hot.volume < constant.collector_volumeTimes) {
                  result.push(hot);
                }
              }
            }
            else {
              result.push(hot);
            }
          }
        }
      });

      callback && callback(result);
      result = arr = hot = lessHot = null;
    }

  }, httpCfg.encoding, {"User-Agent": httpCfg["User-Agent"]});
}

module.exports = {
  pullsi: pullFromSina
};