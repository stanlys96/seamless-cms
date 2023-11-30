'use strict';

/**
 * transaction-history-archive service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::transaction-history-archive.transaction-history-archive');
