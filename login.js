let http = require('http');
let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');
let socket = require("socket.io");
const fs = require('fs');
// let sh=require('./socketHandle');
let rh=require('./roomHandle');
const createDBConnection=require('./db');
const SQL=require('./sql');
const dayjs=require('dayjs')

// import { v4 as uuid } from "uuid";

let app = express();

// let handleSynchronousClient = require('./handler');

//app.use(cors({origin:'*'}));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// let server = http.createServer(app);

app.post("/register", (req, res)=> {
    const { account, password ,nick} = req.body;
    console.log("注册信息req.body",req.body);
    let connection = new SQL();
    connection.query(`insert into user (account, password, nick, ctime) VALUES (?, ?, ?, ?)`,
        [account, password,nick, dayjs().format("YYYY-MM-DD HH:mm:ss")])
      .then((results) => {
        console.log("注册成功>>",results); // 输出查询结果
            //新建新手卡组
            let info=JSON.stringify({force:1,selectedCards:[30110,30109,30108,21015,21014,21013,21011,21011,30001,30001,30107,30107,19010,19010,20103,20103,20104,20104,10108,10108,10106,10106,10105,10105,10103,10103,10101,10102,10107,10107]});
            connection.query(`insert into card (user, cardtype, name, info, used) VALUES (?, ?, ?, ?, ?)`, [results.insertId,2,"新手卡组",info,1])
              .then((result) => {
                console.log("新手对战卡组创建保存成功",result.insertId);
              })
              .catch((err) => {
                console.log('Error executing query:',err.errno);
              });

        res.json({result:1});
      })
      .catch((err) => {
        if (err.errno === 1062) {
            res.json({message:"账号已存在"});
            return;
          }
          res.json({message:"数据库异常"});
        console.log('Error executing query:',err.errno);
      });
  });
app.post("/login", (req, res)=> {
    const { account, password } = req.body;
    let connection = new SQL();
    connection.query(`select * from user where account = ? and password = ?`, [account,password])
      .then((result) => {
        if(result.length==0){
            res.json({message:"账号或密码错误"});
            return;
        }
        console.log(account,"登录成功>>",result[0].nick,"时间：" + new Date().toLocaleString()); // 输出查询结果
        res.json({result:1,data:result[0]});
      })
      .catch((err) => {
          res.json({message:"数据库异常"});
        console.log('Error executing query:',err.errno);
      });
    
  });



//旧登录代码
// const connection = createDBConnection();
//注册 登录
// app.post("/register", (req, res)=> {
//     const { account, password ,nick} = req.body;
//     console.log("req.body",req.body);
//     connection.query(
//       `insert into user (account, password, nick, ctime) VALUES (?, ?, ?, ?)`,
//       [account, password,nick, dayjs().format("YYYY-MM-DD HH:mm:ss")],//md5(password)
//       (err) => {
//         if (err) {
//           if (err.errno === 1062) {
//             res.json({message:"账号已存在"});
//             return;
//           }
//           res.json({message:"数据库异常"});
//           return;
//         }
//         console.log(account,"注册成功");
//         res.json({result:1});
//       }
//     );
//   });

//  app.post("/login", (req, res)=> {
//     const { account, password } = req.body;
//     connection.query(`select * from user where account = ? and password = ?`, [account,password], (err, result) => {
//       if (err) {
//         res.json({message:"数据库异常"});
//         return;
//       }
//       if(result.length==0){
//         res.json({message:"账号或密码错误"});
//         return;
//       }
//       console.log(account,"登录成功",result[0].nick);
//       res.json(
//         {result:1,data:result[0]}
//       );
//     });
//   });

// server.listen(3004, function () {
//         console.log("login listen 3004");
//     });

 app.listen(3004, () => {
    console.log("login HTTP服务启动"+new Date().toLocaleString())
  });

