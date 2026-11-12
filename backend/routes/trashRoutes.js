const express = require('express');
const router = express.Router();
const { verifyToken, requireAnyAdmin } = require('../middleware/auth');
const trashController = require('../controllers/trashController');

router.use(verifyToken, requireAnyAdmin);

router.get('/',                  trashController.getTrash);
router.post('/restore',          trashController.restoreItem);
router.delete('/permanent',      trashController.permanentDelete);
router.post('/empty',            trashController.emptyTrash);

module.exports = router;
