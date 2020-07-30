/**
 *
 * Author:  gmazzotta
 *
 * License: GNU - Copyright (c) Velocity Formula
 * @link
 *
 */

const router = require('express').Router();
const startTime = new Date();

/*+++++++++++++++++++++++++++++++++++++++++++++
 Routes
 ++++++++++++++++++++++++++++++++++++++++++++++*/

const nextcloud = require('./api/nextcloud');
router.use(nextcloud);


router.get('/service', async (req, res, next) => {
  const uptime = `${new Date() - startTime}ms`;
  const version = process.env.npm_package_version;
  res.status(200).json({ app: process.env.APP_NAME, startTime, uptime, version: version});
})


module.exports = router;
