export default class BaseIndicator {

  constructor() {
    this.name = 'BaseIndicator';
  }

  get VALUE_EMPTY() {
    return '-';
  }

  isEmptyValue(value) {
    return value === this.VALUE_EMPTY;
  }

  process(list, precision) {
    throw new Error('not implemented.');
  }

  reset() {

  }

}