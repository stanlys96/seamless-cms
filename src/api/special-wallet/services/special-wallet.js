'use strict';

/**
 * special-wallet service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::special-wallet.special-wallet');
