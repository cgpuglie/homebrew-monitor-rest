const express = require('express');
const router = express.Router();

router.get('/', function getTempurature(req, res, next) {
  res.status(200).send({
    // stubbed, return integer between 0 and 120
    temperature: Math.random() * 120
  })
});

module.exports = router;