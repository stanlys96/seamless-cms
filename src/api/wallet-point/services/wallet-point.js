'use strict';

/**
 * wallet-point service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::wallet-point.wallet-point');
