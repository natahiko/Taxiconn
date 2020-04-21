let mysql = require('mysql');
const pug = require('pug');
let express = require('express');
let config = require('./config/conf.json');
let functions = require('./js/functions');
let text = require('./config/main.json');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');

let server = express();
server.use(cookieParser());
server.listen(config['port']);

console.log('Server is running http://localhost:' + config['port']);
server.use(express.static(__dirname));
server.use(express.static('public'));
server.use(express.static('files'));
server.use(bodyParser.urlencoded({extended: true}));

server.use(bodyParser.json());
let con = mysql.createConnection(config.database);

server.get(['/aboutus', '/'], function (req, res) {
    text.header['nowpage'] = "/aboutus";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    res.write(fs.readFileSync(__dirname + '/html/aboutus.html', 'utf8'));
    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    res.end();
});
server.get('/workcond', function (req, res) {
    text.header['nowpage'] = "/workcond";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    con.query("SELECT * FROM car_models INNER JOIN сar_producer ON сar_producer.prodid = car_models.producer_id;", function (err, result) {
        res.write(pug.renderFile(__dirname + "/pugs/workcond.pug", {
            allmodels: result
        }));
        res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
        res.end();
    });
});
server.get('/userrules', function (req, res) {
    text.header['nowpage'] = "/userrules";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    con.query("SELECT * FROM blogs;", function (err, result) {
        res.write(pug.renderFile(__dirname + "/pugs/userrules.pug", {
            blogs: result
        }));
        res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
        res.end();
    });
});
server.get('/usefultips', function (req, res) {
    text.header['nowpage'] = "/usefultips";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    res.write(fs.readFileSync(__dirname + '/html/usefultips.html', 'utf8'));
    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    res.end();
});
server.get('/profile', function (req, res) {
    const user = req.cookies.authorised;
    const userid = req.cookies.userid;
    text.header['nowpage'] = "/profile";
    if (user === 'drivers') {
        con.query("SELECT * FROM drivers INNER JOIN car_models ON car_models.id=drivers.carmodelid WHERE drivers.id='" + userid + "';", function (err, result) {
            if (err) {
                res.redirect("/404");
            } else {
                res.write(pug.renderFile(__dirname + "/pugs/header-driver.pug", text.header));
                con.query("SELECT prodid,producer FROM сar_producer;", function (err, result2) {
                    res.write(pug.renderFile(__dirname + "/pugs/profile-driver.pug", {
                        producers: result2,
                        info: result[0]
                    }));
                    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
                    res.end();
                });
            }
        });
    } else if (user === 'clients') {
        con.query("SELECT * FROM clients WHERE id='" + userid + "'", function (err, result) {
            if (err) {
                res.redirect("/404");
            } else {
                res.write(pug.renderFile(__dirname + "/pugs/header-client.pug", text.header));
                res.write(pug.renderFile(__dirname + "/pugs/profile-client.pug", {
                    info: result[0]
                }));
                res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
                res.end();
            }
        });
    } else {
        res.redirect("/");
    }
});
server.get('/becomedriver', function (req, res) {
    text.header['nowpage'] = "/becomedriver";
    let user = req.cookies.authorised;
    if (user === 'drivers') {
        res.redirect("/profile");
    } else {
        res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
        con.query("SELECT prodid,producer FROM сar_producer;", function (err, result) {
            res.write(pug.renderFile(__dirname + "/pugs/becomedriver.pug", {
                producers: result
            }));
            res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
            res.end();
        });
    }
});
server.get('/confirmregistration', function (req, res) {
    text.header['nowpage'] = "/";
    const usertype = req.cookies.authorised;
    if (usertype === 'clients' || usertype === 'drivers') {
        res.redirect("/404");
    } else {
        res.write(pug.renderFile(__dirname + "/pugs/header-unauthorized.pug", text.header));
        let email = req.query.email + req.query.emend;
        res.write(pug.renderFile(__dirname + "/pugs/confirmregistration.pug", {
            "email": email
        }));
        res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    }
    res.end();
});
server.get('/confirmregistrcode', function (req, res) {
    text.header['nowpage'] = "/";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    let code = req.query.code;
    let email = req.query.email;
    let carmodel = functions.getCarModelId(code);
    if (code === "" || email === "") {
        res.write(pug.renderFile(__dirname + "/pugs/unsuccessRegistered.pug"));
        res.write(pug.renderFile(__dirname + "/pugs/confirmregistration.pug", {
            "email": email
        }));
        res.end();
    } else {
        let sql = functions.getRegisretDriverSQL(email, code, carmodel);
        con.query(sql, function (err) {
            if (err) {
                res.write(pug.renderFile(__dirname + "/pugs/unsuccessRegistered.pug"));
                res.write(pug.renderFile(__dirname + "/pugs/confirmregistration.pug", {
                    "email": email
                }));
            } else {
                res.write(pug.renderFile(__dirname + "/pugs/successRegistered.pug"));
            }
            res.end();
        });
    }
});
server.get('/contacts', function (req, res) {
    text.header['nowpage'] = "/contacts";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    res.write(pug.renderFile(__dirname + "/pugs/contacts.pug", {
        "googlemapapi": config.googlemapapi
    }));
    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    res.end();
});
server.get('/thankspage', function (req, res) {
    text.header['nowpage'] = "/";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    res.write(fs.readFileSync(__dirname + '/html/thanks.html', 'utf8'));
    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    res.end();
});
server.get('/ordertaxi', function (req, res) {
    text.header['nowpage'] = "/ordertaxi";
    text.header['googlemapapi'] = config.googlemapapi;
    const usertype = req.cookies.authorised;
    if (usertype === 'drivers') {
        res.redirect("/mydrives");
    } else if (usertype === 'clients') {
        con.query('SELECT * FROM payments', function (err, result) {
            res.write(pug.renderFile(__dirname + "/pugs/header-client.pug", text.header));
            res.write(pug.renderFile(__dirname + "/pugs/ordertaxi.pug", {
                "pay_types": result,
                "googlemapapi": config.googlemapapi
            }));
            res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
            res.end();
        });
    } else {
        res.redirect("/registeruser");
    }
});
server.get('/orders', function (req, res) {
    if (req.cookies.authorised !== 'drivers') {
        res.redirect("/404");
    } else {
        text.header['nowpage'] = "/orders";
        res.write(pug.renderFile(__dirname + "/pugs/header-driver.pug", text.header));
        const userid = req.cookies.userid;
        con.query("SELECT class FROM car_models WHERE id IN (SELECT carmodelid FROM drivers WHERE id='{}');".format(userid),
            function (err0, result0) {
            const clas = functions.setCarModelId(userid, result0);
            con.query("SELECT * FROM orders INNER JOIN payments ON payments.pay_id=orders.pay_type_id WHERE status=0 AND class='" + clas + "';", function (err, result) {
                res.write(pug.renderFile(__dirname + "/pugs/orders.pug", {
                    "orders": result
                }));
                res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
                res.end();
            });
        });
    }
});
server.get('/allorders', function (req, res) {
    const clas = functions.getCarModelIdLocal(req.cookies.userid);
    if (clas === null) {
        res.statusCode = 403;
        res.write(JSON.stringify({"err": "no user founded"}));
        res.end();
    } else {
        con.query("SELECT * FROM orders INNER JOIN payments ON payments.pay_id=orders.pay_type_id WHERE status=0 AND class='" + clas + "';", function (err, result) {
            res.write(JSON.stringify(result));
            res.end();
        });
    }
});
server.param('userid', function (req, res, next, userid) {
    req.userid = userid;
    return next();
});
server.get('/userprofile/:userid', function (req, res) {
    const userid = req.userid;
    con.query("SELECT * FROM clients WHERE id='" + userid + "';", function (err, result) {
        if (err || result.length < 1) {
            res.redirect("/404");
        } else {
            text.header['nowpage'] = "/userprofile/" + userid;
            res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
            res.write(pug.renderFile(__dirname + "/pugs/userprofile.pug", {
                "info": result[0]
            }));
            res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
            res.end();
        }
    });
});
server.param('driverid', function (req, res, next, driverid) {
    req.userid = driverid;
    return next();
});
server.get('/driverprofile/:driverid', function (req, res) {
    const userid = req.userid;
    con.query("SELECT * FROM drivers WHERE id='" + userid + "';", function (err, result) {
        if (err || result.length < 1) {
            res.redirect("/404");
        } else {
            con.query("SELECT * FROM сar_producer INNER JOIN car_models ON сar_producer.prodid=car_models.producer_id" +
                " WHERE id=" + result[0].carmodelid + ";", function (err2, result2) {
                text.header['nowpage'] = "/driverprofile/" + userid;
                res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
                res.write(pug.renderFile(__dirname + "/pugs/driverprofile.pug", {
                    info: result[0],
                    producer: result2[0]
                }));
                res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
                res.end();
            });
        }
    });
})
;
server.get('/getRandCode', function (req, res) {
    let code = functions.generateCode();
    res.write(code);
    res.end();
});
server.get('/getPassHash', function (req, res) {
    let hash = functions.hashPassword(req.query.pass);
    res.write(hash);
    res.end();
});
server.post('/login', function (req, res) {
    let login = req.body.login;
    let type = req.body.type;
    let password = functions.hashPassword(req.body.password);
    con.query(`SELECT * FROM ${type} WHERE password='${password}' AND (email='${login}' OR login='${login}' 
                                                            OR phone='${login}');`, function (err, result) {
        if (result.length < 1) {
            res.statusCode = 401;
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            let responseBody = {
                'userid': result[0].id
            };
            res.write(JSON.stringify(responseBody));
        }
        res.end();
    });
});
server.put('/password', function (req, res) {
    let old = req.body.old;
    let now = req.body.now;
    let type = req.body.type;
    if (old === "" || old === undefined || now === "" || now === undefined) {
        res.statusCode = 406;
        res.write(JSON.stringify({
            "err": 'lost some data'
        }));
        res.end();
        return;
    }
    now = functions.hashPassword(now);
    old = functions.hashPassword(old);
    let userid = req.cookies.userid;
    con.query(`SELECT * FROM ${type} WHERE id='${userid}' AND password='${old}';`, function (err, result) {
        if (result.length < 1) {
            res.statusCode = 409;
            res.write(JSON.stringify({
                "err": 'uncorect old'
            }));
            res.end();
        } else {
            con.query("UPDATE " + type + " SET password='" + now + "' WHERE id='" + userid + "';", function (err) {
                if (err) {
                    res.write(JSON.stringify({
                        "err": 'Внутрішня помилка на сервері'
                    }));
                    res.statusCode = 409;
                } else {
                    res.statusCode = 204;
                }
                res.end();
            });
        }
    });
});
server.post('/carmodel', function (req, res) {
    let producer = req.body.producer;
    if (req.body.secret_key !== config.select_carmodel_token) {
        res.statusCode = 406;
        res.end();
        return;
    }
    let car_class;
    if (req.body.carclass === "comfort")  car_class = " AND class='comfort'";
    else car_class = " AND class='econom'";
    con.query("SELECT id,model FROM car_models WHERE producer_id='" + producer + "'" + car_class + ";", function (err, result) {
        res.statusCode = 202;
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify({
            "res": result
        }));
        res.end();
    });
});
server.post('/isLoginFree', function (req, res) {
    let login = req.body.login;
    if (login === "") {
        res.statusCode = 406;
        res.end();
        return;
    }
    con.query("SELECT * FROM {} WHERE login='{}';".format(req.body.type, login), function (err, result) {
        res.setHeader('Content-Type', 'application/json');
        let datares = {"free": false};
        if (result.length < 1) {
            datares['free'] = true;
        }
        res.write(JSON.stringify(datares));
        res.end();
    });
});
server.post('/isAllFree', function (req, res) {
    let login = req.body.login;
    let phone = req.body.number;
    let email = req.body.email;
    if (login === "" || phone === "" || email === "") {
        res.statusCode = 406;
        res.end();
    }
    con.query("SELECT * FROM drivers WHERE login='{}' OR phone='{}' OR email='{}';".format(login, phone, email), function (err, result) {
        res.setHeader('Content-Type', 'application/json');
        if (result.length < 1) {
            res.statusCode = 200;
            res.write(JSON.stringify({}));
            res.end();
        } else {
            let user = result[0];
            res.statusCode = 409;
            let datares = {"email": false, "phone": false, "login": false };
            if (email === user.email) datares['email'] = true;
            if (phone === user.phone) datares['phone'] = true;
            if (login === user.login) datares['login'] = true;
            res.write(JSON.stringify(datares));
            res.end();
        }
    });
});
server.post('/sendmail', function (req, res) {
    let emailTo = req.body.email;
    let code = functions.generateCode();
    functions.setCode(emailTo, code);
    if (functions.send(emailTo, code, config.email, text.email)) {
        functions.setRegisretDriverInfo(code, req.body);
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify({"res": true}));
    } else {
        res.statusCode = 400;
    }
    res.end();
});
server.put('/profile', function (req, res) {
    let sql;
    const type = req.cookies.authorised;
    if (type === 'drivers') {
        sql = functions.getDriverSQlUpdate(req.cookies.userid, req.body);
    } else if (type === 'clients') {
        sql = functions.getClientSQlUpdate(req.cookies.userid, req.body);
    } else {
        res.statusCode = 401;
        res.end();
        return;
    }
    con.query(sql, function (err) {
        if (err) {
            res.statusCode = 400;
        } else {
            res.statusCode = 200;
        }
        res.end();
    });
});
server.post('/createorder', function (req, res) {
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
    if (from === '' || to === "" || clas === "" || pay_type === "") {
        res.statusCode = 402;
        res.write(JSON.stringify({"err": "not enough parameters"}));
        res.end();
        return;
    }
    let notes = req.body.notes;
    if (notes === "") notes = 'NULL';
    else notes = "'" + notes + "'";
    const code = functions.generateCode();
    const dirurl = "https://www.google.com/maps/dir/?api=1&origin=" + encodeURI(from) + "&destination=" +
        encodeURI(to) + "&travelmode=driving&dir_action=navigate";
    con.query("INSERT INTO orders (id, user_id, class, pay_type_id, comment, address_from, address_to, url) VALUES " +
        "('" + code + "', '" + userid + "', '" + clas + "', " + pay_type + ", " + notes + ", '" + from + "', '" + to + "', '" + dirurl + "');", function (err) {
        if (err) {
            res.redirect("/createorder");
        } else {
            res.statusCode = 201;
            res.write(JSON.stringify({"status": "ok"}));
            res.end();
        }
    });
});
// default error page
server.use(function (req, res) {
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    res.write(fs.readFileSync(__dirname + '/html/404.html', 'utf8'));
    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    res.end();
});

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};