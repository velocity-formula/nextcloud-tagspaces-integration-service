/**
 *
 * Author:  gmazzotta
 *
 * License: GNU - Copyright (c) Velocity Formula
 * @link
 *
 */

const NEXCLOUD_CONFIG = {
  basicAuth: {
    username: process.env.NEXTCLOUD_USERNAME,
    password: process.env.NEXTCLOUD_PASSWORD,
  },
  url: process.env.NEXTCLOUD_SERVER_URL,
};

const CRON_CONFIG = {
  ncProcessTags: {
    Name: 'RecurrentProcessTagging',
    Timer: process.env.APP_CRON_INTERVAL,
    Route: '/api/process-tags',
    TimeZone: 'UTC',
    IsActive: process.env.APP_CRON_TASK_ACTIVE == 'true'
  }
}

const FILE_STATUS = {
  PROCESSING: "PROCESSING",
  INVALID: "INVALID",
  VALID: 'VALID',
  OK: "OK",
  ERROR: "ERROR",
};


module.exports.NEXCLOUD_CONFIG = NEXCLOUD_CONFIG;
module.exports.FILE_STATUS     = FILE_STATUS;
module.exports.CRON_CONFIG     = CRON_CONFIG;
