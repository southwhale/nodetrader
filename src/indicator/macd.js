import BaseIndicator from './base';
import EMA from './ema';

export default class MACD extends BaseIndicator {
  
  constructor({ fastPeriod, slowPeriod, signalPeriod }={}) {
    super();

    if (fastPeriod > slowPeriod) {
      throw new Error('slowPeriod should be greater than fastPeriod!');
    }

    this.fastPeriod = fastPeriod || 12;
    this.slowPeriod = slowPeriod || 26;
    this.signalPeriod = signalPeriod || 9; // DEA

    this.fastEmaKey = `EMA${this.fastPeriod}`;
    this.slowEmaKey = `EMA${this.slowPeriod}`;
    this.signalEmaKey = `EMA${this.signalPeriod}`;
    this.fastEma = this[this.fastEmaKey] = new EMA(this.fastPeriod);
    this.slowEma = this[this.slowEmaKey] = new EMA(this.slowPeriod);
    this.signalEma = this[this.signalEmaKey] = new EMA(this.signalPeriod);
    this.name = 'MACD';
  }

  reset() {
    this.fastEma.reset();
    this.slowEma.reset();
    this.signalEma.reset();
  }

  process(list, { precision, inputPropertyName='close', outputPropertyName }) {
    this.fastEma.process(list, { precision });
    this.slowEma.process(list, { precision });
    let len = list.length;
    let lastIndex = len - 1;
    let lastItem = list[lastIndex];
    let lastFastEma = lastItem[this.fastEmaKey];
    let lastSlowEma = lastItem[this.slowEmaKey];

    lastItem.DIFF = this.isEmptyValue(lastSlowEma) ? this.VALUE_EMPTY : Number((lastFastEma - lastSlowEma).toFixed(precision));

    this.signalEma.process(list, { precision, inputPropertyName: 'DIFF', outputPropertyName: 'DEA'});

    lastItem.MACD = this.isEmptyValue(lastItem.DEA) ? this.VALUE_EMPTY : Number(((lastItem.DIFF - lastItem.DEA) * 2).toFixed(precision));
  }

}
