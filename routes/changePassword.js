const express = require( 'express' );
const router = express.Router();
const changePasswordController = require( '../controllers/changePasswordController' );

router.post( '/', changePasswordController.handleChangePassword );

module.exports = router;