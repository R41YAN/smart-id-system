const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');
const { verifyToken, requireAnyAdmin } = require('../middleware/auth');

router.get('/',       verifyToken, requireAnyAdmin, ctrl.getAll);
router.post('/',      verifyToken, requireAnyAdmin, ctrl.admit);
router.delete('/:id', verifyToken, requireAnyAdmin, ctrl.remove);

module.exports = router;
