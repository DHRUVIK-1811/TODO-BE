const express = require('express');
const router = express.Router();

const insta = require('./insta');
router.use('/insta' , insta);

module.exports = router;