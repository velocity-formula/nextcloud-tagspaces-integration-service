
const router          = require('express').Router();

const nextcloudController = require('../../controllers/nextcloud/nextcloud');
const tagprocess = new (require('../../models/tagprocess'));



router.get('/api/test-connect', async (req, res) => {

  return await nextcloudController.TestConnection(res);

});


router.get('/api/process-tags', async (req, res) => {

  if (!tagprocess.GetStatus())
    return await nextcloudController.ProcessUntagedFiles(res);

  
  return ResError(res, 'Process is executing on another instance.', 202)

});

router.get('/api/get-progress', async (req, res) => {

  return await nextcloudController.GetProcessingProgress(res);

});


module.exports = router;
