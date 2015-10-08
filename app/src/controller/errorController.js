var router = require('express').Router();
var logger = require('logger');

router.use(function (req, res) {
    logger.error('Failed to load page [%s]', req.url);
    res.status(404).render('error', {error: {msg: 'Unable to locate page ' + req.url, info: ''}});
});

router.use(function (err, req, res) {
    logger.error('Internal server error on page [%s]', req.url);
    console.error(err.stack);
    res.status(500).render('error', {error: {msg: 'An error occurred during the request.', info: err}});
});

module.exports = router;