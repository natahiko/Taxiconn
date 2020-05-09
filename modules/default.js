const express = require('express'),
      router = express.Router(),
      functions = require('./functions');

router.get('/getRandCode', function (req, res) {
    let code = functions.generateCode();
    res.write(code);
    res.end();
});
router.get('/getPassHash', function (req, res) {
    let hash = functions.hashPassword(req.query.pass);
    res.write(hash);
    res.end();
});

module.exports = router;