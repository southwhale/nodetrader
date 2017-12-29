// 该模块用来保存实盘实时计算出来的指标

const Sequelize = require('sequelize');
const db = require('../db');

var Bar = db.define(
  // 默认表名（一般这里写单数），生成时会自动转换成复数形式
  // 这个值还会作为访问模型相关的模型时的属性名，所以建议用小写形式
  'bar',
  // 字段定义（主键、created_at、updated_at默认包含，不用特殊定义）
  {
    'id': {
      'type': Sequelize.BIGINT(20),  // 字段类型
      'allowNull': false,         // 是否允许为NULL
      'unique': true,
      'primaryKey': true,
      'autoIncrement': true
    },
    'periodDatetime': {
      'type': Sequelize.STRING(20),  // 字段类型
      'allowNull': false         // 是否允许为NULL
    },
    'instrumentID': {
      'type': Sequelize.CHAR(9),
      'allowNull': false
    },
    'productID': {
      'type': Sequelize.CHAR(9),
      'allowNull': false
    },
    'exchangeID': {
      'type': Sequelize.CHAR(9),
      'allowNull': false
    },
    'open': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'high': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'low': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'close': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'volume': {
      'type': Sequelize.INTEGER,
      'allowNull': false
    },
    'openInterest': {
      'type': Sequelize.INTEGER,
      'allowNull': false
    }/*,
    'settlement': { // 分时图黄线均价, 也就是实时的结算价
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'ma5': {
      'type': Sequelize.DOUBLE,
      'allowNull': true
    },
    'ma10': {
      'type': Sequelize.DOUBLE,
      'allowNull': true
    },
    'ma20': {
      'type': Sequelize.DOUBLE,
      'allowNull': true
    },
    'ma40': {
      'type': Sequelize.DOUBLE,
      'allowNull': true
    },
    'ma60': {
      'type': Sequelize.DOUBLE,
      'allowNull': true
    },
    'macd': {
      'type': Sequelize.DOUBLE,
      'allowNull': true
    },
    'signalLine': {
      'type': Sequelize.DOUBLE,
      'allowNull': true
    },
    'histogram': {
      'type': Sequelize.DOUBLE,
      'allowNull': true
    }*/
  },
  {
    // 自定义表名
    // 'freezeTableName': true,
    // 'tableName': 'bar',

    // 是否需要增加createdAt、updatedAt、deletedAt字段
    'timestamps': false
  }
);

module.exports = Bar;