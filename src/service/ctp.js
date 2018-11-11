'use strict';

import { ee, Market, Trade, Ctp, helper, dict }  from 'edonctp';
import { ctp } from 'config';
import { getLogger } from 'logger';
import barHelper from 'util/barhelper';

const logger = getLogger('ctp');
const { server, account } = ctp;
const { sleep } = helper;

class MyMarket extends Market {

  OnFrontConnected() {
    super.OnFrontConnected(...arguments);
    let { md, investor } = this.ctp;
    logger.info('ReqUserLogin : %s', md.ReqUserLogin(investor, this.ctp.nRequestID()));
  }

  OnRspUserLogin(data, rsp, nRequestID, bIsLast) {
    super.OnRspUserLogin(...arguments);
  }
  
  OnRspSubMarketData(data, rsp, nRequestID, bIsLast) {
    super.OnRspSubMarketData(...arguments);
  }
  
  OnRspUnSubMarketData(data, rsp, nRequestID, bIsLast) {
    super.OnRspSubMarketData(...arguments);
  }
  
  OnRtnDepthMarketData(data) {
    // super.OnRspSubMarketData(...arguments);
    ee.emit('OnRtnDepthMarketData', data);
  }
}

class MyTrade extends Trade {

  OnFrontConnected() {
      super.OnFrontConnected(...arguments);
      let { investor, td, setting } = this.ctp;
      // 登录失败达到maxTryLoginTimes次, 则释放该账户的ctp对象
      if (!investor.tryLoginTimes || investor.tryLoginTimes < setting.maxTryLoginTimes) {
          investor.tryLoginTimes = investor.tryLoginTimes || 0;
          investor.tryLoginTimes++;
          
          logger.info('ReqUserLogin : %s', td.ReqUserLogin(investor, this.ctp.nRequestID()));
      }
      else {
          td.Release();
          logger.error('Try ReqUserLogin %s times by Investor: %j, but failed!', setting.maxTryLoginTimes, investor);
      }
  }

  OnRspUserLogin(data, rsp, nRequestID, bIsLast) {
    super.OnRspUserLogin(...arguments);
    if (rsp.ErrorID) {
      return;
    }

    this.ctp.SettlementDay = data.TradingDay;
    let { investor, td } = this.ctp;
    // 投资者结算结果确认, 做完这一步才可以进行正常的交易
    td.ReqSettlementInfoConfirm({
      BrokerID: investor.BrokerID,
      InvestorID: investor.UserID,
      ConfirmDate: data.TradingDay,
      ConfirmTime: data.SHFETime
    }, this.ctp.nRequestID());
    
    (async (ms) => {

      await sleep(ms);
      td.ReqQryExchange({
      }, this.ctp.nRequestID());

      await sleep(ms);
      td.ReqQryProduct({
      }, this.ctp.nRequestID());

      await sleep(ms);
      td.ReqQryInstrument({
      }, this.ctp.nRequestID());

    })(1000);
      
  }

  OnRspQryInstrument(data, rsp, nRequestID, bIsLast) {
    super.OnRspQryInstrument(...arguments);
    !rsp.ErrorID && ee.emit('OnRspQryInstrument', data, rsp, nRequestID, bIsLast);
  }

  // 请求查询合约手续费率响应 
  OnRspQryInstrumentCommissionRate(data, rsp, nRequestID, bIsLast) {
    super.OnRspQryInstrumentCommissionRate(...arguments);
    !rsp.ErrorID && ee.emit('OnRspQryInstrumentCommissionRate', data, rsp, nRequestID, bIsLast);
  }
  // 请求查询交易所响应
  OnRspQryExchange(data, rsp, nRequestID, bIsLast) {
    super.OnRspQryExchange(...arguments);
    !rsp.ErrorID && ee.emit('OnRspQryExchange', data, rsp, nRequestID, bIsLast);
  }
  // 请求查询产品响应
  OnRspQryProduct(data, rsp, nRequestID, bIsLast) {
    super.OnRspQryProduct(...arguments);
    !rsp.ErrorID && ee.emit('OnRspQryProduct', data, rsp, nRequestID, bIsLast);
  }

  // 请求查询报单手续费响应
  OnRspQryInstrumentOrderCommRate(data, rsp, nRequestID, bIsLast) {
    super.OnRspQryInstrumentOrderCommRate(...arguments);
    !rsp.ErrorID && ee.emit('OnRspQryInstrumentOrderCommRate', data, rsp, nRequestID, bIsLast);
  }

  OnRspUserLogout(data, rsp, nRequestID, bIsLast) {
    super.OnRspUserLogout(...arguments);
  }
  
