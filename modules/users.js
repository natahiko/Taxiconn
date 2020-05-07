const router = require('express').Router();
let text = require('../config/main.json');
const db = require('./database_pool');
let functions = require('./functions');
const pug = require('pug');
let path = require('path');

router.get('/userrules', function (req, res) {
    text.header['nowpage'] = "nav_client";
    res.write(pug.renderFile(path.join(__dirname, '/..') + functions.getHeader(req.cookies.authorised), text.header));
    db.getCon().query("SELECT * FROM blogs;", function (err, result) {
        res.write(pug.renderFile(path.join(__dirname, '/../src/pugs/userrules.pug'), {
            blogs: result
        }));
        res.end();
    });
});

router.get('/registeruser', function (req, res) {
    let user = req.cookies.authorised;
    if (user === 'clients') res.redirect("/profile");
    else {
        text.header['nowpage'] = "nav_client";
        res.write(pug.renderFile(path.join(__dirname, '/..') + functions.getHeader(req.cookies.authorised), text.header));
        db.getCon().query("SELECT prodid,producer FROM сar_producer;", function (err, result) {
            res.write(pug.renderFile(path.join(__dirname, '/../src/pugs/becomeclient.pug'), {
                producers: result
            }));
            res.end();
        });
    }
});

router.param('userid', function (req, res, next, userid) {
    req.userid = userid;
    return next();
});

router.get('/:userid', function (req, res) {
    text.header['nowpage'] = "";
    const userid = req.userid;
    db.getCon().query(functions.getSQLProfileClient(userid), function (err, result) {
        if (err || result.length < 1) res.redirect("/404");
        else {
            text.header['nowpage'] = "/userprofile/" + userid;
            res.write(pug.renderFile(path.join(__dirname, '/..') + functions.getHeader(req.cookies.authorised), text.header));
            res.write(pug.renderFile(path.join(__dirname, '/../src/pugs/profile_client_for driver.pug'), {
                "info": result[0]
            }));
            res.end();
        }
    });
});
String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};
module.exports = router;