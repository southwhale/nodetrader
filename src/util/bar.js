const moment = require('moment');
const constant = require('./constant');
const { ee } = require('edonctp');

const instrumentMap = {};

export function convertPeriodDatetime(periodDatetime, periodValue) {
  let date = new Date(moment(periodDatetime, constant.pattern_minuteBarPeriod).valueOf());

  let minutes = date.getMinutes();
  let minuteInteger = parseInt(minutes / periodValue);
  date.setMinutes(minuteInteger * periodValue);
  return moment(date).format(constant.pattern_minuteBarPeriod);
}

export function getPeriodDatetimeByPeriod(tickTime, periodValue) {
  let date = new Date(tickTime);

  let minutes = date.getMinutes();
  let minuteInteger = parseInt(minutes / periodValue);
  date.setMinutes(minuteInteger * periodValue);
  return moment(date).format(constant.pattern_minuteBarPeriod);
}

export function buildBar(tick, periodValue)  {
  let datetime = this.getPeriodDatetimeByPeriod(tick.tickTime, periodValue);

  if (!instrumentMap[tick.instrumentId]) {
    instrumentMap[tick.instrumentId] = {};
  }
  let instmap = instrumentMap[tick.instrumentId];

  if (!instmap.bar) {
    instmap.bar = {};
  }
  let bar = instmap.bar;

  if (datetime != bar.dateTime) {
    if (bar.dateTime) {
      instmap.lastbar = bar;
      // 当小节收盘或其他各种收盘时交易所仍会推送多余的tick过来, 这里可以通过bar的成交量来过滤掉 
      bar.volume && this.onLastBar(bar);
    }

    // instmap.bar = bar;

    bar.instrumentId = tick.instrumentId;
    bar.productId = tick.productId;
    bar.exchangeId = tick.exchangeId;
    bar.dateTime = datetime;
    bar.open= tick.LastPrice;
    bar.highest = tick.lastPrice;
    bar.lowest = tick.lastPrice;
    bar.close = tick.lastPrice;

    bar.openVolume = instmap.lastbar && instmap.lastbar.closeVolume || tick.volume;
    bar.closeVolume = tick.volume;
    bar.volume = bar.closeVolume - bar.openVolume;
    bar.openInterest = tick.openInterest;
    bar.turnover = tick.turnover;
    bar.settlementDay = tick.settlementDay;
    bar.settlement = tick.settlement;
    ee.emit('bar_tick', { bar, tick });
  }
  else {
    bar.highest = Math.max(bar.highest, tick.lastPrice);
    bar.lowest = Math.min(bar.lowest, tick.lastPrice);
    bar.close = tick.lastPrice;
    bar.closeVolume = tick.volume;
    bar.volume = bar.closeVolume - bar.openVolume;
    bar.openInterest = tick.openInterest;
    bar.turnover = tick.turnover;
    bar.settlement = tick.settlement;
    ee.emit('bar_tick', { bar, tick });
  }

  
}

export function onLastBar(lastbar) {
  ee.emit('bar', lastbar);
}
