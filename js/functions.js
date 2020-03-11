var LocalStorage = require('node-localstorage').LocalStorage, localStorage = new LocalStorage('./scratch');

module.exports = {
    getHeader: function () {
        var autorised = localStorage.getItem("authorized");
        if(autorised=='drivers'){
            return "header-driver.pug";
        } else if(autorised=='clients'){
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
    }
};
