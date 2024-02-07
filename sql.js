const mysql = require("mysql");  
const os = require('os');  

class SQL {
  constructor(config) {

    let configType=1;//0本地 1阿里云
    
    let localConfig={
      host: "localhost",  
      user: "root",  
      password: "123456",  
      database: "sgdb"};
    if(configType==1||os.type() != 'Windows_NT'){
    	localConfig.host="47.116.171.22";
    	localConfig.password="uniqueyx";
   }
    this.config = config?config:localConfig;
	
    this.pool = mysql.createPool(this.config);
  }
    

  query(sql, params) {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = SQL;


// connection.query(`select * from card where user = ? and cardtype = ?`, [data.user,1])
    // .then((result) => {
    
    // })
    // .catch((err) => {
    //     // res.json({message:"数据库异常"});
    //   console.log('Error executing query:',err.errno);
    // });
// 执行查询示例
// const SQL = new SQL();
// SQL.query('SELECT * FROM your_table')
//   .then((results) => {
//     console.log(results); // 输出查询结果
//   })
//   .catch((err) => {
//     console.error('Error executing query:', err);
//   });

//createConnection 用法 需要管理连接
// function createDBConnection() {  
//         //mysql.createPool 可以创建连接池提高性能  connectionLimit:10
//   //const connection = mysql.createConnection({  
//     host: "localhost",  
//     user: "root",  
//     password: "123456",  
//     database: "sgdb",  
//   });  
//   // connection.connect();  
//   connection.connect((err) => {
//     if (err) {
//       console.error('Error connecting to MySQL server:', err);
//       return;
//     }
//     console.log('Connected to MySQL server'+new Date().toLocaleString());
//   });
  
//   connection.on('error', (err) => {
//     if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//         console.error('MySQL server connection lost:'+new Date().toLocaleString(), err);
//         // 在这里可以添加重试逻辑或其他适当的处理方式
//         setTimeout(() => {
//                 connection.connect((err) => {
//                     if (err) {
//                       console.error('重连Error connecting to MySQL server:', err);
//                       return;
//                     }
//                     console.log('Connected to MySQL server重连成功'+new Date().toLocaleString());
//                   });
//         }, 3000); 
//     } else {
//       console.error('MySQL error:', err);
//     }
//   });
//   return connection;  
// }  
// module.exports = createDBConnection;
