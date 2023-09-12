'use strict';

/**
 * wallet-account service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::wallet-account.wallet-account');
