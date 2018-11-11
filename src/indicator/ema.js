import BaseIndicator from './base';

export default class EMA extends BaseIndicator {
  
  constructor(period) {
    super();
    this.period = period;
    this.alpha = 2 / (period + 1);
    this.name = `EMA${this.period}`;
    this.sum = 0;
    this.skip = 0;
  }

  reset() {
    this.sum = 0;
    this.skip = 0;
  }

  process(list, { precision, inputPropertyName='close', outputPropertyName }) {
    let len = list.length;
    let lastIndex = len - 1;
    let lastItem = list[lastIndex];
    let dayCount = this.period;
    outputPropertyName = outputPropertyName || this.name;

    if (this.isEmptyValue(lastItem[inputPropertyName])) {
      lastItem[outputPropertyName] = this.VALUE_EMPTY;
      this.skip++;
      return;
    }
    if (lastIndex < dayCount + this.skip - 1) {
      this.sum += lastItem[inputPropertyName];
      lastItem[outputPropertyName] = this.VALUE_EMPTY;
    }
    else if (lastIndex === dayCount + this.skip - 1) {
      this.sum += lastItem[inputPropertyName];
      lastItem[outputPropertyName] = this.sum / dayCount;
    }
    else {
      let preLastItem = list[lastIndex - 1];
      let lastEma = preLastItem[outputPropertyName];
      lastItem[outputPropertyName] = Number((this.alpha * (lastItem[inputPropertyName] - lastEma) + lastEma).toFixed(precision));      
    }
  }

}
