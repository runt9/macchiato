var router = require('express').Router();
var logger = require('logger');

router.get('/', function (req, res) {
    logger.debug('index [%s]', req.url);
    res.status(404).render('error', {error: {msg: 'Site is currently under maintenance!', info: ''}});
});

router.get('/create', function (req, res) {
    logger.debug('index [%s]', req.url);
    res.status(200).render('create', {create: {msg: 'Hello World!'}});
});

router.get('/settings', function (req, res) {
    logger.debug('index [%s]', req.url);
    res.status(200).render('settings', {settings: {msg: 'Hello World!'}});
});

router.get('/current', function (req, res) {
    logger.debug('index [%s]', req.url);
    res.status(200).render('current', {current: {msg: 'Hello World!'}});
});
module.exports = router;