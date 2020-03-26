var LocalStorage = require('node-localstorage').LocalStorage, localStorage = new LocalStorage('./scratch');
var JSONStorage = require('node-localstorage').JSONStorage, jsonStorage = new JSONStorage('./scratch');

module.exports = {
    getHeader: function () {
        var autorised = localStorage.getItem("authorized");
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
    getRegisretDriverSQL: function (email, code) {
        if (localStorage.getItem(email) !== code) {
            return "";
        }
        var json = jsonStorage.getItem(code);
        if (json === "") return "";
        json = JSON.parse(json);
        var sql = "INSERT INTO drivers (login, name, surname, age, licence, carproducer, carmodel, carclass, caryear," +
            "password, phone, description, email) VALUES ('" + json.login + "','" + json.name + "','" + json.surname + "'," +
            "'" + json.age + "','" + json.licence + "','" + json.car_producer + "','" + json.car_model + "','" + json.car_class + "'," +
            "'" + json.car_year + "','" + json.password + "','" + json.phone + "','" + json.description + "','" + json.email + "')";
        localStorage.removeItem(email);
        localStorage.removeItem(code);
        return sql;
    }
};
