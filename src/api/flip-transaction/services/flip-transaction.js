'use strict';

/**
 * flip-transaction service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::flip-transaction.flip-transaction');
