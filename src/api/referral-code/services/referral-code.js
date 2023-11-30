'use strict';

/**
 * referral-code service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::referral-code.referral-code');
