/**
 *
 * Author:  gmazzotta
 *
 * License: GNU - Copyright (c) Velocity Formula
 * @link
 *
 */

const pe = require('parse-error');

/**
 * @function to 
 * 
 * @param  {Promise}       -> `Promise`
 *
 * @return {Promise|Error} -> `data | err`
 */
to = function(promise) {
  return promise
  .then(data => {
      return [null, data];
  }).catch(err =>
      [pe(err)]
  );
}



/**
 * @function ResSuccess 
 * 
 * @param  {Object} -> `res`
 * @param  {Object} -> `data`
 * @param  {Number} -> `code`
 * 
 * @return {JSON} -> `data`
 */
ResSuccess = function(res, data, code){ 
  
  res.statusCode = code;

  return res.json({message: data})
};



/**
 * @function ResError 
 * 
 * @param  {Object} -> `res`
 * @param  {Object} -> `err`
 * @param  {Number} -> `code`
 * 
 * @return {JSON} -> `err`
 */
ResError = function(res, err, code){ 
    
    if(typeof err == 'object' && typeof err.message != 'undefined'){
        err = err.message;
    }

     res.statusCode = code;

    return res.json({error: err});
}