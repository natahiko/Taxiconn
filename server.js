var mysql = require('mysql');
const pug = require('pug');
let express = require('express');
let config = require('./config/conf.json');
var functions = require('./js/functions');
let text = require('./config/main.json');
const bodyParser = require('body-parser');

let server = express();
server.listen(config['port']);
console.log('Server is running on port ' + config['port']);
server.use(express.static(__dirname));
server.use(express.static('public'));
server.use(express.static('files'));
server.use(bodyParser.urlencoded({extended: true}));

server.use(bodyParser.json());
var con = mysql.createConnection(config.database);

server.get('/', function (req, res) {
    text.header['nowpage'] = "/";
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
    res.write(pug.renderFile(__dirname + "/pugs/aboutus.pug"));
    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    res.end();
});
server.get('/aboutus', function (req, res) {
    text.header['nowpage'] = "/aboutus";
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
    res.write(pug.renderFile(__dirname + "/pugs/aboutus.pug"));
    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    res.end();
});
server.get('/404', function (req, res) {
    text.header['nowpage'] = "/404";
    functions.exit();
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
    res.write(pug.renderFile(__dirname + "/pugs/404.pug"));
    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    res.end();
});
server.get('/workcond', function (req, res) {
    text.header['nowpage'] = "/workcond";
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
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
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
    con.query("SELECT * FROM blogs;", function (err, result) {
        if (err == null) {
            res.write(pug.renderFile(__dirname + "/pugs/userrules.pug", {
                blogs: result
            }));
            res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
            res.end();
        } else {
            res.write(pug.renderFile(__dirname + "/pugs/404.pug"));
            res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
            res.end();
        }
    });
});
server.get('/usefultips', function (req, res) {
    text.header['nowpage'] = "/usefultips";
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
    res.write(pug.renderFile(__dirname + "/pugs/usefultips.pug"));
    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    res.end();
});
server.get('/profile', function (req,res) {
    text.header['nowpage'] = "/profile";
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
    var user = functions.getUserType();
    if (user === 'drivers') {
        con.query("SELECT * FROM drivers WHERE id='"+functions.getUserid()+"'", function (err, result) {
            if(err){
                res.write(pug.renderFile(__dirname + "/pugs/404.pug"));
                res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
                res.end();
            } else {
                con.query("SELECT producer FROM сar_producer;", function (err, result2) {
                    res.write(pug.renderFile(__dirname + "/pugs/profile-driver.pug", {
                        producers: result2,
                        info: result[0]
                    }));
                    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
                    res.end();
                });
            }
        });
    } else if(user==='clients'){
        con.query("SELECT * FROM clients WHERE id='"+functions.getUserid()+"'", function (err, result) {
            if(err){
                res.write(pug.renderFile(__dirname + "/pugs/404.pug"));
                res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
                res.end();
            } else {
                res.write(pug.renderFile(__dirname + "/pugs/profile-client.pug", {
                    info: result
                }));
                res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
                res.end();
            }
        });
    } else{
        res.write(pug.renderFile(__dirname + "/pugs/404.pug"));
        res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
        res.end();
    }
});
server.get('/becomedriver', function (req, res) {
    text.header['nowpage'] = "/becomedriver";
    var user = functions.getUserType();
    if (user === 'drivers') {
        text.header['nowpage'] = "/aboutus";
        res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
        res.write(pug.renderFile(__dirname + "/pugs/alert-becomedriver.pug"));
        res.write(pug.renderFile(__dirname + "/pugs/aboutus.pug"));
        res.end();
    } else {
        res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
        con.query("SELECT producer FROM сar_producer;", function (err, result) {
            res.write(pug.renderFile(__dirname + "/pugs/becomedriver.pug", {
                producers: result
            }));
            res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
            res.end();
        });
    }
});
server.get('/confirmregistration', function (req, res) {
    text.header['nowpage'] = "/confirmregistration";
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
    if (functions.getUserType() !== "") {
        res.write(pug.renderFile(__dirname + "/pugs/404.pug"));
        res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    } else {
        var email = req.query.email + req.query.emend;
        res.write(pug.renderFile(__dirname + "/pugs/confirmregistration.pug", {
            "email": email
        }));
        res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    }
    res.end();
});
server.get('/confirmregistrcode', function (req, res) {
    text.header['nowpage'] = "/confirmregistrcode";
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));

    var code = req.query.code;
    var email = req.query.email;
    var sql = functions.getRegisretDriverSQL(email, code);
    if (code === "" || email === "" || sql === "") {
        res.write(pug.renderFile(__dirname + "/pugs/unsuccessRegistered.pug"));
        res.write(pug.renderFile(__dirname + "/pugs/confirmregistration.pug", {
            "email": email
        }));
        res.end();
    } else {
        con.query(sql, function () {
            res.write(pug.renderFile(__dirname + "/pugs/successRegistered.pug"));
            res.write(pug.renderFile(__dirname + "/pugs/aboutus.pug"));
            res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
            res.end();
        });
    }
});
server.get('/contacts', function (req, res) {
    text.header['nowpage'] = "/contacts";
    text.header['googlemapapi'] = config.googlemapapi;
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
    res.write(pug.renderFile(__dirname + "/pugs/contacts.pug",{
        "googlemapapi": config.googlemapapi
    }));
    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    res.end();
});
server.post('/login', function (req, res) {
    var login = req.body.login;
    var type = req.body.type;
    con.query("SELECT * FROM " + type + " WHERE password='" + req.body.password + "' AND (email='" + login + "' OR login='" +
        login + "' OR phone='" + login + "');", function (err, result) {
        if (result.length < 1) {
            res.statusCode = 400;
            res.end();
        } else {
            functions.autorise(type, result[0]['id']);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            var responseBody = {
                "data": "ok"
            };
            res.write(JSON.stringify(responseBody));
            res.end();
        }
    });
});

