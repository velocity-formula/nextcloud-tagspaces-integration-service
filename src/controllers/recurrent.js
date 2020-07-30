/**
 *
 * Author:  gmazzotta
 *
 * License: GNU - Copyright (c) Velocity Formula
 * @link
 *
 */

const EventController = require('events');
const http            = require('http');
const CronJob         = require('cron').CronJob;
const CronConfig        = require('../config/app.config').CRON_CONFIG; 

const eventEmitter = new EventController();
const tagprocess = new (require("../models/tagprocess"))();


console.log("--  CRON: Recurrent task ", CronConfig.ncProcessTags.IsActive == true ? 'ACTIVE' : 'DISABLED' );
console.log("----------------------------------------------------------");

const task1 = new CronJob(CronConfig.ncProcessTags.Timer, () => {
  if (!tagprocess.GetStatus())
    eventEmitter.emit('callProcessByUrl', CronConfig.ncProcessTags.Name, 'http', 'localhost', process.env.APP_PORT , CronConfig.ncProcessTags.Route);

}, null, true, CronConfig.ncProcessTags.TimeZone);
CronConfig.ncProcessTags.IsActive == true ? task1.start() : task1.stop();


eventEmitter.on('callProcessByUrl', async (taskName, Protocol, Host, Port, Route, args) => {
 
  console.log('Executing: ' + taskName);
  const serviceUrl = Protocol + '://' + Host + ':' + Port + Route;
  
  const options = {
    hostname: Host,
    port: Port,
    path: serviceUrl,
  }

  http.get(options, (res) => { 

  const { statusCode } = res;
  const contentType = res.headers['content-type'];
  //console.log(res);
  let error;
  
  
  if (statusCode !== 200) 
  {
    error = new Error('Cant get to ' + serviceUrl + '.\n' + `Status Code: ${statusCode}`);
  } 
  else if (!/^application\/json/.test(contentType)) 
  {
    error = new Error('Invalid content-type on ' + serviceUrl + '.\n' + `Expected application/json but received ${contentType}`);
  }
  if (error) 
  {
    console.error(error.message);
    res.resume(); // consume response data to free up memory
  } 
  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      let data = JSON.parse(rawData);
      console.log(data.message);
      
    } catch (e) {
      console.log(e.message);  
    }
  });
  }).on('error', (e) => {
    console.log(e.message);  
  });

});


terminate = () => {
  task1.stop();
  this.eventEmitter = undefined;
  this.tagprocess = undefined;
}

module.exports.terminate = terminate;


