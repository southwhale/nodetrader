'use strict';

import _ from 'lodash';
import { ensureDirExists } from './file';
import log4js from 'log4js'; // maxLogSize是以byte为单位计算的
import config from 'config';
import path from 'path';

const loggerCfg = config.logger;
const logsDir = `${getLogsDir()}/logs/`;
ensureDirExists(logsDir);

const configure = {
  appenders: {
    console: { type: 'console' }
  },
  categories: { default: { appenders: ['console'], level: 'info' } }
};

_.forEach(loggerCfg.level, function(level, category) {
  configure.appenders[category] = { type: 'file', filename: logsDir + category + '.log', category: category, maxLogSize: 2048000, numBackups: 3, compress: true, encoding: 'utf-8' };
  configure.categories[category] = { appenders: [category], level: level || loggerCfg.defaultLevel };
});

log4js.configure(configure);

const logger = {};

_.forEach(configure.appenders, function(appender, category) {
  logger[category] = log4js.getLogger(category);
  logger[category].level = loggerCfg.level[category] || loggerCfg.defaultLevel;
});

/**
 * 设置日志打印级别, 若level为undefined, 则针对所有类别的日志设置打印级别
 * @param {String} category 日志类别
 * @param {String} level 打印级别
 */
export function setLevel(category, level) {
  if (level) {
    logger[category].level = level;
  }
  else {
    level = category;
    for (category in logger) {
      logger.hasOwnProperty(category) && (logger[category].level = level);
    }
  }
}

export function getLogger(category) {
  return logger[category];
}

export function connect(category, level) {
  return log4js.connectLogger(this.getLogger(category), level && { level: level });
}

function getLogsDir() {
  let dir = path.dirname(__filename), prev;
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd();
    }
    let arr = dir.split(path.sep);
    if (arr && arr[arr.length - 1] === 'node_modules') {
      dir = path.join(dir, '..');
      return dir;
    }
    if (prev === dir) {
      // Got to the top
      dir = '.'
      return dir;
    }
    // Try the parent dir next
    prev = dir
    dir = path.join(dir, '..');
  }
}