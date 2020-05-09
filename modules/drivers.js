const router = require('express').Router(),
    db = require('./database_pool'),
    text = require('../config/main.json'),
    functions = require('./functions'),
    pug = require('pug'),
    path = require('path'), fs = require('fs');

//return work cond page with info about car models
router.get('/workcond', function (req, res) {
    text.header['nowpage'] = "nav_driver";
    res.write(pug.renderFile(path.join(__dirname, '/..') + functions.getHeader(req.cookies.authorised), text.header));
    db.getCon().query("SELECT * FROM car_models INNER JOIN сar_producer ON сar_producer.prodid = car_models.producer_id ORDER BY producer;", function (err, result) {
        res.write(pug.renderFile(path.join(__dirname, '/../src/pugs/workcond.pug'), {
            allmodels: result
        }));
        res.end();
    });
});

//usefull tips html page
router.get('/usefultips', function (req, res) {
    text.header['nowpage'] = "nav_driver";
    res.write(pug.renderFile(path.join(__dirname, '/..') + functions.getHeader(req.cookies.authorised), text.header));
    res.write(fs.readFileSync(path.join(__dirname, '/../src/html/usefultips.html'), 'utf8'));
    res.end();
});

//become driver page
router.get('/becomedriver', function (req, res) {
    let user = req.cookies.authorised;
    if (user === 'drivers') res.redirect("/profile");
    else {
        text.header['nowpage'] = "nav_driver";
        res.write(pug.renderFile(path.join(__dirname, '..') + functions.getHeader(req.cookies.authorised), text.header));
        db.getCon().query("SELECT prodid,producer FROM сar_producer;", function (err, result) {
            res.write(pug.renderFile(path.join(__dirname, '../src/pugs/becomedriver.pug'), {
                producers: result
            }));
            console.log(result);
            res.end();
        });
    }
});

//pages with dynamic driver ids for show profile without editind
router.param('driverid', function (req, res, next, driverid) {
    req.userid = driverid;
    return next();
});
router.get('/:driverid', function (req, res) {
    text.header['nowpage'] = "";
    const userid = req.userid;
    db.getCon().query("SELECT * FROM drivers WHERE id='{}';".format(userid), function (err, result) {
        if (err || result.length < 1) res.redirect("/404");
        else {
            db.getCon().query(functions.getSQLProfileDriver(userid), function (err2, result2) {
                text.header['nowpage'] = "/driverprofile/" + userid;
                res.write(pug.renderFile(path.join(__dirname, '/..') + functions.getHeader(req.cookies.authorised), text.header));
                res.write(pug.renderFile(path.join(__dirname, '/../src/pugs/profile_driver_for_client.pug'), {
                    info: result[0],
                    producers: result2[0]
                }));
                res.end();
            });
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