server.post('/changePass', function (req,res) {
    var old = req.body.old;
    var now = req.body.now;
    if(old==="" || old===undefined || now==="" || now===undefined){
        res.statusCode = 400;
        res.write(JSON.stringify({
            "err": 'lost some data'
        }));
        res.end();
    }
    let userid = functions.getUserid();
    con.query("SELECT * FROM drivers WHERE id="+userid+
                " AND password='" + old + "';", function (err, result) {
        if(result.length<1){
            res.statusCode = 400;
            res.write(JSON.stringify({
                "id": userid,
                "err": 'uncorect old'
            }));
            res.end();
        } else {
            con.query("UPDATE drivers SET password='"+now+"' WHERE id='" + userid + "';", function (err, result) {
                if(err){
                    console.log(err);
                } else {
                    console.log(result);
                }
                res.statusCode = 200;
                res.end();
            });
        }
    });
});
server.post('/carmodel', function (req, res) {
    var producer = req.body.producer;
    if (req.body.secret_key !== config.select_carmodel_token) {
        res.statusCode = 400;
        res.end();
    }
    var car_class = '';
    if(req.body.carclass==="comfort") {
        car_class = " AND class='comfort'";
    }
    con.query("SELECT model FROM car_models WHERE producer_id IN (" +
        "SELECT prodid FROM сar_producer WHERE producer='" + producer + "'"+car_class+");", function (err, result) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify({
            "res": result
        }));
        res.end();
    });
});
server.post('/isloginfree', function (req, res) {
    var login = req.body.login;
    if (login === "") {
        res.statusCode = 400;
        res.end();
    }
    con.query("SELECT * FROM drivers WHERE login='" + login + "';", function (err, result) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        if (result.length < 1) {
            res.write(JSON.stringify({
                "free": true
            }));
        } else {
            res.write(JSON.stringify({
                "free": false
            }));
        }
        res.end();
    });
});
server.post('/sendmail', function (req, res) {
    var emailTo = req.body.email;
    var code = functions.generateCode();
    functions.setCode(emailTo, code);
    if (functions.send(emailTo, code, config.email, text.email)) {
        functions.setRegisretDriverInfo(code, req.body);
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify({
            "res": true
        }));
        res.end();
    } else {
        res.statusCode = 400;
        res.end();
    }
});
server.post('/exit', function (req, res) {
    functions.exit();
    res.end();
});

