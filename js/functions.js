let LocalStorage = require('node-localstorage').LocalStorage, localStorage = new LocalStorage('./scratch');
let JSONStorage = require('node-localstorage').JSONStorage, jsonStorage = new JSONStorage('./scratch');
let nodemailer = require('nodemailer');

module.exports = {
    getHeader: function () {
        let autorised = localStorage.getItem("authorized");
        if (autorised === 'drivers') {
            return "header-driver.pug";
        } else if (autorised === 'clients') {
            return "header-client.pug";
        } else {
            return "header-unauthorized.pug";
        }
    },
    autorise: function (type, user_id) {
        localStorage.setItem("authorized", type);
        localStorage.setItem("user_id", user_id);
    },
    exit: function () {
        localStorage.setItem("authorized", "");
        localStorage.setItem("user_id", "");
    },
    getUserType: function () {
        return localStorage.getItem("authorized");
    },
    getUserid: function () {
        return localStorage.getItem("user_id");
    },
    generateCode: function () {
        return Math.random().toString(36).slice(2);
    },
    setCode: function (email, code) {
        localStorage.setItem(email, code);
    },
    setRegisretDriverInfo: function (code, json) {
        jsonStorage.setItem(code, JSON.stringify(json));
    },
    getCarModel: function(code){
        let json = jsonStorage.getItem(code);
        if (json === "") return "";
        json = JSON.parse(json);
        return json.car_model
    },
    getRegisretDriverSQL: function (email, code, carmodelid) {
        if (localStorage.getItem(email)===null || localStorage.getItem(email) !== code) {
            return "";
        }
        let json = jsonStorage.getItem(code);
        if (json === "") return "";
        json = JSON.parse(json);
        let sql = "INSERT INTO drivers (login, name, surname, age, licence, carmodelid, caryear," +
            "password, phone, description, email) VALUES ('" + json.login + "','" + json.name + "','" + json.surname + "'," +
            "'" + json.age + "','" + json.licence + "','" + carmodelid +
        "', '" + json.car_year + "','" + json.password + "','" + json.phone + "','" + json.description + "','" + json.email + "')";
        localStorage.removeItem(email);
        localStorage.removeItem(code);
        return sql;
    },
    send: async function(emailTo, code, config, email) {
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
};
