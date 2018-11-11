import BaseIndicator from './base';

export default class MA extends BaseIndicator {
  
  constructor(period) {
    super();
    this.period = period;
    this.name = `MA${this.period}`;
  }

  process(list, { precision, inputPropertyName='close', outputPropertyName }) {
    let len = list.length;
    let lastIndex = len - 1;
    let lastItem = list[lastIndex];
    let dayCount = this.period;

    outputPropertyName = outputPropertyName || this.name;

    if (lastIndex < dayCount - 1) {
      for (let i = 0; i < len; i++) {
        lastItem[outputPropertyName] = this.VALUE_EMPTY;
      }
    }
    else {
      let sum = 0;
      for (let j = lastIndex; j >= len - dayCount; j--) {
        sum += list[j][inputPropertyName];
      }
      lastItem[outputPropertyName] = Number((sum / dayCount).toFixed(precision));
    }
  }

}
