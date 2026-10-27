const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/universityController');
const { verifyToken, requireSuperAdmin, requireAnyAdmin } = require('../middleware/auth');

router.get('/',    verifyToken, requireAnyAdmin,   ctrl.getAll);
router.get('/:id', verifyToken, requireAnyAdmin,   ctrl.getOne);
router.post('/',   verifyToken, requireSuperAdmin, ctrl.create);
router.put('/:id', verifyToken, requireSuperAdmin, ctrl.update);
router.delete('/:id', verifyToken, requireSuperAdmin, ctrl.remove);

module.exports = router;
