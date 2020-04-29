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
        let photo_src = "https://eu.ui-avatars.com/api/?name=" + json.name + "%20" + json.surname
            + "&background=343a40&color=ffc107&bold=true&size=512";
        if (json === "") return "";
        json = JSON.parse(json);
        const userid = this.generateCode();
        let sql = `INSERT INTO drivers (id, login, name, surname, age, licence, carmodelid, caryear,
                     password, phone, description, email, carnumber, photo_src) VALUES 
                    ('{}', '{}','{}','{}','{}','{}','{}', '{}','{}','{}','{}','{}', '{}', '{}'
            )`.format(userid, json.login, json.name, json.surname, json.age, json.licence, carmodelid,
            json.car_year, json.password, json.phone, json.description, json.email, json.autonum, photo_src);
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
            html: "<div style='background-color: #343A40; width: 100%'>" +
                "    <b style='margin: 15px; color: white; font-size: x-large'>Taxiconn</b>" +
                "    <h2 style='text-align: center'></h2></div>" +
                "<span style='text-align: center; align-items: center; color: black'><h1>" + email.header + "</h1><p>" + email.text + "</p>" +
                "<div><a style='color: #E69C24' href='" + email.link + "/?email=" + emailTo + "'>" + email.linktext + "</a></div>" +
                "<input style='width: 50%; margin: 7px 25%; text-align: center; padding: 5px; font-size: x-large; " +
                "background: white; border: none' disabled type='text' value='" + code + "' id='code'>" +
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
            return `SELECT * FROM clients WHERE password='{}'
                     AND (email='{}' OR login='{}' OR phone='{}');`.format(password, login, login, login);
        else
            return `SELECT * FROM drivers WHERE password='{}' 
                    AND (email='{}' OR login='{}' OR phone='{}');`.format(password, login, login, login);
    },
    getSQLPassword: function (type, userid, old) {
        if (type === 'clients')
            return "SELECT * FROM clients WHERE password='{}' AND id='{}';".format(old, userid);
        else
            return "SELECT * FROM drivers WHERE password='{}' AND id='{}';".format(old, userid);
    },
    getSQLIsLoginFree: function (type, login) {
        if (type === 'clients')
            return "SELECT * FROM clients WHERE login='{}';".format(login);
        else
            return "SELECT * FROM drivers WHERE login='{}';".format(login);
    },
    getSQLCreateOrder: function (userid, from, to, clas, pay_type, notes) {
        if (notes === "") notes = 'NULL';
        else notes = "'" + notes + "'";
        const dirurl = "https://www.google.com/maps/dir/?api=1&origin=" + encodeURI(from) + "&destination=" +
            encodeURI(to) + "&travelmode=driving&dir_action=navigate";
        const code = this.generateCode();

        return `INSERT INTO orders 
                (id, user_id, class, pay_type_id, comment, address_from, address_to, url, start_date) 
                VALUES ('{}', '{}', '{}', '{}' , ${notes}, '{}', '{}', '{}', NOW());`.format(code, userid, clas, pay_type, from, to, dirurl);
    },
    getSQLUploadPhoto: function (cookies) {
        const text = localStorage.getItem("photo_src_" + cookies.userid);
        localStorage.removeItem("photo_src_" + cookies.userid);
        if (cookies.userid === "" || cookies.userid === undefined || cookies.authorised === "" || cookies.authorised === undefined) {
            return "";
        }
        const userid = cookies.userid;
        if (cookies.authorised === 'clients')
            return "UPDATE clients SET photo_src='{}' WHERE id='{}';".format(text, userid);
        else
            return "UPDATE drivers SET photo_src='{}' WHERE id='{}';".format(text, userid);
    },
    savePhotoSrc: function (cookies, text, file_path) {
        localStorage.setItem("photo_src_" + cookies.userid, text);
        localStorage.setItem("photo_path_" + cookies.userid, file_path);
    },
    getPhotoUrlForDel: function (userid) {
        return localStorage.getItem("photo_path_" + userid);
    },
    getSQLProfileClient: function (userid) {
        return `SELECT *, COUNT(CASE WHEN orders.status<>0 AND orders.status<>1 THEN orders.id END) AS total_amount, 
                COUNT(CASE WHEN orders.status=4 THEN orders.id END) AS finished_amount, 
                COUNT(CASE WHEN orders.status=2 THEN orders.id END) AS cancel_driver_amount,
                COUNT(CASE WHEN orders.status=3 THEN orders.id END) AS cancel_client_amount 
                FROM clients INNER JOIN orders ON clients.id = orders.user_id WHERE clients.id='{}' 
                GROUP BY user_id`.format(userid);
    },
    getSQLProfileDriver: function (userid) {
        return `SELECT *, COUNT(CASE WHEN orders.status<>0 AND orders.status<>1 THEN orders.id END) AS total_amount, 
                COUNT(CASE WHEN orders.status=4 THEN orders.id END) AS finished_amount, 
                COUNT(CASE WHEN orders.status=2 THEN orders.id END) AS cancel_driver_amount,
                COUNT(CASE WHEN orders.status=3 THEN orders.id END) AS cancel_client_amount 
                FROM drivers INNER JOIN car_models ON car_models.id=drivers.carmodelid INNER JOIN orders 
                    ON drivers.id = orders.driver_id WHERE drivers.id='{}' GROUP BY driver_id`.format(userid);
    },
    getSQLEndDrive: function (order_id, driver_id) {
        return `UPDATE orders SET status=4, end_date=NOW() WHERE driver_id='{}' AND id='{}';`.format(driver_id, order_id);
    },
    getSQLCancelDrive: function (order_id, cookies) {
        const user_id = cookies.userid;
        if (cookies.authorised === 'clients') {
            return `UPDATE orders SET status=3, end_date=NOW() WHERE id='{}' AND user_id='{}';`.format(order_id, user_id);
        } else {
            return `UPDATE orders SET status=2, end_date=NOW() WHERE id='{}' AND driver_id='{}';`.format(order_id, user_id);
        }
    },
    getSQLMyDrives: function (user_id, user_type) {
        if (user_type === 'clients') {
            return `SELECT *, TIMEDIFF(end_date, start_date) AS time_diff FROM orders INNER JOIN payments 
                ON orders.pay_type_id = payments.pay_id WHERE user_id='{}';`.format(user_id);
        } else {
            return `SELECT *, TIMEDIFF(end_date, start_date) AS time_diff FROM orders INNER JOIN payments 
                ON orders.pay_type_id = payments.pay_id WHERE driver_id='{}';`.format(user_id);
        }
    },
    getSQLRedisterUser: function (data) {
        const code = this.generateCode();
        const password = this.generateCode();
        const passHash = this.hashPassword(password);
        const email = data.email+data.emend;
        const photo_src = "https://eu.ui-avatars.com/api/?name=" + data.first_name + "%20" + data.surname
            + "&background=343a40&color=ffc107&bold=true&size=512";
        jsonStorage.setItem(data.login, JSON.stringify({
           "full_name": data.first_name + " " +data.surname,
           "password": password,
            "email": email
        }));
        if(data.description==="")
            data.description = 'NULL';
        return `INSERT INTO clients (id, login, name, surname, age, email, password, phone, description, photo_src) VALUES 
                ('{}', '{}', '{}', '{}', '{}', '{}', '{}', ${data.phone}, ${data.description}, '{}')`
            .format(code, data.login, data.first_name, data.surname, data.age, email, passHash, photo_src);
    },
    getSQLChageUserPassword: function(cookies, body){
        const oldHash = this.hashPassword(body.old_pass);
        const newHash = this.hashPassword(body.new_pass);
        return `UPDATE clients SET password='{}', registered=1 WHERE password='{}' AND id='{}';`.format(newHash, oldHash, cookies.unauthorised_userid);
    },
    sendUserMail: async function (login, config, email) {
        let data = jsonStorage.getItem(login);
        data = JSON.parse(data);
        let transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: false,
            auth: config.auth
        });
        let mailOptions = {
            from: config.auth.user,
            to: data.email,
            subject: config.subject,
            html: "<div style='background-color: #343A40; width: 100%'>" +
                "    <b style='margin: 15px; color: white; font-size: x-large'>Taxiconn</b>" +
                "    <h2 style='text-align: center'></h2></div>" +
                "<span style='text-align: center; align-items: center; color: black'><h2>" + email.header + "</h2><p>" + email.text + "</p>" +
                "<div style='font-weight: bold; font-size: 20px; color: red'>"+email.alert+"</div>" +
                "<input style='width: 50%; margin: 7px 25%; text-align: center; padding: 5px; font-size: x-large; " +
                "background: white; border: none' disabled type='text' value='" + data.password + "' id='code'>" +
                "</span>"
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) console.log(error);
            else console.log('Email sent: ' + info.response);
        });
    }
};

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};