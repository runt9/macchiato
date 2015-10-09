var router = require('express').Router();
var logger = require('logger');

router.get('/', function (req, res) {
    logger.debug('index [%s]', req.url);
    res.status(200).render('index');
});

module.exports = router;