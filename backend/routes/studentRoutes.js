const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');
const { verifyToken, requireAnyAdmin } = require('../middleware/auth');

router.get('/',          verifyToken, requireAnyAdmin, ctrl.getAll);
router.post('/',         verifyToken, requireAnyAdmin, ctrl.admit);
router.post('/bulk',     verifyToken, requireAnyAdmin, ctrl.bulkAdmit);
router.patch('/:id/photo', verifyToken, requireAnyAdmin, ctrl.updatePhoto);
router.put('/:id/photo',   verifyToken, requireAnyAdmin, ctrl.updatePhoto);
router.delete('/:id',    verifyToken, requireAnyAdmin, ctrl.remove);

module.exports = router;
