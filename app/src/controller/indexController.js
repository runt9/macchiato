var router = require('express').Router(),
    logger = require('logger');

router.get('/', function(req, res) {
    logger.debug('index');
    res.status(404).render('error', {error: {msg: 'Site is currently under maintenance!', info: ''}})
});

module.exports = router;