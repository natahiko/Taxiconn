var mysql = require('mysql');
var fs = require('fs');
const pug = require('pug');
let express = require('express');
let config = require('./config/conf.json');
let text = require('./config/main.json');
var functions = require('./js/functions');
var database = require('./js/db');
var LocalStorage = require('node-localstorage').LocalStorage, localStorage = new LocalStorage('./scratch');

let server=express();
server.listen(config['port']);
console.log('Server is running on port '+config['port']);
server.use(express.static(__dirname));
server.use(express.static('public'));
server.use(express.static('files'));

var con = mysql.createConnection(config['database']);

server.get('/', function(req, res) {
    res.write(pug.renderFile(__dirname+"/pugs/header-driver.pug", text.header));
    res.end();
});
server.get('/set', function(req, res) {
    localStorage.setItem("name","nata");
    res.writeHead(200,{"Content-type": "text/html; charset=utf-8"});
    res.write("setted");
    res.end();
});