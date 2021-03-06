const router = require('express').Router(),
    db = require('./database_pool'),
    text = require('../config/main.json'),
    functions = require('./functions'),
    pug = require('pug'),
    path = require('path'), fs = require('fs'),
    config = require('../config/conf.json');

router.get('/', function (req, res) {
    if (req.cookies.authorised !== 'drivers') res.redirect("/404");
    else {
        text.header['nowpage'] = "nav_orders";
        res.write(pug.renderFile(path.join(__dirname, '/../src/pugs/header-driver.pug'), text.header));
        const userid = req.cookies.userid;
        db.getCon().query("SELECT class FROM car_models WHERE id IN (SELECT carmodelid FROM drivers WHERE id='{}');".format(userid),
            function (err0, result0) {
                const clas = functions.setCarModelId(userid, result0);
                db.getCon().query("SELECT * FROM orders INNER JOIN payments ON payments.pay_id=orders.pay_type_id WHERE status=0 AND class='{}';".format(clas), function (err, result) {
                    res.write(pug.renderFile(path.join(__dirname + "/../src/pugs/orders.pug"), {
                        "orders": result
                    }));
                    res.end();
                });
            });
    }
});

router.post('/endDrive', function (req, res) {
    db.getCon().query(functions.getSQLEndDrive(req.body.order_id, req.cookies.userid), function () {
        res.json({"data": true});
        res.end();
    })
});

router.post('/createorder', function (req, res) {
    const userid = req.cookies.userid;
    if (userid === undefined) {
        res.statusCode = 401;
        res.write(JSON.stringify({"err": "no user id in cookies"}));
        res.end();
        return;
    }
    const from = req.body.address_from;
    const to = req.body.address_to;
    const clas = req.body.clas;
    const pay_type = req.body.pay_type;
    let price = req.body.price;
    price = parseFloat(price.substring(0, price.length - 5));
    if (from === '' || to === "" || clas === "" || pay_type === "") {
        res.statusCode = 402;
        res.write(JSON.stringify({"err": "not enough parameters"}));
        res.end();
        return;
    }
    db.getCon().query("SELECT * FROM orders WHERE user_id='{}' AND (status=1 OR status=0)".format(userid), function (err, result) {
        if (result.length >= config.max_car_amount_for_client) {
            res.json({"too_much": true, "count": config.max_car_amount_for_client});
            res.end();
        } else {
            const sql = functions.getSQLCreateOrder(userid, from, to, clas, pay_type, req.body.notes, price);
            db.getCon().query(sql, function (err) {
                if (err !== null) {
                    res.redirect("/orders/createorder");
                } else {
                    res.statusCode = 201;
                    res.json({"too_much": false});
                    res.end();
                }
            });
        }
    });
});

router.post('/calcprice', function (req, res) {
    const clas = req.body.clas;
    const pay_type = req.body.pay_type;
    const km = req.body.km;
    if (clas === "" || clas === undefined || km === "" || km === undefined || pay_type === "" || pay_type === undefined) {
        res.statusCode = 401;
        res.end();
    }
    const day_type = functions.getDayType();
    const sql = `SELECT * FROM tarifs WHERE class='{}' AND pay_type='{}'
                    AND day_type='{}';`.format(clas, pay_type, day_type);
    db.getCon().query(sql, function (err, result) {
        if (err) res.statusCode = 401;
        else {
            let price = result[0]['price'];
            price *= (parseFloat(km.substring(0, km.length - 3).replace(',', '.')));
            price += result[0]['min_price'];
            res.json({"price": price.toFixed(2)});
        }
        res.end();
    });
});

router.get('/calculator', function (req, res) {
    text.header['nowpage'] = "nav_client";
    res.write(pug.renderFile(path.join(__dirname, "..", functions.getHeader(req.cookies.authorised)), text.header));
    db.getCon().query('SELECT * FROM payments', function (err, result) {
        res.write(pug.renderFile(path.join(__dirname, "../src/pugs/calculator.pug"), {
            "pay_types": result,
            "googlemapapi": config.googlemapapi
        }));
        res.end();
    });
});

router.get('/all', function (req, res) {
    const clas = functions.getCarModelIdLocal(req.cookies.userid);
    if (clas === null) {
        res.statusCode = 403;
        res.json({"err": "no user founded"});
        res.end();
    } else {
        db.getCon().query("SELECT * FROM orders INNER JOIN payments ON payments.pay_id=orders.pay_type_id WHERE status=0 AND class='{}';".format(clas), function (err, result) {
            res.statusCode = 200;
            res.json({"data": pug.renderFile(path.join(__dirname, "../src/pugs/allorders.pug"), {"orders": result})});
            res.end();
        });
    }
});

router.post('/cancelDrive', function (req, res) {
    console.log("cancel");
    db.getCon().query(functions.getSQLCancelDrive(req.body.order_id, req.cookies), function () {
        res.json({"data": true});
        res.end();
    })
});

router.get('/my', function (req, res) {
    const user_type = req.cookies.authorised;
    const userid = req.cookies.userid;
    text.header['nowpage'] = "nav_mydrives";
    if (user_type === 'drivers') {
        res.write(pug.renderFile(path.join(__dirname + "/../src/pugs/header-driver.pug"), text.header));
        db.getCon().query(functions.getSQLMyDrives(userid, user_type), function (err, result) {
            res.write(pug.renderFile(path.join(__dirname + "/../src/pugs/my_orders.pug"), {
                "all_orders": result,
                "type": "driver"
            }));
            res.end();
        });
    } else if (user_type === 'clients') {
        res.write(pug.renderFile(path.join(__dirname + "/../src/pugs/header-client.pug"), text.header));
        db.getCon().query(functions.getSQLMyDrives(userid, user_type), function (err, result) {
            res.write(pug.renderFile(path.join(__dirname + "/../src/pugs/my_orders.pug"), {
                "all_orders": result,
                "type": "client"
            }));
            res.end();
        });
    } else res.redirect("/404");
});
String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};
module.exports = router;