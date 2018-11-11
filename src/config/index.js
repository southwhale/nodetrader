'use strict';

import * as defaultCfg from './config.default';
import _ from 'lodash';
const cfg  = require(`./config.${process.env.NODE_ENV || 'dev'}`);

const clonedCfg = _.cloneDeep(cfg);
const clonedDefaultCfg = _.cloneDeep(defaultCfg);

function deepmerge(target, src) {
  for (let i in src) {
    let value = src[i];
    
    if (_.isPlainObject(value)) {
      if (!_.isPlainObject(target[i])) {
        target[i] = {};
      }
      deepmerge(target[i], value);
    }
    else {
      target[i] = value;
    }
  }
}

deepmerge(clonedDefaultCfg, clonedCfg);

export default clonedDefaultCfg;