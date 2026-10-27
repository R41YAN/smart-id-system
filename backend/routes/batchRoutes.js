const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/batchController');
const { verifyToken, requireAnyAdmin } = require('../middleware/auth');

router.get('/',       verifyToken, requireAnyAdmin, ctrl.getAll);
router.post('/',      verifyToken, requireAnyAdmin, ctrl.create);
router.delete('/:id', verifyToken, requireAnyAdmin, ctrl.remove);

module.exports = router;
