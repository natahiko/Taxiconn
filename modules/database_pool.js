const mysql = require('mysql');
const config = require('../config/conf.json');
class Database_pool {
    static instance = new Database_pool();
    constructor() {
        //create connection
        this.con = mysql.createConnection(config.database);
    }
    static getCon(){
        //return cinnection
        return Database_pool.instance.con;
    }
}
module.exports = Database_pool