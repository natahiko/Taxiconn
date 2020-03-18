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
    res.end();
});
server.get('/workcond', function (req, res) {
    text.header['nowpage'] = "/workcond";
    res.write(pug.renderFile(__dirname + "/pugs/" + functions.getHeader(), text.header));
    res.write(pug.renderFile(__dirname + "/pugs/workcond.pug"));
    res.write(pug.renderFile(__dirname + "/pugs/footer.pug"));
    res.end();
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
    if (user == 'driver') {
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
    if (req.body.secret_key != config.select_carmodel_token) {
        res.statusCode = 400;
        res.end();
    }
    con.query("SELECT model FROM car_models WHERE producer_id IN (SELECT id FROM сar_producer WHERE producer='" + req.body.producer + "');", function (err, result) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify({
            "res": result
        }));
        res.end();
    });
});
server.post('/exit', function (req, res) {
    functions.exit();
    res.end();
});