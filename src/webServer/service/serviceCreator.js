'use strict';

import { getLogger } from 'logger';

const logger = getLogger('service');

module.exports = (Model) => {
  return class Service {
    static get instance() {
      if (!this._instance) {
        this._instance = new this();
      }
      return this._instance;
    }
  
    async listByPage({ offset = 0, limit = 10, order_by = 'id', order = 'ASC' }) {
      let result;
      try {
        result = Model.findAndCountAll({
          offset: Number(offset),
          limit: Number(limit),
          order: [[ order_by, order.toUpperCase() ]],
        });
      }
      catch (error) {
        result = error;
        logger.error(error);
      }

      return result;
    }
  
    async findById(id) {
      let result;
      try {
        result = await Model.findById(id);
      }
      catch (error) {
        result = error;
        logger.error(error);
      }

      return result;
    }
  
    async findAll(where) {
      let result;
      try {
        result = await Model.findAll({ where });
      }
      catch (error) {
        result = error;
        logger.error(error);
      }

      return result;
    }
  
    async findOne(where) {
      let result;
      try {
        result = await Model.findOne({ where });
      }
      catch (error) {
        result = error;
        logger.error(error);
      }

      return result;
    }
  
    async create(obj) {
      let result;
      try {
        result = await Model.create(obj);
        // result = result.toJSON();
      } catch (error) {
        result = error;
        logger.error(error);
      }
  
      return result;
    }
  
    async update(updates, options={}) {
      let result;
      try {
        result = await Model.update(updates, options);
      }
      catch (error) {
        result = error;
        logger.error(error);
      }

      return result;
    }
  
    async upsert(updates, options={}) {
      let result;
      try {
        result = await Model.upsert(updates, options);
      }
      catch (error) {
        result = error;
        logger.error(error);
      }

      return result;
    }
  
    async del(options={ where: {} }) {
      let result;
      try {
        result = await Model.destroy(options);
      }
      catch (error) {
        result = error;
        logger.error(error);
      }

      return result;
    }
  
    async bulkCreate(list) {
      let result;
      try {
        result = await Model.bulkCreate(list);
      } catch (error) {
        result = error;
        logger.error(error);
      }

      return result;
    }
  
    async bulkUpsert(list, options={}) {
      let resultList = [], result;
      for (let i=0; i < list.length; i++) {
        result = await this.upsert(list[i], options);
        resultList.push(result);
      }

      return resultList;
    }
  };
};