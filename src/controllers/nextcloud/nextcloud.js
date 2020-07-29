/**
 *
 * Author:  Velocity Formula
 *
 * License: MIT - Copyright (c) AppSeed.us
 * @link
 *
 */
const EventController = require("events");
const eventEmitter = new EventController();

const nextCloud = require("nextcloud-node-client");
const nextCloudConfig = require("../../config/app.config").NEXCLOUD_CONFIG;
const status = require("../../config/app.config").FILE_STATUS;

const ncServer = new nextCloud.Server(nextCloudConfig);
const ncClient = new nextCloud.Client(ncServer);

const TagFile = require("../../models/tagfile.model");
const tagprocess = new (require("../../models/tagprocess"))();

let tagFiles = [];

async function TestConnection(res) {
  const folders = await ncClient.getSubFolders("/");

  if (folders && folders.length >= 1) {
    ResSuccess(
      res,
      "SUCCESS. Connected to Nexcloud instance at " +
        process.env.NEXTCLOUD_SERVER_URL,
      200
    );
  } else {
    ResError(
      res,
      "ERROR. Unable to connect to Nextcloud at " +
        process.env.NEXTCLOUD_SERVER_URL,
      500
    );
  }
}

async function ProcessUntagedFiles(res) {
  if (!tagprocess.GetStatus()) {
    tagprocess.SetStatus(true);

    let newFiles = [{}];

    try {
      const integrationTag = await ncClient.getTagByName(
        process.env.NEXTCLOUD_INTEGRATION_TAGNAME
      );

      newFiles = await ncClient.getFileSystemElementByTags([integrationTag]);

      // Return response and keep on processing
      ResSuccess(res, "Captured " + newFiles.length + " objects.", 200);

      tagFiles = [];

      // Validation & Process loop
      newFiles.forEach((tsFile) => {
        const fileObj = new TagFile(tsFile);
        console.log("Validating " + fileObj.tag_file_name);

        // skip folder type results
        if (fileObj.isFile) {
          fileObj.validate();
          if (fileObj.processing_status == status.VALID)
            eventEmitter.emit("acquire_content_file_to_tag", fileObj, tsFile);

          tagFiles.push(fileObj);
        } else {
          // untag folders
          eventEmitter.emit("untag_nextcloud_folder", fileObj, tsFile);
        }
      });

      if (tagFiles.length == 0) tagprocess.SetStatus(false);
      
    } catch (error) {
      ResError(res, error, 500);
      // on connection problem detected, process will exit
      // containarization handles service restart.
      // process.exit(1);
      tagprocess.SetStatus(false);
    }
  }
}

async function GetProcessingProgress(res) {
  const statusMessage = {
    Process: process.env.APP_NAME,
    IsActive: true,
    IsBusy: tagprocess.GetStatus(),
    FilesInQ: tagFiles.length | 0,
    Errors:
      tagFiles.filter((f) => f.processing_status == status.ERROR).length | 0,
    PendingQ: tagFiles.filter((f) => f.processing_status != status.OK),
  };

  ResSuccess(res, statusMessage, 200);
}

eventEmitter.on("acquire_content_file_to_tag", async (fileObj, tsFile) => {
  try {
    console.log("Acquiring " + fileObj.taged_file);
    const ncContentFile = await ncClient.getFile(fileObj.taged_file);

    if (ncContentFile) {
      // retrive tags to clear if option is enabled.
      if (process.env.NEXTCLOUD_CLEAR_PREVIOUS_TAGS == "true")
        fileObj.taged_file_old_tags = await ncContentFile.getTags();

      // process tagspaces file
      eventEmitter.emit(
        "process_tagspaces_file",
        fileObj,
        tsFile,
        ncContentFile
      );
    } else {
      fileObj.processing_status = status.ERROR;
      fileObj.processing_result = "Content file not found.";
      if (tagFiles.indexOf(fileObj) == tagFiles.length - 1)
        tagprocess.SetStatus(false);
    }
  } catch (error) {
    fileObj.processing_status = status.ERROR;
    fileObj.processing_result = error.message;

    if (tagFiles.indexOf(fileObj) == tagFiles.length - 1)
      tagprocess.SetStatus(false);
  }
});

eventEmitter.on(
  "process_tagspaces_file",
  async (fileObj, tsFile, ncContentFile) => {
    try {
      console.log("Porcessing " + fileObj.tag_file_name);
      // const ncFile = tsFile; //await ncClient.getFile(fileObj.taged_file);

      // check if file is json
      const ncBuffer = await tsFile.getContent();
      const tsTagString = ncBuffer
        .toString("utf-8")
        .replace(/[\u{0080}-\u{FFFF}]/gu, "");
      const tsTagObject = JSON.parse(tsTagString);

      tsTagObject.tags.forEach((tag) => {
        // verify if tag already exists
        if (tsTagString.indexOf(tag) <= 0)
          eventEmitter.emit(
            "tag_content_file",
            fileObj,
            tsFile,
            tag.title,
            ncContentFile
          );
      });
    } catch (error) {
      tsFile.processing_status = status.ERROR;
      tsFile.processing_result = error.message;
      if (tagFiles.indexOf(fileObj) == tagFiles.length - 1)
        tagprocess.SetStatus(false);
    }
  }
);

eventEmitter.on(
  "tag_content_file",
  async (fileObj, tsFile, tsTagTitle, ncContentFile) => {
    try {
      if (process.env.NEXTCLOUD_CLEAR_PREVIOUS_TAGS == "true") {
        for (
          let index = 0;
          index < fileObj.taged_file_old_tags.length;
          index++
        ) {
          if (fileObj.taged_file_old_tags[index] != tsTagTitle)
            console.log(
              "Clearing tag " +
                fileObj.taged_file_old_tags[index] +
                " for " +
                fileObj.taged_file
            );
          await ncContentFile.removeTag(fileObj.taged_file_old_tags[index]);
        }
      }

      console.log("Taging " + fileObj.taged_file + " with " + tsTagTitle);
      await ncContentFile.addTag(tsTagTitle);
      await tsFile.removeTag(process.env.NEXTCLOUD_INTEGRATION_TAGNAME);

      fileObj.processing_status = status.OK;
    } catch (error) {
      fileObj.processing_status = status.error;
      fileObj.processing_result = error.message;
    } finally {
      if (tagFiles.indexOf(fileObj) == tagFiles.length - 1)
        tagprocess.SetStatus(false);
      console.log("Round ended OK.");
    }
  }
);

eventEmitter.on("untag_nextcloud_folder", async (fileObj, ncFolder) => {
  try {
    console.log("Untaging folder" + fileObj.tag_file_name);
    const dummy = ncFolder.removeTag(process.env.NEXTCLOUD_INTEGRATION_TAGNAME);
  } catch (error) {
    fileObj.processing_status = status.ERROR;
    fileObj.processing_result = error;
  }
});

/**
 * @exports TagFileController
 */
module.exports.TestConnection = TestConnection;
module.exports.ProcessUntagedFiles = ProcessUntagedFiles;
module.exports.GetProcessingProgress = GetProcessingProgress;
