var mysql = require('mysql');
const pug = require('pug');
let express = require('express');
let config = require('./config/conf.json');
var functions = require('./js/functions');
let text = require('./config/main.json');
var LocalStorage = require('node-localstorage').LocalStorage, localStorage = new LocalStorage('./scratch');
const bodyParser = require('body-parser');



let server=express();
server.listen(config['port']);
console.log('Server is running on port '+config['port']);
server.use(express.static(__dirname));
server.use(express.static('public'));
server.use(express.static('files'));
server.use(bodyParser.urlencoded({extended: true}));

server.use(bodyParser.json());
var con = mysql.createConnection({
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "taxiconn"
});

server.get('/', function(req, res) {
    res.write(pug.renderFile(__dirname+"/pugs/"+functions.getHeader(), text.header));

    res.end();
});
server.post('/login', function(req, res){
    var login = req.body.login;
    con.query("SELECT * FROM clients WHERE password='"+req.body.password+"' AND (email='"+login+"' OR login='"+
        login+"' OR phone='"+login+"');", function (err, result, fields) {
        if(result.length<1){
            res.statusCode = 400;
            res.end();
        } else{
            functions.autorise(type,result[0]['id']);
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
server.get('/set', function(req, res) {
    localStorage.setItem("autorised","");
    res.writeHead(200,{"Content-type": "text/html; charset=utf-8"});
    res.write("setted");
    res.end();
});