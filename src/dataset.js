export default class DataSet {

  constructor({instrumentId, instrumentName, exchangeId, exchangeName, productId, productName, open, close, highest, lowest}) {
    this.source = []; // 传入的数据列表
    this.target = []; // 生产的数据列表
    this.indicatorList = []; // 使用的技术指标列表
    this.indicatorMap = {}; // 使用的技术指标映射

    this.instrumentId = instrumentId;
    this.instrumentName = instrumentName || instrumentId;
    this.exchangeId = exchangeId;
    this.exchangeName = exchangeName || exchangeId;
    this.productId = productId;
    this.productName = productName || productId;
    this.buildPrecision({open, close, highest, lowest});
  }

  /**
   * 添加数据项
   * @param {Object} item 数据项 
   */
  append(item) {
    this.appendSource(item);
    let isNew = this.appendTarget(item);
    this.process();
    return isNew;
  }

  reappend(item) {
    let isNew = this.appendTarget(item);
    this.process();
    return isNew;
  }

  appendSource(item, merge) {
    let sourceLen = this.source.length, isNew;
    if (sourceLen && this.source[sourceLen - 1].dateTime === item.dateTime) {
      if (merge) {
        let oldSourceItem = this.source[sourceLen - 1];
        oldSourceItem.highest = Math.max(oldSourceItem.highest, item.highest);
        oldSourceItem.lowest = Math.min(oldSourceItem.lowest, item.lowest);
        oldSourceItem.close = item.close;
        oldSourceItem.closeVolume = item.closeVolume;
        oldSourceItem.volume = oldSourceItem.closeVolume - oldSourceItem.openVolume;
      }
      else {
        this.source[sourceLen - 1] = item;
      }
      isNew = false;
    }
    else { // 两条数据时间字段不等，则加入到target列表中
      this.source.push(item);
      isNew = true;
    }
    return isNew;
  }

  appendTarget(item, merge) {
    let targetLen = this.target.length, isNew;
    if (targetLen && this.target[targetLen - 1].dateTime === item.dateTime) {
      if (merge) {
        let oldTargetItem = this.target[targetLen - 1];
        oldTargetItem.highest = Math.max(oldTargetItem.highest, item.highest);
        oldTargetItem.lowest = Math.min(oldTargetItem.lowest, item.lowest);
        oldTargetItem.close = item.close;
        oldTargetItem.closeVolume = item.closeVolume;
        oldTargetItem.volume = oldTargetItem.closeVolume - oldTargetItem.openVolume;
      }
      else {
        this.target[targetLen - 1] = { ...item }; // 克隆出新数据项
      }
      isNew = false;
    }
    else { // 两条数据时间字段不等，则加入到target列表中
      this.target.push({ ...item }); // 克隆出新数据项
      isNew = true;
    }
    return isNew;
  }

  remove(index) {
    this.source.splice(index, 1);
    this.target.splice(index, 1);
  }

  /**
   * 加工数据，加入技术指标字段
   */
  process() {
    this.indicatorList.forEach(indicator => {
      indicator.process(this.target, { precision: this.precision });
    });
  }

  getTarget() {
    return this.target;
  }

  getSource() {
    return this.source;
  }

  addIndicator(indicator) {
    if (!indicator.name || this.indicatorMap[indicator.name]) {
      return;
    }
    this.indicatorList.push(indicator);
    this.indicatorMap[indicator.name] = indicator;
  }

  clearIndicator() {
    this.indicatorList.length = 0;
    this.indicatorMap = {};
  }

  clearData() {
    this.source.length = 0;
    this.target.length = 0;
  }

  clearSource() {
    this.source.length = 0;
  }

  clearTarget() {
    this.target.length = 0;
  }

  resetIndicators() {
    this.indicatorList.forEach(indicator => indicator.reset());
  }

  destroy() {
    this.clearIndicator();
    this.clearData();
  }

  reInit({instrumentId, instrumentName, exchangeId, exchangeName, productId, productName, open, close, highest, lowest}) {
    this.instrumentId = instrumentId;
    this.instrumentName = instrumentName || instrumentId;
    this.exchangeId = exchangeId;
    this.exchangeName = exchangeName || exchangeId;
    this.productId = productId;
    this.productName = productName || productId;
    this.buildPrecision({open, close, highest, lowest});
  }

  buildPrecision(item) {
    this.rawPrecision = this.getPrecisionFromValueList([item.open, item.close, item.highest, item.lowest]);
    this.precision = this.rawPrecision + 1;
  }

  fixPrecision(item) {
    let rawPrecision = this.getPrecisionFromValueList([item.open, item.close, item.highest, item.lowest]);
    if (rawPrecision > this.rawPrecision) {
      this.rawPrecision = rawPrecision;
      this.precision = this.rawPrecision + 1;
    }
  }

  getPrecisionFromValueList(valueList) {
    valueList = valueList.map(value => String(value));
    let precision = 0;
    valueList.forEach(s => {
      let arr = s.split('.');
      if (arr[1] && arr[1].length > precision) {
        precision = arr[1].length;
      }
    });
    // precision === 10000 && (precision = 0);
    return precision;
  }

  getPrecisionFromValue(value) {
    value = String(value);
    let precision = 0;
    let arr = value.split('.');
    if (arr[1]) {
      precision = arr[1].length;
    }
    return precision;
  }
}

