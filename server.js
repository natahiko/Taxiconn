var mysql = require('mysql');
const pug = require('pug');
let express = require('express');
let config = require('./config/conf.json');
var functions = require('./js/functions');
let text = require('./config/main.json');
const bodyParser = require('body-parser');
var nodemailer = require('nodemailer');

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
    res.end();
});
server.get('/workcond', function (req, res) {
    text.header['nowpage'] = "/workcond";
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
    con.query("SELECT * FROM car_models INNER JOIN сar_producer ON сar_producer.prodid = car_models.producer_id;", function (err, result) {
        console.log(result);
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
server.get('/becomedriver', function (req, res) {
    text.header['nowpage'] = "/becomedriver";
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
    var user = functions.getUserType();

    if (user === 'driver') {
        res.write(pug.renderFile(__dirname + "/pugs/alert-becomedriver.pug"));
        res.write(pug.renderFile(__dirname + "/pugs/profile-driver.pug"));
    } else {
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
    } else {
        var email = req.query.email + req.query.emend;
        res.write(pug.renderFile(__dirname + "/pugs/confirmregistration.pug", {
            "email": email
        }));
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
    res.write(pug.renderFile(__dirname + "/pugs/contacts.pug"));
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
server.post('/carmodel', function (req, res) {
    var producer = req.body.producer;
    if (req.body.secret_key !== config.select_carmodel_token) {
        res.statusCode = 400;
        res.end();
    }
    var car_class = '';
    console.log(req.body.carclass);
    if(req.body.carclass==="comfort")
        car_class = " AND class='comfort'";
    con.query("SELECT model FROM car_models WHERE producer_id IN (" +
        "SELECT id FROM сar_producer WHERE producer='" + producer + "'"+car_class+");", function (err, result) {
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
    if (send(emailTo, code)) {
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

async function send(emailTo, code) {
    var email = text.email;
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'nata.shkarovska@gmail.com',
            pass: 'Nix_23032000'
        }
    });
    var mailOptions = {
        from: 'nata.shkarovska@gmail.com',
        to: emailTo,
        subject: 'Taxiconn.com.ua',
        html: "<span style='text-align: center; align-items: center; color: black'><h1>" + email.header + "</h1><p>" + email.text + "</p>" +
            "<div><a href='" + email.link + "/?email=" + emailTo + "'>" + email.linktext + "</a></div>" +
            "<input style='width: 50%; margin: 7px 25%; text-align: center; padding: 5px; font-size: x-large; " +
            "background: white; border-radius: 10px;' disabled type='text' value='" + code + "' id='code'>" +
            "</span>"
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return false;
        } else {
            console.log('Email sent: ' + info.response);
            return true;
        }
    });
}