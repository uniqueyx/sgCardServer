const mysql = require("mysql");  
  
function createDBConnection(config) {  
        //mysql.createPool 可以创建连接池提高性能  connectionLimit:10
  const connection = mysql.createConnection(config?config:{  
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
    console.log('Connected to MySQL server'+new Date().toLocaleString());
  });
  
  connection.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('MySQL server connection lost:'+new Date().toLocaleString(), err);
        // 在这里可以添加重试逻辑或其他适当的处理方式
        setTimeout(() => {
                connection.connect((err) => {
                    if (err) {
                      console.error('重连Error connecting to MySQL server:', err);
                      return;
                    }
                    console.log('Connected to MySQL server重连成功'+new Date().toLocaleString());
                  });
        }, 3000); 
    } else {
      console.error('MySQL error:', err);
    }
  });
  return connection;  
}  
  
module.exports = createDBConnection;


