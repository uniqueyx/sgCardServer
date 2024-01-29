const mysql = require("mysql");  
  
function createDBConnection() {  
        //mysql.createPool 可以创建连接池提高性能  connectionLimit:10
  const connection = mysql.createConnection({  
    host: "localhost",  
    user: "root",  
    password: "123456",  
    database: "sgdb",  
  });  
  // connection.connect();  
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL server:', err);
      return;
    }
    console.log('Connected to MySQL server');
  });
  
  connection.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('MySQL server connection lost:', err);
      // 在这里可以添加重试逻辑或其他适当的处理方式
    } else {
      console.error('MySQL error:', err);
    }
  });
  return connection;  
}  
  
module.exports = createDBConnection;


