const pug = require('pug');
let express = require('express');
let config = require('./config/conf.json');
let functions = require('./modules/functions');
let text = require('./config/main.json');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
let fs = require('fs');
let path = require('path');
const db = require('./modules/database_pool');
const multer = require('multer');

let server = express();
server.use(cookieParser());
server.listen(config['port']);

console.log('Server is running http://localhost:' + config['port']);
server.use(express.static(__dirname));
server.use(express.static('public'));
server.use(express.static('files'));
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use('/user', require('./modules/users'));
server.use('/driver', require('./modules/drivers'));
server.use('/orders', require('./modules/orders'));
//use fot test
server.use('/default', require('./modules/default'));

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "../../files/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

let upload_user_photo = multer({storage: storage});
server.post('/upload_user_photo', upload_user_photo.single('photo'), function (req, res) {
    if (!req.file) {
        console.log("No file received");
        res.json({"empty": true});
    } else {
        fs.readFile(req.file.path, (err, data) => {
            const text = "data:" + req.file.mimetype + ";base64," + data.toString('base64');
            res.json({"src": text});
            res.end();
            functions.savePhotoSrc(req.cookies, text, req.file.path);

            const photo_url = functions.getPhotoUrlForDel(req.cookies.userid);
            try {
                fs.unlinkSync(__dirname + photo_url.substr(5));
            } catch (e) {
                console.log(e);
            }
        });
    }
});

server.get(['/aboutus', '/'], function (req, res) {
    text.header['nowpage'] = "nav_aboutus";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    res.write(fs.readFileSync(__dirname + '/src/html/aboutus.html', 'utf8'));
    res.end();
});

server.get('/getfooter', function (req, res) {
    res.statusCode = 200;
    res.write(pug.renderFile(__dirname + "/src/pugs/footer.pug"));
    res.end();
});

server.get('/profile', function (req, res) {
    const user = req.cookies.authorised;
    const userid = req.cookies.userid;
    text.header['nowpage'] = "nav_profile";
    if (user === 'drivers') {
        db.getCon().query(functions.getSQLProfileDriver(userid), function (err, result) {
            if (err) res.redirect("/404");
            else {
                res.write(pug.renderFile(__dirname + "/src/pugs/header-driver.pug", text.header));
                db.getCon().query("SELECT prodid,producer FROM сar_producer;", function (err, result2) {
                    res.write(pug.renderFile(__dirname + "/src/pugs/profile-driver.pug", {
                        producers: result2,
                        info: result[0]
                    }));
                    res.end();
                });
            }
        });
    } else if (user === 'clients') {
        db.getCon().query(functions.getSQLProfileClient(userid), function (err, result) {
            if (err) res.redirect("/404");
            else {
                res.write(pug.renderFile(__dirname + "/src/pugs/header-client.pug", text.header));
                res.write(pug.renderFile(__dirname + "/src/pugs/profile-client.pug", {
                    info: result[0]
                }));
                res.end();
            }
        });
    } else res.redirect("/");
});

server.get('/confirmregistration', function (req, res) {
    text.header['nowpage'] = "";
    const usertype = req.cookies.authorised;
    if (usertype === 'clients' || usertype === 'drivers') {
        res.redirect("/404");
    } else {
        res.write(pug.renderFile(__dirname + "/src/pugs/header-unauthorized.pug", text.header));
        res.write(pug.renderFile(__dirname + "/src/pugs/confirmregistration.pug", {
            "email": req.query.email + req.query.emend
        }));
    }
    res.end();
});
server.get('/confirmregistrcode', function (req, res) {
    text.header['nowpage'] = "";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    let code = req.query.code;
    let email = req.query.email;
    let carmodel = functions.getCarModelId(code);
    if (code === "" || email === "") {
        res.write(pug.renderFile(__dirname + "/src/pugs/unsuccessRegistered.pug"));
        res.write(pug.renderFile(__dirname + "/src/pugs/confirmregistration.pug", {
            "email": email
        }));
        res.end();
    } else {
        let sql = functions.getRegisretDriverSQL(email, code, carmodel);
        db.getCon().query(sql, function (err) {
            if (err) {
                res.write(pug.renderFile(__dirname + "/src/pugs/unsuccessRegistered.pug"));
                res.write(pug.renderFile(__dirname + "/src/pugs/confirmregistration.pug", {
                    "email": email
                }));
            } else
                res.write(pug.renderFile(__dirname + "/src/pugs/successRegistered.pug"));
            res.end();
        });
    }
});
server.get('/contacts', function (req, res) {
    text.header['nowpage'] = "nav_contacts";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    res.write(pug.renderFile(__dirname + "/src/pugs/contacts.pug", {
        "googlemapapi": config.googlemapapi
    }));
    res.end();
});
server.get('/thankspage', function (req, res) {
    text.header['nowpage'] = "";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    res.write(fs.readFileSync(__dirname + '/src/html/thanks.html', 'utf8'));
    res.end();
});
server.get('/changepassword', function (req, res) {
    text.header['nowpage'] = "";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    res.write(pug.renderFile(__dirname + "/src/pugs/changePass.pug"));
    res.end();
});
server.get('/ordertaxi', function (req, res) {
    text.header['nowpage'] = "nav_ordertaxi";
    text.header['googlemapapi'] = config.googlemapapi;
    const usertype = req.cookies.authorised;
    if (usertype === 'drivers') res.redirect("/orders/my");
    else if (usertype === 'clients') {
        db.getCon().query('SELECT * FROM payments', function (err, result) {
            res.write(pug.renderFile(__dirname + "/src/pugs/header-client.pug", text.header));
            res.write(pug.renderFile(__dirname + "/src/pugs/ordertaxi.pug", {
                "pay_types": result,
                "googlemapapi": config.googlemapapi
            }));
            res.end();
        });
    } else res.redirect("/user/registeruser");
});

