const Sequelize = require('sequelize');
const db = require('../db');

var Tick = db.define(
  // 默认表名（一般这里写单数），生成时会自动转换成复数形式
  // 这个值还会作为访问模型相关的模型时的属性名，所以建议用小写形式
  'tick',
  // 字段定义（主键、created_at、updated_at默认包含，不用特殊定义）
  {
    'id': {
      'type': Sequelize.BIGINT(20),  // 字段类型
      'allowNull': false,         // 是否允许为NULL
      'unique': true,
      'primaryKey': true,
      'autoIncrement': true
    },
    'TradingDay': {
      'type': Sequelize.CHAR(9),  // 字段类型
      'allowNull': false         // 是否允许为NULL
    },
    'InstrumentID': {
      'type': Sequelize.CHAR(9),
      'allowNull': false
    },
    'ProductID': {
      'type': Sequelize.CHAR(9),
      'allowNull': false
    },
    'ExchangeID': {
      'type': Sequelize.CHAR(9),
      'allowNull': false
    },
    'ExchangeInstID': {
      'type': Sequelize.STRING(31),
      'allowNull': false
    },
    'LastPrice': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'PreSettlementPrice': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'PreClosePrice': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'PreOpenInterest': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'OpenPrice': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'HighestPrice': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'LowestPrice': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'Volume': {
      'type': Sequelize.INTEGER,
      'allowNull': false
    },
    'Turnover': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'OpenInterest': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'ClosePrice': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'SettlementPrice': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'UpperLimitPrice': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'LowerLimitPrice': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    // 'PreDelta': {
    //   'type': Sequelize.DOUBLE,
    //   'allowNull': false
    // },
    // 'CurrDelta': {
    //   'type': Sequelize.DOUBLE,
    //   'allowNull': false
    // },
    'UpdateTime': {
      'type': Sequelize.CHAR(9),
      'allowNull': false
    },
    'UpdateMillisec': {
      'type': Sequelize.INTEGER,
      'allowNull': false
    },
    'BidPrice1': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'BidVolume1': {
      'type': Sequelize.INTEGER,
      'allowNull': false
    },
    'AskPrice1': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'AskVolume1': {
      'type': Sequelize.INTEGER,
      'allowNull': false
    },
    // 'BidPrice2': {
    //   'type': Sequelize.DOUBLE,
    //   'allowNull': false
    // },
    // 'BidVolume2': {
    //   'type': Sequelize.INTEGER,
    //   'allowNull': false
    // },
    // 'AskPrice2': {
    //   'type': Sequelize.DOUBLE,
    //   'allowNull': false
    // },
    // 'AskVolume2': {
    //   'type': Sequelize.INTEGER,
    //   'allowNull': false
    // },
    // 'BidPrice3': {
    //   'type': Sequelize.DOUBLE,
    //   'allowNull': false
    // },
    // 'BidVolume3': {
    //   'type': Sequelize.INTEGER,
    //   'allowNull': false
    // },
    // 'AskPrice3': {
    //   'type': Sequelize.DOUBLE,
    //   'allowNull': false
    // },
    // 'AskVolume3': {
    //   'type': Sequelize.INTEGER,
    //   'allowNull': false
    // },
    // 'BidPrice4': {
    //   'type': Sequelize.DOUBLE,
    //   'allowNull': false
    // },
    // 'BidVolume4': {
    //   'type': Sequelize.INTEGER,
    //   'allowNull': false
    // },
    // 'AskPrice4': {
    //   'type': Sequelize.DOUBLE,
    //   'allowNull': false
    // },
    // 'AskVolume4': {
    //   'type': Sequelize.INTEGER,
    //   'allowNull': false
    // },
    // 'BidPrice5': {
    //   'type': Sequelize.DOUBLE,
    //   'allowNull': false
    // },
    // 'BidVolume5': {
    //   'type': Sequelize.INTEGER,
    //   'allowNull': false
    // },
    // 'AskPrice5': {
    //   'type': Sequelize.DOUBLE,
    //   'allowNull': false
    // },
    // 'AskVolume5': {
    //   'type': Sequelize.INTEGER,
    //   'allowNull': false
    // },
    'AveragePrice': {
      'type': Sequelize.DOUBLE,
      'allowNull': false
    },
    'ActionDay': {
      'type': Sequelize.CHAR(9),
      'allowNull': false
    },
    'LogTime': {
      'type': Sequelize.BIGINT(16),
      'allowNull': false
    }
  },
  {
    // 自定义表名
    // 'freezeTableName': true,
    // 'tableName': 'tick',

    // 是否需要增加createdAt、updatedAt、deletedAt字段
    'timestamps': false
  }
);

module.exports = Tick;