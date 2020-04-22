let LocalStorage = require('node-localstorage').LocalStorage, localStorage = new LocalStorage('./scratch');
let JSONStorage = require('node-localstorage').JSONStorage, jsonStorage = new JSONStorage('./scratch');
let nodemailer = require('nodemailer');
var md5 = require('md5');

module.exports = {
    getHeader: function (autorised) {
        if (autorised === 'drivers') {
            return "/src/pugs/header-driver.pug";
        } else if (autorised === 'clients') {
            return "/src/pugs/header-client.pug";
        } else {
            return "/src/pugs/header-unauthorized.pug";
        }
    },
    hashPassword: function (passStr) {
        let result = md5(passStr);
        return md5(result + 'taxiconn');
    },
    generateCode: function () {
        return Math.random().toString(36).slice(2);
    },
    setCode: function (email, code) {
        localStorage.setItem(email, code);
    },
    setRegisretDriverInfo: function (code, json) {
        json['password'] = this.hashPassword(json.password);
        jsonStorage.setItem(code, JSON.stringify(json));
    },
    getCarModelId: function (code) {
        let json = jsonStorage.getItem(code);
        if (json === "") return "";
        json = JSON.parse(json);
        return json.car_model
    },
    getRegisretDriverSQL: function (email, code, carmodelid) {
        if (localStorage.getItem(email) === null || localStorage.getItem(email) !== code) {
            return "";
        }
        let json = jsonStorage.getItem(code);
        if (json === "") return "";
        json = JSON.parse(json);
        const userid = this.generateCode();
        let sql = `INSERT INTO drivers (id, login, name, surname, age, licence, carmodelid, caryear,
                     password, phone, description, email, carnumber) VALUES 
                    ('{}', '{}','{}','{}','{}','{}','{}', '{}','{}','{}','{}','{}', '{}'
            )`.format(userid, json.login, json.name, json.surname, json.age, json.licence, carmodelid,
            json.car_year, json.password, json.phone, json.description, json.email, json.autonum);
        localStorage.removeItem(email);
        localStorage.removeItem(code);
        return sql;
    },
    send: async function (emailTo, code, config, email) {
        let transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: false,
            auth: config.auth
        });
        let mailOptions = {
            from: config.auth.user,
            to: emailTo,
            subject: config.subject,
            html: "<span style='text-align: center; align-items: center; color: black'><h1>" + email.header + "</h1><p>" + email.text + "</p>" +
                "" + email.link + "<div><a href='/?email='>" + emailTo + "" + email.linktext + "</a></div>" +
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
    },
    getDriverSQlUpdate: function (userid, data) {
        return `UPDATE drivers SET login='{}', name='{}', surname='{}', age=${data.age}, 
                   carmodelid=${data.model}, caryear=${data.year}, phone='{}', description='{}' WHERE id='{}'
        ;`.format(data.login, data.name, data.surname, data.phone, data.desc, userid);
    },
    getClientSQlUpdate: function (userid, data) {
        return `UPDATE drivers SET login='{}', name='{}', surname='{}', age='{}', 
                   phone='{}', description='{}' WHERE id='{}'
        ;`.format(data.login, data.name, data.surname, data.age, data.phone, data.desc, userid);
    },
    setCarModelId: function (userid, result) {
        const clas = result[0].class;
        localStorage.setItem(userid, clas);
        return clas;
    },
    getCarModelIdLocal: function (userid) {
        return localStorage.getItem(userid);
    },
    getSQLLogin: function (login, type, password) {
        if (type === 'clients')
            return "SELECT * FROM clients WHERE password='" + password + "' " +
                "AND (email='" + login + "' OR login='" + login + "' OR phone='" + login + "');";
        else
            return "SELECT * FROM drivers WHERE password='" + password + "' " +
                "AND (email='" + login + "' OR login='" + login + "' OR phone='" + login + "');";
    },
    getSQLPassword: function (type, userid, old) {
        if (type === 'clients')
            return "SELECT * FROM clients WHERE password='" + old + "' AND id='" + userid + "';";
        else
            return "SELECT * FROM drivers WHERE password='" + old + "' AND id='" + userid + "';";
    },
    getSQLIsLoginFree: function (type, login) {
        if (type === 'clients')
            return "SELECT * FROM clients WHERE login='" + login + "';";
        else
            return "SELECT * FROM drivers WHERE login='" + login + "';";
    },
    getSQLCreateOrder: function (userid, from, to, clas, pay_type, notes) {
        if (notes === "") notes = 'NULL';
        else notes = "'" + notes + "'";
        const dirurl = "https://www.google.com/maps/dir/?api=1&origin=" + encodeURI(from) + "&destination=" +
            encodeURI(to) + "&travelmode=driving&dir_action=navigate";
        const code = this.generateCode();

        return `INSERT INTO orders 
                (id, user_id, class, pay_type_id, comment, address_from, address_to, url) 
                VALUES ('{}', '{}', '{}', '{}' , ${notes}, '{}', '{}', '{}');`.format(code, userid, clas, pay_type, from, to, dirurl);
    },
    getStorage: function (multer) {
        return multer.diskStorage({
            destination: function (req, file, callback) {
                callback(null, './files/uploads');
            },
            filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
            }
        });
    }
};

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};