server.get('/registered', function (req, res) {
    text.header['nowpage'] = "";
    db.getCon().query(functions.getSQLRedisterUser(req.query), function (err, result) {
        functions.sendUserMail(req.query.login, config.email, text.usermail);
        if (err) res.json({"data": false});
        else {
            res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
            res.write(pug.renderFile(__dirname + "/src/pugs/registered_client.pug"));
        }
        res.end();
    });
});
server.post('/login', function (req, res) {
    let login = req.body.login;
    let type = req.body.type;
    let password = functions.hashPassword(req.body.password);
    db.getCon().query(functions.getSQLLogin(login, type, password), function (err, result) {
        if (result.length < 1) res.statusCode = 401;
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            let responseBody = {
                'userid': result[0].id,
                'registered': result[0].registered
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
        res.write(JSON.stringify({"err": 'lost some data'}));
        res.end();
        return;
    }
    now = functions.hashPassword(now);
    old = functions.hashPassword(old);
    let userid = req.cookies.userid;
    db.getCon().query(functions.getSQLPassword(type, userid, old), function (err, result) {
        if (result.length < 1) {
            res.statusCode = 409;
            res.write(JSON.stringify({"err": 'uncorect old'}));
            res.end();
        } else {
            db.getCon().query("UPDATE " + type + " SET password='" + now + "' WHERE id='" + userid + "';", function (err) {
                if (err) {
                    res.write(JSON.stringify({
                        "err": 'Внутрішня помилка на сервері'
                    }));
                    res.statusCode = 409;
                } else res.statusCode = 204;
                res.end();
            });
        }
    });
});
server.post('/acceptOrder', function (req, res) {
    if (req.cookies.authorised !== 'drivers') {
        res.end();
        return;
    }
    const userid = req.cookies.userid;
    db.getCon().query("SELECT * FROM orders WHERE driver_id='{}' AND (status=1 OR status=2)".format(userid), function (err0, result0) {
        if (result0.length >= 1) {
            res.statusCode = 405;
            res.end()
        } else {
            db.getCon().query("UPDATE orders SET driver_id='{}', status=1 WHERE id='{}';".format(userid, req.body.orderid), function () {
                res.statusCode = 200;
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
    db.getCon().query("SELECT id,model FROM car_models WHERE producer_id='{}' AND class='{}';".format(producer, req.body.carclass), function (err, result) {
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
    db.getCon().query(functions.getSQLIsLoginFree(req.body.type, login), function (err, result) {
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
        return;
    }
    const sql = functions.getSQLIsAllFree(req.body.client, login, phone, email);
    db.getCon().query(sql, function (err, result) {
        res.setHeader('Content-Type', 'application/json');
        if (result.length < 1) {
            res.statusCode = 200;
            res.write(JSON.stringify({}));
            res.end();
        } else {
            let user = result[0];
            res.statusCode = 409;
            let datares = {"email": false, "phone": false, "login": false};
            if (email === user.email) datares['email'] = true;
            if (phone === user.phone) datares['phone'] = true;
            if (login === user.login) datares['login'] = true;
            res.write(JSON.stringify(datares));
            res.end();
        }
    });
});
server.post('/changepass', function (req, res) {
    db.getCon().query(functions.getSQLChageUserPassword(req.cookies, req.body), function (err) {
        if (err) res.json({"data": false});
        else res.json({"data": true});
        res.end();
    })
});

server.post('/sendmail', function (req, res) {
    let emailTo = req.body.email;
    let code = functions.generateCode();
    functions.setCode(emailTo, code);
    if (functions.send(emailTo, code, config.email, text.email)) {
        functions.setRegisretDriverInfo(code, req.body);
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify({"res": true}));
    } else res.statusCode = 400;
    res.end();
});
server.put('/profile', function (req, res) {
    let sql;
    const type = req.cookies.authorised;
    if (type === 'drivers') sql = functions.getDriverSQlUpdate(req.cookies.userid, req.body);
    else if (type === 'clients') sql = functions.getClientSQlUpdate(req.cookies.userid, req.body);
    else {
        res.statusCode = 401;
        res.end();
        return;
    }
    db.getCon().query(sql, function () {
        const sql2 = functions.getSQLUploadPhoto(req.cookies);
        if (sql2 !== "") {
            db.getCon().query(sql2, function () {
                res.end();
            });
        }
    });
});
// default error page
server.use(function (req, res) {
    text.header['nowpage'] = "";
    res.write(pug.renderFile(__dirname + functions.getHeader(req.cookies.authorised), text.header));
    res.write(fs.readFileSync(__dirname + '/src/html/404.html', 'utf8'));
    res.end();
});


String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};