  // 报单通知
  OnRtnOrder(data) {
    super.OnRtnOrder(...arguments);
  }
  // 成交通知
  OnRtnTrade(data) {
    super.OnRtnTrade(...arguments);
    // 在这里查资金状况, 根据判断发出通知和出金改密操作
    // 平仓: OffsetFlag==3, 开仓: OffsetFlag==0
    // data.OffsetFlag != 0 && this.ctp.td.ReqQryTradingAccount(this.ctp.investor, this.ctp.nRequestID());
  }

  OnRspQryTradingAccount(data, rsp, nRequestID, bIsLast) {
    super.OnRspQryTradingAccount(...arguments);
  }

  OnRspFromFutureToBankByFuture(data, rsp, nRequestID, bIsLast) {
    super.OnRspFromFutureToBankByFuture(...arguments);
  }

  OnRspFromBankToFutureByFuture(data, rsp, nRequestID, bIsLast) {
    super.OnRspFromBankToFutureByFuture(...arguments);
  }

  OnRspTradingAccountPasswordUpdate(data, rsp, nRequestID, bIsLast) {
    super.OnRspTradingAccountPasswordUpdate(...arguments);
  }
}

class CtpService {
  static get instance() {
    if (!this._instance) {
      this._instance = new this();
    }
    return this._instance;
  }

  start() {
    let ctp = new Ctp(server, account);
    
    new MyMarket(ctp);
    new MyTrade(ctp);

    this.ctp = ctp;

    let exchangeList = [];
    ee.on('OnRspQryExchange', async (data, rsp, nRequestID, bIsLast) => {
      if (bIsLast) {
        if (!exchangeList.length) {
          return;
        }
        exchangeList.push(data);
        ee.emit('ExchangeReady', true);
        exchangeList = [];
      }
      else {
        exchangeList.push(data);
      }
    });

    let productList = [];
    ee.on('OnRspQryProduct', async (data, rsp, nRequestID, bIsLast) => {
      if (bIsLast) {
        if (!productList.length) {
          return;
        }
        validateProduct(data.ProductID) && productList.push(data);
        ee.emit('ProductReady', true);
        productList = [];
      }
      else {
        validateProduct(data.ProductID) && productList.push(data);
      }
    });

    let instrumentList = [];
    ee.on('OnRspQryInstrument', async (data, rsp, nRequestID, bIsLast) => {
      if (bIsLast) {
        validateInstrument(data.InstrumentID) && instrumentList.push(data);
        if (!instrumentList.length) {
          return;
        }
        ee.emit('InstrumentReady', true);

        for (let i = 0; i < instrumentList.length; i++) {
          let instrument = instrumentList[i];

          await sleep(1000);
          ctp.td.ReqQryInstrumentCommissionRate({
            BrokerID: ctp.investor.BrokerID,
            InvestorID: ctp.investor.UserID,
            InstrumentID: instrument.InstrumentID
          }, ctp.nRequestID(), ctp.td);
          
          await sleep(1000);
          ctp.td.ReqQryInstrumentOrderCommRate({
            BrokerID: ctp.investor.BrokerID,
            InvestorID: ctp.investor.UserID,
            InstrumentID: instrument.InstrumentID
          }, ctp.nRequestID(), ctp.td);
        }
        instrumentList = [];
        await sleep(1000);
        ee.emit('CommissionReady', true);
      }
      else {
        validateInstrument(data.InstrumentID) && instrumentList.push(data);
      }
    });

    ee.on('OnRspQryInstrumentCommissionRate', (data, rsp, nRequestID, bIsLast) => {
      data.SettlementDay = ctp.SettlementDay;
    });

    ee.on('OnRtnDepthMarketData', (data) => {
      data.ArrivedTime = new Date().getTime();
      data.SettlementDay = ctp.SettlementDay;
      let instrument = dict.Instrument[data.InstrumentID];
      data.ProductID = instrument.ProductID;
      data.ExchangeID = instrument.ExchangeID;
      buildTickTime(data);
      fixTick(data);
      ee.emit('tick', data);
    });

    let orderCommRateList = [];
    ee.on('OnRspQryInstrumentOrderCommRate', (data, rsp, nRequestID, bIsLast) => {
      if (data.InstrumentID) {
        data.SettlementDay = ctp.SettlementDay;
        if (bIsLast) {
          orderCommRateList.push(data);
          // TODO: 
          orderCommRateList = [];
        }
        else {
          orderCommRateList.push(data);
        }
      }
    });

    ee.on('tick', (tick) => {
      barHelper.buildBar(tick, 1);
    });

    ee.on('bar', (bar) => {

    });

    ee.on('bar_tick', (barTick) => {
      
    });
  }

  getSettlementDay() {
    return this.ctp.SettlementDay;
  }

  stop() {
    this.ctp && this.ctp.dispose();
    if (this.ctp) {
      this.ctp.td && this.ctp.td.Dispose();
      this.ctp.md && this.ctp.md.Dispose();
    }
    this.ctp = null;
  }

