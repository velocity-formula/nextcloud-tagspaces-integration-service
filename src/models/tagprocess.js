/**
 *
 * Author:  gmazzotta
 *
 * License: GNU - Copyright (c) Velocity Formula
 * @link
 *
 */

// Controls tagging execution from any source.

class TagProcess {


  constructor() {
      this._isWorking = process.env['APP_PROCESS_TAGGING_ISWORKING'] == 'true';
  }


  GetStatus() {
    return this._isWorking = process.env['APP_PROCESS_TAGGING_ISWORKING'] == 'true';

  } 

  SetStatus(status) {
    process.env['APP_PROCESS_TAGGING_ISWORKING'] = status;

  }

}

module.exports = TagProcess;
