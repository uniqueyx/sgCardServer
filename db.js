const mysql = require("mysql");  
  
function createDBConnection() {  
        //mysql.createPool 可以创建连接池提高性能  connectionLimit:10
  const connection = mysql.createConnection({  
    host: "localhost",  
    user: "root",  
    password: "123456",  
    database: "sgdb",  
  });  
  connection.connect();  
  return connection;  
}  
  
module.exports = createDBConnection;