  subscribeMarketData(instrumentIDList) {
    logger.info("SubscribeMarketData:", this.ctp.md.SubscribeMarketData(instrumentIDList));
  }
}

function fixTick(tick) { // 无穷大数的情况
  if (tick.Volume === 0) {
    tick.SettlementPrice = 0;
  }
  else {
    tick.SettlementPrice = tick.Turnover / tick.Volume / dict.Product[tick.ProductID].VolumeMultiple;
  }

  for (let key in tick) {
    let value = tick[key];
    if (typeof value === 'number' && value === Number.MAX_VALUE) {
      tick[key] = 0;
    }
  }
}

function buildTickTime(tick) {
	tick.TickTime = new Date(tick.ActionDay.match(/^\d{4}|\d{2}/g).join('/') + ' ' + tick.UpdateTime + '.' + tick.UpdateMillisec);
  if (tick.UpdateTime >= '20:00:00' || tick.UpdateTime < '08:00:00') {
    if (isDCE(tick)) {
      if (tick.UpdateTime >= '20:00:00') {
         tick.TickTime = new Date(tick.TickTime - 86400000);
      }
      if (tick.TickTime.getDay() < 1) {
         tick.TickTime = new Date(tick.TickTime - 172800000);
      }
    }
  }
  tick.TickTime = tick.TickTime.getTime();
}

function isDCE(tick) {
  let exchange = dict.Exchange[tick.ExchangeID];
  return exchange && exchange.ExchangeProperty === dict.ExchangePropertyType.GenOrderByTrade;
}

function validateInstrument(instrumentID) {
  return /^[a-zA-Z]{1,2}\d{3,4}$/.test(instrumentID);
}

function validateProduct(productID) {
  return /^[a-zA-Z]{1,2}$/.test(productID);
}

export default CtpService;

/**
// td上可用的查询接口
td.ReqSettlementInfoConfirm({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID,
    ConfirmDate: data.TradingDay,
    ConfirmTime: data.SHFETime
}, this.ctp.nRequestID());

td.ReqQueryMaxOrderVolume({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID,
    InstrumentID: 'CF901'
}, this.ctp.nRequestID());

td.ReqQryOrder({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID
}, this.ctp.nRequestID());

td.ReqQryTrade({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID
}, this.ctp.nRequestID());

td.ReqQryInvestorPosition({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID
}, this.ctp.nRequestID());

td.ReqQryInvestor({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID
}, this.ctp.nRequestID());

td.ReqQryTradingAccount({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID
}, this.ctp.nRequestID());

td.ReqQryInstrumentMarginRate({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID,
    InstrumentID: 'CF901'
}, this.ctp.nRequestID());

td.ReqQryInstrumentCommissionRate({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID,
    InstrumentID: 'CF901'
}, this.ctp.nRequestID());

td.ReqQryExchange({
}, this.ctp.nRequestID());

td.ReqQryProduct({
}, this.ctp.nRequestID());

td.ReqQryInstrument({
}, this.ctp.nRequestID());

td.ReqQryDepthMarketData({
    InstrumentID: 'CF901'
}, this.ctp.nRequestID());

td.ReqQrySettlementInfo({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID,
}, this.ctp.nRequestID());

td.ReqQryInvestorPositionDetail({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID,
}, this.ctp.nRequestID());

td.ReqQryNotice({
    BrokerID: investor.BrokerID,
}, this.ctp.nRequestID());

td.ReqQrySettlementInfoConfirm({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID,
}, this.ctp.nRequestID());

td.ReqQryExchangeMarginRate({
    BrokerID: investor.BrokerID,
    HedgeFlag: '1',
}, this.ctp.nRequestID());

td.ReqQryExchangeRate({
    BrokerID: investor.BrokerID,
}, this.ctp.nRequestID());

td.ReqQryInstrumentOrderCommRate({ // 目前仅股指期货合约报单收取手续费
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID,
    InstrumentID: 'IF1806'
}, this.ctp.nRequestID());

td.ReqQryTransferSerial({
    BrokerID: investor.BrokerID,
    AccountID: investor.UserID,
    BankID: 5
}, this.ctp.nRequestID());

td.ReqQryAccountregister({
    BrokerID: investor.BrokerID,
    AccountID: investor.UserID,
    BankID: 5
}, this.ctp.nRequestID());

td.ReqQryContractBank({
    BrokerID: investor.BrokerID,
    BankID: 5
}, this.ctp.nRequestID());

td.ReqQryTradingNotice({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID,
}, this.ctp.nRequestID());

td.ReqQryBrokerTradingParams({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID,
}, this.ctp.nRequestID());

td.ReqQueryCFMMCTradingAccountToken({
    BrokerID: investor.BrokerID,
    InvestorID: investor.UserID,
}, this.ctp.nRequestID());
*/