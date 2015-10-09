var router = require('express').Router();
var logger = require('logger');

router.get('/', function (req, res) {
    logger.debug('index [%s]', req.url);
    res.status(200).render('index');
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

router.get('/topic', function (req, res) {
    logger.debug('index [%s]', req.url);
    res.status(200).render('topic', {topic: {msg: 'Hello World!'}});
});

router.get('/voting', function (req, res) {
    logger.debug('index [%s]', req.url);
    res.status(200).render('voting', {voting: {msg: 'Hello World!'}});
});
module.exports = router;