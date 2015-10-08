var router = require('express').Router();
var logger = require('logger');

router.get('/', function (req, res) {
    logger.debug('index [%s]', req.url);
    res.status(404).render('error', {error: {msg: 'Site is currently under maintenance!', info: ''}});
});

module.exports = router;