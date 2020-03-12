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
        login + "' OR phone='" + login + "');", function (err, result, fields) {
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
server.post('/exit', function (req, res) {
    functions.exit();
    res.end();
});