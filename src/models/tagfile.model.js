/**
 *
 * Author:  gmazzotta
 *
 * License: GNU - Copyright (c) Velocity Formula
 * @link
 *
 */

 
const Joi          = require('joi');

const status     = require('../config/app.config').FILE_STATUS;

const isFileRegex = new RegExp(/(\w\+*)\.(\w*)$/ig);
const PROCESSING = 'PROCESSING';

const schema = Joi.object().keys({
  tag_file_name: Joi.string().required(),
  taged_file: Joi.string().required(),
  taged_file_old_tags: Joi.array().optional(),
  tag: Joi.string().optional(),
  user_name: Joi.string().optional(),
  processing_status: Joi.string().optional(),
  processing_result: Joi.string().optional(),
  isFile: Joi.boolean().valid(true),
});


class TagFile {

  constructor(ncTagFile, username = process.env.NEXTCLOUD_USERNAME) {
    this.tag_file_name  =  decodeURIComponent(ncTagFile.memento.name);
    this.taged_file = decodeURIComponent(ncTagFile.memento.name.replace('/.ts','').replace('.json',''));
    this.taged_file_old_tags = [{}];
    this.user_name  = username;
    this.processing_status = status.PROCESSING;
    this.processing_result;
    this.isFile = isFileRegex.exec(ncTagFile.memento.name) != null;
  }

  //! DEPRECATED
  GetTagFileFullPath(ncFileName) {
  
    const tsPath = ncFileName.split('/');
    tsPath.splice(tsPath.length - 1, 0, '.ts');
    return decodeURIComponent(tsPath.join('/') + '.json');
  }
  

  validate() {

    const result = Joi.validate(this, schema);
    if (result.error) {
      this.processing_status = status.ERROR;
      this.processing_result = result.error.message;
    } else {
      this.processing_status = status.VALID;
    }

    return result;
      
  }

};

module.exports = TagFile

